import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../common/database/prisma.service';

@Injectable()
export class ReportGenerationService {
  private readonly logger = new Logger(ReportGenerationService.name);
  constructor(private readonly prisma: PrismaService) {}

  async generate(reportType: string, params: { projectId?: string; startDate?: string; endDate?: string; status?: string; customerId?: string; walletId?: string; cycleId?: string; meterId?: string }) {
    switch (reportType) {
      case 'invoices-summary': return this.invoicesSummary(params);
      case 'payments': return this.paymentsReport(params);
      case 'customer-statement': return this.customerStatement(params);
      case 'monthly-consumption': return this.monthlyConsumption(params);
      case 'monthly-finance': return this.monthlyFinance(params);
      case 'meters-status': return this.metersStatus(params);
      case 'active-tariffs': return this.activeTariffs(params);
      case 'aging': return this.agingReport(params);
      case 'canceled-invoices': return this.canceledInvoices(params);
      case 'audit-log': return this.auditLog(params);
      case 'water-balance': return this.waterBalance(params);
      case 'solar-generation': return this.solarGeneration(params);
      case 'solar-export-import': return this.solarExportImport(params);
      case 'wallet-transactions': return this.walletTransactions(params);
      case 'wallet-balance': return this.walletBalance(params);
      case 'bill-cycle-summary': return this.billCycleSummary(params);
      case 'bill-cycle-audit': return this.billCycleAudit(params);
      case 'reading-register': return this.readingRegister(params);
      case 'reading-history': return this.readingHistory(params);
      case 'customer-list': return this.customerListReport(params);
      case 'customer-aging': return this.customerAging(params);
      case 'charge-analysis': return this.chargeAnalysis(params);
      case 'meter-lifecycle': return this.meterLifecycle(params);
      case 'user-activity': return this.userActivity(params);
      case 'failed-payments': return this.failedPayments(params);
      case 'high-consumption': return this.highConsumption(params);
      case 'zero-consumption': return this.zeroConsumption(params);
      case 'new-connections': return this.newConnections(params);
      case 'disconnections': return this.disconnections(params);
      case 'suspended-accounts': return this.suspendedAccounts(params);
      case 'collection-efficiency': return this.collectionEfficiency(params);
      case 'payment-distribution': return this.paymentDistribution(params);
      case 'wallet-usage': return this.walletUsage(params);
      case 'solar-adoption': return this.solarAdoption(params);
      case 'meter-health': return this.meterHealth(params);
      case 'system-config': return this.systemConfig(params);
      case 'tax-summary': return this.taxSummary(params);
      case 'discount-summary': return this.discountSummary(params);
      case 'bill-cycle-detail': return this.billCycleDetail(params);
      case 'late-fee-summary': return this.lateFeeSummary(params);
      case 'customer-history': return this.customerHistory(params);
      case 'reading-anomalies': return this.readingAnomalies(params);
      case 'tariff-comparison': return this.tariffComparison(params);
      case 'settlement-summary': return this.settlementSummary(params);
      default: return { error: 'Unknown report type: ' + reportType };
    }
  }

  private async invoicesSummary(params: any) {
    const where: any = { status: { not: 'cancelled' } };
    if (params.projectId) where.projectId = params.projectId;
    if (params.status) where.status = params.status;
    const invoices = await this.prisma.invoice.findMany({ where, orderBy: { createdAt: 'desc' }, take: 500 });
    const totalAmount = invoices.reduce((s, i) => s + Number(i.totalAmount), 0);
    const totalPaid = invoices.reduce((s, i) => s + Number(i.paidAmount), 0);
    const totalOpen = invoices.reduce((s, i) => s + Number(i.remainingAmount), 0);
    return {
      summary: { totalInvoices: invoices.length, totalAmount, totalPaid, totalOpen, collectionRate: totalAmount > 0 ? (totalPaid / totalAmount * 100).toFixed(1) : '0' },
      invoices: invoices.map(i => ({ number: i.invoiceNumber, status: i.status, total: i.totalAmount, paid: i.paidAmount, open: i.remainingAmount, date: i.issuedAt })),
    };
  }

