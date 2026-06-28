# Meter Verse — ChatGPT Prompt Guide

**Purpose:** Give any AI (ChatGPT, Claude, etc.) complete context to continue Meter Verse development from exactly where we left off.
**Last Updated:** 2026-06-19
**Project Root:** `D:\meter\Meter\`

---

## 1. PROJECT IDENTITY

**Meter Verse** (عالم العدادات) is a unified utility metering & billing platform replacing 3 legacy systems:
- **SBill** (Java/Spring Boot, SQL Server) — Palm Hills + Estates, ~700K consumers, ~70M readings
- **Collection System** (Flask 3.1.3, PostgreSQL) — Solar wallet, collection tracker, 36 tables
- **Meter Pulse** (NestJS/Next.js MVP) — Current dev platform, ~50 tables in single `sim_system` schema

**Target:** NestJS + Next.js + PostgreSQL multi-schema (Core + Features + 15 Area DBs = 675 tables)

**5 Utilities:** Electricity, Water, Solar, Chilled Water, Gas (planned)

**15 Areas:** october, new_cairo, sodic_ednc, sodic_estates, sodic_vye, badya_city, north_coast, uvines_mall + 7 future

---

## 2. STACK

| Layer | Technology | Notes |
|-------|-----------|-------|
| Frontend | Next.js 16 + React 19 + TypeScript + Tailwind v4 + shadcn/ui | Bun runtime, port 3000 |
| Backend | NestJS + Prisma ORM | Node 20+, port 3001 |
| Database | PostgreSQL 16 | `meter_pulse` DB, 4 schemas |
| Auth | JWT + GlobalAuthGuard + RolesGuard + AreaGuard | 16 roles, 27 permissions |
| PDF | Puppeteer (HTML→PDF with RTL Arabic) | Master Invoice Template |
| State | Zustand (frontend) + React Query (API data) | |
| Charts | Recharts | |
| i18n | Custom engine, 676 AR/EN keys | Arabic + English toggle |

---

## 3. DATABASE ARCHITECTURE

### Current State (4 schemas in same PostgreSQL DB)

```
sim_system (MVP — ALL data lives here, ~50 tables)
├── Project, Location, Building, Floor, Unit
├── Customer, Meter, MeterAssignment, MeterStatusLog
├── SimCard, SimAssignment
├── Reading, ReadingReview
├── Invoice, InvoiceLine, InvoiceAdjustment
├── Payment, PaymentAllocation, CustomerLedgerEntry
├── Alert, Ticket, TicketComment, SupportTicket
├── ReportTemplate, ReportExport
├── Setting, Notification, NotificationPreference
├── UploadHistory, AuditLog, Service
├── TariffPlan, BillingPeriod

core schema (16 tables — CREATED BUT EMPTY)
├── CoreUser, CoreRole, CorePermission, CoreRolePermission
├── CoreUserRoleAssignment, CoreArea, CoreProject
├── CoreAuditLog, CoreSystemConfig, CoreNotificationQueue
├── CorePaymentCenter, CoreBankAccount, CoreHoliday
├── CoreLocationZone, CoreUnitType, CoreCustomerGroup
└── CoreSettlement

features schema (~36 tables — CREATED BUT EMPTY)
├── TariffPlan, TariffVersion, TariffCharge, TariffChargeDetail
├── ReportDefinition, ReportExport, ScheduledJob, RunningActivity
├── WalletAccount, WalletTransaction, WalletBalance, WalletAllocation, WalletTransfer
├── ChilledWaterConfig, ChilledWaterReading, ChilledWaterConsumption
├── ChilledWaterInvoice, ChilledWaterAllocation
├── SettlementConfig, SettlementPeriod, SettlementRule, SettlementTransaction
├── BillingCycle, BillingCycleProject, BillingCycleApproval, BillingCycleAudit
├── DocumentTemplate, TemplateVersion, GeneratedDocument, DocumentAudit
├── InvoiceHash, InvoiceQrCode, InvoiceGenerationBatch
└── ContractualRequest

area schema (45 tables — TEMPLATE EXISTS, NOT REPLICATED ×15)
├── Core (10): Customer, CustomerMeter, MeterReading, SIMCard, SIMAssignment,
│              MeterStatusLog, ReadingReview, ReadingThreshold, MeterCalibration, MeterTransfer
├── Billing (10): InvoiceDetail, Transaction, PaymentAllocation, CustomerLedgerEntry,
│                 JournalEntry, PaymentPlan, LateFee, Deposit, Refund, Dispute
├── Energy (4): WaterBalance, SolarWalletTransaction, ChilledWaterSettlement, UsageSummary
├── Support (10): Alert, ChatMessage, Task, Approval, Attachment, TroubleTicket,
│                 CollectionAction, Contract, Subscription, WorkOrder
└── Security (8): OtpCode, ApiKey, WebhookSubscription, PaymentGatewayLog,
                  IntegrationLog, DataSyncTracker, SchemaVersion, UserSession
