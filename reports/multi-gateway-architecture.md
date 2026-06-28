# METER VERSE — MULTI-INSTANCE SYNC GATEWAY ARCHITECTURE

## ONE GATEWAY PER SOURCE

8 source systems, each gets its own gateway instance:

```
┌─────────────────────────────────────────────────────────────────────┐
│                        METER VERSE                                  │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                 ORCHESTRATOR (port 4000)                      │  │
│  │  Routes requests to the correct gateway based on area/meter   │  │
│  └────┬──────┬──────┬──────┬──────┬──────┬──────┬──────┬───────┘  │
│       │      │      │      │      │      │      │      │          │
│  ┌────┴┐ ┌───┴┐ ┌──┴┐ ┌──┴┐ ┌──┴┐ ┌──┴┐ ┌──┴┐ ┌──┴┐ ┌──┴────┐  │
│  │GW 01│ │GW02│ │GW03│ │GW04│ │GW05│ │GW06│ │GW07│ │GW08   │  │
│  │:4001│ │:4002│ │:4003│ │:4004│ │:4005│ │:4006│ │:4007│ │:4008  │  │
│  └──┬──┘ └──┬──┘ └──┬─┘ └──┬──┘ └──┬──┘ └──┬──┘ └──┬──┘ └──┬───┘  │
│     │       │       │      │      │      │      │      │          │
└─────┼───────┼───────┼──────┼──────┼──────┼──────┼──────┼──────────┘
      │       │       │      │      │      │      │      │
   ┌──┴──┐ ┌──┴──┐ ┌──┴──┐ ┌──┴──┐ ┌──┴──┐ ┌──┴──┐ ┌──┴──┐ ┌──┴──┐
   │3.16 │ │3.16 │ │3.16 │ │3.18 │ │3.18 │ │3.18 │ │3.18 │ │3.18 │
   │Oct  │ │NCai │ │EDNC │ │Abraj│ │Badya│ │Chill│ │Bo Is│ │Est. │
   │:8080│ │:8080│ │:8080│ │:8080│ │:8080│ │:8080│ │:8080│ │:8080│
   └─────┘ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘
   10.50   10.50   10.50   10.50   10.50   10.50   10.50   10.50
   .30.2   .30.2   .30.2   .30.4   .30.5   .30.5   .30.5   .30.5
```

## GATEWAY INSTANCES

| ID | Name | Target Server | Port | API URL Pattern |
|----|------|--------------|------|-----------------|
| 01 | October | 10.50.30.2 (Symbiot 3.16) | :4001 | `/api/v1/sync/october/*` |
| 02 | New Cairo | 10.50.30.2 (Symbiot 3.16) | :4002 | `/api/v1/sync/new-cairo/*` |
| 03 | Sodic EDNC | 10.50.30.2 (Symbiot 3.16) | :4003 | `/api/v1/sync/sodic-ednc/*` |
| 04 | Abraj | 10.50.30.4 (Symbiot 3.18) | :4004 | `/api/v1/sync/abraj/*` |
| 05 | Badya | 10.50.30.5 (Symbiot 3.18) | :4005 | `/api/v1/sync/badya/*` |
| 06 | Chillout | 10.50.30.5 (Symbiot 3.18) | :4006 | `/api/v1/sync/chillout/*` |
| 07 | Bo Island | 10.50.30.5 (Symbiot 3.18) | :4007 | `/api/v1/sync/bo-island/*` |
| 08 | Sodic Estates | 10.50.30.5 (Symbiot 3.18) | :4008 | `/api/v1/sync/sodic-estates/*` |
| 09 | Sodic VYE | 10.50.30.5 (Symbiot 3.18) | :4009 | `/api/v1/sync/sodic-vye/*` |
| 10 | Billing (shared) | Billing Server | :4010 | `/api/v1/sync/billing/*` |

## EACH GATEWAY = SAME CODE, DIFFERENT CONFIG

Each gateway instance runs the same `server.js` — only the `.env` differs:

