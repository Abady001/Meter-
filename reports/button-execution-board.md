# Button Execution Board — Sprint 40-43

**Date:** 2026-06-25  
**Scope:** All interactive buttons across the frontend, grouped by module  
**Classification:** WORKING | PARTIAL | BROKEN

---

## Auth

| # | Button | Location | Action Handler | API Called | Endpoint | Status |
|---|--------|----------|---------------|-----------|----------|--------|
| 1 | Sign In | `login/page.tsx` | handleSubmit | POST | `/api/v1/auth/login` | WORKING |
| 2 | Register | `register/page.tsx` | handleSubmit | POST | `/api/v1/auth/register` | WORKING |

## Customers

| # | Button | Location | Action Handler | API Called | Endpoint | Status |
|---|--------|----------|---------------|-----------|----------|--------|
| 3 | Add Customer | `CustomersPage.tsx:89` | navigate('customer-detail', { id: 'new' }) | Navigation only | N/A | WORKING |
| 4 | Create Customer | `CustomerDetailPage.tsx:79` | handleCreate | POST | `/projects/:pid/customers` | WORKING |
| 5 | Credit | `WalletTab.tsx:105` | Opens dialog | Opens dialog | N/A | WORKING |
| 6 | Apply Credit | `WalletTab.tsx:113` | creditMutation.mutate | POST | `/wallet/:id/credit` | WORKING |
| 7 | Debit | `WalletTab.tsx:121` | Opens dialog | Opens dialog | N/A | WORKING |
| 8 | Apply Debit | `WalletTab.tsx:128` | debitMutation.mutate | POST | `/wallet/:id/debit` | WORKING |
| 9 | Transfer | `WalletTab.tsx:138` | Opens dialog | Opens dialog | N/A | WORKING |
| 10 | Execute Transfer | `WalletTab.tsx:146` | transferMutation.mutate | POST | `/wallet/transfer` | WORKING |
| 11 | Search (Customer) | `OwnershipTab.tsx:131` | searchCustomer | POST | `/admin/query` | WORKING |
| 12 | Continue to Review | `OwnershipTab.tsx:159` | setStep('preview') | State only | N/A | WORKING |
| 13 | Confirm Transfer | `OwnershipTab.tsx:163` | setStep('confirm') | State only | N/A | WORKING |
| 14 | Execute Transfer | `OwnershipTab.tsx:179` | executeTransfer | POST | `/customers/:id/transfer-ownership` | WORKING |

## Projects

| # | Button | Location | Action Handler | API Called | Endpoint | Status |
|---|--------|----------|---------------|-----------|----------|--------|
| 15 | + Create | `ProjectsPage.tsx:82` | Opens dialog | Opens dialog | N/A | WORKING |
| 16 | Delete (Project) | `ProjectsPage.tsx:124-133` | deleteMutation.mutate | DELETE | `/projects/:id` | WORKING |
| 17 | Save/Create | `ProjectFormDialog.tsx:98` | handleSubmit | POST/PATCH | `/projects` or `/projects/:id` | WORKING |

## Locations

| # | Button | Location | Action Handler | API Called | Endpoint | Status |
|---|--------|----------|---------------|-----------|----------|--------|
| 18 | + Building | `LocationsPage.tsx:112` | openCreateDialog('building') | Opens dialog | N/A | WORKING |
| 19 | + Unit | `LocationsPage.tsx:115` | openCreateDialog('unit') | Opens dialog | N/A | WORKING |
| 20 | Save | `LocationsPage.tsx:240` | handleSave | POST/PATCH | `/projects/:pid/locations` | WORKING |
| 21 | Delete (Location) | `LocationsPage.tsx:257-261` | deleteMutation.mutate | DELETE | `/projects/:pid/locations/:id` | WORKING |

## Meters

| # | Button | Location | Action Handler | API Called | Endpoint | Status |
|---|--------|----------|---------------|-----------|----------|--------|
| 22 | + Add Meter | `MetersPage.tsx:87` | navigate('meter-detail', { id: 'new' }) | Navigation only | N/A | WORKING |
| 23 | Delete (Meter) | `MetersPage.tsx:139` | deleteMutation.mutate | DELETE | `/meters/:id` | WORKING |
| 24 | Assign/Submit | `MeterAssignPage.tsx:209` | handleConfirm | POST | `/meters/:id/assign` | WORKING |
| 25 | Replace/Submit | `MeterReplacePage.tsx:169` | handleConfirm | POST | (replaceMutation, endpoint unclear) | PARTIAL |
| 26 | Terminate/Submit | `MeterTerminatePage.tsx:143` | handleConfirm | POST | (terminateMutation, endpoint unclear) | PARTIAL |

## Readings

