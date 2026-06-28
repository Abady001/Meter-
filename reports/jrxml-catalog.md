# JRXML Template Catalog — Phase 9 Investigation

> **Status**: INVESTIGATION / PLANNING ONLY — no code changes, no database writes.
> **Source**: Walk of `Meter/templates/` and `template jxlmr/` directories.
> **Total templates found**: 117

---

## 1. INVOICE TEMPLATES

### 1.1 `templates/invoice/electricity/invoice_elec.jrxml`
| Property | Value |
|----------|-------|
| **Name** | `elec_invoice` |
| **Page** | 421×297mm, Landscape |
| **Margins** | 4,4,5,5 |
| **Parameters** | `invoiceId` (Long), `billcycleLogId` (Long) |
| **Fields** | project_title, license, company_info, logo, signature, invoice_id, status, customer_code, customer_id, name_ar, tenant_name, number, meter_serial, tariff_name, counsumption_month, due_date, total_amt, total_consumption, unit_no, additional_info, address_ar, start_reading, end_reading, consumption_value, Cons, CS, Admin, OTHER |
| **Query** | 5-table JOIN (invoice → meter → customer → tariff → unit) with charge_group subqueries |
| **Purpose** | Electricity invoice print (Arabic invoice) |
| **Utility** | ELECTRICITY |

### 1.2 `templates/invoice/electricity/invoice_elec_zim.jrxml`
| Property | Value |
|----------|-------|
| **Name** | `elec_invoice` |
| **Page** | 421×297mm, Landscape |
| **Query** | Similar to invoice_elec but for ZIM (Zimbabwe) project |
| **Purpose** | Electricity invoice for ZIM project |
| **Utility** | ELECTRICITY |

### 1.3 `templates/invoice/electricity/xx_invoice_elec.jrxml`
| Property | Value |
|----------|-------|
| **Name** | `elec_invoice` |
| **Page** | 421×297mm, Landscape |
| **Margins** | 4,4,5,5 |
| **Parameters** | `invoiceId` (Long) |
| **Fields** | id, number, status, issue_date, counsumption_month, counsumption_value, start_reading, end_reading, meter_serial, customer_id, name, total_amt, open_amt, balance_after, balance_before, name_ar, unit_no, address_ar, city, Cons, Admin, CS |
| **Query** | 5-table JOIN with location table (older model) |
| **Purpose** | Electricity invoice (older/backup version) |
| **Utility** | ELECTRICITY |

### 1.4 `templates/invoice/water/invoice_water.jrxml`
| Property | Value |
|----------|-------|
| **Name** | `elec_invoice` |
| **Page** | 421×297mm, Landscape |
| **Margins** | 4,4,5,5 |
| **Parameters** | `invoiceId` (Long), `billcycleLogId` (Long) |
| **Fields** | All invoice fields + PERCENTAGE (charge_group 5) |
| **Query** | 5-table JOIN (invoice → customer → meter → tariff → location) |
| **Purpose** | Water invoice print |
| **Utility** | WATER |

### 1.5 `templates/invoice/water/invoice_water_new.jrxml`
| Property | Value |
|----------|-------|
| **Name** | `elec_invoice` |
| **Page** | 421×297mm, Landscape |
| **Query** | Uses meter/unit/customer model (newer) |
| **Purpose** | Water invoice (new version) |
| **Utility** | WATER |

### 1.6 `templates/invoice/water/xx_invoice_water.jrxml`
| Property | Value |
|----------|-------|
| **Name** | `elec_invoice` |
| **Page** | 421×297mm, Landscape |
| **Parameters** | `invoiceId` (Long) |
| **Purpose** | Water invoice (older/backup version) |
| **Utility** | WATER |

### 1.7 `template jxlmr/Incoices/invoice_elec.jrxml`
| Property | Value |
|----------|-------|
| **Name** | `elec_invoice` |
| **Page** | 421×297mm, Landscape |
| **Parameters** | `invoiceId` (Long) |
| **Fields** | Same as templates/invoice version with Cons/Admin/CS by name |
| **Purpose** | Electricity invoice (jxlmr copy) |
| **Utility** | ELECTRICITY |

### 1.8 `template jxlmr/Incoices/invoice_elec_zim.jrxml`
| Property | Value |
|----------|-------|
| **Name** | `elec_invoice` |
| **Page** | 421×297mm, Landscape |
| **Purpose** | Electricity invoice for ZIM (jxlmr copy) |
| **Utility** | ELECTRICITY |

### 1.9 `template jxlmr/Incoices/invoice_water.jrxml`
| Property | Value |
|----------|-------|
| **Name** | `elec_invoice` |
| **Page** | 421×297mm, Landscape |
| **Purpose** | Water invoice (jxlmr copy) |
| **Utility** | WATER |

