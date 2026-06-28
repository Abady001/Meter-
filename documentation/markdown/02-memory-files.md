# Memory Files — Meter Verse

> All agent memory files: AGENTS.md, Speckit constitution, skills, OpenCode config, Graphify.
> Last updated: 2026-06-01 (RCA Sprint + CI fixes + T061-T065 implementation + 373/373 tests)

---

## Key Memory Files

| File | Purpose | Last Updated |
|------|---------|-------------|
| `AGENTS.md` | Agent session memory log | 2026-05-31 (Final Session) |
| `prompt-history_T009.md` | T009 implementation prompt | 2026-05-26 |
| `prompt-history_T012.md` | T012 contract harness prompt | 2026-05-28 |
| `.specify/memory/constitution.md` | Speckit constitution (template) | N/A |

---

## AGENTS.md Contents

### T009 — Implement Auth (JWT) + RBAC guard + role model

- **Story**: Foundational
- **Status**: Complete
- **What changed**: Created auth module with JWT strategy, RolesGuard, Roles decorator, role enum (7 roles), JWT payload interfaces, global validation pipe
- **Files**: `src/auth/*.ts`, `test/auth/*.ts`, `src/main.ts`, `src/app.module.ts`, `package.json`, `tsconfig.json`, `.eslintrc.cjs`, `.env`, `.env.example`
- **Validation**: 31 tests passing, tsc clean, eslint clean
- **Frontend roles verified**: super_admin, project_admin, operator, technician, finance, support, customer
- **Next task**: T010

---

### T010 — Implement Append-Only Audit Log

- **Story**: Foundational
- **Status**: Complete
- **What changed**: Created AuditLog model, AuditService (injectable, fail-safe), AuditInterceptor (global), AuditDecorator. Cherry-picked T006+T007.
- **Files**: `src/audit/*.ts`, `prisma/schema.prisma`, `src/app.module.ts`
- **Validation**: 69 tests passing, tsc clean, eslint clean
- **Next task**: T011

---

### T011 — Wire API Versioning + OpenAPI

- **Story**: Foundational
- **Status**: Complete
- **What changed**: Global prefix /api/v1, Swagger/OpenAPI setup with JWT bearer
- **Files**: `src/main.ts`, `src/common/openapi/openapi.setup.ts`
- **Validation**: 69 tests passing, /api/v1/health returns ok, /api/v1/docs returns 200
- **Next task**: T012

---

### T012 — Build Contract Test Harness

- **Story**: Foundational
- **Status**: Complete
- **What changed**: Created setup.ts (YAML loading, custom $ref deref, AJV validation, supertest app factory), 8 contract tests, added GET /health to OpenAPI spec
- **Files**: `test/contract/setup.ts`, `test/contract/setup.spec.ts`, `specs/*/contracts/meter-verse-api.yaml`
- **Packages**: supertest, ajv, ajv-formats, js-yaml (@apidevtools/swagger-parser removed — ESM-only)
- **Validation**: 77 tests passing, build clean
- **Next task**: T013

---

### T013 — Migration: Project, LocationNode, Customer, CustomerUnitAssignment

- **Story**: Phase 2 (schema)
- **Status**: Complete
- **What changed**: Core org models in Prisma schema with enums, self-FK hierarchy, partial unique indexes, project config columns
- **Next task**: T014

---

### T014 — Migration: Meter, SIMCard, MeterAssignment, SIMAssignment

- **Story**: Phase 2 (schema)
- **Status**: Complete
- **What changed**: Meter/SIM models with unique serial_number/iccid, partial unique indexes via raw SQL WHERE end_at IS NULL
- **Next task**: T015

---

### T015 — Migration: Reading, ReadingReview, TariffPlan, BillingPeriod

- **Story**: Phase 2 (schema)
- **Status**: Complete
- **What changed**: Reading with unique (Meter_Verse_id, reading_at, source), jsonb defaults, DECIMAL(12,3)
- **Next task**: T016

---

### T016 — Migration: Invoice, InvoiceLine, InvoiceAdjustment

- **Story**: Phase 2 (schema)
- **Status**: Complete
- **What changed**: Invoice with unique invoice_number, utility_type/status enums, immutable_at, consistent DECIMAL(12,3)
- **Next task**: T017

---

### T017 — Migration: Payment, PaymentAllocation, CustomerLedgerEntry

- **Story**: Phase 2 (schema)
- **Status**: Complete
- **What changed**: Payment with unique payment_number, PaymentAllocation with order, CustomerLedgerEntry append-only with DB trigger trg_customer_ledger_append_only
- **Validation**: DB-level trigger verified — UPDATE/DELETE raise exception
- **Next task**: T018

---

### T018 — Migration: AuditLog index + ReportJob

- **Story**: Phase 2 (schema)
- **Status**: Complete
- **What changed**: AuditLog @@index([createdAt]), ReportJobStatus/ReportFormat enums, ReportJob model
- **Next task**: T019

---

### T019 — Migration: Derived Views

- **Story**: Phase 2 (schema)
- **Status**: Complete
- **What changed**: 3 views — Meter_Verse_assignment_active_view (7 cols), sim_assignment_active_view (6 cols), customer_statement_view (8 cols with debit/credit from amount_delta, running_balance)
- **Dependencies**: T014 (Meter_Verse_assignments, sim_assignments), T017 (customer_ledger_entries)
- **Risks**: Views break if source tables/columns renamed; document dependency chain
- **Next task**: T020

---

### Security Weaver Framework + Final Validation (2026-05-31)

