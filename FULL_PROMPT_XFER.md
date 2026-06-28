# METER VERSE — FULL CONTEXT TRANSFER
> Paste this entire file as the first message in a new AI chat to continue seamlessly.
> Generated: 2026-06-13 | Migration v2.0.0 Complete | Next: Build 5 Priority Features

---

## 1. PROJECT IDENTITY

| Field | Value |
|---|---|
| **Name** | Meter Verse — Unified Utility Metering & Billing Platform |
| **GitHub** | `https://github.com/Kirllos360/Meter` (new unified repo, was Meter-) |
| **Git Author** | `Kirllos Hany <kirllos.hany@epower.com.eg>` |
| **Git Remote** | `origin https://github.com/Kirllos360/Meter.git` |
| **Current Branch** | `feature/t055-payments-contract` |
| **Last Commit** | `2cd89a3 T086: Migrate Meter Pulse to Meter Verse v2.0.0` |
| **Architecture** | 3 Plans (Full / Safety / Failover) × 15 Areas |
| **Runtime (Frontend)** | Bun (NOT npm/yarn) |
| **Runtime (Backend)** | Node 20+ |
| **Runtime (Collection)** | Python 3.x |
| **Tests** | 373/373 passing (47 suites) — original Meter Pulse backend |
| **Reference Systems** | 7 systems in `reference/` |
| **Workspace Root** | `D:\meter\Meter\` (was `D:\meter\Meter-\`) |
| **Package Name** | `meter-verse-workspace` |

### Stack
- **Frontend**: Next.js 16 + React 19 + TypeScript + Tailwind v4 + shadcn/ui
- **Backend**: NestJS + PostgreSQL + Prisma ORM (multi-schema: Core + Features + 15 Areas)
- **Collection System** (reference): Flask 3.1.3 + PostgreSQL (8 schemas, 36 tables)
- **Symbiot Bridge** (to build): 10 TCP × 100 HTTP channels, Windows Service
- **Auth**: next-auth v4 (frontend) | JWT + Passport + 7 roles (backend) | Flask-Login (collection)

---

## 2. REPOSITORY STRUCTURE

```
D:\meter\Meter\          <-- THE ACTUAL GIT REPOSITORY ROOT
├── specs/
│   ├── 001-metering-billing-platform/  # T001-T085 (original 85 tasks — DO NOT MODIFY)
│   ├── 002-meter-verse-core/           # T086-T092 (Core DB, Auth, 16 profiles)
│   ├── 003-symbiot-integration/        # Symbiot bridge (10 TCP × 100 HTTP)
│   └── 004-migration-plans/            # Data migration + parallel run
├── backend/                             # NestJS backend (Prisma + PostgreSQL)
│   ├── prisma/schema.prisma + migrations/
│   ├── src/ (auth, audit, common, billing, customers, meters, payments, projects, readings, reports, sim-cards)
│   ├── test/ (373 tests, 47 suites)
│   └── docker-compose.yml
├── Frontend/                            # Next.js frontend (Bun runtime)
│   ├── src/
│   │   ├── app/ (layout, page, globals)
│   │   ├── components/ (15 module dirs)
│   │   ├── hooks/ (use-projects, etc.)
│   │   └── lib/ (api, mock-data, types, feature-flags)
│   └── graphify-out/ (frontend knowledge graph)
├── reference/                           # ALL reference systems (copied, NOT in git)
│   ├── collection-system/               # Flask billing system — 5 priority features to build from
│   ├── sbill/                           # SBill Palm Hills + Estates billing (2.1 GB)
│   ├── symbiot/                         # Symbiot SEP integration (1.7 GB)
│   ├── ims/                             # IMS system
│   ├── meter-department/                # Meter department files (4.1 GB)
│   ├── energy-360/                      # Energy 360 mobile app
│   └── all-last-update/                 # Latest system updates (1.5 GB)
├── tools/playwright-mcp/               # Playwright MCP (configured in opencode.json)
├── docs/architecture/                  # Architecture diagrams + specs
├── docs/migration/                     # Migration guides
├── scripts/                            # Utility scripts
├── ci-cd/                              # CI/CD pipeline configs
├── documentation/                      # Multi-format docs (markdown, sql, text, excel, pdf)
├── AGENTS.md                           # Agent instructions + memory logs (rewritten for v2.0.0)
├── AI_HANDOFF.md                       # Complete AI handoff (rewritten)
├── MASTER-DEPLOYMENT-GUIDE.md          # Full deployment guide (rewritten — dual platform)
├── PROJECT_TREE.md                     # Project tree (rewritten)
├── PROJECT_ARCHITECTURE_AND_TREE.md    # Full architecture + tree
├── ROUTE_OF_DATA.md                    # Architecture + data flow map
├── RESTORE_POINT.md                    # Restore point (v3)
├── T001-T022-FINISHED-TASKS.md         # Completed tasks log
├── FULL_PROMPT_XFER.md                 # THIS FILE — paste into new chat
└── metering_system_prd_brainstorm.md   # Original PRD
```

---

## 3. ARCHITECTURE (3-PLAN, 15-AREA)

### Three Availability Plans
| Plan | Components | When Used |
|------|-----------|-----------|
| **Full** | Core DB + Features DB + 15 Area DBs + NestJS + Frontend + Symbiot Bridge | Normal production |
| **Safety** | Core DB + 15 Area DBs + Metering only (no billing) | Maintenance window, billing freeze |
| **Failover** | Core DB (read-only replica) + cached frontend | Disaster recovery, primary DB down |

### Database Architecture
```
PostgreSQL Cluster
├── Core DB (public): users, roles/permissions, projects, audit_log, system_config, notification_queue
├── Features DB (billing): tariffs, charges, reports, scheduled_jobs, export_history
└── 15×Area DBs: customers, meters, readings, invoices, payments, ledger (october, new_cairo, sodic_ednc, sodic_estates, sodic_vye, badya_city, north_coast, uvines_mall, +7 future)
```

### Symbiot Integration Bridge
```
Meters (10 TCP channels, 100 HTTP each) → Symbiot Bridge (Windows WinService)
    10 TCP sockets, 100 HTTP/conn, failover logic, auto-reconnect
    → Core API (Linux NestJS) POST /readings
