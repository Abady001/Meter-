# Charge Types — Complete Catalog

## Overview

This document defines every charge type supported by the SBill tariff engine with exact mathematical equations. All monetary values are in **milliemes** (1 EGP = 1,000 milliemes) unless otherwise noted.

---

## 1. STEPS — Progressive Tiered Pricing

### Purpose
Charges consumption in progressive brackets, where each bracket has its own rate and optional extra amount. Used for energy/water consumption and customer service fees.

### Database Record (tariff_charges_details)

| Column | Description |
|--------|-------------|
| `from_usage` | Lower bound of tier (inclusive) |
| `to_usage` | Upper bound of tier (inclusive, NULL = unbounded) |
| `rate_value` | Rate in milliemes per unit for this tier |
| `extra_amount` | Fixed extra amount added for this tier (milliemes) |

### Equation

```
remaining = consumption
totalCharge = 0

for each tier sorted by from_usage ASC:
    if remaining <= 0: break

    tierFrom = tier.from_usage
    tierTo   = tier.to_usage  (or INFINITY if NULL)
    tierSize = tierTo - tierFrom + 1

    tierUnits = min(remaining, tierSize)
    tierCharge = (tierUnits × tier.rate_value) + tier.extra_amount

    totalCharge += tierCharge
    remaining -= tierUnits
```

### Example

Given consumption = 150 kWh and two tiers:
- Tier 1: 1–50 kWh, rate = 100, extra = 0
- Tier 2: 51–100 kWh, rate = 150, extra = 2000
- Tier 3: 101–∞ kWh, rate = 200, extra = 0

```
remaining = 150

Tier 1: units = min(150, 50-1+1=50) = 50
        charge = (50 × 100) + 0 = 5,000
        remaining = 100

Tier 2: units = min(100, 100-51+1=50) = 50
        charge = (50 × 150) + 2000 = 9,500
        remaining = 50

Tier 3: units = min(50, INFINITY) = 50
        charge = (50 × 200) + 0 = 10,000
        remaining = 0

totalCharge = 5,000 + 9,500 + 10,000 = 24,500 milliemes (24.50 EGP)
```

### Live System Evidence
- **Tariff 1 (Residential Electricity)**: Consumption (STEPS, CONSUMPTION group)
- **Tariff 2 (Residential Water)**: Consumption (STEPS, CONSUMPTION group)
- **Tariff 3 (Commercial Electricity)**: Consumption (STEPS, CONSUMPTION group)

---

## 2. FLAT — Fixed Rate Per Unit

### Purpose
A single rate multiplied by total consumption. Simpler than STEPS with no tiers.

### Equation

```
totalCharge = consumption × flatRate
```

Where:
- `consumption` = total units consumed (kWh or m³)
- `flatRate` = rate per unit in milliemes

### Example

```
consumption = 500 kWh
flatRate = 250 milliemes/kWh

totalCharge = 500 × 250 = 125,000 milliemes (125.00 EGP)
```

### Notes
- No upper limit cap (unlike PER_UNIT)
- Rate is stored in `tariff_charges.rate_value`
- Always positive; no extra_amount component

---

## 3. STATIC — Fixed Monthly Amount

### Purpose
A flat fee charged regardless of consumption. Used for government levies, stamp duties, and fixed service charges.

### Equation

```
totalCharge = flatAmount
```

Where:
- `flatAmount` = fixed monetary amount in milliemes

### Examples from Live System

| Charge | Tariff | Amount (milliemes) | Recurring |
|--------|--------|--------------------|-----------|
| Governmental (Governmental Fee) | Residential Elec (T1) | 10 | MONTHLY |
| Stamp Fee | Residential Elec (T1) | 3,000 | YEARLY (Jan) |
| Governmental (Gov) | Commercial Elec (T3) | 10 | MONTHLY |
| Radio | Commercial Elec (T3) | 90 | MONTHLY |
| Other Fees | Residential Water (T2) | 27,000 | ISSUE |

### Notes
- `flatAmount` is stored in `tariff_charges.rate_value`
- Mode controls when it applies (MONTHLY, YEARLY, etc.)
- No dependency on consumption at all

