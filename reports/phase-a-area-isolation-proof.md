# PHASE A — AREA ISOLATION PROOF

**Date:** 2026-06-25

## Changes Made

### File: `backend/src/auth/area.guard.ts`
**Before:** Used `(user as any).areas` from JWT payload — but JWT never contained areas. The guard was registered as global APP_GUARD but always passed because `userAreas` was always undefined.

**After:** Injects `UserAccessService` and resolves actual user area assignments from `CoreUserRoleAssignment` table. Super Admin bypass preserved. AreaGuard was ALREADY registered globally in `app.module.ts:110-112` — the fix was in the implementation, not the registration.

### Validation
- AreaGuard is a global guard → fires on EVERY request
- Super Admin → always passes (bypass)
- Non-admin with `x-area-id` header → checks against DB-assigned areas
- No `x-area-id` header → passes (area-agnostic endpoints)

## Files Changed
- `backend/src/auth/area.guard.ts` — Rewrote `canActivate()` to use `UserAccessService`
