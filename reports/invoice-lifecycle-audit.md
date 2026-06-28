# Invoice Lifecycle Audit Report — Meter Verse

**Date:** 2026-06-25  
**Auditor:** Principal Billing Systems Expert (Automated)  
**Scope:** End-to-end invoice operations across backend (NestJS), frontend (Next.js), and Prisma schema  
**Repository:** `D:\meter\Meter`

---

## Executive Summary

| Metric | Count |
|--------|-------|
| Operations audited | 9 |
| Fully implemented (✅) | 1 |
| Partially implemented (⚠️) | 4 |
| Not implemented (❌) | 4 |

**Critical findings:**
1. No dedicated single-invoice **Create** endpoint — invoices are only created in batch via `generateInvoices()`.
2. **Void** and **Reverse** operations have no invoice-level implementation.
3. **Export** (CSV/Excel) is absent; only JSON/ZIP batch download exists.
4. **Download** frontend URL path does NOT match backend endpoint (`/downloads/invoices/` vs `/invoices/`).
5. **Project isolation** (user-scoped access) is not enforced on any invoice mutation — the `UserAccessService.requireProjectAccess()` is never called.
6. **@Audit() decorator** is not used on any billing controller method; the global AuditInterceptor fires but records `resource: 'unknown'`.
7. No **unit tests** exist for billing services; only integration/contract tests are present.

---

## 1. Schema Analysis

### Invoice Model (`Invoice`)
| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID (PK) | Auto-generated |
| `invoiceNumber` | String (unique) | Auto-generated: `{UTL}-{YEAR}-{SEQ}` |
| `projectId` | String | FK to projects |
| `customerId` | String | No FK constraint |
| `unitId` | String | No FK constraint |
| `meterId` | String | No FK constraint |
| `utilityType` | UtilityType enum | electricity, water, solar, gas, chilled_water, outdoor_unit, settlement |
| `billingPeriodId` | String | FK to billing_periods |
| `status` | InvoiceStatus enum | `draft`, `pending_approval`, `issued`, `partially_paid`, `paid`, `overdue`, `cancelled` |
| `subtotalAmount` | Decimal(12,3) | |
| `taxAmount` | Decimal(12,3) | |
| `totalAmount` | Decimal(12,3) | |
| `paidAmount` | Decimal(12,3) | Default 0 |
| `remainingAmount` | Decimal(12,3) | |
| `balanceBefore` | Decimal(12,3)? | Optional |
| `balanceAfter` | Decimal(12,3)? | Optional |
| `issuedAt` | DateTime? | Set on issue |
| `dueAt` | DateTime? | |
| `immutableAt` | DateTime? | Set on issue (immutability marker) |
| `createdAt` | DateTime | Auto |

### InvoiceLine Model
| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID (PK) | |
| `invoiceId` | String | FK to invoices |
| `readingId` | String? | Optional link to reading |
| `description` | String | |
| `quantity` | Decimal(12,3) | |
| `unitPrice` | Decimal(12,3) | |
| `lineAmount` | Decimal(12,3) | |
| `chargeGroup` | Int? | 0=consumption, 1=administration, etc. |

### InvoiceStatus Enum
```
draft -> pending_approval -> issued -> (partially_paid | paid | overdue) -> cancelled
```

---

## 2. Operations Audit Table

### Legend
| Column | Meaning |
|--------|---------|
| **Frontend** | Y/N + file where UI exists |
| **Backend** | Y/N + controller.method |
| **Connected** | Does frontend actually call the backend endpoint? |
| **Roles** | Is `@Roles()` guard present on the endpoint? |
| **Project Isolation** | Is `projectId` validated against user's accessible projects? |
| **Audit** | Is an audit trail created? |
| **Test** | Does a test exist for this operation? |
| **Status** | ✅ = fully implemented, ⚠️ = partial, ❌ = missing |

---

