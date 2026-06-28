# Water Tariffs Report

**Source:** Live SBill API
**Date:** 2026-06-20
**Status:** Investigation / Planning

---

## Overview

6 water tariffs discovered. All use STEP mode.

| ID | Name | Period |
|----|------|--------|
| 2 | منزلي (Residential) | 2019-07-01 → 2024-09-30 |
| 5 | مياه منزلي خدمي حدائق (Residential Service Gardens) | 2022-01-01 only |
| 10016 | مياه خدمي حمام سباحه (Service Swimming Pool) | 2023-03-01 → 2024-02-29 |
| 10017 | مياه خدمى (Service Water) | 2023-03-01 → 2025-11-30 |
| 10018 | مياه تجارى (Commercial Water) | 2019-07-01 → 2024-09-30 |
| 10022 | مياه منزلى (Domestic Water) | 2023-03-01 → 2025-11-29 |

---

## Tariff 2 — "منزلي" (Residential Water) — Detailed

**Period:** 2019-07-01 → 2024-09-30

### Charges

| # | Name (AR) | Name (EN) | Group | Type | Rate/Amount | Frequency |
|---|-----------|-----------|-------|------|-------------|-----------|
| 1 | Cosnumption *(sic)* | Consumption | CONSUMPTION | STEPS | Tiered rates | MONTHLY |
| 2 | مصاريف استدامة خدمة | Service Sustainability Fee | CUSTOMERCARE | STEPS | Tiered rates | MONTHLY |
| 3 | المقروء بصفر | Zero Reading | ZERO | ZERO | flatAmount=9,000 (**9 EGP**) | MONTHLY |
| 4 | مصاريف أخرى | Other Fees | ISSUE | STATIC | flatAmount=27,000 (**27 EGP**) | MONTHLY |
| 5 | خدمات الجهاز التنظيمي | Regulatory Services | ISSUE | PER_UNIT | flatRate=10 (**0.01 EGP/unit**) | MONTHLY |

### Charge Descriptions

#### 1. Consumption (STEPS — CONSUMPTION)
Water consumption charged in progressive tiers. Tier boundaries and rates stored in `tariff_charges_details`.

#### 2. مصاريف استدامة خدمة — Service Sustainability Fee (STEPS — CUSTOMERCARE)
A tiered fee for infrastructure sustainability. Separate tier structure from consumption.

#### 3. المقروء بصفر — Zero Reading (ZERO — ZERO)
Fixed 9,000 milliemes (9 EGP) charged when consumption is zero. Same amount as electricity tariffs.

#### 4. مصاريف أخرى — Other Fees (STATIC — ISSUE)
A flat **27,000 milliemes (27 EGP)** charged every month. This is the largest fixed fee across all tariffs.

#### 5. خدمات الجهاز التنظيمي — Regulatory Services (PER_UNIT — ISSUE)
```
Charge = Consumption × 10 / 1000 = Consumption × 0.01 EGP

Example:
    20 m³ consumed → 20 × 0.01 = 0.20 EGP
    100 m³ consumed → 100 × 0.01 = 1.00 EGP
```

---

## Tariff 5 — "مياه منزلي خدمي حدائق" (Residential Service Gardens — WATER)

**Period:** 2022-01-01 only (single day)

| Property | Value |
|----------|-------|
| ID | 5 |
| Name | مياه منزلي خدمي حدائق |
| Type | WATER |
| Mode | STEP |
| Start | 2022-01-01 |
| End | 2022-01-01 |

This tariff has a **one-day validity window**. Likely a temporary or year-specific rate for garden irrigation. Charges not yet fetched — may be identical to Tariff 2 with different tier rates.

---

## Tariff 10016 — "مياه خدمي حمام سباحه" (Service Swimming Pool — WATER)

**Period:** 2023-03-01 → 2024-02-29

| Property | Value |
|----------|-------|
| ID | 10016 |
| Name | مياه خدمي حمام سباحه |
| Type | WATER |
| Mode | STEP |
| Start | 2023-03-01 |
| End | 2024-02-29 |

