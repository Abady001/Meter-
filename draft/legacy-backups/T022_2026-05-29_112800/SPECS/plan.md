# Implementation Plan: Utility Metering and Billing Platform MVP

**Branch**: `[001-metering-billing-platform]` | **Date**: 2026-05-25 | **Spec**: `specs/001-metering-billing-platform/spec.md`

**Input**: Feature specification from `/specs/001-metering-billing-platform/spec.md`

## Summary

Deliver the MVP as a backend-first integration program on top of the existing frontend.
The frontend is already production-shaped and MUST be incrementally hardened rather than
rebuilt. Implementation prioritizes robust NestJS + PostgreSQL contracts for meters,
SIM lifecycle, readings, billing, payments, ledger, RBAC, audit trails, and reports;
then migrates frontend modules sprint-by-sprint from mock mode to API mode using the
existing backlog and Graphify-first execution for every frontend ticket.

## Technical Context

**Language/Version**:
- Backend: TypeScript (Node 20+, NestJS)
- Frontend: Next.js 16 + React 19 + TypeScript

**Primary Dependencies**:
- Backend: NestJS modules (`@nestjs/common`, `@nestjs/config`, `@nestjs/jwt`,
  `@nestjs/passport`), backend validation via `class-validator`, ORM Prisma
  (finalized in research Decision 13)
- Frontend (existing): Tailwind v4, shadcn/ui, Zustand, React Query pattern

**Storage**:
- PostgreSQL (`Meter_Verse_pulse` DB, `sim_system` schema target)
- Object storage optional for async report export artifacts

**Testing**:
- Backend: unit + integration + API contract tests + migration verification tests
- Frontend: existing `lint`, `build`, `test:smoke` plus API-mode regression tests
- E2E: critical user-journey tests for assignment, billing, payment, and reporting

**Target Platform**:
- Linux containerized deployment (backend API + database + existing Next.js app)

**Project Type**:
- Web application with existing frontend and new backend service integration

**Performance Goals**:
- Monthly service availability >= 99.9%
- RPO <= 15 minutes, RTO <= 2 hours
- P95 API latency targets:
  - CRUD/list endpoints <= 400ms
  - Billing/ledger command endpoints <= 700ms
  - Report job creation <= 2s

**Constraints**:
- Do not rebuild frontend shell, routes, or design system
- Keep role-based navigation behavior intact
- Preserve mock fallback behind feature flags during migration
- Enforce invoice immutability, oldest-due-first allocation, super-admin reversal rule
- Every frontend implementation task MUST call/use Graphify before dependency analysis
  or file-change sequencing

**Scale/Scope**:
- MVP scope from spec FR-001..FR-019
- Multi-project operations, high-volume meter readings, monthly billing cycles,
  exportable operational and financial reports

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Gate 1 - **Spec Clarification Completeness**: PASS
  - No unresolved clarification markers; core billing and governance decisions locked.
- Gate 2 - **Existing Frontend Preservation**: PASS
  - Plan explicitly uses incremental API migration and forbids rebuild.
- Gate 3 - **Testability and Auditability**: PASS
  - Contract testing, ledger verification, and audit-log validations included.
- Gate 4 - **Constitution Availability**: CONDITIONAL PASS
  - `.specify/memory/constitution.md` is still template-only placeholders;
    project proceeds under feature-spec governance for this cycle and must
    ratify constitution before implementation closure.

Post-Design Re-check: PASS (planned artifacts cover data model, contracts,
quickstart validation workflow, and governance-sensitive rules).

## Architecture Plan

1. **Backend architecture**: NestJS modular monolith with clear bounded contexts:
   Auth/RBAC, Projects/Locations, Customers, Meters/SIM, Readings, Billing,
   Payments/Ledger, Reports/Exports, Alerts, Audit.
2. **Data access**: PostgreSQL with transactional commands for assignment,
   invoice issue, payment allocation, and reversal to guarantee consistency.
3. **Domain enforcement**:
   - One active meter assignment per meter
   - One active SIM assignment per SIM
   - Termination transitions SIM to reusable lifecycle state
   - Immutable issued invoices; corrections via adjustments only
4. **Integration style**: REST + JSON APIs versioned under `/api/v1`, with idempotency
   keys for mutation endpoints and correlation IDs for traceability.
5. **Frontend integration**: existing pages migrate module-by-module via backlog,
   keeping UX intact while replacing mock calls with typed API hooks.

## Data Model Plan

- Canonical entities: Project, Location, Unit, Customer, Meter, SIMCard,
  MeterAssignment, SIMAssignment, Reading, ReadingReview, Tariff,
  BillingPeriod, Invoice, InvoiceLine, InvoiceAdjustment, Payment,
  PaymentAllocation, CustomerLedgerEntry, AuditLog, ReportJob.
