# Phase F2B.3 — Mock Eradication Inventory

**Date**: 2026-06-18
**Method**: Comprehensive regex search across `Frontend/src/` for `mock`, `toast.success`, `toast.info`, `fake`, `stub`, `dummy`, `sample`, `fallback`
**Scope**: All `.ts`, `.tsx`, `.js`, `.jsx` files
**Intent**: Inventory only — no deletion

---

## Total Occurrences: 203

| Category | Count | Severity |
|----------|-------|----------|
| mock_import (mock data imports) | 35 | HIGH |
| mock_definition (mock data/flag defs) | 36 | HIGH |
| mock_fallback (`?? mockData` fallback) | 23 | HIGH |
| mock_usage (filtering/mapping/rendering via mock) | 50 | HIGH |
| toast.success (silent "success" on no-op) | 13 | CRITICAL |
| toast.info (stub action notifications) | 31 | CRITICAL |
| fallback_navigation (BackButton, ProtectedAction) | 15 | LOW |
| fake/stub/dummy/sample | 0 | — |

**203 reasons the app cannot go to production.**

---

## CRITICAL: toast.success — 13 occurrences (silent fake success)

| File | Line | Code | Action Pretended |
|------|------|------|-----------------|
| `AlertsPage.tsx` | 26 | `toast.success('Alert acknowledged')` | Alert acknowledge |
| `PaymentsPage.tsx` | 114 | `toast.success('Payment recorded!')` | Record payment |
| `MeterAssignPage.tsx` | 55 | `toast.success(t('meters.assign.success'))` | Assign meter |
| `ReadingNewPage.tsx` | 79 | `toast.success('Reading submitted!')` | Submit reading |
| `MeterReplacePage.tsx:70` | 70 | `toast.success(t('meters.replace.success'))` | Replace meter (try) |
| `MeterReplacePage.tsx:72` | 72 | `toast.success(t('meters.replace.success'))` | Replace meter (catch — **hides real error**) |
| `MeterTerminatePage.tsx:61` | 61 | `toast.success(t('meters.terminate.success'))` | Terminate meter (try) |
| `MeterTerminatePage.tsx:63` | 63 | `toast.success(t('meters.terminate.success'))` | Terminate meter (catch — **hides real error**) |
| `TicketsPage.tsx` | 85 | `toast.success('Ticket created!')` | Create ticket |
| `SettingsPage.tsx` | 79 | `toast.success(t('common.saving'))` | Save settings |
| `SettingsPage.tsx` | 157 | `toast.success(t('common.saving'))` | Save settings |
| `SettingsPage.tsx` | 171 | `toast.success(t('common.saving'))` | Save settings |
| `SettingsPage.tsx` | 192 | `toast.success(t('common.saving'))` | Save settings |

**4 of these are in catch blocks** — they actively **lie** to the user by showing success when the API call actually failed.

---

## CRITICAL: toast.info — 31 occurrences (stub actions)

| File | Count | Actions Pretended |
|------|-------|------------------|
| `MetersPage.tsx` | 3 | Edit meter, Delete meter, Add Meter dialog |
| `SmartTable.tsx` | 1 | Export coming soon |
| `ReportsPage.tsx` | 4 | Filters dialog, Export CSV, Export XLSX, Preview report |
| `ReadingsPage.tsx` | 2 | View reading details, Edit reading |
| `ProjectsPage.tsx` | 3 | Edit project, Delete project, Create Project dialog |
| `CustomersPage.tsx` | 3 | Edit customer, Delete customer, Add Customer dialog |
| `LocationsPage.tsx` | 1 | Add Building dialog |
| `InvoiceDetailPage.tsx` | 5 | Edit invoice, Issue invoice, Record payment, Download PDF, Cancel invoice |
| `InvoicesPage.tsx` | 6 | Edit invoice, Issue invoice, Record payment, Download PDF, Cancel invoice, Create Invoice dialog |
| `PaymentsPage.tsx` | 3 | View payment, Edit payment, Delete payment |

---

## HIGH: mock imports — 35 occurrences (34 files import from mock data)

| Module | Files importing mock | Mock arrays used |
|--------|--------------------|-----------------|
| **Dashboard** | `DashboardPage.tsx` | mockKPIs, mockConsumptionData, mockAlerts, mockRecentActivity, mockMeters |
| **Projects** | `ProjectsPage.tsx`, `ProjectDetailPage.tsx` | mockProjects, mockBuildings, mockUnits, mockCustomers, mockMeters, mockAlerts, mockReadings |
| **Locations** | `LocationsPage.tsx` | mockProjects, mockCustomers |
| **Customers** | `CustomersPage.tsx`, `CustomerDetailPage.tsx` | mockCustomers, mockProjects, mockInvoices, mockMeters, mockUnits |
| **Meters** | `MetersPage.tsx`, `MeterDetailPage.tsx`, `MeterAssignPage.tsx`, `MeterReplacePage.tsx`, `MeterTerminatePage.tsx` | mockMeters, mockProjects, mockReadings, mockSimCards, mockInvoices, mockBuildings, mockUnits, mockCustomers |
| **Readings** | `ReadingsPage.tsx`, `ReadingNewPage.tsx` | mockReadings, mockProjects, mockMeters, mockCustomers, mockUnits |
| **Invoices** | `InvoicesPage.tsx`, `InvoiceDetailPage.tsx` | mockInvoices, mockProjects, mockPayments |
| **Payments** | `PaymentsPage.tsx` | mockPayments, mockCustomers |
| **SIM Cards** | `SimCardsPage.tsx` | mockSimCards |
| **Alerts** | `AlertsPage.tsx` | mockAlerts |
| **Tickets** | `TicketsPage.tsx`, `SupportPage.tsx` | mockTickets, mockCustomers, mockMeters, mockInvoices, mockPayments |
| **Reports** | `ReportsPage.tsx`, `SettingsPage.tsx` | mockReports, mockUsers |
| **Consumption** | `ConsumptionPage.tsx` | mockConsumptionData |
| **Balances** | `BalancesPage.tsx` | mockBalances |
| **Water Balance** | `WaterBalancePage.tsx` | mockWaterBalanceData, mockProjects, mockBuildings, mockMeters |
| **Layout** | `AppShell.tsx`, `AppSidebar.tsx`, `TopNav.tsx`, `LoginPage.tsx`, `RoleSwitcher.tsx` | mock-auth (useAuthStore, ROLES, getRoleLabel, getRoleColor) |
| **Shared** | `ProtectedAction.tsx` | mock-auth (useAuthStore) |
| **Hooks** | `use-invoices.ts` | mockCustomers, mockMeters, mockProjects (inside mapInvoice) |

