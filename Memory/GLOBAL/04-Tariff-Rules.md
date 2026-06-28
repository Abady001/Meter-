# Meter Verse — Tariff Domain Knowledge

## Overview

The tariff domain defines how utility consumption is priced and charged. Meter Verse has two tariff models:

1. **TariffPlan** (v1/simple, `sim_system` schema): Flat-rate per unit, one rate per meter type per project
2. **Tariff / TariffCharge / TariffChargeDetail** (v2/features, `features` schema): Full multi-charge tariff with versioning, settlement rules, and tiered/TOU pricing

**sBill parity**: ~78% (flat/tiered/percentage match; TOU and settlement rules need validation)

---

## Tariff Structure (v2 — features schema)

### Tariff (root)
```typescript
{
  tariffCode: string;       // UNIQUE, business code
  tariffName: string;       // Display name
  description?: string;      // Description
  utilityType: UtilityType;  // electricity, water, solar, gas, chilled_water, outdoor_unit, settlement
  isActive: boolean;         // Active flag
  effectiveFrom: DateTime;   // When tariff becomes effective
  effectiveTo?: DateTime;    // When tariff expires (null = ongoing)
  createdBy: string;
  updatedBy: string;
}
```

A tariff can have multiple `TariffCharge` records and multiple `TariffVersion` records.

### TariffCharge
```typescript
{
  chargeCode: string;        // UNIQUE per tariff (e.g. 'CONS', 'ADMIN', 'VAT')
  chargeName: string;        // English name
  chargeNameAr?: string;     // Arabic name
  chargeMode: TariffChargeMode;  // STEPS | FLAT | STATIC | PER_UNIT | ZERO | TOU
  settlementType: TariffSettlementType;  // FIXED | PERCENTAGE | ONE_TIME
  rateAmount?: Decimal;      // Base rate
  unitOfMeasure?: string;    // kWh, m³, etc.
  minCharge?: Decimal;       // Minimum charge
  maxCharge?: Decimal;       // Maximum charge
  sortOrder: number;         // Display order
  isActive: boolean;
}
```

### TariffChargeDetail
```typescript
{
  stepFrom?: Decimal;   // Tier start (consumption) or hour start (TOU)
  stepTo?: Decimal;     // Tier end (consumption) or hour end (TOU)
  stepRate?: Decimal;   // Rate per unit in this tier
  stepAmount?: Decimal; // Fixed amount for this tier
  isPercentage: boolean;// Whether stepAmount is a percentage
}
```

---

## Charge Modes

### STEPS (Tiered/Slab)
Charges are calculated across consumption tiers. Each tier has a `from` and `to` range with `stepRate` per unit. Residual consumption falls into the last tier.

Example: 0-100 @ 50, 101-200 @ 75, 201+ @ 100
- Consumption = 250 → 100*50 + 100*75 + 50*100 = 17,500

### FLAT
A flat amount charged regardless of consumption (e.g. monthly admin fee).

### STATIC
Like FLAT but mapped to administrative charge group (Group 3).

### PER_UNIT
A rate per unit of consumption. Amount = rateAmount × consumption.

### ZERO
A fixed default amount. If rateAmount or minCharge is <= 0, defaults to 9000 (milliemes = 9 EGP). Used for zero-consumption invoices to show minimum charge.

### TOU (Time-of-Use)
Hour-based pricing. Charge details define `stepFrom` = hour (0-23), `stepTo` = hour (0-23), `stepRate` = rate during that hour. The system checks `effectiveDate.getHours()` to find the matching rate block.

---

## Settlement Types

| Type | Description | Used When |
|------|-------------|-----------|
| FIXED | Fixed amount charge | Admin fees, monthly service charges |
| PERCENTAGE | Percentage of consumption charge | Municipal fees, waste collection |
| ONE_TIME | One-time charge | Connection fees, late payment (not implemented) |

---

## Charge Groups

The tariff engine maps charge mode and settlement type to charge groups (0-14):

