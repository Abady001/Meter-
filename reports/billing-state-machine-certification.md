# Billing State Machine Certification Report

**File:** D:\meter\Meter\reports\billing-state-machine-certification.md
**Date:** 2026-06-25
**Auditor:** Principal Billing Systems Expert
**Scope:** Invoice status transitions across billing.controller.ts, invoices.controller.ts, bill-cycle.controller.ts

---

## 1. InvoiceStatus Enum Definition

**Source:** D:\meter\Meter\backend\prisma\schema.prisma lines 159–169

`prisma
enum InvoiceStatus {
  draft
  pending_approval
  issued
  partially_paid
  paid
  overdue
  cancelled
  @@map("invoice_status")
  @@schema("sim_system")
}
`

**Analysis:**

| Enum Value | Defined? | Used in Code? | Purpose |
|------------|----------|---------------|---------|
| draft | ✅ Yes | ✅ Yes — Set on invoice creation (line 127 illing.controller.ts) | Initial state after generation |
| pending_approval | ✅ Yes | ❌ **Never used** | No endpoint or service sets this state |
| issued | ✅ Yes | ✅ Yes — Set by issueInvoice (line 178 illing.controller.ts) | Invoice approved and finalized |
| partially_paid | ✅ Yes | ❌ **Never set** — paymentAllocation updates emainingAmount but never changes status | Partial payment indicator |
| paid | ✅ Yes | ❌ **Never set** — paymentAllocation sets paidAmount/emainingAmount but status stays issued | Fully paid |
| overdue | ✅ Yes | ❌ **Never set** — No scheduler or endpoint transitions to overdue | Past due date |
| cancelled | ✅ Yes | ✅ Yes — Set by cancelInvoice (line 222 illing.controller.ts) | Invoice voided/cancelled |

---

## 2. Required Flow: Draft → Generated → Approved → Posted → Paid → Closed

### 2a. Draft → Generated

| Property | Detail |
|----------|--------|
| Trigger | POST /invoices/generate (BillingController.generateInvoices) |
| Code location | illing.controller.ts lines 46–161 |
| Transition logic | Invoice created with status: 'draft' at line 127 |
| Status enum actually set | draft (not generated — no generated value exists in enum) |
| Invalid transitions blocked? | ❌ No — function skips meters that already have invoices (metersWithInvoices set, line 86) but does not check current invoice status before creating |
| Verdict | ⚠️ WARN — No distinct generated state; invoice stays draft |

### 2b. Generated → Approved (Issue)

| Property | Detail |
|----------|--------|
| Trigger | POST /invoices/:id/issue (BillingController.issueInvoice) |
| Code location | illing.controller.ts lines 163–192 |
| Transition logic | if (status !== 'draft') return 'already_issued' (line 170) → sets status: 'issued' (line 178) |
| Status enum set | issued |
| Invalid transitions blocked? | ✅ Yes — only draft → issued allowed; returns error for non-draft invoices |
| Additional checks | Auto-approves if 	otalAmount <= 10000 (line 173); otherwise returns pproval_required but does **not** set pending_approval |
| Verdict | ✅ PASS — State transition logic is implemented and guarded |

### 2c. Approved → Posted

| Property | Detail |
|----------|--------|
| Trigger | No individual invoice "Post" endpoint exists |
| Workaround | POST /bill-cycle/:id/post (BillCycleController.post) posts the entire cycle |
| Code location | ill-cycle.controller.ts lines 138–153 |
| Transition logic | Sets BillingCycle status to CLOSED (line 147); **does not change individual invoice statuses** |
| Status impact on invoices | ❌ None — individual invoices remain issued after cycle is posted |
| Verdict | ❌ FAIL — No per-invoice Posted status or endpoint; invoice status never transitions to a "posted" state |

### 2d. Posted → Paid

| Property | Detail |
|----------|--------|
| Trigger | POST /payments (BillingController.createPayment) |
| Code location | illing.controller.ts lines 274–395 |
| Transition logic | Allocates payment to issued invoices with emainingAmount > 0 (lines 323–328); updates paidAmount and emainingAmount (lines 347–353); **does NOT change status field** |
| Status enum set | ❌ Never — invoice.status remains issued |
| paid status set? | ❌ No — status stays issued even when emainingAmount reaches 0 |
| partially_paid status set? | ❌ No — status stays issued even when emainingAmount > 0 |
| Verdict | ❌ FAIL — Payment allocation correctly updates financial fields but **never transitions InvoiceStatus** to paid or partially_paid |

### 2e. Paid → Closed

| Property | Detail |
|----------|--------|
| Trigger | None — no "Close" invoice operation exists |
| Status enum | ❌ No closed value exists in InvoiceStatus enum |
| Workaround | BillingCycle has a CLOSED status but this is at the cycle level |
| Verdict | ❌ FAIL — No invoice-level "Closed" state; lifecycle completion is not modeled |

