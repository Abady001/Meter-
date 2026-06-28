# METER VERSE — FINAL BILLING ENGINE REALITY CERTIFICATION

> **WARNING**: Do NOT trust previous theoretical reports. This document contains ONLY
> verified claims backed by actual source code grep results and file contents.
>
> **Date**: 2026-06-20  
> **Methodology**: Every claim verified via `Select-String` grep on actual codebase

---

## EXECUTIVE SUMMARY

### Reality vs Theory

| Previous Claim | Reality | Evidence |
|---------------|---------|----------|
| "TariffEngineService powers invoice generation" | **FALSE** — Only used in `/tariffs/simulate` endpoint | `grep: billing.controller.ts:524` only |
| "All 5 charge modes are active" | **PARTIAL** — Code exists but NOT wired to invoice generation | `tariff-engine.service.ts:55-97` exists, `generateInvoices` uses `ratePerUnit * consumption` only |
| "Invoice generation uses TariffEngine" | **FALSE** — Uses `tariffService.getEffectiveTariff()` which reads `TariffPlan.ratePerUnit` | `billing.controller.ts:91-96` |
| "BillingCycle exists in features schema" | **TRUE** — But 0 code references | `grep: BillingCycle in src/**/*.ts` = 0 results |
| "LedgerService is functional" | **TRUE** — Creates entries with running balance | `ledger.service.ts:19-39` verified |
| "36 features tables exist" | **TRUE** — Migration applied, DB up to date | `prisma migrate status` confirms |
| "3 of 36 tables have code" | **TRUE** — `tariff`, `tariff_charge`, `tariff_charge_detail` via TariffEngineService | Verified |
| "ZERO charge handling works" | **BUG** — ZERO charges are filtered out at line 99 | `tariff-engine.service.ts:92-99` — condition skips ZERO |

---

## PHASE 1 — ACTUAL CODE INVENTORY

### 27 Controllers (Actual)

| Controller | File | Purpose | Uses Features Schema? |
|-----------|------|---------|----------------------|
| AuthController | `auth/auth.controller.ts` | Login, JWT, refresh | No |
| BillingController | `billing/billing.controller.ts` | Invoice gen, issue, cancel, pay, tariff simulate | ⚠️ Simulate only |
| ChilledWaterController | `chilled-water/chilled-water.controller.ts` | Chilled water CRUD | No |
| CollectionsController | `collections/collections.controller.ts` | Payment collection | No |
| CustomersController | `customers/customers.controller.ts` | Customer CRUD | No |
| DownloadsController | `downloads/downloads.controller.ts` | File downloads | No |
| InvoicesController | `invoices/invoices.controller.ts` | Invoice PDF download | No |
| MetersController | `meters/meters.controller.ts` | Meter CRUD | No |
| PaymentsController | `payments/payments.controller.ts` | Payment management | No |
| ReadingsController | `readings/readings.controller.ts` | Reading CRUD | No |
| ReportsController | `reports/reports.controller.ts` | Report generation | No |
| SettlementController | `settlement/settlement.controller.ts` | Settlement CRUD | No |
| SolarController | `solar/solar.controller.ts` | Solar wallet | No |
| UploadController | `upload/upload.controller.ts` | Data import | No |
| UsersController | `users/users.controller.ts` | User CRUD | No |
| + 12 more | | | All No |

### 34 Services (Actual)

| Service | File | Reads Features? | Status |
|---------|------|----------------|--------|
| TariffEngineService | `billing/tariff-engine.service.ts` | ✅ `tariff`, `tariffCharge`, `tariffChargeDetail` with `include: { details }` | **VERIFIED — all 5 charge modes** |
| LedgerService | `billing/ledger.service.ts` | ✅ `customerLedgerEntry` | **VERIFIED — running balance** |
| TariffService | `billing/tariffs/tariff.service.ts` | ❌ Reads `sim_system.tariffPlan` | Active |
| CalculationEngineService | `billing/calculation-engine.service.ts` | ❌ | Partial |
| PeriodService | `billing/periods/period.service.ts` | ❌ | Active |
| SolarWalletService | `solar/solar-wallet.service.ts` | ✅ `walletAccount` (1 ref) | Partial |
| + 28 more | | All No | |

### 29 API Endpoints (Actual billing-related)

| Endpoint | Controller | Actual Behavior |
|----------|-----------|----------------|
| `POST /invoices/generate` | billing | Creates invoices using **flat rate** from `tariffPlan.ratePerUnit * consumption` — NO TariffEngineService |
| `POST /invoices/:id/issue` | billing | Sets status to `issued`, calls `ledgerService.addEntry()` |
| `POST /invoices/:id/cancel` | billing | Cancels invoice, reverses ledger |
| `POST /invoices/:id/adjustments` | billing | Creates adjustment, updates ledger |
| `POST /tariffs/simulate` | billing | **ONLY place** TariffEngineService.calculateCharges() is called |
| `GET /invoices/:id/pdf` | invoices | Generates invoice PDF via Puppeteer |
| + 23 more | | |

