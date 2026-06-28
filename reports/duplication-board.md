# Schema Duplication Board — Features vs sim_system

> **Classification**: EVIDENCE-BASED CERTIFICATION — no code changes
> **Source**: `backend/prisma/schema.prisma` (2958 lines), `backend/src/` code analysis
> **Date**: 2026-06-20

---

## Executive Summary

The Meter Verse database has **5 identified duplications** between the `features` and `sim_system` schemas. Each is assessed below with a verdict (MERGE, REPLACE, KEEP BOTH, KEEP ONE) and the evidence driving that conclusion.

**Guiding principle**: The `features` schema is the **target architecture** (v2.0.0 Meter Verse). The `sim_system` schema is the **legacy bridge** (SBill compatibility). Where features has superior design, replace sim_system. Where both serve distinct purposes, preserve both with clear boundaries.

---

## Duplication 1: Tariff Management

| Dimension | `sim_system.TariffPlan` | `features.tariffs` |
|-----------|------------------------|-------------------|
| **Table** | `sim_system.tariff_plans` | `features.tariffs` + `tariff_versions` + `tariff_charges` + `tariff_charge_details` |
| **Model name** | `TariffPlan` | `Tariff`, `TariffVersion`, `TariffCharge`, `TariffChargeDetail` |
| **Rate model** | Single `ratePerUnit` (Decimal) | Multi-charge with 5 modes (STEPS/FLAT/STATIC/PER_UNIT/ZERO) |
| **Versioning** | None | Full `TariffVersion` with `versionNo`, `changeLog`, `approvedBy`, `approvedAt` |
| **Charge types** | Flat rate only | FLAT, PER_UNIT, STEPS (tiered), STATIC, ZERO + min/max charge |
| **Active status** | `TariffStatus` enum (draft/active/retired) | `isActive` boolean + `effectiveFrom`/`effectiveTo` |
| **Code references** | `tariff-engine.service.ts:32` (fallback) | `tariff-engine.service.ts:20` (primary), `tariff.service.ts` |
| **Code-referenced in src/** | 1 file (fallback) | 2 files (primary path) |
| **Lines of code** | 4 fields | 28 fields across 4 models |

### Verdict: **MERGE into features**

**Evidence**:
1. `TariffEngineService.calculateCharges()` at `tariff-engine.service.ts:20` **prefers `features.tariffs` first** and only falls back to `sim_system.TariffPlan` when no features tariff is found (line 32). The primary code path is already features-based.
2. All 5 charge modes (STEPS/FLAT/STATIC/PER_UNIT/ZERO) are implemented and verified in `TariffEngineService` — lines 55-97.
3. `features.tariff_charges` includes `minCharge` and `maxCharge` (lines 1260-1261) which `TariffEngineService` applies at lines 113-117 — proven working code.
4. `sim_system.TariffPlan` only supports flat-rate billing. It cannot represent tiered/step tariffs, percentage-based charges, or minimum charges that SBill invoices require.
5. JRXML analysis confirms SBill invoice charge groups (Consumption=0, ServiceFees=1, CustomerService=2-3, Admin=4, Percentage=5, VAT=6, Other=7) map onto `features.tariff_charges.settlementType` and `chargeMode` — not onto `TariffPlan.ratePerUnit`.

**Action**: Migrate all `sim_system.tariff_plans` data to `features.tariffs` + `features.tariff_charges` (with FLAT mode + rateAmount). Drop `TariffPlan` model once migration is verified.

---

## Duplication 2: Settlement

| Dimension | `sim_system` (Core schema) | `features.settlement_*` |
|-----------|---------------------------|------------------------|
| **Table** | `core.settlements` | `settlement_configs`, `settlement_periods`, `settlement_rules`, `settlement_transactions`, `settlement_allocations` |
| **Model name** | `CoreSettlement` | `SettlementConfig`, `SettlementPeriod`, `SettlementRule`, `SettlementTransaction`, `SettlementAllocation` |
| **Granularity** | Area-level aggregate only | Config → Period → Rule → Transaction → Allocation (5-level) |
| **Fields** | areaId, periodStart, periodEnd, totalInvoiced, totalCollected, variance, settledAt | Full workflow: formulas, conditions, thresholds, fees, net amounts, allocation percentages |
| **Rule engine** | None (manual settlement only) | `SettlementRuleType` enum (FIXED_PERCENTAGE, TIERED, FORMULA, MANUAL) |
| **Code references** | 0 files in src/ | 0 files in src/ |
| **Status** | Schema only, zero code | Schema only, zero code |

### Verdict: **REPLACE `core.settlements` with `features.settlement_*`**

**Evidence**:
1. Zero code references to either schema — both are unactivated. Now is the time to choose.
2. `features` has a 5-table settlement workflow (config → period → rule → transaction → allocation) that mirrors the full SBill settlement lifecycle.
3. `core.settlements` is a single aggregate table — insufficient for per-transaction settlement tracking required by SBill's `settlements.jrxml` report.
4. The `SettlementController` at `backend/src/settlement/settlement.controller.ts` creates entries in `sim_system.invoice` with `utilityType: 'settlement'` — this is a workaround, not a settlement engine.
5. `SettlementRuleType` enum (FIXED_PERCENTAGE, TIERED, FORMULA, MANUAL) at `schema.prisma:1195-1202` provides the rule engine foundation that SBill lacks entirely — this is an architectural improvement.

**Action**: Delete `CoreSettlement` model. Activate `features.settlement_*` as part of Week 4 (see Features Activation Roadmap). The `SettlementController` workaround using `sim_system.invoice` should be replaced with proper `features.settlement_transaction` + `features.settlement_allocation` models.

---

## Duplication 3: Customer Ledger

| Dimension | `sim_system.CustomerLedgerEntry` | `features` duplicate |
|-----------|----------------------------------|---------------------|
| **Table** | `sim_system.customer_ledger_entries` | None — NO duplicate |
| **Model name** | `CustomerLedgerEntry` | — |
| **Fields** | id, customerId, projectId, entryType, referenceType, referenceId, amountDelta, runningBalance, entryAt | — |
| **Code references** | `ledger.service.ts:19-39` (primary), `billing.controller.ts:176,257`, `payments.service.ts:88` | — |
| **Lines of code** | 40 lines in LedgerService | — |

### Verdict: **KEEP — no duplication exists**

**Evidence**:
1. Extensive search of `schema.prisma` for any `ledger` or `ledger_entry` in `features` schema returns zero results.
2. `LedgerService` at `ledger.service.ts:10-39` is the single implementation — it reads the last `CustomerLedgerEntry` (line 19), computes `prevBalance` (line 24), calculates `runningBalance` (line 25), and creates a new entry (line 27).
3. The `customer_statement_view` at `T019` migration (view definition) uses `sim_system.customer_ledger_entries` as its data source.
4. Three callers use `LedgerService.addEntry()`: `BillingController.issueInvoice()`, `BillingController.addAdjustment()`, and `PaymentsService.reverse()` — all verified working.

**Note**: The `area` schema has a separate `AreaCustomerLedgerEntry` model (for per-area ledger). This is NOT a duplicate — it is a tenant-scoped copy for the 15-area architecture, with different fields and relationships.

---

## Duplication 4: Billing Period vs Billing Cycle

| Dimension | `sim_system.BillingPeriod` | `features.BillingCycle` |
|-----------|---------------------------|------------------------|
| **Table** | `sim_system.billing_periods` | `features.billing_cycles` + `billing_cycle_projects` + `billing_cycle_approvals` + `billing_cycle_audits` |
| **Model name** | `BillingPeriod` | `BillingCycle`, `BillingCycleProject`, `BillingCycleApproval`, `BillingCycleAudit` |
| **Status field** | `BillingPeriodStatus` (open/in_review/closed) | `BillingCycleStatus` (OPEN/LOCKED/APPROVED/CLOSED/CANCELLED) |
| **Approval flow** | None | `BillingCycleApproval` with role-based approvals |
| **Audit trail** | None | `BillingCycleAudit` (append-only, field-level) |
| **Multi-project** | Single project scope | `BillingCycleProject` join table for multi-area |
| **Code references** | `billing.controller.ts:54-61,54,58` (period lookup) | 0 files |

### Verdict: **KEEP BOTH — different purposes**

**Evidence**:
1. `BillingPeriod` is a **time window** — start and end dates for a billing run. It is used by `BillingController.generateInvoices()` to scope reading queries (line 76: `readingAt: { gte: period.startDate, lte: period.endDate }`).
2. `BillingCycle` is a **governance workflow** — a state machine with OPEN → LOCKED → APPROVED → CLOSED states, role-based approvals, field-level audit trail, and multi-project support.
3. The two are complementary: a `BillingCycle` CONTAINS one or more `BillingPeriod`s. The cycle governs the workflow; the period defines the time window.
4. Zero code references `features.BillingCycle` — it is not yet activated. This means there is no code conflict — the two can coexist.
5. The `BillingPeriod` has a `periodCode` field used for invoice numbering (`INV-${period.periodCode}-...`) at `billing.controller.ts:109`. The `BillingCycle` has `cycleCode` — different semantic.

**Action**: Build a `BillingCycleService` that orchestrates billing cycle state while delegating to `BillingPeriod` for date scoping. The `BillingController.generateInvoices()` should eventually check cycle status before allowing generation.

---

## Duplication 5: Invoice Generation Batch

| Dimension | `sim_system.Invoice` | `features.InvoiceGenerationBatch` |
|-----------|---------------------|-----------------------------------|
| **Table** | `sim_system.invoices` | `features.invoice_generation_batches` |
| **Model name** | `Invoice` | `InvoiceGenerationBatch` |
| **Purpose** | The invoice itself (line items, status, amounts) | Tracking metadata for batch invoice generation runs |
| **Fields** | invoiceNumber, customerId, meterId, totalAmount, status (7 values) | batchCode, cycleId, areaId, totalInvoices, successfulCount, failedCount, totalAmount, status, errorLog |
| **Code references** | Multiple — billing controller, payments, collections | 0 files |

### Verdict: **MERGE — link batch tracking to invoice**

**Evidence**:
1. `InvoiceGenerationBatch` is a **run log**: it tracks how many invoices were generated in a batch, success/failure counts, errors.
2. The current `BillingController.generateInvoices()` at line 151 returns `{ batchId: \`batch-${Date.now()}\`, generatedCount: count }` — this is an ad-hoc batch identifier not stored in any table.
3. `InvoiceGenerationBatch` does NOT store invoice data — it stores batch metadata. The actual invoices go to `sim_system.invoice`.
4. These are NOT competing schemas — they are **complementary layers**. The `InvoiceGenerationBatch` record links to `sim_system.invoice` via the batch run ID (which should be stored on the invoice as an optional `batchId` field).

**Action**: Add a `batchId` field (nullable) to `sim_system.Invoice` model. Create an `InvoiceGenerationBatch` record when `generateInvoices` starts. Update the record on completion. This requires Week 3 activation.

---

## Duplication 6: Payment vs Wallet

| Dimension | `sim_system.Payment` | `features.wallet_*` |
|-----------|---------------------|---------------------|
| **Table** | `sim_system.payments` | `wallet_accounts`, `wallet_transactions`, `wallet_balances`, `wallet_allocations`, `wallet_transfers` |
| **Model name** | `Payment` | `WalletAccount`, `WalletTransaction`, `WalletBalance`, `WalletAllocation`, `WalletTransfer` |
| **Purpose** | One-time payment against invoices | Prepaid credit/deposit management, transfers |
| **Amount tracking** | Single amount per payment | Balance tracking with opening/closing per period |
| **Allocations** | `PaymentAllocation` to invoices | `WalletAllocation` to purposes (not invoices) |
| **Transfers** | No transfer support | Full `WalletTransfer` with source/target accounts, fees, approval |
| **Code references** | 5 files (services + controllers) | 1 file (`solar-wallet.service.ts`) |
| **Lines of code** | ~200 lines across all files | 20 lines (SolarWalletService only) |

### Verdict: **KEEP BOTH — Payment ≠ Wallet**

**Evidence**:
1. `sim_system.Payment` + `PaymentAllocation` is a **post-paid payment engine**: payments come in, get allocated to outstanding invoices using oldest-due-first or explicit mode (`billing.controller.ts:275-390`).
2. `features.wallet_*` is a **pre-paid credit engine**: accounts hold balances, transactions track deposits/withdrawals/transfers. This is used for solar net metering credits (`SolarWalletService` at `solar-wallet.service.ts`).
3. `WalletAllocation` allocates credit to purposes (e.g., "solar credit for meter X") — not to specific invoices. This is a fundamentally different concept from `PaymentAllocation` which targets invoice payment.
4. `WalletTransfer` enables peer-to-peer credit transfers — completely absent from the payment model.
5. The `SolarWalletService.calculateNetMetering()` at line 13 computes net consumption/production surplus — this creates wallet credit, not payments.
6. These can be INTEGRATED (wallet credit can be converted to a payment) but they should remain separate models.

**Action**: Activate `features.wallet_*` in Week 5. Build a wallet-to-payment bridge service that creates a `Payment` record when wallet credits are applied to invoices. Do not merge the tables.

---

## Duplication 7: Chilled Water

| Dimension | `sim_system` | `features.chilled_water_*` | Controlled by |
|-----------|-------------|---------------------------|--------------|
| **Table** | `sim_system.Meter` (meterType: chilled_water) | `chilled_water_configs`, `chilled_water_readings`, `chilled_water_consumptions`, `chilled_water_invoices`, `chilled_water_allocations` | Separate |
| **Purpose** | General meter with type flag | Dedicated chilled water billing (BTU-based) | Different |
| **Rate model** | Uses `TariffPlan.ratePerUnit` | `ChilledWaterConfig` with baseRate/peakRate/offPeakRate/serviceCharge | Different |
| **Allocation** | Standard invoice + payment | `ChilledWaterAllocation` with PROPORTIONAL/FIXED/METERED methods | Different |
| **Code references** | Meter CRUD in readings controllers | `chilledWaterSettlements` in area schema only | Partial |

### Verdict: **KEEP BOTH — partial overlap, different billing models**

**Evidence**:
1. `ChilledWaterConfig` has a fundamentally different rate model from `TariffPlan`: base rate + peak/off-peak rates + BTU measurement vs flat rate per unit consumption.
2. The `ChilledWaterAllocationMethod` enum (PROPORTIONAL, FIXED, METERED) is unique to chilled water — no equivalent in standard billing.
3. `sim_system.Meter` has `meterType: chilled_water` for basic meter tracking and reading collection. The `features.chilled_water_*` tables handle the **billing calculation** — not the meter tracking.
4. Partial overlap: chilled water meters in `sim_system.Meter` should link to `ChilledWaterConfig` for billing purposes. This is a foreign-key relationship, not a duplication.
5. `AreaChilledWaterSettlement` in the area schema is a separate per-area settlement calculation — different from `features.chilled_water_invoices`.

**Action**: Add a `configId` foreign key on `sim_system.Meter` for chilled_water meters to link to `ChilledWaterConfig`. Keep separate billing engines. Activate in standalone sprint.

---

## Master Verdict Table

| # | Duplicate | Schema A | Schema B | Verdict | Risk | Effort |
|---|-----------|----------|----------|---------|------|--------|
| 1 | Tariff | `sim_system.TariffPlan` (simple rate) | `features.tariffs` (versioned, 5 charge modes) | **MERGE into features** | LOW | 5 days |
| 2 | Settlement | `core.settlements` (aggregate) | `features.settlement_*` (5 tables, full workflow) | **REPLACE with features** | LOW | 3 days |
| 3 | Ledger | `sim_system.CustomerLedgerEntry` | None | **KEEP** (no duplicate) | NONE | 0 |
| 4 | Billing Period | `sim_system.BillingPeriod` | `features.BillingCycle` (state machine) | **KEEP BOTH** (complementary) | LOW | 5 days |
| 5 | Invoice Batch | `sim_system.Invoice` (direct) | `features.InvoiceGenerationBatch` (metadata) | **MERGE** (add batchId to Invoice) | LOW | 2 days |
| 6 | Payment/Wallet | `sim_system.Payment` + `PaymentAllocation` | `features.wallet_*` (pre-paid credit) | **KEEP BOTH** (different purposes) | MED | 5 days |
| 7 | Chilled Water | `sim_system.Meter` (type flag) | `features.chilled_water_*` (BTU billing) | **KEEP BOTH** (different models) | LOW | 5 days |

**Total estimated effort**: ~25 developer-days across all duplications.

---

## Migration Sequence

```
Week    Action
────    ──────
Week 1  MERGE tariff sim_system → features (5 days)
Week 2  KEEP BOTH billing period + cycle integration (5 days)
Week 3  MERGE invoice batch tracking (2 days)
Week 4  REPLACE settlement with features (3 days)
Week 5  KEEP BOTH wallet activation + payment bridge (5 days)
Week 6  KEEP BOTH chilled water activation (5 days)
```

Total: 25 days across 6 weeks. None are blocking — all can proceed independently.
