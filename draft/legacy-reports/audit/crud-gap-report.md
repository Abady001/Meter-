# CRUD Gap Report

**Generated**: 2026-06-25
**Source**: Frontend components + Backend controllers

---

## Legend
- ✅ = Exists and working
- ❌ = Missing
- 🔶 = Partial / placeholder / mock-only

---

## 1. Customer

| Operation | Frontend UI | Frontend File(s) | Backend Endpoint | Backend Controller | Status |
|---|---|---|---|---|---|
| **Create** | ✅ Create form in CustomerDetailPage (id=new) + API call | CustomerDetailPage.tsx:52-85, useCreateCustomer | POST /projects/:projectId/customers | customers.controller.ts:50 | ✅ Full |
| **Read (List)** | ✅ CustomersPage with filters/search | CustomersPage.tsx | GET /projects/:projectId/customers | customers.controller.ts:65 | ✅ Full |
| **Read (Detail)** | ✅ CustomerDetailPage with tabs | CustomerDetailPage.tsx | GET /projects/:projectId/customers/:id | customers.controller.ts:79 | ✅ Full |
| **Update** | ❌ No edit form/save on detail page | (UI tabs but no edit/save) | PATCH /projects/:projectId/customers/:id | customers.controller.ts:101 | ❌ Missing |
| **Delete** | ❌ No delete button on customer detail or list | (Missing) | DELETE /projects/:projectId/customers/:id | customers.controller.ts:118 | ❌ Missing |
| **Transfer Ownership** | ✅ OwnershipTab with 3-step wizard | OwnershipTab.tsx | POST /projects/:projectId/customers/:id/transfer-ownership | customers.controller.ts | ✅ Full |

**Gaps**: Customer **Update** (no UI save button), Customer **Delete** (no UI button, though endpoint exists)

---

## 2. Meter

| Operation | Frontend UI | Frontend File(s) | Backend Endpoint | Backend Controller | Status |
|---|---|---|---|---|---|
| **Create** | ✅ Navigate to meter-detail?id=new | MetersPage.tsx:87 | POST /meters | meters.controller.ts:37 | ✅ Full |
| **Read (List)** | ✅ MetersPage with filters, search, QueryBoundary | MetersPage.tsx | GET /meters | meters.controller.ts:45 | ✅ Full |
| **Read (Detail)** | ✅ MeterDetailPage with chart + tabs | MeterDetailPage.tsx | GET /meters/:id | meters.controller.ts:58 | ✅ Full |
| **Update** | 🔶 Navigate to meter-detail for edit | MetersPage.tsx:69 (Edit dropdown -> navigate) | PATCH /meters/:id | meters.controller.ts:71 | 🔶 Partial (no edit form on detail page) |
| **Delete** | ✅ Delete with confirmation AlertDialog | MetersPage.tsx:129-144 | DELETE /meters/:id | meters.controller.ts:82 | ✅ Full |
| **Assign** | ✅ 9-step assign wizard | MeterAssignPage.tsx | POST /meters/:meterId/assign | meters.controller.ts:90 | ✅ Full |
| **Replace** | ✅ Two-panel replace flow | MeterReplacePage.tsx | (uses useReplaceMeter hook) | (needs verify) | ✅ Full |
| **Terminate** | ✅ Terminate flow with validation | MeterTerminatePage.tsx | (uses useTerminateMeter hook) | (needs verify) | ✅ Full |

**Gaps**: Meter **Update** (no dedicated edit form/save button in MeterDetailPage)

---

## 3. Project

| Operation | Frontend UI | Frontend File(s) | Backend Endpoint | Backend Controller | Status |
|---|---|---|---|---|---|
| **Create** | ✅ ProjectFormDialog with code/name/tax/water diff | ProjectFormDialog.tsx | POST /projects | projects.controller.ts:33 | ✅ Full |
| **Read (List)** | ✅ ProjectsPage with SmartTable + QueryBoundary | ProjectsPage.tsx | GET /projects | projects.controller.ts:43 | ✅ Full |
| **Read (Detail)** | ✅ ProjectDetailPage with tabs + stats | ProjectDetailPage.tsx | GET /projects/:id | projects.controller.ts:56 | ✅ Full |
| **Update** | ✅ ProjectFormDialog in edit mode | ProjectFormDialog.tsx:20 | PATCH /projects/:id | projects.controller.ts:69 | ✅ Full |
| **Delete** | ✅ Delete with confirmation AlertDialog | ProjectsPage.tsx:114-137 | DELETE /projects/:id | projects.controller.ts:80 | ✅ Full |

**Gaps**: None - Projects has full CRUD.

