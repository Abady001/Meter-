# Backend Endpoint Audit Report

**Generated:** 2026-06-25
**Source:** D:\meter\Meter\backend\src
**Frontend:** D:\meter\Meter\Frontend\src
**API Prefix:** /api/v1 (global, set in main.ts)

---

## Table of Contents
1. [Controller Inventory (34 controllers)](#1-controller-inventory)
2. [Service Inventory (43 services)](#2-service-inventory)
3. [DTO/Validation Inventory (28 DTOs)](#3-dto-validation-inventory)
4. [Guard/Interceptor/Middleware Inventory (12 files)](#4-guard-interceptormiddleware-inventory)
5. [Unused Endpoint Detection](#5-unused-endpoint-detection)
6. [Summary Counts](#6-summary-counts)

---
## 1. Controller Inventory

### 1.1 AppController
**File:** D:\meter\Meter\backend\src\app.controller.ts

| # | Method | Path | Decorators | Roles | Frontend Consumer |
|---|--------|------|-----------|-------|-------------------|
| 1 | GET | /health | @Public() | None | No direct call |

### 1.2 AuthController
**File:** D:\meter\Meter\backend\src\auth\auth.controller.ts

| # | Method | Path | Decorators | Roles | Frontend Consumer |
|---|--------|------|-----------|-------|-------------------|
| 1 | POST | /auth/login (L27-109) | @Public() | None | login/page.tsx |
| 2 | POST | /auth/refresh (L111-123) | @Public() | None | lib/api/auth.ts:56 |
| 3 | POST | /auth/logout (L125-132) | @Public() | None | mock-auth.ts |
| 4 | POST | /auth/dev-login (L134-144) | @Public() | None | login/page.tsx:45 |
| 5 | GET | /auth/me (L146-165) | None | None | mock-auth.ts:48 |
| 6 | GET | /auth/csrf-token (L167-174) | @Public() | None | No direct call |

### 1.3 AdminController
**File:** D:\meter\Meter\backend\src\admin\admin.controller.ts
**Guard:** @UseGuards(AuthGuard('jwt'), RolesGuard)

| # | Method | Path | Roles | Frontend Consumer |
|---|--------|------|-------|-------------------|
| 1 | GET | /admin/tables (L19-33) | SUPER_ADMIN | No direct call |
| 2 | GET | /admin/data/:table (L35-40) | SUPER_ADMIN | DatabaseAdminPage.tsx:30 |
| 3 | GET | /admin/dependencies/:table/:id (L42-47) | SUPER_ADMIN | DatabaseAdminPage.tsx:99 |
| 4 | POST | /admin/data/:table (L49-54) | SUPER_ADMIN | DatabaseAdminPage.tsx:42 |
| 5 | PUT | /admin/data/:table/:id (L56-61) | SUPER_ADMIN | DatabaseAdminPage.tsx:42 |
| 6 | DELETE | /admin/data/:table/:id (L63-68) | SUPER_ADMIN | DatabaseAdminPage.tsx:34 |
| 7 | POST | /admin/query (L70-81) | SUPER_ADMIN | DatabaseAdminPage.tsx:49, OwnershipTab.tsx:36 |

### 1.4 MetersController
**File:** D:\meter\Meter\backend\src\meters\meters.controller.ts
**Guard:** @UseGuards(AuthGuard('jwt'), RolesGuard)

| # | Method | Path | Roles | @Audit | Frontend Consumer |
|---|--------|------|-------|--------|-------------------|
| 1 | POST | /meters (L37-43) | OPERATOR,ADMIN,SUPER_ADMIN | Audit(meter,create) | use-meters.ts:39 |
| 2 | GET | /meters (L45-56) | OPERATOR,ADMIN,SUPER_ADMIN,TECHNICIAN,FINANCE,SUPPORT | No | use-meters.ts:11 |
| 3 | GET | /meters/:id (L58-69) | Same as above | No | use-meters.ts:18 |
| 4 | PATCH | /meters/:id (L71-80) | OPERATOR,ADMIN,SUPER_ADMIN | Audit(meter,update) | use-meters.ts:48 |
| 5 | DELETE | /meters/:id (L82-88) | SUPER_ADMIN | Audit(meter,deactivate) | use-meters.ts:72 |
| 6 | POST | /meters/:meterId/assign (L90-102) | OPERATOR,ADMIN | Audit(assign) | use-meters.ts:58 |
| 7 | POST | /meters/:meterId/terminate (L104-114) | OPERATOR,ADMIN | Audit(terminate) | use-terminate-meter.ts:23 |

### 1.5 CustomersController
**File:** D:\meter\Meter\backend\src\customers\customers.controller.ts
**Guard:** @UseGuards(AuthGuard('jwt'), RolesGuard)

| # | Method | Path | Roles | Frontend Consumer |
|---|--------|------|-------|-------------------|
| 1 | POST | projects/:projectId/customers (L50-63) | OPERATOR,ADMIN,SUPER_ADMIN | use-customers.ts:89 |
| 2 | GET | projects/:projectId/customers (L65-77) | +TECHNICIAN,FINANCE,SUPPORT | use-customers.ts:67 |
| 3 | GET | projects/:projectId/customers/:id (L79-95) | Same | use-customers.ts:78 |
| 4 | PATCH | projects/:projectId/customers/:id (L97-108) | OPERATOR,ADMIN,SUPER_ADMIN | use-customers.ts:100 |
| 5 | DELETE | projects/:projectId/customers/:id (L110-121) | ADMIN,SUPER_ADMIN | use-customers.ts:111 |
| 6 | GET | customers/:id/360 (L123-128) | +FINANCE,SUPPORT | No direct call |
| 7 | GET | customers/:id/statement (L130-174) | +CUSTOMER | use-balances.ts:34 |
| 8 | POST | customers/:id/transfer-ownership (L176-190) | OPERATOR,ADMIN,SUPER_ADMIN | No direct call |
### 1.6 ReadingsController
**File:** D:\meter\Meter\backend\src\readings\readings.controller.ts
**Guard:** @UseGuards(AuthGuard('jwt'), RolesGuard)

| # | Method | Path | Roles | Frontend Consumer |
|---|--------|------|-------|-------------------|
| 1 | POST | /readings (L33-41) | OPERATOR,TECHNICIAN,ADMIN,SUPER_ADMIN | use-readings.ts:33 |
| 2 | GET | /readings (L43-48) | +FINANCE,SUPPORT | use-readings.ts:17 |
| 3 | GET | /readings/review-queue (L50-55) | OPERATOR,TECHNICIAN,ADMIN,SUPER_ADMIN | No direct call |
| 4 | GET | /readings/:id (L57-62) | +FINANCE,SUPPORT | use-readings.ts:24 |
| 5 | POST | /readings/:id/approve (L64-77) | OPERATOR,ADMIN,SUPER_ADMIN | No direct call |
| 6 | POST | /readings/:id/reject (L79-93) | OPERATOR,ADMIN,SUPER_ADMIN | No direct call |

### 1.7 WaterBalanceController
**File:** D:\meter\Meter\backend\src\readings\water-balance\water-balance.controller.ts
**Guard:** @UseGuards(AuthGuard('jwt'), RolesGuard)

| # | Method | Path | Roles | Frontend Consumer |
|---|--------|------|-------|-------------------|
| 1 | GET | /projects/:projectId/water-balance | OPERATOR,ADMIN,SUPER_ADMIN,FINANCE,SUPPORT | use-water-balance.ts:26 |

### 1.8 BillingController
**File:** D:\meter\Meter\backend\src\billing\billing.controller.ts
**Guard:** @UseGuards(AuthGuard('jwt'), RolesGuard)

| # | Method | Path | Roles | Frontend Consumer |
|---|--------|------|-------|-------------------|
| 1 | POST | /invoices/generate | OPERATOR,ADMIN,SUPER_ADMIN,FINANCE | No direct call |
| 2 | POST | /invoices/:id/issue | Same | use-invoices.ts:89 |
| 3 | PATCH | /invoices/:id | OPERATOR,ADMIN,SUPER_ADMIN | No direct call |
| 4 | POST | /invoices/:id/cancel | Same | No direct call |
| 5 | POST | /invoices/:id/adjustments | +FINANCE | No direct call |
| 6 | POST | /payments | OPERATOR,ADMIN,SUPER_ADMIN,FINANCE | use-payments.ts:75 |
| 7 | POST | /tariffs | OPERATOR,ADMIN,SUPER_ADMIN | TariffStudioPage.tsx:40 |
| 8 | GET | /tariffs | +FINANCE,SUPPORT | No direct call |
| 9 | POST | /periods | OPERATOR,ADMIN,SUPER_ADMIN | No direct call |
| 10 | GET | /periods | +FINANCE,SUPPORT | No direct call |
| 11 | GET | /invoices | Same | use-invoices.ts:79 |
| 12 | GET | /invoices/:id | Same | use-invoices.ts:100 |
| 13 | POST | /tariffs/simulate | +FINANCE | No direct call |

### 1.9 InvoicesController
**File:** D:\meter\Meter\backend\src\invoices\invoices.controller.ts

| # | Method | Path | Roles | Frontend Consumer |
|---|--------|------|-------|-------------------|
| 1 | GET | /invoices/:id/pdf | OPERATOR,ADMIN,SUPER_ADMIN,FINANCE | SettlementPage.tsx:77 |
| 2 | POST | /invoices/batch-download | OPERATOR,ADMIN,SUPER_ADMIN | No direct call |
### 1.10 PaymentsController
**File:** D:\meter\Meter\backend\src\payments\payments.controller.ts
**Guard:** @UseGuards(AuthGuard('jwt'), RolesGuard)

| # | Method | Path | Roles | Frontend Consumer |
|---|--------|------|-------|-------------------|
| 1 | GET | /payments | OPERATOR,ADMIN,SUPER_ADMIN,FINANCE,SUPPORT | use-payments.ts:56 |
| 2 | GET | /payments/:id | Same | use-payments.ts:85 |
| 3 | PATCH | /payments/:id | OPERATOR,ADMIN,SUPER_ADMIN | No direct call |
| 4 | DELETE | /payments/:id | ADMIN,SUPER_ADMIN | No direct call |
| 5 | POST | /payments/:id/reverse | SUPER_ADMIN | No direct call |

### 1.11 CollectionsController
**File:** D:\meter\Meter\backend\src\collections\collections.controller.ts

| # | Method | Path | Roles | Frontend Consumer |
|---|--------|------|-------|-------------------|
| 1 | GET | /collections/dashboard (L26) | OPERATOR,ADMIN,SUPER_ADMIN,FINANCE | No direct call |
| 2 | GET | /collections/payments/:id/receipt | Same | No direct call |
| 3 | GET | /collections/aging | OPERATOR,ADMIN,SUPER_ADMIN | No direct call |
| 4 | GET | /collections/dashboard (L109) | Same (DUPLICATE ROUTE) | No direct call |
### 1.12 ProjectsController
**File:** D:\meter\Meter\backend\src\projects\projects.controller.ts
**Guard:** @UseGuards(AuthGuard('jwt'), RolesGuard)

| # | Method | Path | Roles | Frontend Consumer |
|---|--------|------|-------|-------------------|
| 1 | POST | /projects | OPERATOR,ADMIN,SUPER_ADMIN | use-projects.ts:34 |
| 2 | GET | /projects | +TECHNICIAN,FINANCE,SUPPORT | use-projects.ts:11 |
| 3 | GET | /projects/:id | Same | use-projects.ts:18 |
| 4 | PATCH | /projects/:id | OPERATOR,ADMIN,SUPER_ADMIN | use-projects.ts:49 |
| 5 | DELETE | /projects/:id | SUPER_ADMIN | use-projects.ts:63 |

### 1.13 LocationsController
**File:** D:\meter\Meter\backend\src\projects\locations\locations.controller.ts
**Guard:** @UseGuards(AuthGuard('jwt'), RolesGuard)

| # | Method | Path | Roles | Frontend Consumer |
|---|--------|------|-------|-------------------|
| 1 | POST | /projects/:projectId/locations | OPERATOR,ADMIN,SUPER_ADMIN | use-create-location.ts:18 |
| 2 | GET | /projects/:projectId/locations | +TECHNICIAN,FINANCE,SUPPORT | use-locations.ts:8 |
| 3 | GET | /projects/:projectId/locations/:id | Same | No direct call |
| 4 | PATCH | /projects/:projectId/locations/:id | OPERATOR,ADMIN,SUPER_ADMIN | No direct call |
| 5 | DELETE | /projects/:projectId/locations/:id | ADMIN,SUPER_ADMIN | use-delete-location.ts:10 |

### 1.14 DashboardController
**File:** D:\meter\Meter\backend\src\projects\dashboard\dashboard.controller.ts
**Guard:** @UseGuards(AuthGuard('jwt'), RolesGuard)

| # | Method | Path | Roles | Frontend Consumer |
|---|--------|------|-------|-------------------|
| 1 | GET | /projects/:projectId/dashboard/kpis | OPERATOR,ADMIN,SUPER_ADMIN,FINANCE,SUPPORT | use-dashboard.ts:31 |
| 2 | GET | /projects/:projectId/dashboard/consumption | Same | use-dashboard.ts:39 |
| 3 | GET | /projects/:projectId/dashboard/activity | SUPPORT instead of FINANCE | use-dashboard.ts:47 |

### 1.15 AreasController
**File:** D:\meter\Meter\backend\src\areas\areas.controller.ts
**Guard:** @UseGuards(GlobalAuthGuard, RolesGuard)

| # | Method | Path | Roles | Frontend Consumer |
|---|--------|------|-------|-------------------|
| 1 | GET | /areas (L14) | @Public() - None | login/page.tsx:25, SettingsPage.tsx:44 |
| 2 | GET | /areas/:id (L22) | @Public() - None | No direct call |
| 3 | POST | /areas (L29) | SUPER_ADMIN,ADMIN | SettingsPage.tsx:47 |
| 4 | PATCH | /areas/:id (L42) | SUPER_ADMIN,ADMIN | No direct call |
| 5 | DELETE | /areas/:id (L49) | SUPER_ADMIN | SettingsPage.tsx:52 |
### 1.16 TicketsController
**File:** D:\meter\Meter\backend\src\tickets\tickets.controller.ts

| # | Method | Path | Roles | Frontend Consumer |
|---|--------|------|-------|-------------------|
| 1 | GET | /tickets | OPERATOR,ADMIN,SUPER_ADMIN,SUPPORT | use-tickets.ts:7, WorkplacePage.tsx:20 |
| 2 | GET | /tickets/:id | Same | No direct call |
| 3 | GET | /tickets/:id/comments | Same | No direct call |
| 4 | POST | /tickets | Same | TicketsPage.tsx:27 |
| 5 | POST | /tickets/:id/comment | Same | No direct call |
| 6 | POST | /tickets/:id/status | No SUPPORT | No direct call |
| 7 | PATCH | /tickets/:id | No SUPPORT | No direct call |
| 8 | DELETE | /tickets/:id | SUPER_ADMIN | No direct call |

### 1.17 NotificationsController
**File:** D:\meter\Meter\backend\src\notifications\notifications.controller.ts

| # | Method | Path | Roles | Frontend Consumer |
|---|--------|------|-------|-------------------|
| 1 | GET | /notifications | SUPER_ADMIN,SYSTEM_ADMIN,ADMIN,OPERATOR | use-notifications.ts:9 |
| 2 | GET | /notifications/unread-count | Same | use-notifications.ts:16 |
| 3 | PATCH | /notifications/:id/read | Same | use-notifications.ts:24 |
| 4 | PATCH | /notifications/read-all | Same | use-notifications.ts:32 |
| 5 | DELETE | /notifications/:id | No OPERATOR | use-notifications.ts:40 |

### 1.18 WalletController
**File:** D:\meter\Meter\backend\src\wallet\wallet.controller.ts

| # | Method | Path | Roles | Frontend Consumer |
|---|--------|------|-------|-------------------|
| 1 | GET | /wallet/:customerId | OPERATOR,ADMIN,SUPER_ADMIN,FINANCE | No direct call |
| 2 | POST | /wallet/:walletId/credit | ADMIN,SUPER_ADMIN,FINANCE | WalletTab.tsx:58 |
| 3 | POST | /wallet/:walletId/debit | Same | WalletTab.tsx:65 |
| 4 | POST | /wallet/transfer | ADMIN,SUPER_ADMIN | WalletTab.tsx:72 |
| 5 | GET | /wallet/:walletId/history | OPERATOR,ADMIN,SUPER_ADMIN,FINANCE | No direct call |
| 6 | GET | /wallet/:walletId/balance | Same | No direct call |

### 1.19 KpiController
**File:** D:\meter\Meter\backend\src\kpi\kpi.controller.ts

| # | Method | Path | Roles | Frontend Consumer |
|---|--------|------|-------|-------------------|
| 1 | GET | /kpi/executive | OPERATOR,ADMIN,SUPER_ADMIN | ExecutiveDashboard.tsx:55 |
| 2 | GET | /kpi/collections | Same | CollectionsDashboard.tsx:41 |
| 3 | GET | /kpi/utilities | Same | UtilitiesDashboard.tsx:61 |
### 1.20 ChilledWaterController
**File:** D:\meter\Meter\backend\src\chilled-water\chilled-water.controller.ts
**Guard:** @UseGuards(GlobalAuthGuard, RolesGuard)

| # | Method | Path | Roles | Frontend Consumer |
|---|--------|------|-------|-------------------|
| 1 | GET | /chilled-water/meters | OPERATOR,ADMIN,SUPER_ADMIN | No direct call |
| 2 | POST | /chilled-water/readings | +METER_READER | No direct call |
| 3 | GET | /chilled-water/readings/:meterId | Same | No direct call |
| 4 | POST | /chilled-water/simulate | OPERATOR,ADMIN,SUPER_ADMIN | No direct call |
| 5 | GET | /chilled-water/dashboard | Same | No direct call |

### 1.21 SettlementController
**File:** D:\meter\Meter\backend\src\settlement\settlement.controller.ts
**Guard:** @UseGuards(GlobalAuthGuard, RolesGuard)

| # | Method | Path | Roles | Frontend Consumer |
|---|--------|------|-------|-------------------|
| 1 | POST | /settlement | OPERATOR,ADMIN,SUPER_ADMIN | SettlementPage.tsx:30 |
| 2 | GET | /settlement | Same | SettlementPage.tsx:25 |
| 3 | GET | /settlement/adjustments | Same | SettlementPage.tsx:26 |
| 4 | POST | /settlement/adjustments | Same | SettlementPage.tsx:36 |

### 1.22 RegistrationController
**File:** D:\meter\Meter\backend\src\registration\registration.controller.ts

| # | Method | Path | Roles | Frontend Consumer |
|---|--------|------|-------|-------------------|
| 1 | POST | /auth/register (L15) | @Public() | egister/page.tsx:23 |
| 2 | GET | /registration/requests (L37) | SUPER_ADMIN | No direct call |
| 3 | PATCH | /registration/requests/:id/approve (L46) | SUPER_ADMIN | No direct call |
| 4 | PATCH | /registration/requests/:id/reject (L74) | SUPER_ADMIN | No direct call |
| 5 | GET | /user-groups (L87) | SUPER_ADMIN | No direct call |
| 6 | POST | /user-groups (L94) | SUPER_ADMIN | No direct call |
| 7 | PATCH | /user-groups/:id (L105) | SUPER_ADMIN | No direct call |
| 8 | PATCH | /user-groups/:id/deactivate (L112) | SUPER_ADMIN | No direct call |

### 1.23 SupportController
**File:** D:\meter\Meter\backend\src\support\support.controller.ts

| # | Method | Path | Roles | Frontend Consumer |
|---|--------|------|-------|-------------------|
| 1 | GET | /support | OPERATOR,ADMIN,SUPER_ADMIN,SUPPORT | No direct call |
| 2 | GET | /support/:id | Same | No direct call |
| 3 | POST | /support | No SUPPORT | SupportPage.tsx:29 |
| 4 | PATCH | /support/:id | ADMIN,SUPER_ADMIN | No direct call |
| 5 | POST | /support/:id/escalate | Same | No direct call |
| 6 | DELETE | /support/:id | SUPER_ADMIN | No direct call |

### 1.24 SettingsController
**File:** D:\meter\Meter\backend\src\settings\settings.controller.ts

| # | Method | Path | Roles | Frontend Consumer |
|---|--------|------|-------|-------------------|
| 1 | GET | /settings | ADMIN,SUPER_ADMIN | No direct call |
| 2 | GET | /settings/:key | Same | No direct call |
| 3 | PATCH | /settings | Same | No direct call |
### 1.25 SimCardsController
**File:** D:\meter\Meter\backend\src\sim-cards\sim-cards.controller.ts
**Guard:** @UseGuards(AuthGuard('jwt'), RolesGuard)

| # | Method | Path | Roles | Frontend Consumer |
|---|--------|------|-------|-------------------|
| 1 | POST | /sim-cards | OPERATOR,ADMIN,SUPER_ADMIN | No direct call |
| 2 | GET | /sim-cards | +TECHNICIAN,FINANCE,SUPPORT | use-sim-cards.ts:8 |
| 3 | GET | /sim-cards/:id | Same | use-sim-cards.ts:15 |
| 4 | PATCH | /sim-cards/:id | OPERATOR,ADMIN,SUPER_ADMIN | No direct call |
| 5 | DELETE | /sim-cards/:id | SUPER_ADMIN | No direct call |
| 6 | GET | /sim-cards/:simId/eligibility | +TECHNICIAN | use-sim-eligibility.ts:14 |

### 1.26 SolarController
**File:** D:\meter\Meter\backend\src\solar\solar.controller.ts
**Guard:** @UseGuards(GlobalAuthGuard, RolesGuard)

| # | Method | Path | Roles | Frontend Consumer |
|---|--------|------|-------|-------------------|
| 1 | GET | /solar/wallet/:customerId | OPERATOR,ADMIN,SUPER_ADMIN,FINANCE | No direct call |
| 2 | GET | /solar/readings/:meterId | +METER_READER | No direct call |
| 3 | POST | /solar/readings | Same | No direct call |
| 4 | POST | /solar/simulate | OPERATOR,ADMIN,SUPER_ADMIN | No direct call |
| 5 | GET | /solar/dashboard | Same | No direct call |
| 6 | GET | /solar/statement/:customerId | Same | No direct call |

### 1.27 SearchController
**File:** D:\meter\Meter\backend\src\search\search.controller.ts

| # | Method | Path | Roles | Frontend Consumer |
|---|--------|------|-------|-------------------|
| 1 | GET | /search | OPERATOR,ADMIN,SUPER_ADMIN | No direct call |

### 1.28 UnitTypesController
**File:** D:\meter\Meter\backend\src\unit-types\unit-types.controller.ts
**Guard:** @UseGuards(GlobalAuthGuard, RolesGuard)

| # | Method | Path | Roles | Frontend Consumer |
|---|--------|------|-------|-------------------|
| 1 | GET | /unit-types | OPERATOR,ADMIN,SUPER_ADMIN | SettingsPage.tsx:59 |
| 2 | POST | /unit-types | SUPER_ADMIN,ADMIN | SettingsPage.tsx:62 |
| 3 | PATCH | /unit-types/:id | Same | No direct call |
| 4 | DELETE | /unit-types/:id | SUPER_ADMIN | SettingsPage.tsx:67 |
### 1.29 UploadController
**File:** D:\meter\Meter\backend\src\upload\upload.controller.ts

| # | Method | Path | Roles | Frontend Consumer |
|---|--------|------|-------|-------------------|
| 1 | GET | /upload/history/:entityType | ADMIN,SUPER_ADMIN | UploadCenterPage.tsx:36 |
| 2 | POST | /upload/file | Same | UploadCenterPage.tsx:54 |
| 3 | GET | /upload/template/:type | Same | UploadCenterPage.tsx:148 |
| 4 | POST | /upload/customers | Same | No direct call |
| 5 | POST | /upload/meters | Same | No direct call |

### 1.30 UsersController
**File:** D:\meter\Meter\backend\src\users\users.controller.ts
**Guard:** @UseGuards(GlobalAuthGuard, RolesGuard)

| # | Method | Path | Roles | Frontend Consumer |
|---|--------|------|-------|-------------------|
| 1 | GET | /users | SUPER_ADMIN,ADMIN,OPERATOR | WorkplacePage.tsx:22, SettingsPage.tsx:28 |
| 2 | GET | /users/:id | SUPER_ADMIN,ADMIN | No direct call |
| 3 | POST | /users | SUPER_ADMIN | SettingsPage.tsx:31 |
| 4 | PATCH | /users/:id | SUPER_ADMIN | No direct call |
| 5 | DELETE | /users/:id | SUPER_ADMIN | SettingsPage.tsx:37 |
| 6 | POST | /users/:id/password | SUPER_ADMIN | No direct call |

### 1.31 ReportsController
**File:** D:\meter\Meter\backend\src\reports\reports.controller.ts

| # | Method | Path | Roles | Frontend Consumer |
|---|--------|------|-------|-------------------|
| 1 | GET | /reports | OPERATOR,ADMIN,SUPER_ADMIN | No direct call |
| 2 | GET | /reports/generate/:type | Same | ReportsPage.tsx:79,91 |
| 3 | GET | /reports/:id | Same | No direct call |
| 4 | POST | /reports | Same | No direct call |
| 5 | PATCH | /reports/:id | ADMIN,SUPER_ADMIN | No direct call |
| 6 | DELETE | /reports/:id | SUPER_ADMIN | No direct call |

### 1.32 DownloadsController
**File:** D:\meter\Meter\backend\src\downloads\downloads.controller.ts

| # | Method | Path | Roles | Frontend Consumer |
|---|--------|------|-------|-------------------|
| 1 | POST | /downloads/table/csv | OPERATOR,ADMIN,SUPER_ADMIN | No direct call |
| 2 | POST | /downloads/table/pdf | Same | No direct call |
| 3 | GET | /downloads/invoices/:id/pdf | +FINANCE | InvoicesPage.tsx:80, InvoiceDetailPage.tsx:62 |
| 4 | GET | /downloads/invoices/:id/csv | Same | No direct call |

### 1.33 BillCycleController
**File:** D:\meter\Meter\backend\src\bill-cycle\bill-cycle.controller.ts

| # | Method | Path | Roles | Frontend Consumer |
|---|--------|------|-------|-------------------|
| 1 | POST | /bill-cycle | OPERATOR,ADMIN,SUPER_ADMIN | No direct call |
| 2 | GET | /bill-cycle | Same | No direct call |
| 3 | GET | /bill-cycle/:id | Same | No direct call |
| 4 | POST | /bill-cycle/:id/start | Same | No direct call |
| 5 | POST | /bill-cycle/:id/generate | Same | No direct call |
| 6 | POST | /bill-cycle/:id/post | ADMIN,SUPER_ADMIN | No direct call |
| 7 | POST | /bill-cycle/:id/cancel | Same | No direct call |
## 2. Service Inventory (43 services)

| # | Service File | Primary Controller Consumer(s) | Has Prisma |
|---|-------------|------------------------------|-----------|
| 1 | admin/admin.service.ts | AdminController | Yes (raw SQL) |
| 2 | audit/audit.service.ts | AuditInterceptor (global) | Yes |
| 3 | audit/security-audit.service.ts | None directly | Yes |
| 4 | auth/password-policy.service.ts | None directly | No |
| 5 | auth/refresh-token.service.ts | AuthController | Yes |
| 6 | auth/user-access.service.ts | Customers,Search,Invoices,Collections | Yes |
| 7 | billing/calculation-engine.service.ts | Internal | Unknown |
| 8 | billing/ledger.service.ts | BillingController | Yes |
| 9 | billing/periods/period.service.ts | BillingController | Yes |
| 10 | billing/tariff-engine.service.ts | BillingController | Yes |
| 11 | billing/tariff-calculation.service.ts | Internal | Unknown |
| 12 | billing/tariffs/tariff.service.ts | BillingController | Yes |
| 13 | common/database/database.service.ts | All (shared) | Yes |
| 14 | common/database/prisma.service.ts | All (shared) | Yes |
| 15 | customers/customer-360.service.ts | CustomersController | Yes |
| 16 | customers/customers.service.ts | CustomersController | Yes |
| 17 | downloads/downloads.service.ts | DownloadsController | No (PDF gen) |
| 18 | idempotency/idempotency.service.ts | IdempotencyInterceptor | No (in-memory) |
| 19 | invoices/invoice-renderer.service.ts | Internal | No |
| 20 | invoices/invoice-template.service.ts | InvoicesController | No |
| 21 | kpi/kpi.service.ts | KpiController | Yes |
| 22 | meters/meters.service.ts | MetersController | Yes |
| 23 | notifications/notifications.service.ts | NotificationsController + others | Yes |
| 24 | payments/payment-receipt.service.ts | CollectionsController | No (PDF) |
| 25 | payments/payments.service.ts | PaymentsController | Yes |
| 26 | projects/dashboard/dashboard.service.ts | DashboardController | Yes |
| 27 | projects/locations/locations.service.ts | LocationsController | Yes |
| 28 | projects/projects.service.ts | ProjectsController | Yes |
| 29 | projects/thresholds/threshold.service.ts | ReadingsService (internal) | Yes |
| 30 | readings/polling/poller.service.ts | Background job | Yes |
| 31 | readings/readings.service.ts | ReadingsController | Yes |
| 32 | readings/water-balance/water-balance.service.ts | WaterBalance,Billing | Yes |
| 33 | reports/report-generation.service.ts | ReportsController | Yes |
| 34 | reports/reports.service.ts | ReportsController | Yes |
| 35 | search/search.service.ts | SearchController | Yes |
| 36 | settings/settings.service.ts | SettingsController | Yes |
| 37 | sim-cards/sim-cards.service.ts | SimCardsController | Yes |
| 38 | solar/solar-wallet.service.ts | None directly | Yes |
| 39 | support/support.service.ts | SupportController | Yes |
| 40 | tickets/tickets.service.ts | TicketsController | Yes |
| 41 | upload/import.service.ts | UploadController | Yes |
| 42 | upload/upload.service.ts | UploadController | Yes |
| 43 | wallet/wallet.service.ts | WalletController | Yes |
## 3. DTO/Validation Inventory (29 files)

| # | DTO File | Validation Decorators |
|---|---------|---------------------|
| 1 | create-customer.dto.ts | @IsString, @IsEmail, @IsEnum |
| 2 | update-customer.dto.ts | @IsOptional, @IsString, @IsEmail, @IsEnum |
| 3 | transfer-ownership.dto.ts | @IsUUID, @IsString, @IsOptional, @IsArray |
| 4 | customer-response.dto.ts | Swagger only (no validation) |
| 5 | reverse-payment.dto.ts | @IsString, @IsNotEmpty |
| 6 | create-meter.dto.ts | @IsString, @IsUUID, @IsDateString, @IsOptional, @IsEnum, @IsBoolean |
| 7 | update-meter.dto.ts | @IsOptional + all above |
| 8 | assign-meter.dto.ts | @IsUUID, @IsDateString, @IsOptional, @IsString |
| 9 | terminate-meter.dto.ts | @IsString, @IsDateString, @IsNumber |
| 10 | query-meter.dto.ts | @IsOptional, @IsUUID, @IsEnum, @IsString |
| 11 | meter-response.dto.ts | Swagger only |
| 12 | meter-assignment.dto.ts | Swagger only |
| 13 | create-reading.dto.ts | @IsUUID, @IsNumber, @IsDateString, @IsEnum, @IsOptional, @IsObject |
| 14 | reading-response.dto.ts | Swagger only |
| 15 | water-balance.dto.ts | Type-only (no validation) |
| 16 | create-sim-card.dto.ts | @IsString, @IsEnum |
| 17 | update-sim-card.dto.ts | @IsOptional + all above + @IsDateString |
| 18 | query-sim-card.dto.ts | @IsOptional, @IsString, @IsEnum |
| 19 | sim-eligibility.dto.ts | Swagger only |
| 20 | sim-card-response.dto.ts | Swagger only |
| 21 | create-project.dto.ts | @IsString, @IsBoolean, @IsOptional, @IsNumber, @Min, @IsEnum |
| 22 | update-project.dto.ts | @IsOptional + all above |
| 23 | project-response.dto.ts | Swagger only |
| 24 | create-location.dto.ts | @IsEnum, @IsString, @IsOptional |
| 25 | update-location.dto.ts | @IsOptional, @IsString, @IsEnum |
| 26 | location-response.dto.ts | Swagger only |
| 27 | kpi-summary.dto.ts | Swagger only |
| 28 | consumption-trend.dto.ts | Swagger only |
| 29 | recent-activity.dto.ts | Swagger only |

**Note:** 12 of 29 DTOs are response-only (no validation decorators).
## 4. Guard/Interceptor/Middleware Inventory (12 files)
### 4.1 Guards (6 files)
| # | File | Scope | What It Protects |
| 1 | auth/roles.guard.ts | Module-scoped | Enforces @Roles() decorator
| 2 | auth/global-auth.guard.ts | APP_GUARD global | JWT auth, @Public() bypass
| 3 | auth/area.guard.ts | APP_GUARD global | x-area-id header enforcement
| 4 | auth/permissions.guard.ts | Module-scoped | Permission-based access
| 5 | auth/project-access.guard.ts | Module-scoped | @RequireProjectAccess() decorator
| 6 | common/http/csrf.guard.ts | Not global | CSRF token validation

### 4.2 Interceptors (3 files)

| # | File | Scope | What It Does |
|---|------|-------|-------------|
| 1 | audit/audit.interceptor.ts | APP_INTERCEPTOR global | Auto-audit POST/PUT/PATCH/DELETE
| 2 | common/interceptors/project-access.interceptor.ts | APP_INTERCEPTOR global | Validate project access on all routes
| 3 | idempotency/idempotency.interceptor.ts | Module-scoped | x-idempotency-key deduplication

### 4.3 Middleware (3 files)

| # | File | Applied To | What It Does |
|---|------|-----------|-------------|
| 1 | common/http/correlation.middleware.ts | All routes | x-correlation-id header
| 2 | auth/access-context.middleware.ts | All routes | Attaches userAccess context to request
| 3 | auth/area.middleware.ts | NOT REGISTERED | Duplicate of AreaGuard - never applied

### Global Protection Chain (order in AppModule)

1. CorrelationMiddleware (all routes)
2. AccessContextMiddleware (all routes)
3. ThrottlerGuard (APP_GUARD - 100 req/60s rate limit)
4. GlobalAuthGuard (APP_GUARD - JWT + @Public bypass)
5. AreaGuard (APP_GUARD - area isolation)
6. AuditInterceptor (APP_INTERCEPTOR - audit logging)
7. ProjectAccessInterceptor (APP_INTERCEPTOR - project scoping)

---

## 5. Unused Endpoint Detection

### 5.1 Backend Endpoints with NO Frontend Consumer

| # | Controller | Method | Path | Notes |
|---|-----------|--------|------|-------|
| 1 | AppController | GET | /health | Health check, not called by FE
| 2 | AuthController | GET | /auth/csrf-token | CSRF token, not consumed
| 3 | AdminController | GET | /admin/tables | Admin panel, not directly called
| 4 | CustomersController | GET | projects/:id/customers/:id/360 | Customer 360 view - not wired
| 5 | CustomersController | POST | projects/:id/customers/:id/transfer-ownership | Ownership transfer - not wired
| 6 | ReadingsController | GET | /readings/review-queue | Review queue - NOT called
| 7 | ReadingsController | POST | /readings/:id/approve | Approve reading - NOT called
| 8 | ReadingsController | POST | /readings/:id/reject | Reject reading - NOT called
| 9 | BillingController | POST | /invoices/generate | Generate invoices - NOT called
| 10 | BillingController | PATCH | /invoices/:id | Update invoice metadata
| 11 | BillingController | POST | /invoices/:id/cancel | Cancel invoice
| 12 | BillingController | POST | /invoices/:id/adjustments | Add adjustment to invoice
| 13 | BillingController | GET | /tariffs | List tariffs
| 14 | BillingController | POST | /periods | Create billing period
| 15 | BillingController | GET | /periods | List billing periods
| 16 | BillingController | POST | /tariffs/simulate | Simulate tariff calculation
| 17 | InvoicesController | POST | /invoices/batch-download | Batch download invoices
| 18 | PaymentsController | PATCH | /payments/:id | Update payment notes
| 19 | PaymentsController | DELETE | /payments/:id | Delete pending payment
| 20 | PaymentsController | POST | /payments/:id/reverse | Reverse payment
| 21 | CollectionsController | GET | /collections/dashboard | Collections KPI (x2 duplicate)
| 22 | CollectionsController | GET | /collections/payments/:id/receipt | Payment receipt PDF
| 23 | CollectionsController | GET | /collections/aging | Aging summary
| 24 | LocationsController | GET | projects/:id/locations/:id | Single location detail
| 25 | LocationsController | PATCH | projects/:id/locations/:id | Update location
| 26-31 | WalletController | 4/6 | /wallet/* | Most wallet endpoints
| 32-36 | ChilledWaterController | ALL 5 | /chilled-water/* | ENTIRE MODULE unused
| 37-42 | SolarController | ALL 6 | /solar/* | ENTIRE MODULE unused
| 43 | SearchController | GET | /search | Global search - NOT called
| 44-46 | SettingsController | ALL 3 | /settings* | Entire settings module unused
| 47-49 | SimCardsController | POST/PATCH/DELETE | /sim-cards mutations | CRUD operations
| 50-54 | SupportController | 5/6 | /support* | Most support endpoints
| 55-59 | ReportsController | 5/6 | /reports* | Only generate endpoint used
| 60-61 | DownloadsController | POST | /downloads/table/* | Table export endpoints
| 62 | DownloadsController | GET | /downloads/invoices/:id/csv | Invoice CSV export
| 63-69 | BillCycleController | ALL 7 | /bill-cycle/* | ENTIRE MODULE unused
| 70-77 | RegistrationController | 6/8 | /registration/*, /user-groups/* | Admin endpoints
| 78-83 | TicketsController | 6/8 | /tickets/* | Detailed ticket operations
| 84-85 | UploadController | POST | /upload/customers, /upload/meters | Bulk import
| 86-88 | UsersController | 3/6 | /users/* | User management ops
| 89 | AreaController | PATCH | /areas/:id | Update area

### 5.2 Frontend API Calls with NO Backend Endpoint (MISSING)

| # | Frontend File | API Call | Backend Match | Status |
|---|--------------|----------|---------------|--------|
| 1 | WorkplacePage.tsx:21 | GET /audit/logs | No controller/endpoint exists | MISSING - 404 ERROR |
| 2 | TariffStudioPage.tsx:45 | DELETE /tariffs/:id | No DELETE endpoint exists | MISSING - 404 ERROR |

---

## 6. Summary Counts

| Category | Count |
|----------|-------|
| **Controllers** | **34** |
| **Total HTTP Endpoints** | **~135** |
| - with @Public() | 8 |
| - with @Roles() | 127 |
| - with @Audit() | 20 |
| - with NO frontend consumer | ~90 |
| **Services** | **43** |
| - with Prisma calls | ~40 |
| - without Prisma | ~3 |
| **DTO Files** | **29** |
| - with validation decorators | 17 |
| - response-only (no validation) | 12 |
| **Guards** | **6** (3 global, 3 module-scoped) |
| **Interceptors** | **3** (2 global, 1 module-scoped) |
| **Middleware** | **3** (2 applied, 1 not registered) |

### Critical Issues Found

1. **DUPLICATE ROUTE**: `/collections/dashboard` defined twice in collections.controller.ts (lines 26 and 109) - second silently overrides first
2. **MISSING ENDPOINT**: Frontend calls GET `/audit/logs` (WorkplacePage.tsx:21) but no controller exists - will return 404
3. **MISSING ENDPOINT**: Frontend calls DELETE `/tariffs/:id` (TariffStudioPage.tsx:45) but no such endpoint exists
4. **UNUSED MIDDLEWARE**: area.middleware.ts is defined but never registered in AppModule (AreaGuard covers same concern)
5. **IN-MEMORY IDEMPOTENCY**: IdempotencyService uses in-memory Map - data lost on server restart
6. **UNWIRED MODULES**: ChilledWater (5 endpoints), Solar (6 endpoints), BillCycle (7 endpoints) have ZERO frontend consumers
7. **MISALIGNED BILLING TARIFF ENDPOINTS**: Frontend calls /tariffs directly but backend serves it under BillingController at same path - works but confusing
8. **12 RESPONSE-ONLY DTOs**: Lack validation decorators - serve only as OpenAPI schema definitions

---

*End of Audit Report*
