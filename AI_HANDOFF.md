# AI Handoff — Meter Verse (v2.0.0)
> **Purpose**: Single file containing EVERYTHING an AI agent needs to continue work on this project.
> **Generated**: 2026-06-13 | **Last Updated**: 2026-06-13 (Meter Verse v2.0.0 — Planning Complete)
> **Last Completed**: T001-T085 (original Meter Pulse) + Planning docs (12 files) + Specs/002-004 (9 files)
> **Next Task**: T086 (Core DB schema — 15 tables)

---

## 1. Project Identity

| Field | Value |
|---|---|
| Name | Meter Verse — Unified Utility Metering & Billing Platform |
| Stack (Backend) | NestJS + PostgreSQL + Prisma ORM (multi-schema) |
| Stack (Frontend) | Next.js 16 + React 19 + TypeScript + Tailwind v4 + shadcn/ui |
| Stack (Collection) | Flask 3.1.3 + Bootstrap 5 RTL + Chart.js 4.4.1 (reference) |
| Runtime (Frontend) | Bun (NOT npm/yarn — use `bun` commands) |
| Runtime (Backend) | Node 20+ (use `npm` commands) |
| Runtime (Collection) | Python 3.x |
| Author | Kirllos Hany <kirllos.hany@epower.com.eg> |
| GitHub | **https://github.com/Kirllos360/Meter** (new unified repo) |
| Git Author | `Kirllos Hany <kirllos.hany@epower.com.eg>` |
| Git Remote | `origin https://github.com/Kirllos360/Meter.git` |
| Current Branch | `main` |
| Tests | 373/373 passing (47 suites) — original Meter Pulse backend |
| Architecture | 3 Plans (Full / Safety / Failover) × 15 Areas |
| Reference Systems | 7 systems in `reference/` (collection-system, sbill, symbiot, ims, meter-department, energy-360, all-last-update) |

---

## 2. Repository Structure

```
D:\meter\Meter\          <-- The ACTUAL git repository root (was Meter-\)
├── specs/
│   ├── 001-metering-billing-platform/  # T001-T085 (original 85 tasks)
│   ├── 002-meter-verse-core/           # T086-T092 (Core DB, Auth, 16 profiles)
│   ├── 003-symbiot-integration/        # Symbiot bridge (10 TCP × 100 HTTP)
│   └── 004-migration-plans/            # Data migration + parallel run
├── backend/                             # NestJS backend (Prisma + PostgreSQL)
├── Frontend/                            # Next.js frontend (Bun runtime)
├── reference/                           # ALL reference systems (7 dirs)
│   ├── collection-system/               # Flask billing system (priority features)
│   ├── sbill/                           # SBill Palm Hills + Estates
│   ├── symbiot/                         # Symbiot SEP integration
│   ├── ims/                             # IMS system
│   ├── meter-department/               # Meter department files
│   ├── energy-360/                      # Energy 360 mobile app
│   └── all-last-update/                # Latest system updates
├── tools/playwright-mcp/               # Playwright MCP for E2E tests
├── docs/
│   ├── architecture/                     # Architecture specs
│   ├── migration/                        # Migration guides
│   └── planning/                         # 12 planning docs with Mermaid diagrams
│       ├── v2.0.0-planning-strategy.md
│       ├── v2.0.0-implementation-roadmap.md
│       ├── v2.0.0-tasks.md
│       ├── v2.0.0-workflow.md
│       ├── v2.0.0-stories.md
│       ├── v2.0.0-data-model.md
│       ├── v2.0.0-security.md
│       ├── v2.0.0-migration-plan.md
│       ├── v2.0.0-symbiot-integration.md
│       ├── v2.0.0-test-plan.md
│       ├── v2.0.0-deployment-guide.md
│       └── v2.0.0-upcoming-updates.md
├── scripts/                            # Utility scripts
├── ci-cd/                              # CI/CD pipeline configs
├── documentation/                      # All docs (markdown, sql, text, excel, pdf)
├── .specify/                           # Speckit tooling config
├── .agents/                            # AI agent skills
├── AGENTS.md                           # Main agent instructions
├── MASTER-DEPLOYMENT-GUIDE.md          # Full deployment guide (dual platform)
├── PROJECT_ARCHITECTURE_AND_TREE.md    # Full architecture + tree
├── AI_HANDOFF.md                       # THIS FILE — AI handoff
├── RESTORE_POINT.md                    # Restore point (v3)
├── T001-T022-FINISHED-TASKS.md         # Completed tasks log (T001-T085)
├── NEXT-SECTION-PROMPT.md              # Next task prompt
└── metering_system_prd_brainstorm.md   # Original PRD
```

