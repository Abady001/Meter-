# Tenant Isolation Certification v2 — Sprint 40-43

**Date:** 2026-06-25  
**Scope:** Project-level and area-level isolation across all controllers

---

## Global Enforcement Layer

| Mechanism | File | Registration | Scope | Status |
|-----------|------|-------------|-------|--------|
| `GlobalAuthGuard` | `auth/global-auth.guard.ts` | `APP_GUARD` | All routes — JWT auth + role check | ✅ ACTIVE |
| `AreaGuard` | `auth/area.guard.ts` | `APP_GUARD` | All routes — `x-area-id` header enforcement | ✅ ACTIVE |
| `ProjectAccessInterceptor` | `common/interceptors/project-access.interceptor.ts` | `APP_INTERCEPTOR` | All requests — `projectId` validation | ✅ ACTIVE |
| `AccessContextMiddleware` | `auth/access-context.middleware.ts` | `forRoutes('*')` | All routes — user access context enrichment | ✅ ACTIVE |
| `ThrottlerGuard` | `@nestjs/throttler` | `APP_GUARD` | All routes — 100 req/60s | ✅ ACTIVE |

### Dead/Wasted Code

| Mechanism | File | Issue |
|-----------|------|-------|
| `AreaMiddleware` | `auth/area.middleware.ts` | Defined but **NOT registered** in AppModule |
| `ProjectAccessGuard` | `auth/project-access.guard.ts` | Guard exists but `@RequireProjectAccess()` decorator **NOT used on any controller** |
| `PermissionsGuard` | `auth/permissions.guard.ts` | Defined but **NOT used anywhere** |
| `CsrfGuard` | `common/http/csrf.guard.ts` | Was dead code, now registered globally (see Security report) |

---

## Controller-by-Controller Isolation Status

| Controller | Guards | projectId Validation | projectId Omitted Leaks? | Verdict |
|-----------|--------|---------------------|-------------------------|---------|
| **Customers** | AuthGuard('jwt'), RolesGuard | ✅ `validateProject()` helper on 7/8 endpoints | ❌ `GET :id/360` ignores projectId | ⚠️ CONDITIONAL |
| **Meters** | AuthGuard('jwt'), RolesGuard | ❌ No validation (v2 added partial) | ✅ YES — `GET /meters` returns ALL | ❌ FAIL |
| **Billing** | AuthGuard('jwt'), RolesGuard | ❌ v2 added manual checks on some | ✅ YES — `GET /invoices` returns ALL | ❌ FAIL |
| **Invoices** | GlobalAuthGuard, RolesGuard | ❌ `downloadPdf` no check | ✅ YES — any invoice by UUID | ❌ FAIL |
| **BillCycle** | GlobalAuthGuard, RolesGuard | ❌ No validation | ✅ YES — `GET /bill-cycle` returns ALL | ❌ FAIL |
| **Reports** | GlobalAuthGuard, RolesGuard | ❌ No validation in controller | ✅ YES — many reports return ALL data | ❌ FAIL |
| **KPI** | GlobalAuthGuard, RolesGuard | ⚠️ Requires projectId for non-admin | ⚠️ But does NOT validate user access to that projectId | ⚠️ CONDITIONAL |
| **Readings** | AuthGuard('jwt'), RolesGuard | ⚠️ v2 added manual checks | ✅ YES — `GET /readings` returns ALL | ⚠️ CONDITIONAL |
| **Payments** | AuthGuard('jwt'), RolesGuard | ❌ No validation | ✅ YES — `GET /payments` returns ALL | ❌ FAIL |
| **Wallet** | GlobalAuthGuard, RolesGuard | N/A (customer-scoped) | N/A | ✅ PASS |
| **Tickets** | GlobalAuthGuard, RolesGuard | ❌ No validation | ✅ YES — cross-project ticket access | ❌ FAIL |
| **Projects** | AuthGuard('jwt'), RolesGuard | ⚠️ ProjectAccessInterceptor covers | ⚠️ Depends on interceptor | ⚠️ CONDITIONAL |

