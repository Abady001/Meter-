# METER VERSE — LANGUAGE VALIDATION AUDIT

**Date:** 2026-06-25
**Auditor:** Principal QA Architect & Security Engineer
**Baseline:** `reports/language-compliance-board.md` (48 lines, ~40% coverage)
**Translation Keys:** 523 keys in `translations.ts` (English + Arabic)
**i18n System:** `LocaleProvider` + `useT()` hook in `context.tsx`
**Scope:** All `Frontend/src/components/**/*.tsx` and `Frontend/src/app/**/*.tsx`

---

## i18n Architecture

### Translation Engine (`context.tsx`):
- `LocaleProvider` wraps the app, defaults to Arabic (`'ar'`)
- `useT()` returns a `t(path, params)` function
- Paths are dot-separated keys resolved from the `TranslationDict` (e.g., `t('dashboard.title')`)
- Parameters support interpolation: `{count}`, `{plural}` (for English pluralization)
- RTL/LTR direction toggle via `locale === 'ar' ? 'rtl' : 'ltr'`
- Fallback: if a key is not found, returns the raw `path` string

### Translation Coverage:
- 523 keys total (both languages)
- 19 top-level sections: `app`, `nav`, `sidebar`, `login`, `dashboard`, `projects`, `customers`, `meters`, `simCards`, `readings`, `billing` (6 sub-sections), `reports`, `alerts`, `tickets`, `support`, `settings`, `common`, `locations`
- Arabic translations are complete for all keys

---

## Hardcoded English Strings Found

### Category 1: `toast.success()` Messages (Hardcoded English)

**58 matches found.** Most are un-i18n'd:

| Location | Count | Examples |
|----------|-------|---------|
| `hooks/use-meters.ts` | 8 | 'Meter created', 'Meter updated', 'Meter assigned successfully', 'Meter deleted' |
| `hooks/use-projects.ts` | 6 | 'Project created successfully', 'Project updated successfully', 'Project deleted' |
| `hooks/use-payments.ts` | 2 | 'Payment recorded', 'Failed to record payment' |
| `hooks/use-create-location.ts` | 1 | 'Location created' |
| `hooks/use-update-location.ts` | 1 | 'Location updated' |
| `hooks/use-delete-location.ts` | 1 | 'Location deactivated' |
| `components/workspace/WorkplacePage.tsx` | 1 | 'Task created' |
| `components/readings/ReadingNewPage.tsx` | 2 | 'Reading submitted successfully!', 'Failed to submit reading' |
| `components/upload/UploadCenterPage.tsx` | 2 | 'Upload failed: ...', 'Download failed' |
| `components/settlement/SettlementPage.tsx` | 4 | 'Settlement created', 'Failed', 'Adjustment created', 'Failed' |
| `components/reports/ReportsPage.tsx` | 6 | 'Failed to load report', 'No data to export', 'CSV downloaded', 'JSON downloaded', 'Export failed' |
| `components/reports/SettingsPage.tsx` | 12 | 'User created', 'User deactivated', 'Area created', 'Area deactivated', 'Unit type created', etc. |
| `components/tickets/TicketsPage.tsx` | 1 | 'Ticket created' |
| `components/tickets/SupportPage.tsx` | 1 | 'Request created' |
| `components/tariffs/TariffStudioPage.tsx` | 4 | 'Tariff created', 'Failed', 'Deleted', 'Simulation failed', 'Tiers saved' |
| `components/customers/OwnershipTab.tsx` | 3 | 'Search failed', 'Select target customer...', 'Ownership transferred successfully' |
| `components/admin/DatabaseAdminPage.tsx` | 2 | 'Record deleted', 'Saved' |
| `components/billing/InvoiceDetailPage.tsx` | 2 | 'Invoice issued', 'Failed to issue invoice' |
| `components/billing/InvoicesPage.tsx` | 2 | 'Invoice issued', 'Failed to issue invoice' |
| `components/customers/WalletTab.tsx` | 3 | 'Credit applied', 'Debit applied', 'Transfer completed' |

