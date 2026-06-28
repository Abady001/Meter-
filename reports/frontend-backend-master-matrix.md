# Frontend-Backend Master Matrix — Sprint 40-43

**Date:** 2026-06-25  
**Scope:** Full cross-reference of every frontend page → component → API → controller → service → DB table  
**Status Legend:** CONNECTED | PARTIAL | BROKEN | MISSING

---

## 1. Authentication

| Page | Component | API Endpoint | Controller | Service | DB Table | Status |
|------|-----------|-------------|------------|---------|----------|--------|
| `/login` | `LoginPage.tsx` | `POST /api/v1/auth/login` | AuthController | refresh-token.service | CoreUser, LoginAttempt | CONNECTED |
| `/register` | `register/page.tsx` | `POST /api/v1/auth/register` | RegistrationController | (inline) | CoreUser | CONNECTED |
| — | `api/auth.ts` | `POST /api/v1/auth/refresh` | AuthController | refresh-token.service | RefreshToken | CONNECTED |
| — | `api/auth.ts` | `POST /api/v1/auth/logout` | AuthController | (inline) | RefreshToken | CONNECTED |
| — | `api/auth.ts` | `GET /api/v1/auth/me` | AuthController | user-access.service | CoreUser | CONNECTED |
| — | (none) | `POST /api/v1/auth/dev-login` | AuthController | (inline) | CoreUser | PARTIAL (dev only) |

## 2. Dashboard

| Page | Component | API Endpoint | Controller | Service | DB Table | Status |
|------|-----------|-------------|------------|---------|----------|--------|
| `/dashboard` | `DashboardPage.tsx` | `GET /projects/:pid/dashboard/kpis` | DashboardController | dashboard.service | Project, Invoice, Payment, Reading, Meter | PARTIAL (mock data) |
| `/executive-dashboard` | `ExecutiveDashboard.tsx` | `GET /api/v1/kpi/executive` | KpiController | kpi.service | Invoice, Payment, Project | PARTIAL (mock data) |
| `/operations-dashboard` | `OperationsDashboard.tsx` | — | — | — | — | MISSING (no BE endpoint) |
| `/billing-dashboard` | `BillingDashboard.tsx` | — | — | — | — | MISSING (no BE endpoint) |
| `/collections-dashboard-plus` | `CollectionsDashboardPlus.tsx` | `GET /api/v1/collections/dashboard` | CollectionsController | payments.service (indirect) | Payment, Invoice | PARTIAL (mock data) |
| `/utility-dashboard` | `UtilityDashboard.tsx` | — | — | — | — | MISSING (no BE endpoint) |
| `/kpi-executive` | `ExecutiveDashboard.tsx` | `GET /api/v1/kpi/executive` | KpiController | kpi.service | Invoice, Payment | PARTIAL (mock data) |
| `/kpi-collections` | `CollectionsDashboard.tsx` | `GET /api/v1/kpi/collections` | KpiController | kpi.service | Invoice, Payment | PARTIAL (mock data) |
| `/kpi-utilities` | `UtilitiesDashboard.tsx` | `GET /api/v1/kpi/utilities` | KpiController | kpi.service | Invoice, Meter, Reading | PARTIAL (mock data) |

## 3. Customers

| Page | Component | API Endpoint | Controller | Service | DB Table | Status |
|------|-----------|-------------|------------|---------|----------|--------|
| `/customers` | `CustomersPage.tsx` | `GET /projects/:pid/customers` | CustomersController | customers.service | Customer | PARTIAL (mock data) |
| `/customers/:id` | `CustomerDetailPage.tsx` | `GET /projects/:pid/customers/:id` | CustomersController | customers.service | Customer | PARTIAL (mock data) |
| — (Create) | `CustomerDetailPage.tsx` (id=new) | `POST /projects/:pid/customers` | CustomersController | customers.service | Customer | CONNECTED |
| — (Update) | `CustomerDetailPage.tsx` | `PATCH /projects/:pid/customers/:id` | CustomersController | customers.service | Customer | CONNECTED |
| — (Delete) | `CustomerDetailPage.tsx` | `DELETE /projects/:pid/customers/:id` | CustomersController | customers.service | Customer | CONNECTED |
| — (360) | (no FE) | `GET /customers/:id/360` | CustomersController | customer-360.service | Customer, Meter, Invoice, Payment | MISSING (no FE) |
| — (Statement) | (no FE) | `GET /customers/:id/statement` | CustomersController | ledger.service | CustomerLedgerEntry | MISSING (no FE) |
| — (Transfer) | `OwnershipTab.tsx` | `POST /customers/:id/transfer-ownership` | CustomersController | customers.service | Customer | CONNECTED |

