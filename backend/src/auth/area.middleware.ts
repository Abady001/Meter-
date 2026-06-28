import { Injectable, NestMiddleware, ForbiddenException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtPayload } from './interfaces';

@Injectable()
export class AreaMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction): void {
    const user = (req as any).user as JwtPayload | undefined;

    if (!user) {
      next();
      return;
    }

    const requestedArea = req.headers['x-area-id'] as string | undefined;
    const userAreas = (user as any).areas as string[] | undefined;

    if (requestedArea && userAreas && userAreas.length > 0) {
      const hasAccess = userAreas.includes(requestedArea);
      if (!hasAccess) {
        throw new ForbiddenException(`Access denied for area: ${requestedArea}`);
      }
      (req as any).areaId = requestedArea;
    }

    next();
  }
}
