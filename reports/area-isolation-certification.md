# Report 1: Area Isolation Certification

**Date:** 2026-06-25
**Sources:** `reports/project-isolation-v2.md`, `reports/project-isolation-certification.md`

---

## Is Area Isolation Enforced?

**PARTIAL — not certifiable.**

### What exists

| Mechanism | Status | Detail |
|-----------|--------|--------|
| `AreaGuard` (global, `APP_GUARD`) | ✅ Registered | Checks `x-area-id` header against user's area list via `CoreUserRoleAssignment` |
| `ProjectAccessInterceptor` (global, `APP_INTERCEPTOR`) | ✅ Registered | Validates `projectId` from params/query/body/header; super_admin bypass |
| `AccessContextMiddleware` (global, `forRoutes('*')`) | ✅ Registered | Resolves user access context onto `req.userAccess` |
| `GlobalAuthGuard` (global, `APP_GUARD`) | ✅ Registered | JWT auth + role check |

### What is broken

| Issue | Detail |
|-------|--------|
| `AreaMiddleware` is **dead code** | File exists at `auth/area.middleware.ts` but is **NOT registered** in `app.module.ts` |
| Area guard is opt-in via header | If `x-area-id` is omitted, access is **allowed** — no mandatory enforcement |
| `ProjectAccessInterceptor` skips when absent | Line 24: `if (!projectId) return next.handle()` — non-super_admin users who omit `projectId` see cross-project data |
| 6+ endpoints lack mandatory project filter | `GET /readings`, `/readings/review-queue`, `/invoices`, `/tariff-plans`, `/periods`, `/tariffs` |

### Controllers that pass

- **billing.controller.ts** — All 16 endpoints validated via `validateProject()` helper
- **meters.controller.ts** — `GET /meters` validates `query.projectId`; resolves access for non-super_admin
- **bill-cycle.controller.ts** — `POST /bill-cycle` and `POST /bill-cycle/:id/generate` validated
- **readings.controller.ts** — All 7 mutation endpoints validated; `GET /readings` and `GET /readings/review-queue` have conditional validation
- **reports.controller.ts** — `GET /reports/generate/:type` validates `query.projectId` when present

### Controllers that fail / are unguarded

| Controller | Endpoint | Issue |
|-----------|----------|-------|
| `tariff-studio.controller.ts:16` | `GET /tariffs` | No project filter at all — returns ALL tariffs |
| `readings.controller.ts:48` | `GET /readings` | If `projectId` omitted, returns ALL readings |
| `readings.controller.ts:55` | `GET /readings/review-queue` | Same — cross-project leak |
| `billing.controller.ts:464` | `GET /invoices` | If `projectId` omitted, returns ALL invoices |
| `billing.controller.ts:429` | `GET /tariff-plans` | If `projectId` omitted, returns ALL tariffs |
| `billing.controller.ts:455` | `GET /periods` | If `projectId` omitted, returns ALL periods |

### Verdict

**CERTIFICATION: FAIL** — 4 conditions must be met:
1. Register `AreaMiddleware` in `app.module.ts` (dead code)
2. Make `projectId` **required** on all list endpoints or enforce at interceptor level
3. `ProjectAccessInterceptor` should return 403 when `projectId` is absent for non-super_admin
4. Audit all controllers for mandatory project filter
