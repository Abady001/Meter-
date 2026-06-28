# Meter Verse — Project Isolation Revalidation Report

**Date:** 2026-06-25
**Scope:** Full audit of guard/interceptor/middleware layer against all sensitive-data controllers
**Classification:** RESTRICTED — SECURITY AUDIT

---

## 1. Guard / Interceptor / Middleware Layer Analysis

### 1.1 `access-context.middleware.ts`
- **Role:** Enrichment only — resolves `req.userAccess` from `UserAccessService`.
- **Enforcement:** NONE. Silently sets `req.userAccess = null` on failure. Does not block requests.
- **Risk:** Low. It is a supportive layer, not a guard.

### 1.2 `global-auth.guard.ts`
- **Role:** JWT authentication + `@Roles()` enforcement.
- **Public routes:** Respects `@Public()` decorator (skips auth entirely).
- **Role enforcement:** If `@Roles()` is present, user.role must match one of the required roles. Throws `ForbiddenException` on mismatch.
- **Project isolation:** NONE. This guard does not inspect `projectId` at all.
- **Risk:** Medium. Ensures authentication and role-gating, but zero project-scope isolation.

### 1.3 `roles.guard.ts`
- **Role:** Standalone RBAC guard using `@Roles()` metadata.
- **Enforcement:** Same logic as the role check inside `global-auth.guard` — checks `user.role` against required roles.
- **Project isolation:** NONE.
- **Risk:** Low (duplicative of global-auth guard role checking).

### 1.4 `project-access.guard.ts`
- **Role:** Optional project-level access guard. Only activates when `@RequireProjectAccess()` decorator is present on a handler.
- **ProjectId resolution:** Params → Query → Body → `x-project-id` header (in that order).
- **Critical behaviour when projectId is absent:** Returns `true` (pass) without any validation.
- **Super_admin bypass:** Correct — returns `true` immediately.
- **Non-super_admin enforcement:** Checks `hasProjectAccess(access, projectId)`. Throws `ForbiddenException` if denied.
- **Usage across codebase:** **NONE of the analyzed controllers use `@RequireProjectAccess()`.** This guard is effectively dead code for all audited endpoints.
- **Risk:** High. The guard exists and is well-implemented, but is **not applied anywhere**.

### 1.5 `project-access.interceptor.ts`
- **Role:** Interceptor-level project access check.
- **Super_admin bypass:** Correct — early return if `user.role === 'super_admin'`.
- **ProjectId resolution:** Same cascade as the guard.
- **Critical behaviour when projectId is absent:** Passes through without validation.
- **Error handling:** Catches non-ForbiddenException errors silently (does not block on infrastructure failure).
- **Global registration:** Not confirmed as globally registered. If not globally bound, like the guard, it is dead code.
- **Risk:** High (same as guard — unused or easily bypassed by omitting projectId).

### 1.6 `UserAccessService`
- `resolveAccess()`: Super_admin gets ALL projects/areas. Non-super_admin scoped via `coreUserRoleAssignment`.
- `hasProjectAccess()`: Super_admin always `true`. Others checked against resolved project list.
- `requireProjectAccess()`: Throws generic `Error` (not `ForbiddenException`) — fragile pattern.
- **Risk:** Medium. The service logic is correct but the calling pattern in `CustomerController.validateProject()` catches the generic `Error` correctly.

---

## 2. Controller-by-Controller Findings

### 2.1 Billing Controller (`backend/src/billing/billing.controller.ts`)

| Property | Finding |
|---|---|
| **Guards used** | `AuthGuard('jwt')`, `RolesGuard` |
| **@RequireProjectAccess()** | Not used |
| **ProjectAccessInterceptor** | Not applied |
| **1. Validates projectId?** | **NO.** Some endpoints accept projectId (body/query) but NONE validate user access to it. |
| **2. Has @Roles() decorator?** | **YES** — every endpoint has `@Roles()`. |
| **3. Could Area A user see Area B data by omitting projectId?** | **YES — CRITICAL.** `GET /invoices`, `GET /tariff-plans`, `GET /periods` all have *optional* `projectId`. When omitted, ALL records across ALL projects are returned. `GET /invoices/:id`, `POST /invoices/:id/issue`, `PATCH /invoices/:id`, `POST /invoices/:id/cancel`, `POST /invoices/:id/adjustments` take only an invoice UUID with **zero project-scope validation** — any user with the right role can access any invoice. |
| **4. Super_admin bypass handled?** | N/A — no project check to bypass. `SUPER_ADMIN` included in all `@Roles()`. |
| **Verdict** | **FAIL** |

