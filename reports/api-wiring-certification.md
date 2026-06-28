# Phase 11 — API Wiring Certification

**Date:** 2026-06-18
**Method:** Trace each module's UI→Hook→API→Controller→Service→Repository→DB chain

## Customer Module

```
UI Button → useCreateCustomer → apiPost → POST /projects/:pid/customers
                                          → CustomersController.create()
                                          → CustomersService.create()
                                          → prisma.customer.create()
                                          → PostgreSQL
```
**Status:** FULLY WIRED ✅
**Gaps:** None. Create, Read list, Read detail, Update, Delete all trace fully to PostgreSQL.

## Meter Module

### List / Detail
```
UI → useMetersList → apiGet → GET /meters
                             → MetersController.findAll()
                             → MetersService.findAll()
                             → prisma.meter.findMany()
                             → PostgreSQL
```
**Status:** FULLY WIRED ✅

### Replace
```
UI → useReplaceMeter → apiPost → POST /meters/:id/terminate
                                → MetersController.replace()
                                → MetersService.replace()
                                → prisma + transaction
                                → PostgreSQL
```
**Status:** FULLY WIRED ✅

### Terminate
```
UI → useTerminateMeter → apiPost → POST /meters/:id/terminate
                                  → MetersController.terminate()
                                  → MetersService.terminate()
                                  → prisma + transaction
                                  → PostgreSQL
```
**Status:** FULLY WIRED ✅

### Assign
```
UI → no hook exists → no API call → nothing
```
**Status:** NOT WIRED ❌ — MeterAssignPage has zero API hooks. 9-step wizard is entirely mock-driven.

## Sim Cards Module

```
UI → useSimCardsList → apiGet → GET /sim-cards
                               → SimCardsController.findAll()
                               → SimCardsService.findAll()
                               → prisma.simCard.findMany()
                               → PostgreSQL
```
**Status:** Read-only wired ✅. No Create/Update/Delete wired.

## Readings Module

### List / Detail
```
UI → useReadingsList → apiGet → GET /readings
                               → ReadingsController.findAll()
                               → ReadingsService.findAll()
                               → prisma.reading.findMany()
                               → PostgreSQL
```
**Status:** FULLY WIRED ✅

### Create
```
UI → useCreateReading → apiPost → POST /readings
                                 → ReadingsController.create()
                                 → ReadingsService.createReading()
                                 → prisma.reading.create()
                                 → PostgreSQL
```
**Status:** FULLY WIRED ✅

### Review Queue
```
UI → useReviewQueue → apiGet → GET /readings/review-queue
                              → ReadingsController.getReviewQueue()
                              → ReadingsService.listReviewQueue()
                              → prisma.reading.findMany({ where: { status: in [...] }})
                              → PostgreSQL
```
**Status:** WIRED ✅ (approve/reject actions not yet implemented)

## Invoices Module

### List / Detail
```
UI → useInvoicesList → apiGet → GET /invoices
                               → BillingController (mapped route)
                               → ??? (no dedicated service identified)
                               → PostgreSQL
```
**Status:** LIST ONLY WIRED ⚠️

### Generate / Issue / Adjust
```
UI → toast stubs only → NO API CALL
```
**Status:** NOT WIRED ❌

## Payments Module

### List
```
UI → usePaymentsList → apiGet → GET /payments
                               → PaymentsController.findAll()
                               → PaymentsService.findAll()
                               → prisma.payment.findMany()
                               → PostgreSQL
```
**Status:** READ-ONLY WIRED ✅

### Record / Reverse
```
UI → toast stubs only → NO API CALL
```
**Status:** NOT WIRED ❌

## Summary

| Module | Read | Create | Update | Delete | Special |
|--------|------|--------|--------|--------|---------|
| Customers | ✅ | ✅ | ✅ | ✅ | Detail ✅ |
| Meters | ✅ | ❌ | ❌ | ❌ | Replace ✅, Terminate ✅, Assign ❌ |
| Sim Cards | ✅ | ❌ | ❌ | ❌ | |
| Readings | ✅ | ✅ | ❌ | ❌ | Review Queue ✅ |
| Invoices | ✅ | ❌ | ❌ | ❌ | Generate/Issue/Adjust ❌ |
| Payments | ✅ | ❌ | ❌ | ❌ | Reverse ❌ |
| Projects | ✅ | ❌ | ❌ | ❌ | |
| Locations | ✅ | ❌ | ❌ | ❌ | |
| Dashboard | ✅ | — | — | — | KPIs, Consumption, Activity |

## Verdict

**API_CERTIFIED = NO**

Only the Customer module has full CRUD wiring. All other modules are read-only or have stubs in place of real mutations.
