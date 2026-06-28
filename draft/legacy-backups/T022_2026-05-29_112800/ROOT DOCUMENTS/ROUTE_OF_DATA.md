# Route of Data — Meter Verse Architecture & Data Flow Map

> **Generated**: 2026-05-29 | **Last Completed**: T022 (Multi-Tool Validation)
> **Purpose**: Complete architectural map showing every file, its data flow connections, and dependency relationships.

---

## 1. Project Identity

| Field | Value |
|---|---|
| Name | Meter Verse — Utility Metering & Billing Platform |
| Repo Root | `D:\meter\Meter-\` |
| Backend Stack | NestJS + PostgreSQL + Prisma ORM (Node 20+) |
| Frontend Stack | Next.js 16 + React 19 + TypeScript + Tailwind v4 + shadcn/ui (Bun) |
| Author | Kirllos Hany <kirllos.hany@epower.com.eg> |
| GitHub Upstream | `Abady001/Meter-` (PR destination) |
| GitHub Fork | `Kirllos360/Meter-` (origin remote) |
| Current Branch | `feature/t021-react-query` |
| Commits | 70+ (T001-T022) |
| Tests | 82/82 Backend ✅ Frontend Build+Lint ✅ |

---

## 2. Complete Directory Tree (Project-Root Only, Excluding .venv/node_modules/.next/dist/cache)

```
Meter-/
├── .agents/                            # SpeckIt AI agent skills
│   └── skills/
│       ├── speckit-analyze/            # Cross-artifact consistency analyzer
│       ├── speckit-checklist/          # Requirements checklist manager
│       ├── speckit-clarify/            # Requirements clarification
│       ├── speckit-constitution/       # Constitution management
│       ├── speckit-implement/          # Implementation orchestrator
│       ├── speckit-plan/               # Plan generator
│       ├── speckit-specify/            # Spec writer
│       ├── speckit-tasks/              # Task decomposer
│       └── speckit-taskstoissues/      # Task → GitHub Issues converter
├── .opencode/                          # OpenCode configuration
│   ├── commands/
│   │   └── speckit.constitution.md     # Constitution command
│   ├── opencode.json                   # OpenCode settings
│   └── .gitignore
├── .specify/                           # SpeckIt SDD pipeline
│   ├── feature.json                    # Feature definition
│   ├── init-options.json               # Init options
│   ├── integration.json                # Integration config
│   ├── integrations/
│   │   ├── codex.manifest.json         # Codex integration
│   │   └── speckit.manifest.json       # Speckit integration
│   ├── memory/
│   │   └── constitution.md             # Project constitution (TEMPLATE - needs ratification)
│   ├── scripts/bash/                   # Shell automation (5 scripts)
│   │   ├── check-prerequisites.sh
│   │   ├── common.sh
│   │   ├── create-new-feature.sh
│   │   ├── setup-plan.sh
│   │   └── setup-tasks.sh
│   ├── templates/                      # Document templates (5)
│   │   ├── checklist-template.md
│   │   ├── constitution-template.md
│   │   ├── plan-template.md
│   │   ├── spec-template.md
│   │   └── tasks-template.md
│   └── workflows/
│       ├── speckit/workflow.yml        # Speckit workflow definition
│       └── workflow-registry.json      # Workflow registry
├── backend/                            # NestJS Modular Monolith
│   ├── prisma/
│   │   ├── schema.prisma               # 20+ models, 24+ enums, multi-schema (sim_system)
│   │   └── migrations/                 # 8 migrations (T013-T019)
│   │       ├── 20260527092641_core_org/
│   │       ├── 20260527094338_add_idempotency_record/
│   │       ├── 20260527100316_Meter_Verse_sim/
│   │       ├── 20260527114543_readings_tariff/
│   │       ├── 20260527124234_payments_ledger/
│   │       ├── 20260527153119_invoices/
│   │       ├── 20260528000100_audit_reports/
│   │       └── 20260528000200_views/
│   ├── src/
│   │   ├── main.ts                     # Entry: /api/v1 prefix, ValidationPipe, OpenAPI
│   │   ├── app.module.ts               # Root module (imports all feature modules)
│   │   ├── app.controller.ts           # Health check endpoint
│   │   ├── auth/                       # JWT + RBAC (T009)
│   │   │   ├── auth.module.ts
│   │   │   ├── jwt.strategy.ts         # Passport JWT strategy
│   │   │   ├── roles.decorator.ts      # @Roles() decorator
│   │   │   ├── roles.guard.ts          # Reflector-based RBAC guard
│   │   │   ├── constants/              # JWT config constants
│   │   │   ├── interfaces/             # JWT payload, Request+user interfaces
│   │   │   └── types/                  # Role enum (7 roles)
│   │   ├── audit/                      # Append-only audit log (T010)
│   │   │   ├── audit.module.ts
│   │   │   ├── audit.service.ts        # Fail-safe create-only service
│   │   │   ├── audit.decorator.ts      # @Audit() decorator
│   │   │   └── audit.interceptor.ts    # Auto-logs POST/PUT/PATCH/DELETE
│   │   ├── common/
│   │   │   ├── config/                 # ConfigModule (T002)
│   │   │   ├── database/              # DatabaseModule, PrismaService
│   │   │   ├── http/
│   │   │   │   ├── error-envelope.ts           # Standardized error response (T006)
│   │   │   │   ├── all-exceptions.filter.ts    # Global exception filter
│   │   │   │   ├── correlation.middleware.ts    # Correlation-ID (T007)
│   │   │   │   └── idempotency.interceptor.ts  # Idempotency-Key (T008)
│   │   │   └── openapi/               # Swagger/OpenAPI setup (T011)
│   │   ├── billing/                   # (EMPTY - T061+)
│   │   ├── customers/                 # (EMPTY - T029+)
│   │   ├── meters/                    # (EMPTY - T030+)
│   │   ├── payments/                  # (EMPTY - T065+)
│   │   ├── projects/                  # (EMPTY - T027+)
│   │   ├── readings/                  # (EMPTY - T047+)
│   │   ├── reports/                   # (EMPTY - T073+)
│   │   ├── sim-cards/                 # (EMPTY - T031+)
│   │   └── types/express.d.ts         # Express type extensions
│   ├── test/
│   │   ├── audit/                     # 3 test files (21 tests)
│   │   ├── auth/                      # 3 test files (31 tests)
│   │   ├── contract/                  # Contract test harness + spec
│   │   ├── correlation.spec.ts        # 7 tests
│   │   ├── error-envelope.spec.ts     # 15 tests
│   │   └── idempotency.spec.ts        # 8 tests
│   ├── dist/                          # Compiled JS output
│   ├── docker-compose.yml             # PostgreSQL container
│   ├── .env / .env.example            # Environment config
│   ├── .eslintrc.cjs / .prettierrc    # Lint/format config
│   ├── jest.config.ts / tsconfig.json # Test + TypeScript config
│   ├── nest-cli.json / package.json   # NestJS + dependencies
│   └── README.md
├── Frontend/                           # Next.js 16 App Router
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx             # Root layout: ThemeProvider > QueryProvider > Toaster
│   │   │   ├── page.tsx               # AppShell entry
│   │   │   ├── globals.css            # Global styles + Tailwind
│   │   │   └── api/route.ts           # Internal API route
│   │   ├── pages/api/features.ts      # Feature flags endpoint (T022)
│   │   ├── components/
│   │   │   ├── alerts/AlertsPage.tsx
│   │   │   ├── billing/
│   │   │   │   ├── BalancesPage.tsx
│   │   │   │   ├── ConsumptionPage.tsx
│   │   │   │   ├── InvoiceDetailPage.tsx
│   │   │   │   ├── InvoicesPage.tsx
│   │   │   │   ├── PaymentsPage.tsx
│   │   │   │   └── WaterBalancePage.tsx
│   │   │   ├── customers/
│   │   │   │   ├── CustomerDetailPage.tsx
│   │   │   │   └── CustomersPage.tsx
│   │   │   ├── dashboard/DashboardPage.tsx
│   │   │   ├── layout/
│   │   │   │   ├── AppShell.tsx       # Main shell with sidebar + topnav
│   │   │   │   ├── AppSidebar.tsx     # Role-based sidebar navigation
│   │   │   │   ├── LoginPage.tsx      # Auth login
│   │   │   │   ├── PageHeader.tsx     # Page header component
│   │   │   │   ├── PagePlaceholder.tsx
│   │   │   │   ├── RoleSwitcher.tsx   # Dev role switcher
│   │   │   │   ├── ThemeProvider.tsx  # Theme context provider
│   │   │   │   └── TopNav.tsx         # Top navigation bar
│   │   │   ├── meters/
│   │   │   │   ├── MeterAssignPage.tsx
│   │   │   │   ├── MeterDetailPage.tsx
│   │   │   │   ├── MeterReplacePage.tsx
│   │   │   │   ├── MetersPage.tsx
│   │   │   │   └── MeterTerminatePage.tsx
│   │   │   ├── projects/
│   │   │   │   ├── LocationsPage.tsx
│   │   │   │   ├── ProjectDetailPage.tsx  # T021-integrated
│   │   │   │   └── ProjectsPage.tsx       # T021-integrated
│   │   │   ├── readings/
│   │   │   │   ├── ReadingNewPage.tsx
│   │   │   │   └── ReadingsPage.tsx
│   │   │   ├── reports/
│   │   │   │   ├── ReportsPage.tsx
│   │   │   │   └── SettingsPage.tsx
│   │   │   ├── shared/
│   │   │   │   ├── PageHelpers.tsx     # PageHeader, BackButton, StatCard, EmptyState
│   │   │   │   ├── QueryBoundary.tsx   # T021: Loading/Error/Empty standard
│   │   │   │   └── StatusBadge.tsx
│   │   │   ├── sim-cards/SimCardsPage.tsx
│   │   │   ├── smart-table/SmartTable.tsx
│   │   │   ├── tickets/
│   │   │   │   ├── SupportPage.tsx
│   │   │   │   └── TicketsPage.tsx
│   │   │   └── ui/ (50+ shadcn/ui components)
│   │   ├── hooks/
│   │   │   ├── use-projects.ts         # T021: React Query hooks
│   │   │   ├── use-mobile.ts
│   │   │   └── use-toast.ts
│   │   └── lib/
│   │       ├── api/
│   │       │   ├── client.ts           # T020: Centralized fetch wrapper
│   │       │   ├── errors.ts           # T020: ApiError class
│   │       │   ├── auth.ts             # T020: Token storage + refresh
│   │       │   ├── index.ts            # T020: Barrel exports (+ QueryProvider)
│   │       │   └── query-client.tsx    # T021: SSR-safe QueryClient + Provider
│   │       ├── feature-flags.ts        # T022: Feature flag toggles
│   │       ├── db.ts                   # IndexedDB wrapper
│   │       ├── mock-auth.ts            # Zustand auth store
│   │       ├── mock-data.ts            # All entity mock data (77KB)
│   │       ├── types.ts                # TS interfaces + enums
│   │       ├── navigation.ts           # Role-based nav config
│   │       ├── router-store.ts         # Zustand page router
│   │       └── utils.ts               # cn() helper
│   ├── graphify-out/                   # Knowledge graph artifacts
│   │   ├── graph.json                  # 1.8M nodes/edges structure
│   │   ├── graph.html                  # Interactive visualization
│   │   ├── GRAPH_REPORT.md             # Community detection report
│   │   └── manifest.json               # File manifest
│   ├── scripts/
│   │   ├── copy-standalone.mjs         # Standalone build helper
│   │   └── smoke-all-pages.mjs         # Playwright smoke traversal
│   ├── prisma/schema.prisma            # SQLite dev schema
│   ├── .zscripts/                      # Build/dev scripts
│   ├── public/                         # Static assets
│   ├── examples/websocket/             # WS examples
│   ├── .config/opencode/skills/graphify/SKILL.md
│   ├── next.config.ts / tailwind.config.ts / tsconfig.json
│   ├── package.json / bun.lock
│   ├── eslint.config.mjs / postcss.config.mjs
│   ├── components.json
│   ├── FRONTEND_BUILD.md / FRONTEND_SPRINT_BACKLOG.md
│   └── AGENTS.md / worklog.md
├── specs/                              # SpeckIt specification artifacts
│   └── 001-metering-billing-platform/
│       ├── spec.md                     # Functional requirements (FR-001 to FR-019)
│       ├── plan.md                     # Implementation plan (all phases)
│       ├── research.md                 # Architecture decisions (13 decisions)
│       ├── data-model.md               # 20 entities, 9 state machines
│       ├── tasks.md                    # 85 tasks (T001-T085)
│       ├── quickstart.md               # Pre-flight checklist
│       ├── checklists/requirements.md  # Requirements checklist
│       └── contracts/meter-verse-api.yaml  # OpenAPI 3.0 contract
├── documentation/                      # Multi-format documentation
│   ├── markdown/                       # 45+ readable docs
│   │   ├── 00-index.md                # Entry point
│   │   ├── 01-conversation-log.md     # Full session transcript
│   │   ├── 02-memory-files.md         # Agent configs
│   │   ├── 03-database-schema-overview.md
│   │   ├── 05-programming-languages.md
│   │   ├── 06-github-packages-needed.md
│   │   ├── 09-git-commit-log.md
│   │   ├── 10-progress-health-report.md
│   │   ├── 11-email-report-log.md
│   │   ├── 12-T002-T003-verification-report.md
│   │   ├── 13-T001-validation-report.md through 13-T021-validation-report.md
│   │   ├── 14-mcp-setup.md
│   │   ├── 15-task-list.md
│   │   └── 16-checkpoint-report.md
│   ├── sql/                            # 8+ SQL DDL + validation files
│   ├── text/                           # Plain text versions (35+)
│   ├── excel/                          # CSV data exports (20+)
│   └── pdf/                            # Printable PDFs (22+)
├── backup files/                       # Session backups for AI continuation
│   ├── T021_2026-05-29_102628/
│   └── T022_2026-05-29_*/
├── graphify-out/                       # Main-level graphify (structural AST)
│   ├── graph.json                      # 1.85M structural graph
│   ├── graph.html                      # Interactive HTML (1.7MB)
│   ├── GRAPH_REPORT.md                 # 44KB report
│   └── manifest.json                   # 51KB manifest
├── .gitignore
├── .venv/                              # Python venv (graphifyy + deps)
├── AGENTS.md                           # Agent instructions + memory logs
├── AI_HANDOFF.md                       # Complete AI handoff file
├── ROUTE_OF_DATA.md                    # THIS FILE - architecture + data flow
├── PROJECT_ARCHITECTURE_AND_TREE.md     # Architecture + tree
├── PROJECT_TREE.md                     # Compact tree
├── MASTER-DEPLOYMENT-GUIDE.md          # Full deployment guide
├── RESTORE_POINT.md                    # Restore point
├── T001-T022-FINISHED-TASKS.md         # Completed tasks log
├── NEXT-SECTION-PROMPT.md              # Next task prompt
├── metering_system_prd_brainstorm.md   # Original PRD
├── prompt-history_T009.md              # T009 prompt history
├── prompt-history_T010.md              # T010 prompt history
└── prompt-history_T011.md             # T011 prompt history
```

---

## 3. Data Flow Architecture

### 3.1 Horizontal Data Flow (Request → Response)

```
Client Browser
    │
    ▼
