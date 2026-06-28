# SBill vs Meter Verse — Billing Engine Comparison

**Date:** 2026-06-25
**Reference:** `reports/sbill-billing-parity-board.md` (72% parity baseline)

---

## 1. TARIFF STRUCTURE

### SBill (Legacy)
- Hierarchical tariff catalog organized by development (Palm Hills, Estates, etc.)
- Tariffs bound to meter type + unit type + customer category
- Rich tier engine with up to 10 consumption slabs per charge
- Full time-of-use (peak/off-peak) rate schedules
- Demand charges (kW/kVA) for commercial accounts
- Solar net metering with export/import/generation registers

### Meter Verse (`backend/src/billing/tariff-engine.service.ts`)

| Feature | Implementation | File |
|---|---|---|
| Rate-per-unit (flat) | `TariffPlan.ratePerUnit` + `TariffEngineService` fallback | `tariff-engine.service.ts:32-38` |
| Tiered pricing (block rates) | `TariffCharge.chargeMode = 'STEPS'` with `TariffChargeDetail[]` (stepFrom/stepTo/stepRate/stepAmount) | `tariff-engine.service.ts:68-84` |
| Flat fee | `chargeMode = 'FLAT'` | `:56-60` |
| Static charge | `chargeMode = 'STATIC'` | `:86-90` |
| Per-unit charge | `chargeMode = 'PER_UNIT'` | `:62-66` |
| Zero/minimum charge | `chargeMode = 'ZERO'` (e.g., 9000 milliemes = 9 EGP minimum) | `:92-99` |
| Percentage settlement | `settlementType = 'PERCENTAGE'` → group 5 | `:127-128` |
| Time-of-use | ❌ Not implemented | — |
| Demand charges | ❌ Not implemented | — |
| Solar net metering | ❌ Not implemented | — |

### Charge Group Classification (`tariff-engine.service.ts:126-133`)

| Group | Mode/Settlement | Lines |
|---|---|---|
| 0 | PER_UNIT, STEPS | Consumption charges |
| 1 | FLAT | Fees, stamps |
| 3 | STATIC | Static charges |
| 4 | FLAT + FIXED | Admin/issue fees |
| 5 | PERCENTAGE | Percentage-based |
| 7 | Fallback | Unclassified |

---

## 2. TIER / STEP LOGIC

### Meter Verse (`TariffEngineService`)
```
STEPS mode: Consumption is split across [stepFrom → stepTo] ranges
Each step: stepQty × stepRate + optional stepAmount (flat per step)
isPercentage flag allows percentage-of-consumption steps
```
```typescript
// tariff-engine.service.ts:69-83
for (const detail of charge.details) {
  const stepQty = Math.min(remaining, stepTo - stepFrom);
  lineAmount += isPct ? stepAmount : (stepQty × stepRate) + stepAmount;
}
```

### Meter Verse (`TariffCalculationService`)
```
Separate tier engine with chargeGroup routing:
- chargeGroup=0 (CONSUMPTION) → consumptionCharge using tiers
- chargeGroup=2,3 (CUSTOMER_SERVICE) → customerServiceFees using tiers
- chargeGroup=4 (ADMIN/ISSUE_FEES) → fixed charges
- chargeGroup=1 (FEES/OTHER) → stamps, misc fees
- chargeGroup=5 (PERCENTAGE) → % of consumption
- chargeGroup=6 (SETTLEMENT) → credit/debit settlement
```
```typescript
// tariff-calculation.service.ts:211-230
private calculateTieredCharge(consumption, tiers): number {
  for (const tier of tiers.sort((a,b) => a.fromUsage - b.fromUsage)) {
    const tierUnits = Math.min(remaining, tierMax - tier.fromUsage + 1);
    total += tierUnits × rateValue + extraAmount;
  }
}
```