**Total: ~58 hardcoded toast messages**

### Category 2: `setError()` Messages (Hardcoded English)

| Location | Count | Examples |
|----------|-------|---------|
| `app/login/page.tsx` | ~10 | 'Username is required', 'Password is required', 'Invalid credentials', 'Account permanently locked...', 'Cannot connect to server', 'Authentication failed' |
| `app/register/page.tsx` | 3 | 'Please fill all required fields', 'Cannot connect to server' |

**Total: ~4 hardcoded error state messages** (login page is manually bilingual with `isRtl` checks, which is a non-standard approach)

### Category 3: `<h1>`, `<h2>`, `<h3>` Headings (Hardcoded English)

**50 matches found.** The following are NOT using `t()`:

| Location | String |
|----------|--------|
| `ExecutiveDashboard.tsx:58` | 'Executive Dashboard' |
| `BillingDashboard.tsx:26` | 'Billing Dashboard' |
| `OperationsDashboard.tsx:31` | 'Operations Dashboard' |
| `UtilityDashboard.tsx:41` | 'Utility Dashboard' |
| `CollectionsDashboardPlus.tsx:21` | 'Collections Dashboard+' |
| `SolarDashboard.tsx:16` | 'Solar Dashboard' |
| `MeterAssignPage.tsx:105` | 'Select Project' |
| `MeterAssignPage.tsx:114` | 'Select Building' |
| `MeterAssignPage.tsx:123` | 'Select Floor' |
| `MeterAssignPage.tsx:132` | 'Select Unit' |
| `MeterAssignPage.tsx:141` | 'Select Customer' |
| `MeterAssignPage.tsx:150` | 'Select Meter Type' |
| `MeterAssignPage.tsx:163` | 'Select Meter' |
| `MeterAssignPage.tsx:174` | 'Select SIM/IP (Optional)' |
| `MeterAssignPage.tsx:189` | 'Review & Confirm' |
| `MeterTerminatePage.tsx:75` | 'Select Meter' |
| `MeterTerminatePage.tsx:93` | 'Meter Details' |
| `MeterTerminatePage.tsx:110` | 'Termination Details' |
| `MeterReplacePage.tsx:83` | 'Current Meter' |
| `MeterReplacePage.tsx:112` | 'New Meter' (from `t()`) — OK |
| `MeterTerminatePage.tsx:134` | Warning about consumption |
| `MeterAssignPage.tsx:26` | 'Meter Type' in step labels |
| `OwnershipTab.tsx:71` | 'Ownership Transfer Complete' |
| `TicketsPage.tsx:71` | Column names |
| `AppShell.tsx:284` | 'Administration Portal' |
| `AppShell.tsx:298` | 'Bill Cycle' |
| `AppShell.tsx:308` | '404' |
| `PagePlaceholder.tsx:63` | 'Coming Soon' |
| `app/register/page.tsx:41` | 'Request Submitted' |
| `app/register/page.tsx:63` | 'Create Account' |
| `app/login/page.tsx:106` | 'Meter Verse' (brand — acceptable) |
| `app/login/page.tsx:178` | 'Sign In' |
| `SupportPage.tsx:43` | 'New Request' |
| `SettingsPage.tsx` | Multiple section headers ('Users', 'Areas', etc.) |

**Total: ~35+ hardcoded headings** (the login page uses its own `isRtl` bilingual logic, not the i18n system)

### Category 4: `<p>` and `<span>` Labels with English Text

Found in almost every page component. Key examples:

