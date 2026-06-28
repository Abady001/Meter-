# Frontend Route Audit

**Generated**: 2026-06-25
**Source**: Frontend/src/lib/router-store.ts (PageKey type), Frontend/src/components/layout/AppShell.tsx (renderPage switch), Frontend/src/lib/navigation.ts (nav config)

---

## Route Map

| # | PageKey | Navigation href | Component | Component Exists? | Status | Details |
|---|---|---|---|---|---|---|
| 1 | dashboard | /dashboard | DashboardPage | components/dashboard/DashboardPage.tsx | Complete | Full dashboard with KPI cards, charts, activity feed. Uses useDashboardKpis, useConsumptionTrend, useRecentActivity hooks with API calls. Loading/error handled by inline logic and chart empty state. |
| 2 | executive-dashboard | /executive-dashboard | ExecutiveDashboard | components/dashboard/ExecutiveDashboard.tsx | Complete | Executive KPIs, top projects, aged debtors, utility mix. Queries 10+ API endpoints with .catch(() =\> []) fallbacks. Loading/error: implicit (empty arrays render). |
| 3 | operations-dashboard | /operations-dashboard | OperationsDashboard | components/dashboard/OperationsDashboard.tsx | Complete | Meter health, reading performance, open incidents. API calls with fallbacks. Loading state: none explicit. |
| 4 | billing-dashboard | /billing-dashboard | BillingDashboard | components/dashboard/BillingDashboard.tsx | Complete | Invoice/payment KPIs, status distribution. API calls with fallbacks. |
| 5 | collections-dashboard-plus | /collections-dashboard-plus | CollectionsDashboardPlus | components/dashboard/CollectionsDashboardPlus.tsx | Complete | Collection rate, aging buckets, top debtors. API calls with fallbacks. |
| 6 | utility-dashboard | /utility-dashboard | UtilityDashboard | components/dashboard/UtilityDashboard.tsx | Complete | Per-utility stats tabs. |
| 7 | solar-dashboard | (not in nav.ts) | SolarDashboard | components/dashboard/SolarDashboard.tsx | Complete | Solar production KPIs, top producers. |
| 8 | kpi-executive | /kpi-executive | KpiExecutiveDashboard | components/kpi/ExecutiveDashboard.tsx | Complete | KPI cards with project selector, API calls. |
| 9 | kpi-collections | /kpi-collections | KpiCollectionsDashboard | components/kpi/CollectionsDashboard.tsx | Complete | Collection KPIs with period selector, API calls. |
| 10 | kpi-utilities | /kpi-utilities | KpiUtilitiesDashboard | components/kpi/UtilitiesDashboard.tsx | Complete | Utility KPI cards by utility type, API calls. |
| 11 | sync-gateway | /sync-gateway | SyncGatewayPage | components/sync/SyncGatewayPage.tsx | Complete | Gateway health monitoring with live FETCH checks to orchestrator + 9 gateway ports. Loading state, error handling. |
| 12 | projects | /projects | ProjectsPage | components/projects/ProjectsPage.tsx | Complete | Full CRUD: SmartTable + create dialog + edit dialog + delete alert. Uses useProjectsList, useDeleteProject, ProjectFormDialog. QueryBoundary. |
| 13 | project-detail | (detail page) | ProjectDetailPage | components/projects/ProjectDetailPage.tsx | Complete | Detail view with tabs, stat cards, charts. Uses useProjectDetail, useLocationsList, etc. QueryBoundary. |
| 14 | locations | /locations | LocationsPage | components/projects/LocationsPage.tsx | Complete | Full CRUD for buildings/units. Create/Edit/Delete dialogs. QueryBoundary. |
| 15 | customers | /customers | CustomersPage | components/customers/CustomersPage.tsx | Complete | Customer list with area/project tabs, search, add button. API calls with fallbacks. No explicit loading state. |
| 16 | customer-detail | (detail page) | CustomerDetailPage | components/customers/CustomerDetailPage.tsx | Complete | Detail view with 12+ tabs. Create mode (id=new) with form. API calls with error handling. |
| 17 | meters | /meters | MetersPage | components/meters/MetersPage.tsx | Complete | Full CRUD: SmartTable + filters + delete alert dialog. QueryBoundary. |
| 18 | meter-detail | (detail page) | MeterDetailPage | components/meters/MeterDetailPage.tsx | Complete | Detail view with chart, tabs. QueryBoundary. |
| 19 | meter-assign | /meters/assign | MeterAssignPage | components/meters/MeterAssignPage.tsx | Complete | 9-step wizard for assigning meter to unit. Loading state. Validation. |
| 20 | meter-replace | /meters/replace | MeterReplacePage | components/meters/MeterReplacePage.tsx | Complete | Two-panel replace flow with validation. Loading state. |
| 21 | meter-terminate | /meters/terminate | MeterTerminatePage | components/meters/MeterTerminatePage.tsx | Complete | Terminate flow with meter selection + details + confirmation. Loading state. Validation. |
| 22 | sim-cards | (not in nav nav tree) | SimCardsPage | components/sim-cards/SimCardsPage.tsx | Complete | SIM card list with eligibility badges, filters. QueryBoundary. Read-only list. |
| 23 | readings | /readings | ReadingsPage | components/readings/ReadingsPage.tsx | Complete | Readings list with all/review tabs, filters. QueryBoundary. |
| 24 | reading-new | /readings/new | ReadingNewPage | components/readings/ReadingNewPage.tsx | Complete | New reading form with project/meter selection, validation warnings, consumption calc. Zod schema. |
| 25 | consumption | (not in nav nav tree) | ConsumptionPage | components/billing/ConsumptionPage.tsx | Partial | Consumption charts, high/zero/missing panels use hardcoded mock data []. Chart data is empty []. |
| 26 | water-balance | (not in nav nav tree) | WaterBalancePage | components/billing/WaterBalancePage.tsx | Partial | Water balance stat cards work, but trend chart data is empty []. Child meter list is hardcoded. |
| 27 | invoices | /invoices | InvoicesPage | components/billing/InvoicesPage.tsx | Complete | Full invoice list with SmartTable, filters, dropdown actions (view, edit, issue, record payment, download, cancel). |
| 28 | invoice-detail | (detail page) | InvoiceDetailPage | components/billing/InvoiceDetailPage.tsx | Complete | Invoice detail with header, customer/meter/totals cards, line items, payment history, activity timeline. |
| 29 | payments | (not in nav nav tree) | PaymentsPage | components/billing/PaymentsPage.tsx | Complete | Payments list with create dialog. ProtectedAction for edit/delete. |
| 30 | balances | /balances | BalancesPage | components/billing/BalancesPage.tsx | Broken | Page renders but const balances = [] is hardcoded empty. All stat cards show 0. SmartTable shows no data. No API call to fetch actual balances. |
| 31 | reports | /reports | ReportsPage | components/reports/ReportsPage.tsx | Complete | 47 report types listed with category filter, preview + export (CSV/JSON) to /reports/generate/:id. |
| 32 | alerts | (not in nav nav tree) | AlertsPage | components/alerts/AlertsPage.tsx | Complete | Alerts list with severity filters, acknowledge button. |
| 33 | tickets | /tickets | TicketsPage | components/tickets/TicketsPage.tsx | Complete | Tickets list with table/kanban views, create dialog. |
| 34 | support | /support | SupportPage | components/tickets/SupportPage.tsx | Complete | Support center with request list + detail view + new request form. |
| 35 | settings | (not in nav nav tree) | SettingsPage | components/reports/SettingsPage.tsx | Complete | Full settings with user management, areas, units, roles, auth settings, i18n, system config tabs. |
| 36 | admin-portal | /admin | AdminPortalRedirect | Inline in AppShell.tsx | Placeholder | Shows a redirect card pointing to http://localhost:6262. No actual admin functionality. |
| 37 | bill-cycle | /bill-cycle | BillCyclePage | Inline in AppShell.tsx | Placeholder | Just a title + description paragraph. No functionality. |
| 38 | upload-center | /upload-center | UploadCenterPage | components/upload/UploadCenterPage.tsx | Complete | Full upload center with 9 import types, file upload, history table, error details. |
| 39 | tariff-studio | /tariff-studio | TariffStudioPage | components/tariffs/TariffStudioPage.tsx | Complete | Tariff management: create/edit/delete tariffs, tier editor, simulation dialog. Full CRUD with API calls. |
| 40 | settlements | (not in nav nav tree) | SettlementPage | components/settlement/SettlementPage.tsx | Complete | Settlements + adjustments lists. Create settlement/adjustment dialogs. |
| 41 | workplace | /workplace | WorkplacePage | components/workspace/WorkplacePage.tsx | Partial | Team workspace with quotes, tasks, activity, team progress. Task creation dialog is fake (just toast). Reuses tickets API for tasks. |

