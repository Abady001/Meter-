# T010 — Implement Append-Only Audit Log Service + Interceptor

## Prompt
Full implementation prompt for T010 as specified by Speckit workflow.

## Key Requirements
- Append-only audit log service (FR-016)
- Immutable AuditLog model with Prisma
- Global audit interceptor for POST/PUT/PATCH/DELETE
- Before/after snapshot capture
- CorrelationId from T007 middleware
- Actor/role from T009 JWT payload
- Fail-safe behavior (DB errors don't block response)

## Dependencies Satisfied
- T004 (Prisma ORM) — AuditLog model
- T006 (ErrorEnvelope) — cherry-picked from feature/t006-error-envelope
- T007 (CorrelationMiddleware) — cherry-picked from feature/t007-correlation-middleware
- T009 (Auth/RBAC) — req.user available from JWT strategy

## Files Created
- backend/prisma/schema.prisma (AuditLog model added)
- backend/src/audit/audit.decorator.ts
- backend/src/audit/audit.service.ts
- backend/src/audit/audit.interceptor.ts
- backend/src/audit/audit.module.ts
- backend/test/audit/audit.service.spec.ts (4 tests)
- backend/test/audit/audit.interceptor.spec.ts (12 tests)
- backend/test/audit/audit.decorator.spec.ts (4 tests)

## Files Modified
- backend/src/app.module.ts (AuditModule imported, global interceptor registered)
- backend/package.json (+ @nestjs/testing)

## Validation Results
- npm test: 69/69 passing (8 suites, 21 audit tests)
- npm run build: clean
- npm run lint: clean
- npx prisma validate: valid

## Date
2026-05-26