### 1.10 `template jxlmr/Incoices/invoice_water_new.jrxml`
| Property | Value |
|----------|-------|
| **Name** | `elec_invoice` |
| **Page** | 421×297mm, Landscape |
| **Purpose** | Water invoice new (jxlmr copy) |
| **Utility** | WATER |

### 1.11 `template jxlmr/Incoices/invoice_water_new_Palm.jrxml`
| Property | Value |
|----------|-------|
| **Name** | `elec_invoice` |
| **Page** | 421×297mm, Landscape |
| **Purpose** | Water invoice for Palm Hills project |
| **Utility** | WATER |

### 1.12 `template jxlmr/Incoices/xx_invoice_elec.jrxml`
| Property | Value |
|----------|-------|
| **Name** | `elec_invoice` |
| **Page** | 421×297mm, Landscape |
| **Parameters** | `invoiceId` (Long), `contactPersonNames` (String) |
| **Fields** | id, number, status, issue_date, counsumption_month, counsumption_value, start_reading, end_reading, meter_serial, customer_id, name, total_amt (Integer), open_amt (Integer), balance_after, balance_before, name_ar, unit_no, address_ar, city, Cons, Admin, CS |
| **Query** | 5-table JOIN using location table, named charge groups |
| **Purpose** | Electricity invoice (older backup) |
| **Utility** | ELECTRICITY |

### 1.13 `template jxlmr/Incoices/xx_invoice_water.jrxml`
| Property | Value |
|----------|-------|
| **Name** | `elec_invoice` |
| **Page** | 421×297mm, Landscape |
| **Purpose** | Water invoice (older backup) |
| **Utility** | WATER |

### 1.14 `template jxlmr/Incoices/invoices.jrxml`
| Property | Value |
|----------|-------|
| **Name** | `Invoices` |
| **Page** | 1190×595mm, Landscape |
| **Margins** | 20,20,20,20 |
| **Parameters** | `date_start` (String), `date_end` (String), `unit_number` (String), `status` (String), `service_type` (String), `tariff_id` (String), `project_id` (Integer) |
| **Fields** | project_title, address, logo, id, number, status, issue_date, counsumption_month, meter_serial, unit_no, amount (total_amt/1000), paid_amt, open_amt, service |
| **Query** | Invoice list with unit subquery, amount/paid/open in EGP |
| **Purpose** | Invoice listing report with filtering |
| **Utility** | ALL |

### 1.15 `template jxlmr/Incoices/invoices_detailed.jrxml`
| Property | Value |
|----------|-------|
| **Name** | `Invoices` |
| **Page** | 1221×595mm, Landscape |
| **Parameters** | `date_start`, `date_end`, `unit_number`, `status`, `service_type`, `tariff_id` |
| **Fields** | All invoice fields + total_consumption, start_reading, end_reading |
| **Purpose** | Detailed invoice listing with readings |
| **Utility** | ALL |

### 1.16 `template jxlmr/Incoices/invoices_additional.jrxml`
| Property | Value |
|----------|-------|
| **Name** | `Invoices_additional` |
| **Page** | Likely similar to invoices.jrxml |
| **Purpose** | Additional invoice list (additional property variant) |
| **Utility** | ALL |

### 1.17 `template jxlmr/Incoices/canceled_invoices.jrxml`
| Property | Value |
|----------|-------|
| **Name** | `Canceled Invoices` |
| **Page** | 1350×842mm, Landscape |
| **Margins** | 20,20,20,20 |
| **Parameters** | `customer_name`, `meter_serial`, `unit_number`, `bill_cycle`, `meter_type`, `village`, `project_id` |
| **Fields** | project_title, address, logo, id, customer_name, name_ar, phone, total_amt, cancelation_reason, invoice_no, consumption, unit_no, start_reading, current_reading, issue_date, BC_DATE, meter_serial, service_name |
| **Query** | Meter→Invoice→Customer→Unit, status INACTIVE or DELETED |
| **Purpose** | List of cancelled/voided invoices |
| **Utility** | ALL |

### 1.18 `template jxlmr/Incoices/canceled_invoices_additional.jrxml`
| Property | Value |
|----------|-------|
| **Name** | `Canceled Invoices` |
| **Purpose** | Additional version of canceled invoices |
| **Utility** | ALL |

---

## 2. PAYMENT TEMPLATES

### 2.1 `templates/payment/payment_receipt.jrxml`
| Property | Value |
|----------|-------|
| **Name** | `payment_receipt` |
| **Page** | 684×842mm, Portrait, RTL |
| **Margins** | 20,20,20,20 |
| **Parameters** | `paymentId` (Long) — subdataset parameter |
| **Fields** | project_title, project_title_ar, project_subtitle, project_subtitle_ar, site_name, site_name_ar, id, status, customer_id, unit_no, name_ar, name_en, type, total_amt, advanced_amt, settlement_amount, receipt_no, payment_date, serial, meter_type, created_by, cheque_number, bank_name, balance_before, balance_after, last_reading_date |
| **Query** | Payment→Customer→Meter→Unit + settings |
| **Subdataset** | `payment reading details` — reading_type_name, reading_value, reading_date, unitEn, unitAr |
| **Purpose** | Full payment receipt with reading details |
| **Utility** | ALL |

