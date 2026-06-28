# Phase 11: Tariff Simulation Framework

> **Status**: PLANNING DOCUMENT — no simulation data available (SBill `tariff_charges_details` tiers could not be extracted due to server timeout).
> **Note**: This document defines the simulation framework. Actual results require tier data from SBill.

---

## 1. Background

Tier details (`from_usage`, `to_usage`, `rate_value`) from SBill's `tariff_charges_details` table were unavailable during this investigation due to persistent server timeouts. The table structure is known from JRXML, but the actual tier boundaries and rates for each tariff could not be extracted.

Once tier data is available, the following simulation framework should be executed.

---

## 2. Calculation Algorithm

The core algorithm is already implemented in `TariffCalculationService.calculateTieredCharge()` (`tariff-calculation.service.ts:211-230`):

```
function calculateTieredCharge(consumption, tiers):
    total = 0
    remaining = consumption
    tiers sorted by fromUsage ascending
    
    for each tier:
        if remaining <= 0: break
        tierMax = tier.toUsage ?? Infinity
        tierUnits = min(remaining, tierMax - tier.fromUsage + 1)
        if tierUnits <= 0: continue
        tierCharge = round(tierUnits * tier.rateValue + (tier.extraAmount ?? 0))
        total += tierCharge
        remaining -= tierUnits
    
    return total
```

### Full Invoice Calculation Flow

```
Input: consumption, tariffTiers[], fixedCharges[], percentageRate, settlementAmount, taxRate

1. consTiers   = filter(tariffTiers, chargeGroup in ['CONSUMPTION','0'])
2. csTiers     = filter(tariffTiers, chargeGroup in ['CUSTOMER_SERVICE','2','3'])
3. consCharge  = calculateTieredCharge(consumption, consTiers)
4. csFees      = calculateTieredCharge(consumption, csTiers)  // fallback to fixed sum
5. adminFees   = sum(fixedCharges where chargeGroup in ['ISSUE_FEES','ADMIN','4'])
6. otherFees   = sum(fixedCharges where chargeGroup in ['FEES','OTHER','1'])
7. pctAmount   = round(consCharge * percentageRate / 100)
8. settlement  = settlementAmount (signed)
9. subtotal    = consCharge + csFees + adminFees + otherFees + pctAmount + settlement
10. tax        = round(subtotal * taxRate / 100)
11. total      = subtotal + tax
```

---

## 3. Simulation Test Scenarios

### 3.1 Scenario Generator

```python
import random, csv
from dataclasses import dataclass

@dataclass
class SimulationResult:
    tariff_id: int
    consumption: int
    expected_total_milliemes: int
    actual_total_milliemes: int
    variance_milliemes: int
    variance_pct: float
    line_items: list

def generate_scenarios(tariffs, min_cons=0, max_cons=2000, seed=42):
    """Generate random consumption values for each tariff."""
    random.seed(seed)
    scenarios = []
    for t in tariffs:
        # Edge cases: extremes, mid-range, zero
        edge_cases = [0, 1, 10, 50, 100, 500, 1000, max_cons]
        random_cases = random.sample(range(min_cons, max_cons + 1), min(20, max_cons))
        for cons in sorted(set(edge_cases + random_cases)):
            scenarios.append({'tariff_id': t.id, 'consumption': cons})
    return scenarios
```

### 3.2 Expected Result Calculator (SBill Reference)

