import { Controller, Get, Post, Param, Body, UseGuards, Query } from '@nestjs/common';
import { PrismaService } from '../common/database/prisma.service';
import { GlobalAuthGuard } from '../auth/global-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/types/role.enum';

@Controller('settlement')
@UseGuards(GlobalAuthGuard, RolesGuard)
export class SettlementController {
  constructor(private readonly prisma: PrismaService) {}

  @Post()
  @Roles(Role.OPERATOR, Role.ADMIN, Role.SUPER_ADMIN)
  async create(@Body() dto: { projectId: string; customerId: string; meterId: string; description: string; amount: number; type: 'debit' | 'credit'; billingPeriod?: string }) {
    const total = dto.type === 'debit' ? Math.abs(dto.amount) : -Math.abs(dto.amount);
    return this.prisma.invoice.create({
      data: {
        projectId: dto.projectId,
        customerId: dto.customerId,
        meterId: dto.meterId,
        unitId: 'system',
        utilityType: 'settlement',
        invoiceNumber: 'SET-' + Date.now().toString(36).toUpperCase(),
        status: 'issued',
        subtotalAmount: total,
        taxAmount: 0,
        totalAmount: total,
        paidAmount: 0,
        remainingAmount: total,
        billingPeriodId: dto.billingPeriod ?? '',
        billingPeriodCode: dto.billingPeriod ?? '',
        issuedAt: new Date(),
        dueAt: new Date(Date.now() + 30 * 86400000),
      },
    });
  }

  @Get()
  @Roles(Role.OPERATOR, Role.ADMIN, Role.SUPER_ADMIN)
  async list(@Query('customerId') customerId?: string) {
    const where: any = { utilityType: 'settlement' };
    if (customerId) where.customerId = customerId;
    return this.prisma.invoice.findMany({ where, orderBy: { createdAt: 'desc' }, take: 50 });
  }

  @Get('adjustments')
  @Roles(Role.OPERATOR, Role.ADMIN, Role.SUPER_ADMIN)
  async listAdjustments(@Query('invoiceId') invoiceId?: string) {
    return this.prisma.invoiceAdjustment.findMany({
      where: invoiceId ? { invoiceId } : {},
      take: 50,
    });
  }

  @Post('adjustments')
  @Roles(Role.OPERATOR, Role.ADMIN, Role.SUPER_ADMIN)
  async createAdjustment(@Body() dto: { invoiceId: string; amount: number; reason: string; adjustmentType: string }) {
    return this.prisma.invoiceAdjustment.create({
      data: {
        invoiceId: dto.invoiceId,
        amount: dto.amount,
        reason: dto.reason,
        adjustmentType: dto.adjustmentType as any,
        createdBy: 'settlement-api',
      },
    });
  }
}
