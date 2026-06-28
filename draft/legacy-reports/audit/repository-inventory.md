# Meter Verse — Complete Repository Inventory

> Generated: 2026-06-25
> Scope: Full codebase audit of backend (NestJS), frontend (Next.js), Prisma schema, and root config files.

---

## 1. BACKEND (backend/src/)

### 1.1 Directory Structure

`
backend/src/
├── admin/                  (2 files: controller, module, service)
├── app.controller.ts
├── app.module.ts
├── areas/                  (2 files: controller, module)
├── audit/                  (3 files: module, service, interceptor)
├── auth/                   (10+ files: controller, module, guards, strategies, services, interfaces, decorators, types)
├── bill-cycle/             (2 files: controller, module)
├── billing/                (8 files: controller, module, services)
│   ├── periods/
│   └── tariffs/
├── chilled-water/          (2 files: controller, module)
├── collections/            (2 files: controller, module)
├── common/                 (5 files: config, database, http, interceptors)
├── customers/              (6 files: controller, module, service, 4 DTOs)
├── downloads/              (2 files: controller, module)
├── idempotency/            (3 files: module, service, interceptor)
├── invoices/               (4 files: controller, module, 2 services)
├── kpi/                    (2 files: controller, module)
├── main.ts
├── meters/                 (11 files: controller, module, service, 7 DTOs)
├── notifications/          (2 files: controller, module)
├── payments/               (4 files: controller, module, 2 services)
├── projects/               (12+ files: controller, module, services)
│   ├── dashboard/          (controller, module, service, 3 DTOs)
│   ├── locations/          (controller, module, service, 3 DTOs)
│   └── thresholds/         (module, service)
├── readings/               (9 files: controller, module, service)
│   ├── polling/            (module, service)
│   └── water-balance/      (controller, module, service, DTO)
├── registration/           (2 files: controller, module)
├── reports/                (3 files: controller, module, 2 services)
├── search/                 (2 files: controller, module)
├── settings/               (2 files: controller, module)
├── settlement/             (2 files: controller, module)
├── sim-cards/              (7 files: controller, module, service, 5 DTOs)
├── solar/                  (3 files: controller, module, service)
├── support/                (2 files: controller, module)
├── tickets/                (2 files: controller, module)
├── unit-types/             (2 files: controller, module)
├── upload/                 (3 files: controller, module, 2 services)
├── users/                  (2 files: controller, module)
├── wallet/                 (2 files: controller, module)
└── types/                  (type definitions)
`

### 1.2 Controllers (33 files)

| # | File Path |
|---|-----------|
| 1 | backend/src/admin/admin.controller.ts |
| 2 | backend/src/app.controller.ts |
| 3 | backend/src/areas/areas.controller.ts |
| 4 | backend/src/auth/auth.controller.ts |
| 5 | backend/src/bill-cycle/bill-cycle.controller.ts |
| 6 | backend/src/billing/billing.controller.ts |
| 7 | backend/src/chilled-water/chilled-water.controller.ts |
| 8 | backend/src/collections/collections.controller.ts |
| 9 | backend/src/customers/customers.controller.ts |
| 10 | backend/src/downloads/downloads.controller.ts |
| 11 | backend/src/invoices/invoices.controller.ts |
| 12 | backend/src/kpi/kpi.controller.ts |
| 13 | backend/src/meters/meters.controller.ts |
| 14 | backend/src/notifications/notifications.controller.ts |
| 15 | backend/src/payments/payments.controller.ts |
| 16 | backend/src/projects/dashboard/dashboard.controller.ts |
| 17 | backend/src/projects/locations/locations.controller.ts |
| 18 | backend/src/projects/projects.controller.ts |
| 19 | backend/src/readings/readings.controller.ts |
| 20 | backend/src/readings/water-balance/water-balance.controller.ts |
| 21 | backend/src/registration/registration.controller.ts |
| 22 | backend/src/reports/reports.controller.ts |
| 23 | backend/src/search/search.controller.ts |
| 24 | backend/src/settings/settings.controller.ts |
| 25 | backend/src/settlement/settlement.controller.ts |
| 26 | backend/src/sim-cards/sim-cards.controller.ts |
| 27 | backend/src/solar/solar.controller.ts |
| 28 | backend/src/support/support.controller.ts |
| 29 | backend/src/tickets/tickets.controller.ts |
| 30 | backend/src/unit-types/unit-types.controller.ts |
| 31 | backend/src/upload/upload.controller.ts |
| 32 | backend/src/users/users.controller.ts |
| 33 | backend/src/wallet/wallet.controller.ts |

