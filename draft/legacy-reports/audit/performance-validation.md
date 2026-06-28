# Performance Validation Report — Meter Verse

**Generated:** 2026-06-25  
**Auditors:** Principal Security Engineer, Principal QA Architect

---

## 1. Prisma Query Patterns (N+1 Detection)

### 1.1 N+1 Pattern in Invoice Generation
**File:** illing/billing.controller.ts:88-155

The generateInvoices method loads ALL meters and ALL readings upfront, then iterates in a for-loop:

`	ypescript
for (const meter of meters) {          // 1 query for all meters
  const meterReadings = readings.filter(...); // in-memory filter (OK)
  // ... tariff engine call (may hit DB per iteration)
  await this.prisma.invoice.create(...)       // N queries (one per meter)
  for (const line of chargeLines) {           // N queries (one per line per meter)
    await this.prisma.invoiceLine.create(...)  // M queries per invoice
  }
}
`

**Impact:** For 1000 meters, this executes 1 + (1000 * invoice_lines) DB queries. Expect 3000+ queries.

**Mitigation:** Use prisma. with createMany for invoice lines, batch invoice creation.

### 1.2 N+1 Pattern in Invoice Lines Fetching
**File:** illing/billing.controller.ts:476-496

`	ypescript
const invoices = await this.prisma.invoice.findMany({ ... });  // 1 query
const lines = await this.prisma.invoiceLine.findMany({          // 1 query (batched)
  where: { invoiceId: { in: invoices.map((i) => i.id) } }
});
return invoices.map((inv) => ({
  ...inv,
  lines: lines.filter((l) => l.invoiceId === inv.id)...   // in-memory join (OK but manual)
}));
`

**Verdict:** This pattern is actually OK — batched query then in-memory join. Could use Prisma include for clarity.

### 1.3 N+1 Pattern in Invoice PDF Generation
**File:** invoices/invoices.controller.ts:25-128

`	ypescript
const inv = await this.prisma.invoice.findUnique({ where: { id } });  // 1 query
const lines = await this.prisma.invoiceLine.findMany(...);            // 2nd query
const project = await this.prisma.project.findUnique(...);            // 3rd query
const meter = await this.prisma.meter.findUnique(...);                // 4th query
const period = await this.prisma.billingPeriod.findUnique(...);       // 5th query
const customer = await this.prisma.customer.findUnique(...);          // 6th query
const readings = await this.prisma.reading.findMany(...);             // 7th query
const tariff = await this.prisma.tariffPlan.findFirst(...);           // 8th query
`

**Impact:** 8 sequential DB queries for a single PDF. Should use Prisma include to eager-load all related data.

**Mitigation:** Use include: { invoiceLines: true, project: true, meter: true, billingPeriod: true, customer: true } in a single query.

### 1.4 User Access Resolution (Cross-Cutting N+1)
**File:** uth/user-access.service.ts:17-44

Called by ProjectAccessInterceptor on EVERY request. For non-super-admin users:
- 1 query for role assignments (with include)
- 1 query for projects in areas

Called on every authenticated request — can be heavy if called per-request without caching.

**Mitigation:** Consider caching user access with TTL (e.g., 5 minutes) in Redis or in-memory cache.

### 1.5 Batch Download Iteration
**File:** invoices/invoices.controller.ts:148-150

`	ypescript
for (const inv of invoices) {                    // 1 query for invoices
  const lines = await this.prisma.invoiceLine     // N queries (one per invoice)
    .findMany({ where: { invoiceId: inv.id } });
}
`

**Mitigation:** Batch-load all invoice lines with a single indMany with where: { invoiceId: { in: invoiceIds } }, then map in memory.

---

## 2. Database Index Analysis

### 2.1 Index Coverage

#### Well-Indexed Models:
| Model | Indexes | Status |
|-------|---------|--------|
| AuditLog | @@index([createdAt]) | ✅ Good |
| RefreshToken | @@index([userId]), @@index([token]) | ✅ Good |
| LoginAttempt | @@index([userId, attemptedAt]) | ✅ Good |
| Notification | @@index([userId, isRead]), @@index([createdAt]) | ✅ Good |
| Ticket | @@index([status]), @@index([assignedTo]) | ✅ Good |
| CoreAuditLog | @@index([createdAt]), @@index([userId]), @@index([entityType, entityId]) | ✅ Excellent |
| CustomerLedgerEntry | @@index([customerId]), @@index([entryDate]) | ✅ Good |
| Reading | @@unique([meterId, readingAt, source]) | ⚠️ Has unique but no plain @@index on meterId |
| Invoice | No explicit indexes (only PK and invoiceNumber unique) | ❌ **Missing indexes** |
| InvoiceLine | @@index([invoiceId]) | ✅ Good |

