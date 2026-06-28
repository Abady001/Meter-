# Playwright Enterprise Test Suite — v2 Expansion Plan

**Date:** 2026-06-25
**Source:** `tests/enterprise/` (10 files)

---

## 1. Current Test Inventory

| File | Describe Block | Test Count | Coverage Area |
|------|---------------|------------|---------------|
| `auth.spec.ts` | Authentication | 5 | Login page, valid credentials, token storage, invalid creds, logout, empty form |
| `crud.spec.ts` | CRUD Operations | 5 | Project list load, project list render, project detail, edit project, deactivate, create area |
| `customer.spec.ts` | Customer Management | 5 | Customer list, data rows, detail tabs, customer data, search input, smart search |
| `kpi.spec.ts` | KPI Dashboards | 7 | Executive KPI, KPI cards, Collections KPI, Utilities KPI, Executive dash, Operations dash, Billing dash, Utility dash |
| `navigation.spec.ts` | Sidebar Navigation | 27 | 24 route navigations + sidebar check + page transitions + no-404 |
| `reports.spec.ts` | Reports | 6 | Report list, report cards, generate report, CSV export, categories, filter/search |
| `sync.spec.ts` | Sync Gateway | 5 | Sync page load, status cards, online/offline badges, refresh button, orchestrator status, area list |
| `wallet.spec.ts` | Wallet Operations | 4 | Wallet tab, balance display, add credit dialog, transaction history |

### Total Test Cases: **64 tests** across 8 spec files

### Test Quality Assessment

| Aspect | Rating | Notes |
|--------|--------|-------|
| Auth coverage | ⚠️ FAIR | No role-based login tests, no refresh token tests, no session expiry |
| CRUD coverage | ⚠️ FAIR | Limited to projects; no customer create/edit/delete, no meter CRUD |
| Customer coverage | ⚠️ FAIR | List + detail only; no ownership transfer, no ticket creation |
| KPI coverage | ✅ GOOD | All dashboards load-checked; no data validation |
| Navigation coverage | ✅ GOOD | 24 routes validated; no 404s |
| Reports coverage | ❌ POOR | No per-report-type validation, no CSV content check |
| Sync coverage | ⚠️ FAIR | No actual sync operations, no data flow validation |
| Wallet coverage | ❌ POOR | No debit flow, no credit flow validation, no edge cases |

### Overall: **64 tests** — covers ~30% of the application surface

---

## 2. What's Missing for 300+ Tests

### Current Gaps by Module

| Module | Current Tests | Required for Coverage | Gap |
|--------|:------------:|:---------------------:|:---:|
| Authentication | 5 | 25 | 20 |
| RBAC / Role Switching | 0 | 15 | 15 |
| CRUD — Projects | 5 | 10 | 5 |
| CRUD — Customers | 5 | 20 | 15 |
| CRUD — Meters | 0 | 20 | 20 |
| CRUD — Readings | 0 | 20 | 20 |
| CRUD — Invoices | 0 | 20 | 20 |
| CRUD — Payments | 0 | 15 | 15 |
| CRUD — Tariffs | 0 | 15 | 15 |
| CRUD — Locations | 0 | 10 | 10 |
| CRUD — Users/Admin | 0 | 15 | 15 |
| KPI Dashboards | 7 | 10 | 3 |
| Navigation | 27 | 30 | 3 |
| Reports | 6 | 25 | 19 |
| Sync Gateway | 5 | 20 | 15 |
| Wallet | 4 | 15 | 11 |
| Billing Engine | 0 | 25 | 25 |
| Bill Cycle | 0 | 15 | 15 |
| Collections | 0 | 10 | 10 |
| Search | 0 | 5 | 5 |
| Notifications | 0 | 10 | 10 |
| Tickets / Support | 0 | 10 | 10 |
| Upload Center | 0 | 5 | 5 |
| **Total** | **64** | **~395** | **~331** |

### Priority Gap Analysis — 236 Additional Tests to Reach 300

