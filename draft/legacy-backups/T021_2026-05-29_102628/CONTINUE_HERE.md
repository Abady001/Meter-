# ⚠️ CONTINUE HERE — Meter Verse Backup / Restore Point
> Created: 2026-05-29 10:26:28
> Last Git Commit: `bbe4065467f347e455d365301100c33545c3bb9a`
> Branch: `feature/t021-react-query`
> Last Finished Task: **T021 — FE-002 React Query Integration Pattern**

---

## How to Use This File

1. **Attach this entire folder** (`T021_2026-05-29_102628/`) to the new AI session
2. **Read this file first** — it contains everything needed to continue
3. **Do NOT redo T021** — it is complete and committed
4. **Start with T022** — see "Next Task" section below
5. **Run `git status`** on the real repo at `D:\meter\Meter-\` to confirm state

---

## 1. Project Identity

| Field | Value |
|-------|-------|
| **Name** | Meter Verse — Utility Metering & Billing Platform |
| **Repo root** | `D:\meter\Meter-\` |
| **Remote (origin)** | `https://github.com/Kirllos360/Meter-.git` |
| **Remote (abady)** | `https://github.com/Abady001/Meter-.git` |
| **Current branch** | `feature/t021-react-query` |
| **HEAD commit** | `bbe4065` — `T021: FE-002 React Query Integration Pattern` |
| **Total commits** | 44 |
| **Author** | Kirllos Hany <kirllos.hany@epower.com.eg> (matches Kirllos360) |

---

## 2. Stack

| Layer | Technology | Version | Location |
|-------|-----------|---------|----------|
| Frontend framework | Next.js | 16.2.6 | `Frontend/` |
| UI library | React | ^19.0.0 | `Frontend/` |
| Language | TypeScript | ^5.x | `Frontend/` |
| Styling | Tailwind CSS | ^4.x | `Frontend/` |
| Package manager (frontend) | Bun | 1.3.14 | global |
| State management | Zustand | ^5.0.6 | `Frontend/` |
| Server state | TanStack React Query | ^5.82.0 | `Frontend/` |
| Component library | shadcn/ui | Latest | `Frontend/src/components/ui/` |
| Auth (frontend) | next-auth | ^4.24.11 | `Frontend/` |
| Auth (backend) | Passport + JWT | — | `backend/` |
| ORM | Prisma | ^6.11.1 | `Frontend/prisma/` (SQLite), `backend/` (PG) |
| Backend framework | NestJS | ^10.4.x | `backend/` |
| DB (dev) | SQLite | via Prisma | `Frontend/` |
| DB (production) | PostgreSQL 16 | via Docker | `backend/docker-compose.yml` |
| E2E tests | Playwright | ^1.60.0 | `Frontend/` |
| Unit tests (backend) | Jest | ^29.7.0 | `backend/` |
| Linting | ESLint | ^9.x | both |
| Formatting | Prettier | ^3.8.3 | `backend/` |
| Spec workflow | Speckit | v0.8.13 | global (via uv) |
| Knowledge graph | Graphify | v0.8.18 | `Frontend/graphify-out/` |

---

## 3. Task Status — T001 through T021

### Completed Tasks

| Task | Description | Status | Branch |
|------|------------|--------|--------|
| **T001** | Business logic layer skeleton | ✅ Done | `feature/t001-logic-skeleton` |
| **T002** | Customer management | ✅ Done | `feature/t002-customer-mgmt` |
| **T003** | Location management | ✅ Done | `feature/t003-location-mgmt` |
| **T004** | Prisma ORM + SQLite schema | ✅ Done | `feature/t004-prisma-orm` |
| **T005** | PostgreSQL Docker | ✅ Done | `feature/t005-postgres-docker` |
| **T006** | Global error envelope | ✅ Done | `feature/t006-error-envelope` |
| **T007** | Correlation middleware | ✅ Done | `feature/t007-correlation-middleware` |
| **T008** | Input validation pipe | ✅ Done | `feature/t008-validation-pipe` |
| **T009** | Auth (JWT) + RBAC | ✅ Done | `feature/t009-auth-rbac` |
| **T010** | Append-only audit log | ✅ Done | `feature/t010-audit-log` |
| **T011** | API versioning + OpenAPI | ✅ Done | `feature/t011-api-versioning` |
| **T012** | Contract test harness | ✅ Done | `feature/t012-contract-tests` |
| **T013** | Project management | ✅ Done | `feature/t013-project-mgmt` |
| **T014** | Meter/assignment schema | ✅ Done | `feature/t014-meter-schema` |
| **T015** | Reading/ billing schema | ✅ Done | `feature/t015-reading-billing` |
| **T016** | Customer billing schema | ✅ Done | `feature/t016-customer-billing` |
| **T017** | Append-only ledger | ✅ Done | `feature/t017-ledger` |
| **T018** | AuditLog index + ReportJob | ✅ Done | `feature/t018-audit-reports` |
| **T019** | Derived views | ✅ Done | `feature/t018-audit-reports` |
| **T020** | FE-001 API client foundation | ✅ Done | `feature/t020-api-client` |
| **T021** | **FE-002 React Query Integration** | ✅ **Done** | **`feature/t021-react-query` ← current** |