```

### Architecture Constraints (NON-NEGOTIABLE)
1. **Never rebuild the frontend shell, routes, or design system** — all work is incremental
2. **Frontend uses mock data** (`src/lib/mock-*.ts`). Migration to live APIs sprint-by-sprint behind feature flags
3. **Backend modules are empty** (`billing/, customers/, meters/, payments/, projects/, readings/, reports/, sim-cards/`) — only `.gitkeep`
4. **Prisma schema** uses multi-schema (`sim_system`), targets PostgreSQL, SQLite for dev
5. **Next config**: `output: "standalone"`, `ignoreBuildErrors: true`, `reactStrictMode: false`
6. **All server communication** through T020's `apiGet<T>()`, `apiPost<T>()` — no direct `fetch()`
7. **Graphify-first** — every frontend ticket starts with `graphify query "<objective>"`
8. **Mock fallback preserved** — API failure doesn't break existing UX

---

## 4. COMPLETE MIGRATION HISTORY (What We Did)

### Phase 1: File Migration
- Created `D:\meter\Meter\` root directory
- Copied all source files from `D:\meter\Meter-\` (preserving .git, .husky)
- Copied all 7 reference systems to `reference/`:
  - `collection-system/` (165.7 MB) — Flask billing system
  - `sbill/` (2.1 GB) — SBill Palm Hills + Estates
  - `symbiot/` (1.7 GB) — Symbiot SEP integration  
  - `ims/` (1.8 MB) — IMS system
  - `meter-department/` (4.1 GB) — Meter department files
  - `energy-360/` (6.1 MB) — Energy 360 mobile app
  - `all-last-update/` (1.5 GB) — Latest system updates
- Created 7 new directories: `specs/002-meter-verse-core/`, `specs/003-symbiot-integration/`, `specs/004-migration-plans/`, `docs/architecture/`, `docs/migration/`, `scripts/`, `ci-cd/`
- Updated `package.json` name to `meter-verse-workspace`
- Copied Playwright MCP to `tools/playwright-mcp/`

### Phase 2: Auto-Rename (Meter Pulse → Meter Verse)
- 462 doc/config files updated: `Meter Pulse`→`Meter Verse`, `meter-pulse`→`meter-verse`, `Meter_`→`Meter_Verse_`
- 9 .ts/.tsx/.prisma files updated (safe rename only — skipped code-level `Meter_`→`Meter_Verse_` to avoid breaking compilation)

### Phase 2b: Manual Document Rewrites
Files rewritten with new architecture, paths, and structure:
1. **`AGENTS.md`** — 3-plan/15-area architecture, 7 reference systems, T086+ phases, GitHub URL
2. **`AI_HANDOFF.md`** — Full project identity, repo structure, T086-T120 task table, updated file paths
3. **`MASTER-DEPLOYMENT-GUIDE.md`** — Linux deployment (Ubuntu 22.04 + PostgreSQL 16 + NestJS + Next.js + Nginx + Certbot), Windows Symbiot Bridge service (10 TCP channels ports 5010-5019), v2.0.0 checklist
4. **`PROJECT_TREE.md`** — New tree with `reference/`, `tools/playwright-mcp/`, `docs/architecture/`, `docs/migration/`, `specs/002-003-004`, `scripts/`, `ci-cd/`
5. **`specs/001-metering-billing-platform/tasks.md`** — Appended T086-T120 (6 phases, 35 tasks)

### Phase 3: Playwright MCP Setup
- `npm install` in `tools/playwright-mcp/` — success, 0 vulnerabilities
- Installed Chromium browser (`npx playwright install chromium`)
- Configured in `.opencode/opencode.json`:
  ```json
  "playwright-mcp": {
    "type": "local",
    "command": ["node", "D:\\meter\\Meter\\tools\\playwright-mcp\\cli.js"],
    "enabled": true
  }
  ```

### Phase 5: Git Commit & Push
- Created GitHub repo `Kirllos360/Meter` (public) via `gh repo create`
- Updated remote origin to `https://github.com/Kirllos360/Meter.git`
- Committed: `2cd89a3 T086: Migrate Meter Pulse to Meter Verse v2.0.0`
- Pushed to `feature/t055-payments-contract` branch
- 177 files changed, 6596 insertions(+), 857 deletions(-)

