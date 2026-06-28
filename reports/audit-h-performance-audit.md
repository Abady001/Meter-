# AUDIT-H — Performance Audit (Independent)

**Date**: 2026-06-18
**Verdict**: FAIL

## ❌ CRITICAL

### F-H1: N+1 in Invoice Generation (CRITICAL)
- File: `billing.controller.ts` lines 77-136
- Per-meter `tariffService.getEffectiveTariff()` + per-reading `invoiceLine.create()` in nested loops
- Risk: Thousands of queries for large projects — timeout or crash

### F-H2: No Pagination on 11/12 List Endpoints (CRITICAL)
- Only `GET /dashboard/activity` has pagination (`?limit=`)
- All other list endpoints return unbounded results
- Risk: OOM or slow response as data grows

## ❌ HIGH

### F-H3: N+1 in ReadingsService (HIGH)
- File: `readings.service.ts` lines 18, 57-63, 82-86
- Per-reading `meter.findUnique()` in `toDto()` called from findAll/listReviewQueue
- Up to 500 extra queries (mitigated by `take: 500` on findAll; listReviewQueue has no limit)

### F-H4: N+1 in WaterBalanceService (HIGH)
- File: `water-balance.service.ts` lines 45-65
- Per-child `reading.aggregate()` in for loop
- Scales with child meter count

### F-H5: @prisma/client in Frontend (HIGH)
- `Frontend/package.json` line 22 — Prisma ORM bundled in frontend
- Adds 5-8MB unnecessary bundle weight
- Security concern — DB client code exposed to browser

### F-H6: Missing Indexes on Active Models (HIGH)
- `Reading`, `Invoice`, `Payment`, `InvoiceLine`, `Project` have zero indexes

## ✅ PASSES
- Dashboard service well-structured (Promise.all, batch meter queries)
- 130 total `@@index` directives across all schemas

## Conclusion
**PERFORMANCE_CERTIFIED = NO**
