# Meter Verse — Known Issues Register

## Severity Levels

| Level | Definition | Action Required |
|-------|------------|-----------------|
| CRITICAL | System crash, data loss, security breach | Fix immediately |
| HIGH | Major feature broken, significant data inconsistency | Fix this sprint |
| MEDIUM | Feature partially broken, UX degraded | Fix next sprint |
| LOW | Cosmetic, nice-to-have, minor optimization | Fix when convenient |

---

## CRITICAL

### C-01: dev-login Endpoint Enabled
- **Description**: The `/api/v1/auth/dev-login` endpoint (if present) allows unauthenticated login bypass. Must be disabled in production builds.
- **Affected files**: `backend/src/auth/auth.controller.ts` (potential dev route)
- **Workaround**: N/A — must be removed before production
- **Fix planned**: Pre-production audit
- **Effort**: 1 hour

### C-02: Admin SQL Tool Unrestricted
- **Description**: `AdminService` (`backend/src/admin/admin.service.ts`) provides `getTableData()` which executes raw SQL queries via `$queryRawUnsafe()`. Table allowlist prevents arbitrary table access, but the endpoint still allows unrestricted data reads. Must be IP-restricted and super_admin-only with additional audit.
- **Affected files**: `backend/src/admin/admin.service.ts`, `backend/src/admin/admin.controller.ts`
- **Workaround**: Ensure `super_admin` role guard applied to all admin endpoints
- **Fix planned**: Add IP whitelist + audit logging + rate limiting
- **Effort**: 4 hours

### C-03: Missing Background Workers
- **Description**: No background task queue is connected. RabbitMQ is defined in docker-compose.yml but not wired to any service. All operations run in the request thread, causing timeouts for large operations (bulk invoice generation, report generation).
- **Affected files**: Entire system (no worker module exists)
- **Workaround**: None — all operations are synchronous
- **Fix planned**: T110+ — implement Bull/RabbitMQ worker queue
- **Effort**: 40 hours (epic)

### C-04: No Memory Limits Configured
- **Description**: No Docker memory limits or Node.js `--max-old-space-size` configured. Puppeteer (Chrome headless) can consume 500MB+ per page. Under load with concurrent PDF generation, OOM is guaranteed.
- **Affected files**: `Meter/docker-compose.yml`, `Meter/backend/Dockerfile`
- **Workaround**: Manually set `NODE_OPTIONS="--max-old-space-size=512"` in environment
- **Fix planned**: Add `deploy.resources.limits.memory` to docker-compose
- **Effort**: 1 hour

---

## HIGH

### H-01: Invoice List Not Paginated
- **Description**: `GET /billing/invoices` returns ALL invoices without pagination. With thousands of invoices, this will cause memory pressure and slow responses.
- **Affected files**: `backend/src/billing/billing.controller.ts` (listInvoices method)
- **Workaround**: Filter by projectId and customerId where possible
- **Fix planned**: Add page/limit query parameters with default 50, max 100
- **Effort**: 4 hours

### H-02: Billing Period / Tariff Plan Lists Not Paginated
- **Description**: `GET /billing/periods` and `GET /billing/tariff-plans` return all records without pagination.
- **Affected files**: `backend/src/billing/billing.controller.ts`
- **Workaround**: Filter by projectId
- **Fix planned**: Add pagination to all list endpoints
- **Effort**: 3 hours

### H-03: Incomplete N+1 Prevention
- **Description**: Reading validation makes 3 individual queries per reading (meter check, duplicate check, previous reading). With bulk imports of 10,000 readings, this becomes 30,000 queries. Tariff engine also queries per-meter during invoice generation.
- **Affected files**: `backend/src/readings/reading-validation.service.ts`, `backend/src/billing/billing.controller.ts`
- **Workaround**: None for current implementation
- **Fix planned**: Add DataLoader pattern; batch reads via `$transaction`
- **Effort**: 16 hours

### H-04: Missing DB Indexes
- **Description**: Several critical tables lack indexes on foreign keys and frequently-filtered columns:
  - `invoice_lines.invoiceId` — no index (sequential scan on large invoices)
  - `meter_assignments.meterId` + `status` — composite missing
  - `meter_assignments.customerId` + `status` — composite missing
  - `sim_assignments.meterId` + `status` — composite missing
  - `reading_reviews.readingId` — no index
