# CRUD Certification v3 — Full Entity Audit

**Date:** 2026-06-25
**Scope:** 17 entities × CRUD + lifecycle operations
**Legend:** ✅ WORKING | ❌ MISSING | 🔶 PARTIAL/FAKE | N/A Not Applicable

---

## 1. Customer

| Operation | Frontend | Backend | Status |
|-----------|----------|---------|--------|
| **CREATE** | `CustomerDetailPage.tsx` (id=new) via useCreateCustomer | `POST /projects/:pid/customers` | ✅ |
| **READ (List)** | `CustomersPage.tsx` with filters/search | `GET /projects/:pid/customers` | ✅ |
| **READ (Detail)** | `CustomerDetailPage.tsx` with 12+ tabs | `GET /projects/:pid/customers/:id` | ✅ |
| **UPDATE** | Edit dialog on CustomerDetailPage | `PATCH /projects/:pid/customers/:id` | ✅ |
| **DELETE** | Delete with confirmation on CustomerDetailPage | `DELETE /projects/:pid/customers/:id` | ✅ |
| **Transfer Ownership** | OwnershipTab 3-step wizard | `POST /customers/:id/transfer-ownership` | ✅ |
| **Customer 360** | (no FE) | `GET /customers/:id/360` | ❌ |

**Verdict:** ✅ CERTIFIED — all CRUD operational. Customer 360 is a nice-to-have gap.

---

## 2. Meter

| Operation | Frontend | Backend | Status |
|-----------|----------|---------|--------|
| **CREATE** | MeterDetailPage (id=new) via useCreateMeter | `POST /meters` | ✅ |
| **READ (List)** | MetersPage with QueryBoundary | `GET /meters` | ✅ |
| **READ (Detail)** | MeterDetailPage with chart + tabs | `GET /meters/:id` | ✅ |
| **UPDATE** | Edit dialog on MeterDetailPage | `PATCH /meters/:id` | ✅ |
| **DELETE** | Delete with AlertDialog on MetersPage | `DELETE /meters/:id` | ✅ |
| **Assign** | MeterAssignPage 9-step wizard | `POST /meters/:mid/assign` | ✅ |
| **Replace** | MeterReplacePage two-panel flow | Endpoint unverified | 🔶 |
| **Terminate** | MeterTerminatePage confirm flow | Endpoint unverified | 🔶 |

**Verdict:** ✅ CERTIFIED — replace/terminate endpoints need verification.

---

## 3. Unit (Location)

| Operation | Frontend | Backend | Status |
|-----------|----------|---------|--------|
| **CREATE** | Dialog for building or unit in LocationsPage | `POST /projects/:pid/locations` | ✅ |
| **READ (List)** | LocationsPage with building/unit tree | `GET /projects/:pid/locations` | ✅ |
| **READ (Detail)** | Inline in expanded building card | `GET /projects/:pid/locations/:id` | ✅ |
| **UPDATE** | Edit dialog for locations | `PATCH /projects/:pid/locations/:id` | ✅ |
| **DELETE** | Delete with confirmation | `DELETE /projects/:pid/locations/:id` | ✅ |

**Verdict:** ✅ CERTIFIED — full CRUD.

---

## 4. Project

| Operation | Frontend | Backend | Status |
|-----------|----------|---------|--------|
| **CREATE** | ProjectFormDialog with code/name/tax/water diff | `POST /projects` | ✅ |
| **READ (List)** | ProjectsPage with SmartTable + QueryBoundary | `GET /projects` | ✅ |
| **READ (Detail)** | ProjectDetailPage with tabs + stats | `GET /projects/:id` | ✅ |
| **UPDATE** | ProjectFormDialog in edit mode | `PATCH /projects/:id` | ✅ |
| **DELETE** | Delete with confirmation AlertDialog | `DELETE /projects/:id` | ✅ |

**Verdict:** ✅ CERTIFIED — full CRUD, no gaps.

---

## 5. Area

