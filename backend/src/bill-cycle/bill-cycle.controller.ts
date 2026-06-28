import { Controller, Post, Get, Param, Body, Req, HttpCode, HttpStatus, UseGuards, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { GlobalAuthGuard } from '../auth/global-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/types/role.enum';
import { UserAccessService } from '../auth/user-access.service';
import { PrismaService } from '../common/database/prisma.service';

@ApiTags('Bill Cycle')
@Controller('bill-cycle')
@UseGuards(GlobalAuthGuard, RolesGuard)
export class BillCycleController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userAccess: UserAccessService,
  ) {}

  private async validateProject(projectId: string, req: any): Promise<void> {
    if (req.user?.role !== 'super_admin') {
      try { await this.userAccess.requireProjectAccess(req.user?.userId, req.user?.role, projectId); }
      catch { throw new ForbiddenException('Access denied for this project'); }
    }
  }

  private async generateBillInvoices(projectId: string, billingPeriodId: string) {
    const period = await this.prisma.billingPeriod.findUnique({ where: { id: billingPeriodId } });
    if (!period) return { batchId: 'no-period', generatedCount: 0 };

    const meters = await this.prisma.meter.findMany({ where: { projectId, status: { not: 'retired' as any } } });
    const readings = await this.prisma.reading.findMany({
      where: { projectId, readingAt: { gte: period.startDate, lte: period.endDate }, status: 'valid' },
      orderBy: { readingAt: 'asc' },
    });

    let count = 0;
    for (const meter of meters) {
      const meterReadings = readings.filter(r => r.meterId === meter.id);
      const consumption = meterReadings.reduce((s, r) => s + Number(r.consumptionValue ?? 0), 0);
      if (consumption <= 0) continue;

      const tariff = await this.prisma.tariffPlan.findFirst({
        where: { projectId, meterType: meter.meterType as any, status: 'active' },
        orderBy: { effectiveFrom: 'desc' },
      });
      const rate = tariff ? Number(tariff.ratePerUnit) : 1;
      const subtotal = rate * consumption;
      const seq = Date.now().toString(36).slice(-4);

      await this.prisma.invoice.create({
        data: {
          invoiceNumber: `INV-${period.periodCode}-${meter.id.substring(0, 6)}-${seq}`,
          projectId, customerId: 'system', unitId: 'system',
          meterId: meter.id, utilityType: 'electricity' as any,
          billingPeriodId, status: 'draft', subtotalAmount: subtotal,
          taxAmount: 0, totalAmount: subtotal, remainingAmount: subtotal, paidAmount: 0,
        },
      });
      count++;
    }
    return { batchId: `batch-${Date.now()}`, generatedCount: count };
  }

  @Post()
  @Roles(Role.OPERATOR, Role.ADMIN, Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new bill cycle' })
  async create(@Body() dto: { projectId: string; month: number; year: number; utilityType?: string }, @Req() req: any) {
    await this.validateProject(dto.projectId, req);
    const code = `BC-${dto.year}-${String(dto.month).padStart(2, '0')}-${dto.utilityType || 'ALL'}-${dto.projectId.substring(0, 4)}`;
    const cycle = await (this.prisma as any).billingCycle.create({
      data: {
        cycleCode: code,
        cycleName: `Billing ${dto.month}/${dto.year} ${dto.utilityType || 'All'}`,
        status: 'OPEN',
        startDate: new Date(dto.year, dto.month - 1, 1),
        endDate: new Date(dto.year, dto.month, 0),
        dueDate: new Date(dto.year, dto.month, 15),
        createdBy: req.user?.userId || 'system',
        updatedBy: req.user?.userId || 'system',
      },
    });
    return cycle;
  }

  @Get()
  @Roles(Role.OPERATOR, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'List bill cycles' })
  async findAll() {
    return (this.prisma as any).billingCycle.findMany({ orderBy: { createdAt: 'desc' }, take: 50 });
  }

  @Get(':id')
  @Roles(Role.OPERATOR, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get bill cycle details' })
  async findOne(@Param('id') id: string) {
    return (this.prisma as any).billingCycle.findUnique({ where: { id } });
  }

  @Post(':id/start')
  @Roles(Role.OPERATOR, Role.ADMIN, Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Start bill cycle (LOCKED)' })
  async start(@Param('id') id: string, @Req() req: any) {
    const cycle = await (this.prisma as any).billingCycle.findUnique({ where: { id } });
    if (!cycle) return { status: 'error', message: 'Cycle not found' };
    if (cycle.status !== 'OPEN') return { status: 'error', message: 'Can only start OPEN cycles' };
    const updated = await (this.prisma as any).billingCycle.update({
      where: { id }, data: { status: 'LOCKED', lockDate: new Date(), updatedBy: req.user?.userId || 'system' },
    });
    // Create audit
    await (this.prisma as any).billingCycleAudit.create({
      data: { cycleId: id, action: 'START', performedBy: req.user?.userId || 'system', performedAt: new Date() },
    }).catch(() => {});
    return updated;
  }

  @Post(':id/generate')
  @Roles(Role.OPERATOR, Role.ADMIN, Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate invoices for this cycle (APPROVED)' })
  async generate(@Param('id') id: string, @Body() dto: { projectId: string; utilityType?: string }, @Req() req: any) {
    await this.validateProject(dto.projectId, req);
    const cycle = await (this.prisma as any).billingCycle.findUnique({ where: { id } });
    if (!cycle) return { status: 'error', message: 'Cycle not found' };

    // Find or create billing period matching this cycle
    let period = await this.prisma.billingPeriod.findFirst({
      where: { projectId: dto.projectId, periodCode: cycle.cycleCode },
    });
    if (!period) {
      period = await this.prisma.billingPeriod.create({
        data: { projectId: dto.projectId, periodCode: cycle.cycleCode, startDate: cycle.startDate, endDate: cycle.endDate, status: 'open', createdBy: req.user?.userId || 'system', updatedBy: req.user?.userId || 'system' },
      });
    }

    // Generate invoices
    const result = await this.generateBillInvoices(dto.projectId, period.id);

    // Update cycle status
    await (this.prisma as any).billingCycle.update({
      where: { id }, data: { status: 'APPROVED', approveDate: new Date(), updatedBy: req.user?.userId || 'system' },
    });
    await (this.prisma as any).billingCycleAudit.create({
      data: { cycleId: id, action: 'GENERATE', performedBy: req.user?.userId || 'system', performedAt: new Date() },
    }).catch(() => {});

    return { status: 'success', cycle: cycle.cycleCode, ...result };
  }

  @Post(':id/post')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Post bill cycle (CLOSED)' })
  async post(@Param('id') id: string, @Req() req: any) {
    const cycle = await (this.prisma as any).billingCycle.findUnique({ where: { id } });
    if (!cycle) return { status: 'error', message: 'Cycle not found' };
    if (cycle.status !== 'APPROVED') return { status: 'error', message: 'Can only post APPROVED cycles' };
    const updated = await (this.prisma as any).billingCycle.update({
      where: { id }, data: { status: 'CLOSED', closeDate: new Date(), updatedBy: req.user?.userId || 'system' },
    });
    await (this.prisma as any).billingCycleAudit.create({
      data: { cycleId: id, action: 'POST', performedBy: req.user?.userId || 'system', performedAt: new Date() },
    }).catch(() => {});
    return updated;
  }

  @Post(':id/cancel')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel bill cycle' })
  async cancel(@Param('id') id: string, @Req() req: any) {
    const cycle = await (this.prisma as any).billingCycle.findUnique({ where: { id } });
    if (!cycle) return { status: 'error', message: 'Cycle not found' };
    if (cycle.status === 'CANCELLED') return { status: 'error', message: 'Already cancelled' };
    const updated = await (this.prisma as any).billingCycle.update({
      where: { id }, data: { status: 'CANCELLED', updatedBy: req.user?.userId || 'system' },
    });
    await (this.prisma as any).billingCycleAudit.create({
      data: { cycleId: id, action: 'CANCEL', performedBy: req.user?.userId || 'system', performedAt: new Date() },
    }).catch(() => {});
    return updated;
  }
}
