# Reading Engine — Validation & Queue Design

**Date:** 2026-06-25

---

## 1. READING VALIDATION RULES

All validation is implemented in `backend/src/readings/readings.service.ts`. Readings are ingested via `createReading()` (`:89`) and optionally via the Poller Service (`backend/src/readings/polling/poller.service.ts`).

### Rule 1: Reading Before Installation Date — REJECT
**Status: ❌ NOT IMPLEMENTED**

There is no check comparing `readingAt` against the meter's `installationDate` (available on `Meter.installationDate` in the DB). A reading dated before the meter was installed will be accepted.

**Fix required:** Before line 90 in `readings.service.ts`, fetch the meter and validate:
```
if (readingAt < meter.installationDate) → throw BadRequestException
```

### Rule 2: Missing Previous Month — NO REJECT (Soft Warning)
**Status: ⚠️ PARTIAL**

`createReading()` fetches the most recent reading for the same meter (`findFirst` ordered by `readingAt desc` at line 90-93). If no previous reading exists, `previousReadingValue` is set to `null` and `consumptionValue` is `null` — the reading is accepted without flagging.

There is no calendar gap analysis (e.g., no reading in 30+ days). The system only detects absence of *any* prior reading, not absence of a *timely* prior reading.

### Rule 3: Duplicate Reading — REJECT
**Status: ✅ IMPLEMENTED**

The Prisma schema defines a unique composite key:
```prisma
@@unique([meterId, readingAt, source])
```

When a duplicate is inserted, Prisma throws error code `P2002`. The service catches this (`:167-174`) and returns:
```
HTTP 422 UNPROCESSABLE_ENTITY
"Duplicate reading: meterId + readingAt + source already exists"
```

This covers exact duplicates only. Near-duplicates (same meter, time within N minutes) are not detected.

### Rule 4: Negative Consumption — REJECT / SUSPICIOUS
**Status: ✅ IMPLEMENTED**

At lines 108-113:
```typescript
if (consumptionValue < 0 && profile.alertOnNegativeConsumption !== false) {
  status = 'suspicious';
  profileName = 'negative-consumption';
}
```

- Default threshold: `alertOnNegativeConsumption = true`
- Behavior: Sets `reading.status = 'suspicious'` (does NOT block insertion)
- The reading is still stored but flagged for review

### Rule 5: Cross-Project / Cross-Area — REJECT
**Status: ❌ NOT IMPLEMENTED**

The `CreateReadingDto` accepts `meterId` and `projectId` as separate UUIDs. There is no validation that:
- The meter belongs to the specified project
- The project belongs to the correct area
- The reading's `projectId` matches `meter.projectId`

**Fix required:** After meter lookup in `toDto()` (or in `createReading()`), verify `meter.projectId === dto.projectId`.

### Rule 6: Future Reading — REJECT
**Status: ❌ NOT IMPLEMENTED**

There is no check that `readingAt` is not in the future. `readingAt` is accepted as any valid date string and stored as-is.

**Fix required:** Before inserting, validate:
```
if (readingAt > new Date()) → throw BadRequestException
```

---

## 2. ADDITIONAL VALIDATION — Threshold Profile Checks

The system uses `ProjectThreshold` profiles (configured per project) for soft validation (`:103-147`):

| Check | Condition | Status Set | Threshold Config |
|---|---|---|---|
| **Zero consumption** | `consumption === 0` && `alertOnZeroConsumption === true` | `pending_review` | `project_thresholds.alert_on_zero_consumption` |
| **High consumption** | `consumption > maxConsumptionPerMonth` | `pending_review` | `project_thresholds.max_consumption_per_month` |
| **Spike detection** | `consumption > avg(5 prior readings) × spikeMultiplier` | `suspicious` | `project_thresholds.spike_multiplier` (default: 3.0) |

---

## 3. REVIEW QUEUE SYSTEM

**Endpoint:** `GET /readings/review-queue` (`:72-87`)

