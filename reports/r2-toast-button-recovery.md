# R2 — Toast Button Recovery

**Date**: 2026-06-18
**Gate**: BUTTONS_CERTIFIED

## Inventory of 22 Toast-Only Buttons

### Wired to API (This Recovery)
| Button | Page | Line | Status | Backend |
|--------|------|------|--------|---------|
| Issue Invoice | InvoicesPage | 73 | ✅ WIRED | `POST /invoices/:id/issue` |
| Issue Invoice | InvoiceDetailPage | 57 | ✅ WIRED | `POST /invoices/:id/issue` |

### Backend Exists, Frontend Needs Work
| Button | Page | Backend Endpoint | Status |
|--------|------|-----------------|--------|
| Generate Invoice | InvoicesPage | `POST /invoices/generate` (FIXED) | ⏳ Needs dialog for period selection |
| Edit Invoice (draft) | InvoicesPage | `PATCH /invoices/:id` — MISSING | ❌ Needs backend first |
| Edit Invoice (draft) | InvoiceDetailPage | `PATCH /invoices/:id` — MISSING | ❌ Needs backend first |
| Cancel Invoice (draft) | InvoicesPage | `POST /invoices/:id/cancel` — MISSING | ❌ Needs backend first |
| Cancel Invoice (draft) | InvoiceDetailPage | `POST /invoices/:id/cancel` — MISSING | ❌ Needs backend first |
| Record Payment | InvoicesPage | `POST /payments` — exists | ⏳ Needs dialog |
| Record Payment | InvoiceDetailPage | `POST /payments` — exists | ⏳ Needs dialog |
| Create Project | ProjectsPage | `POST /projects` — exists | 📋 Covered in R3 |
| Edit Project | ProjectsPage | `PATCH /projects/:id` — exists | 📋 Covered in R3 |
| Delete Project | ProjectsPage | `DELETE /projects/:id` — exists | 📋 Covered in R3 |
| Add Meter | MetersPage | `POST /meters` — exists | ⏳ Needs dialog |
| Edit Meter | MetersPage | `PATCH /meters/:id` — exists | ⏳ Needs dialog |
| Delete Meter | MetersPage | `DELETE /meters/:id` — exists | ⏳ Needs dialog |

### Backend Missing
| Button | Page | Status |
|--------|------|--------|
| Download PDF | InvoicesPage | ❌ Needs PDF generation service |
| Download PDF | InvoiceDetailPage | ❌ Needs PDF generation service |
| Reports: CSV/XLSX/Preview | ReportsPage | ❌ Needs report generation service |
| SmartTable Export CSV/XLSX | SmartTable | ❌ Needs report generation service |
| Payments: View/Edit/Delete | PaymentsPage | ❌ Needs backend endpoints |

## Summary
| Category | Count |
|----------|-------|
| ✅ WIRED in this recovery | 2 |
| ⏳ Backend exists, needs frontend dialog | 9 |
| ❌ Backend missing | 8 |
| 📋 Covered in another recovery (R3) | 3 |

## Conclusion
**BUTTONS_CERTIFIED = NO** — 20 buttons still need work. Critical path: R3 (Project CRUD) covers 3, remaining 17 need backend or dialog work.
