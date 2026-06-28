# Billing Load Test Plan — Meter Verse

## 1. Test Methodology

| Aspect | Approach |
|---|---|
| **Tool** | k6 (scriptable, JS-based) for API-layer load; Artillery for WebSocket/real-time |
| **Strategy** | Ramp-up test (5→50 VUs over 10 min) + Spike test (0→200 VU instant) + Soak test (30 VUs for 2 hours) |
| **Data Setup** | 5000 customers, 10,000 meters, 50,000 readings, 3 tariff configurations per meter type |
| **Environment** | Staging cluster — 4 CPU / 16 GB RAM backend, 8 CPU / 32 GB PostgreSQL (RDS db.r6g.large) |
| **SLOs** | P95 invoice generation < 30s for 1000 meters; P95 payment < 2s; P95 invoice list < 1s |

## 2. Metrics Collected

| Metric | Collection Point | Unit |
|---|---|---|
| Request count (pass/fail) | k6 `http_req_duration` | count |
| P50 / P95 / P99 latency | k6 trends | ms |
| Throughput | k6 `http_reqs` | req/s |
| CPU / Memory | `docker stats`, `top` | %, MB |
| DB connection pool | `pg_stat_activity` | count |
| Query execution time | `pg_stat_statements` | ms |
| Lock wait time | `pg_locks` + `blocking_pids` | ms |
| Event loop lag | Node.js perf hooks | ms |

## 3. Expected Bottlenecks (Code Analysis)

### 3.1 Invoice Generation — `POST /invoices/generate` (billing.controller.ts:50–161)

**Severity: CRITICAL**

**Code evidence:**
- **Sequential meter loop** — line 88 iterates `for (const meter of meters)` — no `Promise.all` or concurrency control. For 10,000 meters this blocks the request for minutes.
- **`prisma.invoice.count()` inside loop** — line 113 runs a COUNT query on every single iteration (N+1 pattern). This alone will dominate P99.
- **Individual invoice line inserts** — line 138 creates each `invoiceLine` via separate `prisma.invoiceLine.create()`. Should use `createMany()` with batched chunks.
- **No wrapping transaction** — the loop is not wrapped in `prisma.$transaction()`. Partial failures leave orphan lines and no rollback.
- **In-memory reading filter** — line 91 `meterReadings = readings.filter(...)` loads all project readings into memory and filters on each iteration. CPU waste for large projects.

**Mitigations:**
- Replace `count()` with `findFirst({orderBy: {createdAt: 'desc'}, select: {invoiceNumber: true}})` moved outside loop
- Batch invoice lines with `createMany({data: [...]})` 
- Use `Promise.all(concurrentBatches)` with configurable concurrency (default 10)
- Wrap entire batch in `$transaction()`

### 3.2 Invoice Listing — `GET /invoices` (billing.controller.ts:464–497)

**Severity: HIGH**

**Code evidence:**
- **No pagination** — `findMany()` without `skip`/`take` loads ALL invoices into memory. With 50,000+ invoices this will OOM or timeout.
- **Double query** — First fetches invoices (line 476), then fetches ALL lines (line 480 `where: { invoiceId: { in: [...] } }`), then in-memory joins (line 490 `lines.filter(l => l.invoiceId === inv.id)`). The in-memory join is O(n*m) and unnecessary — use Prisma `include: { invoiceLines: true }`.
- **Missing `InvoiceLine` index on `invoice_id`** — schema.prisma line 535–547 shows `InvoiceLine` has NO `@@index([invoiceId])`. The JOIN to lines table will be a sequential scan at scale.

**Mitigations:**
- Add `@@index([invoiceId])` on `InvoiceLine`
- Add `skip`/`take` params with default page size of 50
- Use `include` or `findMany` with single query approach

### 3.3 Tariff Engine — `TariffEngineService.calculateCharges()` (tariff-engine.service.ts:19–124)

**Severity: MEDIUM**

