# METER VERSE — SYMBIOT SYNCHRONIZATION ENGINE DESIGN

**Date:** 2026-06-25
**Source:** Symbiot 3.16/3.18 SQL schema analysis (MsSqlTab.sql — 3739 lines, 60+ tables)

---

## 1. SYMBIOT DATA MODEL DISCOVERY

### Core Entity Hierarchy

```
Location (City/Country hierarchy)
  → Device (physical meter device, EAV pattern)
    → DeviceIdentification (serial numbers, barcodes)
    → DeviceData (time-series measurement data)
      → DeviceDataKey (key definitions for device data)
    → MeasPlace (installation location within device)
      → MeasPlaceAttr (measurement place attributes)
      → MeasPlaceMeasPoint (links MP to measurement points)
    → MeasPoint (individual measurement channel)
      → MeasPointAttr (measurement point attributes)
      → MeasPointResType (resource type mapping)
    → Meter (SEP2 meter security ID)
    → DeviceEvent (events logged per device)
      → DeviceEventAttr (event attributes)
```

### Key Tables and Their Roles

| Symbiot Table | Role in Hierarchy | Key Fields |
|--------------|-------------------|------------|
| `Device` | Root entity for all meters | PkID, ResourceFK |
| `DeviceAttr` | EAV attributes for devices | DeviceFK, AttrGroup, AttrName, AttrVal |
| `DeviceIdentification` | Serial numbers, barcodes, IDs | DeviceFK, IdentificationType, Value |
| `DeviceData` | Time-series readings | DeviceFK, DataKeyFK, TimeStart, TimeEnd, Value |
| `DeviceDataKey` | Definition of data types | PkID, Name, Unit |
| `MeasPlace` | Installation site/position | PkID, Name, DeviceFK |
| `MeasPlaceAttr` | MP attributes | MeasPlaceFK, AttrGroup, AttrName, AttrVal |
| `MeasPoint` | Individual measurement channel | PkID, Name, MeasPlaceFK |
| `MeasPointAttr` | MP channel attributes | MeasPointFK, AttrGroup, AttrName, AttrVal |
| `Meter` | SEP2 meter mapping | PkID, SystemTitle |
| `Location` | Geographic location | PkID, Name, ParentFK |
| `Unit` | Unit of measurement | PkID, Name, Symbol |
| `Tariff` | Tariff definitions | PkID, Name |
| `EventLog` | System audit trail | PkID, Timestamp, EventFK, Severity |

### EAV Pattern

Symbiot uses a heavy EAV pattern. Instead of fixed columns, attributes are stored as key-value pairs:

```
Device (fixed columns: PkID, ResourceFK, etc.)
  ↓
DeviceAttr (EAV: DeviceFK, AttrGroup=100, AttrName='SerialNumber', AttrVal='52051449')
DeviceAttr (EAV: DeviceFK, AttrGroup=101, AttrName='MeterType', AttrVal='Electricity')
DeviceAttr (EAV: DeviceFK, AttrGroup=102, AttrName='InstallDate', AttrVal='2024-01-15')
```

This means synchronization must reconstruct flat records from EAV pairs.

---

## 2. MEASUREMENT HIERARCHY

### Measurement Pages (BP1, BP2, LP1, LP2, W1, W4, Hourly)

| Page | Code | Description | Unit | Frequency |
|------|------|-------------|------|-----------|
| BP1 | Basic Profile 1 | Active energy (+) | kWh | 15-min |
| BP2 | Basic Profile 2 | Active energy (-) / Reactive | kVARh | 15-min |
| LP1 | Load Profile 1 | Active energy (generation) | kWh | 15-min |
| LP2 | Load Profile 2 | Reactive energy | kVARh | 15-min |
| Hourly | Hourly Profile | Hourly integrated values | kWh | 60-min |
| W1 | Water Profile 1 | Water consumption | m³ | 15-min |
| W4 | Water Profile 4 | Reverse water flow | m³ | 15-min |

Each measurement page maps to specific `MeasPoint` entries on a `MeasPlace`. The `MeasPointResType` table maps measurement points to resource types.

---

## 3. STAGING DATABASE DESIGN

### Schema: `sync` (within Meter Verse PostgreSQL)

```
sync schema — READ ONLY mirror of source systems
├── devices — Flat table from Symbiot Device + DeviceAttr EAV
├── meter_identifications — DeviceIdentification records
├── measurement_places — Flat from MeasPlace + MeasPlaceAttr
├── measurement_points — Flat from MeasPoint + MeasPointAttr
├── readings_bp1 — BP1 15-min readings
├── readings_bp2 — BP2 15-min readings
├── readings_lp1 — LP1 15-min readings
├── readings_hourly — Hourly readings
├── readings_water — Water readings (W1, W4)
├── tariffs — Mirrored tariff tables
├── locations — Mirrored location hierarchy
├── audit_log — Mirrored event log
│
mapping schema — Cross-reference IDs
├── meter_map — Symbiot DeviceID ↔ Meter Verse MeterID
├── project_map — Symbiot LocationID ↔ Meter Verse ProjectID
├── area_map — Symbiot CityID ↔ Meter Verse AreaID
├── customer_map — Billing CustomerID ↔ Meter Verse CustomerID
│
audit schema — Sync operation history
├── sync_log — Each sync run
├── sync_errors — Failed records
├── sync_dead_letter — Permanently failed records
│
queue schema — Pending operations
├── early_readings — Readings before period close
└── manual_readings — Manually entered readings
```