### PR Merge Order (10 open PRs on Abady001/Meter-)

All PRs are mergeable. Merge in this exact order:
1. T013 → T008 → T014 → T015 → T016 → T017 → T012 → T018+T019 → T020 → **T021**

PR #23 (T021): `https://github.com/Abady001/Meter-/pull/23`

### Next Task: T022 — FE-003 Feature Flag Toggles
- Scope: Create `Frontend/src/lib/feature-flags.ts` with per-module feature flags
- Each flag: `mock` (default) vs `api` — switch based on whether backend exists
- Do NOT touch any existing page components — just create the toggle system

---

## 4. T021 — What Was Done (Last Completed Task)

### Files Created
| File | Purpose |
|------|---------|
| `Frontend/src/lib/api/query-client.tsx` | SSR-safe QueryClient + QueryProvider (staleTime: 30s, gcTime: 5min, retry: 1) |
| `Frontend/src/hooks/use-projects.ts` | `useProjectsList()`, `useProjectDetail(id)`, `useCustomersList()` |
| `Frontend/src/components/shared/QueryBoundary.tsx` | Loading/error/empty component consuming T020's `ApiError` |

### Files Modified
| File | Change |
|------|--------|
| `Frontend/src/lib/api/index.ts` | Added QueryProvider export |
| `Frontend/src/app/layout.tsx` | Wrapped children with `<QueryProvider>` inside `<ThemeProvider>` |
| `Frontend/src/components/projects/ProjectsPage.tsx` | Integrated `useProjectsList` + QueryBoundary, mock fallback preserved |
| `Frontend/src/components/projects/ProjectDetailPage.tsx` | Integrated `useProjectDetail` + QueryBoundary, mock fallback preserved |

### Validation Results
- `bun run lint --no-cache --max-warnings 0` → ✅ 0 errors, 0 warnings
- `bun run build` → ✅ Next.js 16.2.6 Turbopack, no errors
- `bun run test:smoke` → ✅ Build succeeds, Playwright infra fails on Windows (pre-existing)
- `graphify query "react query hooks + loading/error/empty standards"` → ✅ Graph updated (1039 nodes, 2770 edges, 64 communities)

### SSQ / Pattern Decisions
- SSR-safe: server creates fresh QueryClient per request, client uses singleton via `getQueryClient()`
- Provider inside `<ThemeProvider>` in `layout.tsx`
- Hook naming: camelCase (`useProjectsList`) with queryKey `['resource']` and `['resource', id]`
- QueryBoundary delegates empty state to `<EmptyState>` from `PageHelpers.tsx`
- Mock fallback: `const data = apiData ?? mockData`

---

## 5. Key File Paths

| File | Purpose |
|------|---------|
| `Frontend/src/lib/api/query-client.tsx` | SSR-safe QueryClient + provider |
| `Frontend/src/lib/api/client.ts` | T020 — API client (`apiGet<T>`, `apiPost<T>`, etc.) |
| `Frontend/src/lib/api/errors.ts` | T020 — `ApiError` class |
| `Frontend/src/hooks/use-projects.ts` | T021 — React Query hooks |
| `Frontend/src/components/shared/QueryBoundary.tsx` | T021 — loading/error/empty |
| `Frontend/src/components/projects/ProjectsPage.tsx` | T021 — integrated with query |
| `Frontend/src/components/projects/ProjectDetailPage.tsx` | T021 — integrated with query |
| `Frontend/src/app/layout.tsx` | Provider hierarchy (QueryProvider inside ThemeProvider) |
| `Frontend/graphify-out/` | Knowledge graph data |
| `documentation/markdown/06-github-packages-needed.md` | Single source of truth for all tools/services |
| `documentation/markdown/00-index.md` | Full documentation index |
| `AGENTS.md` | All memory logs + project conventions |
| `AI_HANDOFF.md` | Full 12-section AI handoff |
| `RESTORE_POINT.md` | Previous restore point |
| `PROJECT_ARCHITECTURE_AND_TREE.md` | Architecture overview + directory tree |
| `T001-T020-FINISHED-TASKS.md` | Tasks T001-T021 summary |
| `specs/001-metering-billing-platform/` | All specs (spec.md, plan.md, tasks.md, data-model.md) |

