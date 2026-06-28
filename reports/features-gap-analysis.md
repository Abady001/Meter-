# F2: FEATURES Schema Gap Analysis

**Date**: 2026-06-20  
**Scope**: Detailed gap analysis between `features` schema design and SBill reference system behavior  
**Source**: `backend/prisma/schema.prisma` (features section), `backend/src/billing/`, `backend/src/settlement/`, `reference/sbill/`

---

## 1. Bill Cycle Gap Analysis

### Current State
- `features` has `BillingCycle` (lines 1748–1771) with statuses: `OPEN`, `LOCKED`, `APPROVED`, `CLOSED`, `CANCELLED`
- `BillingCycleProject` (lines 1773–1786) links cycles to projects/areas
- `BillingCycleApproval` (lines 1788–1802) for workflow approvals
- `BillingCycleAudit` (lines 1804–1818) for audit trail
- **Zero TypeScript code** references any of these models

### Current Implementation (sim_system)
- `BillingPeriod` model in `sim_system` schema (lines 469–484): `open`/`in_review`/`closed` statuses
- `PeriodService` at `backend/src/billing/periods/period.service.ts`: create + getActivePeriod — writes to `sim_system.billing_periods`
- `BillingController` at `billing.controller.ts:433–457`: `POST /periods`, `GET /periods` — uses `sim_system.billing_periods`

### Gaps vs SBill

| Feature | features Schema | SBill Reference | Gap |
|---------|----------------|----------------|------|
| **Statuses** | OPEN/LOCKED/APPROVED/CLOSED/CANCELLED | DRAFT/RUNNING/COMPLETED/POSTED/CANCELLED/REVERSED | Missing RUNNING, COMPLETED, POSTED, REVERSED |
| **Utility tracking** | Not present | Per-utility cycles | **MISSING** — no utilityType on cycle |
| **Month/Year** | Not present | Month/year on cycle | **MISSING** |
| **Counts** | Not present | success/failed/cancelled counts | **MISSING** |
| **Service type** | Not present | Radio select for service type | **MISSING** |
| **Rebill workflow** | Not present | Cancel + regenerate | **MISSING** |
| **Approval workflow** | BillingCycleApproval exists | Multi-level approval | Exists in schema, **unused** |
| **Audit** | BillingCycleAudit exists | State change log | Exists in schema, **unused** |

### Gap Severity: **HIGH** — Core workflow cannot function without bill cycles

---

## 2. Tariff Engine Gap Analysis

### Current State
- `TariffEngineService` at `tariff-engine.service.ts:19` fully supports all 5 charge modes
- Queries `features.tariffs` → `features.tariff_charges` → `features.tariff_charge_details`
- Falls back to `sim_system.tariff_plans` when no features tariff found
- Has `minCharge` support (line 113)
- Has `chargeModeToGroup` mapping (line 124)

### Current Implementation (sim_system)
- `TariffPlan` model (lines 451–467): flat rate per unit only
- `TariffService` at `tariffs/tariff.service.ts`: `getEffectiveTariff()` — reads `sim_system.tariff_plans`
- `BillingController` at `billing.controller.ts:392–431`: `POST /tariffs`, `GET /tariffs` — writes/reads `sim_system.tariff_plans`
- `BillingController` at `billing.controller.ts:519–526`: `POST /tariffs/simulate` — uses `TariffEngineService.calculateCharges`

### Gaps vs SBill

| Feature | features Schema | SBill Reference | Gap |
|---------|----------------|----------------|------|
| **Charge types** | All 5 (STEPS/FLAT/STATIC/PER_UNIT/ZERO) | Same 5 types | ✅ **MATCH** |
| **Versioning** | TariffVersion model (lines 1236–1249) | Versioned with start/endDate | ✅ Schema exists, **unused** |
| **API CRUD** | No endpoints | Full tariff management UI | **MISSING** |
| **Frontend** | None | Tariff management pages | **MISSING** |
| **Version comparison** | Not implemented | For rebilling | **MISSING** |
| **Settlement types** | TariffSettlementType enum (FIXED/PERCENTAGE/ONE_TIME) | فرق تعريفة (Tariff Diff), تسويه استهلاك (Consumption Settlement) | Schema covers it, **unused** |

### Gap Severity: **MEDIUM** — Engine works, but management layer is missing

---

## 3. Ledger Gap Analysis

### Current State
- `LedgerService` at `ledger.service.ts:10–39`: `addEntry()` writes to `sim_system.customer_ledger_entries`
- Computes `runningBalance` from last entry (line 24)
- Used by `BillingController.issueInvoice()` (line 176), `addAdjustment()` (line 256), `createPayment()` (line 377)

### Current Implementation (sim_system)
- `CustomerLedgerEntry` model (lines 576–590): customerId, projectId, entryType, referenceType, referenceId, amountDelta, runningBalance
- No query endpoints for balance history or customer statement

### Gaps

