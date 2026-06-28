# Area/Project Context Switching — LAACRP Phase E

## Overview

Users may be assigned to one or more Areas and one or more Projects within those Areas. The system must provide a mechanism to switch between these contexts, and all API calls must be scoped to the current context.

## Three User Cases

### Case 1: Single-Area, Single-Project

**Scenario**: User assigned to exactly one Area and one Project (e.g., a collector in October → Palm Hills).

**Behavior**:
- No context switcher shown in UI — the user's scope is fixed
- All API calls automatically include the area + project without user choice
- Area and Project stored in JWT or retrieved from `CoreUserRoleAssignment`

**UX**: The header shows a static badge: `October / Palm Hills`

### Case 2: Single-Area, Multi-Project

**Scenario**: User assigned to one Area but multiple Projects (e.g., an operator in New Cairo responsible for both EDNC and VYE).

**Behavior**:
- Context switcher shows only the Project dropdown (Area is fixed)
- Switching project scopes all data views to that project
- API calls include projectCode; areaCode is derived from the fixed Area

**UX**: Header shows `New Cairo ▾ [EDNC | VYE | BADYA]` with a dropdown

### Case 3: Multi-Area, Multi-Project

**Scenario**: Super admin, system admin, or cross-area manager assigned to multiple Areas and Projects.

**Behavior**:
- Two-level cascading context switcher: Area first, then Project
- Selecting an Area filters the Project list to only projects in that Area
- All API calls include both `areaCode` and `projectCode`

**UX**: Header shows `[October ▾] / [Palm Hills ▾]` with cascading dropdowns

## Context Storage & Persistence

| Layer | Mechanism |
|---|---|
| **JWT** | Claims include `areaCode` and `projectCode` — set on login, updated on context switch |
| **Frontend Store** | Zustand context store persists current area + project, syncs with localStorage |
| **localStorage** | `selected-area` and `selected-project` keys (already partially exists for area) |
| **API Header** | Custom headers `X-Area-Code` and `X-Project-Code` on every request |
| **Query Parameter** | `?areaCode=october&projectCode=palm-hills` appended to relevant GET requests |
| **Cookie** | Optional httpOnly cookie sync for SSR |

## API Call Context Injection

### Strategy: Hybrid (Header + Query Param)

- **POST/PUT/PATCH/DELETE**: Use `X-Area-Code` and `X-Project-Code` custom headers
- **GET**: Append `?areaCode=...&projectCode=...` as query parameters (supports caching, bookmarking)
- **Middleware**: Backend `AreaProjectMiddleware` extracts from header or query and attaches to `req.areaContext`

### Backend Middleware

```
Request → AreaProjectMiddleware
  ├── Check X-Area-Code header (POST/PUT/PATCH/DELETE)
  ├── Check areaCode query param (GET)
  ├── Validate area exists in CoreArea
  ├── Validate user has role assignment for area
  ├── Attach to request: req.areaContext = { areaCode, projectCode }
  └── Forward to controller
```

### Frontend Context Store

```typescript
interface ContextState {
  currentArea: Area | null;
  currentProject: Project | null;
  availableAreas: Area[];
  availableProjects: Project[];
  setArea: (area: Area) => void;
  setProject: (project: Project) => void;
  clearContext: () => void;
}
```

## Header UI Design

```
┌─────────────────────────────────────────────────────────────┐
│  Meter Verse              [October ▾] / [Palm Hills ▾]     │
│  ● System Admin           [🔔 3]  [👤 Kirllos]             │
├─────────────────────────────────────────────────────────────┤
```

### Context Switcher Component

| Element | Behavior |
|---|---|
| **Area Dropdown** | Visible only if `availableAreas.length > 1`. Disabled if `=== 1`. |
| **Project Dropdown** | Always visible. Options filtered by selected Area. Disabled if `=== 1` and area is single. |
| **Area+Project badge** | Shown in header: `{areaName} / {projectName}` with subtle background |
| **Lock icon** | Shown next to context when user has no switching ability (Case 1) |

## Project Filter Cascading

```
User selects Area "October"
  → Frontend calls GET /api/v1/projects?areaCode=october
  → Backend filters CoreProject WHERE areaId = (core_areas.id for october)
  → Returns [{ id, projectCode, projectName }, ...]
  → Project dropdown populates with results
  → If user has only 1 project in this area, it's auto-selected
```

### Backend Endpoint Changes

| Endpoint | Current | Target |
|---|---|---|
| `GET /api/v1/projects` | Returns all projects | Accept `?areaCode=` filter |
| `GET /api/v1/auth/context` | **Does not exist** | Returns user's available areas + projects with role |
| `POST /api/v1/auth/switch-context` | **Does not exist** | Updates JWT with new areaCode/projectCode |

## Files Requiring Modification

### Frontend

| File | Change |
|---|---|
| `Frontend/src/lib/context-store.ts` | **New**: Zustand store for area/project context |
| `Frontend/src/components/layout/AppShell.tsx` | Add context switcher to header |
| `Frontend/src/components/layout/TopNav.tsx` | Add area/project badge and dropdown |
| `Frontend/src/components/layout/ContextSwitcher.tsx` | **New**: cascading dropdown component |
| `Frontend/src/lib/api/index.ts` | Add `X-Area-Code` / `X-Project-Code` headers to all requests |
| `Frontend/src/lib/api/projects.ts` | Add `?areaCode=` to project fetch |
| `Frontend/src/lib/router-store.ts` | Persist context in navigation state |

### Backend

| File | Change |
|---|---|
| `backend/src/common/middleware/area-context.middleware.ts` | **New**: Extract + validate area/project context |
| `backend/src/auth/auth.controller.ts` | Add `POST /auth/switch-context`, `GET /auth/context` |
| `backend/src/auth/auth.service.ts` | Add context validation logic |
| `backend/src/auth/jwt.strategy.ts` | Include `areaCode`, `projectCode` in JWT payload |