### 2.2 `templates/payment/xx_payment_receipt.jrxml`
| Property | Value |
|----------|-------|
| **Name** | `payment_receipt` |
| **Page** | 828×842mm, Portrait, RTL |
| **Margins** | 20,20,20,20 |
| **Parameters** | `paymentId` (Long) |
| **Fields** | Same as payment_receipt.jrxml |
| **Query** | Payment→Customer→Meter→Location |
| **Purpose** | Payment receipt (older/backup) |
| **Utility** | ALL |

### 2.3 `templates/payment/payment_receipt_mini.jrxml`
| Property | Value |
|----------|-------|
| **Name** | `payment_receipt_mini` |
| **Page** | 216×453mm, Portrait, RTL |
| **Margins** | 20,20,20,20 |
| **Parameters** | `paymentId` (Long) |
| **Fields** | project_title, license, id, customer_id, commercial_name, tenant_name, unit_no, name_ar, name_en, type, total_amt, receipt_no, payment_date, serial, meter_type, created_by, cheque_number, bank_name, payment_fees |
| **Query** | Payment→Customer→Meter→Unit |
| **Purpose** | Mini/pocket receipt (thermal printer size) |
| **Utility** | ALL |

### 2.4 `templates/payment/payments.jrxml`
| Property | Value |
|----------|-------|
| **Name** | `payments` |
| **Page** | 2016×1027mm, Landscape |
| **Margins** | 20,20,20,20 |
| **Parameters** | `start_date`, `end_date`, `customer_name`, `meter_serial`, `meter_type`, `unit_number`, `bill-cycle`, `payment_type`, `village`, `project_id` |
| **Fields** | project_title, address, logo, id, receipt_no, status, payment_date, name_ar, name_en, unit_no, additional_info, address_en, city, center_name, total_amt, payment_type, serial, type, created_by, payment_channel_id, auth_code, ref_number, cheque_date, cheque_number, bank_name, transfer_date, bank_account, reason, our_bank_name, our_bank_number |
| **Query** | 6-table JOIN with payment_channel and bank_account |
| **Purpose** | Payments listing/filtering report |
| **Utility** | ALL |

### 2.5 `templates/payment/payments_unitNo.jrxml`
| Property | Value |
|----------|-------|
| **Name** | `payments` |
| **Page** | 2016×1027mm, Landscape |
| **Parameters** | Same as payments.jrxml |
| **Query** | Same structure with unit number included |
| **Purpose** | Payments listing grouped by unit number |
| **Utility** | ALL |

### 2.6 `templates/payment/sub_report_payments.jrxml`
| Property | Value |
|----------|-------|
| **Name** | `payments_sub_report` |
| **Page** | 1400×802mm |
| **Margins** | 0,0,0,0 |
| **Parameters** | `date_start`, `date_end`, `meter_id` |
| **Fields** | receipt_no, payment_timestamp, paid_total, type, status |
| **Query** | Payment by meter_id with date range |
| **Purpose** | Sub-report used inside other reports for per-meter payment history |
| **Utility** | ALL |

### 2.7 `template jxlmr/payment template/payment_receipt.jrxml`
| Property | Value |
|----------|-------|
| **Page** | 684×842mm |
| **Purpose** | Payment receipt (jxlmr copy) |
| **Utility** | ALL |

### 2.8 `template jxlmr/payment template/xx_payment_receipt.jrxml`
| Purpose | Payment receipt (jxlmr copy, backup) |
| **Utility** | ALL |

### 2.9 `template jxlmr/payment template/payment_receipt_mini.jrxml`
| Purpose | Mini receipt (jxlmr copy) |
| **Utility** | ALL |

### 2.10 `template jxlmr/payment template/payments.jrxml`
| Purpose | Payments listing (jxlmr copy) |
| **Utility** | ALL |

### 2.11 `template jxlmr/payment template/payments_unitNo.jrxml`
| Purpose | Payments by unit (jxlmr copy) |
| **Utility** | ALL |

### 2.12 `template jxlmr/payment template/sub_report_payments.jrxml`
| Purpose | Payments sub-report (jxlmr copy) |
| **Utility** | ALL |

---

## 3. TARIFF TEMPLATES

