# D1 — Document Master Catalog

**Date:** 2026-06-19
**Method:** Full scan of `reference/sbill/`, `reference/collection-system/`, `reports/`

---

## 1. JRXML Templates (Source of Truth — 44 templates)

### Invoice Templates

| # | File | Path | Utility | Status in Meter Verse |
|---|------|------|---------|----------------------|
| 1 | invoice_elec.jrxml | OctoberBilling-Complete/04_reports/ | Electricity | 🟡 85% parity |
| 2 | invoice_elec.jrxml.bak | OctoberBilling-Complete/04_reports/ | Electricity | 🔴 Backup not analyzed |
| 3 | invoice_water.jrxml | OctoberBilling-Complete/04_reports/ | Water | 🟡 85% parity |
| 4 | invoice_water.jrxml.bak | OctoberBilling-Complete/04_reports/ | Water | 🔴 Backup not analyzed |
| 5 | invoice_water_new.jrxml | OctoberBilling-Complete/04_reports/ | Water (revised) | 🔴 Not ported |
| 6 | invoice_water_new_Palm.jrxml | OctoberBilling-Complete/04_reports/ | Water (PalmHills) | 🔴 Not ported |
| 7 | xx_invoice_elec.jrxml | OctoberBilling-Complete/04_reports/ | Elec (draft) | 🔴 Not ported |
| 8 | xx_invoice_water.jrxml | OctoberBilling-Complete/04_reports/ | Water (draft) | 🔴 Not ported |
| 9 | invoices.jrxml | OctoberBilling-Complete/04_reports/ | Invoice listing | 🔴 Not ported |
| 10 | sub_report_invoices.jrxml | OctoberBilling-Complete/04_reports/ | Invoice sub-report | 🔴 Not ported |

### Financial Reports

| # | File | Path | Purpose | Status |
|---|------|------|---------|--------|
| 11 | monthly_finance.jrxml | OctoberBilling-Complete/04_reports/ | Monthly financial summary | 🔴 Not ported |
| 12 | monthly_finance_bak.jrxml | OctoberBilling-Complete/04_reports/ | Monthly finance backup | 🔴 Not ported |
| 13 | financial_audit.jrxml | OctoberBilling-Complete/04_reports/ | Financial audit trail | 🔴 Not ported |

### Payment & Receipt

| # | File | Path | Purpose | Status |
|---|------|------|---------|--------|
| 14 | payment_receipt.jrxml | OctoberBilling-Complete/04_reports/ | Full payment receipt | 🟢 Ported (Master Invoice) |
| 15 | payment_receipt_mini.jrxml | OctoberBilling-Complete/04_reports/ | Mini receipt | 🔴 Not ported |
| 16 | payments.jrxml | OctoberBilling-Complete/04_reports/ | Payment history | 🔴 Not ported |
| 17 | sub_report_payments.jrxml | OctoberBilling-Complete/04_reports/ | Payment sub-report | 🔴 Not ported |
| 18 | xx_payment_receipt.jrxml | OctoberBilling-Complete/04_reports/ | Receipt draft | 🔴 Not ported |

### Customer Reports

| # | File | Path | Purpose | Status |
|---|------|------|---------|--------|
| 19 | customers_details.jrxml | OctoberBilling-Complete/04_reports/ | Customer details | 🔴 Not ported |
| 20 | customer_aggregated_meter.jrxml | OctoberBilling-Complete/04_reports/ | Customer meter summary | 🔴 Not ported |
| 21 | customer_current_balance.jrxml | OctoberBilling-Complete/04_reports/ | Current balance | 🔴 Not ported |
| 22 | customer_claims.jrxml | OctoberBilling-Complete/04_reports/ | Customer claims | 🔴 Not ported |
| 23 | customer_claims_emaar.jrxml | OctoberBilling-Complete/04_reports/ | Emaar claims | 🔴 Not ported |

### Meter Reports

| # | File | Path | Purpose | Status |
|---|------|------|---------|--------|
| 24 | meters_details.jrxml | OctoberBilling-Complete/04_reports/ | Meter details | 🔴 Not ported |
| 25 | meters_status.jrxml | OctoberBilling-Complete/04_reports/ | Meter status | 🔴 Not ported |
| 26 | meter_incorrect_readings.jrxml | OctoberBilling-Complete/04_reports/ | Incorrect readings | 🔴 Not ported |
| 27 | disconnected_meters.jrxml | OctoberBilling-Complete/04_reports/ | Disconnected meters | 🔴 Not ported |
| 28 | unallocated_meters.jrxml | OctoberBilling-Complete/04_reports/ | Unallocated meters | 🔴 Not ported |

### Consumption Reports

| # | File | Path | Purpose | Status |
|---|------|------|---------|--------|
| 29 | monthly_consumption.jrxml | OctoberBilling-Complete/04_reports/ | Monthly consumption | 🔴 Not ported |
| 30 | monthly_consumption_steps.jrxml | OctoberBilling-Complete/04_reports/ | Consumption steps | 🔴 Not ported |
| 31 | consumption_payments_details.jrxml | OctoberBilling-Complete/04_reports/ | Consumption + payments | 🔴 Not ported |

