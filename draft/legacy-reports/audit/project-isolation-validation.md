# METER VERSE — PROJECT ISOLATION VALIDATION AUDIT

**Date:** 2026-06-25
**Auditor:** Principal QA Architect & Security Engineer
**Scope:** Backend auth layer — guards, interceptors, middleware, controllers
**Files Examined:**
- `backend/src/app.module.ts`
- `backend/src/main.ts`
- `backend/src/auth/user-access.service.ts`
- `backend/src/auth/access-context.middleware.ts`
- `backend/src/auth/global-auth.guard.ts`
- `backend/src/auth/project-access.guard.ts`
- `backend/src/auth/area.guard.ts`
- `backend/src/auth/roles.guard.ts`
- `backend/src/auth/permissions.guard.ts`
- `backend/src/common/interceptors/project-access.interceptor.ts`
- `backend/src/common/http/csrf.guard.ts`
- All `@Controller()` files in `backend/src/`

---

## 1. Is project isolation enforced at the controller level? (How?)

**Partially.** There are three mechanisms, none of which are consistently applied:

### a) `ProjectAccessGuard` (Guard — Decorator-based)
- Located at `backend/src/auth/project-access.guard.ts`
- Activated by `@RequireProjectAccess()` decorator on a controller method
- Extracts `projectId` from `request.params.projectId`, `request.query.projectId`, `request.body.projectId`, or `request.headers['x-project-id']`
- Calls `UserAccessService.hasProjectAccess()` which checks the user's resolved project list
- **Only fires if explicitly decorated** — no controller in the codebase uses `@RequireProjectAccess()` (confirmed via grep)

### b) `ProjectAccessInterceptor` (Global Interceptor)
- Registered globally in `app.module.ts` via `APP_INTERCEPTOR`
- Runs on every request
- Extracts `projectId` from params, query, body, or `x-project-id` header
- Skips if user is `super_admin` or if no `projectId` is found
- If a `projectId` IS found, it validates access via `UserAccessService`
- **CRITICAL FLAW:** If `projectId` is NOT present in the request, the interceptor silently passes. This means requests that operate on projects *without* sending their `projectId` escape isolation entirely.

### c) `UserAccessService` (Service layer)
- `requireProjectAccess(userId, role, projectId)` throws if access denied
- Used by controllers that explicitly call it (e.g., `BillingController.generateInvoices`)
- **Most controllers do NOT call this method**

**Verdict: Partial, inconsistent, relies on opt-in.** The global interceptor provides baseline coverage but with a large bypass window.

---

## 2. Is area isolation enforced? (How?)

**Partially.** The `AreaGuard` runs globally:

### `AreaGuard` (Global Guard)
- Registered globally in `app.module.ts` via `APP_GUARD`
- Reads `x-area-id` header from the request
- Reads `areas[]` from `request.user` (JWT payload)
- If both exist, checks `user.areas.includes(requestedArea)`
- If access denied, throws `ForbiddenException`
- Sets `request.areaId = requestedArea` on success