**Leak scenarios:**
- `GET /invoices?customerId=X` — returns invoices for customer X across all projects.
- `GET /invoices/:id` — by brute-forcing invoice UUIDs, a non-super_admin operator can read invoices from any project.
- `POST /invoices/:id/issue` — can issue any draft invoice regardless of project.
- `POST /invoices/:id/adjustments` — can add adjustments to any invoice.
- `GET /tariff-plans` (no projectId) — sees every tariff plan across all areas.

---

### 2.2 Invoices Controller (`backend/src/invoices/invoices.controller.ts`)

| Property | Finding |
|---|---|
| **Guards used** | `GlobalAuthGuard`, `RolesGuard` |
| **@RequireProjectAccess()** | Not used |
| **1. Validates projectId?** | **PARTIALLY.** `batchDownload` has manual project filtering (checks role, resolves access, filters by `access.projects`). `downloadPdf` has **no** validation. |
| **2. Has @Roles() decorator?** | **YES** |
| **3. Could Area A user see Area B data by omitting projectId?** | **YES — for downloadPdf.** `GET /invoices/:id/pdf` takes only an invoice UUID with zero project-scope check. Any role-authorized user can download any invoice PDF. `batchDownload` is safe (filters by `access.projects`). |
| **4. Super_admin bypass handled?** | `batchDownload`: correct explicit bypass (`user.role !== 'super_admin'`). `downloadPdf`: no bypass needed (no check at all). |
| **Verdict** | **FAIL** |

**Leak scenarios:**
- `GET /invoices/:id/pdf` — brute-force invoice IDs to download PDFs from any project.
- Inconsistency: `batchDownload` is well-guarded, `downloadPdf` is completely open.

---

### 2.3 Bill Cycle Controller (`backend/src/bill-cycle/bill-cycle.controller.ts`)

| Property | Finding |
|---|---|
| **Guards used** | `GlobalAuthGuard`, `RolesGuard` |
| **@RequireProjectAccess()** | Not used |
| **1. Validates projectId?** | **NO.** `POST` and `POST :id/generate` accept projectId in body but do not validate user access. `GET` (list all cycles) has NO projectId parameter at all. `GET :id`, `POST :id/start`, `POST :id/post`, `POST :id/cancel` operate by cycle ID with zero project validation. |
| **2. Has @Roles() decorator?** | **YES** |
| **3. Could Area A user see Area B data by omitting projectId?** | **YES — CRITICAL.** `GET /bill-cycle` returns ALL billing cycles across all projects to any OPERATOR+. `GET /bill-cycle/:id` returns any cycle by ID. `POST :id/generate` generates invoices using the provided projectId without verifying the user has access to that project. |
| **4. Super_admin bypass handled?** | N/A — no project check to bypass. |
| **Verdict** | **FAIL** |

**Leak scenarios:**
- `GET /bill-cycle` — complete cross-project data leakage of all billing cycles.
- `GET /bill-cycle/:id` — any cycle accessible by ID enumeration.
- `POST :id/generate` — can trigger invoice generation for any project.

---

### 2.4 Reports Controller (`backend/src/reports/reports.controller.ts`)

| Property | Finding |
|---|---|
| **Guards used** | `GlobalAuthGuard`, `RolesGuard` |
| **@RequireProjectAccess()** | Not used |
| **1. Validates projectId?** | **NO in controller.** `GET generate/:type` passes all query params (including `projectId`) directly to `ReportGenerationService` without any access validation. The service methods optionally filter by `projectId` but never validate user access. |
| **2. Has @Roles() decorator?** | **YES** |
| **3. Could Area A user see Area B data by omitting projectId?** | **CONDITIONALLY YES.** Template CRUD (findAll, findOne, create, update, delete) operates on report *definitions* — lower risk. However, `GET generate/:type` runs arbitrary reports. If `projectId` is omitted, many report types return ALL data across all projects (e.g., `invoices-summary`, `payments`, `meters-status`, `monthly-consumption`, `aging`, etc.). If `projectId` is provided, there is NO check that the user has access to that project. Several report types (`auditLog`, `walletTransactions`, `walletBalance`, `billCycleSummary`, `billCycleAudit`, `systemConfig`, `tariffComparison`, `settlementSummary`) completely ignore the `projectId` filter and return system-wide data. |
| **4. Super_admin bypass handled?** | N/A — no project check in controller. |
| **Verdict** | **CONDITIONAL** |

**Risks:**
- `GET /reports/generate/audit-log` — returns audit logs from all projects (no projectId filtering).
- `GET /reports/generate/wallet-transactions` — returns all wallet transactions (ignores projectId).
- `GET /reports/generate/system-config` — returns all system settings (no filtering).
- `GET /reports/generate/tariff-comparison` — returns ALL active tariffs across all projects.
- Even when projectId is provided, user access to that projectId is never verified.