  private async paymentsReport(params: any) {
    const where: any = {};
    if (params.projectId) where.projectId = params.projectId;
    const payments = await this.prisma.payment.findMany({ where, orderBy: { paymentDate: 'desc' }, take: 500 });
    return {
      summary: { totalPayments: payments.length, totalAmount: payments.reduce((s, p) => s + Number(p.amount), 0) },
      payments: payments.map(p => ({ number: p.paymentNumber, date: p.paymentDate, method: p.method, amount: p.amount, status: p.status })),
    };
  }

  private async customerStatement(params: any) {
    if (!params.customerId) return { error: 'customerId required' };
    const invoices = await this.prisma.invoice.findMany({ where: { customerId: params.customerId }, orderBy: { createdAt: 'asc' } });
    const payments = await this.prisma.payment.findMany({ where: { customerId: params.customerId }, orderBy: { paymentDate: 'asc' } });
    const entries = [
      ...invoices.map(i => ({ date: i.issuedAt || i.createdAt, type: 'invoice', ref: i.invoiceNumber, amount: Number(i.totalAmount), balance: 0 })),
      ...payments.map(p => ({ date: p.paymentDate, type: 'payment', ref: p.paymentNumber, amount: -Number(p.amount), balance: 0 })),
    ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    let running = 0;
    for (const e of entries) { running += e.amount; e.balance = running; }
    return { customerId: params.customerId, entries, balance: running };
  }

  private async monthlyConsumption(params: any) {
    const where: any = {};
    if (params.projectId) where.projectId = params.projectId;
    const readings = await this.prisma.reading.findMany({ where, orderBy: { readingAt: 'desc' }, take: 1000 });
    const byMonth: Record<string, { count: number; total: number }> = {};
    for (const r of readings) {
      const key = r.readingAt.toISOString().slice(0, 7);
      if (!byMonth[key]) byMonth[key] = { count: 0, total: 0 };
      byMonth[key].count++;
      byMonth[key].total += Number(r.readingValue);
    }
    return { monthly: Object.entries(byMonth).map(([month, data]) => ({ month, ...data })).sort((a, b) => a.month.localeCompare(b.month)) };
  }

  private async monthlyFinance(params: any) {
    const where: any = { status: { not: 'cancelled' } };
    if (params.projectId) where.projectId = params.projectId;
    const invoices = await this.prisma.invoice.findMany({ where, orderBy: { createdAt: 'desc' }, take: 1000 });
    const byMonth: Record<string, { invoiced: number; paid: number; open: number; count: number }> = {};
    for (const inv of invoices) {
      const key = (inv.issuedAt || inv.createdAt).toISOString().slice(0, 7);
      if (!byMonth[key]) byMonth[key] = { invoiced: 0, paid: 0, open: 0, count: 0 };
      byMonth[key].invoiced += Number(inv.totalAmount);
      byMonth[key].paid += Number(inv.paidAmount);
      byMonth[key].open += Number(inv.remainingAmount);
      byMonth[key].count++;
    }
    return { monthly: Object.entries(byMonth).map(([month, d]) => ({ month, ...d })).sort((a, b) => a.month.localeCompare(b.month)) };
  }

  private async metersStatus(params: any) {
    const where: any = {};
    if (params.projectId) where.projectId = params.projectId;
    const meters = await this.prisma.meter.findMany({ where, orderBy: { serialNumber: 'asc' }, take: 1000 });
    const byStatus: Record<string, number> = {};
    for (const m of meters) {
      byStatus[m.status] = (byStatus[m.status] || 0) + 1;
    }
    return { total: meters.length, byStatus, meters: meters.map(m => ({ serial: m.serialNumber, type: m.meterType, status: m.status, brand: m.brand, model: m.model })) };
  }

  private async activeTariffs(params: any) {
    const tariffs = await this.prisma.tariffPlan.findMany({ where: { status: 'active' }, orderBy: { meterType: 'asc' } });
    return { tariffs: tariffs.map(t => ({ type: t.meterType, rate: t.ratePerUnit, effectiveFrom: t.effectiveFrom, effectiveTo: t.effectiveTo })) };
  }

  private async agingReport(params: any) {
    const where: any = { remainingAmount: { gt: 0 }, status: { notIn: ['draft', 'cancelled'] } };
    if (params.projectId) where.projectId = params.projectId;
    const invoices = await this.prisma.invoice.findMany({ where, orderBy: { createdAt: 'asc' } });
    const now = Date.now();
    const buckets = { '0-30': 0, '31-60': 0, '61-90': 0, '90+': 0 };
    for (const inv of invoices) {
      const days = Math.floor((now - (inv.dueAt || inv.createdAt).getTime()) / 86400000);
      const amt = Number(inv.remainingAmount);
      if (days <= 30) buckets['0-30'] += amt;
      else if (days <= 60) buckets['31-60'] += amt;
      else if (days <= 90) buckets['61-90'] += amt;
      else buckets['90+'] += amt;
    }
    return { buckets, total: Object.values(buckets).reduce((s, v) => s + v, 0) };
  }

  private async canceledInvoices(params: any) {
    const where: any = { status: 'cancelled' };
    if (params.projectId) where.projectId = params.projectId;
    const invoices = await this.prisma.invoice.findMany({ where, orderBy: { createdAt: 'desc' }, take: 500 });
    return { total: invoices.length, totalAmount: invoices.reduce((s, i) => s + Number(i.totalAmount), 0), invoices };
  }

  private async auditLog(params: any) {
    const logs = await this.prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' }, take: 200 }).catch(() => []);
    return { logs: logs.map((l: any) => ({ action: l.action || l.resourceType, entity: l.resourceType, entityId: l.resourceId, userId: l.actorId, date: l.createdAt })) };
  }

  private async waterBalance(params: any) {
    const where: any = {};
    if (params.projectId) where.projectId = params.projectId;
    const meters = await this.prisma.meter.findMany({ where: { ...where, meterType: { in: ['water_main', 'water_child'] } }, orderBy: { serialNumber: 'asc' } });
    const readings = await this.prisma.reading.findMany({ where: { meterId: { in: meters.map(m => m.id) } }, orderBy: { readingAt: 'desc' }, take: 2000 });
    const byMeter: Record<string, any> = {};
    for (const m of meters) {
      const mReadings = readings.filter(r => r.meterId === m.id);
      const lastReading = mReadings.length > 0 ? Number(mReadings[0].readingValue) : 0;
      byMeter[m.serialNumber] = { serial: m.serialNumber, type: m.meterType, status: m.status, lastReading, readingCount: mReadings.length };
    }
    return { totalMeters: meters.length, meters: byMeter };
  }

  private async solarGeneration(params: any) {
    const where: any = {};
    if (params.projectId) where.projectId = params.projectId;
    const meters = await this.prisma.meter.findMany({ where: { ...where, meterType: 'solar' }, orderBy: { serialNumber: 'asc' } });
    const readings = await this.prisma.reading.findMany({ where: { meterId: { in: meters.map(m => m.id) } }, orderBy: { readingAt: 'desc' }, take: 2000 });
    const totalGeneration = readings.reduce((s, r) => s + Number(r.readingValue), 0);
    return { totalMeters: meters.length, totalReadings: readings.length, totalGeneration, meters: meters.map(m => ({ serial: m.serialNumber, status: m.status, readings: readings.filter(r => r.meterId === m.id).length })) };
  }

  private async solarExportImport(params: any) {
    const where: any = {};
    if (params.projectId) where.projectId = params.projectId;
    const meters = await this.prisma.meter.findMany({ where: { ...where, solarEnabled: true }, orderBy: { serialNumber: 'asc' } });
    return { totalMeters: meters.length, meters: meters.map(m => ({ serial: m.serialNumber, solarEnabled: m.solarEnabled, exportMeterId: m.exportMeterId, importMeterId: m.importMeterId, generationMeterId: m.generationMeterId })) };
  }

  private async walletTransactions(params: any) {
    const txs = await this.prisma.walletTransaction.findMany({ orderBy: { createdAt: 'desc' }, take: 500, include: { account: true } }).catch(() => []);
    return { total: txs.length, totalAmount: txs.reduce((s: number, t: any) => s + Number(t.amount), 0), transactions: txs.map((t: any) => ({ id: t.id, type: t.type, amount: t.amount, account: t.account?.accountCode || '', balance: t.balanceAfter, date: t.createdAt })) };
  }

  private async walletBalance(params: any) {
    const accounts = await this.prisma.walletAccount.findMany({ orderBy: { accountCode: 'asc' } });
    return { total: accounts.length, totalBalance: accounts.reduce((s, a) => s + Number(a.balance), 0), accounts: accounts.map(a => ({ code: a.accountCode, name: a.accountName, balance: a.balance, currency: a.currency, status: a.status })) };
  }

  private async billCycleSummary(params: any) {
    const cycles = await this.prisma.billingCycle.findMany({ orderBy: { createdAt: 'desc' }, take: 50 }).catch(() => []);
    return { total: cycles.length, cycles: cycles.map((c: any) => ({ id: c.id, code: c.cycleCode || c.id.slice(0, 8), status: c.status, period: `${c.periodStart || ''} - ${c.periodEnd || ''}`, createdAt: c.createdAt })) };
  }

  private async billCycleAudit(params: any) {
    const audits = await this.prisma.billingCycleAudit.findMany({ orderBy: { performedAt: 'desc' }, take: 200 }).catch(() => []);
    return { total: audits.length, audits: audits.map((a: any) => ({ cycleId: a.cycleId, action: a.action || a.status, performedBy: a.performedBy, date: a.performedAt })) };
  }

  private async readingRegister(params: any) {
    const where: any = {};
    if (params.projectId) where.projectId = params.projectId;
    if (params.status) where.status = params.status;
    const readings = await this.prisma.reading.findMany({ where, orderBy: { readingAt: 'desc' }, take: 500 });
    return { total: readings.length, readings: readings.map(r => ({ id: r.id, meterId: r.meterId, value: r.readingValue, consumption: r.consumptionValue, date: r.readingAt, status: r.status })) };
  }

  private async readingHistory(params: any) {
    if (!params.meterId) return { error: 'meterId required' };
    const readings = await this.prisma.reading.findMany({ where: { meterId: params.meterId }, orderBy: { readingAt: 'asc' } });
    return { meterId: params.meterId, total: readings.length, readings: readings.map(r => ({ value: r.readingValue, consumption: r.consumptionValue, date: r.readingAt, status: r.status })) };
  }

  private async customerListReport(params: any) {
    const where: any = {};
    if (params.projectId) where.projectId = params.projectId;
    const customers = await this.prisma.customer.findMany({ where, orderBy: { name: 'asc' } });
    return { total: customers.length, customers: customers.map(c => ({ code: c.customerCode, name: c.name, nameAr: (c as any).nameAr || '', phone: c.phone, email: c.email, type: c.customerType, status: c.status, nationalId: c.nationalOrCommercialId, createdAt: c.createdAt })) };
  }

  private async customerAging(params: any) {
    const where: any = { remainingAmount: { gt: 0 }, status: { notIn: ['draft', 'cancelled'] } };
    if (params.projectId) where.projectId = params.projectId;
    const invoices = await this.prisma.invoice.findMany({ where, orderBy: { createdAt: 'asc' } }).catch(() => []);
    const byCustomer: Record<string, any> = {};
    for (const inv of invoices) {
      const cid = inv.customerId;
      if (!byCustomer[cid]) byCustomer[cid] = { customerId: cid, total: 0, '0-30': 0, '31-60': 0, '61-90': 0, '90+': 0 };
      const days = Math.floor((Date.now() - (inv.dueAt || inv.createdAt).getTime()) / 86400000);
      const amt = Number(inv.remainingAmount);
      byCustomer[cid].total += amt;
      if (days <= 30) byCustomer[cid]['0-30'] += amt; else if (days <= 60) byCustomer[cid]['31-60'] += amt; else if (days <= 90) byCustomer[cid]['61-90'] += amt; else byCustomer[cid]['90+'] += amt;
    }
    return { totalCustomers: Object.keys(byCustomer).length, customers: Object.values(byCustomer) };
  }

  private async chargeAnalysis(params: any) {
    const where: any = {};
    if (params.projectId) where.projectId = params.projectId;
    const invoiceIds = (await this.prisma.invoice.findMany({ where, select: { id: true } })).map(i => i.id);
    const lines = await this.prisma.invoiceLine.findMany({ where: { invoiceId: { in: invoiceIds } }, take: 2000 }).catch(() => []);
    const byGroup: Record<string, { count: number; total: number }> = {};
    for (const l of lines) {
      const g = String(l.chargeGroup ?? 0);
      if (!byGroup[g]) byGroup[g] = { count: 0, total: 0 };
      byGroup[g].count++; byGroup[g].total += Number(l.lineAmount);
    }
    return { totalLines: lines.length, groups: byGroup };
  }

  private async meterLifecycle(params: any) {
    const where: any = {};
    if (params.projectId) where.projectId = params.projectId;
    const meters = await this.prisma.meter.findMany({ where, orderBy: { serialNumber: 'asc' } });
    return { total: meters.length, meters: meters.map(m => ({ serial: m.serialNumber, type: m.meterType, status: m.status, installed: m.installationDate, activated: m.activationDate, terminated: m.terminationDate, phase: m.phaseType, amp: m.ampRating, diameter: m.diameter })) };
  }

  private async userActivity(params: any) {
    const limit = Math.min(parseInt(params.limit || '200'), 1000);
    const logs = await this.prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' }, take: limit }).catch(() => []);
    return { total: logs.length, activities: logs.map((l: any) => ({ user: l.actorId, action: l.action, resource: l.resourceType, resourceId: l.resourceId, date: l.createdAt })) };
  }

  private async failedPayments(params: any) {
    const where: any = { status: { in: ['failed', 'cancelled'] } };
    if (params.projectId) where.projectId = params.projectId;
    const payments = await this.prisma.payment.findMany({ where, orderBy: { paymentDate: 'desc' }, take: 500 });
    return { total: payments.length, amount: payments.reduce((s, p) => s + Number(p.amount), 0), payments: payments.map(p => ({ number: p.paymentNumber, method: p.method, amount: p.amount, status: p.status, date: p.paymentDate })) };
  }

  private async highConsumption(params: any) {
    const where: any = {};
    if (params.projectId) where.projectId = params.projectId;
    const readings = await this.prisma.reading.findMany({ where: { ...where, consumptionValue: { gt: 0 } }, orderBy: { consumptionValue: 'desc' }, take: 200 });
    return { total: readings.length, readings: readings.map(r => ({ meterId: r.meterId, value: r.readingValue, consumption: r.consumptionValue, date: r.readingAt })) };
  }

  private async zeroConsumption(params: any) {
    const where: any = { consumptionValue: { gte: 0 } };
    if (params.projectId) where.projectId = params.projectId;
    const readings = await this.prisma.reading.findMany({ where: { ...where, OR: [{ consumptionValue: 0 }, { consumptionValue: null }] }, orderBy: { readingAt: 'desc' }, take: 200 });
    return { total: readings.length, readings: readings.map(r => ({ meterId: r.meterId, value: r.readingValue, consumption: r.consumptionValue || 0, date: r.readingAt })) };
  }

  private async newConnections(params: any) {
    const where: any = {};
    if (params.projectId) where.projectId = params.projectId;
    const meters = await this.prisma.meter.findMany({ where: { ...where, status: 'assigned' }, orderBy: { installationDate: 'desc' }, take: 200 });
    return { total: meters.length, meters: meters.map(m => ({ serial: m.serialNumber, type: m.meterType, installed: m.installationDate })) };
  }

  private async disconnections(params: any) {
    const where: any = {};
    if (params.projectId) where.projectId = params.projectId;
    const meters = await this.prisma.meter.findMany({ where: { ...where, status: { in: ['terminated', 'retired'] } }, orderBy: { terminationDate: 'desc' }, take: 200 });
    return { total: meters.length, meters: meters.map(m => ({ serial: m.serialNumber, type: m.meterType, terminated: m.terminationDate })) };
  }

  private async suspendedAccounts(params: any) {
    const where: any = {};
    if (params.projectId) where.projectId = params.projectId;
    const customers = await this.prisma.customer.findMany({ where: { ...where, status: 'inactive' }, orderBy: { updatedAt: 'desc' } });
    return { total: customers.length, customers: customers.map(c => ({ code: c.customerCode, name: c.name, phone: c.phone, suspendedAt: c.updatedAt })) };
  }

  private async collectionEfficiency(params: any) {
    const where: any = {};
    if (params.projectId) where.projectId = params.projectId;
    const invoices = await this.prisma.invoice.findMany({ where: { ...where, status: { not: 'cancelled' } } });
    const totalInv = invoices.reduce((s, i) => s + Number(i.totalAmount), 0);
    const totalPaid = invoices.reduce((s, i) => s + Number(i.paidAmount), 0);
    const rate = totalInv > 0 ? (totalPaid / totalInv * 100) : 0;
    return { totalInvoiced: totalInv, totalCollected: totalPaid, collectionRate: rate.toFixed(1), invoiceCount: invoices.length };
  }

  private async paymentDistribution(params: any) {
    const where: any = {};
    if (params.projectId) where.projectId = params.projectId;
    const payments = await this.prisma.payment.findMany({ where, orderBy: { paymentDate: 'desc' }, take: 1000 });
    const byMethod: Record<string, { count: number; total: number }> = {};
    for (const p of payments) {
      if (!byMethod[p.method]) byMethod[p.method] = { count: 0, total: 0 };
      byMethod[p.method].count++; byMethod[p.method].total += Number(p.amount);
    }
    return { totalPayments: payments.length, totalAmount: payments.reduce((s, p) => s + Number(p.amount), 0), byMethod };
  }

  private async walletUsage(params: any) {
    const accounts = await this.prisma.walletAccount.findMany({ orderBy: { balance: 'desc' } });
    const topAccounts = accounts.slice(0, 20);
    return { total: accounts.length, totalBalance: accounts.reduce((s, a) => s + Number(a.balance), 0), topAccounts: topAccounts.map(a => ({ code: a.accountCode, name: a.accountName, balance: a.balance })) };
  }

  private async solarAdoption(params: any) {
    const where: any = {};
    if (params.projectId) where.projectId = params.projectId;
    const total = (await this.prisma.meter.findMany({ where, select: { id: true } })).length;
    const solarMeters = await this.prisma.meter.findMany({ where: { ...where, meterType: 'solar' }, select: { id: true } });
    const withWallets = await this.prisma.walletAccount.findMany({ where: { accountName: { contains: 'solar' } } }).catch(() => []);
    return { totalMeters: total, solarMeters: solarMeters.length, solarWallets: withWallets.length, adoptionRate: total > 0 ? ((solarMeters.length / total) * 100).toFixed(1) : '0' };
  }

  private async meterHealth(params: any) {
    const where: any = {};
    if (params.projectId) where.projectId = params.projectId;
    const meters = await this.prisma.meter.findMany({ where });
    const byStatus: Record<string, number> = {};
    for (const m of meters) { byStatus[m.status] = (byStatus[m.status] || 0) + 1; }
    const active = byStatus['active'] || 0;
    return { total: meters.length, active, health: meters.length > 0 ? ((active / meters.length) * 100).toFixed(1) : '0', byStatus };
  }

  private async systemConfig(params: any) {
    const settings = await this.prisma.systemSetting.findMany({ orderBy: { key: 'asc' } }).catch(() => []);
    return { total: settings.length, settings };
  }

  private async taxSummary(params: any) {
    const where: any = {};
    if (params.projectId) where.projectId = params.projectId;
    const invoices = await this.prisma.invoice.findMany({ where: { ...where, status: { not: 'cancelled' } } });
    const totalTax = invoices.reduce((s, i) => s + Number(i.taxAmount || 0), 0);
    const totalAmount = invoices.reduce((s, i) => s + Number(i.totalAmount), 0);
    return { totalInvoices: invoices.length, totalAmount, totalTax, taxRate: totalAmount > 0 ? ((totalTax / totalAmount) * 100).toFixed(2) : '0' };
  }

  private async discountSummary(params: any) {
    const where: any = {};
    if (params.projectId) where.projectId = params.projectId;
    const adjustments = await this.prisma.invoiceAdjustment.findMany({ where: { adjustmentType: 'credit' }, take: 500 }).catch(() => []);
    const totalDiscount = adjustments.reduce((s, a: any) => s + Number(a.amount), 0);
    return { total: adjustments.length, totalDiscount, adjustments: adjustments.map((a: any) => ({ invoiceId: a.invoiceId, amount: a.amount, reason: a.reason, date: a.createdAt })) };
  }

  private async billCycleDetail(params: any) {
    const cycles = await this.prisma.billingCycle.findMany({ orderBy: { createdAt: 'desc' }, take: 20 }).catch(() => []);
    const result = [];
    for (const c of cycles as any[]) {
      const invoiceCount = await this.prisma.invoice.count({ where: { billingPeriodId: (c as any).id || '' } }).catch(() => 0);
      result.push({ id: c.id, code: c.cycleCode || c.id.slice(0, 8), status: c.status, periodStart: c.periodStart, periodEnd: c.periodEnd, invoiceCount, createdAt: c.createdAt });
    }
    return { total: cycles.length, cycles: result };
  }

  private async lateFeeSummary(params: any) {
    return { note: 'Late fee tracking not yet implemented — requires late fee model', total: 0, fees: [] };
  }

  private async customerHistory(params: any) {
    const where: any = {};
    if (params.projectId) where.projectId = params.projectId;
    const logs = await this.prisma.auditLog.findMany({ where: { ...where, resourceType: 'customer' }, orderBy: { createdAt: 'desc' }, take: 500 }).catch(() => []);
    return { total: logs.length, entries: logs.map((l: any) => ({ customerId: l.resourceId, action: l.action, user: l.actorId, date: l.createdAt })) };
  }

  private async readingAnomalies(params: any) {
    const where: any = { status: { in: ['suspicious', 'pending_review'] } };
    if (params.projectId) where.projectId = params.projectId;
    const readings = await this.prisma.reading.findMany({ where, orderBy: { readingAt: 'desc' }, take: 200 });
    return { total: readings.length, readings: readings.map(r => ({ id: r.id, meterId: r.meterId, value: r.readingValue, status: r.status, date: r.readingAt })) };
  }

  private async tariffComparison(params: any) {
    const tariffs = await this.prisma.tariffPlan.findMany({ where: { status: 'active' }, orderBy: { meterType: 'asc' } }).catch(() => []);
    return { total: tariffs.length, tariffs: tariffs.map((t: any) => ({ type: t.meterType, rate: t.ratePerUnit, effectiveFrom: t.effectiveFrom, projectId: t.projectId })) };
  }

  private async settlementSummary(params: any) {
    const settlements = await this.prisma.settlementPeriod.findMany({ orderBy: { createdAt: 'desc' }, take: 50 }).catch(() => []);
    return { total: settlements.length, settlements: settlements.map((s: any) => ({ id: s.id, status: s.status, periodStart: s.periodStart, periodEnd: s.periodEnd, createdAt: s.createdAt })) };
  }
}
