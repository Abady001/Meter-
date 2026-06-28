# Button Remediation Report — v2

**Generated:** 2026-06-25
**Source:** audit/button-audit.md (detailed button audit, 93 entries)

---

## 1. EXECUTIVE SUMMARY

| Status | Count | % of Total | Action Required |
|---|---|---|---|
| **Working** | 45* | 55% | None — buttons perform real actions |
| **Fake** | 18* | 22% | Replace toast.info() with real handler + API call |
| **Disabled** | 12* | 15% | Verify disabled logic is intentional |
| **Dead** | 2* | 2% | Fix missing function references |
| **Placeholder** | 5* | 6% | Implement stub/missing handlers |
| **Total** | **82** | **100%** | |

*\*Source: Summary table from audit/button-audit.md. Detailed audit table lists ~90 entries — summary numbers used for consistency.*

### Priority Remediation Target: **18 Fake Buttons + 2 Dead Buttons + 5 Placeholders = 25 Buttons Requiring Action**

---

## 2. BUTTON CLASSIFICATION BY MODULE

### 2.1 Customers — 16 buttons

| # | File | Line | Text | Actual Handler | Classification | Remediation |
|---|---|---|---|---|---|---|
| 1 | CustomersPage.tsx | 89 | Add Customer | navigate('customer-detail', { id: 'new' }) | **Working** | — |
| 2 | CustomerDetailPage.tsx | 79 | Create Customer | handleCreate (calls POST /customers) | **Working** | — |
| 3 | CustomerDetailPage.tsx | 79 | Creating... (disabled) | disabled while loading | **Disabled** | Verify |
| 4 | WalletTab.tsx | 105 | Credit | Opens dialog (setAction) | **Working** | — |
| 5 | WalletTab.tsx | 113 | Apply Credit | creditMutation.mutate (POST /wallet/:id/credit) | **Working** | — |
| 6 | WalletTab.tsx | 121 | Debit | Opens dialog (setAction) | **Working** | — |
| 7 | WalletTab.tsx | 128 | Apply Debit | debitMutation.mutate (POST /wallet/:id/debit) | **Working** | — |
| 8 | WalletTab.tsx | 138 | Transfer | Opens dialog | **Working** | — |
| 9 | WalletTab.tsx | 146 | Execute Transfer | transferMutation.mutate (POST /wallet/transfer) | **Working** | — |
| 10 | OwnershipTab.tsx | 131 | Search | searchCustomer (POST /admin/query) | **Working** | — |
| 11 | OwnershipTab.tsx | 159 | Continue to Review | setStep('preview') | **Working** | — |
| 12 | OwnershipTab.tsx | 163 | Confirm Transfer | setStep('confirm') | **Working** | — |
| 13 | OwnershipTab.tsx | 179 | Execute Transfer | executeTransfer (POST transfer-ownership) | **Working** | — |
| 14 | OwnershipTab.tsx | 95 | Transfer Another | setStep('select') | **Working** | — |
| 15 | OwnershipTab.tsx | 162 | Back | setStep('select') | **Working** | — |
| 16 | OwnershipTab.tsx | 178 | Cancel | setStep('preview') | **Working** | — |

**Customer buttons: 15 Working, 1 Disabled**

---

### 2.2 Projects — 6 buttons

| # | File | Line | Text | Actual Handler | Classification | Remediation |
|---|---|---|---|---|---|---|
| 17 | ProjectsPage.tsx | 82 | + Create | setEditProject(null); setFormOpen(true) | **Working** | — |
| 18 | ProjectsPage.tsx | 124-133 | Delete (AlertDialog) | deleteMutation.mutate (DELETE /projects/:id) | **Working** | — |
| 19 | ProjectsPage.tsx | 56 | ... (MoreHorizontal) | DropdownMenu trigger | **Working** | — |
| 20 | ProjectFormDialog.tsx | 98 | Save/Create | handleSubmit (POST/PATCH /projects) | **Working** | — |
| 21 | ProjectFormDialog.tsx | 97 | Cancel | onOpenChange(false) | **Working** | — |
| 22 | ProjectDetailPage.tsx | — | (no buttons) | — | — | — |

**Project buttons: 5 Working**

---

### 2.3 Locations — 4 buttons

