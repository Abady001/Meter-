# U8 — Tariff Structure Certification

**Date**: 2026-06-18
**Method**: Compare Prisma schema vs billing architecture vs UI

## Models
| Model | Schema | Implementation Status |
|-------|--------|----------------------|
| `TariffPlan` (sim_system) | Flat rate per meter type | ✅ CRUD API, invoice generation |
| `Tariff` + `TariffVersion` + `TariffCharge` + `TariffChargeDetail` (features) | Multi-charge, tiers, versions | ❌ Prisma models only — no services, no API, no UI |
| Area tariff tables (data-model.md spec) | 4 tables specified | ❌ Not in Prisma at all |

## Key Discrepancy
The codebase has two separate tariff models with no bridge between them. Invoice generation uses only the simple `TariffPlan.ratePerUnit * consumption` formula. The advanced features (tiered pricing, 5 charge modes, 3 settlement types, versioning) exist only as inert Prisma models.

## Frontend
- No `TariffsPage.tsx` component exists (task T100 specifies one)
- Tariff UI is a hardcoded 5-row table in `SettingsPage.tsx`
- No tariff CRUD form or dialog
- No tariff-related React Query hooks

## Conclusion
**TARIFF_CERTIFIED = NO**
