# Database Discovery
## SBill Reverse Engineering — Phase 1

## SBill Database Schema

### Tables discovered from JRXML SQL queries:

## 1. `invoice`

**Purpose**: Stores invoice headers for all utility types.

**Discovered in**: `invoice_elec.jrxml`, `invoice_water.jrxml`, `invoices.jrxml`, `canceled_invoices.jrxml`

| Column | Type | Description |
|--------|------|-------------|
| id | Long | Primary key |
| number | String | Invoice number |
| status | String | Status (ACTIVE, DELETED, CANCELLED) |
| issue_date | Timestamp | Invoice issue date |
| counsumption_month | Timestamp | Billing period/month |
| total_amt | Long | Total amount (in milliemes, /1000 for display) |
| open_amt | Long | Open/unpaid amount |
| balance_after | Long | Balance after invoice |
| balance_before | Long | Balance before invoice |
| customer_id | Long | FK → customer(id) |
| meter_id | Long | FK → meter(id) |
| billcycle_log_id | Long | FK → billcycle_logs(id) |
| start_reading | Double | Start reading value |
| end_reading | Double | End reading value |
| consumption_value | Double | Total consumption |
| meter_serial | String | Denormalized meter serial |
| total_consumption | Double | Total consumption |

**Relationships**:
- invoice → customer (many-to-one)
- invoice → meter (many-to-one)
- invoice → invoice_details (one-to-many)

## 2. `invoice_details`

**Purpose**: Line items/charges for each invoice. Each detail has a charge_group.

**Discovered in**: All invoice JRXMLs

| Column | Type | Description |
|--------|------|-------------|
| id | Long | Primary key |
| invoice_id | Long | FK → invoice(id) |
| charge_group | String | 'CONSUMPTION', 'CUSTOMER_SERVICE', 'ISSUE_FEES', 'FEES' |
| amount | Long | Amount in milliemes |
| start_reading | Double | Reading at start |
| end_reading | Double | Reading at end |
| consumption_value | Double | Consumption for this line |

**Charge Groups**:
| Group ID | Electricity Name | Water Name | Description |
|----------|-----------------|------------|-------------|
| 0 | CONSUMPTION | CONSUMPTION | Consumption charge |
| 1 | FEES | — | Other fees/stamps |
| 2,3 | CUSTOMER_SERVICE | CUSTOMER_SERVICE | Customer service fees |
| 4 | ISSUE_FEES | Admin | Administrative/issue fees |
| 5 | — | PERCENTAGE | Percentage charge |
| 6 | — | VAT | VAT (New water template) |
| 7 | — | OTHER | Other (New water template) |

## 3. `customer`

**Purpose**: Customer/property owner information.

**Discovered in**: All invoice JRXMLs

| Column | Type | Description |
|--------|------|-------------|
| id | Long | Primary key |
| name_ar | String | Arabic name |
| tenant_name | String | Tenant name (if rented) |
| code | String | Customer code |
| project_id | Long | FK → adm_project(id) |

**Expression from JRXML**: `$F{tenant_name} == null ? $F{name_ar} : $F{tenant_name}`

## 4. `meter`

**Purpose**: Meter registry for all utilities.

**Discovered in**: All invoice JRXMLs

| Column | Type | Description |
|--------|------|-------------|
| id | Long | Primary key |
| serial | String | Meter serial number |
| unit_id | Long | FK → unit(id) |
| customer_id | Long | FK → customer(id) |
| tariff_id | Long | FK → tariff(id) |
| project_id | Long | FK → adm_project(id) |

## 5. `tariff`

**Purpose**: Tariff plan definitions.

**Discovered in**: `invoice_elec.jrxml`, `active_tariff.jrxml`

| Column | Type | Description |
|--------|------|-------------|
| id | Long | Primary key |
| name_en | String | English name |
| service | String | Utility service type |
| mode | String | Tariff mode |
| status | String | ACTIVE/INACTIVE |
| flat_rate | Decimal | Flat rate |
| start_date | Timestamp | Effective date |

## 6. `tariff_charges`

**Purpose**: Charge line items within a tariff.

**Discovered in**: `sub_report_tariff_charge.jrxml`

| Column | Type | Description |
|--------|------|-------------|
| id | Long | Primary key |
| tariff_id | Long | FK → tariff(id) |
| name_en | String | Charge name |
| flat_amount | Decimal | Fixed charge amount |
| flat_rate | Decimal | Rate per unit |
| recurring_mode | String | ONETIME/MONTHLY/YEARLY |
| charge_group | String | CONSUMPTION/CUSTOMER_SERVICE/etc |
| upper_limit | Decimal | Upper limit for this charge |

