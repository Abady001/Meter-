# Meter Verse — Utility Metering & Billing Platform

## Stack
- **Frontend** (`Frontend/`): Next.js 16 + React 19 + TypeScript + Tailwind v4 + shadcn/ui
- **Backend** (planned, not yet created): NestJS + PostgreSQL + Prisma ORM
- **Runtime**: Bun (not npm/yarn)
- **Auth**: next-auth v4 (frontend)

## Key commands (run from `Frontend/`)
```bash
bun run dev              # dev server on :3000
bun run build            # standalone output + static cp
bun run lint             # ESLint
bun run test:smoke       # build + Playwright smoke traversal
bun run db:push          # Prisma push (SQLite for dev)
bun run db:migrate       # Prisma migrate dev
bun run db:generate      # Prisma generate
```

## Architecture constraints
- **Never rebuild the frontend shell, routes, or design system.** All work is incremental API migration.
- Frontend currently uses mock data (`src/lib/mock-*.ts`). Migration to live APIs happens sprint-by-sprint.
- Backend (`backend/`) does not exist yet — NestJS modular monolith planned in `specs/001-metering-billing-platform/plan.md`.
- Prisma schema (`Frontend/prisma/schema.prisma`) currently uses SQLite; production target is PostgreSQL.
- Next config: `output: "standalone"`, `ignoreBuildErrors: true`, `reactStrictMode: false`.

## Spec workflow (Speckit)
- Feature specs live in `specs/<feature-id>/` — currently `001-metering-billing-platform/`.
- Key files: `spec.md` (requirements), `plan.md` (impl plan), `data-model.md`, `contracts/meter-verse-api.yaml`, `tasks.md`.
- `.specify/` contains workflow config, skill templates, and Speckit pipeline scripts.
- Run `quickstart.md` checks before kicking off `/speckit-tasks`.

## Graphify (knowledge graph)
- Graph lives at `Frontend/graphify-out/`. **Every frontend ticket must start with `graphify query "<objective>"`**.
- After modifying code: `graphify update .`
- See `Frontend/AGENTS.md` for full graphify rules.

## Testing
- Smoke tests: `bun run test:smoke` (Playwright, traverses all pages).
- Backend contract/integration tests are planned but not yet set up.

## Documentation (`documentation/`)
- Organized by format type into subfolders:
  - `markdown/` — readable docs (conversation log, memory files, DB schema, languages, packages, commit log)
  - `sql/` — PostgreSQL DDL (20 tables with enums, indexes, views, triggers)
  - `text/` — plain text versions of all markdown content
  - `excel/` — CSV data (tables, state transitions, business rules, audit log, commit log)
  - `pdf/` — printable PDF versions of all content
- Start at `documentation/markdown/00-index.md` for the full file index
- **Commit log**: `markdown/09-git-commit-log.md` / `excel/09-git-commit-log.csv` — every commit recorded with timestamp

## Git / Commit Discipline
- **Author**: Kirllos Hany <kirllos.hany@epower.com.eg> (matches GitHub account Kirllos360)
- **Style**: `TXXX: short description` (e.g., `T004: init Prisma ORM`)
- **When**: After every completed task
- **Push**: ONLY after user says "go" — never push without asking
- **Token**: Never used without explicit user permission
- **Pre-commit**: Always run `git status` first; only stage intended files; check for secrets
- **Never commit**: `.env`, `*.db`, `.next/`, `node_modules/`, `graphify-out/cache/`, workspace archives, tokens

## T005 Memory Log (2026-05-26)

- **Task**: T005 — Add local PostgreSQL via docker-compose
- **Status**: done
- **Changed**: Updated `backend/docker-compose.yml` (env vars, healthcheck), created `backend/README.md`
- **Validation**: docker compose up ✅, compose ps ✅ healthy, prisma validate ✅, prisma generate ✅, tsc ✅, eslint ✅
- **Commit**: `e46c26a build(backend): add postgres docker compose for T005`
- **Branch**: `feature/t005-postgres-docker`
- **Next**: T006
- **Risks**: None — port 5432 configurable via DB_PORT env var

## On-Message Git Check
Every time the user sends a message, run `git status --short` to detect any changes since last session. If changes exist, log them to the audit log and commit log. Keep local files in sync.