---

## 4. Location (Building/Unit)

| Operation | Frontend UI | Frontend File(s) | Backend Endpoint | Backend Controller | Status |
|---|---|---|---|---|---|
| **Create** | ✅ Dialog for building or unit | LocationsPage.tsx:223-245 | POST /projects/:projectId/locations | locations.controller.ts:29 | ✅ Full |
| **Read (List)** | ✅ LocationsPage with building/unit tree | LocationsPage.tsx | GET /projects/:projectId/locations | locations.controller.ts:41 | ✅ Full |
| **Read (Detail)** | ✅ (Inline in expanded building card) | LocationsPage.tsx | GET /projects/:projectId/locations/:id | locations.controller.ts:54 | ✅ Full |
| **Update** | ✅ Edit dialog for locations | LocationsPage.tsx:223-245 | PATCH /projects/:projectId/locations/:id | locations.controller.ts:70 | ✅ Full |
| **Delete** | ✅ Delete with confirmation | LocationsPage.tsx:247-264 | DELETE /projects/:projectId/locations/:id | locations.controller.ts:81 | ✅ Full |

**Gaps**: None - Locations has full CRUD.

---

## 5. Invoice

| Operation | Frontend UI | Frontend File(s) | Backend Endpoint | Backend Controller | Status |
|---|---|---|---|---|---|
| **Create** | 🔶 Button shows toast 'Create Invoice dialog would open' | InvoicesPage.tsx:96 | POST /invoices/generate | billing.controller.ts:46 | 🔶 Partial (frontend toast only) |
| **Read (List)** | ✅ InvoicesPage with SmartTable + filters | InvoicesPage.tsx | GET /invoices (with query params) | invoices.controller.ts (not GET all found - may be through billing module) | ✅ Full |
| **Read (Detail)** | ✅ InvoiceDetailPage with full layout | InvoiceDetailPage.tsx | GET /invoices/:id | invoices.controller.ts (detail endpoint) | ✅ Full |
| **Issue** | ✅ Issue button (draft only) + mutation | InvoicesPage.tsx:75, InvoiceDetailPage.tsx:59 | POST /invoices/:id/issue | (billing controller or invoices controller) | ✅ Full |
| **Update (Edit)** | 🔶 Button shows toast 'Edit invoice' | InvoicesPage.tsx:72, InvoiceDetailPage.tsx:56 | (not found) | ❌ No backend endpoint | 🔶 Missing |
| **Cancel** | 🔶 Button shows toast 'Invoice cancelled' | InvoicesPage.tsx:82, InvoiceDetailPage.tsx:64 | (not found) | ❌ No backend endpoint | 🔶 Missing |
| **Download PDF** | ✅ Download button/link | InvoicesPage.tsx:80, InvoiceDetailPage.tsx:62 | GET /invoices/:id/pdf | invoices.controller.ts:22 | ✅ Full |
| **Delete** | ❌ No delete button | (Missing) | (not found) | ❌ Missing | ❌ Missing |

**Gaps**: Invoice **Create** (frontend is fake toast), Invoice **Edit** (toast only, no backend), Invoice **Cancel** (toast only), Invoice **Delete** (no UI, no backend)

---

## 6. Payment

| Operation | Frontend UI | Frontend File(s) | Backend Endpoint | Backend Controller | Status |
|---|---|---|---|---|---|
| **Create** | ✅ Dialog with project/customer/amount/method/date | PaymentsPage.tsx:81-137 | POST /payments | (POST not found on payments controller - only GET, PATCH, DELETE) | 🔶 Partial (no POST endpoint found in backend) |
| **Read (List)** | ✅ PaymentsPage with SmartTable | PaymentsPage.tsx | GET /payments | payments.controller.ts:21 | ✅ Full |
| **Read (Detail)** | ❌ No detail page | (Missing) | GET /payments/:id | payments.controller.ts:31 | ❌ Missing |
| **Update** | 🔶 Button shows toast 'Edit payment' | PaymentsPage.tsx:64 | PATCH /payments/:id | payments.controller.ts:38 | 🔶 Partial (frontend fake) |
| **Delete** | 🔶 Button shows toast 'Delete payment' | PaymentsPage.tsx:67 | DELETE /payments/:id | payments.controller.ts:50 | 🔶 Partial (frontend fake) |
| **Reverse** | ❌ No reverse UI | (Missing) | POST /payments/:id/reverse | payments.controller.ts:63 | ❌ Missing |

**Gaps**: Payment **Create** (no POST endpoint on backend), Payment **Detail** page, Payment **Update** (frontend fake), Payment **Delete** (frontend fake), Payment **Reverse** (no UI, endpoint exists)

