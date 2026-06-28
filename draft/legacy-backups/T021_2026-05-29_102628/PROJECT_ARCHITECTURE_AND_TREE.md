# Meter Verse — Project Architecture & Directory Tree

> Generated: 2026-05-29 | Last Task: T021 (FE-002 React Query)

## 1. Project Identity

| Field | Value |
|---|---|
| Name | Meter Verse — Utility Metering & Billing Platform |
| Stack (Backend) | NestJS + PostgreSQL + Prisma ORM |
| Stack (Frontend) | Next.js 16 + React 19 + TypeScript + Tailwind v4 + shadcn/ui |
| Runtime (Frontend) | Bun |
| Runtime (Backend) | Node 20+ |
| Author | Kirllos Hany <kirllos.hany@epower.com.eg> |
| GitHub Upstream | Abady001/Meter- |
| GitHub Fork | Kirllos360/Meter- |

## 2. Architecture Overview

```
Meter-/
├── specs/                          # Feature specs (Speckit artifacts)
│   └── 001-metering-billing-platform/
│       ├── spec.md                 # Requirements (FR-001 to FR-019)
│       ├── plan.md                 # Implementation plan
│       ├── research.md             # Architecture decisions (13)
│       ├── data-model.md           # 20 entities, state transitions
│       ├── tasks.md                # 85 tasks (T001-T085)
│       ├── quickstart.md           # Pre-flight checklist
│       └── contracts/meter-verse-api.yaml  # OpenAPI contract
├── backend/                        # NestJS modular monolith
│   ├── src/
│   │   ├── main.ts                # Entry, /api/v1 prefix, global pipes
│   │   ├── app.module.ts          # Root module
│   │   ├── auth/                  # JWT + RBAC (7 roles)
│   │   ├── audit/                 # Append-only audit log
│   │   ├── common/
│   │   │   ├── config/            # ConfigModule, DatabaseModule
│   │   │   ├── database/          # PrismaService
│   │   │   ├── http/              # ErrorEnvelope, CorrelationMiddleware, Idempotency, ExceptionFilter
│   │   │   └── openapi/           # Swagger/OpenAPI setup
│   │   ├── billing/              # (empty, T061+)
│   │   ├── customers/            # (empty, T029+)
│   │   ├── meters/               # (empty, T030+)
│   │   ├── payments/             # (empty, T065+)
│   │   ├── projects/             # (empty, T027+)
│   │   ├── readings/             # (empty, T047+)
│   │   ├── reports/              # (empty, T073+)
│   │   └── sim-cards/            # (empty, T031+)
│   ├── prisma/
│   │   ├── schema.prisma         # 20+ models, 24+ enums
│   │   └── migrations/           # 7 migrations applied
│   └── test/
│       ├── auth/                 # JWT/RBAC tests (31)
│       ├── audit/                # Audit tests (21)
│       ├── contract/             # Contract harness
│       └── correlation.spec.ts, error-envelope.spec.ts
├── Frontend/                      # Next.js 16 App Router
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx        # Root layout (ThemeProvider > QueryProvider > Toaster)
│   │   │   ├── page.tsx          # AppShell entry
│   │   │   └── api/route.ts      # API route
│   │   ├── components/
│   │   │   ├── shared/
│   │   │   │   ├── PageHelpers.tsx   # PageHeader, BackButton, StatCard, EmptyState
│   │   │   │   ├── QueryBoundary.tsx # Standard loading/error/empty (NEW T021)
│   │   │   │   └── StatusBadge.tsx
│   │   │   ├── layout/           # AppShell, AppSidebar, TopNav, ThemeProvider, etc.
│   │   │   ├── projects/         # ProjectsPage, ProjectDetailPage, LocationsPage
│   │   │   ├── customers/        # CustomersPage, CustomerDetailPage
│   │   │   ├── dashboard/        # DashboardPage
│   │   │   ├── meters/           # MetersPage, MeterDetailPage, MeterAssignPage, etc.
│   │   │   ├── readings/         # ReadingsPage, ReadingNewPage
│   │   │   ├── billing/          # InvoicesPage, InvoiceDetailPage, PaymentsPage, etc.
│   │   │   ├── reports/          # ReportsPage, SettingsPage
│   │   │   ├── alerts/           # AlertsPage
│   │   │   ├── tickets/          # TicketsPage, SupportPage
│   │   │   ├── sim-cards/        # SimCardsPage
│   │   │   ├── smart-table/      # SmartTable component
│   │   │   └── ui/               # shadcn/ui components (50+)
│   │   ├── hooks/
│   │   │   ├── use-projects.ts   # React Query hooks (NEW T021)
│   │   │   ├── use-mobile.ts
│   │   │   └── use-toast.ts
│   │   └── lib/
│   │       ├── api/
│   │       │   ├── client.ts     # Centralized fetch wrapper (T020)
│   │       │   ├── errors.ts     # ApiError class (T020)
│   │       │   ├── auth.ts       # Token storage + refresh (T020)
│   │       │   ├── index.ts      # Barrel exports (T020)
│   │       │   └── query-client.tsx # SSR-safe QueryClient + Provider (T021)
│   │       ├── mock-auth.ts      # Zustand auth store
│   │       ├── mock-data.ts      # All entity mock data
│   │       ├── types.ts          # TS interfaces + enums
│   │       ├── navigation.ts     # Role-based nav config
│   │       ├── router-store.ts   # Zustand page router
│   │       └── utils.ts          # cn() helper
│   ├── graphify-out/             # Knowledge graph (1039 nodes, 2770 edges)
│   ├── scripts/smoke-all-pages.mjs  # Playwright smoke test
│   └── FRONTEND_BUILD.md, FRONTEND_SPRINT_BACKLOG.md
├── documentation/
│   ├── markdown/                 # 40+ readable docs
│   ├── sql/                      # PostgreSQL DDL
│   ├── text/                     # Plain text versions
│   ├── excel/                    # CSV data exports
│   └── pdf/                      # Printable PDF reports
├── .specify/                     # Speckit tooling config
│   ├── templates/                # Task, spec, constitution, plan, checklist templates
│   ├── memory/constitution.md    # Project constitution (still placeholder)
│   └── scripts/bash/             # Bash automation scripts
├── .agents/                      # AI agent skills (9 speckit skills)
└── AGENTS.md, MASTER-DEPLOYMENT-GUIDE.md, PROJECT_ARCHITECTURE_AND_TREE.md, AI_HANDOFF.md, RESTORE_POINT.md
```

