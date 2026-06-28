# Billing Isolation Certification — Phase F
**Date**: 2026-06-25
**Domain**: Billing Engine / Invoice Lifecycle
**Level**: AUDIT

---

## 1. Current Billing Architecture

```
BillingController (backend/src/billing/billing.controller.ts)
  ├── POST /invoices/generate       → 202 Accepted (stub)
  ├── POST /invoices/:id/issue      → 200 OK (stub)
  └── POST /invoices/:id/adjustments → 201 Created (stub)

BillingModule (backend/src/billing/billing.module.ts)
  └── Registered in AppModule
```

The billing engine is in **stub phase** — all three invoice endpoints return success status codes but do not execute real billing logic.

## 2. Project-Scoped Billing (Current)

| Aspect | Implementation | Status |
|--------|---------------|--------|
| Per-project billing | BillingPeriods linked to projects via `projectId` FK | ✅ schema supports |
| Cross-project isolation | Project ID filtering in invoice generation | ⚠️ stubbed |
| Invoice generation trigger | Manual POST — no scheduler | ⚠️ manual only |
| Consumption aggregation | Readings grouped by meter → project | ⚠️ not wired |

## 3. Per-Area Queue Isolation (Gap)

| Requirement | Current State | Gap |
|-------------|--------------|-----|
| **Per-area billing queue** | No queue — billing runs synchronously per request | ❌ NOT IMPLEMENTED |
| **Sequential area processing** | No area ordering or dependency management | ❌ NOT IMPLEMENTED |
| **Area-level billing lock** | No mutex — concurrent billing calls would double-process | ❌ NOT IMPLEMENTED |
| **Per-area invoice generation** | Invoices generated globally without area scope | ❌ NOT IMPLEMENTED |
| **Area billing status** | No table tracking billing run per area/period | ❌ NOT IMPLEMENTED |
| **Failed area isolation** | One area failure blocks entire billing run | ❌ NOT IMPLEMENTED |

## 4. What Exists

- [x] **Billing module skeleton** — controller + module registered, endpoints respond
- [x] **Invoice data model** — `invoices`, `invoice_lines`, `invoice_adjustments` tables exist in Prisma schema
- [x] **BillingPeriod** model — supports period start/end dates per project
- [x] **Contract tests** — `invoice-generate.contract.spec.ts`, `invoice-issue.contract.spec.ts`, `invoice-adjustment.contract.spec.ts` exist
- [x] **Sync controller** — can trigger meter sync per area (prerequisite for billing data)

## 5. What's Needed

| Gap | Priority | Detail |
|-----|----------|--------|
| Per-area billing queue | CRITICAL | Add `area_billing_queue` table with status (pending/running/completed/failed), started_at, completed_at |
| Area isolation in invoice generation | CRITICAL | `POST /invoices/generate` must accept `x-area-id` and only process meters in that area |
| Billing lock | HIGH | Mutex per area: prevent concurrent `generate` calls for same area |
| Sequential processing | HIGH | Process areas sequentially or in dependency order (not parallel) |
| Failed area recovery | HIGH | Allow retry of individual failed areas without re-processing completed ones |
| Billing status dashboard | MEDIUM | Frontend view showing per-area billing status per period |
| Area-level notifications | MEDIUM | Alert when area billing fails or completes |

## 6. Proposed Queue Architecture

```
POST /invoices/generate (with x-area-id)
  → AreaGuard validates area access
  → BillingService.createBillingRun(areaId, periodId)
    → INSERT INTO area_billing_queue (area_id, period_id, status='pending')
    → Process sequentially:
        1. Lock area
        2. Query meters in area
        3. Aggregate readings
        4. Apply tariffs
        5. Generate invoices
        6. Update status='completed'
    → On failure: status='failed', error logged
```

## 7. Verdict

**BILLING ISOLATION: NOT YET CERTIFIED**

The billing controller exists as stubs and the data model supports per-project billing, but there is **no per-area queue isolation**. The billing engine would currently process all areas together without locking, sequencing, or failure isolation. This presents a critical risk in multi-tenant production.

**NO-GO** until:
1. `area_billing_queue` table created and wired
2. Invoice generation scoped to `x-area-id`
3. Mutex/lock per area to prevent double-billing
4. Sequential processing with per-area failure isolation
