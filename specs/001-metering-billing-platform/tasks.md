---
description: "Dependency-ordered implementation tasks for the Utility Metering and Billing Platform MVP"
---

# Tasks: Utility Metering and Billing Platform MVP

**Input**: Design documents from `/specs/001-metering-billing-platform/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/meter-pulse-api.yaml, quickstart.md, Frontend/FRONTEND_BUILD.md, Frontend/FRONTEND_SPRINT_BACKLOG.md

**Tests**: INCLUDED. Contract tests (against `contracts/meter-pulse-api.yaml`) and domain integration tests are explicitly required by the feature spec and plan Testing Plan. Write them before the implementation they cover.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: `[US1]`/`[US2]`/`[US3]` for user-story phases only (Setup/Foundational/Polish carry no story label)
- Each task carries a metadata block: **Dependencies**, **Area/Files**, **Acceptance**, **Validation**, **Risk**

## Path Conventions

- **Backend (new)**: `backend/src/<module>/`, migrations in `backend/prisma/`, tests in `backend/test/`
- **Frontend (existing — do NOT rebuild)**: `Frontend/src/...`, smoke in `Frontend/scripts/smoke-all-pages.mjs`
- **Contracts**: `specs/001-metering-billing-platform/contracts/meter-pulse-api.yaml`

## ⚠️ Graphify-First Rule (frontend tasks)

Every frontend task (`FE-*`) MUST run Graphify **before** any dependency analysis, implementation planning, or file-change sequencing:

```bash
cd Frontend
graphify query "<ticket objective>"        # required first step
graphify path "<source module>" "<target module>"   # optional, for impacted modules
graphify explain "<concept>"                          # optional
```

After each frontend batch, refresh the graph:

```bash
cd Frontend && graphify update .
```

A frontend task is not "started" until its `graphify query` has been run and its output used to scope the file changes.

## ⚠️ Preservation Constraints (non-negotiable)

- Do NOT rebuild the existing frontend.
- Preserve the Next.js app shell, in-app routing (`AppShell.tsx`/`PageKey`), design system, role navigation (`src/lib/navigation.ts`), mock fallback, and the `test:smoke` workflow.
- All frontend migration is incremental and gated behind the feature flag from FE-003 (mock fallback stays available).

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Stand up the new NestJS backend project skeleton. Frontend already exists and is preserved.

- [X] T001 Create NestJS backend project scaffold in `backend/`
  - **Dependencies**: none
  - **Area/Files**: `backend/package.json`, `backend/nest-cli.json`, `backend/tsconfig.json`, `backend/src/main.ts`, `backend/src/app.module.ts`
  - **Acceptance**: `nest start` boots; `GET /health` returns `200`; bounded-context module folders exist empty (`auth/ projects/ customers/ meters/ sim-cards/ readings/ billing/ payments/ reports/ audit/ common/`)
  - **Validation**: `cd backend && npm run build && npm run start:dev` then `curl -s localhost:3000/health`
  - **Risk**: Node/Nest version drift from frontend's Node 20+; pin engines in package.json.

- [X] T002 Add config + PostgreSQL connection module in `backend/src/common/config/`
  - **Dependencies**: T001
  - **Area/Files**: `backend/src/common/config/config.module.ts`, `backend/.env.example`, `backend/src/common/database/database.module.ts`
  - **Acceptance**: `@nestjs/config` loads env; DB target is `meter_pulse` DB / `sim_system` schema; connection validated on boot
  - **Validation**: `cd backend && npm run start:dev` shows successful DB connection log
  - **Risk**: Secrets leakage — keep real `.env` out of git, only commit `.env.example`.

- [X] T003 [P] Configure backend lint/format/test tooling in `backend/`
  - **Dependencies**: T001
  - **Area/Files**: `backend/.eslintrc.cjs`, `backend/.prettierrc`, `backend/jest.config.ts`
  - **Acceptance**: `npm run lint` and `npm test` run (zero tests OK) with no config errors
  - **Validation**: `cd backend && npm run lint && npm test`
  - **Risk**: ESLint/TS version mismatch breaking CI; align with frontend toolchain versions.

- [ ] T004 [P] Initialize Prisma ORM in `backend/prisma/`
  - **Dependencies**: T002
  - **Area/Files**: `backend/prisma/schema.prisma` (datasource + generator only), `backend/src/common/database/prisma.service.ts`
  - **Acceptance**: `prisma generate` succeeds; `PrismaService` injectable; `multiSchema`/`sim_system` schema configured
  - **Validation**: `cd backend && npx prisma validate && npx prisma generate`
  - **Risk**: ORM choice locked per research Decision 3 — switching later is costly; confirm Prisma before proceeding.

- [ ] T005 [P] Add local PostgreSQL via docker-compose in `backend/`
  - **Dependencies**: none
  - **Area/Files**: `backend/docker-compose.yml`, `backend/README.md` (DB run instructions)
  - **Acceptance**: `docker compose up -d db` exposes a reachable `meter_pulse` Postgres
  - **Validation**: `cd backend && docker compose up -d db && docker compose ps`
  - **Risk**: Port collision with existing local services; make port configurable via env.

**Checkpoint**: Backend boots, connects to Postgres, lint/test/Prisma all run.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Cross-cutting backend infrastructure, the complete data-model schema, the contract-test harness, and the frontend Sprint 0 client foundation. **No user story may begin until this phase is complete.**

### Backend cross-cutting infrastructure

- [ ] T006 [P] Implement standard error envelope + global exception filter in `backend/src/common/http/`
  - **Dependencies**: T001
  - **Area/Files**: `backend/src/common/http/error-envelope.ts`, `backend/src/common/http/all-exceptions.filter.ts`
  - **Acceptance**: All errors serialize to `{ code, message, details?, correlationId }` exactly matching `ErrorEnvelope` in the contract
  - **Validation**: `cd backend && npm test -- error-envelope`
  - **Risk**: Envelope drift from contract breaks frontend error parsing (FE-001); assert shape in a unit test.

- [ ] T007 [P] Add correlation-ID middleware in `backend/src/common/http/correlation.middleware.ts`
  - **Dependencies**: T001
  - **Area/Files**: `backend/src/common/http/correlation.middleware.ts`
  - **Acceptance**: Every request gets/propagates a `correlationId`, surfaced in responses and error envelope
  - **Validation**: `cd backend && npm test -- correlation`
  - **Risk**: Missing correlation IDs undermine audit traceability (FR-016).

- [ ] T008 [P] Add Idempotency-Key interceptor in `backend/src/common/http/idempotency.interceptor.ts`
  - **Dependencies**: T002, T004
  - **Area/Files**: `backend/src/common/http/idempotency.interceptor.ts`, idempotency-key store table in `backend/prisma/schema.prisma`
  - **Acceptance**: Repeat mutation with same `Idempotency-Key` returns the original result without double-applying
  - **Validation**: `cd backend && npm test -- idempotency`
  - **Risk**: Incorrect keying double-bills/double-assigns; scope keys per route+actor.

- [ ] T009 Implement Auth (JWT) + RBAC guard + role model in `backend/src/auth/`
  - **Dependencies**: T002, T004
  - **Area/Files**: `backend/src/auth/auth.module.ts`, `backend/src/auth/jwt.strategy.ts`, `backend/src/auth/roles.guard.ts`, `backend/src/auth/roles.decorator.ts`
  - **Acceptance**: Roles `super_admin, project_admin, operator, technician, finance, support, customer` enforced at route + action level; project-scope claim respected (FR-015); all DTO request validation uses `class-validator` pipes (per research Decision 13)
  - **Validation**: `cd backend && npm test -- auth roles.guard`
  - **Risk**: Role names must match frontend `src/lib/navigation.ts`; mismatch breaks gating.

- [ ] T010 [P] Implement append-only audit log service + interceptor in `backend/src/audit/`
  - **Dependencies**: T004, T007
  - **Area/Files**: `backend/src/audit/audit.service.ts`, `backend/src/audit/audit.interceptor.ts`
  - **Acceptance**: Sensitive actions write an `AuditLog` row (actor, role, action, resource, before/after, reason, correlationId); writes are append-only (FR-016)
  - **Validation**: `cd backend && npm test -- audit`
  - **Risk**: Missing before/after snapshots reduce dispute defensibility; capture both states in interceptor.

- [ ] T011 Wire API versioning `/api/v1`, base routing, and OpenAPI serving in `backend/src/main.ts`
  - **Dependencies**: T001, T006
  - **Area/Files**: `backend/src/main.ts`, `backend/src/common/openapi/openapi.setup.ts`
  - **Acceptance**: All routes mount under `/api/v1`; generated OpenAPI doc served at `/api/v1/docs`
  - **Validation**: `cd backend && npm run start:dev` then `curl -s localhost:3000/api/v1/docs-json | head`
  - **Risk**: Generated spec diverging from `meter-pulse-api.yaml`; reconcile in T083.

- [ ] T012 Build contract-test harness against `meter-pulse-api.yaml` in `backend/test/contract/`
  - **Dependencies**: T011
  - **Area/Files**: `backend/test/contract/setup.ts` (supertest app bootstrap + OpenAPI response validator loading `specs/001-metering-billing-platform/contracts/meter-pulse-api.yaml`)
  - **Acceptance**: Harness can assert any response against a schema/operationId from the YAML; one smoke assertion passes
  - **Validation**: `cd backend && npm test -- test/contract/setup`
  - **Risk**: Relative path to YAML from `backend/` must be stable; resolve via repo-root anchor.

### PostgreSQL schema/migrations (all data-model entities)

- [ ] T013 [P] Migration — Project, LocationNode, Customer, CustomerUnitAssignment in `backend/prisma/`
  - **Dependencies**: T004
  - **Area/Files**: `backend/prisma/schema.prisma`, `backend/prisma/migrations/*_core_org/`
  - **Acceptance**: Tables created with enums + `(project_id,node_type,code)` uniqueness and one-active-row-per `(customer_id,unit_id)` partial unique where `end_at IS NULL`; Project includes `tax_enabled`/`tax_rate`/`reading_threshold_profile_id`/`water_difference_mode` columns
  - **Validation**: `cd backend && npx prisma migrate dev --name core_org && npx prisma migrate status`
  - **Risk**: Hierarchy self-FK on LocationNode; ensure `parent_id` nullable + indexed.

- [ ] T014 [P] Migration — Meter, SIMCard, MeterAssignment, SIMAssignment in `backend/prisma/`
  - **Dependencies**: T013
  - **Area/Files**: `backend/prisma/schema.prisma`, `backend/prisma/migrations/*_meter_sim/`
  - **Acceptance**: Unique `serial_number`, unique `iccid`; **partial unique index on `(meter_id) WHERE end_at IS NULL`** and **`(sim_id) WHERE end_at IS NULL`** (FR-004/FR-005); `parent_main_meter_id` required for `water_child`
  - **Validation**: `cd backend && npx prisma migrate dev --name meter_sim && npx prisma migrate status`
  - **Risk**: Prisma partial unique indexes require raw SQL in migration; verify they actually apply in DB.

- [ ] T015 [P] Migration — Reading, ReadingReview, TariffPlan, BillingPeriod in `backend/prisma/`
  - **Dependencies**: T014
  - **Area/Files**: `backend/prisma/schema.prisma`, `backend/prisma/migrations/*_readings_tariff/`
  - **Acceptance**: Reading has unique `(meter_id, reading_at, source)`, status enum, snapshots, `raw_payload` jsonb; TariffPlan + BillingPeriod created
  - **Validation**: `cd backend && npx prisma migrate dev --name readings_tariff && npx prisma migrate status`
  - **Risk**: jsonb defaults and decimal precision for consumption/rate must be explicit.

- [ ] T016 [P] Migration — Invoice, InvoiceLine, InvoiceAdjustment in `backend/prisma/`
  - **Dependencies**: T013
  - **Area/Files**: `backend/prisma/schema.prisma`, `backend/prisma/migrations/*_invoices/`
  - **Acceptance**: Unique `invoice_number`; `utility_type` + status enums; amount columns (subtotal/tax/total/paid/remaining); `immutable_at` present
  - **Validation**: `cd backend && npx prisma migrate dev --name invoices && npx prisma migrate status`
  - **Risk**: Decimal rounding policy must be consistent across invoice/line/adjustment.

- [ ] T017 [P] Migration — Payment, PaymentAllocation, CustomerLedgerEntry in `backend/prisma/`
  - **Dependencies**: T016
  - **Area/Files**: `backend/prisma/schema.prisma`, `backend/prisma/migrations/*_payments_ledger/`
  - **Acceptance**: Unique `payment_number`; allocation links payment→invoice with order; CustomerLedgerEntry append-only with `running_balance`
  - **Validation**: `cd backend && npx prisma migrate dev --name payments_ledger && npx prisma migrate status`
  - **Risk**: Ledger must be append-only — add DB-level guard/trigger or restrict writes in repository layer.

- [ ] T018 [P] Migration — AuditLog, ReportJob in `backend/prisma/`
  - **Dependencies**: T013
  - **Area/Files**: `backend/prisma/schema.prisma`, `backend/prisma/migrations/*_audit_reports/`
  - **Acceptance**: AuditLog (before/after jsonb, correlationId) + ReportJob (status/format/filters/file_url) tables created
  - **Validation**: `cd backend && npx prisma migrate dev --name audit_reports && npx prisma migrate status`
  - **Risk**: AuditLog volume growth; add created_at index for retention queries.

- [ ] T019 Migration — derived views (`customer_statement_view`, `meter_assignment_active_view`, `sim_assignment_active_view`)
  - **Dependencies**: T014, T017
  - **Area/Files**: `backend/prisma/migrations/*_views/migration.sql`
  - **Acceptance**: Views return one active row per meter/SIM and a running-balance statement projection
  - **Validation**: `cd backend && npx prisma migrate dev --name views` then `psql -c 'select * from meter_assignment_active_view limit 1'`
  - **Risk**: Views must stay aligned with table renames; document dependency.

### Frontend Sprint 0 foundation (Graphify-first)

- [ ] T020 [US?-foundational] FE-001 API client foundation in `Frontend/src/lib/api/`
  - **Dependencies**: T006 (error envelope shape)
  - **Area/Files**: `Frontend/src/lib/api/client.ts`, `Frontend/src/lib/api/errors.ts`, `Frontend/src/lib/api/auth.ts`
  - **Acceptance**: One shared API wrapper (base `/api/v1`); parses `ErrorEnvelope` consistently; logs `correlationId`; auth token attach + refresh hooks; used by ≥1 module
  - **Validation**: `cd Frontend && graphify query "centralized API client + error normalization" && bun run lint && bun run build`
  - **Risk**: Must not alter app shell or existing module behavior; keep wrapper additive.

- [ ] T021 [US?-foundational] FE-002 React Query integration pattern in `Frontend/src/lib/api/`
  - **Dependencies**: T020
  - **Area/Files**: `Frontend/src/lib/api/query-client.tsx`, `Frontend/src/hooks/use-*` conventions, provider mount in existing shell entry
  - **Acceptance**: Reusable query/mutation hook pattern documented in code; standardized loading/error/empty UI; ≥1 list + ≥1 detail page use server data hooks
  - **Validation**: `cd Frontend && graphify query "react query hooks + loading/error/empty standards" && bun run lint && bun run build && bun run test:smoke`
  - **Risk**: Provider placement must not break SSR/hydration in Next.js 16 app shell.

- [ ] T022 [US?-foundational] FE-003 Feature-flag toggles for API migration in `Frontend/src/lib/`
  - **Dependencies**: T020
  - **Area/Files**: `Frontend/src/lib/feature-flags.ts`, integration into one module's data source selection
  - **Acceptance**: Per-module switch between mock and API mode; Projects module can switch source with no UI regression; mock fallback preserved
  - **Validation**: `cd Frontend && graphify query "feature flag mock vs api per module" && bun run lint && bun run build && bun run test:smoke`
  - **Risk**: Flag default must remain mock until a module's API is verified, to keep smoke green.

**Checkpoint**: Schema migrated for all entities, cross-cutting backend infra + contract harness ready, frontend API/query/flag foundation in place and smoke-green. User stories can begin.

---

## Phase 3: User Story 1 — Manage Meter and Location Assignments (Priority: P1) 🎯 MVP

**Goal**: Register meters/SIMs and assign them to project/location/unit/customer with one active assignment, full history, and SIM reuse on termination.

**Independent Test**: Create project/unit/customer, register a meter+SIM, assign once, verify single active assignment + history; terminate meter and confirm SIM becomes reusable.

**Backend rollout**: maps to S1 (projects/locations/customers/dashboard) + S2 (meters/SIM/assignment/termination/reuse).

### Tests for User Story 1 (write first, must FAIL before impl)

- [ ] T023 [P] [US1] Contract test `assignMeter` (200 + 409 conflict) in `backend/test/contract/meter-assign.contract.spec.ts`
  - **Dependencies**: T012
  - **Area/Files**: `backend/test/contract/meter-assign.contract.spec.ts`
  - **Acceptance**: Asserts `MeterAssignRequest`/`MeterAssignment` schema and `409 ConflictError` envelope per YAML
  - **Validation**: `cd backend && npm test -- meter-assign.contract`
  - **Risk**: Test must fail before T031 exists (proves TDD).

- [ ] T024 [P] [US1] Contract test `terminateMeter` + `getSimEligibility` in `backend/test/contract/meter-terminate.contract.spec.ts`
  - **Dependencies**: T012
  - **Area/Files**: `backend/test/contract/meter-terminate.contract.spec.ts`
  - **Acceptance**: Asserts `MeterTerminateResult` + `SimEligibility` schemas per YAML
  - **Validation**: `cd backend && npm test -- meter-terminate.contract`
  - **Risk**: Eligibility cooldown field nullability must match contract.

- [ ] T025 [P] [US1] Integration test — assignment conflict (one active per meter & per SIM) in `backend/test/integration/assignment-conflict.spec.ts`
  - **Dependencies**: T014
  - **Area/Files**: `backend/test/integration/assignment-conflict.spec.ts`
  - **Acceptance**: Concurrent/duplicate assign of same meter or SIM rejected with conflict; only one active row persists (FR-004/FR-005)
  - **Validation**: `cd backend && npm test -- assignment-conflict`
  - **Risk**: Must exercise the DB partial unique index, not just app checks (race-proof).

- [ ] T026 [P] [US1] Integration test — SIM reuse after meter termination in `backend/test/integration/sim-reuse.spec.ts`
  - **Dependencies**: T014
  - **Area/Files**: `backend/test/integration/sim-reuse.spec.ts`
  - **Acceptance**: Termination atomically ends SIM assignment and sets SIM status to `reusable` (with optional cooldown) (research Decision 5)
  - **Validation**: `cd backend && npm test -- sim-reuse`
  - **Risk**: Atomicity — assert single transaction so partial failure can't strand SIM.

### Implementation for User Story 1 (backend)

- [ ] T027 [P] [US1] Projects module (CRUD + status + tax/threshold config) in `backend/src/projects/`
  - **Dependencies**: T013, T009
  - **Area/Files**: `backend/src/projects/projects.module.ts`, `projects.controller.ts`, `projects.service.ts`
  - **Acceptance**: Create/update/deactivate/list/get projects + location nodes (FR-001); `tax_enabled`/`tax_rate`/threshold profile editable; `water_difference_mode` (billable/report_only, default report_only) editable (FR-009)
  - **Validation**: `cd backend && npm test -- projects`
  - **Risk**: Deactivation must not orphan active meters; guard on dependents.

- [ ] T028 [P] [US1] Locations module (CRUD over LocationNode hierarchy) in `backend/src/projects/locations/`
  - **Dependencies**: T013, T009
  - **Area/Files**: `backend/src/projects/locations/locations.controller.ts`, `locations.service.ts`
  - **Acceptance**: CRUD with parent/child integrity; unit-type nodes resolvable for assignment (FR-001)
  - **Validation**: `cd backend && npm test -- locations`
  - **Risk**: Cyclic parent references; validate hierarchy on write.

- [ ] T029 [P] [US1] Customers module + CustomerUnitAssignment in `backend/src/customers/`
  - **Dependencies**: T013, T009
  - **Area/Files**: `backend/src/customers/customers.controller.ts`, `customers.service.ts`
  - **Acceptance**: Customer CRUD + customer-to-unit relationship with one active per `(customer,unit)` (FR-002)
  - **Validation**: `cd backend && npm test -- customers`
  - **Risk**: `customer_code` uniqueness scoped per project, not global.

- [ ] T030 [P] [US1] Meters module (CRUD + status lifecycle) in `backend/src/meters/`
  - **Dependencies**: T014, T009
  - **Area/Files**: `backend/src/meters/meters.controller.ts`, `meters.service.ts`
  - **Acceptance**: Unique serial, types (electricity/water_main/water_child), status transitions per data-model (FR-003); exposes meter assignment history (all MeterAssignment/SIMAssignment rows with start/end + acting user) for the detail view (FR-006)
  - **Validation**: `cd backend && npm test -- meters`
  - **Risk**: Invalid status transitions; enforce a transition guard.

- [ ] T031 [P] [US1] SIM module (CRUD + eligibility endpoint) in `backend/src/sim-cards/`
  - **Dependencies**: T014, T009
  - **Area/Files**: `backend/src/sim-cards/sim.controller.ts`, `sim.service.ts` (incl. `GET /sim-cards/{simId}/eligibility`)
  - **Acceptance**: SIM CRUD; eligibility returns `{ eligible, reason, cooldownUntil }` per contract (makes T024 pass)
  - **Validation**: `cd backend && npm test -- sim meter-terminate.contract`
  - **Risk**: Eligibility must account for cooldown + current active assignment.

- [ ] T032 [US1] Assignment command + `POST /api/v1/meters/{meterId}/assign` (transactional) in `backend/src/meters/`
  - **Dependencies**: T030, T031, T025, T010
  - **Area/Files**: `backend/src/meters/assign.command.ts`, `meters.controller.ts`
  - **Acceptance**: Single transaction creates one active MeterAssignment (+ optional SIMAssignment), enforces uniqueness, writes audit; makes T023 + T025 pass
  - **Validation**: `cd backend && npm test -- meter-assign.contract assignment-conflict`
  - **Risk**: Race conditions — rely on partial unique index inside the transaction.

- [ ] T033 [US1] Termination command + `POST /api/v1/meters/{meterId}/terminate` (SIM reuse) in `backend/src/meters/`
  - **Dependencies**: T032, T026
  - **Area/Files**: `backend/src/meters/terminate.command.ts`, `meters.controller.ts`
  - **Acceptance**: Requires final reading + reason; atomically ends meter+SIM assignments, sets SIM `reusable`, writes audit; makes T024 + T026 pass
  - **Validation**: `cd backend && npm test -- meter-terminate.contract sim-reuse`
  - **Risk**: Final-reading capture must persist before status flip.

- [ ] T034 [US1] Dashboard summary endpoints in `backend/src/projects/dashboard/`
  - **Dependencies**: T029, T030, T031
  - **Area/Files**: `backend/src/projects/dashboard/dashboard.controller.ts`, `dashboard.service.ts`
  - **Acceptance**: KPI/summary endpoints with date-range + project-scope filters for FE-012
  - **Validation**: `cd backend && npm test -- dashboard`
  - **Risk**: Aggregations slow at scale; add indexes / cap ranges.

### Implementation for User Story 1 (frontend — Graphify-first, behind feature flag)

- [ ] T035 [US1] FE-010 Projects + Locations API migration in `Frontend/src/components/projects/`
  - **Dependencies**: T027, T028, T022
  - **Area/Files**: `Frontend/src/components/projects/ProjectsPage.tsx`, `ProjectDetailPage.tsx`, `LocationsPage.tsx` (+ hooks under `src/hooks/`)
  - **Acceptance**: List/detail/locations load from API with server pagination/sort/filter; no layout/design change; row-click + loading/empty/error states intact
  - **Validation**: `cd Frontend && graphify query "projects and locations API migration" && bun run lint && bun run build && bun run test:smoke`
  - **Risk**: Pagination contract mismatch; keep mock fallback flag on until verified.

- [ ] T036 [US1] FE-011 Customers API migration in `Frontend/src/components/customers/`
  - **Dependencies**: T029, T022
  - **Area/Files**: `Frontend/src/components/customers/CustomersPage.tsx`, `CustomerDetailPage.tsx`
  - **Acceptance**: Customer list/detail from API with page params; tabs/table/filter/search preserved
  - **Validation**: `cd Frontend && graphify query "customers list detail API migration" && bun run lint && bun run build && bun run test:smoke`
  - **Risk**: Tab state regressions; snapshot existing behavior before edit.

- [ ] T037 [US1] FE-012 Dashboard KPI backend wiring in `Frontend/src/components/dashboard/`
  - **Dependencies**: T034, T022
  - **Area/Files**: `Frontend/src/components/dashboard/DashboardPage.tsx`
  - **Acceptance**: KPIs/charts from backend summaries with date-range + project scope; graceful fallback states
  - **Validation**: `cd Frontend && graphify query "dashboard KPI backend wiring" && bun run lint && bun run build && bun run test:smoke`
  - **Risk**: Chart data-shape mismatch crashes render; validate at hook boundary.

- [ ] T038 [US1] FE-020 Meters + SIM cards API migration in `Frontend/src/components/meters/` and `sim-cards/`
  - **Dependencies**: T030, T031, T022
  - **Area/Files**: `Frontend/src/components/meters/MetersPage.tsx`, `MeterDetailPage.tsx`, `Frontend/src/components/sim-cards/SimCardsPage.tsx`
  - **Acceptance**: Lists/detail from API; client-only actions replaced with real mutations where available; views preserved; meter detail surfaces active assignment + full assignment history (FR-006)
  - **Validation**: `cd Frontend && graphify query "meters and sim cards API migration" && bun run lint && bun run build && bun run test:smoke`
  - **Risk**: Status enum mismatch between frontend types and backend; reconcile `src/lib/types.ts`.

- [ ] T039 [US1] FE-021 Meter assignment workflow hardening in `Frontend/src/components/meters/MeterAssignPage.tsx`
  - **Dependencies**: T032, T038
  - **Area/Files**: `Frontend/src/components/meters/MeterAssignPage.tsx`
  - **Acceptance**: Assign is idempotent from UI (Idempotency-Key); 409 conflict surfaces actionable validation message
  - **Validation**: `cd Frontend && graphify query "meter assign conflict idempotent UI" && bun run lint && bun run build && bun run test:smoke`
  - **Risk**: Double-submit double-assign if key not sent; enforce pending state.

- [ ] T040 [US1] FE-022 Meter replacement + termination workflow in `Frontend/src/components/meters/`
  - **Dependencies**: T033, T038
  - **Area/Files**: `Frontend/src/components/meters/MeterReplacePage.tsx`, `MeterTerminatePage.tsx`
  - **Acceptance**: Required reason/date/final-reading fields with schema validation; success/failure states; audit fields in payload
  - **Validation**: `cd Frontend && graphify query "meter replace terminate final reading form" && bun run lint && bun run build && bun run test:smoke`
  - **Risk**: Missing final reading lets termination proceed; block submit until valid.

- [ ] T041 [US1] FE-023 SIM cooldown + reuse eligibility UI in `Frontend/src/components/sim-cards/SimCardsPage.tsx` (Phase 2 priority)
  - **Dependencies**: T031, T040
  - **Area/Files**: `Frontend/src/components/sim-cards/SimCardsPage.tsx`
  - **Acceptance**: Lifecycle badges + cooldown indicators; ineligible SIM cannot be assigned; eligibility reason visible
  - **Validation**: `cd Frontend && graphify query "sim cooldown reuse eligibility badges" && bun run lint && bun run build && bun run test:smoke`
  - **Risk**: Eligibility call latency blocks assign UX; cache eligibility per SIM.

- [ ] T042 [US1] US1 frontend batch validation + graph refresh
  - **Dependencies**: T035–T041
  - **Area/Files**: `Frontend/` (no source change), `Frontend/graphify-out/`
  - **Acceptance**: Lint + build + smoke all green in both mock and API mode; graph outputs refreshed
  - **Validation**: `cd Frontend && bun run lint && bun run build && bun run test:smoke && graphify update .`
  - **Risk**: Smoke flakiness; rerun and stabilize before proceeding to US2.

**Checkpoint**: US1 fully functional and independently testable (assignment integrity + SIM reuse + S1/S2 frontend live).

---

## Phase 4: User Story 2 — Capture Readings and Calculate Consumption (Priority: P2)

**Goal**: Capture readings across manual/import/automatic sources, compute consumption, and flag suspicious values for review using per-project thresholds.

**Independent Test**: Record sequential readings, verify computed consumption, confirm negative/high values flagged into the review queue and approvable.

**Backend rollout**: maps to S3 (readings + anomaly queue).

### Tests for User Story 2 (write first, must FAIL before impl)

- [ ] T043 [P] [US2] Contract test `createReading` (201 + 422) in `backend/test/contract/readings.contract.spec.ts`
  - **Dependencies**: T012
  - **Area/Files**: `backend/test/contract/readings.contract.spec.ts`
  - **Acceptance**: Asserts `ReadingCreateRequest`/`Reading` schemas + `422 ValidationError` per YAML
  - **Validation**: `cd backend && npm test -- readings.contract`
  - **Risk**: Source enum (manual/import/automatic) must match exactly.

- [ ] T044 [P] [US2] Contract test `listReadingReviewQueue` in `backend/test/contract/review-queue.contract.spec.ts`
  - **Dependencies**: T012
  - **Area/Files**: `backend/test/contract/review-queue.contract.spec.ts`
  - **Acceptance**: Asserts review-queue shape + `status` query enum (`pending_review`,`suspicious`)
  - **Validation**: `cd backend && npm test -- review-queue.contract`
  - **Risk**: Pagination not in contract; keep response minimal-compatible.

- [ ] T045 [P] [US2] Integration test — reading validation thresholds + suspicious flagging in `backend/test/integration/reading-validation.spec.ts`
  - **Dependencies**: T015
  - **Area/Files**: `backend/test/integration/reading-validation.spec.ts`
  - **Acceptance**: Consumption = current − previous; negative/over-threshold readings flagged `suspicious`/`pending_review` using project profile + system default (FR-008)
  - **Validation**: `cd backend && npm test -- reading-validation`
  - **Risk**: Default baseline vs project override precedence must be deterministic.

### Implementation for User Story 2

- [ ] T046 [P] [US2] Project threshold-profile config in `backend/src/projects/thresholds/`
  - **Dependencies**: T027, T015
  - **Area/Files**: `backend/src/projects/thresholds/threshold.service.ts`
  - **Acceptance**: Per-project threshold lookup with system-default fallback (FR-008)
  - **Validation**: `cd backend && npm test -- threshold`
  - **Risk**: Null profile must fall back to baseline, never error.

- [ ] T047 [US2] Readings module + `POST /api/v1/readings` (consumption calc + validation) in `backend/src/readings/`
  - **Dependencies**: T046, T045, T008, T010
  - **Area/Files**: `backend/src/readings/readings.controller.ts`, `readings.service.ts`
  - **Acceptance**: Ingest manual/import/automatic; compute consumption; set status; enforce unique `(meter,reading_at,source)`; audit; makes T043 + T045 pass
  - **Validation**: `cd backend && npm test -- readings.contract reading-validation`
  - **Risk**: Out-of-order readings break previous-value lookup; order by `reading_at`.

- [ ] T047a [US2] Automatic polling ingestion adapter (scheduler + retry + idempotency, behind feature toggle) in `backend/src/readings/polling/`
  - **Dependencies**: T047, T008
  - **Area/Files**: `backend/src/readings/polling/poller.service.ts`, `backend/src/readings/polling/adapter.interface.ts`, `backend/src/readings/polling/polling.scheduler.ts`
  - **Acceptance**: Pluggable adapter interface fetches device readings on a schedule, normalizes into `POST /readings` (source=automatic) with idempotency keys + retry/backoff; entire poller gated by a feature toggle (research Decision 6; plan Risks); disabled by default
  - **Validation**: `cd backend && npm test -- polling`
  - **Risk**: Protocol/reliability complexity (plan Risk); keep adapter isolated and toggle off until a real device adapter is validated.

- [ ] T048 [US2] Review queue + actions: `GET /api/v1/readings/review-queue` + approve/reject/correct in `backend/src/readings/`
  - **Dependencies**: T047
  - **Area/Files**: `backend/src/readings/review.controller.ts`, `review.service.ts` (writes `ReadingReview`)
  - **Acceptance**: Lists pending/suspicious; review actions transition status and persist reviewer + reason; makes T044 pass
  - **Validation**: `cd backend && npm test -- review-queue.contract`
  - **Risk**: Only `valid`/approved-`corrected` readings billable; enforce before billing in US3.

- [ ] T048a [US2] Water main-vs-sub variance service + `GET /api/v1/projects/{projectId}/water-balance` in `backend/src/readings/water-balance/`
  - **Dependencies**: T047, T030 (parent_main_meter_id linkage)
  - **Area/Files**: `backend/src/readings/water-balance/water-balance.service.ts`, `water-balance.controller.ts`
  - **Acceptance**: Computes variance = main-meter consumption − Σ(child-meter consumption) per period for operational review; returns variance + per-child breakdown (FR-009 comparison/variance)
  - **Validation**: `cd backend && npm test -- water-balance`
  - **Risk**: Missing/incomplete child readings skew variance; surface coverage % and exclude incomplete sets.

- [ ] T049 [US2] FE-030 Readings API migration in `Frontend/src/components/readings/`
  - **Dependencies**: T047, T022
  - **Area/Files**: `Frontend/src/components/readings/ReadingsPage.tsx`, `ReadingNewPage.tsx`
  - **Acceptance**: List/new-reading wired to API; pages intact; zero runtime errors in smoke
  - **Validation**: `cd Frontend && graphify query "readings list and new reading API migration" && bun run lint && bun run build && bun run test:smoke`
  - **Risk**: New-reading payload shape drift; validate against contract.

- [ ] T050 [US2] FE-031 Reading schema + business validation in `Frontend/src/components/readings/`
  - **Dependencies**: T049
  - **Area/Files**: `Frontend/src/components/readings/ReadingNewPage.tsx` (+ zod schema module)
  - **Acceptance**: react-hook-form + zod schemas; duplicate + monotonic checks surfaced; backend field errors mapped inline; invalid submit prevented
  - **Validation**: `cd Frontend && graphify query "reading zod schema monotonic duplicate validation" && bun run lint && bun run build && bun run test:smoke`
  - **Risk**: Monotonicity rule must match backend or UX contradicts API.

- [ ] T051 [US2] FE-032 Anomaly review queue in `Frontend/src/components/readings/`
  - **Dependencies**: T048, T049
  - **Area/Files**: `Frontend/src/components/readings/ReadingsPage.tsx` (review tab) + new review components
  - **Acceptance**: Review queue tab with filters (type/severity/status) + approve/reject/correct updating row state + activity trail
  - **Validation**: `cd Frontend && graphify query "anomaly review queue approve reject correct" && bun run lint && bun run build && bun run test:smoke`
  - **Risk**: Stale queue after action; invalidate React Query cache on mutation.

- [ ] T051a [US2] Water balance UI migration in `Frontend/src/components/billing/WaterBalancePage.tsx`
  - **Dependencies**: T048a, T022
  - **Area/Files**: `Frontend/src/components/billing/WaterBalancePage.tsx`
  - **Acceptance**: Migrate water-balance view to the variance API; show main-vs-sub variance + per-child breakdown; indicate project `water_difference_mode` (billable/report-only); no design/layout change (FR-009)
  - **Validation**: `cd Frontend && graphify query "water balance main vs sub variance UI" && bun run lint && bun run build && bun run test:smoke`
  - **Risk**: Page currently mock-driven; keep mock fallback flag until variance API verified.

- [ ] T052 [US2] US2 frontend batch validation + graph refresh
  - **Dependencies**: T049–T051, T051a
  - **Area/Files**: `Frontend/`, `Frontend/graphify-out/`
  - **Acceptance**: Lint + build + smoke green (mock + API mode); graph refreshed
  - **Validation**: `cd Frontend && bun run lint && bun run build && bun run test:smoke && graphify update .`
  - **Risk**: Review tab adds new smoke routes; extend `scripts/smoke-all-pages.mjs` coverage if needed.

**Checkpoint**: US2 independently testable; readings + anomaly queue live.

---

## Phase 5: User Story 3 — Generate Invoices, Record Payments, Track Balance (Priority: P3)

**Goal**: Generate per-utility invoices from validated consumption, issue with immutability + high-risk approval, record payments with oldest-due-first allocation, super-admin-only reversal, and a correct running ledger/statement.

**Independent Test**: Generate invoices for one cycle, record partial + full payments, reverse one (as super_admin), and validate the statement running balance.

**Backend rollout**: maps to S4 (invoices/payments/statements/ledger).

### Tests for User Story 3 (write first, must FAIL before impl)

- [ ] T053 [P] [US3] Contract test `generateInvoices` + `issueInvoice` (200 + 409 approval) in `backend/test/contract/invoices.contract.spec.ts`
  - **Dependencies**: T012
  - **Area/Files**: `backend/test/contract/invoices.contract.spec.ts`
  - **Acceptance**: Asserts `InvoiceGenerateRequest`, generate `202`, `Invoice` schema, and `409` high-risk-approval envelope
  - **Validation**: `cd backend && npm test -- invoices.contract`
  - **Risk**: Generate is async-style (202 batch); assert batch shape.

- [ ] T054 [P] [US3] Contract test `addInvoiceAdjustment` in `backend/test/contract/adjustments.contract.spec.ts`
  - **Dependencies**: T012
  - **Area/Files**: `backend/test/contract/adjustments.contract.spec.ts`
  - **Acceptance**: Asserts `InvoiceAdjustmentRequest` + `201`
  - **Validation**: `cd backend && npm test -- adjustments.contract`
  - **Risk**: Adjustment type enum (credit/debit) must match.

- [ ] T055 [P] [US3] Contract test `createPayment` + `reversePayment` (201/200 + 403) in `backend/test/contract/payments.contract.spec.ts`
  - **Dependencies**: T012
  - **Area/Files**: `backend/test/contract/payments.contract.spec.ts`
  - **Acceptance**: Asserts `PaymentCreateRequest`/`Payment`, allocation modes, and `403 ForbiddenError` on non-super-admin reversal
  - **Validation**: `cd backend && npm test -- payments.contract`
  - **Risk**: Allocation default `oldest_due_first` must be the contract default.

- [ ] T056 [P] [US3] Contract test `getCustomerStatement` in `backend/test/contract/statement.contract.spec.ts`
  - **Dependencies**: T012
  - **Area/Files**: `backend/test/contract/statement.contract.spec.ts`
  - **Acceptance**: Asserts `CustomerStatement` (opening/closing/entries with running balance)
  - **Validation**: `cd backend && npm test -- statement.contract`
  - **Risk**: Date filter semantics (inclusive bounds) must be documented.

- [ ] T057 [P] [US3] Integration test — invoice immutability + adjustment flow in `backend/test/integration/invoice-immutability.spec.ts`
  - **Dependencies**: T016
  - **Area/Files**: `backend/test/integration/invoice-immutability.spec.ts`
  - **Acceptance**: Issued invoice rejects direct edits; corrections only via `InvoiceAdjustment` with audit (FR-011)
  - **Validation**: `cd backend && npm test -- invoice-immutability`
  - **Risk**: Any update path bypassing immutability is a financial defect.

- [ ] T058 [P] [US3] Integration test — oldest-due-first allocation in `backend/test/integration/payment-allocation.spec.ts`
  - **Dependencies**: T017
  - **Area/Files**: `backend/test/integration/payment-allocation.spec.ts`
  - **Acceptance**: Default allocates to oldest-due invoices first; no over-allocation; sum(allocations)=payment (FR-012)
  - **Validation**: `cd backend && npm test -- payment-allocation`
  - **Risk**: Partial payments across multiple invoices must split correctly.

- [ ] T059 [P] [US3] Integration test — super-admin-only reversal + audit in `backend/test/integration/payment-reversal.spec.ts`
  - **Dependencies**: T017, T009
  - **Area/Files**: `backend/test/integration/payment-reversal.spec.ts`
  - **Acceptance**: Non-super-admin → 403; super-admin reversal appends ledger entry with mandatory reason in audit (FR-013)
  - **Validation**: `cd backend && npm test -- payment-reversal`
  - **Risk**: Reversal must recompute balance, not delete prior entries.

- [ ] T060 [P] [US3] Integration test — ledger running balance across charge/payment/reversal in `backend/test/integration/ledger-balance.spec.ts`
  - **Dependencies**: T017
  - **Area/Files**: `backend/test/integration/ledger-balance.spec.ts`
  - **Acceptance**: Mixed invoice_charge/payment_credit/payment_reversal/adjustment sequence yields mathematically correct running balance (FR-014, SC-004)
  - **Validation**: `cd backend && npm test -- ledger-balance`
  - **Risk**: Ordering/concurrency can corrupt running balance; serialize ledger writes per customer.

### Implementation for User Story 3

- [ ] T061 [P] [US3] Tariff + billing-period module in `backend/src/billing/tariffs/`
  - **Dependencies**: T015, T009
  - **Area/Files**: `backend/src/billing/tariffs/tariff.service.ts`, `backend/src/billing/periods/period.service.ts`
  - **Acceptance**: Manage tariff rates (effective windows) + billing periods used by generation
  - **Validation**: `cd backend && npm test -- tariff period`
  - **Risk**: Overlapping effective windows pick wrong rate; enforce non-overlap.

- [ ] T062 [US3] Invoice generation `POST /api/v1/invoices/generate` (utility split + tax) in `backend/src/billing/`
  - **Dependencies**: T061, T048, T053
  - **Area/Files**: `backend/src/billing/invoice-generate.command.ts`, `billing.controller.ts`
  - **Acceptance**: Separate invoice per utility type per period from billable readings only (each water meter — main or sub — billed on its own `water` invoice); applies project tax when enabled; incomplete cycles excluded; returns batch `202`; makes T053 (generate) pass
  - **Validation**: `cd backend && npm test -- invoices.contract`
  - **Risk**: Including non-`valid` readings in totals; filter strictly.

- [ ] T062a [US3] Apply per-project water difference handling in invoice generation in `backend/src/billing/`
  - **Dependencies**: T062, T048a, T027 (`water_difference_mode`)
  - **Area/Files**: `backend/src/billing/water-difference.policy.ts`, `invoice-generate.command.ts`
  - **Acceptance**: When `water_difference_mode=billable`, add the main-vs-sub variance as a distinct `InvoiceLine` on the main meter's water invoice; when `report_only`, exclude variance from billing (operational report only) (FR-009, I1)
  - **Validation**: `cd backend && npm test -- water-difference`
  - **Risk**: Double-counting if variance is also billed on child invoices; assert variance billed once, on main only.

- [ ] T063 [US3] Invoice issue `POST /api/v1/invoices/{invoiceId}/issue` (immutability + high-risk approval) in `backend/src/billing/`
  - **Dependencies**: T062, T057, T010
  - **Area/Files**: `backend/src/billing/invoice-issue.command.ts`, `billing.controller.ts`
  - **Acceptance**: Sets `immutable_at`; high-risk invoices (manual adjustments/flagged/over-threshold) require approval else `409` (FR-019); writes ledger `invoice_charge` + audit; makes T053 (issue) + T057 pass
  - **Validation**: `cd backend && npm test -- invoices.contract invoice-immutability`
  - **Risk**: High-risk detection rules must be explicit and testable.

- [ ] T064 [US3] Invoice adjustments `POST /api/v1/invoices/{invoiceId}/adjustments` in `backend/src/billing/`
  - **Dependencies**: T063, T054
  - **Area/Files**: `backend/src/billing/invoice-adjustment.command.ts`
  - **Acceptance**: Credit/debit adjustment on issued invoice with reason + audit; writes ledger entry; makes T054 pass
  - **Validation**: `cd backend && npm test -- adjustments.contract`
  - **Risk**: Adjustment must update remaining balance + ledger atomically.

- [ ] T065 [US3] Payments `POST /api/v1/payments` (oldest-due-first allocation + ledger) in `backend/src/payments/`
  - **Dependencies**: T063, T058, T008, T010
  - **Area/Files**: `backend/src/payments/payments.controller.ts`, `payment-create.command.ts`
  - **Acceptance**: Records full/partial payment; default oldest-due-first allocation (or explicit); updates invoice remaining + ledger `payment_credit`; makes T055 (create) + T058 pass
  - **Validation**: `cd backend && npm test -- payments.contract payment-allocation`
  - **Risk**: Over-allocation / float errors; use decimal + transaction.

- [ ] T066 [US3] Payment reversal `POST /api/v1/payments/{paymentId}/reverse` (super_admin only) in `backend/src/payments/`
  - **Dependencies**: T065, T059
  - **Area/Files**: `backend/src/payments/payment-reverse.command.ts`
  - **Acceptance**: Super-admin guard (else 403); mandatory reason; appends `payment_reversal` ledger entry + audit; recomputes balance; makes T055 (reverse) + T059 pass
  - **Validation**: `cd backend && npm test -- payments.contract payment-reversal`
  - **Risk**: Role check must be server-side, not UI-only.

- [ ] T067 [US3] Ledger service + `GET /api/v1/customers/{customerId}/statement` in `backend/src/payments/ledger/`
  - **Dependencies**: T065, T060, T019
  - **Area/Files**: `backend/src/payments/ledger/ledger.service.ts`, `statement.controller.ts`
  - **Acceptance**: Append-only ledger; statement returns opening/closing + entries with running balance from `customer_statement_view`; makes T056 + T060 pass
  - **Validation**: `cd backend && npm test -- statement.contract ledger-balance`
  - **Risk**: Running balance must be deterministic per entry order.

- [ ] T068 [US3] FE-040 Invoices API migration + state machine in `Frontend/src/components/billing/`
  - **Dependencies**: T062, T063, T064, T022
  - **Area/Files**: `Frontend/src/components/billing/InvoicesPage.tsx`, `InvoiceDetailPage.tsx`
  - **Acceptance**: List/detail from API; draft/review/issue/cancel lifecycle enforced; invalid transitions blocked; issue/cancel confirm + idempotent
  - **Validation**: `cd Frontend && graphify query "invoices lifecycle state machine API migration" && bun run lint && bun run build && bun run test:smoke`
  - **Risk**: Immutable issued invoice must be read-only in UI; hide edit affordances.

- [ ] T069 [US3] FE-041 Payments allocation workflow in `Frontend/src/components/billing/PaymentsPage.tsx`
  - **Dependencies**: T065, T068
  - **Area/Files**: `Frontend/src/components/billing/PaymentsPage.tsx`
  - **Acceptance**: Partial + multi-invoice allocation with preview; no over-allocation; remaining balance updates after mutation
  - **Validation**: `cd Frontend && graphify query "payment allocation partial multi-invoice preview" && bun run lint && bun run build && bun run test:smoke`
  - **Risk**: Client allocation must match server oldest-due-first default to avoid surprise.

- [ ] T070 [US3] FE-042 Balances aging + collector tooling in `Frontend/src/components/billing/BalancesPage.tsx` (Phase 2 priority)
  - **Dependencies**: T067, T069
  - **Area/Files**: `Frontend/src/components/billing/BalancesPage.tsx`
  - **Acceptance**: Aging buckets + follow-up actions; aging filters + summary totals correct
  - **Validation**: `cd Frontend && graphify query "balances aging buckets collector tooling" && bun run lint && bun run build && bun run test:smoke`
  - **Risk**: Aging math vs ledger; derive from statement data, don't recompute client-side.

- [ ] T071 [US3] FE-043 Customer statements v1 in `Frontend/src/components/customers/CustomerDetailPage.tsx`
  - **Dependencies**: T067, T068, T069
  - **Area/Files**: `Frontend/src/components/customers/CustomerDetailPage.tsx` (statement tab/section)
  - **Acceptance**: Statement shows opening/charges/payments/adjustments/closing; CSV/PDF export actions wired (or async job links)
  - **Validation**: `cd Frontend && graphify query "customer statement running ledger export" && bun run lint && bun run build && bun run test:smoke`
  - **Risk**: Export hookup depends on report jobs (T073, Phase 6); use async job links if not ready.

- [ ] T071a [US3] Consumption view migration in `Frontend/src/components/billing/ConsumptionPage.tsx`
  - **Dependencies**: T047, T062, T022
  - **Area/Files**: `Frontend/src/components/billing/ConsumptionPage.tsx`
  - **Acceptance**: Migrate consumption view to API (per-meter/period consumption used for billing); preserve layout; loading/empty/error states
  - **Validation**: `cd Frontend && graphify query "consumption page API migration" && bun run lint && bun run build && bun run test:smoke`
  - **Risk**: Consumption shape must match readings/billing API; validate at hook boundary.

- [ ] T072 [US3] US3 frontend batch validation + graph refresh
  - **Dependencies**: T068–T071, T071a
  - **Area/Files**: `Frontend/`, `Frontend/graphify-out/`
  - **Acceptance**: Lint + build + smoke green (mock + API mode); graph refreshed
  - **Validation**: `cd Frontend && bun run lint && bun run build && bun run test:smoke && graphify update .`
  - **Risk**: Billing routes increase smoke surface; confirm deterministic runs.

**Checkpoint**: US3 independently testable; billing/payments/ledger live. Core MVP business outcome complete.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Reports/exports, action-level RBAC gating, stabilization (S5/S6), final contract reconciliation, quickstart validation, and constitution ratification before closeout.

### Backend cross-cutting

- [ ] T073 [P] Report export jobs `POST /api/v1/reports/exports` + `GET /api/v1/reports/exports/{jobId}` in `backend/src/reports/`
  - **Dependencies**: T018, T009
  - **Area/Files**: `backend/src/reports/reports.controller.ts`, `report-export.service.ts`, async worker
  - **Acceptance**: Async job lifecycle queued→running→completed/failed; CSV/XLSX/PDF; filterable dimensions (FR-017); statuses match `ReportJob` schema
  - **Validation**: `cd backend && npm test -- reports`
  - **Risk**: Long-running jobs block threads; offload to worker/queue per research Decision 9.

- [ ] T074 [P] Contract test report endpoints in `backend/test/contract/reports.contract.spec.ts`
  - **Dependencies**: T012, T073
  - **Area/Files**: `backend/test/contract/reports.contract.spec.ts`
  - **Acceptance**: Asserts `ReportExportRequest`/`ReportJob` schemas + `202`
  - **Validation**: `cd backend && npm test -- reports.contract`
  - **Risk**: Format enum mismatch; align with YAML.

- [ ] T075 [P] RBAC action-gating + audit coverage tests in `backend/test/integration/rbac-audit.spec.ts`
  - **Dependencies**: T009, T010
  - **Area/Files**: `backend/test/integration/rbac-audit.spec.ts`
  - **Acceptance**: Action-level permissions enforced per role/project scope; sensitive actions (assignment/billing/payment/reversal/tariff) all produce audit entries (FR-015/FR-016)
  - **Validation**: `cd backend && npm test -- rbac-audit`
  - **Risk**: Gaps in audit coverage are compliance risk; enumerate sensitive actions explicitly.

### Frontend stabilization (Graphify-first)

- [ ] T076 FE-050 Reports v2 with async exports in `Frontend/src/components/reports/ReportsPage.tsx`
  - **Dependencies**: T073, T022
  - **Area/Files**: `Frontend/src/components/reports/ReportsPage.tsx`
  - **Acceptance**: Report catalog + parameterized run; async export job tracking + downloads; CSV/XLSX/PDF status trackable; failed jobs show retries + reason
  - **Validation**: `cd Frontend && graphify query "reports v2 async export job tracking" && bun run lint && bun run build && bun run test:smoke`
  - **Risk**: Polling cadence; use React Query refetch interval, stop on terminal state.

- [ ] T077 FE-051 Action-level permission gating in `Frontend/src/lib/` + critical buttons
  - **Dependencies**: T009, T020
  - **Area/Files**: `Frontend/src/lib/navigation.ts` (extend), new `can(action, resource)` helper, critical action buttons across modules
  - **Acceptance**: Unauthorized actions hidden/disabled with reason tooltip; **existing nav permissions unchanged and compatible**
  - **Validation**: `cd Frontend && graphify query "action level permission gating can(action,resource)" && bun run lint && bun run build && bun run test:smoke`
  - **Risk**: Breaking existing role navigation; preserve `navigation.ts` behavior — extend, don't replace.

- [ ] T078 FE-052 Alerts → Tickets linkage in `Frontend/src/components/alerts/` + `tickets/` (OUT OF MVP SCOPE — no backing FR; Phase 2)
  - **Dependencies**: T077
  - **Area/Files**: `Frontend/src/components/alerts/AlertsPage.tsx`, `Frontend/src/components/tickets/TicketsPage.tsx`
  - **Acceptance**: Create/escalate ticket from alert; SLA indicators; linked entities visible both ways; escalation persists after refresh
  - **Validation**: `cd Frontend && graphify query "alerts to tickets linkage SLA escalation" && bun run lint && bun run build && bun run test:smoke`
  - **Risk**: No functional requirement in spec.md backs alerts/tickets — defer until a spec FR is added; not required for MVP closeout.

- [ ] T079 FE-060 Frontend contract + integration tests in CI in `Frontend/`
  - **Dependencies**: T035–T078
  - **Area/Files**: `Frontend/` test config + new contract/integration specs
  - **Acceptance**: Contract validation + integration tests for key flows run in CI; breaking response changes fail fast
  - **Validation**: `cd Frontend && graphify query "frontend contract integration tests CI" && bun run lint && bun run build && bun run test:smoke`
  - **Risk**: Test env wiring vs backend; mock at network boundary for determinism.

- [ ] T080 FE-061 E2E coverage expansion in `Frontend/scripts/smoke-all-pages.mjs` (+ E2E specs)
  - **Dependencies**: T079
  - **Area/Files**: `Frontend/scripts/smoke-all-pages.mjs`, new E2E journeys
  - **Acceptance**: Business-critical journeys covered — invoice issue, payment allocation, reading anomaly review, meter termination + SIM state change; CI green + deterministic
  - **Validation**: `cd Frontend && graphify query "e2e journeys invoice payment reading termination" && bun run test:smoke`
  - **Risk**: Flaky E2E; track and stabilize before sign-off.

- [ ] T081 FE-062 Observability + UX resilience in `Frontend/src/` (Phase 2 priority)
  - **Dependencies**: T079
  - **Area/Files**: error boundaries, user-safe error surfaces, tracing hooks
  - **Acceptance**: Runtime errors show recoverable states; correlation ID visible in support-facing error UI
  - **Validation**: `cd Frontend && graphify query "error boundaries correlation id resilience" && bun run lint && bun run build && bun run test:smoke`
  - **Risk**: Error boundary placement must not swallow actionable errors silently.

### Final validation + governance

- [ ] T082 Polish frontend batch validation + graph refresh
  - **Dependencies**: T076–T081
  - **Area/Files**: `Frontend/`, `Frontend/graphify-out/`
  - **Acceptance**: Lint + build + smoke green (mock + API mode); graph refreshed
  - **Validation**: `cd Frontend && bun run lint && bun run build && bun run test:smoke && graphify update .`
  - **Risk**: Final regression window; freeze scope after green.

- [ ] T083 Reconcile full backend contract suite against `meter-pulse-api.yaml`
  - **Dependencies**: T023–T024, T043–T044, T053–T056, T074
  - **Area/Files**: `backend/test/contract/*`, `specs/001-metering-billing-platform/contracts/meter-pulse-api.yaml`
  - **Acceptance**: Every contract operation has a passing test; served OpenAPI matches the YAML (no drift)
  - **Validation**: `cd backend && npm test -- test/contract`
  - **Risk**: Spec drift over the build; treat YAML as source of truth.

- [ ] T084 Run quickstart.md MVP acceptance validation end-to-end
  - **Dependencies**: T042, T052, T072, T082, T083
  - **Area/Files**: `specs/001-metering-billing-platform/quickstart.md` (checklist), running backend + frontend
  - **Acceptance**: All quickstart §6 checks pass — assignment conflict, SIM reuse, reading validation/approval, separate utility invoices, invoice immutability, oldest-due-first allocation, ledger correctness, super-admin reversal + audit
  - **Validation**: `cd backend && npm test` and `cd Frontend && bun run test:smoke` (both green) + manual quickstart walkthrough
  - **Risk**: Cross-component integration gaps surface late here; budget fix time.

- [ ] T084a Backup/restore drill + RPO/RTO verification in `backend/` ops
  - **Dependencies**: T002, T005, T084
  - **Area/Files**: `backend/ops/backup-restore.md`, `backend/ops/scripts/backup.sh`, `backend/ops/scripts/restore.sh`
  - **Acceptance**: Documented + executed drill demonstrates PostgreSQL backup cadence ≤15 min (RPO) and restore within ≤2h (RTO); availability/operational target captured (SC-006)
  - **Validation**: `cd backend && bash ops/scripts/backup.sh && bash ops/scripts/restore.sh` against a scratch DB; record timings
  - **Risk**: Restore time grows with data volume; drill on representative dataset, not empty DB.

- [ ] T085 Ratify project constitution before implementation closeout in `.specify/memory/constitution.md`
  - **Dependencies**: T084, T084a
  - **Area/Files**: `.specify/memory/constitution.md`, plan.md Task-Generation Readiness Checklist (final unchecked item)
  - **Acceptance**: Constitution replaces template placeholders with ratified principles + quality gates (Spec Clarification, Frontend Preservation, Testability/Auditability); plan checklist item checked
  - **Validation**: `grep -L "PLACEHOLDER\|\[.*\]" .specify/memory/constitution.md && echo "ratified"`
  - **Risk**: Closing out without ratification violates plan Gate 4 / Complexity Tracking; must complete before declaring the feature done.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: no dependencies — start immediately.
- **Foundational (Phase 2)**: depends on Setup — **BLOCKS all user stories**.
- **US1 (Phase 3)**: depends on Foundational. MVP target.
- **US2 (Phase 4)**: depends on Foundational; logically follows US1 (readings reference assigned meters) but backend is independently testable.
- **US3 (Phase 5)**: depends on Foundational + billable readings from US2 for full generation; tests/impl are independently runnable with fixtures.
- **Polish (Phase 6)**: depends on US1–US3 for full coverage; reports/RBAC backend can start once Foundational is done.

### User Story Dependencies

- **US1 (P1)**: independent after Foundational.
- **US2 (P2)**: independent after Foundational (uses US1 meters in real flows; fixturable in tests).
- **US3 (P3)**: independent after Foundational (consumes US2 readings + US1 customers in real flows; fixturable in tests).

### Within Each Story

- Contract + integration tests written first and FAIL before implementation.
- Migrations/models → services → command endpoints → frontend migration → batch validation.
- Backend endpoint must exist before its corresponding `FE-*` migration task.

---

## Parallel Opportunities

- **Setup**: T003, T004, T005 in parallel after T001/T002.
- **Foundational**: backend infra (T006, T007, T010) parallel; migrations T013/T016/T018 parallel (different files); T014→T015/T017→T019 ordered by FK; frontend foundation T020→{T021,T022}.
- **US1 tests**: T023, T024, T025, T026 in parallel.
- **US1 backend models**: T027, T028, T029, T030, T031 in parallel; commands T032/T033 sequential.
- **US2 water/polling**: T047a (polling adapter) and T048a (water variance) build on T047; T051a (water-balance UI) follows T048a.
- **US3 tests**: T053–T060 all parallel.
- **US3 water billing**: T062a (billable water-difference line) depends on T062 + T048a + project config T027.
- Across stories: once Foundational is done, separate developers can take US1 / US2 / US3 backend tracks in parallel; each frontend batch is serialized behind its backend endpoints.

### Parallel Example: User Story 1

```bash
# Tests first (parallel):
T023 Contract test assignMeter
T024 Contract test terminateMeter + getSimEligibility
T025 Integration test assignment conflict
T026 Integration test SIM reuse

# Then models (parallel):
T027 Projects  T028 Locations  T029 Customers  T030 Meters  T031 SIM
```

---

## Implementation Strategy

### MVP First (US1)

1. Phase 1 Setup → 2. Phase 2 Foundational (CRITICAL) → 3. Phase 3 US1 → **STOP & VALIDATE** (T042) → demo assignment + SIM reuse.

### Incremental Delivery

1. Setup + Foundational → foundation ready.
2. US1 → validate (T042) → demo (MVP).
3. US2 → validate (T052) → demo.
4. US3 → validate (T072) → demo (core business outcome).
5. Polish → T082–T085 → ratify constitution → closeout.

### Frontend rule (every batch)

`graphify query` first → implement behind feature flag (mock fallback preserved) → keep loading/empty/error/success UX → `bun run lint && bun run build && bun run test:smoke` → `graphify update .`.

---

## Notes

- **[P]** = different files, no incomplete dependencies.
- Backend validation commands assume `npm` scripts in `backend/`; adjust if a different runner is configured in T001.
- Frontend commands use `bun` per `Frontend/FRONTEND_BUILD.md` (`lint`, `build`, `test:smoke`).
- `meter-pulse-api.yaml` is the contract source of truth; resolve any served-spec drift in T083.
- Constitution ratification (T085) is the final gate per plan Gate 4 — the feature is not "done" until it passes.
