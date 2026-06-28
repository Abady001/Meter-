# Phase F2B.6 — Deployment Truth Validation

**Date**: 2026-06-18
**Method**: Direct shell inspection + port scanning + API calls against running processes

---

## 1. Current Branch & Commit

| Property | Value |
|----------|-------|
| Branch | `feature/t055-payments-contract` |
| HEAD | `007aa0a` — "T088: Create Area DB template (42 tables)" |
| Remote | `origin https://github.com/Kirllos360/Meter.git` |
| Modified files | 37 |
| Untracked files | 40+ (reports, specs, scripts, `.playwright-mcp/`) |

## 2. Running Processes

| Service | PID | Command | Port |
|---------|-----|---------|------|
| Next.js dev server | 33900/42492 | `next dev -p 3000` | **3000** |
| Backend (NestJS) | 28140 | `node dist/src/main.js` | **3001** |
| Playwright MCP | 7428, 28168 | `@playwright/mcp` | — |
| Notion MCP | 18412, 43120 | `@notionhq/notion-mcp-server` | — |

**Both frontend and backend are running.** Backend is compiled JS (`dist/src/main.js`), not ts-node.

## 3. CRITICAL: `.env.local` Hostname Mismatch

**`.env.local`** line 5:
```
NEXT_PUBLIC_API_URL=http://host.docker.internal:3001/api/v1
```

`host.docker.internal` is a Docker-only DNS name. Both services run natively (not in Docker), so this hostname does NOT resolve.

**Code defaults to `http://localhost:3001/api/v1`** — the `.env.local` value overrides the working default.

**This is the root cause of all 47+ `ERR_CONNECTION_REFUSED` console errors.**

`.env.example` correctly shows `http://localhost:3001/api/v1`.

## 4. Live API Endpoint Reality Check (tested via curl)

| Method | Endpoint | Status | Response |
|--------|----------|--------|----------|
| POST | `/auth/dev-login` | **200** | JWT token, user object |
| GET | `/meters` | **200** | `[]` |
| GET | `/invoices` | **200** | `[]` |
| GET | `/payments` | **200** | **Has real data** |
| GET | `/readings/review-queue` | **200** | `{"items":[]}` |
| GET | `/customers` | **404** | Controller exists in source but NOT registered in running module |
| GET | `/locations` | **404** | Controller exists in source but NOT registered in running module |
| GET | `/readings` | **404** | Only has `/readings/review-queue` |

**Observation**: `dist/src/main.js` was compiled from a module configuration that excludes `CustomersModule` and `LocationsModule`. Either:
- Module registration differs between source and compiled output, or
- The running binary is stale (source changed after last build)

## 5. Deployment Gap Summary

| Gap | Impact |
|-----|--------|
| `.env.local` has `host.docker.internal` | All 47+ frontend API calls fail |
| Customers/Locations controllers not registered in running binary | 2 modules completely unreachable from frontend |
| Readings endpoint mismatch | Frontend calls `/readings` + `/readings/:id`, backend only has `/readings/review-queue` |
| 37 modified files, all uncommitted | Fresh clone from `007aa0a` restores old broken code |
| 40+ untracked files | Reports, specs, scripts exist only in working tree |
| Backend compiled JS may be stale | `dist/` may not match current `src/` |

## 6. Single-Fix Assessment

**Changing 1 file (`.env.local`, line 5) from `host.docker.internal` to `localhost`** would eliminate all 47+ connection errors and connect the frontend to the live backend. The app would then:
- Render real data (or empty states) instead of mock data
- Hit real API endpoints for create/save/delete instead of toast stubs
- Fail loudly with real error messages instead of silent `catch { toast.success() }`
