# V3 — Database Certification

**Date**: 2026-06-18
**Method**: Prisma ORM queries against live PostgreSQL

---

## RBAC Table Row Counts

| Table | Row Count | Expected | Verdict |
|-------|-----------|----------|---------|
| `core.roles` | **0** | 16 | ❌ FAIL |
| `core.permissions` | **0** | 43 | ❌ FAIL |
| `core.role_permissions` | **0** | 688 | ❌ FAIL |
| `core.user_role_assignments` | **0** | varies | ❌ FAIL |

## Evidence
```
Roles: 0  Permissions: 0  Assignments: 0
```

## Verification: Schema vs Runtime

| Layer | Roles | Permissions | Status |
|-------|-------|-------------|--------|
| TypeScript enum | 16 ✅ | 43 ✅ | `role.enum.ts`, `permission.enum.ts` |
| CoreRole table | 0 ❌ | 0 ❌ | Table exists, no seed data |
| @Roles() in controllers | 7 | — | Only 7 of 16 used |

## Schema Structure
- 4 schemas: `sim_system`, `core`, `features`, `area`
- 119 total models
- 5 core RBAC tables: `CoreUser`, `CoreRole`, `CorePermission`, `CoreRolePermission`, `CoreUserRoleAssignment`
- All properly defined with `@@schema("core")` and `@@map("snake_case")`
- **MISSING**: Seed migration to populate the 16 roles and 43 permissions

## Missing Indexes
| Table | Filtered By | Index Status |
|-------|------------|-------------|
| `sim_system.Reading` | projectId, meterId, status | ❌ NONE |
| `sim_system.Invoice` | projectId, customerId, status | ❌ NONE |
| `sim_system.Payment` | projectId, customerId | ❌ NONE |
| `sim_system.InvoiceLine` | invoiceId | ❌ NONE |
| `sim_system.Project` | status, code | ❌ NONE |

---

## Conclusion
**DATABASE_CERTIFIED = NO**

Blockers:
1. 16 roles and 43 permissions not seeded in database
2. Missing indexes on 5 actively-queried tables
