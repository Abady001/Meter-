import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../common/database/prisma.service';

@Injectable()
export class SolarWalletService {
  private readonly logger = new Logger(SolarWalletService.name);
  constructor(private readonly prisma: PrismaService) {}

  async getWallet(customerId: string) {
    return this.prisma.walletAccount.findFirst({ where: { customerId } }) ?? { customerId, accumulatedProduction: 0, accumulatedCredits: 0, consumedCredits: 0, availableCredits: 0 };
  }

  async calculateNetMetering(meterId: string, readingBefore: number, readingAfter: number, prodBefore: number, prodAfter: number) {
    const consumption = readingAfter - readingBefore;
    const production = prodAfter - prodBefore;
    const netUsage = Math.max(consumption - production, 0);
    const surplus = Math.max(production - consumption, 0);
    return { consumption, production, netUsage, surplus };
  }
}