---

## 3. Stack Commands

### Frontend (run from `Frontend/`)
```bash
bun run dev              # Dev server on :3000
bun run build            # Next.js build (standalone output)
bun run lint             # ESLint (use: --no-cache --max-warnings 0)
bun run test:smoke       # Build + Playwright smoke traversal
bun run db:push          # Prisma push
bun run db:migrate       # Prisma migrate dev
bun run db:generate      # Prisma generate
graphify query "<obj>"   # Knowledge graph query (ALWAYS first for frontend tickets)
graphify update .        # Refresh graph after code changes
```

### Backend (run from `backend/`)
```bash
npm run start:dev        # Dev server
npm run build            # TypeScript compile
npm test                 # Jest tests
npm run lint             # ESLint
npx prisma validate      # Prisma schema validation
npx prisma migrate status # Migration status
npx prisma generate      # Generate Prisma client
```

---

## 4. Architecture Constraints (NON-NEGOTIABLE)

1. **Never rebuild the frontend shell, routes, or design system** — all work is incremental API migration
2. **Frontend currently uses mock data** (`src/lib/mock-data.ts`). Migration to live APIs happens sprint-by-sprint behind feature flags
3. **Backend modules are empty** (`billing/, customers/, meters/, payments/, projects/, readings/, reports/, sim-cards/`) — only `.gitkeep` files exist. These must be implemented for user stories
4. **Prisma schema** uses multi-schema (`sim_system`), targets PostgreSQL, currently uses SQLite for dev
5. **Next config**: `output: "standalone"`, `ignoreBuildErrors: true`, `reactStrictMode: false`
6. **All server communication** must flow through T020's `apiGet<T>()`, `apiPost<T>()`, etc. — no direct `fetch()` or duplicate clients
7. **SSR/hydration protection** required for Next.js 16 App Router (QueryClient pattern in `query-client.tsx`)
8. **Graphify-first** — every frontend ticket MUST start with `graphify query "<objective>"`
9. **Mock fallback preserved** — API failure doesn't break existing UX

---

## 5. All 85 Tasks Breakdown

### Phase 1 — Setup (T001-T005) ✅ ALL DONE
| ID | Description | Status | Key Files |
|---|---|---|---|
| T001 | NestJS backend scaffold | ✅ | `backend/src/main.ts`, `app.module.ts` |
| T002 | Config + PostgreSQL connection | ✅ | `backend/src/common/config/`, `.env` |
| T003 | Lint/format/test tooling | ✅ | `.eslintrc.cjs`, `jest.config.ts` |
| T004 | Prisma ORM init | ✅ | `backend/prisma/schema.prisma` |
| T005 | PostgreSQL docker-compose | ✅ | `backend/docker-compose.yml` |

### Phase 2 — Foundational (T006-T022) ✅ T006-T021 DONE
| ID | Description | Status | Key Files |
|---|---|---|---|
| T006 | ErrorEnvelope + global filter | ✅ | `backend/src/common/http/error-envelope.ts` |
| T007 | Correlation-ID middleware | ✅ | `backend/src/common/http/correlation.middleware.ts` |
| T008 | Idempotency-Key interceptor | ✅ | `backend/src/common/http/idempotency.interceptor.ts` |
| T009 | JWT Auth + RBAC (7 roles) | ✅ | `backend/src/auth/` |
| T010 | Append-only audit log | ✅ | `backend/src/audit/` |
| T011 | API versioning /api/v1 + OpenAPI | ✅ | `backend/src/main.ts` |
| T012 | Contract test harness | ✅ | `backend/test/contract/setup.ts` |
| T013 | Core org migration | ✅ | `backend/prisma/migrations/` |
| T014 | Meter/SIM migration | ✅ | `backend/prisma/migrations/` |
| T015 | Reading/Tariff migration | ✅ | `backend/prisma/migrations/` |
| T016 | Invoice migration | ✅ | `backend/prisma/migrations/` |
| T017 | Payment/Ledger migration | ✅ | `backend/prisma/migrations/` |
| T018 | AuditLog + ReportJob migration | ✅ | `backend/prisma/migrations/` |
| T019 | Derived views (3 views) | ✅ | `backend/prisma/migrations/*_views/` |
| T020 | FE-001 API client foundation | ✅ | `Frontend/src/lib/api/` |
| **T021** | **FE-002 React Query integration** | **✅** | **See §6 below** |
| T022 | FE-003 Feature flag toggles | ✅ | `Frontend/src/lib/feature-flags.ts`, `Frontend/src/pages/api/features.ts` |

