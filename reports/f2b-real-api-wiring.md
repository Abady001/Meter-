# Phase F2B.4 — Real API Wiring Plan

**Date**: 2026-06-18
**Method**: Map every frontend toast stub or mock-only action to its real backend endpoint
**Prerequisite**: Fix `.env.local` `host.docker.internal` → `localhost` (single-line change, all 47 errors fixed)

---

## Wiring Priority (by module maturity)

| Priority | Module | Backend Readiness | Frontend Hook | Est. Effort |
|----------|--------|------------------|---------------|-------------|
| **P0** | Auth | ✅ Full | ✅ `mock-auth.ts` → real JWT | 1 day |
| **P1** | Payments | ✅ Full CRUD + HAS DATA | ⚠️ `use-payments.ts` exists | 0.5 day |
| **P2** | Invoices | ✅ Full CRUD | ⚠️ `use-invoices.ts` exists | 1 day |
| **P3** | Meters | ✅ Full CRUD (9 endpoints) | ⚠️ 3 hooks exist | 1.5 days |
| **P4** | Customers | ✅ Controller NOT registered | ❌ No hook | 1 day |
| **P5** | Locations | ✅ Controller NOT registered | ❌ No hook | 0.5 day |
| **P6** | Readings | ❌ Missing list/detail endpoints | ⚠️ `use-readings.ts` exists | 1 day |
| **P7** | Reports/Alerts/Tickets | ❌ No backend controllers | ❌ No hooks | 3 days |

---

## P0 — Auth (1 fix)

| File | Current | Target |
|------|---------|--------|
| `.env.local` | `host.docker.internal` | `localhost` |
| `mock-auth.ts` | Mock token + 8 mock users | Call real `POST /auth/dev-login` then real `POST /auth/refresh` |

**Note**: Dev-login API exists and returns real JWT. Auth hooks (`useAuth()` in mock-auth.ts) already call it but the URL is broken. After `.env.local` fix, auth would work.

---

## P1 — Payments (quick wins, fewest changes)

Current state: `use-payments.ts` (untracked, written by us) calls `GET /payments`, returns real data. Page shows empty state because `apiData` is empty array and there's no mock fallback.

Required wiring:
| Action | Current | Target Hook | Backend Endpoint |
|--------|---------|-------------|-----------------|
| List | ✅ Already wired | `usePayments()` | `GET /payments` |
| Create | `toast.success` | `useCreatePayment()` | `POST /payments` |
| Detail | `toast.info` | `usePayment(id)` | `GET /payments/:id` |
| Edit | `toast.info` | `useUpdatePayment()` | `PATCH /payments/:id` |
| Delete | `toast.info` | `useDeletePayment()` | `DELETE /payments/:id` |

---

## P2 — Invoices (1 day)

Current state: `use-invoices.ts` (untracked, written by us) calls `GET /invoices`. Returns empty array. Page shows empty state. `mapInvoice()` depends on `mockCustomers`, `mockMeters`, `mockProjects`.

Required wiring:
| Action | Current | Target Hook | Backend Endpoint |
|--------|---------|-------------|-----------------|
| List | ✅ Already wired | `useInvoices()` | `GET /invoices` |
| Create | `toast.info` | `useCreateInvoice()` | `POST /invoices` |
| Detail | ✅ Already wired | `useInvoice(id)` | `GET /invoices/:id` |
| Edit | `toast.info` | `useUpdateInvoice()` | `PATCH /invoices/:id` |
| Issue | `toast.info` | `useIssueInvoice()` | `POST /invoices/:id/issue` |
| Cancel | `toast.info` | `useCancelInvoice()` | `POST /invoices/:id/cancel` |
| Record Payment | `toast.info` | `useRecordPayment()` | `POST /invoices/:id/payments` |

**Critical fix**: `mapInvoice()` must replace mock data lookups with real API data or at minimum use `find()` without mock fallback.

---

## P3 — Meters (1.5 days)

Current state: 3 real hooks exist (`use-assign-meter.ts`, `use-replace-meter.ts`, `use-terminate-meter.ts`) but all have `catch { toast.success() }` that hides errors. List endpoint works (returns 200). Create/Edit/Delete/Detail are mock-only.