---

## 7. Reading

| Operation | Frontend UI | Frontend File(s) | Backend Endpoint | Backend Controller | Status |
|---|---|---|---|---|---|
| **Create** | ✅ ReadingNewPage with Zod validation | ReadingNewPage.tsx | POST /readings | readings.controller.ts:33 | ✅ Full |
| **Read (List)** | ✅ ReadingsPage with all/review tabs | ReadingsPage.tsx | GET /readings | readings.controller.ts:43 | ✅ Full |
| **Read (Detail)** | ❌ No reading detail page | (Missing) | GET /readings/:id | readings.controller.ts:57 | ❌ Missing |
| **Update** | 🔶 Button shows toast 'Edit reading' | ReadingsPage.tsx:63 | (not found) | ❌ No backend endpoint | 🔶 Missing |
| **Delete** | ❌ No delete button for readings | (Missing) | (not found) | ❌ Missing | ❌ Missing |
| **Approve** | ✅ Reading approve endpoint exists | (used by review queue) | POST /readings/:id/approve | readings.controller.ts:64 | ✅ Full |
| **Reject** | ✅ Reading reject endpoint exists | (used by review queue) | POST /readings/:id/reject | readings.controller.ts:79 | ✅ Full |

**Gaps**: Reading **Detail** page, Reading **Update** (frontend fake, no backend), Reading **Delete** (no UI, no backend)

---

## 8. User

| Operation | Frontend UI | Frontend File(s) | Backend Endpoint | Backend Controller | Status |
|---|---|---|---|---|---|
| **Create** | ✅ Dialog in SettingsPage | SettingsPage.tsx | POST /users (assumed) | users.controller.ts | ✅ Full |
| **Read (List)** | ✅ User list in SettingsPage | SettingsPage.tsx | GET /users | users.controller.ts | ✅ Full |
| **Update** | ✅ Edit dialog in SettingsPage | SettingsPage.tsx | PATCH /users/:id (assumed) | users.controller.ts | ✅ Full |
| **Delete** | ✅ Delete in SettingsPage | SettingsPage.tsx | DELETE /users/:id (assumed) | users.controller.ts | ✅ Full |

**Gaps**: None (based on SettingsPage which has full user CRUD)

---

## 9. Tariff

| Operation | Frontend UI | Frontend File(s) | Backend Endpoint | Backend Controller | Status |
|---|---|---|---|---|---|
| **Create** | ✅ TariffStudioPage create dialog | TariffStudioPage.tsx:97-121 | POST /tariffs | (tariff service exists, controller not found in search) | 🔶 Partial (backed by tariff service) |
| **Read (List)** | ✅ Tariff list by utility type | TariffStudioPage.tsx | GET /tariffs?utility= | (tariff service exists) | ✅ Full |
| **Update** | ✅ Edit dialog | TariffStudioPage.tsx:97-121 | PATCH /tariffs/:id (assumed) | (tariff service exists) | ✅ Full |
| **Delete** | ✅ Delete with confirm | TariffStudioPage.tsx:88 | DELETE /tariffs/:id | (tariff service exists) | ✅ Full |
| **Tier Editor** | 🔶 Tier dialog - Save is fake (just toast) | TariffStudioPage.tsx:124-153 | (not found) | ❌ No backend endpoint | 🔶 Missing |
| **Simulate** | ✅ Simulation dialog with API call | TariffStudioPage.tsx:155-189 | POST /tariffs/simulate | (tariff engine service exists) | ✅ Full |

**Gaps**: Tariff Tier **Save** (frontend fake, no backend endpoint found), Tariff controller not found in backend scan

---

## 10. Ticket

| Operation | Frontend UI | Frontend File(s) | Backend Endpoint | Backend Controller | Status |
|---|---|---|---|---|---|
| **Create** | ✅ Dialog with title/description/priority | TicketsPage.tsx:43-58 | POST /tickets | tickets.controller.ts | ✅ Full |
| **Read (List)** | ✅ TicketsPage with table/kanban views | TicketsPage.tsx | GET /tickets | tickets.controller.ts | ✅ Full |
| **Update** | ❌ No edit/status change UI | (Missing) | PATCH /tickets/:id (assumed) | tickets.controller.ts | ❌ Missing |
| **Delete** | ❌ No delete UI | (Missing) | DELETE /tickets/:id (assumed) | tickets.controller.ts | ❌ Missing |

**Gaps**: Ticket **Update** (no UI), Ticket **Delete** (no UI)

---

## 11. Support Request

