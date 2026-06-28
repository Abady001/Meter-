# U11 — EXECUTIVE BOARD — Platform Consolidation

**Date**: 2026-06-18
**Target**: نظام التحصيلات — Unified Enterprise Utility Platform
**Systems**: Collections + SBill + Collection System → One Platform

---

## Domain Readiness

| Domain | Report | Verdict |
|--------|--------|---------|
| **Customer Domain** | Customers, Owners, Tenants, Companies, Government | **PARTIAL** (Companies/Gov types defined, owners/tenants in schema) |
| **Property Domain** | Areas, Districts, Buildings, Projects, Units | **PARTIAL** (Units page missing, districts not implemented) |
| **Utility Domain** | Electricity, Water, Gas, Solar, Chilled Water | **NO** (Only electricity + water implemented) |
| **Meter Domain** | Inventory, Assign, Replace, Terminate, Inspect | **PARTIAL** (Inspection not implemented) |
| **Reading Domain** | Manual, Review Queue, Approve/Reject | **NO** (No approve/reject workflow) |
| **Tariff Domain** | Unified engine for all 5 utilities | **NO** (Simple flat rate only) |
| **Billing Domain** | Generate, Review, Approve, Issue, Adjust, Credit/Debit | **NO** (Generation broken, all actions toast) |
| **Collection Domain** | Record, Allocate, Reverse, Refund, Track | **NO** (Recording broken, tracking missing) |
| **Reporting Domain** | Statements, Aging, Revenue, Collections | **NO** (Zero report generation) |
| **RBAC Domain** | 16-profile authorization | **PARTIAL** (9 roles unused, 0 seeded in DB) |

## Final Verdicts

```
CUSTOMER_DOMAIN_READY    = PARTIAL
PROPERTY_DOMAIN_READY    = PARTIAL
UTILITY_DOMAIN_READY     = NO
METER_DOMAIN_READY       = PARTIAL
READING_DOMAIN_READY     = NO
TARIFF_DOMAIN_READY      = NO
BILLING_DOMAIN_READY     = NO
COLLECTION_DOMAIN_READY  = NO
REPORTING_DOMAIN_READY   = NO
RBAC_DOMAIN_READY        = PARTIAL
────────────────────────────────────
CONSOLIDATION_READY      = NO
READY_FOR_IMPLEMENTATION = NO
```

---

## Consolidation Blueprint

### What Exists in Collections (Current) ✅
| Component | Maturity |
|-----------|----------|
| Backend NestJS architecture | High |
| Prisma + PostgreSQL multi-schema | High |
| JWT + 16-profile RBAC | Medium (9 roles unused) |
| Customer, Meter, Reading CRUD | High (backend) |
| Invoice listing | High |
| Payment listing | High |
| Location/Building/Unit CRUD | High |
| Sidebar navigation | High |
| Dashboard | Medium (mock KPIs) |

### What Exists in SBill Reference 🟡
| Component | Value |
|-----------|-------|
| Tiered tariff slabs | Business logic reference |
| Claims/disputes workflow | Business logic reference |
| Fawry payment gateway | Integration reference |
| JasperReport templates (44) | Report design reference |
| SEP2 polling cycle | Integration reference |
| Customer portal (Energy360) | Portal design reference |

### What Exists in Collection System Reference 🟡
| Component | Value |
|-----------|-------|
| Solar wallet (kWh) | Business logic reference |
| Chilled water billing | Business logic reference |
| Self-healing infrastructure | Operations reference |
| Bilingual AR/EN | UX reference |
| API control panel | Admin design reference |

### What Overlaps 🔴
| Domain | Collections | SBill | Collection System |
|--------|------------|-------|-------------------|
| Customers | ✅ Existing | ✅ SBill data | ✅ Flask data |
| Meters | ✅ Existing | ✅ SBill data | ✅ Flask data |
| Readings | ✅ Existing | ✅ Monthly readings | ✅ Flask readings |
| Invoices | ⚠️ Broken | ✅ SBill invoices | ✅ Flask invoices |
| Payments | ⚠️ Broken | ✅ SBill payments | ✅ Flask payments |
| Tariffs | ⚠️ Simple | ✅ Tiered slabs | ✅ Multi-charge |

### What is Missing 🔴
| Domain | Missing Component |
|--------|------------------|
| Billing | Invoice generation (500), issue, adjust, download, credit/debit notes |
| Collections | Payment record, reverse, reconcile, track, aging |
| Tariffs | Multi-charge engine, tiered pricing, gas/solar/chilled water rates |
| Utilities | Gas, solar, chilled water (no backend, no frontend) |
| Reports | All PDF/CSV/Excel generation |
| Notifications | Bell, dropdown, API, push/SMS/email |
| Customer Portal | Self-service, statement view, online payment |
| Reading Workflow | Approve/reject, mobile reading |
| Meter Inspection | Inspection scheduling, results tracking |

### What Must Be Merged 🔄
| Area | Strategy |
|------|----------|
| Tariff models | Move features schema models → sim_schema |
| Solar wallet | Build service + API + UI from features schema |
| Chilled water | Build service + API + UI from features schema |
| SBill billing logic | Reference for invoice generation fix |
| Collection System reports | Reference for report generation |

### What Must Remain Separate ➡️
| Component | Reason |
|-----------|--------|
| Area schemas (15 DBs) | Per-tenant data isolation |
| Symbiot bridge (separate service) | Communication channel — separate concern |
| Collection System (end-of-life) | Read-only reference after migration |
| SBill (end-of-life) | Read-only reference after migration |

---

## Exact Implementation Order

```
1. P0: Fix critical business workflows (82h)
   ├─ Fix invoice generation (2h)
   ├─ Wire toast buttons → API (12h)
   ├─ Build download infrastructure (20h)
   ├─ Build notification system (8h)
   ├─ Build project CRUD (8h)
   ├─ Fix branding (2h)
   └─ Wire 8 mock pages → API (30h)

2. P1: Billing consolidation (60h)
   ├─ Tariff service + UI (16h)
   ├─ Reading approve/reject (6h)
   ├─ Invoice issue/adjust (8h)
   ├─ Payment record/reverse (6h)
   ├─ Invoice PDF (12h)
   └─ Schema merge: features → sim_system (12h)

3. P2: Collections consolidation (40h)
   ├─ Collections dashboard + aging + tracking + statements (30h)
   └─ Payment reconciliation (10h)

4. P3: Utility expansion (60h)
   ├─ Gas enum + types (2h)
   ├─ Solar service + UI (20h)
   ├─ Chilled water service + UI (20h)
   ├─ Fix MeterType mismatch (2h)
   └─ Unified tariff engine expansion (16h)

5. P4: Reporting (40h)
   ├─ CSV/Excel for all tables (16h)
   ├─ Revenue + collection reports (16h)
   └─ SBill JasperReport reference (8h)

6. P5: Optimization + hardening (40h)
   ├─ Pagination (8h)
   ├─ N+1 fixes (8h)
   ├─ RBAC seed + wire (6h)
   ├─ Dockerignore + build fixes (3h)
   ├─ Missing indexes (4h)
   └─ Security fixes (8h)
```

---

## Board Decision

| Gate | Value |
|------|-------|
| CONSOLIDATION_READY | **NO** |
| READY_FOR_IMPLEMENTATION | **NO** — P0 (Critical Recovery) must be completed first |

The platform has a **solid architectural foundation** (NestJS, Prisma, JWT/RBAC, multi-schema) but is **missing ~60% of the required business functionality** from the SBill and Collection System references. The 6-phase recovery plan (322h estimated) will transform the current system into the unified **نظام التحصيلات** platform.
