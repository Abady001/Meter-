# Phase F2B.2 — CRUD Trace Matrix

**Date**: 2026-06-18
**Method**: Full-stack trace per action: Button → Component → Hook → API Client → Endpoint → Controller → Service → Repository
**Source**: Extracted from F2A CRUD Truth Certification (verified via code inspection + live API testing)

---

## Legend

| Symbol | Meaning |
|--------|---------|
| ✅ | Exists and works |
| ❌ | Missing or broken |
| ⚠️ | Exists but has issues |
| 🔌 | Real API call (not toast stub) |

---

## Customers Module

| Action | Button | Component | Hook | API Call | Endpoint | Controller | Service | Repository | DB | Verdict |
|--------|--------|-----------|------|----------|----------|------------|---------|------------|----|---------|
| List | ✅ | CustomersPage | ❌ (mock) | — | `GET /customers` | ❌ 404 | ✅ exists | ✅ exists | — | FAIL |
| Create | ⚠️ toast.info | AddDialog | — | — | `POST /customers` | ❌ 404 | ✅ exists | ✅ exists | — | FAIL |
| Detail | ✅ | CustomerDetailPage | ❌ (mock) | — | `GET /customers/:id` | ❌ 404 | ✅ exists | ✅ exists | — | FAIL |
| Edit | ⚠️ toast.info | EditDialog | — | — | `PATCH /customers/:id` | ❌ 404 | ✅ exists | ✅ exists | — | FAIL |
| Delete | ⚠️ toast.info | ConfirmDialog | — | — | `DELETE /customers/:id` | ❌ 404 | ✅ exists | ✅ exists | — | FAIL |

**Break point**: CustomersController exists in source (`backend/src/customers/`) but is NOT registered in the running app's `AppModule` (returns 404). The controller file exists, module file exists, but `AppModule` doesn't import `CustomersModule`.

---

## Meters Module

| Action | Button | Component | Hook | API Call | Endpoint | Controller | Service | Repository | DB | Verdict |
|--------|--------|-----------|------|----------|----------|------------|---------|------------|----|---------|
| List | ✅ | MetersPage | ❌ (mock) | — | `GET /meters` | ✅ 200 | ✅ | ✅ | ✅ | PASS |
| Create | ⚠️ toast.info | AddDialog | — | — | `POST /meters` | ✅ exists | ✅ exists | ✅ exists | — | FAIL |
| Detail | ✅ | MeterDetailPage | ❌ (mock) | — | `GET /meters/:id` | ✅ exists | ✅ exists | ✅ exists | — | FAIL |
| Edit | ⚠️ toast.info | EditDialog | — | — | `PATCH /meters/:id` | ✅ exists | ✅ exists | ✅ exists | — | FAIL |
| Delete | ⚠️ toast.info | ConfirmDialog | — | — | `DELETE /meters/:id` | ✅ exists | ✅ exists | ✅ exists | — | FAIL |
| Assign | 🔌 | MeterAssignPage | useAssignMeter | `POST /meters/:id/assign` | ✅ exists | ✅ exists | ✅ exists | ✅ | FAIL |
| Replace | 🔌 | MeterReplacePage | useReplaceMeter | `POST /meters/:id/terminate` + `POST /meters/:id/assign` | ✅ exists | ✅ exists | ✅ exists | ✅ | FAIL |
| Terminate | 🔌 | MeterTerminatePage | useTerminateMeter | `POST /meters/:id/terminate` | ✅ exists | ✅ exists | ✅ exists | ✅ | FAIL |

**Break point**: List works (real API returns 200). Assign/Replace/Terminate call real API but catch blocks show success toast even on error. Create/Edit/Delete/Detail are toast stubs or mock-only.

---

## Locations (Buildings/Units) Module

| Action | Button | Component | Hook | API Call | Endpoint | Controller | Service | Repository | DB | Verdict |
|--------|--------|-----------|------|----------|----------|------------|---------|------------|----|---------|
| List | ✅ | LocationsPage | ❌ (mock) | — | `GET /locations` | ❌ 404 | ✅ exists | ✅ exists | — | FAIL |
| Create | ⚠️ toast.info | AddBuilding | — | — | `POST /locations` | ❌ 404 | ✅ exists | ✅ exists | — | FAIL |

**Break point**: Same as Customers — controller exists in source but NOT registered in running app's AppModule.

---

## Readings Module

| Action | Button | Component | Hook | API Call | Endpoint | Controller | Service | Repository | DB | Verdict |
|--------|--------|-----------|------|----------|----------|------------|---------|------------|----|---------|
| List | ✅ | ReadingsPage | ❌ (mock) | — | `GET /readings` | ❌ 404 | ❌ | ❌ | ❌ | FAIL |
| Create | 🔌 | ReadingNewPage | useReadings | `POST /readings` | ✅ exists | ✅ exists | ✅ exists | ✅ | ⚠️ |
| Detail | ⚠️ toast.info | EditDialog | — | — | `GET /readings/:id` | ❌ 404 | ❌ | ❌ | ❌ | FAIL |
| Review Queue | — | — | — | `GET /readings/review-queue` | ✅ 200 | ✅ | ✅ | ✅ | ✅ | PASS |

