# F2C.1 — Environment Recovery Report

**Date**: 2026-06-18
**Status**: COMPLETE ✅

---

## Root Cause

`.env.local` line 5:
```
NEXT_PUBLIC_API_URL=http://host.docker.internal:3001/api/v1
```

`host.docker.internal` is a Docker-only DNS name. Both services run natively (not in Docker), so this hostname does NOT resolve. The code defaults to `http://localhost:3001/api/v1` when the env var is not set.

## Fix Applied

Changed `host.docker.internal` → `localhost` in `Frontend/.env.local:5`

## Verification Results

### Before Fix (from F2B.6 phase)
- 47+ `ERR_CONNECTION_REFUSED` console errors
- All API calls failed silently
- Dashboard showed mock data via `?? mockData` fallback

### After Fix
| Metric | Before | After |
|--------|--------|-------|
| Connection-refused errors | 47+ | **0** |
| Total console errors | 47+ | **12** (all real 404s from backend) |
| Backend reachable | ❌ | ✅ |
| Login functional | ⚠️ (mock) | ✅ (mock, backend dev-login reachable) |
| Dashboard renders | ✅ (mock) | ✅ (mock, 3 dashboard endpoints return 404) |

### Live API Verification (via curl)
| Endpoint | Status | Notes |
|----------|--------|-------|
| `POST /api/v1/auth/dev-login` | 200 ✅ | Returns real JWT |
| `GET /api/v1/projects/:pid/customers` | 200 ✅ | Empty array (correct route) |
| `GET /api/v1/projects/:pid/locations` | 200 ✅ | Empty array (correct route) |
| `GET /api/v1/meters` | 200 ✅ | Empty array |
| `GET /api/v1/invoices` | 200 ✅ | Empty array |
| `GET /api/v1/payments` | 200 ✅ | **Has real data** |
| `GET /api/v1/readings/review-queue` | 200 ✅ | `{"items":[]}` |
| `GET /api/v1/dashboard/kpis` | 404 ❌ | Not implemented |
| `GET /api/v1/dashboard/consumption-trend` | 404 ❌ | Not implemented |
| `GET /api/v1/dashboard/recent-activity` | 404 ❌ | Not implemented |

### Critical Correction from F2B.6
In F2B.6, Customers and Locations were reported as returning 404. **This was incorrect** — the test URL was wrong:
- ❌ `GET /api/v1/customers` → 404 (wrong — no `projectId`)
- ✅ `GET /api/v1/projects/:projectId/customers` → 200

Both controllers ARE registered and working. The route pattern is `projects/:projectId/{resource}`.

## Remaining Errors (12 total)

All 12 errors are real 404s from the backend for unimplemented dashboard endpoints:
- `GET /api/v1/dashboard/kpis` — Not implemented
- `GET /api/v1/dashboard/consumption-trend` — Not implemented
- `GET /api/v1/dashboard/recent-activity` — Not implemented

These are acceptable — they're caught by the `?? mockData` fallback and don't affect rendering.

## Success Criteria Met

- [x] 0 connection-refused errors
- [x] Frontend reaches backend
- [x] Login works
- [x] Dashboard loads (via mock fallback)
