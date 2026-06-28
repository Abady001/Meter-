# CRUD Certification v2 — Sprint 40-43

**Date:** 2026-06-25  
**Scope:** Full CRUD + lifecycle operations per entity  
**Legend:** ✅ WORKING | ❌ MISSING | 🔶 PARTIAL/FAKE

---

## Customer

| Operation | Frontend | Controller | Endpoint | Status |
|-----------|----------|-----------|----------|--------|
| **CREATE** | `CustomerDetailPage.tsx` (id=new) via useCreateCustomer | CustomersController | `POST /projects/:pid/customers` | ✅ |
| **READ (List)** | `CustomersPage.tsx` (with filters/search) | CustomersController | `GET /projects/:pid/customers` | ✅ |
| **READ (Detail)** | `CustomerDetailPage.tsx` (with 12+ tabs) | CustomersController | `GET /projects/:pid/customers/:id` | ✅ |
| **UPDATE** | Edit dialog on CustomerDetailPage | CustomersController | `PATCH /projects/:pid/customers/:id` | ✅ |
| **DELETE** | Delete with confirmation on CustomerDetailPage | CustomersController | `DELETE /projects/:pid/customers/:id` | ✅ |
| **Transfer Ownership** | OwnershipTab 3-step wizard | CustomersController | `POST /customers/:id/transfer-ownership` | ✅ |
| **Customer 360** | (no FE) | CustomersController | `GET /customers/:id/360` | ❌ |

**Verdict:** ✅ FULL CRUD — all gaps from v1 closed (edit, delete)

---

## Meter

| Operation | Frontend | Controller | Endpoint | Status |
|-----------|----------|-----------|----------|--------|
| **CREATE** | MeterDetailPage (id=new) via useCreateMeter | MetersController | `POST /meters` | ✅ |
| **READ (List)** | MetersPage with QueryBoundary | MetersController | `GET /meters` | ✅ |
| **READ (Detail)** | MeterDetailPage with chart + tabs | MetersController | `GET /meters/:id` | ✅ |
| **UPDATE** | Edit dialog on MeterDetailPage | MetersController | `PATCH /meters/:id` | ✅ |
| **DELETE** | Delete with AlertDialog on MetersPage | MetersController | `DELETE /meters/:id` | ✅ |
| **Assign** | MeterAssignPage 9-step wizard | MetersController | `POST /meters/:mid/assign` | ✅ |
| **Replace** | MeterReplacePage two-panel flow | (needs verify) | unclear endpoint | 🔶 |
| **Terminate** | MeterTerminatePage confirm flow | (needs verify) | unclear endpoint | 🔶 |

**Verdict:** ✅ FULL CRUD — replace/terminate need endpoint verification

---

## Invoice

| Operation | Frontend | Controller | Endpoint | Status |
|-----------|----------|-----------|----------|--------|
| **CREATE (Generate)** | InvoicesPage (toast stub) | BillingController | `POST /invoices/generate` | 🔶 FE fake toast |
| **READ (List)** | InvoicesPage with SmartTable | BillingController | `GET /invoices` | ✅ |
| **READ (Detail)** | InvoiceDetailPage with line items | BillingController | `GET /invoices/:id` | ✅ |
| **UPDATE** | toast stub | (none) | (none) | ❌ |
| **DELETE** | (none) | (none) | (none) | ❌ |
| **Issue** | Issue button + mutation | BillingController | `POST /invoices/:id/issue` | ✅ |
| **Cancel** | toast stub | BillingController | `POST /invoices/:id/cancel` | 🔶 FE fake toast |
| **Adjust** | (no direct button) | BillingController | `POST /invoices/:id/adjustments` | ❌ |
| **Download PDF** | Download button | InvoicesController | `GET /invoices/:id/pdf` | ✅ |

**Verdict:** ❌ NOT CERTIFIED — Create is fake, Update/Cancel are toasts, Delete missing

---

## Payment

| Operation | Frontend | Controller | Endpoint | Status |
|-----------|----------|-----------|----------|--------|
| **CREATE** | PaymentsPage dialog + mutation | BillingController | `POST /payments` | ✅ |
| **READ (List)** | PaymentsPage with SmartTable | PaymentsController | `GET /payments` | ✅ |
| **READ (Detail)** | (no detail page) | PaymentsController | `GET /payments/:id` | ❌ |
| **UPDATE** | toast stub | PaymentsController | `PATCH /payments/:id` | 🔶 FE fake toast |
| **DELETE** | toast stub | PaymentsController | `DELETE /payments/:id` | 🔶 FE fake toast |
| **Reverse** | (no UI) | PaymentsController | `POST /payments/:id/reverse` | ❌ |

**Verdict:** ❌ NOT CERTIFIED — Detail, Update, Delete, Reverse all missing/gapped

---

## Reading

| Operation | Frontend | Controller | Endpoint | Status |
|-----------|----------|-----------|----------|--------|
| **CREATE** | ReadingNewPage with Zod validation | ReadingsController | `POST /readings` | ✅ |
| **READ (List)** | ReadingsPage with all/review tabs | ReadingsController | `GET /readings` | ✅ |
| **READ (Detail)** | (no detail page) | ReadingsController | `GET /readings/:id` | ❌ |
| **UPDATE** | toast stub | (none) | (none) | ❌ |
| **DELETE** | (none) | (none) | (none) | ❌ |
| **Approve** | (no FE — backend exists) | ReadingsController | `POST /readings/:id/approve` | ❌ |
| **Reject** | (no FE — backend exists) | ReadingsController | `POST /readings/:id/reject` | ❌ |

