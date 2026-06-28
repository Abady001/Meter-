# U6 — API Alignment

**Date**: 2026-06-18
**Method**: Trace every UI action to its API endpoint

## API Coverage by Page
| Page | UI Actions | Backend Endpoint | Status |
|------|-----------|-----------------|--------|
| Dashboard KPIs | 3 | GET /projects/:pid/dashboard/kpis/consumption/activity | ✅ Aligned |
| Projects List | useProjectsList | GET /projects | ✅ |
| Project Create | useCreateProject | POST /projects | ✅ |
| Project Update | useUpdateProject | PATCH /projects/:id | ✅ |
| Project Delete | useDeleteProject | DELETE /projects/:id | ✅ |
| Locations List | useLocationsList | GET /projects/:pid/locations | ✅ |
| Location Create | useCreateLocation | POST /projects/:pid/locations | ✅ |
| Location Update | useUpdateLocation | PATCH /projects/:pid/locations/:id | ✅ |
| Location Delete | useDeleteLocation | DELETE /projects/:pid/locations/:id | ✅ |
| Customers List | useCustomersList | GET /projects/:pid/customers | ✅ |
| Customer Create | useCreateCustomer | POST /projects/:pid/customers | ✅ |
| Customer Update | useUpdateCustomer | PATCH /projects/:pid/customers/:id | ✅ |
| Customer Delete | useDeleteCustomer | DELETE /projects/:pid/customers/:id | ✅ |
| Meters List | useMetersList | GET /meters | ✅ |
| Meter Create | useCreateMeter | POST /meters | ✅ |
| Meter Assign | useCreateAssignment | POST /meters/:id/assign | ✅ |
| Meter Replace | useReplaceMeter | POST /meters/:id/terminate + POST /meters/:id/assign | ✅ |
| Meter Terminate | useTerminateMeter | POST /meters/:id/terminate | ✅ |
| Readings List | useReadingsList | GET /readings | ✅ |
| Reading Create | useCreateReading | POST /readings | ✅ |
| Invoices List | useInvoicesList | GET /invoices | ✅ |
| Invoice Detail | useInvoiceDetail | GET /invoices/:id | ✅ |
| Invoice Generate | POST | POST /invoices/generate | ✅ (FIXED) |
| Invoice Issue | useIssueInvoice | POST /invoices/:id/issue | ✅ (WIRED) |
| Payments List | usePaymentsList | GET /payments | ✅ |
| SIM Cards List | useSimCardsList | GET /sim-cards | ✅ |
| Tariffs List | apiGet | GET /tariffs | ✅ |
| Periods List | apiGet | GET /periods | ✅ |
| Water Balance | useWaterBalance | GET /projects/:pid/water-balance | ✅ |

## Gap: Missing APIs
| Page Action | Missing Endpoint |
|------------|-----------------|
| Invoice Edit | PATCH /invoices/:id |
| Invoice Cancel | POST /invoices/:id/cancel |
| Invoice Download | GET /invoices/:id/pdf |
| Payment Record | POST /payments |
| Payment Reverse | POST /payments/:id/reverse |
| Payment Edit | PATCH /payments/:id |
| Payment Delete | DELETE /payments/:id |
| Report Download | GET /reports/:id/export |
| SmartTable Export | GET /table/export |
| Notification List | GET /notifications ✅ (NOW EXISTS) |
| Notification Mark Read | PATCH /notifications/:id/read ✅ (NOW EXISTS) |
| User Management | Not implemented |
| Role Management | Not implemented |

## Conclusion
All existing API endpoints are properly aligned with their UI actions. Gaps are in areas where endpoints don't exist yet (downloads, payment mutations, user management).
