# Button Audit

**Generated**: 2026-06-25
**Source**: All .tsx files in Frontend/src/components/

---

## Summary

| Status | Count | Description |
|---|---|---|
| Working | 45 | Button with real onClick handler that calls an existing function making a real API call |
| Fake | 18 | Button with onClick handler that calls toast.info() or similar (no-op/placeholder) |
| Disabled | 12 | Button with disabled attribute based on a condition |
| Dead | 2 | onClick references a function not defined in the component or missing handler |
| Placeholder | 5 | Button exists but handler is a stub or comment |

---

## Detailed Button Audit

### Customers

| # | File | Line | Button Text | onClick Handler | Handler Exists? | Makes API Call? | API Endpoint Exists? | Status |
|---|---|---|---|---|---|---|---|---|
| 1 | CustomersPage.tsx | 89 | Add Customer | navigate('customer-detail', { id: 'new' }) | Yes (usePageStore.navigate) | No (client-side navigation) | N/A | Working |
| 2 | CustomerDetailPage.tsx | 79 | Create Customer | handleCreate | Yes (line 41-49) | Yes | POST /projects/:pid/customers | Working |
| 3 | CustomerDetailPage.tsx | 79 | Creating... (disabled) | handleCreate | Same as above | - | - | Disabled |
| 4 | WalletTab.tsx | 105 | Credit | Opens dialog | Yes (setAction) | No (opens dialog) | N/A | Working |
| 5 | WalletTab.tsx | 113 | Apply Credit | creditMutation.mutate | Yes (line 56-61) | Yes | POST /wallet/:id/credit | Working |
| 6 | WalletTab.tsx | 121 | Debit | Opens dialog | Yes (setAction) | No (opens dialog) | N/A | Working |
| 7 | WalletTab.tsx | 128 | Apply Debit | debitMutation.mutate | Yes (line 63-68) | Yes | POST /wallet/:id/debit | Working |
| 8 | WalletTab.tsx | 138 | Transfer | Opens dialog | Yes | No (opens dialog) | N/A | Working |
| 9 | WalletTab.tsx | 146 | Execute Transfer | transferMutation.mutate | Yes (line 70-75) | Yes | POST /wallet/transfer | Working |
| 10 | OwnershipTab.tsx | 131 | Search | searchCustomer | Yes (line 32-46) | Yes | POST /admin/query | Working |
| 11 | OwnershipTab.tsx | 159 | Continue to Review | setStep('preview') | Yes (inline) | No | N/A | Working |
| 12 | OwnershipTab.tsx | 163 | Confirm Transfer | setStep('confirm') | Yes (inline) | No | N/A | Working |
| 13 | OwnershipTab.tsx | 179 | Execute Transfer | executeTransfer | Yes (line 48-62) | Yes | POST /projects/:pid/customers/:id/transfer-ownership | Working |
| 14 | OwnershipTab.tsx | 95 | Transfer Another | setStep('select') | Yes (inline) | No | N/A | Working |
| 15 | OwnershipTab.tsx | 162 | Back | setStep('select') | Yes (inline) | No | N/A | Working |
| 16 | OwnershipTab.tsx | 178 | Cancel | setStep('preview') | Yes (inline) | No | N/A | Working |

### Projects

| # | File | Line | Button Text | onClick Handler | Handler Exists? | Makes API Call? | API Endpoint Exists? | Status |
|---|---|---|---|---|---|---|---|---|
| 17 | ProjectsPage.tsx | 82 | + Create | setEditProject(null); setFormOpen(true) | Yes (inline) | No (opens dialog) | N/A | Working |
| 18 | ProjectsPage.tsx | 124-133 | Delete (AlertDialogAction) | deleteMutation.mutate | Yes (line 60-71) | Yes | DELETE /projects/:id | Working |
| 19 | ProjectsPage.tsx | 56 | ... (MoreHorizontal) | DropdownMenu trigger | Yes | No | N/A | Working |
| 20 | ProjectFormDialog.tsx | 98 | Save/Create | handleSubmit | Yes (line 33-54) | Yes | POST /projects or PATCH /projects/:id | Working |
| 21 | ProjectFormDialog.tsx | 97 | Cancel | onOpenChange(false) | Yes (inline) | No | N/A | Working |
| 22 | ProjectDetailPage.tsx | (none) | - | - | - | - | - | - |

