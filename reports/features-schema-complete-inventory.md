# Features Schema — Complete Inventory (36 Tables)

**Generated**: 2026-06-20  
**Source**: `backend/prisma/migrations/20260617174222_features_db/migration.sql`  
**Schema**: `features` (PostgreSQL)  
**Migration**: 20260617174222_features_db — Applied  

## Legend

| Column | Meaning |
|--------|---------|
| Code | `grep -r "prisma.<Model>" --include="*.ts"` has matches |
| API | Controller/service exposes CRUD or query endpoint |
| UI | Frontend page or component references this model |
| Difficulty | EASY=needs only service layer, MED=needs API+service, HARD=needs API+service+UI+workflow |

---

## Domain 1: Tariff Management

| # | Table | Prisma Model | Cols | Purpose | Code | API | UI | Difficulty |
|---|-------|-------------|------|---------|------|-----|----|-----------|
| 1 | `tariffs` | `Tariff` | 11 | Master tariff definition with utility type, effective dates, versioning | ✅ YES | ✅ | ❌ | EASY |
| 2 | `tariff_versions` | `TariffVersion` | 7 | Audit trail of tariff changes with approval | ❌ NO | ❌ | ❌ | EASY |
| 3 | `tariff_charges` | `TariffCharge` | 14 | Charge lines within a tariff (mode, rate, settlement type) | ✅ YES | ✅ | ❌ | EASY |
| 4 | `tariff_charge_details` | `TariffChargeDetail` | 6 | Step/band details for STEPS mode | ✅ YES | ✅ | ❌ | EASY |

## Domain 1b: Reports & Jobs

| # | Table | Prisma Model | Cols | Purpose | Code | API | UI | Difficulty |
|---|-------|-------------|------|---------|------|-----|----|-----------|
| 5 | `report_definitions` | `ReportDefinition` | 10 | Report catalog (code, name, category, params) | ❌ NO | ❌ | ❌ | MED |
| 6 | `report_exports` | `ReportExport` | 12 | Executed report exports with format, status, file | ❌ NO | ❌ | ❌ | MED |
| 7 | `scheduled_jobs` | `ScheduledJob` | 11 | Cron-based job scheduler | ❌ NO | ❌ | ❌ | HARD |
| 8 | `export_history` | `ExportHistory` | 9 | Log of completed exports | ❌ NO | ❌ | ❌ | EASY |
| 9 | `running_activities` | `RunningActivity` | 9 | Real-time background task tracking | ❌ NO | ❌ | ❌ | MED |
| 10 | `contractual_requests` | `ContractualRequest` | 12 | Approval workflow requests with JSON payloads | ❌ NO | ❌ | ❌ | HARD |

## Domain 2: Solar Wallet

| # | Table | Prisma Model | Cols | Purpose | Code | API | UI | Difficulty |
|---|-------|-------------|------|---------|------|-----|----|-----------|
| 11 | `wallet_accounts` | `WalletAccount` | 9 | Per-customer solar wallet (balance, currency) | ✅ PARTIAL | ❌ | ❌ | MED |
| 12 | `wallet_transactions` | `WalletTransaction` | 12 | Append-only wallet transaction log | ❌ NO | ❌ | ❌ | MED |
| 13 | `wallet_balances` | `WalletBalance` | 7 | Daily snapshot of wallet balances | ❌ NO | ❌ | ❌ | EASY |
| 14 | `wallet_allocations` | `WalletAllocation` | 10 | Earmarked funds for specific purposes | ❌ NO | ❌ | ❌ | MED |
| 15 | `wallet_transfers` | `WalletTransfer` | 11 | Cross-account wallet transfers with approval | ❌ NO | ❌ | ❌ | HARD |

## Domain 3: Chilled Water

| # | Table | Prisma Model | Cols | Purpose | Code | API | UI | Difficulty |
|---|-------|-------------|------|---------|------|-----|----|-----------|
| 16 | `chilled_water_configs` | `ChilledWaterConfig` | 13 | Rate config (base/peak/off-peak, allocation method) | ❌ NO | ❌ | ❌ | MED |
| 17 | `chilled_water_readings` | `ChilledWaterReading` | 10 | BTU meter readings per customer | ❌ NO | ❌ | ❌ | MED |
| 18 | `chilled_water_consumptions` | `ChilledWaterConsumption` | 7 | Calculated consumption per period | ❌ NO | ❌ | ❌ | MED |
| 19 | `chilled_water_invoices` | `ChilledWaterInvoice` | 11 | Stand-alone chilled water invoices | ❌ NO | ❌ | ❌ | MED |
| 20 | `chilled_water_allocations` | `ChilledWaterAllocation` | 8 | Proportional allocations for shared systems | ❌ NO | ❌ | ❌ | MED |