### 1.3 Services (43 files)

| # | File Path |
|---|-----------|
| 1 | backend/src/admin/admin.service.ts |
| 2 | backend/src/audit/audit.service.ts |
| 3 | backend/src/audit/security-audit.service.ts |
| 4 | backend/src/auth/password-policy.service.ts |
| 5 | backend/src/auth/refresh-token.service.ts |
| 6 | backend/src/auth/user-access.service.ts |
| 7 | backend/src/billing/calculation-engine.service.ts |
| 8 | backend/src/billing/ledger.service.ts |
| 9 | backend/src/billing/tariff-calculation.service.ts |
| 10 | backend/src/billing/tariff-engine.service.ts |
| 11 | backend/src/billing/periods/period.service.ts |
| 12 | backend/src/billing/tariffs/tariff.service.ts |
| 13 | backend/src/common/database/database.service.ts |
| 14 | backend/src/common/database/prisma.service.ts |
| 15 | backend/src/customers/customer-360.service.ts |
| 16 | backend/src/customers/customers.service.ts |
| 17 | backend/src/downloads/downloads.service.ts |
| 18 | backend/src/idempotency/idempotency.service.ts |
| 19 | backend/src/invoices/invoice-renderer.service.ts |
| 20 | backend/src/invoices/invoice-template.service.ts |
| 21 | backend/src/kpi/kpi.service.ts |
| 22 | backend/src/meters/meters.service.ts |
| 23 | backend/src/notifications/notifications.service.ts |
| 24 | backend/src/payments/payment-receipt.service.ts |
| 25 | backend/src/payments/payments.service.ts |
| 26 | backend/src/projects/dashboard/dashboard.service.ts |
| 27 | backend/src/projects/locations/locations.service.ts |
| 28 | backend/src/projects/projects.service.ts |
| 29 | backend/src/projects/thresholds/threshold.service.ts |
| 30 | backend/src/readings/polling/poller.service.ts |
| 31 | backend/src/readings/readings.service.ts |
| 32 | backend/src/readings/water-balance/water-balance.service.ts |
| 33 | backend/src/reports/report-generation.service.ts |
| 34 | backend/src/reports/reports.service.ts |
| 35 | backend/src/search/search.service.ts |
| 36 | backend/src/settings/settings.service.ts |
| 37 | backend/src/sim-cards/sim-cards.service.ts |
| 38 | backend/src/solar/solar-wallet.service.ts |
| 39 | backend/src/support/support.service.ts |
| 40 | backend/src/tickets/tickets.service.ts |
| 41 | backend/src/upload/import.service.ts |
| 42 | backend/src/upload/upload.service.ts |
| 43 | backend/src/wallet/wallet.service.ts |

### 1.4 Modules (40 files)

