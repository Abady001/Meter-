# Fix Priority Roadmap — Meter Verse

**Generated:** 2026-06-25  
**Based on:** Security Validation, Performance Validation, Master Gap Report  
**Total Findings:** 48 gaps across P0-P3

---

## Executive Summary

| Priority | Count | Effort (person-hours) | Business Impact |
|----------|-------|----------------------|-----------------|
| P0 | 8 | ~32h | Blocks production deployment |
| P1 | 13 | ~187h | Blocks user workflows |
| P2 | 15 | ~27h | Quality of life improvements |
| P3 | 12 | ~35h | Polish & documentation |
| **TOTAL** | **48** | **~281h (7 weeks)** | |

**Recommended sprint allocation:** 3 sprints of 2 weeks each with 2 developers.

---

## Sprint 1: Security & Stability (Weeks 1-2)

Focus: All P0 items + most critical P1 items. This sprint blocks production deployment.

### Sprint 1 Backlog

| ID | Finding | Priority | Effort | File(s) | Acceptance Criteria |
|----|---------|----------|--------|---------|-------------------|
| P0-003 | Weak default JWT secret | **P0** | 1h | docker-compose.yml:39 | Production startup fails if JWT_SECRET is default |
| P0-001 | Hardcoded password hash | **P0** | 2h | egistration.controller.ts:55 | New users get unique random passwords |
| P0-004 | Dev login endpoint | **P0** | 1h | uth.controller.ts:134-144 | Dev-login disabled in production, no @Public() |
| P0-007 | No per-IP rate limiting on auth | **P0** | 4h | uth.controller.ts | Login throttled to 5/min/IP, dev-login to 3/min |
| P0-008 | Missing class-level guards | **P0** | 2h | 10 controllers | All controllers have @UseGuards(AuthGuard('jwt'), RolesGuard) |
| P0-006 | CSRF guard not registered | **P0** | 2h | csrf.guard.ts, pp.module.ts | CsrfGuard registered globally |
| P0-005 | Tokens in localStorage | **P0** | 4h | rontend/src/lib/api/auth.ts | Tokens stored only in httpOnly cookies |
| P0-002 | SQL injection in admin | **P0** | 16h | dmin.controller.ts, dmin.service.ts | All raw queries parameterized, SQL console moved to isolated service |
| P1-006 | Missing indexes on Invoice | **P1** | 1h | schema.prisma | @@index([projectId]), @@index([customerId]), @@index([billingPeriodId]), @@index([status]) added |
| P1-007 | Missing indexes on Reading | **P1** | 0.5h | schema.prisma | @@index([meterId]) added |
| P1-008 | API Gateway custom rate limiter | **P1** | 2h | gateway.js | Replaced with express-rate-limit v7 |
| P1-013 | No session invalidation on password change | **P1** | 4h | uth/ | Token blacklist implemented |
| **Sprint 1 total** | **12 items** | | **~39.5h** | | |

### Sprint 1 Dependencies
- P0-002 (SQL injection) depends on migration of Admin service
- P0-008 (Missing guards) requires verifying all 10 controllers
- P0-005 (localStorage tokens) requires backend cookies already working (✅ they are)

---

## Sprint 2: Feature Completeness (Weeks 3-4)

Focus: Remaining P1 items + P2 items blocking user workflows.

### Sprint 2 Backlog

| ID | Finding | Priority | Effort | Detail |
|----|---------|----------|--------|--------|
| P1-001 | 17 missing frontend pages | **P1** | 40h | Build components for invoices, payments, notifications, etc. |
| P1-009 | Migrate 25 pages from mock to live API | **P1** | 40h | Wire all frontend components to real backend endpoints |
| P1-002 | Add pagination to all list endpoints | **P1** | 8h | Implement page/pageSize pattern |
| P1-012 | Implement MFA TOTP flow | **P1** | 24h | TOTP setup + verification + recovery codes |
| P1-003 | Add audit on sensitive GET endpoints | **P1** | 2h | Customer 360, statement audits |
| P1-004 | Add file upload validation | **P1** | 2h | File size + type restrictions |
| P1-005 | Fix N+1 in invoice generation | **P1** | 4h | Batch invoice line creation |
| P1-010 | Add database-backed integration tests | **P1** | 16h | Testcontainers setup, core CRUD tests |
| P1-011 | Add tests for untested modules | **P1** | 40h | Unit + contract tests for 22 modules |
| P2-001 | Fix setTimeout lockout | **P2** | 2h | DB-based unlock check |
| P2-002 | i18n for missing pages | **P2** | 8h | Add translations for new pages |
| P2-003 | Remove unused guards | **P2** | 0.5h | Dead code cleanup |
| P2-004 | Add CSP headers | **P2** | 2h | Configure Helmet CSP |
| P2-005 | Add SQL console guardrails | **P2** | 2h | Query timeout, max rows, statement timeout |
| P2-006 | Rate limiting on public endpoints | **P2** | 1h | @Throttle() on public endpoints |
| P2-009 | Fix dynamic require | **P2** | 0.5h | Static import for JSZip |
| P2-013 | Fix silent audit failures | **P2** | 0.5h | Log audit errors |
| P2-014 | Fix .catch(() => null) patterns | **P2** | 2h | Log suppressed errors |
| **Sprint 2 total** | **18 items** | | **~192.5h** | |

