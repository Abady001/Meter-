# Tenant Independence Certification — Phase F
**Date**: 2026-06-25
**Domain**: Area Isolation / Multi-Tenancy
**Level**: ARCHITECTURE AUDIT

---

## 1. Tenant Isolation Strategy

Meter Verse uses a **shared-schema + header-based isolation** model:

```
Core Schema (sim_system.core)
  ├── users, roles, areas, projects  ← shared
  ├── sync_log, sync_buffer           ← shared
  └── audit_log                       ← global
           ↓
Area Guard (x-area-id)  ← per-request filtering
           ↓
Controllers with AreaGuard applied
```

## 2. Where Isolation IS Enforced

| Layer | Mechanism | Status |
|-------|-----------|--------|
| **AreaGuard** | Reads `x-area-id` header → validates against `UserAccessService` → sets `request.areaId` | ✅ implemented at line 23-29 |
| **Super Admin bypass** | Full cross-area visibility | ✅ line 15 |
| **User access resolution** | `resolveAccess(userId, role)` returns array of accessible area IDs | ✅ |
| **Frontend area switcher** | `AreaProjectSwitcher` fetches areas from API, sets `selected-area` in localStorage | ✅ |
| **Project filtering** | Projects filtered by selected area in switcher | ✅ |

## 3. Where Isolation MUST Be Enforced (Gaps)

| Domain | Current State | Required | Gap |
|--------|--------------|----------|-----|
| **Billing** | BillingController stubs — no area guard | All billing queries must filter by `x-area-id` | ❌ CRITICAL |
| **Reports** | No report controller yet | Every report must scope to `x-area-id` | ❌ CRITICAL |
| **KPI / Dashboard** | Dashboard uses mock data | KPIs must filter by selected area | ❌ HIGH |
| **Sync operations** | SyncController uses RolesGuard only | Sync should scope to user's accessible areas | ❌ HIGH |
| **Frontend API calls** | `AreaProjectSwitcher` stores area but does NOT inject `x-area-id` header on fetch calls | Every `fetch()` must include `x-area-id` from localStorage | ❌ HIGH |
| **Invoices** | `InvoicesPage` — no area filter in queries | Invoice lists must filter by area | ❌ HIGH |
| **Payments** | `PaymentsPage` — no area filter | Payment queries must filter by area | ❌ HIGH |
| **Readings** | `ReadingsPage` — no area filter | Reading queries must filter by area | ❌ HIGH |
| **Customers** | `CustomersPage` — no area filter | Customer data is per-area | ❌ HIGH |
| **Audit log** | Audit interceptor does not record `areaId` | Every audit entry should record the area context | ❌ MEDIUM |
| **Notifications** | Notifications are global | Notifications should be area-scoped | ❌ MEDIUM |

## 4. Cross-Area Data Contamination Risk

| Scenario | Risk | Mitigation |
|----------|------|------------|
| Area A user accesses Area B meters | 🔴 HIGH — AreaGuard not globally registered | Register AreaGuard as APP_GUARD |
| Finance role sees all area invoices | 🔴 HIGH — no `x-area-id` sent from frontend | Add header injection to API client |
| Super Admin accidentally restricted | 🟢 LOW — bypass exists | Already implemented |
| Sync operation affects wrong area | 🟡 MEDIUM — areaCode is path param | Verify areaCode matches user's accessible areas |

## 5. Tenant Independence Score

| Criterion | Score | Evidence |
|-----------|-------|----------|
| Guard implementation | ✅ 9/10 | Correct logic, UserAccessService, super_admin bypass |
| Guard global registration | ❌ 0/10 | Not registered as APP_GUARD |
| Frontend header injection | ❌ 0/10 | `selected-area` stored but never sent as HTTP header |
| Billing isolation | ❌ 0/10 | No per-area queue or guard |
| Reports isolation | ❌ 0/10 | No report controller yet |
| KPI isolation | ❌ 0/10 | Mock data, no area scoping |
| Audit context | ⚠️ 3/10 | `areaId` not captured in audit_log |

## 6. Verdict

**TENANT INDEPENDENCE: NOT YET CERTIFIED**

The AreaGuard implementation is correct and provides the foundation for per-area isolation, but it is not globally registered and the frontend does not inject the `x-area-id` header. This means every domain (billing, reports, KPI, invoices, payments, readings, customers) is currently **tenant-blind**.

**NO-GO** until:
1. Register AreaGuard as `APP_GUARD` in `app.module.ts`
2. Add `x-area-id` injection to frontend API client (`lib/api/index.ts`)
3. Verify billing/reports/KPI controllers receive and respect the header