- **Affected files**: `backend/prisma/schema.prisma`
- **Workaround**: None — performance degrades with data volume
- **Fix planned**: Add indexes in next schema migration
- **Effort**: 4 hours

### H-05: Frontend Uses Raw fetch() Instead of apiClient
- **Description**: Several Frontend pages use `fetch()` directly instead of the configured `apiClient` from `@/lib/api/index.ts`. This bypasses auth headers, base URL, error handling, and CSRF token injection.
- **Affected files**: Various page components in `Frontend/src/`
- **Workaround**: Manually add auth headers to each fetch call
- **Fix planned**: Audit and replace all `fetch()` with `apiClient` methods
- **Effort**: 12 hours

### H-06: Missing Loading States
- **Description**: Several pages don't show loading spinners or skeletons during data fetch. Users see blank page until data arrives.
- **Affected files**: Customer detail, Meter detail, Report pages
- **Workaround**: None
- **Fix planned**: Wrap async data with `<QueryBoundary>` from `@/components/shared/QueryBoundary.tsx`
- **Effort**: 8 hours

### H-07: Missing Error Boundaries
- **Description**: Some pages crash entire app on API errors instead of showing friendly error state.
- **Affected files**: Multiple page components
- **Workaround**: Browser refresh
- **Fix planned**: Add React ErrorBoundary to each page
- **Effort**: 8 hours

### H-08: Reporting Engine Not Deployed
- **Description**: New Java/Spring/JasperReports engine (`reporting-engine/`) with 68 Java files is GENERATED but NOT DEPLOYED. The legacy NestJS/Puppeteer engine is still active but has known performance limitations.
- **Affected files**: `reporting-engine/` (entire directory)
- **Workaround**: Legacy engine continues to work
- **Fix planned**: Integration testing + deployment configuration + cutover
- **Effort**: 40 hours

### H-09: No pgt/pg_stat_statements Monitoring
- **Description**: No database query monitoring, slow query logging, or PostgreSQL performance views enabled.
- **Affected files**: `backend/prisma/`
- **Workaround**: None
- **Fix planned**: Enable pgt_stat_statements extension, configure Prisma query logging
- **Effort**: 4 hours

---

## MEDIUM

### M-01: TOU Pricing Not Validated Against sBill
- **Description**: Time-of-Use pricing via `TariffChargeMode.TOU` is implemented in the tariff engine but has NOT been validated against sBill output. Hour matching logic may differ.
- **Affected files**: `backend/src/billing/tariff-engine.service.ts`
- **Workaround**: Use flat/tiered pricing only
- **Fix planned**: SIT testing with sBill-generated TOU invoices
- **Effort**: 8 hours

### M-02: Demand Charges Not Implemented
- **Description**: Demand charges (peak consumption pricing) are NOT implemented. The `TariffChargeMode` enum does not include a demand mode.
- **Affected files**: `backend/prisma/schema.prisma` (features schema)
- **Workaround**: Not available — sBill parity gap
- **Fix planned**: Add DEMAND charge mode + calculation logic
- **Effort**: 16 hours

### M-03: Penalty Engine Not Implemented
- **Description**: Late payment penalties, overdue fines, and disconnection fees are not supported.
- **Affected files**: N/A — feature not started
- **Workaround**: Manual penalty application via debit notes
- **Fix planned**: Add penalty rules engine
- **Effort**: 20 hours

### M-04: Installments Not Implemented
- **Description**: Invoice installment plans (splitting large invoices into monthly payments) are not supported.
- **Affected files**: N/A — feature not started
- **Workaround**: Manual partial payment tracking
- **Fix planned**: Add installment plan model + allocation logic
- **Effort**: 24 hours

### M-05: CORS Origin Hardcoded in Development
- **Description**: CORS_ORIGIN defaults to `http://localhost:3000` when not set. Production must configure this explicitly.
- **Affected files**: `backend/src/main.ts`
- **Workaround**: Set `CORS_ORIGIN` environment variable
- **Fix planned**: Production environment validation
- **Effort**: 1 hour

