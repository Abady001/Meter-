# SBill Report Dependency Catalog

> **Source**: JRXML catalog reverse-engineered from SBill production system.
> **Purpose**: Complete table/field dependency map for all 16 known report types. Each report is documented with its required tables, key fields, filter criteria, and sort order. This catalog drives the Meter Verse reporting engine build-out.

---

## 1. Invoices Summary

| Attribute | Value |
|-----------|-------|
| **JRXML** | `invoices_summary.jrxml` / `rpt_invoices_summary.jasper` |
| **Purpose** | Summary of all invoices in a given period with status breakdown |
| **Filter** | `issue_date` range, `project_id`, `status` |

| Table | Required Fields | Join |
|-------|----------------|------|
| `invoice` | `id`, `number`, `status`, `issue_date`, `total_amt`, `open_amt`, `balance_before`, `balance_after`, `customer_id`, `meter_id`, `billcycle_log_id` | Central table |
| `customer` | `id`, `code`, `name_ar`, `tenant_name` | `customer.id = invoice.customer_id` |
| `meter` | `id`, `serial`, `unit_id` | `meter.id = invoice.meter_id` |
| `unit` | `id`, `unit_no`, `city` | `unit.id = meter.unit_id` |
| `adm_project` | `id`, `project_title_ar`, `address_ar` | `adm_project.id = customer.project_id` |

**Sort**: `invoice.issue_date DESC`, `customer.name_ar ASC`

---

## 2. Canceled Invoices

| Attribute | Value |
|-----------|-------|
| **JRXML** | `canceled_invoices.jrxml` / `rpt_canceled_invoices.jasper` |
| **Purpose** | Audit report of all voided/canceled invoices with reason |
| **Filter** | `invoice.status IN ('DELETED', 'INACTIVE')`, `issue_date` range |

| Table | Required Fields | Join |
|-------|----------------|------|
| `invoice` | `id`, `number`, `status`, `issue_date`, `total_amt`, `open_amt`, `customer_id` | Central table |
| `customer` | `id`, `code`, `name_ar` | `customer.id = invoice.customer_id` |
| `adm_project` | `id`, `project_title_ar` | `adm_project.id = customer.project_id` |

**Notes**: Cancelation reason may be in a notes/remarks field on invoice (not yet mapped).

---

## 3. Monthly Finance

| Attribute | Value |
|-----------|-------|
| **JRXML** | `monthly_finance.jrxml` / `rpt_monthly_finance.jasper` |
| **Purpose** | Revenue aggregation by month — invoice totals vs payment totals |
| **Filter** | Financial year, `project_id` |

| Table | Required Fields | Aggregate |
|-------|----------------|-----------|
| `invoice` | `issue_date`, `total_amt`, `status` | `SUM(total_amt)` grouped by month/year |
| `payment` | `payment_date`, `total_amt`, `status` | `SUM(total_amt)` grouped by month/year |

**Derived Fields**:
- `invoice_month = MONTH(issue_date)`, `invoice_year = YEAR(issue_date)`
- `payment_month = MONTH(payment_date)`, `payment_year = YEAR(payment_date)`
- `outstanding_amt = SUM(invoice.total_amt) - SUM(payment.total_amt)`

**Sort**: Year ASC, Month ASC

---

## 4. Monthly Consumption

| Attribute | Value |
|-----------|-------|
| **JRXML** | `monthly_consumption.jrxml` / `rpt_monthly_consumption.jasper` |
| **Purpose** | Consumption aggregation by meter/month with comparison periods |
| **Filter** | `reading_at` range, `meter_id` (optional), `project_id` |

| Table | Required Fields | Aggregate |
|-------|----------------|-----------|
| `meter_reading` | `id`, `meter_id`, `reading_value`, `reading_at` | Central fact table |
| `meter` | `id`, `serial`, `unit_id`, `customer_id` | `meter.id = meter_reading.meter_id` |
| `unit` | `id`, `unit_no`, `city` | `unit.id = meter.unit_id` |
| `customer` | `id`, `code`, `name_ar` | `customer.id = meter.customer_id` |

**Derived Fields**:
- `period_consumption = current_reading - previous_reading`
- `reading_month = MONTH(reading_at)`, `reading_year = YEAR(reading_at)`

**Sort**: Unit No ASC, Reading At ASC

---

## 5. Customer Statement

| Attribute | Value |
|-----------|-------|
| **JRXML** | `customer_statement.jrxml` / `rpt_customer_statement.jasper` |
| **Purpose** | Full transaction history for a single customer — invoices + payments + settlements |
| **Filter** | `customer_id` (single), date range |

