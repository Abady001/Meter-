# T1 — Template Inventory

**Date**: 2026-06-18
**Source**: SBill OctoberBilling-Complete/04_reports

## File Inventory
| Extension | Count | Purpose |
|-----------|-------|---------|
| `.jrxml` | 44 | JasperReports XML source |
| `.jasper` | 39 | Compiled JasperReports binary |
| `.png` | 10 | Images (logos, watermarks, stamps) |
| `.jpg` | 4 | Images (logo variants, sign) |
| `.bak` | 2 | Backup versions |
| `.xlsx` | 1 | Excel import template |
| **Total** | **100** | |

## Template Categories
| Category | Count | Key Templates |
|----------|-------|--------------|
| **Invoices** | 4 | Electricity, Water (3 variants) |
| **Payment Receipts** | 2 | Full, Mini |
| **Customer Reports** | 4 | Balance, Claims, Aggregated Meter, Details |
| **Meter Reports** | 5 | Details, Status, Incorrect Readings, Disconnected, Unallocated |
| **Financial Reports** | 5 | Monthly Finance, Financial Audit, Invoices List |
| **Collection Reports** | 2 | Payments, Consumption+Payments Details |
| **Operational Reports** | 5 | Alerts Queue/Sent, Active Tariff, Canceled Invoices, User Audit |
| **Sub-reports** | 5 | Invoice, Payment, Tariff Charge, Tariff Charge Detail |
| **Other** | 1 | Prepaid Statement |

## Utilities Covered
| Utility | Exists in SBill? | Our System? |
|---------|-----------------|-------------|
| Electricity | ✅ `invoice_elec.jrxml` | ✅ Partial |
| Water | ✅ `invoice_water*.jrxml` (3 variants) | ✅ Partial |
| Solar | ❌ Not found | ❌ Missing |
| Chilled Water | ❌ Not found | ❌ Missing |
| Settlement | ❌ Not found | ❌ Missing |
| Gas | ❌ Not found | ❌ Missing |