### Phase 3 — User Story 1 (T023-T042) ❌ ALL PENDING
| ID | Description | Depends On |
|---|---|---|
| T023-T026 | US1 contract + integration tests | T012, T014 |
| T027 | Projects module (CRUD) | T013, T009 |
| T028 | Locations module | T013, T009 |
| T029 | Customers module | T013, T009 |
| T030 | Meters module | T014, T009 |
| T031 | SIM module | T014, T009 |
| T032 | Assignment command | T030, T031, T025, T010 |
| T033 | Termination command | T032, T026 |
| T034 | Dashboard summary | T029, T030, T031 |
| T035-T037 | FE-010, FE-011, FE-012 Frontend | T027-T034, T022 |
| T038-T041 | FE-020, FE-021, FE-022, FE-023 | T030-T033, T022 |
| T042 | US1 batch validation | T035-T041 |

### Phase 4 — User Story 2 (T043-T052) ❌ ALL PENDING
| ID | Description | Depends On |
|---|---|---|
| T043-T045 | US2 contract + integration tests | T012, T015 |
| T046 | Project threshold config | T027, T015 |
| T047 | Readings module | T046, T045, T008, T010 |
| T047a | Polling adapter | T047, T008 |
| T048 | Review queue | T047 |
| T048a | Water balance service | T047, T030 |
| T049-T051a | Frontend FE-030, FE-031, FE-032, FE-water | T047-T048a, T022 |
| T052 | US2 batch validation | T049-T051a |

### Phase 5 — User Story 3 (T053-T072) ❌ ALL PENDING
| ID | Description | Depends On |
|---|---|---|
| T053-T060 | US3 contract + integration tests | T012, T016, T017, T009 |
| T061 | Tariff + billing period module | T015, T009 |
| T062 | Invoice generation | T061, T048, T053 |
| T062a | Water difference policy | T062, T048a, T027 |
| T063 | Invoice issue (immutability) | T062, T057, T010 |
| T064 | Invoice adjustments | T063, T054 |
| T065 | Payments (oldest-due-first) | T063, T058, T008, T010 |
| T066 | Payment reversal | T065, T059 |
| T067 | Ledger service + statement | T065, T060, T019 |
| T068-T071a | Frontend FE-040, FE-041, FE-042, FE-043, FE-consumption | T062-T067, T022 |
| T072 | US3 batch validation | T068-T071a |

### Phase 6 — Polish (T073-T085) ❌ ALL PENDING (legacy, migrated to v2.0.0)
| ID | Description | Depends On |
|---|---|---|
| T073-T074 | Report export jobs + contract test | T018, T009, T012 |
| T075 | RBAC + audit coverage tests | T009, T010 |
| T076 | FE-050 Reports v2 with async exports | T073, T022 |
| T077 | FE-051 Action-level permission gating | T009, T020 |
| T078 | FE-052 Alerts → Tickets (Phase 2) | T077 |
| T079 | FE-060 Contract + integration tests in CI | T035-T078 |
| T080 | FE-061 E2E coverage expansion | T079 |
| T081 | FE-062 Observability + UX resilience | T079 |
| T082 | Polish batch validation | T076-T081 |
| T083 | Reconcile contracts | T023-T024, T043-T044, T053-T056, T074 |
| T084 | Quickstart MVP validation | T042, T052, T072, T082, T083 |
| T084a | Backup/restore drill | T002, T005, T084 |
| T085 | Ratify constitution | T084, T084a |

### Phase 7 — Meter Verse v2.0.0 (T086-T150) 🚀 PLANNED

#### Phase 0: Foundation (T086-T090)
| ID | Description | Depends On |
|---|---|---|
| T086 | Create Core DB schema (15 tables: User, Role, Permission, Area, Project, etc.) | None (new project) |
| T087 | Create Features DB schema (10 tables: Tariff, Charge, Report, Job, etc.) | T086 |
| T088 | Create Area DB template (45 tables) | T087 |
| T089 | Implement 16-profile RBAC with area middleware | T086 |
| T090 | i18n engine: 676 AR/EN keys | T086 |