Next.js App Router (Frontend/src/app/)
    │
    ├── layout.tsx ─── ThemeProvider ─── QueryProvider (T021) ─── Toaster
    │
    ├── page.tsx ─── AppShell
    │                   │
    │                   ├── AppSidebar (role-based nav from navigation.ts)
    │                   ├── TopNav (breadcrumbs + user menu)
    │                   └── <Outlet> ─── Feature Page Components
    │                                       │
    │                                       ├── useResourceList() hook (T021)
    │                                       │       │
    │                                       │       ├── QueryBoundary (loading/error/empty)
    │                                       │       └── apiGet<T>() from client.ts (T020)
    │                                       │               │
    │                                       │               ├── /api/v1/<resource> GET
    │                                       │               ├── JWT Bearer token (auth.ts)
    │                                       │               └── ApiError handling (errors.ts)
    │                                       │
    │                                       └── mockData ?? apiData (feature-flags.ts T022)
    │
    └── api/route.ts ─── internal API routes
```

### 3.2 Vertical Data Flow (Backend Layers)

```
HTTP Request
    │
    ▼
NestJS Server (main.ts)
    │
    ├── GlobalPrefix: /api/v1
    ├── ValidationPipe (whitelist, transform, forbidNonWhitelisted)
    │
    ▼