### SBill Comparison
| Aspect | SBill | Meter Verse |
|---|---|---|
| Max tiers per charge | 10 | Unlimited (via TariffChargeDetail) |
| Tier intervals | from/to usage | stepFrom/stepTo (Decimal) |
| Rate types | Rate per unit + fixed per tier | stepRate + stepAmount |
| Percentage tiers | Yes | isPercentage flag |
| Conditional tiers | Based on customer category | Not yet — no customer-group routing |
| Commercial demand | kW/kVA tiers | ❌ Missing |

---

## 3. CHARGE TYPES CATALOG

### Meter Verse Supported (`tariff-engine.service.ts`)

| Charge Code | Mode | Example |
|---|---|---|
| `FLAT` | Flat fee | Admin fee = 50 EGP |
| `PER_UNIT` | Per unit | Consumption = 500 units × 1.5 EGP |
| `STEPS` | Tiered | First 100 @ 0.50, next 200 @ 0.75, above @ 1.00 |
| `STATIC` | Fixed static | Service fee = 10 EGP |
| `ZERO` | Minimum charge | Minimum = 9 EGP when consumption = 0 |
| `PERCENTAGE` | % of consumption | 2% of consumption charge |
| `MIN` adj | Min charge adjustment | Auto-generated via `_MIN` suffix |

### Charges Applied During Invoice Generation (`billing.controller.ts:61-178`)

1. **Consumption charge** — via `TariffEngineService.calculateCharges()`
2. **Tax (VAT)** — if `project.taxEnabled`, applied as `subtotal × (taxRate / 100)`
3. **Water difference variance** — via `WaterDifferencePolicy.apply()` when `waterDiffMode = 'billable'`
4. **Invoice lines** — persisted in `InvoiceLine` from tariff engine results
5. **Scaling note:** All amounts are in milliemes (EGP × 1000) per the `TariffCalculationService` JSDoc

---

## 4. TAXES

### SBill
- VAT calculated per charge line (not just subtotal)
- Multiple tax rates per invoice (standard VAT + stamp tax + municipality fee)
- Tax exemptions per customer category

### Meter Verse (`billing.controller.ts:83`)
```typescript
const taxRate = project.taxEnabled ? Number(project.taxRate ?? 0) / 100 : 0;
const tax = subtotal × taxRate;
```
- Single tax rate per project (flat percentage on subtotal)
- Tax applied at invoice level, not per charge line
- No separate stamp/municipality fee support
- `TariffCalculationService` does support `taxRate` parameter (`:59`) but it is applied on `subtotal`

### Gap: Multi-tier tax calculation ❌

---

## 5. PENALTIES

### SBill
- Late payment penalty: % of overdue amount per month
- Reconnection fee: fixed charge after disconnection
- Service suspension fee
- Cheque return penalty

### Meter Verse
- **Late payment penalty:** ❌ Not implemented
- **Reconnection fees:** ❌ Not implemented
- **Early payment discount:** ❌ Not implemented

### Gap: No penalty engine exists — all 3 are missing

---

## 6. INVOICE CALCULATION

### Invoice Generation Flow (`billing.controller.ts:generateInvoices`)

```
1. Resolve billing period (by ID or periodCode)
2. Resolve project (for taxRate, waterDiffMode)
3. Fetch active meters for project
4. Fetch valid readings in period (status = 'valid', date range = period)
5. Exclude meters that already have invoices for this period
6. For each meter:
   a. Sum consumption from all readings: consumptionValue
   b. Skip if consumption ≤ 0
   c. Run TariffEngineService.calculateCharges() for STEPS/FLAT/STATIC/PER_UNIT/ZERO
   d. Fallback: TariffService.getEffectiveTariff() for flat rate
   e. Calculate tax = subtotal × taxRate
   f. Generate invoice number: {PREFIX}-{YEAR}-{SEQUENCE}
   g. Create Invoice (status: draft)
   h. Create InvoiceLine[] from charge results
   i. Apply WaterDifferencePolicy (if water_main + billable mode)
7. Return { batchId, generatedCount }
```

### Invoice State Machine (`billing-state.service.ts`)

```
draft → pending_approval, issued, cancelled, void
pending_approval → issued, cancelled
issued → partially_paid, paid, cancelled, void
partially_paid → paid, cancelled
paid → cancelled (via reverse)
overdue → partially_paid, paid, cancelled
cancelled → (terminal)
void → (terminal)
```

