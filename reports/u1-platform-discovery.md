# U1 — Complete Platform Discovery

**Date**: 2026-06-18
**Method**: Source code scan of all 25 page components

## Page Inventory

| # | Page Key | Component | Route | Module | Tabs | Dialogs | API | Mock | Status |
|---|----------|-----------|-------|--------|------|---------|-----|------|--------|
| 1 | login | LoginPage | / | Auth | — | — | dev-login | mock-auth | HYBRID |
| 2 | dashboard | DashboardPage | /dashboard | Dashboard | — | — | dashboard APIs | mockKPIs | HYBRID |
| 3 | projects | ProjectsPage | /projects | Projects | — | ProjectForm, DeleteConfirm | useProjectsList | — | API_ONLY |
| 4 | project-detail | ProjectDetailPage | /projects/:id | Projects | Overview,Locations,Customers,Meters,Invoices | — | useProjectDetail | mockBuildings,Units,Customers,Meters,Readings | HYBRID |
| 5 | locations | LocationsPage | /locations | Projects | — | CreateBuilding,CreateUnit,Edit,Delete | useLocationsList | — | API_ONLY |
| 6 | customers | CustomersPage | /customers | Customers | — | CreateCustomer,EditCustomer,DeleteConfirm | useCustomersList | — | API_ONLY |
| 7 | customer-detail | CustomerDetailPage | /customers/:id | Customers | Overview,Units,Meters,Invoices,Payments,Balance,Tickets,Notes | — | useCustomerDetail | mockInvoices,Meters,Units | HYBRID |
| 8 | meters | MetersPage | /meters | Meters | — | DeleteConfirm | useMetersList | — | API_ONLY |
| 9 | meter-detail | MeterDetailPage | /meters/:id | Meters | Overview,Readings,Assignments,SIM/IP,Invoices,Alerts,Maintenance | — | useMeterDetail | mockReadings,SimCards,Invoices | HYBRID |
| 10 | meter-assign | MeterAssignPage | /meters/assign | Meters | — | 8-step wizard | — | ALL mock | MOCK_ONLY |
| 11 | meter-replace | MeterReplacePage | /meters/replace | Meters | — | — | useReplaceMeter | — | API_ONLY |
| 12 | meter-terminate | MeterTerminatePage | /meters/terminate | Meters | — | — | useTerminateMeter | mockSimCards,Customers | HYBRID |
| 13 | sim-cards | SimCardsPage | /sim-cards | SIM | — | — | useSimCardsList | — | API_ONLY |
| 14 | readings | ReadingsPage | /readings | Readings | — | — | useReadingsList | — | API_ONLY |
| 15 | reading-new | ReadingNewPage | /readings/new | Readings | — | — | useCreateReading | mockProjects,Meters,Customers,Units | HYBRID |
| 16 | consumption | ConsumptionPage | /consumption | Billing | Daily/Monthly/Custom | — | useConsumptionTrend | mockConsumptionData | HYBRID |
| 17 | water-balance | WaterBalancePage | /water-balance | Billing | — | — | useWaterBalance | mockWaterBalance,Projects | HYBRID |
| 18 | invoices | InvoicesPage | /invoices | Billing | — | — | useInvoicesList | — | API_ONLY |
| 19 | invoice-detail | InvoiceDetailPage | /invoices/:id | Billing | — | — | useInvoiceDetail | — | API_ONLY |
| 20 | payments | PaymentsPage | /payments | Billing | — | RecordPayment dialog | usePaymentsList | mockCustomers | HYBRID |
| 21 | balances | BalancesPage | /balances | Billing | — | — | — | mockBalances | HYBRID |
| 22 | reports | ReportsPage | /reports | Reports | All/Billing/Operations/System | — | — | mockReports | MOCK_ONLY |
| 23 | settings | SettingsPage | /settings | Admin | General,Team,Tariff,Billing,Reading,Water,Notifications,Theme | — | — | mockUsers | MOCK_ONLY |
| 24 | alerts | AlertsPage | /alerts | Alerts | — | — | — | mockAlerts | MOCK_ONLY |
| 25 | tickets | TicketsPage | /tickets | Tickets | Kanban/Table | CreateTicket | — | mockTickets | MOCK_ONLY |
| 26 | support | SupportPage | /support | Support | — | — | — | mockCustomers,Meters,Invoices,Payments,Tickets | MOCK_ONLY |

## Summary Statistics
| Metric | Count |
|--------|-------|
| Total page components | 25 |
| Total page keys | 26 (login + 25 others) |
| API_ONLY | 8 |
| HYBRID | 10 |
| MOCK_ONLY | 7 |
| Total tabs across all pages | ~30 |
| Total dialogs | ~10 |
| Total wizards | 1 (meter-assign, 8-step) |

## Missing Pages (for target architecture)
| Target Domain | Missing Pages |
|--------------|--------------|
| Tariffs | No dedicated TariffsPage |
| Solar | No SolarPage |
| Chilled Water | No ChilledWaterPage |
| Collections | No Collections dashboard |
| Aging | No Aging report page |
| Statements | No Statement page |
| Audit | No Audit log viewer |
| Users | No User management page |
| Roles | No Role management page |
| Notifications | Notification dropdown exists, no full page |
| Gas | No Gas page |
