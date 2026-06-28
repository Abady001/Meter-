# Billing Engine Wiring Audit

**Date:** 2026-06-20  
**Score:** 20%  
**Status:** CRITICAL DISCONNECT  

---

## 1. Summary

The live invoice generation endpoint (`billing.controller.ts:50`) uses a **flat-rate formula** (`rate * consumption`). The full `TariffEngineService` (which supports all 5 charge modes) is only called from a simulation endpoint. The tariff engine is **not wired** to real invoice production.

---

## 2. Invoice Generation Code Path

**File:** `backend/src/billing/billing.controller.ts`

### `generateInvoices()` — lines 46–156

```
Line 50:   async generateInvoices(...)
Line 91-95:  const tariff = await this.tariffService.getEffectiveTariff(...)
Line 101:    const consumption = reading.value - (prevReading?.value ?? 0)
Line 103:    const charge = Number(tariff.ratePerUnit) * consumption
Line 105:    const invoiceNumber = `INV-${Date.now().toString(36).slice(-4)}`
```

Key observations:

| Line | Code | Issue |
|---|---|---|
| 91–95 | `tariffService.getEffectiveTariff()` | Reads `sim_system.TariffPlan` — OK so far |
| 103 | `Number(tariff.ratePerUnit) * consumption` | **Flat rate only** — ignores tiers, demand charges, time-of-use, solar netting |
| 105 | `Date.now().toString(36).slice(-4)` | Random 4-char invoice number — no sequence, no format guarantee |

### Charge Modes NOT Used

The `TariffEngineService` supports:
1. Flat rate
2. Tiered / block rates
3. Demand charges
4. Time-of-use
5. Solar netting

**None** of modes 2–5 are invoked during live invoice generation.

---

## 3. TariffEngineService Call Sites

| Endpoint | File:Line | Purpose |
|---|---|---|
| `POST /tariffs/simulate` | `billing.controller.ts:524` | **Only** call site — simulation only |
| `POST /billing/generate` | `billing.controller.ts:50` | Uses flat rate directly — **bypasses TariffEngineService** |

---

## 4. Impact

- All invoices are flat-rate regardless of tariff configuration.
- Tiered pricing, demand charges, TOU, and solar netting are **dead code** in production.
- Invoice numbers are collision-prone (4 chars from timestamp).

---

## 5. Remediation

1. Replace line 103 logic with `TariffEngineService.calculate(tariff, consumption, ...)`.
2. Pass meter type, time-of-use window, demand interval params.
3. Replace line 105 with a proper sequence-based invoice number generator.
4. Remove or archive dead simulation-only code path.

**Estimated effort:** 5–8 days.
