# B2: Complete Billing Workflow Map

## Overview

The billing workflow in SBill is a **batch processing pipeline** that starts with meter readings and ends with posted invoices and updated customer balances. Each run is scoped to a specific **utility type** (Electricity, Water, or Virtual variants) and **billing period** (Month + Year).

---

## Mermaid Sequence Diagram

```mermaid
sequenceDiagram
    participant User as Billing Operator
    participant UI as SBill UI
    participant BE as Billing Engine
    participant DB as Database
    participant Meter as Meters Table
    participant Reading as Readings Table
    participant Tariff as Tariff Engine
    participant Inv as Invoice Tables

    Note over User,Inv: PHASE 1: READINGS ACQUISITION

    User->>UI: Import monthly readings (Data Upload)
    UI->>DB: INSERT meter_reading records
    User->>UI: Enter/verify early readings
    UI->>DB: INSERT early meter_reading records
    User->>UI: Correct wrong readings
    UI->>DB: UPDATE meter_reading records

    Note over User,Inv: PHASE 2: BILL CYCLE INITIATION

    User->>UI: Navigate to /bill-cycle/new
    User->>UI: Select Service Type (Electricity/Water/Virtual)
    User->>UI: Enter Month + Year
    User->>UI: Click Start
    UI->>BE: Execute billing run (serviceType, month, year)

    Note over User,Inv: PHASE 3: METER SELECTION

    BE->>DB: SELECT meters WHERE service_type = :serviceType AND status = ACTIVE
    DB-->>BE: Return meter list (2,888 active meters)

    loop For each meter
        Note over BE,Tariff: PHASE 4: CONSUMPTION CALCULATION
        
        BE->>Reading: Get current reading for billing month
        BE->>Reading: Get previous reading
        Reading-->>BE: current_reading, previous_reading
        BE->>BE: consumption = current_reading - previous_reading

        Note over BE,Tariff: PHASE 5: TARIFF APPLICATION
        
        BE->>Meter: Get tariff_id from meter record
        BE->>Tariff: Lookup tariff WHERE id = meter.tariff_id
        
        Tariff-->>BE: Tariff record (type, mode, charges)
        
        BE->>Tariff: Get tariff_charges WHERE tariff_id = :id AND status = ACTIVE
        Tariff-->>BE: List of charge groups (CONSUMPTION, CUSTOMERCARE, ISSUE, TAX, ZERO)

        Note over BE,Tariff: PHASE 6: CHARGE CALCULATION
        
        BE->>BE: For STEPS charges: apply tier rates based on consumption
        BE->>BE: For FLAT charges: rate * consumption units
        BE->>BE: For STATIC charges: add fixed amount
        BE->>BE: For PER_UNIT charges: rate * units (capped at upper_limit if set)
        BE->>BE: For ZERO charges: apply only when consumption = 0

        Note over BE,Tariff: PHASE 7: SETTLEMENTS
        
        BE->>DB: Check settlement_type records
        BE->>BE: Apply فرق تعريفة (Tariff Difference) if tariff changed
        BE->>BE: Apply تسويه استهلاك (Consumption Settlement) if correction needed

        Note over BE,Tariff: PHASE 8: TAX CALCULATION

        BE->>BE: Calculate tax on applicable charge groups
        BE->>BE: Sum all charge groups + tax = total amount

        Note over BE,Inv: PHASE 9: INVOICE GENERATION

        BE->>Inv: INSERT INTO invoice (customer_id, meter_id, billing_cycle_id, total_amt, balance_before, ...)
        BE->>Inv: INSERT INTO invoice_details (invoice_id, charge_group, amount, start_reading, end_reading, consumption_value)

        Note over BE,Inv: PHASE 10: REBILLING (OLD INVOICE CANCELLATION)

        BE->>DB: SELECT invoices WHERE meter_id = :id AND consumption_month = :month
        BE->>DB: UPDATE invoices SET status = CANCELLED, cancelled_count++
        BE->>BE: Record cancelled count in billing_cycle record
    end

    Note over BE,Inv: PHASE 11: CYCLE COMPLETION

    BE->>DB: UPDATE billing_cycle SET success_count = :n, failed_count = :m, cancelled_count = :p
    UI-->>User: Bill cycle complete - results displayed

    Note over User,Inv: PHASE 12: COLLECTION (SEPARATE PROCESS)

    User->>UI: Process payments via /payments
    UI->>DB: UPDATE invoice SET paid_amount, open_amount = total - paid
    UI->>DB: Update customer balance
```