| # | File | Line | Text | Actual Handler | Classification | Remediation |
|---|---|---|---|---|---|---|
| 23 | LocationsPage.tsx | 112 | + Building | openCreateDialog('building') | **Working** | — |
| 24 | LocationsPage.tsx | 115 | + Unit | openCreateDialog('unit') | **Working** | — |
| 25 | LocationsPage.tsx | 240 | Cancel/Save | setDialogMode(null)/handleSave | **Working** | — |
| 26 | LocationsPage.tsx | 257-261 | Delete (AlertDialog) | deleteMutation.mutate (DELETE /locations/:id) | **Working** | — |

**Location buttons: 4 Working**

---

### 2.4 Meters — 11 buttons

| # | File | Line | Text | Actual Handler | Classification | Remediation |
|---|---|---|---|---|---|---|
| 27 | MetersPage.tsx | 87 | + Add Meter | navigate('meter-detail', { id: 'new' }) | **Working** | — |
| 28 | MetersPage.tsx | 139 | Delete (AlertDialog) | deleteMutation.mutate (DELETE /meters/:id) | **Working** | — |
| 29 | MetersPage.tsx | 61 | ... (MoreHorizontal) | DropdownMenu trigger | **Working** | — |
| 30 | MetersPage.tsx | 66 | View (dropdown) | navigate('meter-detail', { id }) | **Working** | — |
| 31 | MetersPage.tsx | 69 | Edit (dropdown) | navigate('meter-detail', { id }) | **Working** | — |
| 32 | MetersPage.tsx | 72 | Delete (dropdown) | setDeleteTarget(row) | **Working** | — |
| 33 | MeterAssignPage.tsx | 203 | Cancel/Previous | goBack()/setStep(step-1) | **Working** | — |
| 34 | MeterAssignPage.tsx | 207 | Next | setStep(step+1) (disabled: !canNext()) | **Disabled** | Verify logic |
| 35 | MeterAssignPage.tsx | 209 | Assign/Submit | handleConfirm (POST /meters/:id/assign) | **Working** | — |
| 36 | MeterReplacePage.tsx | 169 | Replace/Submit | handleConfirm (replaceMutation) | **Working** | Endpoint unclear |
| 37 | MeterTerminatePage.tsx | 143 | Terminate/Submit | handleConfirm (terminateMutation) | **Working** | Endpoint unclear |

**Meter buttons: 10 Working, 1 Disabled**

---

### 2.5 Readings — 4 buttons

| # | File | Line | Text | Actual Handler | Classification | Remediation |
|---|---|---|---|---|---|---|
| 38 | ReadingsPage.tsx | 76 | + New Reading | navigate('reading-new') | **Working** | — |
| 39 | ReadingsPage.tsx | 62 | View (dropdown) | toast.info('View reading details') | **FAKE** | Replace with real navigation |
| 40 | ReadingsPage.tsx | 63 | Edit (dropdown) | toast.info('Edit reading') | **FAKE** | Replace with real navigation |
| 41 | ReadingNewPage.tsx | 192 | Submit Reading | handleSubmit (POST /readings) | **Working** | — |

**Reading buttons: 2 Working, 2 Fake**

---

### 2.6 Invoices & Billing — 13 buttons

| # | File | Line | Text | Actual Handler | Classification | Remediation |
|---|---|---|---|---|---|---|
| 42 | InvoicesPage.tsx | 96 | + Generate Invoice | toast.info('Create Invoice dialog would open') | **FAKE** | Implement generate dialog |
| 43 | InvoicesPage.tsx | 70 | View (dropdown) | navigate('invoice-detail', { id }) | **Working** | — |
| 44 | InvoicesPage.tsx | 72 | Edit (dropdown) | toast.info('Edit invoice') | **FAKE** | Implement edit dialog |
| 45 | InvoicesPage.tsx | 75 | Issue (dropdown) | issueMutation.mutate (POST /invoices/:id/issue) | **Working** | — |
| 46 | InvoicesPage.tsx | 78 | Record Payment (dropdown) | toast.info('Record payment') | **FAKE** | Implement payment dialog |
| 47 | InvoicesPage.tsx | 80 | Download (dropdown) | downloadFile() (GET /downloads/invoices/:id/pdf) | **Working** | — |
| 48 | InvoicesPage.tsx | 82 | Cancel (dropdown) | toast.info('Invoice cancelled') | **FAKE** | Implement cancel API call |
| 49 | InvoiceDetailPage.tsx | 56 | Edit | toast.info('Edit invoice') | **FAKE** | Implement edit |
| 50 | InvoiceDetailPage.tsx | 59 | Issue | issueMutation.mutate (POST /invoices/:id/issue) | **Working** | — |
| 51 | InvoiceDetailPage.tsx | 61 | Record Payment | toast.info('Record payment') | **FAKE** | Implement payment dialog |
| 52 | InvoiceDetailPage.tsx | 62 | Download | downloadFile() (GET /downloads/invoices/:id/pdf) | **Working** | — |
| 53 | InvoiceDetailPage.tsx | 64 | Cancel | toast.info('Cancel invoice') | **FAKE** | Implement cancel API call |
| 54 | PaymentsPage.tsx | 83 | + Record Payment | opens dialog | **Working** | — |
| 55 | PaymentsPage.tsx | 132 | Record (dialog) | createPayment.mutate (POST /payments) | **Working** | — |