### 3.1 `templates/reports/tariffs/active_tariff.jrxml`
| Property | Value |
|----------|-------|
| **Name** | `active_tariff` |
| **Page** | 595×842mm, Portrait |
| **Margins** | 20,20,20,20 |
| **Parameters** | None |
| **Fields** | project_title, address, logo, id, start_date, service, mode, name, status, flat_rate |
| **Query** | `SELECT FROM tariff WHERE status = 'ACTIVE'` |
| **Purpose** | List all active tariffs |
| **Utility** | ALL |

### 3.2 `templates/reports/tariffs/sub_report_tariff_charge.jrxml`
| Property | Value |
|----------|-------|
| **Name** | `tariff_charge_details_sub_report` |
| **Page** | 595×842mm, Portrait |
| **Margins** | 0,0,0,0 |
| **Parameters** | `tariff_id` (String) |
| **Fields** | id, name_en, flat_amount, flat_rate, recurring_mode, charge_group, upper_limit |
| **Query** | `SELECT FROM tariff_charges WHERE tariff_id = ?` |
| **Purpose** | List charges for a specific tariff (sub-report) |
| **Utility** | ALL |

### 3.3 `templates/reports/tariffs/sub_report_tariff_charge_detail.jrxml`
| Property | Value |
|----------|-------|
| **Name** | `sub_report_tariff_charge_detail` |
| **Page** | 595×842mm, Portrait |
| **Margins** | 0,0,0,0 |
| **Parameters** | `charge_id` (String) |
| **Fields** | id, charge_id, from_usage, to_usage, rate_value, calculated_amount, extra_amount, created_by, created_date, last_modified_by, last_modified_date |
| **Query** | `SELECT FROM tariff_charges_details WHERE charge_id = ?` |
| **Purpose** | List tier details for a specific charge (sub-report) |
| **Utility** | ALL |

### 3.4-3.6 `template jxlmr/tariff template/active_tariff.jrxml`, `sub_report_tariff_charge.jrxml`, `sub_report_tariff_charge_detail.jrxml`
| Purpose | Tariff template copies from jxlmr |
| **Utility** | ALL |

---

## 4. CONSUMPTION/READING TEMPLATES

### 4.1 `templates/reports/consumption/monthly_consumption.jrxml`
| Property | Value |
|----------|-------|
| **Name** | `Monthly Invoices` |
| **Page** | 1407×842mm, Landscape |
| **Margins** | 20,20,20,20 |
| **Parameters** | `customer_id`, `customer_name`, `meter_serial`, `meter_type`, `unit_number`, `bill_cycle`, `village`, `project_id` |
| **Fields** | id, name_en, name_ar, phone, serial, meter_type, consumption_month, reading_date, start_value, current_value, unit_number, city, additional_info, consumption_amount |
| **Query** | 4-table JOIN (meter→customer→unit→monthly_reading) with reading detail subqueries |
| **Purpose** | Monthly consumption listing with readings per meter |
| **Utility** | ALL |

### 4.2 `templates/reports/consumption/monthly_consumption_unitNo.jrxml`
| Property | Value |
|----------|-------|
| **Name** | `Monthly consumption` |
| **Page** | Similar to monthly_consumption |
| **Purpose** | Monthly consumption by unit number |
| **Utility** | ALL |

### 4.3 `templates/reports/consumption/monthly_consumption_steps.jrxml`
| Property | Value |
|----------|-------|
| **Name** | `Payments` |
| **Page** | 842×595mm, Landscape |
| **Margins** | 20,20,20,20 |
| **Parameters** | `bill_cycle`, `meter_type` |
| **Fields** | offset, meter_type, from, to, rate, unit_type, count, cons_kwh, cons_egp |
| **Query** | Tariff tier analysis: consumption grouped by tier per meter type |
| **Purpose** | Consumption analysis by tariff tier/step |
| **Utility** | ALL |

### 4.4 `templates/reports/consumption/consumption_payments_details.jrxml`
| Property | Value |
|----------|-------|
| **Name** | `consumption_payments_details` |
| **Page** | 1440×595mm, Landscape |
| **Margins** | 20,20,20,20 |
| **Parameters** | `customer_id`, `date_start`, `date_end`, `unitNumber`, `meter_type`, `project_id` |
| **Fields** | customer_code, customer_id, meter_id, customer_name, name_ar, unit_no, meter_serial, meter_service, cons_kwh, not_invoice_amt |
| **Query** | Consumption + payment aggregation per meter |
| **Purpose** | Combined consumption and payment details |
| **Utility** | ALL |

### 4.5 `templates/reports/consumption/consumption_payments_details_additional.jrxml`
| Property | Value |
|----------|-------|
| **Same as** | consumption_payments_details with additional fields |
| **Utility** | ALL |

### 4.6 `templates/reports/readings/early_reading.jrxml`
| Property | Value |
|----------|-------|
| **Name** | `early_reading` |
| **Page** | Likely landscape |
| **Purpose** | Early/submitted-before-cycle readings report |
| **Utility** | ALL |

