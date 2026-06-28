import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { PrismaService } from '../common/database/prisma.service';

@ApiTags('Customer Portal')
@Controller('portal')
export class PortalController {
  constructor(private readonly prisma: PrismaService) {}

  @Get(':customerId/dashboard')
  @ApiOperation({ summary: 'Customer portal dashboard summary' })
  async dashboard(@Param('customerId') customerId: string) {
    const [invoices, assignments] = await Promise.all([
      this.prisma.invoice.findMany({ where: { customerId }, orderBy: { createdAt: 'desc' }, take: 5 }),
      this.prisma.meterAssignment.findMany({ where: { customerId }, include: { meter: true }, take: 10 }),
    ]);
    const outstanding = invoices.filter(i => i.status !== 'paid' && i.status !== 'cancelled')
      .reduce((s, i) => s + Number(i.totalAmount) - Number(i.paidAmount), 0);
    const totalPaid = invoices.filter(i => i.status === 'paid')
      .reduce((s, i) => s + Number(i.totalAmount), 0);
    return {
      invoiceCount: invoices.length,
      meterCount: assignments.length,
      outstanding,
      totalPaid,
    };
  }

  @Get(':customerId/invoices')
  @ApiOperation({ summary: 'Customer invoices list' })
  async invoices(@Param('customerId') customerId: string) {
    return this.prisma.invoice.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  @Get(':customerId/meters')
  @ApiOperation({ summary: 'Customer meters list' })
  async meters(@Param('customerId') customerId: string) {
    const assignments = await this.prisma.meterAssignment.findMany({
      where: { customerId },
      include: { meter: true },
      take: 20,
    });
    return assignments.map(a => a.meter);
  }
}
