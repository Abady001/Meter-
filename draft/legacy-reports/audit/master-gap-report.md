# Master Gap Report — Meter Verse

**Generated:** 2026-06-25  
**Source Data:** system-discovery-report.md, security-report.md, frontend-backend-matrix.md, testing-roadmap.md  
**Compiled by:** Principal Security Engineer, Principal QA Architect

---

## P0 — CRITICAL GAPS

Security holes, broken auth, data loss risks — must fix before production deployment.

### [P0-001] Hardcoded Password Hash in Registration
- **File:** egistration.controller.ts:55
- **Detail:** Every approved registration user gets the SAME hardcoded bcrypt hash
- **Risk:** Any user knowing the hash can authenticate as any auto-created account
- **Effort:** 2h — Replace with random password generation + force password change on first login

### [P0-002] SQL Injection in Admin SQL Console
- **Files:** dmin.controller.ts:70-81, dmin.service.ts:14,43,57,66,75
- **Detail:** \(dto.sql) accepts arbitrary SQL; table names interpolated in other methods
- **Risk:** Complete database compromise, data exfiltration
- **Effort:** 16h — Move to isolated service, add query guardrails, use parameterized queries

### [P0-003] Weak Default JWT Secret
- **File:** docker-compose.yml:39
- **Detail:** JWT_SECRET:-change-me-in-production if env var not set
- **Risk:** JWT token forgery, authentication bypass
- **Effort:** 1h — Add fail-fast production guard

### [P0-004] Dev Login Endpoint Exposed
- **File:** uth.controller.ts:134-144
- **Detail:** POST /auth/dev-login with @Public(); gated only by env check
- **Risk:** If env misconfigured, any userId can mint JWT tokens as any role
- **Effort:** 1h — Restrict to non-production environments or remove

### [P0-005] Tokens Stored in localStorage
- **File:** rontend/src/lib/api/auth.ts:7,16,35
- **Detail:** Access and refresh tokens in localStorage (XSS-able)
- **Risk:** Any XSS vulnerability steals credentials
- **Effort:** 4h — Migrate to httpOnly cookies

### [P0-006] CSRF Guard Defined But Never Used
- **File:** common/http/csrf.guard.ts
- **Detail:** CSRF guard class exists but not registered globally or per-controller
- **Risk:** CSRF attacks on mutation endpoints
- **Effort:** 2h — Register globally in AppModule

### [P0-007] No Per-IP Rate Limiting on Auth Endpoints
- **File:** uth.controller.ts:27-109,134-144,111-123
- **Detail:** Login, dev-login, refresh have no additional rate limiting beyond global 100/60s
- **Risk:** Brute force attacks
- **Effort:** 4h — Add @Throttle() decorators and per-IP middleware

### [P0-008] 10 Controllers Missing Class-Level Guards
- **Files:** kpi/kpi.controller.ts:8, wallet/wallet.controller.ts:8, eports/reports.controller.ts:9, invoices/invoices.controller.ts:14, plus 6 others
- **Detail:** Rely solely on @Roles() decorator without @UseGuards(AuthGuard('jwt'), RolesGuard)
- **Risk:** If GlobalAuthGuard is ever removed/modified, these controllers become unprotected
- **Effort:** 2h — Add explicit class-level guards

---

## P1 — HIGH GAPS

Missing integration, broken CRUD, validation missing — block user workflows.