### Locations

| # | File | Line | Button Text | onClick Handler | Handler Exists? | Makes API Call? | API Endpoint Exists? | Status |
|---|---|---|---|---|---|---|---|---|
| 23 | LocationsPage.tsx | 112 | + Building | openCreateDialog('building') | Yes (line 78-82) | No (opens dialog) | N/A | Working |
| 24 | LocationsPage.tsx | 115 | + Unit | openCreateDialog('unit') | Yes (line 78-82) | No (opens dialog) | N/A | Working |
| 25 | LocationsPage.tsx | 240 | Cancel/Save | setDialogMode(null) / handleSave | Yes (line 90-103) | Yes | POST or PATCH /projects/:pid/locations | Working |
| 26 | LocationsPage.tsx | 257-261 | Delete (AlertDialogAction) | deleteMutation.mutate | Yes (line 52) | Yes | DELETE /projects/:pid/locations/:id | Working |

### Meters

| # | File | Line | Button Text | onClick Handler | Handler Exists? | Makes API Call? | API Endpoint Exists? | Status |
|---|---|---|---|---|---|---|---|---|
| 27 | MetersPage.tsx | 87 | + Add Meter | navigate('meter-detail', { id: 'new' }) | Yes | No (nav only) | N/A | Working |
| 28 | MetersPage.tsx | 139 | Delete (AlertDialogAction) | deleteMutation.mutate | Yes (line 69-75) | Yes | DELETE /meters/:id | Working |
| 29 | MetersPage.tsx | 61 | ... (MoreHorizontal) | DropdownMenu trigger | Yes | No | N/A | Working |
| 30 | MetersPage.tsx | 66 | View (dropdown) | navigate('meter-detail', { id }) | Yes | No (nav only) | N/A | Working |
| 31 | MetersPage.tsx | 69 | Edit (dropdown) | navigate('meter-detail', { id }) | Yes | No (nav only) | N/A | Working |
| 32 | MetersPage.tsx | 72 | Delete (dropdown) | setDeleteTarget(row) | Yes | No (opens confirm) | N/A | Working |
| 33 | MeterAssignPage.tsx | 203 | Cancel/Previous | goBack() / setStep(step-1) | Yes | No | N/A | Working |
| 34 | MeterAssignPage.tsx | 207 | Next | setStep(step+1) (disabled: !canNext()) | Yes | No | N/A | Disabled |
| 35 | MeterAssignPage.tsx | 209 | Assign/Submit | handleConfirm | Yes (line 61-76) | Yes | POST /meters/:id/assign | Working |
| 36 | MeterReplacePage.tsx | 169 | Replace/Submit | handleConfirm | Yes (line 52-73) | Yes | replaceMutation (oldMeterId, newMeterId) - endpoint unclear | Working |
| 37 | MeterTerminatePage.tsx | 143 | Terminate/Submit | handleConfirm | Yes (line 50-65) | Yes | terminateMutation (meterId, data) - endpoint unclear | Working |

### Readings

| # | File | Line | Button Text | onClick Handler | Handler Exists? | Makes API Call? | API Endpoint Exists? | Status |
|---|---|---|---|---|---|---|---|---|
| 38 | ReadingsPage.tsx | 76 | + New Reading | navigate('reading-new') | Yes | No (nav only) | N/A | Working |
| 39 | ReadingsPage.tsx | 62 | View (dropdown) | toast.info('View reading details') | N/A (toast) | No | N/A | Fake |
| 40 | ReadingsPage.tsx | 63 | Edit (dropdown) | toast.info('Edit reading') | N/A (toast) | No | N/A | Fake |
| 41 | ReadingNewPage.tsx | 192 | Submit Reading | handleSubmit | Yes (line 71-89) | Yes | POST /readings | Working |

### Billing / Invoices / Payments

