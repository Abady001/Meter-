# Quickstart: Utility Metering and Billing MVP Plan Validation

This quickstart validates planning assumptions before `/speckit-tasks` and implementation.

## 1) Pre-flight

1. Confirm active feature files exist:
   - `specs/001-metering-billing-platform/spec.md`
   - `specs/001-metering-billing-platform/plan.md`
   - `specs/001-metering-billing-platform/research.md`
   - `specs/001-metering-billing-platform/data-model.md`
   - `specs/001-metering-billing-platform/contracts/meter-verse-api.yaml`
2. Confirm frontend baseline remains unchanged and healthy in `Frontend/`.

## 2) Frontend baseline verification

Run from `Frontend/`:

```bash
bun run lint
bun run build
bun run test:smoke
```

Expected result: all commands pass before API migration starts.

## 3) Graphify-first requirement for every frontend ticket

Before planning dependencies or file edits for any frontend ticket:

```bash
graphify query "<ticket objective>"
```

Optional relation checks for impacted modules:

```bash
graphify path "<source module>" "<target module>"
graphify explain "<concept>"
```

After each frontend implementation batch, refresh graph outputs:

```bash
graphify update .
```

## 4) Backend readiness checklist

Confirm implementation tasks include:

- NestJS modules aligned to plan bounded contexts
- PostgreSQL schema/migrations for all core entities
- Contract tests for every endpoint in `meter-verse-api.yaml`
- Transactional safeguards for:
  - meter/SIM assignment uniqueness
  - SIM reuse after termination
  - immutable issued invoices
  - oldest-due-first payment allocation
  - super-admin-only payment reversals

## 5) Integration milestones (frontend backlog alignment)

Use `Frontend/FRONTEND_SPRINT_BACKLOG.md` as source order:

1. Sprint 0: API client + query pattern + feature flags
2. Sprint 1: Projects/Locations/Customers/Dashboard APIs
3. Sprint 2: Meters/SIM/Assignments/Termination flows
4. Sprint 3: Readings + anomaly review queue
5. Sprint 4: Invoices/Payments/Statements
6. Sprint 5: Reports/Exports + permission gates
7. Sprint 6: Hardening and expanded coverage

## 6) MVP acceptance validation focus

At minimum, run end-to-end checks for:

- Meter assignment conflict handling
- SIM release and reuse eligibility after meter termination
- Reading validation states and approval workflow
- Separate invoices per utility type
- Invoice immutability with adjustment-only corrections
- Oldest-due-first payment allocation behavior
- Running customer ledger correctness
- Super-admin-only reversal authorization and audit logs

## 7) Exit criteria before `/speckit-tasks`

- Plan artifacts are complete and internally consistent
- No unresolved functional ambiguities remain in `spec.md`
- Contract surface is sufficient for task decomposition
- Frontend migration sequencing is aligned with existing backlog
