# Phase 10: Invoice Line Item Map — Complete Catalog

> **Status**: INVESTIGATION — no code changes.
> **Source**: SBill JRXML queries, SBill `invoice_details` table, Meter Verse template-config, tariff-calculation.service

---

## 1. Source Tables

| SBill Table | Columns | Used In |
|------------|---------|---------|
| `tariff_charges` | id, name_en, flat_amount, flat_rate, recurring_mode, charge_group, upper_limit | Definition of each charge |
| `tariff_charges_details` | from_usage, to_usage, rate_value, extra_amount, calculated_amount | Tiered charges per charge |
| `invoice_details` | invoice_id, name, charge_group, amount (in milliemes) | Per-invoice line items |
| `invoice` | total_amt, open_amt, paid_amt | Invoice totals |

---

## 2. Complete Line Item Catalog

### 2.1 Consumption — chargeGroup=0 (STRIPES/TIERED)

| Property | Value |
|----------|-------|
| **Source table** | `tariff_charges` with `charge_group = 'CONSUMPTION'`, `tariff_charges_details` for tiers |
| **Formula** | `SUM over tiers: tier_units × rate_value + extra_amount` |
| **Calculation** | `calculateTieredCharge(consumption, consTiers)` — splits consumption across progressive brackets |
| **JRXML** | `$F{Cons} = SUM(amount) WHERE charge_group=0` |
| **Invoice column** | "قيمة الإستهلاك (جم)" — x=236, w=59 |
| **Display** | `amount / 1000` as EGP, format `#,##0.00` |
| **Display logic** | Always shown if consumption > 0. If zero consumption AND ZERO charge type exists, ZERO applies instead |
| **Example** | 250 kWh × tiers [0-100@50, 101-200@75, 201+@100] = 100×50 + 100×75 + 50×100 = 17,500 milliemes = 17.50 EGP |

### 2.2 Customer Service — chargeGroup=2,3 (TIERED)

| Property | Value |
|----------|-------|
| **Source table** | `tariff_charges` with `charge_group = 'CUSTOMER_SERVICE'`, `tariff_charges_details` for tiers |
| **Formula** | `SUM over tiers: tier_units × rate_value + extra_amount` (same as consumption) |
| **Calculation** | `calculateTieredCharge(consumption, csTiers)` — based on consumption volume |
| **JRXML** | `$F{CS} = SUM(amount) WHERE charge_group IN (2,3)` |
| **Invoice column** | "خدمة عملاء (جم)" — x=295, w=59 |
| **Display** | `amount / 1000` as EGP |
| **Display logic** | Always shown. If no CS tiers defined, falls back to fixed charges. Must apply even at zero consumption |
| **Example** | Consumption 150: [0-100@50, 101+@75] = 100×50 + 50×75 = 8,750 milliemes = 8.75 EGP |

### 2.3 Zero Reading Fee (Minimum Charge) — chargeGroup=4 (ZERO type)

| Property | Value |
|----------|-------|
| **Source table** | `tariff_charges` with `charge_group = 'ISSUE_FEES'` and ZERO charge type |
| **Known amount** | 9,000 milliemes (9.00 EGP) — confirmed from SBill solar data |
| **Formula** | IF consumption = 0 THEN `flat_amount` ELSE 0 |
| **JRXML** | Implicit: `invoice_details` subquery for charge_group=4 |
| **Invoice column** | "إدارية (جم)" — x=59, w=59 |
| **Display** | `amount / 1000` as EGP |
| **Display logic** | Only applied when consumption = 0. Acts as minimum invoice amount. Historical records show 36.10 EGP (old rate) → 9.00 EGP (current rate) |
| **Note** | This is NOT implemented in Meter Verse. The ZERO charge type from SBill maps to this behavior |

### 2.4 Radio Fees — chargeGroup=1

| Property | Value |
|----------|-------|
| **Source table** | `tariff_charges` — name_en = "Radio Fee" / "رسم إذاعة" |
| **Known amount** | 90 milliemes (0.09 EGP) per unit |
| **Upper limit** | MAX 90 units |
| **Formula** | `MIN(consumption × 90, 90 × 90)` = `MIN(consumption, 90) × 90` |
| **Calculation** | `min(consumption, upper_limit) × flat_rate` where upper_limit=90, flat_rate=90 |
| **JRXML** | `$F{OTHER} = SUM(amount) WHERE charge_group=1 AND name='رسم إذاعة'` |
| **Invoice column** | "رسوم ودمغات (جم)" — aggregated in x=177, w=59 |
| **Display** | `amount / 1000` as EGP |
| **Display logic** | If consumption > 90 units, capped at 90 units × 90 milliemes = 8,100 milliemes = 8.10 EGP |
| **Note** | Meter Verse has no upper_limit handling for per-unit charges |

### 2.5 Governmental Fee — chargeGroup=1

| Property | Value |
|----------|-------|
| **Source table** | `tariff_charges` — name_en = "Governorate Fee" / "رسم محافظه" |
| **Known amount** | 10 milliemes (0.01 EGP) flat per invoice |
| **Formula** | `flat_amount = 10` (always applied) |
| **JRXML** | Aggregated into `$F{OTHER}` |
| **Invoice column** | Aggregated in "رسوم ودمغات (جم)" |
| **Display** | `10 / 1000 = 0.01 EGP` |
| **Display logic** | Applied every month regardless of consumption |

### 2.6 Stamp Duty (Contract Stamp) — chargeGroup=1