```python
def calculate_expected(tariff, consumption):
    """Replicate SBill calculation logic."""
    total = 0
    lines = []
    
    # 1. Consumption tiers
    for tier in tariff.consumption_tiers:
        tier_units = min(max(0, consumption - tier.from_usage), 
                        (tier.to_usage or float('inf')) - tier.from_usage)
        amount = tier_units * tier.rate_value + (tier.extra_amount or 0)
        if amount > 0:
            total += amount
            lines.append(('CONSUMPTION', tier.from_usage, tier.to_usage, amount))
    
    # 2. Customer service tiers (based on same consumption)
    for tier in tariff.cs_tiers:
        tier_units = min(max(0, consumption - tier.from_usage),
                        (tier.to_usage or float('inf')) - tier.from_usage)
        amount = tier_units * tier.rate_value
        if amount > 0:
            total += amount
            lines.append(('CUSTOMER_SERVICE', tier.from_usage, tier.to_usage, amount))
    
    # 3. Fixed charges
    for fc in tariff.fixed_charges:
        total += fc.flat_amount
        lines.append(('FIXED', fc.name, fc.flat_amount))
    
    # 4. ZERO/minimum charge check
    if consumption == 0:
        zero_charge = tariff.zero_charge or 0
        if zero_charge > total:
            total = zero_charge
    
    return total, lines
```

### 3.3 Meter Verse Calculator

```typescript
// This is the TariffCalculationService.calculate() method directly
// Import and call: new TariffCalculationService().calculate({...})
```

---

## 4. Simulation Execution Plan

### Step 1: Data Extraction
- Query SBill `tariff` table → get all tariff IDs, names, modes
- Query `tariff_charges` per tariff → get charge groups, flat amounts, upper limits
- Query `tariff_charges_details` per charge → get tier boundaries and rates
- Export as JSON for cross-reference

### Step 2: Scenario Generation
- For each tariff, generate consumption values: 0, 1, 10, 50, 100, 250, 500, 750, 1000, 2000
- Edge cases: exactly at tier boundary, one unit into next tier, max tier
- For zero-consumption test: verify ZERO/minimum charge applied correctly

### Step 3: Dual Calculation
- Feed same consumption to expected calculator (SBill logic) AND Meter Verse calculator
- Compare line-by-line and total

### Step 4: Variance Analysis
```
variance_milliemes = abs(expected_total - actual_total)
variance_pct = variance_milliemes / expected_total * 100

PASS if variance_pct <= 0.1  // allow rounding differences
FAIL if variance_pct > 0.1
```

### Step 5: Report

```csv
tariff_id, consumption, expected_milliemes, actual_milliemes, variance_milliemes, variance_pct, status
1, 0, 9000, 0, 9000, 100.0, FAIL
1, 100, ..., ..., 0, 0.0, PASS
1, 250, ..., ..., 0, 0.0, PASS
3, 0, ..., ..., 0, 0.0, PASS
```

---

## 5. Expected Failure Points (Known Gaps)

| Scenario | Expected Failure | Root Cause |
|----------|-----------------|------------|
| Consumption = 0 | Meter Verse returns 0, SBill returns 9,000+ | No ZERO charge type |
| Consumption < 90 + Radio fee | Upper limit uncapped in MV | No upper_limit check |
| January invoice + Stamp | Contract stamp missing in MV | No yearly recurring_mode |
| Tariff with PER_UNIT charges | Missing line items in MV | No PER_UNIT charge type |
| Tariff with STATIC charges | Missing line items in MV | No STATIC charge type |
| High consumption | Fine (tiered calc matches) | ✅ |

---

## 6. When Tier Data Is Available

To run simulation after tier extraction:

```bash
# 1. Export tier data from SBill
psql -h sbill-host -d sbill_db -c "
  SELECT tc.id, tc.tariff_id, tc.charge_group, tc.flat_amount, tc.upper_limit,
         tcd.from_usage, tcd.to_usage, tcd.rate_value, tcd.extra_amount
  FROM tariff_charges tc
  LEFT JOIN tariff_charges_details tcd ON tcd.charge_id = tc.id
  ORDER BY tc.tariff_id, tc.charge_group, tcd.from_usage;
" -o tariff_export.json

# 2. Run simulation
python scripts/tariff-simulation.py \
  --tariffs tariff_export.json \
  --scenarios generated_scenarios.json \
  --output reports/tariff-sim-results.csv
```
