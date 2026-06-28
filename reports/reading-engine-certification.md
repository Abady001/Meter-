# Phase 9 — Reading Engine Certification Report

**Date:** 2026-06-25  
**Source files:** `backend/src/readings/` (6 files), `backend/prisma/schema.prisma`

---

## 1. Reading Operations

| Operation | Endpoint | Status | Details |
|-----------|----------|--------|---------|
| **Create** | `POST /readings` | ✅ FULL | Accepts `meterId`, `projectId`, `readingValue`, `readingAt`, `source`. Auto-calculates consumption from previous reading. Duplicate detection via `@@unique([meterId, readingAt, source])` → P2002 → 422 |
| **List** | `GET /readings` | ✅ FULL | Optional `projectId` filter, ordered by `readingAt DESC`, limited to 500 |
| **Get by ID** | `GET /readings/:id` | ✅ FULL | Returns single reading with meter serial and type |
| **Update** | `PATCH /readings/:id` | ✅ FULL | Updates `currentReading` and `notes` |
| **Delete** | `DELETE /readings/:id` | ✅ FULL | Cascading delete of reading reviews, then reading |
| **Review queue** | `GET /readings/review-queue` | ✅ FULL | Lists readings with `pending_review` or `suspicious` status |
| **Approve** | `POST /readings/:id/approve` | ✅ FULL | Sets status to `valid`, creates `ReadingReview` with action `approve` |
| **Reject** | `POST /readings/:id/reject` | ✅ FULL | Sets status to `rejected`, creates `ReadingReview` with action `reject`. Requires reason. |
| **Correct** | — | ❌ MISSING | `ReviewAction` enum has `correct` value but no endpoint implements it |

## 2. Reading Continuity Validation

**YES — validated at creation time:**

- `readings.service.ts:90-101`: Fetches most recent previous reading for the meter, calculates `consumptionValue = currentReading - previousReadingValue`
- If consumption is negative → status = `suspicious` (if `alertOnNegativeConsumption` is enabled)
- If consumption is zero → status = `pending_review` (if `alertOnZeroConsumption` is enabled)
- If consumption exceeds `maxConsumptionPerMonth` → status = `pending_review`
- Spike detection via average of last 5 readings × `spikeMultiplier` → status = `suspicious`

## 3. Installation Date Rules

**NOT enforced** — The reading engine does not validate:

- Whether a meter's `installationDate` has passed before accepting readings
- Whether readings fall within a meter's active assignment period (no join to `MeterAssignment`)
- Whether the meter status allows readings (e.g., creating readings for `retired`/`terminated` meters is not blocked)

The `CreateReadingDto` requires a `meterId` and `projectId` but does **not** check meter lifecycle state.

## 4. Additional Observations

| Feature | Status | Notes |
|---------|--------|-------|
| DTO validation | ✅ FULL | `CreateReadingDto` with `@IsUUID`, `@IsNumber`, `@IsDateString`, `@IsEnum` |
| Source tracking | ✅ FULL | `manual`, `import`, `automatic` sources |
| Raw payload capture | ✅ FULL | Optional `rawPayload` JSON field for AMI data |
| Polling/adapter module | ✅ EXISTS | `polling/` directory with `poller.service.ts`, `adapter.interface.ts`, `polling.scheduler.ts` — but not analyzed |
| Water balance module | ✅ EXISTS | Operational water balance calculations |
| Notifications on reading | ✅ FULL | Creates notification on create/approve/reject |
| Audit trail | ✅ FULL | `@Audit('reading', 'create/update/delete/approve/reject')` |

## 5. Certification Level

| Criterion | Score |
|-----------|-------|
| CRUD operations | ✅ 100% |
| Review workflow (approve/reject) | ✅ 100% |
| Correct action | ❌ 0% |
| Continuity validation | ✅ 100% |
| Spike detection | ✅ 100% |
| Threshold profiles | ✅ 100% |
| Installation date rules | ❌ 0% |
| Meter status gating | ❌ 0% |
| Duplicate prevention | ✅ 100% |
| API documentation (Swagger) | ✅ 100% |
| **Overall** | **~80%** |

## CERTIFICATION: **PARTIAL**

**Summary:** The reading engine is functionally complete for CRUD + review operations with smart validation (negative, zero, spike, high consumption thresholds). The review queue pipeline is operational. However, two critical production gaps exist: (1) "correct" action is defined in the enum but not implemented, and (2) no installation date or meter lifecycle gating is performed before accepting readings.

**To reach FULL:** Implement `POST /readings/:id/correct`, add meter lifecycle checks (installation date, active status), and validate that readings fall within assignment periods.