#### Missing Indexes (Performance-Critical):
| Table | Query Pattern | Missing Index | Impact |
|-------|-------------|---------------|--------|
| Invoice | indMany WHERE projectId | @@index([projectId]) | HIGH — List invoices by project scans all |
| Invoice | indMany WHERE customerId | @@index([customerId]) | HIGH — Customer invoice list scans all |
| Invoice | indMany WHERE status | @@index([status]) | MEDIUM — Status-filtered queries |
| Invoice | indMany WHERE billingPeriodId | @@index([billingPeriodId]) | HIGH — Period-based queries |
| Reading | indMany WHERE meterId | @@index([meterId]) | HIGH — Readings by meter |
| Reading | indMany WHERE projectId AND readingAt BETWEEN | @@index([projectId, readingAt]) | HIGH — Period-based reading queries (billing) |
| Payment | indMany WHERE customerId | @@index([customerId]) | HIGH — Customer payment history |
| PaymentAllocation | indMany WHERE invoiceId | @@index([invoiceId]) | MEDIUM — Invoice allocations |
| MeterAssignment | indMany WHERE meterId | @@index([meterId]) | MEDIUM — Assignment history |
| SIMAssignment | indMany WHERE simId | @@index([simId]) | MEDIUM — SIM assignment history |

### 2.2 Composite Index Recommendations
| Composite Index | Table | Justification |
|----------------|-------|--------------|
| @@index([projectId, status]) | Invoice | Billing list view |
| @@index([customerId, status]) | Invoice | Customer statement queries |
| @@index([projectId, readingAt]) | Reading | Billing period reading lookup |
| @@index([meterId, readingAt]) | Reading | Meter consumption timeline |
| @@index([customerId, createdAt]) | Payment | Customer payment history |
| @@index([customerId, entryDate]) | CustomerLedgerEntry | Statement queries (already partly indexed) |

### 2.3 Missing Full-Text Search Indexes
| Table | Search Pattern | Recommendation |
|-------|---------------|---------------|
| Customer | WHERE name ILIKE '%query%' | Add @@index([name]) or PostgreSQL trigram index |
| Meter | WHERE serialNumber ILIKE '%query%' | Add @@index([serialNumber]) |
| Invoice | WHERE invoiceNumber ILIKE '%query%' | Current @unique on invoiceNumber covers exact match, add trigram for prefix/contains |

---

## 3. Large Data Loads Without Pagination

### 3.1 Findings

| Endpoint | File | Issue | Risk |
|----------|------|-------|------|
| GET /billing/invoices | illing.controller.ts:464-497 | No pagination on indMany | HIGH — Could return 100K+ invoices |
| GET /admin/data/:table | dmin.controller.ts:38-39 | Default limit 50, user can increase arbitrarily | MEDIUM |
| GET /projects/:projectId/customers | customers.service.ts | No pagination on indAll | HIGH — Large projects may have 10K+ customers |
| GET /meters | meters.service.ts | No pagination | HIGH |
| GET /readings | eadings.service.ts | No pagination | HIGH — Fastest-growing table |
| GET /billing/tariffs | illing.controller.ts:432 | No pagination | LOW — Small table |
| GET /billing/periods | illing.controller.ts:458 | No pagination | LOW |

### 3.2 Pagination Implementation Needed
All list endpoints should implement:
- page and pageSize or cursor and limit parameters
- Default page size of 50
- Maximum page size of 200
- Return total count or hasMore flag for UX

---

## 4. Rate Limiting Configuration

### 4.1 Current Backend Configuration
| Parameter | Value | Location |
|-----------|-------|----------|
| Global limit | 100 requests | pp.module.ts:52 |
| Time window | 60 seconds | pp.module.ts:52 |
| Strategy | ThrottlerModule (in-memory) | @nestjs/throttler |

### 4.2 Current API Gateway Configuration
| Parameter | Value | Location |
|-----------|-------|----------|
| Per-key limit | 60 requests/min | pi-gateway/src/middleware/gateway.js:41 |
| Storage | In-memory object (not persistent) | gateway.js:36 |
| Library | Custom implementation (not using installed express-rate-limit) | gateway.js:34-47 |