| # | File Path |
|---|-----------|
| 1 | backend/src/admin/admin.module.ts |
| 2 | backend/src/app.module.ts |
| 3 | backend/src/areas/areas.module.ts |
| 4 | backend/src/audit/audit.module.ts |
| 5 | backend/src/auth/auth.module.ts |
| 6 | backend/src/bill-cycle/bill-cycle.module.ts |
| 7 | backend/src/billing/billing.module.ts |
| 8 | backend/src/chilled-water/chilled-water.module.ts |
| 9 | backend/src/collections/collections.module.ts |
| 10 | backend/src/common/config/config.module.ts |
| 11 | backend/src/common/database/database.module.ts |
| 12 | backend/src/customers/customers.module.ts |
| 13 | backend/src/downloads/downloads.module.ts |
| 14 | backend/src/idempotency/idempotency.module.ts |
| 15 | backend/src/invoices/invoices.module.ts |
| 16 | backend/src/kpi/kpi.module.ts |
| 17 | backend/src/meters/meters.module.ts |
| 18 | backend/src/notifications/notifications.module.ts |
| 19 | backend/src/payments/payments.module.ts |
| 20 | backend/src/projects/dashboard/dashboard.module.ts |
| 21 | backend/src/projects/locations/locations.module.ts |
| 22 | backend/src/projects/projects.module.ts |
| 23 | backend/src/projects/thresholds/thresholds.module.ts |
| 24 | backend/src/readings/polling/polling.module.ts |
| 25 | backend/src/readings/readings.module.ts |
| 26 | backend/src/readings/water-balance/water-balance.module.ts |
| 27 | backend/src/registration/registration.module.ts |
| 28 | backend/src/reports/reports.module.ts |
| 29 | backend/src/search/search.module.ts |
| 30 | backend/src/settings/settings.module.ts |
| 31 | backend/src/settlement/settlement.module.ts |
| 32 | backend/src/sim-cards/sim-cards.module.ts |
| 33 | backend/src/solar/solar.module.ts |
| 34 | backend/src/support/support.module.ts |
| 35 | backend/src/tickets/tickets.module.ts |
| 36 | backend/src/unit-types/unit-types.module.ts |
| 37 | backend/src/upload/upload.module.ts |
| 38 | backend/src/users/users.module.ts |
| 39 | backend/src/wallet/wallet.module.ts |
| 40 | backend/src/idempotency/idempotency.module.ts |

### 1.5 DTOs (29 files)

`
backend/src/
├── customers/dto/
│   ├── create-customer.dto.ts
│   ├── customer-response.dto.ts
│   ├── transfer-ownership.dto.ts
│   └── update-customer.dto.ts
├── meters/dto/
│   ├── assign-meter.dto.ts
│   ├── create-meter.dto.ts
│   ├── meter-assignment.dto.ts
│   ├── meter-response.dto.ts
│   ├── query-meter.dto.ts
│   ├── terminate-meter.dto.ts
│   └── update-meter.dto.ts
├── payments/dto/
│   └── reverse-payment.dto.ts
├── projects/dto/
│   ├── create-project.dto.ts
│   ├── project-response.dto.ts
│   └── update-project.dto.ts
├── projects/dashboard/dto/
│   ├── consumption-trend.dto.ts
│   ├── kpi-summary.dto.ts
│   └── recent-activity.dto.ts
├── projects/locations/dto/
│   ├── create-location.dto.ts
│   ├── location-response.dto.ts
│   └── update-location.dto.ts
├── readings/dto/
│   ├── create-reading.dto.ts
│   └── reading-response.dto.ts
├── readings/water-balance/dto/
│   └── water-balance.dto.ts
└── sim-cards/dto/
    ├── create-sim-card.dto.ts
    ├── query-sim-card.dto.ts
    ├── sim-card-response.dto.ts
    ├── sim-eligibility.dto.ts
    └── update-sim-card.dto.ts
`

### 1.6 Guards (6 files)

| # | File Path | Purpose |
|---|-----------|---------|
| 1 | backend/src/auth/global-auth.guard.ts | Global JWT authentication |
| 2 | backend/src/auth/roles.guard.ts | Role-based access (RBAC) |
| 3 | backend/src/auth/permissions.guard.ts | Permission-based access |
| 4 | backend/src/auth/project-access.guard.ts | Project-scoped access |
| 5 | backend/src/auth/area.guard.ts | Area-scoped access |
| 6 | backend/src/common/http/csrf.guard.ts | CSRF protection |

### 1.7 Interceptors (3 files)

| # | File Path | Purpose |
|---|-----------|---------|
| 1 | backend/src/idempotency/idempotency.interceptor.ts | Idempotency key handling |
| 2 | backend/src/audit/audit.interceptor.ts | Append-only audit logging |
| 3 | backend/src/common/interceptors/project-access.interceptor.ts | Project access injection |

### 1.8 Middleware (3 files)