---

### 2.5 Customers Controller (`backend/src/customers/customers.controller.ts`)

| Property | Finding |
|---|---|
| **Guards used** | `AuthGuard('jwt')`, `RolesGuard` |
| **@RequireProjectAccess()** | Not used |
| **Custom validation** | `validateProject(projectId, req)` — calls `userAccess.requireProjectAccess()` and throws `ForbiddenException` on failure. Skips for `super_admin`. |
| **1. Validates projectId?** | **MOSTLY YES.** 7 of 8 endpoints embed `projectId` in the URL path (`projects/:projectId/customers/...`) and call `validateProject()`. **Exception: `GET :id/360` (line 123-128) takes only a customer UUID — NO projectId, NO validation.** |
| **2. Has @Roles() decorator?** | **YES** |
| **3. Could Area A user see Area B data by omitting projectId?** | **YES — via `getCustomer360`.** The `GET /projects/:projectId/customers/:id/360` endpoint ignores `projectId` entirely (not in params, not used). Any user with the right role can call `GET /projects/ARBITRARY/customers/:id/360` and get the 360 view. The `projectId` in the URL is accepted but never validated or used. Other endpoints are well-guarded. |
| **4. Super_admin bypass handled?** | **YES** — `validateProject()` explicitly skips for `super_admin`. Correct. |
| **Verdict** | **CONDITIONAL** |

**Risks:**
- `GET /projects/:projectId/customers/:id/360` — projectId in URL is decorative; customer 360 data can be fetched cross-project.
- `validateProject()` catches generic `Error` from `requireProjectAccess()` — functionally correct but fragile. Should throw `ForbiddenException` directly.
- This controller has the **best isolation pattern** in the codebase. The `validateProject` approach should be the standard.

---

### 2.6 Meters Controller (`backend/src/meters/meters.controller.ts`)

| Property | Finding |
|---|---|
| **Guards used** | `AuthGuard('jwt')`, `RolesGuard` |
| **@RequireProjectAccess()** | Not used |
| **Custom validation** | NONE |
| **1. Validates projectId?** | **NO.** `findAll()` accepts an optional `projectId` in `QueryMeterDto` but does NOT validate user access to it. `findOne()`, `create()`, `update()`, `remove()`, `assignMeter()`, `terminateMeter()` have no projectId parameter at all. |
| **2. Has @Roles() decorator?** | **YES** |
| **3. Could Area A user see Area B data by omitting projectId?** | **YES — CRITICAL.** `GET /meters` with no `projectId` returns ALL meters across all projects. `GET /meters/:id` returns any meter by ID with zero project check. `POST /meters/:meterId/assign` and `POST /meters/:meterId/terminate` operate on any meter by ID. `QueryMeterDto` has `projectId` as optional — omitting it leaks all meters. |
| **4. Super_admin bypass handled?** | N/A — no project check to bypass. |
| **Verdict** | **FAIL** |

**Leak scenarios:**
- `GET /meters` — returns every meter from every project/area.
- `GET /meters/:id` — brute-force meter UUIDs to access any meter.
- `POST /meters/:meterId/assign`, `POST /meters/:meterId/terminate` — no project-level authorization on mutate operations.

---

### 2.7 KPI Controller (`backend/src/kpi/kpi.controller.ts`)

| Property | Finding |
|---|---|
| **Guards used** | `GlobalAuthGuard`, `RolesGuard` |
| **@RequireProjectAccess()** | Not used |
| **Custom validation** | Pattern: if user is NOT `super_admin` AND NOT `admin`, then `projectId` query param is required, else `ForbiddenException`. |
| **1. Validates projectId?** | **PARTIALLY.** The controller enforces that non-admin/non-super_admin users MUST provide `projectId`. **However, it does NOT validate that the user has access to that specific projectId.** An operator from Area A could pass a projectId from Area B and receive KPI data. |
| **2. Has @Roles() decorator?** | **YES** |
| **3. Could Area A user see Area B data by omitting projectId?** | **CONDITIONALLY YES.** If an operator omits `projectId`, they get `ForbiddenException` (good). But if they provide a projectId from another area, there is no cross-validation (bad). `super_admin` and `admin` roles can omit `projectId` and receive ALL data across all projects — acceptable for super_admin, debatable for `admin`. |
| **4. Super_admin bypass handled?** | **YES** — super_admin (and admin) can access without projectId. |
| **Verdict** | **CONDITIONAL** |

