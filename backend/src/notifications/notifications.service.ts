import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/database/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string, options?: { page?: number; limit?: number; unreadOnly?: boolean; category?: string; areaId?: string }) {
    const page = options?.page ?? 1;
    const limit = options?.limit ?? 50;
    const where: any = { userId };
    if (options?.unreadOnly) where.isRead = false;
    if (options?.category) where.type = options.category;

    const [items, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.notification.count({ where }),
    ]);
    return { items, total, page, limit };
  }

  async getCategories(userId: string) {
    const items = await this.prisma.notification.findMany({
      where: { userId },
      select: { type: true, isRead: true },
    });
    const categories: Record<string, { total: number; unread: number }> = {};
    for (const n of items) {
      const cat = n.type || 'info';
      if (!categories[cat]) categories[cat] = { total: 0, unread: 0 };
      categories[cat].total++;
      if (!n.isRead) categories[cat].unread++;
    }
    return categories;
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.prisma.notification.count({ where: { userId, isRead: false } });
  }

  async markRead(id: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true, readAt: new Date() },
    });
  }

  async markAllRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
  }

  async remove(id: string, userId: string) {
    return this.prisma.notification.deleteMany({ where: { id, userId } });
  }

  async create(data: { userId: string; title: string; body?: string; type?: string; referenceType?: string; referenceId?: string }) {
    return this.prisma.notification.create({ data: data as any });
  }
}