#### Phase 1: Infrastructure (T091-T092)
| ID | Description | Depends On |
|---|---|---|
| T091 | Symbiot bridge: 10 TCP × 100 HTTP multiplex | T086 |
| T092 | 3 availability plans (Full/Safety/Failover) | T086, T087, T088 |

#### Phase 2: Core Pages (T093-T098)
| ID | Description | Depends On |
|---|---|---|
| T093 | Customer page (3×5 business cards design) | T086, T088, T090 |
| T094 | Meter page (type icons, relay signals, 11 actions) | T086, T088 |
| T095 | Balances page (5 tabs: Water/Electric/Solar/Chilled/Gas) | T086, T088 |
| T096 | Payments page (search → history → pay flow) | T086, T088 |
| T097 | Invoices page (preview + pay + delete + under review) | T086, T088 |
| T098 | Readings page (unified + quarantine + solar wallet) | T086, T088, T091 |

#### Phase 3: Features (T099-T106)
| ID | Description | Depends On |
|---|---|---|
| T099 | Meter Lifecycle + Data Hub (4-stage + all processes) | T094, T098 |
| T100 | Tariffs page (unified with charges + measurement points) | T087, T090 |
| T101 | Workspace (alerts + tickets + assign requests) | T093-T098 |
| T102 | 32 reports (port 93 JasperReports one-by-one) | T087 |
| T103 | Admin + Superadmin merged page | T089, T090 |
| T104 | Locations page (renamed units + smart search) | T086, T088 |
| T105 | Login page (Meter Verse theme, role redirect) | T089 |
| T106 | Dashboard (per-area KPIs + 5 Recharts) | T093-T098 |

#### Phase 4: Migration (T107-T111)
| ID | Description | Depends On |
|---|---|---|
| T107 | Solar wallet + historical data migration | T098 |
| T108 | Data migration: SBill Palm Hills → Area DBs | T088 |
| T109 | Data migration: SBill Estates → Area DBs | T088 |
| T110 | Data migration: Collection Tracker → new structure | T088 |
| T111 | 30-day parallel run validation | T108-T110 |

#### Phase 5: Quality (T112-T116)
| ID | Description | Depends On |
|---|---|---|
| T112 | Security audit + penetration testing | T086-T106 |
| T113 | Load test (20 concurrent users) | T086-T106 |
| T114 | Graphify 1000-node certification | T086-T106 |
| T115 | SpeckIt loop testing per phase | T086-T106 |
| T116 | CI/CD pipeline (Linux + Windows) | T086-T106 |

#### Phase 6: Launch (T117-T120)
| ID | Description | Depends On |
|---|---|---|
| T117 | Deploy: Core on Linux, Symbiot bridge on Windows | T116 |
| T118 | Cutover + DNS switch | T117 |
| T119 | Documentation freeze + user training | T118 |
| T120 | Post-launch monitoring (30 days) | T119 |

#### Reserved (T121-T150)
| ID | Description |
|---|---|
| T121-T150 | Reserved for bug fixes + enhancements post-launch |

---

### What Was Created
| File | Purpose |
|---|---|
| `Frontend/src/lib/feature-flags.ts` | Per-module mock/API toggle with `getModuleSource()` |
| `Frontend/src/pages/api/features.ts` | API endpoint exposing current flag state |
| `ROUTE_OF_DATA.md` | Complete architecture & data flow map (338 lines) |
| `documentation/markdown/16-checkpoint-report.md` | Full checkpoint validation report |

### What Was Updated
| File | Change |
|---|---|
| `AI_HANDOFF.md` | Added T022 details, updated next task |
| `AGENTS.md` | Added T022 memory log |
| `RESTORE_POINT.md` | Updated to v2 |
| `T001-T022-FINISHED-TASKS.md` | Added T022 |
| `PROJECT_ARCHITECTURE_AND_TREE.md` | Updated tree + T022 |
| `PROJECT_TREE.md` | Updated directory listing |
| `documentation/markdown/00-index.md` | Added T022 entries |

### Validation Results
- `bun run build` — ✅ Clean
- `bun run lint --no-cache --max-warnings 0` — ✅ 0 errors, 0 warnings
- `cd backend && npm test` — ✅ 82/82 passing
- `npm run build` — ✅ Clean
- `npm run lint` — ✅ Clean
- `npx prisma validate` — ✅ Valid
- graphify structural AST — ✅ 198 files parsed

