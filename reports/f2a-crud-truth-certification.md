# Phase F2A — CRUD Truth Certification

**Date**: 2026-06-18
**Method**: Full-stack trace: UI button → Component → Hook → API Client → Endpoint → Controller → Service → Repository
**Source**: Source code analysis + Playwright interaction verification + Backend controller inventory
**Backend**: `host.docker.internal:3001` — DOWN (all API calls return `ERR_CONNECTION_REFUSED`)

---

## Certification Matrix

### CUSTOMERS

| Action | Button | Component | Hook/API | Endpoint | Backend Has? | Result | Classification |
|--------|--------|-----------|----------|----------|-------------|--------|---------------|
| **CREATE** | `Add Customer` | `toast.info('Add Customer dialog')` | — | — | ✅ `POST /projects/:id/customers` | Toast stub only | NO_IMPLEMENTATION |
| **READ (list)** | — | `CustomersPage.tsx:30` | `useCustomersList()` → `apiGet('/projects/${projectId}/customers')` | `GET /api/v1/projects/:projectId/customers` | ✅ FULL | Falls back to `mockCustomers` (query disabled when no filter) | MOCK_STATE_ONLY |
| **READ (detail)** | `View` row action | `CustomerDetailPage.tsx:19` | Direct mock: `mockCustomers.find()` | — | ✅ `GET /projects/:id/customers/:id` | Pure mock, no hook call | MOCK_STATE_ONLY |
| **UPDATE** | `Edit` row action | `toast.info('Edit: ' + name)` | — | — | ✅ `PATCH /projects/:id/customers/:id` | Toast stub only | NO_IMPLEMENTATION |
| **DELETE** | `Delete` row action | `toast.info('Delete: ' + name)` | — | — | ✅ `DELETE /projects/:id/customers/:id` | Toast stub only | NO_IMPLEMENTATION |

**Break points**:
- CREATE: `CustomersPage.tsx:86` — `onClick={() => toast.info(...)}` stops at component
- UPDATE: `CustomersPage.tsx:68` — `onClick={() => toast.info(...)}` stops at component
- DELETE: `CustomersPage.tsx:71` — `onClick={() => toast.info(...)}` stops at component
- READ detail: `CustomerDetailPage.tsx:19` — `mockCustomers.find()` — entire page is mock-only

**Trace** (example: CREATE):
```
Button "Add Customer"
→ PageHeader action (CustomersPage.tsx:86)
→ toast.info()   ← BREAK POINT — no hook, no API, no endpoint
```

**CUSTOMERS_CERTIFIED = NO**

---

### METERS

| Action | Button | Component | Hook/API | Endpoint | Backend Has? | Result | Classification |
|--------|--------|-----------|----------|----------|-------------|--------|---------------|
| **CREATE (list)** | — | `MetersPage.tsx:20` | `useMetersList()` → `apiGet('/meters')` | `GET /api/v1/meters` | ✅ FULL | Falls back to `mockMeters` | MOCK_STATE_ONLY |
| **CREATE (add)** | `Add Meter` | `toast.info('Add Meter dialog would open')` | — | — | ✅ `POST /meters` | Toast stub only | NO_IMPLEMENTATION |
| **READ (detail)** | `View` row action | → `navigate('meter-detail')` → `MeterDetailPage` | `useMeterDetail(id)` exists but might not be used | `GET /api/v1/meters/:id` | ✅ FULL | **STUCK ON LOADING** — no mock fallback for detail | API_FAILURE |
| **CREATE (assign)** | `Assign Meter` (sidebar) | `MeterAssignPage.tsx` | None — pure mock wizard | — | ✅ `POST /meters/:id/assign` | 9-step wizard, confirm = toast only | MOCK_STATE_ONLY |
| **UPDATE (replace)** | `Replace Meter` (sidebar) | `MeterReplacePage.tsx:53-73` | `useReplaceMeter()` → `POST /meters/:id/terminate` + `POST /meters/:id/assign` | `POST /api/v1/meters/:id/{terminate,assign}` | ✅ FULL | **WIRED to live API** but: (1) `catch` block shows success on error, (2) backend down | REAL_API_WIRED |
| **DELETE (terminate)** | `Terminate Meter` (sidebar) | `MeterTerminatePage.tsx:50-65` | `useTerminateMeter()` → `POST /meters/:id/terminate` | `POST /api/v1/meters/:id/terminate` | ✅ FULL | **WIRED to live API** but `catch` block hides error | REAL_API_WIRED |
| **DELETE (row)** | `Delete` row action | `toast.info('Delete meter: ' + serial)` | — | — | ✅ `DELETE /meters/:id` | Toast stub only | NO_IMPLEMENTATION |
| **UPDATE (edit row)** | `Edit` row action | `toast.info('Edit meter: ' + serial)` | — | — | ✅ `PATCH /meters/:id` | Toast stub only | NO_IMPLEMENTATION |

