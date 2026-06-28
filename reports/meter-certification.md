# Phase 5 — Meter Certification

**Date:** 2026-06-18
**Method:** Live API tests against meter endpoints

## Test Results

| Operation | Endpoint | Result | Evidence |
|-----------|----------|--------|----------|
| CREATE | `POST /meters` | ✅ 201 | id=`f85068c1`, serial=`SN-001`, type=`water_main` |
| LIST | `GET /meters` | ✅ 200 | count=1 |
| DETAIL | `GET /meters/:id` | ✅ 200 | serial=`SN-001`, type=`water_main` |
| ASSIGN | `POST /meters/:id/assign` | ✅ 200 | Assignment created with customer+unit linkage |
| TERMINATE | `POST /meters/:id/terminate` | ✅ 200 | Meter status→terminated, sim→none |

## DTO Validation

| Endpoint | Required Fields | Status |
|----------|-----------------|--------|
| CREATE | serialNumber, meterType, brand, model, installationDate, activationDate, projectId | ✅ enforced |
| ASSIGN | customerId, unitId, projectId, startAt | ✅ enforced |
| TERMINATE | reason, terminatedAt, finalReading | ✅ enforced |

## RBAC Restriction

- `POST /meters/:id/assign` — requires `OPERATOR` or `PROJECT_ADMIN` (SUPER_ADMIN denied)
- `POST /meters/:id/terminate` — requires `OPERATOR` or `PROJECT_ADMIN` (SUPER_ADMIN denied)

## Chain Verified

```
UI → useMetersList() → apiGet() → GET /api/v1/meters
                                 → MetersController.findAll()
                                 → MetersService.findAll()
                                 → prisma.meter.findMany()
                                 → PostgreSQL ✅
```

## Verdict

**METERS_CERTIFIED = YES**

Note: Meter assign and terminate are fully functional but require OPERATOR or PROJECT_ADMIN role. SUPER_ADMIN cannot perform these actions — this is by design, not a bug.