**Code evidence:**
- **Per-invoice DB calls** — Each invoice triggers `findFirst` on tariff (line 20) then `findMany` on tariffCharge (line 41). For 1000 meters this is 2000 extra queries.
- **JS-in-memory tier resolution** — lines 69–84 loop over charge details with nested arithmetic. CPU-bound when tiers have many steps (e.g., 15-step electricity tariffs).
- **No caching** — Tariff configs rarely change but are re-fetched for every meter. Use in-memory cache (TTL 5 min) keyed by `projectId+meterType+effectiveDate`.

**Mitigations:**
- Cache tariff + charges in Redis or in-memory LRU
- Bulk-fetch tariffs before the meter loop rather than per-invoice

### 3.4 Payment Allocation — `POST /payments` (billing.controller.ts:274–395)

**Severity: HIGH**

**Code evidence:**
- **`oldest_due_first` cash allocation** — line 322–356 finds due invoices in order, then for each invoice does 2 writes (allocation + invoice update). For a payment spread across 100 invoices this is 200 writes inside a transaction.
- **`allocationOrder` manual increment** — line 340 sets `order++` but this is unsafe under concurrent payments for the same customer (race condition on remainingAmount).

**Mitigations:**
- Use `prisma.$transaction` with `isolationLevel: Serializable` for concurrent payment safety
- Add `@updatedAt` check + retry for optimistic concurrency on `remainingAmount`

### 3.5 Ledger Entry — `LedgerService.addEntry()` (ledger.service.ts:10–39)

**Severity: LOW**

**Code evidence:**
- **Last-entry query per entry** — line 19 reads `findFirst` to get previous running balance. Single-read is fine, but called inside loops (e.g., invoice generation then ledger write per meter).
- **JS running balance** — computed in application memory. Correct, but if replaying history, each entry depends on previous. Bulk backfill would require sequential processing.

**Mitigations:**
- For batch operations, compute running balance in SQL with `SUM(amountDelta) OVER (ORDER BY entryAt)` window function

### 3.6 Report Generation — `ReportJob` / JRXML Templates

**Severity: MEDIUM**

**Code evidence:**
- `ReportJob` model exists in schema but no controller/service implementation in billing module — reports are unserved.
- JRXML templates in `templates/reports/` rely on JasperReports XML rendering — CPU and memory heavy for PDF generation.
- No async job queue — `ReportJob` has status field but no worker polls it.

**Mitigations:**
- Implement report worker with Bull/BullMQ queue
- Stream large PDFs to S3/CDN, not memory
- Generate reports asynchronously with webhook callback

### 3.7 Schema Index Gaps

| Table | Missing Index | Impact |
|---|---|---|
| `InvoiceLine` | `@@index([invoiceId])` | Sequential scan on every invoice detail query |
| `Invoice` | `@@index([projectId, billingPeriodId])` | Invoice generation scans for existing invoices |
| `PaymentAllocation` | `@@index([paymentId, invoiceId])` | Composite lookup for payment reversal |
| `Reading` | `@@index([meterId, readingAt])` | Consumption query scans for date range |

## 4. Load Test Scenario Matrix

| Scenario | VUs | Duration | Target Endpoint | Expected Peak Load |
|---|---|---|---|---|
| 1 — Invoice listing | 10→100 | 5 min | `GET /invoices` | 200 req/s at P95 |
| 2 — Invoice generation | 5→30 | 10 min | `POST /invoices/generate` | 50 req/s at batch level |
| 3 — Payment recording | 10→50 | 5 min | `POST /payments` | 100 req/s |
| 4 — Tariff simulation | 10→100 | 5 min | `POST /tariffs/simulate` | 300 req/s (pure compute) |
| 5 — Mixed workflow | 10→200 | 15 min | All endpoints | Realistic peak |
| 6 — Spike (cold start) | 0→200 instant | 2 min | All endpoints | Warm-up latency |

## 5. Pass/Fail Criteria

| Criterion | Threshold | Action if Failed |
|---|---|---|
| Invoice generation P95 | < 30s for 1000 meters | Optimize loop + add concurrency |
| Payment P95 | < 2s | Add read-replica for invoice lookup |
| Invoice list P95 | < 1s | Implement pagination + line index |
| Error rate | < 1% of all requests | Investigate transaction conflicts |
| DB CPU | < 80% across all scenarios | Add read replicas, optimize queries |
| Memory leak | < 5% increase over 2h soak | Profile Node heap dumps |
