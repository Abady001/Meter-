import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserAccessService } from './user-access.service';

export const PROJECT_ACCESS_KEY = 'require_project_access';

@Injectable()
export class ProjectAccessGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly userAccessService: UserAccessService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<boolean>(PROJECT_ACCESS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required) return true;

    const request = context.switchToHttp().getRequest<any>();
    const user = request.user;
    if (!user) return true;

    // Resolve projectId from various locations
    const projectId = request.params?.projectId
      || request.query?.projectId
      || request.body?.projectId
      || request.headers['x-project-id'];

    if (!projectId) return true;

    const access = await this.userAccessService.resolveAccess(user.userId, user.role);
    if (access.isSuperAdmin) {
      request.userAccess = access;
      return true;
    }

    if (!this.userAccessService.hasProjectAccess(access, projectId)) {
      throw new ForbiddenException(`Access denied for project: ${projectId}`);
    }

    request.userAccess = access;
    return true;
  }
}

export const RequireProjectAccess = () => {
  return (target: any, key: string, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata(PROJECT_ACCESS_KEY, true, descriptor.value);
    return descriptor;
  };
};
