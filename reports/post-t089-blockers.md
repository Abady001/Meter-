# POST-T089 BLOCKERS

**Date**: 2026-06-18
**Gate**: READY_FOR_T090 = NO

---

## 🔴 MUST FIX BEFORE T090

### B1: 9 of 16 Roles Disconnected from Controllers
| Field | Detail |
|-------|--------|
| **Severity** | HIGH |
| **Root cause** | `@Roles()` decorators across 50 endpoints only use 7 of 16 roles: SUPER_ADMIN, ADMIN, OPERATOR, TECHNICIAN, FINANCE, SUPPORT, CUSTOMER. The other 9 roles (SYSTEM_ADMIN, AREA_MANAGER, TEAM_LEADER, COLLECTOR, METER_READER, INSPECTOR, SUPERVISOR, ACCOUNTANT, VIEWER) are defined in the enum but never referenced in any controller. |
| **Evidence** | `v2-rbac-penetration.md` — viewer → customers returns 403 |
| **Fix** | Add the 9 missing roles to appropriate `@Roles()` decorators across all controllers. Map each role to its permitted endpoints based on the `ROLE_PERMISSIONS` mapping. |
| **Effort** | ~4 hours |

### B2: Database — 0 Roles, 0 Permissions Seeded
| Field | Detail |
|-------|--------|
| **Severity** | HIGH |
| **Root cause** | No Prisma migration or seed script inserts data into `core.Role`, `core.Permission`, or `core.RolePermission` tables |
| **Evidence** | `v3-database-certification.md` — Prisma query returns Roles: 0, Permissions: 0 |
| **Fix** | Create a seed script/migration that inserts all 16 roles, 43 permissions, and 688 role-permission mappings |
| **Effort** | ~1 hour |

### B3: Missing .dockerignore
| Field | Detail |
|-------|--------|
| **Severity** | HIGH |
| **Root cause** | No `.dockerignore` file at any level |
| **Risk** | Docker build context includes `reference/` (11GB), `node_modules/`, `.git/`, `.next/` |
| **Fix** | Create `.dockerignore` excluding node_modules, .git, .next, dist, reference/, graphify-out/, *.log, .env |
| **Effort** | 15 minutes |

### B4: ignoreBuildErrors: true
| Field | Detail |
|-------|--------|
| **Severity** | HIGH |
| **Root cause** | `next.config.ts` has `typescript: { ignoreBuildErrors: true }` |
| **Risk** | TypeScript compilation errors are silently ignored in production builds |
| **Fix** | Either fix underlying type errors, create proper type stubs, or add `tsc --noEmit` step to CI |
| **Effort** | ~2 hours |

### B5: No Pagination on List Endpoints
| Field | Detail |
|-------|--------|
| **Severity** | HIGH |
| **Root cause** | 11/12 list endpoints use `findMany()` without `take` or `skip` |
| **Risk** | Unbounded result sets consume increasing memory and time as data grows |
| **Fix** | Add `@Query('page')` and `@Query('limit')` params to all GET list endpoints |
| **Effort** | ~8 hours |

---

## 🟡 SHOULD FIX SOON (Not Blocking T090)

### B6: Refresh Token Role Demotion (C-1)
| Field | Detail |
|-------|--------|
| **Severity** | MEDIUM (code defect, limited exploitability) |
| **Root cause** | `refresh-token.service.ts:62` — `role = 'customer'` default; `rotate()` doesn't pass role |
| **Evidence** | Source code line 58 + 62 confirmed |
| **Fix** | Add `role` column to RefreshToken model + migration + update service |
| **Effort** | 1 hour |

### B7: N+1 Queries
| Field | Detail |
|-------|--------|
| **Severity** | MEDIUM |
| **Root cause** | Per-reading meter query in `toDto()`, per-child aggregate in `getWaterBalance()` |
| **Fix** | Replace with batch queries / `groupBy` |
| **Effort** | 4 hours |

---

## Summary
**5 blocking issues** (4 HIGH, 1 CRITICAL infrastructure). Estimated **~15 hours** to clear all blockers for T090.
