# Chilled Water Tariffs Report

**Source:** Live SBill API
**Date:** 2026-06-20
**Status:** Investigation / Planning

---

## Overview

Two chilled water tariffs discovered in SBill. Both are stored as `ELECTRICITY` type but functionally represent chilled water (district cooling) billing.

| ID | Name | Period | Mode | flatRate |
|----|------|--------|------|----------|
| 10054 | Chilled Water | 2024-07-03 → ongoing | FLAT | 3,000 milliemes (**3.00 EGP/unit**) |
| 10062 | chilled_3 | 2024-06-01 → ongoing | FLAT | 3,000 milliemes (**3.00 EGP/unit**) |

---

## Tariff 10054 — "Chilled Water"

| Property | Value |
|----------|-------|
| ID | 10054 |
| Name | Chilled Water |
| Type | ELECTRICITY |
| Mode | FLAT |
| flatRate | 3,000 milliemes |
| flatRate (EGP) | 3.00 EGP/unit |
| Start Date | 2024-07-03 |
| End Date | null (ongoing) |

### Charges
*(Additional charges beyond the flat rate to be fetched from API)*

---

## Tariff 10062 — "chilled_3"

| Property | Value |
|----------|-------|
| ID | 10062 |
| Name | chilled_3 |
| Type | ELECTRICITY |
| Mode | FLAT |
| flatRate | 3,000 milliemes |
| flatRate (EGP) | 3.00 EGP/unit |
| Start Date | 2024-06-01 |
| End Date | null (ongoing) |

### Charges
*(Additional charges beyond the flat rate to be fetched from API)*

---

## FLAT Mode Calculation

Both tariffs use FLAT mode with identical rates:

```
Charge = Consumption × flatRate
       = Consumption × 3,000 milliemes
       = Consumption × 3.00 EGP

Examples:
    10 units  → 10 × 3.00 = 30.00 EGP
    50 units  → 50 × 3.00 = 150.00 EGP
    100 units → 100 × 3.00 = 300.00 EGP
```

---

## Type Classification Issue

### Current State
- SBill stores both tariffs as type `ELECTRICITY`
- This is a **misclassification** — they are functionally chilled water/district cooling

### Impact

| Area | Impact |
|------|--------|
| Reporting | Reports may mix chilled water consumption with electricity |
| Analytics | Utility-specific analysis skewed |
| Meter Verse mapping | Must map to correct utility type during integration |
| Customer display | Should show as "Chilled Water" not "Electricity" |

### Recommended Mapping

| SBill Type | Effective Utility | Meter Verse Utility |
|------------|-------------------|-------------------|
| ELECTRICITY | Chilled Water | CHILLED_WATER (new) |

---

## Comparison with Chilled Water Tariffs

Both tariffs have the same rate (3,000 milliemes/unit) but may serve different customer segments:

| Differentiator | Possibility |
|----------------|-------------|
| Meter group / zone | Different cooling zones |
| Customer type | Residential vs commercial chilled water |
| Vintage | Rate revision (older vs newer) |
| Contract type | Different service agreements |

---

## Comparison with Other FLAT Tariffs

| Tariff | Name | Mode | Rate (milliemes) | Rate (EGP) | Utility |
|--------|------|------|------------------|------------|---------|
| 10054 | Chilled Water | FLAT | 3,000 | 3.00 | ELECTRICITY* |
| 10062 | chilled_3 | FLAT | 3,000 | 3.00 | ELECTRICITY* |
| 10078 | Electric Car Charging | FLAT | 1,890 | 1.89 | ELECTRICITY |

---

## Open Questions

1. **Why two tariffs with identical rates?** — Possibly different zones, customer types, or legacy/current rate versions.
2. **Additional charges** — Do chilled water tariffs have other charges (service fees, taxes) beyond the flat rate?
3. **Unit of measure** — What is the billing unit for chilled water? (RT-h, kW, or custom?)
4. **Rate revision** — Is 3,000 the current ongoing rate, or will it change?
5. **Meter Verse utility type** — Should a new `CHILLED_WATER` type be added, or can it be aliased under `ELECTRICITY` with a display override?