```
backend/sync-gateway/
  instances/
    gateway-01-october/
      .env        → PORT=4001, TARGET_URL=http://10.50.30.2:8080/api, AREA=october
      server.js   (symlink to ../shared/server.js)
    gateway-02-new-cairo/
      .env        → PORT=4002, TARGET_URL=http://10.50.30.2:8080/api, AREA=new_cairo
      server.js   (symlink)
    ... (same for all 9 areas)
    gateway-10-billing/
      .env        → PORT=4010, TARGET_URL=http://billing-server/api, AREA=billing
      server.js   (symlink)
    shared/
      server.js   ← THE ONLY CODE FILE
      package.json
```

## ORCHESTRATOR (port 4000)

A lightweight router that Meter Verse calls instead of calling individual gateways:

```javascript
const GATEWAYS = {
  october:     'http://localhost:4001',
  new_cairo:   'http://localhost:4002',
  sodic_ednc:  'http://localhost:4003',
  abraj:       'http://localhost:4004',
  badya:       'http://localhost:4005',
  chillout:    'http://localhost:4006',
  bo_island:   'http://localhost:4007',
  sodic_estates: 'http://localhost:4008',
  sodic_vye:   'http://localhost:4009',
  billing:     'http://localhost:4010',
};
```

## DATA REMAPPING LAYER

After each gateway retrieves raw data from its source system, the remapping layer transforms it into Meter Verse schema:

```
Raw Symbiot JSON                    → Remapped Meter Verse Format
────────────────────────────────────────────────────────────────────
Device.PkID                         → meter.id (UUID, mapped)
DeviceAttr (EAV rows)                → meter.serial_number
                                     → meter.meter_type
                                     → meter.brand
                                     → meter.model
DeviceData.TimeStart, Value          → reading.reading_value
                                     → reading.reading_at
MeasPlace.Name                       → unit.unit_number
Location.Name                        → project.name
                                     → area.area_name
```

The remapping is done by a dedicated service (`remapping-service.js`) that each gateway calls after getting raw data:

```javascript
app.get('/api/v1/sync/:area/meters', async (req, res) => {
  // Step 1: Get RAW data from Symbiot
  const raw = await fetch(SYMBIOT_BASE + '/devices');
  const devices = await raw.json();
  
  // Step 2: REMAP EAV attributes to flat structure
  const remapped = devices.map(d => ({
    source_id: d.PkID,
    serial: findAttr(d, 'SerialNumber'),
    meter_type: findAttr(d, 'MeterType'),
    brand: findAttr(d, 'Manufacturer'),
    model: findAttr(d, 'Model'),
    installation_date: findAttr(d, 'InstallationDate'),
    area: req.params.area,
    raw_device: d  // Keep original for audit
  }));
  
  res.json(remapped);
});

function findAttr(device, attrName) {
  const attr = (device.Attributes || []).find(a => a.AttrName === attrName);
  return attr ? attr.AttrVal : null;
}
```

## START/STOP ALL GATEWAYS

```batch
@echo off
REM start-all-gateways.bat
for %%g in (october new_cairo sodic_ednc abraj badya chillout bo_island sodic_estates sodic_vye billing) do (
  start "Sync-%%g" cmd /c "cd instances\gateway-%%g && node ..\shared\server.js"
)
echo All 10 gateways started
```

```batch
@echo off
REM stop-all-gateways.bat
taskkill /FI "WINDOWTITLE eq Sync-*" /F
echo All gateways stopped
```

## WHAT THIS GIVES YOU

1. **Each area is independent** — maintain/restart one without affecting others
2. **Each area has its own port** — 4001 through 4010, easy to monitor
3. **Read-only guarantee** — no SQL, no DB credentials, only GET HTTP
4. **Central orchestrator** — Meter Verse calls one endpoint, gets routed to correct area
5. **Data remapping** — raw Symbiot EAV → flat Meter Verse structure on-the-fly
6. **Safe deployment** — start/stop individual gateways without affecting production
