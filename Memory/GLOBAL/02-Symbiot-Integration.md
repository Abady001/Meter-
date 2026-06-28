# Meter Verse — Symbiot Integration Knowledge

## Overview

Symbiot SEP (Smart Energy Platform) is the legacy meter collection system that Meter Verse syncs data from. The integration operates on a read-only principle: Meter Verse NEVER writes to Symbiot databases. All data flows from Symbiot SQL Server → Meter Verse PostgreSQL via a batch sync pipeline.

---

## 9 Areas & Their Gateways

| Area | Internal Code | Symbiot DB Name | Gateway Port | Status |
|------|--------------|-----------------|-------------|--------|
| October | october | PalmHills_October | 4001 | Active |
| New Cairo | new_cairo | PalmHills_NewCairo | 4002 | Active |
| Sodic EDNC | sodic_ednc | SODIC | 4003 | Active |
| UVenus Mall | uvenus_mall | (sBill API) | 4004 | Active |
| Badya | badya | (sBill API) | 4005 | Active |
| Bo Island | bo_island | (sBill API) | 4006 | Active |
| Estates | sodic_estates | (sBill API) | 4007 | Active |
| VYE | sodic_vye | (sBill API) | 4008 | Active |
| Chillout | chillout | (sBill API) | 4009 | Active |

## Connection Strings

### Symbiot SQL Server (Direct DB connections)
Only 3 areas have direct Symbiot SQL Server connections; the remaining 6 use sBill REST API fallback:

```
october:     { server: 'VM1', database: 'PalmHills_October', user: 'sa', password: 'H$gVFED$x+vSqQ3K' }
new_cairo:   { server: 'VM1', database: 'PalmHills_NewCairo', user: 'sa', password: 'H$gVFED$x+vSqQ3K' }
sodic_ednc:  { server: 'VM1', database: 'SODIC', user: 'sa', password: 'H$gVFED$x+vSqQ3K' }
```

### sBill REST API (Fallback for all areas)
```
october:     { url: 'http://10.50.30.2:9999', user: 'admin', pass: 'iskra' }
new_cairo:   { url: 'http://10.50.30.2:9090', user: 'admin', pass: 'admin' }
sodic_ednc:  { url: 'http://10.50.30.2:9191', user: 'admin', pass: 'admin' }
uvenus_mall: { url: 'http://10.50.30.4:9191', user: 'admin', pass: 'admin' }
badya:       { url: 'http://10.50.30.5:9090', user: 'admin', pass: 'iskra' }
bo_island:   { url: 'http://10.50.30.5:9999', user: 'admin', pass: 'iskra' }
estates:     { url: 'http://10.50.30.5:9000', user: 'admin', pass: 'iskra' }
sodic_vye:   { url: 'http://10.50.30.5:9909', user: 'admin', pass: 'iskra' }
chillout:    { url: 'http://10.50.30.5:9990', user: 'admin', pass: 'iskra' }
```

## AREA_CODE_MAP

Maps DB areaCode values (AREA-1 through AREA-9) to sync keys:

```typescript
private readonly AREA_CODE_MAP: Record<string, string> = {
  'AREA-1': 'october',
  'AREA-2': 'new_cairo',
  'AREA-3': 'sodic_ednc',
  'AREA-4': 'sodic_estates',
  'AREA-5': 'sodic_vye',
  'AREA-6': 'badya_city',
  'AREA-7': 'north_coast',
  'AREA-8': 'uvines_mall',
};
```

---

## EAV Mapping Details

Symbiot uses an Entity-Attribute-Value (EAV) pattern in the `DeviceAttr` table. Each device has multiple attribute rows keyed by `AttrKeyFk`. To flatten the EAV into a usable row, 7 LEFT JOINs are required:

```sql
SELECT d.PkID, d.Name, d.SerialNo, d.DeviceID, d.DeviceType, d.LocationFk,
       da4.AttrVal as MeterSerial,        -- AttrKeyFk = 4
       da62.AttrVal as DeviceID_Attr,      -- AttrKeyFk = 62
       da105.AttrVal as ContactorStatus,   -- AttrKeyFk = 105
       da120.AttrVal as SyncStatus,        -- AttrKeyFk = 120
       da109.AttrVal as WaterConsumption,  -- AttrKeyFk = 109
       da110.AttrVal as WaterSerial,       -- AttrKeyFk = 110
       da117.AttrVal as BillingConsumption -- AttrKeyFk = 117
FROM Device d
LEFT JOIN DeviceAttr da4  ON da4.DeviceFk  = d.PkID AND da4.AttrKeyFk  = 4
LEFT JOIN DeviceAttr da62 ON da62.DeviceFk = d.PkID AND da62.AttrKeyFk = 62
LEFT JOIN DeviceAttr da105 ON da105.DeviceFk = d.PkID AND da105.AttrKeyFk = 105
LEFT JOIN DeviceAttr da120 ON da120.DeviceFk = d.PkID AND da120.AttrKeyFk = 120
LEFT JOIN DeviceAttr da109 ON da109.DeviceFk = d.PkID AND da109.AttrKeyFk = 109
LEFT JOIN DeviceAttr da110 ON da110.DeviceFk = d.PkID AND da110.AttrKeyFk = 110
LEFT JOIN DeviceAttr da117 ON da117.DeviceFk = d.PkID AND da117.AttrKeyFk = 117
```

