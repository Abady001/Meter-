# Reality Rebuild — Meter Verse v3 (Living Architecture)

**Generated:** 2026-06-25
**Source:** Live codebase scan (backend + frontend)
**Scope:** All controllers, services, Prisma models, pages, components, modules

---

## 1. EXACT COUNTS

| Artifact | Count |
|---|---|
| **Controllers** (NestJS) | **34** |
| **Services** (NestJS) | **44** |
| **Prisma Models** | **128** |
| — Main / Feature models | 86 |
| — Area models (shared template) | 42 |
| **Frontend Page Keys** (AppShell router) | **41** |
| **Frontend Component Directories** | **21** |
| **Backend Module Directories** | **34** |
| **Navigation Routes** (sidebar in nav.ts) | **40** |
| **RBAC Profiles** (rolePermissions) | **16** |

---

## 2. SYSTEM TREE — BACKEND

### 2.1 NestJS Controllers (34)

```
app.controller.ts                          # Health check
│
├── auth/
│   └── auth.controller.ts                  # login, register, refresh, logout, me, dev-login, csrf-token
│
├── admin/
│   └── admin.controller.ts                 # admin tables, query
│
├── areas/
│   └── areas.controller.ts                 # area CRUD
│
├── bill-cycle/
│   └── bill-cycle.controller.ts            # billing cycle CRUD + approval
│
├── billing/
│   ├── billing.controller.ts               # invoice generate/issue/cancel/adjustments
│   └── tariff-studio.controller.ts         # tariff CRUD + simulate
│
├── chilled-water/
│   └── chilled-water.controller.ts         # chilled water config/readings/consumption/invoices
│
├── collections/
│   └── collections.controller.ts           # collections dashboard + aging
│
├── customers/
│   └── customers.controller.ts             # customer CRUD + 360 + statement + transfer-ownership
│
├── downloads/
│   └── downloads.controller.ts             # CSV/PDF downloads, invoice PDF
│
├── invoices/
│   └── invoices.controller.ts              # invoice detail PDF, batch download
│
├── kpi/
│   └── kpi.controller.ts                   # executive, collections, utilities KPI
│
├── meters/
│   └── meters.controller.ts                # meter CRUD + assign/terminate
│
├── notifications/
│   └── notifications.controller.ts         # notification CRUD
│
├── payments/
│   └── payments.controller.ts              # payment CRUD + reverse + receipt
│
├── projects/
│   ├── projects.controller.ts              # project CRUD
│   ├── dashboard/
│   │   └── dashboard.controller.ts         # project dashboard KPIs
│   └── locations/
│       └── locations.controller.ts         # location CRUD
│
├── readings/
│   ├── readings.controller.ts              # reading CRUD + review-queue + approve/reject
│   └── water-balance/
│       └── water-balance.controller.ts     # water balance CRUD
│
├── registration/
│   └── registration.controller.ts          # registration requests
│
├── reports/
│   └── reports.controller.ts               # report CRUD + generate/export
│
├── search/
│   └── search.controller.ts                # global search
│
├── settings/
│   └── settings.controller.ts              # system settings CRUD
│
├── settlement/
│   └── settlement.controller.ts            # settlement CRUD + adjustments
│
├── sim-cards/
│   └── sim-cards.controller.ts             # SIM card CRUD + eligibility
│
├── solar/
│   └── solar.controller.ts                 # solar dashboard + wallet + readings + statement
│
├── support/
│   └── support.controller.ts               # support request CRUD
│
├── tickets/
│   └── tickets.controller.ts               # ticket CRUD
│
├── unit-types/
│   └── unit-types.controller.ts            # unit type CRUD
│
├── upload/
│   └── upload.controller.ts                # file upload + history + templates + bulk
│
├── users/
│   └── users.controller.ts                 # user CRUD
│
└── wallet/
    └── wallet.controller.ts                # wallet credit/debit/transfer + balance
```

### 2.2 NestJS Services (44)

| Module | Services |
|---|---|
| admin | admin.service |
| audit | audit.service, security-audit.service |
| auth | password-policy.service, refresh-token.service, user-access.service |
| billing | billing-state.service, calculation-engine.service, ledger.service, tariff-calculation.service, tariff-engine.service |
| billing/periods | period.service |
| billing/tariffs | tariff.service |
| common/database | database.service, prisma.service |
| customers | customer-360.service, customers.service |
| downloads | downloads.service |
| idempotency | idempotency.service |
| invoices | invoice-renderer.service, invoice-template.service |
| kpi | kpi.service |
| meters | meters.service |
| notifications | notifications.service |
| payments | payment-receipt.service, payments.service |
| projects | projects.service |
| projects/dashboard | dashboard.service |
| projects/locations | locations.service |
| projects/thresholds | threshold.service |
| readings | readings.service |
| readings/polling | poller.service |
| readings/water-balance | water-balance.service |
| reports | report-generation.service, reports.service |
| search | search.service |
| settings | settings.service |
| sim-cards | sim-cards.service |
| solar | solar-wallet.service |
| support | support.service |
| tickets | tickets.service |
| upload | import.service, upload.service |
| wallet | wallet.service |

