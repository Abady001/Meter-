# U4 — UTILITY AUDIT

**Date**: 2026-06-18
**Method**: Full codebase scan

## Utility Implementation Status

| Utility | MeterType (enum) | UtilityType (enum) | Backend API | Frontend UI | Reports | **Status** |
|---------|-----------------|-------------------|-------------|-------------|---------|------------|
| **Electricity** | `electricity` ✅ | `electricity` ✅ | ✅ Full | ✅ Full | ⚠️ Not built | **EXISTS** |
| **Water** | `water_main`/`water_child` ✅ | `water` ✅ | ✅ Full | ✅ Full | ⚠️ Not built | **EXISTS** |
| **Gas** | ❌ Missing | ❌ Missing | ❌ None | ❌ None | ❌ None | **SPEC_ONLY** |
| **Solar** | ❌ Missing | ❌ Missing | ❌ None (schema only) | ❌ None | ❌ None | **PARTIAL** (wallet schema) |
| **Chilled Water** | ❌ Missing | ❌ Missing | ❌ None (schema only) | ❌ None | ❌ None | **PARTIAL** (schema) |

## Enum Value Mismatch

| Concept | Backend (MeterType) | Frontend (MeterType) | Problem |
|---------|-------------------|---------------------|---------|
| Main water | `water_main` | `main_water` | ❌ MISMATCH — different string values |
| Child water | `water_child` | `child_water` | ❌ MISMATCH — different string values |

## Missing Infrastructure
| Infrastructure | Status |
|---------------|--------|
| `UtilityType` enum expansion | ❌ Only electricity + water |
| Gas meter type in `MeterType` | ❌ Missing |
| Solar meter type in any enum | ❌ Missing entirely |
| Chilled water in `UtilityType` | ❌ Missing |
| Frontend types for gas/solar/chilled | ❌ Missing |

## Conclusion
The platform is currently an **electricity + water only** billing system. Gas, solar, and chilled water utilities have schema foundations but zero implementation. The frontend/backend MeterType values are inconsistent for water types.