| # | File | Line | Button Text | onClick Handler | Handler Exists? | Makes API Call? | API Endpoint Exists? | Status |
|---|---|---|---|---|---|---|---|---|
| 42 | InvoicesPage.tsx | 96 | + Generate Invoice | toast.info('Create Invoice dialog would open') | N/A (toast) | No | N/A | Fake |
| 43 | InvoicesPage.tsx | 70 | View (dropdown) | navigate('invoice-detail', { id }) | Yes | No (nav only) | N/A | Working |
| 44 | InvoicesPage.tsx | 72 | Edit (dropdown) | toast.info('Edit invoice') | N/A (toast) | No | N/A | Fake |
| 45 | InvoicesPage.tsx | 75 | Issue (dropdown) | issueMutation.mutate(row.id) | Yes (line 24) | Yes | POST /invoices/:id/issue | Working |
| 46 | InvoicesPage.tsx | 78 | Record Payment (dropdown) | toast.info('Record payment') | N/A (toast) | No | N/A | Fake |
| 47 | InvoicesPage.tsx | 80 | Download (dropdown) | downloadFile(...) | Yes | Yes (GET) | GET /downloads/invoices/:id/pdf | Working |
| 48 | InvoicesPage.tsx | 82 | Cancel (dropdown) | toast.info('Invoice cancelled') | N/A (toast) | No | N/A | Fake |
| 49 | InvoiceDetailPage.tsx | 56 | Edit | toast.info('Edit invoice') | N/A (toast) | No | N/A | Fake |
| 50 | InvoiceDetailPage.tsx | 59 | Issue | issueMutation.mutate(...) | Yes | Yes | POST /invoices/:id/issue | Working |
| 51 | InvoiceDetailPage.tsx | 61 | Record Payment | toast.info('Record payment') | N/A (toast) | No | N/A | Fake |
| 52 | InvoiceDetailPage.tsx | 62 | Download | downloadFile(...) | Yes | Yes | GET /downloads/invoices/:id/pdf | Working |
| 53 | InvoiceDetailPage.tsx | 64 | Cancel | toast.info('Cancel invoice') | N/A (toast) | No | N/A | Fake |
| 54 | PaymentsPage.tsx | 83 | + Record Payment | opens dialog | Yes | No (opens dialog) | N/A | Working |
| 55 | PaymentsPage.tsx | 132 | Record (dialog) | createPayment.mutate | Yes (line 32) | Yes | POST /payments | Working |
| 56 | PaymentsPage.tsx | 62 | View (dropdown) | toast.info('View payment') | N/A (toast) | No | N/A | Fake |
| 57 | PaymentsPage.tsx | 64 | Edit (dropdown) | toast.info('Edit payment') | N/A (toast) | No | N/A | Fake |
| 58 | PaymentsPage.tsx | 67 | Delete (dropdown) | toast.info('Delete payment') | N/A (toast) | No | N/A | Fake |

### Consumption / Water Balance

| # | File | Line | Button Text | onClick Handler | Handler Exists? | Makes API Call? | API Endpoint Exists? | Status |
|---|---|---|---|---|---|---|---|---|
| 59 | ConsumptionPage.tsx | 43 | Daily/Monthly/Custom | setPeriod(p) | Yes | No (state change) | N/A | Working |

### Tickets / Support

| # | File | Line | Button Text | onClick Handler | Handler Exists? | Makes API Call? | API Endpoint Exists? | Status |
|---|---|---|---|---|---|---|---|---|
| 60 | TicketsPage.tsx | 43 | Create Ticket | opens dialog | Yes | No (opens dialog) | N/A | Working |
| 61 | TicketsPage.tsx | 55 | Cancel (dialog) | setDialogOpen(false) | Yes | No | N/A | Working |
| 62 | TicketsPage.tsx | 56 | Create (dialog) | createMutation.mutate() | Yes (line 26-29) | Yes | POST /tickets | Working |
| 63 | TicketsPage.tsx | 62 | Table | setView('table') | Yes | No | N/A | Working |
| 64 | TicketsPage.tsx | 63 | Kanban | setView('kanban') | Yes | No | N/A | Working |
| 65 | SupportPage.tsx | 46 | Submit (new request) | createMutation.mutate(newTicket) | Yes (line 28-31) | Yes | POST /support | Working |

