# Human Error Prevention — LAACRP Phase I

## Current State

**NONE of the following dangerous actions have any protection mechanisms.** All operations execute immediately with a single click or API call. There is no confirmation dialog, no undo capability, no second-approval workflow, and no rollback tracking anywhere in the system.

## Dangerous Actions & Required Safeguards

### 1. Delete Invoice

| Aspect | Required | Current State |
|---|---|---|
| Confirmation Dialog | Modal: "Are you sure you want to delete invoice INV-2026-0001?" | ❌ No dialog |
| Action Summary | Display invoice number, customer name, amount, date, utility type | ❌ Not shown |
| Second Confirmation | Checkbox: "I understand this action is irreversible" | ❌ Not present |
| Audit Log | Log to `core.audit_log`: actor, action, invoice ID, before/after state | ❌ Not implemented |
| Rollback Tracking | Invoice set to status `deleted` (soft delete), not hard-deleted | ❌ Hard delete or no-op |
| Role Restriction | Only SUPER_ADMIN can delete | ❌ Anyone can attempt |

**Implementation**: Soft-delete with status change, not row removal. Backend `DELETE /invoices/:id` → sets `status = 'cancelled'` + `immutableAt = NOW()`.

### 2. Cancel Invoice

| Aspect | Required | Current State |
|---|---|---|
| Confirmation Dialog | Modal: "Cancel invoice INV-2026-0001? This will reverse all ledger entries" | ❌ No dialog |
| Action Summary | Show invoice total, payments allocated, customer balance impact | ❌ Not shown |
| Second Confirmation | Type "CANCEL" to confirm | ❌ Not present |
| Audit Log | Log cancellation with reason field (required, min 20 chars) | ❌ Not implemented |
| Rollback Tracking | Create reversal ledger entries. Store original invoice ID in `InvoiceAdjustment` | ❌ Not implemented |
| Business Rules | Cannot cancel if invoice is already paid or settled | ❌ Not checked |

### 3. Reverse Payment

| Aspect | Required | Current State |
|---|---|---|
| Confirmation Dialog | Modal: "Reverse payment PMT-2026-0001 of EGP 1,500?" | ❌ No dialog |
| Action Summary | Show payment date, method, customer, invoice allocations | ❌ Not shown |
| Second Confirmation | Type "REVERSE" to confirm | ❌ Not present |
| Audit Log | Log reversal with reason (required) | ❌ Not implemented |
| Rollback Tracking | Create offsetting `PaymentAllocation` with negative amount. Update `CustomerLedgerEntry` | ❌ Not implemented |
| Business Rules | Can only reverse payments within 30 days. Requires BILLING_ADMIN approval | ❌ Not checked |

### 4. Post Adjustment

| Aspect | Required | Current State |
|---|---|---|
| Confirmation Dialog | Modal: "Post adjustment of EGP 500 to customer CUST-001?" | ❌ No dialog |
| Action Summary | Show adjustment type (credit/debit), amount, reason, customer balance before/after | ❌ Not shown |
| Second Confirmation | "I confirm this adjustment is accurate" checkbox | ❌ Not present |
| Audit Log | Log to `core.audit_log` with before/after balance | ❌ Not implemented |
| Rollback Tracking | Store in `InvoiceAdjustment` with `approvedBy` — requires second approval | ❌ Not implemented |
| Approval Workflow | Adjustments above EGP 1,000 require BILLING_ADMIN approval | ❌ Not implemented |

### 5. Generate Batch Invoices

| Aspect | Required | Current State |
|---|---|---|
| Confirmation Dialog | Modal: "Generate invoices for billing period 2026-06? This will create ~1,500 invoices" | ❌ No dialog |
| Action Summary | Show period, project, estimated invoice count, total estimated amount | ❌ Not shown |
| Dry Run | Generate preview first: count, total, min/max amounts | ❌ Not implemented |
| Second Confirmation | Type project code to confirm | ❌ Not present |
| Audit Log | Log batch generation: period, project, count, total, initiated by | ❌ Not implemented |
| Rollback Tracking | Store `billcycle_log_id` — entire batch can be rolled back | ❌ Not implemented |
| Business Rules | Prevent double-generation for same period+project | ❌ Not checked |