Required wiring:
| Action | Current | Target Hook | Backend Endpoint |
|--------|---------|-------------|-----------------|
| List | ✅ Mock fallback | `useMeters()` | `GET /meters` |
| Create | `toast.info` | `useCreateMeter()` | `POST /meters` |
| Detail | Mock-only | `useMeter(id)` | `GET /meters/:id` |
| Edit | `toast.info` | `useUpdateMeter()` | `PATCH /meters/:id` |
| Delete | `toast.info` | `useDeleteMeter()` | `DELETE /meters/:id` |
| Assign | 🔌 `try { toast.success } catch { }` | Fix catch to `toast.error` | `POST /meters/:id/assign` |
| Replace | 🔌 `try { toast.success } catch { }` | Fix catch to `toast.error` | `POST /meters/:id/terminate` + `/assign` |
| Terminate | 🔌 `try { toast.success } catch { }` | Fix catch to `toast.error` | `POST /meters/:id/terminate` |

**Critical fix**: 4 occurrences of `catch { toast.success() }` must be changed to `toast.error()`.

---

## P4 — Customers (1 day)

Current state: Controller exists in source but NOT registered in running app. No frontend hooks exist.

Required wiring:
| Action | Current | Target Hook | Backend Endpoint |
|--------|---------|-------------|-----------------|
| List | Mock-only | `useCustomers()` | `GET /customers` |
| Create | `toast.info` | `useCreateCustomer()` | `POST /customers` |
| Detail | Mock-only | `useCustomer(id)` | `GET /customers/:id` |
| Edit | `toast.info` | `useUpdateCustomer()` | `PATCH /customers/:id` |
| Delete | `toast.info` | `useDeleteCustomer()` | `DELETE /customers/:id` |

**Prerequisite**: Register `CustomersModule` in `AppModule`.

---

## P5 — Locations (0.5 day)

Same pattern as Customers: controller exists but NOT registered. No frontend hooks.

Required wiring:
| Action | Current | Target Hook | Backend Endpoint |
|--------|---------|-------------|-----------------|
| List | Mock-only | `useLocations()` | `GET /locations` |
| Create | `toast.info` | `useCreateLocation()` | `POST /locations` |

**Prerequisite**: Register `LocationsModule` in `AppModule`.

---

## P6 — Readings (1 day + backend work)

Current state: Backend only has `POST /readings` and `GET /readings/review-queue`. Frontend calls `GET /readings` and `GET /readings/:id` which don't exist.

Required wiring:
| Action | Current | Target Hook | Backend Endpoint |
|--------|---------|-------------|-----------------|
| List | Mock-only | `useReadings()` | `GET /readings` **--- NEEDS BACKEND** |
| Create | 🔌 Real API | Already works | `POST /readings` |
| Detail | `toast.info` | `useReading(id)` | `GET /readings/:id` **--- NEEDS BACKEND** |
| Edit | `toast.info` | `useUpdateReading()` | `PATCH /readings/:id` **--- NEEDS BACKEND** |

**Backend work needed**: Add `GET /readings`, `GET /readings/:id`, `PATCH /readings/:id`, `DELETE /readings/:id` to ReadingsController.

---

## P7 — Reports/Alerts/Tickets (3 days + backend work)

Current state: No backend controllers exist for these modules in the running app. All actions are toast stubs.

Required:
| Module | Frontend Actions | Backend Need |
|--------|-----------------|--------------|
| Reports | Generate, Export, Preview | New controller |
| Alerts | Acknowledge | New controller |
| Tickets | Create, Status | New controller |

---

## Summary: Total Effort

| Module | Backend Work | Frontend Wiring | Priority |
|--------|-------------|-----------------|----------|
| Auth | None | 1 file (`.env.local`) | P0 - 0 min |
| Payments | None | ~5 hooks | P1 - 0.5 day |
| Invoices | None | ~7 hooks + fix mapInvoice | P2 - 1 day |
| Meters | None | ~5 hooks + fix 4 catch blocks | P3 - 1.5 days |
| Customers | Register module | ~5 hooks | P4 - 1 day |
| Locations | Register module | ~2 hooks | P5 - 0.5 day |
| Readings | 4 new endpoints | ~4 hooks | P6 - 1 day |
| Reports/Alerts/Tickets | New controllers | ~5 hooks | P7 - 3 days |
| **TOTAL** | **Varies** | **~38 hooks + fixes** | **~8.5 days** |
