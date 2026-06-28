import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../common/database/prisma.service';

export interface TariffChargeLine {
  chargeCode: string;
  chargeName: string;
  chargeGroup: number;
  quantity: number;
  rateAmount: number;
  lineAmount: number;
  description: string;
}

@Injectable()
export class TariffEngineService {
  private readonly logger = new Logger(TariffEngineService.name);
  constructor(private readonly prisma: PrismaService) {}

  async calculateCharges(projectId: string, meterType: string, consumption: number, effectiveDate: Date): Promise<{ lines: TariffChargeLine[]; total: number }> {
    const tariff = await this.prisma.tariff.findFirst({
      where: {
        utilityType: meterType === 'electricity' ? 'electricity' as any : 'water' as any,
        isActive: true,
        effectiveFrom: { lte: effectiveDate },
        OR: [{ effectiveTo: null }, { effectiveTo: { gte: effectiveDate } }],
      },
      orderBy: { effectiveFrom: 'desc' },
    });

    if (!tariff) {
      // Fallback to simple TariffPlan
      const flatTariff = await this.prisma.tariffPlan.findFirst({
        where: { projectId, meterType: meterType as any, status: 'active', effectiveFrom: { lte: effectiveDate }, OR: [{ effectiveTo: null }, { effectiveTo: { gte: effectiveDate } }] },
        orderBy: { effectiveFrom: 'desc' },
      });
      if (!flatTariff) return { lines: [], total: 0 };
      const amount = Number(flatTariff.ratePerUnit) * consumption;
      return { lines: [{ chargeCode: 'FLAT', chargeName: 'Consumption', chargeGroup: 0, quantity: consumption, rateAmount: Number(flatTariff.ratePerUnit), lineAmount: amount, description: `Consumption @ ${flatTariff.ratePerUnit}` }], total: amount };
    }

    const charges = await this.prisma.tariffCharge.findMany({
      where: { tariffId: tariff.id, isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: { details: { orderBy: { stepFrom: 'asc' } } },
    });

    const lines: TariffChargeLine[] = [];
    let remaining = consumption;

    for (const charge of charges) {
      let lineAmount = 0;
      let qty = 0;
      let rate = 0;

      switch (charge.chargeMode) {
        case 'FLAT':
          lineAmount = Number(charge.rateAmount ?? 0);
          qty = 1;
          rate = lineAmount;
          break;

        case 'PER_UNIT':
          rate = Number(charge.rateAmount ?? 0);
          lineAmount = rate * consumption;
          qty = consumption;
          break;

        case 'STEPS':
          if (charge.details.length > 0) {
            let stepRemaining = consumption;
            for (const detail of charge.details) {
              if (stepRemaining <= 0) break;
              const stepQty = Math.min(stepRemaining, Number(detail.stepTo ?? 999999) - Number(detail.stepFrom ?? 0));
              if (stepQty <= 0) continue;
              const stepRate = Number(detail.stepRate ?? 0);
              const stepAmt = Number(detail.stepAmount ?? 0);
              const isPct = detail.isPercentage;
              lineAmount += isPct ? stepAmt : (stepQty * stepRate) + stepAmt;
              qty += stepQty;
              stepRemaining -= stepQty;
            }
            rate = lineAmount / (qty || 1);
          }
          break;

        case 'STATIC':
          lineAmount = Number(charge.rateAmount ?? 0);
          qty = 1;
          rate = lineAmount;
          break;

        case 'TOU':
          // Time-of-Use: details contain peak/off-peak/shoulder periods
          // stepFrom = hour start (0-23), stepTo = hour end (0-23), stepRate = rate per unit
          // Consumption is distributed across periods based on hour proportion
          if (charge.details.length > 0) {
            // Count hours per period in a full day (24h cycle)
            const periods: { from: number; to: number; rate: number; hours: number }[] = [];
            for (const d of charge.details) {
              const from = Number(d.stepFrom ?? 0);
              const to = Number(d.stepTo ?? 23);
              const hoursInPeriod = from <= to ? to - from : (24 - from) + to;
              periods.push({
                from,
                to,
                rate: Number(d.stepRate ?? charge.rateAmount ?? 0),
                hours: Math.max(0, hoursInPeriod),
              });
            }
            // Distribute consumption by period hour proportion
            const totalHours = periods.reduce((s, p) => s + p.hours, 0) || 24;
            let periodLines = 0;
            for (const period of periods) {
              if (period.hours <= 0) continue;
              const periodCons = Math.round((consumption * period.hours) / totalHours);
              if (periodCons <= 0) continue;
              const periodAmt = Math.round(periodCons * period.rate);
              qty += periodCons;
              periodLines++;
              // Push individual period line
              const hourLabel = `${String(period.from).padStart(2, '0')}:00-${String(period.to).padStart(2, '0')}:00`;
              const chargeGroup = this.chargeModeToGroup(charge.chargeMode, charge.settlementType, charge.chargeCode);
              lines.push({
                chargeCode: `${charge.chargeCode}_${period.from}`,
                chargeName: `${charge.chargeName} (${hourLabel})`,
                chargeGroup,
                quantity: periodCons,
                rateAmount: period.rate,
                lineAmount: periodAmt,
                description: `${charge.chargeName} ${hourLabel} ${periodCons} @ ${period.rate}`,
              });
            }
            // Don't add main line — individual period lines handle it
            continue; // Skip the main line addition below
          }
          break;

        // Demand charge detection (via charge code convention DEMAND_*)
        // Applied after switch to override normal calculation for any charge mode

        case 'ZERO':
          lineAmount = Number(charge.rateAmount ?? charge.minCharge ?? 0);
          if (lineAmount <= 0) lineAmount = Number(charge.rateAmount ?? 9000);
          qty = 1;
          rate = lineAmount;
          break;
      }

      // Demand charge override: if charge code starts with DEMAND_, recalculate as demand
      const isDemand = charge.chargeCode?.startsWith('DEMAND_') ?? false;
      if (isDemand && consumption > 0) {
        rate = Number(charge.rateAmount ?? 0);
        lineAmount = Math.round(consumption * rate);
        qty = consumption;
      }

      if (lineAmount > 0 || charge.chargeMode !== 'ZERO' || consumption <= 0) {
        const chargeGroup = this.chargeModeToGroup(charge.chargeMode, charge.settlementType, charge.chargeCode);
        lines.push({
          chargeCode: charge.chargeCode,
          chargeName: charge.chargeName,
          chargeGroup,
          quantity: qty,
          rateAmount: rate,
          lineAmount,
          description: `${charge.chargeName}${qty > 0 ? ` @ ${rate}` : ''}`,
        });
      }

      // Apply min/max
      if (charge.minCharge && lineAmount < Number(charge.minCharge)) {
        const diff = Number(charge.minCharge) - lineAmount;
        lines.push({ chargeCode: `${charge.chargeCode}_MIN`, chargeName: `${charge.chargeName} (min)`, chargeGroup: this.chargeModeToGroup(charge.chargeMode, charge.settlementType, charge.chargeCode), quantity: 1, rateAmount: diff, lineAmount: diff, description: `Minimum charge adjustment` });
        lineAmount = Number(charge.minCharge);
      }
    }

    const total = lines.reduce((s, l) => s + l.lineAmount, 0);
    return { lines, total };
  }

  private chargeModeToGroup(mode: string, settlementType: string, chargeCode?: string): number {
    if (chargeCode?.startsWith('DEMAND_')) return 8; // Demand charges = group 8
    if (mode === 'PER_UNIT' || mode === 'STEPS' || mode === 'TOU') return 0;
    if (settlementType === 'PERCENTAGE') return 5;
    if (mode === 'FLAT' && settlementType === 'FIXED') return 4;
    if (mode === 'FLAT') return 1;
    if (mode === 'STATIC') return 3;
    return 7;
  }
}
