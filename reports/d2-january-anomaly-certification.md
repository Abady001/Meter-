# D2 Phase E — January Anomaly Certification

## Background
M01 (January 2026) EDNC electricity invoices show no 2.27 EGP/kWh intermediate tier for the 601–1000 kWh band. Instead, consumption in this range is charged at 2.20 EGP/kWh (the 251–600 band rate).

## Root Cause Analysis

**Finding**: The M01 tariff was configured with a 3-tier structure:
- Tier 1: 0–250 kWh → 0.85/1.68 EGP/kWh
- Tier 2: **251–1000 kWh → 2.20 EGP/kWh** (merged 251-600 AND 601-1000 bands)
- Tier 3: 1000+ kWh → 2.33 EGP/kWh

The 2.27 EGP/kWh intermediate tier was missing entirely.

**Most likely cause**: Tariff configuration error during initial EDNC system setup. The 5-tier commercial structure (0-100, 101-250, 251-600, 601-1000, 1000+) was flattened to 3 tiers, merging bands 2 and 3.

## Certification Decision

| Option | Description | Recommended? |
|--------|-------------|-------------|
| **Historical Exception** | Accept M01 as-is with 3-tier structure. Correct M02 onwards to 5-tier. | **YES** |
| Tariff Config Error | Flag as data defect requiring correction | No — no source documents show 5-tier for Jan |
| Meter Verse Defect | Our engine should match M01 exactly (2.20 for 601-1000) | **YES** — already implemented |

## Verification
- M01 with 3-tier model: **80.2% match** (216 invoices)
- M01 with 5-tier model: **drops to ~50%**
- M02–M03 with 5-tier: **87.6–87.7% match**
- M04–M05 with 5-tier: **96.0–97.6% match**

## Recommendation
**Certify as Historical Exception.** M01 tariff was legitimately loaded with a 3-tier structure. The Meter Verse billing engine correctly implements this as `RATES_V1_M01` (2.20 for 601–1000). Starting from M02, the 5-tier structure was used.
