import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/database/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAll() {
    const rows = await this.prisma.systemSetting.findMany();
    const result: Record<string, string> = {};
    rows.forEach((r) => { result[r.key] = r.value; });
    return result;
  }

  async get(key: string) {
    const row = await this.prisma.systemSetting.findUnique({ where: { key } });
    return row ? row.value : null;
  }

  async set(key: string, value: string) {
    return this.prisma.systemSetting.upsert({
      where: { key },
      create: { key, value },
      update: { value },
    });
  }

  async updateMultiple(data: Record<string, string>) {
    for (const [key, value] of Object.entries(data)) {
      await this.set(key, value);
    }
    return this.getAll();
  }
}