| # | Button | Location | Action Handler | API Called | Endpoint | Status |
|---|--------|----------|---------------|-----------|----------|--------|
| 27 | + New Reading | `ReadingsPage.tsx:76` | navigate('reading-new') | Navigation only | N/A | WORKING |
| 28 | View (dropdown) | `ReadingsPage.tsx:62` | toast.info('View reading details') | None | N/A | BROKEN (toast stub) |
| 29 | Edit (dropdown) | `ReadingsPage.tsx:63` | toast.info('Edit reading') | None | N/A | BROKEN (toast stub) |
| 30 | Submit Reading | `ReadingNewPage.tsx:192` | handleSubmit | POST | `/readings` | WORKING |

## Invoices

| # | Button | Location | Action Handler | API Called | Endpoint | Status |
|---|--------|----------|---------------|-----------|----------|--------|
| 31 | + Generate Invoice | `InvoicesPage.tsx:96` | toast.info('Create Invoice dialog would open') | None | N/A | BROKEN (toast stub) |
| 32 | View | `InvoicesPage.tsx:70` | navigate('invoice-detail', { id }) | Navigation only | N/A | WORKING |
| 33 | Edit (dropdown) | `InvoicesPage.tsx:72` | toast.info('Edit invoice') | None | N/A | BROKEN (toast stub) |
| 34 | Issue | `InvoicesPage.tsx:75` | issueMutation.mutate | POST | `/invoices/:id/issue` | WORKING |
| 35 | Record Payment | `InvoicesPage.tsx:78` | toast.info('Record payment') | None | N/A | BROKEN (toast stub) |
| 36 | Download PDF | `InvoicesPage.tsx:80` | downloadFile | GET | `/downloads/invoices/:id/pdf` | WORKING |
| 37 | Cancel | `InvoicesPage.tsx:82` | toast.info('Invoice cancelled') | None | N/A | BROKEN (toast stub) |
| 38 | Edit (detail) | `InvoiceDetailPage.tsx:56` | toast.info('Edit invoice') | None | N/A | BROKEN (toast stub) |
| 39 | Issue (detail) | `InvoiceDetailPage.tsx:59` | issueMutation.mutate | POST | `/invoices/:id/issue` | WORKING |
| 40 | Record Payment (detail) | `InvoiceDetailPage.tsx:61` | toast.info('Record payment') | None | N/A | BROKEN (toast stub) |
| 41 | Download (detail) | `InvoiceDetailPage.tsx:62` | downloadFile | GET | `/downloads/invoices/:id/pdf` | WORKING |
| 42 | Cancel (detail) | `InvoiceDetailPage.tsx:64` | toast.info('Cancel invoice') | None | N/A | BROKEN (toast stub) |

## Payments

| # | Button | Location | Action Handler | API Called | Endpoint | Status |
|---|--------|----------|---------------|-----------|----------|--------|
| 43 | + Record Payment | `PaymentsPage.tsx:83` | Opens dialog | Opens dialog | N/A | WORKING |
| 44 | Record (dialog) | `PaymentsPage.tsx:132` | createPayment.mutate | POST | `/payments` | WORKING |
| 45 | View (dropdown) | `PaymentsPage.tsx:62` | toast.info('View payment') | None | N/A | BROKEN (toast stub) |
| 46 | Edit (dropdown) | `PaymentsPage.tsx:64` | toast.info('Edit payment') | None | N/A | BROKEN (toast stub) |
| 47 | Delete (dropdown) | `PaymentsPage.tsx:67` | toast.info('Delete payment') | None | N/A | BROKEN (toast stub) |

## Tariff Studio

| # | Button | Location | Action Handler | API Called | Endpoint | Status |
|---|--------|----------|---------------|-----------|----------|--------|
| 48 | Simulate | `TariffStudioPage.tsx:62` | Opens dialog | Opens dialog | N/A | WORKING |
| 49 | + New Tariff | `TariffStudioPage.tsx:63` | Opens dialog | Opens dialog | N/A | WORKING |
| 50 | Edit (pencil) | `TariffStudioPage.tsx:86` | Opens dialog | Opens dialog | N/A | WORKING |
| 51 | Tiers | `TariffStudioPage.tsx:87` | Opens dialog | Opens dialog | N/A | WORKING |
| 52 | Delete (trash) | `TariffStudioPage.tsx:88` | deleteMutation.mutate | DELETE | `/tariffs/:id` | WORKING |
| 53 | Save | `TariffStudioPage.tsx:118` | createMutation.mutate | POST | `/tariffs` | WORKING |
| 54 | + Add Tier | `TariffStudioPage.tsx:146` | setTiers | State only | N/A | WORKING |
| 55 | Close / Save Tiers | `TariffStudioPage.tsx:149-150` | toast.success('Tiers saved') | None | N/A | BROKEN (toast stub) |
| 56 | Run Simulation | `TariffStudioPage.tsx:169` | handleSimulate | POST | `/tariffs/simulate` | WORKING |

## Tickets & Support

