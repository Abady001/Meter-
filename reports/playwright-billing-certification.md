# Playwright Billing Certification — Test Plan

## Setup

```javascript
// playwright.config.ts additions
const config = {
  projects: [
    {
      name: 'billing',
      testDir: './draft/tests/billing/',
      use: {
        baseURL: 'http://localhost:3000',
        storageState: '.auth/finance-user.json', // pre-authenticated finance role
      },
    },
  ],
};
```

Data prerequisites (seeded before suite):
- 1 project, 2 customers (one with zero balance, one with overdue), 3 meters (electricity + water_main + water_child)
- 1 billing period (open), 1 tariff plan (active), 5 readings per meter (valid)
- 3 invoices (draft/issued/paid — one each)

---

## TC-01: Invoice Create (Generate)

**Priority**: P0
**Component**: `InvoicesPage.tsx` (line 135), `billing.controller.ts` line 50

| Step | Action | Target | Expected |
|---|---|---|---|
| 1 | Navigate to `/billing/invoices` | InvoicesPage | SmartTable renders with invoice columns |
| 2 | Click "Generate" button | Button with `Plus` icon | Toast "Create Invoice dialog would open" |
| 3 | Select project + billing period | Dialog dropdowns | Form fields are editable |
| 4 | Click "Generate" submit | Submit button | `POST /invoices/generate` returns 202 |
| 5 | Wait for refetch | SmartTable | New draft invoice row appears in table |
| 6 | Click the new invoice row | Row in SmartTable | Navigates to `InvoiceDetailPage` with correct id |

**Assertions**:
- `page.getByText('invoiceNumber').isVisible()` returns true
- Status badge shows "draft"
- Total amount > 0

---

## TC-02: Invoice Edit (Due Date Change)

**Priority**: P1
**Component**: `InvoicesPage.tsx` line 35–49, `billing.controller.ts` line 194–209

| Step | Action | Target | Expected |
|---|---|---|---|
| 1 | Navigate to `/billing/invoices` | InvoicesPage | Table renders |
| 2 | Click row action menu on a draft invoice | `MoreHorizontal` icon | Dropdown opens |
| 3 | Click "Edit" | `DropdownMenuItem` with `Pencil` icon | Edit dialog opens |
| 4 | Change due date to next month | `Input[type="date"]` | Date updates |
| 5 | Click "Save" | Dialog `Button` with `Save` text | `PATCH /invoices/:id` returns updated |
| 6 | Verify toast | `sonner` toast | "Invoice updated" shown |
| 7 | Re-open invoice detail | Navigate to invoice-detail | New due date is persisted |

**Assertions**:
- `PATCH` response has `{ status: 'updated' }`
- `InvoiceDetailPage` shows new dueDate

---

## TC-03: Invoice Cancel

**Priority**: P0
**Component**: `InvoicesPage.tsx` line 51–59, `billing.controller.ts` line 211–227

| Step | Action | Target | Expected |
|---|---|---|---|
| 1 | Navigate to `/billing/invoices` | InvoicesPage | Table renders |
| 2 | Open action menu on a **draft** invoice | Row dropdown | Menu visible |
| 3 | Click "Cancel" (red text) | `DropdownMenuItem` with `XCircle` | Confirm dialog appears |
| 4 | Click "Yes, cancel invoice" | `Button variant="destructive"` | `POST /invoices/:id/cancel` |
| 5 | Verify toast | `sonner` toast | "Invoice cancelled" |
| 6 | Wait for refetch | SmartTable | Status changes to "cancelled" |
| 7 | Attempt to cancel same invoice again | Same action menu | Menu item hidden (guarded by `row.status === 'draft'`) |

**Negative test**:
- Open action menu on a **paid** invoice → Cancel button is NOT rendered
- `page.getByText('Yes, cancel invoice').click()` after "Cannot cancel paid invoice" rejection

**Assertions**:
- `POST /invoices/:id/cancel` returns `{ status: 'cancelled' }`
- Subsequent GET on invoice shows `status: 'cancelled'`
- Cancel action guarded by `ProtectedAction` with permission `invoice:cancel`

---

## TC-04: Invoice Issue

**Priority**: P1
**Component**: `InvoiceDetailPage.tsx` line 58–59, `billing.controller.ts` line 163–192

| Step | Action | Target | Expected |
|---|---|---|---|
| 1 | View a draft invoice detail | `InvoiceDetailPage` | "Issue" button visible |
| 2 | Click "Issue" | Button with `CreditCard` icon | `POST /invoices/:id/issue` called |
| 3 | Verify toast | `sonner` toast | "Invoice issued" |
| 4 | Verify status update | StatusBadge | Changes to "issued" |
| 5 | Navigate to customer detail → Ledger tab | `CustomerDetailPage` tab="ledger" | Ledger entry appears matching invoice amount |