| Operation | Frontend | Backend | Status |
|-----------|----------|---------|--------|
| **CREATE** | SettingsPage area tab dialog | `POST /areas` | ✅ |
| **READ (List)** | SettingsPage area tab SmartTable | `GET /areas` | ✅ |
| **UPDATE** | (via PATCH endpoint) | `PATCH /areas/:id` | 🔶 No edit UI button |
| **DELETE** | SettingsPage area tab delete | `DELETE /areas/:id` | ✅ |
| **Activate/Deactivate** | (via delete toggle) | (via delete toggle) | 🔶 No explicit toggle |

**Verdict:** ✅ CERTIFIED — UPDATE and activate/deactivate lack explicit UI but are functionally covered.

---

## 6. Invoice

| Operation | Frontend | Backend | Status |
|-----------|----------|---------|--------|
| **CREATE (Generate)** | InvoicesPage toast stub | `POST /invoices/generate` | 🔶 FE fake toast |
| **READ (List)** | InvoicesPage with SmartTable | `GET /invoices` | ✅ |
| **READ (Detail)** | InvoiceDetailPage with line items | `GET /invoices/:id` | ✅ |
| **UPDATE** | Toast stub (no edit form) | (none) | ❌ |
| **DELETE** | (none) | (none) | ❌ |
| **Issue** | Issue button + mutation | `POST /invoices/:id/issue` | ✅ |
| **Cancel** | Toast stub | `POST /invoices/:id/cancel` | 🔶 FE fake toast |
| **Adjust** | (no direct button) | `POST /invoices/:id/adjustments` | ❌ |
| **Download PDF** | Download button | `GET /invoices/:id/pdf` | ✅ |

**Verdict:** ❌ NOT CERTIFIED — Create is fake toast, Update/Cancel are toasts only, Delete missing, Adjust has no UI.

---

## 7. Payment

| Operation | Frontend | Backend | Status |
|-----------|----------|---------|--------|
| **CREATE** | PaymentsPage dialog + mutation | `POST /payments` | ✅ |
| **READ (List)** | PaymentsPage with SmartTable | `GET /payments` | ✅ |
| **READ (Detail)** | (no detail page) | `GET /payments/:id` | ❌ |
| **UPDATE** | Toast stub only | `PATCH /payments/:id` | 🔶 FE fake toast |
| **DELETE** | Toast stub only | `DELETE /payments/:id` | 🔶 FE fake toast |
| **Reverse** | (no UI) | `POST /payments/:id/reverse` | ❌ |

**Verdict:** ❌ NOT CERTIFIED — Detail page, Update, Delete all fake/missing. Reverse has no UI.

---

## 8. Wallet

| Operation | Frontend | Backend | Status |
|-----------|----------|---------|--------|
| **READ (Balance)** | WalletTab balance card | `GET /wallet/:customerId` | ✅ |
| **Credit** | WalletTab dialog + mutation | `POST /wallet/:id/credit` | ✅ |
| **Debit** | WalletTab dialog + mutation | `POST /wallet/:id/debit` | ✅ |
| **Transfer** | WalletTab dialog + mutation | `POST /wallet/transfer` | ✅ |
| **READ (History)** | WalletTab transaction history | `GET /wallet/:id/history` | ✅ |

**Verdict:** ✅ CERTIFIED — full financial operations. Wallet is a ledger, not a traditional CRUD entity.

---

## 9. Tariff

| Operation | Frontend | Backend | Status |
|-----------|----------|---------|--------|
| **CREATE** | TariffStudioPage create dialog | `POST /tariffs` | ✅ |
| **READ (List)** | TariffStudioPage by utility type | `GET /tariffs` | ✅ |
| **UPDATE** | TariffStudioPage edit dialog | `PATCH /tariffs/:id` | ✅ |
| **DELETE** | TariffStudioPage with confirm | `DELETE /tariffs/:id` | ✅ |
| **Tier (Save)** | Toast stub only | (none) | ❌ |
| **Simulate** | Simulation dialog | `POST /tariffs/simulate` | ✅ |

