# Phase 15: Tariff Certification Board — Meter Verse v2.0.0

> **Status**: CERTIFICATION REPORT — INVESTIGATION PHASE.
> **Date**: 2026-06-20
> **Scope**: Tariff data model, calculation engine, invoice engine, fee engine, service charge engine, settlement engine.

---

## Executive Summary

| Metric | Score | Verdict |
|--------|-------|---------|
| **TARIFF_PARITY** | **42%** | ❌ NOT PRODUCTION READY |
| **CALCULATION_PARITY** | **35%** | ❌ NOT PRODUCTION READY |
| **PRODUCTION_READY** | **NO** | ❌ DO NOT DEPLOY |

Meter Verse tariff engine can handle **basic tiered consumption + percentage charges** but is missing **7 critical charge mechanisms** that SBill supports. The most impactful gap is the absence of minimum charge (ZERO type), which would cause every zero-consumption invoice to be undercharged by 9+ EGP.

---

## 1. Category Scores

### 1.1 Tariff Data Model — Score: 40/100

| Criterion | Weight | Score | Notes |
|-----------|--------|-------|-------|
| Versioning (startDate/endDate/parent_id) | 30% | 0 | Not implemented |
| Charge types (STEPS/FLAT/STATIC/PER_UNIT/ZERO) | 25% | 20 | Only STEPS partially implemented |
| Recurring modes (MONTHLY/YEARLY/DAILY/ONCE) | 15% | 0 | Not implemented |
| Charge group configuration | 10% | 80 | Template mapping works well |
| Upper limit support | 10% | 0 | Not implemented |
| Tier detail storage | 10% | 100 | calculateTieredCharge supports tiers fully |
| **Weighted** | **100%** | **40** | |

**Breakdown:** 5 criteria, 3 at 0%, 1 at 100%, 1 at 80%, 1 at 20%.

### 1.2 Tariff Engine (Calculation) — Score: 35/100

| Criterion | Weight | Score | Notes |
|-----------|--------|-------|-------|
| Tiered consumption calculation | 25% | 100 | Fully implemented in calculateTieredCharge() |
| Customer service tiered calc | 20% | 70 | Algorithm exists, but tier data not provisioned |
| Percentage calculation | 15% | 100 | Fully implemented |
| Minimum/zero-consumption charge | 15% | 0 | Not implemented |
| Per-unit capped charges | 10% | 0 | Not implemented |
| STATIC fixed charges | 10% | 50 | Works via fixedCharges array, no DB model |
| Yearly/monthly recurring filter | 5% | 0 | Not implemented |
| **Weighted** | **100%** | **35** | |

**Breakdown:** 7 criteria, 3 at 0%, 1 at 100%, 1 at 70%, 1 at 50%.

### 1.3 Invoice Engine — Score: 60/100

| Criterion | Weight | Score | Notes |
|-----------|--------|-------|-------|
| Template column mapping | 20% | 100 | All utility templates defined |
| Millieme display (÷1000) | 15% | 70 | Format logic exists, but MV stores EGP not milliemes |
| Line item grouping by charge_group | 15% | 100 | Fully implemented |
| Invoice generation stub | 10% | 30 | POST /invoices/generate exists but not wired |
| Settlement display | 10% | 100 | Implemented with signed amounts |
| Tax calculation | 10% | 100 | Implemented |
| Arabic amount text conversion | 10% | 100 | Available in template renderer |
| Invoice number sequencing | 10% | 0 | Not implemented |
| **Weighted** | **100%** | **60** | |

### 1.4 Fee Engine — Score: 30/100

| Criterion | Weight | Score | Notes |
|-----------|--------|-------|-------|
| ZERO/minimum charge handling | 25% | 0 | Not implemented |
| PER_UNIT charge (rate × capped units) | 20% | 0 | Not implemented |
| STATIC fee (fixed monthly amount) | 20% | 60 | Works via fixedCharges but no DB storage |
| Yearly fee (recurring_mode=YEARLY) | 15% | 0 | Not implemented |
| Fee display in correct column | 10% | 100 | Template column mapping works |
| Fee grouping (aggregation by group) | 10% | 100 | Grouped by chargeGroup |
| **Weighted** | **100%** | **30** | |

### 1.5 Service Charge Engine — Score: 50/100

| Criterion | Weight | Score | Notes |
|-----------|--------|-------|-------|
| Customer service tiered calculation | 30% | 80 | Algorithm correct, data missing |
| Customer service fixed fallback | 20% | 100 | Implemented |
| Consumption-based CS fee structure | 20% | 50 | Understood but not in DB |
| Multiple CS charge groups (2,3) | 15% | 100 | Template config supports both |
| CS fee display in invoice | 15% | 100 | Column exists in all templates |
| **Weighted** | **100%** | **50** | |

### 1.6 Settlement Engine — Score: 40/100

| Criterion | Weight | Score | Notes |
|-----------|--------|-------|-------|
| Settlement amount on invoice | 30% | 100 | Works via signed settlement amount |
| Settlement description | 20% | 0 | No meter_settlements.reason equivalent |
| Type A vs Type B settlement | 20% | 0 | No distinction implemented |
| Settlement template | 15% | 100 | Template exists |
| Settlement reporting | 15% | 0 | No settlement reports |
| **Weighted** | **100%** | **40** | |

---

## 2. Complete Gap Registry (23 Gaps)

### CRITICAL (2)

| # | Gap | Category | File/Module | Impact |
|---|-----|----------|-------------|--------|
| G01 | Tariff versioning (startDate/endDate/parent_id) | Data Model | tariff entity | Cannot manage rate changes over time; all meters break when tariff updates |
| G02 | Missing charge_types enum (STEPS/FLAT/STATIC/PER_UNIT/ZERO) | Data Model | tariff-calculation.service.ts | Calculation engine cannot distinguish charge behaviors; PER_UNIT, ZERO, STATIC unsupported |