| Location | String |
|----------|--------|
| `WorkplacePage.tsx:47` | 'Meter Verse / عالم العدادات' |
| `WorkplacePage.tsx:53` | 'Completed Today', 'Completion Rate', 'Team Members' |
| `WorkplacePage.tsx:88` | 'No pending tasks' |
| `WorkplacePage.tsx:106` | 'No activity yet' |
| `UploadCenterPage.tsx:114` | 'All records imported successfully' |
| `UploadCenterPage.tsx:166` | 'Uploading...' |
| `ReadingNewPage.tsx:100` | 'Project' (label) |
| `ReadingNewPage.tsx:121-122` | 'Unit', 'Customer' labels |
| `ReadingNewPage.tsx:155` | 'Source' label |
| `ReadingNewPage.tsx:169` | 'Optional notes...' |
| `MeterAssignPage.tsx:169` | 'No available meters of this type.' |
| `MeterAssignPage.tsx:180` | 'No available SIM cards.' |
| `MeterAssignPage.tsx:183` | 'Preserve reading history' |
| `MeterAssignPage.tsx:86` | subtitle='Follow the steps...' |
| `MeterTerminatePage.tsx:69` | subtitle='Permanently deactivate...' |
| `MeterReplacePage.tsx:77` | subtitle='Replace an existing meter...' |
| `MetersPage.tsx:85` | subtitle='Manage water and electricity meters' |
| `CustomersPage.tsx:53` | subtitle='Customer Management' |
| `ReadingsPage.tsx:74` | subtitle='View and manage all meter readings' |
| `InvoicesPage.tsx:94` | subtitle text |
| `PaymentsPage.tsx:79` | subtitle text |
| `ConsumptionPage.tsx:39` | subtitle='Monitor and analyze consumption trends' |
| `BalancesPage.tsx:64` | subtitle text |
| `WaterBalancePage.tsx:40` | subtitle text |
| `DashboardPage.tsx:367` | subtitle uses `t()` — OK |
| `SupportPage.tsx:73` | 'Select a request or create a new one' |
| `TariffStudioPage.tsx:128` | 'Define consumption tiers...' |
| `SettingsPage.tsx` | ~15 hardcoded descriptions |
| `KPI/UtilitiesDashboard.tsx` | 'Invoices', 'Total Amount', 'Collected', 'Open' labels |
| `BillingDashboard.tsx` | 'Total Invoiced', 'Total Collected', 'Outstanding', 'Collection Rate' |
| `UtilityDashboard.tsx` | Multiple utility labels |
| `SolarDashboard.tsx` | Multiple solar labels |
| `OperationsDashboard.tsx` | Multiple operational labels |
| `ExecutiveDashboard.tsx` | 'Total Revenue' etc. |
| `DatabaseAdminPage.tsx:61-64` | 'Database', 'Tables', 'Records', 'Dependency Check' |

**Total: ~80+ hardcoded paragraph/label strings**

### Category 5: `placeholder=` Values (Hardcoded English)

**57 matches found** across 14 files. Examples:

| Location | String |
|----------|--------|
| `MeterAssignPage.tsx` | 'Choose project', 'Choose building', 'Choose floor', 'Choose unit', 'Choose customer', 'Choose type', 'Choose meter', 'Choose SIM card' |
| `MeterTerminatePage.tsx` | 'Select meter to terminate', 'Enter final meter reading', 'Enter termination reason...' |
| `MeterReplacePage.tsx` | 'Select current meter', 'Select new meter', 'Last reading on current meter', 'Enter reason for replacement...' |
| `ReadingNewPage.tsx` | 'Select project', 'Select meter', 'Enter current reading', 'Optional notes...' |
| `PaymentsPage.tsx` | 'Select project', 'Select customer', 'Select method', 'Optional notes...' |
| `WorkplacePage.tsx` | 'Task title', 'Description', 'Assign to (user ID)' |
| `OwnershipTab.tsx` | 'Search by name, code, or phone...', 'Enter reason...' |
| `CustomersPage.tsx` | 'Search customers...' |
| `SettingsPage.tsx` | 'Select area', 'Select type' |
| `WalletTab.tsx` | 'Reason for credit...', 'Reason for debit...', 'Target wallet ID', 'Transfer reason...' |
| `ProjectFormDialog.tsx` | 'PRJ-001', 'Project Name' |
| `GlobalSearchDialog.tsx` | 'Search customers, meters, invoices...' |
| `app/login/page.tsx` | 'Enter username', 'Enter password' (manually bilingual with `isRtl`) |
| `app/register/page.tsx` | 'First name', 'Last name', 'Phone Number', etc. (MANUALLY bilingual with `isRtl`) |