### Feature Flag Usage Pattern
```typescript
import { featureFlags, getModuleSource } from '@/lib/feature-flags';
const source = getModuleSource('projects'); // 'mock' | 'api'
const data = source === 'api' ? apiData : mockData;
```

---

## 7. T021 — (FE-002 React Query Integration)

### What Was Created

| File | Purpose |
|---|---|
| `Frontend/src/lib/api/query-client.tsx` | SSR-safe QueryClient + QueryProvider (staleTime: 30s, gcTime: 5min, retry: 1) |
| `Frontend/src/hooks/use-projects.ts` | `useProjectsList()`, `useProjectDetail(id)`, `useCustomersList()` |
| `Frontend/src/components/shared/QueryBoundary.tsx` | Standardized loading/error/empty component (consumes T020 ApiError) |

### What Was Modified

| File | Change |
|---|---|
| `Frontend/src/lib/api/index.ts` | Added `QueryProvider` export |
| `Frontend/src/app/layout.tsx` | Wrapped children with `<QueryProvider>` inside `<ThemeProvider>` |
| `Frontend/src/components/projects/ProjectsPage.tsx` | Integrated `useProjectsList` + `QueryBoundary` wrapping, mock fallback preserved |
| `Frontend/src/components/projects/ProjectDetailPage.tsx` | Integrated `useProjectDetail` + `QueryBoundary` wrapping, mock fallback preserved |

### Validation Results
- `bun run lint --no-cache --max-warnings 0` — ✅ Pass (0 errors, 0 warnings)
- `bun run build` — ✅ Pass (Next.js 16.2.6, Turbopack)
- `bun run test:smoke` — Build ✅, Playwright infra fails on Windows (pre-existing issue)

### Key Design Decisions
1. **SSR-safe QueryClient**: Server creates fresh per-request, client uses stable `useState` reference (module-level singleton via `getQueryClient()`)
2. **Provider placement**: Inside `<ThemeProvider>` in `layout.tsx` — same pattern as existing providers, minimal risk
3. **Hook naming**: camelCase (`useProjectsList`, `useProjectDetail`) with `queryKey` convention `['resource']` and `['resource', id]`
4. **QueryBoundary empty state**: Delegates to existing `<EmptyState>` from `PageHelpers.tsx` — no new design system components
5. **Mock fallback**: `const data = apiData ?? mockData` — preserves existing UX when API is unavailable

### T021 Hook Pattern (copy for future FE-* tickets)
```tsx
// Frontend/src/hooks/use-<resource>.ts
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';
import type { Resource } from '@/lib/types';

const KEY = '<resource>';

export function useResourceList() {
  return useQuery({
    queryKey: [KEY],
    queryFn: () => apiGet<Resource[]>('/<resources>'),
  });
}

export function useResourceDetail(id: string) {
  return useQuery({
    queryKey: [KEY, id],
    queryFn: () => apiGet<Resource>(`/<resources>/${id}`),
    enabled: !!id,
  });
}
```

### QueryBoundary Usage Pattern
```tsx
import { QueryBoundary } from '@/components/shared/QueryBoundary';
import { useResourceList } from '@/hooks/use-resource';

function MyPage() {
  const { data: apiData, isLoading, isError, error } = useResourceList();
  const items = apiData ?? mockData;

  return (
    <QueryBoundary isLoading={isLoading} isError={isError} error={error}
      isEmpty={!isLoading && items.length === 0} emptyMessage="No items">
      {/* children rendered when data is ready */}
    </QueryBoundary>
  );
}
```

---

## 8. Git Setup

