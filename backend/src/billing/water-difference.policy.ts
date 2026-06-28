import { Injectable, Logger } from '@nestjs/common';
import { WaterBalanceService } from '../readings/water-balance/water-balance.service';
import { PrismaService } from '../common/database/prisma.service';

export interface WaterDifferenceResult {
  varianceLineCreated: boolean;
  varianceAmount?: number;
}

@Injectable()
export class WaterDifferencePolicy {
  private readonly logger = new Logger(WaterDifferencePolicy.name);

  constructor(
    private readonly waterBalanceService: WaterBalanceService,
    private readonly prisma: PrismaService
  ) {}

  async apply(
    invoiceId: string,
    projectId: string,
    periodStart: Date,
    periodEnd: Date,
    waterDiffMode: string,
    taxRate: number
  ): Promise<WaterDifferenceResult> {
    if (waterDiffMode !== 'billable') {
      return { varianceLineCreated: false };
    }
    try {
      const balance = await this.waterBalanceService.getWaterBalance(
        projectId,
        periodStart,
        periodEnd
      );
      const variance = balance.variance;
      if (variance === 0) {
        return { varianceLineCreated: false };
      }
      await this.prisma.invoiceLine.create({
        data: {
          invoiceId,
          description: 'Water difference variance (billable)',
          quantity: 1,
          unitPrice: variance,
          lineAmount: variance
        }
      });
      const varianceTax = variance * taxRate;
      await this.prisma.invoice.update({
        where: { id: invoiceId },
        data: {
          subtotalAmount: { increment: variance },
          taxAmount: { increment: varianceTax },
          totalAmount: { increment: variance + varianceTax },
          remainingAmount: { increment: variance + varianceTax }
        }
      });
      return { varianceLineCreated: true, varianceAmount: variance + varianceTax };
    } catch (err) {
      this.logger.warn(`Water balance unavailable for project ${projectId}, skipping variance`);
      return { varianceLineCreated: false };
    }
  }
}