**Assertions**:
- Ledger entry visible after issue (via `LedgerService.addEntry` called in controller line 181)
- `immutableAt` timestamp set on invoice
- Invoice with total > 10,000 returns `{ status: 'approval_required' }` (controller line 173)

---

## TC-05: Invoice Payment (from PaymentsPage)

**Priority**: P0
**Component**: `PaymentsPage.tsx` line 82–143, `billing.controller.ts` line 274–395

| Step | Action | Target | Expected |
|---|---|---|---|
| 1 | Navigate to `/billing/payments` | `PaymentsPage` | SmartTable renders |
| 2 | Click "Record Payment" | Button with `Plus` icon | Dialog opens |
| 3 | Select project + customer | `Select` dropdowns | Values populate |
| 4 | Enter amount (partial: 50% of invoice total) | `Input[type="number"]` | Amount set |
| 5 | Select "cash" method | `Select` for method | Value selected |
| 6 | Enter payment date = today | `Input[type="date"]` | Date set |
| 7 | Click "Record" | Submit button | `POST /payments` returns 201 |
| 8 | Verify toast + dialog close | Success state | "Payment recorded" |
| 9 | Verify SmartTable updates | `PaymentsPage` | New payment row visible |

**Oldest-due-first verification**:
- Customer has 3 invoices with different due dates → payment auto-allocates to oldest due first
- Verify via `GET /payments/:id` that allocationOrder matches due date order

**Assertions**:
- `POST /payments` response has `paymentNumber` starting with `PAY-`
- Payment status is `confirmed`
- `remainingAmount` on the oldest invoice decreased by allocated portion

---

## TC-06: Customer Ledger (View After Invoice Created)

**Priority**: P1
**Component**: `CustomerDetailPage.tsx` line 296–301, `ledger.service.ts`

| Step | Action | Target | Expected |
|---|---|---|---|
| 1 | Navigate to customer detail | `CustomerDetailPage` | Customer header renders |
| 2 | Click "Ledger" tab | `TabsTrigger` with "Ledger" | Card renders with placeholder text |
| 3 | Note: current implementation shows placeholder | "Ledger entries appear after invoice posting..." | Placeholder visible |
| 4 | Issue an invoice for this customer | Via TC-04 | Invoice becomes "issued" |
| 5 | Return to Ledger tab | CustomerDetailPage → Ledger | Ledger entry appears (after backend implementation) |
| 6 | Verify running balance calculation | CustomerLedgerEntry table | `runningBalance` = previous + delta |

**Assertions** (once backend ledger endpoint is wired):
- Table shows entryType `invoice_charge` with positive amountDelta
- Running balance matches `prevBalance + amountDelta`
- ReferenceType is `invoice` with correct invoice id

---

## TC-07: Wallet Impact (Balance After Payment)

**Priority**: P1
**Component**: `WalletTab.tsx` line 36–99

| Step | Action | Target | Expected |
|---|---|---|---|
| 1 | Navigate to customer detail | `CustomerDetailPage` | Customer info visible |
| 2 | Click "Wallet" tab | `TabsTrigger` with "Wallet" | `WalletTab` renders |
| 3 | Verify current balance | Balance card with gradient background | `wallet.balance` displayed |
| 4 | Click "Credit" button | Button with `ArrowUp` icon | Dialog opens |
| 5 | Enter amount 500 | `Input[type="number"]` | Value set |
| 6 | Enter description "Test credit" | `Textarea` | Text set |
| 7 | Click "Apply Credit" | Submit button | `POST /wallet/:id/credit` called |
| 8 | Verify balance updated | Balance card | New balance = old + 500 |
| 9 | Click "Debit" → enter 200 → apply | Debit dialog | `POST /wallet/:id/debit` called |
| 10 | Verify balance decreased | Balance card | New balance = old - 200 |

**Transfer test**:
- Click "Transfer" → enter target wallet ID → enter 100 → Execute Transfer
- `POST /wallet/transfer` returns success
- Both wallets show updated balances

**Assertions**:
- Transaction history (SmartTable in WalletTab) shows all 3 transactions with correct types
- `balanceBefore` and `balanceAfter` columns match sequential accounting
- Console must not show 4xx/5xx errors

---

## TC-08: Reading Impact on Invoice

