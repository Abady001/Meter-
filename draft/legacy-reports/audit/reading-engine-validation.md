# Reading Engine Validation Audit

## Files Examined

| Layer | File | Path |
|-------|------|------|
| **Backend Controller** | eadings.controller.ts | D:\meter\Meter\backend\src\readings\readings.controller.ts |
| **Backend Service** | eadings.service.ts | D:\meter\Meter\backend\src\readings\readings.service.ts |
| **Backend Module** | eadings.module.ts | D:\meter\Meter\backend\src\readings\readings.module.ts |
| **DTO** | create-reading.dto.ts | D:\meter\Meter\backend\src\readings\dto\create-reading.dto.ts |
| **DTO** | eading-response.dto.ts | D:\meter\Meter\backend\src\readings\dto\reading-response.dto.ts |
| **Water Balance Controller** | water-balance.controller.ts | D:\meter\Meter\backend\src\readings\water-balance\water-balance.controller.ts |
| **Water Balance Service** | water-balance.service.ts | D:\meter\Meter\backend\src\readings\water-balance\water-balance.service.ts |
| **Water Balance DTO** | water-balance.dto.ts | D:\meter\Meter\backend\src\readings\water-balance\dto\water-balance.dto.ts |
| **Polling Scheduler** | polling.scheduler.ts | D:\meter\Meter\backend\src\readings\polling\polling.scheduler.ts |
| **Poller Service** | poller.service.ts | D:\meter\Meter\backend\src\readings\polling\poller.service.ts |
| **Adapter Interface** | dapter.interface.ts | D:\meter\Meter\backend\src\readings\polling\adapter.interface.ts |

## 1. Reading API Endpoints

| Method | Endpoint | Auth Roles | Description |
|--------|----------|------------|-------------|
| POST | /readings | OPERATOR, TECHNICIAN, ADMIN, SUPER_ADMIN | Create reading (with audit) |
| GET | /readings | OPERATOR, TECHNICIAN, ADMIN, SUPER_ADMIN, FINANCE, SUPPORT | List readings (optional projectId filter) |
| GET | /readings/review-queue | OPERATOR, TECHNICIAN, ADMIN, SUPER_ADMIN | List readings pending review |
| GET | /readings/:id | OPERATOR, TECHNICIAN, ADMIN, SUPER_ADMIN, FINANCE, SUPPORT | Get single reading |
| POST | /readings/:id/approve | OPERATOR, ADMIN, SUPER_ADMIN | Approve a reading (with audit) |
| POST | /readings/:id/reject | OPERATOR, ADMIN, SUPER_ADMIN | Reject a reading (with audit) |
| GET | /projects/:projectId/water-balance | OPERATOR, ADMIN, SUPER_ADMIN, FINANCE, SUPPORT | Water balance variance |

## 2. Reading Operations — Detailed Trace

### 2.1 Create Reading
- **Endpoint**: POST /readings
- **Service Method**: createReading(dto, userId)
- **DB Table**: Reading (Prisma model)
- **Input DTO**: meterId, projectId, eadingValue, eadingAt, source (manual/import/automatic), awPayload (optional)
- **Logic Flow**:
  1. Find the **previous reading** for the same meter (ordered by eadingAt DESC)
  2. Compute consumptionValue = currentValue - previousValue
  3. Fetch threshold profile from ThresholdService.getProfile(projectId)
  4. Apply anomaly detection rules:
     - **Negative consumption** → status = suspicious
     - **Zero consumption** (if lertOnZeroConsumption=true) → pending_review
     - **Exceeds maxConsumptionPerMonth** → pending_review
     - **Spike detection** (if average × multiplier exceeded) → suspicious
  5. Create the reading in DB with appropriate status
  6. Handle duplicate detection: P2002 Prisma error → **422 Unprocessable Entity**
  7. Send notification via NotificationsService
- **Frontend**: Not examined (no readings page found in component search)

### 2.2 List Readings
- **Endpoint**: GET /readings
- **Service Method**: indAll(projectId?)
- **DB**: prisma.reading.findMany with optional projectId filter, ordered by eadingAt DESC, limited to 500
- **Response**: Array of ReadingResponseDto