**Invoice buttons: 5 Working, 7 Fake**

---

### 2.7 Payments — 4 buttons

| # | File | Line | Text | Actual Handler | Classification | Remediation |
|---|---|---|---|---|---|---|
| 56 | PaymentsPage.tsx | 62 | View (dropdown) | toast.info('View payment') | **FAKE** | Navigate to payment detail |
| 57 | PaymentsPage.tsx | 64 | Edit (dropdown) | toast.info('Edit payment') | **FAKE** | Implement edit |
| 58 | PaymentsPage.tsx | 67 | Delete (dropdown) | toast.info('Delete payment') | **FAKE** | Implement delete API call |

**Payment buttons: 0 Working, 3 Fake**

---

### 2.8 Consumption — 1 button

| # | File | Line | Text | Actual Handler | Classification | Remediation |
|---|---|---|---|---|---|---|
| 59 | ConsumptionPage.tsx | 43 | Daily/Monthly/Custom | setPeriod(p) | **Working** | State-only |

**Consumption buttons: 1 Working**

---

### 2.9 Tickets & Support — 6 buttons

| # | File | Line | Text | Actual Handler | Classification | Remediation |
|---|---|---|---|---|---|---|
| 60 | TicketsPage.tsx | 43 | Create Ticket | opens dialog | **Working** | — |
| 61 | TicketsPage.tsx | 55 | Cancel (dialog) | setDialogOpen(false) | **Working** | — |
| 62 | TicketsPage.tsx | 56 | Create (dialog) | createMutation.mutate (POST /tickets) | **Working** | — |
| 63 | TicketsPage.tsx | 62 | Table | setView('table') | **Working** | — |
| 64 | TicketsPage.tsx | 63 | Kanban | setView('kanban') | **Working** | — |
| 65 | SupportPage.tsx | 46 | Submit (new request) | createMutation.mutate (POST /support) | **Working** | — |

**Tickets/Support buttons: 6 Working**

---

### 2.10 Tariff Studio — 10 buttons

| # | File | Line | Text | Actual Handler | Classification | Remediation |
|---|---|---|---|---|---|---|
| 66 | TariffStudioPage.tsx | 62 | Simulate | opens dialog | **Working** | — |
| 67 | TariffStudioPage.tsx | 63 | + New Tariff | opens dialog | **Working** | — |
| 68 | TariffStudioPage.tsx | 86 | Edit (pencil icon) | opens edit dialog | **Working** | — |
| 69 | TariffStudioPage.tsx | 87 | Tiers (calculator icon) | opens tier dialog | **Working** | — |
| 70 | TariffStudioPage.tsx | 88 | Delete (trash icon) | confirm + deleteMutation.mutate | **Working** | — |
| 71 | TariffStudioPage.tsx | 117 | Cancel | setDialogOpen(false) | **Working** | — |
| 72 | TariffStudioPage.tsx | 118 | Save | createMutation.mutate (POST /tariffs) | **Working** | — |
| 73 | TariffStudioPage.tsx | 146 | + Add Tier | setTiers([...tiers, {...}]) | **Working** | — |
| 74 | TariffStudioPage.tsx | 149-150 | Close / Save Tiers | toast.success('Tiers saved') (no real save) | **FAKE** | Implement tier save API |
| 75 | TariffStudioPage.tsx | 169 | Run Simulation | handleSimulate (POST /tariffs/simulate) | **Working** | — |

