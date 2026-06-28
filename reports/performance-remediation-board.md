# Phase 11 — Performance Remediation Board

**Date:** 2026-06-25  
**Source files:** `backend/prisma/schema.prisma`, `backend/src/billing/calculation-engine.service.ts`, `backend/src/kpi/kpi.service.ts`

---

## 1. Missing Database Indexes

### High-Priority (large tables — Invoice, Reading, Payment, Ledger)

| Table | Existing Indexes | Missing Index | Impact |
|-------|-----------------|---------------|--------|
| `Invoice` | `@@map` only — NO indexes on project, customer, status, dueDate, billingPeriod | `@@index([projectId])`, `@@index([customerId])`, `@@index([status])`, `@@index([billingPeriodId])`, `@@index([dueAt])` | Full table scans on all invoice queries |
| `InvoiceLine` | None | `@@index([invoiceId])`, `@@index([chargeGroup])` | Every invoice detail query scans |
| `InvoiceAdjustment` | None | `@@index([invoiceId])`, `@@index([adjustmentType])` | Adjustment queries scan |
| `Payment` | None | `@@index([projectId])`, `@@index([customerId])`, `@@index([status])`, `@@index([paymentDate])` | Full scans on payment reports |
| `PaymentAllocation` | None | `@@index([paymentId])`, `@@index([invoiceId])` | Allocation lookups scan |
| `CustomerLedgerEntry` | None | `@@index([customerId, projectId])`, `@@index([entryAt])` | Ledger queries scan |
| `Reading` | `@@unique([meterId, readingAt, source])` — covers meter+date | `@@index([projectId])`, `@@index([status])`, `@@index([readingAt])` | Report queries scan all readings |
| `ReadingReview` | None | `@@index([readingId])`, `@@index([reviewAction])` | Review lookups scan |
| `Meter` | `@@unique([serialNumber])` | `@@index([projectId])`, `@@index([status])`, `@@index([meterType])` | Meter list queries scan |
| `Customer` | `@@unique([projectId, customerCode])` | `@@index([status])`, `@@index([projectId])` | Customer list queries |
| `AuditLog` | `@@index([createdAt])` | `@@index([actorId])`, `@@index([resourceType, resourceId])` | Audit queries by user/resource |
| `Notification` | `@@index([userId, isRead])`, `@@index([createdAt])` | None — adequate | ✅ OK |
| `Ticket` | `@@index([status])`, `@@index([assignedTo])` | None — adequate | ✅ OK |

**Total missing indexes: ~25+** on the `sim_system` schema (production tables). The `core` and `features` schemas generally have better index coverage.

## 2. N+1 Query Patterns

### CRITICAL: `KpiService.getExecutiveKpis()` — `kpi.service.ts:9-111`

```typescript
// Line 13: Loads ALL invoices
const invoices = await this.prisma.invoice.findMany({ ... });

// Line 70-80: For each project, re-processes invoices/ payments in-memory
for (const pid of projectIds) {
  const projInvoices = invoices.filter(i => i.projectId === pid);  // O(n) per project
  const projPayments = payments.filter(p => p.projectId === pid);  // O(n) per project
}
```
**Pattern**: Loads entire tables into memory, then uses `.filter()` in a loop. With 100K invoices and 50 projects, this is 50× O(n) passes. **Should use SQL GROUP BY or Prisma aggregation.**

### CRITICAL: `KpiService.getUtilityKpis()` — `kpi.service.ts:158-194`

```typescript
// Line 163: Loads ALL invoices
const invoices = await this.prisma.invoice.findMany({ ... });
// Line 164: Loads ALL meters
const meters = await this.prisma.meter.findMany({ ... });
// Line 165: Loads ALL readings (take: 5000)
const readings = await this.prisma.reading.findMany({ ..., take: 5000 });

// Line 186: For each reading, .find() on in-memory meters array
for (const r of readings) {
  const meter = meters.find(m => m.id === r.meterId);  // O(n) per reading
```
**Pattern**: `Array.find()` in a loop over 5000 readings against all meters = O(n²). Should use `Map` lookup or SQL JOIN.

### HIGH: `KpiService.getCollectionKpis()` — `kpi.service.ts:113-156`