### 2.3 Prisma Models (128)

**Core DB (Auth & Shared) — 19 models:**
CoreUser, CoreRole, CorePermission, CoreRolePermission, CoreUserRoleAssignment, CoreArea, CoreProject, CoreAuditLog, CoreSystemConfig, CoreNotificationQueue, CorePaymentCenter, CoreBankAccount, CoreHoliday, CoreLocationZone, CoreUnitType, CoreUserGroup, CoreUserRequest, CoreCustomerGroup, CoreSettlement

**Features DB (Metering & Billing) — 67 models:**
Project, LocationNode, Customer, CustomerUnitAssignment, Meter, SIMCard, MeterAssignment, SIMAssignment, Reading, ReadingReview, TariffPlan, BillingPeriod, Invoice, InvoiceLine, InvoiceAdjustment, Payment, PaymentAllocation, CustomerLedgerEntry, IdempotencyRecord, ProjectThreshold, AuditLog, ReportJob, RefreshToken, LoginAttempt, Notification, ReportTemplate, Ticket, TicketComment, SupportRequest, SystemSetting, UploadHistory,
Tariff, TariffVersion, TariffCharge, TariffChargeDetail, ReportDefinition, ReportExport, ScheduledJob, ExportHistory, RunningActivity, ContractualRequest,
WalletAccount, WalletTransaction, WalletBalance, WalletAllocation, WalletTransfer,
ChilledWaterConfig, ChilledWaterReading, ChilledWaterConsumption, ChilledWaterInvoice, ChilledWaterAllocation,
SettlementConfig, SettlementPeriod, SettlementRule, SettlementTransaction, SettlementAllocation,
BillingCycle, BillingCycleProject, BillingCycleApproval, BillingCycleAudit,
DocumentTemplate, TemplateVersion, GeneratedDocument, DocumentAudit,
InvoiceHash, InvoiceQRCode, InvoiceGenerationBatch

**Area DB Template — 42 models (×15 areas):**
AreaCustomer, AreaCustomerMeter, AreaMeterReading, AreaSIMCard, AreaSIMAssignment, AreaMeterStatusLog, AreaReadingReview, AreaReadingThreshold, AreaMeterCalibration, AreaMeterTransfer, AreaInvoiceDetail, AreaTransaction, AreaPaymentAllocation, AreaCustomerLedgerEntry, AreaJournalEntry, AreaPaymentPlan, AreaLateFee, AreaDeposit, AreaRefund, AreaDispute, AreaWaterBalance, AreaSolarWalletTransaction, AreaChilledWaterSettlement, AreaUsageSummary, AreaAlert, AreaChatMessage, AreaTask, AreaApproval, AreaAttachment, AreaTroubleTicket, AreaCollectionAction, AreaContract, AreaSubscription, AreaWorkOrder, AreaOTPCode, AreaApiKey, AreaWebhookSubscription, AreaPaymentGatewayLog, AreaIntegrationLog, AreaDataSyncTracker, AreaSchemaVersion, AreaUserSession

---

## 3. PAGE TREE — FRONTEND

### 3.1 Rendered Pages (AppShell router — 41 PageKeys)