### Invoice Reports

| # | File | Path | Purpose | Status |
|---|------|------|---------|--------|
| 32 | monthly_invoices.jrxml | OctoberBilling-Complete/04_reports/ | Monthly invoices | 🔴 Not ported |
| 33 | monthly_invoices_sub1.jrxml | OctoberBilling-Complete/04_reports/ | Invoice sub-report | 🔴 Not ported |
| 34 | canceled_invoices.jrxml | OctoberBilling-Complete/04_reports/ | Canceled invoices | 🔴 Not ported |

### Tariff & Alerts

| # | File | Path | Purpose | Status |
|---|------|------|---------|--------|
| 35 | active_tariff.jrxml | OctoberBilling-Complete/04_reports/ | Active tariff report | 🔴 Not ported |
| 36 | sub_report_tariff_charge.jrxml | OctoberBilling-Complete/04_reports/ | Tariff charge sub-report | 🔴 Not ported |
| 37 | sub_report_tariff_charge_detail.jrxml | OctoberBilling-Complete/04_reports/ | Tariff detail sub-report | 🔴 Not ported |
| 38 | alerts_queue.jrxml | OctoberBilling-Complete/04_reports/ | Alerts queue | 🔴 Not ported |
| 39 | alerts_sent.jrxml | OctoberBilling-Complete/04_reports/ | Alerts sent | 🔴 Not ported |

### Audit & Misc

| # | File | Path | Purpose | Status |
|---|------|------|---------|--------|
| 40 | user_audit_log.jrxml | OctoberBilling-Complete/04_reports/ | User audit log | 🔴 Not ported |
| 41 | user_audit_log_subreport.jrxml | OctoberBilling-Complete/04_reports/ | Audit sub-report | 🔴 Not ported |
| 42 | user_audit_log_subreport1.jrxml | OctoberBilling-Complete/04_reports/ | Audit sub-report 2 | 🔴 Not ported |
| 43 | xx_claims.jrxml | OctoberBilling-Complete/04_reports/ | Claims draft | 🔴 Not ported |
| 44 | xx_prepaid_stmt.jrxml | OctoberBilling-Complete/04_reports/ | Prepaid statement draft | 🔴 Not ported |

---

## 2. Production PDF Samples

| File | Path | Size | Purpose |
|------|------|------|---------|
| settelment invoice.pdf | sbill/New folder/.../04_reports/ | 332 KB | Settlement invoice reference |
| chilled water type 1 invoice.pdf | sbill/New folder/.../04_reports/ | 255 KB | Chilled water Type 1 reference |
| chilled water type 2 invoice.pdf | sbill/New folder/.../04_reports/ | 231 KB | Chilled water Type 2 reference |

---

## 3. Excel Import Templates

| File | Path | Purpose |
|------|------|---------|
| invoice_calculation_2020.xlsx | reference/sbill/.../05_templates/ | Invoice calculation reference |
| meter_settlements_template.xlsx | reference/sbill/.../05_templates/ | Settlement import |
| readings_template.xlsx | reference/sbill/.../05_templates/ | Reading import |
| payments_template.xlsx | reference/sbill/.../05_templates/ | Payment import |
| customers_template.xlsx | reference/sbill/.../05_templates/ | Customer import |
| meters_template.xlsx | reference/sbill/.../05_templates/ | Meter import |
| migration_template.xlsx | reference/sbill/.../05_templates/ | Migration import |
| delete_readings_template.xlsx | reference/sbill/.../05_templates/ | Delete readings |
| Solar_Invoices_Template.xlsx | reference/collection-system/ | Solar invoices import |
| Solar_Invoices_Import.xlsx | reference/collection-system/ | Solar invoices data |
| Solar_Payments_Template.xlsx | reference/collection-system/ | Solar payments import |

---

## 4. Meter Verse Parity Status

| Report Category | Total JRXML | Ported to MV | % Done |
|----------------|-------------|-------------|--------|
| Invoice templates | 10 | 2 (elec + water via Master Framework) | 20% |
| Financial reports | 3 | 0 | 0% |
| Payment/Receipt | 5 | 1 | 20% |
| Customer reports | 5 | 0 | 0% |
| Meter reports | 5 | 0 | 0% |
| Consumption reports | 3 | 0 | 0% |
| Invoice reports | 3 | 0 | 0% |
| Tariff/Alerts | 5 | 0 | 0% |
| Audit/Misc | 5 | 0 | 0% |
| **Total** | **44** | **3** | **~7%** |

---

## Conclusion

**DOCUMENT_PARITY = ~7%** (only 3 of 44 JRXML templates ported)

The Master Invoice Framework handles basic invoice generation for all 7 utility types, but the visual appearance, charge group layout, and report-specific formatting from the JRXML files have NOT been ported.

**Full parity requires:** 44 templates × ~4h each = ~176h of work.
