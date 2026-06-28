# 04 — Feature Map: Page → API → DB → Schema

Every frontend page traced through its API calls to the database.

| Page | API Endpoints | Backend Controller | DB Tables | Target Schema |
|------|--------------|-------------------|-----------|---------------|
| **Dashboard** | GET /meters | meters.controller | Meter | area_{n} |
| | GET /collections/dashboard | collections.controller | Invoice, Payment | area_{n} |
| | GET /collections/aging | collections.controller | Invoice | area_{n} |
| | GET /projects/:pid/dashboard/kpis | dashboard.controller | Project, Meter, Reading | sim_system → core/area |
| | GET /projects/:pid/dashboard/consumption | dashboard.controller | Reading | sim_system → area |
| | GET /projects/:pid/dashboard/activity | dashboard.controller | AuditLog | core |
| **ExecutiveDashboard** | same as Dashboard | — | — | — |
| **ProjectsPage** | CRUD /projects | projects.controller | Project | core |
| **ProjectDetailPage** | GET /projects/:id | projects.controller | Project | core |
| **LocationsPage** | CRUD /projects/:pid/locations | locations.controller | Location, Building, Floor, Unit | core |
| **CustomersPage** | CRUD /projects/:pid/customers | customers.controller | Customer | area_{n} |
| **CustomerDetailPage** | GET /projects/:pid/customers/:id | customers.controller | Customer, CustomerMeter | area_{n} |
| **Customer360Page** | GET /projects/:pid/customers/:id/360 | customers.controller | Customer, CustomerMeter, Reading, Invoice, Payment | area_{n} |
| **MetersPage** | CRUD /meters | meters.controller | Meter, CustomerMeter | area_{n} |
| **MeterDetailPage** | GET /meters/:id | meters.controller | Meter, CustomerMeter | area_{n} |
| **MeterAssignPage** | POST /meters/:id/assign | meters.controller | MeterAssignment | area_{n} |
| **MeterTerminatePage** | POST /meters/:id/terminate | meters.controller | MeterAssignment | area_{n} |
| **ReadingsPage** | CRUD /readings | readings.controller | Reading | area_{n} |
| | GET /readings/review-queue | readings.controller | ReadingReview | area_{n} |
| **ReadingNewPage** | POST /readings | readings.controller | Reading | area_{n} |
| **ConsumptionPage** | GET /readings | readings.controller | Reading | area_{n} |
| **WaterBalancePage** | GET /projects/:pid/water-balance | water-balance.controller | WaterBalance | area_{n} |
| **InvoicesPage** | GET /invoices | billing.controller | Invoice | area_{n} |
| **InvoiceDetailPage** | GET /invoices/:id | billing.controller | Invoice, InvoiceLine | area_{n} |
| **PaymentsPage** | GET /payments | payments.controller | Payment | area_{n} |
| **BalancesPage** | GET /projects/:pid/customers/:id/statement | customers.controller | CustomerLedgerEntry | area_{n} |
| **ReportsPage** | CRUD /reports | reports.controller | ReportTemplate, ReportExport | features |
| **SettingsPage** | GET/PATCH /settings | settings.controller | SystemConfig | core |
| | GET /users | users.controller | CoreUser | core |
| **AlertsPage** | (mock — no API yet) | — | Alert | area_{n} |
| **TicketsPage** | CRUD /tickets | tickets.controller | TroubleTicket | area_{n} |
| **SupportPage** | CRUD /support | support.controller | SupportTicket | area_{n} |
| **UploadCenterPage** | POST /upload/customers,meters | upload.controller | Customer, Meter | area_{n} |
| **TariffStudioPage** | CRUD /tariffs | billing.controller | TariffPlan | features |
| **DatabaseAdminPage** | (read-only DB viewer) | — | All | all schemas |
| **GlobalSearch** | GET /search | search.controller | All | all schemas |
| **Notifications** | GET /notifications | notifications.controller | NotificationQueue | core |

## Feature Flags Status

| Module | Current | Target | Action |
|--------|---------|--------|--------|
| Reports | mock | api | Wire to /reports endpoints |
| Tickets | mock | api | Wire to /tickets endpoints |
| Alerts | mock | api | Create alerts endpoint or use notifications |
| WaterBalance | partial mock | api | Fix data model mismatch |
| Balances | empty data | api | Wire to statement endpoint |
| Consumption | empty data | api | Wire to readings endpoint |
| Solar Wallet | not implemented | full | Port charge_engine.py |
| Solar Invoices | not implemented | full | Build solar invoice gen |
| Sync Meter | not implemented | full | Build SEP2 polling |
| Sync Reading | not implemented | full | Build 40-min cron |
| Chilled Water | not implemented | full | Build BTU billing |
| 15 Area DBs | not replicated | ×15 | Replicate template |
