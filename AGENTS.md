# Meter Pulse — Utility Metering & Billing Platform

## Full Session Summary (2026-05-26)

### Completed Tasks (7 of ~91 — 7.7%)
- **T001**: NestJS backend scaffold — `backend/` structure, main.ts, app.module.ts, package.json, tsconfig.json
- **T002**: Config + PostgreSQL connection — `AppConfigModule`, `DatabaseModule`, `.env`, Docker container `meter-pulse-db`
- **T003**: Backend tooling — ESLint, Prettier, Jest configured; eslint fix: added `jest.config.ts` to ignorePatterns
- **T004**: Prisma ORM init — `schema.prisma` (multiSchema, sim_system), `PrismaService`, `DATABASE_URL`; validated 5/5
- **T005**: Docker PostgreSQL — `docker-compose.yml` (env vars, healthcheck, volume, restart), `README.md` (start/stop/reset/connection docs)
- **T006**: Error envelope + global filter — `ErrorEnvelope` interface, `AllExceptionsFilter`, 10 unit tests; validated 3/3
- **T007**: Correlation-ID middleware — `CorrelationMiddleware` class, registered globally, `req.correlationId` set on every request; 7 unit tests; validated 3/3

### Implementation Workflow
1. User provides task via Speckit-style prompt
2. Create feature branch: `feature/tXXX-task-name`
3. Read SpecKit files: spec.md, plan.md, tasks.md, data-model.md, contracts/, research.md, quickstart.md
4. Run `check-prerequisites.sh` (branch naming fails — ignore, but verify all files exist manually)
5. Implement code in `backend/` only
6. Validate: `npm test`, `tsc --noEmit`, `eslint`, `prisma validate`, `prisma generate`, `docker compose` as applicable
7. Commit: one task, one branch, one commit, one PR
8. Push to `Kirllos360/Meter-` (ask user first)
9. Create PR via GitHub API with token
10. Update AGENTS.md memory log
11. Mark task `[X]` in tasks.md
12. Create validation reports in 5 formats (markdown, sql, text, csv, pdf)
13. Save prompt to `prompt-history_TXXX.md`

### Documentation Structure
- 17 markdown, 7 sql, 19 text, 16 csv, 21 pdf files
- Index: `documentation/markdown/00-index.md`
- Validation reports: `documentation/markdown/13-T001-validation-report.md` through `13-T006-validation-report.md`

### Git Info
- Remote: `https://github.com/Kirllos360/Meter-.git` (fork of Abady001/Meter-)
- Current token: `ghp_3DuS44n...` (user provided 2026-05-26)
- PRs: #1 (T006) open at `https://github.com/Kirllos360/Meter-/pull/1`
- Port: backend 3001, PostgreSQL 5432
- Commit style: `TXXX: short description` or `build(backend): message for TXXX`
- Author: Kirllos Hany <kirllos.hany@epower.com.eg>

### Key Files
- `backend/.env` — gitignored, has DATABASE_URL
- `backend/.env.example` — committed template
- `backend/docker-compose.yml` — PostgreSQL service
- `backend/prisma/schema.prisma` — generator + datasource, multiSchema, sim_system
- `backend/src/main.ts` — port 3001, global exception filter registered
- `backend/src/common/http/error-envelope.ts` — ErrorEnvelope + helpers
- `backend/src/common/http/all-exceptions.filter.ts` — global @Catch filter
- `backend/test/error-envelope.spec.ts` — 10 unit tests
- `specs/001-metering-billing-platform/tasks.md` — 91 tasks, T001-T006 marked [X]

### Next Unfinished Task
- **T007**: ✅ Add correlation-ID middleware in `backend/src/common/http/correlation.middleware.ts`
- **T008**: Add Idempotency-Key interceptor in `backend/src/common/http/idempotency.interceptor.ts`

### Stack
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
- Key files: `spec.md` (requirements), `plan.md` (impl plan), `data-model.md`, `contracts/meter-pulse-api.yaml`, `tasks.md`.
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

## T006 Memory Log (2026-05-26)

- **Task**: T006 — Implement standard error envelope + global exception filter
- **Status**: done
- **Changed**: Created `error-envelope.ts`, `all-exceptions.filter.ts`, `error-envelope.spec.ts`; updated `main.ts`, `tsconfig.json`, `.eslintrc.cjs`
- **Validation**: npm test -- error-envelope ✅ (10/10), tsc --noEmit ✅, eslint ✅
- **Branch**: `feature/t006-error-envelope`
- **Next**: T008
- **Token note**: Push succeeded via credential manager, but PR creation via curl API failed (token expired for non-git calls). Used `git push` as workaround.

## T007 Memory Log (2026-05-26)

- **Task**: T007 — Add correlation-ID middleware
- **Status**: done
- **Changed**: Created `correlation.middleware.ts`, `correlation.middleware.spec.ts`, `src/types/express.d.ts`; updated `app.module.ts` (NestModule configure), `all-exceptions.filter.ts` (prefer req.correlationId)
- **Validation**: npm test ✅ (17/17), tsc --noEmit ✅, eslint ✅
- **Branch**: `feature/t007-correlation-middleware`
- **Next**: T008

## Token Expiry Rule

- **Trigger**: At start of each session, or when a `git push` or API call fails with auth error, or when `T0XX` task count reaches ~80% of total (~72/91)
- **Action**: Prompt user: "GitHub token may be expiring. Please provide a fresh token (repo scope) so git push + PR creation continue working."
- **Fallback**: If push fails mid-task, stop and ask user for token before retrying
- **Storage**: Token stored via `git credential-manager` — no raw token saved in files
- **Never**: Hard-code tokens in code, docs, .env, or commit history

## On-Message Git Check
Every time the user sends a message, run `git status --short` to detect any changes since last session. If changes exist, log them to the audit log and commit log. Keep local files in sync.

## Important quirks
- `.env` files are gitignored. Check `Frontend/.env` for local DB URL and secrets.
- `backend/` is referenced in plan docs but does not exist in this repo yet.
- Constitution (`specify/memory/constitution.md`) is still a template placeholder — must be ratified before implementation closeout.
- Git: no conventional commits, no CI workflows, no branch conventions documented.
- Never commit `*.db`, `.next/`, `node_modules/`, `graphify-out/cache/`, or workspace archives.
