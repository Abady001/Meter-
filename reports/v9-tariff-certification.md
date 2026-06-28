# V9 — Tariff Certification

**Date**: 2026-06-18
**Method**: Compare implementation vs Billing + Collections architecture

## Current Implementation
| Model | Schema | Status |
|-------|--------|--------|
| `TariffPlan` (sim_system) | Flat rate per meter type | ✅ WORKING CRUD API |
| Invoice calculation | `ratePerUnit * consumption` | ✅ WORKING |
| Tariff creation | POST /tariffs | ✅ FIXED (was 500) |

## Spec Architecture (from Billing + Collections)
| Feature | Status |
|---------|--------|
| Multi-charge tariffs (5 modes) | ❌ Models exist, no code |
| Tiered pricing | ❌ Models exist, no code |
| Versioned tariffs | ❌ Models exist, no code |
| Settlement types (3) | ❌ Models exist, no code |
| Gas tariff support | ❌ Not implemented |
| Solar tariff support | ❌ Not implemented |
| Chilled water tariff support | ❌ Not implemented |
| TariffsPage UI | ❌ Missing (only hardcoded table in Settings) |

## Conclusion
**TARIFF_CERTIFIED = NO** — Simple MVP tariff works; full billing architecture not implemented.