## 3. Complete Directory Tree

```
Meter-/
├── .agents/
│   └── skills/
│       ├── speckit-analyze/SKILL.md
│       ├── speckit-checklist/SKILL.md
│       ├── speckit-clarify/SKILL.md
│       ├── speckit-constitution/SKILL.md
│       ├── speckit-implement/SKILL.md
│       ├── speckit-plan/SKILL.md
│       ├── speckit-specify/SKILL.md
│       ├── speckit-tasks/SKILL.md
│       └── speckit-taskstoissues/SKILL.md
├── .opencode/
│   ├── commands/speckit.constitution.md
│   ├── integrations/
│   ├── opencode.json
│   └── .gitignore
├── .specify/
│   ├── feature.json
│   ├── init-options.json
│   ├── integration.json
│   ├── codex.manifest.json
│   ├── speckit.manifest.json
│   ├── memory/constitution.md
│   ├── scripts/bash/
│   │   ├── check-prerequisites.sh
│   │   ├── common.sh
│   │   ├── create-new-feature.sh
│   │   ├── setup-plan.sh
│   │   └── setup-tasks.sh
│   ├── templates/
│   │   ├── checklist-template.md
│   │   ├── constitution-template.md
│   │   ├── plan-template.md
│   │   ├── spec-template.md
│   │   └── tasks-template.md
│   └── workflows/
│       ├── speckit/workflow.yml
│       └── workflow-registry.json
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   │       ├── 20260528000100_audit_reports/migration.sql
│   │       └── 20260528000200_views/migration.sql
│   ├── src/
│   │   ├── main.ts
│   │   ├── app.module.ts
│   │   ├── app.controller.ts
│   │   ├── audit/
│   │   │   ├── audit.decorator.ts
│   │   │   ├── audit.interceptor.ts
│   │   │   ├── audit.module.ts
│   │   │   └── audit.service.ts
│   │   ├── auth/
│   │   │   ├── auth.module.ts
│   │   │   ├── jwt.strategy.ts
│   │   │   ├── roles.decorator.ts
│   │   │   ├── roles.guard.ts
│   │   │   ├── constants/
│   │   │   │   ├── index.ts
│   │   │   │   └── jwt.constants.ts
│   │   │   ├── interfaces/
│   │   │   │   ├── index.ts
│   │   │   │   ├── jwt-payload.interface.ts
│   │   │   │   └── request-with-user.interface.ts
│   │   │   └── types/
│   │   │       ├── index.ts
│   │   │       └── role.enum.ts
│   │   ├── common/
│   │   │   ├── config/config.module.ts
│   │   │   ├── database/
│   │   │   │   ├── database.module.ts
│   │   │   │   ├── database.service.ts
│   │   │   │   └── prisma.service.ts
│   │   │   ├── http/
│   │   │   │   ├── all-exceptions.filter.ts
│   │   │   │   ├── correlation.middleware.ts
│   │   │   │   ├── error-envelope.ts
│   │   │   │   └── idempotency.interceptor.ts
│   │   │   └── openapi/openapi.setup.ts
│   │   ├── billing/.gitkeep
│   │   ├── customers/.gitkeep
│   │   ├── meters/.gitkeep
│   │   ├── payments/.gitkeep
│   │   ├── projects/.gitkeep
│   │   ├── readings/.gitkeep
│   │   ├── reports/.gitkeep
│   │   ├── sim-cards/.gitkeep
│   │   └── types/express.d.ts
│   ├── test/
│   │   ├── audit/
│   │   │   ├── audit.decorator.spec.ts
│   │   │   ├── audit.interceptor.spec.ts
│   │   │   └── audit.service.spec.ts
│   │   ├── auth/
│   │   │   ├── jwt.strategy.spec.ts
│   │   │   ├── roles.decorator.spec.ts
│   │   │   └── roles.guard.spec.ts
│   │   ├── contract/
│   │   │   └── setup.ts / setup.spec.ts
│   │   ├── correlation.spec.ts
│   │   └── error-envelope.spec.ts
│   ├── docker-compose.yml
│   ├── .env / .env.example
│   ├── .eslintrc.cjs / .prettierrc
│   ├── jest.config.ts / nest-cli.json / tsconfig.json
│   ├── package.json / README.md
│   └── dist/ (compiled JS output)
├── documentation/
│   ├── excel/ (20+ CSV files)
│   ├── markdown/ (40+ MD files)
│   ├── pdf/ (20+ PDF reports)
│   ├── sql/ (DDL files)
│   └── text/ (40+ TXT files)
├── Frontend/
│   ├── .config/opencode/skills/graphify/SKILL.md
│   ├── .opencode/plugins/graphify.js
│   ├── .zscripts/
│   │   ├── build.sh / dev.sh / start.sh
│   │   └── mini-services-*.sh
│   ├── agent-ctx/4-layout-builder.md
│   ├── download/README.md
│   ├── examples/websocket/
│   │   ├── frontend.tsx
│   │   └── server.ts
│   ├── graphify-out/
│   │   ├── GRAPH_REPORT.md
│   │   ├── graph.html / graph.json / manifest.json
│   │   └── .graphify_labels.json / .graphify_root
│   ├── prisma/schema.prisma
│   ├── public/logo.svg, robots.txt
│   ├── scripts/
│   │   ├── copy-standalone.mjs
│   │   └── smoke-all-pages.mjs
│   ├── src/
│   │   ├── app/
│   │   │   ├── globals.css
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   └── api/route.ts
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
│   │   │   │   ├── AppShell.tsx
│   │   │   │   ├── AppSidebar.tsx
│   │   │   │   ├── LoginPage.tsx
│   │   │   │   ├── PageHeader.tsx
│   │   │   │   ├── PagePlaceholder.tsx
│   │   │   │   ├── RoleSwitcher.tsx
│   │   │   │   ├── ThemeProvider.tsx
│   │   │   │   └── TopNav.tsx
│   │   │   ├── meters/
│   │   │   │   ├── MeterAssignPage.tsx
│   │   │   │   ├── MeterDetailPage.tsx
│   │   │   │   ├── MeterReplacePage.tsx
│   │   │   │   ├── MetersPage.tsx
│   │   │   │   └── MeterTerminatePage.tsx
│   │   │   ├── projects/
│   │   │   │   ├── LocationsPage.tsx
│   │   │   │   ├── ProjectDetailPage.tsx (T021)
│   │   │   │   └── ProjectsPage.tsx (T021)
│   │   │   ├── readings/
│   │   │   │   ├── ReadingNewPage.tsx
│   │   │   │   └── ReadingsPage.tsx
│   │   │   ├── reports/
│   │   │   │   ├── ReportsPage.tsx
│   │   │   │   └── SettingsPage.tsx
│   │   │   ├── shared/
│   │   │   │   ├── PageHelpers.tsx
│   │   │   │   ├── QueryBoundary.tsx (NEW T021)
│   │   │   │   └── StatusBadge.tsx
│   │   │   ├── sim-cards/SimCardsPage.tsx
│   │   │   ├── smart-table/SmartTable.tsx
│   │   │   ├── tickets/
│   │   │   │   ├── SupportPage.tsx
│   │   │   │   └── TicketsPage.tsx
│   │   │   └── ui/ (50+ shadcn/ui components)
│   │   ├── hooks/
│   │   │   ├── use-mobile.ts
│   │   │   ├── use-projects.ts (NEW T021)
│   │   │   └── use-toast.ts
│   │   └── lib/
│   │       ├── api/
│   │       │   ├── auth.ts (T020)
│   │       │   ├── client.ts (T020)
│   │       │   ├── errors.ts (T020)
│   │       │   ├── index.ts (T020, T021)
│   │       │   └── query-client.tsx (NEW T021)
│   │       ├── db.ts
│   │       ├── mock-auth.ts
│   │       ├── mock-data.ts
│   │       ├── navigation.ts
│   │       ├── router-store.ts
│   │       ├── types.ts
│   │       └── utils.ts
│   ├── .gitignore
│   ├── AGENTS.md
│   ├── FRONTEND_BUILD.md
│   ├── FRONTEND_SPRINT_BACKLOG.md
│   ├── bun.lock
│   ├── components.json
│   ├── eslint.config.mjs
│   ├── next.config.ts
│   ├── next-env.d.ts
│   ├── package.json
│   ├── postcss.config.mjs
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── worklog.md
├── specs/
│   └── 001-metering-billing-platform/
│       ├── checklists/requirements.md
│       ├── contracts/meter-verse-api.yaml
│       ├── data-model.md
│       ├── plan.md
│       ├── quickstart.md
│       ├── research.md
│       ├── spec.md
│       └── tasks.md
├── .gitignore
├── AGENTS.md
├── AI_HANDOFF.md
├── MASTER-DEPLOYMENT-GUIDE.md
├── NEXT-SECTION-PROMPT.md
├── PROJECT_ARCHITECTURE_AND_TREE.md
├── PROJECT_TREE.md
├── RESTORE_POINT.md
├── T001-T020-FINISHED-TASKS.md
├── metering_system_prd_brainstorm.md
├── prompt-history_T009.md
├── prompt-history_T010.md
└── prompt-history_T011.md
```

