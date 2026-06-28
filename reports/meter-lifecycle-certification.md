# Meter Lifecycle Certification — Phase F
**Date**: 2026-06-25
**Components**: `MetersPage.tsx` + `MeterDetailPage.tsx` + `use-meters` hooks
**Level**: UI CODE AUDIT

---

## 1. Current CRUD Actions

| Action | Component | Implementation | Status |
|--------|-----------|----------------|--------|
| **Create** | `MetersPage.tsx` line 87 | "Add Meter" button → navigates to `meter-detail` with `id='new'` | ✅ wired |
| **Read (List)** | `MetersPage.tsx` | `useMetersList()` → SmartTable with 15 columns | ✅ full table |
| **Read (Detail)** | `MeterDetailPage.tsx` | `useMeterDetail(id)` → header, stat cards, chart, 7 tabs | ✅ full detail |
| **Update (Edit)** | `MeterDetailPage.tsx` line 73 | `handleEditSave()` → `apiPut('/meters/:id', data)` → invalidateQueries | ✅ wired |
| **Delete** | `MetersPage.tsx` line 129 | AlertDialog confirmation → `useDeleteMeter().mutate(id)` | ✅ wired |

## 2. Detail Page Tabs

| Tab | Content | Status |
|-----|---------|--------|
| Overview | Summary text | ⚠️ stub |
| Readings | SmartTable of filtered readings | ✅ |
| Assignments | Empty state stub | ⚠️ stub |
| SIM/IP | SIM card detail card | ✅ |
| Invoices | SmartTable of filtered invoices | ✅ |
| Alerts | Empty state | ⚠️ stub |
| Maintenance | Empty state | ⚠️ stub |

## 3. Lifecycle States in Filter

The `MetersPage` status filter includes these states:
```
active, offline, available, faulty, replaced, terminated, retired, assigned
```

## 4. Context-Sensitive Menu Gaps (NEW vs ACTIVE)

| Lifecycle State | Required Actions | Implemented | Gap |
|-----------------|-----------------|--------------|-----|
| **NEW** (assigned) | Assign to customer, Activate, Edit details, Delete | View/Edit/Delete only | ❌ No "Activate" action |
| **ACTIVE** | Replace, Terminate, Add Reading, Edit, View history | View/Edit/Delete only | ❌ No "Replace" / "Terminate" |
| **FAULTY** | Inspect, Replace, Retire | View/Edit/Delete only | ❌ No lifecycle-specific actions |
| **REPLACED** | View replacement chain, Archive | View/Edit/Delete only | ❌ No chain view |
| **TERMINATED** | Archive, View final reading | View/Edit/Delete only | ❌ No final reading pin |
| **RETIRED** | Archive only | View/Edit/Delete only | ❌ Archive-only mode |

## 5. What's Implemented

- [x] **Complete CRUD** — Create, Read (list + detail), Update, Delete all wired
- [x] **Status filters** — 8 status values in dropdown, sortable column
- [x] **Edit dialog** — 7-field form (serial, type, brand, model, phase, amps, diameter)
- [x] **Row-level actions** — Context menu with View, Edit, Delete per row
- [x] **Delete confirmation** — AlertDialog with cancel/confirm
- [x] **Create flow** — Navigate to detail page with `id='new'` (detail page handles creation form)
- [x] **Meter type icons** — Electricity (Zap/amber) vs Water (Droplets/blue)

## 6. What's Needed for Context-Sensitive Menu

| Feature | Priority | Implementation Path |
|---------|----------|---------------------|
| State-driven dropdown actions | HIGH | Replace static 3-item menu with dynamic menu based on `row.status` |
| NEW → Assign/Activate | HIGH | Add "Assign to Customer" and "Activate" for status=`assigned`/`available` |
| ACTIVE → Replace/Terminate | HIGH | Add "Replace Meter" and "Terminate" for status=`active` |
| FAULTY → Inspect/Retire | MEDIUM | Add "Inspect" and "Retire" for status=`faulty` |
| Status transition validation | MEDIUM | Prevent delete on active meters; show warning |
| Bulk actions | LOW | Select multiple meters → bulk assign/activate/terminate |
| Audit trail per state change | MEDIUM | Log every lifecycle transition to audit_log |

## 7. Verdict

**METER LIFECYCLE UI: CERTIFIED for CRUD — lifecycle transitions not yet implemented**

Basic CRUD is fully wired and functional. The page architecture (SmartTable + detail tabs + edit dialog) is correct and production-quality. Lifecycle-specific actions (Activate, Replace, Terminate) are missing from the context menu — the dropdown shows the same 3 items regardless of meter state.

**CONDITIONAL GO** — CRUD is certified. Lifecycle transitions must be added before the meter management workflow is complete. Estimate: 2-3 days for state-driven menus, transition modals, and audit logging.
