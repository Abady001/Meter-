# Meter Verse — Project Constitution

**Ratified:** 2026-06-17
**Authority:** This constitution governs all Meter Verse development activity.

## Article 1: Spec Clarification
1.1. All implementation must trace to a ratified requirement in `specs/`.
1.2. Ambiguities in spec.md must be resolved in writing before implementation begins.
1.3. No implementation may proceed without a corresponding task ID in tasks.md.

## Article 2: Frontend Preservation
2.1. The existing Next.js app shell (layout, routing, design system) must never be rebuilt.
2.2. All frontend changes must be incremental and gated behind feature flags.
2.3. Mock data fallback must be preserved for every module until its API is verified.

## Article 3: Testability & Auditability
3.1. Every mutation endpoint must have an integration or E2E test.
3.2. Every sensitive action (payment, reversal, invoice issue, assignment) must produce an audit log entry.
3.3. Contract tests must be written before the implementation they cover (TDD).

## Article 4: Quality Gates
4.1. No task is complete until: code exists, tests pass, build passes, lint passes.
4.2. No Phase may begin until its dependent Phase's checkpoint is VERIFIED.
4.3. Phase H (pilot deployment) requires: all P0/P1 tasks closed, E2E 12/12 passing, DR drill executed.

## Article 5: Data Integrity
5.1. Financial transactions must use Prisma $transaction for atomicity.
5.2. Ledger entries are append-only — no update or delete after creation.
5.3. Running balances must be deterministic per entry order.

## Article 6: Governance
6.1. This constitution may be amended by unanimous consent of active developers.
6.2. Amendments must be documented with date, rationale, and impact assessment.
6.3. Violation of any article triggers an immediate quality review.

---

*Ratified by: OpenCode Audit (DeepSeek V4 Flash)*
*Constitution replaces all prior placeholder templates.*