### 4.7 `templates/reports/readings/meter_incorrect_readings.jrxml`
| Property | Value |
|----------|-------|
| **Name** | `meter_incorrect_readings` |
| **Page** | 1190×595mm, Landscape |
| **Margins** | 20,20,20,20 |
| **Parameters** | `start_date` (default "2013-08-01"), `end_date` (default "2013-08-31"), `project_id` |
| **Fields** | customer_id, customer_name, name_ar, unit_no, address, meter_serial, current_reading_at_hes, reading_type, message, reading_date, meter_type |
| **Query** | Invalid readings from HES validation with customer/meter join |
| **Purpose** | Readings that failed HES validation |
| **Utility** | ALL |

### 4.8 `templates/reports/readings/meter_incorrect_readings_additional.jrxml`
| Property | Value |
|----------|-------|
| **Same as** | meter_incorrect_readings with additional properties |
| **Utility** | ALL |

### 4.9 `templates/reports/readings/settlements.jrxml`
| Property | Value |
|----------|-------|
| **Name** | `settlements` |
| **Page** | 1209×842mm, Landscape |
| **Margins** | 20,20,20,20 |
| **Parameters** | `start_date`, `end_date`, `meter_type`, `meter_serial`, `project_id` |
| **Fields** | logo, type, serial, name_ar, name_en, name, total_amount, per_month_amount, number_of_months, paid_amount, unit_no, remaining_amount |
| **Query** | Meter→Customer→Meter_Settlements→Settlement_Type→Unit |
| **Purpose** | Settlement/installment plan report |
| **Utility** | ALL |

### 4.10 `templates/reports/readings/xx_missing_readings.jrxml`
| Property | Value |
|----------|-------|
| **Name** | `missing_readings` |
| **Purpose** | Meters with missing readings (backup) |
| **Utility** | ALL |

### 4.11 `template jxlmr/Reading template/early_reading.jrxml`
| Purpose | Early reading report (jxlmr copy) |
| **Utility** | ALL |

### 4.12 `template jxlmr/Reading template/meter_incorrect_readings.jrxml`
| Purpose | Incorrect readings (jxlmr copy) |
| **Utility** | ALL |

### 4.13 `template jxlmr/Reading template/meter_incorrect_readings_additional.jrxml`
| Purpose | Incorrect readings additional (jxlmr copy) |
| **Utility** | ALL |

### 4.14 `template jxlmr/Reading template/settlements.jrxml`
| Purpose | Settlements (jxlmr copy) |
| **Utility** | ALL |

### 4.15 `template jxlmr/Reading template/xx_missing_readings.jrxml`
| Purpose | Missing readings (jxlmr copy) |
| **Utility** | ALL |

### 4.16 `template jxlmr/consumption template/monthly_consumption.jrxml`
| Purpose | Monthly consumption (jxlmr copy) |
| **Utility** | ALL |

### 4.17 `template jxlmr/consumption template/monthly_consumption_unitNo.jrxml`
| Purpose | Monthly consumption by unit (jxlmr copy) |
| **Utility** | ALL |

### 4.18 `template jxlmr/consumption template/monthly_consumption_steps.jrxml`
| Purpose | Consumption by tier (jxlmr copy) |
| **Utility** | ALL |

### 4.19 `template jxlmr/consumption template/consumption_payments_details.jrxml`
| Purpose | Consumption + payments (jxlmr copy) |
| **Utility** | ALL |

### 4.20 `template jxlmr/consumption template/consumption_payments_details_additional.jrxml`
| Purpose | Consumption + payments additional (jxlmr copy) |
| **Utility** | ALL |

---

## 5. CUSTOMER TEMPLATES

### 5.1 `templates/reports/customers/customers_details.jrxml`
| Property | Value |
|----------|-------|
| **Name** | `Customer_Details` |
| **Page** | 1190×595mm, Landscape |
| **Margins** | 20,20,20,20 |
| **Parameters** | `customer_id` (String), `customer_name` (String), `project_id` (Integer) |
| **Fields** | project_title, address, logo, customer_code, customer_name, customer_name_ar, primary_phone, activation_date, contract_date, secondary_phone, meter_serial, unit_number, meter_status, service_name, unit.additional_info |
| **Query** | Meter→Customer→Unit, filtered by customer/project |
| **Purpose** | Customer details listing with meters and units |
| **Utility** | ALL |

### 5.2 `templates/reports/customers/customers_details_unitNo.jrxml`
| Property | Value |
|----------|-------|
| **Same as** | customers_details with additional unit number filter |
| **Purpose** | Customer details by unit number |
| **Utility** | ALL |

