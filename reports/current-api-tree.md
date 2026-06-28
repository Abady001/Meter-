# METER VERSE — API TREE

**Date:** 2026-06-25

---

## AUTH (`/api/v1/auth`)

| Method | Path | Auth | Roles |
|--------|------|------|-------|
| POST | /login | No | - |
| GET | /me | JWT | - |
| POST | /logout | JWT | - |

## CUSTOMERS (`/api/v1/customers`)

| Method | Path | Auth | Roles |
|--------|------|------|-------|
| GET | / | JWT | admin, viewer, operator |
| GET | /:id | JWT | admin, viewer, operator |
| POST | / | JWT | admin |
| PUT | /:id | JWT | admin |
| DELETE | /:id | JWT | admin |
| GET | /search | JWT | admin, viewer, operator |
| GET | /:id/ledger | JWT | admin, viewer |
| GET | /:id/meters | JWT | admin, viewer, operator |
| POST | /:pid/customers/:id/transfer-ownership | JWT | admin |

## METERS (`/api/v1/meters`)

| Method | Path | Auth | Roles |
|--------|------|------|-------|
| GET | / | JWT | admin, viewer, operator |
| GET | /:id | JWT | admin, viewer, operator |
| POST | / | JWT | admin |
| PUT | /:id | JWT | admin |
| DELETE | /:id | JWT | admin |

## INVOICES (`/api/v1/invoices`)

| Method | Path | Auth | Roles |
|--------|------|------|-------|
| GET | / | JWT | admin, viewer, operator |
| GET | /:id | JWT | admin, viewer, operator |
| POST | / | JWT | admin |
| PUT | /:id | JWT | admin |

## PAYMENTS (`/api/v1/payments`)

| Method | Path | Auth | Roles |
|--------|------|------|-------|
| GET | / | JWT | admin, viewer, operator |
| POST | / | JWT | admin, cashier |
| GET | /:id | JWT | admin, viewer, operator |

## WALLET (`/api/v1/wallet`)

| Method | Path | Auth | Roles |
|--------|------|------|-------|
| GET | /:customerId | JWT | admin, viewer |
| POST | /:customerId/credit | JWT | admin |
| POST | /:customerId/debit | JWT | admin |
| POST | /:customerId/transfer | JWT | admin |

## KPI (`/api/v1/kpi`)

| Method | Path | Auth | Roles |
|--------|------|------|-------|
| GET | /executive | JWT | admin, viewer |
| GET | /collections | JWT | admin, viewer |
| GET | /utilities | JWT | admin, viewer |

## REPORTS (`/api/v1/reports`)

| Method | Path | Auth | Roles |
|--------|------|------|-------|
| GET | / | JWT | admin, viewer |
| GET | /:type/generate | JWT | admin, viewer |
| GET | /:type/export/:format | JWT | admin, viewer |

## AREAS (`/api/v1/areas`)

| Method | Path | Auth | Roles |
|--------|------|------|-------|
| GET | / | JWT | admin, viewer |
| GET | /:id | JWT | admin, viewer |
| POST | / | JWT | admin |
| PUT | /:id | JWT | admin |

## PROJECTS (`/api/v1/projects`)

| Method | Path | Auth | Roles |
|--------|------|------|-------|
| GET | / | JWT | admin, viewer |
| GET | /:id | JWT | admin, viewer |
| POST | / | JWT | admin |
| PUT | /:id | JWT | admin |

## USERS (`/api/v1/users`)

| Method | Path | Auth | Roles |
|--------|------|------|-------|
| GET | / | JWT | admin |
| GET | /:id | JWT | admin |
| POST | / | JWT | admin |
| PUT | /:id | JWT | admin |
| DELETE | /:id | JWT | super_admin |

## ROLES (`/api/v1/roles`)

| Method | Path | Auth | Roles |
|--------|------|------|-------|
| GET | / | JWT | admin |
| POST | / | JWT | admin |

## SYNC (`/api/v1/sync`)

| Method | Path | Auth | Roles |
|--------|------|------|-------|
| GET | /gateways/status | JWT | admin |
| GET | /:area/meters | JWT | admin |
| GET | /:area/customers | JWT | admin |

## COLLECTIONS (`/api/v1/collections`)

| Method | Path | Auth | Roles |
|--------|------|------|-------|
| GET | /aging | JWT | admin, viewer |
| GET | /recovery | JWT | admin |
| GET | /promises | JWT | admin, viewer |

## SETTLEMENTS (`/api/v1/settlements`)

| Method | Path | Auth | Roles |
|--------|------|------|-------|
| GET | / | JWT | admin |
| POST | / | JWT | admin |

## SOLAR (`/api/v1/solar`)

| Method | Path | Auth | Roles |
|--------|------|------|-------|
| GET | / | JWT | admin, viewer |
| POST | / | JWT | admin |

## UNITS (`/api/v1/units`)

| Method | Path | Auth | Roles |
|--------|------|------|-------|
| GET | / | JWT | admin, viewer |
| POST | / | JWT | admin |
| PUT | /:id | JWT | admin |