CorrelationMiddleware (T007)
    │  ├── Generates X-Correlation-Id if missing
    │  └── Attaches to req.correlationId
    │
    ▼
AuthModule (T009)
    │  ├── JwtStrategy extracts token → validates → populates req.user
    │  └── RolesGuard checks @Roles() metadata against req.user.role
    │
    ▼
IdempotencyInterceptor (T008)
    │  ├── For POST/PUT/PATCH: checks Idempotency-Key header
    │  ├── Returns cached response on replay
    │  └── Stores first-time response with TTL
    │
    ▼
AuditInterceptor (T010)
    │  ├── For POST/PUT/PATCH/DELETE: captures before/after snapshots
    │  └── Writes AuditLog via AuditService (append-only, fail-safe)
    │
    ▼
Feature Module Controllers (T027+)
    │
    ▼
Business Logic Services
    │
    ▼
PrismaService → PostgreSQL (sim_schema)
    │
    ▼
ErrorEnvelope Filter (T006)
    ├── Catches all unhandled exceptions
    └── Returns { success, error: { code, message, details, correlationId } }
```

### 3.3 Data Entity Relationships

```
Project ────< LocationNode ────< Customer
                                  │
                                  ├──< MeterAssignment ────< Meter
                                  │                         └──< MeterReading
                                  │
                                  ├──< SIMAssignment ────< SIMCard
                                  │
                                  ├──< Invoice ────< InvoiceLine
                                  │              └──< InvoiceAdjustment
                                  │
                                  ├──< Payment ────< PaymentAllocation ────< Invoice
                                  │
                                  ├──< CustomerLedgerEntry (append-only)
                                  │
                                  ├──< Reading ────< ReadingReview
                                  │
                                  └──< Alert ────< Ticket