## 4. Git Configuration

| Remote | URL | Branch |
|---|---|---|
| abady | https://github.com/Abady001/Meter-.git | main (upstream) |
| origin | https://github.com/Kirllos360/Meter-.git | main (fork) |

### Branches
- main (local + remote)
- feature/t020-api-client (current)
- feature/t021-react-query (to be created)
- feature/t005-postgres-docker through feature/t020-api-client (21 feature branches)

### Remotes
- abady/main — upstream (PRs merge here)
- origin/main — fork (Kirllos360)

## 5. Completed Tasks (T001-T021)

| ID | Description | Validation Status |
|---|---|---|
| T001 | NestJS backend scaffold | ✅ |
| T002 | Config + PostgreSQL connection | ✅ |
| T003 | Lint/format/test tooling | ✅ |
| T004 | Prisma ORM init | ✅ |
| T005 | PostgreSQL docker-compose | ✅ |
| T006 | ErrorEnvelope + global filter | ✅ |
| T007 | Correlation-ID middleware | ✅ |
| T008 | Idempotency-Key interceptor | ✅ |
| T009 | JWT Auth + RBAC (7 roles) | ✅ |
| T010 | Append-only audit log | ✅ |
| T011 | API versioning /api/v1 + OpenAPI | ✅ |
| T012 | Contract test harness | ✅ |
| T013 | Core org migration (Project, LocationNode, Customer) | ✅ |
| T014 | Meter/SIM migration | ✅ |
| T015 | Reading/Tariff migration | ✅ |
| T016 | Invoice migration | ✅ |
| T017 | Payment/Ledger migration | ✅ |
| T018 | AuditLog + ReportJob migration | ✅ |
| T019 | Derived views (3 views) | ✅ |
| T020 | FE-001 API client foundation | ✅ |
| T021 | FE-002 React Query integration pattern | ✅ |