```bash
# Current state
git remote -v
# abady  https://github.com/Abady001/Meter-.git (fetch/push)
# origin https://github.com/Kirllos360/Meter-.git (fetch/push)

git branch -a
# main, feature/t021-react-query (current), 20+ feature branches

# T022 commit + PR:
git checkout -b feature/t022-validation-docs
git add ROUTE_OF_DATA.md AI_HANDOFF.md RESTORE_POINT.md T001-T022-FINISHED-TASKS.md PROJECT_TREE.md PROJECT_ARCHITECTURE_AND_TREE.md AGENTS.md documentation/markdown/00-index.md Frontend/src/lib/feature-flags.ts Frontend/src/pages/api/features.ts documentation/markdown/16-checkpoint-report.md
git commit -m "T022: add feature flags, ROUTE_OF_DATA.md, multi-tool validation" --author="Kirllos Hany <kirllos.hany@epower.com.eg>"
git push origin feature/t022-validation-docs
gh pr create --repo Abady001/Meter- --head Kirllos360:feature/t022-validation-docs --base main --title "T022: Multi-Tool Validation & Documentation Update" --body "Adds FE-003 feature flags, ROUTE_OF_DATA.md (complete architecture map), updated AI_HANDOFF.md, RESTORE_POINT.md, AGENTS.md, T001-T022-FINISHED-TASKS.md. Validated: backend 82/82 tests ✅ frontend lint ✅ build ✅"
```

---

## 9. PR Merge Order for Abady001/Meter-

The following PRs (all MERGEABLE, 0 behind main) should be merged in order:

```
#12 (T013) → #13 (T008) → #15 (T014) → #16 (T015) → #17 (T016)
→ #18 (T017) → #19 (T012) → #21 (T018+T019) → #22 (T020)
→ #23 (T021) → #24 (T022)
```

After merge: `cd backend && npx prisma migrate deploy && npx prisma generate`

---

## 10. Environment Configuration