### 6. Delete Customer

| Aspect | Required | Current State |
|---|---|---|
| Confirmation Dialog | Modal: "Delete customer Ahmed Ali (CUST-001)?" | ❌ No dialog |
| Action Summary | Show customer name, code, project, active meters count, outstanding balance | ❌ Not shown |
| Business Rules Check | Cannot delete if: outstanding balance > 0, has active meters, has open tickets | ❌ Not checked |
| Second Confirmation | Type customer code to confirm | ❌ Not present |
| Audit Log | Log deletion with full customer snapshot | ❌ Not implemented |
| Rollback Tracking | Soft-delete (status = 'inactive'), not hard-delete | ❌ Hard delete or no-op |
| Cascade Handling | Check dependent records (units, meters, invoices, ledger) | ❌ Not checked |

### 7. Delete Meter

| Aspect | Required | Current State |
|---|---|---|
| Confirmation Dialog | Modal: "Delete meter serial MTR-2026-0001?" | ❌ No dialog |
| Action Summary | Show serial number, type, location, status, assigned customer | ❌ Not shown |
| Business Rules Check | Cannot delete if: active assignment exists, has readings, has open invoices | ❌ Not checked |
| Second Confirmation | Type "DELETE METER" to confirm | ❌ Not present |
| Audit Log | Log deletion with meter snapshot | ❌ Not implemented |
| Rollback Tracking | Set status = 'retired', do not delete row | ❌ Hard delete or no-op |

## Common Infrastructure Requirements

### Confirmation Dialog Component

A reusable `<DangerousActionDialog>` component that provides:

```typescript
interface DangerousActionProps {
  title: string;
  description: string;
  summaryItems: { label: string; value: string }[];
  confirmText: string;   // text user must type
  onConfirm: () => void;
  onCancel: () => void;
  role: 'SUPER_ADMIN' | 'ADMIN';
}
```

### Audit Log Schema (already exists in `core.audit_log`)

| Field | Required for Dangerous Actions |
|---|---|
| `actionType` | `delete`, `cancel`, `reverse`, `generate` |
| `entityType` | `invoice`, `payment`, `customer`, `meter` |
| `entityId` | UUID of affected entity |
| `oldValues` | Full JSON snapshot before action |
| `newValues` | Full JSON snapshot after action (status change, etc.) |
| `reason` | **Required** — min 20 characters |
| `ipAddress` | Actor IP |
| `areaId` | Current area context |

### Second Approval Queue

For actions requiring approval (large adjustments, batch invoices):

```typescript
interface ApprovalQueue {
  id: string;
  actionType: string;
  entityId: string;
  requestedBy: string;
  requestedAt: DateTime;
  approvedBy: string | null;
  approvedAt: DateTime | null;
  status: 'pending' | 'approved' | 'rejected';
  reason: string;
}
```

## Files Requiring Modification

| File | Change |
|---|---|
| `Frontend/src/components/shared/DangerousActionDialog.tsx` | **New**: reusable confirmation dialog with type-to-confirm |
| `Frontend/src/components/shared/ActionSummary.tsx` | **New**: summary card showing business impact |
| `Frontend/src/components/billing/InvoiceDetailPage.tsx` | Add delete/cancel with DangerousActionDialog |
| `Frontend/src/components/billing/PaymentsPage.tsx` | Add reverse with DangerousActionDialog |
| `Frontend/src/components/billing/InvoicesPage.tsx` | Add batch generate with dry-run + confirmation |
| `Frontend/src/components/customers/CustomerDetailPage.tsx` | Add delete with business rule checks |
| `Frontend/src/components/meters/MeterDetailPage.tsx` | Add delete with business rule checks |
| `backend/src/billing/billing.controller.ts` | Add soft-delete, cancel, reverse endpoints |
| `backend/src/billing/billing.service.ts` | Add business rule validation, ledger reversal logic |
| `backend/src/customers/customers.controller.ts` | Add soft-delete with cascade checks |
| `backend/src/meters/meters.controller.ts` | Add soft-delete with assignment checks |
| `backend/src/approval/approval.service.ts` | **New**: approval queue for high-risk actions |
| `backend/src/approval/approval.controller.ts` | **New**: approve/reject endpoints |