## 6. Key File Reference

| Purpose | Path |
|---|---|
| AI Handoff | `AI_HANDOFF.md` |
| Restore Point | `RESTORE_POINT.md` |
| Tree + Architecture | `PROJECT_ARCHITECTURE_AND_TREE.md` |
| Tasks (all 85) | `specs/001-metering-billing-platform/tasks.md` |
| Spec | `specs/001-metering-billing-platform/spec.md` |
| Plan | `specs/001-metering-billing-platform/plan.md` |
| Data Model | `specs/001-metering-billing-platform/data-model.md` |
| API Contract | `specs/001-metering-billing-platform/contracts/meter-verse-api.yaml` |
| Agent Instructions | `AGENTS.md` |
| Deployment Guide | `MASTER-DEPLOYMENT-GUIDE.md` |
| Frontend Build | `Frontend/FRONTEND_BUILD.md` |
| Frontend Sprint Backlog | `Frontend/FRONTEND_SPRINT_BACKLOG.md` |
| Graphify Report | `Frontend/graphify-out/GRAPH_REPORT.md` |
| Documentation Index | `documentation/markdown/00-index.md` |
| Git Commit Log | `documentation/markdown/09-git-commit-log.md` |
| API Client | `Frontend/src/lib/api/client.ts` |
| Query Provider | `Frontend/src/lib/api/query-client.tsx` |
| Query Boundary | `Frontend/src/components/shared/QueryBoundary.tsx` |
| Query Hooks | `Frontend/src/hooks/use-projects.ts` |
| Root Layout | `Frontend/src/app/layout.tsx` |
| App Shell | `Frontend/src/components/layout/AppShell.tsx` |
| Projects Page | `Frontend/src/components/projects/ProjectsPage.tsx` |
| Project Detail | `Frontend/src/components/projects/ProjectDetailPage.tsx` |
| Prisma Schema | `backend/prisma/schema.prisma` |
| Backend Main | `backend/src/main.ts` |