**Break points**:
- CREATE (add): `MetersPage.tsx:78` — `toast.info(...)` 
- REPLACE: Hook calls real API, but `catch { toast.success(...) }` on line 72 hides failure → **misleading UX**
- TERMINATE: Same pattern — `catch { toast.success(...) }` on line 63 → **misleading UX**
- DETAIL: `MeterDetailPage` — need to verify, likely uses `useMeterDetail(id)` hook but backend is down

**Trace** (example: REPLACE — the most advanced path):
```
Button (Replace Meter sidebar) → MeterReplacePage.tsx:170
→ handleConfirm() (line 53)
→ validate() (line 52)
→ replaceMutation.mutateAsync(...) (line 69)
  → useReplaceMeter (use-replace-meter.ts:19)
    → apiPost('/meters/${oldMeterId}/terminate', ...)  (line 23)
      → POST /api/v1/meters/:id/terminate  ← BACKEND DOWN → ERR_CONNECTION_REFUSED
    → apiPost('/meters/${newMeterId}/assign', ...)  (line 29)  ← never reached
      → POST /api/v1/meters/:id/assign
  → catch { toast.success(...) }  ← MISLEADING — shows success on failure
```

**METERS_CERTIFIED = NO**

---

### UNITS (Locations)

| Action | Button | Component | Hook/API | Endpoint | Backend Has? | Result | Classification |
|--------|--------|-----------|----------|----------|-------------|--------|---------------|
| **CREATE (building)** | `Add Building` | `toast.info('Add Building dialog')` | — | — | ✅ `POST /projects/:id/locations` | Toast stub only | NO_IMPLEMENTATION |
| **CREATE (unit)** | No button | — | — | — | ✅ `POST /projects/:id/locations` | No UI | NO_IMPLEMENTATION |
| **READ (list)** | — | `LocationsPage.tsx:48` | `useLocationsList()` → `apiGet('/projects/${id}/locations')` | `GET /api/v1/projects/:projectId/locations` | ✅ FULL | Empty when backend down (no mock fallback) | API_FAILURE |
| **READ (detail)** | Building expand | `LocationsPage.tsx:134-174` | Derived from `apiLocations` | — | ✅ `GET /projects/:id/locations/:id` | Read-only tree | MOCK_STATE_ONLY |
| **UPDATE** | No button | — | — | — | ✅ `PATCH /projects/:id/locations/:id` | No UI | NO_IMPLEMENTATION |
| **DELETE** | No button | — | — | — | ✅ `DELETE /projects/:id/locations/:id` | No UI | NO_IMPLEMENTATION |

**Break points**:
- ALL CRUD except READ: No UI implementation whatsoever
- READ list: No mock fallback — `apiLocations` has no `?? mockLocations` pattern

**UNITS_CERTIFIED = NO**

---

### READINGS

| Action | Button | Component | Hook/API | Endpoint | Backend Has? | Result | Classification |
|--------|--------|-----------|----------|----------|-------------|--------|---------------|
| **CREATE** | ReadingNewPage Submit | `ReadingNewPage.tsx:65-83` | `useCreateReading()` → `apiPost('/readings', data)` | `POST /api/v1/readings` | ✅ FULL | **WIRED to live API** with proper try/catch | REAL_API_WIRED |
| **READ (list)** | — | `ReadingsPage.tsx` | `useReadingsList()` → `apiGet('/readings' + ?projectId=...)` | `GET /api/v1/readings` | ❌ **MISSING** (only `GET /readings/review-queue` exists) | API call fails, falls back to `mockReadings` | API_FAILURE |
| **READ (detail)** | — | — | `useReadingDetail(id)` → `apiGet('/readings/${id}')` | `GET /api/v1/readings/:id` | ❌ **MISSING** | Hook exists, no UI, endpoint doesn't exist | NO_IMPLEMENTATION |
| **UPDATE** | No button | — | — | — | ❌ **MISSING** (no PATCH/PUT reading) | No UI | NO_IMPLEMENTATION |
| **DELETE** | No button | — | — | — | ❌ **MISSING** (no DELETE reading) | No UI | NO_IMPLEMENTATION |

**Critical**: The frontend calls `GET /readings` but the backend only has `GET /readings/review-queue`. **The list endpoint doesn't exist.**

