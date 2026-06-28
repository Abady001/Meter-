# Ownership Transfer Validation Audit

## Files Examined

| Layer | File | Path |
|-------|------|------|
| **Backend Controller** | customers.controller.ts | D:\meter\Meter\backend\src\customers\customers.controller.ts |
| **Backend Service** | customers.service.ts | D:\meter\Meter\backend\src\customers\customers.service.ts |
| **Backend DTO** | 	ransfer-ownership.dto.ts | D:\meter\Meter\backend\src\customers\dto\transfer-ownership.dto.ts |
| **Frontend** | OwnershipTab.tsx | D:\meter\Meter\Frontend\src\components\customers\OwnershipTab.tsx |
| **Frontend** | CustomerDetailPage.tsx | D:\meter\Meter\Frontend\src\components\customers\CustomerDetailPage.tsx |

## 1. API Endpoint

| Method | Endpoint | Auth Roles | Audit Trail |
|--------|----------|------------|-------------|
| POST | /projects/:projectId/customers/:id/transfer-ownership | OPERATOR, ADMIN, SUPER_ADMIN | @Audit('customer', 'transfer_ownership') |

### Request Body (TransferOwnershipDto)
`	ypescript
{
  newCustomerId: string;   // UUID of target customer
  reason: string;          // Required reason for transfer
  transferOptions?: string[]; // Optional: defined in DTO but NEVER USED in service
}
`

### Response Body (OwnershipTransferResultDto)
`	ypescript
{
  customerId: string;
  newCustomerId: string;
  transferredRecords: Record<string, number>; // e.g., { meterAssignments: 3, invoices: 5, ... }
  skippedRecords: Record<string, number>;     // e.g., { invoices: 2 } (paid/cancelled)
  timestamp: Date;
}
`

## 2. What Ownership Transfer Moves

The transfer is executed inside a **Prisma $transaction** to ensure atomicity.

| # | Entity | Transferred? | Logic | DB Table |
|---|--------|-------------|-------|----------|
| 1 | **Unit Assignments** | YES | customerUnitAssignment.updateMany where customerId = source | customer_unit_assignments |
| 2 | **Meter Assignments** | YES | meterAssignment.updateMany where customerId = source AND status = 'active' | meter_assignments |
| 3 | **Invoices** | **PARTIAL** | invoice.updateMany where status NOT IN ('paid', 'cancelled') --- open/issued invoices only | invoices |
| 4 | **Payments** | YES | payment.updateMany where customerId = source | payments |
| 5 | **Ledger Entries** | YES | customerLedgerEntry.updateMany where customerId = source | customer_ledger_entries |
| 6 | **Wallet Accounts** | YES | walletAccount.update for each wallet found; iterates per-wallet | wallet_accounts |
| 7 | **Source Customer** | **Deactivated** | customer.update sets status = 'inactive' | customers |

### What Is NOT Moved

| Item | Not Moved? | Reason |
|------|-----------|--------|
| Paid/cancelled invoices | **SKIPPED** | Skipped to avoid accounting issues (count returned in skippedRecords) |
| Meter hardware itself | NOT APPLICABLE | Meters are not owned by customers; assignments are reassigned |
| Reading history | NOT MOVED | Readings remain linked to the meter, not the customer |
| Units (property) | **TRANSFERRED** | Unit assignments are moved to new customer |
| Wallet balance | **TRANSFERRED** | Wallet accounts are reassigned to new customerId |
| Customer status | **DEACTIVATED** | Source customer is set to inactive after transfer |

## 3. Frontend Wizard

The OwnershipTab.tsx implements a **4-step wizard**:

`
Step 1: SELECT (choose target customer)
  → Search target customer by name/code/phone via raw SQL query
  → Display selected target customer info
  
Step 2: PREVIEW (review transfer details)
  → Shows "From: source" and "To: target" summary
  → User enters reason for transfer
  
Step 3: CONFIRM (final confirmation)
  → Warning card: "This action cannot be undone..."
  → Execute Transfer button

Step 4: DONE (completion screen)
  → Green success card with timestamp
  → Transferred records summary table
  → Skipped records summary table
  → "Transfer Another" button to reset
`