| Feature | Current | Required | Gap |
|---------|---------|----------|------|
| **Balance history** | Not exposed via API | GET /customers/:id/ledger | **MISSING** |
| **Running balance query** | Not exposed via API | GET /customers/:id/balance | **MISSING** |
| **Customer statement** | Not exposed via API | GET /customers/:id/statement | **MISSING** |
| **Frontend balance UI** | None | Customer360 balance card | **MISSING** |
| **Date range filtering** | Not implemented | Filter by period | **MISSING** |

### Gap Severity: **MEDIUM** — Service exists, no query layer

---

## 4. Payment Allocation Gap Analysis

### Current State
- `BillingController.createPayment()` at `billing.controller.ts:269–390`: full payment creation with **oldest-due-first** allocation algorithm (lines 316–351)
- Writes to `sim_system.payment_allocations` (lines 565–574)
- Supports both `oldest_due_first` and `explicit` allocation modes

### Gaps

| Feature | Current | Required | Gap |
|---------|---------|----------|------|
| **Allocation algorithm** | Oldest-due-first implemented | Same | ✅ **MATCH** |
| **Partial payment** | Supported | Same | ✅ **MATCH** |
| **Wallet payment** | Not implemented | Wallet deduction | **MISSING** |
| **Frontend allocation view** | None | Payment allocation UI | **MISSING** |

### Gap Severity: **LOW** — Core logic is implemented

---

## 5. Settlement Gap Analysis

### Current State
- `features` has **5 tables**: `settlement_configs`, `settlement_periods`, `settlement_rules`, `settlement_transactions`, `settlement_allocations`
- `SettlementConfig` (lines 1639–1660) with rule types FIXED_PERCENTAGE/TIERED/FORMULA/MANUAL
- `SettlementController` at `settlement/settlement.controller.ts` — **writes to `sim_system.invoice`** with `utilityType: 'settlement'`
- **Zero code** writes to the `features` settlement tables

### Gaps vs SBill

| Feature | Current | SBill Reference | Gap |
|---------|---------|-----------------|------|
| **Settlement types** | SettlementRuleType enum | فرق تعريفة, تسويه استهلاك | Schema covers it |
| **Settlement posting** | Creates invoice with utilityType='settlement' | Dedicated settlement workflow | Uses wrong table |
| **Settlement periods** | SettlementPeriod exists | Monthly settlement | **Unused** |
| **Settlement rules** | SettlementRule exists | Formula-based | **Unused** |
| **Settlement allocations** | SettlementAllocation exists | Per-customer allocation | **Unused** |

### Gap Severity: **HIGH** — Full engine exists but is completely disconnected

---

## 6. Invoice Governance Gap Analysis

### Current State
- `InvoiceGenerationBatch` (lines 1930–1950) — tracks batch generation with success/fail counts
- `InvoiceHash` (lines 1899–1913) — blockchain-style hash chain
- `InvoiceQRCode` (lines 1915–1928) — QR code data
- **Zero code** references these tables

### Gaps

| Feature | Current | Required | Gap |
|---------|---------|----------|------|
| **Batch tracking** | InvoiceGenerationBatch exists | Track batch runs | Schema exists, **unused** |
| **Invoice hashing** | InvoiceHash exists | Tamper-proof invoices | Schema exists, **unused** |
| **QR codes** | InvoiceQRCode exists | Digital invoice verification | Schema exists, **unused** |

### Gap Severity: **LOW** — Nice-to-have integrity features

---

## 7. Document Engine Gap Analysis

### Current State
- `DocumentTemplate` (lines 1822–1841) with template variables
- `TemplateVersion` (lines 1843–1857) with versioning
- `GeneratedDocument` (lines 1859–1881) with DRAFT/FINAL/ARCHIVED statuses
- `DocumentAudit` (lines 1883–1895)
- **Zero code** references these tables

### Gap Severity: **LOW** — Future feature

---

## 8. Chilled Water Gap Analysis

### Current State
- 5 tables: configs, readings, consumptions, invoices, allocations
- ChilledWaterAllocationMethod: PROPORTIONAL/FIXED/METERED
- **Zero code** references these tables
- Standalone controller at `chilled-water/chilled-water.controller.ts` (imported but likely uses sim_system)

### Gap Severity: **MEDIUM** — Domain-specific module, separate from core billing

---

## Summary: Gap Prioritization

| Priority | Domain | Severity | Effort | Impact |
|----------|--------|----------|--------|--------|
| P0 | **Bill Cycle** | HIGH | 2 days | Blocks all billing workflow |
| P0 | **Settlement** | HIGH | 3 days | Wrong table in use |
| P1 | **Tariff Management API** | MEDIUM | 2 days | No CRUD for tariffs |
| P1 | **Ledger Queries** | MEDIUM | 1 day | No balance history API |
| P2 | **Invoice Governance** | LOW | 1 day | Batch tracking |
| P2 | **Document Engine** | LOW | 3 days | Future feature |
| P3 | **Chilled Water** | MEDIUM | 2 days | Domain-specific |