TariffPlan ────< BillingPeriod
                    │
                    └──< Invoice (via tariff at billing period)

AuditLog (standalone, append-only)
ReportJob (standalone)
```

### 3.4 Frontend Data Flow (Component Hierarchy)

```
AppShell
├── TopNav
│   ├── RoleSwitcher (dev)
│   └── Breadcrumbs
├── AppSidebar
│   ├── Menu items (role-filtered from navigation.ts)
│   └── Feature flags (T022: mock vs API toggle per module)
└── Main Content Area
    ├── Dashboard
    ├── Projects → useProjectsList() → QueryBoundary
    ├── Customers → CustomersPage
    ├── Meters → MetersPage, MeterDetailPage, etc.
    ├── Readings → ReadingsPage, ReadingNewPage
    ├── Billing → InvoicesPage, PaymentsPage, etc.
    ├── Reports → ReportsPage, SettingsPage
    ├── Alerts → AlertsPage
    ├── Tickets → TicketsPage, SupportPage
    └── SIM Cards → SimCardsPage
```

---

## 4. File Dependency Graph (Critical Paths)

### 4.1 Backend Dependency Chain
```
T001 ─→ T002 ─→ T003 ─→ T004 ─→ T005
                                  │
                                  ├──→ T006 ─→ T007 ─→ T008
                                  │
                                  ├──→ T009 (JWT/RBAC) ──→ T010 (Audit)
                                  │                            │
                                  │                            └──→ T011 (API v1)
                                  │                                     │
                                  │                                     └──→ T012 (Contract Tests)
                                  │
                                  ├──→ T013 (Core Org) ──→ T014 (Meter/SIM) ──→ ...
                                  │
                                  └──→ T018 (AuditLog model) ──→ T019 (Views)