### Invoice Issue Flow (`billing.controller.ts:184-210`)
```
1. Invoice must be in 'draft' status
2. If total > 10,000 EGP → requires approval (returns 'approval_required')
3. On issue: status = 'issued', immutableAt set, ledger entry created
```

### Payment Allocation (`billing.controller.ts:371-526`)
- **Oldest-due-first** (default): invoices sorted by `dueAt ASC, createdAt ASC`
- **Explicit**: caller provides allocation list
- Partial payment → status = `partially_paid`
- Full payment → status = `paid`
- Allocation mismatch validated (`allocation_total !== amount → 422`)

---

## 7. LEDGER SERVICE

### Implementation (`ledger.service.ts`)
- Append-only: only exposes `addEntry()` — no update/delete
- Running balance computed from previous entry:
```typescript
const prevBalance = lastEntry ? Number(lastEntry.runningBalance) : 0;
const runningBalance = prevBalance + amountDelta;
```
- Supports entry types: `invoice_charge`, `adjustment_debit`, `adjustment_credit`, `payment_credit`, `payment_reversal`
- Reference types: `invoice`, `payment`, `adjustment`
- Used by: invoice issue, payment recording, invoice reversal, invoice adjustments

### Customer Statement View (`prisma view`)
- Derived view: `customer_statement_view` with debit/credit/running_balance
- Generated via `Meter_Verse_assignment_active_view`, `sim_assignment_active_view`

---

## 8. FEATURE GAP SUMMARY

| Category | SBill | Meter Verse | Impact | Effort |
|---|---|---|---|---|
| **Tariffs** | Tiered, TOU, demand, solar | Tiers + flat + static + min | Low | 3-5 days |
| **Taxes** | Per-line VAT, stamp, municipality | Single flat % on subtotal | Medium | 3 days |
| **Penalties** | Late, reconnect, cheque return | None | Medium | 2 days |
| **Discounts** | Early payment | None | Low | 1 day |
| **Water billing** | Main+child via formula | WaterDifferencePolicy | ✅ Match | — |
| **Multi-utility** | Single bill across utilities | Per-utility invoice only | Medium | 3 days |
| **Scheduling** | Bill run scheduler | Manual trigger only | Low | 2 days |
| **Pro-ration** | Mid-period move-in/out | None | Medium | 4 days |
| **Deposits** | Security deposit mgmt | None | Low | 3 days |
| **Demand** | kW/kVA demand charges | None | Low | 2 days |

**Current parity: 72%** (26 of 36 functions matched per `sbill-billing-parity-board.md`)
**Remaining effort to close all gaps: ~28 days**

---

## 9. KEY FILE MAPPING

| Component | File |
|---|---|
| Tariff engine (STEPS/FLAT/STATIC/PER_UNIT/ZERO) | `backend/src/billing/tariff-engine.service.ts` |
| Tariff calculation (tier groups, multi-charge) | `backend/src/billing/tariff-calculation.service.ts` |
| Tariff lookup | `backend/src/billing/tariffs/tariff.service.ts` |
| Consumption calculation (flat/tier) | `backend/src/billing/calculation-engine.service.ts` |
| Invoice generation + issue + cancel + reverse | `backend/src/billing/billing.controller.ts` |
| Invoice state machine | `backend/src/billing/billing-state.service.ts` |
| Payment + allocation | `backend/src/billing/billing.controller.ts:371-526` |
| Ledger (append-only, running balance) | `backend/src/billing/ledger.service.ts` |
| Water difference variance policy | `backend/src/billing/water-difference.policy.ts` |
| Billing period management | `backend/src/billing/periods/period.service.ts` |
| Tariff Studio controller | `backend/src/billing/tariff-studio.controller.ts` |
| Prisma schema (all billing models) | `backend/prisma/schema.prisma` |
| T086+ billing models (Tariff, TariffCharge, Wallet, etc.) | `backend/prisma/schema.prisma:1277+` (features schema) |
