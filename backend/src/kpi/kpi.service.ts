import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../common/database/prisma.service';

@Injectable()
export class KpiService {
  private readonly logger = new Logger(KpiService.name);
  constructor(private readonly prisma: PrismaService) {}

  async getExecutiveKpis(projectId?: string) {
    const where: any = {};
    if (projectId) where.projectId = projectId;

    const invoices = await this.prisma.invoice.findMany({ where: { ...where, status: { not: 'cancelled' } }, orderBy: { createdAt: 'desc' } });
    const allInvoices = await this.prisma.invoice.findMany({ where });
    const payments = await this.prisma.payment.findMany({ where });
    const meters = await this.prisma.meter.findMany({ where });
    const customers = await this.prisma.customer.findMany({ where });
    const readings = await this.prisma.reading.findMany({ where, orderBy: { readingAt: 'desc' }, take: 1000 });

    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisYear = new Date(now.getFullYear(), 0, 1);

    // Revenue
    const totalInvoiced = invoices.reduce((s, i) => s + Number(i.totalAmount), 0);
    const totalPaid = invoices.reduce((s, i) => s + Number(i.paidAmount), 0);
    const totalOpen = invoices.reduce((s, i) => s + Number(i.remainingAmount), 0);
    const monthlyRevenue = invoices.filter(i => i.createdAt >= thisMonth).reduce((s, i) => s + Number(i.totalAmount), 0);
    const monthlyPaid = invoices.filter(i => i.createdAt >= thisMonth).reduce((s, i) => s + Number(i.paidAmount), 0);
    const annualRevenue = invoices.filter(i => i.createdAt >= thisYear).reduce((s, i) => s + Number(i.totalAmount), 0);
    const collectionRate = totalInvoiced > 0 ? (totalPaid / totalInvoiced * 100) : 0;
    const recoveryRate = totalOpen > 0 ? (totalPaid / (totalOpen + totalPaid) * 100) : 0;
    const totalPayments = payments.reduce((s, p) => s + Number(p.amount), 0);

    // Previous month for growth
    const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthPaid = invoices.filter(i => i.createdAt >= prevMonth && i.createdAt < thisMonth).reduce((s, i) => s + Number(i.paidAmount), 0);
    const revenueGrowth = prevMonthPaid > 0 ? ((monthlyPaid - prevMonthPaid) / prevMonthPaid * 100) : 0;

    // Billing
    const invoicesGenerated = allInvoices.length;
    const invoicesPaid = allInvoices.filter(i => i.status === 'paid').length;
    const invoicesUnpaid = allInvoices.filter(i => i.status === 'issued' || i.status === 'partially_paid').length;
    const overdueInvoices = allInvoices.filter(i => i.dueAt && i.dueAt < now && Number(i.remainingAmount) > 0).length;
    const cancelledInvoices = allInvoices.filter(i => i.status === 'cancelled').length;

    // Customers
    const activeCustomers = customers.filter(c => c.status === 'active').length;
    const inactiveCustomers = customers.filter(c => c.status === 'inactive').length;
    const totalConsumption = readings.reduce((s, r) => s + Number(r.readingValue), 0);

    // High consumption (top 10% of readings)
    const sortedReadings = [...readings].sort((a, b) => Number(b.readingValue) - Number(a.readingValue));
    const thresholdIdx = Math.floor(readings.length * 0.1);
    const consumptionThreshold = readings.length > 0 && thresholdIdx < sortedReadings.length ? Number(sortedReadings[thresholdIdx].readingValue) : 0;
    const highConsumptionCustomers = readings.filter(r => Number(r.readingValue) >= consumptionThreshold).length;

    // Meters
    const activeMeters = meters.filter(m => m.status === 'active').length;
    const electricityMeters = meters.filter(m => m.meterType === 'electricity').length;
    const waterMeters = meters.filter(m => m.meterType === 'water_main' || m.meterType === 'water_child').length;
    const solarMeters = meters.filter(m => m.meterType === 'solar').length;
    const chilledWaterMeters = meters.filter(m => m.meterType === 'chilled_water').length;
    const phase1ph = meters.filter(m => m.phaseType === '1PH').length;
    const phase3ph = meters.filter(m => m.phaseType === '3PH').length;
    const disconnectedMeters = meters.filter(m => m.status === 'offline' || m.status === 'faulty').length;

    // Project performance
    const projectMetrics: any[] = [];
    const projectIds = [...new Set([...invoices.map(i => i.projectId), ...payments.map(p => p.projectId)])];
    for (const pid of projectIds) {
      const projInvoices = invoices.filter(i => i.projectId === pid);
      const projPayments = payments.filter(p => p.projectId === pid);
      const projTotal = projInvoices.reduce((s, i) => s + Number(i.totalAmount), 0);
      const projPaid = projInvoices.reduce((s, i) => s + Number(i.paidAmount), 0);
      const projOpen = projInvoices.reduce((s, i) => s + Number(i.remainingAmount), 0);
      const projCollectionRate = projTotal > 0 ? (projPaid / projTotal * 100) : 0;
      const projCusts = customers.filter(c => c.projectId === pid).length;
      projectMetrics.push({ projectId: pid, total: projTotal, paid: projPaid, open: projOpen, collectionRate: projCollectionRate.toFixed(1), customers: projCusts });
    }

    return {
      revenue: {
        totalInvoiced, totalPaid, totalOpen, monthlyRevenue, annualRevenue,
        collectionRate: collectionRate.toFixed(1), recoveryRate: recoveryRate.toFixed(1),
        revenueGrowth: revenueGrowth.toFixed(1), totalPayments, monthlyPaid
      },
      billing: {
        invoicesGenerated, invoicesPaid, invoicesUnpaid, overdueInvoices,
        cancelledInvoices, postedInvoices: invoices.filter(i => i.status === 'issued').length,
        failedInvoices: 0
      },
      customers: {
        total: customers.length, active: activeCustomers, inactive: inactiveCustomers,
        newCustomers: customers.filter(c => c.createdAt >= thisMonth).length,
        highConsumption: highConsumptionCustomers,
        delinquent: customers.filter(c => c.status === 'active').filter(c => {
          const custInvoices = invoices.filter(i => i.customerId === c.id && Number(i.remainingAmount) > 0);
          return custInvoices.length > 0;
        }).length
      },
      meters: {
        total: meters.length, active: activeMeters, electricity: electricityMeters,
        water: waterMeters, solar: solarMeters, chilledWater: chilledWaterMeters,
        phase1ph, phase3ph, disconnected: disconnectedMeters,
        health: activeMeters > 0 ? ((activeMeters / meters.length) * 100).toFixed(1) : '0'
      },
      projects: projectMetrics.sort((a, b) => b.total - a.total),
      consumption: { total: totalConsumption, readings: readings.length }
    };
  }