| Table | Required Fields | Join |
|-------|----------------|------|
| `customer` | `id`, `code`, `name_ar`, `tenant_name`, `project_id` | Header |
| `invoice` | `id`, `number`, `issue_date`, `total_amt`, `open_amt`, `status` | `customer.id = invoice.customer_id` |
| `payment` | `id`, `receipt_no`, `payment_date`, `total_amt`, `type`, `status`, `balance_before`, `balance_after` | `customer.id = payment.customer_id` |
| `invoice_details` | `id`, `invoice_id`, `charge_group`, `amount`, `start_reading`, `end_reading`, `consumption_value` | `invoice_details.invoice_id = invoice.id` |
| `adm_project` | `id`, `project_title_ar`, `license`, `company_info`, `signature` | Statement footer |

**Derived Fields**:
- `running_balance`: computed as opening balance + SUM(all debits) - SUM(all credits)
- Transaction type discriminator: invoice vs payment vs settlement

**Sort**: Transaction Date ASC

---

## 6. Customer Claims

| Attribute | Value |
|-----------|-------|
| **JRXML** | `customer_claims.jrxml` / `rpt_customer_claims.jasper` |
| **Purpose** | Outstanding claims (disputed amounts, adjustments) per customer |
| **Filter** | `claim_date` range, `project_id`, `status` |

| Table | Required Fields | Join |
|-------|----------------|------|
| `invoice` | `id`, `number`, `total_amt`, `open_amt`, `status` | `invoice.id = settlement.invoice_id` (assumed FK) |
| `meter_settlements` | `id`, `meter_id`, `amount`, `reason` | `meter_settlements.meter_id = meter.id` |
| `settlement_type` | `id`, `name`, `allowed_months` | `meter_settlements.settlement_type_id = settlement_type.id` |
| `customer` | `id`, `code`, `name_ar` | `customer.id = invoice.customer_id` |
| `meter` | `id`, `serial` | `meter.id = invoice.meter_id` |

**Sort**: Customer Code ASC, Settlement Date ASC

---

## 7. Payments

| Attribute | Value |
|-----------|-------|
| **JRXML** | `payments.jrxml` / `rpt_payments.jasper` |
| **Purpose** | All payments within a period with receipt details |
| **Filter** | `payment_date` range, `payment.type`, `project_id`, `status` |

| Table | Required Fields | Join |
|-------|----------------|------|
| `payment` | `id`, `receipt_no`, `customer_id`, `total_amt`, `type`, `payment_date`, `status`, `balance_before`, `balance_after` | Central table |
| `customer` | `id`, `code`, `name_ar` | `customer.id = payment.customer_id` |
| `adm_project` | `id`, `project_title_ar` | `adm_project.id = customer.project_id` |

**Sort**: Payment Date DESC, Receipt No DESC

---

## 8. Payment Receipt

| Attribute | Value |
|-----------|-------|
| **JRXML** | `payment_receipt.jrxml` / `rpt_payment_receipt.jasper` |
| **Purpose** | Single payment receipt for print/email with project branding |
| **Filter** | `payment.id` (single) |

| Table | Required Fields | Join |
|-------|----------------|------|
| `payment` | All fields | Central |
| `customer` | `id`, `code`, `name_ar`, `tenant_name` | `customer.id = payment.customer_id` |
| `adm_project` | `id`, `project_title_ar`, `address_ar`, `license`, `img`, `company_info`, `signature` | Footer/branding |
| `invoice` | `id`, `number`, `total_amt` | For receipt reference lines (if payment is invoice-linked) |

**Notes**: Receipt layout includes: project logo (`img`), company info, license number, customer info, payment breakdown, signature block.

---

## 9. Meters Status

| Attribute | Value |
|-----------|-------|
| **JRXML** | `meters_status.jrxml` / `rpt_meters_status.jasper` |
| **Purpose** | Inventory of all meters with current status, location, and assignment |
| **Filter** | `project_id`, `status` (optional), `meter_type` (optional) |

| Table | Required Fields | Join |
|-------|----------------|------|
| `meter` | `id`, `serial`, `status`, `type`, `tariff_id`, `customer_id`, `unit_id`, `project_id` | Central table |
| `unit` | `id`, `unit_no`, `additional_info`, `city` | `unit.id = meter.unit_id` |
| `customer` | `id`, `code`, `name_ar` | `customer.id = meter.customer_id` |
| `tariff` | `id`, `name_ar`, `service_type`, `status` | `tariff.id = meter.tariff_id` |

**Sort**: Unit No ASC, Meter Serial ASC

---

## 10. Aggregated Readings

