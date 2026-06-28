import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/database/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() { return this.prisma.reportTemplate.findMany({ orderBy: { createdAt: 'desc' } }); }
  findOne(id: string) { return this.prisma.reportTemplate.findUnique({ where: { id } }); }
  create(data: { name: string; category: string; description?: string; config?: string; createdBy: string }) {
    return this.prisma.reportTemplate.create({ data: { ...data, createdBy: data.createdBy } });
  }
  update(id: string, data: { name?: string; category?: string; description?: string; config?: string }) {
    return this.prisma.reportTemplate.update({ where: { id }, data });
  }
  remove(id: string) { return this.prisma.reportTemplate.delete({ where: { id } }); }
}