| # | File Path | Purpose |
|---|-----------|---------|
| 1 | backend/src/common/http/correlation.middleware.ts | Correlation ID injection |
| 2 | backend/src/auth/area.middleware.ts | Area context resolution |
| 3 | backend/src/auth/access-context.middleware.ts | User access context resolution |

---

## 2. FRONTEND (Frontend/src/)

### 2.1 Page Components

#### components/dashboard/ (7 pages)
| Component | Route |
|-----------|-------|
| DashboardPage.tsx | /dashboard |
| ExecutiveDashboard.tsx | /executive-dashboard |
| OperationsDashboard.tsx | /operations-dashboard |
| BillingDashboard.tsx | /billing-dashboard |
| CollectionsDashboardPlus.tsx | /collections-dashboard-plus |
| UtilityDashboard.tsx | /utility-dashboard |
| SolarDashboard.tsx | /solar-dashboard |

#### components/billing/ (6 pages)
| Component | Route |
|-----------|-------|
| BalancesPage.tsx | /balances |
| ConsumptionPage.tsx | /consumption |
| InvoiceDetailPage.tsx | /invoices/[id] |
| InvoicesPage.tsx | /invoices |
| PaymentsPage.tsx | /payments |
| WaterBalancePage.tsx | /water-balance |

#### components/customers/ (4 pages + 2 embedded tab components)
| Component | Route |
|-----------|-------|
| CustomersPage.tsx | /customers |
| CustomerDetailPage.tsx | /customers/[id] |
| OwnershipTab.tsx | (embedded in CustomerDetailPage) |
| WalletTab.tsx | (embedded in CustomerDetailPage) |

#### components/meters/ (5 pages)
| Component | Route |
|-----------|-------|
| MetersPage.tsx | /meters |
| MeterDetailPage.tsx | /meters/[id] |
| MeterAssignPage.tsx | /meters/assign |
| MeterReplacePage.tsx | /meters/replace |
| MeterTerminatePage.tsx | /meters/terminate |

#### components/projects/ (4 pages)
| Component | Route |
|-----------|-------|
| ProjectsPage.tsx | /projects |
| ProjectDetailPage.tsx | /projects/[id] |
| ProjectFormDialog.tsx | (dialog) |
| LocationsPage.tsx | /locations |

#### components/readings/ (2 pages)
| Component | Route |
|-----------|-------|
| ReadingsPage.tsx | /readings |
| ReadingNewPage.tsx | /readings/new |

#### components/tickets/ (2 pages)
| Component | Route |
|-----------|-------|
| TicketsPage.tsx | /tickets |
| SupportPage.tsx | /support |

#### components/kpi/ (3 pages)
| Component | Route |
|-----------|-------|
| ExecutiveDashboard.tsx | /kpi-executive |
| CollectionsDashboard.tsx | /kpi-collections |
| UtilitiesDashboard.tsx | /kpi-utilities |

#### components/reports/ (2 pages)
| Component | Route |
|-----------|-------|
| ReportsPage.tsx | /reports |
| SettingsPage.tsx | /settings |

#### Other standalone pages (9)
| Component | Route |
|-----------|-------|
| AlertsPage.tsx | /alerts |
| DatabaseAdminPage.tsx | /admin |
| SettlementPage.tsx | /settlements |
| SimCardsPage.tsx | /sim-cards |
| SyncGatewayPage.tsx | /sync-gateway |
| TariffStudioPage.tsx | /tariff-studio |
| UploadCenterPage.tsx | /upload-center |
| WorkplacePage.tsx | /workplace |
| SmartTable.tsx | (shared table component) |

### 2.2 Shared Components (components/shared/)

| Component | Purpose |
|-----------|---------|
| GlobalSearchDialog.tsx | Global search overlay |
| PageHelpers.tsx | BackButton, StatCard, formatCurrency, formatDate |
| ProtectedAction.tsx | Role-gated action wrapper |
| QueryBoundary.tsx | Loading/error/empty Query wrapper |
| StatusBadge.tsx | Colored status badge |

### 2.3 Layout Components (components/layout/)

