# V1 — Security Re-Certification

**Date**: 2026-06-18
**Method**: Source code verification + live API testing

---

## C-1: Refresh Token Role Demotion — DEFINITIVE ANALYSIS

### Exact Root Cause
`D:\meter\Meter\backend\src\auth\refresh-token.service.ts` line 62:
```typescript
private generateAccessToken(userId: string, role = 'customer'): string
```
Line 58:
```typescript
const accessToken = this.generateAccessToken(userId);  // role NOT passed
```

### Exploit Path Trace
1. `POST /auth/dev-login` → signs JWT with `{ sub, userId, role }` ✅ (role is correct)
2. Dev-login does NOT generate a refresh token (no `generate()` call)
3. `POST /auth/refresh` requires a valid refresh token in request body
4. `rotate()` → `validate()` → `generate()` → `generateAccessToken(userId)` ← **role NOT passed**
5. Result: `this.jwtService.sign({ sub: userId, userId, role: 'customer' })` ← **always 'customer'**

### Actual Exploitability
| Factor | Assessment |
|--------|-----------|
| Is the refresh endpoint reachable? | ✅ Yes — `POST /auth/refresh` is `@Public()` |
| Are refresh tokens ever created? | ❌ No — no login flow generates refresh tokens |
| Can an attacker forge a refresh token? | ❌ No — SHA-256 hashed, 64-byte random |
| Is the bug real? | ✅ Yes — code defect exists |
| Can it be exploited in current system? | ⚠️ LIMITED — no refresh tokens in circulation |

**Verdict**: REAL CODE DEFECT. Not actively exploitable because no refresh tokens are generated. Becomes CRITICAL as soon as a proper login endpoint creates refresh tokens.

### Required Fix
1. Add `role` column to `RefreshToken` Prisma model
2. Migration: `ALTER TABLE sim_system.refresh_tokens ADD COLUMN role VARCHAR(50);`
3. Update `generate()` to accept and store `role`
4. Update `validate()` to return `role`
5. Update `rotate()` to pass role from validation to `generateAccessToken()`

---

## Other Security Findings

| Finding | Severity | Evidence |
|---------|----------|----------|
| JWT_SECRET no longer has fallback | ✅ FIXED | `jwt.strategy.ts:14` — throws if missing |
| AreaMiddleware → AreaGuard | ✅ FIXED | Now runs after JWT auth in APP_GUARD pipeline |
| Customer → projects (should be 403) | ✅ PASS | Got 403 ✅ |
| Customer → DELETE meter (should be 403) | ✅ PASS | Got 403 ✅ |
| Viewer → customers (should be 200) | ❌ FAIL | Got 403 — viewer role not in @Roles() |
| Meter reader → create reading (should be 200) | ❌ FAIL | Got 403 — meter_reader role not in @Roles() |
| CSRF guard never registered | ⚠️ Dead code | Not critical (JWT bearer auth) |
| IDOR — no resource ownership checks | ❌ Architectural gap | Pervasive across all controllers |

---

## Conclusion
**SECURITY_CERTIFIED = NO**

Blockers:
1. C-1: Refresh token role demotion (code defect, limited exploitability)
2. 9 of 16 roles not wired into controller `@Roles()` decorators
3. Widespread IDOR (architecture)