Designed for swimming pool water service. Charges not yet fetched from API.

---

## Tariff 10017 — "مياه خدمى" (Service Water — WATER)

**Period:** 2023-03-01 → 2025-11-30

| Property | Value |
|----------|-------|
| ID | 10017 |
| Name | مياه خدمى |
| Type | WATER |
| Mode | STEP |
| Start | 2023-03-01 |
| End | 2025-11-30 |

General service water tariff. Longest validity window among water tariffs (nearly 3 years).

---

## Tariff 10018 — "مياه تجارى" (Commercial Water — WATER)

**Period:** 2019-07-01 → 2024-09-30

| Property | Value |
|----------|-------|
| ID | 10018 |
| Name | مياه تجارى |
| Type | WATER |
| Mode | STEP |
| Start | 2019-07-01 |
| End | 2024-09-30 |

Commercial water tariff. Same date range as Tariff 2 (Residential Water), suggesting a coordinated rate period.

---

## Tariff 10022 — "مياه منزلى" (Domestic Water — WATER)

**Period:** 2023-03-01 → 2025-11-29

| Property | Value |
|----------|-------|
| ID | 10022 |
| Name | مياه منزلى |
| Type | WATER |
| Mode | STEP |
| Start | 2023-03-01 |
| End | 2025-11-29 |

Domestic water tariff. Name variation of Tariff 2 (منزلى vs منزلي — slight spelling difference).

---

## Water Tariff Comparison

| Tariff | Name | Period | Known Charges | Distinctive Feature |
|--------|------|--------|---------------|-------------------|
| 2 | Residential | 2019-07 → 2024-09 | 5 (full detail) | Sustainability fee (STEPS), Other fees 27,000, Regulatory 10/unit |
| 5 | Gardens | 2022-01-01 only | TBD | 1-day tariff |
| 10016 | Swimming Pool | 2023-03 → 2024-02 | TBD | Pool-specific |
| 10017 | Service Water | 2023-03 → 2025-11 | TBD | Longest validity |
| 10018 | Commercial | 2019-07 → 2024-09 | TBD | Commercial rates |
| 10022 | Domestic | 2023-03 → 2025-11 | TBD | Domestic variant |

---

## Key Charges Unique to Water (not found in Electricity)

| Charge | Tariff | Amount | Notes |
|--------|--------|--------|-------|
| مصاريف استدامة خدمة (Sustainability Fee) | 2 | STEPS (tiered) | Separate incentive for water conservation |
| مصاريف أخرى (Other Fees) | 2 | 27,000 milliemes/month | Largest fixed charge across all tariffs |
| خدمات الجهاز التنظيمي (Regulatory Services) | 2 | 10 milliemes/unit | Per-unit regulatory levy |

---

## Calculation Example (Tariff 2 — Residential Water)

```
Given: Consumption = 25 m³

1. Consumption charge:
   Look up tier for 25 m³ → rate_value = X milliemes/m³
   consumptionCharge = tier_rate × 25 / 1000

2. Sustainability Fee:
   Look up tier for 25 m³ → rate_value = Y milliemes/m³
   sustainabilityCharge = tier_rate × 25 / 1000

3. Zero Reading: Not applied (consumption > 0)

4. Other Fees: 27,000 / 1000 = 27.00 EGP

5. Regulatory Services: 25 × 10 / 1000 = 0.25 EGP

Total = consumptionCharge + sustainabilityCharge + 27.00 + 0.25
```

> **Note:** Exact tier rates for consumption and sustainability need to be fetched from `tariff_charges_details`.

---

## Open Questions

1. **Tier rates** for all water tariffs — need `tariff_charges_details` query
2. **Tariff 5** — is it a separate tariff or a rate override for gardens?
3. **Tariff 10022 vs Tariff 2** — are they truly different or is 10022 a rate revision for residential?
4. **Sustainability fee tiers** — do they mirror consumption tiers or have a separate structure?
5. **ISSUE group mapping** — Tariff 2 charges 4 and 5 both use ISSUE group. Should they be aggregated or separate line items in Meter Verse?