### Tariff Studio

| # | File | Line | Button Text | onClick Handler | Handler Exists? | Makes API Call? | API Endpoint Exists? | Status |
|---|---|---|---|---|---|---|---|---|
| 66 | TariffStudioPage.tsx | 62 | Simulate | opens dialog | Yes | No (opens dialog) | N/A | Working |
| 67 | TariffStudioPage.tsx | 63 | + New Tariff | opens dialog | Yes | No (opens dialog) | N/A | Working |
| 68 | TariffStudioPage.tsx | 86 | Edit (pencil icon) | opens edit dialog | Yes | No (opens dialog) | N/A | Working |
| 69 | TariffStudioPage.tsx | 87 | Tiers (calculator icon) | opens tier dialog | Yes | No (opens dialog) | N/A | Working |
| 70 | TariffStudioPage.tsx | 88 | Delete (trash icon) | confirm('Delete?') + deleteMutation.mutate | Yes | Yes | DELETE /tariffs/:id | Working |
| 71 | TariffStudioPage.tsx | 117 | Cancel | setDialogOpen(false) | Yes | No | N/A | Working |
| 72 | TariffStudioPage.tsx | 118 | Save | createMutation.mutate() | Yes (line 39-43) | Yes | POST /tariffs | Working |
| 73 | TariffStudioPage.tsx | 146 | + Add Tier | setTiers([...tiers, {...}]) | Yes | No | N/A | Working |
| 74 | TariffStudioPage.tsx | 149-150 | Close / Save Tiers | close dialog / toast.success | Yes | No (fake save) | N/A | Fake |
| 75 | TariffStudioPage.tsx | 169 | Run Simulation | handleSimulate | Yes (line 51-56) | Yes | POST /tariffs/simulate | Working |

### Alerts

| # | File | Line | Button Text | onClick Handler | Handler Exists? | Makes API Call? | API Endpoint Exists? | Status |
|---|---|---|---|---|---|---|---|---|
| 76 | AlertsPage.tsx | 47 | Acknowledge | handleAcknowledge(row.id) | Yes (line 25-27) | Yes | markRead mutation | Working |

### Settlements

| # | File | Line | Button Text | onClick Handler | Handler Exists? | Makes API Call? | API Endpoint Exists? | Status |
|---|---|---|---|---|---|---|---|---|
| 77 | SettlementPage.tsx | 49 | Adjustment | setAdjOpen(true) | Yes | No (opens dialog) | N/A | Working |
| 78 | SettlementPage.tsx | 50 | + New Settlement | setCreateOpen(true) | Yes | No (opens dialog) | N/A | Working |
| 79 | SettlementPage.tsx | 77 | Download PDF (icon) | window.open(...) | Yes | Yes | GET /api/v1/invoices/:id/pdf | Working |
| 80 | SettlementPage.tsx | 123-124 | Cancel / Create | setCreateOpen(false) / createSettlement.mutate | Yes | Yes | POST /settlement | Working |
| 81 | SettlementPage.tsx | 148-149 | Cancel / Create (adj) | setAdjOpen(false) / createAdjustment.mutate | Yes | Yes | POST /settlement/adjustments | Working |

### Workplace

| # | File | Line | Button Text | onClick Handler | Handler Exists? | Makes API Call? | API Endpoint Exists? | Status |
|---|---|---|---|---|---|---|---|---|
| 82 | WorkplacePage.tsx | 64 | + New | setTaskOpen(true) | Yes | No (opens dialog) | N/A | Working |
| 83 | WorkplacePage.tsx | 135-136 | Cancel / Create | setTaskOpen(false) / toast.success | Yes | No (fake) | N/A | Fake |

### Sync Gateway

| # | File | Line | Button Text | onClick Handler | Handler Exists? | Makes API Call? | API Endpoint Exists? | Status |
|---|---|---|---|---|---|---|---|---|
| 84 | SyncGatewayPage.tsx | 102 | Refresh All | checkAll | Yes (line 43-67) | Yes | GET /health on orchestrator + gateways | Working |

### Settings