**Priority**: P2
**Component**: `billing.controller.ts` line 70–92, `ConsumptionPage.tsx`

| Step | Action | Target | Expected |
|---|---|---|---|
| 1 | Record a new reading for an existing meter | `POST /readings` | Reading created with `consumptionValue` |
| 2 | Generate invoice for that meter's billing period | `POST /invoices/generate` | Invoice total reflects new reading |
| 3 | Verify consumption on invoice matches | `GET /invoices/:id` | `consumptionValue` = sum of readings |
| 4 | Record an adjustment reading (negative delta) | `POST /readings` | Reading created |
| 5 | Re-generate invoice (for a new period) | Same endpoint | Consumption includes adjustment |

**Scenario: Zero consumption edge case**
- Add a reading with `consumptionValue = 0` for a meter
- Generate invoices → that meter is skipped (`if (consumption <= 0) continue` at line 93)
- Verify no invoice created for that meter

**Scenario: Tariff change in period**
- Create a new tariff plan effective mid-period
- Change meter's tariff assignment
- Generate invoice → tariff engine picks the correct effective tariff (line 23: `effectiveFrom: { lte: effectiveDate }`)

**Assertions**:
- Invoice's `subtotalAmount` matches `consumption × tariff.ratePerUnit`
- InvoiceLines reflect tariff charge structure (tiers if applicable)
- Zero-consumption meters produce no invoice
- Effective date logic selects correct tariff version

---

## TC-09: Negative Path — Duplicate Invoice Generation

**Priority**: P2
**Component**: `billing.controller.ts` line 82–88

| Step | Action | Target | Expected |
|---|---|---|---|
| 1 | Generate invoices for a billing period | First call | N invoices created |
| 2 | Generate invoices for the SAME period | Second call | 0 new invoices (deduped by `metersWithInvoices` set line 86) |
| 3 | Verify no duplicate invoices | `GET /invoices` filtered by period | Count unchanged |

**Assertions**:
- `generatedCount = 0` on second call
- `invoiceNumber` uniqueness constraint not violated
- No Prisma P2002 errors in logs

---

## TC-10: Negative Path — Cancel Paid Invoice

**Priority**: P2
**Component**: `InvoicesPage.tsx` line 121, `billing.controller.ts` line 218–219

| Step | Action | Target | Expected |
|---|---|---|---|
| 1 | View a **paid** invoice | `InvoiceDetailPage` | Cancel button is hidden |
| 2 | Send `POST /invoices/:id/cancel` directly | API call | Returns `{ status: 'cannot_cancel_paid' }` |
| 3 | Verify invoice status unchanged | `GET /invoices/:id` | Still "paid" |

**Assertions**:
- Frontend protects cancel via `row.status === 'draft'` guard (line 121)
- Backend guard at controller line 219: `if (invoice.status === 'paid') return { status: 'cannot_cancel_paid' }`

---

## Test Case Matrix

| ID | Name | Priority | Auth Required | API Coverage | Frontend Coverage |
|---|---|---|---|---|---|
| TC-01 | Invoice Create (Generate) | P0 | OPERATOR+ | `POST /invoices/generate` | InvoicesPage.tsx |
| TC-02 | Invoice Edit (Due Date) | P1 | OPERATOR+ | `PATCH /invoices/:id` | InvoicesPage.tsx |
| TC-03 | Invoice Cancel | P0 | OPERATOR+ | `POST /invoices/:id/cancel` | InvoicesPage.tsx |
| TC-04 | Invoice Issue | P1 | OPERATOR+ | `POST /invoices/:id/issue` | InvoiceDetailPage.tsx |
| TC-05 | Invoice Payment | P0 | OPERATOR+ | `POST /payments` | PaymentsPage.tsx |
| TC-06 | Customer Ledger | P1 | FINANCE+ | — (via issue) | CustomerDetailPage.tsx |
| TC-07 | Wallet Impact | P1 | FINANCE+ | `POST /wallet/*` | WalletTab.tsx |
| TC-08 | Reading Impact | P2 | OPERATOR+ | `POST /readings` + generate | ConsumptionPage.tsx |
| TC-09 | Duplicate Generation | P2 | OPERATOR+ | `POST /invoices/generate` | — |
| TC-10 | Cancel Paid Invoice | P2 | OPERATOR+ | `POST /invoices/:id/cancel` | InvoicesPage.tsx |

## Execution Command

```bash
# Run all billing tests
node draft/tests/pw-billing-certification.cjs

# Run single test (Playwright grep)
node draft/tests/pw-billing-certification.cjs --grep "TC-05"
```