  async getCollectionKpis(projectId?: string) {
    const where: any = {};
    if (projectId) where.projectId = projectId;

    const invoices = await this.prisma.invoice.findMany({ where: { ...where, status: { not: 'cancelled' } } });
    const payments = await this.prisma.payment.findMany({ where, orderBy: { paymentDate: 'desc' } });

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisYear = new Date(now.getFullYear(), 0, 1);

    const collectedToday = payments.filter(p => p.paymentDate >= today).reduce((s, p) => s + Number(p.amount), 0);
    const collectedThisMonth = payments.filter(p => p.paymentDate >= thisMonth).reduce((s, p) => s + Number(p.amount), 0);
    const collectedThisYear = payments.filter(p => p.paymentDate >= thisYear).reduce((s, p) => s + Number(p.amount), 0);

    const totalOpen = invoices.filter(i => Number(i.remainingAmount) > 0).reduce((s, i) => s + Number(i.remainingAmount), 0);
    const totalInvoiced = invoices.reduce((s, i) => s + Number(i.totalAmount), 0);
    const totalPaid = invoices.reduce((s, i) => s + Number(i.paidAmount), 0);
    const collectionRate = totalInvoiced > 0 ? (totalPaid / totalInvoiced * 100) : 0;
    const recoveryRate = totalOpen > 0 ? (totalPaid / (totalOpen + totalPaid) * 100) : 0;

    const overdueBalance = invoices.filter(i => i.dueAt && i.dueAt < today && Number(i.remainingAmount) > 0)
      .reduce((s, i) => s + Number(i.remainingAmount), 0);

    const overdueInvoices = invoices.filter(i => i.issuedAt && Number(i.remainingAmount) > 0);
    const nowMs = Date.now();
    const buckets = { '0-30': 0, '31-60': 0, '61-90': 0, '90+': 0 };
    for (const inv of overdueInvoices) {
      const days = Math.floor((nowMs - inv.issuedAt!.getTime()) / 86400000);
      const amt = Number(inv.remainingAmount);
      if (days <= 30) buckets['0-30'] += amt;
      else if (days <= 60) buckets['31-60'] += amt;
      else if (days <= 90) buckets['61-90'] += amt;
      else buckets['90+'] += amt;
    }

    return {
      collectedToday, collectedThisMonth, collectedThisYear,
      collectionRate: collectionRate.toFixed(1), recoveryRate: recoveryRate.toFixed(1),
      totalOpen, overdueBalance, paymentCount: payments.length,
      aging: buckets
    };
  }

  async getUtilityKpis(projectId?: string) {
    const where: any = {};
    if (projectId) where.projectId = projectId;

    const invoices = await this.prisma.invoice.findMany({ where: { ...where, status: { not: 'cancelled' } } });
    const meters = await this.prisma.meter.findMany({ where });
    const readings = await this.prisma.reading.findMany({ where, orderBy: { readingAt: 'desc' }, take: 5000 });

    const byUtility: Record<string, { count: number; total: number; paid: number; open: number }> = {};
    for (const inv of invoices) {
      const u = inv.utilityType || 'unknown';
      if (!byUtility[u]) byUtility[u] = { count: 0, total: 0, paid: 0, open: 0 };
      byUtility[u].count++;
      byUtility[u].total += Number(inv.totalAmount);
      byUtility[u].paid += Number(inv.paidAmount);
      byUtility[u].open += Number(inv.remainingAmount);
    }

    const byMeterType: Record<string, { total: number; active: number; readings: number; consumption: number }> = {};
    for (const m of meters) {
      const t = m.meterType || 'unknown';
      if (!byMeterType[t]) byMeterType[t] = { total: 0, active: 0, readings: 0, consumption: 0 };
      byMeterType[t].total++;
      if (m.status === 'active') byMeterType[t].active++;
    }

    // Meter-type consumption from readings
    for (const r of readings) {
      const meter = meters.find(m => m.id === r.meterId);
      const t = meter?.meterType || 'unknown';
      if (!byMeterType[t]) byMeterType[t] = { total: 0, active: 0, readings: 0, consumption: 0 };
      byMeterType[t].readings++;
      byMeterType[t].consumption += Number(r.readingValue || 0);
    }

    return { utilities: byUtility, meters: byMeterType };
  }
}
