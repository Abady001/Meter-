# Frontend-Backend Master Matrix — v2

**Generated:** 2026-06-25
**Source:** audit/frontend-backend-matrix.md + AppShell.tsx + navigation.ts + controller scan
**Legend:** ✅ Integrated | ⚠️ Mock/Partial | ❌FE Missing | ❌BE Missing | ❌Both Missing

---

## 1. AUTHENTICATION (Pages: 2, API calls: 7)

| Page Key | Nav Tab | Component | API Call | Controller | Endpoint | Method | DTO | Required Role | Status |
|---|---|---|---|---|---|---|---|---|---|
| /login | — | LoginPage | authClient.login | AuthController | /api/v1/auth/login | POST | LoginDto | none | ✅ Integrated |
| /register | — | register/page.tsx | authClient.register | AuthController | /api/v1/auth/register | POST | RegisterDto | none | ✅ Integrated |
| — | — | api/auth.ts | authClient.refresh | AuthController | /api/v1/auth/refresh | POST | RefreshTokenDto | any | ✅ Integrated |
| — | — | api/auth.ts | authClient.logout | AuthController | /api/v1/auth/logout | POST | — | any | ✅ Integrated |
| — | — | api/auth.ts | authClient.me | AuthController | /api/v1/auth/me | GET | — | any | ✅ Integrated |
| — | — | — | (dev login) | AuthController | /api/v1/auth/dev-login | POST | DevLoginDto | dev | ⚠️ Dev only |
| — | — | — | — | AuthController | /api/v1/auth/csrf-token | GET | — | any | ✅ Present |

---

## 2. DASHBOARD (Pages: 8, API calls: 7)

| Page Key | Nav Tab | Component | API Call | Controller | Endpoint | Method | DTO | Required Role | Status |
|---|---|---|---|---|---|---|---|---|---|
| dashboard | Dashboard | DashboardPage | — | DashboardController | /api/v1/projects/:pid/dashboard/kpis | GET | — | super_admin+ | ⚠️ Mock |
| executive-dashboard | Dashboard | ExecutiveDashboard | — | KpiController | /api/v1/kpi/executive | GET | — | super_admin+ | ⚠️ Mock |
| operations-dashboard | Dashboard | OperationsDashboard | — | — | — | — | — | super_admin+ | ❌ BE Missing |
| billing-dashboard | Dashboard | BillingDashboard | — | — | — | — | — | super_admin+ | ❌ BE Missing |
| collections-dashboard-plus | Dashboard | CollectionsDashboardPlus | — | CollectionsController | /api/v1/collections/dashboard | GET | — | super_admin+ | ⚠️ Mock |
| utility-dashboard | Dashboard | UtilityDashboard | — | — | — | — | — | super_admin+ | ❌ BE Missing |
| kpi-executive | Dashboard | KpiExecutiveDashboard | — | KpiController | /api/v1/kpi/executive | GET | — | super_admin+ | ⚠️ Mock |
| kpi-collections | Dashboard | KpiCollectionsDashboard | — | KpiController | /api/v1/kpi/collections | GET | — | super_admin+ | ⚠️ Mock |
| kpi-utilities | Dashboard | KpiUtilitiesDashboard | — | KpiController | /api/v1/kpi/utilities | GET | — | super_admin+ | ⚠️ Mock |

---

## 3. CUSTOMERS (Pages: 3, API calls: 8)

