import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../common/database/prisma.service';

@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);
  constructor(private readonly prisma: PrismaService) {}

  async getWallet(customerId: string, projectId: string) {
    return (this.prisma as any).walletAccount.findFirst({ where: { customerId, projectId } });
  }

  async getOrCreateWallet(customerId: string, projectId: string) {
    const existing = await this.getWallet(customerId, projectId);
    if (existing) return existing;
    return (this.prisma as any).walletAccount.create({
      data: { customerId, projectId, currency: 'EGP', balance: 0, status: 'ACTIVE' },
    });
  }

  async credit(walletId: string, amount: number, referenceType: string, referenceId: string, description: string) {
    const wallet = await (this.prisma as any).walletAccount.findUnique({ where: { id: walletId } });
    if (!wallet) throw new Error('Wallet not found');
    const newBalance = Number(wallet.balance) + amount;
    await (this.prisma as any).walletAccount.update({ where: { id: walletId }, data: { balance: newBalance } });
    return (this.prisma as any).walletTransaction.create({
      data: { walletId, type: 'DEPOSIT', amount, referenceType, referenceId, description, status: 'COMPLETED' },
    });
  }

  async debit(walletId: string, amount: number, referenceType: string, referenceId: string, description: string) {
    const wallet = await (this.prisma as any).walletAccount.findUnique({ where: { id: walletId } });
    if (!wallet) throw new Error('Wallet not found');
    const currentBalance = Number(wallet.balance);
    if (currentBalance < amount) throw new Error('Insufficient balance');
    const newBalance = currentBalance - amount;
    await (this.prisma as any).walletAccount.update({ where: { id: walletId }, data: { balance: newBalance } });
    return (this.prisma as any).walletTransaction.create({
      data: { walletId, type: 'WITHDRAWAL', amount, referenceType, referenceId, description, status: 'COMPLETED' },
    });
  }

  async transfer(fromWalletId: string, toWalletId: string, amount: number, description: string) {
    await this.debit(fromWalletId, amount, 'TRANSFER', toWalletId, `Transfer out: ${description}`);
    await this.credit(toWalletId, amount, 'TRANSFER', fromWalletId, `Transfer in: ${description}`);
    return (this.prisma as any).walletTransfer.create({
      data: { fromWalletId, toWalletId, amount, status: 'COMPLETED', description },
    });
  }

  async getHistory(walletId: string) {
    return (this.prisma as any).walletTransaction.findMany({ where: { walletId }, orderBy: { createdAt: 'desc' }, take: 100 });
  }

  async getBalance(walletId: string) {
    const wallet = await (this.prisma as any).walletAccount.findUnique({ where: { id: walletId } });
    return wallet ? Number(wallet.balance) : 0;
  }
}