### Wizard Issues
1. **SQL Injection risk**: The customer search uses string interpolation directly in SQL:
   `
   ...WHERE project_id = '' AND (name ILIKE '%%')...
   `
   This is a **critical SQL injection vulnerability**.
2. **Hardcoded schema name**: The search query references sim_system.customers instead of using the Prisma customer model.
3. **No validation on search**: Search returns first match without confirming it is the correct customer.

## 4. Frontend-Backend Connectivity

| Aspect | Status | Details |
|--------|--------|---------|
| Transfer action | CONNECTED | OwnershipTab.tsx line 52 calls piPost('/projects//customers//transfer-ownership', { newCustomerId, reason }) |
| Result display | CONNECTED | Response TransferResult is displayed in the "Done" step |
| Ownership tab in detail page | CONNECTED | CustomerDetailPage.tsx line 148 adds trigger; lines 260-262 render <OwnershipTab> |
| Error handling | PARTIAL | 	oast.error(e?.message || 'Transfer failed') --- no retry or rollback indication |

## 5. Backend Implementation Details

### Validation Checks
- **Duplicate transfer check**: Source and target must be **different** customers (throws BadRequestException)
- **Source customer exists**: Verified in the project scope
- **Target customer exists**: Verified in the project scope
- **Project scope**: Both customers must belong to the same project

### Transaction Scope
- All operations are wrapped in prisma.(async (tx) => {...})
- If any step fails, the entire transfer is rolled back
- The source customer is deactivated only after all transfers succeed

### 	ransferOptions Parameter
- Defined in TransferOwnershipDto as an optional string[]
- **Never read or used** in customers.service.ts transferOwnership method
- Intended for future selective-transfer functionality but currently ignored

## 6. Additional Transfer-Related Code

### Wallet Transfer (separate from ownership)
- **Endpoint**: POST /wallet/transfer
- **Purpose**: Transfer balance between wallets (not ownership)
- **Details**: Covered in wallet-validation.md

### Payment Receipt Transfer Number
- payment-receipt.model.ts line 41: 	ransferNumber?: string
- payment-receipt.service.ts line 95: Renders transfer number on receipt HTML
- **Purpose**: Reference field for bank transfer payments, unrelated to ownership

## 7. Critical Findings

| Finding | Severity | Details |
|---------|----------|---------|
| **SQL injection in frontend search** | **CRITICAL** | OwnershipTab.tsx line 37 uses string interpolation in SQL query: WHERE project_id = '' AND (name ILIKE '%%'). Attacker-controlled searchTerm can inject SQL. |
| Hardcoded schema name sim_system.customers | HIGH | The search bypasses Prisma entirely and uses raw SQL; if schema changes, the search breaks silently |
| 	ransferOptions defined but unused | MEDIUM | The DTO field 	ransferOptions suggests selective transfer was planned but not implemented |
| No audit of what was transferred (beyond counts) | LOW | The result only returns counts per entity type; no record-level detail of what was moved |
| No reversal/undo capability | MEDIUM | Once executed, the transfer cannot be undone (source customer is deactivated). No rollback mechanism exists. |
| Approve/reject workflow for transfers | **MISSING** | No approval workflow; any OPERATOR+ can execute a transfer immediately |
| Good: Atomic transaction | GOOD | All DB operations happen within a single Prisma $transaction |
| Good: Paid/cancelled invoices skipped | GOOD | Prevents accounting discrepancies |
| Good: Audit trail | GOOD | Decorated with @Audit('customer', 'transfer_ownership') |

## 8. File Locations Summary

| Component | Absolute Path |
|-----------|---------------|
| Customers Controller | D:\meter\Meter\backend\src\customers\customers.controller.ts |
| Customers Service | D:\meter\Meter\backend\src\customers\customers.service.ts |
| Transfer Ownership DTO | D:\meter\Meter\backend\src\customers\dto\transfer-ownership.dto.ts |
| Ownership Frontend Tab | D:\meter\Meter\Frontend\src\components\customers\OwnershipTab.tsx |
| Customer Detail Page | D:\meter\Meter\Frontend\src\components\customers\CustomerDetailPage.tsx |
| Wallet Controller (transfer) | D:\meter\Meter\backend\src\wallet\wallet.controller.ts |
| Wallet Service (transfer) | D:\meter\Meter\backend\src\wallet\wallet.service.ts |