| Page Key | Nav Tab | Component | API Call | Controller | Endpoint | Method | DTO | Required Role | Status |
|---|---|---|---|---|---|---|---|---|---|
| customers | Customers | CustomersPage | useCustomersList | CustomersController | /api/v1/projects/:pid/customers | GET | — | super_admin+ | ⚠️ Mock |
| customer-detail | Customers | CustomerDetailPage | useCustomerDetail | CustomersController | /api/v1/projects/:pid/customers/:id | GET | — | super_admin+ | ⚠️ Mock |
| customer-detail (create) | Customers | CustomerDetailPage | createMutation | CustomersController | /api/v1/projects/:pid/customers | POST | CreateCustomerDto | super_admin+ | ✅ BE exists, FE mock |
| customer-detail (360) | Customers | (no FE) | — | CustomersController | /api/v1/projects/:pid/customers/:id/360 | GET | — | super_admin+ | ❌ FE Missing |
| customer-detail (statement) | Customers | (no FE) | — | CustomersController | /api/v1/projects/:pid/customers/:id/statement | GET | — | super_admin+ | ❌ FE Missing |
| customer-detail (transfer) | Customers | OwnershipTab | executeTransfer | CustomersController | /api/v1/projects/:pid/customers/:id/transfer-ownership | POST | TransferOwnershipDto | super_admin+ | ✅ Integrated |
| balances | Customers | BalancesPage | — | CustomersController | /api/v1/projects/:pid/customers/:id/statement | GET | — | super_admin+ | ❌ FE Missing |
| downloads | Customers | (no page) | — | DownloadsController | /api/v1/downloads/* | — | — | super_admin+ | ❌ FE Missing |

---

## 4. PROJECTS & LOCATIONS (Pages: 3, API calls: 4)

| Page Key | Nav Tab | Component | API Call | Controller | Endpoint | Method | DTO | Required Role | Status |
|---|---|---|---|---|---|---|---|---|---|
| projects | Projects | ProjectsPage | useProjectsList | ProjectsController | /api/v1/projects | GET | — | super_admin+ | ⚠️ Mock |
| projects | Projects | ProjectFormDialog | createMutation | ProjectsController | /api/v1/projects | POST | CreateProjectDto | super_admin+ | ⚠️ Mock |
| projects | Projects | ProjectFormDialog | updateMutation | ProjectsController | /api/v1/projects/:id | PATCH | UpdateProjectDto | super_admin+ | ⚠️ Mock |
| project-detail | Projects | ProjectDetailPage | useProjectDetail | ProjectsController | /api/v1/projects/:id | GET | — | super_admin+ | ⚠️ Mock |
| locations | Units | LocationsPage | useLocationsList | LocationsController | /api/v1/projects/:pid/locations | GET | — | super_admin+ | ⚠️ Mock |
| locations | Units | LocationsPage | handleSave | LocationsController | /api/v1/projects/:pid/locations | POST/PATCH | CreateLocationDto | super_admin+ | ⚠️ Mock |
| locations | Units | LocationsPage | deleteMutation | LocationsController | /api/v1/projects/:pid/locations/:id | DELETE | — | super_admin+ | ⚠️ Mock |

---

## 5. METERS (Pages: 4, API calls: 7)

| Page Key | Nav Tab | Component | API Call | Controller | Endpoint | Method | DTO | Required Role | Status |
|---|---|---|---|---|---|---|---|---|---|
| meters | Meters | MetersPage | useMetersList | MetersController | /api/v1/meters | GET | — | super_admin+ | ⚠️ Mock |
| meter-detail | Meters | MeterDetailPage | — | MetersController | /api/v1/meters/:id | GET | — | super_admin+ | ⚠️ Mock |
| meters (create) | Meters | (dialog) | — | MetersController | /api/v1/meters | POST | CreateMeterDto | super_admin+ | ✅ BE exists, FE mock |
| meter-assign | Meters | MeterAssignPage | assignMutation | MetersController | /api/v1/meters/:meterId/assign | POST | MeterAssignDto | super_admin+ | ⚠️ Mock |
| meter-replace | Meters | MeterReplacePage | replaceMutation | — | — | — | — | super_admin+ | ❌ BE Missing |
| meter-terminate | Meters | MeterTerminatePage | terminateMutation | MetersController | /api/v1/meters/:meterId/terminate | POST | MeterTerminateDto | super_admin+ | ⚠️ Mock |
| sim-cards | (no nav) | SimCardsPage | — | SimCardsController | /api/v1/sim-cards | GET/POST | SimCardDto | super_admin+ | ❌ FE Missing |

---

## 6. READINGS (Pages: 2, API calls: 7)

| Page Key | Nav Tab | Component | API Call | Controller | Endpoint | Method | DTO | Required Role | Status |
|---|---|---|---|---|---|---|---|---|---|
| readings | Readings | ReadingsPage | useReadingsList | ReadingsController | /api/v1/readings | GET | — | super_admin+ | ⚠️ Mock |
| reading-new | Readings | ReadingNewPage | createMutation | ReadingsController | /api/v1/readings | POST | CreateReadingDto | super_admin+ | ⚠️ Mock |
| — | — | (no FE) | — | ReadingsController | /api/v1/readings/review-queue | GET | — | super_admin+ | ✅ BE, ❌ FE |
| — | — | (no FE) | — | ReadingsController | /api/v1/readings/:id/approve | POST | — | super_admin+ | ✅ BE, ❌ FE |
| — | — | (no FE) | — | ReadingsController | /api/v1/readings/:id/reject | POST | — | super_admin+ | ✅ BE, ❌ FE |
| water-balance | — | WaterBalancePage | — | WaterBalanceController | /api/v1/projects/:pid/water-balance | GET | — | super_admin+ | ✅ BE, ❌ FE |

---

## 7. INVOICES & BILLING (Pages: 4, API calls: 10)

| Page Key | Nav Tab | Component | API Call | Controller | Endpoint | Method | DTO | Required Role | Status |
|---|---|---|---|---|---|---|---|---|---|
| invoices | Billing | InvoicesPage | useInvoicesList | BillingController | /api/v1/billing/invoices | GET | — | super_admin+ | ⚠️ Mock |
| invoice-detail | Billing | InvoiceDetailPage | issueMutation | BillingController | /api/v1/billing/invoices/:id | GET | — | super_admin+ | ⚠️ Mock |
| — | — | (no FE) | — | BillingController | /api/v1/billing/invoices/generate | POST | — | super_admin+ | ✅ BE, ❌ FE |
| — | — | (no FE) | — | BillingController | /api/v1/billing/invoices/:id/issue | POST | — | super_admin+ | ✅ BE, ❌ FE |
| — | — | (no FE) | — | BillingController | /api/v1/billing/invoices/:id/cancel | POST | — | super_admin+ | ✅ BE, ❌ FE |
| — | — | (no FE) | — | BillingController | /api/v1/billing/invoices/:id/adjustments | POST | — | super_admin+ | ✅ BE, ❌ FE |
| adjustments | Billing | (no page) | — | — | — | — | — | super_admin+ | ❌ Both Missing |
| bill-cycle | Bill Cycle | BillCyclePage (inline) | — | BillCycleController | /api/v1/bill-cycle | GET/POST | — | super_admin+ | ⚠️ Placeholder |
| — | — | (no FE) | — | InvoicesController | /api/v1/invoices/:id/pdf | GET | — | super_admin+ | ✅ BE, ❌ FE |
| — | — | (no FE) | — | InvoicesController | /api/v1/invoices/batch-download | POST | — | super_admin+ | ✅ BE, ❌ FE |

---

## 8. PAYMENTS (Pages: 2, API calls: 5)

| Page Key | Nav Tab | Component | API Call | Controller | Endpoint | Method | DTO | Required Role | Status |
|---|---|---|---|---|---|---|---|---|---|
| payments | Collections | PaymentsPage | createPayment | PaymentsController | /api/v1/payments | POST | CreatePaymentDto | super_admin+ | ⚠️ Mock |
| — | — | (no FE) | — | PaymentsController | /api/v1/payments | GET | — | super_admin+ | ✅ BE, ❌ FE |
| — | — | (no FE) | — | PaymentsController | /api/v1/payments/:id/reverse | POST | — | super_admin+ | ✅ BE, ❌ FE |
| — | — | (no FE) | — | CollectionsController | /api/v1/collections/payments/:id/receipt | GET | — | super_admin+ | ✅ BE, ❌ FE |

---

## 9. TARIFFS (Pages: 1, API calls: 4)

| Page Key | Nav Tab | Component | API Call | Controller | Endpoint | Method | DTO | Required Role | Status |
|---|---|---|---|---|---|---|---|---|---|
| tariff-studio | Tariff Studio | TariffStudioPage | createMutation | TariffStudioController | /api/v1/billing/tariffs | GET/POST | TariffDto | super_admin+ | ⚠️ Mock |
| — | — | (no FE) | — | TariffStudioController | /api/v1/billing/tariffs/simulate | POST | SimulationDto | super_admin+ | ✅ BE, ❌ FE |
| — | — | (no FE) | — | PeriodService | /api/v1/billing/periods | GET/POST | BillingPeriodDto | super_admin+ | ✅ BE, ❌ FE |

---

## 10. COLLECTIONS (Pages: 3, API calls: 2)

| Page Key | Nav Tab | Component | API Call | Controller | Endpoint | Method | DTO | Required Role | Status |
|---|---|---|---|---|---|---|---|---|---|
| collections-dashboard-plus | Collections | CollectionsDashboardPlus | — | CollectionsController | /api/v1/collections/dashboard | GET | — | super_admin+ | ⚠️ Mock |
| promises | Collections | (no page) | — | — | — | — | — | super_admin+ | ❌ Both Missing |
| recovery | Collections | (no page) | — | — | — | — | — | super_admin+ | ❌ Both Missing |
| — | — | (no FE) | — | CollectionsController | /api/v1/collections/aging | GET | — | super_admin+ | ✅ BE, ❌ FE |

---

## 11. UTILITIES & SOLAR (Pages: 4, API calls: 6)

| Page Key | Nav Tab | Component | API Call | Controller | Endpoint | Method | DTO | Required Role | Status |
|---|---|---|---|---|---|---|---|---|---|
| utility/electricity | Utilities | (no page) | — | — | — | — | — | super_admin+ | ❌ Both Missing |
| utility/water | Utilities | (no page) | — | — | — | — | — | super_admin+ | ❌ Both Missing |
| utility/solar | Utilities | SolarDashboard | — | SolarController | /api/v1/solar/dashboard | GET | — | super_admin+ | ⚠️ Mock |
| — | — | (no FE) | — | SolarController | /api/v1/solar/wallet/:customerId | GET | — | super_admin+ | ✅ BE, ❌ FE |
| — | — | (no FE) | — | SolarController | /api/v1/solar/readings/:meterId | GET | — | super_admin+ | ✅ BE, ❌ FE |
| — | — | (no FE) | — | SolarController | /api/v1/solar/statement/:customerId | GET | — | super_admin+ | ✅ BE, ❌ FE |
| utility/gas | Utilities | (no page) | — | — | — | — | — | super_admin+ | ❌ Both Missing |
| utility/chilled-water | Utilities | (no page) | — | ChilledWaterController | /api/v1/chilled-water/* | — | — | super_admin+ | ❌ FE Missing |
| utility/outdoor-unit | Utilities | (no page) | — | — | — | — | — | super_admin+ | ❌ Both Missing |
| utility/settlement | Utilities | SettlementPage | createMutation | SettlementController | /api/v1/settlement | GET/POST | SettlementDto | super_admin+ | ⚠️ Mock |

---

## 12. REPORTS (Pages: 1, API calls: 6)

| Page Key | Nav Tab | Component | API Call | Controller | Endpoint | Method | DTO | Required Role | Status |
|---|---|---|---|---|---|---|---|---|---|
| reports | Reports | ReportsPage | useReportsList | ReportsController | /api/v1/reports | GET | — | super_admin+ | ⚠️ Mock |
| — | — | (no FE) | — | ReportsController | /api/v1/reports/generate/:type | GET | — | super_admin+ | ✅ BE, ❌ FE |
| reports/operational | Reports | (no page) | — | — | — | — | — | super_admin+ | ❌ Both Missing |
| reports/financial | Reports | (no page) | — | — | — | — | — | super_admin+ | ❌ Both Missing |
| reports/collections | Reports | (no page) | — | — | — | — | — | super_admin+ | ❌ Both Missing |
| reports/utility | Reports | (no page) | — | — | — | — | — | super_admin+ | ❌ Both Missing |
| reports/regulatory | Reports | (no page) | — | — | — | — | — | super_admin+ | ❌ Both Missing |

---

## 13. SETTINGS & UPLOADS & DOWNLOADS (Pages: 2, API calls: 9)

| Page Key | Nav Tab | Component | API Call | Controller | Endpoint | Method | DTO | Required Role | Status |
|---|---|---|---|---|---|---|---|---|---|
| settings | — | AdminPortalRedirect | — | SettingsController | /api/v1/settings | GET/PATCH | SettingsDto | super_admin+ | ⚠️ Mock |
| upload-center | Upload Center | UploadCenterPage | uploadMutation | UploadController | /api/v1/upload/file | POST | UploadDto | super_admin+ | ⚠️ Mock |
| — | — | (no FE) | — | UploadController | /api/v1/upload/history/:entityType | GET | — | super_admin+ | ✅ BE, ❌ FE |
| — | — | (no FE) | — | UploadController | /api/v1/upload/template/:type | GET | — | super_admin+ | ✅ BE, ❌ FE |
| — | — | (no FE) | — | UploadController | /api/v1/upload/customers | POST | — | super_admin+ | ✅ BE, ❌ FE |
| — | — | (no FE) | — | UploadController | /api/v1/upload/meters | POST | — | super_admin+ | ✅ BE, ❌ FE |
| — | — | (no FE) | — | DownloadsController | /api/v1/downloads/table/csv | POST | — | super_admin+ | ✅ BE, ❌ FE |
| — | — | (no FE) | — | DownloadsController | /api/v1/downloads/table/pdf | POST | — | super_admin+ | ✅ BE, ❌ FE |

---

## 14. SUPPORT & TICKETS (Pages: 3, API calls: 2)

| Page Key | Nav Tab | Component | API Call | Controller | Endpoint | Method | DTO | Required Role | Status |
|---|---|---|---|---|---|---|---|---|---|
| tickets | Tickets | TicketsPage | createMutation | TicketsController | /api/v1/tickets | GET/POST | TicketDto | super_admin+ | ⚠️ Mock |
| support | Support | SupportPage | createMutation | SupportController | /api/v1/support | GET/POST | SupportDto | support+ | ⚠️ Mock |
| notifications | Notifications | (no page) | — | NotificationsController | /api/v1/notifications | GET | — | super_admin+ | ❌ FE Missing |

---

## 15. WORKPLACE & SYNC (Pages: 2, API calls: 0)

| Page Key | Nav Tab | Component | API Call | Controller | Endpoint | Method | DTO | Required Role | Status |
|---|---|---|---|---|---|---|---|---|---|
| workplace | Workplace | WorkplacePage | — | — | — | — | — | super_admin+ | ❌ BE Missing |
| sync-gateway | Administration | SyncGatewayPage | checkAll | — | — | — | — | super_admin+ | ❌ BE Missing |

---

## 16. ADMINISTRATION (Pages: 4, API calls: 4)

| Page Key | Nav Tab | Component | API Call | Controller | Endpoint | Method | DTO | Required Role | Status |
|---|---|---|---|---|---|---|---|---|---|
| rbac | Administration | (no page) | — | AdminController | /api/v1/admin/* | — | — | super_admin | ❌ FE Missing |
| feature-flags | Administration | (no page) | — | — | — | — | — | super_admin | ❌ Both Missing |
| audit-logs | Administration | (no page) | — | AdminController | /api/v1/admin/tables | GET | — | super_admin | ❌ FE Missing |
| sync-gateway | Administration | SyncGatewayPage | — | — | — | — | — | super_admin | ❌ BE Missing |
| — | — | (no FE) | — | UsersController | /api/v1/users | GET/POST | UserDto | super_admin | ❌ FE Missing |
| — | — | (no FE) | — | AreasController | /api/v1/areas | GET | — | super_admin | ❌ FE Missing |
| — | — | (no FE) | — | RegistrationController | /api/v1/registration/requests | GET | — | super_admin | ❌ FE Missing |

---

## 17. ADDITIONAL APP-SHELL PAGES (not in sidebar nav)

| Page Key | Component | API Calls | Status |
|---|---|---|---|
| solar-dashboard | SolarDashboard (duplicate) | SolarController /api/v1/solar/dashboard | ⚠️ Mock |
| consumption | ConsumptionPage | — | State-only |
| water-balance | WaterBalancePage | — | ❌ FE no API wire |
| alerts | AlertsPage | markRead mutation | Working |
| settlements | SettlementPage (duplicate) | SettlementController | ⚠️ Mock |

---

## 18. MASTER SUMMARY

| Metric | Count |
|---|---|
| Total frontend page keys (AppShell) | 41 |
| Total sidebar navigation routes | 40 |
| Total backend controllers | 34 |
| Total backend services | 44 |
| Total Prisma models | 128 |
| Pages with live API integration | 5 |
| Pages using mock data | 25 |
| Pages with NO frontend component | 17 |
| Backend endpoints with NO frontend | 65+ |
| Missing both FE + BE | ~12 |
| Integration coverage | ~15% |