**Tariff buttons: 9 Working, 1 Fake**

---

### 2.11 Alerts — 1 button

| # | File | Line | Text | Actual Handler | Classification | Remediation |
|---|---|---|---|---|---|---|
| 76 | AlertsPage.tsx | 47 | Acknowledge | handleAcknowledge (markRead mutation) | **Working** | — |

**Alert buttons: 1 Working**

---

### 2.12 Settlements — 5 buttons

| # | File | Line | Text | Actual Handler | Classification | Remediation |
|---|---|---|---|---|---|---|
| 77 | SettlementPage.tsx | 49 | Adjustment | setAdjOpen(true) | **Working** | — |
| 78 | SettlementPage.tsx | 50 | + New Settlement | setCreateOpen(true) | **Working** | — |
| 79 | SettlementPage.tsx | 77 | Download PDF (icon) | window.open(...) | **Working** | — |
| 80 | SettlementPage.tsx | 123-124 | Cancel / Create | setCreateOpen(false)/createSettlement.mutate | **Working** | — |
| 81 | SettlementPage.tsx | 148-149 | Cancel / Create (adj) | setAdjOpen(false)/createAdjustment.mutate | **Working** | — |

**Settlement buttons: 5 Working**

---

### 2.13 Workplace — 2 buttons

| # | File | Line | Text | Actual Handler | Classification | Remediation |
|---|---|---|---|---|---|---|
| 82 | WorkplacePage.tsx | 64 | + New | setTaskOpen(true) | **Working** | — |
| 83 | WorkplacePage.tsx | 135-136 | Cancel / Create | setTaskOpen(false)/toast.success('Task created') | **FAKE** | Implement task creation API |

**Workplace buttons: 1 Working, 1 Fake**

---

### 2.14 Sync Gateway — 1 button

| # | File | Line | Text | Actual Handler | Classification | Remediation |
|---|---|---|---|---|---|---|
| 84 | SyncGatewayPage.tsx | 102 | Refresh All | checkAll (GET /health on orchestrator + gateways) | **Working** | — |

**Sync Gateway buttons: 1 Working**

---

### 2.15 Settings — 1 button (multiple actions)

| # | File | Line | Text | Actual Handler | Classification | Remediation |
|---|---|---|---|---|---|---|
| 85 | SettingsPage.tsx | Various | Multiple CRUD | Various mutations (PATCH /settings, /users, /areas, /units) | **Working** | — |

**Settings buttons: 1 Working (multiple sub-buttons)**

---

### 2.16 Upload Center — 2 buttons

| # | File | Line | Text | Actual Handler | Classification | Remediation |
|---|---|---|---|---|---|---|
| 86 | UploadCenterPage.tsx | 164 | Upload | handleUpload (POST /upload/file) | **Working** | — |
| 87 | UploadCenterPage.tsx | 172 | Clear | setResult(null) | **Working** | — |

**Upload Center buttons: 2 Working**

---

### 2.17 Reports — 3 buttons

| # | File | Line | Text | Actual Handler | Classification | Remediation |
|---|---|---|---|---|---|---|
| 88 | ReportsPage.tsx | 119 | Category buttons | setActiveCategory(cat) | **Working** | — |
| 89 | ReportsPage.tsx | 136 | Preview | handlePreview (GET /reports/generate/:id) | **Working** | — |
| 90 | ReportsPage.tsx | 139 | CSV | handleExport (GET /reports/generate/:id) | **Working** | — |

**Report buttons: 3 Working**

---

## 3. FAKE BUTTONS — DETAILED REMEDIATION PLAN

These 14 fake buttons show a toast but perform no real action. Remediation priority: **HIGH**.

