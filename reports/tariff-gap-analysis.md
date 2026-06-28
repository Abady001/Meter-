# Phase 13: Tariff Gap Analysis — SBill vs Meter Verse

> **Status**: INVESTIGATION / PLANNING ONLY.
> **Scope**: Complete feature-by-feature comparison of tariff engine capabilities.

---

## 1. Feature Comparison Matrix

| # | Feature | SBill | Meter Verse | Gap | Severity |
|---|---------|-------|-------------|-----|----------|
| 1 | Tariff versioning | `startDate`/`endDate` per tariff with `parent_id` chain | No versioning — single active tariff | ❌ | CRITICAL |
| 2 | Charge types | STEPS, FLAT, STATIC, PER_UNIT, ZERO (5 types) | Only 1 charge mode (tiered v.s. flat) | ❌ | CRITICAL |
| 3 | Minimum charge | ZERO type — 9,000 milliemes when consumption=0 | Not implemented | ❌ | HIGH |
| 4 | Yearly charges | recurring_mode=YEARLY (e.g. contract stamp in January) | No recurring_mode field | ❌ | HIGH |
| 5 | Per-unit upper limit | upper_limit column (Radio fee capped at 90 units) | Not implemented | ❌ | MEDIUM |
| 6 | recurring_mode | DAILY/MONTHLY/YEARLY/ONCE | Not implemented | ❌ | HIGH |
| 7 | Millieme convention | All amounts stored in milliemes (int) | EGP decimals (float) — conversion needed | ⚠️ | MEDIUM |
| 8 | Charge group mapping | Strings: CONSUMPTION, FEES, TAX, ISSUE, ZERO | Numbers: 0-7 with string alias mapping | ⚠️ | MEDIUM |
| 9 | Customer service tiers | STEPS-based on consumption volume | STEPS exists in service but tiers not in DB | ⚠️ | MEDIUM |
| 10 | Percentage charge | PERCENTAGE group 5 — % of consumption | Implemented via percentageRate param | ✅ | — |
| 11 | Flat charge (monthly) | FLAT type — flat_amount per month | Works as fixed charge | ✅ | — |
| 12 | Tiered consumption | STEPS — from_usage/to_usage/rate_value | Implemented via calculateTieredCharge() | ✅ | — |
| 13 | Extra amount per tier | extra_amount column in tariff_charges_details | Supported in calculateTieredCharge() | ✅ | — |
| 14 | STATIC charge type | Fixed monthly amount (e.g. 27 EGP admin fee) | Works via fixedCharges array | ⚠️ | LOW |
| 15 | PER_UNIT charge type | Rate per unit × consumption (e.g. Regulatory 10/unit) | Not implemented — no PER_UNIT formula | ❌ | HIGH |
| 16 | Settlement charges | charge_group=6, signed amounts | Implemented | ✅ | — |
| 17 | Tax (VAT) | Percentage of subtotal | Implemented via taxRate param | ✅ | — |
| 18 | Utility-specific charge groups | Water has PERCENTAGE (5), VAT (6); water_new has SUSTAIN_FEES (4), SERVICE_FEES (1) | Configurable per template via chargeGroupMapping | ✅ | — |
| 19 | Template column mapping | JRXML column positions per utility | TemplateConfig with x/width per utility type | ✅ | — |
| 20 | Charge group 7 (OTHER) | Used in water_new template | Exists in utility-config but not in template column | ⚠️ | LOW |
| 21 | Multiple charge groups per column | [2,3] → CUSTOMER_SERVICE, [12,13] → SETTLEMENT | Supported in TemplateColumn.chargeGroups | ✅ | — |
| 22 | Bill cycle batch processing | Batch invoice generation per utility/month | Stub POST /invoices/generate exists (T053) | ⚠️ | MEDIUM |
| 23 | Arabic amount conversion | NumberToArabic.convertToArabic() text render | Available in template renderer | ✅ | — |

---

## 2. Gap Severity Summary

