# U6 — TARIFF CONSOLIDATION

**Date**: 2026-06-18

## Current Tariff Implementation
| Model | Schema | Purpose | Status |
|-------|--------|---------|--------|
| `TariffPlan` | sim_system | Flat rate per meter type | ✅ Working CRUD |
| `Tariff` | features | Multi-charge tariff header | ❌ No service |
| `TariffVersion` | features | Versioned tariff changes | ❌ No service |
| `TariffCharge` | features | 5 charge modes | ❌ No service |
| `TariffChargeDetail` | features | Tiered pricing | ❌ No service |

## Target: Unified Tariff Engine
The final system must support ONE tariff engine that handles:

| Requirement | Current Status | SBill Status | Target |
|------------|---------------|-------------|--------|
| Flat rate | ✅ TariffPlan.ratePerUnit | ✅ Flat rate | KEEP |
| Tiered pricing | ❌ Not implemented | ✅ tariff_slab | BUILD |
| Fixed charges | ❌ Not implemented | ✅ tariff_charges | BUILD |
| Service charges | ❌ Not implemented | ✅ tariff_charges | BUILD |
| Taxes | ✅ Project.taxRate | ✅ Tax in invoice | KEEP |
| Subsidies | ❌ Not implemented | ❌ Not present | BUILD |
| Discounts | ❌ Not implemented | ❌ Not present | BUILD |
| Multi-utility | ⚠️ Limited to elec+water | ✅ Electricity + water | EXPAND |
| Charge modes (5) | ❌ Not implemented | ⚠️ Flat + tier only | BUILD |
| Versioning | ❌ Not implemented | ❌ Not present | BUILD |
| Approval workflow | ❌ Not implemented | ❌ Not present | BUILD |

## Consolidation Plan
1. **KEEP**: `TariffPlan` as the active MVP tariff (works now)
2. **MERGE**: Build `TariffService` for the `features` schema models
3. **REPLACE**: The `generateInvoices()` engine to use charge-based calculation
4. **EXPAND**: Add support for gas, solar, chilled water utility types

## Conclusion
**ONE tariff engine** should be built on the `features` schema models (Tariff → TariffCharge → TariffChargeDetail). The current `TariffPlan` in sim_system should be deprecated in favor of the unified engine once implemented.
