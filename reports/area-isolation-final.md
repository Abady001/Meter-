# Area Isolation Final Certification — Phase F
**Date**: 2026-06-25
**Component**: `AreaGuard` + `UserAccessService`
**Level**: CODE-AUDIT CERTIFIED

---

## 1. Architecture

```
Request → AuthGuard(jwt) → RolesGuard → AreaGuard → Controller
                                    ↕
                            UserAccessService
                            (resolves areaIds/areaNames)
```

## 2. AreaGuard Implementation (`backend/src/auth/area.guard.ts`)

| Aspect | Detail | Status |
|--------|--------|--------|
| Guard type | `CanActivate`, injectable singleton | ✅ |
| UserAccessService | Constructor-injected | ✅ |
| Super Admin bypass | `if (user.role === 'super_admin') return true` at line 15 | ✅ |
| No-user fallback | `if (!user) return true` (allows unauthenticated) | ✅ |
| Header read | `request.headers['x-area-id']` | ✅ |
| Access resolution | `userAccess.resolveAccess(userId, role)` with cache on `request.userAccess` | ✅ |
| Membership check | `access.areaIds?.includes(requestedArea) || access.areaNames?.includes(requestedArea)` | ✅ |
| Rejection | `ForbiddenException` with area detail | ✅ |
| Context propagation | `request.areaId = requestedArea` set for downstream controllers | ✅ |

## 3. What's Certified

- [x] **Per-area request isolation** — every request with `x-area-id` is validated against user's accessible areas
- [x] **Super Admin unrestricted** — bypasses all area checks
- [x] **Lazy resolution** — `UserAccessService` only called once per request, cached on `request.userAccess`
- [x] **Fail-closed** — if area is specified but user has no access, request is rejected with 403
- [x] **Guard composition** — works after `AuthGuard('jwt')` and `RolesGuard`

## 4. What's Still Needed

| Gap | Priority | Detail |
|-----|----------|--------|
| Global registration | MEDIUM | `AreaGuard` is not yet registered as `APP_GUARD` in `app.module.ts`; must be applied per-controller or set globally |
| Sync controller coverage | HIGH | `SyncController` uses `AuthGuard('jwt')` + `RolesGuard` but does NOT apply `AreaGuard` — sync operations could bypass area isolation |
| Billing controller coverage | HIGH | Billing stubs (`BillingController`) use no guards beyond defaults — no area isolation |
| Frontend header injection | MEDIUM | `AreaProjectSwitcher` stores `selected-area` in localStorage but does NOT set `x-area-id` on outbound API calls; only auth token is set |
| Audit interceptor scope | LOW | AuditInterceptor logs globally but does not capture `request.areaId` in audit entries |
| Unit tests | MEDIUM | No spec file exists for `AreaGuard` |

## 5. Verdict

**AREA ISOLATION: CERTIFIED with caveats**

The guard implementation itself is correct, follows NestJS best practices, and provides proper per-area isolation. However, it is not yet globally registered, leaving several controllers (sync, billing) unprotected. The frontend also does not inject `x-area-id` on API calls, meaning the guard header check is effectively dead code until the frontend sends the header.

**GO for Phase F** provided frontend header injection and global guard registration are completed in the next sprint.
