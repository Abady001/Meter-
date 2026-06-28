import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../common/database/prisma.service';

export interface UserAccess {
  userId: string;
  role: string;
  areas: string[];
  projects: string[];
  isSuperAdmin: boolean;
}

@Injectable()
export class UserAccessService {
  private readonly logger = new Logger(UserAccessService.name);
  constructor(private readonly prisma: PrismaService) {}

  async resolveAccess(userId: string, role: string): Promise<UserAccess> {
    const isSuperAdmin = role === 'super_admin';

    if (isSuperAdmin) {
      const areas = (await this.prisma.coreArea.findMany({ select: { id: true } })).map(a => a.id);
      const projects = (await this.prisma.coreProject.findMany({ select: { id: true } })).map(p => p.id);
      return { userId, role, areas, projects, isSuperAdmin: true };
    }

    // Resolve user's assigned areas from role assignments
    const assignments = await this.prisma.coreUserRoleAssignment.findMany({
      where: { userId },
      include: { role: true }
    });

    const areaSet = new Set<string>();
    assignments.forEach(a => { if (a.areaId) areaSet.add(a.areaId); });
    const areas = Array.from(areaSet);

    // Resolve projects in those areas
    const projects = areas.length > 0
      ? (await this.prisma.coreProject.findMany({
          where: { areaId: { in: areas }, isActive: true },
          select: { id: true }
        })).map(p => p.id)
      : [];

    return { userId, role, areas, projects, isSuperAdmin: false };
  }

  async resolveProjects(areaIds: string[]): Promise<string[]> {
    if (areaIds.length === 0) return [];
    return (await this.prisma.coreProject.findMany({
      where: { areaId: { in: areaIds }, isActive: true },
      select: { id: true }
    })).map(p => p.id);
  }

  hasProjectAccess(access: UserAccess, projectId: string): boolean {
    if (access.isSuperAdmin) return true;
    return access.projects.includes(projectId);
  }

  hasAreaAccess(access: UserAccess, areaId: string): boolean {
    if (access.isSuperAdmin) return true;
    return access.areas.includes(areaId);
  }

  async requireProjectAccess(userId: string, role: string, projectId: string): Promise<void> {
    const access = await this.resolveAccess(userId, role);
    if (!this.hasProjectAccess(access, projectId)) {
      throw new Error(`Access denied for project: ${projectId}`);
    }
  }
}
