import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  Req,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
  Logger,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
  ForbiddenException
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/types/role.enum';
import { Audit } from '../audit/audit.decorator';
import { UserAccessService } from '../auth/user-access.service';
import { PrismaService } from '../common/database/prisma.service';
import { TariffService } from './tariffs/tariff.service';
import { PeriodService } from './periods/period.service';
import { LedgerService } from './ledger.service';
import { BillingStateService } from './billing-state.service';
import { WaterBalanceService } from '../readings/water-balance/water-balance.service';
import { WaterDifferencePolicy } from './water-difference.policy';
import { TariffEngineService } from './tariff-engine.service';

@ApiTags('Billing')
@Controller('billing')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class BillingController {
  private readonly logger = new Logger(BillingController.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly tariffService: TariffService,
    private readonly periodService: PeriodService,
    private readonly ledgerService: LedgerService,
    private readonly billingState: BillingStateService,
    private readonly waterBalanceService: WaterBalanceService,
    private readonly waterDifferencePolicy: WaterDifferencePolicy,
    private readonly tariffEngine: TariffEngineService,
    private readonly userAccess: UserAccessService
  ) {}

  private async validateProject(projectId: string, req: any): Promise<void> {
    if (req.user?.role !== 'super_admin') {
      try { await this.userAccess.requireProjectAccess(req.user?.userId, req.user?.role, projectId); }
      catch { throw new ForbiddenException('Access denied for this project'); }
    }
  }

  @Post('invoices/generate')
  @Roles(Role.OPERATOR, Role.ADMIN, Role.SUPER_ADMIN, Role.FINANCE)
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Generate invoices for billing period' })
  async generateInvoices(
    @Body() dto: { projectId: string; billingPeriodId: string; customerIds?: string[] },
    @Req() req: any
  ) {
    await this.validateProject(dto.projectId, req);
    try {
    let period = await this.prisma.billingPeriod.findUnique({
      where: { id: dto.billingPeriodId }
    }).catch(() => null);
    if (!period) {
      period = await this.prisma.billingPeriod.findFirst({
        where: { projectId: dto.projectId, periodCode: dto.billingPeriodId }
      }).catch(() => null);
    }
    const project = await this.prisma.project.findUnique({ where: { id: dto.projectId } });
    if (!period) return { batchId: 'no-period', generatedCount: 0 };
    if (!project) return { batchId: 'no-project', generatedCount: 0 };

    const taxRate = project.taxEnabled ? Number(project.taxRate ?? 0) / 100 : 0;
    const waterDiffMode = project.waterDifferenceMode;
    let count = 0;

    const meters = await this.prisma.meter.findMany({
      where: { projectId: dto.projectId, status: { not: 'retired' } }
    });
    const readings = await this.prisma.reading.findMany({
      where: {
        projectId: dto.projectId,
        readingAt: { gte: period.startDate, lte: period.endDate },
        status: 'valid'
      },
      orderBy: { readingAt: 'asc' }
    });

    const existingInvoices = await this.prisma.invoice.findMany({
      where: { projectId: dto.projectId, billingPeriodId: dto.billingPeriodId },
      select: { meterId: true }
    });
    const metersWithInvoices = new Set(existingInvoices.map((i) => i.meterId));

    for (const meter of meters) {
      if (metersWithInvoices.has(meter.id)) continue;

      const meterReadings = readings.filter((r) => r.meterId === meter.id);
      const consumption = meterReadings.reduce((s, r) => s + Number(r.consumptionValue ?? 0), 0);
      if (consumption <= 0) continue;

      const utilityType = meter.meterType === 'electricity' ? 'electricity' : 'water';

      // Use TariffEngineService for full charge calculation (STEPS/FLAT/STATIC/PER_UNIT/ZERO)
      let chargeLines: any[] = [];
      let subtotal = 0;
      try {
        const result = await this.tariffEngine.calculateCharges(dto.projectId, meter.meterType, consumption, period.startDate);
        chargeLines = result.lines;
        subtotal = result.total;
      } catch {
        // Fallback to flat rate if tariff engine fails
        const tariff = await this.tariffService.getEffectiveTariff(dto.projectId, meter.meterType, period.startDate);
        if (!tariff) continue;
        subtotal = Number(tariff.ratePerUnit) * consumption;
        chargeLines = [{ chargeCode: 'FLAT', chargeName: 'Consumption', chargeGroup: 0, quantity: consumption, rateAmount: Number(tariff.ratePerUnit), lineAmount: subtotal, description: `Consumption @ ${tariff.ratePerUnit}` }];
      }

      const tax = subtotal * taxRate;
      const invCount = await this.prisma.invoice.count();
      const prefix = utilityType === 'electricity' ? 'ELE' : utilityType === 'water' ? 'WTR' : 'UTL';
      const seq = String(invCount + 1).padStart(8, '0');
      const invoiceNumber = `${prefix}-${period.startDate.getFullYear()}-${seq}`;

      const invoice = await this.prisma.invoice.create({
        data: {
          invoiceNumber,
          projectId: dto.projectId,
          customerId: dto.customerIds?.[0] ?? 'system',
          unitId: 'system',
          meterId: meter.id,
          utilityType,
          billingPeriodId: dto.billingPeriodId,
          status: 'draft',
          subtotalAmount: subtotal,
          taxAmount: tax,
          totalAmount: subtotal + tax,
          remainingAmount: subtotal + tax,
          paidAmount: 0
        }
      });

      // Create invoice lines from tariff engine results
      for (const line of chargeLines) {
        await this.prisma.invoiceLine.create({
          data: {
            invoiceId: invoice.id,
            description: line.description || line.chargeName,
            quantity: line.quantity || 0,
            unitPrice: line.rateAmount || 0,
            lineAmount: line.lineAmount || 0,
            chargeGroup: line.chargeGroup ?? 0,
          }
        });
      }

      if (utilityType === 'water' && (meter.meterType as string) === 'water_main') {
        await this.waterDifferencePolicy.apply(invoice.id, dto.projectId, period.startDate, period.endDate, waterDiffMode, taxRate);
      }

      count++;
    }
    return { batchId: `batch-${Date.now()}`, generatedCount: count };
    } catch (err: any) {
      this.logger.error(`Invoice generation failed: ${err.message}`, err.stack);
      throw new InternalServerErrorException(`Invoice generation failed: ${err.message}`);
    }
  }

  @Post('invoices/:id/issue')
  @Roles(Role.OPERATOR, Role.ADMIN, Role.SUPER_ADMIN, Role.FINANCE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Issue an invoice' })
  async issueInvoice(@Param('id', ParseUUIDPipe) id: string, @Req() req: any) {
    const invoice = await this.prisma.invoice.findUnique({ where: { id } });
    if (!invoice) return { status: 'not_found' };
    await this.validateProject(invoice.projectId, req);
    if (invoice.status !== 'draft') return { status: 'already_issued' };

    const total = Number(invoice.totalAmount);
    if (total > 10000) return { status: 'approval_required' };

    const now = new Date();
    await this.prisma.invoice.update({
      where: { id },
      data: { status: 'issued', issuedAt: now, immutableAt: now }
    });

    await this.ledgerService.addEntry({
      customerId: invoice.customerId,
      projectId: invoice.projectId,
      entryType: 'invoice_charge',
      referenceType: 'invoice',
      referenceId: invoice.id,
      amountDelta: total,
      entryAt: now
    });

    return { status: 'issued', immutableAt: now.toISOString() };
  }

  @Patch('invoices/:id')
  @Roles(Role.OPERATOR, Role.ADMIN, Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update invoice metadata' })
  async updateInvoice(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: { dueAt?: string; notes?: string },
    @Req() req: any
  ) {
    const invoice = await this.prisma.invoice.findUnique({ where: { id } });
    if (!invoice) return { status: 'not_found' };
    await this.validateProject(invoice.projectId, req);
    const data: any = {};
    if (dto.dueAt) data.dueAt = new Date(dto.dueAt);
    if (dto.notes !== undefined) data.notes = dto.notes;
    await this.prisma.invoice.update({ where: { id }, data });
    return { status: 'updated' };
  }

  @Post('invoices/:id/cancel')
  @Roles(Role.OPERATOR, Role.ADMIN, Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel an invoice' })
  async cancelInvoice(@Param('id', ParseUUIDPipe) id: string, @Req() req: any) {
    const invoice = await this.prisma.invoice.findUnique({ where: { id } });
    if (!invoice) return { status: 'not_found' };
    await this.validateProject(invoice.projectId, req);
    if (invoice.status === 'cancelled') return { status: 'already_cancelled' };
    if (invoice.status === 'paid') return { status: 'cannot_cancel_paid' };

    await this.prisma.invoice.update({
      where: { id },
      data: { status: 'cancelled', immutableAt: new Date() }
    });

    return { status: 'cancelled' };
  }

  @Post('invoices/:id/reverse')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Audit('invoice', 'reverse')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reverse an invoice' })
  async reverseInvoice(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: { reason: string },
    @Req() req: any
  ) {
    return this.prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.findUnique({ where: { id } });
      if (!invoice) throw new NotFoundException('Invoice not found');
      await this.validateProject(invoice.projectId, req);
      if (invoice.status !== 'paid' && invoice.status !== 'issued') {
        throw new BadRequestException('Only paid or issued invoices can be reversed');
      }

      const total = Number(invoice.totalAmount);

      await this.ledgerService.addEntry({
        customerId: invoice.customerId,
        projectId: invoice.projectId,
        entryType: 'payment_reversal',
        referenceType: 'invoice',
        referenceId: invoice.id,
        amountDelta: -total,
        entryAt: new Date()
      });

      const updated = await tx.invoice.update({
        where: { id },
        data: {
          status: 'cancelled',
          remainingAmount: 0
        }
      });

      return { status: 'reversed', invoiceId: updated.id };
    });
  }

  @Post('invoices/:id/void')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Audit('invoice', 'void')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Void an invoice' })
  async voidInvoice(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: { reason?: string },
    @Req() req: any
  ) {
    const invoice = await this.prisma.invoice.findUnique({ where: { id } });
    if (!invoice) return { status: 'not_found' };
    await this.validateProject(invoice.projectId, req);
    if (invoice.status !== 'draft' && invoice.status !== 'issued') {
      return { status: 'invalid_state', message: 'Only draft or issued invoices can be voided' };
    }

    const allocCount = await this.prisma.paymentAllocation.count({ where: { invoiceId: id } });
    if (allocCount > 0) {
      return { status: 'has_payments', message: 'Cannot void an invoice with payments' };
    }

    await this.prisma.invoice.update({
      where: { id },
      data: {
        status: 'void'
      }
    });

    return { status: 'voided' };
  }

  @Post('credit-note')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Audit('billing', 'credit_note')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a credit note' })
  async createCreditNote(@Body() dto: { customerId: string; projectId: string; amount: number; reason: string }, @Req() req: any) {
    await this.validateProject(dto.projectId, req);
    return this.prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.create({
        data: {
          invoiceNumber: `CN-${Date.now()}`,
          projectId: dto.projectId,
          customerId: dto.customerId,
          unitId: '',
          meterId: '',
          utilityType: 'electricity',
          billingPeriodId: '',
          status: 'issued',
          subtotalAmount: -Math.abs(dto.amount),
          taxAmount: 0,
          totalAmount: -Math.abs(dto.amount),
          paidAmount: 0,
          remainingAmount: -Math.abs(dto.amount),
          issuedAt: new Date(),
          dueAt: new Date(),
        },
      });
      await this.ledgerService.addEntry({
        customerId: dto.customerId, projectId: dto.projectId,
        entryType: 'adjustment_credit', referenceType: 'invoice',
        referenceId: invoice.id, amountDelta: -Math.abs(dto.amount), entryAt: new Date(),
      });
      return { status: 'credit_note_created', invoiceId: invoice.id };
    });
  }

  @Post('debit-note')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Audit('billing', 'debit_note')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a debit note' })
  async createDebitNote(@Body() dto: { customerId: string; projectId: string; amount: number; reason: string }, @Req() req: any) {
    await this.validateProject(dto.projectId, req);
    return this.prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.create({
        data: {
          invoiceNumber: `DN-${Date.now()}`,
          projectId: dto.projectId,
          customerId: dto.customerId,
          unitId: '',
          meterId: '',
          utilityType: 'electricity',
          billingPeriodId: '',
          status: 'issued',
          subtotalAmount: Math.abs(dto.amount),
          taxAmount: 0,
          totalAmount: Math.abs(dto.amount),
          paidAmount: 0,
          remainingAmount: Math.abs(dto.amount),
          issuedAt: new Date(),
          dueAt: new Date(),
        },
      });
      await this.ledgerService.addEntry({
        customerId: dto.customerId, projectId: dto.projectId,
        entryType: 'adjustment_debit', referenceType: 'invoice',
        referenceId: invoice.id, amountDelta: Math.abs(dto.amount), entryAt: new Date(),
      });
      return { status: 'debit_note_created', invoiceId: invoice.id };
    });
  }

  @Post('carry-forward')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Audit('billing', 'carry_forward')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Carry forward balance to next billing period' })
  async carryForward(@Body() dto: { customerId: string; projectId: string; fromPeriod: string; toPeriod: string }, @Req() req: any) {
    await this.validateProject(dto.projectId, req);
    const ledgerEntries = await this.prisma.customerLedgerEntry.findMany({
      where: { customerId: dto.customerId },
      orderBy: { entryAt: 'desc' },
      take: 1,
    });
    const balance = ledgerEntries.length > 0 ? Number(ledgerEntries[0].runningBalance) : 0;
    await this.ledgerService.addEntry({
      customerId: dto.customerId, projectId: dto.projectId,
      entryType: 'adjustment_credit', referenceType: 'adjustment',
      referenceId: `carry-${dto.fromPeriod}-${dto.toPeriod}`,
      amountDelta: balance, entryAt: new Date(),
    });
    return { message: `Balance ${balance} carried forward from ${dto.fromPeriod} to ${dto.toPeriod}` };
  }

  @Post('invoices/:id/adjustments')
  @Roles(Role.OPERATOR, Role.ADMIN, Role.SUPER_ADMIN, Role.FINANCE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add adjustment to invoice' })
  async addAdjustment(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: { adjustmentType: 'credit' | 'debit'; amount: number; reason: string },
    @Req() req: any
  ) {
    const invoice = await this.prisma.invoice.findUnique({ where: { id } });
    if (!invoice) return { status: 'not_found' };
    await this.validateProject(invoice.projectId, req);

    const signedAmount = Number(dto.amount) * (dto.adjustmentType === 'credit' ? -1 : 1);

    const [adjustment] = await this.prisma.$transaction([
      this.prisma.invoiceAdjustment.create({
        data: {
          invoiceId: id,
          adjustmentType: dto.adjustmentType,
          amount: dto.amount,
          reason: dto.reason,
          createdBy: 'system'
        }
      }),
      this.prisma.invoice.update({
        where: { id },
        data: {
          totalAmount: { increment: signedAmount },
          remainingAmount: { increment: signedAmount }
        }
      })
    ]);

    await this.ledgerService.addEntry({
      customerId: invoice.customerId,
      projectId: invoice.projectId,
      entryType: dto.adjustmentType === 'credit' ? 'payment_credit' : 'invoice_charge',
      referenceType: 'adjustment',
      referenceId: adjustment.id,
      amountDelta: signedAmount,
      entryAt: new Date()
    });

    return { status: 'adjusted', adjustmentId: adjustment.id };
  }

  @Post('payments')
  @Roles(Role.OPERATOR, Role.ADMIN, Role.SUPER_ADMIN, Role.FINANCE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Record payment with oldest-due-first allocation' })
  async createPayment(
    @Body()
    dto: {
      projectId: string;
      customerId: string;
      amount: number;
      paymentDate: string;
      method: string;
      notes?: string;
      allocationMode?: 'oldest_due_first' | 'explicit';
      allocations?: Array<{ invoiceId: string; amount: number }>;
    },
    @Req() req: any
  ) {
    await this.validateProject(dto.projectId, req);
    const allocMode = dto.allocationMode ?? 'oldest_due_first';
    const amount = Number(dto.amount);

    if (allocMode === 'explicit' && dto.allocations) {
      const totalAllocated = dto.allocations.reduce((s, a) => s + Number(a.amount), 0);
      if (Math.abs(totalAllocated - amount) > 0.001) {
        return {
          status: 'allocation_mismatch',
          message: 'Allocation total must equal payment amount'
        };
      }
    }

    return this.prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          paymentNumber: `PAY-${Date.now()}`,
          projectId: dto.projectId,
          customerId: dto.customerId,
          amount,
          paymentDate: new Date(dto.paymentDate),
          method: dto.method as any,
          status: 'confirmed',
          collectedBy: 'system',
          notes: dto.notes
        }
      });

      let remaining = amount;

      if (allocMode === 'oldest_due_first') {
        const dueInvoices = await tx.invoice.findMany({
          where: {
            customerId: dto.customerId,
            projectId: dto.projectId,
            status: { in: ['issued', 'partially_paid'] as any },
            remainingAmount: { gt: 0 }
          },
          orderBy: [{ dueAt: 'asc' }, { createdAt: 'asc' }]
        });

        let order = 1;
        for (const inv of dueInvoices) {
          if (remaining <= 0) break;
          const invRemaining = Number(inv.remainingAmount);
          const allocAmount = Math.min(remaining, invRemaining);

          await tx.paymentAllocation.create({
            data: {
              paymentId: payment.id,
              invoiceId: inv.id,
              allocatedAmount: allocAmount,
              allocationOrder: order++
            }
          });

          await tx.invoice.update({
            where: { id: inv.id },
            data: {
              paidAmount: { increment: allocAmount },
              remainingAmount: { increment: -allocAmount }
            }
          });

          const oldPaid = Number(inv.paidAmount);
          const total = Number(inv.totalAmount);
          const newPaid = oldPaid + allocAmount;
          if (newPaid >= total - 0.001) {
            await tx.invoice.update({
              where: { id: inv.id },
              data: { status: 'paid' }
            });
          } else if (newPaid > 0) {
            await tx.invoice.update({
              where: { id: inv.id },
              data: { status: 'partially_paid' }
            });
          }

          remaining -= allocAmount;
        }
      } else if (dto.allocations) {
        let order = 1;
        for (const alloc of dto.allocations) {
          await tx.paymentAllocation.create({
            data: {
              paymentId: payment.id,
              invoiceId: alloc.invoiceId,
              allocatedAmount: alloc.amount,
              allocationOrder: order++
            }
          });

          const allocInv = await tx.invoice.findUnique({ where: { id: alloc.invoiceId } });
          const oldPaid = allocInv ? Number(allocInv.paidAmount) : 0;
          const total = allocInv ? Number(allocInv.totalAmount) : 0;

          await tx.invoice.update({
            where: { id: alloc.invoiceId },
            data: {
              paidAmount: { increment: alloc.amount },
              remainingAmount: { increment: -alloc.amount }
            }
          });

          const newPaid = oldPaid + Number(alloc.amount);
          if (newPaid >= total - 0.001) {
            await tx.invoice.update({
              where: { id: alloc.invoiceId },
              data: { status: 'paid' }
            });
          } else if (newPaid > 0) {
            await tx.invoice.update({
              where: { id: alloc.invoiceId },
              data: { status: 'partially_paid' }
            });
          }

          remaining -= Number(alloc.amount);
        }
      }

      if (amount - remaining > 0) {
        await this.ledgerService.addEntry({
          customerId: dto.customerId,
          projectId: dto.projectId,
          entryType: 'payment_credit',
          referenceType: 'payment',
          referenceId: payment.id,
          amountDelta: -(amount - remaining),
          entryAt: new Date(dto.paymentDate)
        });
      }

      return payment;
    });
  }

  @Post('tariff-plans')
  @Roles(Role.OPERATOR, Role.ADMIN, Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create tariff plan' })
  async createTariff(
    @Body() dto: {
      projectId: string;
      meterType: string;
      ratePerUnit: number;
      currency: string;
      effectiveFrom: string;
      effectiveTo?: string;
      status?: string;
    },
    @Req() req: any
  ) {
    await this.validateProject(dto.projectId, req);
    const userId = req.user.userId;
    return this.prisma.tariffPlan.create({
      data: {
        projectId: dto.projectId,
        meterType: dto.meterType as any,
        ratePerUnit: dto.ratePerUnit,
        currency: dto.currency,
        effectiveFrom: new Date(dto.effectiveFrom),
        effectiveTo: dto.effectiveTo ? new Date(dto.effectiveTo) : null,
        status: (dto.status as any) ?? 'active',
        createdBy: userId,
        updatedBy: userId
      }
    });
  }

  @Get('tariff-plans')
  @Roles(Role.OPERATOR, Role.ADMIN, Role.SUPER_ADMIN, Role.FINANCE, Role.SUPPORT)
  @ApiOperation({ summary: 'List tariff plans' })
  async listTariffPlans(@Query('projectId') projectId?: string, @Req() req?: any) {
    const where: any = {};
    if (projectId) {
      await this.validateProject(projectId, req);
      where.projectId = projectId;
    } else if (req.user?.role !== 'super_admin') {
      const access = await this.userAccess.resolveAccess(req.user?.userId, req.user?.role);
      if (access.projects.length === 0) return [];
      where.projectId = { in: access.projects };
    }
    if (req?.areaId && req?.userAccess?.projectIds?.length) {
      where.projectId = { in: req.userAccess.projectIds };
    }
    return this.prisma.tariffPlan.findMany({ where, orderBy: { effectiveFrom: 'desc' } });
  }

  @Post('periods')
  @Roles(Role.OPERATOR, Role.ADMIN, Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create billing period' })
  async createPeriod(
    @Body() dto: { projectId: string; periodCode: string; startDate: string; endDate: string },
    @Req() req: any
  ) {
    await this.validateProject(dto.projectId, req);
    return this.periodService.createPeriod({
      projectId: dto.projectId,
      periodCode: dto.periodCode,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
      createdBy: req.user?.userId ?? 'system'
    });
  }

  @Get('periods')
  @Roles(Role.OPERATOR, Role.ADMIN, Role.SUPER_ADMIN, Role.FINANCE, Role.SUPPORT)
  @ApiOperation({ summary: 'List billing periods' })
  async listPeriods(@Query('projectId') projectId?: string, @Req() req?: any) {
    const where: any = {};
    if (projectId) {
      await this.validateProject(projectId, req);
      where.projectId = projectId;
    } else if (req.user?.role !== 'super_admin') {
      const access = await this.userAccess.resolveAccess(req.user?.userId, req.user?.role);
      if (access.projects.length === 0) return [];
      where.projectId = { in: access.projects };
    }
    if (req?.areaId && req?.userAccess?.projectIds?.length) {
      where.projectId = { in: req.userAccess.projectIds };
    }
    return this.prisma.billingPeriod.findMany({ where, orderBy: { startDate: 'desc' } });
  }

  @Get('invoices')
  @Roles(Role.OPERATOR, Role.ADMIN, Role.SUPER_ADMIN, Role.FINANCE, Role.SUPPORT)
  @ApiOperation({ summary: 'List invoices' })
  async listInvoices(
    @Query('projectId') projectId?: string,
    @Query('customerId') customerId?: string,
    @Query('status') status?: string,
    @Req() req?: any
  ) {
    const where: any = {};
    if (projectId) {
      await this.validateProject(projectId, req);
      where.projectId = projectId;
    } else if (req.user?.role !== 'super_admin') {
      const access = await this.userAccess.resolveAccess(req.user?.userId, req.user?.role);
      if (access.projects.length === 0) return [];
      where.projectId = { in: access.projects };
    }
    if (customerId) where.customerId = customerId;
    if (status) where.status = status;
    const invoices = await this.prisma.invoice.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });
    const lines = await this.prisma.invoiceLine.findMany({
      where: { invoiceId: { in: invoices.map((i) => i.id) } }
    });
    return invoices.map((inv) => ({
      ...inv,
      subtotalAmount: Number(inv.subtotalAmount),
      taxAmount: Number(inv.taxAmount),
      totalAmount: Number(inv.totalAmount),
      paidAmount: Number(inv.paidAmount),
      remainingAmount: Number(inv.remainingAmount),
      lines: lines.filter((l) => l.invoiceId === inv.id).map((l) => ({
        ...l,
        quantity: Number(l.quantity),
        unitPrice: Number(l.unitPrice),
        lineAmount: Number(l.lineAmount)
      }))
    }));
  }

  @Get('invoices/:id')
  @Roles(Role.OPERATOR, Role.ADMIN, Role.SUPER_ADMIN, Role.FINANCE, Role.SUPPORT)
  @ApiOperation({ summary: 'Get invoice by ID' })
  async getInvoice(@Param('id', ParseUUIDPipe) id: string, @Req() req: any) {
    const invoice = await this.prisma.invoice.findUnique({ where: { id } });
    if (!invoice) return { status: 'not_found' };
    await this.validateProject(invoice.projectId, req);
    const lines = await this.prisma.invoiceLine.findMany({
      where: { invoiceId: id }
    });
    return {
      ...invoice,
      subtotalAmount: Number(invoice.subtotalAmount),
      taxAmount: Number(invoice.taxAmount),
      totalAmount: Number(invoice.totalAmount),
      paidAmount: Number(invoice.paidAmount),
      remainingAmount: Number(invoice.remainingAmount),
      lines: lines.map((l) => ({
        ...l,
        quantity: Number(l.quantity),
        unitPrice: Number(l.unitPrice),
        lineAmount: Number(l.lineAmount)
      }))
    };
  }

  @Post('tariffs/simulate')
  @Roles(Role.OPERATOR, Role.ADMIN, Role.SUPER_ADMIN, Role.FINANCE)
  @ApiOperation({ summary: 'Simulate tariff calculation' })
  async simulateTariff(@Body() dto: { projectId: string; meterType: string; consumption: number; effectiveDate?: string }, @Req() req: any) {
    await this.validateProject(dto.projectId, req);
    const date = dto.effectiveDate ? new Date(dto.effectiveDate) : new Date();
    const result = await this.tariffEngine.calculateCharges(dto.projectId, dto.meterType, dto.consumption, date);
    return { ...result, vatRate: 0.14, vatAmount: result.total * 0.14, grandTotal: result.total * 1.14 };
  }
}
