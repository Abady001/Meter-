# Main Plan Sync Report

**Date:** 2026-06-20  

---

## 1. Current Completion Status

| Feature | Score | Status |
|---|---|---|
| Database Admin | 10% | UI exists, no backend controller |
| Billing Engine | 20% | Flat rate only, tariff engine disconnected |
| Bill Cycle | 5% | Schema only, zero code, zero UI |
| Invoice Template | 75% | Well-structured, missing tests + preview |
| Login/Auth | 20% | 3 critical bypasses, 404 on login |
| Settings | 60% | 7 tabs, 4 controllers work, 3 broken |
| Reports | 5% | Report engine not assessed in this batch |
| **Overall** | **~28%** | Average across assessed modules |

---

## 2. Top 20 Blockers (Ranked)

| Rank | Blocker | Priority | File:Line |
|---|---|---|---|
| 1 | Auto-login as super_admin | P0 | `AppShell.tsx:93` |
| 2 | Mock token fallback | P0 | `mock-auth.ts:56,59` |
| 3 | Dev-login no password check | P0 | `auth.controller.ts:134` |
| 4 | No admin backend controller | P0 | `backend/src/**/*.ts` — zero hits |
| 5 | Invoice flat rate only | P0 | `billing.controller.ts:103` |
| 6 | TariffEngineService not wired | P0 | Only at `billing.controller.ts:524` |
| 7 | No admin controller in database module | P0 | `src/common/database/` has service + module only |
| 8 | 404 on initial login route | P1 | `router-store.ts:56`, `AppShell.tsx:260` |
| 9 | No server-side token validation | P1 | Missing on reload |
| 10 | BillingCycle — zero code/UI | P1 | `migration.sql:474`, zero `backend/src/` refs |
| 11 | Random 4-char invoice number | P1 | `billing.controller.ts:105` |
| 12 | 3 Settings tabs lack controllers | P1 | `SettingsPage.tsx` — 4 of 7 have controllers |
| 13 | No bill cycle UI | P1 | Not in AppShell renderPage |
| 14 | Only 2 Next.js pages | P2 | `/` and `/login` only |
| 15 | SPA-only routing (29 client pages) | P2 | `AppShell.tsx` renderPage switch |
| 16 | Template engine has no CI tests | P1 | No test file |
| 17 | No template preview endpoint | P2 | Not exposed |
| 18 | No template versioning | P2 | Overwrite-only |
| 19 | Hardcoded TABLE_OPTIONS | P2 | `DatabaseAdminPage.tsx` |
| 20 | No schema introspection for admin | P2 | Not driven by DB metadata |

---

## 3. Recommended Next Sprint

### Sprint Goal: **Fix Login (P0) + Wire Tariff Engine (P0)**

**Sprint backlog:**

| Task | Target | Effort | Dependencies |
|---|---|---|---|
| Remove auto-login from AppShell.tsx:93 | Auth | 2h | None |
| Remove mock token generation at mock-auth.ts:56,59 | Auth | 1h | None |
| Gate dev-login at auth.controller.ts:134 behind env flag | Auth | 2h | None |
| Add 'login' case to AppShell.tsx:260 renderPage | Auth | 1h | None |
| Implement JWT server-side validation on reload | Auth | 2–3d | Token issuance logic |
| Replace flat rate at billing.controller.ts:103 with TariffEngineService | Billing | 5–8d | TariffEngineService API |
| Replace random invoice number at billing.controller.ts:105 with sequence | Billing | 1d | Sequence table or generator |
| Create admin controller for database module | Database Admin | 3–5d | DatabaseModule |

**Total estimated effort:** 12–20 days for sprint 1.

---

## 4. Why Login + Tariff Engine First

1. **Login** gates everything — without secure auth, no feature can be tested reliably. The 3 bypasses mean current test results are meaningless.
2. **Tariff Engine wiring** is the core business logic. Flat-rate billing is incorrect for all multi-tier, TOU, demand, and solar accounts — which is the majority of commercial customers.
3. Once both are stable, other gaps (bill cycles, settings tabs, admin) can be addressed in subsequent sprints.

---

## 5. Risk Register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Auth bypasses exploited before fix | High | Critical | Immediate removal of auto-login + mock fallback |
| Flat-rate invoices shipped to customers | High | Critical | Disable billing until tariff engine is wired |
| Bill cycle missing → ungrouped invoices | Medium | High | Manual grouping possible, but error-prone |
| Template engine changes without tests | Medium | Medium | Add CI tests before template modifications |
| SPA-only routing breaks SEO | Low | Medium | Acceptable for internal app, critical if customer-facing |
