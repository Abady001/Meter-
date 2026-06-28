# U5 — WORKFLOW CONSOLIDATION

**Date**: 2026-06-18
**Method**: Trace end-to-end workflows

## Core Workflow: Customer → Invoice → Payment

| Step | Component | Implementation | Status |
|------|-----------|---------------|--------|
| **Customer** | | | |
| Create | CustomersPage + API | `POST /projects/:pid/customers` → 201 | ✅ WORKING |
| Edit | CustomersPage + API | `PATCH /projects/:pid/customers/:id` | ✅ WORKING |
| Delete | CustomersPage + API | `DELETE /projects/:pid/customers/:id` | ✅ WORKING |
| **Meter** | | | |
| Create | MetersPage + API | `POST /meters` → 201 | ✅ WORKING |
| Assign | MetersPage + API | `POST /meters/:id/assign` | ✅ WORKING |
| Replace | MeterReplacePage + API | `POST /meters/:id/terminate` + `POST /meters/:id/assign` | ✅ WORKING |
| Terminate | MeterTerminatePage + API | `POST /meters/:id/terminate` | ✅ WORKING |
| **Reading** | | | |
| Create | ReadingNewPage + API | `POST /readings` → 201 | ✅ WORKING |
| Review | ReadingsPage + API | `GET /readings/review-queue` | ✅ WORKING |
| Approve/Reject | ❌ Not implemented | No approve/reject buttons | ❌ MISSING |
| **Invoice** | | | |
| Generate | BillingController | `POST /invoices/generate` → 500 | ❌ BROKEN |
| Issue | InvoiceDetailPage | Toast only — no API call | ❌ TOAST |
| Adjust | InvoiceDetailPage | Toast only — no API call | ❌ TOAST |
| Download | InvoiceDetailPage | Toast only — no API call | ❌ TOAST |
| **Payment** | | | |
| Record | PaymentsPage | Toast only — no API call | ❌ TOAST |
| Reverse | PaymentsPage | Toast only — no API call | ❌ TOAST |

## Duplicate Workflows
No duplicate workflows found within the current codebase. Each business operation has exactly one implementation path.

## Missing Workflows
| Workflow | Impact |
|----------|--------|
| Reading approval/rejection | Cannot complete reading lifecycle |
| Invoice generation | Core billing broken |
| Invoice issue/adjust/download | Cannot complete billing lifecycle |
| Payment record/reverse | Cannot complete payment lifecycle |
| Project CRUD (frontend) | Cannot manage projects |

## Conclusion
The core backend workflows are implemented and working (Customer, Meter, Reading CRUD). But the **invoice-to-payment workflow is entirely broken on both frontend and backend**. This is the most critical business workflow gap.
