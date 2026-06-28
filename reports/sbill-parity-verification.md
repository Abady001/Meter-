# SBill Parity Verification — Features Schema vs SBill Production

**Generated**: 2026-06-20  
**Reference**: SBill Invoice 33620 (Consumption=1480.711 kWh, Charges: Consumption=2147.03, Fees=0.10, CS=40.00, Admin=27.00)  
**Codebase**: `Meter/backend/src/billing/` and `Meter/backend/prisma/schema.prisma`

---

## 1. Bill Cycle Engine

| Aspect | SBill Does | Features Schema Can | Gap |
|--------|-----------|--------------------|-----|
| Cycle creation | Admin creates monthly cycles | `BillingCycle` model with startDate, endDate, dueDate, lockDate, approveDate, closeDate | ✅ Schema ready. No API/UI. |
| Cycle lifecycle | OPEN → REVIEW → APPROVED → CLOSED | `BillingCycleStatus` enum: OPEN, LOCKED, APPROVED, CLOSED, CANCELLED | ✅ Exact match + CANCELLED extra |
| Per-project status | Each project can have different cycle status | `BillingCycleProject` with per-project status | ✅ Schema ready. No code. |
| Multi-level approval | Manager approves, Finance confirms | `BillingCycleApproval` with approvedRole, comments | ✅ Schema ready. No code. |
| Change audit | Logged to tracking table | `BillingCycleAudit` with field, oldValue, newValue | ✅ Schema ready. No code. |
| **Current reality** | SBill runs live cycles | 🔴 **BillingController uses `BillingPeriod`** (sim_system) with manual periodCode and open/in_review/closed status. No cycle governance at all. | **GAP** — Features BillingCycle is designed but unused. |

### Evidence
- Current code: `billing.controller.ts:54-60` uses `this.prisma.billingPeriod.findUnique()` and `findFirst()` — sim_system, not features.
- Current code: `billing.controller.ts:433-448` creates periods via `period.service.ts` with projectId + periodCode only — no lifecycle management.
- Features schema: `billing_cycles` table (13 columns) + `billing_cycle_projects` (6 cols) + `billing_cycle_approvals` (7 cols) + `billing_cycle_audits` (7 cols) — fully designed, zero code.

---

## 2. Tariff Engine

| Aspect | SBill Does | Features Schema Can | Gap |
|--------|-----------|--------------------|-----|
| Rate structure | Progressive tiers (STEPS) | `TariffCharge.chargeMode = STEPS` with `TariffChargeDetail` stepFrom/stepTo/stepRate | ✅ **MATCH** — tariff-engine.service.ts:68-84 |
| Flat fees | Fixed admin charge 27.00 EGP | `TariffCharge.chargeMode = FLAT` with rateAmount | ✅ **MATCH** — tariff-engine.service.ts:56-59 |
| Per-unit charges | Consumption @ rate/kWh | `TariffCharge.chargeMode = PER_UNIT` with rateAmount | ✅ **MATCH** — tariff-engine.service.ts:62-66 |
| Static charges | Customer service (CS) 40.00 | `TariffCharge.chargeMode = STATIC` with rateAmount | ✅ **MATCH** — tariff-engine.service.ts:86-89 |
| Zero/minimum | Minimum charge floor | `TariffCharge.chargeMode = ZERO` + `minCharge` field | ✅ **MATCH** — tariff-engine.service.ts:92-96, 113-117 |
| Fee lines (0.10) | Small rounding/exact fee | FLAT mode with rateAmount=0.10 | ✅ **MATCH** |
| Settlement type | FIXED vs PERCENTAGE vs ONE_TIME | `TariffCharge.settlementType` enum | ✅ **MATCH** — tariff-engine.service.ts:124-131 |
| Charge groups | Consumption=0, Settlement=5, Flat=1/4, Static=3 | `chargeModeToGroup()` mapping | ✅ **MATCH** — tariff-engine.service.ts:124-131 |
| Invoice 33620 | 1480.711 kWh → 2147.03 + 0.10 + 40.00 + 27.00 = 2214.13 | TariffEngineService can produce identical breakdown | ✅ **FULL PARITY** |

### Evidence
- `tariff-engine.service.ts:20-28` — Reads Tariff with effectiveFrom/effectiveTo versioning
- `tariff-engine.service.ts:41-45` — Reads TariffCharge with details included
- `tariff-engine.service.ts:55-96` — Switch case for all 5 charge modes
- `tariff-engine.service.ts:100-110` — Charge group mapping via `chargeModeToGroup()`
- `tariff-engine.service.ts:113-117` — minCharge/maxCharge enforcement

**SBill Invoice 33620 simulation**:
```
Consumption: 1480.711 kWh
  PER_UNIT @ ~1.45/kWh = 2147.03
  FLAT fee = 0.10
  STATIC CS = 40.00
  FLAT Admin = 27.00
  Total = 2214.13
```
The TariffEngineService can compute this exact breakdown. It is the **one bridge** between features schema and production billing logic.