### [P1-001] 17 Frontend Routes Missing Components
| Missing Route | Backend API |
|--------------|-------------|
| /invoices | GET /billing/invoices |
| /invoice/:id | GET /billing/invoices/:id |
| /payments | GET/POST /payments |
| /bill-cycle | GET/POST /bill-cycle |
| /collections | GET /collections/dashboard |
| /notifications | GET /notifications |
| /rbac | GET /admin/* |
| /audit-logs | GET /admin/tables |
| /utility/electricity | None |
| /utility/water | None |
| /utility/gas | None |
| /utility/chilled-water | GET /chilled-water/* |
| /utility/outdoor-unit | None |
| /balances | GET /customers/:id/statement |
| /downloads | GET /downloads/* |
| /promises | None |
| /recovery | None |
| /feature-flags | None |
| /adjustments | None |
- **Effort:** 40h+ (2 weeks)

### [P1-002] No Pagination on Major List Endpoints
- **Files:** customers.service.ts, meters.service.ts, eadings.service.ts, illing.controller.ts:464
- **Detail:** List endpoints return all records without pagination
- **Risk:** Memory exhaustion, slow queries with large datasets
- **Effort:** 8h — Add page/pageSize to all list endpoints

### [P1-003] Missing AuditInterceptor on Sensitive GET Endpoints
- **Endpoints:** Customer 360 view, customer statement
- **Risk:** No audit trail for sensitive data access
- **Effort:** 2h — Add selective GET auditing

### [P1-004] No File Upload Validation
- **Files:** upload.controller.ts:25-36
- **Detail:** No file size or type validation
- **Risk:** Malware upload, storage exhaustion
- **Effort:** 2h — Add limits.fileSize and file type allowlist

### [P1-005] N+1 Queries in Invoice Generation
- **File:** illing/billing.controller.ts:88-155
- **Detail:** For-loop creating invoice lines individually
- **Risk:** 3000+ DB queries for 1000 meters
- **Effort:** 4h — Use createMany and batch processing

### [P1-006] Missing Indexes on Invoice Table
- **File:** schema.prisma — Invoice model
- **Detail:** No indexes on projectId, customerId, illingPeriodId, status
- **Risk:** Full table scans on all billing queries
- **Effort:** 1h — Add @@index declarations

### [P1-007] Missing Indexes on Reading Table
- **File:** schema.prisma — Reading model
- **Detail:** No plain index on meterId (only composite unique with eadingAt, source)
- **Risk:** Slow meter-specific queries
- **Effort:** 0.5h — Add @@index([meterId])

### [P1-008] API Gateway Uses Custom Rate Limiter
- **File:** pi-gateway/src/middleware/gateway.js:34-47
- **Detail:** Custom in-memory rate limiter instead of express-rate-limit library (which is installed)
- **Risk:** Inconsistent, non-standard, no distributed support
- **Effort:** 2h — Replace with express-rate-limit

### [P1-009] 25 Frontend Components Use Mock Data (not live API)
- **Detail:** CustomersPage.tsx, MetersPage.tsx, ReadingsPage.tsx, etc. use src/lib/mock-*.ts
- **Risk:** Users see stale/fake data
- **Effort:** 40h — Migrate all mocks to live API calls

### [P1-010] No Database-Backed Integration Tests
- **Detail:** All integration tests use mocked Prisma (no real DB)
- **Risk:** False positives — code paths untested against real schema
- **Effort:** 16h — Add Testcontainers for DB-backed tests

### [P1-011] 20+ Modules Have Zero Test Coverage
| Module | Test Coverage |
|--------|--------------|
| Billing | ~30% (contract only) |
| Tariff Engine | 0% |
| Notifications | 0% |
| Tickets | 0% |
| Support | 0% |
| Reports | 0% |
| Settings | 0% |
| Search | 0% |
| Upload | 0% |
| Downloads | 0% |
| Users | 0% |
| Admin | 0% |
| Areas | 0% |
| Registration | 0% |
| KPI | 0% |
| Wallet | 0% |
| Solar | 0% |
| Settlement | 0% |
| Chilled Water | 0% |
| Bill Cycle | 0% |
| Unit Types | 0% |
| Collections | 0% |
- **Effort:** 40h+

### [P1-012] No MFA Implementation
- **Detail:** isMfaEnabled and mfaSecret fields exist in CoreUser model but no TOTP flow
- **Risk:** Single-factor authentication only
- **Effort:** 24h — Implement TOTP verification flow

### [P1-013] No Session Invalidation on Password Change
- **Detail:** Old JWT tokens remain valid until expiration (1 hour)
- **Risk:** Stolen session persists after password reset
- **Effort:** 4h — Implement token blacklist

---

## P2 — MEDIUM GAPS

Missing i18n, placeholder pages, unused code, secondary features.

### [P2-001] setTimeout for Login Lockout (Not Persistent)
- **File:** uth.controller.ts:63-72
- **Detail:** Auto-unlock via setTimeout() lost on process restart
- **Effort:** 2h — Use DB timestamp check instead

### [P2-002] Missing i18n Implementation for 17 Missing Pages
- **Detail:** next-intl configured with 676 keys, but missing pages have no translations
- **Effort:** 8h — Add translations for all missing pages

### [P2-003] PermissionsGuard and ProjectAccessGuard Unused
- **Files:** uth/permissions.guard.ts, uth/project-access.guard.ts
- **Detail:** Defined but not used in any controller
- **Effort:** 0.5h — Either implement or remove dead code

### [P2-004] No Content Security Policy Headers
- **Detail:** Helmet configured but no CSP header
- **Effort:** 2h — Configure CSP via Helmet

### [P2-005] Admin SQL Console Bypasses ORM
- **File:** dmin.controller.ts:70-81
- **Detail:** Accepts raw SQL from super_admin
- **Effort:** 2h — Add query allowlist, timeout, max rows (even if kept in main API)

### [P2-006] No Rate Limiting on Public Endpoints
- **Endpoints:** GET /areas, GET /areas/:id, POST /auth/register
- **Effort:** 1h — Add @Throttle() decorators

### [P2-007] No Test Coverage Threshold
- **Detail:** Jest coverage threshold not configured
- **Effort:** 1h — Add 80% minimum in jest.config.ts

### [P2-008] Prisma Client in Frontend
- **Detail:** prisma@^6.11.1 in Frontend/package.json — should be backend-only
- **Effort:** 0.5h — Remove unused dependency

### [P2-009] InvoicesController Uses equire('jszip') Dynamically
- **File:** invoices/invoices.controller.ts:146
- **Detail:** Dynamic require inside method — poor practice, breaks tree-shaking
- **Effort:** 0.5h — Convert to static import

### [P2-010] No Correlation ID on API Gateway Responses
- **Detail:** Backend sets x-correlation-id but API Gateway may strip it
- **Effort:** 1h — Add passthrough of correlation ID

### [P2-011] No Test for ThrottlerGuard
- **Detail:** Rate limiting is not tested
- **Effort:** 2h — Add contract test for throttle enforcement

### [P2-012] No Test for CSRF
- **Detail:** CSRF endpoint exists but no validation test
- **Effort:** 2h — Add CSRF flow test

### [P2-013] AuditInterceptor Uses catch(() => {}) — Silent Fail
- **File:** udit/audit.interceptor.ts:50
- **Detail:** Catches all DB errors without logging
- **Effort:** 0.5h — Add logger.warn in catch

### [P2-014] Multiple .catch(() => null) Patterns
- **Files:** uth.controller.ts:32, invoices.controller.ts:30-32, illing.controller.ts:54-61
- **Detail:** Silently swallowed DB errors make debugging difficult
- **Effort:** 2h — Log errors before returning null

### [P2-015] Invoice Number Uses count() — Full Table Scan
- **File:** illing.controller.ts:113
- **Detail:** wait this.prisma.invoice.count() on every invoice generation
- **Effort:** 1h — Replace with database sequence or year-based counter

---

## P3 — LOW GAPS

Minor UI issues, missing documentation, cosmetic problems.

### [P3-001] dangerouslySetInnerHTML in Chart Component
- **File:** Frontend/src/components/ui/chart.tsx:83
- **Detail:** CSS injection into style tag; low risk (no user data), but dangerous pattern
- **Effort:** 1h — Replace with safe CSS injection

### [P3-002] Missing CORS Origin Format Validation
- **File:** main.ts:25
- **Detail:** CORS_ORIGIN split by comma — comma injection possible
- **Effort:** 1h — Validate origin format before splitting

### [P3-003] No Error Message for User Enumeration
- **Detail:** Auth controller uses generic Arabic error messages — good for security
- **Status:** ✅ Already correct, documented for awareness

### [P3-004] No API Documentation for Missing Endpoints
- **Detail:** 65+ backend endpoints have no corresponding frontend
- **Effort:** 8h — API documentation for all endpoints

### [P3-005] No Security Audit Section in README
- **Detail:** SECURITY.md exists but no security audit instructions
- **Effort:** 2h — Add security section to documentation

### [P3-006] No Load Test Scripts
- **Detail:** No k6/Artillery scripts for performance testing
- **Effort:** 8h — Create basic load test suite

### [P3-007] No Accessibility (a11y) Audit
- **Detail:** No axe-core or Lighthouse a11y checks
- **Effort:** 4h — Add a11y audit to CI

### [P3-008] Playwright E2E Tests Not Runnable
- **Detail:** Playwright config exists but E2E tests fail on Windows (pre-existing issue)
- **Effort:** 4h — Fix Playwright test runner

### [P3-009] noEmit in Frontend tsconfig
- **Detail:** Next.js uses ignoreBuildErrors: true, masking TypeScript errors
- **Effort:** 4h — Fix TS errors and remove ignore flag

### [P3-010] Missing Git Hooks for Security
- **Detail:** Husky installed but no pre-commit hooks for security scanning
- **Effort:** 2h — Add pre-commit secret scanning + linting

### [P3-011] Default DB Password in docker-compose
- **Detail:** Default passwords for postgres user in docker-compose.yml
- **Effort:** 0.5h — Document mandatory password override

### [P3-012] Frontend/ Directory Name Case Mismatch
- **Detail:** Some references use Frontend/, others use rontend/ — potential cross-platform issues
- **Effort:** 1h — Standardize directory name

---

## Summary Statistics

| Severity | Count | Estimated Total Effort |
|----------|-------|----------------------|
| **P0 — Critical** | 8 | ~32h |
| **P1 — High** | 13 | ~187h |
| **P2 — Medium** | 15 | ~27h |
| **P3 — Low** | 12 | ~35h |
| **TOTAL** | **48 gaps** | **~281h (7 person-weeks)** |

---

## Overlap & Dependency Map

`
P0-001 (Hardcoded Hash)
  └── P1-012 (No MFA) — both relate to auth weakness
P0-002 (SQL Injection)
  └── P2-005 (Admin SQL Console) — same root cause
P0-007 (No Auth Rate Limiting)
  └── P2-006 (No Public Endpoint Rate Limiting) — same pattern
P0-008 (Missing Guards)
  └── Already covered in security report
P1-001 (Missing Frontend Pages)
  ├── P2-002 (Missing i18n) — affects same pages
  └── P1-009 (Mock Data) — pages exist but use mocks
P1-005 (N+1 Queries)
  ├── P1-006 (Missing Indexes) — exacerbates N+1
  └── P2-015 (Invoice count()) — part of billing perf
`

---

*End of Master Gap Report*