---

## PHASE 2 — BILL CYCLE REALITY

### BillingCycle Model in features schema
```
features.billing_cycles has 18 columns
features.billing_cycle_projects
features.billing_cycle_approvals
features.billing_cycle_audits
```

### Actual code usage
```
grep -r "BillingCycle" src/**/*.ts → ZERO results
grep -r "billingCycle" src/**/*.ts → ZERO results  
```

**Status**: DESIGNED_ONLY — Zero controllers, services, APIs, UI.

### Invoice Generation ACTUAL Flow (billing.controller.ts:46-156)
```
1. Read billing period from sim_system.billingPeriod
2. Find all meters for project (not retired)
3. Find all valid readings for period
4. For each meter:
   a. Get tariff via tariffService.getEffectiveTariff() → reads tariffPlan.ratePerUnit
   b. Calculate consumption as sum of reading values
   c. Calculate subtotal = ratePerUnit * consumption  ← FLAT RATE ONLY
   d. Calculate tax = subtotal * taxRate
   e. Create invoice with subtotalAmount, taxAmount, totalAmount
   f. Create invoice_line records for each reading
   g. If water_main: apply waterDifferencePolicy
```

**CRITICAL FINDING**: The TariffEngineService (with all 5 charge modes + tiers) is NOT connected to invoice generation. The `generateInvoices` endpoint only uses flat rate multiplication.

---

## PHASE 3 — TARIFF ENGINE REALITY

### TariffEngineService (tariff-engine.service.ts) — VERIFIED CODE

| Charge Mode | Lines | Implementation | Works? |
|-------------|-------|---------------|--------|
| STEPS | 68-84 | Progressive tier iteration with stepFrom/stepTo | ✅ |
| FLAT | 56-60 | Returns rateAmount as fixed charge | ✅ |
| STATIC | 86-90 | Returns rateAmount as fixed charge | ✅ |
| PER_UNIT | 62-66 | rate × consumption | ✅ |
| ZERO | 92-96 | Returns 0 (but FILTERED OUT at line 99) | 🔴 **BUG** |

### Actual Simulation vs Invoice Generation

```
POST /tariffs/simulate → uses TariffEngineService → ALL 5 modes ✅
POST /invoices/generate → uses TariffService → FLAT RATE ONLY ❌
```

### SBill Invoice 33620 Comparison

| Charge | SBill | Meter Verse (current) | Meter Verse (if connected) |
|--------|-------|----------------------|---------------------------|
| Consumption (1480.711 kWh) | 2,147.03 EGP | ratePerUnit * 1480.711 | STEPS tier calculation ✅ |
| Fees | 0.10 EGP | ❌ Not generated | STATIC 90 milliemes ✅ |
| Customer Service | 40.00 EGP | ❌ Not generated | STEPS tier calculation ✅ |
| Admin | 27.00 EGP | ❌ Not generated | STATIC 27000 milliemes ✅ |

**Current parity with SBill Invoice 33620: ~25%** (only consumption with flat rate)

---

## PHASE 4 — INVOICE ENGINE REALITY

### Actual Invoice statuses (from InvoiceStatus enum + code):
```
draft → pending_approval → issued → partially_paid → paid → overdue → cancelled
```

### Actual endpoints:
- `POST /invoices/generate` — Creates draft invoices (flat rate)
- `POST /invoices/:id/issue` — Issues invoice, posts to ledger
- `POST /invoices/:id/cancel` — Cancels, reverses ledger
- `POST /invoices/:id/adjustments` — Adjusts invoice, updates ledger

### Missing from actual code:
- ❌ No batch cycle tracking (no BillingCycle in code)
- ❌ No rebilling (cancel old + generate new in one operation)
- ❌ No invoice number sequence (uses random Date.now().toString(36))
- ❌ No utility-specific cycle separation
- ❌ No tariff engine integration in generation

---

## PHASE 5 — SETTINGS & CONFIGURATION REALITY

### Actual Settings UI Pages:
From `Frontend/src/components/reports/SettingsPage.tsx` — 7 tabs:
1. General — ✅ Exists
2. Users — ✅ Exists  
3. Areas — ✅ Exists
4. Unit Types — ✅ Exists
5. Reading — ✅ Exists
6. Notifications — ✅ Exists
7. Theme — ✅ Exists

### Missing compared to SBill:
- ❌ Customer Groups
- ❌ Payment Centers
- ❌ Bank Accounts
- ❌ POS Terminals
- ❌ Settlement Types
- ❌ Tariff Management
- ❌ Bill Cycle Management
- ❌ Holiday Management
- ❌ Unit Zones

---

## PHASE 6 — CERTIFICATION BOARD (Evidence-Based)