---

## HIGH: mock_fallback — 23 occurrences (`?? mockData` pattern)

| Pattern | Pages Using It |
|---------|--------------|
| `apiData ?? mockData` | ReadingsPage, ProjectsPage, ProjectDetailPage, LocationsPage, CustomersPage, MetersPage, MeterDetailPage, MeterReplacePage, MeterTerminatePage, SimCardsPage, WaterBalancePage, DashboardPage |
| `useApi ? (apiData ?? []) : mockData` | InvoicesPage, InvoiceDetailPage, PaymentsPage, ConsumptionPage, BalancesPage |

**Critical difference**: The first group falls back to mock data silently. The second group shows EMPTY STATES when in API mode and backend is down.

---

## HIGH: mock_usage — 50 occurrences

Mock data used for:
- **Dropdown options** (Project selectors, filter dropdowns) — 8 pages use `mockProjects.map()` for select options
- **Related data lookup** (CustomerDetailPage finds customer by `mockCustomers.find()`) — 4 detail pages entirely mock-driven
- **Filtering** (AlertsPage uses `useState(mockAlerts)`) — state initialized from mock, never replaced
- **Data computation** (DashboardPage computes KPIs from `mockMeters.forEach()`) — stats from mock
- **Charts** (ConsumptionPage, WaterBalancePage render charts from mock data)

---

## Deployment Files Using Mock (outside src/)

| File | Pattern |
|------|---------|
| `feature-flags.ts` | 14 flags default to `'mock'`, only `invoices.list`, `payments.list`, `billing.list` default to `'api'` |
| `mock-auth.ts` | Entire auth system (login, role switching, tokens) is mock-based |
| `mock-data.ts` | 18 exported mock arrays with 300+ lines of fake data |

---

## Replacement Strategy (per category)

### 1. toast.success (13) → REAL API MUTATION
Each needs a real API mutation hook call. The 2 catch-block offenders (MeterReplacePage, MeterTerminatePage) need the `catch { toast.success }` pattern fixed to `toast.error`.

### 2. toast.info (31) → REAL API CALL OR MODAL
Each stub needs either:
- A mutation hook and API endpoint call
- Or a real modal/dialog with a form that actually submits

### 3. mock_import (35) → REPLACE WITH REAL HOOKS
Each import needs replacement with the corresponding `useXxx()` React Query hook

### 4. mock_fallback (23) → REMOVE `?? mockData`
After verifying the real API works, the `?? mockData` fallback should be removed. During transition, keep fallback but log a warning.

### 5. mock_usage (50) → API-DRIVEN DATA
- Dropdown options: replace `mockProjects.map()` with `projects.map()`
- Detail pages: replace `mockXxx.find()` with `useXxxDetail(id)` hook
- Charts: replace mock arrays with API response data
- Dashboard: compute KPIs from API data instead of mockMeters.forEach

### 6. mock-auth.ts → REAL AUTH (next-auth/JWT)
Entire auth system (8 mock users, mock token, role switching) needs real JWT-based auth integration

### 7. feature-flags.ts → REMOVE entirely
Once all pages are API-driven, feature flags become unnecessary. During migration, set all to `'api'`.

---

## Mock Dependency Graph

```
mock-data.ts (18 arrays)
├── DashboardPage         (5 arrays)
├── ProjectsPage          (1 array)
├── ProjectDetailPage     (7 arrays — ALL mock)
├── LocationsPage         (2 arrays)
├── CustomersPage         (2 arrays)
├── CustomerDetailPage    (4 arrays — ALL mock)
├── MetersPage            (2 arrays)
├── MeterDetailPage       (4 arrays — ALL mock)
├── MeterAssignPage       (6 arrays — ALL mock)
├── MeterReplacePage      (1 array)
├── MeterTerminatePage    (3 arrays)
├── ReadingsPage          (2 arrays)
├── ReadingNewPage        (5 arrays — ALL mock)
├── InvoicesPage          (2 arrays)
├── InvoiceDetailPage     (2 arrays — ALL mock)
├── PaymentsPage          (2 arrays)
├── SimCardsPage          (1 array)
├── AlertsPage            (1 array)
├── TicketsPage           (1 array)
├── SupportPage           (5 arrays — ALL mock)
├── ReportsPage           (1 array)
├── SettingsPage          (1 array)
├── ConsumptionPage       (1 array)
├── BalancesPage          (1 array)
├── WaterBalancePage      (4 arrays)
├── TopNav                (1 array)
├── use-invoices.ts       (3 arrays — inside mapInvoice)
├── SmartTable            (toast.info export stub)
└── feature-flags.ts      (14 flags)
```

**Total: 29 files directly depend on mock-data.ts or mock-auth.ts**
