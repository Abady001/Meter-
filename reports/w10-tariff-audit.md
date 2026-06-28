# W10 — Tariff Structure Audit

**Date**: 2026-06-18
**Method**: Compare implementation vs billing/collections architecture

## Current Implementation
| Model | Schema | Status |
|-------|--------|--------|
| `TariffPlan` (sim_system) | Flat rate per meter type | ✅ Working CRUD API |
| Invoice generation | `ratePerUnit * consumption` | ✅ Integrated |

## Spec Architecture (from Billing + Collections systems)
| Model | Schema | Status |
|-------|--------|--------|
| `Tariff` (features) | Multi-charge, multi-version | ❌ Models exist, no code |
| `TariffVersion` (features) | Versioned tariffs | ❌ Models exist, no code |
| `TariffCharge` (features) | 5 charge modes (STEPS/FLAT/STATIC/PER_UNIT/ZERO) | ❌ Models exist, no code |
| `TariffChargeDetail` (features) | Tiered pricing | ❌ Models exist, no code |
| Area tariff tables (data-model.md) | 4 tables | ❌ Not in Prisma |

## Frontend
- No `TariffsPage.tsx` (task T100 requirement)
- Only hardcoded 5-row table in `SettingsPage.tsx`
- No tariff CRUD form, no tariff hooks

## Conclusion
**TARIFF_CERTIFIED = NO** — Split architecture. Simple MVP tariff works; full billing architecture not implemented.
