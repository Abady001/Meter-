# Features Schema — Activation Audit

**Generated**: 2026-06-20  
**Evidence method**: `grep -r "prisma.<ModelName>" --include="*.ts" D:\meter\Meter\backend\src\`

---

## Status Definitions

| Status | Meaning |
|--------|---------|
| **ACTIVE** | Code references exist in production services; model is actively queried |
| **PARTIALLY_ACTIVE** | Code reference exists but incomplete (fallback-only or single query) |
| **DESIGNED_ONLY** | Schema table exists in migration and Prisma model, zero code references |
| **DEAD_CODE** | Code references exist but commented out or in deleted branches |

---

## Domain 1: Tariff Management

### Tariff (`features.tariffs`)
**Status**: ✅ ACTIVE  
**Evidence**:
```
backend/src/billing/tariff-engine.service.ts:20
  const tariff = await this.prisma.tariff.findFirst({
    where: { utilityType, isActive: true, effectiveFrom: { lte: effectiveDate },
             OR: [{ effectiveTo: null }, { effectiveTo: { gte: effectiveDate } }] },
    orderBy: { effectiveFrom: 'desc' }
  });
```
**Details**: Primary tariff lookup in `TariffEngineService.calculateCharges()`. Supports utility type filtering, date-effective versioning, active status check. Fallback to `TariffPlan` (sim_system) when no features tariff exists.

### TariffVersion (`features.tariff_versions`)
**Status**: ❌ DESIGNED_ONLY  
**grep result**: No matches in `backend/src/**/*.ts`  
**Details**: Schema has `tariff_versions` with versionNo, changeLog, approvedBy, approvedAt. The `Tariff` model has `versions TariffVersion[]` relation but no code reads it.

### TariffCharge (`features.tariff_charges`)
**Status**: ✅ ACTIVE  
**Evidence**:
```
backend/src/billing/tariff-engine.service.ts:41
  const charges = await this.prisma.tariffCharge.findMany({
    where: { tariffId: tariff.id, isActive: true },
    orderBy: { sortOrder: 'asc' },
    include: { details: { orderBy: { stepFrom: 'asc' } } },
  });
```
**Details**: Full query with charge mode, settlement type, rate amount, min/max charge. All 5 modes implemented (FLAT, PER_UNIT, STEPS, STATIC, ZERO).

### TariffChargeDetail (`features.tariff_charge_details`)
**Status**: ✅ ACTIVE  
**Evidence**:
```
backend/src/billing/tariff-engine.service.ts:44
  include: { details: { orderBy: { stepFrom: 'asc' } } }
```
**Details**: Eager-loaded via `include` on TariffCharge query. Used in STEPS mode iteration at lines 68-84 with `stepFrom`, `stepTo`, `stepRate`, `stepAmount`, `isPercentage`.

---

## Domain 1b: Reports & Jobs

### ReportDefinition (`features.report_definitions`)
**Status**: ❌ DESIGNED_ONLY  
**grep result**: No matches  
**Details**: 10-column report catalog with parameters schema. No controller, service, or UI reads this table.

### ReportExport (`features.report_exports`)
**Status**: ❌ DESIGNED_ONLY  
**grep result**: No matches  
**Details**: 12-column export tracking with format, file URL, status, expiry.

### ScheduledJob (`features.scheduled_jobs`)
**Status**: ❌ DESIGNED_ONLY  
**grep result**: No matches  
**Details**: Cron-based job scheduler table. No scheduler service exists yet.

### ExportHistory (`features.export_history`)
**Status**: ❌ DESIGNED_ONLY  
**grep result**: No matches  
**Details**: Log of completed exports with file size, record count.

### RunningActivity (`features.running_activities`)
**Status**: ❌ DESIGNED_ONLY  
**grep result**: No matches  
**Details**: Background task progress tracking. No SSE/WebSocket consumer.

### ContractualRequest (`features.contractual_requests`)
**Status**: ❌ DESIGNED_ONLY  
**grep result**: No matches  
**Details**: Approval workflow with JSON request/approval data. No workflow engine exists.

---

## Domain 2: Solar Wallet

### WalletAccount (`features.wallet_accounts`)
**Status**: ✅ PARTIALLY_ACTIVE  
**Evidence**:
```
backend/src/solar/solar-wallet.service.ts:10
  return this.prisma.walletAccount.findFirst({ where: { customerId } })
    ?? { customerId, accumulatedProduction: 0, accumulatedCredits: 0, ... };
