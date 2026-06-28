# Report 5: Playwright Enterprise Certification

**Date:** 2026-06-25
**Directory:** `tests/enterprise/`

---

## Test Spec Files

| File | Tests | Description |
|------|-------|-------------|
| `auth.spec.ts` | 5 | Login page display, valid credentials, token storage, invalid credentials error, logout clears token, empty form rejection |
| `navigation.spec.ts` | 26 | 24 page navigations (Dashboard→Workplace), sidebar visible, no 404 on transitions |
| `crud.spec.ts` | 5 | Project list loads, list renders content, project detail navigation, edit project name, deactivate project, create area via admin |
| `customer.spec.ts` | 6 | Customer list loads, list renders rows/empty, detail page with tabs, customer data display, search input present, Ctrl+K smart search |
| `wallet.spec.ts` | 4 | Wallet tab visible, balance display, credit dialog opens, transaction history section |
| `kpi.spec.ts` | 8 | Executive KPI, KPI cards with data, Collections KPI, Utilities KPI, Executive dashboard, Operations dashboard, Billing dashboard, Utility dashboard |
| `reports.spec.ts` | 6 | Report list loads, cards/table render, generate report, export CSV button, categories visible, filter/search present |
| `sync.spec.ts` | 6 | Sync gateway loads, status cards render, online/offline badges, refresh button, orchestrator status, area gateway list |

## Test Count

| Suite | Test Count |
|-------|-----------|
| Auth | 5 |
| Navigation | 26 |
| CRUD | 5 |
| Customer | 6 |
| Wallet | 4 |
| KPI | 8 |
| Reports | 6 |
| Sync | 6 |
| **Total** | **66** |

## Test Runner

### How to run

```bash
# Requires frontend (localhost:3000) and backend (localhost:3001) running
cd Frontend
bun run dev          # or: npm run dev

# In another terminal:
npx playwright test tests/enterprise/ --config=tests/enterprise/playwright.config.ts

# Run a single spec:
npx playwright test tests/enterprise/auth.spec.ts --config=tests/enterprise/playwright.config.ts

# With HTML report:
npx playwright test tests/enterprise/ --config=tests/enterprise/playwright.config.ts --reporter=html
```

### Configuration (`playwright.config.ts`)
- **Base URL:** `http://localhost:3000`
- **Timeout:** 60s per test, 10s expect, 15s action, 20s navigation
- **Workers:** 1 (serial), **Retries:** 1 (2 on CI)
- **Browser:** Chromium (Desktop Chrome) with `--no-sandbox`
- **Trace:** on-first-retry, **Screenshot:** only-on-failure, **Video:** retain-on-failure

## Known Failures

### 1. `injectAuth()` helper bypasses login

`helpers.ts:65-73` injects a fake token (`'e2e-test-token'`) into localStorage rather than logging in. If the frontend validates the token against the API, all tests that use `injectAuth` will fail to authenticate. Tests using `login()` (auth.spec.ts) are more reliable.

### 2. `navigateTo()` helper depends on `window.__navigate`

`helpers.ts:75-82` calls `(window as any).__navigate(key)` which requires a global function to be set by the app. If this does not exist, navigation falls back to a timeout (1500ms wait) and tests may pass or fail depending on the current page state.

### 3. No API mock or seed data

Tests operate against whatever data exists in the running system. Empty databases cause:
- `customer.spec.ts` — "hasRows || hasEmpty" assertions pass trivially with empty state
- `kpi.spec.ts` — card count `>= 2` may fail if fewer KPI cards render
- `crud.spec.ts` — "first clickable" element may not be a project link

### 4. Platform-specific timeout sensitivity

- `navigation.spec.ts` — 2000ms waits may not be enough on slow CI runners
- `reports.spec.ts` — 3000ms waits for report generation
- All tests use generous but arbitrary `waitForTimeout()` calls instead of `waitForSelector()` or `waitForURL()`

## Verdict

| Criteria | Status |
|----------|--------|
| Total test count | ✅ 66 |
| Auth coverage | ✅ Login/logout/token flow |
| Navigation coverage | ✅ 24 pages covered |
| CRUD coverage | ⚠️ Basic (no create/delete end-to-end) |
| Customer & Wallet | ⚠️ Relies on existing data |
| KPI dashboards | ✅ 6 dashboard pages |
| Reports | ⚠️ No assertion on actual report generation |
| Sync gateway | ⚠️ UI-only, no real gateway |
| API mocking | ❌ None — tests run against live stack |
| Test isolation | ⚠️ Shared auth state via localStorage |
| CI-ready | ⚠️ Chromium only, single worker, 60s timeout |
