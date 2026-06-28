# Meter Verse — Master Deployment Guide

> Auto-generated 2026-05-28 | Consensus: 3/3 AI agents at 100%
> Next: T021 (FE-002 React Query) | T022 (FE-003 Feature Flags)

---

## 1. Project Identity

| Field | Value |
|---|---|
| Name | Meter Verse — Utility Metering & Billing Platform |
| Stack | Backend: NestJS + PostgreSQL + Prisma ORM |
| | Frontend: Next.js 16 + React 19 + TypeScript + Tailwind v4 + shadcn/ui |
| Runtime | Bun (frontend) / Node 20+ (backend) |
| Author | Kirllos Hany <kirllos.hany@epower.com.eg> |
| GitHub | Kirllos360/Meter- (fork) → Abady001/Meter- (upstream) |

---

## 2. Architecture Summary

```
Frontend/src/lib/
├── api/
│   ├── client.ts     # Centralized fetch wrapper (GET/POST/PUT/PATCH/DELETE)
│   ├── errors.ts     # ApiError class matching ErrorEnvelope contract
│   ├── auth.ts       # Token storage + refreshToken() hook
│   └── index.ts      # Barrel exports
├── mock-auth.ts      # Zustand store — uses setToken/clearToken from api/
├── mock-data.ts      # Mock data (all entities)
├── types.ts          # TypeScript interfaces + enums
├── navigation.ts     # Role-based nav config
├── router-store.ts   # Zustand page router
└── utils.ts          # cn() helper

backend/src/
├── auth/             # JWT + RBAC (7 roles)
├── audit/            # Append-only audit log
├── common/
│   ├── config/       # ConfigModule + DatabaseModule
│   ├── database/     # PrismaService
│   └── http/         # ErrorEnvelope, CorrelationMiddleware, Idempotency, AllExceptionsFilter
├── common/openapi/   # Swagger/OpenAPI setup
├── app.module.ts
└── main.ts           # /api/v1 prefix, global pipes

backend/prisma/
├── schema.prisma     # All 20+ models, 24+ enums
└── migrations/       # 7 migrations applied
```

---

## 3. Completed Tasks (T001-T020)

| ID | Description | Status | Key Files |
|---|---|---|---|
| T001 | NestJS backend scaffold | ✅ Done | `backend/src/main.ts`, `app.module.ts` |
| T002 | Config + PostgreSQL connection | ✅ Done | `backend/src/common/config/`, `.env` |
| T003 | Lint/format/test tooling | ✅ Done | `.eslintrc.cjs`, `jest.config.ts` |
| T004 | Prisma ORM init | ✅ Done | `backend/prisma/schema.prisma` |
| T005 | PostgreSQL docker-compose | ✅ Done | `backend/docker-compose.yml` |
| T006 | ErrorEnvelope + global filter | ✅ Done | `backend/src/common/http/error-envelope.ts` |
| T007 | Correlation-ID middleware | ✅ Done | `backend/src/common/http/correlation.middleware.ts` |
| T008 | Idempotency-Key interceptor | ✅ Done | `backend/src/common/http/idempotency.interceptor.ts` |
| T009 | JWT Auth + RBAC (7 roles) | ✅ Done | `backend/src/auth/` |
| T010 | Append-only audit log | ✅ Done | `backend/src/audit/` |
| T011 | API versioning /api/v1 + OpenAPI | ✅ Done | `backend/src/main.ts`, `openapi.setup.ts` |
| T012 | Contract test harness | ✅ Done | `backend/test/contract/setup.ts` |
| T013 | Core org migration (Project, LocationNode, Customer) | ✅ Done | `backend/prisma/migrations/*_core_org/` |
| T014 | Meter/SIM migration | ✅ Done | `backend/prisma/migrations/*_Meter_Verse_sim/` |
| T015 | Reading/Tariff migration | ✅ Done | `backend/prisma/migrations/*_readings_tariff/` |
| T016 | Invoice migration | ✅ Done | `backend/prisma/migrations/*_invoices/` |
| T017 | Payment/Ledger migration | ✅ Done | `backend/prisma/migrations/*_payments_ledger/` |
| T018 | AuditLog + ReportJob migration | ✅ Done | `backend/prisma/migrations/*_audit_reports/` |
| T019 | Derived views (3 views) | ✅ Done | `backend/prisma/migrations/*_views/` |
| T020 | FE-001 API client foundation | ✅ Done | `Frontend/src/lib/api/` |

---

## 4. Validation Commands

```bash
# Backend full validation
cd backend && npm test && npm run build && npx eslint "src/**/*.ts"

# Prisma checks
cd backend && npx prisma validate && npx prisma migrate status && npx prisma generate

# Frontend full validation
cd Frontend && bun run lint --no-cache --max-warnings 0 && bun run build

# Graphify
cd Frontend && graphify query "<objective>"
cd Frontend && graphify update .

# Smoke test
cd Frontend && bun run test:smoke
```

