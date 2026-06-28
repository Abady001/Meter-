# W6+W7 — Report + Invoice Download Certification

**Date**: 2026-06-18
**Method**: Source code audit

## Report Downloads
| Feature | Button | Actual Behavior |
|---------|--------|----------------|
| ReportsPage CSV | ✅ EXISTS | ❌ Toast: "Export CSV placeholder" |
| ReportsPage XLSX | ✅ EXISTS | ❌ Toast: "Export XLSX placeholder" |
| ReportsPage Preview | ✅ EXISTS | ❌ Toast: "Preview report" |
| SmartTable CSV/XLSX | ✅ EXISTS | ❌ Toast: "Export coming soon" |
| Backend PDF library | ❌ NOT INSTALLED | No pdfkit, puppeteer, etc. |
| Backend CSV library | ❌ NOT INSTALLED | No csv-writer, json2csv, etc. |
| Backend export endpoint | ❌ NOT IMPLEMENTED | No route |
| Frontend blob handler | ❌ NOT IMPLEMENTED | No FileSaver, no download logic |

## Invoice Downloads
| Feature | Button | Actual Behavior |
|---------|--------|----------------|
| Invoice Detail Download | ✅ EXISTS | ❌ Toast: "Download PDF" |
| Invoice List Download | ✅ EXISTS | ❌ Toast: "Download PDF placeholder" |
| Backend PDF endpoint | ❌ NOT IMPLEMENTED | No `GET /invoices/:id/pdf` |
| Invoice print | ❌ NOT IMPLEMENTED | No print button or stylesheet |

## Conclusion
**REPORT_DOWNLOAD_CERTIFIED = NO**
**INVOICE_DOWNLOAD_CERTIFIED = NO**
— Zero download functionality is implemented anywhere in the codebase.
