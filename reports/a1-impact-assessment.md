# PHASE A-1: Impact Assessment — Solar Minimum Charge

## Affected Invoices

| Metric | Value |
|--------|-------|
| **36.10 EGP invoices** | 126 |
| **9.10 EGP invoices** | 732 |
| **Total minimum-charge invoices** | 858 |
| **Unique customers (36.10)** | 16 |
| **Unique customers (9.10)** | 39 |

## Financial Impact of 36.10 EGP Minimum

### If 36.10 was intentional (Legacy Rule — Decision C)
| Metric | Value |
|--------|-------|
| Billed total (126 invoices @ 36.10) | 4,548.60 EGP |
| No correction needed | 0.00 EGP |
| **Net impact** | **0.00 EGP** |

### If 36.10 should have been 9.10 (Billing Defect — Decision D)
| Metric | Value |
|--------|-------|
| Actual billed | 4,548.60 EGP |
| Corrected (126 × 9.10) | 1,146.60 EGP |
| **Overcharge** | **3,402.00 EGP** |
| Customers overcharged | 16 |
| Max overcharge per customer | 360.00 EGP (52051450 — 12 months) |
| Min overcharge per customer | 54.00 EGP (52051442 — 2 months) |

### If 36.10 should have been 11.00 (Meter Verse Code — currently applicable)
| Metric | Value |
|--------|-------|
| Historical billed | 4,548.60 EGP |
| Current code would produce (126 × 11.00) | 1,386.00 EGP |
| **Historical vs Current** | **3,162.60 EGP difference** |

## Risk Assessment

| Risk | Level | Description |
|------|-------|-------------|
| Customer disputes | MEDIUM | 16 customers overpaid 36.10 vs 9.10. If challenged, 3,402 EGP liability. |
| Regulatory compliance | LOW | The 36.10 was applied uniformly. No discrimination. |
| Audit findings | MEDIUM | Historical minimum differs from current code (11.00 vs historical 9.10/36.10). Reconciliation needed. |
| Production deployment | HIGH | Current Meter Verse code produces WRONG minimum (11.00) compared to historical precedent (9.10). Release will under-bill by 1.90 EGP/month/customer at zero consumption. |
| Data loss | HIGH | No tariff version history preserved. All pre-2026-06-13 tariff configurations lost. |

## Production Risk Summary

1. **Current Meter Verse code produces 11.00 EGP minimum** for solar customers at zero consumption. Historical minimum was 9.10 EGP (post-2022) or 36.10 EGP (2021-2022).

2. **If deployed as-is**: Every solar customer with zero consumption will be billed 11.00 instead of 9.10 — a **1.90 EGP overcharge per zero-consumption month**. At 60+ zero-consumption months annually across all customers, this is approximately 114+ EGP/year in overbilling.

3. **If historical 36.10 is the correct minimum**: Current code would underbill by 25.10 EGP per month per affected customer (36.10 - 11.00). At 16 previously affected customers, approximately 4,819+ EGP/year in underbilling.

4. **Tariff versioning is not implemented**: The `tariff_version` table is empty. Any tariff change cannot be tracked or audited.

## Recommended Action

1. **Agree the correct minimum** between 9.10 EGP (most recent historical) and 11.00 EGP (current code).
2. **Document the chosen value** as an explicit business rule.
3. **Implement tariff version tracking** to preserve future changes.