### Critical Issues with AreaGuard:
1. **JWT payload dependency:** The guard reads `areas` from the JWT payload (`(user as any).areas`). This implies areas must be embedded in the JWT at login time. If the JWT is stale (e.g., user's area assignments changed), the guard enforces outdated data until the JWT is refreshed.
2. **Silent pass when no header:** If no `x-area-id` header is sent, the guard passes without enforcement.
3. **No area-level DB filtering:** The guard only checks the header; controllers themselves do not filter queries by `request.areaId`. The value is stored in `request.areaId` but it is up to each controller/service to use it.

---

## 3. Can a user access data from another project by changing `x-project-id` header?

**YES — If the attacker can guess/obtain another project's UUID.**

### Attack Vector:
```http
POST /api/v1/invoices/generate
Content-Type: application/json
x-project-id: <another-project-uuid>
```

### Defense Analysis:
| Layer | Defense | Outcome |
|-------|---------|---------|
| `ProjectAccessInterceptor` (global) | Checks access if projectId present | **BLOCKED** — interceptor will check and throw 403 |
| `ProjectAccessGuard` (decorator) | Not used anywhere | **NOT ACTIVE** |
| Controller `BillingController` | Has no `@RequireProjectAccess()` | **NO DECORATOR** |
| Controller internal logic | Some controllers filter by projectId from body | **Varies** |

**Bypass scenario:** If the attacker sends the request via a different content type or the projectId is embedded only in the body and the interceptor fails to extract it, the request passes. The interceptor checks `request.params.projectId || request.query.projectId || request.body?.projectId || request.headers['x-project-id']`. If none of these contain the project ID, it silently passes.

**Also:** The interceptor throws a `ForbiddenException` if access is denied, but if an error occurs during `resolveAccess()` (caught generically), the error is logged but **the request continues**. See lines 35–38:
```typescript
} catch (e: any) {
  if (e instanceof ForbiddenException) throw e;
  // Log error but don't block on infrastructure failure
}
```

---

## 4. Can a user access data from another area by changing `x-area-id` header?

**YES — If the JWT has not been refreshed after area reassignment.**

### Attack Vector:
```http
GET /api/v1/projects
x-area-id: <another-area-uuid>
Authorization: Bearer <stale-jwt-with-old-areas>
```

### Defense Analysis:
| Layer | Defense | Outcome |
|-------|---------|---------|
| `AreaGuard` (global) | Checks `x-area-id` against JWT areas | **BLOCKED** if JWT areas are current |
| JWT stale data | Areas are embedded at login time | **BYPASSABLE** if JWT not refreshed |
| No header | Guard silently passes | **BYPASSED** — no header = no check |

**Risk:** If the `AreaGuard` (lines 14–16) fails to read `areas` from `(user as any).areas` (e.g., property doesn't exist on the JWT payload), then `userAreas` remains undefined, and the condition on line 17 (`requestedArea && userAreas && userAreas.length > 0`) evaluates to `false`, causing the guard to **silently pass**.

---

## 5. What happens when super_admin accesses (bypasses isolation)?

**super_admin bypasses ALL isolation:**

### `UserAccessService.resolveAccess()` (line 20-23):
```typescript
if (isSuperAdmin) {
  const areas = (await this.prisma.coreArea.findMany({ select: { id: true } })).map(a => a.id);
  const projects = (await this.prisma.coreProject.findMany({ select: { id: true } })).map(p => p.id);
  return { userId, role, areas, projects, isSuperAdmin: true };
}
```
- `super_admin` resolves ALL areas and ALL projects
- `hasProjectAccess()` returns `true` for any project
- `hasAreaAccess()` returns `true` for any area

### `ProjectAccessInterceptor` (line 14):
```typescript
if (!user || user.role === 'super_admin') {
  return next.handle();  // Skip entirely
}
```

### `ProjectAccessGuard` (line 34-37):
```typescript
if (access.isSuperAdmin) {
  request.userAccess = access;
  return true;
}
```

**Verdict:** super_admin has unrestricted cross-project/cross-area access by design. This is appropriate for admin functions but should be audited to ensure no non-admin code paths can escalate to super_admin privileges.

---

## 6. List all controllers that do NOT have project validation

The following 25 controllers registered in `app.module.ts` do NOT have any explicit `@RequireProjectAccess()` decorator or project isolation logic:

| # | Controller | Path | Risk |
|---|-----------|------|------|
| 1 | `AppController` | `/api/v1/health` | Low — public health check |
| 2 | `AuthController` | `/api/v1/auth/*` | Low — auth endpoints |
| 3 | `MetersController` | `/api/v1/meters/*` | **MEDIUM — no project scope filtering** |
| 4 | `SimCardsController` | `/api/v1/sim-cards/*` | **MEDIUM — no project scope** |
| 5 | `ProjectsController` | `/api/v1/projects/*` | **MEDIUM — should filter by area** |
| 6 | `LocationsController` | `/api/v1/projects/:projectId/locations/*` | Uses projectId in URL but **no access check** |
| 7 | `CustomersController` | `/api/v1/projects/:projectId/customers/*` | Uses projectId in URL but **no access check** |
| 8 | `DashboardController` | `/api/v1/projects/:projectId/dashboard/*` | Uses projectId but **no access check** |
| 9 | `ReadingsController` | `/api/v1/readings/*` | **MEDIUM** |
| 10 | `WaterBalanceController` | `/api/v1/projects/:projectId/water-balance/*` | Uses projectId but **no access check** |
| 11 | `BillingController` | `/api/v1/invoices/generate` etc. | **Has manual checks via service** but not guard |
| 12 | `PaymentsController` | `/api/v1/payments/*` | **MEDIUM** |
| 13 | `InvoicesController` | `/api/v1/invoices/*` | **MEDIUM** — `batchDownload` has manual check |
| 14 | `NotificationsController` | `/api/v1/notifications/*` | **MEDIUM** |
| 15 | `ReportsController` | `/api/v1/reports/*` | **MEDIUM** |
| 16 | `TicketsController` | `/api/v1/tickets/*` | **MEDIUM** |
| 17 | `SupportController` | `/api/v1/support/*` | **MEDIUM** |
| 18 | `SettingsController` | `/api/v1/settings/*` | Low — system settings |
| 19 | `CollectionsController` | `/api/v1/collections/*` | **MEDIUM** |
| 20 | `SearchController` | `/api/v1/search/*` | **MEDIUM — cross-project search leak** |
| 21 | `UploadController` | `/api/v1/upload/*` | **MEDIUM** |
| 22 | `UsersController` | `/api/v1/users/*` | Low — admin only |
| 23 | `AdminController` | `/api/v1/admin/*` | Low — super_admin only |
| 24 | `WalletController` | `/api/v1/wallet/*` | **MEDIUM** |
| 25 | `KpiController` | `/api/v1/kpi/*` | **MEDIUM — aggregate data leak** |

**Note:** Many of these controllers accept `projectId` as a query parameter but do NOT validate that the user has access to that project. The global `ProjectAccessInterceptor` provides basic protection ONLY when `projectId` is present in the request. If a controller lists all records without filtering by projectId, the interceptor does not block it.

---

## 7. List all controllers that do NOT have role guards

The following controllers do NOT have `@UseGuards()` or `@Roles()` at the class level:

| # | Controller | Path | Risk |
|---|-----------|------|------|
| 1 | `AppController` | `/api/v1/health` | Low — public endpoint (`@Public()`) |
| 2 | `WaterBalanceController` | `/api/v1/projects/:projectId/water-balance/*` | **HIGH — no role guard** |
| 3 | `SearchController` | `/api/v1/search/*` | **HIGH — no role guard, search leaks** |
| 4 | `AuthController` | `/api/v1/auth/*` | Low — auth endpoints handle their own auth |
| 5 | `RegistrationController` | `/api/v1/register/*` | Low — registration is public |

**However**, the `GlobalAuthGuard` is registered globally via `APP_GUARD`, which means ALL endpoints require JWT authentication by default (unless marked `@Public()`). The `GlobalAuthGuard` also enforces role checks via `@Roles()` decorator if present.

**Controllers that use `GlobalAuthGuard` explicitly (instead of `AuthGuard('jwt')`):**
- `AreasController`
- `UsersController`
- `UnitTypesController`
- `SettlementController`

These are fine because `GlobalAuthGuard` is already global.

**Controllers using `AuthGuard('jwt')` + `RolesGuard`:**
- `BillingController`
- `SimCardsController`
- `AdminController`
- `MetersController`
- `ReadingsController`
- `InvoicesController`
- `PaymentsController`
- `CustomersController`
- `ProjectsController`
- `LocationsController`

These work because JWT auth is already global, but the explicit `@UseGuards(AuthGuard('jwt'), RolesGuard)` makes the role dependency clearer.

**Controllers with ONLY method-level `@Roles()` but no class-level guard:**
- `TicketsController`
- `SupportController`
- `SettingsController`
- `WalletController`
- `UploadController`
- `KpiController`
- `ReportsController`
- `NotificationsController`
- `CollectionsController`
- `ChilledWaterController`
- `BillCycleController`
- `DownloadsController`
- `SolarController`

These rely on the global `GlobalAuthGuard` to enforce roles via the `@Roles()` decorator — this works correctly because `GlobalAuthGuard.handleRequest()` checks `ROLES_KEY` metadata.

**No controllers are truly unguarded** due to the global `GlobalAuthGuard`.

---

## 8. Is the AccessContextMiddleware registered globally?

**YES.** Confirmed in `app.module.ts` line 118:
```typescript
consumer.apply(AccessContextMiddleware).forRoutes({ path: '*', method: RequestMethod.ALL });
```

This runs on ALL routes for ALL HTTP methods. It resolves the user's project/area access and stores it in `req.userAccess`. However, this data is **not used consistently** by downstream controllers.

---

## 9. Is the ProjectAccessInterceptor registered globally?

**YES.** Confirmed in `app.module.ts` lines 96–99:
```typescript
{
  provide: APP_INTERCEPTOR,
  inject: [UserAccessService],
  useFactory: (uas: UserAccessService) => new ProjectAccessInterceptor(uas),
}
```

This is a global interceptor that runs on every request.

---

## 10. URL Tampering and Header Tampering Vulnerabilities

### VULNERABILITY 1: x-project-id Header Injection (CRITICAL)
- **Severity:** HIGH
- **Description:** Both `ProjectAccessInterceptor` and `ProjectAccessGuard` accept `x-project-id` from request headers. An attacker who knows another project's UUID can attempt to access it. The interceptor SHOULD block this, but it only works if `projectId` can be extracted.
- **Bypass:** If the projectId is embedded ONLY in the URL path (e.g., `/api/v1/projects/:projectId/customers`), the interceptor extracts it from `params.projectId`. This works. But if the endpoint uses a POST body without a `projectId` field, the interceptor cannot extract it.
- **Recommendation:** Use the `@RequireProjectAccess()` decorator on all project-scoped endpoints, and use a NestJS pipe or parameter decorator to validate project access on route parameters.

### VULNERABILITY 2: x-area-id Header Tampering (HIGH)
- **Severity:** HIGH
- **Description:** `AreaGuard` reads `x-area-id` from headers. If the JWT is stale or the `areas` property is missing from the JWT payload, the guard silently passes.
- **Recommendation:** Fall back to `UserAccessService.resolveAccess()` to fetch current area assignments from the database when JWT areas are unavailable.

### VULNERABILITY 3: Silent Pass When No projectId (MEDIUM)
- **Severity:** MEDIUM
- **Description:** If a controller method does not accept a `projectId` parameter and the request has no `x-project-id` header, the interceptor passes without checking. This means list endpoints that return ALL projects/users/readings leak cross-project data.
- **Recommendation:** Require project context on all data-access endpoints, or at minimum filter by the user's accessible project list.

### VULNERABILITY 4: AccessContextMiddleware Data Not Used (MEDIUM)
- **Severity:** MEDIUM
- **Description:** The `AccessContextMiddleware` resolves user access data into `req.userAccess`, but the data is not consumed by any downstream mechanism. Controllers do not read `req.userAccess` for filtering.
- **Recommendation:** Create a helper or guard that automatically applies `req.userAccess.projects` as a filter on list queries.

### VULNERABILITY 5: Error Handling in Interceptor (LOW)
- **Severity:** LOW
- **Description:** In `ProjectAccessInterceptor`, lines 35–38, if `resolveAccess()` throws a non-ForbiddenException error, the error is caught silently and the request continues.
- **Recommendation:** Log the error but still reject the request to fail closed.

### VULNERABILITY 6: CSRF Guard Not Global (MEDIUM)
- **Severity:** MEDIUM
- **Description:** `CsrfGuard` exists in `backend/src/common/http/csrf.guard.ts` but is NOT registered globally or on any controller. It is unused.
- **Recommendation:** Register `CsrfGuard` globally for state-changing methods (POST/PUT/PATCH/DELETE).

### VULNERABILITY 7: Bill Cycle Controller Uses `(this.prisma as any)` (LOW)
- **Severity:** LOW
- **Description:** `BillCycleController` accesses `billingCycle`, `billingCycleAudit` via `(this.prisma as any)` typecasts, bypassing TypeScript type safety.
- **Recommendation:** Add the missing Prisma models to the schema and use proper typed access.

---

## Summary Table

| Check | Status | Risk |
|-------|--------|------|
| Project isolation enforced at controller level | ❌ Partial | HIGH |
| Area isolation enforced | ❌ Partial | HIGH |
| x-project-id header tampering blocked | ⚠️ Partial (interceptor) | HIGH |
| x-area-id header tampering blocked | ⚠️ Partial (guard) | HIGH |
| super_admin bypasses isolation correctly | ✅ By design | OK |
| AccessContextMiddleware registered globally | ✅ YES | OK |
| ProjectAccessInterceptor registered globally | ✅ YES | OK |
| CSRF protection active | ❌ NO | MEDIUM |
| Consistent role guard usage | ✅ YES (global guard) | OK |
| Controllers with no project validation | **25 of 33** | HIGH |
| Controllers with no role guards | 0 (global guard covers) | OK |