| Component | Purpose |
|-----------|---------|
| AppShell.tsx | Main application shell |
| AppSidebar.tsx | Role-filtered sidebar navigation |
| AreaProjectSwitcher.tsx | Area/project selector |
| LocaleLayout.tsx | RTL/LTR layout provider |
| LoginPage.tsx | Authentication page |
| PageHeader.tsx | Standardized page header |
| PagePlaceholder.tsx | Placeholder for unimplemented pages |
| RoleSwitcher.tsx | Dev role-switching tool |
| ThemeProvider.tsx | Theme context provider |
| TopNav.tsx | Top navigation bar |

### 2.4 UI Components (components/ui/ -- 50 shadcn/ui components)

accordion, alert, alert-dialog, aspect-ratio, avatar, badge, breadcrumb, button, calendar, card, carousel, chart, checkbox, collapsible, command, context-menu, dialog, drawer, dropdown-menu, form, hover-card, input, input-otp, label, menubar, navigation-menu, pagination, popover, progress, radio-group, resizable, scroll-area, select, separator, sheet, sidebar, skeleton, slider, sonner, switch, table, tabs, textarea, toast, toaster, toggle, toggle-group, tooltip

### 2.5 Custom Hooks (22 files)

| # | File | Purpose |
|---|------|---------|
| 1 | use-balances.ts | Customer balances |
| 2 | use-consumption.ts | Consumption data |
| 3 | use-create-location.ts | Create location mutation |
| 4 | use-customers.ts | Customer queries |
| 5 | use-dashboard.ts | Dashboard data |
| 6 | use-delete-location.ts | Delete location mutation |
| 7 | use-invoices.ts | Invoice queries |
| 8 | use-locations.ts | Location queries |
| 9 | use-meters.ts | Meter queries |
| 10 | use-mobile.ts | Mobile detection |
| 11 | use-notifications.ts | Notification queries |
| 12 | use-payments.ts | Payment queries |
| 13 | use-projects.ts | Project queries |
| 14 | use-readings.ts | Reading queries |
| 15 | use-replace-meter.ts | Replace meter mutation |
| 16 | use-sim-cards.ts | SIM card queries |
| 17 | use-sim-eligibility.ts | SIM eligibility check |
| 18 | use-terminate-meter.ts | Terminate meter mutation |
| 19 | use-tickets.ts | Ticket queries |
| 20 | use-toast.ts | Toast notification |
| 21 | use-update-location.ts | Update location mutation |
| 22 | use-water-balance.ts | Water balance queries |

### 2.6 Lib Utilities

| File | Purpose |
|------|---------|
| lib/action-permissions.ts | Fine-grained action permission map (hierarchical) |
| lib/api/auth.ts | Token management (get/set/refresh) |
| lib/api/client.ts | HTTP client (GET/POST/PUT/PATCH/DELETE) |
| lib/api/errors.ts | ApiError class and helpers |
| lib/api/index.ts | API barrel exports |
| lib/db.ts | Database client (Prisma) |
| lib/download.ts | File download utility |
| lib/feature-flags.ts | Mock/API per-module toggle |
| lib/i18n/context.tsx | Locale context provider |
| lib/i18n/translations.ts | EN/AR translations (1043 lines) |
| lib/mock-auth.ts | Mock authentication store |
| lib/mock-data.ts | Mock data for development |
| lib/navigation.ts | Nav items, rolePermissions map, helpers |
| lib/router-store.ts | Zustand-based page router store |
| lib/types.ts | TypeScript type definitions (424 lines) |
| lib/utils.ts | cn() utility and helpers |

### 2.7 i18n Files

| File | Lines | Purpose |
|------|-------|---------|
| lib/i18n/translations.ts | 1043 | All translation keys (EN/AR) |
| lib/i18n/context.tsx | 83 | LocaleProvider, useT(), useLocale() |

---

## 3. PRISMA (backend/prisma/)

### 3.1 Models by Schema

#### Schema: sim_system (31 models)

