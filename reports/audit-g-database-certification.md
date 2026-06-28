# AUDIT-G — Database Certification (Independent)

**Date**: 2026-06-18
**Verdict**: FAIL

## Summary
| Metric | Value |
|--------|-------|
| Schemas | 4: `sim_system`, `core`, `features`, `area` |
| Total models | 119 |
| Core RBAC tables | 5 (CoreUser, CoreRole, CorePermission, CoreRolePermission, CoreUserRoleAssignment) |
| Total enums | 59 |
| Prisma migrations | 12 |
| `@@index` directives (total) | ~130 |

## ❌ FAILURES

### F-G1: 16 Roles NOT Seeded in Database (HIGH)
- **Root cause**: `CoreRole` table exists but has zero seed data. The 16 roles exist only in TypeScript enum
- **Risk**: Database-level role enforcement cannot work — auth relies entirely on application code
- **Fix**: Create seed migration/data to insert 16 roles

### F-G2: Missing Indexes on `sim_system` Models (HIGH)
- **Root cause**: `Reading`, `Invoice`, `Payment`, `InvoiceLine`, `Project` have ZERO `@@index` directives
- **Risk**: Full table scans on every filtered query as data grows
- **Affected**: Reading (filtered by projectId, meterId, status), Invoice (projectId, customerId, status), Payment (projectId, customerId)

### F-G3: 16 Roles Not Represented in Auth Module (MEDIUM)
- **Root cause**: The application code's `Role` enum has 16 values, but only 7 are used in `@Roles()` decorators: OPERATOR, ADMIN, SUPER_ADMIN, TECHNICIAN, FINANCE, SUPPORT, CUSTOMER
- **Risk**: 9 roles (SYSTEM_ADMIN, AREA_MANAGER, TEAM_LEADER, COLLECTOR, METER_READER, INSPECTOR, SUPERVISOR, ACCOUNTANT, VIEWER) are defined but unused

## ✅ PASSES
- 4 schemas correctly declared in datasource
- `@@map` naming convention consistent (snake_case, plural)
- `@@schema` directives on all models
- RBAC tables properly designed with foreign keys and unique constraints
- Comprehensive index coverage in core/features/area schemas

## Conclusion
**DATABASE_CERTIFIED = NO**