---

## 6. Known Issues

| Issue | Details |
|-------|---------|
| **WSL bash relay** | `execvpe(/bin/bash)` fails — SpeckKit bash scripts cannot run on this Windows machine |
| **Playwright on Windows** | `bunx` spawn fails in `smoke-all-pages.mjs` — pre-existing, does not block development |
| **open-interpreter** | `pip install` timed out but packages confirmed installed |
| **Graphify** | Uses `uv` not `pip` — Python venv on this machine uses its own env |
| **backend/ directory** | Referenced in plans/specs but **does not exist** in this repo yet — will be created in Phase 3 |
| **Constitution** | `.specify/memory/constitution.md` is still a placeholder template — must be ratified in T085 |

---

## 7. Git Discipline

- **Commit style**: `TXXX: short description` (e.g., `T021: FE-002 React Query Integration Pattern`)
- **Author**: Kirllos Hany <kirllos.hany@epower.com.eg>
- **Push**: ONLY after user says "go" — never push without asking
- **Pre-commit**: Run `git status` first; only stage intended files; check for secrets
- **Never commit**: `.env`, `*.db`, `.next/`, `node_modules/`, `graphify-out/cache/`, workspace archives, tokens
- **Verify before commit**: `bun run lint --no-cache --max-warnings 0` (frontend), `npm run build && npm test` (backend if it existed)

---

## 8. Documentation State

All documentation files are updated through T021:

| File | Status |
|------|--------|
| `documentation/markdown/00-index.md` | ✅ Updated 2026-05-29 |
| `documentation/markdown/06-github-packages-needed.md` | ✅ Single source of truth, 14 categories |
| `documentation/text/07-github-packages-needed.txt` | ✅ Deprecated, points to 06 |
| `documentation/text/08-required-apps.txt` | ✅ Deprecated, points to 06 |
| `AGENTS.md` | ✅ T021 Memory Log added |
| `T001-T020-FINISHED-TASKS.md` | ✅ Renamed to T001-T021 scope |
| `AI_HANDOFF.md` | ✅ Comprehensive 12-section handoff |
| `RESTORE_POINT.md` | ✅ Restore point with snapshot |
| `PROJECT_ARCHITECTURE_AND_TREE.md` | ✅ Full architecture + 85-task breakdown |
| `PROJECT_TREE.md` | ✅ Updated with cross-references |

---

## 9. Environment / Configuration

### `.env` (Frontend)
Location: `Frontend/.env`
- Contains local DB URL and secrets

### Docker Compose
Location: `backend/docker-compose.yml`
- PostgreSQL 16 alpine
- Port 5432 (configurable via DB_PORT)

### Next.js Config (`Frontend/next.config.ts`)
- `output: "standalone"`
- `ignoreBuildErrors: true`
- `reactStrictMode: false`

### Key Commands (run from `Frontend/`)
```bash
bun run dev              # Dev server on :3000
bun run build            # Standalone output
bun run lint             # ESLint
bun run test:smoke       # Build + Playwright smoke traversal
bun run db:push          # Prisma push (SQLite for dev)
bun run db:migrate       # Prisma migrate dev
bun run db:generate      # Prisma generate
```

---

## 10. What To Do When You Load This File

1. Read this entire file
2. Navigate to `D:\meter\Meter-\`
3. Run `git status` to confirm state matches
4. Run `git log --oneline -5` to verify HEAD is `bbe4065`
5. Read `AGENTS.md` for full memory logs
6. Read `documentation/markdown/06-github-packages-needed.md` for tools/services
7. Start **T022**: Create `Frontend/src/lib/feature-flags.ts`
8. Follow existing patterns: mock fallback, QueryBoundary, same provider hierarchy

---

## Files in This Backup Folder

```
backup files/T021_2026-05-29_102628/
├── CONTINUE_HERE.md          ← You are here — single-file restore point
├── AI_HANDOFF.md             ← Full 12-section AI handoff
├── RESTORE_POINT.md          ← Restore point with rollback instructions
├── AGENTS.md                 ← All memory logs (T005-T021)
├── T001-T021-FINISHED-TASKS.md  ← Task summary
├── PROJECT_ARCHITECTURE_AND_TREE.md  ← Architecture + directory tree
├── 06-github-packages-needed.md  ← Single source of truth for tools
├── 00-index.md               ← Documentation index
├── PROJECT_TREE.md           ← Project tree
├── git-log.txt               ← Git log snapshot
└── project-tree.txt          ← Full project tree snapshot
```