### M-06: JWT Secret Not Rotated
- **Description**: No automatic rotation of `JWT_SECRET`. Must be rotated manually.
- **Affected files**: `backend/src/auth/`
- **Workaround**: Manual rotation via environment variable change
- **Fix planned**: Add secret rotation support (key rotation endpoint)
- **Effort**: 8 hours

### M-07: Changelog Not Automated
- **Description**: `CHANGELOG.md` is manually updated. No automated changelog generation.
- **Affected files**: `Meter/CHANGELOG.md`
- **Workaround**: Manual update
- **Fix planned**: Add standard-version or semantic-release
- **Effort**: 4 hours

### M-08: Mobile Responsiveness Issues
- **Description**: Table components overflow on mobile viewports. No horizontal scroll handling for many data tables.
- **Affected files**: Invoice list, Payment list, Customer list, Meter list tables in Frontend
- **Workaround**: Use desktop view
- **Fix planned**: Add responsive table wrapper with horizontal scroll
- **Effort**: 12 hours

### M-09: RTL Inconsistencies in shadcn Components
- **Description**: Some shadcn/ui components (Calendar, DatePicker) have layout issues in RTL mode.
- **Affected files**: Frontend components using Calendar/DatePicker
- **Workaround**: Use text inputs for dates in RTL mode
- **Fix planned**: Custom RTL styles for affected components
- **Effort**: 4 hours

### M-10: Dark Mode Gaps
- **Description**: Some pages have unreadable text in dark mode due to missing `dark:` Tailwind variants.
- **Affected files**: Multiple pages
- **Workaround**: Use light mode
- **Fix planned**: Audit and add dark: variants
- **Effort**: 8 hours

### M-11: Test-agent CI Disabled
- **Description**: The test-agent CI pipeline exists but is disabled (`if: false`) in the workflow configuration. Tests don't run in CI.
- **Affected files**: `.github/workflows/`
- **Workaround**: Run tests locally before commit
- **Fix planned**: Enable CI pipeline with proper configuration
- **Effort**: 4 hours

### M-12: Prisma Multi-Schema Contention
- **Description**: Prisma single client handles queries across 3 schemas (`sim_system`, `core`, `features`). Under load, this may cause connection contention.
- **Affected files**: `backend/src/common/database/prisma.service.ts`
- **Workaround**: None
- **Fix planned**: Separate Prisma clients per schema or connection pooling
- **Effort**: 8 hours

---

## LOW

### L-01: PDF Generation Performance
- **Description**: Puppeteer PDF generation is slow (~30 invoices/minute). Chrome headless startup adds latency. Each invoice requires a new page context.
- **Affected files**: `backend/src/invoices/invoice-renderer.service.ts`
- **Workaround**: None
- **Fix planned**: Reuse browser pages, implement page pool
- **Effort**: 8 hours

### L-02: Empty Invoice Generation
- **Description**: Invoice generation silently skips meters with zero consumption. Should either track this or create zero-consumption invoices.
- **Affected files**: `backend/src/billing/billing.controller.ts` (generateInvoices)
- **Workaround**: None — zero-consumption customers don't get invoices
- **Fix planned**: Add zero-consumption invoice option
- **Effort**: 4 hours

### L-03: Invoice Number Sequence Reset
- **Description**: Invoice number is generated from total count + 1 across ALL invoices. This means deleted/cancelled invoices leave gaps and sequence resets on DB restore.
- **Affected files**: `backend/src/billing/billing.controller.ts` (generateInvoices)
- **Workaround**: None
- **Fix planned**: Use database sequence or year-specific counters
- **Effort**: 4 hours

### L-04: No Bulk Tariff Assignment
- **Description**: Tariffs can only be assigned per-project. No per-meter or per-customer tariff override.
- **Affected files**: `backend/prisma/schema.prisma`, tariff engine
- **Workaround**: Use project-level tariff for all meters
- **Fix planned**: Add meter-level tariff assignment
- **Effort**: 8 hours

### L-05: Wallet Not in Prisma Schema
- **Description**: WalletAccount, WalletTransaction, WalletTransfer models are accessed via `(this.prisma as any)` dynamic access instead of being defined in Prisma schema.
- **Affected files**: `backend/src/wallet/wallet.service.ts`
- **Workaround**: Type safety lost; runtime errors possible
- **Fix planned**: Add wallet models to Prisma schema
- **Effort**: 4 hours

