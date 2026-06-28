# Tariff Engine — Deep Dive

## Architecture Overview

The Tariff Engine is the calculation core of SBill. It determines how much a customer pays by applying a configurable set of charge rules against metered consumption. The engine supports progressive tiered pricing, fixed fees, per-unit rates, and conditional charges.

---

## Database Schema

### Core Tables (confirmed from JRXML)

```
tariff                   → Tariff header (name, status, mode)
tariff_charges           → Charge line items (type, group, recurring mode)
tariff_charges_details   → Tier definitions for STEPS mode
```

### Key Relationships

```
meter.tariff_id → tariff.id
tariff.id → tariff_charges.tariff_id
tariff_charges.id → tariff_charges_details.charge_id
```

---

## Tariff Versioning

Tariffs are versioned using `startDate` and `endDate` columns:

```
SELECT t.*
FROM tariff t
WHERE t.status = 'ACTIVE'
  AND t.startDate <= <billingMonth>
  AND (t.endDate IS NULL OR t.endDate >= <billingMonth>)
```

- `startDate` — when this tariff version becomes effective
- `endDate` — when this tariff version expires (NULL = currently active)
- The query selects at most one active tariff per tariff_id per billing month

### Versioning Example

| Tariff ID | Name | startDate | endDate | Status |
|-----------|------|-----------|---------|--------|
| 1 | Residential Elec v1 | 2000-01-01 | 2023-09-30 | INACTIVE |
| 1 | Residential Elec v2 | 2023-10-01 | NULL | ACTIVE |

For October 2023 billing: version v2 is selected (billingMonth >= 2023-10-01).

---

## Tariff Assignment

```
meter
  ├── tariff_id (FK → tariff.id) — the base tariff for this meter
  └── service_type (ELECTRICITY / WATER)
```

When billing runs:
1. Read `meter.tariff_id`
2. Resolve active version using startDate/endDate
3. Load all `tariff_charges` for that tariff version
4. Calculate each charge using consumption

---

## Charge Types

| Type | Behavior | Example |
|------|----------|---------|
| `STEPS` | Progressive tiers: different rates per consumption bracket | Consumption, Customer Service |
| `FLAT` | Single rate × total consumption | — |
| `STATIC` | Fixed amount, independent of consumption | Stamp Fee (3000 milliemes) |
| `PER_UNIT` | Rate per unit, optionally capped | Radio Fee (90/unit, capped at 90) |
| `ZERO` | Applied only when consumption = 0 | Zero Reading Fee (9000 milliemes) |

Full equations documented in **charge-types-catalog.md**.

---

## Charge Groups

Groups determine where on the invoice the charge appears, and how it aggregates.

| Group Name | Numeric ID | Description | Invoice Column |
|------------|------------|-------------|----------------|
| `CONSUMPTION` | 0 | Usage-based energy/water charges | Consumption Amount |
| `CUSTOMERCARE` | 1 | Service fees and sustainability | Customer Service / Sustainability |
| `ISSUE` | 2 | One-time issue/admin fees | Issue Fees |
| `TAX` | 3 | Government levies, stamp, radio | Taxes |
| `ZERO` | 4 | Zero-consumption minimum charge | Zero Reading |
| `FEES` | 5 | Miscellaneous fees | Other Fees |

The JRXML invoice template maps these numeric IDs to specific columns using `charge_group` field.

---

## Recurring Modes

| Mode | Behavior | Applied |
|------|----------|---------|
| `DAILY` | Always applied every billing cycle | Every month |
| `MONTHLY` | Applied each month | Every month |
| `YEARLY` | Applied only in a specific month | e.g., January only |

**Stamp Fee example**: mode=YEARLY, applied only in January invoices. This ensures annual government stamp duties are charged exactly once per year.

---

## Tariff Examples from Live System

### Tariff 1 — Residential Electricity (منزلي)

| Charge | Type | Group | Mode | Details |
|--------|------|-------|------|---------|
| Consumption | STEPS | CONSUMPTION (0) | DAILY | Progressive tiers |
| Customer Service Fee | STEPS | CUSTOMERCARE (1) | DAILY | Progressive tiers |
| Zero Reading Fee | ZERO | ZERO (4) | MONTHLY | 9,000 milliemes when consumption=0 |
| Radio Fees | PER_UNIT | TAX (3) | MONTHLY | 90 rate, 90 upper_limit |
| Governmental | STATIC | TAX (3) | MONTHLY | 10 milliemes |
| Stamp Fee | STATIC | TAX (3) | YEARLY (Jan) | 3,000 milliemes |

### Tariff 2 — Residential Water (منزلي)

| Charge | Type | Group | Mode | Details |
|--------|------|-------|------|---------|
| Consumption | STEPS | CONSUMPTION (0) | DAILY | Progressive tiers |
| Sustainability Fee | STEPS | CUSTOMERCARE (1) | DAILY | Progressive tiers |
| Zero Reading | ZERO | ZERO (4) | MONTHLY | 9,000 milliemes |
| Other Fees | STATIC | ISSUE (2) | ISSUE | 27,000 milliemes |
| Regulatory Services | PER_UNIT | ISSUE (2) | ISSUE | 10 per unit |

### Tariff 3 — Commercial Electricity (تجاري)

| Charge | Type | Group | Mode | Details |
|--------|------|-------|------|---------|
| Consumption | STEPS | CONSUMPTION (0) | DAILY | Progressive tiers |
| CS (Customer Service) | STEPS | CUSTOMERCARE (1) | DAILY | Progressive tiers |
| Zero | ZERO | ZERO (4) | MONTHLY | 9,000 milliemes |
| Radio | STATIC | TAX (3) | MONTHLY | 90 milliemes |
| Gov (Governmental) | STATIC | TAX (3) | MONTHLY | 10 milliemes |
| Cons Stamp | PER_UNIT | TAX (3) | MONTHLY | 32 per unit |

---

## Calculation Pipeline

For each meter in a billing cycle, the engine runs:

```
Step 1:  Read consumption (kWh/m³) from meter readings
Step 2:  Load active tariff for meter.tariff_id
Step 3:  For each tariff_charge in tariff:
            charge_amount = calculate(charge_type, consumption, details)
            invoice_detail row = { charge_id, charge_group, amount, ... }
Step 4:  Aggregate by charge_group
Step 5:  Build invoice:
            total_amt = SUM(all charge amounts)
            open_amt = total_amt (until paid)
            balance_before, balance_after on customer
Step 6:  Write invoice + invoice_details
Step 7:  Log to billcycle_logs
```

### Mode Enforcement

During step 3, the engine checks `recurring_mode`:
- `DAILY` / `MONTHLY`: always applied
- `YEARLY`: skip unless billing month matches the configured month (e.g., January for Stamp Fee)

---

## Settlement Types

Applied automatically during billing or manually via settlement API.

| ID | Name (Arabic) | Name (English) | Allowed Months |
|----|---------------|----------------|----------------|
| 1 | فرق تعريفة | Tariff Difference | 1 |
| 4 | تسويه استهلاك | Consumption Settlement | 1 |

These are recorded in `meter_settlements` table with FK to the settlement type and meter, adjusting the invoice total when tariff differences are reconciled.