### Sprint 2 Dependencies
- P1-001 (Missing pages) must come before P1-009 (mock migration) and P2-002 (i18n)
- P1-012 (MFA) depends on P0-001 (password handling) being fixed
- P1-010 (DB tests) depends on P1-006/007 (indexes) being applied

---

## Sprint 3: Performance, Testing & Polish (Weeks 5-6)

Focus: Remaining P2 items, P3 items, hardening.

### Sprint 3 Backlog

| ID | Finding | Priority | Effort | Detail |
|----|---------|----------|--------|--------|
| P2-007 | Coverage threshold | **P2** | 1h | Jest 80% min coverage |
| P2-008 | Remove frontend Prisma | **P2** | 0.5h | Clean unused dep |
| P2-010 | Correlation ID in gateway | **P2** | 1h | Passthrough header |
| P2-011 | ThrottlerGuard test | **P2** | 2h | Contract test for rate limiting |
| P2-012 | CSRF test | **P2** | 2h | Test CSRF validation flow |
| P2-015 | Replace invoice count() | **P2** | 1h | DB sequence for invoice numbers |
| P3-001 | Fix dangerouslySetInnerHTML | **P3** | 1h | Safe CSS pattern |
| P3-002 | CORS origin validation | **P3** | 1h | Validate origin format |
| P3-004 | API documentation | **P3** | 8h | Document all endpoints |
| P3-005 | Security section in README | **P3** | 2h | Audit instructions |
| P3-006 | Load test scripts | **P3** | 8h | k6 scripts for billing |
| P3-007 | a11y audit | **P3** | 4h | Lighthouse CI setup |
| P3-008 | Fix Playwright E2E | **P3** | 4h | Fix Windows runner |
| P3-009 | Fix TS ignoreBuildErrors | **P3** | 4h | Fix TS errors |
| P3-010 | Git hooks for security | **P3** | 2h | Pre-commit hooks |
| P3-012 | Directory case fix | **P3** | 1h | Standardize naming |
| **Sprint 3 total** | **16 items** | | **~42h** | |

### Sprint 3 Dependencies
- P3-008 (Playwright) depends on P1-009 (API migration) being done
- P3-006 (Load tests) depends on P1-005 (N+1 fix) and P1-006/007 (indexes)

---

## Detailed Fix Plan by Severity

### P0 Items (Critical — Must Fix Before Prod)

| ID | Action | Detailed Steps | Owner | Effort |
|----|--------|---------------|-------|--------|
| P0-001 | Generate random password | 1. Remove hardcoded hash 2. Generate random 16-char password 3. Hash with bcrypt 4. Return temp password in response 5. Force change on first login | Backend | 2h |
| P0-002 | Isolate admin SQL console | 1. Create separate Admin Console service 2. Implement parameterized queries 3. Add query timeout (30s) 4. Add max row limit (1000) 5. Add read-only DB user for queries 6. Remove from main API | Backend | 16h |
| P0-003 | Fail on default JWT secret | 1. Add startup check: if (secret === 'change-me-in-production') throw 2. Document secure secret generation in README | Backend | 1h |
| P0-004 | Harden dev-login | 1. Remove @Public() decorator 2. Require super_admin role 3. Remove in production builds 4. Add audit logging | Backend | 1h |
| P0-005 | Migrate to httpOnly cookies | 1. Remove localStorage read/write 2. Rely on backend-set cookies 3. Update getAuthHeaders() to read cookies 4. Verify CSRF protection still works | Frontend | 4h |
| P0-006 | Register CsrfGuard | 1. Add APP_GUARD provider for CsrfGuard in AppModule 2. Update frontend to send x-csrf-token on mutations 3. Test with Playwright | Both | 2h |
| P0-007 | Rate limit auth endpoints | 1. Add @Throttle({ limit: 5, ttl: 60000 }) on login 2. Add @Throttle({ limit: 3, ttl: 60000 }) on dev-login 3. Add @Throttle({ limit: 10, ttl: 60000 }) on refresh 4. Add per-IP middleware for auth routes | Backend | 4h |
| P0-008 | Add missing guards | 1. Add @UseGuards(AuthGuard('jwt'), RolesGuard) to KpiController 2. Same for WalletController 3. Same for ReportsController 4. Same for InvoicesController 5. Same for TicketsController 6. Same for SupportController 7. Same for SettingsController 8. Same for SearchController 9. Same for CollectionsController 10. Same for BillCycleController | Backend | 2h |