```

### Target State (T089b — NOT YET DONE)
Area template replicated 15 times → `area_october`, `area_new_cairo`, ... `area_uvines_mall`
Multi-schema Prisma routing configured.

---

## 4. BACKEND ENDPOINTS (87 total, all working)

| Controller | Prefix | Endpoints |
|-----------|--------|-----------|
| AppController | — | GET /health |
| AuthController | /auth | POST refresh, POST dev-login |
| ProjectsController | /projects | CRUD (5) |
| LocationsController | /projects/:pid/locations | CRUD (5) |
| CustomersController | /projects/:pid/customers | CRUD + 360 + statement (7) |
| DashboardController | /projects/:pid/dashboard | GET kpis, consumption, activity (3) |
| MetersController | /meters | CRUD + assign + terminate (7) |
| SimCardsController | /sim-cards | CRUD + eligibility (6) |
| ReadingsController | /readings | CRUD + review-queue + approve/reject (6) |
| WaterBalanceController | /projects/:pid/water-balance | GET (1) |
| BillingController | (/) | invoices generate/issue/cancel/adjustments + tariffs + periods (12) |
| PaymentsController | /payments | CRUD + reverse (5) |
| CollectionsController | /collections | dashboard + aging + receipt (3) |
| NotificationsController | /notifications | list + unread-count + mark-read + delete (5) |
| DownloadsController | /downloads | CSV + PDF exports (4) |
| InvoicesController | /invoices | PDF + batch-download (2) |
| ReportsController | /reports | CRUD (5) |
| TicketsController | /tickets | CRUD + comments + status (8) |
| SupportController | /support | CRUD + escalate (6) |
| SettingsController | /settings | GET + PATCH (3) |
| SearchController | /search | GET (1) |
| UploadController | /upload | customers + meters + history (3) |
| UsersController | /users | GET list (1) — **NEW** |

**Auth:** All endpoints protected by GlobalAuthGuard (JWT) + RolesGuard (16 roles). AreaGuard scopes per-area queries.

---

## 5. FRONTEND PAGES (32 total)

### Fully Working (26 pages — 81%)
dashboard, executive-dashboard, projects, project-detail, project-360, locations, customers, customer-detail, customer-360, meters, meter-detail, meter-assign, meter-replace, meter-terminate, sim-cards, readings, reading-new, invoices, invoice-detail, payments, consumption, settings, support, upload-center, tariff-studio, database-admin

### Partial (3 pages — mock/empty data)
- **water-balance** — uses mock `childMeters` array (API endpoint exists, data mismatch)
- **balances** — empty data (needs statement endpoint wiring)
- **consumption** — empty chartData (needs readings wiring)

### Mock-Only (3 pages — feature flag = 'mock')
- **reports** — flag `reports.list` = 'mock' (API endpoints exist)
- **tickets** — flag `tickets.list` = 'mock' (API endpoints exist)
- **alerts** — flag `alerts.list` = 'mock' (no alerts endpoint yet)

---

## 6. RECENT BUGS FIXED

| Bug | Location | Fix |
|-----|----------|-----|
| `meters is not defined` ReferenceError | `ReadingNewPage.tsx:45` | Added missing hooks |
| `Cannot read properties of null (reading 'coveragePercentage')` | `WaterBalancePage.tsx:35` | Added safe default values |
| `GET /api/v1/users` 404 | `SettingsPage.tsx:42` | Created UsersController |
| `PRJ-001` not valid UUID → 400 | `WaterBalancePage.tsx:30` | Changed default to '' |

---

## 7. SECURITY FIXES APPLIED

| Severity | Issue | Fix |
|----------|-------|-----|
| 🔴 CRITICAL | Caddyfile open proxy (SSRF) | Removed `@transform_port_query` handler |
| 🔴 CRITICAL | Weak JWT_SECRET | Replaced with 64-char random |
| 🔴 CRITICAL | Secrets in backup .env files | Deleted `backend/backups/` |
| 🟠 HIGH | Dev-login only guarded by NODE_ENV | Added explicit `DEV_LOGIN_ENABLED` flag |
| 🟠 HIGH | No CSRF protection | **Not fixed** — needs token endpoint |
| 🟠 HIGH | JWT in localStorage (XSS risk) | **Not fixed** — needs httpOnly cookies |

---

## 8. TASK LIST (122 tasks: 73 DONE, 3 PARTIAL, 46 TODO)

### DONE (73 tasks)
- **A1-A4:** Setup, Foundational, US1 (Assignments), US2 (Readings) — all [X]
- **A5:** US3 (Invoices/Payments) — 9/12 [X], 3 [-P] (T068 invoices, T069 payments, T070 balances, T071 statements)
- **A7:** v2.0 Foundation — T086 Core DB, T087 Features DB, T088 Area Template, T089 RBAC, T090 i18n

### TODO — Quick Wins (P0, ~6h)
- **H01:** Wire Reports mock→api (change `reports.list` flag)
- **H02:** Wire Tickets mock→api (change `tickets.list` flag)
- **H03:** Wire Alerts mock→api (create alerts endpoint or use notifications)

### TODO — Area Replication (P0, ~8h)
- **T089b:** Clone area template → 15 per-area schemas
- **T089c:** Multi-schema Prisma config + area middleware

### TODO — Core Business Features (P1, ~120h total)
- **C01-D05:** Solar Wallet (5 tasks, 40h) — port charge_engine.py from Collection System
- **E01-F03:** Chilled Water (3 tasks, 24h) — BTU meter type, readings, invoices
- **B01-C03:** SEP2 Sync (3 tasks, 32h) — meter sync, reading sync, connect/disconnect
- **G01-G05:** Billing completion (5 tasks, 24h) — invoice lifecycle, collection tracker

### TODO — Data Migration (P1, ~40h)
- **I01-I06:** Solar wallet, Collection Tracker, SBill PH, SBill Estates, Core+Features, Area data

### TODO — Quality & Polish (P2, ~140h)
- T091 Symbiot bridge (80h), T092 3 plans (16h), H04 32 reports (40h)

---

## 9. FEATURE FLAGS (in `Frontend/src/lib/feature-flags.ts`)

| Flag | Current | Target | Action |
|------|---------|--------|--------|
| `reports.list` | `'mock'` | `'api'` | Change value, verify /reports endpoints |
| `tickets.list` | `'mock'` | `'api'` | Change value, verify /tickets endpoints |
| `alerts.list` | `'mock'` | `'api'` | Create alerts endpoint or wire to notifications |
| All others | `'api'` | `'api'` | Already live |

---

## 10. 3-PLAN DEPLOYMENT ARCHITECTURE

### Plan A — Main (Full Production, always running)
```
Linux: Next.js :3000 → NestJS API :3001 → PostgreSQL (core+features+15 areas)
Windows: Symbiot Bridge (10 TCP × 100 HTTP)
RTO: <2h, RPO: <15min
```

### Plan B — Safety (Degraded, billing disabled)
```
Linux: Frontend + API (Safety Mode) → PostgreSQL (core+area read-only)
No billing, no features DB
Activation time: <5min
```

### Plan C — Failover (Emergency, read-only)
```
Linux: Frontend + API (Failover Mode) → Redis cache
PostgreSQL core warm standby (read-only)
Activation time: <15min
```

---

## 11. KEY FILE PATHS

### Configuration
- `Frontend/src/lib/feature-flags.ts` — mock/API toggles
- `Frontend/src/lib/router-store.ts` — PageKey type + Zustand router
- `Frontend/src/components/layout/AppShell.tsx` — page rendering map
- `Frontend/src/lib/api/client.ts` — API client (BASE_URL = localhost:3001/api/v1)
- `backend/.env` — DB URL, JWT_SECRET, CORS config
- `backend/src/app.module.ts` — all modules registered
- `backend/prisma/schema.prisma` — full Prisma schema (4 schemas)

### Planning (single source of truth)
- `docs/main-plan/main task list.md` — LIVE task list (122 tasks)
- `docs/main-plan/01-vision.md` through `10-final-report.md` — all planning docs

### Legacy (moved to draft/ or previous-plans/)
- `docs/previous-plans/` — old planning docs
- `draft/` — unused test files, old reports

### Reference Systems (keep for migration)
- `reference/sbill/` — SEP2 sync arch, billing rules, 32 reports
- `reference/collection-system/` — Solar wallet (charge_engine.py), collection tracker

---

## 12. FIRST ACTIONS FOR NEW AI

1. Read `docs/main-plan/main task list.md` for full task breakdown
2. Read `docs/main-plan/10-final-report.md` for completion status
3. Start with **Phase H** (H01-H03: wire Reports/Tickets/Alerts mock→api) — quickest wins
4. Then **Phase B** (T089b: replicate area template ×15) — foundation for all new features
5. Use `Frontend/src/lib/feature-flags.ts` to switch mock→api

---

## 13. CRITICAL NOTES

- The `write` tool (Set-Content) produces files with encoding issues for .cjs files — use Python generator scripts instead
- Frontend dev server on :3000 (Bun), Backend on :3001 (Node)
- Frontend uses client-side routing via Zustand store (`window.__navigate()` exposed for testing)
- Backend must be rebuilt (`npm run build`) and restarted after any backend code change
- Current database password and JWT secret are dev-only — must be strengthened for production
- CsrfGuard exists but is NOT registered — needs token generation endpoint before enabling
- All 87 API endpoints return 401 without auth token (GlobalAuthGuard)