## 7. `tariff_charges_details`

**Purpose**: Tiered/stepped rate definitions within a charge.

**Discovered in**: `sub_report_tariff_charge_detail.jrxml`

| Column | Type | Description |
|--------|------|-------------|
| id | Long | Primary key |
| charge_id | Long | FK → tariff_charges(id) |
| from_usage | Decimal | Tier start |
| to_usage | Decimal | Tier end (null = unlimited) |
| rate_value | Decimal | Rate for this tier |
| extra_amount | Decimal | Extra fixed amount for this tier |

## 8. `unit` / `location`

**Purpose**: Property unit (apartment/villa/retail unit) within a project.

**Discovered in**: `invoice_elec.jrxml`, `invoice_water.jrxml`

| Column | Type | Description |
|--------|------|-------------|
| id | Long | Primary key |
| unit_no | String | Unit number |
| additional_info | String | Additional info |
| city | String | City/location |
| address_ar | String | Arabic address |

The electricity template uses `unit.unit_no + ' ' + unit.city as address_ar`.
The water template uses `location.address_ar` directly.

## 9. `adm_project`

**Purpose**: Project registry (Palm Hills, Golf Views, etc.).

**Discovered in**: `invoice_elec.jrxml`, `invoices.jrxml`

| Column | Type | Description |
|--------|------|-------------|
| id | Long | Primary key |
| project_title_ar | String | Arabic project name |
| address_ar | String | Project address |
| company_info | String | Company info/header text |
| img | String | Base64 logo |
| license | String | License number |
| signature | String | Base64 signature |

## 10. `billcycle_logs`

**Purpose**: Billing cycle run log.

**Discovered in**: `invoice_elec.jrxml` (parameter)

| Column | Type | Description |
|--------|------|-------------|
| id | Long | Primary key |

## 11. `payment`

**Purpose**: Payment receipts.

**Discovered in**: `payment_receipt.jrxml`, `payments.jrxml`

| Column | Type | Description |
|--------|------|-------------|
| id | Long | Primary key |
| receipt_no | String | Receipt number |
| customer_id | Long | FK → customer(id) |
| total_amt | Long | Payment amount |
| type | String | CASH/CHEQUE/VISA/ONLINE/TRANSFER |
| payment_date | Timestamp | Payment date |
| status | String | ACTIVE/CANCELLED |
| created_by | String | User who created |
| balance_before | Long | Balance before payment |
| balance_after | Long | Balance after payment |

## 12. `meter_settlements`

**Purpose**: Meter settlement/adjustment entries.

**Discovered in**: `settlements.jrxml` (reading template)

| Column | Type | Description |
|--------|------|-------------|
| id | Long | Primary key |
| meter_id | Long | FK → meter(id) |
| amount | Decimal | Settlement amount |
| reason | String | Reason for settlement |

## Entity Relationship Summary

```
adm_project
  ├── project_id → customer.project_id
  ├── project_id → meter.project_id
  └── project_id → billcycle_logs

customer
  ├── id → invoice.customer_id
  ├── id → meter.customer_id
  └── id → payment.customer_id

unit
  └── id → meter.unit_id

meter
  ├── id → invoice.meter_id
  └── id → meter_settlements.meter_id

tariff
  └── id → meter.tariff_id

tariff_charges
  └── tariff_id → tariff.id

tariff_charges_details
  └── charge_id → tariff_charges.id

invoice
  ├── id → invoice_details.invoice_id
  └── billcycle_log_id → billcycle_logs.id

payment
  └── customer_id → customer.id

meter_settlements
  └── meter_id → meter.id
```

## Meter Verse Equivalent Tables

| SBill Table | Meter Verse Table | Status |
|-------------|------------------|--------|
| invoice | sim_system.invoice | ✅ Compatible |
| invoice_details | sim_system.invoice_line | ✅ Compatible |
| customer | sim_system.customer | ✅ Compatible |
| meter | sim_system.meter | ✅ Compatible |
| tariff | sim_system.tariff_plan | ✅ Compatible |
| tariff_charges | sim_system.tariff_charge | ✅ Compatible |
| tariff_charges_details | sim_system.tariff_charge_detail | ✅ Compatible |
| unit | sim_system.unit | ✅ Compatible |
| adm_project | sim_system.project | ✅ Compatible |
| payment | sim_system.payment | ⚠️ Partial |
| meter_settlements | sim_system.settlement | ✅ Compatible |
| billcycle_logs | sim_system.billing_period | ⚠️ Different structure |