The DeviceAttr table contains approximately 97,000 rows across all areas. Each device typically has 5-15 attribute rows.

---

## Sync Pipeline Steps

The full sync pipeline for a single area executes in this order:

### Step 1: Area Resolution
Locate the `CoreArea` record in Meter Verse by areaCode. Map the area to its sync key using AREA_CODE_MAP.

### Step 2: Gateway Selection
Determine the data source:
- **Primary**: Direct Symbiot SQL Server connection (for areas with configured `SYMBIOT_DB` entries)
- **Fallback**: sBill REST API (for all other areas)

### Step 3: Authentication
For Symbiot SQL Server: Use hardcoded credentials with SQL Server authentication.
For sBill API: POST to `/api/authenticate` with `{ username, password, rememberMe: true, projectId: '1' }` → receives `id_token` JWT.

### Step 4: Buffer
Query source system with pagination:
- Symbiot SQL: Direct SELECT with full dataset (no pagination, typically < 10K devices)
- sBill API: Paginated GET requests (`/api/meters?page=N&size=100`, up to 100 pages)

### Step 5: Validate
For each record:
- Check if serial number already exists in Meter Verse (deduplication via `existingSerials` Set)
- Check for required fields (serial number, device type)

### Step 6: Transform
Map Symbiot fields to Meter Verse schema:
- Serial: `dev.SerialNo || dev.MeterSerial || 'SYM-' + dev.PkID`
- Meter type: `electricity` (default, mapped from DeviceType)
- Brand: `dev.Name || 'Symbiot'`
- Status: ALWAYS `available` (never active — activation requires separate workflow)
- Date fields: Set to current timestamp if not available

### Step 7: DB Insert
Batch insert into `sim_system.meters` with `skipDuplicates: true` in batches of 100 records.

### Step 8: Checkpoint
Return sync statistics: `{ synced: number, errors: string[], total: number }`

### Step 9: Notify
Errors are logged via Logger. The `syncAllAreas()` method iterates all configured areas and returns per-area results.

---

## Read-Only Rules

Meter Verse adheres to strict read-only rules when accessing Symbiot systems:
1. **NEVER write to Symbiot SQL Server** — only SELECT statements
2. **NEVER call sBill POST/PUT/DELETE endpoints** — only GET
3. **NEVER modify Symbiot authentication tokens**
4. **NEVER create transactions across Symbiot and Meter Verse databases**
5. **ALWAYS close connections after sync completes** (`pool.close()`)

---

## Retry Logic

| Parameter | Value |
|-----------|-------|
| Max attempts | 3 (primary SQL, then fallback API each attempt) |
| Skip duplicates | `true` (via Prisma `skipDuplicates: true`) |
| Error accumulation | All errors collected in `errors: string[]` array |
| Partial success | Each area syncs independently; one area failure doesn't block others |

Retry flow:
```
Attempt 1: Symbiot SQL Server → if fail →
Attempt 2: sBill REST API → if fail →
Attempt 3: Return accumulated errors
```

---

## Timeout Configuration

| Parameter | Value | Location |
|-----------|-------|----------|
| Symbiot SQL connect timeout | 15,000ms | `mssql` ConnectionPool options |
| Symbiot SQL request timeout | 120,000ms | `mssql` ConnectionPool options |
| sBill API request timeout | 30,000ms | `httpGet()` function default |
| sBill auth request timeout | 15,000ms | Inline in `sbillAuth()` |
| Gateway query timeout | 30s | Backend service layer |

---

## Fallback Strategy

The fallback chain for each sync operation:

1. **Primary**: Try direct Symbiot SQL Server SELECT with 7 LEFT JOIN EAV flattening
2. **Fallback**: If SQL connection fails OR query fails, fall back to sBill REST API with paginated GET requests
3. **Error accumulation**: Both primary and fallback errors are collected and returned in the result

When both primary and fallback fail, the error array contains both error messages and synced=0.

---

## Meter Activation Requirements

A meter synced from Symbiot is ALWAYS in `available` status. It can be activated only when ALL 4 conditions are met:

1. **Unit assigned**: Active `MeterAssignment` record exists for the meter
2. **Installation date**: `meter.installationDate` is set
3. **Customer assigned**: The assignment has a customer assigned
4. **Tariff assigned**: An active `TariffPlan` exists for the project

Implemented in `SyncOrchestratorService.canActivateMeter()`.

---

## Source Files

| File | Purpose |
|------|---------|
| `backend/src/sync/sync-orchestrator.service.ts` | Core sync logic, AREA_CODE_MAP, SYMBIOT_DB, sBill auth, pipeline |
| `backend/src/sync/sync.controller.ts` | REST endpoints: POST /sync/meters, POST /sync/all |
| `backend/src/sync/sync.module.ts` | Module registration |
| `backend/src/readings/polling/` | Polling ingestion adapter (planned) |