| # | Model | Purpose |
|---|-------|---------|
| 1 | Project | Project entity |
| 2 | LocationNode | Location hierarchy (zone/building/floor/unit) |
| 3 | Customer | Customer record |
| 4 | CustomerUnitAssignment | Customer-to-unit assignment |
| 5 | Meter | Meter lifecycle |
| 6 | SIMCard | SIM card inventory |
| 7 | MeterAssignment | Meter-to-customer assignment |
| 8 | SIMAssignment | SIM-to-meter assignment |
| 9 | Reading | Meter readings |
| 10 | ReadingReview | Reading review actions |
| 11 | TariffPlan | Tariff rate plans |
| 12 | BillingPeriod | Billing periods |
| 13 | Invoice | Invoice header |
| 14 | InvoiceLine | Invoice line items |
| 15 | InvoiceAdjustment | Invoice adjustments |
| 16 | Payment | Payment transactions |
| 17 | PaymentAllocation | Payment-to-invoice allocation |
| 18 | CustomerLedgerEntry | Append-only ledger |
| 19 | IdempotencyRecord | Idempotency tracking |
| 20 | ProjectThreshold | Threshold profiles |
| 21 | AuditLog | Append-only audit |
| 22 | ReportJob | Report generation jobs |
| 23 | RefreshToken | JWT refresh tokens |
| 24 | LoginAttempt | Login attempt tracking |
| 25 | Notification | User notifications |
| 26 | ReportTemplate | Report templates |
| 27 | Ticket | Support tickets |
| 28 | TicketComment | Ticket comments |
| 29 | SupportRequest | Support requests |
| 30 | SystemSetting | System settings |
| 31 | UploadHistory | Upload history records |

#### Schema: core (19 models)

| # | Model | Purpose |
|---|-------|---------|
| 1 | CoreUser | User accounts |
| 2 | CoreRole | Role definitions |
| 3 | CorePermission | Permission codes |
| 4 | CoreRolePermission | Role-permission mapping |
| 5 | CoreUserRoleAssignment | User-role-area assignment |
| 6 | CoreArea | Area (client) definitions |
| 7 | CoreProject | Cross-area project registry |
| 8 | CoreAuditLog | Central audit log |
| 9 | CoreSystemConfig | System configuration |
| 10 | CoreNotificationQueue | Notification queue |
| 11 | CorePaymentCenter | Payment collection centers |
| 12 | CoreBankAccount | Bank accounts for centers |
| 13 | CoreHoliday | Holiday calendar |
| 14 | CoreLocationZone | Geographic zone hierarchy |
| 15 | CoreUnitType | Unit type definitions |
| 16 | CoreUserGroup | User group definitions |
| 17 | CoreUserRequest | User registration requests |
| 18 | CoreCustomerGroup | Customer grouping |
| 19 | CoreSettlement | Area-level settlements |

#### Schema: features (36 models)

| Domain | Models |
|--------|--------|
| Tariff Management | Tariff, TariffVersion, TariffCharge, TariffChargeDetail |
| Reports & Jobs | ReportDefinition, ReportExport, ScheduledJob, ExportHistory, RunningActivity, ContractualRequest |
| Solar Wallet | WalletAccount, WalletTransaction, WalletBalance, WalletAllocation, WalletTransfer |
| Chilled Water | ChilledWaterConfig, ChilledWaterReading, ChilledWaterConsumption, ChilledWaterInvoice, ChilledWaterAllocation |
| Settlement Engine | SettlementConfig, SettlementPeriod, SettlementRule, SettlementTransaction, SettlementAllocation |
| Bill Cycle Governance | BillingCycle, BillingCycleProject, BillingCycleApproval, BillingCycleAudit |
| Document Engine | DocumentTemplate, TemplateVersion, GeneratedDocument, DocumentAudit |
| Invoice Governance | InvoiceHash, InvoiceQRCode, InvoiceGenerationBatch |

#### Schema: area (42 models)

