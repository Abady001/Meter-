import { Injectable, NestMiddleware } from '@nestjs/common';
import { Response, NextFunction } from 'express';
import { UserAccessService } from './user-access.service';

@Injectable()
export class AccessContextMiddleware implements NestMiddleware {
  constructor(private readonly userAccess: UserAccessService) {}

  async use(req: any, res: Response, next: NextFunction) {
    if (req.user && req.user.userId) {
      try {
        req.userAccess = await this.userAccess.resolveAccess(req.user.userId, req.user.role);
      } catch {
        req.userAccess = null;
      }
    }
    next();
  }
}
