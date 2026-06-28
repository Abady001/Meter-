import { Controller, Get, Post, Param, Res, Req, Body, ParseUUIDPipe, StreamableFile, Query, ForbiddenException, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';
import { GlobalAuthGuard } from '../auth/global-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/types/role.enum';
import { PrismaService } from '../common/database/prisma.service';
import { InvoiceTemplateService } from './invoice-template.service';
import { InvoiceDocument } from './invoice-document.model';
import { getUtilityConfig } from '../utilities/utility-config';
import { getChargeGroupName } from './charge-groups';
import { UserAccessService } from '../auth/user-access.service';
import { ReportEngineClient } from './report-engine-client.service';

@ApiTags('Invoices')
@Controller('invoices')
@UseGuards(GlobalAuthGuard, RolesGuard)
export class InvoicesController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly template: InvoiceTemplateService,
    private readonly userAccess: UserAccessService,
    private readonly jasper: ReportEngineClient,
  ) {}

  @Get()
  @Roles(Role.OPERATOR, Role.ADMIN, Role.SUPER_ADMIN, Role.FINANCE)
  @ApiOperation({ summary: 'List invoices' })
  async findAll(@Query('projectId') projectId?: string, @Query('limit') limit?: string, @Req() req?: any) {
    const where: any = {};
    if (projectId) where.projectId = projectId;
    if (req?.user && req.user.role !== 'super_admin') {
      const access = await this.userAccess.resolveAccess(req.user.userId, req.user.role);
      if (access.projects.length) where.projectId = { in: access.projects };
      else return [];
    }
    return this.prisma.invoice.findMany({ where, orderBy: { createdAt: 'desc' }, take: parseInt(limit || '100') });
  }

  @Get(':id/pdf')
  @Roles(Role.OPERATOR, Role.ADMIN, Role.SUPER_ADMIN, Role.FINANCE)
  @ApiOperation({ summary: 'Download invoice as PDF (Master Template)' })
  async downloadPdf(@Param('id', ParseUUIDPipe) id: string) {
    const inv = await this.prisma.invoice.findUnique({ where: { id } });
    if (!inv) return { error: 'Invoice not found' };

    const lines = await this.prisma.invoiceLine.findMany({ where: { invoiceId: id } });
    const project = await this.prisma.project.findUnique({ where: { id: inv.projectId } }).catch(() => null);
    const meter = await this.prisma.meter.findUnique({ where: { id: inv.meterId } }).catch(() => null);
    const period = await this.prisma.billingPeriod.findUnique({ where: { id: inv.billingPeriodId } }).catch(() => null);

    // Look up real customer name instead of showing UUID
    let customerName = inv.customerId;
    let customerCode = '';
    try {
      const customer = await this.prisma.customer.findUnique({ where: { id: inv.customerId } });
      if (customer) { customerName = customer.name; customerCode = customer.customerCode; }
    } catch { /* fallback to UUID */ }

    // Look up readings for start/end reading values
    let startReading: number | undefined;
    let endReading: number | undefined;
    try {
      const readings = await this.prisma.reading.findMany({
        where: { meterId: inv.meterId },
        orderBy: { readingAt: 'desc' },
        take: 2,
      });
      if (readings.length >= 2) { endReading = Number(readings[0].readingValue); startReading = Number(readings[1].readingValue); }
      else if (readings.length === 1) { endReading = Number(readings[0].readingValue); }
    } catch { /* no readings */ }

    // Look up tariff
    let tariffName = '';
    try {
      if (meter) {
        const tariff = await this.prisma.tariffPlan.findFirst({ where: { meterType: meter.meterType as any, projectId: inv.projectId, status: 'active' } });
        if (tariff) tariffName = `${meter.meterType} @ ${tariff.ratePerUnit}`;
      }
    } catch { /* no tariff */ }

    const chargeLines = lines.map(l => ({
      chargeCode: '',
      chargeName: l.description,
      chargeNameAr: l.description,
      chargeGroup: (l as any).chargeGroup ?? 0,
      quantity: Number(l.quantity),
      rateAmount: Number(l.unitPrice),
      lineAmount: Number(l.lineAmount),
    }));

    const subtotal = chargeLines.reduce((s, l) => s + l.lineAmount, 0);
    const taxAmount = Number(inv.taxAmount);
    const totalAmount = subtotal + taxAmount;
    const balanceBefore = Number((inv as any).balanceBefore ?? 0);
    const balanceAfter = balanceBefore + totalAmount;
    const consumption = chargeLines.filter(l => l.chargeGroup === 0).reduce((s, l) => s + l.quantity, 0);

    const utilConfig: any = getUtilityConfig(inv.utilityType);
    const cfg = utilConfig;

    const doc: InvoiceDocument = {
      invoiceNumber: inv.invoiceNumber,
      invoiceTitle: cfg.invoiceTitle || 'فاتورة',
      utilityType: inv.utilityType,
      billingPeriod: period?.periodCode ?? '',
      issueDate: inv.issuedAt?.toISOString().slice(0, 10) ?? inv.createdAt.toISOString().slice(0, 10),
      dueDate: inv.dueAt?.toISOString().slice(0, 10) ?? '',
      status: inv.status,
      companyName: project?.name ?? '',
      companyNameAr: project?.name ?? '',
      companyLogo: (project as any)?.logo ?? undefined,
      companyLicense: (project as any)?.license ?? undefined,
      companySignature: (project as any)?.signature ?? undefined,
      companyBankDetails: (project as any)?.bankDetails ?? undefined,
      customerId: inv.customerId,
      customerName: customerName,
      customerCode: customerCode,
      projectName: project?.name ?? '',
      areaName: (project as any)?.area ?? '',
      unitNumber: inv.unitId === 'system' ? undefined : inv.unitId,
      meterSerial: (meter?.serialNumber as string) ?? (inv as any).meterSerial ?? inv.meterId.substring(0, 8),
      meterType: meter?.meterType ?? '',
      consumption,
      unit: cfg.unit || 'kWh',
      startReading,
      endReading,
      tariffName,
      balanceBefore,
      currentCharges: subtotal,
      adjustments: 0,
      payments: Number(inv.paidAmount),
      balanceAfter,
      subtotal,
      taxAmount,
      totalAmount,
      currency: 'EGP',
      chargeLines,
      generatedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
    };

    // Try JasperReports engine first (if configured), fall back to legacy Puppeteer
    let pdfBuffer: Buffer | null = null;
    if (this.jasper.isEnabled) {
      pdfBuffer = await this.jasper.generateInvoicePdf(doc);
    }
    if (!pdfBuffer) {
      pdfBuffer = await this.template.generatePdf(doc);
    }
    return new StreamableFile(pdfBuffer, {
      type: 'application/pdf',
      disposition: `attachment; filename="invoice-${inv.invoiceNumber}.pdf"`,
    });
  }

  @Post('batch-download')
  @Roles(Role.OPERATOR, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Download invoices as ZIP' })
  async batchDownload(@Res() res: Response, @Req() req?: any, @Body() body?: any) {
    try {
      const user = req?.user;
      let projectFilter: any = {};
      if (user && user.role !== 'super_admin') {
        const access = await this.userAccess.resolveAccess(user.userId, user.role);
        if (access.projects.length === 0) return res.json({ error: 'No accessible projects' });
        projectFilter = { projectId: { in: access.projects } };
      } else if (body?.projectId) {
        projectFilter = { projectId: body.projectId };
      }
      const invoices = await this.prisma.invoice.findMany({ where: projectFilter, orderBy: { createdAt: 'desc' }, take: 10 });
      const JSZip = require('jszip');
      const zip = new JSZip();
      for (const inv of invoices) {
        const lines = await this.prisma.invoiceLine.findMany({ where: { invoiceId: inv.id } });
        zip.file(`invoice-${inv.invoiceNumber}.json`, JSON.stringify({ invoiceNumber: inv.invoiceNumber, status: inv.status, total: inv.totalAmount, lines: lines.length }, null, 2));
      }
      const content = await zip.generateAsync({ type: 'nodebuffer' });
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', 'attachment; filename=invoices-batch.zip');
      res.send(content);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  }
}