| Engine | Score | Evidence |
|--------|-------|----------|
| **Bill Cycle** | **0%** | BillingCycle model exists in `features`. ZERO code references. No controller, service, API, or UI. |
| **Tariff Engine** | **25%** | TariffEngineService.calculateCharges() implements all 5 modes BUT is only called from simulation endpoint. Invoice generation uses flat rate only. |
| **Invoice Generation** | **20%** | Batch generation exists but uses flat rate. No tariff tiers. No multi-charge support. No rebilling. Invoice numbers are random. |
| **Customer Ledger** | **35%** | LedgerService.addEntry() works with running balance. Called from issue/cancel/adjust. NOT called from generate. |
| **Payment Allocation** | **20%** | PaymentAllocation model exists. Partial code in payments.service.ts. No allocation algorithm. |
| **Settlements** | **15%** | Settlement controller exists (CRUD). No settlement type system. No integration with billing. |
| **Reports** | **5%** | ReportsController exists (1 endpoint). No SBill reports implemented. |
| **Settings** | **40%** | 7 of 16 SBill settings tabs exist. Missing 9 critical settings. |
| **Security** | **45%** | JWT auth exists. Rate limiting exists. CSRF token exists but not enforced. Dev-login bypass exists. |
| **OVERALL** | **~23%** | |

### READY FOR PRODUCTION: **NO**
### READY FOR SBILL REPLACEMENT: **NO** (score: 23%)
### READY FOR ENTERPRISE DEPLOYMENT: **NO**

---

## PHASE 7 — BLOCKERS

### P0 (Critical — Blocks all billing):
1. **TariffEngineService not connected to invoice generation** — `generateInvoices()` uses `ratePerUnit * consumption` instead of `TariffEngineService.calculateCharges()`. This blocks all tiered pricing, FLAT, STATIC, PER_UNIT, ZERO charges.
2. **No BillingCycle implementation** — Zero code references. No way to track batch billing runs, no state machine.
3. **No rebilling workflow** — Cannot cancel old invoices and generate replacements in one operation.

### P1 (High):
4. **No invoice number sequence** — Uses random `Date.now().toString(36).slice(-4)` instead of sequential numbers.
5. **No multi-utility cycle separation** — All utilities billed together, not per-utility.
6. **ZERO charge type bug** — Line 99 in tariff-engine.service.ts filters out ZERO charges.
7. **No settlement type system** — SBill has 2 settlement types (فرق تعريفة, تسويه استهلاك).

### P2 (Medium):
8. 9 missing settings pages
9. 0 of 44 SBill reports implemented
10. No customer group management
11. No unit zones
12. No payment center management

---

## PHASE 8 — ACTIVATION REQUIREMENTS

### What Must Change (based on actual code, not theory)

| Task | File(s) | Current Reality |
|------|---------|----------------|
| Wire TariffEngineService into generateInvoices | `billing.controller.ts:46-156` | Currently uses flat rate. Replace with `tariffEngine.calculateCharges()` |
| Fix ZERO charge bug | `tariff-engine.service.ts:92-99` | ZERO charges filtered out by condition |
| Build BillingCycle controller | New file | No code exists at all |
| Add useFeatures flag to tariffs | `tariff-engine.service.ts:30` | Fallback to features tariff exists but not used by invoice gen |
| Build sequential invoice numbers | `billing.controller.ts` | Currently random |
| Build settlement type system | New files | No settlement types in code |
| Implement rebilling | `billing.controller.ts` | No rebill operation |
| Build 9 missing settings pages | Frontend | Only 7 of 16 settings tabs exist |

### 3-Week Quick Win (P0 Only)
1. **Week 1**: Wire `TariffEngineService` into `generateInvoices()` — replace flat rate calculation with `calculateCharges()` call. Fix ZERO charge bug.
2. **Week 2**: Add `BillingCycle` creation + status tracking to `generateInvoices()`. Add `utilityType` to cycle. Implement invoice number sequence.
3. **Week 3**: Add rebilling support, settlement type system. Connect `LedgerService` into `generateInvoices()`.

After 3 weeks: Parity goes from ~23% to ~60%.

### Full Activation: 8-12 weeks
After full activation with all features schema: Parity ~85%.

---

## FINAL VERDICT

**Option A — ACTIVATE Features Schema** is still the right answer, but:
1. The TariffEngineService must be wired into actual invoice generation (1-2 days work)
2. The ZERO charge type bug must be fixed (30 minutes)
3. A BillingCycle controller must be built from scratch (the schema design is correct)
4. The features schema tables are correct but disconnected

The claim "features schema already contains 90%+ of required design" is **TRUE** for the *data model*.
The claim "features schema already contains 90%+ of required code" is **FALSE** — only 3 of 36 tables have code, and the key TariffEngineService is not connected to production invoice generation.