## Important quirks
- `.env` files are gitignored. Check `Frontend/.env` for local DB URL and secrets.
- `backend/` is referenced in plan docs but does not exist in this repo yet.
- Constitution (`specify/memory/constitution.md`) is still a template placeholder — must be ratified before implementation closeout.
- Git: no conventional commits, no CI workflows, no branch conventions documented.
- Never commit `*.db`, `.next/`, `node_modules/`, `graphify-out/cache/`, or workspace archives.

---

## T009 Memory Log

**Task**: T009 — Implement Auth (JWT) + RBAC guard + role model
**Story**: Foundational — Phase 2
**Status**: Complete
**Date**: 2026-05-26
**Branch**: feature/t009-auth-rbac
**Commit**: 8c03a81

### What Changed
- Created `backend/src/auth/` module with:
  - `types/role.enum.ts` — 7 roles matching frontend UserRole type
  - `interfaces/jwt-payload.interface.ts` — JWT payload shape (sub, userId, role, projectScope)
  - `interfaces/request-with-user.interface.ts` — Express Request extension
  - `constants/` — JWT config defaults
  - `roles.decorator.ts` — @Roles() decorator using SetMetadata
  - `jwt.strategy.ts` — Passport JWT strategy with payload validation
  - `roles.guard.ts` — Reflector-based RBAC guard with ForbiddenException
  - `auth.module.ts` — Module with registerAsync for JwtModule using ConfigService
- Modified `src/main.ts` — added global ValidationPipe (whitelist, forbidNonWhitelisted, transform)
- Modified `src/app.module.ts` — imported AuthModule
- Modified `package.json` — added @nestjs/passport, @nestjs/jwt, passport, passport-jwt, class-validator, class-transformer, @types/passport-jwt, @types/passport
- Modified `tsconfig.json` — added "jest" to types, removed test/ and *.spec.ts from exclude
- Modified `.eslintrc.cjs` — added test/ to ignorePatterns
- Modified `.env` — added JWT_SECRET, JWT_EXPIRES_IN
- Modified `.env.example` — added placeholder JWT_SECRET, JWT_EXPIRES_IN
- Created `test/auth/roles.guard.spec.ts` — 15 tests (8 guard + 7 role enum)
- Created `test/auth/jwt.strategy.spec.ts` — 10 tests
- Created `test/auth/roles.decorator.spec.ts` — 5 tests
- Created validation reports in markdown, sql, text, csv formats
- Updated documentation index, commit log, memory files
- Saved prompt history to prompt-history_T009.md

### Validation
- `npm test` — 31/31 passing (3 suites)
- `npm run build` — clean
- `npm run lint` — clean

### Frontend Role Verification
- Verified `Frontend/src/lib/types.ts` UserRole type: super_admin, project_admin, operator, technician, finance, support, customer
- Backend Role enum matches all 7 exactly

### Next Task
- T010

---

## T010 Memory Log

**Task**: T010 — Implement append-only audit log service + interceptor
**Story**: Foundational — Phase 2
**Status**: Complete
**Date**: 2026-05-26
**Branch**: feature/t009-auth-rbac
**Commit**: d0d72b4

### What Changed
- Cherry-picked T006 (error envelope) and T007 (correlation middleware) from their branches
- Added `AuditLog` model to `prisma/schema.prisma` — 11 fields, append-only design
- Created `src/audit/audit.decorator.ts` — `@Audit('resource', 'action')` method decorator
- Created `src/audit/audit.service.ts` — injectable service with fail-safe Prisma writes
- Created `src/audit/audit.interceptor.ts` — global interceptor for POST/PUT/PATCH/DELETE
- Created `src/audit/audit.module.ts` — module exporting service + interceptor
- Registered AuditInterceptor globally in `src/app.module.ts` via APP_INTERCEPTOR
- Created 21 tests (service: 4, interceptor: 12, decorator: 4)
- Installed @nestjs/testing dev dependency

### Dependencies Satisfied
- T004 (Prisma) — AuditLog model
- T006 (ErrorEnvelope) — cherry-picked
- T007 (CorrelationMiddleware) — cherry-picked, req.correlationId extracted
- T009 (JWT Auth/RBAC) — req.user.userId, req.user.role extracted