**Risks:**
- An operator can pass any `projectId` and get KPI data for that project.
- `admin` role gets the same blanket access as `super_admin` — may be too broad depending on the admin role definition.

---

## 3. Cross-Cutting Pattern Analysis

| Pattern | Controllers Using It | Effectiveness |
|---|---|---|
| **`@RequireProjectAccess()`** guard | **None** | Guard exists but is unused. Dead code. |
| **`ProjectAccessInterceptor`** | **None confirmed** | Interceptor exists; unclear if globally registered. |
| **Controller-level `validateProject()`** | Customers only | Best practice in codebase. Should be replicated everywhere. |
| **Manual role + project check in handler** | Invoices (`batchDownload`), KPI | Fragmented. Two different patterns for similar problems. |
| **Reliance on `@Roles()` only** | Billing, BillCycle, Reports, Meters | **Insufficient.** Roles gate access by *hierarchy* but not by *scope*. |

### 3.1 The Fundamental Gap

The architecture has two project-isolation mechanisms (`ProjectAccessGuard` via `@RequireProjectAccess()` and `ProjectAccessInterceptor`) but **neither is actually wired to the sensitive controllers**. The `CustomersController` built its own ad-hoc validation. The remaining controllers have zero project-scope enforcement.

### 3.2 By-Omission Data Leakage

The most critical finding: **every list endpoint with an optional `projectId` parameter leaks data when projectId is omitted.** This affects:

- `GET /billing/invoices` — all invoices
- `GET /billing/tariff-plans` — all tariff plans
- `GET /billing/periods` — all billing periods
- `GET /bill-cycle` — all bill cycles
- `GET /meters` — all meters
- `GET /reports/generate/:type` — many report types return all data when projectId omitted
- `GET /kpi/executive` — all KPIs (for admin+ roles)

### 3.3 Super-Admin Bypass Consistency

- `project-access.guard.ts`: Correct ✓
- `project-access.interceptor.ts`: Correct ✓
- `customers.controller.ts validateProject()`: Correct ✓
- `invoices.controller.ts batchDownload`: Correct ✓
- `kpi.controller.ts`: Correct ✓ (admin also bypassed — needs review)
- Billing, BillCycle, Reports, Meters: No bypass needed (no checks at all) ✗

---

## 4. Verdict Summary

| Controller | Verdict | Key Reason |
|---|---|---|
| **Billing Controller** | **FAIL** | No project isolation. List endpoints leak all data when projectId omitted. Invoice-ID-based endpoints have zero scope validation. |
| **Invoices Controller** | **FAIL** | `downloadPdf` has no project check. Anyone with the right role can download any invoice PDF. `batchDownload` is well-guarded (inconsistent). |
| **Bill Cycle Controller** | **FAIL** | No project isolation. `GET /bill-cycle` returns all cycles. No scope checks on any cycle-ID operation. |
| **Reports Controller** | **CONDITIONAL** | Template CRUD is low-risk. `generate/:type` is a black box — many reports return all data, and projectId is never validated against user access. |
| **Customers Controller** | **CONDITIONAL** | Best isolation pattern in the codebase, but `GET :id/360` completely bypasses project validation. |
| **Meters Controller** | **FAIL** | No project isolation. `GET /meters` returns all meters. All meter-ID operations have zero scope validation. |
| **KPI Controller** | **CONDITIONAL** | Requires projectId for non-admin users (good), but never validates that the user has access to that projectId (bad). |

### Overall Score: **FAIL** — Immediate remediation required.

---

## 5. Remediation Recommendations

1. **Apply `@RequireProjectAccess()` to all mutable endpoints** that accept a projectId (Billing, BillCycle, Meters, Reports generate). This guard already exists — wire it in.

2. **Make projectId mandatory for list endpoints** for non-super_admin roles, or scope them automatically to `req.userAccess.projects`.

3. **Fix the `getCustomer360` gap** in CustomersController — either add projectId to the route or validate access through the customer's project.

4. **Add project-access validation to `downloadPdf`** in InvoicesController — verify the user has access to the invoice's project before serving the PDF.

5. **Add project-access validation to all report generation** in `report-generation.service.ts` — inject `UserAccessService` and filter or reject data based on user's accessible projects.

6. **Standardise the `validateProject()` pattern** from CustomersController across all other controllers.

7. **Fix `requireProjectAccess()` in `UserAccessService`** to throw `ForbiddenException` instead of generic `Error` for consistency.

8. **Ensure `ProjectAccessInterceptor` is globally registered** or promote it to a global interceptor if not already.

---

*Report generated by Principal Security Engineer — Meter Verse Security Audit.*
*File: reports/isolation-revalidation.md*
