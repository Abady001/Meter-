# Meter Verse — Performance Standards

## Overview

Performance targets and current status for the Meter Verse platform. The system is designed for 100 concurrent users and 1,000 reports/minute generation throughput.

---

## Database Indexes

### Present
Foreign key columns have indexes on most tables:
- `readings`: `[meterId]`, `[projectId]`, `[readingAt]`, `[status]` — all indexed
- `invoices`: `[projectId]`, `[customerId]`, `[billingPeriodId]`, `[status]`, `[createdAt]` — all indexed
- `payments`: `[projectId]`, `[customerId]`, `[paymentDate]`, `[status]` — all indexed
- `payment_allocations`: `[paymentId]`, `[invoiceId]` — indexed
- `customer_ledger_entries`: `[customerId]`, `[projectId]`, `[entryAt]` — indexed
- `notifications`: `[userId, isRead]`, `[createdAt]` — indexed
- `location_nodes`: `[parentId]` — indexed
- `audit_log`: `[createdAt]`, `[userId]`, `[entityType, entityId]` — indexed
- `core.audit_log`: `[createdAt]`, `[userId]`, `[entityType, entityId]` — indexed

### Missing (Needs Optimization)
- `invoice_lines.invoiceId` — NO index (leads to sequential scans on large invoices)
- `meter_assignments.meterId` + `status` — composite index missing (frequent filter on active assignments)
- `meter_assignments.customerId` + `status` — composite index missing
- `sim_assignments.meterId` + `status` — composite index missing
- `core_area.areaCode` — PK only, no separate index on code (frequent lookup by code)
- `refresh_tokens.token` (has index) but `userId` alone has index — needs `+ revokedAt` composite
- `reading_reviews.readingId` — NO index

---

## Caching

### Caffeine Cache (Backend)
- **Implementation**: Not yet configured for NestJS services
- **Planned**: Caffeine cache for frequently-read metadata (projects, areas, tariffs)
- **Target**: 5-minute TTL for reference data, 30-second TTL for near-real-time data

### React Query (Frontend)
- **Library**: @tanstack/react-query
- **SSR-safe**: Server creates fresh QueryClient per request; client uses singleton via `getQueryClient()`
- **Default config**:
  - `staleTime`: 30 seconds
  - `gcTime`: 5 minutes
  - `retry`: 1 attempt
- **Query keys**: `['resource']` for lists, `['resource', id]` for details

---

## Connection Pooling

### HikariCP (planned for new Java reporting engine)
- Not configured yet (reporting engine not deployed)
- Target: 50 connections in pool, 10 minimum idle

### Prisma Pool (backend)
- Prisma manages connections via `pg` (node-postgres) driver
- Default pool size: configurable via `DATABASE_URL`
- Current: single shared Prisma client for all schemas
- **Known issue**: Multi-schema queries may cause connection contention under load

---

## Pagination

**All list endpoints MUST implement pagination.** Current status:
- `GET /readings/review-queue` — paginated (page/limit)
- `GET /billing/invoices` — NOT paginated (returns all invoices — HIGH PRIORITY FIX)
- `GET /billing/periods` — NOT paginated
- `GET /billing/tariff-plans` — NOT paginated
- `GET /customers` — NOT paginated
- `GET /meters` — NOT paginated
- `GET /payments` — NOT paginated
- `GET /notifications` — paginated (page/limit)

**Rule**: Every list endpoint must support `page` and `limit` query parameters with a default of 50 and max of 100.

---

## N+1 Prevention

### Current State
- **Invoice list query** (`GET /billing/invoices`): Fetches all invoices, then fetches lines separately by invoice IDs. This is efficient (single additional query rather than per-invoice). However, the invoice list itself is UNPAGINATED.
- **Sync orchestrator**: Deduplication via `existingSerials Set` — efficient O(1) lookup per record.
- **Reading validation**: Each validation makes multiple individual queries (meter, previous reading, duplicate check) — this is 3 queries per reading on each validation. With batch imports, this becomes N*3 queries.

### Known N+1 Risks
1. Bulk reading import: N queries per reading (each validated individually)
2. Invoice generation: Iterates all meters, queries tariff each time
3. Dashboard aggregation: Multiple count/sum queries per widget

### Mitigation Strategies
- Use Prisma `include`/`select` for eager loading where possible
- Batch reads using `$transaction` for grouped operations
- Implement data loaders (DataLoader pattern) for repeated lookups
- Use materialized views for dashboard aggregations

---

## Timeouts

| Component | Operation | Timeout | Notes |
|-----------|-----------|---------|-------|
| Symbiot SQL | Connection | 15s | For 3 direct-connected areas |
| Symbiot SQL | Query | 120s | EAV flatten query on 97K DeviceAttr rows |
| sBill API | Request | 30s | Paginated meter sync |
| sBill API | Auth | 15s | POST /api/authenticate |
| Gateway | Query | 30s | Backend API operations |
| Gateway | File upload | 60s | CSV/Excel meter import |
| Gateway | PDF generation | 60s | Puppeteer invoice PDF |

---

## Retry Logic

| Operation | Attempts | Notes |
|-----------|----------|-------|
| Symbiot sync | 3 | Primary SQL → 2 fallback API attempts |
| sBill API pagination | 3 per page | On HTTP error or timeout |
| Payment confirmation | 3 | With idempotency key |
| Invoice generation | 3 | On transient DB errors |
| External HTTP requests | 3 | sBill API calls |

---

## Background Workers

**NOT IMPLEMENTED**. The following features need background worker support:
- Async report generation (currently runs in request thread)
- Scheduled sync operations (currently manual trigger)
- Email/SMS notification delivery
- Periodic invoice generation
- Automated meter polling (Symbiot bridge)

**Planned architecture**: RabbitMQ queue (defined in docker-compose but not connected to any service).

---

## Memory Limits

**NOT CONFIGURED** for Node.js services. The following are NOT set:
- Node.js `--max-old-space-size` limit
- Docker container memory limits
- Prisma query memory threshold
- Puppeteer browser memory limit

**Risk**: Under load, Puppeteer (Chrome headless) can consume 500MB+ per page, leading to OOM on the Node.js service. Production deployment MUST set:
```yaml
# Docker Compose memory limits
backend:
  deploy:
    resources:
      limits:
        memory: 1G
      reservations:
        memory: 512M
```

---

## Performance Targets

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Concurrent users | 100 | Not tested | ⚠️ |
| Reports/minute | 1000 | Not tested | ⚠️ |
| Invoice generation | 1000/min | Tested at low volumes | ⚠️ |
| API response time (p95) | < 500ms | Not measured | ⚠️ |
| API response time (p99) | < 2s | Not measured | ⚠️ |
| Sync throughput | 10K records/min | ~5K | ⚠️ |
| PDF generation | 60/min | ~30 (Puppeteer bottleneck) | ⚠️ |
| DB query time (p95) | < 100ms | Not measured | ⚠️ |
| Frontend page load | < 2s | Not measured | ⚠️ |
| Cache hit ratio | > 80% | Not configured | ❌ |

---

## Source Files

| File | Purpose |
|------|---------|
| `backend/prisma/schema.prisma` | All table definitions with indexes |
| `backend/src/common/database/prisma.service.ts` | Prisma connection management |
| `Frontend/src/lib/api/query-client.tsx` | React Query client configuration |
