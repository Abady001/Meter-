# METER VERSE — BILLING ENGINE VALIDATION AUDIT

**Date:** 2026-06-25
**Auditor:** Principal QA Architect & Security Engineer
**Scope:** `backend/src/billing/`, `backend/src/bill-cycle/`, `backend/src/invoices/`, `backend/prisma/schema.prisma`

---

## 1. What Billing Lifecycle Is Implemented?

### Implemented Steps:

```
TARIFF → READING → CONSUMPTION → INVOICE → PAYMENT → LEDGER
```

| Step | Implementation | Details |
|------|---------------|---------|
| **TARIFF** | `TariffEngineService`, `TariffCalculationService`, `TariffService` | Two tariff systems: (a) Legacy `TariffPlan` model (flat rate per unit), (b) New `Tariff`/`TariffVersion`/`TariffCharge`/`TariffChargeDetail` model with 5 charge modes: FLAT, STEPS, PER_UNIT, STATIC, ZERO |
| **READING** | `ReadingsController`, `ReadingsService` | CRUD readings with validation; statuses: valid, pending_review, estimated, suspicious, corrected, rejected |
| **CONSUMPTION** | `ReadingsService` (inline calculation) | `consumptionValue` calculated as `currentReading - previousReading` during reading creation |
| **INVOICE** | `BillingController.generateInvoices`, `BillCycleController` | Generates draft invoices from readings + tariffs; supports `InvoiceLine`, `InvoiceAdjustment`, status workflow (draft → issued → paid/overdue/cancelled) |
| **PAYMENT** | `BillingController.createPayment` | Records payment with `oldest_due_first` or explicit allocation; creates `PaymentAllocation` records |
| **LEDGER** | `LedgerService` | Append-only `CustomerLedgerEntry` with `runningBalance` tracking; entry types: `invoice_charge`, `adjustment_debit`, `adjustment_credit`, `payment_credit`, `payment_reversal` |

### Additional Components:

| Component | Purpose | Status |
|-----------|---------|--------|
| `WaterDifferencePolicy` | Handles water main-vs-sub-meter variance (billable / report_only) | ✅ Implemented |
| `CalculationEngineService` | Generic calculation with tiers, fixed charges, percentage charges | ✅ Implemented |
| `PeriodService` | Billing period CRUD with overlap detection | ✅ Implemented |
| `BillCycleController` | Full bill cycle lifecycle (OPEN → LOCKED → APPROVED → CLOSED → CANCELLED) | ✅ Implemented |
| `InvoiceTemplateService` | PDF generation via Puppeteer/PDFKit with 7 utility-specific templates | ✅ Implemented |
| `InvoiceHash` / `InvoiceQRCode` models | Invoice integrity and QR code support | ✅ Models exist |
| `InvoiceGenerationBatch` | Tracks batch invoice generation | ✅ Model exists |
| `ChilledWaterModule` | Separate billing for chilled water (configs, readings, invoices, allocations) | ✅ Implemented |

---

## 2. What Is Missing from the Lifecycle?

### Critical Gaps:

| Missing Component | Impact | Priority |
|-------------------|--------|----------|
| **Scheduled bill runs** (cron jobs) | `ScheduledJob` model exists but no scheduler implementation. No `node-cron` or task scheduler wired to run billing automatically. | **HIGH** |
| **Late fee / penalty engine** | `AreaLateFee` model exists but no service or controller for late fee calculation and application. | **MEDIUM** |
| **Aging analysis engine** | Aging buckets defined in `balances` translation but no backend aging computation. | **MEDIUM** |
| **Payment reversal with ledger correction** | Payment reversal endpoint exists (`POST /payments/:id/reverse`) but the ledger correction logic is in `BillingController` only for the `createPayment` path. | **MEDIUM** |
| **Invoice immutability enforcement** | `immutableAt` field exists on Invoice but no middleware/guard prevents modification of immutable invoices. `InvoiceAdjustment` can modify totals regardless. | **MEDIUM** |
| **Invoice approval workflow** | `InvoiceStatus.pending_approval` is defined but no approval routing is implemented. Invoices > 10,000 EGP return `approval_required` string instead of creating an approval task. | **MEDIUM** |
| **Multi-currency support** | `currency` field exists on `TariffPlan` but all calculations hardcode EGP. | **LOW** |
| **Prepaid / wallet billing integration** | Solar wallet system exists but not integrated with the main billing flow. | **LOW** |
| **Tax engine (beyond simple percentage)** | Only flat `taxRate` from project settings. No support for multiple tax lines, exemptions, or VAT rules. | **LOW** |
| **Refund engine** | `AreaRefund` model exists but no service/controller for processing refunds. | **LOW** |
| **Credit note workflow** | `InvoiceAdjustment` supports credit/debit but no formal credit note document lifecycle. | **LOW** |
| **Collection engine** | `AreaCollectionAction` model exists; no automated collection triggers or Dunning letters. | **LOW** |
| **Payment plan processing** | `AreaPaymentPlan` model exists; no installment processing logic. | **LOW** |
| **Dispute management** | `AreaDispute` model exists; no dispute workflow in billing controllers. | **LOW** |

