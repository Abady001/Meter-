import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/database/prisma.service';
import { LedgerService } from '../billing/ledger.service';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly ledgerService: LedgerService
  ) {}

  async findAll(projectId?: string, customerId?: string) {
    const where: any = {};
    if (projectId) where.projectId = projectId;
    if (customerId) where.customerId = customerId;
    const payments = await this.prisma.payment.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });
    const allocations = await this.prisma.paymentAllocation.findMany({
      where: { paymentId: { in: payments.map((p) => p.id) } }
    });
    return payments.map((p) => ({
      ...p,
      amount: Number(p.amount),
      allocations: allocations.filter((a) => a.paymentId === p.id).map((a) => ({
        ...a,
        allocatedAmount: Number(a.allocatedAmount)
      }))
    }));
  }

  async findOne(id: string) {
    const payment = await this.prisma.payment.findUnique({ where: { id } });
    if (!payment) throw new NotFoundException(`Payment ${id} not found`);
    const allocations = await this.prisma.paymentAllocation.findMany({
      where: { paymentId: id },
      orderBy: { allocationOrder: 'asc' }
    });
    return {
      ...payment,
      amount: Number(payment.amount),
      allocations: allocations.map((a) => ({
        ...a,
        allocatedAmount: Number(a.allocatedAmount)
      }))
    };
  }

  async reverse(id: string, reason: string) {
    return this.prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findUnique({ where: { id } });
      if (!payment) throw new NotFoundException(`Payment ${id} not found`);
      if (payment.status === 'reversed') throw new BadRequestException('Payment already reversed');
      if (payment.status === 'cancelled') throw new BadRequestException('Payment already cancelled');

      const allocations = await tx.paymentAllocation.findMany({
        where: { paymentId: id }
      });

      for (const alloc of allocations) {
        await tx.invoice.update({
          where: { id: alloc.invoiceId },
          data: {
            paidAmount: { increment: -Number(alloc.allocatedAmount) },
            remainingAmount: { increment: Number(alloc.allocatedAmount) }
          }
        });

        const invoice = await tx.invoice.findUnique({ where: { id: alloc.invoiceId } });
        if (invoice && Number(invoice.remainingAmount) > 0 && invoice.status === 'paid') {
          await tx.invoice.update({
            where: { id: alloc.invoiceId },
            data: { status: 'partially_paid' }
          });
        }
      }

      const updatedPayment = await tx.payment.update({
        where: { id },
        data: {
          status: 'reversed',
          notes: payment.notes ? `${payment.notes}; REVERSED: ${reason}` : `REVERSED: ${reason}`
        }
      });

      await this.ledgerService.addEntry({
        customerId: payment.customerId,
        projectId: payment.projectId,
        entryType: 'payment_reversal',
        referenceType: 'payment',
        referenceId: payment.id,
        amountDelta: Number(payment.amount),
        entryAt: new Date()
      });

      return { ...updatedPayment, amount: Number(updatedPayment.amount) };
    });
  }
}