| # | PageKey | Component | Import Path |
|---|---|---|---|
| 1 | dashboard | DashboardPage | dashboard/DashboardPage |
| 2 | executive-dashboard | ExecutiveDashboard | dashboard/ExecutiveDashboard |
| 3 | operations-dashboard | OperationsDashboard | dashboard/OperationsDashboard |
| 4 | billing-dashboard | BillingDashboard | dashboard/BillingDashboard |
| 5 | collections-dashboard-plus | CollectionsDashboardPlus | dashboard/CollectionsDashboardPlus |
| 6 | utility-dashboard | UtilityDashboard | dashboard/UtilityDashboard |
| 7 | solar-dashboard | SolarDashboard | dashboard/SolarDashboard |
| 8 | kpi-executive | KpiExecutiveDashboard | kpi/ExecutiveDashboard |
| 9 | kpi-collections | KpiCollectionsDashboard | kpi/CollectionsDashboard |
| 10 | kpi-utilities | KpiUtilitiesDashboard | kpi/UtilitiesDashboard |
| 11 | sync-gateway | SyncGatewayPage | sync/SyncGatewayPage |
| 12 | projects | ProjectsPage | projects/ProjectsPage |
| 13 | project-detail | ProjectDetailPage | projects/ProjectDetailPage |
| 14 | locations | LocationsPage | projects/LocationsPage |
| 15 | customers | CustomersPage | customers/CustomersPage |
| 16 | customer-detail | CustomerDetailPage | customers/CustomerDetailPage |
| 17 | meters | MetersPage | meters/MetersPage |
| 18 | meter-detail | MeterDetailPage | meters/MeterDetailPage |
| 19 | meter-assign | MeterAssignPage | meters/MeterAssignPage |
| 20 | meter-replace | MeterReplacePage | meters/MeterReplacePage |
| 21 | meter-terminate | MeterTerminatePage | meters/MeterTerminatePage |
| 22 | sim-cards | SimCardsPage | sim-cards/SimCardsPage |
| 23 | readings | ReadingsPage | readings/ReadingsPage |
| 24 | reading-new | ReadingNewPage | readings/ReadingNewPage |
| 25 | consumption | ConsumptionPage | billing/ConsumptionPage |
| 26 | water-balance | WaterBalancePage | billing/WaterBalancePage |
| 27 | invoices | InvoicesPage | billing/InvoicesPage |
| 28 | invoice-detail | InvoiceDetailPage | billing/InvoiceDetailPage |
| 29 | payments | PaymentsPage | billing/PaymentsPage |
| 30 | balances | BalancesPage | billing/BalancesPage |
| 31 | reports | ReportsPage | reports/ReportsPage |
| 32 | alerts | AlertsPage | alerts/AlertsPage |
| 33 | tickets | TicketsPage | tickets/TicketsPage |
| 34 | support | SupportPage | tickets/SupportPage |
| 35 | settings | AdminPortalRedirect | — (inline, redirects to :6262) |
| 36 | admin-portal | AdminPortalRedirect | — (inline) |
| 37 | bill-cycle | BillCyclePage | — (inline placeholder) |
| 38 | upload-center | UploadCenterPage | upload/UploadCenterPage |
| 39 | tariff-studio | TariffStudioPage | tariffs/TariffStudioPage |
| 40 | settlements | SettlementPage | settlement/SettlementPage |
| 41 | workplace | WorkplacePage | workspace/WorkplacePage |

### 3.2 Navigation Sidebar (nav.ts — 18 parent groups, 40 routes)

| Group | Routes |
|---|---|
| Dashboard | /dashboard, /executive-dashboard, /operations-dashboard, /billing-dashboard, /collections-dashboard-plus, /utility-dashboard, /kpi-executive, /kpi-collections, /kpi-utilities |
| Customers | /customers, /balances, /downloads |
| Projects | /projects |
| Units | /locations |
| Meters | /meters, /meters/assign, /meters/replace, /meters/terminate |
| Readings | /readings, /readings/new |
| Billing | /invoices, /adjustments |
| Tariff Studio | /tariff-studio |
| Bill Cycle | /bill-cycle |
| Collections | /payments, /collections-dashboard-plus, /promises, /recovery |
| Utilities | /utility/electricity, /utility/water, /utility/solar, /utility/gas, /utility/chilled-water, /utility/outdoor-unit, /utility/settlement |
| Reports | /reports/operational, /reports/financial, /reports/collections, /reports/utility, /reports/regulatory |
| Upload Center | /upload-center |
| Notifications | /notifications |
| Tickets | /tickets |
| Support | /support |
| Workplace | /workplace |
| Administration | /rbac, /feature-flags, /audit-logs, /sync-gateway |

### 3.3 Frontend Component Directories (21)

admin/, alerts/, billing/, customers/, dashboard/, kpi/, layout/, meters/, projects/, readings/, reports/, settlement/, shared/, sim-cards/, smart-table/, sync/, tariffs/, tickets/, ui/, upload/, workspace/

---

## 4. MODULE TREE

### 4.1 Backend Module Directory Layout (34 dirs)

```
backend/src/
├── admin/           # Admin portal controllers/services
├── areas/           # Area-scoped operations
├── audit/           # Append-only audit log (2 services)
├── auth/            # JWT auth, RBAC, password policy, refresh tokens (4 services)
├── bill-cycle/      # Billing cycle management
├── billing/         # Invoice generate, tariff studio, engine, ledger (7 services)
│   ├── periods/
│   └── tariffs/
├── chilled-water/   # Chilled water subsystem
├── collections/     # Collections dashboard & aging
├── common/          # Shared database services (2 services)
│   └── database/
├── customers/       # Customer CRUD & 360 (2 services)
├── downloads/       # CSV/PDF table downloads
├── idempotency/     # Idempotency guard
├── invoices/        # Invoice PDF rendering & templates (2 services)
├── kpi/             # Executive & collections KPIs
├── meters/          # Meter CRUD & lifecycle
├── notifications/   # Notification queue
├── payments/        # Payment processing & receipts (2 services)
├── projects/        # Projects, dashboard KPIs, locations, thresholds (4 services)
│   ├── dashboard/
│   ├── locations/
│   └── thresholds/
├── readings/        # Readings CRUD, review queue, polling, water balance (4 services)
│   ├── polling/
│   └── water-balance/
├── registration/    # User registration requests
├── reports/         # Report generation & templates (2 services)
├── search/          # Global search
├── settings/        # System settings
├── settlement/      # Utility settlement
├── sim-cards/       # SIM card management
├── solar/           # Solar wallet & dashboard
├── support/         # Support requests
├── tickets/         # Ticket management
├── types/           # Type definitions
├── unit-types/      # Unit type CRUD
├── upload/          # File upload, import, bulk (2 services)
├── users/           # User management
├── utilities/       # Utility helpers
└── wallet/          # Wallet transactions & balance
```

