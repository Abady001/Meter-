# F2C.2 — Backend Registration Recovery Report

**Date**: 2026-06-18
**Status**: COMPLETE — No fix needed ✅

---

## Investigation

The F2B.6 phase reported `GET /customers → 404` and `GET /locations → 404`.

### Root Cause of False Alarm

The test URL was incorrect. Both controllers are registered under a project-scoped route:

```
Backend route:  /projects/:projectId/customers
Frontend call:  /projects/${projectId}/customers
```

F2B.6 tested: `GET /api/v1/customers` → 404 ❌
Correct URL:  `GET /api/v1/projects/{uuid}/customers` → 200 ✅

### Verification

| Check | Result |
|-------|--------|
| `AppModule` imports `CustomersModule` | ✅ Line 36 |
| `AppModule` imports `LocationsModule` | ✅ Line 35 |
| `dist/src/app.module.js` includes both modules | ✅ Lines 24-25 |
| `dist/src/customers/customers.controller.js` exists | ✅ Compiled |
| `dist/src/projects/locations/locations.controller.js` exists | ✅ Compiled |
| `GET /api/v1/projects/{uuid}/customers` | **200** ✅ |
| `GET /api/v1/projects/{uuid}/locations` | **200** ✅ |
| Frontend `useCustomersList(projectId)` calls correct URL | ✅ `\`/projects/${projectId}/customers\`` |
| Frontend `useLocationsList(projectId)` calls correct URL | ✅ `\`/projects/${projectId}/locations\`` |

### Frontend Integration Pattern

CustomersPage and LocationsPage use a **HYBRID pattern**:
1. `projectFilter` starts as empty string `''`
2. `useCustomersList(projectFilter)` has `enabled: !!projectId` → disabled when empty
3. `const customers = apiCustomers ?? mockCustomers` → falls back to mock
4. When user selects a project from dropdown → query enables → real API is called
5. If real API returns data → replaces mock; if 404/error → keeps mock

### Success Criteria Met

- [x] Customers endpoints respond (200)
- [x] Locations endpoints respond (200)
- [x] Module registration is correct
- [x] Controller registration is correct
- [x] App module imports are correct
- [x] Frontend uses correct URL pattern