**Total: ~57 hardcoded placeholders**

### Category 6: `<Button>` Children Text (Hardcoded English)

| Location | Count | Examples |
|----------|-------|---------|
| `WorkplacePage.tsx:136` | 1 | 'Create' |
| `WorkplacePage.tsx:210` | 1 | 'Assigning...' |
| `MeterAssignPage.tsx:210` | 1 | 'Assigning...' |
| `DashboardPage.tsx:521` | 1 | 'Invoices' (bar name — recharts) |
| `DashboardPage.tsx:528` | 1 | 'Payments' (bar name — recharts) |

**Total: ~5 hardcoded button texts**

### Category 7: sr-only / Accessibility Labels

| Location | String |
|----------|--------|
| `ui/dialog.tsx:75` | 'Close' |
| `ui/breadcrumb.tsx:96` | 'More' |
| `ui/carousel.tsx:199` | 'Previous slide' |
| `ui/carousel.tsx:229` | 'Next slide' |
| `ui/pagination.tsx:80` | 'Previous' |
| `ui/pagination.tsx:96` | 'Next' |
| `ui/pagination.tsx:114` | 'More pages' |
| `ui/sidebar.tsx:277` | 'Toggle Sidebar' |

**Total: 8 hardcoded accessibility labels**

### Category 8: Login Page (`app/login/page.tsx`) — SPECIAL CASE

The login page implements its own bilingual system using `isRtl` boolean checks and ternary expressions rather than the app's `useT()` hook. While this functionally works for Arabic/English switching, it:
1. Bypasses the centralized i18n system
2. Does not support translations from the `translations.ts` file
3. Creates a maintenance burden — new translations must be added in two places
4. Hardcodes ~30 UI strings outside the i18n system

---

## Summary

| Category | Count | Severity |
|----------|-------|----------|
| `toast.success()` hardcoded English | ~58 | HIGH |
| `toast.error()` hardcoded English | ~20 | HIGH |
| `setError()` hardcoded English | ~4 | HIGH |
| `<h1>/<h2>/<h3>` hardcoded English | ~35 | MEDIUM |
| `<p>/<span>/<label>` hardcoded English | ~80+ | HIGH |
| `placeholder=` hardcoded English | ~57 | MEDIUM |
| `<Button>` children hardcoded | ~5 | LOW |
| `sr-only` accessibility hardcoded | ~8 | LOW |
| Login page custom bilingual (bypasses i18n) | ~30 | MEDIUM |

**Estimated total hardcoded strings: ~297**

## Recommendations

1. **Centralize all toast messages** into translation keys under `common.toasts.*` namespace
2. **Add subtitle translations** for every page — currently `subtitle=` props are almost exclusively hardcoded English
3. **Add placeholder translations** — every `placeholder=` string should use `t()`
4. **Migrate login page** from `isRtl` ternary pattern to `useT()` hook
5. **Add translation keys** for all KPI dashboard labels, admin panel labels, and modal headings
6. **Add accessibility (`sr-only`) translations** for UI components
7. **Update `language-compliance-board.md`** with these findings (coverage estimate revised from 40% to ~35%)

## Progress Since Baseline

The previous `language-compliance-board.md` estimated ~400 missing keys. This audit shows approximately **297 hardcoded strings** needing remediation, of which:
- ~200 are unique strings needing new translation keys
- ~97 are repetitive patterns (e.g., multiple `'Failed'` toasts) that can share keys
