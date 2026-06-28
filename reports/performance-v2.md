# Performance Certification v2 — Sprint 40-43

**Date:** 2026-06-25  
**Scope:** Database indexes, N+1 queries, aggregation patterns, pagination

---

## 1. Index Analysis

### Existing Indexes (OK)

| Table | Index | Status |
|-------|-------|--------|
| AuditLog | `@@index([createdAt])` | ✅ |
| RefreshToken | `@@index([userId])`, `@@index([token])` | ✅ |
| LoginAttempt | `@@index([userId, attemptedAt])` | ✅ |
| Notification | `@@index([userId, isRead])`, `@@index([createdAt])` | ✅ |
| Ticket | `@@index([status])`, `@@index([assignedTo])` | ✅ |
| CoreAuditLog | `@@index([createdAt])`, `@@index([userId])`, `@@index([entityType, entityId])` | ✅ |
| CustomerLedgerEntry | `@@index([customerId])`, `@@index([entryDate])` | ✅ |
| InvoiceLine | `@@index([invoiceId])` | ✅ |

### Missing Indexes (Critical — sim_system schema)

| Table | Missing Index | Impact | Priority |
|-------|--------------|--------|----------|
| **Invoice** | `@@index([projectId])` | Full table scan on project invoice list | P0 |
| **Invoice** | `@@index([customerId])` | Full scan on customer statement | P0 |
| **Invoice** | `@@index([status])` | Full scan on status-filtered queries | P1 |
| **Invoice** | `@@index([billingPeriodId])` | Full scan on period billing | P0 |
| **Invoice** | `@@index([dueAt])` | Full scan on aging queries | P1 |
| **Invoice** | `@@index([projectId, status])` | Composite — billing list view | P0 |
| **Invoice** | `@@index([customerId, status])` | Composite — customer statements | P0 |
| **InvoiceLine** | `@@index([chargeGroup])` | Report queries | P2 |
| **InvoiceAdjustment** | `@@index([invoiceId])` | Adjustment lookups | P1 |
| **Payment** | `@@index([projectId])` | Project payment reports | P0 |
| **Payment** | `@@index([customerId])` | Customer payment history | P0 |
| **Payment** | `@@index([status])` | Status-filtered queries | P1 |
| **Payment** | `@@index([paymentDate])` | Date-range queries | P1 |
| **PaymentAllocation** | `@@index([paymentId])`, `@@index([invoiceId])` | Allocation lookups | P1 |
| **Reading** | `@@index([projectId])` | Project reading list | P0 |
| **Reading** | `@@index([meterId])` | Readings by meter | P0 |
| **Reading** | `@@index([status])` | Status-filtered queries | P1 |
| **Reading** | `@@index([projectId, readingAt])` | Composite — billing period queries | P0 |
| **Reading** | `@@index([meterId, readingAt])` | Composite — consumption timeline | P1 |
| **Meter** | `@@index([projectId])` | Project meter list | P1 |
| **Meter** | `@@index([status])` | Status-filtered queries | P1 |
| **Customer** | `@@index([projectId])` | Project customer list | P1 |
| **CustomerLedgerEntry** | `@@index([customerId, projectId])` | Statement queries | P0 |
| **AuditLog** | `@@index([actorId])`, `@@index([resourceType, resourceId])` | Audit queries by user/resource | P1 |

**Total missing: ~25+ indexes**

---

## 2. N+1 Query Fixes Applied

| Issue | File | Fix | Status |
|-------|------|-----|--------|
| Invoice line loading (separate query per invoice) | `billing.controller.ts` | Batched `findMany` with `invoiceId: { in: [...] }` | ✅ Open PR |
| Invoice generation (N creates per meter) | `billing.controller.ts` | Not yet fixed — still creates invoices one-by-one | ❌ |
| Invoice PDF (8 sequential queries) | `invoices.controller.ts` | Not yet converted to Prisma `include` | ❌ |
| `readings.toDto()` N+1 (separate meter query per reading) | `readings.service.ts` | Not yet batch-loaded | ❌ |
| Batch download (N queries per invoice) | `invoices.controller.ts` | Not yet batched | ❌ |
| User access resolution per request | `user-access.service.ts` | Not yet cached | ❌ |

---

## 3. Critical N+1 Patterns Remaining

