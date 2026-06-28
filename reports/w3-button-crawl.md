# W3 — Full Button Crawl

**Date**: 2026-06-18
**Method**: Source code scan of 23 page components (Playwright login blocked by Docker networking)

## Results (87 interactive elements across 23 components)
| Classification | Count | Examples |
|---------------|-------|----------|
| WORKING (API mutation) | 16 | Locations CRUD, Customers CRUD, Meter replace/terminate |
| WORKING (navigate) | 16 | BackButton, View actions |
| WORKING (local state) | 22 | Tabs, toggles, filters, accordions |
| **TOAST_ONLY** | **22** | Create/Edit/Delete on projects, meters, invoices; all downloads |
| **MOCK_ONLY** | **11** | MeterAssign submit, Create Ticket, Record Payment, Acknowledge Alert |
| BROKEN | 0 | — |
| ERROR | 0 | — |

## Pages with Most Broken Buttons
| Page | Broken Count | Details |
|------|-------------|---------|
| InvoicesPage | 6 | Generate, Edit, Issue, Record Payment, Download, Cancel — all toast |
| InvoiceDetailPage | 5 | Edit, Issue, Record Payment, Download, Cancel — all toast |
| ReportsPage | 4 | Filters, CSV, XLSX, Preview — all toast |
| ProjectsPage | 3 | Create, Edit, Delete — all toast |
| MetersPage | 3 | Add Meter, Edit, Delete — all toast |

## Conclusion
**BUTTONS_CERTIFIED = NO** — 22 of 87 buttons are functional placeholders.
