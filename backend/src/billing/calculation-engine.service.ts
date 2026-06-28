import { Injectable, Logger } from '@nestjs/common';

export interface ChargeLine {
  description: string;
  quantity: number;
  unitPrice: number;
  lineAmount: number;
  chargeGroup: string; // 'consumption' | 'administration' | 'service' | 'other' | 'tax'
}

export interface CalculationResult {
  lines: ChargeLine[];
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  balanceBefore: number;
  balanceAfter: number;
}

export interface TierStep {
  from: number;
  to: number | null;
  rate: number;
  fixedAmount?: number;
}

export interface TariffConfig {
  baseRate: number;
  currency: string;
  tiers?: TierStep[];
  fixedCharges?: { name: string; amount: number }[];
  percentageCharges?: { name: string; percent: number }[];
  serviceCharges?: { name: string; amount: number }[];
}

@Injectable()
export class CalculationEngineService {
  private readonly logger = new Logger(CalculationEngineService.name);

  calculateConsumption(
    consumption: number,
    tariff: TariffConfig,
    taxRate: number,
    balanceBefore: number = 0,
  ): CalculationResult {
    const lines: ChargeLine[] = [];
    let consumptionCharge = 0;

    // Tiered pricing
    if (tariff.tiers && tariff.tiers.length > 0) {
      let remaining = consumption;
      for (const tier of tariff.tiers) {
        if (remaining <= 0) break;
        const tierQty = tier.to !== null ? Math.min(remaining, tier.to - tier.from + 1) : remaining;
        const lineAmount = (tier.fixedAmount ?? 0) + tierQty * tier.rate;
        consumptionCharge += lineAmount;
        lines.push({
          description: `Tier ${tier.from}-${tier.to ?? 'above'} @ ${tier.rate}`,
          quantity: tierQty,
          unitPrice: tier.rate,
          lineAmount,
          chargeGroup: 'consumption',
        });
        remaining -= tierQty;
      }
    } else {
      // Flat rate
      consumptionCharge = consumption * tariff.baseRate;
      lines.push({
        description: 'Consumption charge',
        quantity: consumption,
        unitPrice: tariff.baseRate,
        lineAmount: consumptionCharge,
        chargeGroup: 'consumption',
      });
    }

    // Fixed charges
    for (const fc of tariff.fixedCharges ?? []) {
      lines.push({
        description: fc.name,
        quantity: 1,
        unitPrice: fc.amount,
        lineAmount: fc.amount,
        chargeGroup: 'administration',
      });
    }

    // Service charges
    for (const sc of tariff.serviceCharges ?? []) {
      lines.push({
        description: sc.name,
        quantity: 1,
        unitPrice: sc.amount,
        lineAmount: sc.amount,
        chargeGroup: 'service',
      });
    }

    // Percentage charges (based on consumption charge)
    for (const pc of tariff.percentageCharges ?? []) {
      const amount = consumptionCharge * (pc.percent / 100);
      lines.push({
        description: pc.name,
        quantity: 1,
        unitPrice: amount,
        lineAmount: amount,
        chargeGroup: 'other',
      });
    }

    const subtotal = lines.reduce((s, l) => s + l.lineAmount, 0);
    const taxAmount = subtotal * taxRate;
    const totalAmount = subtotal + taxAmount;
    const balanceAfter = balanceBefore + totalAmount;

    return { lines, subtotal, taxAmount, totalAmount, balanceBefore, balanceAfter };
  }
}