## Domain 4: Settlement Engine

| # | Table | Prisma Model | Cols | Purpose | Code | API | UI | Difficulty |
|---|-------|-------------|------|---------|------|-----|----|-----------|
| 21 | `settlement_configs` | `SettlementConfig` | 12 | Settlement formula/rule configuration | ❌ NO | ❌ | ❌ | HARD |
| 22 | `settlement_periods` | `SettlementPeriod` | 9 | Time-bound settlement cycles | ❌ NO | ❌ | ❌ | MED |
| 23 | `settlement_rules` | `SettlementRule` | 13 | Condition-based settlement rules with priority | ❌ NO | ❌ | ❌ | HARD |
| 24 | `settlement_transactions` | `SettlementTransaction` | 11 | Individual settlement line items | ❌ NO | ❌ | ❌ | MED |
| 25 | `settlement_allocations` | `SettlementAllocation` | 6 | Distribution of settlement amounts to targets | ❌ NO | ❌ | ❌ | MED |

## Domain 5: Bill Cycle Governance

| # | Table | Prisma Model | Cols | Purpose | Code | API | UI | Difficulty |
|---|-------|-------------|------|---------|------|-----|----|-----------|
| 26 | `billing_cycles` | `BillingCycle` | 13 | Lifecycle-managed billing runs (OPEN→LOCKED→APPROVED→CLOSED) | ❌ NO | ❌ | ❌ | HARD |
| 27 | `billing_cycle_projects` | `BillingCycleProject` | 6 | Per-project status within a billing cycle | ❌ NO | ❌ | ❌ | MED |
| 28 | `billing_cycle_approvals` | `BillingCycleApproval` | 7 | Approval log for cycle transitions | ❌ NO | ❌ | ❌ | EASY |
| 29 | `billing_cycle_audits` | `BillingCycleAudit` | 7 | Field-level audit of cycle changes | ❌ NO | ❌ | ❌ | EASY |

## Domain 6: Document Engine

| # | Table | Prisma Model | Cols | Purpose | Code | API | UI | Difficulty |
|---|-------|-------------|------|---------|------|-----|----|-----------|
| 30 | `document_templates` | `DocumentTemplate` | 10 | Template store with content + variable schema | ❌ NO | ❌ | ❌ | HARD |
| 31 | `template_versions` | `TemplateVersion` | 7 | Versioned template history with approval | ❌ NO | ❌ | ❌ | MED |
| 32 | `generated_documents` | `GeneratedDocument` | 11 | Rendered output documents (PDF/HTML) | ❌ NO | ❌ | ❌ | MED |
| 33 | `document_audits` | `DocumentAudit` | 5 | Audit log for document actions | ❌ NO | ❌ | ❌ | EASY |

## Domain 7: Invoice Governance

| # | Table | Prisma Model | Cols | Purpose | Code | API | UI | Difficulty |
|---|-------|-------------|------|---------|------|-----|----|-----------|
| 34 | `invoice_hashes` | `InvoiceHash` | 8 | SHA-256 chain for invoice integrity | ❌ NO | ❌ | ❌ | MED |
| 35 | `invoice_qr_codes` | `InvoiceQRCode` | 7 | QR code data for invoice verification | ❌ NO | ❌ | ❌ | EASY |
| 36 | `invoice_generation_batches` | `InvoiceGenerationBatch` | 11 | Batch tracking for mass invoice generation | ❌ NO | ❌ | ❌ | MED |

---

## Summary

| Status | Count | Tables |
|--------|-------|--------|
| ✅ ACTIVE | 3 | Tariff, TariffCharge, TariffChargeDetail |
| ✅ PARTIAL | 1 | WalletAccount |
| ❌ DESIGNED_ONLY | 32 | All others |
| ❌ DEAD_CODE | 0 | — |

**Activation rate**: 3/36 = 8.3% actively coded. 33/36 = 91.7% designed-only or partial.

## Key Finding

Only **Tariff Management** (Domain 1) has live code consuming features schema tables. All other domains — Settlement Engine, Bill Cycle Governance, Document Engine, Invoice Governance, Chilled Water, and Solar Wallet — have zero production code referencing their tables.
