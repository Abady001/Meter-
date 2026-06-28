# U8 — RBAC CONSOLIDATION

**Date**: 2026-06-18

## Current RBAC State
| Aspect | Status |
|--------|--------|
| Roles defined | 16 in TypeScript |
| Roles in database | 0 (not seeded) |
| Roles used in controllers | 7 of 16 |
| Permissions defined | 43 in TypeScript |
| Permissions in database | 0 (not seeded) |
| Guard implementation | GlobalAuthGuard + RolesGuard |

## Unused Roles (9)
| Role | Count in @Roles() | Status |
|------|-------------------|--------|
| `system_admin` | 0 | ❌ UNUSED |
| `area_manager` | 0 | ❌ UNUSED |
| `team_leader` | 0 | ❌ UNUSED |
| `collector` | 0 | ❌ UNUSED |
| `meter_reader` | 0 | ❌ UNUSED |
| `inspector` | 0 | ❌ UNUSED |
| `supervisor` | 0 | ❌ UNUSED |
| `accountant` | 0 | ❌ UNUSED |
| `viewer` | 0 | ❌ UNUSED |

## Active Roles (7)
| Role | Endpoints | % of Total |
|------|-----------|-----------|
| `super_admin` | 50 | 94% |
| `admin` | 43 | 81% |
| `operator` | 36 | 68% |
| `technician` | 17 | 32% |
| `finance` | 17 | 32% |
| `support` | 13 | 25% |
| `customer` | 1 | 2% |

## Missing Permissions (from SBill + Collection System)
| Permission | Needed For | Current Status |
|-----------|-----------|---------------|
| `claim:manage` | Claims/disputes | ❌ MISSING |
| `claim:read` | Claims/disputes | ❌ MISSING |
| `payment:reconcile` | Payment reconciliation | ❌ MISSING |
| `gateway:manage` | Payment gateway config | ❌ MISSING |
| `report:export` | Report download | ❌ MISSING |
| `solar:manage` | Solar wallet | ❌ MISSING |
| `chilled:manage` | Chilled water billing | ❌ MISSING |
| `portal:access` | Customer portal | ❌ MISSING |
| `integration:manage` | Symbiot bridge | ❌ MISSING |

## Consolidation Plan
1. **Seed** all 16 roles + 43 permissions in database
2. **Wire** the 9 unused roles into controller `@Roles()` decorators
3. **Add** 9 missing permissions for new domains
4. **Remove** duplicate roles if SBill/Collection System have overlapping profiles

## Conclusion
The 16-profile RBAC is architecturally sound. It needs database seeding, 9 roles need controller wiring, and 9 permissions need to be added for the full domain coverage.