| Operation | Frontend | Backend | Connected | Roles | Project Isolation | Audit | Test | Status |
|-----------|----------|---------|-----------|-------|-------------------|-------|------|--------|
| **Create** | Y — `InvoicesPage.tsx:135` (toast stub only) | N — No dedicated endpoint. Batch-only via `BillingController.generateInvoices()` | N — Toast stub, no API call | N/A | N/A | N/A | N/A | ❌ |
| **Generate** | Y — `InvoicesPage.tsx:135` (toast stub `toast.info('Create Invoice dialog would open')`) | Y — `BillingController.generateInvoices()` `POST /invoices/generate` (line 46) | N — Toast only, never calls `/invoices/generate` | ✅ `@Roles(OPERATOR, ADMIN, SUPER_ADMIN, FINANCE)` | ⚠️ — Checks `project` exists (line 63), but never calls `UserAccessService.requireProjectAccess()` | ⚠️ — Global AuditInterceptor fires (resource='unknown') | ✅ — `invoice-generate.contract.spec.ts` (129 lines) | ⚠️ |
| **Approve/Issue** | Y — `InvoicesPage.tsx:114` and `InvoiceDetailPage.tsx:59` via `useIssueInvoice()` hook | Y — `BillingController.issueInvoice()` `POST /invoices/:id/issue` (line 163) | ✅ — `apiPost('/invoices/${id}/issue')` → backend | ✅ `@Roles(OPERATOR, ADMIN, SUPER_ADMIN, FINANCE)` | ❌ — No projectId validation at all in this endpoint | ⚠️ — Global AuditInterceptor fires (resource='unknown') | ✅ — `invoice-issue.contract.spec.ts` (109 lines) + `invoice-immutability.spec.ts` (72 lines) | ⚠️ |
| **Post** | N — No UI found | Y — `BillCycleController.post()` `POST bill-cycle/:id/post` (line 138) | N — No frontend | ✅ `@Roles(ADMIN, SUPER_ADMIN)` | ❌ — Only checks cycle status, no projectId | ✅ — Manual `billingCycleAudit.create()` (line 149) | N — No test | ⚠️ |
| **Cancel** | Y — `InvoicesPage.tsx:51-58` via `apiPost()` + `InvoiceDetailPage.tsx:63-65` (cancel button) | Y — `BillingController.cancelInvoice()` `POST /invoices/:id/cancel` (line 211) | ✅ — `apiPost('/invoices/${selectedInvoice.id}/cancel')` → backend | ✅ `@Roles(OPERATOR, ADMIN, SUPER_ADMIN)` | ❌ — No projectId validation | ⚠️ — Global AuditInterceptor fires (resource='unknown') | N — No cancel-specific test | ⚠️ |
| **Reverse** | N — No UI | N — No invoice-level reverse endpoint. Payment reverse exists at `PaymentsController.reverse()` `POST /payments/:id/reverse` | N | N/A | N/A | N/A | N — Payment reverse tested (`payment-reversal.spec.ts` + `payments.contract.spec.ts`) but not invoice reverse | ❌ |
| **Void** | N — No UI | N — No void endpoint exists | N | N/A | N/A | N/A | N — No test | ❌ |
| **Export** | N — No export UI (CSV/Excel) | N — No export endpoint. Only `batchDownload()` produces JSON/ZIP | N | N/A | N/A | N/A | N — No test | ❌ |
| **Download** | Y — `InvoicesPage.tsx:119` and `InvoiceDetailPage.tsx:62` via `downloadFile(url)` | Y — `InvoicesController.downloadPdf()` `GET /invoices/:id/pdf` (line 25) | ⚠️ — URL **MISMATCH**: frontend calls `http://localhost:3001/api/v1/downloads/invoices/${id}/pdf` but backend serves at `GET /api/v1/invoices/:id/pdf`. Path segment `downloads/` does not match. | ✅ `@Roles(OPERATOR, ADMIN, SUPER_ADMIN, FINANCE)` | ❌ — `downloadPdf()` does not check project access | ❌ — GET requests are skipped by global AuditInterceptor | N — No test | ⚠️ |

---

## 3. Detailed Findings per Operation