### 5.3 `templates/reports/customers/customer_current_balance.jrxml`
| Property | Value |
|----------|-------|
| **Name** | `customer_current_balance` |
| **Page** | 1500×595mm, Landscape |
| **Margins** | 20,20,20,20 |
| **Parameters** | `meter_serial`, `meter_type`, `unit_number`, `reading_since` (Integer), `village`, `project_id` |
| **Fields** | project_title, address, logo, customer_id, customer_name, customer_name_ar, primary_Phone, secondary_phone, customer_type, unit_no, additional_info, initial_balance, meter_serial, relay_status, current_balance (calculated), last_reading_date, service_name |
| **Query** | Meter→Customer→Unit with balance subqueries (open invoices, not-invoiced readings) |
| **Purpose** | Current balance for each metered customer |
| **Utility** | ALL |

### 5.4 `templates/reports/customers/customer_current_balance_unitNo.jrxml`
| Property | Value |
|----------|-------|
| **Same as** | customer_current_balance with unit number |
| **Purpose** | Customer balance by unit number |
| **Utility** | ALL |

### 5.5 `templates/reports/customers/customer_aggregated_meter.jrxml`
| Property | Value |
|----------|-------|
| **Name** | `customer_aggregated_meter` |
| **Purpose** | Customer with all meters aggregated |
| **Utility** | ALL |

### 5.6 `templates/reports/customers/customer_aggregated_meter_unitNo.jrxml`
| Property | Value |
|----------|-------|
| **Purpose** | Aggregated meters by unit number |
| **Utility** | ALL |

### 5.7 `templates/reports/customers/customer_claims.jrxml`
| Purpose | Customer claims/complaints report |
| **Utility** | ALL |

### 5.8 `templates/reports/customers/customer_claims_additional.jrxml`
| Purpose | Customer claims (additional) |
| **Utility** | ALL |

### 5.9 `templates/reports/customers/customer_claims_emaar.jrxml`
| Purpose | Customer claims for Emaar project |
| **Utility** | ALL |

### 5.10 `templates/reports/customers/xx_claims.jrxml`
| Purpose | Customer claims (backup) |
| **Utility** | ALL |

### 5.11-5.20 `template jxlmr/Customer template/*.jrxml`
| Purpose | All customer template jxlmr copies |
| **Utility** | ALL |

---

## 6. METER TEMPLATES

### 6.1 `templates/reports/meters/meters_details.jrxml`
| Property | Value |
|----------|-------|
| **Name** | `Meters_Details` |
| **Page** | 1190×595mm, Landscape |
| **Margins** | 20,20,20,20 |
| **Parameters** | `startDate`, `endDate`, `unitNumber`, `meterType` |
| **Fields** | id, name_ar, name_en, status, customer_type, relay, tariff, serial, meter_type, activation_date, unit_no, additional_info, address_en, city, last_reading_date, balance, not_invoiced, open_invoices |
| **Query** | Customer→Meter→Unit→Tariff with balance subqueries |
| **Purpose** | Comprehensive meter details with balance |
| **Utility** | ALL |

### 6.2 `templates/reports/meters/meters_status.jrxml`
| Property | Value |
|----------|-------|
| **Name** | `Meters_Details` |
| **Page** | 1080×595mm, Landscape |
| **Margins** | 20,20,20,20 |
| **Parameters** | `meterType` |
| **Fields** | id, name_en, serial, additional_info, balance, not_invoiced, open_invoices, reading_date, start_value, current_value, consumption_amount, notifications_count, relay_status |
| **Query** | 7-table JOIN with monthly_reading, monthly_reading_detail, tariff_charges, reading_type |
| **Purpose** | Meters with alert/warning status and recent readings |
| **Utility** | ALL |

### 6.3 `templates/reports/meters/meters_replaced.jrxml`
| Property | Value |
|----------|-------|
| **Name** | `meter_replaced` |
| **Page** | 1190×595mm, Landscape |
| **Margins** | 20,20,20,20 |
| **Parameters** | `project_id`, `customer_name`, `customer_id` |
| **Fields** | client_name, contact_number, email_address, account_number, status, tarrif, region, unit_no, district, meter_number, date_replaced, logo, available_credit, sumActive |
| **Query** | Replaced meters with balance and consumption detail |
| **Purpose** | Meter replacement history report |
| **Utility** | ALL |

### 6.4 `templates/reports/meters/meters_replaced_additional.jrxml`
| Property | Value |
|----------|-------|
| **Same as** | meters_replaced with additional fields |
| **Utility** | ALL |

### 6.5 `templates/reports/meters/unallocated_meters.jrxml`
| Property | Value |
|----------|-------|
| **Name** | `unallocated_meters` |
| **Page** | 720×595mm, Landscape |
| **Margins** | 20,20,20,20 |
| **Parameters** | `meter_serial`, `meter_type` |
| **Fields** | project_title, address, logo, meter_serial, meter_name, meter_status, meter_model, meter_type |
| **Query** | Meters with status = 'NEW' (unallocated) |
| **Purpose** | Meters in inventory not yet assigned |
| **Utility** | ALL |

