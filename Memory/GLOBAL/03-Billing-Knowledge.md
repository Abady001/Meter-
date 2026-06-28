# Meter Verse — Billing Domain Knowledge

## Overview

The billing engine generates utility invoices from meter readings using tariff structures. It supports multiple utility types (electricity, water, solar, gas, chilled water) with tiered/TOU/flat pricing, VAT, settlement adjustments, and wallet integration.

**sBill parity**: Currently at ~68% — charge group mapping, TOU, and advanced settlement rules still diverging.

---

## Bill Cycle Lifecycle

```
CREATE → START → GENERATE → POST → CANCEL
```

| Phase | Action | Status | Description |
|-------|--------|--------|-------------|
| CREATE | `POST /billing/periods` | open | Create a billing period with start/end dates. Overlap detection prevents concurrent periods. |
| START | N/A (auto) | open | Period is active; readings accumulate. |
| GENERATE | `POST /billing/invoices/generate` → 202 | draft | Consumption calculation → tariff engine → invoice lines → invoice creation |
| POST | `POST /billing/invoices/:id/issue` → 200 | issued | Invoice moves from draft to issued; ledger entry created; PDF generated; due date set |
| APPROVE | Manual (if > 10,000 EGP) | pending_approval → issued | Invoices above threshold require approval before issue |
| CANCEL | `POST /billing/invoices/:id/cancel` → 200 | cancelled | Invoice lifecycle ended; no financial impact reversal |
| VOID | `POST /billing/invoices/:id/void` → 200 | void | High-privilege operation; only draft/issued invoices with no payments can be voided |
| REVERSE | `POST /billing/invoices/:id/reverse` → 200 | cancelled | Reverses paid/invoice; creates reversal ledger entry |

### Invoice State Machine

```
draft → pending_approval → issued → partially_paid → paid
  ↓         ↓                ↓          ↓               ↓
  (cancel/void)             (cancel)   (cancel)        (cancel → reverse)
```

Allowed transitions (from `BillingStateService`):
- draft → pending_approval, issued, cancelled, void
- pending_approval → issued, cancelled
- issued → partially_paid, paid, cancelled, void
- partially_paid → paid, cancelled
- paid → cancelled (via reverse)
- overdue → partially_paid, paid, cancelled
- cancelled → (none)
- void → (none)

---

## Invoice Generation

### Trigger
`POST /api/v1/billing/invoices/generate`

### Payload
```json
{
  "projectId": "uuid",
  "billingPeriodId": "uuid",
  "customerIds": ["uuid"]  // optional — limits generation to specific customers
}
```

### Algorithm
1. Load billing period and project (with tax rate and water difference mode)
2. Fetch all non-retired meters for the project
3. Fetch all valid readings in the billing period for the project
4. Find existing invoices in period to skip already-billed meters
5. For each meter without an invoice:
   a. Calculate consumption = sum of consumptionValue from readings
   b. Skip if consumption <= 0
   c. Run TariffEngineService.calculateCharges() for full charge breakdown
   d. If tariff engine fails, fall back to flat-rate TariffPlan
   e. Calculate tax = subtotal * taxRate
   f. Generate invoice number: `{PREFIX}-{YEAR}-{SEQUENCE}` (8-digit zero-padded)
   g. Create Invoice record
   h. Create InvoiceLine records from charge lines
   i. Apply WaterDifferencePolicy if applicable (water_main meters with billable mode)

### Invoice Number Format
- `ELE-2026-00000001` (electricity)
- `WTR-2026-00000001` (water)
- `UTL-2026-00000001` (other utilities)

---

## Invoice Templates (JRXML + HTML)

### Legacy Templates (JRXML)
58 legacy JRXML templates exist in `backend/src/invoices/assets/draft/`. These are JasperReports format from the legacy sBill system. **NOT actively used** in Meter Verse v2.

### Active HTML Templates (NestJS Puppeteer)
3 active HTML templates in `backend/src/invoices/`:

| Template | Path | Purpose |
|----------|------|---------|
| Invoice Standard | `invoice-template.html` | Standard utility invoice (RTL Arabic) |
| Solar Invoice | `invoice-solar-template.html` | Solar net-metering invoice with import/export |
| Settlement Invoice | `invoice-settlement-template.html` | Settlement/credit note |

**CSS**: Shared `invoice-template.css`

**Rendering**: `InvoiceRendererService` uses Puppeteer (Chrome) for PDF generation with fallback to pdfkit if Puppeteer unavailable.

---

## Settlement Engine

The settlement module handles post-billing adjustments and period-end reconciliations.