**Trace** (CREATE — the working path):
```
ReadingNewPage Submit button (ReadingNewPage.tsx:186)
→ handleSubmit() (line 65)
  → readingSchema.safeParse(form)  ← Zod validation
  → createReading.mutateAsync({...}) (line 72)
    → useCreateReading (use-readings.ts:29)
      → apiPost<Reading>('/readings', data) (line 33)
        → POST /api/v1/readings  ← BACKEND DOWN → ERR_CONNECTION_REFUSED
      → queryClient.invalidateQueries(['readings'])  ← never reached
  → catch { toast.error(...) }  ← CORRECTLY reports failure
```

**READINGS_CERTIFIED = NO**

---

### INVOICES

| Action | Button | Component | Hook/API | Endpoint | Backend Has? | Result | Classification |
|--------|--------|-----------|----------|----------|-------------|--------|---------------|
| **CREATE (generate)** | `Generate Invoices` | `toast.info('Create Invoice dialog...')` | — | — | ✅ `POST /invoices/generate` | Toast stub only | NO_IMPLEMENTATION |
| **READ (list)** | — | `InvoicesPage.tsx:22-23` | `useInvoicesList()` → `apiGet('/invoices?...')` + `mapInvoice()` | `GET /api/v1/invoices?projectId=&customerId=&status=` | ✅ FULL | Shows empty state (API mode, backend down) | API_FAILURE |
| **READ (detail)** | `View` row action | → `navigate('invoice-detail')` → `InvoiceDetailPage` | `useInvoiceDetail(id)` → `GET /invoices/:id` + `mapInvoice()` | `GET /api/v1/invoices/:id` | ✅ FULL | **STUCK ON LOADING** — no mock fallback | API_FAILURE |
| **UPDATE (edit)** | `Edit` row action | `toast.info('Edit invoice')` | — | — | ❌ **MISSING** (no PATCH/PUT invoice) | Toast stub | NO_IMPLEMENTATION |
| **UPDATE (issue)** | `Issue` row action | `toast.info('Invoice issued')` | — | — | ✅ `POST /invoices/:id/issue` | Toast stub | NO_IMPLEMENTATION |
| **UPDATE (cancel)** | `Cancel` row action | `toast.info('Invoice cancelled')` | — | — | ❌ **MISSING** | Toast stub | NO_IMPLEMENTATION |
| **UPDATE (adjust)** | No button | — | — | — | ✅ `POST /invoices/:id/adjustments` | No UI | NO_IMPLEMENTATION |
| **DELETE** | No button | — | — | — | ❌ **MISSING** | No UI | NO_IMPLEMENTATION |

**Critical**: `useInvoicesList()` has `mapInvoice()` that depends on `mockCustomers.find()`, `mockProjects.find()`, `mockMeters.find()` — **the mapper will use WRONG mock data even when real API succeeds**.

**INVOICES_CERTIFIED = NO**

---

### PAYMENTS

| Action | Button | Component | Hook/API | Endpoint | Backend Has? | Result | Classification |
|--------|--------|-----------|----------|----------|-------------|--------|---------------|
| **CREATE (record)** | `Record Payment` dialog submit | `PaymentsPage.tsx:114` — Dialog with form fields | BUT save is `toast.success('Payment recorded!')` — **no API call** | — | ✅ `POST /payments` | Dialog renders, save is toast only | MOCK_STATE_ONLY |
| **READ (list)** | — | `PaymentsPage.tsx:27-28` | `usePaymentsList()` → `apiGet('/payments?...')` + `mapPayment()` | `GET /api/v1/payments?projectId=&customerId=` | ✅ FULL | Shows empty state (API mode, backend down) | API_FAILURE |
| **READ (detail)** | `View` row action | `toast.info('View payment')` | — | — | ✅ `GET /payments/:id` | Toast stub | NO_IMPLEMENTATION |
| **UPDATE (edit)** | `Edit` row action | `toast.info('Edit payment')` | — | — | ❌ **MISSING** | Toast stub | NO_IMPLEMENTATION |
| **DELETE** | `Delete` row action | `toast.info('Delete payment')` | — | — | ✅ `POST /payments/:id/reverse` (reverse, not delete) | Toast stub | NO_IMPLEMENTATION |

**Critical**: Record Payment dialog has a full form (Customer, Amount, Method, Notes) but the Save button is `toast.success()` only — **no API call to `POST /payments`**.

**PAYMENTS_CERTIFIED = NO**

---

## Summary Certification

