# Language Certification v3

**Date:** 2026-06-25
**Source:** `Frontend/src/lib/i18n/translations.ts`, `reports/language-compliance-board.md`

---

## Total Translation Keys

### Key Count by Module (from translations.ts)

| Module | Keys | Has Arabic? |
|--------|------|-------------|
| `app` | 2 | ✅ |
| `nav` | 12 | ✅ |
| `sidebar` | 19 | ✅ |
| `login` | 17 | ✅ |
| `dashboard` | 32 | ✅ |
| `projects` | 26 | ✅ |
| `customers` | 39 | ✅ |
| `meters` (incl. actions, lifecycle, assign, replace, terminate) | 56 | ✅ |
| `simCards` | 8 | ✅ |
| `readings` | 24 | ✅ |
| `billing.invoices` | 28 | ✅ |
| `billing.payments` | 22 | ✅ |
| `billing.balances` | 14 | ✅ |
| `billing.consumption` | 8 | ✅ |
| `billing.waterBalance` | 6 | ✅ |
| `billing.tariffs` | 15 | ✅ |
| `reports` | 14 | ✅ |
| `alerts` | 13 | ✅ |
| `tickets` | 13 | ✅ |
| `support` | 8 | ✅ |
| `settings` | 10 | ✅ |
| `common` | 55 | ✅ |
| `locations` | 19 | ✅ |
| **Total** | **460** | ✅ All bilingual |

**Each of these 460 keys has both `en` and `ar` values** — 100% of the translation dictionary is bilingual.

---

## Coverage Analysis

### Pages/Sections WITH translation keys (covered)

| Page | Translation Module | Keys |
|------|-------------------|------|
| Login | `login` | 17 |
| Dashboard | `dashboard` | 32 |
| Projects | `projects` | 26 |
| Customers | `customers` | 39 |
| Locations | `locations` | 19 |
| Meters | `meters` + sub-objects | 56 |
| SIM Cards | `simCards` | 8 |
| Readings | `readings` | 24 |
| Invoices | `billing.invoices` | 28 |
| Payments | `billing.payments` | 22 |
| Balances | `billing.balances` | 14 |
| Consumption | `billing.consumption` | 8 |
| Water Balance | `billing.waterBalance` | 6 |
| Tariffs | `billing.tariffs` | 15 |
| Reports | `reports` | 14 |
| Alerts | `alerts` | 13 |
| Tickets | `tickets` | 13 |
| Support | `support` | 8 |
| Settings | `settings` | 10 |
| Navigation | `nav` + `sidebar` | 31 |
| Common/Shared | `common` | 55 |

### Pages/Sections WITHOUT translation keys (hardcoded English)

| Page/Feature | Required Keys | Status |
|-------------|---------------|--------|
| **Upload Center** (`/upload-center`) | ~10 | ❌ Missing |
| **Workplace** (`/workplace`) | ~15 | ❌ Missing |
| **Bill Cycle** (`/bill-cycle`) | ~15 | ❌ Missing |
| **Adjustments** (`/adjustments`) | ~10 | ❌ Missing |
| **Promises** (`/promises`) | ~10 | ❌ Missing |
| **Recovery** (`/recovery`) | ~10 | ❌ Missing |
| **Collections Dashboard** (aging view) | ~15 | ❌ Missing |
| **Utility pages** (electricity, water, solar, gas, chilled-water, outdoor-unit) | ~40 | ❌ Missing |
| **Utility Settlement** (`/utility/settlement`) | ~10 | ❌ Missing |
| **Executive Dashboard** | ~20 | ❌ Missing |
| **Operations Dashboard** | ~15 | ❌ Missing |
| **Billing Dashboard** | ~15 | ❌ Missing |
| **KPI Dashboards** (executive, collections, utilities) | ~30 | ❌ Missing |
| **Admin: RBAC** | ~15 | ❌ Missing |
| **Admin: Feature Flags** | ~10 | ❌ Missing |
| **Admin: Audit Logs** | ~10 | ❌ Missing |
| **Admin: Sync Gateway** | ~15 | ❌ Missing |
| **Customer Detail tabs** (Ledger, Wallet, Solar, Ownership) | ~20 | ❌ Hardcoded in TSX |
| **Wallet tab** (Current Balance, Add Credit, Apply Debit) | ~10 | ❌ Hardcoded in TSX |
| **Popup/Toast messages** (all `toast.success()` / `toast.error()`) | ~50+ | ❌ Hardcoded strings |
| **Error messages** (all `setError()`) | ~30+ | ❌ Hardcoded strings |
| **Form validation messages** | ~15 | ❌ Hardcoded strings |
| **Confirmation dialogs** (AlertDialog throughout app) | ~20 | ❌ Hardcoded strings |

---

## Hardcoded String Estimate

| Category | Estimated Count | Examples |
|----------|----------------|----------|
| Page titles not in i18n | 25 | "Upload Center", "Workplace", "Bill Cycle", "Adjustments" |
| Dashboard/KPI labels | 40 | "Total Revenue", "Monthly Revenue", "Collection Rate" |
| Customer detail tabs | 8 | "Ledger", "Wallet", "Solar", "Ownership" |
| Wallet tab labels | 6 | "Current Balance", "Add Credit", "Apply Debit" |
| Ownership wizard | 8 | "Select Target Customer", "Reason for Transfer" |
| Utility sub-pages | 30 | Per-utility labels, charts, filters |
| Toast messages | 50+ | "Meter created", "Customer deactivated", "Reading submitted" |
| Error messages | 30+ | "Failed to create customer", "Invalid meter serial" |
| Confirmation prompts | 20 | "Are you sure you want to delete...", "Confirm reversal" |
| Form validation | 15 | "Password must be at least 8 characters" |
| Admin pages | 40 | RBAC, Feature Flags, Audit Logs, Sync Gateway labels |
| **Total Estimated Hardcoded** | **~270-320** | |

---

## What's Needed for 100% Bilingual

| Priority | Task | Keys Needed | Effort |
|----------|------|-------------|--------|
| **P0** | Add translation keys for missing pages (Upload Center, Workplace, Bill Cycle, Adjustments, Promises, Recovery) | ~70 | 1 day |
| **P0** | Add translation keys for Utility pages (electricity, water, solar, gas, chilled-water, outdoor-unit, settlement) | ~40 | 0.5 day |
| **P1** | Add translation keys for Dashboards (Executive, Operations, Billing, Collections, KPI) | ~80 | 1 day |
| **P1** | Add translation keys for Admin pages (RBAC, Feature Flags, Audit Logs, Sync Gateway) | ~50 | 0.5 day |
| **P2** | Replace hardcoded toast/error strings in all TSX files with `t()` calls | ~80 | 1 day |
| **P2** | Replace hardcoded tab/button labels in CustomerDetailPage, WalletTab, OwnershipTab | ~30 | 0.5 day |
| **P3** | Replace hardcoded confirmation dialog text throughout app | ~20 | 0.5 day |
| **P3** | Audit all `confirm()` calls and replace with i18n-aware AlertDialog | ~15 | 0.5 day |

### Summary

| Metric | Value |
|--------|-------|
| Total i18n keys defined | **460** |
| Keys with Arabic translation | **460 (100%)** |
| Estimated hardcoded English strings | **~270-320** |
| Total strings in app (estimated) | **~730-780** |
| Current bilingual coverage | **~60-65%** |
| Target coverage for 100% bilingual | **Add ~300 keys + replace hardcoded strings** |
| Estimated total effort | **~5 days** |