---

## Navigation \<-\> Route Cross-Reference

Routes in navigation.ts but NOT in AppShell.tsx renderPage():
- /adjustments (under Billing) - not mapped to any PageKey
- /promises (under Collections) - not mapped
- /recovery (under Collections) - not mapped
- /utility/electricity, /utility/water, /utility/solar, /utility/gas, /utility/chilled-water, /utility/outdoor-unit, /utility/settlement - not mapped
- /reports/operational, /reports/financial, /reports/collections, /reports/utility, /reports/regulatory - all route to the same reports page
- /notifications - not mapped (notifications shown in AlertsPage)
- /rbac, /feature-flags, /audit-logs - not mapped (redirect to admin portal at port 6262)

Routes in AppShell.tsx but NOT in navigation.ts nav tree:
- solar-dashboard - no nav entry
- project-detail, customer-detail, meter-detail, invoice-detail - detail pages not listed in nav
- consumption, water-balance - not listed
- settings - not listed
- settlements - not listed
- sync-gateway - not listed
- kpi-executive, kpi-collections, kpi-utilities - not listed

---

## Status Definitions
- Complete: Full UI, API calls, loading/error handling, real functionality
- Partial: UI exists but part of the data is mocked/hardcoded or key features missing
- Placeholder: Minimal UI (title only or redirect notice), no real functionality
- Empty: Component exists but renders no useful content
- Broken: Component exists but contains hardcoded empty data (e.g., const data = [])