| Module | CREATE | READ | UPDATE | DELETE | Certification |
|--------|--------|------|--------|--------|-------------|
| **Customers** | 🟡 Toast stub | 🟡 Mock list / Mock detail | 🟡 Toast stub | 🟡 Toast stub | **❌ NO** |
| **Meters** | 🟡 Toast stub | 🟡 Mock list / Stuck detail | 🟢 Wired (replace) but catch hides error | 🟢 Wired (terminate) but catch hides error | **❌ NO** |
| **Units/Locations** | 🔴 No UI | 🔴 Empty when API down (no mock) | 🔴 No UI | 🔴 No UI | **❌ NO** |
| **Readings** | 🟢 Wired (create) | 🔴 Endpoint mismatch (list/review-queue) | 🔴 No UI | 🔴 No UI | **❌ NO** |
| **Invoices** | 🟡 Toast stub | 🟡 API mode, empty when down | 🟡 Toast stubs (issue/adjust exist but not used) | 🔴 No UI | **❌ NO** |
| **Payments** | 🟡 Toast stub (dialog exists but no API) | 🟡 API mode, empty when down | 🟡 Toast stub | 🟡 Toast stub (reverse endpoint exists) | **❌ NO** |

**Legend**:
- 🟢 REAL_API_WIRED — Has hook + correct endpoint + no mock bypass
- 🟡 MOCK/STUB — Uses mock data or toast-only
- 🔴 BROKEN — Endpoint mismatch, no UI, stuck loading, or missing endpoint

---

## Root Causes

### 1. Toast Stub Pattern (applies to ALL Create/Edit/Delete)
**Every** destructive action across all 6 modules follows this pattern:
```typescript
onClick={() => toast.info(t('resource.action'))}
```
This is not a bug — it's an intentional stub pattern. No real API is called.

### 2. Misleading Success (Meters Replace + Terminate)
```typescript
try { await apiCall(); toast.success('...'); }
catch { toast.success('...'); }  // <-- Hides real failure
```
Two pages (`MeterReplacePage`, `MeterTerminatePage`) **are wired to real APIs** but the `catch` block shows success on error, creating a false sense of reliability.

### 3. Endpoint Mismatch (Readings)
Frontend calls `GET /readings` and `GET /readings/:id`, but backend only has `GET /readings/review-queue`. There's also no PATCH or DELETE for readings. **The frontend and backend disagree on the readings API contract.**

### 4. Empty States with No Mock Fallback
Three patterns exist:
- Mock fallback: `const data = apiData ?? mockData` (Customers, Meters, Projects)
- API mode: `const data = useApi ? (apiData ?? []) : mockData` (Invoices, Payments — flag=api)
- No fallback: `const { data: apiData } = useX()` without `?? mockX` (Locations, detail pages)

### 5. Feature Flag Disconnect
Three pages (Invoices, Payments, Billing) default to `'api'` mode, which means:
- `isFeatureEnabled('invoices.list')` → `true`
- Result: `invoices = apiInvoices ?? []` → **empty array, not mock data**

### 6. `mapInvoice()` Depends on Mock Data
`use-invoices.ts:38-41`:
```typescript
const customer = mockCustomers.find(c => c.id === api.customerId);
const project = mockProjects.find(p => p.id === api.projectId);
const meter = mockMeters.find(m => m.id === api.meterId);
```
Even if the API succeeds, the mapper looks up **mock data** for display names. Real database IDs will not match mock `PRJ-001`, `EM-001` IDs.

---

## Certification Board

```
CUSTOMERS_CERTIFIED  = NO
METERS_CERTIFIED     = NO
UNITS_CERTIFIED      = NO
READINGS_CERTIFIED   = NO
INVOICES_CERTIFIED   = NO
PAYMENTS_CERTIFIED   = NO

READY_FOR_REAL_DATA_TESTING = NO
T089_APPROVED                = NO
```

## What Must Happen Before T089

1. **Wire every Create/Edit/Delete to real API** — remove all toast stubs
2. **Fix `catch { toast.success() }`** in MeterReplacePage and MeterTerminatePage
3. **Add missing readings endpoints** (`GET /readings`, `GET /readings/:id`) or align frontend with what backend offers
4. **Add mock fallback to LocationsPage** (`apiLocations ?? mockLocations`)
5. **Change Invoices/Payments feature flags to `'mock'`** or add mock fallback
6. **Fix `mapInvoice()` to not depend on mock data** — use API response fields directly
7. **Add create/update/delete reading hooks** (only create exists)
8. **Add invoice create/issue/adjust hooks** and wire to UI buttons
9. **Add payment create/reverse hooks** and wire to dialog save button
