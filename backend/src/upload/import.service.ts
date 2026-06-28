import { Injectable, Logger } from '@nestjs/common';
import * as XLSX from 'xlsx';
import { PrismaService } from '../common/database/prisma.service';

@Injectable()
export class ImportService {
  private readonly logger = new Logger(ImportService.name);
  constructor(private readonly prisma: PrismaService) {}

  async processImport(type: string, fileBuffer: Buffer, projectId: string, userId = 'system'): Promise<{ success: number; failed: number; errors: string[] }> {
    const wb = XLSX.read(fileBuffer, { type: 'buffer' });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows: any[] = XLSX.utils.sheet_to_json(ws, { defval: '' });
    let success = 0, failed = 0;
    const errors: string[] = [];

    for (let i = 0; i < rows.length; i++) {
      try {
        const row = rows[i];
        switch (type) {
          case 'readings': await this.importReading(row, projectId, userId); break;
          case 'solar-readings': await this.importSolarReading(row, projectId, userId); break;
          case 'meters': await this.importMeter(row, projectId, userId); break;
          case 'customers': await this.importCustomer(row, projectId, userId); break;
          case 'payments': await this.importPayment(row, projectId, userId); break;
          case 'settlements': await this.importSettlement(row, projectId, userId); break;
          case 'sim-cards': await this.importSimCard(row, projectId, userId); break;
          case 'delete-readings': await this.deleteReading(row, projectId); break;
          case 'migration': await this.importMigration(row, projectId, userId); break;
          default: throw new Error('Unknown import type: ' + type);
        }
        success++;
      } catch (e: any) {
        failed++;
        errors.push(`Row ${i + 2}: ${e.message}`);
      }
    }
    return { success, failed, errors };
  }

  private async importReading(row: any, projectId: string, userId: string) {
    const serial = String(row['Meter Serial'] || '').trim();
    if (!serial) throw new Error('Missing Meter Serial');
    const meter = await this.prisma.meter.findFirst({ where: { serialNumber: serial, projectId } });
    if (!meter) throw new Error(`Meter not found: ${serial}`);
    const readingValue = parseFloat(row['Reading Value']) || 0;
    const rawDate = String(row['Reading Date (dd-MM-yyyy)'] || '');
    const parts = rawDate.split('-');
    const readingAt = parts.length === 3 ? new Date(`${parts[2]}-${parts[1]}-${parts[0]}`) : new Date();
    await this.prisma.$executeRaw`INSERT INTO sim_system.readings (id, meter_id, project_id, customer_id_snapshot, unit_id_snapshot, reading_value, reading_at, source, status, created_at, updated_at) VALUES (gen_random_uuid(), ${meter.id}, ${projectId}, '', '', ${readingValue}, ${readingAt}, 'import', 'valid', NOW(), NOW())`;
  }

  private async importSolarReading(row: any, projectId: string, userId: string) {
    const serial = String(row['Meter Serial'] || '').trim();
    if (!serial) throw new Error('Missing Meter Serial');
    const meter = await this.prisma.meter.findFirst({ where: { serialNumber: serial, projectId } });
    if (!meter) throw new Error(`Meter not found: ${serial}`);
    const rawDate = String(row['Reading Date (dd-MM-yyyy)'] || '');
    const parts = rawDate.split('-');
    const readingAt = parts.length === 3 ? new Date(`${parts[2]}-${parts[1]}-${parts[0]}`) : new Date();
    const v = (parseFloat(row['1.8.0']) || 0) + (parseFloat(row['2.8.0']) || 0);
    await this.prisma.$executeRaw`INSERT INTO sim_system.readings (id, meter_id, project_id, customer_id_snapshot, unit_id_snapshot, reading_value, reading_at, source, status, created_at, updated_at) VALUES (gen_random_uuid(), ${meter.id}, ${projectId}, '', '', ${v}, ${readingAt}, 'import', 'valid', NOW(), NOW())`;
  }

  private async importMeter(row: any, projectId: string, userId: string) {
    const serial = String(row['Meter Serial'] || '').trim();
    if (!serial) throw new Error('Missing Meter Serial');
    const existing = await this.prisma.$executeRaw`SELECT 1 FROM sim_system.meters WHERE serial_number = ${serial}`;
    if (existing) throw new Error(`Meter already exists: ${serial}`);
    const type = (row['Meter Type'] || 'electricity').toLowerCase();
    await this.prisma.$executeRaw`INSERT INTO sim_system.meters (id, serial_number, meter_type, brand, model, status, project_id, installation_date, activation_date, created_at, updated_at, created_by, updated_by) VALUES (gen_random_uuid(), ${serial}, ${type}::sim_system.meter_type, ${row['Meter Name'] || ''}, ${row['Meter Model'] || ''}, 'active', ${projectId}, NOW(), NOW(), NOW(), NOW(), ${userId}, ${userId})`;
  }

  private async importCustomer(row: any, projectId: string, userId: string) {
    const name = String(row['Arabic Name'] || row['English Name'] || '').trim();
    if (!name) throw new Error('Missing customer name');
    const code = `CUS-${Date.now().toString(36).slice(-4)}`;
    const type = (row['Account Type'] || '').toLowerCase() === 'company' ? 'company' : 'individual';
    await this.prisma.$executeRaw`INSERT INTO sim_system.customers (id, customer_code, name, phone, email, customer_type, project_id, status, created_at, updated_at, created_by, updated_by) VALUES (gen_random_uuid(), ${code}, ${name}, ${String(row['Phone'] || '')}, ${String(row['Email'] || '')}, ${type}::sim_system.customer_type, ${projectId}, 'active', NOW(), NOW(), ${userId}, ${userId})`;
  }

