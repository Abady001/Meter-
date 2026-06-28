# U7 — Database Alignment

**Date**: 2026-06-18

## Page-to-Table Mapping
| Page | Primary Table | Schema | DTO | Service | Controller | Migration | Status |
|------|--------------|--------|-----|---------|------------|-----------|--------|
| Dashboard | — | — | — | DashboardService | DashboardController | — | ✅ |
| Projects | Project | sim_system | ✅ Create/Update/Response | ProjectsService | ProjectsController | ✅ | ✅ |
| Locations | LocationNode | sim_system | ✅ Create/Update/Response | LocationsService | LocationsController | ✅ | ✅ |
| Customers | Customer | sim_system | ✅ Create/Update/Response | CustomersService | CustomersController | ✅ | ✅ |
| Meters | Meter | sim_system | ✅ Create/Update/Response/Assign/Terminate | MetersService | MetersController | ✅ | ✅ |
| SIM Cards | SIMCard | sim_system | ✅ Create/Update/Query/Eligibility | SimCardsService | SimCardsController | ✅ | ✅ |
| Readings | Reading | sim_system | ✅ Create/Response | ReadingsService | ReadingsController | ✅ | ✅ |
| Invoices | Invoice, InvoiceLine, InvoiceAdjustment | sim_system | — | BillingController | BillingController | ✅ | ✅ |
| Payments | Payment, PaymentAllocation | sim_system | ✅ Reverse | PaymentsService | PaymentsController | ✅ | ✅ |
| Tariffs | TariffPlan | sim_system | — | TariffService | BillingController | ✅ | ✅ |
| Periods | BillingPeriod | sim_system | — | PeriodService | BillingController | ✅ | ✅ |
| Notifications | Notification | sim_system | — | NotificationsService | NotificationsController | ✅ | ✅ |
| Audit | AuditLog | sim_system | — | AuditService | — (interceptor) | ✅ | ✅ |

## Missing Entities (for target architecture)
| Target Feature | Missing Tables | Status |
|---------------|---------------|--------|
| Solar wallet | EXISTS (features schema) | No service layer |
| Chilled water | EXISTS (features schema) | No service layer |
| Gas meters | AreaMeterType enum only | No backend |
| User management | CoreUser (core schema) | No service layer |
| Role management | CoreRole (core schema) | Not seeded |

## Conclusion
All active pages have proper database backing. Solar/chilled water have schema-only support.