### Key Decisions Made
- **Reference systems excluded from git** via `.gitignore` (sbill 2.1 GB, meter-department 4.1 GB, all-last-update 1.5 GB)
- **Original Meter- repo kept as archive** at `D:\meter\Meter-\` — do not delete until v2.0.0 stable  
- **Old remote `abady` pointing to `Abady001/Meter-`** — still exists
- **T001-T085 tasks preserved** in `specs/001-metering-billing-platform/tasks.md` — v2.0.0 tasks appended as T086-T120

---

## 5. ALL TASKS (T001-T150)

### Phase 1: Setup (T001-T005) ✅ ALL DONE
| ID | Description | Status |
|---|---|---|
| T001 | NestJS backend scaffold | ✅ |
| T002 | Config + PostgreSQL connection | ✅ |
| T003 | Lint/format/test tooling | ✅ |
| T004 | Prisma ORM init | ✅ |
| T005 | PostgreSQL docker-compose | ✅ |

### Phase 2: Foundational (T006-T022) ✅ ALL DONE
| ID | Description | Status |
|---|---|---|
| T006 | ErrorEnvelope + global filter | ✅ |
| T007 | Correlation-ID middleware | ✅ |
| T008 | Idempotency-Key interceptor | ✅ |
| T009 | JWT Auth + RBAC (7 roles) | ✅ |
| T010 | Append-only audit log | ✅ |
| T011 | API versioning /api/v1 + OpenAPI | ✅ |
| T012 | Contract test harness | ✅ |
| T013-T018 | DB migrations (Core, Meter/SIM, Readings/Tariff, Invoices, Payments/Ledger, AuditLog) | ✅ |
| T019 | Derived views (3 views) | ✅ |
| T020 | FE-001 API client foundation | ✅ |
| T021 | FE-002 React Query integration | ✅ |
| T022 | FE-003 Feature flag toggles | ✅ |

### Phase 3-6: User Stories (T023-T085) ✅ DONE
| ID Range | Description | Status |
|---|---|---|
| T023-T026 | US1 Contract Tests (assign, terminate, simEligibility, createReading) | ✅ |
| T047-T048 | Readings module + Review queue | ✅ |
| T053-T054 | Invoice stubs (generate, issue, adjustments) | ✅ |
| T061-T065 | Water diff policy, tariff, billing modules | ✅ |

### Phase 7: Meter Verse v2.0.0 (T086-T120) 🚀 NEXT

#### Phase 0: Foundation (T086-T090) — START HERE
| ID | Description | Depends On |
|---|---|---|
| **T086** | **Create Core DB schema (15 tables: User, Role, Permission, Area, Project, etc.)** | None |
| **T087** | **Create Features DB schema (10 tables: Tariff, Charge, Report, Job, etc.)** | T086 |
| **T088** | **Create Area DB template (45 tables)** | T087 |
| **T089** | **Implement 16-profile RBAC with area middleware** | T086 |
| **T090** | **i18n engine: 676 AR/EN keys** | T086 |

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

#### Reserved (T121-T150) — for bug fixes + enhancements post-launch

---

## 6. FIVE PRIORITY FEATURES — Build in Collection System (Flask)

These are the 5 features to build **first** in the Collection System (`D:\meter\Meter\reference\collection-system\`). Full specs in `reference/collection-system/docs/specs/PLAN_EXECUTION_STRATEGY.md`.

### Priority 1: Balances & Aging Page
- 7 Stat Cards: Total Invoiced, Total Paid, Outstanding, 0-30/31-60/61-90/90+ Days
- Stacked BarChart per customer (4 aging buckets)
- Aging Table: 12 columns with color-coded outstanding
- Search by customer name, code, project
- **Files**: `templates/balances_aging.html`, `routes_balances.py`

### Priority 2: Meter Status Lifecycle (2→7 Statuses)
- Expand from `active`/`inactive` to: Available, Assigned, Active, Offline, Faulty, Replaced, Terminated, Retired
- State machine with transition validation
- Status change log (`meter_status_log` table)
- Dashboard doughnut chart update
- **Files**: `app/meter_lifecycle.py`, `routes_meters.py`, `templates/meter_detail.html`, migration script

### Priority 3: Water Balance Analysis
- Main meter vs child meters consumption comparison
- 5 Stat Cards: Main Consumption, Child Total, Difference, Difference %, Threshold
- Red alert banner when threshold exceeded
- LineChart with dual Y-axis (m³ + %) + reference threshold line
- **Files**: `app/water_balance_engine.py`, `routes_water_balance.py`, `templates/water_balance.html`

### Priority 4: Consumption Analysis Page
- 3 Period Toggles: Daily, Monthly, Custom Range
- 3 Charts: Electricity LineChart (amber), Water LineChart (blue), Consumption by Project (stacked bar)
- 3 Mini Tables (pageSize=5): High Consumption, Zero Consumption, Missing Readings
- Anomaly detection engine (negative/zero/spike)
- **Files**: `routes_consumption.py`, `templates/consumption_analysis.html`

### Priority 5: SIM Card Lifecycle Management
- Full CRUD with 10 columns (ICCID, MSISDN, IP, Provider, Assigned Meter, Eligibility, Status, etc.)
- 7 SIM Statuses: Available, Assigned, Active, Suspended, Old, Reusable, Retired
- Eligibility badges: ✅ Eligible, ⏳ Cooldown, ❌ Ineligible
- Assignment history tracking
- **Files**: `routes_sim_cards.py`, `templates/sim_cards.html`, `templates/sim_card_detail.html`

### Build Order (Dependency-Aware)
```
Phase 1: Foundation (Day 1-3)
├── Meter Status Lifecycle (2→7)
└── Water Balance (needs parent-child meter from Phase 1)
Phase 2: Analysis (Day 4-6)
├── Balances & Aging (uses existing models)
└── Consumption Analysis (uses existing MeterReading)
Phase 3: Operations (Day 7-9)
└── SIM Card Lifecycle
Phase 4: Polish & Testing (Day 10-12)
```

---

## 7. THREE-SYSTEM COMPARISON SUMMARY

Found at `reference/collection-system/docs/specs/THREE_SYSTEM_COMPARISON.md` (1286 lines).

| Dimension | SBill Palm Hills | SBill Estates | Meter Verse (Flask) | Our Collection System |
|-----------|-----------------|---------------|-------------------|---------------------|
| Backend | Flask | Java Spring Boot | NestJS/Next.js | Flask 3.1.3 |
| UI | Jinja2+Bootstrap | JSP | React+shadcn/ui | Jinja2+Bootstrap 5 RTL |
| Auth | Flask-Login+RBAC | Spring Security+RBAC | JWT+7 roles | Flask-Login+6 roles+27 perms |
| DB | PostgreSQL | PostgreSQL | PostgreSQL 16 (Docker) | PostgreSQL 16 |
| Meters | Basic CRUD | Basic CRUD | 11 actions | Basic CRUD |
| Tariffs | 5 charge modes | Basic | 5 charge modes | 5 charge modes |
| SIM | Full lifecycle | None | Full lifecycle plus | Basic CRUD |
| Reports | 10+ | 5+ | 32 (planned) | 14 working reports |
| Bilingual | ❌ | ❌ | ✅ AR/EN | ✅ Full AR/EN RTL |

Our Collection System has **~30+ unique features** the others lack (tariff 5 modes, 5 meter types, Symbiot 10-channel, bilingual, admin tools, chat, approvals, solar wallet).

### Top 5 Gaps to Fix (FROM ABOVE)
1. Balances & Aging Page ❌
2. Meter Status Lifecycle (2→7) ❌
3. Water Balance Analysis ❌
4. Consumption Analysis Page ❌
5. SIM Card Full Lifecycle ⚠️

---

## 8. STACK COMMANDS

### Frontend (run from `Frontend/`)
```bash
bun run dev              # Dev server on :3000
bun run build            # Next.js build (standalone output)
bun run lint             # ESLint (use: --no-cache --max-warnings 0)
bun run test:smoke       # Build + Playwright smoke traversal
bun run db:push          # Prisma push
bun run db:migrate       # Prisma migrate dev
bun run db:generate      # Prisma generate
graphify query "<obj>"   # Knowledge graph query (ALWAYS first for frontend)
graphify update .        # Refresh graph after code changes
```

### Backend (run from `backend/`)
```bash
npm run start:dev        # Dev server
npm run build            # TypeScript compile
npm test                 # Jest tests (373 passing, 47 suites)
npm run lint             # ESLint
npx prisma validate      # Prisma schema validation
npx prisma migrate status # Migration status
npx prisma generate      # Generate Prisma client
npx dependency-cruiser src/ # Dependency graph validation
npx prettier --check "src/**/*.ts"  # Format check
```

### Collection System (run from `reference/collection-system/`)
```bash
pip install -r requirements.txt
flask run                 # Dev server on :5000
flask db upgrade          # Alembic migrations
python tools/backup.py --full  # Database backup
```

---

## 9. ENVIRONMENT CONFIGURATION

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

## 10. KNOWN ISSUES & BLOCKERS

| Issue | Details |
|---|---|
| WSL bash relay | `execvpe(/bin/bash) failed` — SpeckKit bash scripts can't run on Windows |
| `bunx` spawn on Windows | `smoke-all-pages.mjs` uses `bunx` which fails on Windows |
| Constitution | `.specify/memory/constitution.md` template placeholders — must be ratified |
| `.opencode` at root | Two `.opencode/` dirs exist (`Meter\` root + `D:\meter\.opencode\`) — consolidate |
| Original Meter- repo | `D:\meter\Meter-\` still exists with old .git — archive after migration verified |
| Reference sizes | Large reference dirs (meter-department 4.1 GB, sbill 2.1 GB) — excluded from git via .gitignore |
| Git LFS | Not set up — large reference files should use Git LFS or `.gitignore` |
| Playwright smoke tests | Fail on Windows (pre-existing — Playwright infra issue) |

---

## 11. KEY FILE PATHS (Quick Reference)

| What | Path |
|---|---|
| All Tasks (original T001-T085) | `specs/001-metering-billing-platform/tasks.md` |
| All Tasks (v2.0.0 T086-T120) | Appended to same file at `specs/001-metering-billing-platform/tasks.md` (lines ~1000+) |
| Five Feature Plans | `reference/collection-system/docs/specs/PLAN_EXECUTION_STRATEGY.md` |
| Three-System Comparison | `reference/collection-system/docs/specs/THREE_SYSTEM_COMPARISON.md` |
| Gap Analysis | `reference/collection-system/docs/specs/COLLECTION_SYSTEM_GAP_ANALYSIS.md` |
| Migration Execution Plan | `specs/001-metering-billing-platform/PLAN_EXECUTION_STRATEGY.md` |
| Agent Instructions | `AGENTS.md` |
| AI Handoff | `AI_HANDOFF.md` |
| Deployment Guide | `MASTER-DEPLOYMENT-GUIDE.md` |
| Architecture Tree | `PROJECT_ARCHITECTURE_AND_TREE.md` |
| Project Tree | `PROJECT_TREE.md` |
| Data Flow Map | `ROUTE_OF_DATA.md` |
| API Contract | `specs/001-metering-billing-platform/contracts/meter-verse-api.yaml` |
| Prisma Schema | `backend/prisma/schema.prisma` |
| Feature Flags | `Frontend/src/lib/feature-flags.ts` |
| Query Hooks | `Frontend/src/hooks/use-projects.ts` |
| API Client | `Frontend/src/lib/api/client.ts` |
| Frontend Types | `Frontend/src/lib/types.ts` |
| OpenCode Config | `.opencode/opencode.json` |
| App Shell | `Frontend/src/components/layout/AppShell.tsx` |
| Root Layout | `Frontend/src/app/layout.tsx` |
| Collection Models | `reference/collection-system/app/models.py` (~50 tables) |
| Collection Routes | `reference/collection-system/app/routes_*.py` (16 files) |
| Collection Templates | `reference/collection-system/app/templates/` (84 files) |

---

## 12. COLLECTION SYSTEM QUICK REFERENCE (For Building Features)

### Current Collection System Architecture
- **Python 3.x** + **Flask 3.1.3**
- **PostgreSQL 16** with 8 area schemas per-area core tables
- **SQLAlchemy** + **Alembic** (single migration file)
- **Jinja2** + **Bootstrap 5.3 RTL** (84 HTML templates)
- **Chart.js 4.4.1** (CDN) — 5 charts on dashboard
- **Flask-Login** + 6 roles, **27 feature permissions**
- **Redis** (port 6380) for server-side sessions
- **Waitress** WSGI production server
- **fpdf2** for PDF receipts/invoices
- **openpyxl + pandas** for Excel exports
- **252+ existing endpoints** across 16 route files

### What NOT to touch
- All 252+ existing endpoints — no refactoring
- All 84 templates — no breaking changes
- All 50+ model classes — only add new columns/tables, never remove
- Multi-schema architecture — new tables go to `public` schema
- Bilingual (Ar/En) — all new UI must support both
- 5 charge modes (STEPS/FLAT/STATIC/PER_UNIT/ZERO) — no changes
- Symbiot integration — no changes
- All existing reports — no changes

### Existing Models Available
- `Customer` — name, code, project_id, meter_type, opening_balance, status
- `CustomerMeter` — serial, customer_id, type, status (active/inactive), parent_main_meter_id
- `Transaction` — invoice + payment (transaction_type = invoice/payment), amount, balance_after, voided
- `CustomerLedgerEntry` — append-only balance tracking with running_balance
- `PaymentAllocation` — payment-to-invoice mapping
- `MeterReading` — consumption, reading_date, meter_type, meter_serial, customer_id
- `SIMCard` — iccid, msisdn, provider, ip_address, ip_type, status
- `WaterBalance` — main_meter_id, period, main_consumption, child_total, difference
- `Project` — name, water_difference_mode, water_difference_threshold
- `User` — with 6 roles, Flask-Login auth

### Sidebar Menu to Update
Add to `templates/base.html`:
```html
<!-- Balances & Aging -->
<li class="nav-item">
  <a class="nav-link" href="{{ url_for('balances_aging.index') }}">
    <i class="bi bi-cash-stack"></i> <span>{{ _('Balances & Aging') }}</span>
  </a>
