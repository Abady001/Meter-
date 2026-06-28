# SBill Legacy Schema — Meter Module Reverse Engineering

**Date:** 2026-06-26
**Source:** `reference/sbill/OctoberBilling-Complete/01_database/PalmHills_Billing_FullSchema.sql`

---

## LEGACY TABLES (36 total)

| Table | Purpose |
|-------|---------|
| project | Projects/developments |
| location | Locations/units |
| customer | Customer records |
| contact_person | Customer contacts |
| **meter** | **Main meter table** |
| **customer_meter** | **Customer-meter assignment (junction)** |
| **location_meter** | **Location-meter assignment (junction)** |
| tariff | Tariff definitions |
| tariff_charges | Tariff line items (with ARABIC names) |
| tariff_charges_details | Tiered rates, fixed amounts, percentages |
| **monthly_reading** | **Monthly billing readings (aggregated)** |
| **meter_reading** | **Raw SEP readings** |
| invoice | Invoices with open_amt tracking |
| invoice_details | Line items with VAT (14% default) |
| cancelled_invoices | Cancellation audit trail |
| payment_center | Payment collection points |
| payment | Payments with settlement_amount |
| payment_fees | Additional fees on payments |
| cheque | Cheque tracking |
| bank_account | Company bank accounts |
| journal_entry / journal_entry_details | Double-entry accounting |
| claims / claim_details | Customer disputes |
| alerts_queue / alerts_sent | Notifications |
| user_audit / user_session / audit_log | Audit logging |
| billcycle_log | Billing cycle execution log |
| general_settings | Key-value configuration |

---

## KEY BUSINESS RULES DISCOVERED

### Meter
- `serial_number` is UNIQUE
- `type` is either 'ELECTRICITY' or 'Water'
- `status` is 'ACTIVE', 'INACTIVE', or 'DISCONNECTED'
- `active` BIT flag (soft delete)
- Has `location_id` FK to location
- Assigned to customers via `customer_meter` junction table
- Assigned to locations via `location_meter` junction table

### Customer-Meter Assignment
- Junction table with `active`, `assigned_date`, `release_date`
- One customer can have multiple meters
- One meter assigned to one customer at a time (unique constraint on customer_id+meter_id)
- Release date tracks when meter was removed from customer

### Location-Meter Assignment
- Same pattern as customer_meter
- Tracks where meter is physically installed

### Readings
- Two tables: `meter_reading` (raw SEP data) and `monthly_reading` (billing aggregates)
- `meter_reading` has `result_type` (10=Electricity, 100=Water)
- `monthly_reading` has `consumption` computed from readings + `billcycle_id`
- Sources: SEP, MANUAL, BULK
- Status: VALID, INVALID, SUSPECT

### Tariffs
- Type: 'ELECTRICITY' or 'Water'
- `tariff_charges` has `charge_name_ar` (Arabic)
- `calculation_type`: RATE, FIXED, PERCENTAGE
- `tariff_charges_details`: tiered consumption (from_unit → to_unit), rate, fixed_amount, percentage
- Percentage used for VAT (14%), labour (15%), etc.

### Invoices
- Status: UNPAID, PARTIAL, PAID, CANCELLED
- `open_amt` tracks remaining balance
- `type`: REGULAR, CONTRACTUAL, ESTIMATE
- `meter_type`: 'ELECTRICITY' or 'Water'
- Invoice details have VAT: `vat_percent DEFAULT 14`, `vat_amount`
- Cancellation creates `cancelled_invoices` record

### Payments
- `payment_type`: CASH, CHEQUE, TRANSFER, ONLINE
- `settlement_amount` tracks after-fees amount
- Payment fees tracked in `payment_fees`
- Cheques tracked in `cheque` table with PENDING/status

### Bill Cycle
- `billcycle_log` tracks execution: STARTED, PROCESSING, COMPLETED, FAILED
- Counts of customers, invoices, total amount
- Error messages captured

---

## GAPS vs METER VERSE

| Feature | SBill Legacy | Meter Verse | Gap |
|---------|-------------|-------------|-----|
| Meter model | Simple (7 fields) | Rich (25+ fields) | MV is superset ✅ |
| Customer-meter junction | Yes (with active/assigned/release) | Via meter_assignments | Partial |
| Location-meter junction | Yes (separate table) | Via meter_assignments | Merged in MV |
| Reading result_type (10/100) | Yes | Not in MV schema | ❌ MISSING |
| Monthly reading (aggregated) | Yes | Not in MV (only raw) | ❌ MISSING |
| Arabic charge names | Yes (charge_name_ar) | No Arabic in tariffs | ❌ MISSING |
| VAT per line item | Yes (14% default) | In Invoice model (taxAmount) | ✅ Partially matches |
| Open amount tracking | Yes (open_amt) | Yes (remainingAmount) | ✅ MATCHES |
| Cancelled invoices table | Yes (separate) | No separate table (in MV status) | Acceptable |
| Payment fees | Yes | Not in MV | ❌ MISSING |
| Cheque tracking | Yes | Not in MV | ❌ MISSING |
| Claims/disputes | Yes | Tickets module | ✅ PARTIAL |
| Bill cycle log | Yes | BillCycle module | ✅ PARTIAL |
| Journal entries (double-entry) | Yes | Ledger service | ✅ PARTIAL |