### Endpoints
- `POST /settlement` — Create settlement adjustment invoice
- `GET /settlement` — List settlement invoices
- `POST /settlement/adjustments` — Create adjustment on settlement invoice
- `GET /settlement/adjustments` — List adjustments

### Settlement Types
- **Debit settlement**: Positive amount added to customer balance
- **Credit settlement**: Negative amount (refund/rebate) applied to customer balance

Settlement invoices use `utilityType = 'settlement'` and `invoiceNumber = 'SET-{timestamp_base36}'`.

---

## Wallet & Solar Wallet

### Wallet Service (`backend/src/wallet/wallet.service.ts`)
A digital wallet per customer that manages prepaid balances and solar credits.

| Operation | Method | Description |
|-----------|--------|-------------|
| Get/Balance | `getWallet()`, `getBalance()` | Current wallet state |
| Create | `getOrCreateWallet()` | Auto-create if not exists |
| Credit | `credit()` | Deposit funds, update balance, create DEPOSIT transaction |
| Debit | `debit()` | Withdraw funds (with insufficient-balance check), create WITHDRAWAL transaction |
| Transfer | `transfer()` | Debit source + credit destination, create TRANSFER record |
| History | `getHistory()` | Last 100 transactions |

### Solar Wallet
Meters with `solarEnabled = true` are linked to a solar wallet via `Meter.solarWalletId`. The solar wallet tracks net-metering credits where:
- **Export meter**: Measures energy exported to grid (credit)
- **Import meter**: Measures energy imported from grid (debit)
- **Generation meter**: Measures total solar generation

Solar invoices show import consumption (charged) and export credit (deducted) on separate lines.

---

## TOU (Time-of-Use) Pricing

Implemented in `TariffEngineService.calculateCharges()` via `TariffChargeMode.TOU`.

TOU charges have details where `stepFrom` = hour start (0-23), `stepTo` = hour end (0-23), `stepRate` = rate per unit during that hour.

The system looks up the current hour at the effective date (`effectiveDate.getHours()`) and finds the matching detail block. If no matching block is found, the first detail is used as fallback.

TOU support is present but has NOT been fully validated against sBill parity.

---

## Demand Charges

**NOT IMPLEMENTED**. Demand charges (based on peak consumption within a period) are not yet supported. The TariffChargeMode enum does not include a demand mode. This is a known gap vs sBill.

---

## Taxes / VAT Calculation

VAT is calculated per-project based on `Project.taxEnabled` and `Project.taxRate`.

Formula in billing controller:
```
taxRate = project.taxRate / 100  (default 14% = 0.14)
taxAmount = Math.round(subtotal * taxRate)
```

VAT is a single line at the invoice level, shown in `Invoice.taxAmount` and in the subtotal → tax → total breakdown.

---

## Discounts

Discounts can be applied via:
1. **Credit notes**: `POST /billing/credit-note` — creates a negative-amount invoice
2. **Debit notes**: `POST /billing/debit-note` — creates a positive-amount invoice
3. **Invoice adjustments**: `POST /billing/invoices/:id/adjustments` — credit or debit adjustment on existing invoice

Discounts are stored as adjustments or separate credit/debit note invoices. They flow through the ledger.

---

## Charge Groups (0-14 Mapping)

Charge groups classify invoice lines for display and reporting. From `charge-groups.ts`:

| ID | Name (English) | Name (Arabic) | Color |
|----|----------------|---------------|-------|
| 0 | Consumption | استهلاك | #000000 |
| 1 | Service Fees | رسوم خدمات | #555555 |
| 2 | Customer Service | خدمة عملاء | #666666 |
| 3 | Administrative | إداري | #777777 |
| 4 | Sustainability | استدامة | #888888 |
| 5 | Percentage | نسبة مئوية | #999999 |
| 6 | VAT | ضريبة | #AAAAAA |
| 7 | Other | أخرى | #BBBBBB |
| 8 | Solar Credit | رصيد شمسي | #FFD700 |
| 9 | Solar Carry Forward | مرحل شمسي | #FFA500 |
| 10 | Cooling Load | حمل تبريد | #00BFFF |
| 11 | Fixed Chiller | مبرد ثابت | #1E90FF |
| 12 | Settlement | تسوية | #32CD32 |
| 13 | Adjustment | تعديل | #FF6347 |
| 14 | Gas Service | خدمة غاز | #FF4500 |

Charge mode → group mapping in TariffEngineService:
- PER_UNIT / STEPS → Group 0 (Consumption)
- settlementType=PERCENTAGE → Group 5 (Percentage)
- FLAT + settlementType=FIXED → Group 4 (Sustainability/Admin)
- FLAT → Group 1 (Service Fees)
- STATIC → Group 3 (Administrative)
- Default → Group 7 (Other)

