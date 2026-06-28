# Phase 12: Invoice Validation Methodology

> **Status**: INVESTIGATION / PLANNING ONLY.
> **Note**: Real invoice line items could not be extracted from SBill (server timeout). This document defines the validation methodology to execute once data is available.
> **Target**: Variance = 0 (zero tolerance).

---

## 1. Validation Goal

Prove that Meter Verse invoice calculation produces **identical results** to SBill for every combination of tariff, consumption, and meter configuration.

**Target metric**: `|SBill_total - MeterVerse_total| <= 1 millieme` (rounding-only variance).

---

## 2. Data Extraction

### 2.1 Invoice Selection Criteria

Select invoices covering:
- All utility types (electricity, water, solar, gas, chilled water)
- All consumption ranges (0 to max, including at tier boundaries)
- All months (to capture yearly charges in January)
- All seasons (summer peak vs winter low)
- Both residential and commercial tariffs

### 2.2 Required Data Per Invoice

```sql
-- Invoice header
SELECT i.id, i.number, i.meter_id, i.total_amt, i.status, 
       i.counsumption_month, i.start_reading, i.end_reading,
       i.counsumption_value AS consumption
FROM invoice i
WHERE i.id = $invoice_id;

-- Invoice line items (charge breakdown)
SELECT id, name, charge_group, amount, consumption_value
FROM invoice_details 
WHERE invoice_id = $invoice_id
ORDER BY charge_group;

-- Meter + tariff assignment
SELECT m.serial, m.tariff_id, t.name_en AS tariff_name, 
       t.mode, t.start_date, t.end_date
FROM meter m
JOIN tariff t ON t.id = m.tariff_id
WHERE m.id = $meter_id;
```

### 2.3 Tariff Structure for That Invoice

```sql
-- All charges for the assigned tariff
SELECT tc.id, tc.name_en, tc.charge_group, tc.flat_amount, 
       tc.flat_rate, tc.recurring_mode, tc.upper_limit
FROM tariff_charges tc
WHERE tc.tariff_id = $tariff_id;

-- Tier details
SELECT tcd.from_usage, tcd.to_usage, tcd.rate_value, 
       tcd.extra_amount
FROM tariff_charges_details tcd
JOIN tariff_charges tc ON tc.id = tcd.charge_id
WHERE tc.tariff_id = $tariff_id
ORDER BY tc.charge_group, tcd.from_usage;
```

---

## 3. Recalculation Engine

### 3.1 Full Recalculation Pipeline

```
Input: consumption, tariff_charges[], tariff_charges_details[]

Step 1: Group charges by charge_group
  - CONSUMPTION (0)     → tiers = details for this group
  - CUSTOMER_SERVICE (2,3) → tiers = details for this group
  - ISSUE_FEES (4)      → flat_amount for each charge; also tiered charges
  - FEES (1)            → flat_amount; also per_unit (rate × consumption capped)
  - PERCENTAGE (5)      → flat_rate% of consumption_charge

Step 2: Calculate each group
  - Tiered groups: consume calculateTieredCharge(consumption, tiers)
  - Flat groups: sum flat_amount
  - Per-unit: min(consumption, upper_limit) × flat_rate
  - Percentage: round(consumptionCharge × flat_rate / 100)

Step 3: Zero-consumption check
  - IF consumption = 0 AND tariff has ZERO charge:
    - Override total = max(calculated_total, zero_charge_flat_amount)
  - ELSE: use calculated total

Step 4: Apply taxes
  - Invoice-level tax = round(subtotal × tax_rate / 100)

Step 5: Compare
  - For each charge_group: |SBill_amount - MV_amount| <= 1
  - For total: |SBill_total_amt - MV_total| <= 1
```

### 3.2 Pseudocode

```python
def validate_invoice(invoice_id, sbill_conn, mv_conn):
    # 1. Extract
    sbill_data = extract_sbill_invoice(sbill_conn, invoice_id)
    mv_data = extract_mv_invoice(mv_conn, invoice_id)
    
    # 2. Recalculate using tariff formula
    consumption = sbill_data['consumption']
    tariff = sbill_data['tariff']
    calc_result = recalculate(tariff, consumption)
    
    # 3. Compare line items
    mismatches = []
    for group in ['CONSUMPTION', 'CUSTOMER_SERVICE', 'FEES', 'ISSUE_FEES']:
        sbill_amt = sbill_data['lines_by_group'].get(group, 0)
        calc_amt = calc_result['lines_by_group'].get(group, 0)
        variance = abs(sbill_amt - calc_amt)
        if variance > 1:  # tolerance: 1 millieme
            mismatches.append({
                'group': group,
                'sbill': sbill_amt,
                'calculated': calc_amt,
                'variance': variance
            })
    
    # 4. Compare totals
    total_variance = abs(sbill_data['total'] - calc_result['total'])
    
    return {
        'invoice_id': invoice_id,
        'pass': len(mismatches) == 0 and total_variance <= 1,
        'mismatches': mismatches,
        'total_variance': total_variance
    }
```

---

## 4. Expected Failure Cases

| Scenario | Expected SBill | Expected MV | Variance | Root Cause |
|----------|---------------|-------------|----------|------------|
| Zero consumption | 9,000+ milliemes | 0 | 9,000+ | ZERO charge missing |
| January invoice + 3 EGP stamp | 3,000 extra | 0 | 3,000 | No yearly recurring_mode |
| Radio fee > 90 units | Capped at 90 units | Uncapped | Varies | No upper_limit check |
| PER_UNIT charges | Consumption × rate | Missing | Full amount | No PER_UNIT type |
| STATIC charges | flat_amount | Missing | Full amount | No STATIC type |

---

## 5. Validation Report Format

```csv
invoice_id, tariff_id, consumption, 
sbill_cons, mv_cons, cons_var,
sbill_cs, mv_cs, cs_var,
sbill_fees, mv_fees, fees_var,
sbill_admin, mv_admin, admin_var,
sbill_total, mv_total, total_var,
status, reason

INV-001, T1, 0, 0, 0, 0, 0, 0, 0, 
  3000, 0, 3000, 9000, 0, 9000,
  FAIL, "ZERO charge not implemented"
```

---

## 6. Execution Workflow

```
┌──────────────┐     ┌─────────────────┐     ┌──────────────┐     ┌─────────────┐
│ Select random │────>│ Extract invoice │────>│ Recalculate  │────>│ Compare &   │
│ 100 invoices  │     │ + tariff data   │     │ using formula │     │ report vars │
└──────────────┘     └─────────────────┘     └──────────────┘     └─────────────┘
                                                                         │
                                                                         ▼
                                                               ┌─────────────────┐
                                                               │ Plot variance   │
                                                               │ distribution    │
                                                               │ → 0 variance    │
                                                               └─────────────────┘
```

### Acceptance Criteria

| Metric | Target | Current |
|--------|--------|---------|
| Invoices with 0 variance | 100% | Not tested |
| Average variance per invoice | 0.0 milliemes | Not tested |
| Maximum variance | ≤ 1 millieme | Not tested |
| Charge group coverage | All groups verified | Not tested |
| Zero-consumption handling | Correct minimum | Fails (not implemented) |
| Yearly charges (January) | Present at 3,000 | Fails (not implemented) |
