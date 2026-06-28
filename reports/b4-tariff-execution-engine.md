# B4: Tariff Execution Engine

## Overview

The Tariff Execution Engine is the core pricing component of the SBill billing system. It determines **how much each customer is charged** based on their meter's assigned tariff, consumption, and applicable rates.

---

## Tariff Lookup Process

### Step 1: Resolve Meter's Tariff

```
Meter Record
  └── tariff_id  ──→  Tariff Table
                         ├── id
                         ├── name
                         ├── type (RESIDENTIAL, COMMERCIAL, etc.)
                         ├── mode (STEPS, FLAT)
                         ├── start_date
                         ├── end_date
                         ├── status (ACTIVE/INACTIVE)
                         └── service_type (ELECTRICITY/WATER)
```

Each **meter** has a `tariff_id` foreign key. The billing engine:
1. Reads `meter.tariff_id`
2. Queries `tariff WHERE id = meter.tariff_id AND status = 'ACTIVE'`
3. Validates that the billing month falls within `start_date` and `end_date`

### Step 2: Validate Tariff Period

```
Billing Month: October 2023
Tariff Active Window: 2023-01-01 to 2024-12-31
Result: ✅ VALID (billing month is within range)
```

If no ACTIVE tariff exists for the billing period, the meter is **skipped** (recorded as failed).

---

## Tariff Charge Groups

```sql
SELECT * FROM tariff_charges WHERE tariff_id = :id ORDER BY sort_order;
```

Charges are organized into **5 groups**:

| Charge Group | Purpose | Example |
|---|---|---|
| `CONSUMPTION` | Usage-based energy/water charges | Per-kWh rate, tiered pricing |
| `CUSTOMERCARE` | Customer service fees | Monthly service fee |
| `ISSUE` | Invoice issuance fees | Paper bill fee, SMS fee |
| `TAX` | Government taxes | VAT, municipality tax |
| `ZERO` | Minimum charge when no consumption | Zero-consumption fee |

### Charge Types

Each `tariff_charges` row has a `charge_type` that determines the calculation method:

| Type | Description | Formula |
|---|---|---|
| `STEPS` | Tiered/piecewise rates | Sum of `rate_value * consumption_in_tier` across tiers |
| `FLAT` | Single rate multiplied by units | `flat_rate * consumption` |
| `STATIC` | Fixed amount, always applied | `flat_amount` |
| `PER_UNIT` | Rate per unit with optional cap | `MIN(rate_value * units, upper_limit)` |
| `ZERO` | Applied only when consumption = 0 | `flat_amount` (conditional) |

---

## Detailed Calculation Logic

### STEPS (Tiered Calculation)

```sql
SELECT * FROM tariff_charges_details 
WHERE charge_id = :id 
ORDER BY from_usage ASC;
```

**Algorithm:**
```
remaining = consumption
total = 0

for each tier sorted by from_usage ASC:
    tier_consumption = MIN(remaining, tier.to_usage - tier.from_usage)
    if tier_consumption > 0:
        total += tier_consumption * tier.rate_value
        total += tier.extra_amount  (if applicable)
        remaining -= tier_consumption
    if remaining <= 0:
        break

if remaining > 0:
    apply last tier rate to excess (open-ended top tier)
```

**Example — Electricity Residential Tariff (October 2023):**
| Tier | From (kWh) | To (kWh) | Rate (EGP/kWh) |
|---|---|---|---|
| 1 | 0 | 50 | 0.58 |
| 2 | 51 | 100 | 0.78 |
| 3 | 101 | 200 | 1.08 |
| 4 | 201 | 350 | 1.28 |
| 5 | 351 | 650 | 1.48 |
| 6 | 651 | 1000 | 1.68 |
| 7 | 1001 | ∞ | 1.88 |

For **consumption = 750 kWh**:
| Tier | Range | Units | Rate | Charge |
|---|---|---|---|---|
| 1 | 0-50 | 50 | 0.58 | 29.00 |
| 2 | 51-100 | 50 | 0.78 | 39.00 |
| 3 | 101-200 | 100 | 1.08 | 108.00 |
| 4 | 201-350 | 150 | 1.28 | 192.00 |
| 5 | 351-650 | 300 | 1.48 | 444.00 |
| 6 | 651-750 | 100 | 1.68 | 168.00 |
| **Total** | | **750** | | **980.00 EGP** |

### FLAT Calculation

```
charge_amount = flat_rate * consumption
```

Used for simple per-unit pricing (e.g., water at a fixed rate per m³).

### STATIC Calculation

```
charge_amount = flat_amount
```

Applied as a fixed fee regardless of consumption (e.g., monthly customer service fee of 10 EGP).

### PER_UNIT Calculation

```
base = rate_value * units
charge_amount = MIN(base, upper_limit)  -- if upper_limit is set
charge_amount = base                     -- if no upper_limit
```

Used when there's a per-unit rate but with a maximum cap (e.g., invoice issuance fee capped at 5 EGP).

### ZERO Calculation (Zero-Consumption Charge)

```
IF consumption = 0:
    charge_amount = flat_amount
ELSE:
    charge_amount = 0
```