---

## Critical Leak Scenarios

| Endpoint | Leak | Severity |
|----------|------|----------|
| `GET /meters` | Returns ALL meters across all projects when projectId omitted | CRITICAL |
| `GET /billing/invoices` | Returns ALL invoices across all projects | CRITICAL |
| `GET /billing/invoices/:id` | Any invoice accessible by UUID brute-force | CRITICAL |
| `GET /billing/invoices/:id/pdf` | Any invoice PDF downloadable by UUID | CRITICAL |
| `GET /bill-cycle` | Returns ALL billing cycles across all projects | CRITICAL |
| `GET /readings` | Returns ALL readings when projectId omitted | HIGH |
| `GET /payments` | Returns ALL payments when projectId omitted | HIGH |
| `GET /reports/generate/audit-log` | Returns audit logs from all projects | HIGH |
| `GET /meters/:id` | Any meter accessible by UUID | HIGH |
| `GET /projects/:pid/customers/:id/360` | projectId in URL is decorative — 360 data leaks | HIGH |

---

## Isolation Patterns Comparison

| Pattern | Controllers Using | Effectiveness |
|---------|------------------|--------------|
| **Controller-level `validateProject()`** (customers pattern) | Customers only | BEST — validates user access to specific projectId |
| **Manual role + project check in handler** | Invoices (batchDownload), KPI, Readings (v2) | FRAGMENTED — inconsistent |
| **`ProjectAccessInterceptor` global** | All (if registered) | UNVERIFIED — unclear if globally bound |
| **`@RequireProjectAccess()` decorator** | NONE | DEAD CODE — guard exists, not applied |
| **Reliance on `@Roles()` only** | Billing, BillCycle, Reports, Meters, Payments | INSUFFICIENT — gates by hierarchy, not scope |

---

## Super Admin Bypass

| Component | Behavior | Status |
|-----------|----------|--------|
| `project-access.guard.ts` | Returns true for super_admin | ✅ Correct |
| `project-access.interceptor.ts` | Skips validation for super_admin | ✅ Correct |
| `customers.controller.ts validateProject()` | Skips for super_admin | ✅ Correct |
| `invoices.controller.ts batchDownload` | Explicit super_admin check | ✅ Correct |
| `kpi.controller.ts` | Admin + super_admin bypass | ⚠️ Admin bypass may be too broad |

---

## Certification Verdict

| Criteria | Status |
|----------|--------|
| Global auth + JWT | ✅ |
| Role-based access (RBAC) | ✅ |
| Super admin bypass | ✅ |
| AreaGuard (header-based) | ✅ |
| All controllers have class-level guards | ✅ (after P0 fixes) |
| List endpoints enforce mandatory projectId | ❌ — 7+ endpoints leak without projectId |
| UUID-based resource endpoints validate project scope | ❌ — invoices, meters, cycles accessible by UUID alone |
| `@RequireProjectAccess()` used | ❌ — guard exists but zero usage |
| AreaMiddleware registered | ❌ — dead code |

**Overall Verdict: ❌ FAIL — immediate remediation required**

### Remediation Priority

| Priority | Action | Effort |
|----------|--------|--------|
| P0 | Make `projectId` mandatory on all list endpoints for non-super_admin | 1 day |
| P0 | Add project-access validation to all UUID-based endpoints | 2 days |
| P0 | Apply `@RequireProjectAccess()` to all mutable endpoints | 1 day |
| P1 | Fix `getCustomer360` — add projectId validation | 0.5 day |
| P1 | Add project-access check to `downloadPdf` | 0.5 day |
| P1 | Register AreaMiddleware or remove dead code | 0.5 day |
| P2 | Standardize on `validateProject()` pattern across all controllers | 2 days |
| P2 | Fix `requireProjectAccess()` to throw `ForbiddenException` not generic Error | 0.5 day |

**6 controllers FAIL, 3 CONDITIONAL, 1 PASS.** Cross-project data leakage is possible on 10+ endpoints.