### 6.6 `templates/reports/meters/disconnected_meters.jrxml`
| Property | Value |
|----------|-------|
| **Name** | `disconnected_meters` |
| **Page** | 1190×595mm, Landscape |
| **Margins** | 20,20,20,20 |
| **Parameters** | `project_id`, `customer_name`, `customer_id` |
| **Query** | Disconnected meters with customer details |
| **Purpose** | Meters that have been disconnected |
| **Utility** | ALL |

### 6.7 `templates/reports/meters/disconnected_meters_additional.jrxml`
| Property | Value |
|----------|-------|
| **Same as** | disconnected_meters with additional fields |
| **Utility** | ALL |

### 6.8 `templates/reports/meters/net_metering.jrxml`
| Property | Value |
|----------|-------|
| **Name** | `net_metering` |
| **Page** | 1190×595mm, Landscape |
| **Parameters** | `project_id`, `customer_id`, `customer_name`, `start_date`, `end_date`, `threshold_type` |
| **Query** | Solar net metering analysis |
| **Purpose** | Net metering (solar) report |
| **Utility** | SOLAR |

### 6.9 `templates/reports/meters/net_metering_additional.jrxml`
| Property | Value |
|----------|-------|
| **Same as** | net_metering with additional |
| **Utility** | SOLAR |

### 6.10-6.18 `template jxlmr/meter template/*.jrxml`
| Purpose | All meter template jxlmr copies |
| **Utility** | ALL |

---

## 7. FINANCIAL TEMPLATES

### 7.1 `templates/reports/financial/monthly_invoices.jrxml`
| Property | Value |
|----------|-------|
| **Name** | `Monthly Invoices` |
| **Page** | 1334×842mm, Landscape |
| **Margins** | 20,20,20,20 |
| **Parameters** | `SUBREPORT_DIR` (String), `customer_id`, `customer_name`, `meter_serial`, `meter_type`, `unit_number`, `bill_cycle`, `project_id` |
| **Fields** | INVOICE_ID, INVOICE_NUMBER, CUSTOMER_NAME, name_ar, P_PHONE, S_PHONE, TOTAL_AMOUNT, CONSUMPTION, METER_SERIAL, unit_no, additional_info, city, BC_DATE, BALANCE (calculated), PREVIOUS_R, CURRENT_R, METER_TYPE |
| **Query** | 4-table JOIN with balance subqueries |
| **Purpose** | Monthly invoice listing with balance |
| **Utility** | ALL |

### 7.2 `templates/reports/financial/monthly_invoices_sub1.jrxml`
| Property | Value |
|----------|-------|
| **Purpose** | Sub-report for monthly invoices |
| **Utility** | ALL |

### 7.3 `templates/reports/financial/monthly_invoices_unitNo.jrxml`
| Property | Value |
|----------|-------|
| **Purpose** | Monthly invoices by unit number |
| **Utility** | ALL |

### 7.4 `templates/reports/financial/monthly_finance.jrxml`
| Property | Value |
|----------|-------|
| **Name** | `Monthly Finance` |
| **Page** | 1190×595mm, Landscape |
| **Margins** | 20,20,20,20 |
| **Parameters** | `meter_serial`, `meter_type`, `bill_cycle`, `unit_number`, `village`, `project_id` |
| **Fields** | project_title, address, logo, invoice_no, customer_id, id, customer_name, name_ar, unit_no, meter_type, total_consuption, meter_serial, counsumption_month, open_amt, total_amt, "Rosom_esdar", "ROSOM", "Dam3'at", customer_service |
| **Query** | Detailed financial with named charge breakdown |
| **Purpose** | Monthly financial report with charge types |
| **Utility** | ALL |

### 7.5 `templates/reports/financial/monthly_finance_additional.jrxml`
| Property | Value |
|----------|-------|
| **Purpose** | Monthly finance with additional fields |
| **Utility** | ALL |

### 7.6 `templates/reports/financial/financial_audit.jrxml`
| Property | Value |
|----------|-------|
| **Name** | `financial_audit` |
| **Page** | 1190×595mm, Landscape |
| **Margins** | 20,20,20,20 |
| **Parameters** | `meter_serial`, `meter_type`, `unit_number`, `village`, `start_date`, `end_date`, `project_id` |
| **Fields** | project_title, address, logo, name_en, name_ar, serial, type, unit_no, city, action, action_date, amount, number, status |
| **Query** | UNION of invoices (+), payments (-), adjustments for audit trail |
| **Purpose** | Financial audit trail (invoices + payments per meter) |
| **Utility** | ALL |

### 7.7 `templates/reports/financial/financial_audit_additional.jrxml`
| Property | Value |
|----------|-------|
| **Purpose** | Financial audit with additional fields |
| **Utility** | ALL |

