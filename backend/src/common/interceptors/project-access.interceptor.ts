import { Injectable, NestInterceptor, ExecutionContext, CallHandler, ForbiddenException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { UserAccessService } from '../../auth/user-access.service';

@Injectable()
export class ProjectAccessInterceptor implements NestInterceptor {
  constructor(private readonly userAccess: UserAccessService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest<any>();
    const user = request.user;
    
    // Skip if no user (public endpoint) or super_admin
    if (!user || user.role === 'super_admin') {
      return next.handle();
    }

    // Extract projectId from various locations
    const projectId = request.params?.projectId 
      || request.query?.projectId 
      || request.body?.projectId 
      || request.headers?.['x-project-id'];

    if (!projectId) {
      return next.handle();
    }

    // Validate access
    try {
      const access = await this.userAccess.resolveAccess(user.userId, user.role);
      if (!this.userAccess.hasProjectAccess(access, projectId)) {
        throw new ForbiddenException(`Access denied for project: ${projectId}`);
      }
      request.userAccess = access;
    } catch (e: any) {
      if (e instanceof ForbiddenException) throw e;
      // Log error but don't block on infrastructure failure
    }

    return next.handle();
  }
}