- High-risk invariants:
  - Unique meter serial and SIM ICCID
  - Active-assignment uniqueness constraints
  - Ledger append-only writes with deterministic running balance
  - Reversal permissions constrained to super_admin
- See detailed schema and lifecycle in `specs/001-metering-billing-platform/data-model.md`.

## API Contract Plan

- Contracts in `specs/001-metering-billing-platform/contracts/meter-verse-api.yaml`.
- Contract groups:
  - Meter/SIM assignment and lifecycle commands
  - Reading ingest/validation/review
  - Invoice generation/approval/issue with utility split
  - Payment allocation and reversal
  - Customer statement and report export jobs
  - RBAC and audit-query support
- Error envelope standardization:
  - `code`, `message`, `details`, `correlationId`

## Frontend Integration Plan

1. Follow `Frontend/FRONTEND_SPRINT_BACKLOG.md` ordering (Sprint 0 -> Sprint 6).
2. Keep module routes/components unchanged unless required for API state handling.
3. For each frontend ticket:
   - Call/use Graphify first to inspect dependencies and affected files.
   - Implement API-mode changes behind feature flags where needed.
   - Preserve existing loading/empty/error/success UX standards.
4. Backend rollout order must support frontend migration milestones:
   - S1: projects/locations/customers/dashboard summaries
   - S2: meters/SIM/assignment/termination/reuse
   - S3: readings and anomaly queue
   - S4: invoices/payments/statements/ledger
   - S5: reports/exports/RBAC action gating

## Testing Plan

- **Contract tests**: validate all API schemas, status codes, and domain errors
  against `contracts/meter-verse-api.yaml`.
- **Domain integration tests**:
  - Assignment conflict detection
  - SIM reuse after termination
  - Reading validation thresholds per project
  - Invoice immutability and adjustment flow
  - Oldest-due-first payment allocation
  - Super-admin-only reversal
  - Running ledger correctness across charge/payment/reversal sequences
- **Frontend regression tests**:
  - Existing smoke route traversal stays green in both mock and API mode
  - Role-based UI and action gating behavior remains intact
- **Operational tests**:
  - Backup/restore drill for RPO/RTO objectives
  - Report export job lifecycle and failure recovery

## Risks

- Constitution remains unratified template; mitigation: ratify constitution before
  implementation closeout and align quality gates.
- Data migration from existing `sim_system` semantics could produce mapping gaps;
  mitigation: early schema-mapping rehearsal and reconciliation reports.
- Automatic polling in MVP introduces protocol and reliability complexity;
  mitigation: adapter abstraction + feature toggle + retry/idempotency controls.
- Ledger and invoice immutability defects are financially critical;
  mitigation: transaction boundaries, append-only ledger strategy, test oracle fixtures.
- Frontend-backend mismatch risk during migration;
  mitigation: Graphify-first ticket planning + typed contracts + staged flags.

## Task-Generation Readiness Checklist

- [x] Technical context fully specified with no open clarification markers
- [x] Architecture choices aligned with existing frontend-first constraints
- [x] Data model entities and invariants defined
- [x] API contract surface for MVP modules defined
- [x] Frontend integration milestones mapped to existing sprint backlog
- [x] Testing strategy covers unit, integration, contract, e2e, and operations
- [x] High-risk governance and financial controls captured as testable rules
- [ ] Constitution ratification completed (required before implementation completion)

## Project Structure

### Documentation (this feature)

```text
specs/001-metering-billing-platform/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── meter-verse-api.yaml
└── tasks.md
```

### Source Code (repository root)

```text
Frontend/                       # Existing Next.js app (must be preserved)
├── src/
│   ├── components/
│   ├── lib/
│   ├── hooks/
│   └── app/
├── FRONTEND_BUILD.md
├── FRONTEND_SPRINT_BACKLOG.md
└── graphify-out/

backend/                        # New/expanded NestJS backend service
├── src/
│   ├── auth/
│   ├── projects/
│   ├── customers/
│   ├── meters/
│   ├── sim-cards/
│   ├── readings/
│   ├── billing/
│   ├── payments/
│   ├── reports/
│   ├── audit/
│   └── common/
├── prisma/
└── test/
```

**Structure Decision**: Use a web-application split with the existing frontend in
`Frontend/` and a backend service in `backend/`. All frontend work is incremental,
Graphify-first, and aligned with the backlog; no frontend rebuild is allowed.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Constitution file still template placeholders | Planning cannot block delivery prep | Waiting would stall API/data contract design despite complete feature spec clarifications |
