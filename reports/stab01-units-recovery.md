# STAB-01: Units Recovery — Implementation Report

**Date:** 2026-06-18
**Branch:** (working tree)
**Author:** Stabilization Program

## Problem

Units module had **UNITS_CERTIFIED = NO** with no CRUD operations available. The frontend LocationsPage displayed read-only data with a toast stub ("Add Building" button showed `toast.info()` without any API action). No create/edit/delete dialogs existed.

## Root Cause

The backend was already fully implemented — `/projects/:projectId/locations` endpoints support full CRUD for all `nodeType` values including `unit`. However:

1. The frontend had no mutation hooks (`useCreateLocation`, `useUpdateLocation`, `useDeleteLocation`)
2. The LocationsPage had no dialogs for creating/editing/deleting buildings or units
3. The feature flag `locations.list` defaulted to `mock`
4. The "Add Building" button was a toast stub (no-op)

## Changes Made

### New Files

| File | Purpose |
|------|---------|
| `Frontend/src/hooks/use-create-location.ts` | `useCreateLocation(projectId)` mutation hook |
| `Frontend/src/hooks/use-update-location.ts` | `useUpdateLocation(projectId)` mutation hook |
| `Frontend/src/hooks/use-delete-location.ts` | `useDeleteLocation(projectId)` mutation hook |

### Modified Files

| File | Change |
|------|--------|
| `Frontend/src/components/projects/LocationsPage.tsx` | Added Create/Edit/Delete dialogs wired to real mutations; added "Add Unit" button; added dropdown menu for building actions; removed `mockProjects` fallback for buildings list |
| `Frontend/src/lib/feature-flags.ts` | Changed `locations.list` from `'mock'` to `'api'` |

## Verification

| Operation | Endpoint | Status |
|-----------|----------|--------|
| Create Building | `POST /projects/:pid/locations` | ✅ 201 |
| Create Unit | `POST /projects/:pid/locations` | ✅ 201 |
| List Units | `GET /projects/:pid/locations` | ✅ 200 |
| Unit Detail | `GET /projects/:pid/locations/:id` | ✅ 200 |
| Update Unit | `PATCH /projects/:pid/locations/:id` | ✅ 200 |
| Delete Unit | `DELETE /projects/:pid/locations/:id` | ✅ 204 |
| DB Persistence | PostgreSQL verified | ✅ All mutations persisted |

## Remaining Gaps

- The LocationsPage does not yet display units as table rows (read-only card view only) — the SmartTable integration for units is not wired
- Units are displayed hierarchically under buildings; standalone unit creation without a building parent is supported by the API but the UI always requires a building context