### Validation
- `npm test` — 69/69 passing (8 suites)
- `npm run build` — clean
- `npm run lint` — clean
- `npx prisma validate` — valid

### Append-Only Guarantees
- AuditService only exposes `create()` — no update/delete methods
- Interceptor catches DB errors without blocking the response
- Before/after snapshots captured from request body and response

### Next Task
- T011

---

## T011 Memory Log

**Task**: T011 — Wire API versioning `/api/v1`, base routing, and OpenAPI serving
**Story**: Foundational — Phase 2
**Status**: Complete
**Date**: 2026-05-26
**Branch**: feature/t011-api-versioning
**Commit**: a18038f

### What Changed
- Created `src/common/openapi/openapi.setup.ts` — reusable Swagger/OpenAPI helper
- Updated `src/main.ts` — added `app.setGlobalPrefix('api/v1')` and `setupOpenApi(app)`
- Installed `@nestjs/swagger@7.4.2` + `swagger-ui-express@5.0.1`

### Endpoints
- `/api/v1/health` — health check (moved under global prefix)
- `/api/v1/docs` — Swagger UI (returns 200)
- `/api/v1/docs-json` — OpenAPI JSON spec

### OpenAPI Configuration
- Title: Meter Verse API
- Version: 1.0
- Server: /api/v1
- JWT bearer auth scheme pre-configured

### Validation
- `npm test` — 69/69 passing
- `npm run build` — clean
- Server startup — successful
- `curl /api/v1/health` — `{"status":"ok"}`
- `curl /api/v1/docs-json` — valid OpenAPI 3.0 JSON
- `curl /api/v1/docs` — HTTP 200

### Next Task
- T012

---

## T019 Memory Log

**Task**: T019 — Migration: Derived Views
**Story**: Phase 2 (schema)
**Status**: Complete
**Date**: 2026-05-28
**Branch**: feature/t018-audit-reports

### What Changed
- Created `backend/prisma/migrations/20260528000200_views/migration.sql` with 3 views:
  - `Meter_Verse_assignment_active_view` — active meter assignments (7 cols, filter `end_at IS NULL`)
  - `sim_assignment_active_view` — active SIM assignments (6 cols, filter `end_at IS NULL`)
  - `customer_statement_view` — financial statement with debit/credit/running_balance (8 cols)
- All views use `CREATE OR REPLACE VIEW` with `sim_system` schema qualification
- Debit/credit derived from `amount_delta` signed value via CASE expressions
- Running balance uses stored `running_balance` from append-only ledger

### Dependencies
- T014 (Meter_Verse_assignments, sim_assignments tables)
- T017 (customer_ledger_entries table)

### Validation
- `npx prisma validate` — ✅ Valid
- `npx prisma migrate status` — ✅ Up to date
- `npm run build` — ✅ Clean
- `npm test` — ✅ 77/77 passing
- Column definitions verified for all 3 views via `information_schema.columns`

### Next Task
- T020

---

## T021 Memory Log

**Task**: T021 — FE-002 React Query Integration Pattern
**Story**: Sprint 0 — Foundations (frontend)
**Status**: Complete
**Date**: 2026-05-29
**Branch**: feature/t021-react-query
**Commit**: (pending commit)

### What Changed
- Created `Frontend/src/lib/api/query-client.tsx` — SSR-safe QueryClient + QueryProvider (staleTime: 30s, gcTime: 5min, retry: 1)
- Created `Frontend/src/hooks/use-projects.ts` — `useProjectsList()`, `useProjectDetail(id)`, `useCustomersList()`
- Created `Frontend/src/components/shared/QueryBoundary.tsx` — standardized loading/error/empty consuming T020 ApiError
- Modified `Frontend/src/lib/api/index.ts` — added QueryProvider export
- Modified `Frontend/src/app/layout.tsx` — wrapped children with `<QueryProvider>` inside `<ThemeProvider>`
- Modified `Frontend/src/components/projects/ProjectsPage.tsx` — integrated `useProjectsList` + `QueryBoundary`, mock fallback preserved
- Modified `Frontend/src/components/projects/ProjectDetailPage.tsx` — integrated `useProjectDetail` + `QueryBoundary`, mock fallback preserved

