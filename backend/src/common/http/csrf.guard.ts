import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import * as crypto from 'crypto';

// Paths exempt from CSRF protection (auth endpoints)
const CSRF_EXEMPT_PREFIXES = ['/auth', '/api/v1/auth'];

@Injectable()
export class CsrfGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) return true;

    // Skip CSRF for auth endpoints
    const path = request.routePath || request.path || request.url || '';
    if (CSRF_EXEMPT_PREFIXES.some(p => path.startsWith(p))) return true;

    const headerToken = request.headers['x-csrf-token'];
    const cookieToken = request.cookies?.['csrf-token'];

    if (!headerToken) throw new ForbiddenException('CSRF token missing');
    // If cookie exists, it must match the header
    if (cookieToken && headerToken !== cookieToken) throw new ForbiddenException('CSRF token mismatch');

    return true;
  }

  static generateToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }
}
