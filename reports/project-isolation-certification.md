# Phase 6 — Project Isolation Certification

**Date:** 2026-06-25  
**Scope:** Multi-tenant data isolation by project and area

---

## 1. Is Project Isolation Enforced Globally?

**YES — 4 global enforcement points registered in `app.module.ts`:**

| Mechanism | File | Registration | Scope |
|-----------|------|-------------|-------|
| `GlobalAuthGuard` | `auth/global-auth.guard.ts` | `APP_GUARD` (line 106) | All routes — JWT auth + role check |
| `AreaGuard` | `auth/area.guard.ts` | `APP_GUARD` (line 111) | All routes — enforces `x-area-id` header against user's area list |
| `ProjectAccessInterceptor` | `common/interceptors/project-access.interceptor.ts` | `APP_INTERCEPTOR` (line 97) | All requests — validates `projectId` from params/query/body/header |
| `AccessContextMiddleware` | `auth/access-context.middleware.ts` | `consumer.apply().forRoutes('*')` (line 118) | All routes — resolves user access context onto `req.userAccess` |

## 2. Does super_admin Bypass Work Correctly?

**YES** — Both the interceptor and guard check super_admin:

- `project-access.guard.ts:34` — `if (access.isSuperAdmin) { request.userAccess = access; return true; }`
- `project-access.interceptor.ts:14` — `if (!user || user.role === 'super_admin') { return next.handle(); }`
- `user-access.service.ts:20-23` — Super admin gets ALL areas and ALL projects via `findMany` with no filter

## 3. Are There ANY Endpoints That Leak Cross-Project Data?

**POTENTIAL LEAKS — endpoints that query without project filter:**

| Endpoint | Controller/Service | Issue |
|----------|-------------------|-------|
| `GET /readings` | `readings.controller.ts:48` | If `projectId` query param omitted, returns ALL readings |
| `GET /readings/review-queue` | `readings.controller.ts:55` | If `projectId` omitted, returns readings across all projects |
| `GET /billing/invoices` | `billing.controller.ts:464` | If `projectId` omitted, returns ALL invoices |
| `GET /billing/tariff-plans` | `billing.controller.ts:429` | If `projectId` omitted, returns ALL tariffs |
| `GET /billing/periods` | `billing.controller.ts:455` | If `projectId` omitted, returns ALL periods |
| `GET /tariffs` | `tariff-studio.controller.ts:16` | No project filter at all — returns ALL tariffs |

**Risk**: These endpoints rely on the caller passing a `projectId`. If a non-super_admin user omits it, they may see cross-project data via the global query. The `ProjectAccessInterceptor` skips when `projectId` is absent (line 24: `if (!projectId) return next.handle()`). This is a gap.

## 4. Is Area Isolation Enforced?

**PARTIAL** — `AreaGuard` is registered globally and checks `x-area-id` header against user's area list via `CoreUserRoleAssignment`. However:

- `AreaMiddleware` (`area.middleware.ts`) exists but is **NOT registered** in `app.module.ts` — the middleware is unused code
- The guard only intercepts when `x-area-id` is explicitly provided; if omitted, access is allowed
- The `AccessContextMiddleware` does resolve areas, but downstream controllers must opt-in to use them

## 5. Certification Verdict

| Criteria | Status |
|----------|--------|
| Global auth + JWT | ✅ |
| Role-based access (RBAC) | ✅ |
| Project-level guard (opt-in) | ✅ |
| Project-level interceptor (auto) | ✅ |
| Super admin bypass | ✅ |
| Area guard (header-based) | ⚠️ Partial |
| All endpoints scoped by default | ❌ No — 5+ endpoints lack mandatory project filter |
| AreaMiddleware registered | ❌ Not registered in AppModule |

## CERTIFICATION: **NO — Conditional**

**Conditions to certify:**
1. Make `projectId` **required** (not optional) on all list endpoints or enforce at the interceptor level
2. Register `AreaMiddleware` in `app.module.ts` (it exists but is dead code)
3. Ensure `ProjectAccessInterceptor` returns 403 when no `projectId` is present for non-super_admin users (currently it skips validation)
4. Audit all controllers to verify `/invoices`, `/payments`, `/meters`, `/customers` list endpoints pass the project filter

**Until these 4 conditions are met, cross-project data leakage is possible.**
