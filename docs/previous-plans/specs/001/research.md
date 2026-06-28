# Research: Utility Metering and Billing Platform MVP

## Decision 1: Backend service architecture

- Decision: Use a NestJS modular monolith for MVP.
- Rationale: The domain has strong transactional coupling (assignment, billing,
  payment, ledger, audit). A modular monolith reduces distributed consistency risk
  while keeping clear bounded contexts.
- Alternatives considered:
  - Microservices from day one: rejected due to orchestration and consistency overhead.
  - Serverless functions per module: rejected due to transaction complexity.

## Decision 2: API style and versioning

- Decision: REST JSON API under `/api/v1` with explicit command-style endpoints
  for lifecycle actions (assign, terminate, issue, reverse, export).
- Rationale: Works well with existing frontend migration pattern and provides
  stable contracts for React Query hooks.
- Alternatives considered:
  - GraphQL: rejected for MVP due to higher schema/runtime complexity.
  - RPC-only internal APIs: rejected for weaker external contract clarity.

## Decision 3: Data persistence and transaction boundaries

- Decision: PostgreSQL as system of record with strict transactions for
  assignment changes, invoice issuance, payment allocation, and reversals.
- Rationale: Financial integrity and ledger correctness require ACID guarantees.
- Alternatives considered:
  - Eventually consistent event-sourced first release: rejected for MVP speed/risk.
  - NoSQL primary store: rejected due to reporting/relational constraints.

## Decision 4: Meter and SIM assignment invariants

- Decision: Enforce single active assignment using partial unique indexes and
  command-level conflict checks.
- Rationale: Prevents double-billing and communication ambiguity.
- Alternatives considered:
  - Application-only checks: rejected as race-prone.
  - Soft warnings only: rejected as financially unsafe.

## Decision 5: SIM reuse after meter termination

- Decision: Meter termination must atomically end SIM assignment and transition
  SIM to reusable lifecycle status (with optional cooldown metadata).
- Rationale: Matches business rules and keeps SIM inventory reusable.
- Alternatives considered:
  - Manual post-termination SIM handling: rejected as error-prone.
  - Permanent SIM retirement on termination: rejected due to waste and PRD mismatch.

## Decision 6: Reading ingestion and validation model

- Decision: MVP supports manual entry, file import, and automatic polling;
  all flows normalize into one reading pipeline with status transitions.
- Rationale: Meets clarified MVP scope and keeps validation rules centralized.
- Alternatives considered:
  - Manual-only MVP: rejected by clarified requirement.
  - Separate rule engines per source: rejected due to inconsistency risk.

## Decision 7: Billing and invoice lifecycle

- Decision: Generate separate invoices per utility type per billing period,
  keep issued invoices immutable, and route corrections via adjustment documents.
- Rationale: Improves auditability and prevents hidden post-issue edits.
- Alternatives considered:
  - Combined utility invoices: rejected by clarified decision.
  - Editable issued invoices: rejected by financial-control rules.

## Decision 8: Payment allocation and reversal

- Decision: Default allocation is oldest-due-first unless explicit user mapping;
  reversals are super-admin-only with mandatory reason audit.
- Rationale: Predictable receivables behavior and strict fraud/error control.
- Alternatives considered:
  - Balance-only posting: rejected due to weaker invoice reconciliation.
  - Finance-level reversal: rejected by clarified governance.

## Decision 9: Reporting and exports

- Decision: Introduce async report export jobs (CSV/XLSX/PDF) with status tracking.
- Rationale: Large report generation should not block request threads and must be
  observable/retryable.
- Alternatives considered:
  - Synchronous report exports: rejected for timeout risk.
  - CSV-only MVP: rejected because spec includes PDF/XLSX contracts.

## Decision 10: Frontend integration strategy

- Decision: Keep existing `Frontend/` app intact and migrate by backlog sequence;
  every frontend task must use Graphify before dependency analysis or file changes.
- Rationale: Preserves a working UI baseline while reducing migration regressions.
- Alternatives considered:
  - Frontend rewrite: rejected explicitly by project constraints.
  - Ad hoc migration order: rejected for higher integration risk.

## Decision 11: RBAC and audit model

- Decision: Enforce both route-level and action-level permissions; record append-only
  audit events for sensitive business actions.
- Rationale: Spec requires strict role controls and traceability.
- Alternatives considered:
  - Navigation-only permissions: rejected as insufficient.
  - Sparse audit logging: rejected due to compliance and dispute risk.

## Decision 13: ORM and validation library selection

- Decision: Use Prisma as the ORM and `class-validator` for backend DTO validation.
- Rationale: Prisma migrations + typed client align with the typed-contract strategy and
  partial-unique-index requirements (raw SQL escape hatch available); `class-validator`
  integrates natively with NestJS pipes for request validation.
- Alternatives considered:
  - TypeORM: rejected for weaker migration ergonomics and partial-index handling.
  - zod-only backend validation: deferred to frontend; kept `class-validator` server-side
    for NestJS pipe integration.

## Decision 12: Reliability targets implementation

- Decision: Design operations for 99.9% monthly uptime, RPO <= 15m, RTO <= 2h.
- Rationale: Aligns with clarified spec success criteria and utility operational needs.
- Alternatives considered:
  - Lower SLA target: rejected for business-critical billing.
  - Higher HA target at MVP: deferred due to complexity and cost.