---

## 3. Additional Transitions: Cancel, Reverse, Void

### 3a. Cancel

| Property | Detail |
|----------|--------|
| Trigger | POST /invoices/:id/cancel (BillingController.cancelInvoice) |
| Code location | illing.controller.ts lines 211–227 |
| Allowed from | draft, issued (and any non-paid, non-cancelled state) |
| Blocked from | paid → returns cannot_cancel_paid (line 219); cancelled → returns lready_cancelled (line 218) |
| Status set | cancelled at line 223 |
| Invalid transitions blocked? | ✅ Yes — blocks paid and already-cancelled |
| Ledger reversal? | ❌ No — cancelInvoice does not create a ledger reversal entry |
| Verdict | ✅ PASS — State transition logic exists and blocks invalid moves, but lacks financial reversal |

### 3b. Reverse

| Property | Detail |
|----------|--------|
| Endpoint | ❌ **Not implemented** |
| Status enum value | ❌ No eversed in InvoiceStatus enum |
| Ledger reversal logic in cancel? | ❌ cancelInvoice does not call ledgerService.addEntry() with reversal |
| Verdict | ❌ FAIL — No reversal capability exists at any level |

### 3c. Void

| Property | Detail |
|----------|--------|
| Endpoint | ❌ **Not implemented** |
| Status enum value | ❌ No oided in InvoiceStatus enum |
| Distinction from Cancel? | ❌ Cancel is used as a catch-all; no pre-issue void vs post-issue cancel differentiation |
| Verdict | ❌ FAIL — No void operation exists |

---

## 4. State Machine Diagram (Mermaid)

`mermaid
stateDiagram-v2
    [*] --> Draft : Generate Invoice
    
    Draft --> Issued : Issue/Approve (POST /invoices/:id/issue)
    Draft --> Cancelled : Cancel (POST /invoices/:id/cancel)
    
    Issued --> Cancelled : Cancel
    Issued --> Issued (Paid) : Payment Allocated (POST /payments) ⚠️ status NOT updated
    Issued --> Issued (Partially Paid) : Partial Payment ⚠️ status NOT updated
    
    Cancelled --> [*]
    
    note right of Issued
        Enum defines: pending_approval,
        partially_paid, paid, overdue
        but NONE are actually set by code
    end note
    
    state "Missing States" as MISSING {
        pending_approval
        partially_paid
        paid
        overdue
    }
    
    Issued --> MISSING : ❌ NOT IMPLEMENTED
    
    state "Missing Operations" as NOOP {
        Reverse
        Void
        Close
    }
    
    Draft --> NOOP : ❌ NOT IMPLEMENTED
    Issued --> NOOP : ❌ NOT IMPLEMENTED
`

---

## 5. Actual vs. Declared State Machine

### Declared States (Enum)
`
draft → pending_approval → issued → partially_paid → paid → overdue → cancelled
`

### Actually Implemented States
`
draft → issued → (stuck: status never changes from 'issued')
                     ↓
                cancelled (via POST /invoices/:id/cancel)
`

### Gap Analysis

| Transition | Enum Declares? | Code Implements? | Status |
|------------|---------------|------------------|--------|
| Draft → Generated | ❌ (no generated) | ✅ (stays draft) | ⚠️ Gap |
| Draft → pending_approval | ✅ | ❌ Not set | ❌ Gap |
| pending_approval → issued | ✅ | ❌ (jumps draft→issued) | ❌ Gap |
| Draft → Issued | ✅ | ✅ | ✅ OK |
| Issued → partially_paid | ✅ | ❌ Never set | ❌ Gap |
| Issued → paid | ✅ | ❌ Never set | ❌ Gap |
| Issued → overdue | ✅ | ❌ No scheduler | ❌ Gap |
| Issued → cancelled | ✅ | ✅ | ✅ OK |
| Draft → cancelled | ⚠️ (allowed) | ✅ | ✅ OK |
| Paid → cancelled | ❌ (should block) | ✅ Blocked | ✅ OK |
| **Reverse** (any) | ❌ No enum value | ❌ No endpoint | ❌ Missing |
| **Void** (pre-issue) | ❌ No enum value | ❌ No endpoint | ❌ Missing |
| **Close** (final) | ❌ No enum value | ❌ No endpoint | ❌ Missing |

---

## 6. State Transition Guarding (Invalid Transition Blocking)

Each endpoint that changes invoice status:

| Endpoint | From → To | Invalid Transitions Blocked? | Code Evidence |
|----------|-----------|------------------------------|---------------|
| issueInvoice | draft → issued | ✅ if (status !== 'draft') — blocks all non-draft | Line 170 |
| cancelInvoice | any → cancelled | ✅ Blocks paid (line 219) and cancelled (line 218) | Lines 218–219 |
| createPayment | issued → paid (financial) | ❌ Does not check current status before allocating — could allocate to already-paid or cancelled invoices | Lines 322–329 filter by status: 'issued' but only checks once at query time |

**Guard Coverage:**
- ✅ Draft → Issued: guarded
- ✅ Draft/Cancel: guarded
- ⚠️ Issued → Paid: only filtered in initial query, no optimistic locking or mid-transaction status recheck
- ❌ No guards for pending_approval, partially_paid, paid, or overdue because those states are never written

---

## 7. State Machine Diagram (Code Flow Only)

Below is the **actual** state machine as evidenced by code execution paths (not the enum declaration):

`
                        ┌─────────────────┐
                        │     DRAFT       │
                        │  (initial)      │
                        └────────┬────────┘
                                 │
                    POST /invoices/generate
                                 │
                                 ▼
                        ┌─────────────────┐
                  ┌─────│     DRAFT       │
                  │     │ (still draft)   │
                  │     └────────┬────────┘
                  │              │
                  │   POST /invoices/:id/issue
                  │              │
                  │              ▼
                  │     ┌─────────────────┐
                  │     │    ISSUED       │
                  │     │                 │
                  │     └────────┬────────┘
                  │              │
                  │     POST /invoices/:id/cancel
                  │              │
                  │              ▼
                  │     ┌─────────────────┐
                  └─────│   CANCELLED     │
                        └─────────────────┘

    POST /payments (allocates to 'issued' invoices)
    ─────────────────────────────────────────────────
    → Updates paidAmount, remainingAmount (FINANCIAL only)
    → Status REMAINS 'issued'
    → No transition to 'paid', 'partially_paid', or 'overdue'

    Bill Cycle: POST /bill-cycle/:id/post
    ─────────────────────────────────────────────────
    → Changes BillingCycle.status to CLOSED
    → Individual invoice statuses UNCHANGED
`

---

## 8. Certification Summary

### Functional Requirements

| Requirement | Status | Notes |
|-------------|--------|-------|
| Draft → Generated | ⚠️ | Invoice created with draft; no distinct generated state |
| Generated → Approved | ✅ | issueInvoice transitions draft → issued |
| Approved → Posted | ❌ | No per-invoice "Posted" status; cycle-level posting only |
| Posted → Paid | ❌ | Payment allocation updates financials but never changes InvoiceStatus enum |
| Paid → Closed | ❌ | No "Closed" invoice state exists |
| Cancel | ✅ | cancelInvoice transitions to cancelled with guards |
| Reverse | ❌ | Not implemented anywhere |
| Void | ❌ | Not implemented; cancel is used as catch-all |
| Invalid transitions blocked | ⚠️ | Guards exist for issue/cancel but payment allocation has race condition |

### Code Quality

| Metric | Score | Details |
|--------|-------|---------|
| Enum/code alignment | 3/7 | Only 3 of 7 enum values are actually written by code |
| State guards | ⚠️ | Issue/cancel are guarded; payment lacks mid-transaction recheck |
| Ledger consistency | ⚠️ | Issue writes ledger entry; cancel does NOT reverse it |
| Error messages | ⚠️ | Returns string objects ({ status: 'already_issued' }) not standard HTTP errors |
| Idempotency | ❌ | No idempotency keys on any invoice mutation endpoint |

### Final Verdict: ❌ FAIL

The billing state machine is **partially implemented** with significant gaps:

1. **Only 1 of 6 required transitions** (Draft→Issued) is fully implemented with proper guards
2. **Payment never updates invoice status** — paid and partially_paid are declared in the enum but never set
3. **Reverse and Void operations are entirely missing**
4. **No "Closed" state** exists for individual invoices
5. **pending_approval and overdue enum values are dead code** — never referenced in any controller
6. **No state machine diagram** exists in code documentation (the one above is generated for this report)
7. **Ledger reversals on cancel are missing** — financial records become inconsistent

**Recommended Actions:**
1. Add eversed, oided, and closed to InvoiceStatus enum if needed
2. Implement POST /invoices/:id/reverse with full ledger reversal
3. Implement POST /invoices/:id/void for pre-issue cancellation
4. Update createPayment to set status: 'paid' when emainingAmount reaches 0
5. Add status: 'partially_paid' when payment partially covers invoice
6. Add a scheduler or endpoint for issued → overdue transition
7. Add optimistic locking (e.g., where: { status: 'issued' }) in payment allocation to prevent race conditions
8. Add @Audit('invoice', 'cancel') decorator metadata to cancel endpoint

