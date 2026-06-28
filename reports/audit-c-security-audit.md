# AUDIT-C — Security Audit (Independent)

**Date**: 2026-06-18
**Verdict**: FAIL (2 CRITICAL, 5 HIGH, 1 MEDIUM)

## ❌ CRITICAL

### F-C1: Refresh Token Demotes All Users to `customer` Role (CRITICAL)
- **Root cause**: `refresh-token.service.ts` line 62-64 hard-codes `role = 'customer'` and is never called with a real role
- **Risk**: Any user who refreshes token is downgraded to customer — RBAC breaks after first refresh
- **Affected**: `backend/src/auth/refresh-token.service.ts:62-64`

### F-C2: Weak Default JWT Secret (CRITICAL)
- **Root cause**: `jwt.strategy.ts:14` and `auth.module.ts:22` fall back to `'change-me-in-production'`
- **Risk**: Anyone knowing the default can forge valid JWTs
- **Affected**: `jwt.strategy.ts:14`, `auth.module.ts:22`

## ❌ HIGH

### F-C3: Dev-Login Uses Soft NODE_ENV Gate (HIGH)
- **Root cause**: `auth.controller.ts:44-51` checks `NODE_ENV === 'production'` — easy to bypass
- **Risk**: In staging/QA/demo, dev-login is fully available

### F-C4: Widespread IDOR (HIGH)
- **Root cause**: No controller validates user's authorization to access requested resource UUIDs
- **Risk**: Any authenticated user can access any project, meter, customer, invoice, payment
- **Affected**: Every data-access controller (10+ controllers, all accepting UUIDs)

### F-C5: CSRF Guard Dead Code (HIGH)
- **Root cause**: `CsrfGuard` defined but never imported, registered, or applied
- **Risk**: No CSRF protection if cookie-based auth is used

### F-C6: Unsafe Raw SQL Pattern (HIGH)
- **Root cause**: `customers.controller.ts:110-119` uses `$queryRawUnsafe`
- **Risk**: SQL injection if query is modified with string concatenation

### F-C7: JWT Algorithm Not Explicitly Specified (HIGH)
- **Root cause**: Neither `auth.module.ts` nor `jwt.strategy.ts` specify `algorithms`
- **Risk**: Algorithm confusion attack, library default changes

## ❌ MEDIUM

### F-C8: Rate Limiting Too Generous (MEDIUM)
- **Root cause**: Global 100 req/60s with no per-route differentiation
- **Risk**: Auth endpoints are not properly throttled

## ✅ PASSES
- Helmet, CORS, ValidationPipe correctly configured
- No stack trace leakage
- All business controllers have authentication guards
- `@Public()` decorator works correctly
- Password policy (8 chars + complexity) adequate
- Lockout policy (5 attempts / 15 min) reasonable

## Conclusion
**SECURITY_CERTIFIED = NO**
