import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/database/prisma.service';

@Injectable()
export class Customer360Service {
  constructor(private readonly prisma: PrismaService) {}

  async getCustomer360(customerId: string) {
    const customer = await this.prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) return null;

    const [invoices, payments, meters, readings, tickets] = await Promise.all([
      this.prisma.invoice.findMany({ where: { customerId }, orderBy: { createdAt: 'desc' }, take: 20 }),
      this.prisma.payment.findMany({ where: { customerId }, orderBy: { createdAt: 'desc' }, take: 20 }),
      this.prisma.meter.findMany({ where: { id: customerId }, orderBy: { createdAt: 'desc' } }),
      this.prisma.reading.findMany({ where: { meterId: customerId }, orderBy: { readingAt: 'desc' }, take: 12 }),
      this.prisma.ticket.findMany({ orderBy: { createdAt: 'desc' }, take: 10 }),
    ]);

    const totalInvoiced = invoices.reduce((s, i) => s + Number(i.totalAmount), 0);
    const totalPaid = invoices.reduce((s, i) => s + Number(i.paidAmount), 0);
    const totalOutstanding = invoices.reduce((s, i) => s + Number(i.remainingAmount), 0);

    const now = new Date();
    const aging = { current: 0, d1to30: 0, d31to60: 0, d61to90: 0, d91to120: 0, d120plus: 0 };
    invoices.filter(i => Number(i.remainingAmount) > 0).forEach(i => {
      const due = i.dueAt ?? i.createdAt;
      const days = Math.floor((now.getTime() - due.getTime()) / 86400000);
      const amt = Number(i.remainingAmount);
      if (days <= 0) aging.current += amt;
      else if (days <= 30) aging.d1to30 += amt;
      else if (days <= 60) aging.d31to60 += amt;
      else if (days <= 90) aging.d61to90 += amt;
      else if (days <= 120) aging.d91to120 += amt;
      else aging.d120plus += amt;
    });

    const collectionRate = totalInvoiced > 0 ? Math.round(totalPaid / totalInvoiced * 100) : 0;
    const openTickets = tickets.filter(t => t.status === 'open' || t.status === 'in_progress').length;
    const overdueCount = invoices.filter(i => i.status === 'overdue').length;

    // Health score
    let score = 100;
    if (aging.d120plus > 0) score -= 20;
    if (aging.d91to120 > 0) score -= 10;
    if (aging.d61to90 > 0) score -= 5;
    if (totalOutstanding > totalInvoiced * 0.5) score -= 15;
    if (overdueCount > 3) score -= 10;
    if (openTickets > 2) score -= 5;
    const health = score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Average' : score >= 20 ? 'Risk' : 'Critical';

    // AI insights (analytics only, no AI service)
    const largestOverdue = invoices.filter(i => i.status === 'overdue').sort((a, b) => Number(b.remainingAmount) - Number(a.remainingAmount))[0];
    const insights = {
      topRiskFactors: aging.d120plus > 0 ? ['Aging debt over 120 days'] : [],
      expectedPaymentProbability: Math.min(collectionRate / 100, 0.95),
      expectedCollectionAmount: totalOutstanding * (collectionRate / 100),
      largestOverdueInvoice: largestOverdue?.invoiceNumber ?? null,
      largestOverdueAmount: largestOverdue ? Number(largestOverdue.remainingAmount) : 0,
      suggestedAction: aging.d120plus > 0 ? 'Escalate to collections' : totalOutstanding > 0 ? 'Send payment reminder' : 'No action needed',
    };

    return {
      customer,
      financial: { totalInvoiced, totalPaid, totalOutstanding, collectionRate, overdueCount, openTickets },
      aging: { buckets: aging, total: Object.values(aging).reduce((s: number, v: any) => s + v, 0) },
      invoices: invoices.map(i => ({
        id: i.id, invoiceNumber: i.invoiceNumber, date: i.issuedAt ?? i.createdAt, utility: i.utilityType,
        consumption: 0, amount: Number(i.totalAmount), balance: Number(i.remainingAmount), status: i.status,
      })),
      payments: payments.map(p => ({
        id: p.id, receiptNumber: p.paymentNumber, date: p.paymentDate, method: p.method,
        amount: Number(p.amount), collector: p.collectedBy, status: p.status,
      })),
      meters: meters.map(m => ({
        id: m.id, serialNumber: m.serialNumber, meterType: m.meterType, status: m.status, lastReading: null,
      })),
      readings: readings.map(r => ({
        id: r.id, date: r.readingAt, value: Number(r.readingValue), consumption: Number(r.consumptionValue ?? 0), status: r.status,
      })),
      openItems: { invoices: invoices.filter(i => i.status === 'issued' || i.status === 'overdue').length, tickets: openTickets, overdue: overdueCount },
      health: { score, label: health },
      insights,
      timeline: [
        ...invoices.slice(0, 5).map(i => ({ date: i.createdAt, type: 'invoice', ref: i.invoiceNumber, desc: `Invoice ${i.invoiceNumber} - ${i.status}` })),
        ...payments.slice(0, 5).map(p => ({ date: p.createdAt, type: 'payment', ref: p.paymentNumber, desc: `Payment ${p.paymentNumber} - ${Number(p.amount)} EGP` })),
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    };
  }
}