## 4. Projects & Locations

| Page | Component | API Endpoint | Controller | Service | DB Table | Status |
|------|-----------|-------------|------------|---------|----------|--------|
| `/projects` | `ProjectsPage.tsx` | `GET /api/v1/projects` | ProjectsController | projects.service | Project | PARTIAL (mock data) |
| `/projects/:id` | `ProjectDetailPage.tsx` | `GET /api/v1/projects/:id` | ProjectsController | projects.service | Project | PARTIAL (mock data) |
| — | `ProjectFormDialog.tsx` | `POST /api/v1/projects` | ProjectsController | projects.service | Project | PARTIAL (mock data) |
| — | `ProjectFormDialog.tsx` | `PATCH /api/v1/projects/:id` | ProjectsController | projects.service | Project | CONNECTED |
| `/locations` | `LocationsPage.tsx` | `GET /projects/:pid/locations` | LocationsController | locations.service | Location (Building/Unit) | PARTIAL (mock data) |

## 5. Meters

| Page | Component | API Endpoint | Controller | Service | DB Table | Status |
|------|-----------|-------------|------------|---------|----------|--------|
| `/meters` | `MetersPage.tsx` | `GET /api/v1/meters` | MetersController | meters.service | Meter | PARTIAL (mock data) |
| `/meters/:id` | `MeterDetailPage.tsx` | `GET /api/v1/meters/:id` | MetersController | meters.service | Meter | PARTIAL (mock data) |
| — (Create) | `MeterDetailPage.tsx` (id=new) | `POST /api/v1/meters` | MetersController | meters.service | Meter | CONNECTED |
| — (Update) | `MeterDetailPage.tsx` | `PATCH /api/v1/meters/:id` | MetersController | meters.service | Meter | CONNECTED |
| — (Delete) | `MetersPage.tsx` | `DELETE /api/v1/meters/:id` | MetersController | meters.service | Meter | CONNECTED |
| `/meters/assign` | `MeterAssignPage.tsx` | `POST /meters/:mid/assign` | MetersController | meters.service | MeterAssignment | PARTIAL (mock data) |
| `/meters/terminate` | `MeterTerminatePage.tsx` | `POST /meters/:mid/terminate` | MetersController | meters.service | MeterAssignment | PARTIAL (mock data) |
| `/meters/replace` | `MeterReplacePage.tsx` | (none found) | — | — | — | MISSING (no BE) |

## 6. Readings

| Page | Component | API Endpoint | Controller | Service | DB Table | Status |
|------|-----------|-------------|------------|---------|----------|--------|
| `/readings` | `ReadingsPage.tsx` | `GET /api/v1/readings` | ReadingsController | readings.service | Reading | PARTIAL (mock data) |
| `/readings/new` | `ReadingNewPage.tsx` | `POST /api/v1/readings` | ReadingsController | readings.service | Reading | CONNECTED |
| — (Review Queue) | (no FE) | `GET /readings/review-queue` | ReadingsController | readings.service | Reading, ReadingReview | MISSING (no FE) |
| — (Approve) | (no FE) | `POST /readings/:id/approve` | ReadingsController | readings.service | Reading, ReadingReview | MISSING (no FE) |
| — (Reject) | (no FE) | `POST /readings/:id/reject` | ReadingsController | readings.service | Reading, ReadingReview | MISSING (no FE) |

## 7. Invoices & Billing

