import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Request } from 'express';
import { JwtPayload } from './interfaces';
import { UserAccessService } from './user-access.service';
import { PrismaService } from '../common/database/prisma.service';

@Injectable()
export class AreaGuard implements CanActivate {
  constructor(
    private readonly userAccess: UserAccessService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request & { user?: JwtPayload; userAccess?: any; areaId?: string }>();
    const user = request.user;

    if (!user) return true;

    let access = request.userAccess;
    if (!access) {
      access = await this.userAccess.resolveAccess(user.userId || user.sub, user.role);
      request.userAccess = access;
    }

    const requestedArea = request.headers['x-area-id'] as string | undefined;

    if (requestedArea) {
      // Resolve areaCode (e.g. AREA-1) or area name to UUID
      let areaUuid = requestedArea;
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(requestedArea);
      if (!isUuid) {
        const areaRec = await this.prisma.coreArea.findFirst({
          where: { OR: [{ areaCode: requestedArea }, { areaName: requestedArea }] },
        });
        if (areaRec) areaUuid = areaRec.id;
      }

      const hasAccess = access.isSuperAdmin || access.areas?.includes(areaUuid);
      if (!hasAccess) throw new ForbiddenException(`Access denied for area: ${requestedArea}`);
      request.areaId = areaUuid;
    }

    return true;
  }
}
