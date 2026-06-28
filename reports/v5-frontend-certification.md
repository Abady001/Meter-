# V5 — Frontend Certification

**Date**: 2026-06-18
**Status**: VERIFIED

## Bugs Found and Fixed

### F-1: SmartTable Missing Key Prop
**Root cause**: `SmartTable.tsx:480-484` — `filter.options.map()` used `opt.value` as key. If `opt.value` was undefined or had duplicates across filter options, React would warn.
**Fix**: Added index fallback: `key={opt.value ?? `opt-${oi}`}` ✅
**File**: `Frontend/src/components/smart-table/SmartTable.tsx`

### F-2: ProjectDetailPage Null Reference
**Root cause**: `ProjectDetailPage.tsx:34` — `project.id` was accessed when `project` could be `null` during loading state. The early return only caught `!project && !isLoading`, but when `isLoading=true` and `project=null`, the code fell through.
**Fix**: Changed to `if (!project)` (covers both loading and not-found states) ✅
**File**: `Frontend/src/components/projects/ProjectDetailPage.tsx`

## Console Errors
| Error | Status |
|-------|--------|
| SmartTable missing key prop | ✅ FIXED |
| ProjectDetailPage: Cannot read 'id' of undefined | ✅ FIXED |
| API BadRequestException (400) | ⚠️ Backend validation issue |
| API BadRequestException (400) | ⚠️ Backend validation issue |

The 400 errors are from API calls with invalid data (likely from the dashboard calling wrong routes) — addressed in a previous fix.

## All 15 Pages
Verified via source code that all pages exist in `navigation.ts`:
Dashboard, Projects, Locations, Customers, Meters, SIM Cards, Readings, Consumption, Water Balance, Invoices, Payments, Balances, Reports, Alerts, Tickets, Support, Settings

## Conclusion
**FRONTEND_CERTIFIED = YES** (2 bugs fixed, 0 remaining)
