# METER VERSE — LANGUAGE COMPLIANCE BOARD

**Date:** 2026-06-25

---

## FINDINGS

The i18n system supports Arabic/English switching at the login screen. However, a full audit reveals gaps:

### ✅ COVERED (Arabic + English)

| Location | Notes |
|----------|-------|
| Login page | 100% dual language, RTL/LTR switching |
| Navigation sidebar | Menu items translated |
| Page headers | Component titles via `useT()` hook |
| Customer cards | Labels use translation keys |
| Dashboard cards | Labels use translation keys |
| Reports page | Category names, button labels |
| Settings tabs | Tab names translated |
| Form labels | Basic fields use i18n |

### ❌ GAPS FOUND (English only, no Arabic)

| Location | File | Issue |
|----------|------|-------|
| Customer detail tabs | `CustomerDetailPage.tsx:81` | "Ledger", "Wallet", "Solar", "Ownership" tabs are hardcoded in English |
| Wallet tab | `WalletTab.tsx:95` | "Current Balance", "Add Credit", "Apply Debit" hardcoded |
| Ownership tab | `OwnershipTab.tsx:55` | "Select Target Customer", "Reason for Transfer" hardcoded |
| Ownership confirm | `OwnershipTab.tsx:97` | "Ownership Transfer Complete" hardcoded |
| KPI dashboards | `ExecutiveDashboard.tsx:60` | "Total Revenue", "Monthly Revenue", etc. hardcoded |
| Collections aging | `CollectionsDashboard.tsx:70` | "0-30 days", "31-60 days" hardcoded |
| Add customer form | `CustomerDetailPage.tsx:70` | "Create Customer", "Customer Code", "English Name" hardcoded |
| Sync Gateway page | `SyncGatewayPage.tsx:80` | "Gateway Port", "Symbiot", "Billing" hardcoded |
| Reports page buttons | `ReportsPage.tsx:42` | "Preview", "Export CSV" hardcoded |
| Toast messages | Various | `toast.success('Meter created')` hardcoded |
| Error messages | Various | `setError('Failed to create customer')` hardcoded |

### RECOMMENDATION

The i18n framework exists (`useT()`, translation files) but approximately 40% of UI strings still use hardcoded English. Completing this requires:

1. Adding ~400 new translation keys to the i18n files
2. Replacing hardcoded strings with `t('key')` calls
3. Testing with Arabic locale

**Estimated effort: 1 week**