### 2.3 Review Queue
- **Endpoint**: GET /readings/review-queue
- **Service Method**: listReviewQueue({ projectId?, status? })
- **DB**: Filters where status IN ('pending_review', 'suspicious'), plus optional projectId/status override
- **Response**: { items: ReadingResponseDto[] }

### 2.4 Approve Reading
- **Endpoint**: POST /readings/:id/approve
- **Controller Logic** (inline, not in service):
  1. Find reading by ID
  2. Update reading status to alid
  3. Create eadingReview record with action=pprove
  4. Send notification
  5. Return { status: 'approved' }
- **Note**: Approval logic is in the **controller**, not the service. No service method exists for approve/reject.

### 2.5 Reject Reading
- **Endpoint**: POST /readings/:id/reject
- **Controller Logic** (inline):
  1. Validate eason is provided (returns { status: 'reason_required' } if missing)
  2. Find reading by ID
  3. Update reading status to ejected
  4. Create eadingReview record with action=eject
  5. Send notification
  6. Return { status: 'rejected' }

### 2.6 Water Balance
- **Endpoint**: GET /projects/:projectId/water-balance?from=&to=
- **Service Method**: getWaterBalance(projectId, from, to)
- **DB Tables**: Meter (water_main), Reading (aggregated consumption)
- **Logic**:
  1. Find project's water difference mode
  2. Find main water meter (first water_main)
  3. Aggregate main meter consumption in date range
  4. Find child meters (linked by parentMainMeterId)
  5. For each child, aggregate consumption
  6. Compute variance = mainTotal - childTotal
  7. Determine coverage percentage
  8. Flag missing readings
- **Response**: WaterBalanceResponseDto

## 3. Meter-Customer-Reading Linkage

| Linkage | Status | Details |
|---------|--------|---------|
| Reading → Meter | YES | eading.meterId is required, FK to meter.id |
| Reading → Customer | **INDIRECT** | eading.customerIdSnapshot is a string field stored at creation time. Not a live FK to customer. |
| Reading → Unit | **INDIRECT** | eading.unitIdSnapshot is a string field stored at creation time. |
| Reading → Project | YES | eading.projectId is required |
| Reading → Previous Reading | YES | createReading() queries the last reading for the same meter |
| Meter ←→ Customer | YES | Via MeterAssignment model (customerId on assignment, not directly on meter) |

## 4. Reading Continuity Validation

| Validation | Implemented? | Details |
|------------|-------------|---------|
| Previous reading lookup | YES | indFirst({ where: { meterId }, orderBy: { readingAt: desc } }) |
| Consumption calculation | YES | currentValue - previousReadingValue |
| Negative consumption detection | YES | Status set to suspicious if consumption < 0 and lertOnNegativeConsumption != false |
| Zero consumption detection | YES | Status set to pending_review if consumption = 0 and lertOnZeroConsumption === true |
| High consumption detection | YES | Status set to pending_review if consumption > maxConsumptionPerMonth |
| Spike detection | YES | Status set to suspicious if consumption > vgConsumption * spikeMultiplier |
| Duplicate prevention | YES | Prisma P2002 (unique constraint on meterId + readingAt + source) returns **422** |
| Gap detection (missing readings between dates) | NO | No validation that readings are chronologically sequential without gaps |
| Threshold profile integration | YES | Uses ThresholdService.getProfile(projectId) for configurable thresholds |

## 5. Start/End Reading Inheritance

| Feature | Implemented? | Details |
|---------|-------------|---------|
| Previous reading inherited automatically | YES | createReading() queries and uses the last reading's value |
| Previous reading stored on new reading | YES | previousReadingValue field is populated in the DB record |
| Consumption computed automatically | YES | consumptionValue field is computed before DB insert |
| Meter serial/type resolved in DTO | YES | 	oDto() queries meter table to populate meterSerial and meterType |
| Transfer of start reading on meter reassignment | NO | No mechanism to carry forward a start reading when a meter is reassigned to a new customer |

## 6. Polling/Ingestion System

| Component | Status | Details |
|-----------|--------|---------|
| PollerService | BUILT | Generic polling engine with retry logic (max 3 retries, exponential backoff) |
| Adapter Interface | DEFINED | MeterAdapter interface with meterType and etchReading() |
| Polling Scheduler | EXISTS | File polling.scheduler.ts exists but content was not read |
| Actual meter adapters | **MISSING** | No concrete implementations of MeterAdapter found |
| Automatic ingestion flow | **INCOMPLETE** | Poller can execute but there is no scheduler/trigger wiring to the database |