### 4.3 Issues
1. **Global limit too permissive** — 100 req/60s allows substantial brute force
2. **Single bucket for all users** — One user consuming the limit blocks all others
3. **API Gateway not using library** — express-rate-limit v7.4.0 installed but custom implementation used
4. **No distributed rate limiting** — In-memory stores don't work across multiple instances
5. **No rate limit headers** — Only API Gateway sets X-RateLimit-Remaining, backend ThrottlerGuard does not

### 4.4 Recommendations
1. Implement tiered rate limiting: auth (5/min), public (20/min), authenticated (100/min)
2. Fix API Gateway to use express-rate-limit library
3. Add X-RateLimit-Limit and X-RateLimit-Remaining response headers to backend
4. Consider Redis-backed rate limiting for production

---

## 5. Query Optimization Opportunities

### 5.1 Invoice Generation (Bulk Process)
**File:** illing/billing.controller.ts:88-155
- Each invoice creates lines with individual create calls — use createMany
- Invoice number generation uses count() which scans entire table — use a sequence
- No batch processing — all meters processed in one request; for 10K meters, request may timeout

### 5.2 Invoice Line Loading Pattern
**File:** illing/billing.controller.ts:476-496
Current pattern: 2 queries + in-memory join
Better pattern: Use Prisma include in one query
`	ypescript
const invoices = await this.prisma.invoice.findMany({
  where: { ... },
  include: { invoiceLines: true },
  orderBy: { createdAt: 'desc' }
});
`

### 5.3 PDF Generation (8 Sequential Queries)
**File:** invoices/invoices.controller.ts:25-128
Should use Prisma include to eager-load: project, meter, billingPeriod, customer, readings, tariffPlan in a single query chain.

---

## 6. Memory & Resource Constraints

### 6.1 Body Size Limit
| Setting | Value | Location |
|---------|-------|----------|
| JSON body parser limit | 1mb | main.ts:31 |

**Adequacy:** Adequate for normal API requests. File uploads bypass this via FileInterceptor.

### 6.2 File Uploads
| Aspect | Status | Detail |
|--------|--------|--------|
| File size validation | ❌ None | No limits.fileSize in FileInterceptor |
| File type validation | ❌ None | No file type restriction |
| Virus scanning | ❌ None | No antivirus/ClamAV integration |

### 6.3 Recommendations
1. Add limits.fileSize: 10 * 1024 * 1024 (10MB) to all FileInterceptor usage
2. Add file type allowlist (e.g., ['xlsx', 'csv', 'pdf'])
3. Consider adding virus scanning for uploaded files

---

## 7. Performance Bottleneck Summary

| # | Issue | Severity | Impact | File |
|---|-------|----------|--------|------|
| 1 | No pagination on major list endpoints | HIGH | Memory exhaustion, slow queries | Multiple controllers |
| 2 | Missing indexes on Invoice table | HIGH | Full table scans on billing queries | schema.prisma |
| 3 | N+1 in invoice generation (for-loop DB calls) | HIGH | 3000+ queries per batch | illing.controller.ts |
| 4 | 8 sequential queries in PDF generation | MEDIUM | Slow PDF download | invoices.controller.ts |
| 5 | No caching for user access resolution | MEDIUM | Unnecessary DB load per request | user-access.service.ts |
| 6 | No batch invoice line creation | MEDIUM | DB round-trips per line | illing.controller.ts |
| 7 | Invoice.count() for number generation | LOW | Full table scan per invoice | illing.controller.ts:113 |
| 8 | Missing composite indexes on Reading table | HIGH | Period-based queries slow | schema.prisma |

---

## 8. Quick Wins (Low Effort, High Impact)

| # | Action | Effort | Impact | File(s) |
|---|--------|--------|--------|---------|
| 1 | Add include: { invoiceLines: true } to invoice list query | 15min | Eliminates 2nd query | illing.controller.ts:476 |
| 2 | Convert for-loop invoice line creation to createMany | 30min | Reduces N queries to 1 | illing.controller.ts:137-148 |
| 3 | Add @@index([projectId]), @@index([customerId]) to Invoice | 10min | Fixes table scans | schema.prisma |
| 4 | Add @@index([meterId]) to Reading | 10min | Speeds up reading queries | schema.prisma |
| 5 | Add page/pageSize to customer list | 1h | Prevents memory issues | customers.service.ts |
| 6 | Batch-load invoice lines in batch-download | 15min | Fixes N+1 in ZIP download | invoices.controller.ts:148 |

---

*End of Performance Validation Report*
