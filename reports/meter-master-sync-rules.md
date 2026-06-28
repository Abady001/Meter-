# Meter Master — Synchronization Rules

**Date:** 2026-06-25

---

## 1. ACTIVATION PREREQUISITES

A meter **may only be activated** when all of the following are assigned:

| Prerequisite | DB Field / Relation | Required By |
|---|---|---|
| **Area** | `Meter.projectId` → `Project` → `CoreArea` (via `CoreProject.areaId`) | Schema `NOT NULL` |
| **Project** | `Meter.projectId` | Schema `NOT NULL` |
| **Unit** (Location) | `MeterAssignment.unitId` (not on Meter itself) | Assignment DTO |
| **Tariff** | `TariffPlan.projectId` + `Meter.meterType` | Active tariff lookup per project/type |
| **Customer** | `MeterAssignment.customerId` | Assignment DTO |

**Activation flow:**

1. `POST /meters` with `CreateMeterDto` → status = `available`
2. `POST /meters/:id/assign` with `AssignMeterDto` → creates `MeterAssignment` (status = `active`)
3. Meter status remains `available` until assignment is created — at that point the meter is eligible for reading/billing

**Backend validation** (`backend/src/meters/meters.service.ts`):

- `create()` — No assignment validation at creation; meter starts as `available`
- `assignMeter()` — Checks `NOT NULL` for `customerId`, `unitId`, `projectId` via DTO decorators (`@IsUUID`). Checks no active assignment already exists (`ConflictException` if found)
- `terminateMeter()` — Requires an active assignment to exist; fails with `ConflictException` if none found
- No backend guard prevents a meter from being `activated` without a tariff — tariff lookup is done at billing time, not at meter activation

---

## 2. BACKEND VALIDATION — MetersService

### 2.1 create (`backend/src/meters/meters.service.ts:17`)
```
POST /meters → status: 'available'
```
- DTO validation via class-validator decorators (`@IsUUID`, `@IsDateString`, etc.)
- `projectId` is required at Meter creation level (schema `NOT NULL`)
- `locationId` is optional on Meter entity
- `parentMainMeterId` is optional (water main → child hierarchy)
- No tariff check — tariff is decoupled
- No customer check — customer is assigned later

### 2.2 assignMeter (`:142`)
```
POST /meters/:id/assign → MeterAssignment (status: 'active')
```
- Meter must exist → `NotFoundException`
- No existing active assignment → `ConflictException("Meter X is already assigned to customer Y")`
- Creates `MeterAssignment` with `meterId`, `customerId`, `unitId`, `projectId`, `startAt`, `changeReason`
- Does NOT change Meter.status — that remains at its current value
- The assignment itself tracks `status: 'active'` vs `'ended'`

### 2.3 terminateMeter (`:186`)
```
POST /meters/:id/terminate → Meter become 'terminated', SIM released or cooled down
```
- Meter must exist → `NotFoundException`
- Active assignment must exist → `ConflictException("Meter X has no active assignment to terminate")`
- Sets `MeterAssignment.endAt`, status → `'ended'`
- Sets `Meter.status` → `'terminated'`
- Handles SIM deactivation (reusable if cooldown passed, else `'old'`)

### 2.4 remove (`:92`)
```
DELETE /meters/:id → status: 'retired'
```
- Soft-delete only; sets `Meter.status` → `'retired'`

### 2.5 update (`:67`)
```
PATCH /meters/:id → updates metadata
```
- Supports: `serialNumber`, `meterType`, `brand`, `model`, `phaseType`, `ampRating`, `diameter`, `solarEnabled`, `installationDate`, `activationDate`, `projectId`, `locationId`, `parentMainMeterId`, `status`

---

## 3. FIELDS SYNCHRONIZED

### Meter Entity (`backend/prisma/schema.prisma:328`)

| Field | Type | Sync Notes |
|---|---|---|
| `id` | UUID | Auto-generated primary key |
| `serialNumber` | String (unique) | Master identifier; consumed from hardware/import |
| `meterType` | Enum (electricity, water_main, water_child, solar, gas, chilled_water, outdoor_unit) | Synchronized with Collection System meter type mapping |
| `brand` | String | Master data |
| `model` | String | Master data |
| `phaseType` | String? | Electrical meters only |
| `ampRating` | String? | Electrical meters only |
| `diameter` | String? | Water meters only |
| `solarEnabled` | Boolean | Solar/wallet integration flag |
| `status` | Enum (available, assigned, active, offline, faulty, replaced, terminated, retired) | Syncs via assignment lifecycle |
| `installationDate` | DateTime | From field installation |
| `activationDate` | DateTime | When meter becomes operational |
| `terminationDate` | DateTime? | Set on termination |
| `projectId` | String (FK → Project) | Cross-reference with Collection System project |
| `locationId` | String? (FK → LocationNode) | Syncs via location hierarchy |
| `parentMainMeterId` | String? (self-ref FK) | Water main ↔ child relationships |
| `initialBalance` | Decimal? | Opening balance for prepaid meters |
| `lastReadingDate` | DateTime? | Updated on each new reading ingestion |

### MeterAssignment Entity (`schema.prisma:384`)

| Field | Type | Sync Notes |
|---|---|---|
| `id` | UUID | Auto-generated |
| `meterId` | String (FK → Meter) | Links meter to assignment |
| `customerId` | String (FK → Customer) | Linked customer |
| `unitId` | String (FK → LocationNode) | Physical location |
| `projectId` | String (FK → Project) | Project scope |
| `startAt` | DateTime | When assignment began |
| `endAt` | DateTime? | When assignment ended |
| `changeReason` | String | Reason for assignment/change |
| `status` | Enum (active, ended) | Active → meter is in use |

### SIMAssignment Entity (`schema.prisma:404`)

| Field | Sync Notes |
|---|---|
| `simId`, `meterId` | Links SIM card to meter |
| `startAt`, `endAt` | Assignment lifecycle |
| `status` | Active → SIM is in use |

### Assignment Dependency Chain
```
Meter [projectId, locationId?]
  → MeterAssignment [customerId, unitId, projectId, status: active]
    → SIMAssignment [simId, status: active]
```

---

## 4. WHAT IS NOT VALIDATED (Documented Gaps)

| Gap | Risk | Notes |
|---|---|---|
| No tariff existence check at activation | A meter can be activated without any tariff assigned for its project/type | Billing will skip meters without tariffs (graceful fallback) |
| No cross-project unit validation | `AssignMeterDto.projectId` can differ from `unitId`'s actual project | No FK constraint enforces unit belongs to project |
| No customer-project membership check | Customer may not belong to the project being assigned to | Relies on FK only |
| No location node type validation | Any `LocationNode` can be assigned as unit (zone/building/floor/unit) | No restriction to leaf `unit` nodes only |