| Domain | Models |
|--------|--------|
| Customer & Meter | AreaCustomer, AreaCustomerMeter, AreaMeterReading, AreaSIMCard, AreaSIMAssignment, AreaMeterStatusLog, AreaReadingReview, AreaReadingThreshold, AreaMeterCalibration, AreaMeterTransfer |
| Billing | AreaInvoiceDetail, AreaTransaction, AreaPaymentAllocation, AreaCustomerLedgerEntry, AreaJournalEntry, AreaPaymentPlan, AreaLateFee, AreaDeposit, AreaRefund, AreaDispute |
| Energy-Specific | AreaWaterBalance, AreaSolarWalletTransaction, AreaChilledWaterSettlement, AreaUsageSummary |
| Support | AreaAlert, AreaChatMessage, AreaTask, AreaApproval, AreaAttachment, AreaTroubleTicket, AreaCollectionAction, AreaContract, AreaSubscription, AreaWorkOrder |
| Security & Integration | AreaOTPCode, AreaApiKey, AreaWebhookSubscription, AreaPaymentGatewayLog, AreaIntegrationLog, AreaDataSyncTracker |
| Infrastructure | AreaSchemaVersion, AreaUserSession |

### 3.2 Model Count Summary

| Schema | Count |
|--------|-------|
| sim_system | 31 |
| core | 19 |
| features | 36 |
| area | 42 |
| **Grand Total** | **128** |

### 3.3 Enums (54 total)

| Schema | Count | List |
|--------|-------|------|
| sim_system | 24 | ProjectStatus, WaterDifferenceMode, NodeType, CustomerType, EntityStatus, MeterType, MeterStatus, IpType, SimStatus, AssignmentStatus, ReadingSource, ReadingStatus, ReviewAction, TariffStatus, BillingPeriodStatus, UtilityType, InvoiceStatus, AdjustmentType, PaymentMethod, PaymentStatus, LedgerEntryType, ReferenceType, ReportJobStatus, ReportFormat |
| core | 6 | UserStatus, AuditActionType, NotificationType, ReferenceObjectType, SettlementStatus, ZoneType |
| features | 8 | TariffChargeMode, TariffSettlementType, BillingCycleStatus, WalletTransactionType, WalletTransferStatus, ChilledWaterAllocationMethod, SettlementRuleType, DocumentStatus |
| area | 16 | AreaCustomerStatus, AreaTransactionType, AreaLedgerEntryType, AreaInvoiceStatus, AreaAlertSeverity, AreaTaskPriority, AreaTaskStatus, AreaApprovalStatus, AreaTicketCategory, AreaTicketPriority, AreaTicketStatus, AreaSimStatus, AreaMeterType, AreaReadingSource, AreaReadingStatus, AreaSettlementStatus, AreaPaymentPlanStatus, AreaCollectionActionType, AreaDepositType, AreaContractStatus, AreaWorkOrderStatus |

---

## 4. ROOT FILES

### 4.1 package.json Files

| Context | Path |
|---------|------|
| Workspace | D:\\meter\\Meter\\package.json |
| Backend | D:\\meter\\Meter\\backend\\package.json |
| Frontend | D:\\meter\\Meter\\Frontend\\package.json |

### 4.2 Docker Compose Files

| File | Services | Ports |
|------|----------|-------|
| D:\\meter\\Meter\\docker-compose.yml | db (postgres:16), backend, frontend | 5432, 3001, 3000 |
| D:\\meter\\Meter\\backend\\docker-compose.yml | db, backend, backend-migrate, frontend, db-admin | 5433, 3001, 3000, 4001 |

### 4.3 CI/CD

**STATUS: NONE CONFIGURED**
- No .github/workflows/ files found
- ci-cd/ directory is empty
- No CI/CD pipelines exist for this repository

---

## 5. INVENTORY SUMMARY

| Category | Count |
|----------|-------|
| Backend Controllers | 33 |
| Backend Services | 43 |
| Backend Modules | 40 |
| Backend DTOs | 29 |
| Backend Guards | 6 |
| Backend Interceptors | 3 |
| Backend Middleware | 3 |
| Frontend Page Components | ~40 |
| Frontend Shared Components | 5 |
| Frontend Layout Components | 10 |
| Frontend UI Components | 50 |
| Frontend Hooks | 22 |
| Frontend Lib Utilities | 16 |
| Frontend i18n Files | 2 (1043 translation lines) |
| Prisma Models | 128 |
| Prisma Enums | 54 |
| Root package.json | 3 |
| Docker Compose | 2 |
| CI/CD | 0 |