### 3.1 Create (Manual Invoice)
- **Frontend evidence:** `InvoicesPage.tsx` line 135:  
  `<Button className="gap-2" onClick={() => toast.info('Create Invoice dialog would open')}>`
- **Backend evidence:** No `POST /invoices` endpoint exists. The only way to create invoices is via `POST /invoices/generate` (bulk generation).
- **Gap:** No mechanism to create a single manual/custom invoice.
- **Severity:** MEDIUM — Required for ad-hoc billing corrections.

### 3.2 Generate (Batch)
- **Frontend evidence:** `InvoicesPage.tsx` line 135 — button shows toast only, no API call wired up.
- **Backend evidence:** `BillingController.generateInvoices()` lines 46–161:
  - Accepts `projectId`, `billingPeriodId`, optional `customerIds[]`
  - Looks up meters, readings, existing invoices per project+period
  - Skips meters with zero consumption
  - Uses `TariffEngineService.calculateCharges()` with fallback to flat rate
  - Creates `Invoice` + `InvoiceLine` records
  - Applies `WaterDifferencePolicy` for water mains
  - Returns `{ batchId, generatedCount }`
- **Gap:** Frontend is not wired; no project access guard; no `@Audit()` decorator.
- **Severity:** HIGH — Core billing workflow blocked on frontend.

### 3.3 Approve/Issue
- **Frontend evidence:** `InvoicesPage.tsx` line 114 — `issueMutation.mutate(row.id)` via `useIssueInvoice()` hook → `apiPost('/invoices/${id}/issue')`.
  `InvoiceDetailPage.tsx` line 59 — same mutation.
- **Backend evidence:** `BillingController.issueInvoice()` lines 163–192:
  - Checks invoice exists and status is `draft`
  - If total > 10,000, returns `approval_required`
  - Sets `status: 'issued'`, `issuedAt: now`, `immutableAt: now`
  - Posts ledger entry via `ledgerService.addEntry()` with `entryType: 'invoice_charge'`
- **Gap:** No project access isolation check; threshold of 10,000 is hardcoded.
- **Severity:** LOW — Functionally complete.

### 3.4 Post (Bill Cycle)
- **Frontend evidence:** No UI found. The bill-cycle workflow is backoffice-only.
- **Backend evidence:** `BillCycleController.post()` lines 138–153:
  - Requires cycle status `APPROVED`
  - Sets status to `CLOSED`
  - Creates manual audit entry in `billingCycleAudit`
- **Gap:** No frontend; requires cycle to be APPROVED first (via generate endpoint).
- **Severity:** LOW — Backoffice-only operation is acceptable.

### 3.5 Cancel
- **Frontend evidence:** `InvoicesPage.tsx` lines 51–58 — `apiPost('/invoices/${selectedInvoice.id}/cancel')`.
  `InvoiceDetailPage.tsx` line 63-65 — cancel button (shows toast only, not wired to API).
- **Backend evidence:** `BillingController.cancelInvoice()` lines 211–227:
  - Checks invoice exists
  - Rejects if already `cancelled` or `paid`
  - Sets `status: 'cancelled'`, `immutableAt: now`
- **Gap:** Detail page cancel button not wired to actual API (only shows toast). No project isolation.
- **Severity:** MEDIUM — Detail page button is broken.

### 3.6 Reverse
- **Frontend evidence:** No reverse-invoice UI.
- **Backend evidence:** No invoice-level reverse endpoint. Payment reversal exists at `PaymentsController.reverse()`.
  - The `customerLedgerEntry` schema defines `payment_reversal` entry type, but no invoice reversal logic.
- **Gap:** Missing entirely.
- **Severity:** HIGH — Required for accounting corrections.

### 3.7 Void
- **Frontend evidence:** No void UI.
- **Backend evidence:** No void endpoint. Invoice status enum does not include `voided`.
- **Gap:** Missing entirely. Cancellation is the only way to nullify an invoice.
- **Severity:** MEDIUM — Cancel can serve as void for draft invoices, but issued invoices cannot be voided.

