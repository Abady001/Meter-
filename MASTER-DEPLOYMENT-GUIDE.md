# Meter Verse — Master Deployment Guide

> Auto-generated 2026-06-13 | Meter Verse v2.0.0 Migration
> Architecture: 3-Plan, 15-Area | Deployment: Linux Core + Windows Symbiot Bridge

---

## 1. Project Identity

| Field | Value |
|---|---|
| Name | Meter Verse — Unified Utility Metering & Billing Platform |
| Stack | Backend: NestJS + PostgreSQL + Prisma ORM (multi-schema) |
| | Frontend: Next.js 16 + React 19 + TypeScript + Tailwind v4 + shadcn/ui |
| | Collection System: Flask 3.1.3 + Bootstrap 5 RTL + Chart.js 4.4.1 |
| Runtime | Bun (frontend) / Node 20+ (backend) / Python 3.x (collection system) |
| Author | Kirllos Hany <kirllos.hany@epower.com.eg> |
| GitHub | https://github.com/Kirllos360/Meter |

---

## 2. Architecture (3-Plan, 15-Area)

### Three Availability Plans

| Plan | Components | When Used |
|------|-----------|-----------|
| **Full** | Core DB + Features DB + 15 Area DBs + NestJS + Frontend + Symbiot Bridge | Normal production |
| **Safety** | Core DB + 15 Area DBs + Metering only (no billing) | Maintenance window, billing freeze |
| **Failover** | Core DB (read-only replica) + cached frontend | Disaster recovery, primary DB down |

### Database Architecture
```
┌────────────────────────────────────────────────────────────┐
│                    PostgreSQL Cluster                       │
├────────────────────────────────────────────────────────────┤
│  Core DB (public)    │  Features DB (billing)  │  15×Area  │
│  - users             │  - tariffs             │  - customers│
│  - roles/permissions │  - charges             │  - meters   │
│  - projects          │  - reports             │  - readings  │
│  - audit_log         │  - scheduled_jobs      │  - invoices  │
│  - system_config     │  - export_history      │  - payments  │
│  - notification_queue│                       │  - ledger    │
└────────────────────────────────────────────────────────────┘
```

### Symbiot Integration Bridge
```
Meters (10 TCP channels, 100 HTTP each)
       │
       ▼
┌──────────────────┐
│  Symbiot Bridge   │  ← Windows Service (WinService)
│  - 10 TCP sockets │  ← Load-balanced across 10 ports
│  - 100 HTTP/conn  │  ← Multiplexed per channel
│  - Failover logic │  ← Auto-detect dead channel → reroute
│  - Auto-reconnect │  ← Exponential backoff + health check
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│   Core API        │  ← Linux (NestJS)
│   POST /readings  │
└──────────────────┘
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

## 9. Deployment Strategy (Dual Platform)

### Linux Deployment (Core API + Frontend)
```bash
# Target: Ubuntu 22.04 LTS server
# Components: PostgreSQL 16, NestJS API, Next.js Frontend, Nginx

# 1. System dependencies
sudo apt update && sudo apt install -y postgresql-16 nginx certbot python3-certbot-nginx

# 2. Database setup
sudo -u postgres psql -c "CREATE USER meter_verse WITH PASSWORD '****';"
sudo -u postgres psql -c "CREATE DATABASE meter_verse_core;"
sudo -u postgres psql -c "CREATE DATABASE meter_verse_features;"
for i in 1..15; do sudo -u postgres psql -c "CREATE DATABASE meter_verse_area_$i;"; done

# 3. Backend deployment
cd /opt/meter-verse/backend
npm ci --production
npx prisma generate
npx prisma migrate deploy
pm2 start dist/main.js --name meter-verse-api

# 4. Frontend deployment
cd /opt/meter-verse/Frontend
bun install --production
bun run build
pm2 start npm --name meter-verse-web -- start

# 5. Nginx reverse proxy
# /etc/nginx/sites-available/meter-verse
# API → localhost:3001/api/v1
# Frontend → localhost:3000
```

### Windows Deployment (Symbiot Bridge)
```powershell
# Target: Windows Server 2022
# Component: Symbiot Bridge (10 TCP × 100 HTTP channels)

# 1. Create Windows Service
New-Service -Name "MeterVerseSymbiotBridge" `
  -BinaryPathName "C:\meter-verse\symbiot-bridge\bridge.exe --config config.json" `
  -StartupType Automatic

# 2. Configure 10 TCP channels
# config.json:
# {
#   "channels": [
#     {"protocol": "tcp", "port": 5010, "max_connections": 100},
#     ... × 10 (ports 5010-5019)
#   ],
#   "core_api": "https://core.meter-verse.internal/api/v1",
#   "failover_strategy": "auto_reroute",
#   "health_check_interval_s": 30,
#   "auto_reconnect": true
# }

# 3. Start service
Start-Service MeterVerseSymbiotBridge
Get-Service MeterVerseSymbiotBridge | Format-List Status, DisplayName
```

### Collection System (Legacy, Windows)
```powershell
# Kept running alongside for data migration (Phase 5)
cd D:\meter\Meter\reference\collection-system
waitress-serve --host=0.0.0.0 --port=5000 app:app

# During Phase 5 parallel run, both systems serve the same data
# with nightly reconciliation reports
```

---

## 10. Deployment Checklist (v2.0.0)

### Production Cutover
- [ ] All 373 backend tests passing
- [ ] Core DB + Features DB + 15 Area DB provisioned
- [ ] Symbiot bridge 10 TCP channels confirmed healthy
- [ ] SSL certificates installed (Nginx)
- [ ] Redis cache warmed
- [ ] Load test: 20 concurrent users passes
- [ ] Security audit passes
- [ ] Data migration from SBill PH + Estates + Collection Tracker → 15 Area DBs
- [ ] 30-day parallel run validated (both old + new systems)
- [ ] DNS switched to new frontend
- [ ] OneDrive backup confirmed
- [ ] Documentation freeze completed

### Post-Launch Monitoring (30 days)
- [ ] Daily reconciliation: old system totals vs new system totals per area
- [ ] Error rate < 0.1% on new routes
- [ ] Page load < 2s for all new pages
- [ ] Symbiot bridge uptime > 99.9%
- [ ] Zero data loss confirmed across all 15 area DBs

---

## 11. Key Files Reference

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