### 4.2 Frontend Component Directory Layout (21 dirs)

```
Frontend/src/components/
├── admin/           # Admin portal components
├── alerts/          # Alert management
├── billing/         # Consumption, WaterBalance, Invoices, Payments, Balances
├── customers/       # Customer list, detail, wallet, ownership
├── dashboard/       # 7 dashboard variants
├── kpi/             # 3 KPI dashboards
├── layout/          # AppShell, TopNav, AppSidebar
├── meters/          # Meter list, detail, assign, replace, terminate
├── projects/        # Project list, detail, locations, form
├── readings/        # Readings list, new reading
├── reports/         # Reports page
├── settlement/      # Settlement page
├── shared/          # Shared components (GlobalSearchDialog, etc.)
├── sim-cards/       # SIM cards page
├── smart-table/     # Smart table component
├── sync/            # Sync gateway
├── tariffs/         # Tariff Studio
├── tickets/         # Tickets & Support
├── ui/              # shadcn/ui primitives
├── upload/          # Upload center
└── workspace/       # Workplace
```

---

## 5. RBAC PROFILE MAP (16 profiles)

| # | Profile | Scope | Routes Count |
|---|---|---|---|
| 1 | super_admin | Full system access | 22 |
| 2 | system_admin | System-wide admin (no tariff-studio) | 21 |
| 3 | admin | Standard admin | 21 |
| 4 | area_manager | Single area management | 13 |
| 5 | team_leader | Team operations | 13 |
| 6 | operator | Daily operations | 14 |
| 7 | technician | Field work (meters, readings, tickets) | 8 |
| 8 | finance | Financial (invoices, payments, reports) | 6 |
| 9 | support | Customer support | 8 |
| 10 | customer | Self-service portal | 7 |
| 11 | collector | Collections | 6 |
| 12 | meter_reader | Meter reading | 4 |
| 13 | inspector | Inspection | 7 |
| 14 | supervisor | Oversight | 11 |
| 15 | accountant | Accounting | 5 |
| 16 | viewer | Read-only | 12 |

---

## 6. ARCHITECTURE SUMMARY

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js 16)                     │
│  AppShell (41 pages) → 21 component dirs → shadcn/ui       │
│  Auth: next-auth v4 | State: Zustand | Data: React Query   │
│  Mock data layer active — live API migration in progress   │
├─────────────────────────────────────────────────────────────┤
│                    BACKEND (NestJS)                          │
│  34 Controllers → 44 Services → 128 Prisma Models          │
│  Auth: JWT + Passport + RBAC (16 profiles)                 │
│  Audit: Append-only audit service + interceptor            │
│  OpenAPI: Swagger UI at /api/v1/docs                       │
├─────────────────────────────────────────────────────────────┤
│                    DATABASE (PostgreSQL — multi-schema)      │
│  Core schema (auth + shared) — 19 tables                    │
│  Features schema (billing + metering) — 67 tables           │
│  Area_N schemas (×15, per-client isolation) — 42 tables ea │
│  Total logical tables: 19 + 67 + (42 × 15) = 716           │
├─────────────────────────────────────────────────────────────┤
│                    EXTERNAL SYSTEMS                          │
│  Collection System (Flask) | Symbiot SEP (TCP/HTTP bridge)  │
│  SBill PH + Estates (legacy) | Energy 360 (mobile)         │
└─────────────────────────────────────────────────────────────┘
```

---

## 7. INTEGRATION HEALTH

| Metric | Value |
|---|---|
| Pages with live API | 5 (login, register, refresh, logout, me) |
| Pages with mock data | 25 |
| Pages with NO component (nav-only) | 17 |
| Backend endpoints with NO frontend | 65+ |
| Missing both FE + BE | ~12 |
| Integration gap | ~85% of endpoints not wired to FE |
| Current state | Mock-driven UI, backend ready, API wiring sprint-by-sprint |
