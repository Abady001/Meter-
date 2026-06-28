import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/database/prisma.service';

@Injectable()
export class TicketsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() { return this.prisma.ticket.findMany({ orderBy: { createdAt: 'desc' } }); }
  findOne(id: string) { return this.prisma.ticket.findUnique({ where: { id } }); }
  create(data: { title: string; description?: string; priority?: string; category?: string; createdBy: string }) {
    return this.prisma.ticket.create({ data: { ...data, createdBy: data.createdBy } });
  }
  update(id: string, data: { title?: string; description?: string; status?: string; priority?: string; category?: string; assignedTo?: string }) {
    const updateData: any = { ...data };
    if (data.status === 'resolved' || data.status === 'closed') updateData.resolvedAt = new Date();
    return this.prisma.ticket.update({ where: { id }, data: updateData });
  }
  remove(id: string) { return this.prisma.ticket.delete({ where: { id } }); }
  addComment(ticketId: string, body: string, authorId: string) {
    return this.prisma.ticketComment.create({ data: { ticketId, body, authorId } });
  }
  getComments(ticketId: string) {
    return this.prisma.ticketComment.findMany({ where: { ticketId }, orderBy: { createdAt: 'asc' } });
  }
}