</li>
<!-- Consumption Analysis -->
<li class="nav-item">
  <a class="nav-link" href="{{ url_for('consumption_analysis.index') }}">
    <i class="bi bi-graph-up-arrow"></i> <span>{{ _('Consumption Analysis') }}</span>
  </a>
</li>
<!-- Water Balance -->
<li class="nav-item">
  <a class="nav-link" href="{{ url_for('water_balance.index') }}">
    <i class="bi bi-droplet"></i> <span>{{ _('Water Balance') }}</span>
  </a>
</li>
```

### Role Permissions for New Pages
| Page | superadmin | admin | area_manager | team_leader | user |
|------|-----------|-------|-------------|-------------|------|
| Balances & Aging | ✅ | ✅ | ✅ | ✅ | ✅ |
| Water Balance | ✅ | ✅ | ✅ | ✅ | ❌ |
| Consumption Analysis | ✅ | ✅ | ✅ | ✅ | ❌ |
| Meter Detail/Assign/Replace/Terminate | ✅ | ✅ | ✅ | ❌ | ❌ |
| SIM Cards | ✅ | ✅ | ✅ | ✅ | ❌ |

---

## 13. GIT SETUP

```bash
# Remotes
origin  https://github.com/Kirllos360/Meter.git (fetch/push)   # NEW unified repo
abady   https://github.com/Abady001/Meter-.git (fetch/push)     # OLD fork

