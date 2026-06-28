# U7 — Invoice Download Certification

**Date**: 2026-06-18
**Method**: Source code audit

## Findings
| Feature | Button | Actual Behavior |
|---------|--------|----------------|
| Invoice Detail "Download" | ✅ EXISTS | ❌ Toast: "Download PDF" — no file |
| Invoice List "Download" | ✅ EXISTS | ❌ Toast: "Download PDF placeholder" — no file |
| Backend PDF generation | ❌ NOT IMPLEMENTED | No library, no service |
| Backend download endpoint | ❌ NOT IMPLEMENTED | No `GET /invoices/:id/pdf` route |
| Print invoice | ❌ NOT IMPLEMENTED | No print button or stylesheet |

## Conclusion
**INVOICE_DOWNLOAD_CERTIFIED = NO** — Zero invoice download functionality is actually implemented.