| Severity | Count | Description |
|----------|-------|-------------|
| CRITICAL | 2 | Blocking production use — tariffs cannot be created or versioned |
| HIGH | 4 | Missing charge mechanisms cause incorrect invoice amounts |
| MEDIUM | 5 | Functional but causes data differences or manual workarounds |
| LOW | 2 | Cosmetic or edge-case issues |
| **Total Gaps** | **13** | |
| Fully Implemented | 10 | Features marked ✅ |

---

## 3. Detailed Gap Analysis

### CRITICAL: Tariff Versioning (Gap #1)

**SBill**: Tariff has `start_date`, `end_date`, `parent_id`. The bill-cycle query picks the correct version based on `$P{bill_cycle}`:
```sql
WHERE (t.id = m.tariff_id AND t.start_date <= $P{bill_cycle} 
       AND (t.end_date IS NULL OR t.end_date > $P{bill_cycle}))
   OR (t.parent_id = m.tariff_id AND t.start_date <= $P{bill_cycle} 
       AND (t.end_date IS NULL OR t.end_date > $P{bill_cycle}))
```

**Meter Verse**: No versioning. A tariff is simply assigned to meter with no date range. If tariff rates change mid-year, there is no way to determine which rate applies to which billing period.

**Impact**: Tariff rate changes would require changing every meter's tariff assignment simultaneously. Historical invoices cannot be recalculated with the correct vintage tariff.

### CRITICAL: Missing Charge Types (Gap #2)

**SBill** has 5 charge types driving all calculation logic:
| Type | Behavior | Example |
|------|----------|---------|
| STEPS | Progressive tiers by consumption | Consumption at 0-100→50, 101+→75 |
| FLAT | fixed_rate × consumption | Not commonly used |
| STATIC | Fixed monthly amount | Admin fee 27 EGP |
| PER_UNIT | rate × consumption (with optional upper_limit) | Radio fee 90/u capped at 90u |
| ZERO | Applied when consumption = 0 | Minimum charge 9 EGP |

**Meter Verse** deduces behavior from data shape (has tiers? → STEPS, has flat_amount? → static). No explicit type discriminator.

**Impact**: Cannot distinguish between FLAT and STATIC. PER_UNIT and ZERO not supported at all.

### HIGH: No Minimum Charge (Gap #3)

- SBill applies ZERO charge (9,000 milliemes) when consumption = 0
- Meter Verse returns 0 total for zero consumption
- This is the most impactful billing error — every zero-consumption invoice would be wrong

### HIGH: No Yearly Charges (Gap #4)

- Contract stamp (دمغة عقد) = 3,000 milliemes applied only in January
- Meter Verse has no recurring_mode to filter by month
- January invoices missing 3 EGP charge

### HIGH: No recurring_mode (Gap #6)

Without DAILY/MONTHLY/YEARLY/ONCE support:
- Yearly charges always applied (or never)
- One-time setup fees cannot be distinguished from recurring charges
- Daily proration impossible

### HIGH: No PER_UNIT Support (Gap #15)

- Regulatory Services: 10 milliemes/unit × consumption
- Consumption Stamp: 32 milliemes/unit × consumption
- These are different from fixed charges (amount varies with consumption) and different from tiers (single rate, not progressive)
- Meter Verse can only represent these as tiers, which is semantically wrong

---

## 4. Implementation Priority

| Priority | Gaps | Effort Estimate | Business Impact |
|----------|------|----------------|-----------------|
| P0 | 1, 2, 3 | 2-3 days | Wrong invoices for all zero-consumption meters |
| P1 | 4, 6 | 1-2 days | January invoices undercharged |
| P2 | 5, 15 | 1 day | Radio/consumption fees incorrect |
| P3 | 7, 8 | 0.5 day | Millieme conversion, group mapping |
| P4 | 9, 22 | 1 day | Customer service tier data not in DB |
| P5 | 14, 20 | 0.5 day | STATIC handling, OTHER column |

---

## 5. Summary

| Category | Score | Status |
|----------|-------|--------|
| Tariff Data Model completeness | 40/100 | Missing versioning, charge types, recurring modes |
| Calculation Engine completeness | 35/100 | Missing ZERO, PER_UNIT, STATIC, upper limit |
| Invoice Display | 85/100 | Templates match JRXML, millieme display correct |
| Overall | 42/100 | **Not production-ready for billing** |