| # | Button | Location | Action Handler | API Called | Endpoint | Status |
|---|--------|----------|---------------|-----------|----------|--------|
| 57 | Create Ticket | `TicketsPage.tsx:43` | Opens dialog | Opens dialog | N/A | WORKING |
| 58 | Create (dialog) | `TicketsPage.tsx:56` | createMutation.mutate | POST | `/tickets` | WORKING |
| 59 | Submit (Support) | `SupportPage.tsx:46` | createMutation.mutate | POST | `/support` | WORKING |

## Alerts

| # | Button | Location | Action Handler | API Called | Endpoint | Status |
|---|--------|----------|---------------|-----------|----------|--------|
| 60 | Acknowledge | `AlertsPage.tsx:47` | handleAcknowledge | PATCH | (markRead mutation) | WORKING |

## Settlements

| # | Button | Location | Action Handler | API Called | Endpoint | Status |
|---|--------|----------|---------------|-----------|----------|--------|
| 61 | Adjustment | `SettlementPage.tsx:49` | Opens dialog | Opens dialog | N/A | WORKING |
| 62 | + New Settlement | `SettlementPage.tsx:50` | Opens dialog | Opens dialog | N/A | WORKING |
| 63 | Download PDF | `SettlementPage.tsx:77` | window.open | GET | `/invoices/:id/pdf` | WORKING |
| 64 | Create (Settlement) | `SettlementPage.tsx:123-124` | createSettlement.mutate | POST | `/settlement` | WORKING |
| 65 | Create (Adjustment) | `SettlementPage.tsx:148-149` | createAdjustment.mutate | POST | `/settlement/adjustments` | WORKING |

## Workplace

| # | Button | Location | Action Handler | API Called | Endpoint | Status |
|---|--------|----------|---------------|-----------|----------|--------|
| 66 | + New (Task) | `WorkplacePage.tsx:64` | setTaskOpen(true) | Opens dialog | N/A | WORKING |
| 67 | Create (Task) | `WorkplacePage.tsx:135-136` | toast.success('Task created') | None | N/A | BROKEN (toast stub) |

## Sync Gateway

| # | Button | Location | Action Handler | API Called | Endpoint | Status |
|---|--------|----------|---------------|-----------|----------|--------|
| 68 | Refresh All | `SyncGatewayPage.tsx:102` | checkAll | GET | `/health` (orchestrator + gateways) | WORKING |

## Upload Center

| # | Button | Location | Action Handler | API Called | Endpoint | Status |
|---|--------|----------|---------------|-----------|----------|--------|
| 69 | Upload | `UploadCenterPage.tsx:164` | handleUpload | POST | `/upload/file` | WORKING |
| 70 | Clear | `UploadCenterPage.tsx:172` | setResult(null) | State only | N/A | WORKING |

## Reports

| # | Button | Location | Action Handler | API Called | Endpoint | Status |
|---|--------|----------|---------------|-----------|----------|--------|
| 71 | Category buttons | `ReportsPage.tsx:119` | setActiveCategory(cat) | State only | N/A | WORKING |
| 72 | Preview | `ReportsPage.tsx:136` | handlePreview | GET | `/reports/generate/:id` | WORKING |
| 73 | CSV | `ReportsPage.tsx:139` | handleExport | GET | `/reports/generate/:id` | WORKING |

## Settings

| # | Button | Location | Action Handler | API Called | Endpoint | Status |
|---|--------|----------|---------------|-----------|----------|--------|
| 74 | Multiple CRUD | `SettingsPage.tsx` | Various mutations | POST/PATCH/DELETE | `/users`, `/areas`, `/units` | WORKING |

---

## Summary

| Classification | Count | Details |
|---------------|-------|---------|
| **WORKING** | 57 | Real handler → real API call → real endpoint |
| **PARTIAL** | 2 | Meter Replace/Terminate (handler exists, API endpoint unclear) |
| **BROKEN (toast stub)** | 14 | Button shows toast only, no API call |

### Broken Buttons (14 total — all toast stubs)

| Module | Buttons |
|--------|---------|
| Readings | View, Edit |
| Invoices | +Generate, Edit (×2), Record Payment (×2), Cancel (×2) |
| Payments | View, Edit, Delete |
| Tariffs | Save Tiers |
| Workplace | Create Task |

### Critical Gaps

1. **Invoice lifecycle** has 5 broken buttons — create, edit, record payment, cancel all show toast stubs. Only Issue and Download work.
2. **Payment lifecycle** has 3 broken buttons — view, edit, delete are all toast stubs. Create is the only real action.
3. **Readings** has view/edit as toast stubs — no way to inspect or modify a reading record from the UI.
4. **Tier saving** in Tariff Studio is a fake toast — tiers are not actually persisted.
5. **Meter Replace/Terminate** APIs are called but endpoint existence in backend is unverified.
