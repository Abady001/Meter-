# D2 Phase B — Commercial Tariff Implementation Report

## Summary
Added 10 commercial tariff tier rows (2 versions × 5 bands) to `collection.db` for EDNC electricity replay certification.

## Tariff Versions Added

### V1 — EDNC Commercial V1 (Jan–Mar 2026)
| DB ID | Band (kWh) | Rate (EGP/kWh) | Valid From | Valid To |
|-------|-----------|----------------|------------|----------|
| 34 | 0 – 100 | 0.850 | 2026-01-01 | 2026-03-31 |
| 35 | 100 – 250 | 1.680 | 2026-01-01 | 2026-03-31 |
| 36 | 250 – 600 | 2.200 | 2026-01-01 | 2026-03-31 |
| 37 | 600 – 1000 | 2.270 | 2026-01-01 | 2026-03-31 |
| 38 | 1000+ | 2.330 | 2026-01-01 | 2026-03-31 |

### V2 — EDNC Commercial V2 (Apr–May 2026)
| DB ID | Band (kWh) | Rate (EGP/kWh) | Valid From | Valid To |
|-------|-----------|----------------|------------|----------|
| 39 | 0 – 100 | 1.620 | 2026-04-01 | 2026-05-31 |
| 40 | 100 – 250 | 2.160 | 2026-04-01 | 2026-05-31 |
| 41 | 250 – 600 | 2.640 | 2026-04-01 | 2026-05-31 |
| 42 | 600 – 1000 | 2.740 | 2026-04-01 | 2026-05-31 |
| 43 | 1000+ | 2.790 | 2026-04-01 | 2026-05-31 |

## Tariff Structure Notes
- **Mode**: STEP (each row defines a consumption band with its rate)
- **Flat-per-band billing**: Unlike residential progressive tariffs, EDNC commercial charges ALL consumption at the rate matching the band the consumption falls into
- **M01 January Anomaly**: Historical data shows no 2.27 intermediate tier for 601–1000 kWh in M01; 2.20 was used instead. This anomaly is documented separately (Phase E)
- **CSRV (Customer Service Fee)**: Not stored in Tariff table — hardcoded as 5/15/20/25/40 EGP per consumption band
- **Stamp tax**: 0.032 EGP/kWh — not stored in Tariff table, applied as a separate line item

## Data Source
- `reference/collection-system/app/models.py` — Tariff model (line 415)
- `reference/collection-system/instance/collection.db` — SQLite database
- Tariff rates sourced from D1 tariff reverse-engineering (marginal rate analysis of 379 samples across 220 meters)

## DB Changes
- Tool: `reference/collection-system/tools/add_commercial_tariffs.py`
- 10 new rows in `tariff` table (IDs 34–43)
- Total tariffs in DB: 43 (13 residential + 6 water + 1 chilled + 13 solar + 10 commercial)

## Regression Validation
- **26/26** pytest tests PASS (comprehensive + settlement)
- No existing tariff IDs modified — only appended new rows
- Residential, water, chilled, and solar tariffs unchanged

## Next Phase (Phase C)
Replay all 1,099 invoices through the Meter Verse billing engine using the commercial tariff rates from this implementation.
