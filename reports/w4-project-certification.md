# W4 — Project Workflow Certification

**Date**: 2026-06-18
**Method**: Full trace: UI → Hook → API → Controller → Service → Database

## Create Project
| Layer | Status | Detail |
|-------|--------|--------|
| UI Button | ✅ EXISTS | "Create Project" with Plus icon |
| Button Handler | ❌ TOAST | `toast.info(...)` — no dialog opens |
| Dialog/Form | ❌ MISSING | No CreateProjectDialog exists anywhere |
| Mutation Hook | ❌ MISSING | No `useCreateProject()` in use-projects.ts |
| API Client | ✅ READY | `apiPost<T>()` works |
| Backend POST /projects | ✅ READY | Controller + Service + DTO fully implemented |
| Database | ✅ READY | Project model accepts writes |

## Edit + Delete — Same Pattern
All three operations are **toast-only placeholders** on the frontend despite a fully ready backend.

## Root Cause
Frontend mutation layer for projects was never built. Three hooks (create, update, delete) plus two dialog components are missing.

## Conclusion
**PROJECTS_CERTIFIED = NO**
