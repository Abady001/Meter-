# Phase 4 — Customer Certification

**Date:** 2026-06-18
**Method:** Live API tests against `POST /projects/:pid/customers`, `GET /projects/:pid/customers`, `GET /projects/:pid/customers/:id`, `PATCH /projects/:pid/customers/:id`, `DELETE /projects/:pid/customers/:id`

## Test Results

| Operation | Endpoint | Result | Evidence |
|-----------|----------|--------|----------|
| CREATE | `POST /projects/:pid/customers` | ✅ 201 | id=`0f3a2ed1`, name=`Test Customer`, type=`individual` |
| LIST | `GET /projects/:pid/customers` | ✅ 200 | count=1, first=`Test Customer` |
| DETAIL | `GET /projects/:pid/customers/:id` | ✅ 200 | name=`Test Customer`, phone=`01234567890` |
| UPDATE | `PATCH /projects/:pid/customers/:id` | ✅ 200 | name=`Updated Customer`, phone=`09876543210` |
| DELETE | `DELETE /projects/:pid/customers/:id` | ✅ 204 | Resource removed |

## DTO Validation

| Field | Valid Values | Status |
|-------|-------------|--------|
| `customerCode` | any string | ✅ enforced |
| `customerType` | `individual`, `company`, `tenant`, `owner` | ✅ enforced |
| `email` | valid email | ✅ enforced |
| `nationalOrCommercialId` | any string | ✅ enforced |

## Chain Verified

```
UI → useCreateCustomer() → apiPost() → POST /api/v1/projects/:pid/customers
                                      → CustomersController.create()
                                      → CustomersService.create()
                                      → prisma.customer.create()
                                      → PostgreSQL ✅
```

## Verdict

**CUSTOMERS_CERTIFIED = YES**