**Verdict:** ❌ NOT CERTIFIED — Detail, Update, Delete, Approve, Reject all missing

---

## Project

| Operation | Frontend | Controller | Endpoint | Status |
|-----------|----------|-----------|----------|--------|
| **CREATE** | ProjectFormDialog | ProjectsController | `POST /projects` | ✅ |
| **READ (List)** | ProjectsPage with SmartTable | ProjectsController | `GET /projects` | ✅ |
| **READ (Detail)** | ProjectDetailPage with tabs | ProjectsController | `GET /projects/:id` | ✅ |
| **UPDATE** | ProjectFormDialog edit mode | ProjectsController | `PATCH /projects/:id` | ✅ |
| **DELETE** | Delete with AlertDialog | ProjectsController | `DELETE /projects/:id` | ✅ |

**Verdict:** ✅ FULL CRUD — no gaps

---

## Area

| Operation | Frontend | Controller | Endpoint | Status |
|-----------|----------|-----------|----------|--------|
| **CREATE** | SettingsPage area tab | AreasController | `POST /areas` | ✅ |
| **READ (List)** | SettingsPage area tab | AreasController | `GET /areas` (public) | ✅ |
| **UPDATE** | SettingsPage area tab | AreasController | `PATCH /areas/:id` | ✅ |
| **DELETE** | SettingsPage area tab | AreasController | `DELETE /areas/:id` | ✅ |
| **Activate/Deactivate** | SettingsPage area tab | AreasController | (via delete toggle) | ✅ |

**Verdict:** ✅ FULL CRUD — no gaps

---

## User

| Operation | Frontend | Controller | Endpoint | Status |
|-----------|----------|-----------|----------|--------|
| **CREATE** | SettingsPage user management | UsersController | `POST /users` | ✅ |
| **READ (List)** | SettingsPage user management | UsersController | `GET /users` | ✅ |
| **UPDATE** | SettingsPage user management | UsersController | `PATCH /users/:id` | ✅ |
| **DELETE** | SettingsPage user management | UsersController | `DELETE /users/:id` | ✅ |
| **Lock/Unlock** | (via login attempt lockout) | AuthController | (automatic) | 🔶 No explicit UI |
| **Password Reset** | (no UI) | UsersController | `POST /users/:id/password` | ❌ |

**Verdict:** ✅ FULL CRUD — password reset has no UI, lock/unlock not exposed

---

## Tariff

| Operation | Frontend | Controller | Endpoint | Status |
|-----------|----------|-----------|----------|--------|
| **CREATE** | TariffStudioPage create dialog | BillingController | `POST /tariffs` | ✅ |
| **READ (List)** | TariffStudioPage by utility type | BillingController | `GET /tariffs` | ✅ |
| **UPDATE** | TariffStudioPage edit dialog | BillingController | `PATCH /tariffs/:id` | ✅ |
| **DELETE** | TariffStudioPage confirm | (not found in scan) | `DELETE /tariffs/:id` | 🔶 Endpoint status unclear |
| **Tier Save** | toast stub | (none found) | (none) | ❌ |
| **Simulate** | Simulation dialog | BillingController | `POST /tariffs/simulate` | ✅ |

**Verdict:** 🔶 PARTIAL — Tier save is fake, delete endpoint unverified

---

## Wallet

| Operation | Frontend | Controller | Endpoint | Status |
|-----------|----------|-----------|----------|--------|
| **READ (Balance)** | WalletTab balance card | WalletController | `GET /wallet/:customerId` | ✅ |
| **Credit** | WalletTab dialog + mutation | WalletController | `POST /wallet/:id/credit` | ✅ |
| **Debit** | WalletTab dialog + mutation | WalletController | `POST /wallet/:id/debit` | ✅ |
| **Transfer** | WalletTab dialog + mutation | WalletController | `POST /wallet/transfer` | ✅ |
| **READ (History)** | WalletTab transaction history | WalletController | `GET /wallet/:id/history` | ✅ |

**Verdict:** ✅ FULL FINANCIAL OPERATIONS — no gaps

---

## Overall Certification

| Entity | CREATE | READ | UPDATE | DELETE | Activate/Deactivate/Lock | Verdict |
|--------|--------|------|--------|--------|--------------------------|---------|
| **Customer** | ✅ | ✅ | ✅ | ✅ | N/A | ✅ CERTIFIED |
| **Meter** | ✅ | ✅ | ✅ | ✅ | 🔶 Partial (replace/terminate) | ✅ CERTIFIED |
| **Invoice** | ❌ | ✅ | ❌ | ❌ | 🔶 Issue works, Cancel fake | ❌ FAIL |
| **Payment** | ✅ | ✅ | ❌ | ❌ | ❌ Reverse missing | ❌ FAIL |
| **Reading** | ✅ | ✅ | ❌ | ❌ | 🔶 Approve/Reject exist (no FE) | ❌ FAIL |
| **Project** | ✅ | ✅ | ✅ | ✅ | N/A | ✅ CERTIFIED |
| **Area** | ✅ | ✅ | ✅ | ✅ | ✅ Activate/Deactivate | ✅ CERTIFIED |
| **User** | ✅ | ✅ | ✅ | ✅ | 🔶 Lock/Unlock no UI | ✅ CERTIFIED |
| **Tariff** | ✅ | ✅ | ✅ | 🔶 | 🔶 Tier Save fake | 🔶 PARTIAL |
| **Wallet** | N/A | ✅ | ✅ (credit/debit) | N/A | N/A | ✅ CERTIFIED |

**Summary:** 6 of 10 entities fully certified. Invoices, Payments, Readings fail. Tariff is partial.
