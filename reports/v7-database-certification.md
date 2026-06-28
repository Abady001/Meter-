# V7 — Database Certification

**Date**: 2026-06-18
**Status**: VERIFIED

## Schema Overview
| Schema | Models | Enums |
|--------|--------|-------|
| sim_system | 24 | 24 |
| core | 17 (5 RBAC tables) | 6 |
| features | 36 | 8 |
| area | 42 | 21 |
| **Total** | **119** | **59** |

## RBAC Tables (core schema)
| Table | Model | Purpose |
|-------|-------|---------|
| `users` | CoreUser | User accounts (password_hash, MFA, status) |
| `roles` | CoreRole | Role definitions (role_code, is_system) |
| `permissions` | CorePermission | Permission codes (module, display_name) |
| `role_permissions` | CoreRolePermission | M:M role↔permission join |
| `user_role_assignments` | CoreUserRoleAssignment | User→role (with area scope) |

## Key Finding
**16 roles are NOT seeded in the database.** The `CoreRole` table exists but has zero rows. The 16-profile RBAC exists only in the TypeScript code (`Role` enum). A seed script is needed.

## Migrations
- Total: 12 migrations
- Latest: `20260617185351_area_db_template`
- Engine: postgresql

## Missing Indexes
- `Reading`, `Invoice`, `Payment`, `InvoiceLine`, `Project` have ZERO @@index directives
- These are the most-queried tables in the sim_system schema

## Conclusion
**DATABASE_CERTIFIED = NO** (roles not seeded, missing indexes)