| Priority | Module | Additional Tests | Cumulative |
|----------|--------|:----------------:|:----------:|
| P0 | Reading CRUD (create, edit, approve, reject, review queue, bulk) | 20 | 84 |
| P0 | Invoice CRUD (generate, issue, cancel, adjust, reverse, list, detail) | 20 | 104 |
| P0 | Payment CRUD (cash, bank, card, wallet, reverse, receipt) | 15 | 119 |
| P0 | Authentication (refresh token, session expiry, dev-login, 401 on expired) | 10 | 129 |
| P0 | RBAC (7 roles × 5 actions each = 35 → 15 essential) | 15 | 144 |
| P1 | Meter CRUD (assign, deactivate, transfer, install date, search) | 20 | 164 |
| P1 | Customer CRUD (create, edit, delete, ownership transfer, merge) | 15 | 179 |
| P1 | Reports (generate × 10 report types, export CSV, print, schedule) | 19 | 198 |
| P1 | Billing Engine (tariff simulation, charge calc, tax, water diff) | 15 | 213 |
| P1 | Bill Cycle (create, lock, approve, close, cancel, regenerate) | 15 | 228 |
| P2 | Wallet (credit, debit, transfer, history, reversal) | 11 | 239 |
| P2 | Collections dashboard (aging, kpi, export, filter) | 10 | 249 |
| P2 | Sync Gateway (orchestrator, area gateways, retry, failover) | 15 | 264 |
| P2 | Tickets (create, edit, assign, resolve, reopen) | 10 | 274 |
| P2 | Admin/User CRUD (create user, assign role, area management) | 15 | 289 |
| P2 | Notifications (create, read, mark read, preferences) | 10 | 299 |
| P2 | Upload Center (csv import, validation, error handling) | 5 | 304 |

---

## 3. Expansion Plan — 300+ Tests

### Phase 1: Foundation (64 → 150) — 2 Sprints

| Week | Focus | New Tests | Cumulative | Files to Create |
|------|-------|:---------:|:----------:|-----------------|
| 1 | Auth + RBAC + Reading CRUD | 45 | 109 | `auth-enhanced.spec.ts`, `rbac.spec.ts`, `readings.spec.ts` |
| 2 | Invoice + Payment + Bill Cycle | 50 | 159 | `invoices.spec.ts`, `payments.spec.ts`, `bill-cycle.spec.ts` |

**Phase 1 Total: +95 tests → 159 total**

### Phase 2: Core Business (150 → 250) — 2 Sprints

| Week | Focus | New Tests | Cumulative | Files to Create |
|------|-------|:---------:|:----------:|-----------------|
| 3 | Meter + Customer + Tariff + Reports | 69 | 228 | `meters.spec.ts`, `tariffs.spec.ts`, `reports-enhanced.spec.ts` |
| 4 | Admin + Wallet + Collections + Billing Engine | 45 | 273 | `admin.spec.ts`, `billing-engine.spec.ts` |

**Phase 2 Total: +114 tests → 273 total**

### Phase 3: Edge Cases (250 → 300+) — 1 Sprint

| Week | Focus | New Tests | Cumulative | Files to Create |
|------|-------|:---------:|:----------:|-----------------|
| 5 | Sync + Tickets + Notifications + Upload + Search + Edge Cases | 31 | 304 | `tickets.spec.ts`, `notifications.spec.ts`, `upload.spec.ts` |

**Phase 3 Total: +31 tests → 304 total**

---

## 4. Test Infrastructure Requirements

| Need | Current | Target | Effort |
|------|---------|--------|--------|
| Test data factories | ❌ None | `test-data.ts` — meter, reading, invoice, customer factories | 2 days |
| API mocking | ❌ None | MSW or Playwright route intercept | 1 day |
| Role-based auth helpers | ❌ `injectAuth` only | `loginAs(role)` — 7 role helpers | 1 day |
| CSV/PDF validation | ❌ None | Assert file downloads, content type | 1 day |
| CI integration | ❌ Not in CI | GitHub Actions workflow | 1 day |
| Visual regression | ❌ None | Playwright `toMatchSnapshot()` per page | 3 days |
| Performance assertions | ❌ None | `waitForFunction` timing checks | 1 day |

---

## 5. Summary

| Metric | Current | Target |
|--------|:-------:|:------:|
| Total test files | 8 | 18-22 |
| Total test cases | 64 | 300+ |
| Modules covered | 8/25 | 25/25 |
| RBAC coverage | 0% | 100% (7 roles) |
| CRUD coverage | 20% | 90% |
| Edge case coverage | 10% | 70% |
| CI pipeline | ❌ | ✅ |
| Visual regression | ❌ | ✅ |
| Test execution time | ~15 min | ~45 min (parallel: ~15 min) |
| **Effort to reach 300+** | — | **5 sprints / 10 days** |