# Current branch
feature/t055-payments-contract

# Recent commits
2cd89a3 T086: Migrate Meter Pulse to Meter Verse v2.0.0 (HEAD)
665f2dc docs: remove PDF directory, mark T061-T065 as [X]
e1733a3 docs: fix AGENTS.md backend description + close 13 superseded PRs
99301cb style: prettier --write on all backend files
1772993 feat: T061-T065 full implementation
65d6dc4 docs: full sync — update all documentation files
95ea349 fix: CI backend — run prisma migrate deploy for integration tests

# .gitignore covers: .env, node_modules/, .next/, dist/, build/, coverage/, *.db, *.sqlite,
# reference/ (11+ GB excluded!), tools/playwright-mcp/node_modules/, graphify-out/cache/,
# backup files/, --version/, restore-point-*/
```

---

## 14. STARTING POINT — Next Actions

### Immediate: Build 5 Priority Features in Collection System
Follow `reference/collection-system/docs/specs/PLAN_EXECUTION_STRATEGY.md` — start with **Meter Status Lifecycle (2→7)**:
1. Migration: customer_meter new columns + meter_status_log table
2. Model updates (CustomerMeter + MeterStatusLog)
3. Status transition engine
4. Routes: status change, log view
5. Templates: status badges, dashboard doughnut update

### Then: Meter Verse v2.0.0 (T086+)
After the 5 Collection features are stable, build Meter Verse v2.0.0 starting with **T086: Core DB schema (15 tables)**.

### Validation to Run After Changes
```bash
# Backend
cd backend && npm test && npm run build && npx prisma validate

# Frontend  
cd Frontend && bun run lint --no-cache --max-warnings 0 && bun run build

# Collection System (from reference/collection-system/)
flask run  # Verify pages load
```

---

*End of FULL_PROMPT_XFER.md — paste into new AI chat to continue seamlessly.*
