# Performance Certification v3 — Production Targets

**Date:** 2026-06-25
**Sources:** `reports/performance-remediation-board.md`, `reports/performance-v2.md`

---

## 1. Missing Database Indexes

### sim_system Schema — Critical (25+ Missing)

| Table | Missing Indexes | Priority | Impact |
|-------|----------------|----------|--------|
| **Invoice** | `projectId`, `customerId`, `status`, `billingPeriodId`, `dueAt`, `projectId+status` (composite), `customerId+status` (composite) | P0 | Full table scans on all billing queries |
| **InvoiceLine** | `invoiceId` (exists), `chargeGroup` | P2 | Report queries |
| **InvoiceAdjustment** | `invoiceId`, `adjustmentType` | P1 | Adjustment lookups |
| **Payment** | `projectId`, `customerId`, `status`, `paymentDate` | P0 | Full scans on payment reports |
| **PaymentAllocation** | `paymentId`, `invoiceId` | P1 | Allocation lookups |
| **CustomerLedgerEntry** | `customerId+projectId` (composite), `entryDate` | P0 | Statement queries |
| **Reading** | `projectId`, `meterId`, `status`, `projectId+readingAt` (composite), `meterId+readingAt`(composite) | P0 | Billing period queries |
| **ReadingReview** | `readingId`, `reviewAction` | P1 | Review lookups |
| **Meter** | `projectId`, `status`, `meterType` | P1 | Meter list queries |
| **Customer** | `projectId` (exists), `status` | P1 | Customer list queries |
| **AuditLog** | `actorId`, `resourceType+resourceId` | P1 | Audit queries |

### Fix Effort: 1 hour for 6 critical indexes (Invoice, Reading, Payment, Ledger)

---

## 2. N+1 Query Patterns — 6 Remaining Critical

| # | Pattern | File | Lines | Severity | Fix |
|---|---------|------|-------|----------|-----|
| 1 | **KPI getExecutiveKpis**: Loads ALL invoices → `.filter()` in O(n²) per project | `kpi.service.ts` | 13-111 | 🔴 CRITICAL | Rewrite with Prisma GROUP BY or raw SQL |
| 2 | **KPI getUtilityKpis**: `Array.find()` in loop O(n²) — loads ALL invoices/meters/readings | `kpi.service.ts` | 158-194 | 🔴 CRITICAL | Replace with `Map` lookup |
| 3 | **KPI getCollectionKpis**: Full table load, in-memory aging | `kpi.service.ts` | 113-156 | 🔴 CRITICAL | SQL `CASE WHEN` aggregation |
| 4 | **Invoice generation**: For-loop creates N queries per meter (1000 meters = 3000+ queries) | `billing.controller.ts` | 88-155 | 🔴 CRITICAL | Batch createMany or async queue |
| 5 | **readings.toDto()**: Separate meter query per reading in `.map()` | `readings.service.ts` | 14-51 | 🟡 MEDIUM | Batch-load meters |
| 6 | **PDF generation**: 8 sequential DB queries per PDF | `invoices.controller.ts` | 25-128 | 🟡 MEDIUM | Prisma `include` instead of separate queries |

---

## 3. Pagination Gaps — 5 Endpoints

| Endpoint | Status | Risk | Users Affected |
|----------|--------|------|----------------|
| `GET /billing/invoices` | ❌ No pagination | 100K+ rows returned | All billing users |
| `GET /projects/:pid/customers` | ❌ No pagination | 50K+ rows | Customer service |
| `GET /meters` | ❌ No pagination | 100K+ rows | Meter readers, ops |
| `GET /readings` | ❌ No pagination | Fastest-growing table | All users |
| `GET /payments` | ❌ No pagination | 100K+ rows | Cashiers, finance |

### Fix Effort: 4 hours to add `page`/`pageSize` to all 5 endpoints

---

## 4. Caching Needs