Returns all readings with status `pending_review` or `suspicious`:

```typescript
const where = { status: { in: ['pending_review', 'suspicious'] } };
```

Optional filters: `projectId`, `status`

**Status: ⚠️ Review actions (approve/reject/correct) are stubs only** — the `ReadingReview` model exists in the schema (`reading_reviews` table) but there is no endpoint to write review decisions.

### Reading Status Lifecycle

```
                    ┌─────────────┐
                    │    valid     │ ← Approved by review
                    └──────┬──────┘
                           │
      ┌────────────────────┼────────────────────┐
      ▼                    ▼                    ▼
┌──────────┐     ┌───────────────┐     ┌──────────────┐
│pending_  │     │  suspicious   │     │  estimated   │
│review    │     │ (negative,    │     │              │
│(zero,    │     │  spike)       │     │              │
│high)     │     └───────┬───────┘     └──────────────┘
└────┬─────┘             │                    │
     │                   │                    │
     └───────────────────┼────────────────────┘
                         ▼
                  ┌──────────────┐
                  │  corrected   │ ← Manual correction
                  └──────────────┘
                         │
                  ┌──────────────┐
                  │   rejected   │ ← Review rejection
                  └──────────────┘
```

---

## 4. QUEUES — Processing Pipeline

Based on the codebase analysis, the reading processing uses the following logical queues:

| Queue | Name | Purpose | Implementation |
|---|---|---|---|
| **Early** | `Ingestion` | Raw readings arriving from all sources | `POST /readings` (manual), `PollerService.pollMeter()` (automatic) |
| **Waiting** | `Pending Review` | Readings flagged for manual review | `findMany({ status: 'pending_review' })` — returned by `GET /readings/review-queue` |
| **Rejected** | `Rejected` | Readings that failed validation | Status `rejected` — only settable via review action (not yet implemented) |
| **Validated** | `Valid` | Clean readings ready for billing | Status `valid` — consumed by `BillingController.generateInvoices()` which filters `WHERE status = 'valid'` |

### Ingestion Sources

| Source | Method | Service |
|---|---|---|
| Manual entry | `POST /readings` (CreateReadingDto) | `ReadingsService.createReading()` |
| Automatic polling | `PollerService.pollMeter()` | `PollerService` → adapter pattern |
| Bulk import | Planned (via ReadingsController or import module) | Not implemented |

### Poller Architecture (`poller.service.ts`)

- Adapter pattern: `MeterAdapter` interface with `fetchReading(meterId, config)`
- Registered per meter type (electricity, water, etc.)
- Exponential backoff: `BASE_DELAY_MS × 2^(MAX_RETRIES - retriesLeft)` = 1s, 2s, 4s
- Max 3 retries per poll
- In-memory idempotency: `processedKeys` Set (up to 10,000 entries)

---

## 5. VALIDATION SUMMARY

| Rule | Status | Location | Notes |
|---|---|---|---|
| Reading before installation date | ❌ Missing | `readings.service.ts` | Needs `Meter.installationDate` check |
| Missing previous month | ⚠️ Partial | `readings.service.ts:90` | Detects absence of any prior reading, not gaps |
| Duplicate reading | ✅ Done | `readings.service.ts:167-174` + Prisma `@@unique([meterId, readingAt, source])` | Returns HTTP 422 |
| Negative consumption | ✅ Done | `readings.service.ts:108-113` | Sets status to `suspicious` |
| Cross-project/cross-area | ❌ Missing | `readings.service.ts` | No meter→project validation |
| Future reading date | ❌ Missing | `readings.service.ts` | No date-in-future check |
| Zero consumption flag | ✅ Done | `readings.service.ts:116-123` | Optional per project threshold |
| High consumption flag | ✅ Done | `readings.service.ts:125-134` | Per-project `maxConsumptionPerMonth` |
| Spike detection | ✅ Done | `readings.service.ts:136-147` | Avg of last 5 × multiplier |
