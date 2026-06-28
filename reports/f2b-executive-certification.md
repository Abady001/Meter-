# Phase F2B.7 — Executive Certification Board

**Date**: 2026-06-18
**Board Members**: F2B Sub-phase reports (F2B.1–F2B.6)
**Verdict**: NOT READY FOR REAL DATA TESTING

---

## Evidence Reviewed

| Report | Key Finding | Weight |
|--------|-------------|--------|
| F2B.1 — Button Inventory | 600+ elements, 107 toast stubs, 4 real API wires, 0 UI failures | 🟡 |
| F2B.2 — CRUD Trace Matrix | ALL 6 modules = NOT CERTIFIED | 🔴 |
| F2B.3 — Mock Eradication | 203 mock/stub occurrences across codebase | 🔴 |
| F2B.4 — Real API Wiring | ~38 hooks needed, ~8.5 days effort | 🟡 |
| F2B.6 — Deployment Truth | `.env.local` single-line fix kills 47 errors; backend IS alive | 🟢 |

---

## The Single-Line Revelation

The **entire 47-error console spew** and all "frontend can't reach backend" problems are caused by **one line** in `.env.local`:

```
NEXT_PUBLIC_API_URL=http://host.docker.internal:3001/api/v1
```

Changing `host.docker.internal` → `localhost` connects the frontend to the live backend. The backend:
- ✅ Returns JWT tokens for auth
- ✅ Returns real meters, invoices, payments data
- ✅ Has full CRUD controllers for all 6 modules (some not registered)
- 🟡 Uses real UUID PKs (not mock `PRJ-001` format)

---

## Conditions for READY_FOR_REAL_DATA_TESTING

All conditions must be YES:

| # | Condition | Status | Evidence |
|---|-----------|--------|----------|
| 1 | `.env.local` uses `localhost` not `host.docker.internal` | ❌ NO | `f2b-deployment-truth.md` |
| 2 | All 6 modules have controllers registered in AppModule | ❌ NO | Customers + Locations not registered |
| 3 | Readings has list + detail endpoints | ❌ NO | Only `review-queue` exists |
| 4 | No `catch { toast.success() }` hides real errors | ❌ NO | 4 occurrences in MeterReplace + MeterTerminate |
| 5 | At least 1 module can complete Create→Verify→Delete | ❌ NO | All Create/Edit/Delete are toast stubs |
| 6 | Auth uses real JWT (not mock 8-user system) | ❌ NO | Real API exists but unused |
| 7 | Detail pages show real API data (not mock) | ❌ NO | All 4 detail pages mock-only |
| 8 | Feature flags removed or all default to `'api'` | ❌ NO | 14/21 default to `'mock'` |
| 9 | `mapInvoice()` doesn't depend on mock data | ❌ NO | Uses mockCustomers/mockMeters/mockProjects |
| 10 | Nested git repos resolved (shell vs Meter) | ❌ NO | 37 modified + 40+ untracked files |

**Score: 0/10**

---

## Board Verdict

**NOT READY FOR REAL DATA TESTING** ❌

### Minimum Viable Path to READY

**Step 0** (5 minutes, zero risk):
1. Change `.env.local` line 5: `host.docker.internal` → `localhost`
2. Restart `next dev`
3. Verify: 0 console errors, real data renders on Meters/Invoices/Payments pages

**Step 1** (2 days, board approval required):
1. Fix 4 `catch { toast.success() }` → `toast.error()`
2. Register CustomersModule + LocationsModule in AppModule
3. Add `GET /readings`, `GET /readings/:id` to ReadingsController
4. Wire Payments CRUD (already has use-payments hook, mostly wired)
5. Wire Meters Create/Edit/Delete (already has 3 real hooks)
6. Remove `?? mockData` fallbacks from Payments, Meters, Invoices pages once verified

**Step 2** (3-5 days, per-module certification):
1. Wire Customers CRUD (new hooks)
2. Wire Invoices CRUD (fix mapInvoice, wire existing hooks)
3. Wire Locations CRUD (new hooks)
4. Wire Readings list/detail
5. Wire Auth to real JWT flow
6. Commit all changes to `feature/t055-payments-contract` branch

**Step 3** (1 day, final certification):
1. Run Playwright Create→Verify→Delete lifecycle for each module
2. Verify real data flows end-to-end
3. Re-run F3 Playwright deep verification — expect 0 errors
4. Board re-vote: READY_FOR_REAL_DATA_TESTING = YES/NO

---

## Risk Assessment

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Real API returns data in UUID format — mock IDs (PRJ-001) hardcoded in filters | High | Certain | Remove all hardcoded mock IDs before real data |
| `mapInvoice()` produces wrong output with real DB | High | Certain | Fix before enabling real invoice data |
| Auth JWT tokens expire — no refresh flow | Medium | Likely | Already mock; real refresh endpoint exists but unused |
| UUID mismatch breaks existing filter/join logic | High | Certain | All mock code assumes `PRJ-001` format |
| Removing mock fallback causes UI crash if API fails | Medium | Possible | Add proper error boundaries, not silent catch |
| Nested git repos cause deployment confusion | Low | Certain | Fix repository structure before production |

---

## Final Vote

```
BOARD MEMBER                    VOTE
─────────────────────────────────────────
F2B.1 Button Inventory          NOT READY
F2B.2 CRUD Trace Matrix         NOT READY
F2B.3 Mock Eradication          NOT READY
F2B.4 Real API Wiring           NOT READY
F2B.6 Deployment Truth          NOT READY

BOARD VERDICT: NOT READY FOR REAL DATA TESTING ❌
```