---

## Credit Notes

**IMPLEMENTED** via `POST /billing/credit-note`.

Creates an invoice with negative totalAmount, status=issued, utilityType='electricity', no unit/meter/billingPeriod. Creates a ledger entry of type `adjustment_credit`.

---

## Debit Notes

**IMPLEMENTED** via `POST /billing/debit-note`.

Creates an invoice with positive totalAmount, status=issued. Creates a ledger entry of type `adjustment_debit`.

---

## Carry Forward

**IMPLEMENTED** via `POST /billing/carry-forward`.

Reads the latest `CustomerLedgerEntry.runningBalance` and creates a new ledger entry of type `adjustment_credit` with that balance amount, linked to the next billing period. This enables balance carry-over between periods.

---

## Penalty Engine

**NOT IMPLEMENTED**. Late payment penalties, overdue fines, and disconnection fees are not yet supported. This is a known gap vs sBill.

---

## Installments

**NOT IMPLEMENTED**. Invoice installment plans (splitting large invoices into monthly payments) are not supported.

---

## sBill Parity Assessment

| Feature | Meter Verse | sBill | Parity |
|---------|-------------|-------|--------|
| Flat rate billing | ✅ | ✅ | 100% |
| Tiered/STEPS billing | ✅ | ✅ | 100% |
| Customer service fees (tiered) | ✅ | ✅ | 100% |
| Admin/issue fees | ✅ | ✅ | 100% |
| Percentage charges | ✅ | ✅ | 100% |
| VAT calculation | ✅ | ✅ | 100% |
| Invoice issue/reverse | ✅ | ✅ | 100% |
| Payment allocation (oldest due) | ✅ | ✅ | 100% |
| Ledger & running balance | ✅ | ✅ | 100% |
| Charge groups (0-13) | ✅ | ✅ | 90% |
| Settlement | ✅ | ✅ | 80% |
| Credit/Debit notes | ✅ | ✅ | 100% |
| Carry forward | ✅ | ✅ | 100% |
| TOU pricing | ⚠️ Partial | ✅ | 50% |
| Solar net-metering | ⚠️ Partial | ✅ | 60% |
| Demand charges | ❌ | ✅ | 0% |
| Penalty engine | ❌ | ✅ | 0% |
| Installments | ❌ | ✅ | 0% |
| **Overall** | | | **~68%** |

---

## Source Files

| File | Purpose |
|------|---------|
| `backend/src/billing/billing.controller.ts` | All billing endpoints (invoice gen, issue, cancel, void, reverse, credit/debit notes, carry forward, payments, periods, tariffs) |
| `backend/src/billing/billing-state.service.ts` | Invoice state machine transitions |
| `backend/src/billing/calculation-engine.service.ts` | Low-level charge calculation (legacy) |
| `backend/src/billing/tariff-engine.service.ts` | Full tariff charge calculation (STEPS/FLAT/STATIC/PER_UNIT/ZERO/TOU) |
| `backend/src/billing/tariff-calculation.service.ts` | Higher-level tariff calculation with charge group breakdown |
| `backend/src/billing/ledger.service.ts` | Append-only customer ledger entries |
| `backend/src/billing/periods/period.service.ts` | Billing period CRUD with overlap detection |
| `backend/src/billing/water-difference.policy.ts` | Water main-vs-sub variance line injection |
| `backend/src/billing/tariffs/tariff.service.ts` | TariffPlan CRUD |
| `backend/src/billing/tariff-studio.controller.ts` | Tariff management endpoints |
| `backend/src/invoices/invoice-renderer.service.ts` | PDF generation via Puppeteer/pdfkit |
| `backend/src/invoices/invoice-template.html` | Standard invoice HTML template |
| `backend/src/invoices/invoice-solar-template.html` | Solar invoice template |
| `backend/src/invoices/invoice-settlement-template.html` | Settlement invoice template |
| `backend/src/invoices/invoice-template.css` | Shared invoice CSS |
| `backend/src/invoices/charge-groups.ts` | Charge group definitions (0-14) |
| `backend/src/invoices/invoice-document.model.ts` | Invoice data model interface |
| `backend/src/settlement/settlement.controller.ts` | Settlement CRUD |
| `backend/src/wallet/wallet.service.ts` | Wallet and solar wallet operations |
| `backend/src/payments/payments.service.ts` | Payment processing with allocation |
| `backend/src/payments/payment-receipt.service.ts` | Payment receipt generation |
