# Utility Cycle Readiness — Features Schema BillingCycle Support Assessment

**Generated**: 2026-06-20  
**Reference**: `features` schema `billing_cycles` table, `BillingCycleStatus` enum, `BillingPeriod` (sim_system)  
**Current code**: `billing.controller.ts`, `period.service.ts`

---

## Current State

The `billing_cycles` table (features schema) has **zero code references**. All current billing uses `BillingPeriod` (sim_system) — a simpler model with `periodCode`, `startDate`, `endDate`, and 3-status lifecycle (open/in_review/closed). The features BillingCycle model is designed for governance but unused.

### BillingCycle Schema (features)
```
cycle_code       String   @unique
cycle_name       String
status           BillingCycleStatus  (OPEN|LOCKED|APPROVED|CLOSED|CANCELLED)
start_date       DateTime
end_date         DateTime
due_date         DateTime
lock_date        DateTime?
approve_date     DateTime?
close_date       DateTime?
notes            String?
```

### BillingPeriod Schema (sim_system — active)
```
period_code      String
start_date       DateTime
end_date         DateTime
status           BillingPeriodStatus  (open|in_review|closed)
```
3 fields, 3 statuses — compared to 10 fields, 5 statuses in BillingCycle.

---

## Utility-by-Utility Analysis

### 1. Electricity
**Current**: ✅ Working via `BillingPeriod` (sim_system). `billing.controller.ts:50-60` reads period, generates invoices per meter.  
**Features BillingCycle**: ✅ Fully compatible — monthly cycle fits `start_date`/`end_date`/`due_date` pattern.  
**Missing**: None for basic cycles. For smart-meter hourly reads, `BillingCycle` needs no changes — the cycle defines the billing window, not the read frequency.  
**Gap score**: 0/10 — No gaps.

### 2. Water (Main + Child)
**Current**: ✅ Working via `BillingPeriod`. Water difference policy applied in `billing.controller.ts:138-147`.  
**Features BillingCycle**: ✅ Fully compatible. Water main-vs-child reconciliation is a separate process (water-difference.policy.ts) and doesn't affect the cycle.  
**Missing**: `BillingCycleProject` per-project status useful for mixed water/electricity projects.  
**Gap score**: 0/10 — No gaps.

### 3. Solar
**Current**: ⚠️ Solar uses `SolarWalletService` (solar-wallet.service.ts:13-19) for net metering calculation but does **not** generate solar invoices through the billing cycle. Solar credits are tracked but not billed.  
**Features BillingCycle**: ✅ Compatible — solar net-metering periods could match standard monthly cycles.  
**Missing**: Solar billing integration into cycle. The wallet tables (WalletAccount, WalletTransaction) need a service that participates in cycle-based billing.  
**Required additions**: SolarInvoiceGenerator service that reads net-metering surplus and creates credit invoices.  
**Gap score**: 3/10 — Solar can use same cycle but needs billing logic.

### 4. Chilled Water
**Current**: ❌ No billing implementation. Chilled water has its own schema (5 tables: configs, readings, consumptions, invoices, allocations) but zero code references.  
**Features BillingCycle**: ⚠️ Mixed compatibility. Chilled water operates on **allocation-based billing** (proportional/fixed/metered), not simple consumption × rate.  
**Missing**:
- `ChilledWaterConfig` has its own `billing_cycle` field (varchar, default 'monthly') — duplicated cycle concept
- Chilled water needs allocation engine (ChilledWaterAllocation) before it can participate in BillingCycle
- The `ChilledWaterInvoice` model has its own status field — not linked to BillingCycle status  
**Required additions**: Integration layer between ChilledWaterAllocation → Invoice → BillingCycle. Currently these are separate universes.  
**Gap score**: 7/10 — Major architectural gap. Chilled water billing cycle is disconnected from Features BillingCycle.

### 5. Outdoor Unit
**Current**: ❌ No implementation. `MeterType` enum includes `outdoor_unit` but no billing logic exists.  
**Features BillingCycle**: ✅ Compatible — outdoor unit metering is consumption-based like electricity.  
**Missing**: Rate structure and tariff assignment for outdoor units. No outdoor-unit-specific service exists.  
**Required additions**: OutdoorUnitTariffService, rate configuration UI. The BillingCycle itself needs no changes.  
**Gap score**: 2/10 — BillingCycle compatible, but tariff and service need creation.

