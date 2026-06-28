# W11 — Utility Consolidation Audit

**Date**: 2026-06-18
**Method**: Full codebase scan

## Utility Status Matrix
| Utility | Schema | Backend API | Frontend | Spec Coverage | **Status** |
|---------|--------|------------|----------|---------------|------------|
| **Electricity** | ✅ Full | ✅ Full | ✅ Full | ✅ FR-003 | **EXISTS** |
| **Water** (main + child) | ✅ Full | ✅ Full | ✅ Full | ✅ FR-003, FR-009, FR-010 | **EXISTS** |
| **Gas** | ⚠️ AreaMeterType only | ❌ None | ❌ None | ❌ Spec only | **PARTIAL** |
| **Solar** | ✅ 5 models in features | ❌ None | ❌ None | ⚠️ tasks.md only | **PARTIAL** |
| **Chilled Water** | ✅ 5 models in features | ❌ None | ❌ None | ⚠️ tasks.md only | **PARTIAL** |

## Key Findings
1. Only **Electricity** and **Water** are fully implemented end-to-end
2. **Gas** has only an enum value in the area schema — no backend or frontend
3. **Solar** has a full wallet schema (WalletAccount, WalletTransaction, etc.) but no services, no API, no UI
4. **Chilled Water** has a full schema (ChilledWaterConfig, ChilledWaterReading, etc.) but no implementation
5. The `UtilityType` enum only has `electricity` and `water` — solar and chilled water cannot be set on invoices
6. ProjectDetailPage has a mapping bug: `t('meters.chilled')` maps to `child_water` (wrong type)

## Spec Coverage
- MVP spec (001): Only electricity and water
- v2.0.0 spec (002): Mentions solar wallet and chilled water settlement in future tasks
- The original unified utility platform vision (solar, chilled water, gas) is NOT implemented

## Conclusion
**UTILITY_CONSOLIDATION_CERTIFIED = NO** — Platform is electricity + water only.
