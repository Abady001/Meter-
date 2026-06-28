import { Injectable, Logger } from '@nestjs/common';

export interface TierStep {
  from: number;
  to: number | null;
  rate: number;
  fixedAmount?: number;
}

export interface ChargeLine {
  description: string;
  descriptionAr: string;
  quantity: number;
  unitPrice: number;
  lineAmount: number;
  chargeGroup: number;
}

export interface CalculationResult {
  lines: ChargeLine[];
  consumption: number;
  consumptionCharge: number;
  adminFees: number;
  customerServiceFees: number;
  otherFees: number;
  percentageAmount: number;
  settlementAmount: number;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
}

@Injectable()
export class TariffCalculationService {
  private readonly logger = new Logger(TariffCalculationService.name);

  /**
   * Calculate invoice charges from consumption and tariff structure.
   * 
   * Tariff charges are organized by charge_group:
   *   0 = CONSUMPTION  — calculated from tiers by consumption volume
   *   2,3 = CUSTOMER_SERVICE — also based on consumption tiers (steps per kWh/m³)
   *   4 = ADMIN/ISSUE_FEES — fixed charges
   *   1 = FEES (OTHER) — fees, stamps, etc.
   *   5 = PERCENTAGE — percentage of consumption charge
   * 
   * All amounts in milliemes (EGP * 1000) matching JRXML convention
   */
  calculate(
    params: {
      consumption: number;
      utilityType: string;
      meterType: string;
      tariffTiers?: { chargeGroup: string; fromUsage: number; toUsage: number | null; rateValue: number; extraAmount?: number }[];
      fixedCharges?: { chargeGroup: string; name: string; amount: number }[];
      percentageRate?: number;
      settlementAmount?: number;
      previousBalance?: number;
      taxRate?: number;
    }
  ): CalculationResult {
    const {
      consumption,
      tariffTiers = [],
      fixedCharges = [],
      percentageRate = 0,
      settlementAmount = 0,
      taxRate = 0,
    } = params;

    const lines: ChargeLine[] = [];

    // 1. Group tiers by charge group
    const consTiers = tariffTiers.filter(t => t.chargeGroup === 'CONSUMPTION' || t.chargeGroup === '0');
    const csTiers = tariffTiers.filter(t => t.chargeGroup === 'CUSTOMER_SERVICE' || t.chargeGroup === '2' || t.chargeGroup === '3');

    // 2. Calculate consumption charge (charge_group=0) with tiers
    let consumptionCharge = this.calculateTieredCharge(consumption, consTiers);

    // Add consumption charge lines
    if (consumptionCharge > 0) {
      lines.push({
        description: `Consumption ${consumption} units`,
        descriptionAr: `استهلاك ${consumption} وحدة`,
        quantity: consumption,
        unitPrice: consTiers.length > 0 ? consumptionCharge / consumption : consumptionCharge,
        lineAmount: consumptionCharge,
        chargeGroup: 0,
      });
    }

    // 3. Calculate customer service fees (charge_group=2,3) — also tiered by consumption
    let customerServiceFees = this.calculateTieredCharge(consumption, csTiers);
    if (customerServiceFees <= 0) {
      // Fallback: use fixed service charges
      for (const fc of fixedCharges) {
        if (fc.chargeGroup === 'CUSTOMER_SERVICE' || fc.chargeGroup === '2' || fc.chargeGroup === '3') {
          customerServiceFees += fc.amount;
          lines.push({
            description: fc.name,
            descriptionAr: fc.name,
            quantity: 1,
            unitPrice: fc.amount,
            lineAmount: fc.amount,
            chargeGroup: 2,
          });
        }
      }
    } else {
      lines.push({
        description: `Customer Service based on ${consumption} units`,
        descriptionAr: `خدمة عملاء حسب ${consumption} وحدة`,
        quantity: consumption,
        unitPrice: csTiers.length > 0 ? customerServiceFees / consumption : customerServiceFees,
        lineAmount: customerServiceFees,
        chargeGroup: 2,
      });
    }

    // 4. Admin/Issue fees (charge_group=4) — fixed charges
    let adminFees = 0;
    for (const fc of fixedCharges) {
      if (fc.chargeGroup === 'ISSUE_FEES' || fc.chargeGroup === 'ADMIN' || fc.chargeGroup === '4') {
        adminFees += fc.amount;
        lines.push({
          description: fc.name,
          descriptionAr: fc.name,
          quantity: 1,
          unitPrice: fc.amount,
          lineAmount: fc.amount,
          chargeGroup: 4,
        });
      }
    }

    // 5. Other fees (charge_group=1) — fees, stamps, etc.
    let otherFees = 0;
    for (const fc of fixedCharges) {
      if (fc.chargeGroup === 'FEES' || fc.chargeGroup === 'OTHER' || fc.chargeGroup === '1') {
        otherFees += fc.amount;
        lines.push({
          description: fc.name,
          descriptionAr: fc.name,
          quantity: 1,
          unitPrice: fc.amount,
          lineAmount: fc.amount,
          chargeGroup: 1,
        });
      }
    }

    // 6. Percentage charge (charge_group=5) — based on consumption charge
    let percentageAmount = 0;
    if (percentageRate > 0) {
      percentageAmount = Math.round(consumptionCharge * percentageRate / 100);
      if (percentageAmount > 0) {
        lines.push({
          description: `Percentage ${percentageRate}%`,
          descriptionAr: `نسبة ${percentageRate}%`,
          quantity: 1,
          unitPrice: percentageAmount,
          lineAmount: percentageAmount,
          chargeGroup: 5,
        });
      }
    }

    // 7. Settlement amount (charge_group=6) — positive or negative
    // Stored as positive value in DB; subtracted when settlement is a credit
    const absSettlement = Math.abs(settlementAmount);
    const settlementSigned = settlementAmount;
    if (absSettlement > 0) {
      const isCredit = settlementAmount < 0;
      lines.push({
        description: isCredit ? `Settlement (Credit)` : `Settlement (Debit)`,
        descriptionAr: `تسويات (${isCredit ? 'دائن' : 'مدين'})`,
        quantity: 1,
        unitPrice: settlementSigned,
        lineAmount: settlementSigned,
        chargeGroup: 6,
      });
    }

    // Calculate totals
    const subtotal = lines.reduce((s, l) => s + l.lineAmount, 0);
    const taxAmount = taxRate > 0 ? Math.round(subtotal * taxRate / 100) : 0;
    const totalAmount = subtotal + taxAmount;

    return {
      lines,
      consumption,
      consumptionCharge,
      adminFees,
      customerServiceFees,
      otherFees,
      percentageAmount,
      settlementAmount: settlementSigned,
      subtotal,
      taxAmount,
      totalAmount,
    };
  }

  /**
   * Calculate tiered charge: consumption is split across tiers
   * Each tier: from_usage → to_usage with rate_value per unit + optional extra_amount
   * 
   * Example: tiers [0-100 @ 50], [101-200 @ 75], [201+ @ 100]
   * Consumption=250 → 100*50 + 100*75 + 50*100 = 5000+7500+5000=17500
   */
  private calculateTieredCharge(consumption: number, tiers: { fromUsage: number; toUsage: number | null; rateValue: number; extraAmount?: number }[]): number {
    if (!tiers || tiers.length === 0) return 0;

    let total = 0;
    let remaining = consumption;

    for (const tier of tiers.sort((a, b) => a.fromUsage - b.fromUsage)) {
      if (remaining <= 0) break;

      const tierMax = tier.toUsage !== null ? tier.toUsage : Infinity;
      const tierUnits = Math.min(remaining, tierMax - tier.fromUsage + 1);
      if (tierUnits <= 0) continue;

      const tierCharge = Math.round(tierUnits * tier.rateValue + (tier.extraAmount ?? 0));
      total += tierCharge;
      remaining -= tierUnits;
    }

    return total;
  }
}
