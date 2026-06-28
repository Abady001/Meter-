import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/database/prisma.service';

@Injectable()
export class UploadService {
  constructor(private readonly prisma: PrismaService) {}

  async getHistory(entityType: string) {
    return this.prisma.uploadHistory.findMany({ where: { entityType }, orderBy: { createdAt: 'desc' }, take: 50 }).catch(() => []);
  }

  async logHistory(type: string, success: number, failed: number, userId: string) {
    return this.prisma.uploadHistory.create({ data: { entityType: type, success, failed, totalRows: success + failed, fileName: type + '-import', createdBy: userId } }).catch(() => null);
  }

  async importCustomers(rows: any[], userId: string) {
    let success = 0; let failed = 0; const errors: string[] = [];
    for (const row of rows) {
      try {
        if (!row.customerCode || !row.name) { failed++; errors.push(`Row ${success + failed + 1}: Missing required fields`); continue; }
        await (this.prisma.customer.create as any)({ data: { customerCode: row.customerCode, name: row.name, phone: row.phone ?? '', email: row.email ?? '', customerType: row.customerType ?? 'individual', projectId: row.projectId, createdBy: userId, updatedBy: userId } });
        success++;
      } catch (e: any) { failed++; errors.push(`Row ${success + failed}: ${e.message}`); }
    }
    return { success, failed, errors };
  }

  async importMeters(rows: any[], userId: string) {
    let success = 0; let failed = 0; const errors: string[] = [];
    for (const row of rows) {
      try {
        if (!row.serialNumber || !row.meterType) { failed++; errors.push(`Row ${success + failed + 1}: Missing serialNumber or meterType`); continue; }
        await this.prisma.meter.create({ data: { serialNumber: row.serialNumber, meterType: row.meterType, brand: row.brand ?? '', model: row.model ?? '', projectId: row.projectId, installationDate: row.installationDate ?? new Date(), activationDate: row.activationDate ?? new Date(), createdBy: userId, updatedBy: userId } });
        success++;
      } catch (e: any) { failed++; errors.push(`Row ${success + failed}: ${e.message}`); }
    }
    return { success, failed, errors };
  }
}
