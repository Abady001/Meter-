# Report 3: RBAC v2 Certification

**Date:** 2026-06-25
**Sources:** `backend/src/auth/types/role.enum.ts`, `Frontend/src/lib/navigation.ts`

---

## All 16 Roles

Defined in `backend/src/auth/types/role.enum.ts` and matched in `Frontend/src/lib/navigation.ts`:

| # | Role | Pages/Features Accessible | Approx. Permissions |
|---|------|--------------------------|---------------------|
| 1 | `super_admin` | dashboard, executive-dashboard, operations-dashboard, billing-dashboard, collections-dashboard-plus, utility-dashboard, solar-dashboard, projects, locations, customers, meters/*, sim-cards, readings/*, consumption, water-balance, invoices/*, payments, balances, reports/*, alerts, tickets, support, settings, upload-center, tariff-studio, settlements, workplace | 27 |
| 2 | `system_admin` | dashboard, projects, locations, customers, meters/*, sim-cards, readings/*, consumption, water-balance, invoices/*, payments, balances, reports/*, alerts, tickets, support, settings | 17 |
| 3 | `admin` | dashboard, projects, locations, customers, meters/*, sim-cards, readings/*, consumption, water-balance, invoices/*, payments, balances, reports/*, alerts, tickets, support, settings | 17 |
| 4 | `area_manager` | dashboard, projects, locations, customers, meters/*, readings/*, invoices/*, payments, balances, reports/*, alerts, tickets | 13 |
| 5 | `team_leader` | dashboard, projects, customers, meters/*, readings/*, invoices/*, payments, reports/*, alerts, tickets | 10 |
| 6 | `operator` | dashboard, customers, meters/*, readings/*, sim-cards, locations, invoices/*, payments, alerts, tickets | 10 |
| 7 | `technician` | dashboard, meters/*, sim-cards, readings/*, tickets, alerts | 6 |
| 8 | `finance` | dashboard, customers, invoices/*, payments, balances, reports/* | 6 |
| 9 | `support` | dashboard, customers, readings/*, invoices/*, payments, tickets, alerts, support | 8 |
| 10 | `customer` | dashboard, consumption, water-balance, invoices/*, payments, balances, support | 7 |
| 11 | `collector` | dashboard, customers, meters/*, invoices/*, payments | 5 |
| 12 | `meter_reader` | dashboard, meters/*, readings/* | 3 |
| 13 | `inspector` | dashboard, meters/*, readings/*, tickets, alerts, reports/* | 6 |
| 14 | `supervisor` | dashboard, projects, customers, meters/*, readings/*, invoices/*, payments, reports/*, alerts, tickets | 10 |
| 15 | `accountant` | dashboard, invoices/*, payments, balances, reports/* | 5 |
| 16 | `viewer` | dashboard, projects, customers, meters/*, readings/*, invoices/*, payments, balances, reports/*, alerts, tickets | 11 |

## Permission Granularity Level

### Current: **Page-level with wildcard children**

The `rolePermissions` map uses string-based pattern matching via `permissionMatches()`:

- Exact match: `'dashboard'` matches only `/dashboard`
- Wildcard match: `'meters/*'` matches `/meters`, `/meters/assign`, `/meters/replace`, `/meters/terminate`
- No feature-level, tab-level, or button-level granularity exists

### What is NOT granular

| Level | Example | Supported? |
|-------|---------|-----------|
| Page | `'/customers'` | ✅ Yes |
| Sub-page | `'customers/*'` → `/customers/detail/:id` | ✅ Via wildcard |
| Feature within page | Read vs Write vs Delete | ❌ No |
| Tab within page | Overview vs Wallet vs Ledger | ❌ No |
| Button/hyperlink | "Create" button vs "Export" button | ❌ No |

### Frontend Permission Matrix (Settings page)

The `permissions` tab in SettingsPage.tsx renders a V/A/E/D (View/Add/Edit/Delete) toggle grid for 5 roles (`super_admin`, `admin`, `operator`, `finance`, `viewer`) across 9 modules, but this is **client-side state only** — no API persistence, no backend enforcement. The actual RBAC guard on the backend only checks the JWT `role` claim, not per-feature permissions.

### Verdict

**Granularity Level: PAGE + WILDCARD** — sufficient for MVP, but lacks feature-level CRUD and button-level enforcement. The Settings UI suggests a future V/A/E/D model but it is unimplemented on the backend.