| Attribute | Value |
|-----------|-------|
| **JRXML** | `aggregated_readings.jrxml` / `rpt_aggregated_readings.jasper` |
| **Purpose** | Summed consumption readings grouped by meter and billing period |
| **Filter** | `reading_at` range, `project_id`, `meter_id` (optional) |

| Table | Required Fields | Aggregate |
|-------|----------------|-----------|
| `meter_reading` | `meter_id`, `reading_value`, `reading_at` | `SUM(reading_value)`, `MAX(reading_at)` |
| `meter` | `id`, `serial`, `unit_id` | GROUP BY `meter_id` |
| `unit` | `id`, `unit_no`, `city` | `unit.id = meter.unit_id` |

**Derived Fields**:
- `reading_count = COUNT(*)` per meter
- `avg_consumption = SUM(reading_value) / COUNT(*)`
- Period-over-period comparison (current vs previous cycle)

**Sort**: City ASC, Unit No ASC

---

## 11. Disconnected Meters

| Attribute | Value |
|-----------|-------|
| **JRXML** | `disconnected_meters.jrxml` / `rpt_disconnected_meters.jasper` |
| **Purpose** | Meters currently disconnected (INACTIVE status) with disconnection date |
| **Filter** | `meter.status = 'INACTIVE'` |

| Table | Required Fields | Join |
|-------|----------------|------|
| `meter` | `id`, `serial`, `status`, `type`, `customer_id`, `unit_id` | `status = 'INACTIVE'` |
| `unit` | `id`, `unit_no`, `city` | `unit.id = meter.unit_id` |
| `customer` | `id`, `code`, `name_ar` | `customer.id = meter.customer_id` |

**Derived Fields**:
- `disconnection_date`: may come from a meter_status_log or the last status change date
- `days_disconnected`: DATEDIFF between disconnection date and report run date

**Sort**: Days Disconnected DESC

---

## 12. User Audit Log

| Attribute | Value |
|-----------|-------|
| **JRXML** | `user_audit_log.jrxml` / `rpt_user_audit_log.jasper` |
| **Purpose** | Complete audit trail of user actions (login, invoice create, payment post, etc.) |
| **Filter** | `user_id` (optional), `action_date` range, `action_type` |

| Table | Required Fields | Join |
|-------|----------------|------|
| `adm_user` | `id`, `username`, `name_ar`, `role` | Central (for user context) |
| `audit_log` | `id`, `user_id`, `action_type`, `action_date`, `entity_type`, `entity_id`, `old_value`, `new_value`, `ip_address` | Assumed table (not yet mapped in SBill) |
| — or — | From trigger-based audit tables per entity | — |

**Notes**: The audit trail may be implemented via database triggers or application-level logging. If trigger-based, tables like `invoice_audit`, `payment_audit`, `customer_audit` may exist. Further investigation needed.

**Sort**: Action Date DESC

---

## 13. Active Tariffs

| Attribute | Value |
|-----------|-------|
| **JRXML** | `active_tariffs.jrxml` / `rpt_active_tariffs.jasper` |
| **Purpose** | All active tariffs with associated charges and tier breakdowns |
| **Filter** | `tariff.status = 'ACTIVE'`, `project_id` (optional), `service_type` (optional) |

| Table | Required Fields | Join |
|-------|----------------|------|
| `tariff` | `id`, `name_ar`, `service_type`, `mode`, `status`, `flat_rate`, `start_date`, `end_date` | Central (status = ACTIVE) |
| `tariff_charges` | `id`, `tariff_id`, `name_en`, `flat_amount`, `flat_rate`, `recurring_mode`, `charge_group`, `upper_limit`, `charge_type` | `tariff_charges.tariff_id = tariff.id` |
| `tariff_charges_details` | `id`, `charge_id`, `from_usage`, `to_usage`, `rate_value`, `calculated_amount`, `extra_amount` | `tariff_charges_details.charge_id = tariff_charges.id` |

**Derived Fields**:
- `charge_count = COUNT(tariff_charges.id)` per tariff
- `tier_count = COUNT(tariff_charges_details.id)` per charge
- Tariff validity range expressed as `start_date → end_date`

**Sort**: Tariff Name ASC, Charge Group ASC

---

## 14. Consumption Steps

| Attribute | Value |
|-----------|-------|
| **JRXML** | `consumption_steps.jrxml` / `rpt_consumption_steps.jasper` |
| **Purpose** | Invoice-level detail showing how consumption was split across charge tiers |
| **Filter** | `invoice_id` range, `invoice.issue_date` range, `project_id` |

