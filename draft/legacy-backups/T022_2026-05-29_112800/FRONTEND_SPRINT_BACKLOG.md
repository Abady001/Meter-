# Meter Verse Frontend Sprint Backlog

This backlog extends the existing frontend incrementally.

Constraints applied:

- Keep current stack (Next.js 16, React 19, TypeScript, Tailwind v4, shadcn/ui, Zustand)
- Keep current app shell and design system
- Keep all existing modules
- Build feature-by-feature with safe migration from mock data to backend APIs

---

## Sprint 0 - Foundations (1 week)

### FE-001: API client foundation

- Priority: MVP
- Estimate: 3 points
- Depends on: none
- Status: ✅ Complete (T020)
- Scope:
  - Add centralized API client and error normalization
  - Add typed request/response helpers
  - Add auth token attach + refresh handling hooks
- Acceptance criteria:
  - One shared API wrapper exists and is used by at least one module → `mock-auth.ts` imports `setToken`/`clearToken`
  - Error envelope is parsed consistently → `parseApiError()` matches T006 `ErrorEnvelope` contract
  - Correlation IDs logged in client error handler → `[API] ${code} (${status}) correlationId=${id}`
- Files: `src/lib/api/client.ts`, `src/lib/api/errors.ts`, `src/lib/api/auth.ts`, `src/lib/api/index.ts`

### FE-002: React Query integration pattern

- Priority: MVP
- Estimate: 2 points
- Depends on: FE-001
- Scope:
  - Introduce query/mutation hooks conventions
  - Add loading/error/empty UI standards
- Acceptance criteria:
  - Reusable hook pattern documented in code
  - At least one list + one detail page use server data hooks

### FE-003: Feature flag toggles for API migration

- Priority: MVP
- Estimate: 1 point
- Depends on: FE-001
- Scope:
  - Toggle between mock and API mode per module
- Acceptance criteria:
  - Project module can switch data source without UI regression

---

## Sprint 1 - Core Data Migration (1-2 weeks)

### FE-010: Projects + Locations API migration

- Priority: MVP
- Estimate: 5 points
- Depends on: FE-001, FE-002, FE-003
- Scope:
  - Migrate Projects list/detail and Locations list to API
  - Add server pagination/sort/filter
- Acceptance criteria:
  - No layout/design changes
  - Existing row-click interactions still work
  - Loading/empty/error states implemented

### FE-011: Customers API migration

- Priority: MVP
- Estimate: 5 points
- Depends on: FE-001, FE-002
- Scope:
  - Migrate Customers list/detail
  - Preserve existing tabs and table behavior
- Acceptance criteria:
  - Customer detail loads from API with page params
  - Filter/search remains functional

### FE-012: Dashboard KPI backend wiring

- Priority: MVP
- Estimate: 3 points
- Depends on: FE-001, FE-002
- Scope:
  - Replace mock KPIs/charts with backend summaries
  - Add date range and project scope filters
- Acceptance criteria:
  - Dashboard renders API data with graceful fallback states

---

## Sprint 2 - Metering Operations (2 weeks)

### FE-020: Meters + SIM cards API migration

- Priority: MVP
- Estimate: 5 points
- Depends on: FE-001, FE-002
- Scope:
  - Meters list/detail + SIM list API integration
- Acceptance criteria:
  - Existing table and detail views preserved
  - Client-side actions replaced with real mutations where available

### FE-021: Meter assignment workflow hardening

- Priority: MVP
- Estimate: 3 points
- Depends on: FE-020
- Scope:
  - Validation and guardrails for assign action
  - Conflict handling (already assigned/unavailable)
- Acceptance criteria:
  - Assign action is idempotent from UI perspective
  - User gets actionable validation messages

### FE-022: Meter replacement + termination workflow

- Priority: MVP
- Estimate: 5 points
- Depends on: FE-020
- Scope:
  - Add required reason/date/final reading fields
  - Add finalization flow and success/failure states
- Acceptance criteria:
  - Replace/Terminate forms enforce schema validation
  - Audit fields captured and sent in payload

### FE-023: SIM cooldown + reuse eligibility UI

- Priority: Phase 2
- Estimate: 3 points
- Depends on: FE-022
- Scope:
  - SIM lifecycle badges and cooldown indicators
  - Reuse eligibility checks before assignment
- Acceptance criteria:
  - Ineligible SIM cannot be assigned from UI
  - Eligibility reason is visible

---

## Sprint 3 - Readings and Validation (2 weeks)

### FE-030: Readings API migration

- Priority: MVP
- Estimate: 5 points
- Depends on: FE-001, FE-002
- Scope:
  - Integrate readings list/new reading with backend
- Acceptance criteria:
  - Existing list/new reading pages remain intact
  - Runtime errors remain zero in smoke route coverage

### FE-031: Reading schema and business validation

- Priority: MVP
- Estimate: 3 points
- Depends on: FE-030
- Scope:
  - Zod form schemas for new reading and correction
  - Duplicate and monotonic checks surfaced in UI
- Acceptance criteria:
  - Field and form errors map to backend responses
  - Prevent invalid submit states

### FE-032: Anomaly review queue