---

## Detailed Phase Breakdown

### Phase 1: Readings Acquisition
- **Monthly readings**: Bulk-imported via **Data Upload** screen (CSV/Excel files from field meter readers)
- **Early readings**: Manually entered via **Early Readings** screen for meters read ahead of schedule
- **Validation**: Operator reviews readings for anomalies, corrects wrong values

### Phase 2: Bill Cycle Initiation
- Operator navigates to **Run Bill Cycle** under Settings
- Chooses **Service Type** (Electricity, Water, Electricity Virtual, Water Virtual)
- Enters **Month** and **Year**
- System validates form fields, enables **Start** button
- On Start, the backend **Billing Engine** is invoked

### Phase 3: Meter Selection
- System queries all meters matching the selected service type
- Only **ACTIVE** meters are included (2,888 of 2,913 total)
- Excluded: INACTIVE (2), NEW (23 — not yet commissioned)

### Phase 4: Consumption Calculation
- For each meter: `consumption = current_reading_value - previous_reading_value`
- Current reading = reading for the billing month
- Previous reading = last recorded reading before billing month
- Units: kWh for Electricity, m³ for Water

### Phase 5: Tariff Application
- Each meter has a `tariff_id` foreign key
- System looks up the tariff table for an **ACTIVE** tariff whose `start_date`/`end_date` covers the billing month
- Tariff defines the pricing structure (type, mode, charge groups)

### Phase 6: Charge Calculation
Charges are categorized by `charge_group`:

| Charge Group | Description | Calculation |
|---|---|---|
| CONSUMPTION | Usage-based charges | STEPS (tiered) or FLAT rate |
| CUSTOMERCARE | Fixed service fees | STATIC amount |
| ISSUE | Invoice issuance fee | STATIC or PER_UNIT |
| TAX | Government taxes | Percentage of subtotal |
| ZERO | Applied when consumption = 0 | STATIC amount |

Charge types:
- **STEPS**: Tiered rates — sort `tariff_charges_details` by `from_usage` ascending, apply each tier's `rate_value` to consumption in that range
- **FLAT**: `rate_value * consumption_units`
- **STATIC**: Fixed `flat_amount` added regardless of consumption
- **PER_UNIT**: `rate_value * units` with optional `upper_limit` cap
- **ZERO**: Triggered only when consumption = 0 (minimum charge)

### Phase 7: Settlements
- **فرق تعريفة (Tariff Difference)**: Applied when a tariff change mid-period causes rate differences — system calculates the delta
- **تسويه استهلاك (Consumption Settlement)**: Applied when previously estimated readings are replaced with actual readings
- Both limited to **1 month** lookback (Allowed Months = 1)

### Phase 8: Tax Calculation
- Tax charges are computed as a percentage of the taxable subtotal
- Added as a separate `invoice_details` row with `charge_group = 'TAX'`

### Phase 9: Invoice Generation
- One invoice record per meter per billing cycle
- `invoice_details` records store each line item (charge group breakdown)
- Fields: `start_reading`, `end_reading`, `consumption_value`, `amount`

### Phase 10: Rebilling (Old Invoice Cancellation)
- If this is a rebill (same period, same meter), the system cancels previous invoices
- Old invoices get `status = CANCELLED`
- The cancelled count increments in the `billing_cycle` record
- **Evidence**: Cycle 1 shows -21,882 success + 21,882 cancelled = 0 net (full rebill migration)

### Phase 11: Cycle Completion
- System updates the billing_cycle record with final counts
- UI displays the results (success, failed, cancelled counts)

### Phase 12: Collection (Separate Process)
- Payment collection is a **separate workflow** via the Payments screen
- Each payment updates `invoice.paid_amount` and `invoice.open_amount`
- Customer balance is updated accordingly

---

## Key Business Rules

1. **Billing is per utility type** — Electricity and Water are always separate cycles
2. **ACTIVE meters only** — Only meters in Active status are billed
3. **Rebilling cancels old** — Previous invoices for the same meter/period are cancelled, not deleted
4. **Negative success = net cancellation** — When more old invoices are cancelled than new ones generated
5. **Settlements are limited** — Both settlement types allow only 1 month adjustment window