---

## 3. Can Invoices Be Generated? (Endpoint + Frontend)

### Backend Endpoints:

| Endpoint | Method | Status | Description |
|----------|--------|--------|-------------|
| `POST /api/v1/invoices/generate` | POST | ✅ Implemented | Generates invoices for a project + billing period. Accepts `projectId`, `billingPeriodId`, optional `customerIds[]` |
| `POST /api/v1/bill-cycle/:id/generate` | POST | ✅ Implemented | Bill cycle orchestration: finds/creates billing period, generates invoices, updates cycle status to APPROVED |
| `POST /api/v1/invoices/:id/issue` | POST | ✅ Implemented | Transitions invoice from `draft` → `issued`, creates ledger entry, enforces approval for >10,000 EGP |
| `POST /api/v1/invoices/:id/cancel` | POST | ✅ Implemented | Cancels invoice (cannot cancel paid invoices) |
| `POST /api/v1/invoices/:id/adjustments` | POST | ✅ Implemented | Adds credit/debit adjustment to invoice |
| `GET /api/v1/invoices/:id/pdf` | GET | ✅ Implemented | Downloads PDF via Puppeteer or PDFKit fallback |
| `GET /api/v1/invoices` | GET | ✅ Implemented | Lists invoices with optional `projectId`, `customerId`, `status` filters |
| `POST /api/v1/invoices/batch-download` | POST | ✅ Implemented | Batch ZIP download of invoices |

### Invoice Generation Logic (`BillingController.generateInvoices`):
1. Look up `BillingPeriod` by ID or `periodCode`
2. Look up project for tax rate and water difference mode
3. Fetch all non-retired meters for the project
4. Fetch valid readings in the period
5. Skip meters that already have invoices
6. Skip meters with zero consumption
7. Calculate charges via `TariffEngineService.calculateCharges()` or flat rate fallback
8. Create invoice with line items
9. Apply water difference variance if `water_main` meter
10. Return `{ batchId, generatedCount }`

### Frontend:
- `InvoicesPage.tsx` — Invoice list with status badges, actions (Issue, Download PDF, Adjust, Cancel)
- `InvoiceDetailPage.tsx` — Invoice detail view with line items, issue/cancel actions
- Both pages use `useT()` for UI labels and call backend APIs
- No dedicated "Generate Invoices" UI component found — likely accessed via a button in the invoices page or bill cycle page

**Verdict: Yes, invoices can be generated via both the billing controller and bill cycle controller. The frontend has invoice management pages but the trigger for batch generation may only exist in the backend API.**

---

## 4. Are Tariffs Properly Implemented?

### Two-Level Tariff System:

#### Level 1: Legacy `TariffPlan` (sim_system schema)
- Simple flat-rate per unit: `ratePerUnit * consumption`
- Associated with a `Project` + `MeterType`
- Used as fallback when the new tariff engine fails

#### Level 2: New `Tariff` (features schema)
- `Tariff` — Master tariff record with `utilityType`, effective dates, status
- `TariffVersion` — Version history with approvals
- `TariffCharge` — Individual charge components with 5 modes:
  - **FLAT** — Fixed amount
  - **PER_UNIT** — Rate × consumption
  - **STEPS** — Tiered pricing (from→to→rate)
  - **STATIC** — Static charge
  - **ZERO** — Minimum charge when consumption = 0
- `TariffChargeDetail` — Step definitions for STEPS mode

### Tariff Engine (`TariffEngineService.calculateCharges`):
1. Finds active tariff for `utilityType` and `effectiveDate`
2. Falls back to `TariffPlan` if no new tariff found
3. Loads charges with their step details
4. Groups charges by mode and calculates amounts
5. Applies minimum/maximum charge rules
6. Returns `{ lines, total }` for use in invoice generation

### Tariff Calculation Service (`TariffCalculationService`):
- More detailed calculation with 7 charge groups (0-6)
- Arabic descriptions (`descriptionAr`) for bilingual invoices
- Percentage charge support
- Settlement amount support

### Simulation:
- `POST /api/v1/tariffs/simulate` — Simulates tariff calculation with given consumption, returns breakdown + VAT

### Issues:
1. **Two parallel tariff systems** — creates confusion and potential inconsistency
2. **No UI for tariff versioning** — `TariffStudioPage.tsx` exists but may not support versioning
3. **Static mapping** of charge modes to charge groups in `TariffEngineService.chargeModeToGroup()` — hardcoded mapping may not fit all business scenarios
4. **No project-level tariff assignment** — tariffs are not explicitly linked to projects; they are found by `utilityType`
5. **`TariffCharge.settlementType` is used as charge group classifier** — FIXED → group 4, PERCENTAGE → group 5; this overloads the settlement concept

---

## 5. Is Bill Run Scheduling Implemented?

### Scheduling Status:

| Feature | Status | Details |
|---------|--------|---------|
| Bill cycle creation | ✅ Manual | `POST /api/v1/bill-cycle` creates a cycle with month/year/utility |
| Bill cycle lifecycle | ✅ Manual | OPEN → LOCKED → APPROVED → CLOSED via controller endpoints |
| Invoice generation trigger | ✅ Manual | Must POST to `/:id/generate` — no automatic trigger |
| Scheduled/cron jobs | ❌ NOT IMPLEMENTED | `ScheduledJob` model exists in Prisma schema but no scheduler service |
| Cron expressions | ❌ NOT IMPLEMENTED | `cronExpression` field on `ScheduledJob` is defined but no cron engine runs |
| Automatic period creation | ❌ NOT IMPLEMENTED | Billing periods must be created manually |
| Retry logic | ❌ NOT IMPLEMENTED | No failed-generation retry mechanism |

**Verdict: Bill run scheduling is NOT implemented. All billing operations are manual/on-demand.**

### What Would Be Needed:
1. A `SchedulerService` using `node-cron` or `@nestjs/schedule`
2. A job runner that processes `ScheduledJob` records
3. Auto-creation of billing periods based on schedule
4. Automatic invoice generation when period ends
5. Notification/alert on job completion or failure
6. The `RunningActivity` model could track progress

---

## 6. What Billing Rules Are Validated?

### Implemented Validations:

| Rule | Location | Implementation |
|------|----------|----------------|
| **Duplicate invoice prevention** | `BillingController.generateInvoices` (line 82-86) | Skips meters that already have invoices for the same billing period |
| **Zero consumption skip** | `BillingController.generateInvoices` (line 93) | `if (consumption <= 0) continue;` — no invoice for zero consumption |
| **Overlapping billing periods** | `PeriodService.createPeriod` (line 22-29) | Rejects creation of overlapping periods for the same project |
| **Overlapping tariff windows** | `TariffService.validateNonOverlap` (line 24-41) | Rejects overlapping tariff effective dates for same project/meterType |
| **Non-retired meters only** | `BillingController.generateInvoices` (line 71) | Filters out retired meters |
| **Valid readings only** | `BillingController.generateInvoices` (line 77) | Only readings with `status: 'valid'` are used |
| **Invoice issue guard** | `BillingController.issueInvoice` (line 170-173) | Cannot issue already-issued invoices; requires approval for >10,000 EGP |
| **Paid invoice cancel guard** | `BillingController.cancelInvoice` (line 219) | Cannot cancel paid invoices |
| **Allocation match check** | `BillingController.createPayment` (line 295-301) | Explicit allocation totals must equal payment amount |
| **Duplicate reading prevention** | `ReadingsService` | Unique constraint on `(meterId, readingAt, source)` prevents duplicate readings |
| **Reading status validation** | `ReadingsService` | Readings with suspicious/negative/zero values flagged for review queue |
| **Water balance variance calculation** | `WaterBalanceService` | Compares main meter vs sub-meter total consumption |
| **Oldest-due-first allocation** | `BillingController.createPayment` (line 321-356) | Default payment allocation strategy |
| **Invoice hash chain** | `InvoiceHash` model | Exists for integrity but no validation logic found in controllers |

### Missing Validations:

| Missing Rule | Risk | Priority |
|-------------|------|----------|
| **No customer balance check** before generating invoice (no credit limit enforcement) | May generate invoices for customers over limit | MEDIUM |
| **No meter reading continuity check** (gaps in readings) | Consumption may be inaccurate | MEDIUM |
| **No validation of READINGS against tariff effective dates** | May use readings from outside tariff window | LOW |
| **No duplicate payment check** (same reference number) | Duplicate payments possible | MEDIUM |
| **No invoice lifecycle state machine** — status transitions are checked ad-hoc | Inconsistent state transitions possible | MEDIUM |
| **No tax rule validation** — flat tax rate with no exemptions | Tax calculation may be incorrect | LOW |
| **No minimum invoice amount check** | Zero-value invoices possible (currently skipped via consumption check) | LOW |
| **No validation of `customerId` on invoice generation** | Hardcoded to `'system'` when no `customerIds[]` provided | **HIGH** |
| **No unit ID validation** | Hardcoded to `'system'` for unit | **HIGH** |
| **No `dueAt` auto-calculation** | Due date must be set via `PATCH /invoices/:id` | MEDIUM |

---

## Overall Billing Engine Maturity

| Dimension | Score (1-10) | Notes |
|-----------|-------------|-------|
| Invoice generation | 8/10 | Functional but lacks customer/unit assignment |
| Tariff management | 7/10 | Two systems, but feature-rich charging modes |
| Payment processing | 6/10 | Basic allocation works; no gateway integration |
| Ledger tracking | 8/10 | Append-only with running balance |
| Bill cycle orchestration | 6/10 | State machine exists but no automation |
| PDF generation | 7/10 | Puppeteer-based with bilingual templates |
| Validation & rules | 5/10 | Basic validations present; many gaps remain |
| Scheduling & automation | 2/10 | Manual-only; no cron or scheduler |
| Late fees / penalties | 1/10 | Model exists but no implementation |
| Multi-utility support | 8/10 | 7 utility types with template configs |

**Overall Maturity Score: 5.8/10 — Functional but incomplete. Core billing loop works; edge cases, automation, and financial controls need development.**
