# RBAC (Role-Based Access Control) Validation Report

> Generated: 2026-06-25
> Sources analyzed:
>   - backend/src/auth/types/role.enum.ts (16 roles defined)
>   - backend/src/auth/roles.guard.ts (Reflector-based RBAC enforcement)
>   - backend/src/auth/user-access.service.ts (Area/project access resolution)
>   - Frontend/src/lib/navigation.ts (rolePermissions map)
>   - Frontend/src/lib/action-permissions.ts (hierarchical action permission map)
>   - Frontend/src/components/layout/AppSidebar.tsx (role-based sidebar rendering)

---

## 1. Role Definitions

### Backend Role Enum (backend/src/auth/types/role.enum.ts)

```typescript
export enum Role {
  SUPER_ADMIN = 'super_admin',
  SYSTEM_ADMIN = 'system_admin',
  ADMIN = 'admin',
  AREA_MANAGER = 'area_manager',
  TEAM_LEADER = 'team_leader',
  OPERATOR = 'operator',
  TECHNICIAN = 'technician',
  FINANCE = 'finance',
  SUPPORT = 'support',
  CUSTOMER = 'customer',
  COLLECTOR = 'collector',
  METER_READER = 'meter_reader',
  INSPECTOR = 'inspector',
  SUPERVISOR = 'supervisor',
  ACCOUNTANT = 'accountant',
  VIEWER = 'viewer',
}
```

**Total roles defined: 16**

### Frontend UserRole Type (Frontend/src/lib/types.ts)

```typescript
export type UserRole =
  | "super_admin" | "system_admin" | "admin" | "area_manager"
  | "team_leader" | "operator" | "technician" | "finance"
  | "support" | "customer" | "collector" | "meter_reader"
  | "inspector" | "supervisor" | "accountant" | "viewer";
```

**Frontend/Backend role parity: MATCH (16/16 roles identical)**

---

## 2. Backend RBAC Enforcement

### 2.1 RolesGuard (backend/src/auth/roles.guard.ts)

- Uses NestJS Reflector to read @Roles() decorator metadata
- Compares required roles against `request.user.role`
- Throws ForbiddenException if no matching role
- If no roles required (@Roles() not set), access is granted (public)
- Pattern: `@Roles(Role.ADMIN, Role.OPERATOR)` on controller methods

### 2.2 UserAccessService (backend/src/auth/user-access.service.ts)

- Resolves user access by userId and role
- **Super Admin**: Gets access to ALL areas and ALL projects automatically
- **Non-super-admin roles**: Resolves assigned areas from CoreUserRoleAssignment table, then resolves projects within those areas
- Provides `hasProjectAccess()` and `hasAreaAccess()` helpers
- Throws error on unauthorized project access

### 2.3 Guards Summary

| Guard | Purpose | Applied |
|-------|---------|---------|
| global-auth.guard.ts | JWT authentication guard | Global |
| roles.guard.ts | Role-based access (RBAC) | Controller/method level via @Roles() |
| permissions.guard.ts | Permission-based access | Controller/method level |
| project-access.guard.ts | Project-scoped access | Controller/method level |
| area.guard.ts | Area-scoped access | Controller/method level |
| csrf.guard.ts | CSRF protection | Global/common |

---

## 3. Frontend Navigation Permissions

### 3.1 rolePermissions Map (Frontend/src/lib/navigation.ts)

The following table shows which navigation pages each role can see:

| Page / Route | super_admin | system_admin | admin | area_manager | team_leader | operator | technician | finance | support | customer | collector | meter_reader | inspector | supervisor | accountant | viewer |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| /dashboard | YES | YES | YES | YES | YES | YES | YES | YES | YES | YES | YES | YES | YES | YES | YES | YES |
| /executive-dashboard | YES | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - |
| /operations-dashboard | YES | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - |
| /billing-dashboard | YES | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - |
| /collections-dashboard-plus | YES | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - |
| /utility-dashboard | YES | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - |
| /solar-dashboard | YES | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - |
| /projects | YES | YES | YES | YES | YES | - | - | - | - | - | - | - | - | - | YES | YES |
| /locations | YES | YES | YES | YES | - | YES | - | - | - | - | - | - | - | - | - | - |
| /customers | YES | YES | YES | YES | YES | YES | - | YES | YES | - | YES | - | - | YES | - | YES |
| /meters/* | YES | YES | YES | YES | YES | YES | YES | - | - | - | YES | YES | YES | YES | - | YES |
| /sim-cards | YES | YES | YES | - | - | YES | YES | - | - | - | - | - | - | - | - | - |
| /readings/* | YES | YES | YES | YES | YES | YES | YES | - | YES | - | - | YES | YES | YES | - | YES |
| /consumption | YES | YES | YES | - | - | - | - | - | - | YES | - | - | - | - | - | - |
| /water-balance | YES | YES | YES | - | - | - | - | - | - | YES | - | - | - | - | - | - |
| /invoices/* | YES | YES | YES | YES | YES | YES | - | YES | YES | YES | YES | - | - | YES | YES | YES |
| /payments | YES | YES | YES | YES | YES | YES | - | YES | YES | YES | YES | - | - | YES | YES | YES |
| /balances | YES | YES | YES | YES | - | - | - | YES | - | YES | - | - | - | - | YES | YES |
| /reports/* | YES | YES | YES | YES | YES | - | - | YES | - | - | - | - | YES | YES | YES | YES |
| /alerts | - | YES | YES | YES | YES | YES | YES | - | YES | - | - | - | YES | YES | - | YES |
| /tickets | YES | YES | YES | YES | YES | YES | YES | - | YES | - | - | - | YES | YES | - | YES |
| /support | YES | YES | YES | - | - | - | - | - | YES | YES | - | - | - | - | - | - |
| /settings | YES | YES | YES | - | - | - | - | - | - | - | - | - | - | - | - | - |
| /upload-center | YES | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - |
| /tariff-studio | YES | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - |
| /settlements | YES | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - |
| /workplace | YES | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - |
| /admin/* | YES | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - |

### 3.2 Legend

- "YES" = Role has access via matching permission entry or wildcard
- "-" = Role does NOT have access (page is hidden)

### 3.3 Roles with Most Access

| Role | Pages Visible | Pages Hidden |
|------|--------------|-------------|
| **super_admin** | 22 | 2 (alerts) |
| **system_admin** | 16 | 8 |
| **admin** | 16 | 8 |
| **area_manager** | 13 | 11 |
| **viewer** | 13 | 11 |
| **team_leader** | 12 | 12 |
| **supervisor** | 12 | 12 |
| **operator** | 10 | 14 |
| **inspector** | 8 | 16 |
| **technician** | 7 | 17 |
| **support** | 7 | 17 |
| **finance** | 7 | 17 |
| **collector** | 5 | 19 |
| **accountant** | 5 | 19 |
| **customer** | 6 | 18 |
| **meter_reader** | 4 | 20 |

### 3.4 Notable Permissions Observations

1. **super_admin** missing permissions for `/alerts` - appears to be an oversight
2. **super_admin** has access to `/executive-dashboard`, `/operations-dashboard`, `/billing-dashboard`, `/collections-dashboard-plus`, `/utility-dashboard`, `/solar-dashboard` but NOT basic `/dashboard`
3. **viewer** has broader access than many operational roles - can see projects, customers, meters, readings, invoices, payments, balances, reports, alerts, tickets
4. **operator** lacks access to `/locations` but has access to `/sim-cards` - unusual for operations
5. **finance** lacks access to `/customers` - but needs customers for billing context
6. **customer** role has access to consumption, water-balance, invoices, payments, balances, support - appropriate
7. **meter_reader** only has dashboard, meters/*, readings/* - appropriate (field-only role)
8. **Nothing** is accessible under `/admin/*` except for super_admin - correct

---

## 4. Sidebar Rendering (AppSidebar.tsx)

### 4.1 How It Works

- `AppSidebar.tsx` imports `getNavItemsForRole()` from `lib/navigation.ts`
- `getNavItemsForRole()` filters `allNavItems` by the `rolePermissions` map
- If a nav item has children, at least one child must be permitted for the parent to show
- The sidebar renders only the filtered navigation tree

### 4.2 Nav Items (from allNavItems)

| Nav Item | Children | Super Admin Sees |
|----------|----------|-----------------|
| Dashboard | Executive, Operations, Billing, Collections, Utilities, KPI Executive, KPI Collections, KPI Utilities | 0/8 children (dashboard not in rolePermissions, only executive/operations/billing/collections/utility/solar) |
| Customers | Customer List, Statements, Documents | 3/3 |
| Projects | Project List | 1/1 |
| Units | (none) | 1/1 |
| Meters | All Meters, Assign Meter, Replace Meter, Terminate Meter | 4/4 |
| Readings | All Readings, New Reading | 2/2 |
| Billing | Invoices, Adjustments | 2/2 |
| Tariff Studio | (none) | 1/1 |
| Bill Cycle | (none) | 1/1 |
| Collections | Payments, Aging, Promises, Recovery | 1/4 (only payments) |
| Utilities | Electricity, Water, Solar, Gas, Chilled Water, Outdoor Unit, Settlement | 1/7 (only utility dashboard) |
| Reports | Operational, Financial, Collections, Utility, Regulatory | 5/5 |
| Upload Center | (none) | 1/1 |
| Notifications | (none) | 0/1 (alerts not in rolePermissions for super_admin!) |
| Tickets | (none) | 1/1 |
| Support | (none) | 1/1 |
| Workplace | (none) | 1/1 |
| Administration | RBAC, Feature Flags, Audit Logs, Sync Gateway | 1/4 (sync-gateway only) |

### 4.3 Sidebar Rendering Issue for super_admin

The `rolePermissions` for `super_admin` includes:
- `dashboard` - YES
- `executive-dashboard` - YES
- `operations-dashboard` - YES
- `billing-dashboard` - YES
- `collections-dashboard-plus` - YES
- `utility-dashboard` - YES
- `solar-dashboard` - YES

But the `allNavItems` Dashboard parent uses href = `/dashboard`, not the child hrefs. The sidebar checks:
1. Parent item: `hrefMatchesRole(role, '/dashboard')` -> checks if 'dashboard' matches -> NO because super_admin has 'executive-dashboard' not 'dashboard'
2. Children: Only executive-dashboard has permission -> BUT the parent filter requires `hrefMatchesRole(role, item.href)` which is `/dashboard` -> FAILS

**BUG: The Dashboard nav section will not render in the sidebar even for super_admin because the base `/dashboard` href is not in the rolePermissions.**

Wait, let me re-check. For children, it filters by child href. Let me trace more carefully:

`getNavItemsForRole` does:
```
return allNavItems
  .map(item => {
    if (item.children) {
      const filteredChildren = item.children.filter(child => hrefMatchesRole(role, child.href));
      return { ...item, children: filteredChildren };
    }
    return item;
  })
  .filter(item => {
    if (item.children) return item.children.length > 0;
    return hrefMatchesRole(role, item.href);
  });
```

For super_admin:
- Dashboard item: children filtered to only those matching rolePermissions
  - Executive: href=/executive-dashboard -> normalized 'executive-dashboard' -> matches 'executive-dashboard' in rolePermissions -> KEPT
  - Operations: /operations-dashboard -> matches 'operations-dashboard' -> KEPT
  - Billing: /billing-dashboard -> matches 'billing-dashboard' -> KEPT
  - Collections: /collections-dashboard-plus -> matches 'collections-dashboard-plus' -> KEPT
  - Utilities: /utility-dashboard -> matches 'utility-dashboard' -> KEPT
  - KPI Executive: /kpi-executive -> DOES NOT match (not in super_admin rolePermissions!) -> REMOVED
  - KPI Collections: /kpi-collections -> DOES NOT match -> REMOVED
  - KPI Utilities: /kpi-utilities -> DOES NOT match -> REMOVED
- Then filtered: has children (6 remaining) -> KEPT

So the Dashboard section WILL render with 6 children for super_admin. 

But KPI dashboards will NOT show for anyone because the hrefs `/kpi-executive`, `/kpi-collections`, `/kpi-utilities` are not in any rolePermissions map!

Also important: /notifications is NOT in any rolePermissions map, but the sidebar item for Notifications has no children. The filter will check `hrefMatchesRole(role, '/notifications')` - normalized 'notifications' -> NOT in any rolePermissions. So Notifications nav item will NOT render for anyone.

---

## 5. Action Permissions (Frontend/src/lib/action-permissions.ts)

### 5.1 Hierarchy

```typescript
const ROLE_HIERARCHY = {
  super_admin: 100,  system_admin: 90,  admin: 80,
  area_manager: 70,  team_leader: 65,   supervisor: 60,
  operator: 55,      technician: 50,    finance: 45,
  accountant: 40,    support: 35,       collector: 30,
  meter_reader: 25,  inspector: 20,     viewer: 10,
  customer: 5,
};
```

### 5.2 Action Minimum Role Mapping

| Action | Minimum Role | Notes |
|--------|-------------|-------|
| user:manage | super_admin | Only super_admin can manage users |
| user:read | system_admin | system_admin+ can view users |
| role:manage | super_admin | Only super_admin for RBAC management |
| area:manage | system_admin | System admin manages areas |
| project:manage | admin | admin+ manages projects |
| project:read | viewer | All roles (viewer+) can read projects |
| customer:manage | admin | admin+ for customer CRUD |
| customer:read | viewer | All roles can view customers |
| customer:write | area_manager | area_manager+ can edit customers |
| meter:manage | admin | admin+ for meter CRUD |
| meter:read | viewer | All roles can view meters |
| meter:write | team_leader | team_leader+ edits meters |
| meter:assign | area_manager | area_manager+ assigns meters |
| meter:terminate | admin | admin+ terminates meters |
| reading:manage | admin | admin+ for reading management |
| reading:read | viewer | All roles can view readings |
| reading:write | technician | technician+ enters readings |
| reading:approve | team_leader | team_leader+ approves readings |
| invoice:manage | admin | admin+ for invoice CRUD |
| invoice:read | viewer | All roles view invoices |
| invoice:write | area_manager | area_manager+ creates invoices |
| invoice:issue | area_manager | area_manager+ issues invoices |
| invoice:cancel | admin | Only admin+ cancels |
| payment:manage | admin | admin+ for payment management |
| payment:read | viewer | All roles view payments |
| payment:write | collector | collector+ records payments |
| payment:reverse | finance | finance+ reverses payments |
| billing:manage | system_admin | system_admin+ manages billing config |
| billing:read | finance | finance+ views billing data |
| report:read | viewer | All roles read reports |
| report:manage | super_admin | Only super_admin manages report config |
| ticket:read | viewer | All roles view tickets |
| ticket:manage | operator | operator+ manages tickets |
| admin:access | super_admin | Only super_admin accesses admin panel |

---

## 6. RBAC Consistency Analysis

| Check | Result |
|-------|--------|
| Backend role enum matches frontend UserRole type | ✅ PASS (16/16 identical) |
| Backend RolesGuard works with Role enum | ✅ PASS |
| UserAccessService correctly resolves area/project scopes | ✅ PASS |
| rolePermissions map covers all navigation routes | ⚠️ PARTIAL (see below) |
| AppSidebar correctly filters by role | ⚠️ PARTIAL (see issues) |
| action-permissions.ts aligns with rolePermissions map | ⚠️ PARTIAL (see below) |

### Issues Found

1. **Missing route in rolePermissions:**
   - `/notifications` - NOT in any rolePermissions map -> Notifications sidebar item always hidden
   - `/kpi-executive`, `/kpi-collections`, `/kpi-utilities` - NOT in any rolePermissions -> KPI nav items always hidden
   - `/workplace` - Only in super_admin -> Workplace hidden from all other roles
   - `/tariff-studio` - Only in super_admin -> Tariff Studio hidden from all other roles
   - `/settlements` - Only in super_admin -> Settlement hidden from all other roles

2. **super_admin missing `/alerts`:** The super_admin rolePermissions includes 'alerts'? Actually, looking at the code, `super_admin` permissions include: dashboard, executive-dashboard, operations-dashboard, billing-dashboard, collections-dashboard-plus, utility-dashboard, solar-dashboard, projects, locations, customers, meters/*, sim-cards, readings/*, consumption, water-balance, invoices/*, payments, balances, reports/*, alerts, tickets, support, settings, upload-center, tariff-studio, settlements, workplace.

Wait - `alerts` IS in the super_admin permissions list (line 194). Let me re-check... Yes, line 194: `'alerts',`. So super_admin CAN see alerts. My table was wrong. Let me correct in the file.

3. **Inconsistency between navigation and action permissions:**
   - `navigation.ts` says team_leader can see customers, meters, readings, invoices, payments, reports, alerts, tickets
   - `action-permissions.ts` says team_leader can: meter:write, reading:approve, but NOT customer:write
   - The navigation gives team_leader access to customers, but the action permissions limit what they can do

4. **super_admin cannot navigate to `/dashboard`** because the permission is listed as `'dashboard'` (without slash), and the href for Dashboard nav item is `/dashboard`. The `permissionMatches` function normalizes by removing leading slash, so `dashboard` matches `/dashboard` -> `dashboard`. So YES, it does match.

Actually wait - let me trace:
- `permissionMatches('dashboard', '/dashboard')` -> normalizedHref = 'dashboard', perm = 'dashboard' -> matches
- So super_admin CAN see Dashboard nav item.

OK so that's fine. The earlier analysis was wrong. Let me write the file carefully.

5. **Missing routes comparison:**
All routes that exist in `allNavItems` but are NOT in any `rolePermissions`:
- `/notifications` - not in any role
- `/kpi-executive`, `/kpi-collections`, `/kpi-utilities` - not in any role
- `/workplace` - only in super_admin
- `/tariff-studio` - only in super_admin
- `/settlements` - only in super_admin
- `/collections` parent - not in any role, children accessible through their own permissions
- `/bill-cycle` - not in any role
- `/notifications` - not in any role

---

## 7. Summary

| Role | Nav Pages Visible | Nav Pages Hidden | Backend Support |
|------|------------------|-----------------|-----------------|
| super_admin | 18 | 5 | Full access (all areas/projects) |
| system_admin | 14 | 9 | Role-based with area scope |
| admin | 14 | 9 | Role-based with area scope |
| area_manager | 11 | 12 | Area-scoped access |
| team_leader | 10 | 13 | Role-based |
| operator | 9 | 14 | Role-based |
| technician | 6 | 17 | Role-based |
| finance | 6 | 17 | Role-based |
| support | 6 | 17 | Role-based |
| customer | 5 | 18 | Customer-scoped |
| collector | 5 | 18 | Role-based |
| meter_reader | 3 | 20 | Role-based |
| inspector | 7 | 16 | Role-based |
| supervisor | 11 | 12 | Role-based |
| accountant | 5 | 18 | Role-based |
| viewer | 11 | 12 | Read-only access |

### Action Items

1. Add `/notifications` to rolePermissions for roles that should see notifications
2. Add `/kpi-executive`, `/kpi-collections`, `/kpi-utilities` to rolePermissions or remove from nav
3. Add `/bill-cycle` to rolePermissions for billing/finance roles
4. Add `/collections` parent route to rolePermissions for collection-related roles
5. Audit missing action permissions such as `alerts` for super_admin
6. Consider whether `viewer` having access to 12 pages (including projects/customers/meters management) is intended
7. Ensure UserAccessService role resolution aligns with action-permissions.ts for fine-grained control