```

### 4.2 Frontend Dependency Chain
```
T020 (API client) ──→ T021 (React Query) ──→ T022 (Feature Flags)
                      │                         │
                      │                         ├──→ T027-T034 (Backend modules)
                      │                         └──→ T035-T041 (Frontend US1)
                      │
                      └── Template for all future hooks
```

### 4.3 Documentation Generation Chain
```
Source Code ──→ Tests ──→ Validation Reports ──→ documentation/
   │                     │                           ├── markdown/ (rendered)
   │                     │                           ├── text/ (grep-friendly)
   │                     │                           ├── sql/ (queryable)
   │                     │                           ├── excel/ (analyzable)
   │                     │                           └── pdf/ (printable)
   │                     │
   ├─→ graphify ──→ graph.json ──→ graph.html ──→ GRAPH_REPORT.md
   │
   └─→ AGENTS.md ──→ AI_HANDOFF.md ──→ backup files/ ──→ ROUTE_OF_DATA.md
```

---

## 5. Test Coverage Map

| Category | Files | Test Count | Status |
|---|---|---|---|
| Auth (JWT + RBAC) | `test/auth/` | 31 | ✅ ALL PASS |
| Audit (service/interceptor/decorator) | `test/audit/` | 21 | ✅ ALL PASS |
| Error Envelope | `test/error-envelope.spec.ts` | 15 | ✅ ALL PASS |
| Correlation Middleware | `test/correlation.spec.ts` | 7 | ✅ ALL PASS |
| Idempotency | `test/idempotency.spec.ts` | 8 | ✅ ALL PASS |
| Contract Harness | `test/contract/setup.spec.ts` | 1 | ✅ ALL PASS |
| **Total Backend** | 10 test files | **82/82** | ✅ |
| Frontend Lint | ESLint | 0 errors, 0 warnings | ✅ |
| Frontend Build | Next.js 16.2.6 Turbopack | Clean | ✅ |

---

## 6. Git Remotes & Branch Map

### Remotes
| Remote | URL | Purpose |
|---|---|---|
| `abady` | `https://github.com/Abady001/Meter-.git` | Upstream (PR destination) |
| `origin` | `https://github.com/Kirllos360/Meter-.git` | Fork (feature branches) |