```typescript
// Line 118: Loads ALL non-cancelled invoices
const invoices = await this.prisma.invoice.findMany({ ... });
// Line 138-148: In-memory aging bucket calculation
for (const inv of overdueInvoices) {
  const days = Math.floor((nowMs - inv.issuedAt!.getTime()) / 86400000);
```
**Pattern**: Full table load for what should be a SQL aggregation with `CASE WHEN`.

### MEDIUM: `ReportGenerationService` — many private methods

Multiple report methods follow the same pattern: load all records, then filter/aggregate in-memory:
- `invoicesSummary()`: loads all invoices, reduces in-memory
- `paymentsReport()`: loads all payments, reduces in-memory
- `monthlyFinance()`: loads all invoices, groups by month in-memory

### MEDIUM: `ReadingsService.toDto()` — `readings.service.ts:14-51`

```typescript
// Called once per reading in a loop via .map()
// Makes a DB query per reading to resolve meter serial/type
const meter = await this.prisma.meter.findUnique({ where: { id: reading.meterId }});
```
Called from `findAll()` via `Promise.all(readings.map(r => this.toDto(r)))` — this is an N+1 pattern. Should batch-load meters.

## 3. Inefficient Aggregation Patterns

| Issue | File | Severity |
|-------|------|----------|
| **In-memory GROUP BY** — manual `reduce()` loops instead of SQL `GROUP BY` | `kpi.service.ts` (all 3 methods) | HIGH |
| **Array.find() in loop** — O(n²) on meter lookups | `kpi.service.ts:186` | HIGH |
| **Full table scans** — KPI endpoints load ALL invoices/payments/meters every time | `kpi.service.ts` lines 13-18 | CRITICAL |
| **No pagination on KPI** — `findMany()` with no `take` limit | `kpi.service.ts` | CRITICAL |
| **In-memory date filtering** — `.filter(i => i.createdAt >= thisMonth)` instead of DB `WHERE` | `kpi.service.ts` | HIGH |
| **readings.toDto() N+1** — separate meter query per reading | `readings.service.ts:18` | MEDIUM |
| **Report generation loads all** — no pagination, no aggregation pushdown | `report-generation.service.ts` (all methods) | HIGH |

## 4. Performance Scoreboard

| Issue | Count | Urgency |
|-------|-------|---------|
| Missing indexes (sim_system) | ~25+ | 🔴 HIGH |
| N+1 query patterns | 5 instances | 🔴 HIGH |
| In-memory aggregation | 6+ instances | 🟡 MEDIUM |
| Full table scans in KPI | 3 critical methods | 🔴 HIGH |
| O(n²) loop patterns | 1 (kpi.service.ts:186) | 🔴 HIGH |
| Report data loading (no pagination) | All 44 reports | 🟡 MEDIUM |

## 5. Remediation Priorities

| Priority | Action | Effort |
|----------|--------|--------|
| P0 | Add indexes: `Invoice(projectId, customerId, status)`, `Reading(projectId, status)`, `Payment(projectId, customerId)`, `CustomerLedgerEntry(customerId, projectId)` | 1 day |
| P0 | Rewrite `KpiService.getExecutiveKpis()` using Prisma aggregation or raw SQL GROUP BY | 1 day |
| P0 | Fix `readings.service.ts:toDto()` N+1 — batch-load meters | 0.5 day |
| P1 | Fix `KpiService.getUtilityKpis()` — replace `Array.find()` with `Map` lookup | 0.5 day |
| P1 | Add `take`/pagination to all KPI queries | 0.5 day |
| P1 | Rewrite report aggregation to use SQL GROUP BY (especially monthly-finance, monthly-consumption) | 2 days |
| P2 | Add compound indexes: `Invoice(billingPeriodId, status)`, `Reading(meterId, readingAt)` | 0.5 day |
| P2 | Replace in-memory aging with SQL `CASE WHEN` aggregation | 1 day |

## CERTIFICATION: **NOT PASSED**

Performance architecture has systemic issues: N+1 patterns in critical KPI endpoints, wholesale table loads in 3 dashboard services, 25+ missing indexes on production tables, and O(n²) loops in utility KPI. Without remediation, dashboard pages will fail under production load.