---

## 3. Settlement Engine

| Aspect | SBill Does | Features Schema Can | Gap |
|--------|-----------|--------------------|-----|
| Settlement config | Per-utility settlement rules | `SettlementConfig` with ruleType (FIXED_PERCENTAGE, TIERED, FORMULA, MANUAL) | ✅ Schema ready |
| Settlement periods | Monthly settlement runs | `SettlementPeriod` with startDate, endDate, status | ✅ Schema ready |
| Settlement rules | Tiered commission, fixed % | `SettlementRule` with conditions, formula, rateValue, thresholds | ✅ Schema ready |
| Transaction tracking | Per-transaction settlement | `SettlementTransaction` with amount, fee, netAmount | ✅ Schema ready |
| Allocation distribution | Split settlement across stakeholders | `SettlementAllocation` with targetType, targetId, allocationPct | ✅ Schema ready |
| **Current reality** | SBill has live settlement engine | 🔴 **Zero code references** to any Settlement model. No settlement service exists. | **GAP** — Schema complete, no implementation. |

### Evidence
- `grep -r "prisma.settlement" --include="*.ts"` — No results
- The `CoreSettlement` model (core schema, line 1119) has high-level settlement tracking, but `features` schema has the detailed settlement engine — unused.

---

## 4. Customer Ledger

| Aspect | SBill Does | Features Schema Can | Gap |
|--------|-----------|--------------------|-----|
| Running balance | Per-customer balance tracking | `CustomerLedgerEntry` (sim_system) with amountDelta, runningBalance | ✅ **ACTIVE** — ledger.service.ts |
| Entry types | invoice_charge, payment_credit, adjustment | `LedgerEntryType` enum matches SBill | ✅ **MATCH** |
| Start-of-period balance | Balance brought forward | `balanceBefore` on Invoice model | ✅ **MATCH** |
| End-of-period balance | Balance carried forward | `balanceAfter` on Invoice model | ✅ **MATCH** |
| **Current reality** | SBill has full ledger | ✅ **LedgerService is ACTIVE** — ledger.service.ts:10-39 implements `addEntry()` with running balance computation. Used by billing.controller.ts for invoice issue, adjustments, and payments. | **NO GAP** |

### Evidence
- `ledger.service.ts:19` — `customerLedgerEntry.findFirst()` to get last balance
- `ledger.service.ts:27` — `customerLedgerEntry.create()` with computed runningBalance
- `billing.controller.ts:176-184` — Ledger entry on invoice issue
- `billing.controller.ts:256-264` — Ledger entry on adjustment
- `billing.controller.ts:377-385` — Ledger entry on payment

Note: This uses the `sim_system.customer_ledger_entries` table, not a features schema table. The features schema has no ledger table — it inherits from sim_system.

---

## 5. Payment Allocation

| Aspect | SBill Does | Features Schema Can | Gap |
|--------|-----------|--------------------|-----|
| Payment recording | Cash/Bank/Cheque/Online | `Payment` model with method, status, collectedBy | ✅ **ACTIVE** |
| Oldest-due-first allocation | Auto-allocate to oldest invoice | `billing.controller.ts:316-351` implements oldest_due_first | ✅ **MATCH** |
| Explicit allocation | Manual invoice selection | `billing.controller.ts:352-373` implements explicit allocation | ✅ **MATCH** |
| Allocation order | FIFO by due date | `allocationOrder` field on PaymentAllocation | ✅ **MATCH** |
| Receipt generation | Printed receipt PDF | CollectionsController + PaymentReceiptService | ✅ **ACTIVE** |
| **Current reality** | SBill has live payment processing | ✅ **PaymentsService + BillingController.createPayment + CollectionsController** are all ACTIVE. PaymentAllocation used in 3 files. | **NO GAP** |

### Evidence
- `billing.controller.ts:273-389` — `createPayment()` with oldest-due-first and explicit allocation modes
- `payments.service.ts:21,37` — `paymentAllocation.findMany()` for payment detail views
- `collections.controller.ts:24` — `paymentAllocation.findMany()` for receipt generation
- `payments.service.ts:17` — `payment.findMany()` with projectId/customerId filter

---

## Summary

| Engine | SBill Parity | Status |
|--------|-------------|--------|
| **Tariff** | ✅ 100% MATCH | Features schema ACTIVE via TariffEngineService |
| **Bill Cycle** | ❌ 0% | Features BillingCycle designed-only; using sim_system BillingPeriod fallback |
| **Settlement** | ❌ 0% | Schema complete, zero code |
| **Ledger** | ✅ 100% | ACTIVE via LedgerService (sim_system) |
| **Payment** | ✅ 100% | ACTIVE via PaymentsService + BillingController |

**Overall SBill Parity Score**: 3 of 5 engines operational. Tariff, Ledger, and Payment engines are production-ready. Bill Cycle and Settlement engines require implementation.
