# METER VERSE — REALITY BASELINE

**Date:** 2026-06-25
**Source:** Direct code scan (no documentation assumed)

---

## BACKEND INVENTORY

| Metric | Count | Source |
|--------|-------|--------|
| Controllers | 33 | `backend/src/**/*.controller.ts` |
| Services | 43 | `backend/src/**/*.service.ts` |
| Modules | 39 | `backend/src/**/*.module.ts` |
| DTOs | 29 | `backend/src/**/*dto*.ts` |
| Guards | 6 | `backend/src/**/*.guard.ts` |
| Interceptors | 3 | `backend/src/**/*.interceptor.ts` |
| Middleware | 3 | `backend/src/**/*.middleware.ts` |
| TypeScript files | 186 | `backend/src/**/*.ts` |

### Controllers & Endpoints

| Controller | Endpoints | File |
|-----------|-----------|------|
| AppController | 1 | `app.controller.ts` |
| AdminController | 7 | `admin.controller.ts` |
| AreasController | 5 | `areas.controller.ts` |
| AuthController | 6 | `auth.controller.ts` |
| BillCycleController | 7 | `bill-cycle.controller.ts` |
| BillingController | 13 | `billing.controller.ts` |
| ChilledWaterController | 5 | `chilled-water.controller.ts` |
| CollectionsController | 4 | `collections.controller.ts` |
| CustomersController | 8 | `customers.controller.ts` |
| DownloadsController | 4 | `downloads.controller.ts` |
| InvoicesController | 2 | `invoices.controller.ts` |
| KpiController | 3 | `kpi.controller.ts` |
| MetersController | 7 | `meters.controller.ts` |
| NotificationsController | 5 | `notifications.controller.ts` |
| PaymentsController | 5 | `payments.controller.ts` |
| ProjectsController | 5 | `projects.controller.ts` |
| DashboardController | 3 | `dashboard.controller.ts` |
| LocationsController | 5 | `locations.controller.ts` |
| ReadingsController | 6 | `readings.controller.ts` |
| WaterBalanceController | 1 | `water-balance.controller.ts` |
| RegistrationController | 8 | `registration.controller.ts` |
| ReportsController | 6 | `reports.controller.ts` |
| SearchController | 1 | `search.controller.ts` |
| SettingsController | 3 | `settings.controller.ts` |
| SettlementController | 4 | `settlement.controller.ts` |
| SimCardsController | 6 | `sim-cards.controller.ts` |
| SolarController | 6 | `solar.controller.ts` |
| SupportController | 6 | `support.controller.ts` |
| TicketsController | 8 | `tickets.controller.ts` |
| UnitTypesController | 4 | `unit-types.controller.ts` |
| UploadController | 5 | `upload.controller.ts` |
| UsersController | 6 | `users.controller.ts` |
| WalletController | 6 | `wallet.controller.ts` |
| **Total endpoints** | **~155** | |

---

## PRISMA / DATABASE INVENTORY

| Metric | Count |
|--------|-------|
| Models | 128 |
| Enums | 59 |
| Schemas | 4 (core, sim_system, features, area) |

### Schema Breakdown

| Schema | Tables |
|--------|--------|
| core | 19 (areas, projects, users, roles, permissions, audit_log, holidays, settings, user_groups, etc.) |
| sim_system | 31 (customers, meters, readings, invoices, payments, tariffs, units, etc.) |
| features | 36 (wallet, kpi_data, notification_queue, etc.) |
| area | 42 (area-specific readings, meter_data, etc.) |

---

## FRONTEND INVENTORY

| Metric | Count | Source |
|--------|-------|--------|
| Page components | 35 | `*/**/*Page*.tsx` |
| Total TSX components | 107 | `components/**/*.tsx` |
| Total TS/TSX files | 152 | `src/**/*.ts{,x}` |
| Navigation routes | 60 | `navigation.ts` href entries |
| Report types | 44 | `report-generation.service.ts` case entries |

### Navigation Structure (from navigation.ts)

- **Dashboards**: Executive, Operations, Billing, Collections, Utilities, KPI x3
- **Customers**: List, Statements, Documents
- **Projects**: List
- **Units**: List
- **Meters**: List, Assign, Replace, Terminate
- **Readings**: List, New
- **Billing**: Invoices, Adjustments
- **Tariff Studio**: Standalone
- **Bill Cycle**: Standalone
- **Collections**: Payments, Aging, Promises, Recovery
- **Utilities**: Electricity, Water, Solar, Gas, Chilled Water, Outdoor Units, Settlement
- **Reports**: Operational, Financial, Collections, Utility, Regulatory
- **Other**: Upload Center, Notifications, Tickets, Support, Workplace
- **Administration**: RBAC, Feature Flags, Audit Logs, Sync Gateway

---

## AUDIT / TEST INVENTORY

| Metric | Count |
|--------|-------|
| Existing backend tests | ~287 passing |
| Audit reports in `/audit/` | 20 |
| Playwright test specs in `tests/enterprise/` | 8 spec files (67 test cases) |
| Docker compose files | 2 (main + testing) |

---

## INFRASTRUCTURE

| Component | Status |
|-----------|--------|
| Docker compose (backend + frontend + DB + admin) | ✅ Created |
| CI/CD (GitHub Actions) | ✅ Created |
| Windows service scripts | ✅ Created |
| Sync gateway (9 instances + orchestrator) | ✅ Created |
| Admin Portal (port 6262, merged DB + governance) | ✅ Running |
| Backend (port 3001) | ✅ Running |
| Frontend dev (port 3000) | ✅ Running |

---

## OFFICIAL METRICS (Single Source of Truth)

| Domain | Metric | Value |
|--------|--------|-------|
| Backend | Controllers | 33 |
| Backend | Endpoints | ~155 |
| Backend | Services | 43 |
| Backend | Modules | 39 |
| Backend | DTOs | 29 |
| Backend | Guards | 6 |
| Backend | Interceptors | 3 |
| Backend | Middleware | 3 |
| Database | Models | 128 |
| Database | Enums | 59 |
| Database | Schemas | 4 |
| Frontend | Page components | 35 |
| Frontend | TSX components | 107 |
| Frontend | Nav routes | 60 |
| Frontend | TS/TSX files | 152 |
| Reports | Report types | 44 |
| Tests | Backend tests | ~287 |
| Tests | Playwright specs | 8 (67 cases) |
| Infrastructure | Docker compose | 2 |
| Infrastructure | CI/CD | GitHub Actions |
