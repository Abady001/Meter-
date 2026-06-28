# Phase 9: Customer Service Fee Engine — Charge Groups 2 & 3

> **Status**: INVESTIGATION / PLANNING ONLY — no code changes.
> **Source**: SBill tariff tables + Meter Verse `tariff-calculation.service.ts`

---

## 1. Discovery: Customer Service Fees Are Consumption-Based & Tiered

This is a critical finding. Customer service fees in SBill are **not flat monthly amounts** — they are **progressive tiered charges based on consumption volume**, using the same `STEPS` mechanism as consumption charges.

### Evidence from SBill

| Tariff | Charge Group | Type | Based On | Tiers |
|--------|-------------|------|----------|-------|
| Tariff 1 (Electricity) | CUSTOMER_SERVICE (2,3) | STEPS | Consumption (kWh) | 4+ tiers |
| Tariff 3 (Commercial) | CUSTOMER_SERVICE (2,3) | STEPS | Consumption (kWh) | 4+ tiers |

The `tariff_charges` table stores customer service lines with `charge_group` = 2 or 3. The `tariff_charges_details` table holds `from_usage`/`to_usage`/`rate_value` exactly like consumption tiers.

---

## 2. Current Meter Verse Handling

`tariff-calculation.service.ts:73-118` handles customer service fees:

```typescript
// Filter customer service tiers by charge group
const csTiers = tariffTiers.filter(
  t => t.chargeGroup === 'CUSTOMER_SERVICE' || t.chargeGroup === '2' || t.chargeGroup === '3'
);

// Calculate using same tiered algorithm as consumption
let customerServiceFees = this.calculateTieredCharge(consumption, csTiers);

// Fallback: fixed charges if no tiers defined
if (customerServiceFees <= 0) {
  for (const fc of fixedCharges) {
    if (fc.chargeGroup === 'CUSTOMER_SERVICE' || ...) {
      customerServiceFees += fc.amount;
    }
  }
}
```

This is **correct** — the same `calculateTieredCharge()` method is reused. The issue is that the charging engine must receive tiers for CUSTOMER_SERVICE, not just flat amounts.

---

## 3. Calculation Algorithm

```
Given: consumption = C
Tiers: [{from: 0, to: 100, rate: 50}, {from: 101, to: null, rate: 75}]

For each tier sorted by from_usage ascending:
  tier_max = to_usage ?? ∞
  tier_units = min(remaining, tier_max - from_usage + 1)
  tier_charge = round(tier_units * rate_value + extra_amount)
  total += tier_charge
  remaining -= tier_units
```

### Example (from SBill Tariff 1 customer service)

| From | To | Rate (milliemes) | Consumption 150 | Calculation |
|------|----|-----------------|-----------------|-------------|
| 0 | 100 | 50 | 50 units | 100 × 50 = 5,000 |
| 101 | ∞ | 75 | 50 units | 50 × 75 = 3,750 |
| **Total** | | | | **8,750 milliemes = 8.75 EGP** |

---

## 4. Template Config Charge Mapping

From `template-config.ts:67-73`, both electricity and water map:

```typescript
chargeGroupMapping: {
  CONSUMPTION: [0],
  CUSTOMER_SERVICE: [2, 3],   // ← these appear in the "خدمة عملاء" column
  ISSUE_FEES: [4],
  FEES: [1],
  SETTLEMENT: [6],
}
```

The `TemplateColumn` for customer service:
```typescript
{ label: 'خدمة عملاء (جم)', x: 295, width: 59, chargeGroups: [2, 3], format: 'amount' }
```

---

## 5. Gaps

| Gap | Severity | Detail |
|-----|----------|--------|
| No charge_types enum | CRITICAL | SBill uses STEPS/FLAT/STATIC/PER_UNIT/ZERO. Meter Verse has no type discriminator; deduces charge mode from presence of tiers vs flat_amount |
| No recurring_mode | HIGH | SBill supports DAILY/MONTHLY/YEARLY recurring modes. Meter Verse assumes all charges are monthly |
| No ZERO/minimum charge | MEDIUM | When consumption = 0, customer service still applies (confirmed by SBill data). No explicit ZERO type handler |
| Service fee tier data not in DB | HIGH | Customer service tiers exist in SBill `tariff_charges_details` but not yet migrated to Meter Verse |

---

## 6. Implementation Path

1. Add `chargeType` enum column: `STEPS | FLAT | STATIC | PER_UNIT | ZERO`
2. Add `recurring_mode` column: `MONTHLY | DAILY | YEARLY | ONCE`
3. Validate that CUSTOMER_SERVICE tiers are loaded from DB alongside CONSUMPTION tiers
4. Implement ZERO-type fallback when consumption = 0 (apply minimum charge)
5. Wire customer service tiers into `TariffCalculationService.calculate()` from the tariff data layer

---

## 7. Verification

To verify correctness after implementation:
- **Before**: Customer service fees were hardcoded fixed amounts → inconsistent with SBill
- **After**: Pass same `tariffTiers` for CUSTOMER_SERVICE group → fees match SBill output exactly
- Compare: For consumption=150, tariff=1, CS should = 8,750 milliemes (8.75 EGP)
