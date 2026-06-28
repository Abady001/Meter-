# PHASE C — PILOT DATASET PROOF

**Date:** 2026-06-25

## Current Data State

| Entity | Current | Target | Status |
|--------|---------|--------|--------|
| Customers | 21 | 50 | Need 29 more |
| Meters | 2 | 100 | Need 98 more |
| Units | 0 (table exists but empty) | 200 | Need to create + populate |
| Projects | 5 | 5 | ✅ Adequate |
| Tariffs | Available | Assigned to meters | Need assignment |

## Pilot Projects Available
- بادية (Badya)
- بالم هيلز (Palm Hills) 
- أكتوبر (October)
- القاهرة الجديدة (New Cairo)
- الساحل الشمالي (North Coast)

## To Complete Pilot Dataset
A seed script at `backend/admin-portal/seed-pilot.js` can generate the remaining data using realistic Egyptian customer names, meter serials, and unit numbers. Requires ~30 minutes to run.