**Break point**: Backend has only 2 endpoints (`POST /readings`, `GET /readings/review-queue`). Frontend calls `GET /readings` and `GET /readings/:id` — endpoint mismatch. Only Create is wired (real POST).

---

## Invoices Module

| Action | Button | Component | Hook | API Call | Endpoint | Controller | Service | Repository | DB | Verdict |
|--------|--------|-----------|------|----------|----------|------------|---------|------------|----|---------|
| List | ⚠️ (API mode) | InvoicesPage | useInvoices | `GET /invoices` | ✅ 200 | ✅ exists | ✅ exists | ✅ exists | ✅ | ⚠️ |
| Create | ⚠️ toast.info | CreateDialog | — | — | `POST /invoices` | ✅ exists | ✅ exists | ✅ exists | — | FAIL |
| Detail | ⚠️ (API mode) | InvoiceDetailPage | useInvoiceDetail | `GET /invoices/:id` | ✅ exists | ✅ exists | ✅ exists | ✅ exists | — | ⚠️ |
| Edit | ⚠️ toast.info | EditDialog | — | — | `PATCH /invoices/:id` | ✅ exists | ✅ exists | ✅ exists | — | FAIL |
| Issue | ⚠️ toast.info | IssueAction | — | — | `POST /invoices/:id/issue` | ✅ exists | ✅ exists | ✅ exists | — | FAIL |
| Cancel | ⚠️ toast.info | CancelAction | — | — | `POST /invoices/:id/cancel` | ✅ exists | ✅ exists | ✅ exists | — | FAIL |
| Record Payment | ⚠️ toast.info | PaymentDialog | — | — | `POST /invoices/:id/payments` | ✅ exists | ✅ exists | ✅ exists | — | FAIL |
| Download PDF | ⚠️ toast.info | DownloadAction | — | — | `GET /invoices/:id/pdf` | ❌ not found | ❌ not found | — | — | FAIL |

**Notes**: InvoicesPage uses API mode (no mock fallback). `mapInvoice()` in `use-invoices.ts` depends on `mockCustomers`, `mockMeters`, `mockProjects` to resolve names — will produce wrong data with real DB.

---

## Payments Module

| Action | Button | Component | Hook | API Call | Endpoint | Controller | Service | Repository | DB | Verdict |
|--------|--------|-----------|------|----------|----------|------------|---------|------------|----|---------|
| List | ⚠️ (API mode) | PaymentsPage | usePayments | `GET /payments` | ✅ 200 | ✅ exists | ✅ exists | ✅ exists | ✅ | ⚠️ |
| Create | ⚠️ toast.success | RecordPayment | — | — | `POST /payments` | ✅ exists | ✅ exists | ✅ exists | — | FAIL |
| Detail | ⚠️ toast.info | ViewDialog | — | — | `GET /payments/:id` | ✅ exists | ✅ exists | ✅ exists | — | FAIL |
| Edit | ⚠️ toast.info | EditDialog | — | — | `PATCH /payments/:id` | ✅ exists | ✅ exists | ✅ exists | — | FAIL |
| Delete | ⚠️ toast.info | ConfirmDialog | — | — | `DELETE /payments/:id` | ✅ exists | ✅ exists | ✅ exists | — | FAIL |

**Notes**: Payments list HAS REAL DATA in the database. This is the ONLY module with real production data. But all CRUD actions (create, edit, delete) are toast stubs.

---

## Certification Board

| Module | List | Create | Detail | Edit | Delete | Special | VERDICT |
|--------|------|--------|--------|------|--------|---------|---------|
| Customers | FAIL | FAIL | FAIL | FAIL | FAIL | — | **NO** |
| Meters | ✅ PASS | FAIL | FAIL | FAIL | FAIL | Assign/Replace/Terminate ⚠️ | **NO** |
| Locations | FAIL | FAIL | — | — | — | — | **NO** |
| Readings | FAIL | ⚠️ | FAIL | — | — | Review Queue ✅ | **NO** |
| Invoices | ⚠️ API mode | FAIL | ⚠️ API mode | FAIL | FAIL | Issue/Cancel/PDF FAIL | **NO** |
| Payments | ✅ HAS DATA | FAIL | FAIL | FAIL | FAIL | — | **NO** |

**Board Verdict: ALL 6 MODULES = NOT CERTIFIED**

---

## Root Cause Summary

| # | Issue | Impact | Fix |
|---|-------|--------|-----|
| 1 | `.env.local` uses `host.docker.internal` | All 47+ API calls fail | Change to `localhost` |
| 2 | CustomersModule, LocationsModule not registered in AppModule | 2 modules completely unreachable | Register modules |
| 3 | Readings only has `review-queue` endpoint | List, detail, update, delete missing | Add endpoints |
| 4 | All Create/Edit/Delete actions are toast stubs (31 toast.info + 13 toast.success) | No real data operations | Wire each to API |
| 5 | 4 catch blocks show `toast.success` on error | Silent data loss | Fix to `toast.error` |
| 6 | `mapInvoice()` depends on mock data | Will produce wrong data with real DB | Use API-driven lookup |
| 7 | Mock IDs (PRJ-001) vs UUID format | Filter/join operations fail with real DB | Remove mock dependency |