### P1 Items (High — Block Functionality)

| ID | Action | Effort | Dependencies |
|----|--------|--------|-------------|
| P1-001 | Build 17 missing frontend pages | 40h | None |
| P1-002 | Add pagination to 5+ list endpoints | 8h | None |
| P1-003 | Audit sensitive GET endpoints | 2h | None |
| P1-004 | File upload validation | 2h | None |
| P1-005 | Fix N+1 in invoice generation | 4h | P1-006, P1-007 |
| P1-006 | Add Invoice indexes | 1h | None |
| P1-007 | Add Reading indexes | 0.5h | None |
| P1-008 | Fix API Gateway rate limiter | 2h | None |
| P1-009 | Migrate 25 pages to live API | 40h | P1-001 |
| P1-010 | DB-backed integration tests | 16h | None |
| P1-011 | Tests for untested modules | 40h | P1-010 |
| P1-012 | MFA TOTP implementation | 24h | P0-001 |
| P1-013 | Session invalidation on password change | 4h | None |

### P2 Items (Medium — Quality Improvements)

| ID | Action | Effort |
|----|--------|--------|
| P2-001 | DB-based lockout (remove setTimeout) | 2h |
| P2-002 | i18n for missing pages | 8h |
| P2-003 | Remove unused guards | 0.5h |
| P2-004 | CSP headers via Helmet | 2h |
| P2-005 | Admin SQL guardrails | 2h |
| P2-006 | Public endpoint rate limiting | 1h |
| P2-007 | Jest coverage threshold | 1h |
| P2-008 | Remove frontend Prisma | 0.5h |
| P2-009 | Fix dynamic require | 0.5h |
| P2-010 | API Gateway correlation ID | 1h |
| P2-011 | ThrottlerGuard test | 2h |
| P2-012 | CSRF test | 2h |
| P2-013 | Log audit errors | 0.5h |
| P2-014 | Log suppressed errors | 2h |
| P2-015 | Replace invoice count() | 1h |

### P3 Items (Low — Polish)

| ID | Action | Effort |
|----|--------|--------|
| P3-001 | Fix dangerouslySetInnerHTML | 1h |
| P3-002 | CORS origin validation | 1h |
| P3-004 | API documentation | 8h |
| P3-005 | Security section in README | 2h |
| P3-006 | Load test scripts (k6) | 8h |
| P3-007 | a11y audit | 4h |
| P3-008 | Fix Playwright E2E | 4h |
| P3-009 | Fix TS errors | 4h |
| P3-010 | Pre-commit hooks | 2h |
| P3-012 | Directory naming fix | 1h |

---

## Risk Assessment Per Sprint

### Sprint 1 Risks
| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| SQL console migration (P0-002) may break admin workflow | Medium | Keep both old and new for 1 sprint, feature-flag |
| Rate limiting may break legitimate usage | Low | Start conservative (10/min), monitor, adjust |
| CSRF implementation may break frontend | Low | Staged rollout — add header first, then guard |

### Sprint 2 Risks
| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| 17 new pages may introduce new bugs | Medium | Feature-flag new pages, test with Playwright |
| MFA implementation may be complex | Medium | Start with email-based 2FA (simpler), then TOTP |
| Mock-to-API migration may break existing pages | High | Migrate one page at a time, verify mock fallback |

### Sprint 3 Risks
| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| Load tests may reveal performance issues | High | Address in-sprint, defer tuning if minor |
| CI pipeline changes may break builds | Low | Test CI changes in separate branch |

---

## Effort Summary by Role

| Role | Sprint 1 | Sprint 2 | Sprint 3 | Total |
|------|----------|----------|----------|-------|
| Backend (NestJS + Prisma) | 30h | 100h | 15h | 145h |
| Frontend (Next.js + React) | 4h | 88h | 20h | 112h |
| DevOps (Docker + CI) | 2h | 2h | 4h | 8h |
| QA (Tests + Documentation) | 3.5h | 2.5h | 10h | 16h |
| **TOTAL** | **39.5h** | **192.5h** | **49h** | **281h** |

---

## Milestone Dates (Suggested)

| Milestone | Date | Criteria |
|-----------|------|---------|
| **M1: Security Hardened** | Sprint 1 end | All P0 items resolved, pen-test ready |
| **M2: Feature Complete** | Sprint 2 end | All 47 routes have components, all pages use live API |
| **M3: Production Ready** | Sprint 3 end | All P1 items resolved, tests pass, load test within threshold |
| **GA Release** | Sprint 3 + 1 week | Final security audit, documentation freeze, deployment |

---

*End of Fix Priority Roadmap*
