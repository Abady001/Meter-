# PHASE L — Final Gap Board & Master Backlog

**Date:** 2026-06-19
**Method:** Comprehensive investigation across all 12 audit phases

---

## Critical Gaps

| # | Finding | Severity | Effort | Priority | Current State | Desired State |
|---|---------|----------|--------|----------|---------------|---------------|
| G001 | Gas utility not implemented | Critical | M | P0 | MeterType enum exists, no backend/frontend | Full gas lifecycle with meter, reading, invoice, dashboard |
| G002 | JWT stored in localStorage (XSS risk) | Critical | S | P0 | mp-auth-token in localStorage | httpOnly cookies |
| G003 | No CSRF protection | Critical | S | P0 | CsrfGuard exists but not registered | Token endpoint + frontend integration |
| G004 | Refresh token hashed with SHA-256 | High | XS | P1 | crypto.createHash('sha256') | bcrypt or argon2 |
| G005 | No per-endpoint rate limiting | High | S | P1 | Global 100 req/min | Auth: 5/min, Others: 100/min |
| G006 | Google Chrome hardcoded path | High | XS | P1 | C:\Program Files\Google\Chrome\ | Configurable or use puppeteer bundled Chromium |
| G007 | Visual parity < 98% for invoices | High | M | P1 | JRXML-compliant CSS missing | Pixel-perfect parity with production PDFs |
| G008 | 32+ SBill report templates missing | High | XL | P1 | Only basic reports implemented | All 44 JRXML templates ported |
| G009 | Empty core/features/area schemas | High | L | P1 | Data in sim_system only | Data migrated to correct schemas |
| G010 | Area template not replicated ×15 | High | M | P1 | Single area template | 15 per-area schemas |
| G011 | No payment test data | Medium | XS | P2 | 0 payments in DB | Test payments for workflow verification |
| G012 | ConsumptionPage uses empty chartData | Medium | S | P2 | Empty chart | Real consumption data wired |
| G013 | BalancesPage uses empty data | Medium | S | P2 | Empty balances array | Wire to statement endpoint |
| G014 | WaterBalancePage uses mock array | Medium | S | P2 | Hardcoded childMeters | Real API data |
| G015 | No dark-mode verification | Medium | XS | P2 | Theme toggle exists but untested | Contrast-verified dark mode |
| G016 | Customer statements CSV/export | Low | S | P3 | Statement endpoint exists | CSV + PDF export wired |
| G017 | 3 pending migrations | Low | XS | P3 | 3 migrations not applied | Apply via prisma migrate resolve |
| G018 | No npm audit in CI | Low | S | P3 | No dependency scanning | npm audit in CI pipeline |
| G019 | Puppeteer bundle large | Low | M | P3 | Full Chromium for PDF | Evaluate lightweight alternative |
| G020 | reactStrictMode disabled | Low | XS | P3 | false | Enable and fix issues |

---

## Backlog by Priority

### P0 — Must Fix Before Production

| ID | Item | Effort | Dependencies |
|----|------|--------|-------------|
| G001 | Gas utility implementation | 24h | None |
| G002 | httpOnly cookies for JWT | 8h | None |
| G003 | CSRF token endpoint + guard | 4h | None |
| G006 | Configurable Chrome path | 1h | None |

**P0 Total: ~37h**

### P1 — Core Business Features

| ID | Item | Effort | Dependencies |
|----|------|--------|-------------|
| G004 | bcrypt for refresh tokens | 2h | None |
| G005 | Per-endpoint rate limiting | 4h | None |
| G007 | Visual parity CSS (98%+) | 16h | G006 |
| G008 | 44 SBill report templates | 80h | All utilities certified |
| G009 | Data migration (sim_system → schemas) | 16h | None |
| G010 | Area template replication ×15 | 8h | None |
| G011 | Seed payment test data | 1h | None |
| G012 | Fix ConsumptionPage data | 4h | None |
| G013 | Fix BalancesPage data | 4h | None |
| G014 | Fix WaterBalancePage data | 4h | None |

**P1 Total: ~139h**

### P2 — Quality & Polish

| ID | Item | Effort |
|----|------|--------|
| G015 | Dark mode contrast verification | 4h |
| G016 | Customer statement CSV/PDF export | 8h |
| G017 | Apply pending Prisma migrations | 1h |
| G018 | npm audit in CI | 2h |
| G019 | Evaluate lightweight PDF solution | 8h |
| G020 | Enable reactStrictMode | 4h |

**P2 Total: ~27h**

---

## Summary

| Priority | Count | Total Effort |
|----------|-------|-------------|
| P0 | 4 | ~37h |
| P1 | 10 | ~139h |
| P2 | 6 | ~27h |
| **All** | **20** | **~203h** |

---

## Certification Readiness

| Certification | Status | Blockers |
|---------------|--------|----------|
| UTILITY_CERTIFIED | 🟡 6/7 | G001 (Gas) |
| MOCK_FREE | ✅ YES | None |
| SECURITY_CERTIFIED | ❌ NO | G002, G003, G004, G005 |
| VISUAL_PARITY_CERTIFIED | 🟡 ~85% | G007 |
| REPORT_SUITE_CERTIFIED | ❌ NO | G008 (G001 blocks) |
| SCHEMA_CERTIFIED | 🟡 | G009, G010 |
| PLAYWRIGHT_CERTIFIED | ✅ YES | 25/25 PASS |
| PRODUCTION_READY | ❌ NO | Multiple P0 gaps |