## 7. Water Balance Subsystem

| Aspect | Status | Details |
|--------|--------|---------|
| Main meter detection | YES | Finds first water_main meter for the project |
| Child meter resolution | YES | Finds meters whose parentMainMeterId matches the main meter |
| Date range filtering | YES | rom/	o query parameters used in eadingAt filter |
| Consumption aggregation | YES | Uses Prisma ggregate({ _sum: { consumptionValue } }) --- proper DB-side aggregation |
| Variance calculation | YES | 	otalMainConsumption - totalChildConsumption |
| Coverage percentage | YES | (totalChild / totalMain) * 100 |
| Missing reading detection | YES | Per-child coverageStatus: 'covered' | 'missing' |
| Water difference mode | YES | Reads project.waterDifferenceMode (illable | eport_only) |

## 8. Reading Status Lifecycle

`
                    ┌─────────────┐
                    │   Created   │
                    │  (valid)    │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │  Suspicious │◄── Negative consumption or spike
                    └──────┬──────┘
                           │
                    ┌──────▼──────────┐
                    │  Pending Review │◄── Zero consumption or high consumption
                    └──────┬──────────┘
                           │
               ┌───────────┼───────────┐
               │           │           │
        ┌──────▼─────┐ ┌──▼──┐ ┌──────▼──────┐
        │   Approve  │ │     │ │   Reject    │
        │  → valid   │ │     │ │ → rejected  │
        └────────────┘ │     │ └─────────────┘
                       │     │
                ┌──────▼──┐  │
                │ Correct │  │
                └─────────┘  │
                             │
                    ┌────────▼────────┐
                    │  Estimated      │
                    └─────────────────┘
`

## 9. Critical Findings

| Finding | Severity | Details |
|---------|----------|---------|
| Approve/reject logic in controller, not service | MEDIUM | Business logic for approve/reject is inline in the controller instead of eadings.service.ts |
| No gap detection | MEDIUM | System does not validate that readings are submitted chronologically without missing periods |
| No corrected/estimated status flow | MEDIUM | Statuses corrected and estimated are defined in the DTO but no endpoints handle them |
| Polling adapters not implemented | HIGH | PollerService framework exists but no concrete meter adapters are registered |
| Snapshot fields not populated | MEDIUM | customerIdSnapshot and unitIdSnapshot are hardcoded to empty strings ('') at creation |
| indAll limited to 500 readings | LOW | List endpoint has a hard limit; no pagination support |
| Water balance only handles first main meter | MEDIUM | If a project has multiple main water meters, only the first one is used |
| Reading response includes customerName and unitNumber | LOW | These fields are declared in the DTO but always returned as undefined |
| Notification on approve/reject | GOOD | Approve/reject both trigger notifications |

## 10. File Locations Summary

| Component | Absolute Path |
|-----------|---------------|
| Readings Controller | D:\meter\Meter\backend\src\readings\readings.controller.ts |
| Readings Service | D:\meter\Meter\backend\src\readings\readings.service.ts |
| Readings Module | D:\meter\Meter\backend\src\readings\readings.module.ts |
| Create Reading DTO | D:\meter\Meter\backend\src\readings\dto\create-reading.dto.ts |
| Reading Response DTO | D:\meter\Meter\backend\src\readings\dto\reading-response.dto.ts |
| Water Balance Controller | D:\meter\Meter\backend\src\readings\water-balance\water-balance.controller.ts |
| Water Balance Service | D:\meter\Meter\backend\src\readings\water-balance\water-balance.service.ts |
| Water Balance Module | D:\meter\Meter\backend\src\readings\water-balance\water-balance.module.ts |
| Water Balance DTO | D:\meter\Meter\backend\src\readings\water-balance\dto\water-balance.dto.ts |
| Poller Service | D:\meter\Meter\backend\src\readings\polling\poller.service.ts |
| Adapter Interface | D:\meter\Meter\backend\src\readings\polling\adapter.interface.ts |
| Polling Scheduler | D:\meter\Meter\backend\src\readings\polling\polling.scheduler.ts |
| Polling Module | D:\meter\Meter\backend\src\readings\polling\polling.module.ts |