```env
# Backend .env
PORT=3001
DB_HOST=127.0.0.1
DB_PORT=5432
DB_NAME=Meter_Verse_pulse
DB_SCHEMA=sim_system
DB_USER=Meter_Verse_pulse
DB_PASSWORD=Meter_Verse_pulse_dev
DATABASE_URL=postgresql://Meter_Verse_pulse:Meter_Verse_pulse_dev@127.0.0.1:5432/Meter_Verse_pulse?schema=sim_system
JWT_SECRET=dev-jwt-secret-do-not-use-in-production
JWT_EXPIRES_IN=3600

# Frontend .env.local
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

---

## 11. Known Issues & Blockers

| Issue | Details |
|---|---|
| WSL bash relay | `execvpe(/bin/bash) failed` — SpeckKit bash scripts can't run on Windows |
| `bunx` spawn on Windows | `smoke-all-pages.mjs` uses `bunx` which fails on Windows |
| Constitution | `.specify/memory/constitution.md` template placeholders — must be ratified |
| `.opencode` at root | Two `.opencode/` dirs exist (`Meter\` root + `D:\meter\.opencode\`) — consolidate |
| Playwright MCP | Installed at `tools/playwright-mcp/` but not configured in opencode.json yet |
| Original Meter- repo | `D:\meter\Meter-\` still exists with old .git — archive after migration verified |
| Reference sizes | Large reference dirs (meter-department 4.1 GB, sbill 2.1 GB) — exclude from git |
| Git LFS | Not set up — large reference files should use Git LFS or `.gitignore` |

---

## 12. Important File Paths (Quick Reference)

| What | Path (relative to Meter/) |
|---|---|
| All Tasks (original) | `specs/001-metering-billing-platform/tasks.md` |
| All Tasks (v2.0.0) | `specs/002-meter-verse-core/tasks.md` (T086+) |
| Spec (FRs) | `specs/001-metering-billing-platform/spec.md` |
| Implementation Plan | `specs/001-metering-billing-platform/plan.md` |
| Data Model | `specs/001-metering-billing-platform/data-model.md` |
| API Contract | `specs/001-metering-billing-platform/contracts/meter-verse-api.yaml` |
| Agent Instructions | `AGENTS.md` |
| Deployment Guide | `MASTER-DEPLOYMENT-GUIDE.md` |
| Execution Strategy | `specs/002-meter-verse-core/execution-plan.md` |
| Collection System Plan | `reference/collection-system/docs/specs/PLAN_EXECUTION_STRATEGY.md` |
| Three-System Comparison | `reference/collection-system/docs/specs/THREE_SYSTEM_COMPARISON.md` |
| Gap Analysis | `reference/collection-system/docs/specs/COLLECTION_SYSTEM_GAP_ANALYSIS.md` |
| Frontend Build | `Frontend/FRONTEND_BUILD.md` |
| Frontend Backlog | `Frontend/FRONTEND_SPRINT_BACKLOG.md` |
| Graph Report | `Frontend/graphify-out/GRAPH_REPORT.md` |
| Doc Index | `documentation/markdown/00-index.md` |
| Git Commit Log | `documentation/markdown/09-git-commit-log.md` |
| Validation Reports | `documentation/markdown/13-T*-validation-report.md` |
| API Client | `Frontend/src/lib/api/client.ts` |
| Query Provider | `Frontend/src/lib/api/query-client.tsx` |
| Query Boundary | `Frontend/src/components/shared/QueryBoundary.tsx` |
| Query Hooks | `Frontend/src/hooks/use-projects.ts` |
| Root Layout | `Frontend/src/app/layout.tsx` |
| Projects Page | `Frontend/src/components/projects/ProjectsPage.tsx` |
| Project Detail | `Frontend/src/components/projects/ProjectDetailPage.tsx` |
| App Shell | `Frontend/src/components/layout/AppShell.tsx` |
| Prisma Schema | `backend/prisma/schema.prisma` |
| Backend Main | `backend/src/main.ts` |
| Auth Module | `backend/src/auth/` |
| Audit Module | `backend/src/audit/` |
| Error Envelope | `backend/src/common/http/error-envelope.ts` |
| Correlation ID | `backend/src/common/http/correlation.middleware.ts` |
| Idempotency Key | `backend/src/common/http/idempotency.interceptor.ts` |
| Route of Data | `ROUTE_OF_DATA.md` |
| Feature Flags | `Frontend/src/lib/feature-flags.ts` |
| Feature Flags API | `Frontend/src/pages/api/features.ts` |
| Tree + Architecture | `PROJECT_ARCHITECTURE_AND_TREE.md` |
| AI Handoff (this file) | `AI_HANDOFF.md` |
| Restore Point | `RESTORE_POINT.md` |
| Collection System Models | `reference/collection-system/app/models.py` (~50 tables) |
| Collection System Routes | `reference/collection-system/app/routes_*.py` (16 files) |
| Playwright MCP | `tools/playwright-mcp/` |

---

## 14. Session Checkpoint / Backup (v2.0.0 Migration)

The last session checkpoint is located at:
- **`backup files/v2.0.0-migration_2026-06-13/`**
- Start with: `RESTORE_POINT.md` (v3 — updated for Meter Verse v2.0.0)
- That folder contains the full workspace snapshot before migration

To restore from scratch:
```bash
git clone https://github.com/Kirllos360/Meter.git
cd Meter
# Backend
cd backend && npm install && docker compose up -d db && npx prisma generate && npx prisma migrate deploy
# Frontend
cd ../Frontend && bun install && bun run build
# Playwright MCP (optional, for E2E tests)
cd ../tools/playwright-mcp && npm install
```

### Migration Archive
- Old repo (`Meter-\`) kept at `D:\meter\Meter-\` until v2.0.0 stable
- Collection System kept at `D:\Collection System\` (running production) — mirrored to `reference/collection-system/`
- All 7 reference systems mirrored at `D:\meter\Meter\reference\`

---

## 13. Graphify Knowledge Graph Summary

- **198 code files** (structural AST), 121 docs, 18 papers, 1 image
- **Structural AST extraction**: 198/198 files completed ✅
- **Semantic extraction**: Skipped (DeepSeek API needs credits)
- **Frontend graph**: 128 files, 1039 nodes, 2770 edges, 64 communities
- **God nodes**: `cn()` (276), `SmartTable()` (49), `Button()` (48), `StatusBadge()` (45), `PageHeader()` (35)
- Graph output at `graphify-out/` (root level, structural) and `Frontend/graphify-out/` (frontend-only)
- After code changes, run: `graphify update .`

---

## 14. RCA Sprint Memory Log (2026-06-01)

**Task**: RCA Sprint — deep scan fixes + CI workflow fixes + T061-T065 billing implementation
**Branch**: `feature/t055-payments-contract`
**Status**: Complete
**Commits**: `95ea349` (HEAD) | 7 commits this session

### Fixed Issues

| # | Issue | Root Cause | Fix |
|---|-------|-----------|-----|
| 1 | **Depcruise dependency confusion** | `depcruise` is a name-squatted placeholder | Changed to `npx dependency-cruiser` in run.ps1 and test-agent.yml |
| 2 | **ESLint v10 flat config** | ESLint v10 dropped `.eslintrc.*`; env var workaround is Unix-only | Created `eslint.config.js`, upgraded `eslint-plugin-security` v2→v4 |
| 3 | **Prettier 127 files** | Never run `prettier --write` project-wide | Ran `prettier --write` on all 127 backend .ts files |
| 4 | **Husky broken** | `husky.sh` missing, POSIX-only hook, ESLint incompatibility | Rewrote for v9 format, set `git config core.hooksPath .husky` |
| 5 | **Njsscan crash** | Python `libsast/semgrep` version mismatch | Added graceful fallback + semgrep direct scan in run.ps1 |
| 6 | **Codespell 9 typos** | `MapPin` (lucide icon) false positives | Created `.codespell-ignore` ignore file |
| 7 | **CI backend — npm ci fail** | `prepare: husky` runs but husky in root node_modules | Changed to safe try/catch wrapper + `--ignore-scripts` |
| 8 | **CI sbom — cyclonedx fail** | No deps installed before SBOM generation | Added `npm install` before cyclonedx |
| 9 | **CI backend — prisma validate fail** | `DATABASE_URL` env var not set on step | Moved to job-level env |
| 10 | **CI backend — prisma migrate fail** | PostgreSQL schema `sim_system` doesn't exist | Added `CREATE SCHEMA` + `prisma migrate deploy` |
| 11 | **CI security — SARIF upload fail** | Missing `security-events: write` permission | Added permissions block |
| 12 | **CI backend — DB auth fail** | ConfigService loads `.env` which doesn't exist on CI | Created `.env` from CI env vars |

### Validation

| Check | Result |
|-------|--------|
| Backend Build (tsc) | ✅ Clean |
| Backend ESLint | ✅ 0 errors, 6 warnings |
| Frontend Lint | ✅ 0 errors |
| Frontend Build (Next.js 16) | ✅ Clean |
| Prettier (127 files) | ✅ All matched |
| Prisma Schema | ✅ Valid |
| Tests | ✅ **373/373 passing** (47 suites) |
| Depcruise | ✅ 0 violations |
| Codespell | ✅ 0 typos |
| CI (5 jobs) | ✅ **All green** |

### Restore Point
- RCA Report: `test-agent/reports/RCA-REPORT-20260601.md`
- OneDrive: `C:\Users\EPower\OneDrive - EPower\kirllos\app\meter-verse\Meter-\`

### Next Tasks
- T062a: Water difference billing policy
- T066: Payment reversal (`POST /payments/:id/reverse`)
- T067: Ledger service + `GET /customers/:id/statement`
- T068-T072: Frontend API migration

---

## 15. docs/planning/ — Quick Reference

| File | Description | Size |
|------|-------------|------|
| v2.0.0-planning-strategy.md | 15+2 DB arch, 3 plans, 14 pages, 16 profiles, 15 areas | ~16 KB |
| v2.0.0-implementation-roadmap.md | 12-phase plan with gantt chart | ~16 KB |
| v2.0.0-tasks.md | T086-T150 (65 tasks with deps, acceptance, rollback) | ~33 KB |
| v2.0.0-workflow.md | 9 Mermaid diagrams (meter lifecycle, invoice, payment, etc.) | ~22 KB |
| v2.0.0-stories.md | 34 user stories across 14 pages | ~21 KB |
| v2.0.0-data-model.md | Core DB (15), Features DB (10), Area DB template (45) | ~35 KB |
| v2.0.0-security.md | 16-profile RBAC, RSA 2048, JWT, immutable invoices | ~12 KB |
| v2.0.0-migration-plan.md | Zero-downtime migration, rollback per phase | ~17 KB |
| v2.0.0-symbiot-integration.md | 10 TCP × 100 HTTP, per-area bridge model | ~7 KB |
| v2.0.0-test-plan.md | 600+ test target, categories, coverage | ~5 KB |
| v2.0.0-deployment-guide.md | Linux Core + Windows Symbiot dual deployment | ~7 KB |
| v2.0.0-upcoming-updates.md | Reserved future features (mobile, AI, blockchain) | ~2 KB |

### Specs Reference

| Path | Description | Files |
|------|-------------|-------|
| specs/002-meter-verse-core/ | Core DB, RBAC, i18n, Availability | spec.md, plan.md, data-model.md |
| specs/003-symbiot-integration/ | Symbiot bridge TCP/HTTP | spec.md, plan.md, data-model.md |
| specs/004-migration-plans/ | Data migration plans | spec.md, plan.md, data-model.md |
