import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../common/database/prisma.service';

export interface PenaltyRule {
  id: string;
  name: string;
  gracePeriodDays: number;
  ratePerDay: number;
  maxPenaltyPercent: number;
  isActive: boolean;
}

export interface PenaltyResult {
  daysLate: number;
  penaltyAmount: number;
  maxPenalty: number;
  appliedRate: number;
}

@Injectable()
export class PenaltyService {
  private readonly logger = new Logger(PenaltyService.name);
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Calculate penalty for a given invoice based on due date and current date.
   * Falls back to default rule if no project-specific rule configured.
   */
  async calculatePenalty(
    invoice: { id: string; totalAmount: number; dueDate: Date; projectId?: string },
    asOfDate: Date = new Date(),
  ): Promise<PenaltyResult> {
    if (invoice.dueDate >= asOfDate) {
      return { daysLate: 0, penaltyAmount: 0, maxPenalty: 0, appliedRate: 0 };
    }

    const daysLate = Math.floor((asOfDate.getTime() - invoice.dueDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysLate <= 0) {
      return { daysLate: 0, penaltyAmount: 0, maxPenalty: 0, appliedRate: 0 };
    }

    // Try to load project-specific penalty rule, fall back to default
    const rule = await this.loadPenaltyRule(invoice.projectId);

    // Apply grace period
    const penalizableDays = Math.max(0, daysLate - rule.gracePeriodDays);
    if (penalizableDays <= 0) {
      return { daysLate, penaltyAmount: 0, maxPenalty: 0, appliedRate: 0 };
    }

    const principal = Number(invoice.totalAmount);
    const maxPenalty = Math.round(principal * rule.maxPenaltyPercent / 100);
    const rawPenalty = Math.round(principal * rule.ratePerDay * penalizableDays / 100);
    const penaltyAmount = Math.min(rawPenalty, maxPenalty);

    return {
      daysLate,
      penaltyAmount,
      maxPenalty,
      appliedRate: rule.ratePerDay,
    };
  }

  private async loadPenaltyRule(projectId?: string): Promise<PenaltyRule> {
    if (projectId) {
      const settings = await this.prisma.systemSetting.findFirst({
        where: { key: `penalty_rule_${projectId}` },
      });
      if (settings?.value) {
        try {
          return JSON.parse(settings.value);
        } catch { /* fall through to default */ }
      }
    }

    // Default penalty rule
    return {
      id: 'default',
      name: 'Late Payment Penalty',
      gracePeriodDays: 7,
      ratePerDay: 0.05, // 0.05% per day
      maxPenaltyPercent: 10, // max 10% of invoice total
      isActive: true,
    };
  }

  /**
   * Get or create a penalty charge on an overdue invoice.
   * Returns the charge line to add to the ledger.
   */
  getPenaltyChargeLine(result: PenaltyResult): { description: string; descriptionAr: string; lineAmount: number; chargeGroup: number } | null {
    if (result.penaltyAmount <= 0) return null;
    return {
      description: `Late payment penalty (${result.daysLate} days)`,
      descriptionAr: `غرامة تأخير (${result.daysLate} يوم)`,
      lineAmount: result.penaltyAmount,
      chargeGroup: 7, // Penalty charge group
    };
  }
}
