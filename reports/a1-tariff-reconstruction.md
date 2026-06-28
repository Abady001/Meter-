# PHASE A-1: Tariff Reconstruction

## Current Tariff Data (collection.db)

### Tariff Table Schema
```
id | name | type | mode | from_value | to_value | rate | flat_rate | version | valid_from | valid_to | status
```

### Solar Tariff (13 tiers, all STEP mode, version=1, valid_from=2026-06-13)
| Tier | From (kWh) | To (kWh) | Rate (EGP) |
|------|-----------|---------|------------|
| 1 | 0 | 50 | 0.48 |
| 2 | 50 | 100 | 0.58 |
| 3 | 100 | 150 | 0.68 |
| 4 | 150 | 200 | 0.78 |
| 5 | 200 | 300 | 0.88 |
| 6 | 300 | 400 | 0.98 |
| 7 | 400 | 500 | 1.08 |
| 8 | 500 | 600 | 1.18 |
| 9 | 600 | 700 | 1.28 |
| 10 | 700 | 800 | 1.38 |
| 11 | 800 | 900 | 1.48 |
| 12 | 900 | 1000 | 1.58 |
| 13 | 1000 | 999999 | 1.68 |

The solar tariff rates are **identical** to the electricity tariff rates. The only difference is the `type` field (`solar` vs `electricity`).

### Historical Tariff Data (collection_backup.db — legacy system)

Schema: `id | type | from_value | to_value | rate | unit`
Same 13-tier solar structure as current, same rates.

### Tariff Version Table (collection.db)
The `tariff_version` table exists but contains **0 rows**. No version history is recorded.

### Tariff Charge Tables
Both `tariff_charge` and `tariff_charge_detail` tables exist but contain **0 rows** in collection.db. The legacy backup DB does not have these tables. The charge engine in `charge_engine.py` Defines 5 charge types (STEPS/FLAT/STATIC/PER_UNIT/ZERO + settlements FIXED/PERCENTAGE/ONE_TIME), but no charge records exist in the database.

## Projects Affected

| Project | Solar Customers | Has 36.10 | Has 9.10 |
|---------|----------------|-----------|----------|
| Golf Extension | 37 | ✓ | ✓ |
| Golf Views | 11 | ✓ | ✓ |
| The Crown | 6 | ✗ | ✓ |

Golf Extension has the most 36.10-affected customers (12 out of 37).

## Customer Unit Types
- Villas: 40 customers (all affected by minimum charge)
- Blocks: 8 customers (all have minimum charge — 36.10 and/or 9.10)
- Other: Mosque (1 customer — only 9.10)

All 16 customers affected by the 36.10 minimum are residential (Villas or Blocks).

## Key Finding: No Archived Tariff Versions
None of the databases contain tariff version history. The `valid_from=2026-06-13` on all current tariffs proves these were created on June 13, 2026 — AFTER all historical invoices. The actual tariffs that generated the 2021-2022 invoices have been **overwritten and lost**. Only the current tariff configuration survives.

## Legacy Fee Structure (from invoice_calculation_2020.xlsx)

### Residential (منزلي) — Zero Consumption
| Fee | Amount |
|-----|--------|
| Zero Consumption | 9.00 |
| TV (0.002/kWh, max 0.09) | 0.00 |
| Governmental (0.1/kWh) | 0.00 |
| Consumption (0.03/kWh) | 0.00 |
| ESU | 3.00 |
| Jan (annual) | 0.00 or 3.00 |
| **Total** | **12.00 or 15.00** |

### Commercial (تجاري) — Zero Consumption
| Fee | Amount |
|-----|--------|
| Customer Service | 20.00 |
| ESU | 3.00 |
| **Total** | **23.00** |

### Under Construction Residential (إنشائي منزلي)
| Fee | Amount |
|-----|--------|
| Customer Service | 40.00 |
| Issue Fee | 3.00 |
| Supply Stamp | 3.00 |
| Governorate | 0.01 |
| **Total** | **46.01** |

### Under Construction Commercial (إنشائي تجاري)
| Fee | Amount |
|-----|--------|
| Customer Service | 40.00 |
| Issue Fee | 3.00 |
| Governorate | 0.01 |
| **Total** | **43.01** |

None of these fee structures produce exactly 36.10 or 9.10 EGP.