### 7.8 `templates/reports/financial/sub_report_invoices.jrxml`
| Property | Value |
|----------|-------|
| **Name** | `sub_report_invoices` |
| **Purpose** | Sub-report for invoice details |
| **Utility** | ALL |

### 7.9-7.16 `template jxlmr/report finance template/*.jrxml`
| Purpose | All finance template jxlmr copies |
| **Utility** | ALL |

---

## 8. USER/SYSTEM TEMPLATES

### 8.1 `templates/reports/users/user_list.jrxml`
| Property | Value |
|----------|-------|
| **Name** | `user_list` |
| **Page** | 1190×595mm, Landscape |
| **Margins** | 20,20,20,20 |
| **Parameters** | `project_id` (Integer) |
| **Fields** | username, email, created_date, role, status, logo |
| **Query** | JOIN adm_user → adm_user_authority → adm_user_project → adm_project |
| **Purpose** | System user list |
| **Utility** | ADMIN |

### 8.2 `templates/reports/users/user_audit_log.jrxml`
| Property | Value |
|----------|-------|
| **Name** | `Alerts_Queue` |
| **Page** | 1190×842mm, Landscape |
| **Margins** | 20,20,20,20 |
| **Parameters** | `SUBREPORT_DIR`, `start_date` (default "2013-08-01"), `end_date` (default "2013-08-31") |
| **Fields** | created_by, created_date, scope, action |
| **Query** | UNION of billcycle_logs + payment + invoice adjustments |
| **Purpose** | User audit trail of all system actions |
| **Utility** | ADMIN |

### 8.3 `templates/reports/users/prepaid_statement.jrxml`
| Property | Value |
|----------|-------|
| **Name** | `Prepaid Statement` |
| **Language** | groovy |
| **Page** | 1190×595mm, Landscape |
| **Parameters** | customer_code, customer_code_where, organization_ids, organization_ids_where, date_start, date_end, database_type, date_where |
| **Purpose** | Prepaid customer statement |
| **Utility** | PREPAID |

### 8.4 `template jxlmr/user report/user_list.jrxml`
| Purpose | User list (jxlmr copy) |
| **Utility** | ADMIN |

### 8.5 `template jxlmr/user report/user_audit_log.jrxml`
| Purpose | User audit log (jxlmr copy) |
| **Utility** | ADMIN |

### 8.6 `template jxlmr/xx_prepaid_stmt.jrxml`
| Purpose | Prepaid statement (jxlmr copy) |
| **Utility** | PREPAID |

---

## 9. ALERTS TEMPLATES

### 9.1 `templates/reports/alerts/alerts_queue.jrxml`
| Property | Value |
|----------|-------|
| **Name** | `alerts_queue` |
| **Page** | 1190×842mm, Landscape |
| **Margins** | 20,20,20,20 |
| **Parameters** | `start_date`, `end_date`, `project_id` |
| **Fields** | id, created_date, text, email, mobile_number, mode, customer_id, meter_id, serial, name_ar, name_en |
| **Query** | notifications_queue → meter → customer, is_sent = 0 |
| **Purpose** | Unsent notification/alert queue |
| **Utility** | ALL |

### 9.2 `templates/reports/alerts/alerts_sent.jrxml`
| Property | Value |
|----------|-------|
| **Purpose** | Sent alerts history |
| **Utility** | ALL |

### 9.3 `templates/reports/alerts/alerts_sent_additional.jrxml`
| Property | Value |
|----------|-------|
| **Purpose** | Sent alerts with additional fields |
| **Utility** | ALL |

### 9.4-9.6 `template jxlmr/alerts template/*.jrxml`
| Purpose | Alerts template jxlmr copies |
| **Utility** | ALL |

---

## 10. SUMMARY TOTALS

### Reference SBill Invoices (already read separately)
| File | Purpose |
|------|---------|
| `reference/sbill/.../invoice_elec.jrxml` (574 lines) | Electricity invoice (SBill reference) |
| `reference/sbill/.../invoice_water.jrxml` (773 lines) | Water invoice (SBill reference) |

### Total JRXML Catalog

| Category | Templates (Meter/templates) | Templates (template jxlmr) | Total |
|----------|---------------------------|---------------------------|-------|
| Invoice | 6 | 12 | 18 |
| Payment | 6 | 6 | 12 |
| Tariff | 3 | 3 | 6 |
| Consumption/Reading | 10 | 10 | 20 |
| Customer | 10 | 10 | 20 |
| Meter | 9 | 9 | 18 |
| Financial | 7 | 7 | 14 |
| User/System | 3 | 3 | 6 |
| Alerts | 3 | 3 | 6 |
| **Grand Total** | **57** | **63** | **120** |

*(Note: 120 includes 3 reference SBill files, 117 in templates + template jxlmr directories)*