```
PER_UNIT or STEPS     → Group 0 (Consumption)
settlementType=PERCENTAGE → Group 5 (Percentage)
FLAT + settlementType=FIXED → Group 4 (Sustainability)
FLAT only            → Group 1 (Service Fees)
STATIC               → Group 3 (Administrative)
default              → Group 7 (Other)
```

Full charge group table is in `charge-groups.ts` (see Billing-Knowledge.md for complete mapping).

---

## Tariff Versioning

The `TariffVersion` model tracks changes to tariffs:

```typescript
{
  tariffId: string;      // FK to Tariff
  versionNo: number;     // Sequential (unique per tariff)
  changeLog: string;     // Description of changes
  approvedBy: string;    // Who approved
  approvedAt: DateTime;  // When approved
  createdAt: DateTime;
}
```

**Unique**: `[tariffId, versionNo]`

Version 1 is created automatically when a tariff is created. Each subsequent change (planned for approval workflow) increments versionNo.

---

## Approval Workflow

**NOT IMPLEMENTED**. The `TariffVersion` model has `approvedBy` and `approvedAt` fields, but there is no workflow enforcement. Tariffs are immediately active when `isActive = true` and `effectiveFrom <= now` and `(effectiveTo IS NULL OR effectiveTo >= now)`.

---

## Tariff Lookup Logic (TariffEngineService)

```
1. Find the most recent active Tariff matching utilityType:
   WHERE utilityType = :meterType
     AND isActive = true
     AND effectiveFrom <= :effectiveDate
     AND (effectiveTo IS NULL OR effectiveTo >= :effectiveDate)
   ORDER BY effectiveFrom DESC
   LIMIT 1

2. If Tariff found:
   - Load all active TariffCharges ordered by sortOrder
   - Load all TariffChargeDetails for each charge ordered by stepFrom
   - Calculate charges per chargeMode
   - Return { lines, total }

3. If no Tariff found (fallback):
   - Find matching TariffPlan with status='active'
   - Calculate flat rate: amount = ratePerUnit * consumption
   - Return single FLAT line
```

---

## sBill Parity: Tariff

| Feature | Meter Verse | sBill | Parity |
|---------|-------------|-------|--------|
| Flat rate tariffs | ✅ | ✅ | 100% |
| Tiered/slab consumption | ✅ | ✅ | 100% |
| Fixed admin/service fees | ✅ | ✅ | 100% |
| Percentage of consumption | ✅ | ✅ | 100% |
| Min/max charge enforcement | ✅ | ✅ | 100% |
| Sort order / grouping | ✅ | ✅ | 100% |
| Charge groups (0-14) | ✅ | ✅ | 100% |
| TOU time-of-use | ⚠️ Partial | ✅ | 60% |
| Demand charges | ❌ | ✅ | 0% |
| Tariff versioning | ✅ (no workflow) | ✅ | 60% |
| Approval workflow | ❌ | ✅ | 0% |
| Tariff cloning | ❌ | ✅ | 0% |
| Bulk tariff assignment | ❌ | ✅ | 0% |
| Settlement rules/distribution | ⚠️ Basic | ✅ | 40% |
| **Overall** | | | **~78%** |

---

## Source Files

| File | Purpose |
|------|---------|
| `backend/src/billing/tariff-engine.service.ts` | Core tariff calculation engine — all charge modes |
| `backend/src/billing/tariff-calculation.service.ts` | Higher-level tariff calc with charge group breakdown |
| `backend/src/billing/tariffs/tariff.service.ts` | TariffPlan CRUD (v1) |
| `backend/src/billing/tariff-studio.controller.ts` | Tariff management API (v2) |
| `backend/src/billing/billing.controller.ts` | Tariff plan list/create, simulate endpoint |
| `backend/src/invoices/charge-groups.ts` | Charge group definitions |
<!-- Prisma schema: Tariff, TariffVersion, TariffCharge, TariffChargeDetail (features schema) -->
