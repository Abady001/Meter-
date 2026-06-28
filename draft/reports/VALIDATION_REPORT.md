# Reporting Engine Migration — Validation Report

**Version:** 2.0.0
**Date:** 2026-06-27
**Status:** In Progress
**QA Lead:** TBD

---

## Table of Contents

1. [JRXML Compilation Validation](#1-jrxml-compilation-validation)
2. [PDF Generation Validation](#2-pdf-generation-validation)
3. [Excel Generation Validation](#3-excel-generation-validation)
4. [Playwright Visual Tests](#4-playwright-visual-tests)
5. [Integration Tests](#5-integration-tests)
6. [Regression Tests](#6-regression-tests)
7. [Arabic RTL Rendering Validation](#7-arabic-rtl-rendering-validation)
8. [A4 Landscape/Portfolio Validation](#8-a4-landscapeportfolio-validation)
9. [Performance Benchmarks](#9-performance-benchmarks)
10. [Template Versioning Validation](#10-template-versioning-validation)
11. [PDF Security Feature Validation](#11-pdf-security-feature-validation)
12. [Bulk Generation Validation](#12-bulk-generation-validation)
13. [Pre-Migration Signoff Checklist](#13-pre-migration-signoff-checklist)

---

## 1. JRXML Compilation Validation

### 1.1 Electricity Invoice

| Template | File | Compiles | Errors | Warnings | Status |
|----------|------|----------|--------|----------|--------|
| Electricity Invoice | `ElectricityInvoice.jrxml` | ☐ | — | — | PENDING |

### 1.2 Legacy Invoice Templates (6)

| # | Template | File | Compiles | Errors | Warnings | Status |
|---|----------|------|----------|--------|----------|--------|
| 1 | Electricity Invoice (Sbill) | `templates/invoice/electricity/invoice_elec.jrxml` | ☐ | — | — | PENDING |
| 2 | Electricity Invoice (Zim) | `templates/invoice/electricity/invoice_elec_zim.jrxml` | ☐ | — | — | PENDING |
| 3 | Old Electricity Invoice | `templates/invoice/electricity/xx_invoice_elec.jrxml` | ☐ | — | — | PENDING |
| 4 | Water Invoice | `templates/invoice/water/invoice_water.jrxml` | ☐ | — | — | PENDING |
| 5 | Water Invoice (New) | `templates/invoice/water/invoice_water_new.jrxml` | ☐ | — | — | PENDING |
| 6 | Old Water Invoice | `templates/invoice/water/xx_invoice_water.jrxml` | ☐ | — | — | PENDING |

### 1.3 Payment Templates (6)

| # | Template | File | Compiles | Errors | Warnings | Status |
|---|----------|------|----------|--------|----------|--------|
| 7 | Payments | `templates/payment/payments.jrxml` | ☐ | — | — | PENDING |
| 8 | Payments (Unit No) | `templates/payment/payments_unitNo.jrxml` | ☐ | — | — | PENDING |
| 9 | Payment Receipt | `templates/payment/payment_receipt.jrxml` | ☐ | — | — | PENDING |
| 10 | Payment Receipt Mini | `templates/payment/payment_receipt_mini.jrxml` | ☐ | — | — | PENDING |
| 11 | Sub-report Payments | `templates/payment/sub_report_payments.jrxml` | ☐ | — | — | PENDING |
| 12 | Old Payment Receipt | `templates/payment/xx_payment_receipt.jrxml` | ☐ | — | — | PENDING |

### 1.4 Alert Templates (3)

| # | Template | File | Compiles | Errors | Warnings | Status |
|---|----------|------|----------|--------|----------|--------|
| 13 | Alerts Queue | `templates/reports/alerts/alerts_queue.jrxml` | ☐ | — | — | PENDING |
| 14 | Alerts Sent | `templates/reports/alerts/alerts_sent.jrxml` | ☐ | — | — | PENDING |
| 15 | Alerts Sent (Additional) | `templates/reports/alerts/alerts_sent_additional.jrxml` | ☐ | — | — | PENDING |

### 1.5 Consumption Templates (5)

| # | Template | File | Compiles | Errors | Warnings | Status |
|---|----------|------|----------|--------|----------|--------|
| 16 | Consumption Payments Details | `templates/reports/consumption/consumption_payments_details.jrxml` | ☐ | — | — | PENDING |
| 17 | Consumption Payments Details (Additional) | `templates/reports/consumption/consumption_payments_details_additional.jrxml` | ☐ | — | — | PENDING |
| 18 | Monthly Consumption | `templates/reports/consumption/monthly_consumption.jrxml` | ☐ | — | — | PENDING |
| 19 | Monthly Consumption Steps | `templates/reports/consumption/monthly_consumption_steps.jrxml` | ☐ | — | — | PENDING |
| 20 | Monthly Consumption (Unit No) | `templates/reports/consumption/monthly_consumption_unitNo.jrxml` | ☐ | — | — | PENDING |

### 1.6 Customer Templates (9)

| # | Template | File | Compiles | Errors | Warnings | Status |
|---|----------|------|----------|--------|----------|--------|
| 21 | Customers Details | `templates/reports/customers/customers_details.jrxml` | ☐ | — | — | PENDING |
| 22 | Customers Details (Unit No) | `templates/reports/customers/customers_details_unitNo.jrxml` | ☐ | — | — | PENDING |
| 23 | Customer Aggregated Meter | `templates/reports/customers/customer_aggregated_meter.jrxml` | ☐ | — | — | PENDING |
| 24 | Customer Aggregated Meter (Unit No) | `templates/reports/customers/customer_aggregated_meter_unitNo.jrxml` | ☐ | — | — | PENDING |
| 25 | Customer Claims | `templates/reports/customers/customer_claims.jrxml` | ☐ | — | — | PENDING |
| 26 | Customer Claims (Additional) | `templates/reports/customers/customer_claims_additional.jrxml` | ☐ | — | — | PENDING |
| 27 | Customer Claims (Emaar) | `templates/reports/customers/customer_claims_emaar.jrxml` | ☐ | — | — | PENDING |
| 28 | Customer Current Balance | `templates/reports/customers/customer_current_balance.jrxml` | ☐ | — | — | PENDING |
| 29 | Customer Current Balance (Unit No) | `templates/reports/customers/customer_current_balance_unitNo.jrxml` | ☐ | — | — | PENDING |
| 30 | Old Claims | `templates/reports/customers/xx_claims.jrxml` | ☐ | — | — | PENDING |

### 1.7 Financial Templates (8)

| # | Template | File | Compiles | Errors | Warnings | Status |
|---|----------|------|----------|--------|----------|--------|
| 31 | Financial Audit | `templates/reports/financial/financial_audit.jrxml` | ☐ | — | — | PENDING |
| 32 | Financial Audit (Additional) | `templates/reports/financial/financial_audit_additional.jrxml` | ☐ | — | — | PENDING |
| 33 | Monthly Finance | `templates/reports/financial/monthly_finance.jrxml` | ☐ | — | — | PENDING |
| 34 | Monthly Finance (Additional) | `templates/reports/financial/monthly_finance_additional.jrxml` | ☐ | — | — | PENDING |
| 35 | Monthly Invoices | `templates/reports/financial/monthly_invoices.jrxml` | ☐ | — | — | PENDING |
| 36 | Monthly Invoices (Sub1) | `templates/reports/financial/monthly_invoices_sub1.jrxml` | ☐ | — | — | PENDING |
| 37 | Monthly Invoices (Unit No) | `templates/reports/financial/monthly_invoices_unitNo.jrxml` | ☐ | — | — | PENDING |
| 38 | Sub-report Invoices | `templates/reports/financial/sub_report_invoices.jrxml` | ☐ | — | — | PENDING |

### 1.8 Meter Templates (8)

| # | Template | File | Compiles | Errors | Warnings | Status |
|---|----------|------|----------|--------|----------|--------|
| 39 | Disconnected Meters | `templates/reports/meters/disconnected_meters.jrxml` | ☐ | — | — | PENDING |
| 40 | Disconnected Meters (Additional) | `templates/reports/meters/disconnected_meters_additional.jrxml` | ☐ | — | — | PENDING |
| 41 | Meters Details | `templates/reports/meters/meters_details.jrxml` | ☐ | — | — | PENDING |
| 42 | Meters Replaced | `templates/reports/meters/meters_replaced.jrxml` | ☐ | — | — | PENDING |
| 43 | Meters Replaced (Additional) | `templates/reports/meters/meters_replaced_additional.jrxml` | ☐ | — | — | PENDING |
| 44 | Meters Status | `templates/reports/meters/meters_status.jrxml` | ☐ | — | — | PENDING |
| 45 | Net Metering | `templates/reports/meters/net_metering.jrxml` | ☐ | — | — | PENDING |
| 46 | Net Metering (Additional) | `templates/reports/meters/net_metering_additional.jrxml` | ☐ | — | — | PENDING |
| 47 | Unallocated Meters | `templates/reports/meters/unallocated_meters.jrxml` | ☐ | — | — | PENDING |

### 1.9 Reading Templates (5)

| # | Template | File | Compiles | Errors | Warnings | Status |
|---|----------|------|----------|--------|----------|--------|
| 48 | Early Reading | `templates/reports/readings/early_reading.jrxml` | ☐ | — | — | PENDING |
| 49 | Meter Incorrect Readings | `templates/reports/readings/meter_incorrect_readings.jrxml` | ☐ | — | — | PENDING |
| 50 | Meter Incorrect Readings (Additional) | `templates/reports/readings/meter_incorrect_readings_additional.jrxml` | ☐ | — | — | PENDING |
| 51 | Settlements | `templates/reports/readings/settlements.jrxml` | ☐ | — | — | PENDING |
| 52 | Old Missing Readings | `templates/reports/readings/xx_missing_readings.jrxml` | ☐ | — | — | PENDING |

### 1.10 Tariff Templates (3)

| # | Template | File | Compiles | Errors | Warnings | Status |
|---|----------|------|----------|--------|----------|--------|
| 53 | Active Tariff | `templates/reports/tariffs/active_tariff.jrxml` | ☐ | — | — | PENDING |
| 54 | Sub-report Tariff Charge | `templates/reports/tariffs/sub_report_tariff_charge.jrxml` | ☐ | — | — | PENDING |
| 55 | Sub-report Tariff Charge Detail | `templates/reports/tariffs/sub_report_tariff_charge_detail.jrxml` | ☐ | — | — | PENDING |

### 1.11 User Templates (3)

| # | Template | File | Compiles | Errors | Warnings | Status |
|---|----------|------|----------|--------|----------|--------|
| 56 | Prepaid Statement | `templates/reports/users/prepaid_statement.jrxml` | ☐ | — | — | PENDING |
| 57 | User Audit Log | `templates/reports/users/user_audit_log.jrxml` | ☐ | — | — | PENDING |
| 58 | User List | `templates/reports/users/user_list.jrxml` | ☐ | — | — | PENDING |

### 1.12 Shared Styles

| # | Template | File | Compiles | Errors | Warnings | Status |
|---|----------|------|----------|--------|----------|--------|
| — | Shared Styles | `Styles.jrxml` | ☐ | — | — | PENDING |

### 1.13 New Templates (2)

| # | Template | File | Compiles | Errors | Warnings | Status |
|---|----------|------|----------|--------|----------|--------|
| 59 | New Electricity Invoice | `ElectricityInvoice.jrxml` | ☐ | — | — | PENDING |
| 60 | New Water Invoice | `WaterInvoice.jrxml` | ☐ | — | — | PENDING |

### Compilation Summary

| Metric | Count |
|--------|-------|
| Total JRXMLs | 60 |
| Compiled Successfully | 0 |
| Compilation Errors | 0 |
| Compilation Warnings | 0 |
| Pass Rate | 0% |
| **Status** | **PENDING** |

---

## 2. PDF Generation Validation

### 2.1 Sample Invoice Generation

| Test Case | Template | Input Data | Expected Output | Actual | Status |
|-----------|----------|------------|-----------------|--------|--------|
| Generate single electricity invoice | `ElectricityInvoice.jrxml` | Customer A, Oct area, Month 2026-06 | Valid PDF with correct amounts | ☐ | PENDING |
| Generate single water invoice | `WaterInvoice.jrxml` | Customer B, New Cairo, Month 2026-06 | Valid PDF with correct amounts | ☐ | PENDING |
| Generate invoice with Arabic labels | `ElectricityInvoice.jrxml` | Arabic locale | Arabic text rendered correctly | ☐ | PENDING |
| Generate invoice with English labels | `ElectricityInvoice.jrxml` | English locale | English text rendered correctly | ☐ | PENDING |
| Generate invoice with TOU charges | `ElectricityInvoice.jrxml` | TOU tariff scenario | Peak/Off-peak breakdown correct | ☐ | PENDING |
| Generate invoice with step charges | `ElectricityInvoice.jrxml` | Step tariff scenario | Tier breakdown correct | ☐ | PENDING |
| Generate invoice with zero consumption | `ElectricityInvoice.jrxml` | Zero reading difference | Minimum charge applied | ☐ | PENDING |
| Generate invoice with negative adjustment | `ElectricityInvoice.jrxml` | Credit note scenario | Negative adjustment shown | ☐ | PENDING |
| Generate invoice with large values | `ElectricityInvoice.jrxml` | High consumption (10,000+ kWh) | Numbers formatted correctly | ☐ | PENDING |

### 2.2 Payment Receipt Generation

| Test Case | Template | Input Data | Expected Output | Actual | Status |
|-----------|----------|------------|-----------------|--------|--------|
| Generate payment receipt | `payment_receipt.jrxml` | Payment for invoice | Receipt with correct amounts | ☐ | PENDING |
| Generate payment receipt with change | `payment_receipt_mini.jrxml` | Payment with overpayment | Change amount calculated | ☐ | PENDING |

### 2.3 Report Generation

| Test Case | Category | Sample | Expected Output | Actual | Status |
|-----------|----------|--------|-----------------|--------|--------|
| Generate all 52 report templates | All categories | Representative data | Each produces valid PDF | ☐ | PENDING |

### 2.4 Multi-format Export

| Format | Template | Status |
|--------|----------|--------|
| PDF Export | All 60 templates | PENDING |
| XLSX Export | All 60 templates | PENDING |
| DOCX Export | All 60 templates | PENDING |
| HTML Export | All 60 templates | PENDING |
| CSV Export | All 60 templates | PENDING |

---

## 3. Excel Generation Validation

| Test Case | Description | Expected Output | Actual | Status |
|-----------|-------------|-----------------|--------|--------|
| Generate XLSX from JXLS template | Simple data grid | Valid .xlsx with data | ☐ | PENDING |
| Generate XLSX with formulas | SUM, AVERAGE, IF formulas | Correct calculated values | ☐ | PENDING |
| Generate XLSX with styling | Fonts, colors, borders | Styled cells match template | ☐ | PENDING |
| Generate XLSX with Arabic headers | Arabic column names | Arabic text renders correctly | ☐ | PENDING |
| Generate XLSX with 10,000+ rows | Large dataset streaming | File opens correctly in Excel | ☐ | PENDING |
| Generate XLSX with multiple sheets | Multi-sheet template | All sheets populated | ☐ | PENDING |
| Generate XLSX with charts | Chart template | Charts render in output | ☐ | PENDING |
| Upload JXLS template | Multipart upload | Template stored in DB | ☐ | PENDING |
| List Excel templates | GET templates API | Template list returned | ☐ | PENDING |

---

## 4. Playwright Visual Tests

### 4.1 Test Configuration

| Setting | Value |
|---------|-------|
| Test Framework | Playwright 1.50+ |
| Browsers | Chromium (headless) |
| Viewport | 1280x720, 1920x1080 |
| Base URL | `http://localhost:3000` |
| API URL | `http://localhost:8080/api/v1` |

### 4.2 Visual Test Cases

| Test ID | Description | Assertion | Status |
|---------|-------------|-----------|--------|
| V-RPT-001 | Report generate page loads without error | HTTP 200, no console errors | PENDING |
| V-RPT-002 | Select report template from dropdown | Options populated | PENDING |
| V-RPT-003 | Fill report parameters | Form validation works | PENDING |
| V-RPT-004 | Generate report and show progress | Progress bar visible | PENDING |
| V-RPT-005 | Download generated PDF | File download triggered | PENDING |
| V-RPT-006 | Bulk generation page loads | Form elements visible | PENDING |
| V-RPT-007 | Start bulk job with 100 customers | Job created successfully | PENDING |
| V-RPT-008 | View bulk job progress | Progress updates in real-time | PENDING |
| V-RPT-009 | Cancel bulk job mid-execution | Job cancelled cleanly | PENDING |
| V-RPT-010 | Download bulk results | ZIP file downloaded | PENDING |
| V-RPT-011 | Template management page loads | Template list visible | PENDING |
| V-RPT-012 | Upload new JRXML template | Template stored | PENDING |
| V-RPT-013 | View template version history | Timeline visible | PENDING |
| V-RPT-014 | Rollback template to previous version | Rollback successful | PENDING |
| V-RPT-015 | PDF security page loads | Options visible | PENDING |
| V-RPT-016 | Protect PDF with password | Encryption applied | PENDING |
| V-RPT-017 | View PDF signature status | Signature info displayed | PENDING |
| V-RPT-018 | Arabic locale renders correctly | RTL layout confirmed | PENDING |
| V-RPT-019 | A4 Landscape preview renders correctly | Width > Height | PENDING |
| V-RPT-020 | A4 Portrait preview renders correctly | Height > Width | PENDING |

---

## 5. Integration Tests

### 5.1 API Integration Tests

| Test ID | Endpoint | Method | Expected Status | Status |
|---------|----------|--------|-----------------|--------|
| INT-001 | `/api/v1/reports/generate` | POST | 200 / 202 | PENDING |
| INT-002 | `/api/v1/reports/export/{id}` | GET | 200 | PENDING |
| INT-003 | `/api/v1/reports/bulk` | POST | 201 | PENDING |
| INT-004 | `/api/v1/reports/bulk/{id}/status` | GET | 200 | PENDING |
| INT-005 | `/api/v1/reports/bulk/{id}` | DELETE | 204 | PENDING |
| INT-006 | `/api/v1/reports/templates` | GET | 200 | PENDING |
| INT-007 | `/api/v1/reports/templates` | POST | 201 | PENDING |
| INT-008 | `/api/v1/reports/templates/{id}` | PUT | 200 | PENDING |
| INT-009 | `/api/v1/reports/templates/{id}` | DELETE | 204 | PENDING |
| INT-010 | `/api/v1/reports/templates/{id}/versions` | GET | 200 | PENDING |
| INT-011 | `/api/v1/reports/templates/{id}/rollback/{v}` | POST | 200 | PENDING |
| INT-012 | `/api/v1/reports/security/protect` | POST | 200 | PENDING |
| INT-013 | `/api/v1/reports/security/sign` | POST | 200 | PENDING |
| INT-014 | `/api/v1/reports/security/watermark` | POST | 200 | PENDING |
| INT-015 | `/api/v1/reports/excel/generate` | POST | 200 | PENDING |
| INT-016 | `/api/v1/reports/excel/templates` | GET | 200 | PENDING |
| INT-017 | `/api/v1/reports/excel/templates` | POST | 201 | PENDING |

### 5.2 Database Integration Tests

| Test ID | Description | Expected | Status |
|---------|-------------|----------|--------|
| INT-DB-001 | Flyway migrations run successfully | 6 migrations applied | PENDING |
| INT-DB-002 | Report template CRUD via JPA | Insert/update/delete works | PENDING |
| INT-DB-003 | Bulk job creation and status update | Status transitions valid | PENDING |
| INT-DB-004 | Generated document store and retrieve | Binary roundtrip OK | PENDING |
| INT-DB-005 | PDF security log append-only | No update/delete allowed | PENDING |

### 5.3 Message Queue Integration Tests

| Test ID | Description | Expected | Status |
|---------|-------------|----------|--------|
| INT-MQ-001 | RabbitMQ connection established | Connected | PENDING |
| INT-MQ-002 | Send message to bulk queue | Message enqueued | PENDING |
| INT-MQ-003 | Consume message from bulk queue | Message consumed | PENDING |
| INT-MQ-004 | Dead-letter queue on failure | Failed message in DLQ | PENDING |
| INT-MQ-005 | Queue metrics reported via Actuator | Queue depth available | PENDING |

---

## 6. Regression Tests

### 6.1 Backend Regression (NestJS)

| Suite | Tests | Expected Pass | Actual Pass | Status |
|-------|-------|---------------|-------------|--------|
| Auth (JWT + RBAC) | 30 | 30 | — | PENDING |
| Audit Log | 28 | 28 | — | PENDING |
| Billing | 15 | 15 | — | PENDING |
| Customers | 20 | 20 | — | PENDING |
| Meters | 25 | 25 | — | PENDING |
| Readings | 18 | 18 | — | PENDING |
| Payments | 12 | 12 | — | PENDING |
| Idempotency | 8 | 8 | — | PENDING |
| Contract Tests | 69 | 69 | — | PENDING |
| Integration | 10 | 10 | — | PENDING |
| Setup | 12 | 12 | — | PENDING |
| **Total** | **~293** | **293** | **—** | **PENDING** |

### 6.2 Reporting Engine Regression (Spring Boot)

| Suite | Tests | Expected Pass | Actual Pass | Status |
|-------|-------|---------------|-------------|--------|
| ReportCompiler | 25 | 25 | — | PENDING |
| ReportFiller | 20 | 20 | — | PENDING |
| ReportExporter | 30 | 30 | — | PENDING |
| PdfSecurityService | 20 | 20 | — | PENDING |
| ExcelEngine | 15 | 15 | — | PENDING |
| BulkGenerationService | 18 | 18 | — | PENDING |
| TemplateService | 15 | 15 | — | PENDING |
| Controllers | 25 | 25 | — | PENDING |
| **Total** | **168** | **168** | **—** | **PENDING** |

### 6.3 End-to-End Regression

| Scenario | Steps | Expected | Status |
|----------|-------|----------|--------|
| Generate invoice → Download PDF | 5 | Invoice PDF generated correctly | PENDING |
| Create bulk job → Monitor progress → Download | 6 | All documents generated | PENDING |
| Upload template → Generate report with it | 4 | Report uses new template | PENDING |
| Apply PDF security → Verify restrictions | 4 | PDF protected as configured | PENDING |
| Generate Excel → Open in Excel | 3 | No corruption | PENDING |

---

## 7. Arabic RTL Rendering Validation

### 7.1 Text Rendering Tests

| Test ID | Element | Arabic Text | Expected | Actual | Status |
|---------|---------|-------------|----------|--------|--------|
| AR-001 | Invoice title | فاتورة الكهرباء | Reads RTL, connected glyphs | ☐ | PENDING |
| AR-002 | Customer name | محمد أحمد علي | Correct letter forms per position | ☐ | PENDING |
| AR-003 | Address field | مدينة أكتوبر، الحي الأول | Line wraps correctly RTL | ☐ | PENDING |
| AR-004 | Amount in words | ألف ومائتان وخمسون جنيهاً | Correct numeral placement | ☐ | PENDING |
| AR-005 | Date | ٢٧ يونيو ٢٠٢٦ | Arabic-Indic digits correct | ☐ | PENDING |
| AR-006 | Table headers | البيان | Header aligned right | ☐ | PENDING |
| AR-007 | Table data | استهلاك ٥٠٠ ك.و.س | Mixed text+number alignment | ☐ | PENDING |
| AR-008 | Footer | شكراً لتعاملكم معنا | Footer aligned left | ☐ | PENDING |
| AR-009 | Watermark | مسودة | Watermark correctly rotated RTL | ☐ | PENDING |
| AR-010 | Report title | تقرير الفواتير الشهرية | Centered RTL title | ☐ | PENDING |

### 7.2 Layout Tests

| Test ID | Element | Expected | Actual | Status |
|---------|---------|----------|--------|--------|
| AR-L-001 | Overall page direction | RTL (right page start) | ☐ | PENDING |
| AR-L-002 | Table column order | Reversed for RTL | ☐ | PENDING |
| AR-L-003 | Logo position | Top-right | ☐ | PENDING |
| AR-L-004 | Amount column | Left-aligned (numbers in RTL) | ☐ | PENDING |
| AR-L-005 | Signature line | Bottom-left | ☐ | PENDING |
| AR-L-006 | Page numbers | Bottom-center | ☐ | PENDING |

### 7.3 Font Tests

| Test ID | Font | Weight | Expected | Actual | Status |
|---------|------|--------|----------|--------|--------|
| AR-F-001 | Arabic Regular | Normal | All glyphs present | ☐ | PENDING |
| AR-F-002 | Arabic Bold | Bold | Bold weight renders | ☐ | PENDING |
| AR-F-003 | Arabic Italic | Italic | Italic style renders | ☐ | PENDING |
| AR-F-004 | Arabic Bold-Italic | Bold Italic | Combined style renders | ☐ | PENDING |
| AR-F-005 | Numbers | N/A | Arabic-Indic digits OK | ☐ | PENDING |
| AR-F-006 | Mixed AR/EN | N/A | Arabic + English in same line | ☐ | PENDING |

---

## 8. A4 Landscape/Portfolio Validation

### 8.1 Landscape Orientation

| Test ID | Template | Expected | Actual | Status |
|---------|----------|----------|--------|--------|
| L-001 | `ElectricityInvoice.jrxml` Landscape | Width 297mm, Height 210mm | ☐ | PENDING |
| L-002 | `ElectricityInvoice.jrxml` Landscape content | Content fills landscape width | ☐ | PENDING |
| L-003 | All report templates Landscape | Each renders correctly | ☐ | PENDING |
| L-004 | Tables in Landscape | Extra columns visible | ☐ | PENDING |

### 8.2 Portrait Orientation

| Test ID | Template | Expected | Actual | Status |
|---------|----------|----------|--------|--------|
| P-001 | `ElectricityInvoice.jrxml` Portrait | Width 210mm, Height 297mm | ☐ | PENDING |
| P-002 | `ElectricityInvoice.jrxml` Portrait content | Content fills portrait height | ☐ | PENDING |
| P-003 | All report templates Portrait | Each renders correctly | ☐ | PENDING |
| P-004 | Dynamic orientation switch | Setting orientation changes layout | ☐ | PENDING |

### 8.3 Orientation Switching

| Test ID | Scenario | Expected | Actual | Status |
|---------|----------|----------|--------|--------|
| OS-001 | Generate same report in both orientations | Both valid outputs | ☐ | PENDING |
| OS-002 | Switch orientation mid-bulk-job | Each item uses requested orientation | ☐ | PENDING |
| OS-003 | Default orientation from config | Config value respected | ☐ | PENDING |

---

## 9. Performance Benchmarks

### 9.1 Single Report Generation

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| PDF generation (cold cache) | < 3 seconds | — | PENDING |
| PDF generation (warm cache) | < 500 ms | — | PENDING |
| XLSX generation (1,000 rows) | < 2 seconds | — | PENDING |
| DOCX generation | < 2 seconds | — | PENDING |
| HTML generation | < 1 second | — | PENDING |
| CSV generation (10,000 rows) | < 1 second | — | PENDING |

### 9.2 Concurrent Generation

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| 10 concurrent requests (P50) | < 2 seconds | — | PENDING |
| 10 concurrent requests (P99) | < 5 seconds | — | PENDING |
| 50 concurrent requests (P50) | < 5 seconds | — | PENDING |
| 50 concurrent requests (P99) | < 15 seconds | — | PENDING |
| 100 concurrent requests (P50) | < 10 seconds | — | PENDING |
| 100 concurrent requests (P99) | < 30 seconds | — | PENDING |
| 200 concurrent requests (P50) | < 20 seconds | — | PENDING |
| 200 concurrent requests (P99) | < 60 seconds | — | PENDING |

### 9.3 Throughput

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Reports per minute (generation) | ≥ 1,000/min | — | PENDING |
| Reports per minute (export) | ≥ 500/min | — | PENDING |
| Bulk job throughput (5 consumers) | ≥ 100/min | — | PENDING |
| Max queue depth (before backpressure) | 10,000 | — | PENDING |

### 9.4 Resource Utilization

| Metric | Target (per instance) | Actual | Status |
|--------|----------------------|--------|--------|
| CPU (idle) | < 5% | — | PENDING |
| CPU (100 concurrent) | < 80% | — | PENDING |
| Memory (idle) | < 512 MB | — | PENDING |
| Memory (100 concurrent) | < 2 GB | — | PENDING |
| Disk (templates) | < 500 MB | — | PENDING |
| Disk (generated docs) | < 10 GB/day | — | PENDING |

### 9.5 Cache Performance

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Cache hit ratio (steady state) | > 90% | — | PENDING |
| Cache entry count (max) | 500 | — | PENDING |
| Cache eviction rate | < 1%/min | — | PENDING |

---

## 10. Template Versioning Validation

| Test ID | Scenario | Expected | Actual | Status |
|---------|----------|----------|--------|--------|
| TV-001 | Upload new template version | Version incremented to 2 | ☐ | PENDING |
| TV-002 | View version history | All versions listed with timestamps | ☐ | PENDING |
| TV-003 | Compare two versions | Diff shows changes | ☐ | PENDING |
| TV-004 | Rollback to version 1 | Template content = version 1 | ☐ | PENDING |
| TV-005 | Concurrent version conflict | Conflict error raised | ☐ | PENDING |
| TV-006 | Git commit on save | Git log shows commit | ☐ | PENDING |
| TV-007 | Template with sub-reports | Sub-reports versioned together | ☐ | PENDING |
| TV-008 | Delete template version | Soft delete, history preserved | ☐ | PENDING |
| TV-009 | Upload invalid JRXML | Validation error, not saved | ☐ | PENDING |
| TV-010 | Max versions limit (100) | Oldest version auto-archived | ☐ | PENDING |

---

## 11. PDF Security Feature Validation

### 11.1 Encryption

| Test ID | Scenario | Expected | Actual | Status |
|---------|----------|----------|--------|--------|
| PS-001 | Encrypt PDF with user password | PDF prompts for password | ☐ | PENDING |
| PS-002 | Encrypt PDF with owner password | Full access with owner password | ☐ | PENDING |
| PS-003 | Open PDF without password | Denied | ☐ | PENDING |
| PS-004 | Set permissions (no printing) | Print button disabled | ☐ | PENDING |
| PS-005 | Set permissions (no copying) | Copy text disabled | ☐ | PENDING |
| PS-006 | Set permissions (no modifying) | Edit tools disabled | ☐ | PENDING |
| PS-007 | AES-256 encryption strength | 256-bit key confirmed | ☐ | PENDING |
| PS-008 | Decrypt with wrong password | Error message shown | ☐ | PENDING |

### 11.2 Digital Signatures

| Test ID | Scenario | Expected | Actual | Status |
|---------|----------|----------|--------|--------|
| PS-009 | Sign PDF with valid certificate | "Valid Signature" in Acrobat | ☐ | PENDING |
| PS-010 | Sign PDF and verify integrity | Tampering detected | ☐ | PENDING |
| PS-011 | Sign with SHA-256 hash | SHA-256 in signature info | ☐ | PENDING |
| PS-012 | Multiple signatures on same PDF | Both signatures valid | ☐ | PENDING |
| PS-013 | Sign with expired certificate | Warning shown | ☐ | PENDING |
| PS-014 | PKCS12 keystore loading | Key loaded successfully | ☐ | PENDING |
| PS-015 | Certificate chain validation | Chain valid to root CA | ☐ | PENDING |

### 11.3 Watermarking

| Test ID | Scenario | Expected | Actual | Status |
|---------|----------|----------|--------|--------|
| PS-016 | Add "DRAFT" watermark | Watermark visible diagonally | ☐ | PENDING |
| PS-017 | Add "CONFIDENTIAL" watermark | Watermark visible on all pages | ☐ | PENDING |
| PS-018 | Watermark opacity 0.3 | Semi-transparent, content readable | ☐ | PENDING |
| PS-019 | Watermark opacity 1.0 | Fully opaque, content obscured | ☐ | PENDING |
| PS-020 | Watermark with custom text | Custom text rendered | ☐ | PENDING |
| PS-021 | Watermark with logo image | Image watermark centered | ☐ | PENDING |
| PS-022 | Watermark on multi-page PDF | All pages watermarked | ☐ | PENDING |
| PS-023 | Remove watermark from PDF | Watermark removed, content intact | ☐ | PENDING |

### 11.4 Audit Logging

| Test ID | Scenario | Expected | Actual | Status |
|---------|----------|----------|--------|--------|
| PS-024 | Encrypt operation logged | Entry in pdf_security_log | ☐ | PENDING |
| PS-025 | Sign operation logged | Entry with certificate info | ☐ | PENDING |
| PS-026 | Watermark operation logged | Entry with text/opacity | ☐ | PENDING |
| PS-027 | Failed decrypt attempt logged | Failed attempt recorded | ☐ | PENDING |
| PS-028 | Log contains timestamp + user | Complete audit trail | ☐ | PENDING |

---

## 12. Bulk Generation Validation

### 12.1 Small Batch — 10 Invoices

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Total time | < 30 seconds | — | PENDING |
| Success rate | 100% | — | PENDING |
| Error rate | 0% | — | PENDING |
| Average per item | < 3 seconds | — | PENDING |

### 12.2 Medium Batch — 100 Invoices

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Total time | < 3 minutes | — | PENDING |
| Success rate | 100% | — | PENDING |
| Error rate | 0% | — | PENDING |
| Average per item | < 2 seconds | — | PENDING |

### 12.3 Large Batch — 1,000 Invoices

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Total time | < 10 minutes | — | PENDING |
| Success rate | > 99% | — | PENDING |
| Error rate | < 1% | — | PENDING |
| Average per item | < 1 second | — | PENDING |
| Queue depth peak | < 1,000 | — | PENDING |
| Memory peak | < 4 GB | — | PENDING |

### 12.4 Stress Batch — 10,000 Invoices

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Total time | < 1 hour | — | PENDING |
| Success rate | > 99% | — | PENDING |
| Error rate | < 1% | — | PENDING |
| Queue depth peak | < 10,000 | — | PENDING |
| Memory peak | < 8 GB | — | PENDING |
| Consumer restart | None expected | — | PENDING |
| Database connection pool | No starvation | — | PENDING |

### 12.5 Edge Cases

| Test ID | Scenario | Expected | Actual | Status |
|---------|----------|----------|--------|--------|
| BG-001 | Cancel job mid-execution | Remaining items not processed | ☐ | PENDING |
| BG-002 | Resume failed job | Failed items retried | ☐ | PENDING |
| BG-003 | Duplicate job submission | Job rejected | ☐ | PENDING |
| BG-004 | Invalid template reference | Job fails immediately | ☐ | PENDING |
| BG-005 | RabbitMQ disconnection | Queue durability preserved | ☐ | PENDING |
| BG-006 | Consumer crash | Messages requeued | ☐ | PENDING |
| BG-007 | Database timeout during bulk | Transaction retry | ☐ | PENDING |
| BG-008 | All items fail for same reason | Job marked as FAILED | ☐ | PENDING |

---

## 13. Pre-Migration Signoff Checklist

### 13.1 Infrastructure Readiness

| # | Item | Responsible | Signed Off | Date |
|---|------|-------------|------------|------|
| 1 | PostgreSQL 16 instance provisioned with `reporting` schema | DevOps | ☐ | — |
| 2 | RabbitMQ 4.x cluster deployed and accessible | DevOps | ☐ | — |
| 3 | Docker registry configured for reporting engine images | DevOps | ☐ | — |
| 4 | Network policies allow backend → reporting engine traffic | DevOps | ☐ | — |
| 5 | Secrets (DB passwords, keystore, JWT) stored in vault | DevOps | ☐ | — |
| 6 | Monitoring (Prometheus + Grafana) configured for new service | DevOps | ☐ | — |
| 7 | Logging (ELK/Datadog) configured for new service | DevOps | ☐ | — |
| 8 | Alerting rules defined for error rate, queue depth, latency | DevOps | ☐ | — |
| 9 | CI/CD pipeline builds and deploys reporting engine | DevOps | ☐ | — |
| 10 | Staging environment mirrors production configuration | DevOps | ☐ | — |

### 13.2 Code Readiness

| # | Item | Responsible | Signed Off | Date |
|---|------|-------------|------------|------|
| 11 | All 60 JRXML templates compiled and validated | Reporting Team | ☐ | — |
| 12 | All unit tests pass (168 tests) | Reporting Team | ☐ | — |
| 13 | All integration tests pass (38 tests) | QA | ☐ | — |
| 14 | All Playwright visual tests pass (20 tests) | QA | ☐ | — |
| 15 | Performance benchmarks meet targets | QA | ☐ | — |
| 16 | Security scan (SAST/Trivy) passes with zero HIGH/CRITICAL | Security | ☐ | — |
| 17 | Code review completed for all modules | Tech Lead | ☐ | — |
| 18 | API documentation (OpenAPI) published | Reporting Team | ☐ | — |
| 19 | Feature flag `reporting-engine-v2` implemented | Backend Team | ☐ | — |
| 20 | Rollback plan documented and rehearsed | DevOps | ☐ | — |

### 13.3 Template Readiness

| # | Item | Responsible | Signed Off | Date |
|---|------|-------------|------------|------|
| 21 | All legacy JRXMLs migrated and visually verified | Reporting Team | ☐ | — |
| 22 | New ElectricityInvoice.jrxml reviewed by business | Business | ☐ | — |
| 23 | New WaterInvoice.jrxml reviewed by business | Business | ☐ | — |
| 24 | Arabic font extension JAR built and tested | Reporting Team | ☐ | — |
| 25 | A4 Landscape and Portrait templates validated | Reporting Team | ☐ | — |

### 13.4 Documentation Readiness

| # | Item | Responsible | Signed Off | Date |
|---|------|-------------|------------|------|
| 26 | Deployment runbook written | DevOps | ☐ | — |
| 27 | Operations runbook written (monitoring, alerting) | DevOps | ☐ | — |
| 28 | User guide for report generation (business users) | Tech Writer | ☐ | — |
| 29 | API documentation published to developer portal | Reporting Team | ☐ | — |
| 30 | Architecture diagram updated | Tech Lead | ☐ | — |

### 13.5 Business Signoff

| # | Item | Responsible | Signed Off | Date |
|---|------|-------------|------------|------|
| 31 | Sample invoices reviewed and approved by business | Business | ☐ | — |
| 32 | Bulk generation acceptance criteria signed off | Product Owner | ☐ | — |
| 33 | PDF security requirements confirmed | Product Owner | ☐ | — |
| 34 | Arabic rendering approved by Arabic-speaking reviewer | Business | ☐ | — |
| 35 | Performance SLA accepted | Product Owner | ☐ | — |

### 13.6 Final Signoff

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Tech Lead | ____________ | ______ | ____________ |
| QA Lead | ____________ | ______ | ____________ |
| Product Owner | ____________ | ______ | ____________ |
| DevOps Lead | ____________ | ______ | ____________ |
| Security Lead | ____________ | ______ | ____________ |
| **Architecture Lead** | ____________ | ______ | ____________ |

---

*End of Validation Report*
