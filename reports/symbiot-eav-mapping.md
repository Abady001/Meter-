# Symbiot EAV Mapping — DeviceAttr → Meter Verse Fields

**Date:** 2026-06-25  
**Source:** `backend/sync-gateway/shared/server.js` — `findAttr()` function (lines 88–92) and `/api/v1/sync/:area/meters` handler (lines 58–81)

---

## EAV Flattening Logic

Symbiot stores meter attributes in an **Entity-Attribute-Value (EAV)** model via a `DeviceAttr` array on each device object. The gateway extracts named attributes into a flat Meter Verse structure.

### `findAttr(device, name)` — lines 88–92

```js
function findAttr(device, name) {
  if (!device.Attributes) return null;
  const attr = device.Attributes.find(a => a.AttrName === name);
  return attr ? attr.AttrVal : null;
}
```

**Behavior:**
- Receives a Symbiot device object and an attribute name
- Returns `null` if `device.Attributes` is undefined/empty
- Searches the `Attributes` array for an element where `AttrName === name`
- Returns `AttrVal` if found, otherwise `null`
- **No type coercion** — `AttrVal` is returned as-is (typically a string)

---

## Mapping Table

| Meter Verse Field | Symbiot `AttrName` | Type (expected) | Notes |
|---|---|---|---|
| `source_id` | `PkID` (root property) | integer / string | Not from Attributes — read directly from `d.PkID` on the device root object |
| `area` | — | string | Injected from `process.env.AREA` — not from Symbiot |
| `meter_serial` | `SerialNumber` | string | Meter unique serial number |
| `meter_type` | `MeterType` | string | e.g. "Electric", "Water" |
| `brand` | `Manufacturer` | string | e.g. "Iskra", "Landis+Gyr" |
| `model` | `Model` | string | Meter model name |
| `installation_date` | `InstallationDate` | string (date) | ISO date string expected |
| `status` | `Status` | string | e.g. "Active", "Inactive", "Faulty" |
| `phase_type` | `PhaseType` | string | e.g. "SinglePhase", "ThreePhase" |
| `amp_rating` | `AmpRating` | string / number | Amperage rating, e.g. "100A" |
| `raw` | — | object | Full original device object preserved for extensibility |

---

## Response Shape (line 64–76)

```json
{
  "area": "october",
  "count": 42,
  "meters": [
    {
      "source_id": 12345,
      "area": "october",
      "meter_serial": "SN-2024-001",
      "meter_type": "Electric",
      "brand": "Iskra",
      "model": "ME382",
      "installation_date": "2024-01-15",
      "status": "Active",
      "phase_type": "ThreePhase",
      "amp_rating": "100A",
      "raw": { ... }
    }
  ]
}
```

---

## Attributes Used vs. Available

The current mapping consumes **8 attributes** from the Symbiot device. The `raw` field preserves all other attributes for future use.

| AttrName | Mapped? | Extensible? |
|---|---|---|
| `SerialNumber` | ✅ Yes | — |
| `MeterType` | ✅ Yes | — |
| `Manufacturer` | ✅ Yes | — |
| `Model` | ✅ Yes | — |
| `InstallationDate` | ✅ Yes | — |
| `Status` | ✅ Yes | — |
| `PhaseType` | ✅ Yes | — |
| `AmpRating` | ✅ Yes | — |
| Any other attr in `device.Attributes[]` | ❌ No | ✅ Available via `raw.Attributes[]` |

---

## Data Flow

```
Symbiot Device Object                         Meter Verse Meter
┌─────────────────────────┐                  ┌──────────────────────┐
│ PkID: 12345             │──source_id──────▶│ source_id: 12345     │
│ Attributes: [           │                  │ area: "october"      │
│   {AttrName:"SerialNum" │──meter_serial──▶│ meter_serial: "..."  │
│    AttrVal:"SN-001"},   │                  │ meter_type: "Elec"   │
│   {AttrName:"MeterType" │──meter_type────▶│ brand: "Iskra"       │
│    AttrVal:"Electric"}, │                  │ model: "ME382"       │
│   {AttrName:"Mfg",      │──brand─────────▶│ install_date: "..."  │
│    AttrVal:"Iskra"},    │                  │ status: "Active"     │
│   {AttrName:"Model",    │──model─────────▶│ phase_type: "3Ph"    │
│    AttrVal:"ME382"},    │                  │ amp_rating: "100A"   │
│   {AttrName:"InstDate", │──install_date──▶│ raw: { ... }         │
│    AttrVal:"2024-01" }, │                  └──────────────────────┘
│   {AttrName:"Status",   │──status────────▶
│    AttrVal:"Active"},   │
│   {AttrName:"PhaseType",│──phase_type────▶
│    AttrVal:"3Ph"},      │
│   {AttrName:"AmpRating",│──amp_rating────▶
│    AttrVal:"100A"}      │
│ ]                       │
└─────────────────────────┘
```

---

## Certification

```
┌──────────────────────────────────────────────┐
│  SYMBIOT EAV MAPPING CERTIFICATION           │
├──────────────────────────────────────────────┤
│  Attributes mapped                   8/8     │
│  Root fields mapped (PkID)           ✅      │
│  Context fields injected (area)      ✅      │
│  Raw device preserved                ✅      │
│  null-safe EAV lookup                ✅      │
│  No hardcoded attrition risk         ✅      │
├──────────────────────────────────────────────┤
│  Gap: Unused Symbiot serial fields           │
│  Gap: No type normalization on AttrVal       │
│  All 9 gateways share the same mapping       │
└──────────────────────────────────────────────┘
```
