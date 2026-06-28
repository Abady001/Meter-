# B3: Billing Cycle ERD

## Entity-Relationship Diagram

```mermaid
erDiagram
    BILLING_CYCLE ||--o{ INVOICE : "contains"
    INVOICE ||--o{ INVOICE_DETAILS : "has line items"
    METER ||--o{ INVOICE : "billed in"
    CUSTOMER ||--o{ INVOICE : "owns"
    METER ||--o{ METER_READING : "has readings"
    METER }|--|| TARIFF : "assigned tariff"
    TARIFF ||--o{ TARIFF_CHARGES : "defines charges"
    TARIFF_CHARGES ||--o{ TARIFF_CHARGES_DETAILS : "tiered rates"
    SETTLEMENT_TYPE ||--o{ INVOICE_DETAILS : "settlement line items"
    BILLING_CYCLE }|--|| PROJECT : "belongs to"

    BILLING_CYCLE {
        bigint id PK
        varchar month "e.g. 'Oct 2023'"
        int year
        varchar service_type "ELECTRICITY, WATER, ELECTRICITY_VIRTUAL, WATER_VIRTUAL"
        int success_count "invoices generated"
        int failed_count "generation failures"
        int cancelled_count "old invoices cancelled"
        bigint project_id FK
        varchar status "COMPLETED, RUNNING, FAILED"
        datetime created_at
        datetime updated_at
    }

    INVOICE {
        bigint id PK
        varchar number "unique invoice number"
        varchar status "ACTIVE, CANCELLED, POSTED"
        varchar serial "readable serial"
        decimal total_amt "total invoice amount"
        decimal paid_amt "amount paid"
        decimal open_amt "outstanding balance"
        decimal balance_before "customer balance before invoice"
        decimal balance_after "customer balance after invoice"
        bigint customer_id FK
        bigint meter_id FK
        bigint billing_cycle_id FK
        date issue_date
        varchar consumption_month "billing period"
        decimal consumption_kwh "or m3 for water"
        varchar service "ELECTRICITY or WATER"
    }

    INVOICE_DETAILS {
        bigint id PK
        bigint invoice_id FK
        varchar charge_group "CONSUMPTION, CUSTOMERCARE, ISSUE, TAX, ZERO"
        decimal amount "line item amount"
        decimal start_reading "meter reading start"
        decimal end_reading "meter reading end"
        decimal consumption_value "units consumed"
        bigint settlement_type_id FK "nullable"
    }

    METER {
        bigint id PK
        varchar meter_number "unique meter serial"
        bigint customer_id FK
        bigint tariff_id FK "active tariff"
        varchar service_type "ELECTRICITY, WATER"
        varchar status "ACTIVE, INACTIVE, NEW"
        decimal last_reading_value
        date last_reading_date
    }

    METER_READING {
        bigint id PK
        bigint meter_id FK
        decimal reading_value
        datetime reading_at
        varchar source "MONTHLY, EARLY, MANUAL"
        varchar status "ACTIVE, CANCELLED"
        bigint created_by
        datetime created_at
    }

    CUSTOMER {
        bigint id PK
        varchar name
        varchar code "unique customer code"
        varchar status "ACTIVE, INACTIVE"
        decimal balance "current outstanding balance"
        bigint project_id FK
        varchar address
        varchar phone
    }

    TARIFF {
        bigint id PK
        varchar name
        varchar type "e.g. RESIDENTIAL, COMMERCIAL"
        varchar mode "e.g. STEPS, FLAT"
        date start_date
        date end_date
        varchar status "ACTIVE, INACTIVE"
        varchar service_type "ELECTRICITY, WATER"
    }

    TARIFF_CHARGES {
        bigint id PK
        bigint tariff_id FK
        varchar name "charge name"
        varchar charge_group "CONSUMPTION, CUSTOMERCARE, ISSUE, TAX, ZERO"
        varchar charge_type "STEPS, FLAT, STATIC, PER_UNIT, ZERO"
        decimal flat_amount "used for STATIC charges"
        decimal flat_rate "flat rate per unit"
        decimal upper_limit "cap for PER_UNIT"
        int sort_order
    }

    TARIFF_CHARGES_DETAILS {
        bigint id PK
        bigint charge_id FK
        decimal from_usage "tier start"
        decimal to_usage "tier end"
        decimal rate_value "rate in this tier"
        decimal extra_amount "additional fixed fee"
    }

    SETTLEMENT_TYPE {
        bigint id PK
        varchar name "فرق تعريفة or تسويه استهلاك"
        int allowed_months "default 1"
    }

    PROJECT {
        bigint id PK
        varchar name "أكتوبر"
        varchar address
    }
```

