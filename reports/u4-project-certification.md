# U4 — Project Workflow Certification

**Date**: 2026-06-18
**Method**: Source code trace: UI → Hook → API → Controller → Service → DB

## Create Project — Full Trace

| Layer | File | Status | Detail |
|-------|------|--------|--------|
| UI Button | `ProjectsPage.tsx:73` | ✅ EXISTS | "Create Project" with Plus icon |
| Button Handler | `ProjectsPage.tsx:73` | ❌ **PLACEHOLDER** | `toast.info(t('projects.create') + ' ' + t('common.dialog'))` |
| Dialog/Form | — | ❌ **MISSING** | No CreateProjectDialog exists |
| Mutation Hook | `use-projects.ts` | ❌ **MISSING** | Only read hooks exist |
| API Client | `client.ts` | ✅ READY | `apiPost<T>()` works |
| Backend Controller | `projects.controller.ts:29` | ✅ READY | POST /projects |
| Backend Service | `projects.service.ts:13` | ✅ READY | `create()` writes to Prisma |
| Backend DTO | `create-project.dto.ts` | ✅ READY | Validated |
| Database | Prisma Project model | ✅ READY | Accepts writes |

## Edit Project — Same Pattern
- Button: `toast.info('Edit: ' + row.name)` — ❌ **PLACEHOLDER**
- Backend: `PATCH /projects/:id` — ✅ READY

## Delete Project — Same Pattern
- Button: `toast.info('Delete: ' + row.name)` — ❌ **PLACEHOLDER**
- Backend: `DELETE /projects/:id` — ✅ READY (SUPER_ADMIN only)

## Root Cause
Project CRUD **frontend mutation layer is entirely missing**. The backend is fully implemented and ready. Three React Query `useMutation` hooks need to be created (create/update/delete), plus dialog components for the create and edit forms, plus an AlertDialog for delete confirmation.

## Conclusion
**PROJECTS_CERTIFIED = NO**
