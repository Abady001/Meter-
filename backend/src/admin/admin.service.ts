import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../common/database/prisma.service';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);
  constructor(private readonly prisma: PrismaService) {}

  async getTableData(tableName: string, limit = 50, offset = 0) {
    const allowed = ['customer', 'project', 'meter', 'reading', 'invoice', 'invoice_line', 'payment', 'payment_allocation', 'tariff_plan', 'unit', 'billing_period', 'customer_ledger_entry', 'settlement', 'sim_system.Customer', 'sim_system.Meter', 'sim_system.Invoice', 'sim_system.Payment'];
    const tbl = tableName.toLowerCase().replace(/['"]/g, '');
    if (!allowed.some(a => tbl.includes(a.toLowerCase()))) return { error: 'Table not allowed' };
    try {
      const data = await this.prisma.$queryRawUnsafe(`SELECT * FROM sim_system."${tbl.includes('.') ? tbl.split('.')[1] : tbl}" LIMIT ${limit} OFFSET ${offset}`);
      return { data, count: Array.isArray(data) ? data.length : 0 };
    } catch (e: any) { return { error: e.message }; }
  }

  async getDependencies(table: string, recordId: string) {
    const checks: { table: string; field: string; records: any[] }[] = [];
    const refMap: Record<string, { table: string; field: string }[]> = {
      customer: [
        { table: 'sim_system.meters', field: 'id' },
        { table: 'sim_system.invoices', field: 'customer_id' },
        { table: 'sim_system.payments', field: 'customer_id' },
        { table: 'sim_system.customer_ledger_entries', field: 'customer_id' },
      ],
      meter: [
        { table: 'sim_system.readings', field: 'meter_id' },
        { table: 'sim_system.invoices', field: 'meter_id' },
        { table: 'sim_system.meter_assignments', field: 'meter_id' },
      ],
      invoice: [
        { table: 'sim_system.invoice_lines', field: 'invoice_id' },
        { table: 'sim_system.payment_allocations', field: 'invoice_id' },
        { table: 'sim_system.invoice_adjustments', field: 'invoice_id' },
      ],
    };

    const refs = refMap[table.toLowerCase()] || [];
    for (const ref of refs) {
      try {
        const rows = await this.prisma.$queryRawUnsafe(`SELECT id FROM ${ref.table} WHERE ${ref.field} = '${recordId}' LIMIT 10`);
        if (Array.isArray(rows) && rows.length > 0) {
          checks.push({ table: ref.table, field: ref.field, records: rows });
        }
      } catch {}
    }
    return { hasDependencies: checks.length > 0, dependencies: checks };
  }

  async insertRecord(table: string, data: Record<string, any>) {
    const cols = Object.keys(data).map(k => `"${k}"`).join(', ');
    const vals = Object.values(data).map(v => typeof v === 'string' ? `'${v.replace(/'/g, "''")}'` : v).join(', ');
    const sql = `INSERT INTO sim_system."${table}" (${cols}) VALUES (${vals}) RETURNING *`;
    try {
      const result = await this.prisma.$queryRawUnsafe(sql);
      return { success: true, record: Array.isArray(result) ? result[0] : result };
    } catch (e: any) { return { error: e.message }; }
  }

  async updateRecord(table: string, id: string, data: Record<string, any>) {
    const sets = Object.entries(data).map(([k, v]) => `"${k}" = ${typeof v === 'string' ? `'${v.replace(/'/g, "''")}'` : v}`).join(', ');
    const sql = `UPDATE sim_system."${table}" SET ${sets} WHERE id = '${id}' RETURNING *`;
    try {
      const result = await this.prisma.$queryRawUnsafe(sql);
      return { success: true, record: Array.isArray(result) ? result[0] : result };
    } catch (e: any) { return { error: e.message }; }
  }

  async deleteRecord(table: string, id: string) {
    const depCheck = await this.getDependencies(table, id);
    if (depCheck.hasDependencies) return { error: 'Cannot delete: record has dependencies', dependencies: depCheck.dependencies };
    try {
      await this.prisma.$executeRawUnsafe(`DELETE FROM sim_system."${table}" WHERE id = '${id}'`);
      return { success: true };
    } catch (e: any) { return { error: e.message }; }
  }
}