| Operation | Frontend UI | Frontend File(s) | Backend Endpoint | Backend Controller | Status |
|---|---|---|---|---|---|
| **Create** | ✅ Form on SupportPage | SupportPage.tsx:44-46 | POST /support | support.controller.ts | ✅ Full |
| **Read (List)** | ✅ SupportPage with list + detail | SupportPage.tsx | GET /support | support.controller.ts | ✅ Full |
| **Update** | ❌ No edit/status update | (Missing) | PATCH /support/:id (assumed) | support.controller.ts | ❌ Missing |
| **Delete** | ❌ No delete UI | (Missing) | DELETE /support/:id (assumed) | support.controller.ts | ❌ Missing |

---

## 12. SIM Card

| Operation | Frontend UI | Frontend File(s) | Backend Endpoint | Backend Controller | Status |
|---|---|---|---|---|---|
| **Create** | ❌ No create UI | (Missing) | (not found) | ❌ Missing | ❌ Missing |
| **Read (List)** | ✅ SimCardsPage with filters | SimCardsPage.tsx | GET /sim-cards | sim-cards.controller.ts | ✅ Full |
| **Read (Detail)** | ❌ No detail page | (Missing) | (not found) | ❌ Missing | ❌ Missing |
| **Update** | ❌ No edit UI | (Missing) | (not found) | ❌ Missing | ❌ Missing |
| **Delete** | ❌ No delete UI | (Missing) | (not found) | ❌ Missing | ❌ Missing |

**Gaps**: SIM Card has NO CRUD operations except Read (List). No create, update, delete.

---

## 13. Settlement

| Operation | Frontend UI | Frontend File(s) | Backend Endpoint | Backend Controller | Status |
|---|---|---|---|---|---|
| **Create** | ✅ Dialog with customer/project/meter/amount/type | SettlementPage.tsx:99-127 | POST /settlement | settlement.controller.ts:13 | ✅ Full |
| **Read (List)** | ✅ Settlement list tab | SettlementPage.tsx | GET /settlement | settlement.controller.ts:39 | ✅ Full |
| **Adjustment (Create)** | ✅ Adjustment dialog | SettlementPage.tsx:130-152 | POST /settlement/adjustments | settlement.controller.ts:47 | ✅ Full |
| **Adjustment (List)** | ✅ Adjustment list tab | SettlementPage.tsx | GET /settlement/adjustments | settlement.controller.ts:47 | ✅ Full |

**Gaps**: Settlement **Update**, Settlement **Delete** - not implemented.

---

## 14. Wallet

| Operation | Frontend UI | Frontend File(s) | Backend Endpoint | Backend Controller | Status |
|---|---|---|---|---|---|
| **Read (Balance)** | ✅ WalletTab with balance card | WalletTab.tsx | GET /wallet/:customerId | wallet.controller.ts | ✅ Full |
| **Credit** | ✅ Credit dialog + mutation | WalletTab.tsx:103-117 | POST /wallet/:id/credit | wallet.controller.ts | ✅ Full |
| **Debit** | ✅ Debit dialog + mutation | WalletTab.tsx:119-133 | POST /wallet/:id/debit | wallet.controller.ts | ✅ Full |
| **Transfer** | ✅ Transfer dialog + mutation | WalletTab.tsx:135-151 | POST /wallet/transfer | wallet.controller.ts | ✅ Full |
| **History** | ✅ Transaction history table | WalletTab.tsx:155-172 | GET /wallet/:id/history | wallet.controller.ts | ✅ Full |

**Gaps**: Wallet CRUD is complete for financial transactions.

---

## Summary of Missing CRUD Operations

| Entity | Missing Operations |
|---|---|
| **Customer** | Update (no save button), Delete (no UI button) |
| **Meter** | Update (no edit form on detail page) |
| **Project** | (none - full CRUD) |
| **Location** | (none - full CRUD) |
| **Invoice** | Create (fake toast), Edit (fake toast, no backend), Cancel (fake toast), Delete (missing) |
| **Payment** | Create (no POST endpoint found in backend), Detail page, Update (fake toast), Delete (fake toast), Reverse (no UI) |
| **Reading** | Detail page, Update (fake toast, no backend), Delete (missing) |
| **User** | (none - full CRUD in SettingsPage) |
| **Tariff** | Tier Save (fake toast, no backend) |
| **Ticket** | Update (no UI), Delete (no UI) |
| **Support** | Update (no UI), Delete (no UI) |
| **SIM Card** | Create, Detail, Update, Delete (ALL missing - list only) |
| **Settlement** | Update, Delete |
| **Wallet** | (none - full financial operations) |
