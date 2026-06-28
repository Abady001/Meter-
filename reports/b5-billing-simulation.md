# B5 — Billing Simulation Framework
**Type:** PLANNING — No code changes  
**Purpose:** Describe a test harness to simulate SBill billing scenarios independently

---

## 1. Simulation Harness Architecture

```
Inputs                    Simulation Engine                 Outputs
─────────                ─────────────────                ───────
Meter Readings ──┐       ┌─────────────────┐       ┌─ Consumption
                 ├──────→│ 1. Tier Calc    ├──────→│─ Tariff Charges
Tariff Config  ──┘       │ 2. Charge Group │       │─ Settlements
                          │ 3. Settlement   │       │─ Tax
Settlement Amts ──┐       │ 4. Tax Calc     │       │─ Total
                 ├──────→│ 5. Total        ├──────→│─ vs SBill Actual
Adjustments     ──┘      └─────────────────┘       └─ Pass/Fail
```

### Core Calculation Pipeline
```
readings → consumption = prev_read - curr_read (or curr for new meters)
        → tier lookup (tariff_id, consumption_amount)
        → charge = rate * Qty (STEPS/FLAT/PER_UNIT) or fixed (STATIC/ZERO)
        → group by charge_group (CONSUMPTION, CUSTOMERCARE, ISSUE, TAX, ZERO)
        → settlement = tariff_diff_amount OR consumption_settlement_amount
        → tax = charge * tax_rate
        → total = sum(charges) + sum(settlements) + sum(tax)
        → compare with SBill invoice total (within tolerance ±0.01 EGP)
```

---

## 2. Scenario Types (10)

### Scenario 1 — Residential Electricity (STEPS tariff)
| Field | Value |
|-------|-------|
| Expected Formula | `consumption = curr - prev; tier = match(consumption, tariff_steps); charge = tier.rate * consumption; total = charge + tax` |
| Inputs | prev=0, curr=650, tariff_id=1 (steps: 0-50@0.58, 51-200@0.78, 201-350@1.08, 351-650@1.28) |
| Calc Steps | 650 → 50×0.58 + 150×0.78 + 150×1.08 + 300×1.28 = 29 + 117 + 162 + 384 = 692 |
| Output | Charge=692, Tax=692×0.14=96.88, Total=788.88 |
| SBill Compare | Match |

### Scenario 2 — Commercial Electricity (FLAT tariff)
| Field | Value |
|-------|-------|
| Expected Formula | `consumption = curr - prev; charge = rate × consumption; total = charge + tax` |
| Inputs | prev=1200, curr=1850, tariff_id=2 (flat rate=1.50) |
| Calc Steps | cons=650, charge=650×1.50=975, tax=136.50 |
| Output | Total=1,111.50 |
| SBill Compare | Match |

### Scenario 3 — Residential Water (STEPS tariff)
| Field | Value |
|-------|-------|
| Expected Formula | Same as Scenario 1 with water rates |
| Inputs | prev=30, curr=75, tariff_id=5 (steps: 0-30@0.25, 31-60@0.75, 61+@1.50) |
| Calc Steps | cons=45 → 30×0.25 + 15×0.75 = 7.50 + 11.25 = 18.75 |
| Output | Total=18.75+tax=21.38 |
| SBill Compare | Match |

### Scenario 4 — Commercial Water (FLAT tariff)
| Field | Value |
|-------|-------|
| Expected Formula | `charge = rate × consumption` |
| Inputs | prev=500, curr=620, tariff_id=6 (flat=4.20) |
| Calc Steps | cons=120, charge=504, tax=70.56 |
| Output | Total=574.56 |
| SBill Compare | Match |

### Scenario 5 — Chilled Water (PER_UNIT tariff)
| Field | Value |
|-------|-------|
| Expected Formula | `charge = rate_per_unit × number_of_units` |
| Inputs | units=4, prev=0, curr=0, tariff_id=8 (per_unit=850) |
| Calc Steps | charge=4×850=3,400, tax=476 |
| Output | Total=3,876 |
| SBill Compare | Match (note: consumption=0, uses unit count) |