### Dependencies Satisfied
- T020 (API client foundation) — consumes `apiGet<T>()`, `ApiError`

### Validation
- `bun run lint --no-cache --max-warnings 0` — ✅ 0 errors, 0 warnings
- `bun run build` — ✅ Next.js 16.2.6, Turbopack
- `bun run test:smoke` — Build ✅, Playwright infra fails on Windows (pre-existing)
- `graphify query "react query hooks + loading/error/empty standards"` — ✅ Graph updated (1039 nodes, 2770 edges, 64 communities)

### SSQ/Pattern Decisions
- SSR-safe: server creates fresh QueryClient per request, client uses singleton pattern via `getQueryClient()`
- Provider inside `<ThemeProvider>` in layout.tsx — matches existing provider hierarchy
- Hook naming: camelCase (`useProjectsList`) with queryKey convention `['resource']` and `['resource', id]`
- QueryBoundary delegates empty state to existing `<EmptyState>` from `PageHelpers.tsx`
- Mock fallback: `const data = apiData ?? mockData` — preserves existing UX when API is unavailable

### Backup Created
- Full session backup created at `backup files/T021_2026-05-29_102628/`
- Contains: CONTINUE_HERE.md (single-file restore point), AI_HANDOFF.md, RESTORE_POINT.md, AGENTS.md, T001-T021 summary, architecture, project tree, documentation index, git log
- Attach the entire folder to any new AI session to continue from this exact point

---

## T022 Memory Log

**Task**: T022 — FE-003 Feature Flag Toggles + Multi-Tool Validation & Documentation Update
**Story**: Sprint 0 — Foundations (frontend)
**Status**: Complete
**Date**: 2026-05-29
**Branch**: feature/t021-react-query (to create: feature/t022-validation-docs)

### What Changed
- Created `Frontend/src/lib/feature-flags.ts` — per-module mock/API toggle (Record<string, 'mock'|'api'>)
- Created `Frontend/src/pages/api/features.ts` — API endpoint exposing feature flag state
- Created `ROUTE_OF_DATA.md` — full architecture map (338 lines, 10 sections)
- Created `documentation/markdown/16-checkpoint-report.md` — full checkpoint validation
- Updated `AI_HANDOFF.md` — added T022 section, full renumbering, updated graphify data
- Updated `RESTORE_POINT.md` — v2 with T022 snapshot
- Updated `T001-T022-FINISHED-TASKS.md` — added T022
- Updated `PROJECT_ARCHITECTURE_AND_TREE.md`, `PROJECT_TREE.md`, `documentation/markdown/00-index.md`

### Validation (Multi-Tool Loop)
- `cd Frontend && bun run build` — ✅ Clean (Next.js 16.2.6)
- `cd Frontend && bun run lint --no-cache --max-warnings 0` — ✅ 0 errors, 0 warnings
- `cd backend && npm test` — ✅ 82/82 passing (10 suites)
- `cd backend && npm run build` — ✅ Clean
- `cd backend && npm run lint` — ✅ Clean
- `cd backend && npx prisma validate` — ✅ Valid
- graphify structural AST — ✅ 198 code files parsed
- SpeckIt skills — ✅ 9 agent skills mapped
- Route of Data — ✅ `ROUTE_OF_DATA.md` generated

### T022 Flag Usage Pattern
```typescript
import { getModuleSource } from '@/lib/feature-flags';
const source = getModuleSource('projects'); // returns 'mock' or 'api'
```

### Multi-Tool Test Loop Results
| Tool | Capability | Result |
|---|---|---|
| opencode | T001-T022 dependency verification | ✅ ALL PASS |
| SpeckIt | 9 agent skills, SDD pipeline | ✅ Infrastructure mapped |
| Graphify | Structural AST, knowledge graph | ✅ 198 files parsed |
| OpenSpec | — | ❌ Not available in session |
| open-interpreter | — | ❌ Not available in session |
| ROUTE_OF_DATA.md | Architecture map | ✅ Created |

### Next Task
- T023 (US1 Contract Tests)