| Table | Required Fields | Join |
|-------|----------------|------|
| `invoice_details` | `id`, `invoice_id`, `charge_group`, `amount`, `start_reading`, `end_reading`, `consumption_value` | Central fact table |
| `invoice` | `id`, `number`, `issue_date`, `customer_id`, `meter_id` | `invoice.id = invoice_details.invoice_id` |
| `customer` | `id`, `code`, `name_ar` | `customer.id = invoice.customer_id` |
| `meter` | `id`, `serial` | `meter.id = invoice.meter_id` |

**Derived Fields**:
- `step_consumption = consumption_value` (by charge group)
- `step_rate = amount / consumption_value` (effective unit rate per step)

**Sort**: Invoice Number ASC, Charge Group ASC

---

## 15. Billing Cycle Log (UI-adjacent)

| Attribute | Value |
|-----------|-------|
| **JRXML** | Referenced in invoice FK as `billcycle_log_id` |
| **Purpose** | Record of each bill cycle execution (who ran it, when, results) |

| Table | Required Fields | Notes |
|-------|----------------|-------|
| `billcycle_logs` | `id`, `billing_cycle_id`, `started_at`, `completed_at`, `status`, `total_count`, `success_count`, `failed_count`, `created_by` | Referenced by `invoice.billcycle_log_id` |
| `billing_cycle` | `id`, `month`, `service`, `project_id`, `status`, `created_by`, `created_at` | Defines the cycle parameters |

**Notes**: This is the execution log for a bill cycle run. One `billing_cycle` record may have many `billcycle_logs` entries (if re-run).

---

## 16. Invoice Details by Customer (cross-ref)

| Attribute | Value |
|-----------|-------|
| **JRXML** | Implicit in Customer Statement |
| **Purpose** | Detailed invoice line items for a specific customer |

| Table | Required Fields |
|-------|----------------|
| `invoice` | `id`, `number`, `issue_date`, `total_amt` |
| `invoice_details` | `id`, `invoice_id`, `charge_group`, `amount`, `start_reading`, `end_reading`, `consumption_value` |
| `tariff_charges` | `name_en`, `charge_group`, `charge_type` (for display labels) |

**Derived Fields**:
- Line item label = `tariff_charges.name_en` (resolved via charge_group)
- Line item rate = `amount / consumption_value` if consumption > 0

---

## Dependency Summary Matrix

```
Report                    Tables Required
─────────────────────────────────────────────────────
Invoices Summary          6 (invoice, customer, meter, unit, project, billcycle_log)
Canceled Invoices         3 (invoice, customer, project)
Monthly Finance           2 (invoice, payment)
Monthly Consumption       4 (meter_reading, meter, unit, customer)
Customer Statement        5 (customer, invoice, payment, invoice_details, project)
Customer Claims           5 (invoice, meter_settlements, settlement_type, customer, meter)
Payments                  3 (payment, customer, project)
Payment Receipt           4 (payment, customer, project, invoice)
Meters Status             4 (meter, unit, customer, tariff)
Aggregated Readings       3 (meter_reading, meter, unit)
Disconnected Meters       3 (meter, unit, customer)
User Audit Log            2 (adm_user, audit_log)
Active Tariffs            3 (tariff, tariff_charges, tariff_charges_details)
Consumption Steps         4 (invoice_details, invoice, customer, meter)
Billing Cycle Log         2 (billcycle_logs, billing_cycle)
Invoice Details Detail    3 (invoice, invoice_details, tariff_charges)

Core Tables Legend:
  invoice              ★★★★★  (12 reports)
  customer             ★★★★★  (11 reports)
  meter                ★★★★   (8 reports)
  payment              ★★★    (5 reports)
  project              ★★★    (5 reports)
  unit                 ★★★    (5 reports)
  meter_reading        ★★     (2 reports)
  tariff/tariff_charges★★     (2 reports)
  invoice_details      ★★     (2 reports)
```

---

## Implementation Notes for Meter Verse

1. **Highest-priority tables for report engine**: `invoice`, `customer`, `meter`, `payment` — these appear in 75%+ of reports.

2. **Missing lookup tables in MV**: `settlement_type`, `billcycle_logs`, `billing_cycle`, `audit_log` do not exist in `sim_system` schema.

3. **Aggregate functions** needed: `SUM`, `COUNT`, `MONTH()`, `YEAR()`, `DATEDIFF`, running totals.

4. **Report parameters**: Every report needs at minimum: `project_id`, date range filters. Most need additional optional filters (status, type, customer, meter).

5. **PDF generation**: MV's existing `InvoiceTemplateService` with Puppeteer should be extended to a general-purpose `ReportService` that accepts report type + parameters.