| Pattern | File | Problem | Severity |
|---------|------|---------|----------|
| **KPI: getExecutiveKpis** | `kpi.service.ts:13-111` | Loads ALL invoices into memory, `.filter()` in O(n²) per project | 🔴 CRITICAL |
| **KPI: getUtilityKpis** | `kpi.service.ts:158-194` | `Array.find()` in loop = O(n²), loads ALL invoices/meters/readings | 🔴 CRITICAL |
| **KPI: getCollectionKpis** | `kpi.service.ts:113-156` | Full table load, in-memory aging bucket with manual date filtering | 🔴 CRITICAL |
| **Invoice generation** | `billing.controller.ts:88-155` | For-loop creates each invoice + lines individually — 3000+ queries for 1000 meters | 🔴 CRITICAL |
| **PDF generation** | `invoices.controller.ts:25-128` | 8 sequential DB queries per PDF | 🟡 MEDIUM |
| **Report generation** | `report-generation.service.ts` | Multiple methods load all records then aggregate in-memory | 🟡 MEDIUM |
| **Batch download** | `invoices.controller.ts:148-150` | N+1 invoice line queries per batch invoice | 🟡 MEDIUM |

---

## 4. Pagination Gaps

| Endpoint | Status | Risk |
|----------|--------|------|
| `GET /billing/invoices` | ❌ No pagination — could return 100K+ | HIGH |
| `GET /projects/:pid/customers` | ❌ No pagination | HIGH |
| `GET /meters` | ❌ No pagination | HIGH |
| `GET /readings` | ❌ No pagination — fastest-growing table | HIGH |
| `GET /payments` | ❌ No pagination | HIGH |
| `GET /billing/tariffs` | ✅ Small table — LOW risk | LOW |
| `GET /billing/periods` | ✅ Small table — LOW risk | LOW |

---

## 5. Rate Limiting Configuration

| Layer | Limit | Scope | Status |
|-------|-------|-------|--------|
| NestJS ThrottlerGuard (global) | 100 req/60s | All routes | ✅ |
| express-rate-limit (global) | 100 req/60s | All routes (defense-in-depth) | ✅ |
| express-rate-limit (login) | 5 req/60s | `/api/v1/auth/login` | ✅ |
| API Gateway (custom) | 60 req/min | Gateway level | ⚠️ Custom impl, not using installed library |

### Issues
- Global limit is per-user, not per-IP — one user can exhaust shared bucket
- No Redis-backed distributed rate limiting
- API Gateway not using installed `express-rate-limit` library (v7.4.0)

---

## 6. Performance Scoreboard

| Category | Finding | Count | Urgency |
|----------|---------|-------|---------|
| Missing indexes | `sim_system` schema | ~25+ | 🔴 HIGH |
| N+1 query patterns | Critical KPI endpoints, invoice gen, PDF gen | 6 instances | 🔴 HIGH |
| In-memory aggregation | KPI, reports — full table loads | 6+ instances | 🟡 MEDIUM |
| Full table scans | KPI endpoints load ALL invoices/payments/meters | 3 critical methods | 🔴 HIGH |
| O(n²) loop patterns | `kpi.service.ts:186` Array.find in loop | 1 instance | 🔴 HIGH |
| Missing pagination | Major list endpoints | 5 endpoints | 🔴 HIGH |
| Report loading (no pagination) | All report types | 44 report types | 🟡 MEDIUM |

---

## Certification Verdict

| Criterion | Status |
|-----------|--------|
| All missing indexes added | ❌ — 25+ still missing |
| N+1 patterns in KPI fixed | ❌ — 3 critical patterns remain |
| List endpoints paginated | ❌ — 5 major endpoints lack pagination |
| Invoice generation optimized | ❌ — still creates N queries per meter |
| PDF generation optimized | ❌ — 8 queries per PDF |
| Rate limiting adequate | ⚠️ Partial — login has 5/min, global has 100/min |
| Caching implemented | ❌ — no caching layer for user access or KPI data |

**Verdict: ❌ NOT CERTIFIED** — Performance has systemic issues. Dashboard pages will fail under production load. Estimated 5-7 days to remediate all high-priority items.

### Quick Wins (Low Effort, High Impact)

| Action | Effort | Impact |
|--------|--------|--------|
| Add 6 critical indexes (Invoice, Reading, Payment) | 1 hour | Eliminates table scans on billing queries |
| Add `page`/`pageSize` to customer/meter/reading lists | 4 hours | Prevents memory exhaustion |
| Fix `readings.toDto()` N+1 via batch-load | 2 hours | Eliminates N+1 on reading list |
| Replace `Array.find()` with `Map` in KPI service | 1 hour | Fixes O(n²) in utility KPI |
| Add `take` limit to KPI queries | 1 hour | Prevents full table loads |