- **Date**: 2026-05-31
- **Phase**: 1–5 Complete (Discovery → Gap Analysis → Roadmap → Implementation → Validation)
- **Standards**: OWASP ASVS v4.0.3, NIST CSF 2.0, NIST 800-53, CIS Controls v8, OWASP Top 10 2021
- **Security documents**:
  - `documentation/markdown/security-assessment.md` — Attack surface inventory, 27 gaps identified
  - `documentation/markdown/security-gap-analysis.md` — 5 Critical, 8 High, 7 Medium, 4 Low, 3 Info
  - `documentation/markdown/security-roadmap.md` — Phase A-D (Sprint 1-3 + Ongoing)
  - `documentation/markdown/security-validation-report.md` — Validation metrics
- **Phase A implemented**: Helmet, CORS, rate-limiting, eslint-plugin-security, 1MB body limit, dep-audit script
- **Security Audit Service**: Created `backend/src/audit/security-audit.service.ts` — logs auth, rate-limit, forbidden events to append-only audit log
- **Security Audit Tests**: 6 tests in `backend/test/audit/security-audit.service.spec.ts`
- **CI/CD**: `.github/workflows/ci.yml` (4 jobs: backend, frontend, security, secret-scan)
- **Container**: `backend/Dockerfile`, `Frontend/Dockerfile`, `.dockerignore`
- **Security controls before/after**: 6 → **15** active controls (+SecurityAuditService)
- **Comprehensive README**: Created at repo root `README.md`
- **Tests**: 316/316 ✅ (38 suites, +23 new: refresh tokens 9, password policy 8, endpoint access 6)
- **Test Agent Framework**: Created `test-agent/` with MANIFEST.md, run.sh, run.ps1, configs/ — all tools centralized locally
- **New tools installed**: Husky (pre-commit), lint-staged, TruffleHog (secret scanner), pino (structured logging)
- **Weaknesses fixed**: Refresh tokens, password policy + lockout, full-stack docker-compose, audit hash chain, CSRF guard, functional access tests, frontend .env.example, pre-commit hooks
- **Validation**: Build clean, ESLint 0 errors, Prettier ALL clean, Prisma valid, depcruise 0 violations

---

### T047/T048 — Readings Module + Review Queue + Billing Stubs + Restore Point

- **Date**: 2026-05-31
- **Status**: Complete
- **Tests**: 287/287 passing (34 suites) — up from 276/287
- **What changed**:
  - Fixed 7 reading-validation integration tests (UUID v4 format, auth helper, Prisma mocks)
  - Added `GET /readings/review-queue` (ReadingsController + ReadingsService)
  - Created BillingController stubs (POST /invoices/generate, /:id/issue, /:id/adjustments)
  - BillingModule registered in AppModule
  - Prisma P2002 → HttpException(422) handler in ReadingsService
  - ESLint: added `argsIgnorePattern: '^_'`
  - Contract tests: auth headers added to all HTTP calls, Prisma mocks for review-queue
- **Files created**: `src/billing/billing.controller.ts`, `src/billing/billing.module.ts`
- **Files modified**: reading-validation spec, reading-review-queue spec, invoice-* contract specs, readings controller+service, app.module.ts, .eslintrc.cjs, tasks.md
- **Safety tools created**: `backend/scripts/health-check.sh`, `backup-state.sh`, `alert.sh`, `test-sweep.sh`
- **Error code registry**: 10 codes (ERR-T048-001 through ERR-TEST-002)
- **Restore point**: `restore-point-20260531-094024/` with AI_HANDOFF.md manifest
- **Tooling**: depcruise ✅, typedoc ✅, spectral ⚠️ (Windows), playwright available (0 E2E tests)
- **Graphify**: AST extraction ✅ (366 files, 3105 nodes, 241K edges, 117 communities, only 5 isolated nodes), semantic ❌ (DeepSeek API 402 — insufficient balance)
- **Checkpoint report**: Updated with Security Weaver risk register, graphify metrics, full tooling status
- **Temp files cleaned**: graphify_update.py, restore_check.py, merge_graph.py removed
- **Next tasks**: Security Weaver Framework (Phase 1–5)

---

### RCA Sprint — Deep Scan Fixes + CI Workflow Fixes + T061-T065

- **Date**: 2026-06-01
- **Task**: RCA Sprint (deep scan fixes + CI workflow fixes)
- **Branch**: `feature/t055-payments-contract`
- **Commits**: `75f7b68`, `1f93b0d`, `a708827`, `3b18d30`, `4f1f4f0`, `ccbaa7a`, `95ea349`
- **Tests**: **373/373 passing** (47 suites)
- **CI**: All 5 jobs passing (backend, frontend, security, secret-scan, test-agent)
- **What changed**:
  - T061-T065: Tariff plan + Invoice generate/issue/adjust + Payment implementation
  - RCA deep scan fixes: depcruise, ESLint, Prettier, Husky, lockfile regen
  - CI workflow fixes: PostgreSQL service, Prisma migrate, .env creation, SBOM deps
  - Dependabot alerts: 17 resolved via npm overrides + dependabot.yml
  - Security: CodeQL workflow, OSV Scanner, njsscan, codespell, snyk, SECURITY.md
  - Test-agent workflow: 15+ tools on every push
- **RCA report**: `test-agent/reports/RCA-REPORT-20260601.md`
- **Restore point**: `restore-point-20260531-132118/` with AI_HANDOFF.md manifest
- **Next tasks**: T062a (Water difference billing policy), T066-T072 (US3 remaining), T073-T085 (Phase 6)