### 6. Gas
**Current**: ❌ No implementation. `MeterType` enum includes `gas` but no gas billing logic.  
**Features BillingCycle**: ✅ Compatible — gas is consumption-based billing.  
**Missing**: Gas tariff structure, meter reading integration, rate configuration.  
**Required additions**: GasTariffService, gas rate configuration.  
**Gap score**: 2/10 — BillingCycle compatible, gas tariff/service needed.

### 7. Settlement
**Current**: ❌ No implementation. Settlement has its own schema (5 tables: configs, periods, rules, transactions, allocations). `CoreSettlement` (core schema) provides high-level tracking.  
**Features BillingCycle**: ⚠️ Partial compatibility. Settlement periods are defined separately (`SettlementPeriod`) and have their own lifecycle (pending→settled). They don't align 1:1 with billing cycles.  
**Missing**:
- BillingCycle references area/project — Settlement references area
- Settlement periods may span multiple billing cycles (e.g., quarterly settlement for monthly cycles)
- SettlementRule conditions could reference cycle status (e.g., "settle after cycle APPROVED")  
**Required additions**: SettlementCycleBridge that maps BillingCycle status transitions to SettlementPeriod triggers.  
**Gap score**: 5/10 — BillingCycle and SettlementPeriod need integration.

---

## Readiness Matrix

| Utility | Current Cycle | Features BillingCycle | Gaps | Readiness |
|---------|--------------|----------------------|------|-----------|
| Electricity | ✅ BillingPeriod | ✅ Full support | None | 🟢 **100%** |
| Water | ✅ BillingPeriod | ✅ Full support | None | 🟢 **100%** |
| Solar | ⚠️ Manual calc | ✅ Cycle compatible | Billing logic | 🟡 **70%** |
| Gas | ❌ Not implemented | ✅ Cycle compatible | Tariff + service | 🟡 **80%** |
| Outdoor Unit | ❌ Not implemented | ✅ Cycle compatible | Tariff + service | 🟡 **80%** |
| Chilled Water | ❌ Not implemented | ⚠️ Allocation-based | Disconnected schema | 🔴 **30%** |
| Settlement | ❌ Not implemented | ⚠️ Different lifecycle | Integration bridge | 🟡 **50%** |

---

## What's Missing From Features BillingCycle

1. **Cycle creation API** (POST /billing-cycles) — None exists. Current code creates BillingPeriods.
2. **Status transition workflow** (OPEN→LOCKED→APPROVED→CLOSED) — No state machine exists.
3. **LockDate enforcement** — No code prevents edits after lock date.
4. **Approval workflow** — `BillingCycleApproval` table exists but no approval service.
5. **Per-project cycle management** — `BillingCycleProject` exists but no code manages it.
6. **Cycle-based invoice generation** — Current invoice generation (`billing.controller.ts:50-156`) uses `billingPeriodId`, not `cycleId`.
7. **Cycle audit** — `BillingCycleAudit` table exists but no code writes to it.

## What Would Need Adding

| Component | Priority | Effort |
|-----------|----------|--------|
| `BillingCycleController` (CRUD + lifecycle) | P0 | 2 days |
| `BillingCycleService` (state machine) | P0 | 3 days |
| Cycle→Invoice generation bridge | P0 | 1 day |
| `BillingCycleApprovalService` | P1 | 1 day |
| `BillingCycleAuditService` (auto-write) | P1 | 0.5 day |
| Chilled water cycle integration | P2 | 3 days |
| Settlement cycle bridge | P2 | 2 days |
| Solar cycle integration | P2 | 1 day |

## Recommendation

The `BillingCycle` schema is well-designed and supports all 7 utilities at the schema level. The gap is **not in the data model** — it's in the absence of a cycle management service. The highest-priority addition is a BillingCycleController + Service that replaces the current ad-hoc BillingPeriod usage.