### Active Branches (20 feature + main)
```
main ───┬── feature/t005-postgres-docker (T005)
         ├── feature/t006-error-envelope (T006)
         ├── feature/t007-correlation-middleware (T007)
         ├── feature/t008-idempotency-interceptor (T008)
         ├── feature/t009-auth-rbac (T009+T010)
         ├── feature/t011-api-versioning (T011)
         ├── feature/t012-contract-harness (T012)
         ├── feature/t013-core-org-migration (T013)
         ├── feature/t014-meter-sim-migration (T014)
         ├── feature/t015-readings-tariff-migration (T015)
         ├── feature/t016-invoices-migration (T016)
         ├── feature/t017-payments-ledger-migration (T017)
         ├── feature/t018-audit-reports (T018+T019)
         ├── feature/t020-api-client (T020)
         ├── feature/t021-react-query (T021) ← CURRENT
         └── feature/t022-validation-docs (T022)
```

---

## 7. All 85 Tasks Status (T001-T085)

### Phase 1: Setup (T001-T005) ✅ COMPLETE
| Task | Status | Key Output |
|---|---|---|
| T001 | ✅ | NestJS scaffold |
| T002 | ✅ | Config + DB modules |
| T003 | ✅ | Lint/jest tooling |
| T004 | ✅ | Prisma ORM |
| T005 | ✅ | Docker PostgreSQL |