---

## 4. SYNCHRONIZATION RULES (READ ONLY)

### Meter Master Sync (First Stage)

```
1. Connect to Symbiot via read-only SQL user
2. SELECT Device, DeviceAttr, DeviceIdentification
3. WHERE Device.Status = 'Active'
4. Transform EAV rows → flat meter records
5. INSERT INTO sync.devices (id, serial, type, area, project, ...)
6. Validate: no duplicate serials, valid area/project
7. Link: sync.meter_map (SymbiotID → MeterVerseID)
```

### Reading Sync (Blocked Until)

```
BLOCKING CONDITIONS (all must be met before sync):
✅ Meter exists in sync.meter_map
✅ Meter assigned to project in Meter Verse
✅ Meter assigned to unit/customer
✅ Tariff assigned to meter
✅ Installation date exists
✅ Customer is active

WHEN ALL CONDITIONS MET:
1. SELECT DeviceData WHERE DeviceFK = mapped_id
2. Filter: TimeStart >= InstallationDate
3. Filter: TimeEnd <= CurrentPeriodEnd
4. Validate: no gaps, no duplicates, no negatives
5. INSERT INTO sync.readings_bp1/houly/water
6. Flag for Meter Verse consumption calculation
```

### Validation Rules (Applied Before Any Insert)

```
REJECT:
- Reading timestamp before installation date
- Reading timestamp before customer assignment
- Reading timestamp before tariff assignment
- Missing previous month reading
- Sequence gaps (>1 missing period)
- Negative consumption values
- Duplicate readings (same meter + same timestamp)
- Future readings (timestamp > NOW)
```

---

## 5. STAGING → METER VERSE FLOW

```
┌─────────────────────┐     ┌──────────────────────┐     ┌─────────────────────┐
│    SYMBIOT 3.16     │     │   sync STAGING       │     │   METER VERSE       │
│    SQL Server        │────▶│   PostgreSQL          │────▶│   PostgreSQL         │
│                      │     │                      │     │                     │
│ Device + DeviceAttr  │     │ sync.devices         │     │ sim_system.meters   │
│ DeviceIdentification │     │ sync.meter_idents    │     │ sim_system.customers│
│ DeviceData           │     │ sync.readings_bp1    │     │ sim_system.readings │
│ MeasPlace + Attr     │     │ sync.meas_places     │     │ sim_system.invoices │
│ MeasPoint + Attr     │     │ sync.meas_points     │     │ features.tariffs    │
│ Location             │     │ sync.locations       │     │ core.areas          │
│ Tariff               │     │ sync.tariffs         │     │ core.projects       │
│ EventLog             │     │ sync.audit_log       │     │ core.audit_log      │
└─────────────────────┘     └──────────────────────┘     └─────────────────────┘
      │                             │                             │
      │ READ ONLY                   │ READ, VALIDATE, TRANSFORM   │ BILLING ENGINE
      │ No UPDATE/DELETE/INSERT     │ No direct writes to         │ Uses transformed
      │ Read-only SQL credentials   │ Meter Verse business tables │ data only
      └─────────────────────────────┴─────────────────────────────┘
```

---

## 6. SCHEDULER DESIGN

| Job | Frequency | Source | Target | Conditions |
|-----|-----------|--------|--------|------------|
| Meter Master Sync | Hourly | Symbiot Device | sync.devices | None |
| Meter Delta Sync | Every 15 min | Symbiot DeviceAttr | sync.devices | LastSync < Modified |
| Reading BP1/BP2 | Every 15 min | Symbiot DeviceData | sync.readings_bp1 | Meter mapped + active |
| Reading Hourly | Every 60 min | Symbiot DeviceData | sync.readings_hourly | Meter mapped + active |
| Reading Water | Every 15 min | Symbiot DeviceData | sync.readings_water | Meter mapped + active |
| Tariff Sync | Daily | Symbiot Tariff | sync.tariffs | LastSync < Modified |
| Location Sync | Daily | Symbiot Location | sync.locations | None |
| Reconciliation | Daily | All sources | All targets | Compare counts |

---

## 7. SECURITY

| Resource | Auth Method | Permissions |
|----------|-------------|-------------|
| Symbiot SQL Server | SQL Auth, read-only user | SELECT only on Device, DeviceAttr, DeviceData, Location, Tariff |
| Connection string | Encrypted in .env | No WRITE permissions granted |
| Sync service account | JWT, role=sync_operator | Can only write to sync.* schemas |
| Meter Verse business tables | JWT, role=sync_manager | TRANSFORM only via stored procedures |

---

## 8. IMPLEMENTATION ROADMAP

| Phase | Duration | Deliverable |
|-------|----------|-------------|
| 1: Analysis | 1 week | Complete source system mapping |
| 2: Staging schema | 3 days | sync.* tables in Meter Verse PostgreSQL |
| 3: Meter master sync | 5 days | Device → sync.devices with EAV flattening |
| 4: Reading sync | 5 days | DeviceData → sync.readings with validation |
| 5: Tariff sync | 2 days | Tariff tables mirrored |
| 6: Reconciliation | 3 days | Row-count + balance matching |
| 7: Cutover | 5 days | Symbiot read-only → Meter Verse billing |
| **Total** | **~4 weeks** | |

**Design complete. 9 deliverable reports referenced in the report index.**