| Data | Current | Needed | Impact | Effort |
|------|---------|--------|--------|--------|
| User access resolution | DB query per request | In-memory cache (TTL 5 min) | Eliminates N+1 on every page load | 2h |
| KPI dashboard data | Full table scan every load | Redis cache (TTL 15 min) | Eliminates 3 critical N+1 patterns | 4h |
| Tariff definitions | DB query per invoice | In-memory cache (TTL 1h) | Reduces tariff lookup overhead | 1h |
| Project settings | DB query per request | In-memory cache (TTL 1h) | Reduces repeated project queries | 1h |
| Reading review queue | DB query per poll | Short TTL cache (30s) | Reduces DB load on review dashboard | 1h |
| Report data | Full table reload per report | Materialized views or summary tables | Eliminates 44 report table scans | 8h |

### Caching Implementation: ~17 hours

---

## 5. Performance Scoreboard

| Issue | Count | Severity | Fixed | Remaining |
|-------|-------|----------|-------|-----------|
| Missing indexes (sim_system) | ~25+ | 🔴 HIGH | 0 | 25+ |
| N+1 query patterns | 6 | 🔴 HIGH | 0 | 6 |
| In-memory aggregation | 6+ | 🟡 MEDIUM | 0 | 6+ |
| Full table scans in KPI | 3 methods | 🔴 HIGH | 0 | 3 |
| O(n²) loop patterns | 1 (`kpi.service.ts:186`) | 🔴 HIGH | 0 | 1 |
| Missing pagination | 5 endpoints | 🔴 HIGH | 0 | 5 |
| Report loading no pagination | 44 report types | 🟡 MEDIUM | 0 | 44 |
| Rate limiting gaps | 3 (Redis, Gateway, per-IP) | 🟡 MEDIUM | 0 | 3 |
| Caching layer | 6 areas | 🟡 MEDIUM | 0 | 6 |

---

## 6. Quick Wins (Low Effort, High Impact)

| Action | Effort | Impact | 
|--------|--------|--------|
| Add 6 critical indexes (Invoice, Reading, Payment, Ledger) | 1 hour | Eliminates table scans on billing queries |
| Add `page`/`pageSize` to list endpoints | 4 hours | Prevents memory exhaustion |
| Fix `readings.toDto()` N+1 via batch-load | 2 hours | Eliminates N+1 on reading list |
| Replace `Array.find()` with `Map` in KPI service | 1 hour | Fixes O(n²) in utility KPI |
| Add `take` limit to KPI queries | 1 hour | Prevents full table loads |
| Add user access cache | 2 hours | Eliminates access resolution overhead |

---

## 7. Production Performance Target

| Metric | Current | Target | 
|--------|---------|--------|
| Dashboard page load (KPI) | >30s (full table scans) | <3s (cached + aggregated) |
| Invoice list (100K invoices) | >10s (no pagination, no indexes) | <1s (indexed + paginated) |
| Invoice generation (1000 meters) | >60s (N+1, no batch) | <10s (batch + bulk operations) |
| Reading list (500K readings) | >15s (no pagination) | <2s (paginated + indexed) |
| Report generation (any type) | >30s (full table load) | <5s (materialized views) |
| PDF generation (single invoice) | ~2s (8 queries) | <500ms (include + caching) |
| API response time (p95) | >5s | <500ms |
| Concurrent users supported | ~50 (in-memory only) | ~500 (with Redis caching) |
| Database CPU usage | >80% (full scans) | <30% (indexed queries) |
| Rate limiting | 100 req/min (single instance) | 1000 req/min (distributed with Redis) |

### Remediation Plan

| Phase | Items | Effort | Impact |
|-------|-------|--------|--------|
| **Sprint 1** | 6 critical indexes + `readings.toDto()` batch-load + KPI `Map` fix + `take` limits | 1 day | Eliminates 4 critical patterns |
| **Sprint 2** | Pagination on 5 endpoints + user access cache + tariff cache + project cache | 1 day | Prevents memory exhaustion |
| **Sprint 3** | KPI aggregation rewrite (SQL GROUP BY) + report materialized views | 3 days | Eliminates 3 critical N+1 patterns |
| **Sprint 4** | Invoice generation batch + Redis caching layer + rate limiting distribution | 3 days | Production-scale performance |
| **Total** | **All items** | **~8 days** | **Production ready** |