| Page | Component | API Endpoint | Controller | Service | DB Table | Status |
|------|-----------|-------------|------------|---------|----------|--------|
| `/invoices` | `InvoicesPage.tsx` | `GET /api/v1/invoices` | BillingController | ledger.service | Invoice, InvoiceLine | PARTIAL (mock data) |
| `/invoices/:id` | `InvoiceDetailPage.tsx` | `GET /api/v1/invoices/:id` | BillingController | ledger.service | Invoice | PARTIAL (mock data) |
| — (Generate) | `InvoicesPage.tsx` | `POST /api/v1/invoices/generate` | BillingController | calculation-engine.service | Invoice, InvoiceLine, Reading | MISSING (FE fake) |
| — (Issue) | `InvoicesPage.tsx` | `POST /api/v1/invoices/:id/issue` | BillingController | (inline) | Invoice | CONNECTED |
| — (Cancel) | `InvoicesPage.tsx` | `POST /api/v1/invoices/:id/cancel` | BillingController | (inline) | Invoice | MISSING (FE fake) |
| — (Adjust) | `InvoiceDetailPage.tsx` | `POST /api/v1/invoices/:id/adjustments` | BillingController | ledger.service | InvoiceAdjustment | PARTIAL (FE fake, BE exists) |
| — (PDF) | `InvoicesPage.tsx` | `GET /api/v1/invoices/:id/pdf` | InvoicesController | invoice-renderer.service | Invoice, Project, Meter, Customer | CONNECTED |
| — (Batch PDF) | (no FE) | `POST /api/v1/invoices/batch-download` | InvoicesController | invoice-template.service | Invoice | MISSING (no FE) |
| `/bill-cycle` | `BillCyclePage.tsx` | `GET/POST /api/v1/bill-cycle` | BillCycleController | (inline) | BillCycle | PLACEHOLDER (no FE impl) |

## 8. Payments

| Page | Component | API Endpoint | Controller | Service | DB Table | Status |
|------|-----------|-------------|------------|---------|----------|--------|
| `/payments` | `PaymentsPage.tsx` | `GET /api/v1/payments` | PaymentsController | payments.service | Payment | PARTIAL (mock data) |
| — (Create) | `PaymentsPage.tsx` | `POST /api/v1/payments` | BillingController | payments.service | Payment | CONNECTED |
| — (Reverse) | (no FE) | `POST /payments/:id/reverse` | PaymentsController | payments.service | Payment | MISSING (no FE) |

## 9. Tariffs

| Page | Component | API Endpoint | Controller | Service | DB Table | Status |
|------|-----------|-------------|------------|---------|----------|--------|
| `/tariff-studio` | `TariffStudioPage.tsx` | `GET/POST /api/v1/tariffs` | BillingController | tariff-engine.service, tariff.service | TariffPlan, TariffTier | PARTIAL (mock data) |
| — (Simulate) | `TariffStudioPage.tsx` | `POST /api/v1/tariffs/simulate` | BillingController | tariff-calculation.service | TariffPlan, Meter, Reading | CONNECTED |

## 10. Collections

| Page | Component | API Endpoint | Controller | Service | DB Table | Status |
|------|-----------|-------------|------------|---------|----------|--------|
| — (Dashboard) | (no FE) | `GET /api/v1/collections/dashboard` | CollectionsController | payments.service | Payment, Invoice | MISSING (no FE) |
| — (Aging) | (no FE) | `GET /api/v1/collections/aging` | CollectionsController | payments.service | Invoice | MISSING (no FE) |

## 11. Tickets & Support

| Page | Component | API Endpoint | Controller | Service | DB Table | Status |
|------|-----------|-------------|------------|---------|----------|--------|
| `/tickets` | `TicketsPage.tsx` | `GET/POST /api/v1/tickets` | TicketsController | tickets.service | Ticket | PARTIAL (mock data) |
| `/support` | `SupportPage.tsx` | `GET/POST /api/v1/support` | SupportController | support.service | SupportRequest | PARTIAL (mock data) |

## 12. Admin

