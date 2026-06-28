# Project Isolation Enforcement — v2

**Date**: 2026-06-25
**Scope**: Controllers missing project access validation

---

## Infrastructure Used
- `UserAccessService` (`backend/src/auth/user-access.service.ts`)
  - `requireProjectAccess(userId, role, projectId)` — throws on denied
  - `resolveAccess(userId, role)` — returns `UserAccess` with `projects[]`
- Pattern: `validateProject(projectId, req)` helper → `ForbiddenException`

---

## Files Changed

### 1. `backend/src/billing/billing.controller.ts`
**Added**: `UserAccessService` injection + `validateProject()` helper
| Endpoint | Change |
|---|---|
| `POST /invoices/generate` | Validates `dto.projectId` |
| `POST /invoices/:id/issue` | Validates project from invoice lookup |
| `PATCH /invoices/:id` | Validates project from invoice lookup |
| `POST /invoices/:id/cancel` | Validates project from invoice lookup |
| `POST /invoices/:id/reverse` | Validates project from invoice lookup |
| `POST /invoices/:id/void` | Validates project from invoice lookup |
| `POST /invoices/:id/adjustments` | Validates project from invoice lookup |
| `POST /payments` | Validates `dto.projectId` |
| `POST /tariff-plans` | Validates `dto.projectId` |
| `GET /tariff-plans` | Filters by project when not super_admin (via `resolveAccess`) |
| `POST /periods` | Validates `dto.projectId` |
| `GET /periods` | Filters by project when not super_admin |
| `GET /invoices` | Filters by project when not super_admin |
| `GET /invoices/:id` | Validates project from invoice lookup |
| `POST /tariffs/simulate` | Validates `dto.projectId` |

### 2. `backend/src/meters/meters.controller.ts`
**Added**: `UserAccessService` injection + `validateProject()` helper
| Endpoint | Change |
|---|---|
| `GET /meters` | Validates `query.projectId` if provided; for non-super_admin without projectId, resolves accessible projects and fetches per-project |

### 3. `backend/src/bill-cycle/bill-cycle.controller.ts`
**Added**: `UserAccessService` injection + `validateProject()` helper
| Endpoint | Change |
|---|---|
| `POST /bill-cycle` | Validates `dto.projectId` |
| `POST /bill-cycle/:id/generate` | Validates `dto.projectId` |

### 4. `backend/src/readings/readings.controller.ts`
**Added**: `UserAccessService` injection + `validateProject()` helper
| Endpoint | Change |
|---|---|
| `GET /readings` | Validates optional `projectId`; for non-super_admin without projectId, resolves accessible projects |
| `GET /readings/review-queue` | Same pattern as findAll |
| `GET /readings/:id` | Validates project from reading lookup |
| `PATCH /readings/:id` | Validates project from reading lookup |
| `DELETE /readings/:id` | Validates project from reading lookup |
| `POST /readings/:id/approve` | Validates project from reading lookup |
| `POST /readings/:id/reject` | Validates project from reading lookup |

### 5. `backend/src/reports/reports.controller.ts`
**Added**: `UserAccessService` injection + `validateProject()` helper
| Endpoint | Change |
|---|---|
| `GET /reports/generate/:type` | Validates `query.projectId` when present |

---

## Build Status
- ✅ `npm run build` — Compiles with zero errors
