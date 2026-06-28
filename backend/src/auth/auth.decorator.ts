import { applyDecorators, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from './roles.decorator';
import { Permissions } from './permissions.decorator';
import { RolesGuard } from './roles.guard';
import { PermissionsGuard } from './permissions.guard';
import { Role } from './types/role.enum';
import { Permission } from './types/permission.enum';
import { Audit } from '../audit/audit.decorator';

interface AuthOptions {
  roles?: Role[];
  permissions?: Permission[];
  audit?: { resource: string; action: string };
}

export function Auth(options: AuthOptions = {}) {
  const decorators: (MethodDecorator | ClassDecorator)[] = [UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)];

  if (options.roles && options.roles.length > 0) {
    decorators.push(Roles(...options.roles));
  }

  if (options.permissions && options.permissions.length > 0) {
    decorators.push(Permissions(...options.permissions));
  }

  if (options.audit) {
    decorators.push(Audit(options.audit.resource, options.audit.action) as MethodDecorator);
  }

  return applyDecorators(...decorators);
}
