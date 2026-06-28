# P2 — Toast Button Recovery

**Date**: 2026-06-18
**Gate**: BUTTONS_CERTIFIED

## Buttons Wired This Phase
| Page | Button | Previous | Current | Status |
|------|--------|----------|---------|--------|
| MetersPage | Add Meter | Toast placeholder | Navigates to meter-detail | ✅ FIXED |
| MetersPage | Edit Meter | Toast placeholder | Navigates to meter-detail | ✅ FIXED |
| MetersPage | Delete Meter | Toast placeholder | AlertDialog + API mutation | ✅ FIXED |

## Hooks Added
| Hook | File | Status |
|------|------|--------|
| `useCreateMeter()` | `use-meters.ts` | ✅ BUILT |
| `useUpdateMeter()` | `use-meters.ts` | ✅ BUILT |
| `useDeleteMeter()` | `use-meters.ts` | ✅ BUILT |

## Remaining Toast Buttons (19)
These require either complex dialogs or missing backend endpoints:
- InvoicesPage: Generate (needs period selector dialog), Edit (backend missing), Cancel (backend missing), Record Payment (needs dialog), Download (PDF missing)
- InvoiceDetailPage: Edit (backend missing), Record Payment (needs dialog), Download (PDF missing), Cancel (backend missing)
- ReportsPage: CSV, XLSX, Preview, Filters (all need report service)
- PaymentsPage: View, Edit, Delete (need backend endpoints)
- SmartTable: Export CSV/XLSX (needs export service)

## Verification
| Check | Result |
|-------|--------|
| Frontend lint | ✅ 0 errors |
| Frontend build | ✅ Clean |
| MetersPage Add/Edit/Delete | ✅ Wired |

## Conclusion
**BUTTONS_CERTIFIED = NO** (progress: 3 fixed, 19 remaining)