### Phase 2: Foundational (T006-T022) ✅ T006-T022 COMPLETE
| Task | Status | Key Output |
|---|---|---|
| T006 | ✅ | ErrorEnvelope |
| T007 | ✅ | Correlation middleware |
| T008 | ✅ | Idempotency interceptor |
| T009 | ✅ | JWT + RBAC |
| T010 | ✅ | Audit log |
| T011 | ✅ | API v1 + OpenAPI |
| T012 | ✅ | Contract harness |
| T013 | ✅ | Core org migration |
| T014 | ✅ | Meter/SIM migration |
| T015 | ✅ | Reading/Tariff migration |
| T016 | ✅ | Invoice migration |
| T017 | ✅ | Payment/Ledger migration |
| T018 | ✅ | AuditLog migration |
| T019 | ✅ | Derived views |
| T020 | ✅ | API client frontend |
| T021 | ✅ | React Query hooks |
| **T022** | **✅** | **Feature flags + validation** |

### Phase 3-6 (T023-T085) ❌ PENDING
See `specs/001-metering-billing-platform/tasks.md` or `AI_HANDOFF.md` for full breakdown.

---

## 8. Key Tools & Versions

| Tool | Version | Config File |
|---|---|---|
| Node.js | 20+ | `backend/package.json` |
| NestJS | 10+ | `backend/nest-cli.json` |
| Prisma | 5+ | `backend/prisma/schema.prisma` |
| PostgreSQL | 16 | `backend/docker-compose.yml` |
| Next.js | 16.2.6 | `Frontend/next.config.ts` |
| React | 19 | `Frontend/package.json` |
| TypeScript | 5+ | `Frontend/tsconfig.json` |
| Tailwind | v4 | `Frontend/tailwind.config.ts` |
| Bun | 1.x | `Frontend/package.json` |
| shadcn/ui | latest | `Frontend/components.json` |
| TanStack Query | 5.x | `Frontend/src/lib/api/query-client.tsx` |

---

## 9. OneDrive Sync Paths

| Source | OneDrive Target |
|---|---|
| `D:\meter\Meter-\` | `OneDrive\Projects\Meter Verse\meter-\` |
| `D:\meter\Meter-\backup files\` | `OneDrive\Projects\Meter Verse\backups\` |
| `D:\meter\Meter-\documentation\` | `OneDrive\Projects\Meter Verse\docs\` |
| `D:\meter\Meter-\A*.md` (handoff files) | `OneDrive\Projects\Meter Verse\ai-handoff\` |
| `D:\meter\Meter-\ROUTE_OF_DATA.md` | `OneDrive\Projects\Meter Verse\reference\` |

---

## 10. PR Merge Order for Abady001/Meter-

```
PR #12 (T013) → PR #13 (T008) → PR #15 (T014) → PR #16 (T015)
→ PR #17 (T016) → PR #18 (T017) → PR #19 (T012) → PR #21 (T018+T019)
→ PR #22 (T020) → PR #23 (T021) → PR #24 (T022)
```

After merge: `cd backend && npx prisma migrate deploy && npx prisma generate`
