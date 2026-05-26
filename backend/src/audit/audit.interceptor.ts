import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, map } from 'rxjs';
import { AuditService } from './audit.service';
import { AUDIT_RESOURCE_KEY, AUDIT_ACTION_KEY } from './audit.decorator';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly auditService: AuditService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const method = request.method?.toUpperCase();

    if (method === 'GET' || method === 'OPTIONS') {
      return next.handle();
    }

    const resourceType =
      this.reflector.get<string>(AUDIT_RESOURCE_KEY, context.getHandler()) ?? 'unknown';
    const action =
      this.reflector.get<string>(AUDIT_ACTION_KEY, context.getHandler()) ?? method;

    const resourceId =
      request.params?.id ??
      request.body?.id ??
      request.params?.[0] ??
      'unknown';

    const actorId = request.user?.userId ?? request.user?.sub ?? 'anonymous';
    const actorRole = request.user?.role ?? 'anonymous';
    const correlationId = request.correlationId;

    const beforeState = method === 'POST' ? null : { ...(request.body ?? {}) };

    return next.handle().pipe(
      map((responseData) => {
        const afterState = responseData ?? null;

        this.auditService
          .create({
            actorId,
            actorRole,
            action,
            resourceType,
            resourceId,
            beforeState: beforeState ?? undefined,
            afterState: afterState ?? undefined,
            reason: request.body?.reason ?? undefined,
            correlationId,
          })
          .catch(() => {});

        return responseData;
      }),
    );
  }
}
