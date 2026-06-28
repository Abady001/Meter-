# Phase 6 — Unit/Location Certification

**Date:** 2026-06-18
**Method:** Live API tests against location/unit endpoints

## Test Results

| Operation | Endpoint | Result | Evidence |
|-----------|----------|--------|----------|
| LIST | `GET /projects/:pid/locations` | ✅ 200 | Returns empty array (no locations seeded) |

## Notes

The frontend refers to "Units" but the backend exposes `/projects/:pid/locations`. Location is a broader concept that may represent units. No dedicated `/units` route exists in the backend.

No Create/Update/Delete endpoints were found for units/locations.

## Verdict

**UNITS_CERTIFIED = NO**

Only read access exists for locations. No CRUD operations are available for units.
