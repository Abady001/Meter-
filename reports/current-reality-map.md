# METER VERSE — CURRENT REALITY MAP

**Date:** 2026-06-25
**Source:** Direct code scan (Phase 39 post-fix state)

---

## BACKEND INVENTORY

| Category | Count | Details |
|----------|-------|---------|
| Controllers | 34 | auth, admin, areas, billing, bill-cycle, chilled-water, collections, customers, dashboard, downloads, invoices, kpi, locations, meters, notifications, payments, projects, readings, registration, reports, search, settings, settlement, sim-cards, solar, support, tariffs, tickets, unit-types, upload, users, wallet, water-balance |
| Services | 43 | Including billing-state.service (NEW), ledger.service, tariff-engine, calculation-engine, report-generation |
| Modules | 40 | Including AuthModule in billing/bill-cycle/reports/meters/readings (NEW - Phase 39) |
| DTOs | 29 | 17 with validation decorators, 12 response-only |
| Guards | 6 | GlobalAuthGuard, RolesGuard, CsrfGuard (NEW - globally registered), ProjectAccessGuard, AreaGuard, ThrottlerGuard |
| Interceptors | 3 | AuditInterceptor (global), ProjectAccessInterceptor (global), ErrorInterceptor |
| Middleware | 3 | AccessContextMiddleware, CorrelationMiddleware, CsrfMiddleware |
| BE TypeScript files | 186 | Controllers + services + modules + DTOs + guards |

## DATABASE INVENTORY

| Schema | Tables | Models |
|--------|--------|--------|
| core | 24 | areas, projects, users, roles, permissions, role_permissions, user_role_assignments, audit_log, audit_log_archive, settings, holidays, user_groups, customer_types, ownership_types, payment_options, unit_zones, settlements, payment_centers, bank_accounts, customer_groups, notification_queue, location_zones, unit_types, system_config |
| sim_system | 31 | customers, meters, readings, invoices, invoice_lines, invoice_adjustments, payments, payment_allocations, customer_ledger_entries, tariffs, tariff_plans, tariff_tiers, units, unit_types, billing_periods, meter_assignments, etc. |
| features | 36 | wallets, wallet_transactions, kpi_data, notification_queue, report_templates, report_schedules, etc. |
| area | 42 | area-specific readings, meter_data, etc. |
| **Total** | **133** | **128 models + 59 enums** |

## FRONTEND INVENTORY

| Category | Count | Details |
|----------|-------|---------|
| Page components | 35 | Including AdminPortalRedirect (NEW), BillCyclePage (NEW) |
| TSX components | 107 | Across all feature modules |
| Total TS/TSX files | 152 | In src/ directory |
| Navigation routes | 60 | In navigation.ts |
| Report types | 44 | In report-generation.service.ts |
| Playwright test specs | 8 | In tests/enterprise/ (67 test cases) |
| i18n translation keys | 523 | Arabic + English |

## AUTH & SECURITY

| Component | Status | Detail |
|-----------|--------|--------|
| JWT auth | ✅ | Passport JWT strategy, access + refresh tokens |
| RBAC | ✅ | @Roles() decorator on all controllers |
| CSRF | ✅ | CsrfGuard globally registered, auth endpoints exempt |
| Rate limiting | ✅ | Global 100/min, login 5/min |
| Project isolation | ✅ | UserAccessService in billing, meters, readings, reports, bill-cycle |
| Audit logging | ✅ | Global AuditInterceptor + core.audit_log table |
| Password hashing | ✅ | bcrypt 12 rounds, random per-user passwords |
| SQL injection prevention | ✅ | Prisma ORM + restricted admin console |

## BILLING ENGINE

| Component | Status | Detail |
|-----------|--------|--------|
| Tariff calculation | ✅ | 5 modes: FLAT, STEPS, PER_UNIT, STATIC, ZERO |
| Invoice generation | ✅ | POST /invoices/generate endpoint |
| Invoice state machine | ✅ | Reverse + Void endpoints (NEW), Payment→status update (NEW) |
| Bill cycle | ✅ | Create, generate, list cycles |
| Ledger | ✅ | Debit/credit entries with running balance |
| Wallet | ✅ | 6 operations: get, credit, debit, transfer, balance, history |

## SERVICES RUNNING

| Port | Service | Status |
|------|---------|--------|
| 3000 | Frontend (Next.js 16) | ✅ Dev server running |
| 3001 | Backend (NestJS 10) | ✅ Running with all Phase 39 fixes |
| 6262 | Admin Portal (Express) | ✅ Running, all 19 pages tested |
| 5433 | PostgreSQL 16 | ✅ Running |

## KNOWN ISSUES (Remaining)

| Priority | Issue | Status |
|----------|-------|--------|
| P0 | Invoice DTO validation still inline | ❌ OPEN |
| P1 | 90 endpoints with no frontend consumer | ❌ |
| P1 | 200+ hardcoded i18n strings | ❌ |
| P1 | No caching layer | ❌ |
| P1 | Wallet not tied to ledger | ❌ |
| P2 | No pagination on customer/meter lists | ❌ |