### 3.8 Export
- **Frontend evidence:** No CSV/Excel export button.
- **Backend evidence:** Only `batchDownload()` at `POST /invoices/batch-download` which exports JSON inside ZIP. No CSV/XLSX export.
- **Gap:** Missing entirely.
- **Severity:** MEDIUM — Required for finance team workflows.

### 3.9 Download (PDF)
- **Frontend evidence:** `InvoicesPage.tsx` line 119 and `InvoiceDetailPage.tsx` line 62:
  ```typescript
  downloadFile(`http://localhost:3001/api/v1/downloads/invoices/${row.id}/pdf`, `invoice-${row.invoiceNumber}.pdf`)
  ```
- **Backend evidence:** `InvoicesController.downloadPdf()` at `GET /invoices/:id/pdf` (mapped to `/api/v1/invoices/:id/pdf`).
  - Fetches invoice, lines, project, meter, billing period, customer, readings, tariff
  - Builds `InvoiceDocument` object
  - Uses `InvoiceTemplateService.generatePdf()` with Puppeteer/pdfkit fallback
  - Returns `StreamableFile` with `application/pdf`
- **Gap:** **Critical URL mismatch** — Frontend calls `/downloads/invoices/:id/pdf` but backend serves at `/invoices/:id/pdf`. This will result in a 404 error when downloading.
- **Severity:** CRITICAL — PDF download is broken in production.

---

## 4. Cross-Cutting Concerns

### 4.1 Authentication / Authorization
- **Guard:** `GlobalAuthGuard` + `RolesGuard` on `InvoicesController`; `AuthGuard('jwt')` + `RolesGuard` on `BillingController`.
- **Roles enum:** `Role.OPERATOR`, `Role.ADMIN`, `Role.SUPER_ADMIN`, `Role.FINANCE`, `Role.SUPPORT`.
- **Finding:** All mutation endpoints have `@Roles()` decorators. ✅

### 4.2 Project Isolation
- `UserAccessService` exists with `requireProjectAccess()` method but is **never called** in any billing endpoint.
- `InvoicesController` uses `UserAccessService.resolveAccess()` only in `batchDownload()`.
- **Severity:** HIGH — Users may access invoices from projects they are not assigned to.

### 4.3 Audit Trail
- `AuditModule` is registered globally with `AuditInterceptor` as `APP_INTERCEPTOR`.
- The interceptor captures all POST/PUT/PATCH/DELETE requests with: actorId, actorRole, action (HTTP method), resourceType (`'unknown'` when no `@Audit()` decorator), resourceId, before/after state snapshots, correlationId.
- **Finding:** The `@Audit()` decorator is **not used** on any `BillingController` method. It IS used on `PaymentsController`, `CustomersController`, `MetersController`, `ReadingsController`, `SimCardsController`, `ProjectsController`, and `LocationsController`.
- `BillCycleController` uses manual `billingCycleAudit.create()` calls instead.
- **Severity:** MEDIUM — Audit logs exist but lack semantic resource/action metadata for billing operations.

### 4.4 Tests
| Test File | Type | Lines | Status |
|-----------|------|-------|--------|
| `invoice-generate.contract.spec.ts` | Contract | 129 | ✅ |
| `invoice-issue.contract.spec.ts` | Contract | 109 | ✅ |
| `invoice-adjustment.contract.spec.ts` | Contract | 138 | ✅ |
| `invoice-immutability.spec.ts` | Integration | 72 | ✅ |
| `payment-allocation.spec.ts` | Integration | 68 | ⚠️ (mostly schema checks) |
| `payment-reversal.spec.ts` | Integration | 64 | ⚠️ (mostly schema checks) |
| `payments.contract.spec.ts` | Contract | 150 | ✅ |

**Gap:** No unit tests for `BillingController`, `LedgerService`, `TariffEngineService`, `CalculationEngineService`. No tests for cancel, post, download, or export operations.

---

## 5. Invoice State Machine (Actual vs Schema)

```
Prisma Enum: draft -> pending_approval -> issued -> (partially_paid | paid | overdue) -> cancelled

Implemented:
  draft ──issue()──> issued ──payment()──> partially_paid ──payment()──> paid
   │                    │
   └──cancel()──> cancelled   (only if draft)
   
