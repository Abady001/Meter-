# STAB-01: Units Certification

**Date:** 2026-06-18
**Method:** Live API tests + frontend verification

## Test Results

| Operation | Endpoint | Result | Evidence |
|-----------|----------|--------|----------|
| CREATE Building | `POST /projects/:pid/locations` | ✅ 201 | id=`80ce2865`, code=`BLD-A`, nodeType=`building` |
| CREATE Unit | `POST /projects/:pid/locations` | ✅ 201 | id=`d322c5e5`, code=`A-101`, parent=`BLD-A` |
| CREATE Unit 2 | `POST /projects/:pid/locations` | ✅ 201 | id=`a70d6334`, code=`A-102` |
| LIST | `GET /projects/:pid/locations` | ✅ 200 | Returns all location types (building + units) |
| DETAIL | `GET /projects/:pid/locations/:id` | ✅ 200 | name=`Apartment A-101 Renovated`, status=`active` |
| UPDATE | `PATCH /projects/:pid/locations/:id` | ✅ 200 | name changed to `Apartment A-101 Renovated` |
| DELETE | `DELETE /projects/:pid/locations/:id` | ✅ 204 | Soft-deletes to `status: inactive` |

## Frontend Verification

| Feature | Status | Notes |
|---------|--------|-------|
| LocationsPage renders | ✅ | Uses real API via `useLocationsList` |
| Create Building dialog | ✅ | Wired to `useCreateLocation` |
| Create Unit dialog | ✅ | Wired to `useCreateLocation` |
| Edit Building dialog | ✅ | Wired to `useUpdateLocation` |
| Delete Building dialog | ✅ | Wired to `useDeleteLocation` |
| Toast stubs replaced | ✅ | "Add Building" no longer shows fake toast |
| Feature flag set to `api` | ✅ | `locations.list` → `'api'` |

## Chain Verified

```
UI Dialog → useCreateLocation() → apiPost()
                                 → POST /api/v1/projects/:pid/locations
                                 → LocationsController.create()
                                 → LocationsService.create()
                                 → prisma.locationNode.create()
                                 → PostgreSQL ✅
```

## Verdict

**UNITS_CERTIFIED = YES**

Full CRUD operations are available through the `/projects/:pid/locations` endpoint with `nodeType: 'unit'`. All mutations persist to PostgreSQL. The frontend LocationsPage has create, edit, and delete dialogs wired to real API mutations.
