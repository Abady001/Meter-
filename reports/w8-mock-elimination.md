# W8 — Mock Data Elimination Audit

**Date**: 2026-06-18
**Method**: Source code scan of all 30 component files

## Classification Results
| Status | Count | Pages |
|--------|-------|-------|
| **API_ONLY** | **8** | ProjectsPage, LocationsPage, CustomersPage, MetersPage, MeterReplacePage, SimCardsPage, InvoicesPage, InvoiceDetailPage |
| **HYBRID** | **10** | DashboardPage, ProjectDetailPage, CustomerDetailPage, MeterDetailPage, MeterTerminatePage, PaymentsPage, BalancesPage, ConsumptionPage, WaterBalancePage, ReadingNewPage |
| **MOCK_ONLY** | **8** | MeterAssignPage, ReportsPage, SettingsPage, AlertsPage, TicketsPage, SupportPage |

## Mock Data Sources
- `mock-data.ts`: 18 arrays (users, projects, buildings, units, customers, meters, SIMs, readings, invoices, payments, balances, alerts, tickets, KPIs, activity, reports, consumption, water balance)
- `mock-auth.ts`: Zustand store using mock users

## Feature Flag Status
| Flag | Setting | Used? |
|------|---------|-------|
| `reports.list` | mock | ❌ Not checked by ReportsPage |
| `alerts.list` | mock | ❌ Not checked by AlertsPage |
| `tickets.list` | mock | ❌ Not checked by TicketsPage |

## Conclusion
**MOCK_FREE = NO** — 8 pages are fully mock-dependent; 10 are hybrid.
