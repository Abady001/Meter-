# G8 — Pre-Stage-2 Certification Board

**Date**: 2026-06-19

## Certification Results
| Criterion | Status | Blocker |
|-----------|--------|---------|
| DATA_READY | ✅ **YES** | — |
| DASHBOARD_READY | ✅ **YES** | — |
| TARIFF_READY | ❌ **NO** | No service layer for tariff_charge / tariff_charge_detail |
| UTILITY_READY | ❌ **NO** | MeterType only has 3 values; UtilityType only has 2 |
| COLLECTION_READY | ❌ **NO** | No aging, collections dashboard, or campaign tracking |
| FINANCIAL_TREE_READY | ⚠️ **PARTIAL** | balanceBefore/After fields exist but not populated |
| WORKFLOW_READY | ⚠️ **PARTIAL** | Core flow works; invoice→payment→collection chain incomplete |
| MOCK_FREE | ✅ **YES** | No mock-data imports in any component |
| SIDEBAR_READY | ❌ **NO** | Solar, Chilled Water, Upload Center, Admin pages missing |

```
READY_FOR_STAGE_2 = NO
```

## 5 Blockers & Remediation

| # | Blocker | Fix | Effort |
|---|---------|-----|--------|
| 1 | **TARIFF** — No service for tariff_charge / tariff_charge_detail | Wire TariffCharge + TariffChargeDetail into the billing service | ~4h |
| 2 | **UTILITY** — MeterType/UtilityType enums too limited | Add chilled_water, solar, settlement, gas to both enums + migration | ~1h |
| 3 | **FINANCIAL TREE** — balanceBefore/After not populated | Update invoice generation to read customer balance and write balance fields | ~2h |
| 4 | **COLLECTION** — No aging/collections dashboard | Build basic collections KPIs (overdue, aging buckets) on dashboard | ~4h |
| 5 | **SIDEBAR** — Missing menu items for future utilities | Add nav entries for Utilities, Upload Center, Admin sections | ~1h |

**Total to clear all blockers**: ~12 hours

## Blocked Until Cleared
- ❌ Electricity Invoice PDF
- ❌ Water Invoice PDF
- ❌ Solar Invoice
- ❌ Chilled Water Invoice
- ❌ Settlement Invoice
- ❌ Payment Receipt
- ❌ Customer Statement
- ❌ All SBill-matched reports
