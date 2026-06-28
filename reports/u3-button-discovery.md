# U3 — Button Discovery

**Date**: 2026-06-18
**Method**: Source code scan of 23 page components

## Inventory Summary
| Classification | Count | Description |
|---------------|-------|-------------|
| WORKING (navigates) | 16 | BackButton, View actions |
| WORKING (local state) | 22 | Tabs, toggles, filters, accordions |
| WORKING (real API) | 16 | Locations CRUD, Customers CRUD, Meter replace/terminate |
| **NO_ACTION** | **22** | **Buttons that show toast but do nothing** |
| **MOCK_ONLY** | **11** | **Buttons that operate on mock data only** |
| BROKEN | 0 | — |
| ERROR | 0 | — |
| **Total** | **87** | |

## NO_ACTION Buttons (22) — All Toast-Only Placeholders
| Page | Buttons |
|------|---------|
| ProjectsPage | Create Project, Edit, Delete |
| MetersPage | Add Meter, Edit, Delete |
| InvoicesPage | Generate Invoice, Edit, Issue, Record Payment, Download, Cancel |
| InvoiceDetailPage | Edit, Issue, Record Payment, Download, Cancel |
| ReportsPage | Filters, CSV, XLSX, Preview |
| PaymentsPage | View, Edit, Delete |

## MOCK_ONLY Buttons (11)
| Page | Buttons |
|------|---------|
| MeterAssignPage | Submit Assignment (full 8-step wizard, no API) |
| PaymentsPage | Record Payment submit |
| TicketsPage | Create Ticket submit |
| AlertsPage | Acknowledge |
| SettingsPage | 4x Save buttons, Team tab |

## Conclusion
**BUTTONS_CERTIFIED = NO** — 22 buttons are functional placeholders (toast only), 11 operate on mock data only.