```
**Details**: Single `findFirst` call in `SolarWalletService.getWallet()`. No create/update/delete. No transaction integration. Returns mock fallback object when not found — meaning the feature works without the DB table populated.

### WalletTransaction (`features.wallet_transactions`)
**Status**: ❌ DESIGNED_ONLY  
**grep result**: No matches  
**Details**: 12-column transaction log. No code creates or reads wallet transactions.

### WalletBalance (`features.wallet_balances`)
**Status**: ❌ DESIGNED_ONLY  
**grep result**: No matches  
**Details**: Daily balance snapshots. No scheduler populates this.

### WalletAllocation (`features.wallet_allocations`)
**Status**: ❌ DESIGNED_ONLY  
**grep result**: No matches  
**Details**: Earmarked fund allocation with expiry. No allocation engine.

### WalletTransfer (`features.wallet_transfers`)
**Status**: ❌ DESIGNED_ONLY  
**grep result**: No matches  
**Details**: Cross-account transfers with approval workflow. No transfer service.

---

## Domain 3: Chilled Water

### ChilledWaterConfig, ChilledWaterReading, ChilledWaterConsumption, ChilledWaterInvoice, ChilledWaterAllocation
**Status**: ❌ DESIGNED_ONLY (all 5)  
**grep result**: No matches for any of these models  
**Details**: Complete domain schema — configs, readings, consumptions, invoices, allocations — but zero code references. Chilled water billing remains unimplemented.

---

## Domain 4: Settlement Engine

### SettlementConfig, SettlementPeriod, SettlementRule, SettlementTransaction, SettlementAllocation
**Status**: ❌ DESIGNED_ONLY (all 5)  
**grep result**: No matches for any of these models  
**Details**: Complete settlement engine schema with configs, periods, rules (FIXED_PERCENTAGE/TIERED/FORMULA/MANUAL), transactions, and allocations. No settlement service exists yet.

---

## Domain 5: Bill Cycle Governance

### BillingCycle (`features.billing_cycles`)
**Status**: ❌ DESIGNED_ONLY  
**grep result**: No matches  
**Details**: 13-column lifecycle table (OPEN→LOCKED→APPROVED→CLOSED→CANCELLED). Current code uses `BillingPeriod` (sim_system) instead.

### BillingCycleProject (`features.billing_cycle_projects`)
**Status**: ❌ DESIGNED_ONLY  
**grep result**: No matches  
**Details**: Per-project status within a cycle. No code reads this.

### BillingCycleApproval (`features.billing_cycle_approvals`)
**Status**: ❌ DESIGNED_ONLY  
**grep result**: No matches  
**Details**: Approval log with role-based sign-off. No workflow.

### BillingCycleAudit (`features.billing_cycle_audits`)
**Status**: ❌ DESIGNED_ONLY  
**grep result**: No matches  
**Details**: Field-level change tracking. No code writes to this.

---

## Domain 6: Document Engine

### DocumentTemplate, TemplateVersion, GeneratedDocument, DocumentAudit
**Status**: ❌ DESIGNED_ONLY (all 4)  
**grep result**: No matches  
**Details**: Complete template engine schema with versioning, content storage, rendered HTML, and audit. No code references exist.

---

## Domain 7: Invoice Governance

### InvoiceHash (`features.invoice_hashes`)
**Status**: ❌ DESIGNED_ONLY  
**grep result**: No matches  
**Details**: SHA-256 hash chain for invoice integrity. No hashing service.

### InvoiceQRCode (`features.invoice_qr_codes`)
**Status**: ❌ DESIGNED_ONLY  
**grep result**: No matches  
**Details**: QR code generation for invoices. No QR generation code.

### InvoiceGenerationBatch (`features.invoice_generation_batches`)
**Status**: ❌ DESIGNED_ONLY  
**grep result**: No matches  
**Details**: Batch tracking for mass invoice generation. Current code generates invoices one-at-a-time with no batch tracking.

---

## Activation Summary

| Status | Count | Percentage |
|--------|-------|-----------|
| ✅ ACTIVE | 3 | 8.3% |
| ✅ PARTIALLY_ACTIVE | 1 | 2.8% |
| ❌ DESIGNED_ONLY | 32 | 88.9% |
| ❌ DEAD_CODE | 0 | 0% |
| **Total** | **36** | **100%** |

Only 4 of 36 features tables have any code reference. The remaining 32 tables (88.9%) are schema-only — designed, migrated, and waiting for implementation.
