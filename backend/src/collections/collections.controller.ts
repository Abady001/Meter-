import { Controller, Get, Post, Param, Query, Res, Req, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';
import { GlobalAuthGuard } from '../auth/global-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/types/role.enum';
import { PrismaService } from '../common/database/prisma.service';
import { PaymentReceiptService } from '../payments/payment-receipt.service';
import { UserAccessService } from '../auth/user-access.service';

@ApiTags('Collections')
@Controller('collections')
@UseGuards(GlobalAuthGuard, RolesGuard)
export class CollectionsController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly receiptService: PaymentReceiptService,
    private readonly userAccess: UserAccessService,
  ) {}

  private async resolveProjectFilter(user?: any): Promise<any> {
    if (!user || user.role === 'super_admin') return {};
    const access = await this.userAccess.resolveAccess(user.userId, user.role);
    if (access.projects.length === 0) return { id: '__none' }; // impossible filter
    return { projectId: { in: access.projects } };
  }

  @Get('aging-breakdown')
  @Roles(Role.OPERATOR, Role.ADMIN, Role.SUPER_ADMIN, Role.FINANCE)
  @ApiOperation({ summary: 'Aging breakdown by bucket' })
  async getAgingBreakdown(@Req() req?: any) {
    const pf = await this.resolveProjectFilter(req?.user);
    const invoices = await this.prisma.invoice.findMany({ where: { ...pf, status: { not: 'cancelled' } }, take: 500 }).catch(() => []);
    const buckets = { '0-30': 0, '31-60': 0, '61-90': 0, '90+': 0 };
    for (const inv of invoices) {
      const open = Number(inv.remainingAmount);
      if (open <= 0) continue;
      const age = inv.issuedAt ? Math.floor((Date.now() - inv.issuedAt.getTime()) / 86400000) : 0;
      if (age <= 30) buckets['0-30'] += open;
      else if (age <= 60) buckets['31-60'] += open;
      else if (age <= 90) buckets['61-90'] += open;
      else buckets['90+'] += open;
    }
    return { buckets, total: Object.values(buckets).reduce((s, v) => s + v, 0) };
  }

  @Get('payments/:id/receipt')
  @Roles(Role.OPERATOR, Role.ADMIN, Role.SUPER_ADMIN, Role.FINANCE)
  @ApiOperation({ summary: 'Download payment receipt PDF' })
  async getPaymentReceipt(@Param('id', ParseUUIDPipe) id: string, @Res() res: Response) {
    const payment = await this.prisma.payment.findUnique({ where: { id } });
    if (!payment) return res.status(404).json({ error: 'Payment not found' });
    const project = await this.prisma.project.findUnique({ where: { id: payment.projectId } }).catch(() => null);
    const allocations = await this.prisma.paymentAllocation.findMany({ where: { paymentId: id } });
    const inv = allocations.length > 0 ? await this.prisma.invoice.findUnique({ where: { id: allocations[0].invoiceId } }).catch(() => null) : null;

    await this.receiptService.renderReceipt({
      receiptNumber: payment.paymentNumber,
      paymentDate: payment.paymentDate.toISOString().slice(0, 10),
      status: payment.status,
      companyName: project?.name ?? '',
      companyNameAr: project?.name ?? '',
      companyLogo: (project as any)?.logo ?? undefined,
      companyLicense: (project as any)?.license ?? undefined,
      companySignature: (project as any)?.signature ?? undefined,
      companyBankDetails: (project as any)?.bankDetails ?? undefined,
      customerId: payment.customerId,
      customerName: payment.customerId,
      projectName: project?.name ?? '',
      meterSerial: inv?.meterId ?? '',
      meterType: inv?.utilityType ?? '',
      paymentMethod: payment.method,
      paymentMethodAr: payment.method,
      amount: Number(payment.amount),
      currency: 'EGP',
      collectorName: payment.collectedBy,
      balanceBefore: 0,
      currentCharges: 0,
      adjustments: 0,
      paymentFees: 0,
      settlementAmount: 0,
      balanceAfter: 0,
      utilityType: inv?.utilityType ?? '',
      generatedAt: new Date().toISOString(),
    }, res);
  }

  @Get('aging')
  @Roles(Role.OPERATOR, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Aging summary' })
  async getAging(@Req() req?: any) {
    const pf = await this.resolveProjectFilter(req?.user);
    const invoices = await this.prisma.invoice.findMany({ where: { ...pf, status: { notIn: ['draft', 'cancelled'] } } });
    const now = new Date();
    const aging: Record<string, any> = { current: 0, days1to30: 0, days31to60: 0, days61to90: 0, days120plus: 0, total: 0 };
    for (const inv of invoices) {
      const due = inv.dueAt ?? inv.createdAt;
      const days = Math.floor((now.getTime() - due.getTime()) / (1000 * 86400));
      const remaining = Number(inv.remainingAmount);
      if (remaining <= 0) continue;
      aging.total += remaining;
      if (days <= 0) aging.current += remaining;
      else if (days <= 30) aging.days1to30 += remaining;
      else if (days <= 60) aging.days31to60 += remaining;
      else if (days <= 90) aging.days61to90 += remaining;
      else aging.days120plus += remaining;
    }
    return aging;
  }

  @Get('dashboard')
  @Roles(Role.OPERATOR, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Collection dashboard KPIs' })
  async getCollectionsDashboard(@Req() req?: any) {
    const pf = await this.resolveProjectFilter(req?.user);
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [totalInvoiced, totalPaid, todayPayments, monthPayments, overdueInvoices, pendingInvoices] = await Promise.all([
      this.prisma.invoice.aggregate({ _sum: { totalAmount: true }, where: { ...pf, status: { notIn: ['draft', 'cancelled'] } } }),
      this.prisma.payment.aggregate({ _sum: { amount: true }, where: { ...pf, status: 'confirmed' } }),
      this.prisma.payment.aggregate({ _sum: { amount: true }, where: { ...pf, status: 'confirmed', paymentDate: { gte: todayStart } } }),
      this.prisma.payment.aggregate({ _sum: { amount: true }, where: { ...pf, status: 'confirmed', paymentDate: { gte: monthStart } } }),
      this.prisma.invoice.count({ where: { ...pf, status: 'overdue' } }),
      this.prisma.invoice.count({ where: { ...pf, status: 'issued' } }),
    ]);

    const totalInv = Number(totalInvoiced._sum.totalAmount ?? 0);
    const totalP = Number(totalPaid._sum.amount ?? 0);
    const collectionRate = totalInv > 0 ? (totalP / totalInv * 100) : 0;

    return {
      collectionRate: Math.round(collectionRate * 100) / 100,
      totalInvoiced: totalInv,
      totalCollected: totalP,
      outstanding: totalInv - totalP,
      todayCollections: Number(todayPayments._sum.amount ?? 0),
      monthCollections: Number(monthPayments._sum.amount ?? 0),
      overdueInvoices,
      pendingInvoices,
    };
  }
}