Ensures minimum revenue even when a meter registers zero consumption.

---

## Charge Aggregation

After calculating all individual charges, the engine sums them **per charge_group**:

```
invoice_details for this invoice:

charge_group=CONSUMPTION:   980.00 EGP  (sum of all CONSUMPTION tier charges)
charge_group=CUSTOMERCARE:  10.00 EGP   (monthly service fee)
charge_group=ISSUE:         5.00 EGP    (invoice fee)
charge_group=TAX:           149.25 EGP  (15% of subtotal = 995 × 0.15)
charge_group=ZERO:          0.00 EGP    (not applied since consumption > 0)

Total invoice:            1,144.25 EGP
```

---

## Settlement Application

Settlements are additional calculations applied on top of regular tariff charges.

### فرق تعريفة (Tariff Difference) — Settlement Type ID 1

Triggered when a tariff change occurs **mid-billing-period**:

```
Old tariff rate for period start: 0.95 EGP/kWh
New tariff rate for period end:   1.08 EGP/kWh
Consumption:                      750 kWh
Difference:                       0.13 EGP/kWh × 750 = 97.50 EGP adjustment
```

- Allowed months: **1** (only applies to current month)
- Recorded as a separate `invoice_details` row with `settlement_type_id = 1`

### تسويه استهلاك (Consumption Settlement) — Settlement Type ID 4

Applied when a reading correction causes a consumption adjustment:

```
Previously estimated:    800 kWh
Actual reading:          750 kWh
Overcharged amount:      50 kWh × rate = refund/adjustment
```

- Allowed months: **1** (only applies to current month)
- Recorded as a separate `invoice_details` row with `settlement_type_id = 4`

---

## Tax Calculation

Tax is computed as a percentage of the **taxable subtotal**:

```
taxable_charges = CONSUMPTION + CUSTOMERCARE + ISSUE + ZERO
tax_rate = lookup from tariff_charges WHERE charge_group = 'TAX'
tax_amount = taxable_charges * tax_rate
```

Typical tax rates in Egypt: **14% VAT** on electricity bills.

---

## Tariff Execution Flow (Pseudo-code)

```
function calculateInvoice(meter, billingMonth, billingYear):
    // 1. Get readings
    currentReading = getReading(meter.id, billingMonth, billingYear)
    previousReading = getPreviousReading(meter.id, currentReading)
    consumption = currentReading.value - previousReading.value

    // 2. Get tariff
    tariff = getTariffById(meter.tariff_id)
    if tariff.status != 'ACTIVE' OR billingMonth not in [tariff.startDate, tariff.endDate]:
        return FAILURE

    // 3. Get charges
    charges = getTariffCharges(tariff.id)
    chargeGroups = {}

    // 4. Calculate each charge
    for charge in charges:
        amount = 0

        switch charge.charge_type:
            case 'STEPS':
                tiers = getTariffChargeDetails(charge.id)
                amount = calculateTiered(consumption, tiers)
            case 'FLAT':
                amount = charge.flat_rate * consumption
            case 'STATIC':
                amount = charge.flat_amount
            case 'PER_UNIT':
                amount = min(charge.rate_value * consumption, charge.upper_limit)
            case 'ZERO':
                amount = (consumption == 0) ? charge.flat_amount : 0

        chargeGroups[charge.charge_group] += amount

    // 5. Apply settlements
    settlements = getSettlements(meter.id, billingMonth)
    for settlement in settlements:
        chargeGroups[settlement.charge_group] += settlement.amount

    // 6. Calculate tax
    taxable = sum of all charge groups except TAX
    taxRate = getTaxRate(tariff.id)
    taxAmount = taxable * taxRate
    chargeGroups['TAX'] = taxAmount

    // 7. Total
    totalAmount = sum of all chargeGroups values

    return {
        chargeGroups: chargeGroups,
        totalAmount: totalAmount,
        consumption: consumption,
        startReading: previousReading.value,
        endReading: currentReading.value
    }
```

---

## Invoice Details Storage

Each calculated charge group becomes an `invoice_details` row:

```sql
INSERT INTO invoice_details (
    invoice_id, charge_group, amount,
    start_reading, end_reading, consumption_value,
    settlement_type_id
) VALUES (
    :invoiceId, 'CONSUMPTION', 980.00,
    1250.000, 2000.000, 750.000,
    NULL
);
```

Multiple charges within the same `charge_group` are **summed** into a single `invoice_details` row for display efficiency.

---

## Key Business Rules

1. **Tariff must be ACTIVE** — Inactive tariffs are ignored during billing
2. **Date range must cover billing month** — `start_date <= billing_date <= end_date`
3. **Tiers are inclusive of from_usage** — First tier starts at 0
4. **Last tier is open-ended** — If no `to_usage`, consumption above the last tier uses the last rate
5. **ZERO charges only fire at zero consumption** — Prevents zero-revenue months
6. **Settlements are additive** — They don't replace tariff charges, they adjust them
7. **Charge groups are aggregated** — Multiple charges in the same group are summed for the invoice display