| # | Location | Button | Current | Fix |
|---|---|---|---|---|
| 39 | ReadingsPage.tsx:62 | View (dropdown) | toast.info('View reading details') | Navigate to reading detail page |
| 40 | ReadingsPage.tsx:63 | Edit (dropdown) | toast.info('Edit reading') | Open edit dialog + PATCH /readings/:id |
| 42 | InvoicesPage.tsx:96 | + Generate Invoice | toast.info('Create Invoice dialog would open') | Open generate dialog → POST /billing/invoices/generate |
| 44 | InvoicesPage.tsx:72 | Edit (dropdown) | toast.info('Edit invoice') | Open edit dialog → PATCH /billing/invoices/:id |
| 46 | InvoicesPage.tsx:78 | Record Payment | toast.info('Record payment') | Open payment dialog → POST /payments |
| 48 | InvoicesPage.tsx:82 | Cancel (dropdown) | toast.info('Invoice cancelled') | Confirm → POST /billing/invoices/:id/cancel |
| 49 | InvoiceDetailPage.tsx:56 | Edit | toast.info('Edit invoice') | Open edit → PATCH /billing/invoices/:id |
| 51 | InvoiceDetailPage.tsx:61 | Record Payment | toast.info('Record payment') | Open payment dialog → POST /payments |
| 53 | InvoiceDetailPage.tsx:64 | Cancel | toast.info('Cancel invoice') | Confirm → POST /billing/invoices/:id/cancel |
| 56 | PaymentsPage.tsx:62 | View (dropdown) | toast.info('View payment') | Navigate to payment detail |
| 57 | PaymentsPage.tsx:64 | Edit (dropdown) | toast.info('Edit payment') | Open edit dialog → PATCH /payments/:id |
| 58 | PaymentsPage.tsx:67 | Delete (dropdown) | toast.info('Delete payment') | Confirm → DELETE /payments/:id |
| 74 | TariffStudioPage.tsx:150 | Save Tiers | toast.success('Tiers saved') | Implement tier save → PATCH /tariffs/:id/tiers |
| 83 | WorkplacePage.tsx:136 | Create (task) | toast.success('Task created') | Implement task → POST /workplace/tasks |

---

## 4. BUTTONS WITH UNCLEAR ENDPOINTS

| # | Location | Button | Endpoint | Risk |
|---|---|---|---|---|
| 36 | MeterReplacePage.tsx | Replace/Submit | replaceMutation — endpoint unclear | **NEEDS VERIFICATION** |
| 37 | MeterTerminatePage.tsx | Terminate/Submit | terminateMutation — endpoint unclear | **NEEDS VERIFICATION** |

These make real API calls but the target endpoint is ambiguous from the audit data.

---

## 5. MODULE-LEVEL BUTTON HEALTH

| Module | Total | Working | Fake | Disabled | Health % |
|---|---|---|---|---|---|
| Customers | 16 | 15 | 0 | 1 | 94% |
| Projects | 5 | 5 | 0 | 0 | 100% |
| Locations | 4 | 4 | 0 | 0 | 100% |
| Meters | 11 | 10 | 0 | 1 | 91% |
| Readings | 4 | 2 | 2 | 0 | 50% |
| Invoices/Billing | 13 | 5 | 7 | 0 | 38% |
| Payments | 3 | 0 | 3 | 0 | 0% |
| Consumption | 1 | 1 | 0 | 0 | 100% |
| Tickets/Support | 6 | 6 | 0 | 0 | 100% |
| Tariff Studio | 10 | 9 | 1 | 0 | 90% |
| Alerts | 1 | 1 | 0 | 0 | 100% |
| Settlements | 5 | 5 | 0 | 0 | 100% |
| Workplace | 2 | 1 | 1 | 0 | 50% |
| Sync Gateway | 1 | 1 | 0 | 0 | 100% |
| Settings | 1 | 1 | 0 | 0 | 100% |
| Upload Center | 2 | 2 | 0 | 0 | 100% |
| Reports | 3 | 3 | 0 | 0 | 100% |
| **TOTAL** | **88** | **71** | **14** | **2** | **81%** |

*Note: Detailed audit lists 93 entries, but 5 are non-button rows (e.g., #22 ProjectDetailPage with no buttons, #91 duplicates #59, etc.). The effective count is ~88 actionable buttons.*

---

## 6. RECOMMENDED SPRINT BACKLOG

| Sprint | Buttons | Effort |
|---|---|---|
| **Sprint 1** | 7 Invoice fake buttons (#42, #44, #46, #48, #49, #51, #53) | 5d |
| **Sprint 1** | 2 Reading fake buttons (#39, #40) | 1d |
| **Sprint 2** | 3 Payment fake buttons (#56, #57, #58) | 2d |
| **Sprint 2** | 1 Tariff fake button (#74) | 1d |
| **Sprint 2** | 1 Workplace fake button (#83) | 1d |
| **Sprint 3** | 2 Meter ambiguous endpoints (#36, #37) | 1d |
| **Total** | **16 remediations** | **~11d** |
