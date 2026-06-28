# RBAC v2 — Final Report

**Date:** 2026-06-25
**Source:** `backend/src/auth/types/role.enum.ts`, `Frontend/src/lib/navigation.ts`, `Frontend/src/lib/types.ts`

---

## Roles Defined (16)

Defined in `backend/src/auth/types/role.enum.ts` and `Frontend/src/lib/types.ts:7-23`:

| # | Role | Type |
|---|------|------|
| 1 | `super_admin` | Full system access |
| 2 | `system_admin` | System-wide admin |
| 3 | `admin` | Per-project admin |
| 4 | `area_manager` | Area-scoped manager |
| 5 | `team_leader` | Team lead |
| 6 | `operator` | Daily operations |
| 7 | `technician` | Field technician |
| 8 | `finance` | Financial operations |
| 9 | `support` | Customer support |
| 10 | `customer` | End customer (self-service) |
| 11 | `collector` | Payment collector |
| 12 | `meter_reader` | Field meter reader |
| 13 | `inspector` | Inspection role |
| 14 | `supervisor` | Supervisor |
| 15 | `accountant` | Accounting |
| 16 | `viewer` | Read-only access |

---

## Page-Level Access by Role

Defined in `Frontend/src/lib/navigation.ts:174-367` (`rolePermissions`). Each entry is a page path. Wildcard `/*` grants access to parent + all children.

### super_admin (22 pages)
Dashboard (Executive, Operations, Billing, Collections, Utilities, Solar), Projects, Locations, Customers, Meters/*, SIM Cards, Readings/*, Consumption, Water Balance, Invoices/*, Payments, Balances, Reports/*, Alerts, Tickets, Support, Settings, Upload Center, Tariff Studio, Settlements, Workplace

### system_admin (16 pages)
Dashboard, Projects, Locations, Customers, Meters/*, SIM Cards, Readings/*, Consumption, Water Balance, Invoices/*, Payments, Balances, Reports/*, Alerts, Tickets, Support, Settings

### admin (16 pages)
Same as system_admin — identical permission set.

### area_manager (12 pages)
Dashboard, Projects, Locations, Customers, Meters/*, Readings/*, Invoices/*, Payments, Balances, Reports/*, Alerts, Tickets

### team_leader (10 pages)
Dashboard, Projects, Customers, Meters/*, Readings/*, Invoices/*, Payments, Reports/*, Alerts, Tickets

### operator (10 pages)
Dashboard, Customers, Meters/*, Readings/*, SIM Cards, Locations, Invoices/*, Payments, Alerts, Tickets

### technician (6 pages)
Dashboard, Meters/*, SIM Cards, Readings/*, Tickets, Alerts

### finance (6 pages)
Dashboard, Customers, Invoices/*, Payments, Balances, Reports/*

### support (8 pages)
Dashboard, Customers, Readings/*, Invoices/*, Payments, Tickets, Alerts, Support

### customer (7 pages)
Dashboard, Consumption, Water Balance, Invoices/*, Payments, Balances, Support

### collector (5 pages)
Dashboard, Customers, Meters/*, Invoices/*, Payments

### meter_reader (3 pages)
Dashboard, Meters/*, Readings/*

### inspector (6 pages)
Dashboard, Meters/*, Readings/*, Tickets, Alerts, Reports/*

### supervisor (10 pages)
Dashboard, Projects, Customers, Meters/*, Readings/*, Invoices/*, Payments, Reports/*, Alerts, Tickets

### accountant (5 pages)
Dashboard, Invoices/*, Payments, Balances, Reports/*

### viewer (11 pages)
Dashboard, Projects, Customers, Meters/*, Readings/*, Invoices/*, Payments, Balances, Reports/*, Alerts, Tickets

---

## Granularity Analysis

### Current Granularity: PAGE-LEVEL ONLY

The `rolePermissions` map in `navigation.ts:174-367` controls **navigation visibility** only. The `NavItem` interface (`types.ts:414-420`) has `title`, `href`, `icon`, `children` — no permission metadata.

The permission check is a simple string match:
- `permissionMatches()` (`navigation.ts:378-384`) — checks if a role's path pattern matches the current href
- `getNavItemsForRole()` (`navigation.ts:402-419`) — filters nav tree by role

### What's Missing for Button-Level Permissions

| Gap | Details |
|-----|---------|
| **No action-level granularity** | All buttons (Edit, Delete, Create, Issue, Cancel) are visible to any role that can access the page |
| **No backend permission check** | `roles.guard.ts` checks role existence only — no action/resource-level guard |
| **No action permission map** | No data structure like `roleActions: Record<Role, Record<string, string[]>>` mapping roles to allowed CRUD actions per module |
| **Permission matrix is client-side only** | SettingsPage Permission tab (`SettingsPage.tsx:170-216`) toggles view/add/edit/delete per role but changes are NOT persisted to backend |
| **No middleware on frontend** | No `PermissionGate` component that wraps buttons/actions and checks role action permissions |

### Architecture Needed for Button-Level Permissions

```
1. Backend: Permission module
   - permission.entity.ts (role, resource, action: V/A/E/D)
   - PermissionGuard (checks req.user.role + resource + action)
   - @RequirePermission('customers', 'DELETE') decorator

2. Frontend: Permission hooks + components
   - usePermission(module, action) → boolean
   - <PermissionGate module="customers" action="delete">
       <DeleteButton />
     </PermissionGate>
   - roleActionPermissions map (similar to rolePermissions but for actions)

3. Permission matrix UI
   - SettingsPage Permission tab wired to backend API
   - Dynamic grid (16 roles × N modules × 4 actions)
   - Persist toggle → PATCH /permissions/:role/:module
```

### Current Permission Matrix (Client-Side Only)

In `SettingsPage.tsx:170-216`, a grid displays 5 roles (super_admin, admin, operator, finance, viewer) × 9 modules (Dashboard, Customers, Projects, Meters, Readings, Invoices, Payments, Reports, Settings) × 4 actions (V/View, A/Add, E/Edit, D/Delete). Defaults all to true. **Changes are NOT saved to backend.**

---

## Summary

**Strengths:**
- 16 roles fully enumerated in both frontend and backend
- Page-level navigation filtering works correctly
- Backend `RolesGuard` and `@Roles()` decorator exist
- Frontend `getNavItemsForRole()` properly filters sidebar

**Gaps:**
1. Permission granularity is **page-level only** — no button/action-level
2. 6 roles are defined but have no distinct backend guard usage (system_admin, team_leader, collector, meter_reader, inspector, accountant)
3. Permission matrix UI in SettingsPage is **client-side mock** with no persistence
4. No frontend `<PermissionGate>` component for conditional rendering of buttons
5. No backend `Permission` entity or module
6. Backend `roles.guard.ts` is a simple role check — no resource/action dimension

**To achieve button-level permissions, add:** Permission entity, PermissionGuard, @RequirePermission decorator, usePermission hook, PermissionGate component, and wire the permission matrix to backend.
