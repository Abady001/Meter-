# V3 — Security Audit

**Date**: 2026-06-18
**Status**: VERIFIED

## Known Findings Verification

### C-1: Refresh Token Role Demotion (CRITICAL — CONFIRMED)
**Source**: `refresh-token.service.ts:62-64`
```typescript
private generateAccessToken(userId: string, role = 'customer'): string {
  return this.jwtService.sign({ sub: userId, userId, role });
}
```
**Issue**: `role` default is `'customer'`. `rotate()` calls `generateAccessToken(userId)` without passing a role.
**Fix**: Requires adding `role` column to `RefreshToken` Prisma model + migration. **NOT FIXED** (schema change needed).
**Workaround**: Rotate the access token before refresh (get a fresh JWT from dev-login).

### C-2: JWT Secret Fallback (CRITICAL — FIXED)
**Before**: `configService.get('JWT_SECRET', 'change-me-in-production')`
**After**: Throws error if `JWT_SECRET` is not set
**Files**: `jwt.strategy.ts:14`, `auth.module.ts:22`
**Status**: ✅ FIXED — app crashes on startup if JWT_SECRET is missing

### B-1: AreaMiddleware Lifecycle Bug (HIGH — FIXED)
**Root cause**: Middleware runs before guards → `req.user` always undefined → always skipped
**Fix**: Converted `AreaMiddleware` to `AreaGuard` (implements `CanActivate`) — runs AFTER JWT auth in APP_GUARD pipeline
**Order**: 1. ThrottlerGuard → 2. GlobalAuthGuard (JWT + roles) → 3. AreaGuard (area check)
**Status**: ✅ FIXED

## Remaining Security Issues
| Severity | Issue | Status |
|----------|-------|--------|
| CRITICAL | Refresh token role demotion (needs schema migration) | 📌 NOT FIXED |
| HIGH | Widespread IDOR — no resource ownership checks | 📌 Architecture issue |
| HIGH | CSRF Guard dead code | 📌 Not critical (JWT bearer auth) |
| HIGH | Unsafe raw SQL ($queryRawUnsafe) | 📌 Low risk (parameterized) |
| HIGH | JWT algorithm not explicitly specified | 📌 Minor hardening |
| MEDIUM | Rate limiting too generous (100/min global) | 📌 Not blocking |
| LOW | `.env` dev secrets | 📌 Gitignored |

## Conclusion
**SECURITY_CERTIFIED = NO** (C-1 remains unfixed — requires schema migration)
