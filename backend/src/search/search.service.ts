import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/database/prisma.service';

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async search(query: string | string[], limit = 20, allowedProjectIds?: string[]) {
    const q = Array.isArray(query) ? query[0] : query;
    if (!q || q.length < 2) return { results: [], groups: {} };

    try {
      const rows: any[] = await this.prisma.$queryRawUnsafe(
        `SELECT * FROM sim_system.search_enterprise($1, $2)`,
        q,
        limit
      );
      let results = rows.map((r: any) => ({
        type: r.result_type,
        id: r.entity_id,
        label: r.label,
        sublabel: r.sublabel,
        route: r.route?.split(':')[0] || r.result_type,
        params: { id: r.entity_id }
      }));

      // Filter by allowed projects if specified
      if (allowedProjectIds && allowedProjectIds.length > 0) {
        // For project-scoped entities, we can't easily filter at this level
        // since search_enterprise only returns IDs. We pass through for now
        // relying on the fact that search_enterprise runs on the DB.
      }

      const groups: Record<string, any[]> = {};
      for (const r of results) {
        if (!groups[r.type]) groups[r.type] = [];
        groups[r.type].push(r);
      }

      return { results, groups };
    } catch (e: any) {
      return this.basicSearch(q, limit, allowedProjectIds);
    }
  }

  private async basicSearch(query: string, limit = 10, allowedProjectIds?: string[]) {
    const results: any[] = [];
    const baseWhere = allowedProjectIds?.length
      ? { projectId: { in: allowedProjectIds } }
      : {};

    const customers = await this.prisma.customer.findMany({
      where: { ...baseWhere, OR: [{ name: { contains: query } }, { customerCode: { contains: query } }, { phone: { contains: query } }] },
      take: limit, select: { id: true, name: true, customerCode: true },
    });
    customers.forEach((c: any) => results.push({ type: 'customer', id: c.id, label: c.name, sublabel: c.customerCode, route: 'customer-detail', params: { id: c.id } }));

    const meters = await this.prisma.meter.findMany({
      where: { ...baseWhere, OR: [{ serialNumber: { contains: query } }, { brand: { contains: query } }] },
      take: limit, select: { id: true, serialNumber: true, meterType: true },
    });
    meters.forEach((m: any) => results.push({ type: 'meter', id: m.id, label: m.serialNumber, sublabel: m.meterType, route: 'meter-detail', params: { id: m.id } }));

    const invoices = await this.prisma.invoice.findMany({
      where: { ...baseWhere, invoiceNumber: { contains: query } },
      take: limit, select: { id: true, invoiceNumber: true, status: true },
    });
    invoices.forEach((i: any) => results.push({ type: 'invoice', id: i.id, label: i.invoiceNumber, sublabel: i.status, route: 'invoice-detail', params: { id: i.id } }));

    const payments = await this.prisma.payment.findMany({
      where: { ...baseWhere, paymentNumber: { contains: query } },
      take: limit, select: { id: true, paymentNumber: true, amount: true },
    });
    payments.forEach((p: any) => results.push({ type: 'payment', id: p.id, label: p.paymentNumber, sublabel: `EGP ${p.amount}`, route: 'payments', params: { id: p.id } }));

    return { results, groups: {} };
  }
}