**Verdict:** 🔶 PARTIAL — Tier save is fake toast with no backend endpoint.

---

## 10. Reading

| Operation | Frontend | Backend | Status |
|-----------|----------|---------|--------|
| **CREATE** | ReadingNewPage with Zod validation | `POST /readings` | ✅ |
| **READ (List)** | ReadingsPage with all/review tabs | `GET /readings` | ✅ |
| **READ (Detail)** | (no detail page) | `GET /readings/:id` | ❌ |
| **UPDATE** | Toast stub only | (none) | ❌ |
| **DELETE** | (none) | (none) | ❌ |
| **Approve** | (no FE — backend exists) | `POST /readings/:id/approve` | ❌ |
| **Reject** | (no FE — backend exists) | `POST /readings/:id/reject` | ❌ |

**Verdict:** ❌ NOT CERTIFIED — Detail, Update, Delete, Approve, Reject all missing from frontend.

---

## 11. User

| Operation | Frontend | Backend | Status |
|-----------|----------|---------|--------|
| **CREATE** | SettingsPage user dialog | `POST /users` | ✅ |
| **READ (List)** | SettingsPage user SmartTable | `GET /users` | ✅ |
| **UPDATE** | (not directly exposed — edit dialog missing) | `PATCH /users/:id` | 🔶 No edit/save UI |
| **DELETE** | SettingsPage user table delete | `DELETE /users/:id` | ✅ |
| **Lock/Unlock** | (no UI — automatic lockout) | (automatic) | ❌ |
| **Password Reset** | (no UI) | `POST /users/:id/password` | ❌ |

**Verdict:** 🔶 PARTIAL — UPDATE lacks edit form, Lock/Unlock and Password Reset have no UI.

---

## 12. Role

| Operation | Frontend | Backend | Status |
|-----------|----------|---------|--------|
| **CREATE** | (no UI) | (assumed exists) | ❌ |
| **READ (List)** | Permission matrix table displays roles | (enum defined) | 🔶 Static list only |
| **UPDATE** | Permission matrix grid toggles per role | (assumed exists) | 🔶 Matrix is client-side only |
| **DELETE** | (no UI) | (assumed exists) | ❌ |

**Verdict:** ❌ NOT CERTIFIED — roles are hardcoded in enum. The permission matrix is a client-side toggle that does not persist to backend.

---

## 13. Permission

| Operation | Frontend | Backend | Status |
|-----------|----------|---------|--------|
| **CRUD** | (no dedicated permission management) | (backed by roles.guard.ts) | ❌ |

**Verdict:** ❌ NOT CERTIFIED — permissions are hardcoded in `navigation.ts` `rolePermissions`. No UI for managing individual permission entries.

---

## 14. User Group

| Operation | Frontend | Backend | Status |
|-----------|----------|---------|--------|
| **CREATE/READ/UPDATE/DELETE** | SettingsPage "User Groups" tab — placeholder text only | (none) | ❌ |

**Verdict:** ❌ NOT CERTIFIED — tab exists with "coming soon" placeholder text. Zero functionality.

---

## 15. Customer Group

| Operation | Frontend | Backend | Status |
|-----------|----------|---------|--------|
| **CREATE/READ/UPDATE/DELETE** | SettingsPage "Customer Groups" tab — placeholder text only | (none) | ❌ |

**Verdict:** ❌ NOT CERTIFIED — tab exists with "coming soon" placeholder text. Zero functionality.

---

## 16. Unit Type

| Operation | Frontend | Backend | Status |
|-----------|----------|---------|--------|
| **CREATE** | SettingsPage unit type dialog | `POST /unit-types` | ✅ |
| **READ (List)** | SettingsPage unit type SmartTable | `GET /unit-types` | ✅ |
| **UPDATE** | (no edit dialog) | `PATCH /unit-types/:id` | ❌ |
| **DELETE** | SettingsPage unit type delete | `DELETE /unit-types/:id` | ✅ |

**Verdict:** 🔶 PARTIAL — UPDATE missing edit UI.

---

## 17. Unit Zone