---

## Table Descriptions

### `billing_cycle`
Central orchestrating table. Each row is a single billing run.

| Field | Source Evidence |
|---|---|
| `month` | From Bill Cycle page: "Jan 2000", "Oct 2023" |
| `service_type` | From page: ELECTRICITY, WATER |
| `success_count` | Live data shows 860, 887, -21882 (can be negative for rebills) |
| `cancelled_count` | Live data shows 611, 618, 21882 |
| `project_id` | FK to project (single project: ID=1 "أكتوبر") |

### `invoice`
Core billing record. Links customer, meter, and billing cycle.

| Field | Source Evidence |
|---|---|
| `number` | Invoice 33620: "2018-11-UUUUUUU1" format |
| `status` | ACTIVE, CANCELLED |
| `consumption_kwh` | Invoice 33620: 1480.711 kWh |
| `total_amt` | Invoice 33620: 2,214.13 EGP |
| `paid_amt` / `open_amt` | 90% paid rate from dashboard: 147,860,893 paid / 163,626,755 total |
| `balance_before` / `balance_after` | Tracks customer balance impact |
| `service` | Matches billing_cycle.service_type |

### `invoice_details`
Line items for each invoice, one per charge group.

| Field | Source Evidence |
|---|---|
| `charge_group` | CONSUMPTION, CUSTOMERCARE, ISSUE, TAX, ZERO |
| `start_reading` / `end_reading` | Meter reading values at invoice time |
| `consumption_value` | Units consumed for this line item |
| `settlement_type_id` | FK to settlement_type when applicable |

### `meter_reading`
Raw meter readings from various sources.

| Field | Source Evidence |
|---|---|
| `source` | MONTHLY (bulk upload), EARLY (manual entry), MANUAL (corrections) |
| `reading_value` | The actual meter reading |
| `reading_at` | Timestamp of reading |

### `tariff`
Pricing structure definition.

| Field | Source Evidence |
|---|---|
| `status` | Must be ACTIVE to be used in billing |
| `start_date` / `end_date` | Must encompass billing month |
| `type` / `mode` | Controls charge calculation behavior |

### `tariff_charges`
Individual charge components within a tariff.

| Field | Source Evidence |
|---|---|
| `charge_group` | Groups charges for display on invoice |
| `charge_type` | STEPS (tiered), FLAT (rate*units), STATIC (fixed), PER_UNIT (per-unit with cap), ZERO (zero-consumption) |
| `flat_amount` | Used for STATIC charges |
| `flat_rate` | Rate multiplier |
| `upper_limit` | Cap for PER_UNIT charges |

### `tariff_charges_details`
Tiered rate definitions for STEPS-type charges.

| Field | Source Evidence |
|---|---|
| `from_usage` / `to_usage` | Range boundaries for each tier |
| `rate_value` | Rate applied within tier |
| `extra_amount` | Additional fixed fee per tier |

---

## Entity Lifecycle

### Invoice Lifecycle
```
CREATED (draft) → ACTIVE (posted) → CANCELLED (rebilled)
                                    → PAID (collected)
```

### Billing Cycle Lifecycle
```
PENDING (form filled) → RUNNING (processing) → COMPLETED (results recorded)
                                                → FAILED (error during run)
```

### Meter Reading Lifecycle
```
RECORDED (uploaded) → VALIDATED (reviewed) → USED (consumption calc)
                                              → SUPERSEDED (new reading replaces)
```

---

## Key Relationships

1. **BILLING_CYCLE → INVOICE**: One-to-many — a cycle generates many invoices
2. **INVOICE → INVOICE_DETAILS**: One-to-many — each invoice has multiple line items
3. **METER → INVOICE**: One-to-many — a meter is billed in many cycles
4. **CUSTOMER → INVOICE**: One-to-many — a customer receives many invoices
5. **METER → TARIFF**: Many-to-one — meters share tariffs
6. **TARIFF → TARIFF_CHARGES**: One-to-many — a tariff defines multiple charges
7. **TARIFF_CHARGES → TARIFF_CHARGES_DETAILS**: One-to-many — step charges have tier details
8. **METER → METER_READING**: One-to-many — meters accumulate readings over time

## Invoice Balance Tracking

The invoice table tracks customer balance impact:
```
balance_after = balance_before + total_amt
```

This allows the system to maintain a running ledger of customer balances without a separate ledger table. The dashboard shows:
- Total invoiced: 163,626,755 EGP
- Total paid: 147,860,893 EGP (90%)
- Total open: 15,765,862 EGP (9.64%)