### Scenario 6 — Solar (STATIC tariff)
| Field | Value |
|-------|-------|
| Expected Formula | `charge = fixed_monthly_amount` |
| Inputs | prev=0, curr=0, tariff_id=10 (static=200/month) |
| Calc Steps | charge=200, tax=28 |
| Output | Total=228 |
| SBill Compare | Match (no consumption-based charge) |

### Scenario 7 — Settlement Type A (فرق تعريفة / Tariff Diff)
| Field | Value |
|-------|-------|
| Expected Formula | `charge = normal_charge + tariff_diff_settlement` |
| Inputs | prev=100, curr=200, tariff_id=1, settlement_amount=45.20 |
| Calc Steps | cons=100, normal=50×0.58+50×0.78=68, tariff diff=45.20, total=68+45.20+tax |
| Output | Total=113.20+15.85=129.05 |
| SBill Compare | Match settlement line item |

### Scenario 8 — Settlement Type B (تسويه استهلاك / Consumption Settlement)
| Field | Value |
|-------|-------|
| Expected Formula | `charge = normal_charge + consumption_settlement` |
| Inputs | prev=0, curr=300, tariff_id=1, settlement_amount=120.00 (adjustment for 6 months) |
| Calc Steps | cons=300, normal_charge=50×0.58+150×0.78+100×1.08=29+117+108=254, settlement=120 |
| Output | Total=254+120+tax=426.36 |
| SBill Compare | Match |

### Scenario 9 — Zero Consumption
| Field | Value |
|-------|-------|
| Expected Formula | `charge = min_charge_if_applicable ELSE 0` |
| Inputs | prev=500, curr=500, tariff_id=1 |
| Calc Steps | cons=0, charge=0 (or min amount if tariff has minimum bill) |
| Output | Total=0 |
| SBill Compare | Match (MV must handle zero-read edge case) |

### Scenario 10 — Meter Replacement
| Field | Value |
|-------|-------|
| Expected Formula | `cons = (new_curr - 0) + (old_prev_before_change - old_curr_at_change)` |
| Inputs | old_meter: prev=0, curr_at_change=450; new_meter: curr=200 |
| Calc Steps | cons=450+200=650, apply tariff steps |
| Output | Total=788.88 |
| SBill Compare | Match (requires meter merge logic) |

---

## 3. Validation Rules

| Rule | Description |
|------|-------------|
| R1 | All calculated totals must match SBill invoice total ± 0.01 EGP |
| R2 | Charge breakdown by group must match SBill line items |
| R3 | Settlement amounts must appear as separate line items |
| R4 | Tax = sum(charges) × 14% every time |
| R5 | Zero consumption with no minimum bill → total must be 0 |
| R6 | Meter replacement merges both meter readings correctly |

---

## 4. Test Data Requirements

| Data Set | Records | Source |
|----------|---------|--------|
| Residential Electricity (Steps) | 50 customers | SBill Dec 2024 |
| Commercial Electricity (Flat) | 25 customers | SBill Dec 2024 |
| Residential Water (Steps) | 30 customers | SBill Dec 2024 |
| Commercial Water (Flat) | 15 customers | SBill Dec 2024 |
| Chilled Water (Per Unit) | 5 customers | SBill Dec 2024 |
| Solar (Static) | 3 customers | SBill Dec 2024 |
| Tariff Diff Settlement | 20 customers | SBill Dec 2024 |
| Consumption Settlement | 15 customers | SBill Dec 2024 |
| Zero Consumption | 10 customers | SBill Dec 2024 |
| Meter Replacement | 5 customers | SBill Dec 2024 |

**Total:** ~178 test cases covering all 10 scenario types