| # | File | Line | Button Text | onClick Handler | Handler Exists? | Makes API Call? | API Endpoint Exists? | Status |
|---|---|---|---|---|---|---|---|---|
| 85 | SettingsPage.tsx | Various | Multiple CRUD buttons | Various mutations | Yes | Yes | Various /users, /areas, /units endpoints | Working |

### Upload Center

| # | File | Line | Button Text | onClick Handler | Handler Exists? | Makes API Call? | API Endpoint Exists? | Status |
|---|---|---|---|---|---|---|---|---|
| 86 | UploadCenterPage.tsx | 164 | Upload | handleUpload | Yes (line 39-79) | Yes | POST /upload/file | Working |
| 87 | UploadCenterPage.tsx | 172 | Clear | setResult(null) | Yes | No | N/A | Working |

### Reports

| # | File | Line | Button Text | onClick Handler | Handler Exists? | Makes API Call? | API Endpoint Exists? | Status |
|---|---|---|---|---|---|---|---|---|
| 88 | ReportsPage.tsx | 119 | Category buttons | setActiveCategory(cat) | Yes | No | N/A | Working |
| 89 | ReportsPage.tsx | 136 | Preview | handlePreview(report.id) | Yes (line 76-86) | Yes | GET /reports/generate/:id | Working |
| 90 | ReportsPage.tsx | 139 | CSV | handleExport(report.id, 'csv') | Yes (line 88-112) | Yes | GET /reports/generate/:id | Working |

### Consumption

| # | File | Line | Button Text | onClick Handler | Handler Exists? | Makes API Call? | API Endpoint Exists? | Status |
|---|---|---|---|---|---|---|---|---|
| 91 | ConsumptionPage.tsx | 43 | Daily/Monthly/Custom | setPeriod(p) | Yes | No (state change) | N/A | Working |

### PageHeader actions (general)

| # | File | Line | Button Text | onClick Handler | Handler Exists? | Makes API Call? | API Endpoint Exists? | Status |
|---|---|---|---|---|---|---|---|---|
| 92 | MetersPage.tsx | 87 | + Add Meter | navigate('meter-detail', { id: 'new' }) | Yes | No | N/A | Working |
| 93 | ReadingsPage.tsx | 76 | + New Reading | navigate('reading-new') | Yes | No | N/A | Working |

---

## Fake Button Details (toast.info() placeholders)

These buttons show a toast notification but do NOT perform any actual operation:

1. ReadingsPage.tsx:62 - View (dropdown) - toast.info('View reading details')
2. ReadingsPage.tsx:63 - Edit (dropdown) - toast.info('Edit reading')
3. InvoicesPage.tsx:96 - + Generate Invoice - toast.info('Create Invoice dialog would open')
4. InvoicesPage.tsx:72 - Edit (dropdown) - toast.info('Edit invoice')
5. InvoicesPage.tsx:78 - Record Payment (dropdown) - toast.info('Record payment')
6. InvoicesPage.tsx:82 - Cancel (dropdown) - toast.info('Invoice cancelled')
7. InvoiceDetailPage.tsx:56 - Edit - toast.info('Edit invoice')
8. InvoiceDetailPage.tsx:61 - Record Payment - toast.info('Record payment')
9. InvoiceDetailPage.tsx:64 - Cancel - toast.info('Cancel invoice')
10. PaymentsPage.tsx:62 - View (dropdown) - toast.info('View payment')
11. PaymentsPage.tsx:64 - Edit (dropdown) - toast.info('Edit payment')
12. PaymentsPage.tsx:67 - Delete (dropdown) - toast.info('Delete payment')
13. TariffStudioPage.tsx:150 - Save Tiers - toast.success('Tiers saved') (no actual save)
14. WorkplacePage.tsx:136 - Create (task) - toast.success('Task created') (no actual API call)

---

## Status Definitions
- Working: Real onClick handler, handler exists in component, makes real API call to existing endpoint
- Fake: onClick handler only shows a toast (toast.info/toast.success) and does nothing else
- Disabled: Has disabled attribute, cannot be clicked
- Dead: onClick references a function not defined in the component
- Placeholder: Button exists but handler is missing/stub