---

## 5. Test Results (Last Run: 2026-05-28)

| Suite | Result |
|---|---|
| Backend tests (9 suites) | 77/77 ✅ PASS |
| Backend build (tsc) | ✅ Clean |
| Backend lint (src/) | ✅ 0 errors |
| Prisma validate | ✅ Valid |
| Prisma migrate status | ✅ 7 migrations, up to date |
| Frontend lint | ✅ 0 errors, 0 warnings |
| Frontend build | ✅ Compiled successfully |
| Build copy script | ✅ Fixed (cross-platform node script) |

---

## 6. PR Status on Abady001/Meter-

### Merged (5)
| PR | Title | Branch |
|---|---|---|
| #1 | T002: Config + PostgreSQL | `001-metering-billing-platform` |
| #2 | T003: Backend tooling | `feature/t003-backend-tooling` |
| #3 | T005: PostgreSQL Docker | `feature/t005-postgres-docker` |
| #6 | T009: JWT Auth + RBAC | `feature/t009-auth-rbac` |
| #7 | T011: API versioning | `feature/t011-api-versioning` |

### Open — MERGEABLE (10, all 0 behind main)
| Order | PR | Title | Branch |
|---|---|---|---|
| 1st | #12 | T013: Core org migration | `feature/t013-core-org-migration` |
| 2nd | #13 | T008: Idempotency-Key | `feature/t008-idempotency-v2` |
| 3rd | #15 | T014: Meter/SIM migration | `feature/t014-meter-sim-migration` |
| 4th | #16 | T015: Reading/Tariff migration | `feature/t015-readings-tariff-migration` |
| 5th | #17 | T016: Invoice migration | `feature/t016-invoices-migration` |
| 6th | #18 | T017: Payment/Ledger migration | `feature/t017-payments-ledger-migration` |
| 7th | #19 | T012: Contract test harness | `feature/t012-contract-harness-fresh` |
| 8th | #21 | T018+T019: AuditLog + Views | `feature/t018-audit-reports` |
| 9th | #22 | T020: FE-001 API client | `feature/t020-api-client` |
| any | #20 | MCP: Notion + Odoo | `feature/mcp-added` |

### Merge Order (dependency-based)
```
#12 (T013) → #13 (T008) → #15 (T014) → #16 (T015) → #17 (T016)
→ #18 (T017) → #19 (T012) → #21 (T018+T019) → #22 (T020)
#20 (MCP) can merge anytime — no code dependencies
```

After merge, run: `cd backend && npx prisma migrate deploy && npx prisma generate`

---

## 7. Environment Configuration

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

# Frontend .env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

---

## 8. Next Tasks (Sprint 0 continued)

### T021 — FE-002 React Query Integration Pattern
- **Depends on**: T020 (API client foundation)
- **Files**: `Frontend/src/lib/api/query-client.tsx`, `Frontend/src/hooks/use-*`
- **AC**: Reusable query/mutation hooks, loading/error/empty UI, ≥1 list + 1 detail page
- **Validation**: `graphify query "react query hooks" && bun run lint && bun run build`

### T022 — FE-003 Feature Flag Toggles
- **Depends on**: T020 (API client foundation)
- **Files**: `Frontend/src/lib/feature-flags.ts`
- **AC**: Toggle mock ↔ API mode per module, project module switches without regression
- **Validation**: `graphify query "feature flags" && bun run lint && bun run build`

---

## 9. Deployment Checklist

- [ ] Abady merges PRs in order: #12 → #13 → #15 → #16 → #17 → #18 → #19 → #21 → #22
- [ ] Run `cd backend && npx prisma migrate deploy` after merge
- [ ] Run `cd backend && npm test` (77/77)
- [ ] Run `cd Frontend && bun run build`
- [ ] Sync Kirllos360 fork main: `git branch -f main abady/main && git push origin main --force`
- [ ] Update `documentation/markdown/09-git-commit-log.md`
- [ ] Update `graphify update .`
- [ ] Save validation PDF to Desktop
- [ ] Sync OneDrive

---

## 10. Key Files Reference

| Purpose | Path |
|---|---|
| Task definitions | `specs/001-metering-billing-platform/tasks.md` |
| Frontend sprint backlog | `Frontend/FRONTEND_SPRINT_BACKLOG.md` |
| Spec document | `specs/001-metering-billing-platform/spec.md` |
| Implementation plan | `specs/001-metering-billing-platform/plan.md` |
| Data model | `specs/001-metering-billing-platform/data-model.md` |
| API contract | `specs/001-metering-billing-platform/contracts/meter-verse-api.yaml` |
| Documentation index | `documentation/markdown/00-index.md` |
| Git commit log | `documentation/markdown/09-git-commit-log.md` |
| Validation reports | `documentation/markdown/13-T*-validation-report.md` |
| Main memory | `project-main-memory.md` |
| Graphify | `Frontend/graphify-out/` |