  private async importPayment(row: any, projectId: string, userId: string) {
    const serial = String(row['Meter Serial'] || '').trim();
    const amount = parseFloat(row['Amount']) || 0;
    if (!serial || amount <= 0) throw new Error('Invalid payment data');
    const meter = await this.prisma.meter.findFirst({ where: { serialNumber: serial, projectId } });
    if (!meter) throw new Error(`Meter not found: ${serial}`);
    const pn = `PAY-${Date.now().toString(36).slice(-6)}`;
    await this.prisma.$executeRaw`INSERT INTO sim_system.payments (id, payment_number, project_id, customer_id, payment_date, method, amount, status, collected_by, created_at, updated_at) VALUES (gen_random_uuid(), ${pn}, ${projectId}, ${projectId}, NOW(), 'cash', ${amount}, 'confirmed', ${userId}, NOW(), NOW())`;
  }

  private async importSettlement(row: any, projectId: string, userId: string) {
    const serial = String(row['Meter Serial'] || '').trim();
    if (!serial) throw new Error('Missing Meter Serial');
    const meter = await this.prisma.meter.findFirst({ where: { serialNumber: serial, projectId } });
    if (!meter) throw new Error(`Meter not found: ${serial}`);
    const inv = await this.prisma.invoice.findFirst({ where: { meterId: meter.id }, orderBy: { createdAt: 'desc' } });
    if (inv) {
      const amt = parseFloat(row['Total Amount']) || 0;
      await this.prisma.$executeRaw`INSERT INTO sim_system.invoice_adjustments (id, invoice_id, adjustment_type, amount, reason, created_by, created_at) VALUES (gen_random_uuid(), ${inv.id}, 'debit', ${amt}, ${row['Notes'] || 'Settlement import'}, ${userId}, NOW())`;
    }
  }

  private async importSimCard(row: any, projectId: string, userId: string) {
    const iccid = String(row['IMES Serial'] || row['IMEI'] || '').trim();
    if (!iccid) throw new Error('Missing ICCID');
    const existing = await this.prisma.$executeRaw`SELECT 1 FROM sim_system.sim_cards WHERE iccid = ${iccid}`;
    if (existing) throw new Error(`SIM already exists: ${iccid}`);
    const phone = String(row['Phone Number'] || '');
    const prov = String(row['service provider'] || '');
    const ip = String(row['IP'] || '');
    await this.prisma.$executeRaw`INSERT INTO sim_system.sim_cards (id, iccid, msisdn, provider, ip_address, ip_type, status, created_at, updated_at, created_by, updated_by) VALUES (gen_random_uuid(), ${iccid}, ${phone}, ${prov}, ${ip}, 'static', 'available', NOW(), NOW(), ${userId}, ${userId})`;
  }

  private async deleteReading(row: any, projectId: string) {
    const serial = String(row['Meter Serial'] || '').trim();
    if (!serial) throw new Error('Missing Meter Serial');
    const meter = await this.prisma.meter.findFirst({ where: { serialNumber: serial, projectId } });
    if (!meter) throw new Error(`Meter not found: ${serial}`);
    const rawDate = String(row['Reading Date (yyyy-MM-dd)'] || '');
    if (rawDate) await this.prisma.$executeRaw`DELETE FROM sim_system.readings WHERE meter_id = ${meter.id} AND reading_at = ${new Date(rawDate)}`;
  }

  private async importMigration(row: any, projectId: string, userId: string) {
    const serial = String(row['SerialNo'] || '').trim();
    if (!serial) throw new Error('Missing SerialNo');
    let existing = await this.prisma.$executeRaw`SELECT id FROM sim_system.meters WHERE serial_number = ${serial}`;
    if (!existing) {
      await this.prisma.$executeRaw`INSERT INTO sim_system.meters (id, serial_number, meter_type, brand, model, status, project_id, installation_date, activation_date, created_at, updated_at, created_by, updated_by) VALUES (gen_random_uuid(), ${serial}, 'electricity'::sim_system.meter_type, '', '', 'active', ${projectId}, NOW(), NOW(), NOW(), NOW(), ${userId}, ${userId})`;
    }
    const meter = await this.prisma.meter.findFirst({ where: { serialNumber: serial, projectId } });
    if (!meter) throw new Error('Failed to create meter');
    const monthlyCols = Object.keys(row).filter(k => /^\d{4}-\d{1,2}$/.test(k));
    for (const col of monthlyCols) {
      const val = parseFloat(row[col]);
      if (val && val > 0) {
        const [y, m] = col.split('-');
        const d = new Date(parseInt(y), parseInt(m) - 1, 15);
        await this.prisma.$executeRaw`INSERT INTO sim_system.readings (id, meter_id, project_id, customer_id_snapshot, unit_id_snapshot, reading_value, reading_at, source, status, created_at, updated_at) VALUES (gen_random_uuid(), ${meter.id}, ${projectId}, '', '', ${val}, ${d}, 'import', 'valid', NOW(), NOW())`;
      }
    }
  }
}