- Priority: MVP
- Estimate: 5 points
- Depends on: FE-030
- Scope:
  - Add review queue tab and approve/reject/correct actions
- Acceptance criteria:
  - Queue supports filters by anomaly type/severity/status
  - Reviewer actions update row state and activity trail

---

## Sprint 4 - Billing and Statements (2-3 weeks)

### FE-040: Invoices API migration + state machine

- Priority: MVP
- Estimate: 8 points
- Depends on: FE-001, FE-002
- Scope:
  - Integrate invoice list/detail
  - Enforce draft/review/issue/cancel lifecycle in UI
- Acceptance criteria:
  - Invalid transitions are blocked in UI
  - Issue/cancel actions confirm and show idempotent results

### FE-041: Payments allocation workflow

- Priority: MVP
- Estimate: 5 points
- Depends on: FE-040
- Scope:
  - Partial and multi-invoice payment allocation
  - Allocation validation and preview
- Acceptance criteria:
  - No over-allocation allowed
  - Remaining balance updates after mutation

### FE-042: Balances aging and collector tooling

- Priority: Phase 2
- Estimate: 3 points
- Depends on: FE-040, FE-041
- Scope:
  - Aging buckets and follow-up actions
- Acceptance criteria:
  - Aging filters and summary totals visible and correct

### FE-043: Customer statements v1

- Priority: MVP
- Estimate: 5 points
- Depends on: FE-040, FE-041
- Scope:
  - Add statement tab/section under customer detail
  - Running ledger + export actions
- Acceptance criteria:
  - Statement includes opening/charges/payments/adjustments/closing
  - CSV/PDF export endpoints wired (or async job links)

---

## Sprint 5 - Reports, Alerts, Support, Permissions (2 weeks)

### FE-050: Reports v2 with async exports

- Priority: MVP
- Estimate: 8 points
- Depends on: FE-001, FE-002
- Scope:
  - Report catalog and parameterized run
  - Async export job tracking + downloads
- Acceptance criteria:
  - CSV/XLSX/PDF export status is trackable in UI
  - Failed jobs show retries and reason

### FE-051: Action-level permission gating

- Priority: MVP
- Estimate: 5 points
- Depends on: FE-001
- Scope:
  - Add `can(action, resource)` checks for all critical buttons
- Acceptance criteria:
  - Unauthorized actions hidden/disabled with reason tooltip
  - Nav permissions remain unchanged and compatible

### FE-052: Alerts -> Tickets linkage

- Priority: Phase 2
- Estimate: 5 points
- Depends on: FE-051
- Scope:
  - Create/escalate ticket from alert
  - SLA state indicators on ticket rows
- Acceptance criteria:
  - Linked entities visible from both alert and ticket details
  - Escalation state persists after refresh

---

## Sprint 6 - Stabilization and Production Hardening (1-2 weeks)

### FE-060: Contract and integration tests

- Priority: MVP
- Estimate: 5 points
- Depends on: FE-010..FE-052
- Scope:
  - Add API contract validation and integration tests for key flows
- Acceptance criteria:
  - Contract test suite runs in CI
  - Breaking response changes fail fast

### FE-061: E2E coverage expansion

- Priority: MVP
- Estimate: 5 points
- Depends on: FE-060
- Scope:
  - Expand smoke into business-critical E2E journeys
    - invoice issue
    - payment allocation
    - reading anomaly review
    - meter termination + SIM state change
- Acceptance criteria:
  - CI green with deterministic runs
  - Flaky tests tracked and stabilized

### FE-062: Observability and UX resilience

- Priority: Phase 2
- Estimate: 3 points
- Depends on: FE-060
- Scope:
  - Add client-side error boundaries, user-safe error surfaces, tracing hooks
- Acceptance criteria:
  - Runtime errors show user-friendly recoverable states
  - Correlation ID visible in support-facing error UI

---

## API Contract Checklist (Frontend Needs)

- Auth/session: login, refresh, me, capabilities
- Projects/locations/customers/meters/sims: list/detail/update with pagination and filters
- Readings: create/bulk/validate/anomaly queue/review actions
- Billing: invoice transitions, payment allocation, adjustments, ledger, statements
- Reports: run report, export job status, download artifact
- Alerts/tickets: link/escalate/assign/SLA metadata

---

## Validation Checklist (Forms)

- Standardize all forms on react-hook-form + zod
- Add business rule validation:
  - reading monotonicity
  - date windows
  - status transition validity
  - SIM eligibility for assignment
- Map backend field errors to UI inline errors
- Prevent duplicate submissions and show pending state

---

## Definition of Done (Per Ticket)

- Lint passes
- Build passes
- Smoke passes
- New feature tests added where relevant
- No app shell rewrite
- No design system replacement
- Existing module behavior preserved unless explicitly changed by ticket scope

---

## Ready-to-Run Developer Prompt Template

Use this with each ticket:

"Implement **[TICKET-ID] [TICKET-NAME]** in the existing Meter Verse frontend.
Constraints: keep current stack, keep current app shell, keep current design system, do not remove existing modules.
Scope: [paste scope].
Acceptance criteria: [paste acceptance criteria].
Validation: run lint, build, smoke test and report changed files + risks."