Not Implemented:
  draft ──> pending_approval  (threshold > 10,000 returns 'approval_required' but no workflow)
  overdue  (no overdue detection logic)
  void     (no void status or endpoint)
  reverse  (no invoice reversal)
```

---

## 6. Recommendations (Priority Order)

1. **[CRITICAL]** Fix download URL path — change frontend from `/downloads/invoices/` to `/invoices/`.
2. **[HIGH]** Wire frontend Generate button to `POST /invoices/generate`.
3. **[HIGH]** Add `UserAccessService.requireProjectAccess()` to all billing mutation endpoints.
4. **[HIGH]** Add invoice reverse endpoint (financial correction).
5. **[MEDIUM]** Add `@Audit('invoice', '<action>')` decorator to all `BillingController` mutation methods.
6. **[MEDIUM]** Add CSV/Excel export endpoint for invoices.
7. **[MEDIUM]** Add unit tests for billing service layer.
8. **[MEDIUM]** Add cancel and post operation tests.
9. **[LOW]** Fix InvoiceDetailPage cancel button to call actual API.
10. **[LOW]** Implement pending_approval → approval workflow for high-value invoices.

---

## 7. File Reference Index

| File | Path |
|------|------|
| Invoices Controller | `D:\meter\Meter\backend\src\invoices\invoices.controller.ts` |
| Billing Controller | `D:\meter\Meter\backend\src\billing\billing.controller.ts` |
| Billing Module | `D:\meter\Meter\backend\src\billing\billing.module.ts` |
| Bill Cycle Controller | `D:\meter\Meter\backend\src\bill-cycle\bill-cycle.controller.ts` |
| Calculation Engine | `D:\meter\Meter\backend\src\billing\calculation-engine.service.ts` |
| Tariff Engine Service | `D:\meter\Meter\backend\src\billing\tariff-engine.service.ts` |
| Ledger Service | `D:\meter\Meter\backend\src\billing\ledger.service.ts` |
| User Access Service | `D:\meter\Meter\backend\src\auth\user-access.service.ts` |
| Audit Interceptor | `D:\meter\Meter\backend\src\audit\audit.interceptor.ts` |
| Audit Decorator | `D:\meter\Meter\backend\src\audit\audit.decorator.ts` |
| Prisma Schema | `D:\meter\Meter\backend\prisma\schema.prisma` |
| Invoices Page (Frontend) | `D:\meter\Meter\Frontend\src\components\billing\InvoicesPage.tsx` |
| Invoice Detail Page (Frontend) | `D:\meter\Meter\Frontend\src\components\billing\InvoiceDetailPage.tsx` |
| Payments Page (Frontend) | `D:\meter\Meter\Frontend\src\components\billing\PaymentsPage.tsx` |
| use-invoices hook | `D:\meter\Meter\Frontend\src\hooks\use-invoices.ts` |
| use-payments hook | `D:\meter\Meter\Frontend\src\hooks\use-payments.ts` |
| Download utility | `D:\meter\Meter\Frontend\src\lib\download.ts` |
| Invoice Generate Contract Test | `D:\meter\Meter\backend\test\contract\invoice-generate.contract.spec.ts` |
| Invoice Issue Contract Test | `D:\meter\Meter\backend\test\contract\invoice-issue.contract.spec.ts` |
| Invoice Adjustment Contract Test | `D:\meter\Meter\backend\test\contract\invoice-adjustment.contract.spec.ts` |
| Invoice Immutability Test | `D:\meter\Meter\backend\test\integration\invoice-immutability.spec.ts` |
| Payment Allocation Test | `D:\meter\Meter\backend\test\integration\payment-allocation.spec.ts` |
| Payment Reversal Test | `D:\meter\Meter\backend\test\integration\payment-reversal.spec.ts` |
| Payments Contract Test | `D:\meter\Meter\backend\test\contract\payments.contract.spec.ts` |

---

*Report generated by Principal Billing Systems Expert — Audit scope: 9 operations, 24 source files reviewed.*
