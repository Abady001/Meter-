# Language Certification v2 — Sprint 40-43

**Date:** 2026-06-25  
**Scope:** i18n coverage audit across all frontend components

---

## Translation System

| Metric | Value |
|--------|-------|
| **Total i18n keys in `translations.ts`** | **523** |
| **Top-level sections** | 19 (app, nav, sidebar, login, dashboard, projects, customers, meters, simCards, readings, billing×6, reports, alerts, tickets, support, settings, common, locations) |
| **Arabic translation coverage** | 100% (all 523 keys have Arabic translations) |
| **i18n engine** | `LocaleProvider` + `useT()` hook (`context.tsx`) |
| **RTL/LTR support** | Auto-switch via `locale === 'ar' ? 'rtl' : 'ltr'` |
| **Fallback behavior** | Returns raw key path if key not found |
| **Login page i18n** | Custom `isRtl` bilingual logic (bypasses `useT()`) |

---

## Hardcoded String Count

| Category | Count | Severity |
|----------|-------|----------|
| `toast.success()` messages | 58 | HIGH |
| `toast.error()` messages | 20 | HIGH |
| `setError()` messages | 4 | HIGH |
| `<h1>/<h2>/<h3>` headings | 35 | MEDIUM |
| `<p>/<span>/<label>` labels | 80+ | HIGH |
| `placeholder=` values | 57 | MEDIUM |
| `<Button>` children text | 5 | LOW |
| `sr-only` accessibility labels | 8 | LOW |
| Login page custom bilingual (bypasses i18n) | ~30 | MEDIUM |
| **Total hardcoded strings** | **~297** | |

---

## Coverage Estimate

| Metric | Value |
|--------|-------|
| **Total i18n keys** | 523 |
| **Estimated unique hardcoded strings needing keys** | ~200 |
| **Estimated repetitive strings (can share keys)** | ~97 |
| **Estimated total strings needed for full coverage** | ~723 |
| **Current coverage (keys / (keys + unique missing))** | **~72%** |
| **Coverage including all UI text** | **~65%** |

### Coverage by Module

| Module | i18n Keys Used | Hardcoded Strings | Coverage |
|--------|---------------|-------------------|----------|
| **Login/Register** | ~20 | ~30 (custom bilingual) | 40% |
| **Navigation/Sidebar** | ~25 | ~5 | 83% |
| **Dashboard** | ~15 | ~30 | 33% |
| **Customers** | ~30 | ~20 | 60% |
| **Meters** | ~20 | ~25 | 44% |
| **Readings** | ~15 | ~15 | 50% |
| **Invoices/Billing** | ~25 | ~25 | 50% |
| **Payments** | ~10 | ~15 | 40% |
| **Tariffs** | ~15 | ~15 | 50% |
| **Tickets/Support** | ~10 | ~10 | 50% |
| **Settings/Admin** | ~30 | ~40 | 43% |
| **Reports** | ~10 | ~15 | 40% |
| **Upload** | ~5 | ~10 | 33% |
| **Common UI** | ~15 | ~20 | 43% |
| **Toasts (cross-cutting)** | 0 | ~78 | 0% |
| **Accessibility (sr-only)** | 0 | ~8 | 0% |

---

## Progress Since Baseline

| Baseline (v1) | Current (v2) | Change |
|---------------|-------------|--------|
| ~400 missing keys estimated | ~200 unique strings needing keys | 50% reduction in estimate |
| ~40% coverage | ~65-72% coverage | +25-32% |
| No audit of categories | 8 categories with precise counts | Improved accuracy |
| No module-level breakdown | Full module-by-module coverage | Actionable |

---

## Certification Verdict

| Criterion | Status |
|-----------|--------|
| i18n framework exists and works | ✅ |
| Arabic translations complete for all keys | ✅ |
| RTL/LTR switching works | ✅ |
| < 30% hardcoded strings in critical paths | ❌ |
| All toast messages internationalized | ❌ (0 of 78) |
| Login page uses `useT()` | ❌ (custom bilingual) |
| All placeholders use i18n | ❌ (57 hardcoded) |
| Accessibility labels use i18n | ❌ (8 hardcoded) |

**Verdict: ❌ NOT CERTIFIED** — 297 hardcoded strings remain. Toasts (78 strings) are the biggest gap at 0% coverage. Login page bypasses the i18n system entirely.

**Estimated effort to fully close:** Add ~200 new translation keys, refactor login page to use `useT()`, update ~97 repetitive patterns. Approx. 1 week.