### L-06: No API Versioning for v2 Features
- **Description**: All endpoints are under `/api/v1/` including v2 features (tariff management, settlements). There's no v2 route.
- **Affected files**: `backend/src/main.ts`
- **Workaround**: None
- **Fix planned**: Evaluate if v2 routes needed
- **Effort**: 2 hours

### L-07: Frontend Animation Performance
- **Description**: framer-motion page transitions cause jank on lower-end devices.
- **Affected files**: Frontend layout components
- **Workaround**: Reduce motion via OS accessibility settings
- **Fix planned**: Add `prefers-reduced-motion` support
- **Effort**: 2 hours

### L-08: Logo Not Optimized
- **Description**: Invoice logos not optimized via next/image. May cause slow image loading.
- **Affected files**: Frontend invoice-related components
- **Workaround**: None
- **Fix planned**: Integrate next/image for invoice logos
- **Effort**: 2 hours

### L-09: Font Display Not Configured
- **Description**: No `font-display: swap` configured for custom fonts. May cause FOIT (Flash of Invisible Text).
- **Affected files**: Frontend layout and CSS
- **Workaround**: None
- **Fix planned**: Add font-display: swap to @font-face declarations
- **Effort**: 1 hour

### L-10: Changelog Entries Missing for Recent Tasks
- **Description**: `CHANGELOG.md` may be outdated. Recent task completions not documented.
- **Affected files**: `Meter/CHANGELOG.md`
- **Workaround**: Manual update
- **Fix planned**: Update CHANGELOG.md after each sprint
- **Effort**: 1 hour per sprint

### L-11: sBill Parity Documentation Not Exhaustive
- **Description**: sBill parity percentages (68% billing, 78% tariff) are estimates. Detailed per-function parity matrix not maintained.
- **Affected files**: N/A
- **Workaround**: Manual sBill comparison
- **Fix planned**: Create and maintain parity matrix
- **Effort**: 8 hours

### L-12: No Automated Invoice Diff Testing
- **Description**: No automated comparison between Meter Verse and sBill generated invoices. Manual visual comparison only.
- **Affected files**: N/A
- **Workaround**: Manual spot-checking
- **Fix planned**: Add invoice comparison test suite
- **Effort**: 16 hours

---

## Technical Debt Summary

| Category | Count | Estimated Effort |
|----------|-------|-----------------|
| CRITICAL | 4 | 46 hours |
| HIGH | 9 | 97 hours |
| MEDIUM | 12 | 113 hours |
| LOW | 12 | 58 hours |
| **TOTAL** | **37** | **314 hours** |

## Fix Priority Matrix

| Issue | Severity | Effort | Risk | Priority |
|-------|----------|--------|------|----------|
| C-01: dev-login | CRITICAL | 1h | High | P0 |
| C-02: Admin SQL tool | CRITICAL | 4h | High | P0 |
| C-04: Memory limits | CRITICAL | 1h | High | P0 |
| C-03: Background workers | CRITICAL | 40h | High | P1 |
| H-01: Invoice pagination | HIGH | 4h | Medium | P1 |
| H-05: Raw fetch | HIGH | 12h | Medium | P1 |
| H-04: Missing indexes | HIGH | 4h | Medium | P1 |
| H-03: N+1 queries | HIGH | 16h | Medium | P2 |
| H-06/H-07: Loading/error | HIGH | 16h | Medium | P2 |
| H-08: Reporting engine | HIGH | 40h | Low | P2 |
| M-01: TOU validation | MEDIUM | 8h | Low | P3 |
| M-08: Mobile responsive | MEDIUM | 12h | Low | P3 |
| All LOW items | LOW | 58h | Low | P4 |

---

## Source Files

| File | Purpose |
|------|---------|
| `Meter/SYSTEM_DNA.md` | System-wide DNA document |
| `Meter/backend/certification_log.md` | Certification audit trail |
| `Meter/TEST-AGENT-REPORT-T001-T045.md` | Agent test report |
| `Meter/docs/main-plan/` | Current task planning |
| `Meter/specs/001-metering-billing-platform/tasks.md` | T001-T085 task list |
| `Meter/specs/002-meter-verse-core/tasks.md` | T086-T092 task list |
| `Meter/docs/planning/v2.0.0-tasks.md` | T086-T150 planning |