---

## 4. PER_UNIT — Capped Per-Unit Rate

### Purpose
A per-unit rate with an optional upper limit cap. Used for fees that have a maximum chargeable amount.

### Equation

```
cappedConsumption = min(consumption, upperLimit)
totalCharge = cappedConsumption × flatRate
```

Where:
- `consumption` = total units consumed
- `upperLimit` = maximum number of units to charge (from `tariff_charges.upper_limit`)
- `flatRate` = rate per unit in milliemes

### Examples from Live System

| Charge | Tariff | Rate (milliemes/unit) | Upper Limit |
|--------|--------|----------------------|-------------|
| Radio Fees | Residential Elec (T1) | 90 | 90 units |
| Cons Stamp | Commercial Elec (T3) | 32 | unbounded |
| Regulatory Services | Residential Water (T2) | 10 | unbounded |

### Example Calculation

Radio Fees: rate = 90, upper_limit = 90

```
consumption = 200 kWh
cappedConsumption = min(200, 90) = 90
totalCharge = 90 × 90 = 8,100 milliemes (8.10 EGP)
```

Without cap, the charge would be 200 × 90 = 18,000 milliemes. The cap ensures the maximum radio fee is 8.10 EGP regardless of high consumption.

---

## 5. ZERO — Zero Consumption Minimum Charge

### Purpose
Applied **only when consumption is zero**. Ensures a minimum revenue even when no consumption is recorded. Also known as "Zero Reading Fee."

### Equation

```
if consumption == 0:
    totalCharge = flatAmount
else:
    totalCharge = 0 (or use other charges)
```

### Examples from Live System

| Charge | Tariff | Amount (milliemes) |
|--------|--------|--------------------|
| Zero Reading Fee | Residential Elec (T1) | 9,000 |
| Zero Reading | Residential Water (T2) | 9,000 |
| Zero | Commercial Elec (T3) | 9,000 |

### Example

```
consumption = 0 kWh
flatAmount = 9,000 milliemes

totalCharge = 9,000 milliemes (9.00 EGP)
```

If consumption > 0, this charge is not applied (the consumption charges handle revenue instead).

---

## 6. PREV_BALANCE — Previous Balance Forward (System-Generated)

### Purpose
Brings forward unpaid balance from prior invoices. Not a tariff charge but appears on invoices.

### Equation

```
totalCharge = previous_open_amt
```

Where `previous_open_amt` is the `open_amt` from the last unpaid invoice.

---

## Charge Type Comparison

| Type | Depends on Consumption | Uses Tiers | Has Cap | Has Extra Amount | Applied When Consumption = 0 |
|------|------------------------|------------|---------|------------------|-----------------------------|
| STEPS | Yes | Yes | Implicit (tiers) | Yes | 0 charge (unless tier 1 starts at 0) |
| FLAT | Yes (multiplier) | No | No | No | 0 charge |
| STATIC | No | No | No | No | Always applied |
| PER_UNIT | Yes | No | Yes | No | 0 charge |
| ZERO | Yes (trigger) | No | No | No | Only when consumption = 0 |

---

## Grouping and Aggregation

After individual charges are calculated, they are grouped by `charge_group` for invoice presentation:

```sql
SELECT charge_group, SUM(amount) as group_total
FROM invoice_details
WHERE invoice_id = <id>
GROUP BY charge_group
```

Group mapping:

| Group Name | ID | Invoice Section |
|------------|----|-----------------|
| CONSUMPTION | 0 | Main consumption line |
| CUSTOMERCARE | 1 | Service/sustainability fees |
| ISSUE | 2 | One-time issue fees |
| TAX | 3 | Taxes and levies |
| ZERO | 4 | Zero reading fee |
| FEES | 5 | Miscellaneous |

---

## Unit Conversions

- All rates stored in **milliemes**
- Display currency: **EGP** (Egyptian Pounds)
- `1 EGP = 1,000 milliemes`
- Consumption units: **kWh** (Electricity), **m³** (Water)