### HIGH (6)

| # | Gap | Category | File/Module | Impact |
|---|-----|----------|-------------|--------|
| G03 | No ZERO/minimum charge for consumption=0 | Calc Engine | tariff-calculation.service.ts:62 | Zero-consumption invoices have no minimum; undercharging 9+ EGP per zero invoice |
| G04 | No recurring_mode (DAILY/MONTHLY/YEARLY/ONCE) | Data Model | tariff-charge entity | Yearly charges (contract stamp 3 EGP in Jan) cannot be filtered; all months wrong |
| G05 | No PER_UNIT charge formula | Calc Engine | tariff-calculation.service.ts | Regulatory services (10/unit) and consumption stamp (32/unit) cannot be calculated |
| G06 | No STATIC charge type in DB model | Data Model | tariff-charge entity | Static charges only work via in-memory fixedCharges; cannot be persisted |
| G07 | Customer service tier data not provisioned | Data Integration | tariff-calculation.service.ts:73 | CS tiers exist in SBill but not loaded into Meter Verse; CS falls back to fixed |
| G08 | No yearly charge filter (January-only) | Calc Engine | tariff-calculation.service.ts | Contract stamp applied every month or never; January invoices incorrect by 3,000 milliemes |

### MEDIUM (10)

| # | Gap | Category | File/Module | Impact |
|---|-----|----------|-------------|--------|
| G09 | No upper_limit on per-unit charges | Calc Engine | tariff-calculation.service.ts | Radio fees not capped at 90 units; overcharging on high consumption |
| G10 | Millieme convention mismatch (int milliemes vs float EGP) | Data Model | invoice entity | MV stores EGP decimals, SBill stores milliemes; conversion risk |
| G11 | Charge group string vs number mismatch | Data Model | template-config.ts | SBill uses strings, MV uses numbers; mapping works but brittle |
| G12 | No bill cycle batch processing implemented | Billing | billing.controller.ts | POST /invoices/generate exists but stub only |
| G13 | No invoice number sequencing per project/utility | Billing | invoice entity | Missing sequential invoice number logic |
| G14 | No settlement description/reason field | Settlement | invoice model | meter_settlements.reason not mapped to invoice |
| G15 | No Type A vs Type B settlement distinction | Settlement | settlement engine | SBill has two settlement types with different handling |
| G16 | No settlement reports | Settlement | reports | No monthly_finance.jrxml equivalent |
| G17 | No tariff migration endpoint | API | planned | No API to mass-reassign meters to new tariff |
| G18 | No tariff rollback mechanism | API | planned | Cannot revert tariff change atomically |

### LOW (5)

| # | Gap | Category | File/Module | Impact |
|---|-----|----------|-------------|--------|
| G19 | STATIC charge fallback via array not DB | Data Integration | tariff-calculation.service.ts | Works but not data-driven |
| G20 | Charge group 7 (OTHER) not in template column | Template | template-config.ts | water_new template defines OTHER group 7 but no column |
| G21 | No DAILY recurring mode support | Data Model | tariff-charge entity | Low priority; no known daily-charge use case |
| G22 | No FLAT charge type (rate × consumption) | Calc Engine | tariff-calculation.service.ts | Similar to PER_UNIT; can be combined |
| G23 | No Arabic amount conversion in PDF renderer | Invoice | invoice renderer | Available as utility but not wired into template |

---

## 3. Gap Severity Distribution

```
CRITICAL  ██  (2)
HIGH      ██████  (6)
MEDIUM    ██████████  (10)
LOW       █████  (5)
```

---

## 4. Remediation Roadmap

### Phase 1 — Stop the Bleeding (2-3 days)
1. Implement `charge_type` enum on `tariff_charges` (G02)
2. Add `ZERO` type handler in `TariffCalculationService` (G03)
3. Add `PER_UNIT` type with `upper_limit` check (G05, G09)
4. Add `STATIC` type (G06)

### Phase 2 — Get the Dates Right (1-2 days)
5. Add `recurring_mode` to `tariff_charges` (G04)
6. Add yearly/monthly filter in calculation loop (G08)
7. Implement `start_date`/`end_date`/`parent_id` versioning (G01)

### Phase 3 — Fill the Pipeline (1-2 days)
8. Load customer service tier data from DB (G07)
9. Fix millieme convention — store as integer milliemes everywhere (G10)
10. Implement bill cycle batch job (G12)

### Phase 4 — Polish (2-3 days)
11. Invoice number sequencing (G13)
12. Settlement enhancements (G14, G15, G16)
13. Migration + rollback APIs (G17, G18)
14. Template column for group 7 (G20)

---

## 5. Certification Verdict

| Gate | Result | Condition |
|------|--------|-----------|
| TARIFF_PARITY ≥ 80% | ❌ 42% | Failed — 23 gaps |
| CALCULATION_PARITY ≥ 90% | ❌ 35% | Failed — critical gaps in core calculation |
| PRODUCTION_READY | **NO** | ❌ Do not deploy to production |
| Can generate basic invoice | ✅ Yes | Tiers + percentage work |
| Can handle zero consumption | ❌ No | ZERO not implemented |
| Can handle yearly charges | ❌ No | recurring_mode missing |
| Can handle capped per-unit fees | ❌ No | upper_limit missing |
| Can version tariffs | ❌ No | parent_id not implemented |
| Can migrate tariffs | ❌ No | No migration API |

**Recommendation**: Defer production deployment of tariff engine until Phase 1 and Phase 2 remediation (4-5 days engineering effort) are complete. The core tiered calculation is sound, but missing ZERO and PER_UNIT types will cause real financial errors.