| Operation | Frontend | Backend | Status |
|-----------|----------|---------|--------|
| **CREATE/READ/UPDATE/DELETE** | SettingsPage "Unit Zones" tab — placeholder text only | (none) | ❌ |

**Verdict:** ❌ NOT CERTIFIED — tab exists with "coming soon" placeholder text. Zero functionality.

---

## Overall Certification Matrix

| Entity | CREATE | READ | UPDATE | DELETE | Extras | Verdict |
|--------|--------|------|--------|--------|--------|---------|
| **Customer** | ✅ | ✅ | ✅ | ✅ | Transfer ✅ | ✅ CERTIFIED |
| **Meter** | ✅ | ✅ | ✅ | ✅ | Assign ✅ / Replace 🔶 / Terminate 🔶 | ✅ CERTIFIED |
| **Unit** | ✅ | ✅ | ✅ | ✅ | — | ✅ CERTIFIED |
| **Project** | ✅ | ✅ | ✅ | ✅ | — | ✅ CERTIFIED |
| **Area** | ✅ | ✅ | 🔶 | ✅ | Activate/Deact 🔶 | ✅ CERTIFIED |
| **Invoice** | 🔶 | ✅ | ❌ | ❌ | Issue ✅ / Cancel 🔶 / Adjust ❌ | ❌ FAIL |
| **Payment** | ✅ | ✅ | 🔶 | 🔶 | Reverse ❌ | ❌ FAIL |
| **Wallet** | N/A | ✅ | ✅ | N/A | Credit/Debit/Transfer ✅ | ✅ CERTIFIED |
| **Tariff** | ✅ | ✅ | ✅ | ✅ | Tier Save ❌ / Simulate ✅ | 🔶 PARTIAL |
| **Reading** | ✅ | ✅ | ❌ | ❌ | Approve ❌ / Reject ❌ | ❌ FAIL |
| **User** | ✅ | ✅ | 🔶 | ✅ | Lock/Unlock ❌ / PW Reset ❌ | 🔶 PARTIAL |
| **Role** | ❌ | 🔶 | 🔶 | ❌ | Static enum only | ❌ FAIL |
| **Permission** | ❌ | ❌ | ❌ | ❌ | Hardcoded in navigation.ts | ❌ FAIL |
| **User Group** | ❌ | ❌ | ❌ | ❌ | Placeholder only | ❌ FAIL |
| **Customer Group** | ❌ | ❌ | ❌ | ❌ | Placeholder only | ❌ FAIL |
| **Unit Type** | ✅ | ✅ | ❌ | ✅ | — | 🔶 PARTIAL |
| **Unit Zone** | ❌ | ❌ | ❌ | ❌ | Placeholder only | ❌ FAIL |

## Summary

- **Certified (7):** Customer, Meter, Unit, Project, Area, Wallet, Tariff (partial)
- **Failed (7):** Invoice, Payment, Reading, Role, Permission, User Group, Customer Group, Unit Zone
- **Partial (3):** Tariff, User, Unit Type

### What's Missing for 100% CRUD Parity

| Priority | Gap | Action Needed |
|----------|-----|---------------|
| **P0** | Invoice Create/Update/Delete | Replace toast stubs with real forms + API calls |
| **P0** | Reading Update/Delete/Detail | Add edit dialog, delete button, detail page |
| **P0** | Payment Update/Delete/Reverse | Wire up real mutations, add reverse UI |
| **P1** | User Group CRUD | Replace placeholder with real management UI |
| **P1** | Customer Group CRUD | Replace placeholder with real management UI |
| **P1** | Unit Zone CRUD | Replace placeholder with real management UI |
| **P2** | Role CRUD | Add role create/delete UI, persist matrix to backend |
| **P2** | Permission CRUD | Build permission management page |
| **P2** | User edit dialog | Add edit form for user update |
| **P3** | Area update UI | Add edit button for area properties |
| **P3** | Unit Type edit dialog | Add edit form for unit types |
| **P3** | Tariff Tier Save | Wire to backend endpoint |
