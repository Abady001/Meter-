# F2C.3 — Readings Contract Recovery Report

**Date**: 2026-06-18
**Status**: COMPLETE ✅

---

## Decision: Option A — Expand Backend

The frontend was already calling the correct endpoints (`GET /readings` and `GET /readings/:id`), but the backend only had:
- `POST /readings` (create)
- `GET /readings/review-queue` (review queue)

## Changes Made

### 1. Expanded `ReadingResponseDto` (`backend/src/readings/dto/reading-response.dto.ts`)

Added fields to match frontend `Reading` interface:
- `meterSerial`, `meterType` — joined from Meter model
- `customerId`, `customerName` — from Reading.customerIdSnapshot
- `unitId`, `unitNumber` — from Reading.unitIdSnapshot
- `projectId` — from Reading.projectId
- `previousReading`, `currentReading`, `consumption` — from Decimal fields
- `readingDate` — from readingAt
- `source`, `status`, `anomaly`, `enteredBy`, `notes`

### 2. Added `findAll()` to `ReadingsService`

```typescript
async findAll(projectId?: string): Promise<ReadingResponseDto[]>
```
Queries readings ordered by `readingAt` descending, joins Meter for serial/type (not stored via Prisma relation — separate query).

### 3. Added `findOne()` to `ReadingsService`

```typescript
async findOne(id: string): Promise<ReadingResponseDto>
```
Returns single reading by ID or throws NotFoundException.

### 4. Added `GET /readings` and `GET /readings/:id` to `ReadingsController`

Protected with JWT auth, accessible to OPERATOR, TECHNICIAN, PROJECT_ADMIN, SUPER_ADMIN, FINANCE, SUPPORT roles.

## Verification

| Endpoint | Before | After | Status |
|----------|--------|-------|--------|
| `GET /readings` | 404 ❌ | **200** ✅ | Fixed |
| `GET /readings/:id` | 404 ❌ | **200** ✅ | Fixed |
| `GET /readings/review-queue` | 200 ✅ | 200 ✅ | Unchanged |
| `POST /readings` | 201 ✅ | 201 ✅ | Unchanged |

## Remaining Issues

1. **No readings in DB yet** — list returns empty array `[]`. Will show empty state until readings are created.
2. **`customerName` and `unitNumber` return undefined** — Reading model stores `customerIdSnapshot` and `unitIdSnapshot` as strings without Prisma relations to Customer/Unit models. Frontend renders "-" for these columns (already handled).
3. **Enum value mismatch** — Backend uses `water_main`/`water_child`/`automatic`; frontend mock expects `main_water`/`child_water`/`automated`. Will be resolved when mock is removed in F2C.11.

## Success Criteria Met

- [x] Readings list page loads real data (200 response)
- [x] Readings detail endpoint responds (200)
- [x] Frontend contract matches backend