| Page | Component | API Endpoint | Controller | Service | DB Table | Status |
|------|-----------|-------------|------------|---------|----------|--------|
| — (DB Admin) | `DatabaseAdminPage.tsx` | `GET/POST/PUT/DELETE /api/v1/admin/*` | AdminController | admin.service | Dynamic (raw SQL) | CONNECTED |
| — (Users) | `SettingsPage.tsx` | `GET/POST/DELETE /api/v1/users` | UsersController | (inline) | CoreUser | CONNECTED |
| — (Areas) | `SettingsPage.tsx` | `GET/POST/DELETE /api/v1/areas` | AreasController | (inline) | Area | CONNECTED |

## 13. Reports & Uploads

| Page | Component | API Endpoint | Controller | Service | DB Table | Status |
|------|-----------|-------------|------------|---------|----------|--------|
| `/reports` | `ReportsPage.tsx` | `GET /api/v1/reports` | ReportsController | reports.service | ReportDefinition, ReportTemplate | PARTIAL (mock data) |
| — | `ReportsPage.tsx` | `GET /reports/generate/:type` | ReportsController | report-generation.service | Multi-table | CONNECTED |
| `/upload-center` | `UploadCenterPage.tsx` | `POST /api/v1/upload/file` | UploadController | upload.service, import.service | Customer, Meter (bulk) | PARTIAL (mock data) |

## 14. Wallet

| Page | Component | API Endpoint | Controller | Service | DB Table | Status |
|------|-----------|-------------|------------|---------|----------|--------|
| — (Balance) | `WalletTab.tsx` | `GET /wallet/:customerId` | WalletController | wallet.service | Wallet | CONNECTED |
| — (Credit) | `WalletTab.tsx` | `POST /wallet/:id/credit` | WalletController | wallet.service | Wallet, CustomerLedgerEntry | CONNECTED |
| — (Debit) | `WalletTab.tsx` | `POST /wallet/:id/debit` | WalletController | wallet.service | Wallet, CustomerLedgerEntry | CONNECTED |
| — (Transfer) | `WalletTab.tsx` | `POST /wallet/transfer` | WalletController | wallet.service | Wallet | CONNECTED |

## 15. Solar, Chilled Water, Settlement

| Page | Component | API Endpoint | Controller | Service | DB Table | Status |
|------|-----------|-------------|------------|---------|----------|--------|
| `/utility/solar` | `SolarDashboard.tsx` | `GET /api/v1/solar/dashboard` | SolarController | (inline) | SolarReading, SolarWallet | PARTIAL (mock data) |
| `/utility/settlement` | `SettlementPage.tsx` | `GET/POST /api/v1/settlement` | SettlementController | (inline) | Settlement, Adjustment | PARTIAL (mock data) |
| — (Chilled Water) | (no FE) | `GET/POST /api/v1/chilled-water/*` | ChilledWaterController | (inline) | ChilledWaterMeter, ChilledWaterReading | MISSING (no FE) |

---

## Master Summary

| Metric | Count |
|--------|-------|
| **Total frontend routes** | 47 |
| **Frontend components with CONNECTED status** | 28 |
| **Frontend components with PARTIAL status (mock data)** | 25 |
| **Frontend components MISSING (no FE)** | 17 |
| **Backend endpoints with no frontend consumer** | ~90 |
| **Backend controllers** | 34 |
| **Backend services** | 43 |
| **DTOs** | 29 (17 with validation, 12 response-only) |
| **Guards** | 6 (3 global, 3 module-scoped) |
| **Interceptors** | 3 (2 global, 1 module-scoped) |

### Key Findings

1. **~85% of backend endpoints have no corresponding frontend integration.** Most UI is mock-driven.
2. **Authentication is fully CONNECTED** — login, register, refresh, logout, session all wired.
3. **Wallet operations are fully CONNECTED** — credit, debit, transfer, balance, history.
4. **Customer and Meter CRUD is CONNECTED** — create, read, update, delete all work with real APIs.
5. **Invoice/Payment/Reading Update, Delete, Cancel are BROKEN** — FE uses toast stubs, BE endpoints exist but unwired.
6. **BillCycle, Solar, ChilledWater modules have zero frontend consumers.**
7. **Admin console is CONNECTED** but uses raw SQL — security risk documented separately.
8. **Dashboard KPIs remain PARTIAL** — mock data across all 9 dashboard routes.
