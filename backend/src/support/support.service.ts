import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/database/prisma.service';

@Injectable()
export class SupportService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() { return this.prisma.supportRequest.findMany({ orderBy: { createdAt: 'desc' } }); }
  findOne(id: string) { return this.prisma.supportRequest.findUnique({ where: { id } }); }
  create(data: { subject: string; description?: string; priority?: string; customerId?: string; createdBy: string }) {
    return this.prisma.supportRequest.create({ data: { ...data, createdBy: data.createdBy } });
  }
  update(id: string, data: { subject?: string; description?: string; status?: string; priority?: string; assignedTo?: string }) {
    const updateData: any = { ...data };
    if (data.status === 'resolved' || data.status === 'closed') updateData.resolvedAt = new Date();
    return this.prisma.supportRequest.update({ where: { id }, data: updateData });
  }
  remove(id: string) { return this.prisma.supportRequest.delete({ where: { id } }); }
}
