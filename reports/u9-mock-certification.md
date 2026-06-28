# U9 — Mock Data Certification

**Date**: 2026-06-18
**Method**: Source code scan of all 30 component files + mock-data.ts

## Mock Data Sources
- `mock-data.ts`: 18 arrays (users, projects, buildings, units, customers, meters, SIMs, readings, invoices, payments, balances, alerts, tickets, KPIs, activity, reports, consumption, water balance)
- `mock-auth.ts`: Zustand store using mock users; login falls back to mock token

## Page Classification
| Classification | Count | Pages |
|---------------|-------|-------|
| **API_ONLY** | 8 | ProjectsPage, LocationsPage, CustomersPage, MetersPage, MeterReplacePage, SimCardsPage, InvoicesPage, InvoiceDetailPage |
| **HYBRID** | 10 | DashboardPage, ProjectDetailPage, CustomerDetailPage, MeterDetailPage, MeterTerminatePage, PaymentsPage, BalancesPage, ConsumptionPage, WaterBalancePage, ReadingNewPage |
| **MOCK_ONLY** | 8 | MeterAssignPage, ReportsPage, SettingsPage, AlertsPage, TicketsPage, SupportPage, ReadingNewPage (form data), PaymentsPage (dialog) |

## Feature Flag Status
| Flag | Setting | Status |
|------|---------|--------|
| `projects.list` | api | ✅ |
| `customers.list` | api | ✅ |
| `meters.list` | api | ✅ |
| `sims.list` | api | ✅ |
| `readings.list` | api | ✅ |
| `billing.list` | api | ✅ |
| `invoices.list` | api | ✅ |
| `payments.list` | api | ✅ |
| `reports.list` | **mock** | ❌ |
| `alerts.list` | **mock** | ❌ |
| `tickets.list` | **mock** | ❌ |

## Critical Finding
Feature flags are NOT actually checked by most MOCK_ONLY pages. The flags for `reports`, `alerts`, `tickets` exist but these pages never reference them — they use mock data unconditionally.

## Conclusion
**MOCK_FREE = NO** — 8 pages are entirely mock-dependent, 10 are hybrid.