| Property | Value |
|----------|-------|
| **Source table** | `tariff_charges` — name_en = "Contract Stamp" / "تمغة توريد - تعاقد" |
| **Known amount** | 3,000 milliemes (3.00 EGP) |
| **Recurring** | YEARLY — January only |
| **Formula** | IF month = January THEN `flat_amount = 3000` ELSE 0 |
| **JRXML** | `$F{OTHER}` subquery with name filter |
| **Invoice column** | Aggregated in "رسوم ودمغات (جم)" |
| **Display** | `3000 / 1000 = 3.00 EGP` |
| **Display logic** | Only appears in January invoices. This is how SBill implemements the "دمغة عقد" yearly charge |
| **Note** | Meter Verse has no recurring_mode field, so yearly charges cannot be filtered by month |

### 2.7 Sustainability Fees — chargeGroup=4 (TIERED)

| Property | Value |
|----------|-------|
| **Source table** | `tariff_charges` with `charge_group = 'ISSUE_FEES'` subcategory "Sustainability" |
| **Type** | STEPS (tiered by consumption) |
| **Formula** | Same tiered algorithm as consumption: `calculateTieredCharge(consumption, sustainTiers)` |
| **JRXML** | New water template: `$F{SustainFees} = SUM(amount) WHERE charge_group=4` |
| **Invoice column** | "إستدامة الخدمة (جم)" — water_new template x=177, w=59 |
| **Display** | `amount / 1000` as EGP |
| **Display logic** | Only on water_new template. Separate column from regular admin fees |

### 2.8 Other Fees — chargeGroup=4

| Property | Value |
|----------|-------|
| **Source table** | `tariff_charges` — charge_group = 'ISSUE_FEES' |
| **Known amount** | 27,000 milliemes (27.00 EGP) |
| **Formula** | `flat_amount = 27000` |
| **JRXML** | Included in `$F{Admin}` aggregate |
| **Invoice column** | "إدارية (جم)" on electricity template |
| **Display** | `27000 / 1000 = 27.00 EGP` |
| **Display logic** | Applied when the specific named charge exists in tariff |

### 2.9 Regulatory Services — chargeGroup=1

| Property | Value |
|----------|-------|
| **Source table** | `tariff_charges` — "Regulatory Services Fee" / "خدمات الجهاز التنظيمى" |
| **Rate** | 10 milliemes per unit |
| **Formula** | `consumption × 10` (NO upper limit) |
| **JRXML** | New water template: separate column |
| **Invoice column** | "خدمات الجهاز التنظيمى (جم)" — water_new x=118, w=59 |
| **Display** | `(consumption × 10) / 1000` as EGP |
| **Display logic** | Only on water_new template |

### 2.10 Consumption Stamp — chargeGroup=1

| Property | Value |
|----------|-------|
| **Source table** | `tariff_charges` — "Consumption Stamp" / "تمغة إستهلاك" |
| **Rate** | 32 milliemes per unit |
| **Formula** | `consumption × 32` |
| **JRXML** | `$F{OTHER}` subquery with name filter |
| **Invoice column** | Aggregated in "رسوم ودمغات (جم)" |
| **Display** | `(consumption × 32) / 1000` as EGP |
| **Display logic** | Always applied based on consumption volume |

---

## 3. Aggregation by Charge Group

| chargeGroup | Invoice Column | Formula | Line Items |
|-------------|---------------|---------|------------|
| 0 | قيمة الإستهلاك (جم) | Tiered calc | Consumption |
| 1 | رسوم ودمغات (جم) | Sum of items | Radio Fees + Gov Fee + Contract Stamp + Consumption Stamp + Regulatory Services |
| 2,3 | خدمة عملاء (جم) | Tiered calc | Customer Service Fees |
| 4 | إدارية (جم) / إستدامة الخدمة (جم) | Tiered + Flat | Admin Fees + Zero Fee + Sustainability Fees + Other Fees |
| 5 | (hidden) | % of cons | Percentage Charge |
| 6 | تسويات (جم) / قيمة مضافة (جم) | Signed value | Settlement / VAT |

---

## 4. Millieme Convention

All amounts in `invoice_details.amount` are stored in **milliemes** (1/1000 EGP):

| Line Item | Milliemes | EGP Display |
|-----------|-----------|-------------|
| Zero Fee | 9,000 | 9.00 |
| Radio Fee cap | 8,100 | 8.10 |
| Gov Fee | 10 | 0.01 |
| Contract Stamp | 3,000 | 3.00 |
| Other Fees | 27,000 | 27.00 |

Display formula: `$F{amount}.doubleValue() / 1000` with format `#,##0.00`

---

## 5. Current Meter Verse Gaps

| Line Item | Meter Verse | Gap |
|-----------|-------------|-----|
| Consumption | ✅ Implemented via `calculateTieredCharge()` | — |
| Customer Service | ⚠️ Implemented but depends on tier data provision | Need DB loader for CS tiers |
| Zero Fee (9 EGP) | ❌ Not implemented | No ZERO charge type |
| Radio Fees capped | ❌ Not implemented | No upper_limit handling |
| Gov Fee (0.01) | ⚠️ Works as fixed charge | — |
| Contract Stamp yearly | ❌ Not implemented | No recurring_mode/yearly filter |
| Sustainability Fees | ⚠️ Works as fixed but should be tiered | Need tier data loader |
| Other Fees (27 EGP) | ✅ Works as fixed charge | — |
| Regulatory Services | ❌ Not implemented | No per-unit formula with chargeGroup=1 |
| Consumption Stamp | ❌ Not implemented | No per-unit formula for chargeGroup=1 |
