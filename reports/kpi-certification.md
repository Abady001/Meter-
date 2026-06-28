# KPI DATA CERTIFICATION

**Date:** 2026-06-21
**Source:** `backend/src/kpi/kpi.service.ts`

---

## KPI ENDPOINT: GET /kpi/executive

| KPI | Source Table | Query Type | Formula | Filters | Verified |
|-----|-------------|------------|---------|---------|----------|
| totalInvoiced | sim_system.invoices | Prisma findMany | SUM(totalAmount) where status != cancelled | optional projectId | ✅ |
| totalPaid | sim_system.invoices | Prisma findMany | SUM(paidAmount) where status != cancelled | optional projectId | ✅ |
| totalOpen | sim_system.invoices | Prisma findMany | SUM(remainingAmount) where status != cancelled | optional projectId | ✅ |
| monthlyRevenue | sim_system.invoices | Prisma findMany | SUM(totalAmount) where createdAt >= thisMonth | optional projectId | ✅ |
| annualRevenue | sim_system.invoices | Prisma findMany | SUM(totalAmount) where createdAt >= thisYear | optional projectId | ✅ |
| collectionRate | sim_system.invoices | Calculated | (totalPaid / totalInvoiced) * 100, if totalInvoiced > 0 | optional projectId | ✅ |
| recoveryRate | sim_system.invoices | Calculated | (totalPaid / (totalOpen + totalPaid)) * 100 | optional projectId | ✅ |
| revenueGrowth | sim_system.invoices | Calculated | (monthlyPaid - prevMonthPaid) / prevMonthPaid * 100 | optional projectId | ✅ |
| invoicesGenerated | sim_system.invoices | Prisma count | COUNT(*) all statuses | optional projectId | ✅ |
| invoicesPaid | sim_system.invoices | Prisma filter | COUNT where status = 'paid' | optional projectId | ✅ |
| invoicesUnpaid | sim_system.invoices | Prisma filter | COUNT where status IN ('issued','partially_paid') | optional projectId | ✅ |
| overdueInvoices | sim_system.invoices | Prisma filter | COUNT where dueAt < now AND remainingAmount > 0 | optional projectId | ✅ |
| cancelledInvoices | sim_system.invoices | Prisma filter | COUNT where status = 'cancelled' | optional projectId | ✅ |
| activeCustomers | sim_system.customers | Prisma filter | COUNT where status = 'active' | optional projectId | ✅ |
| inactiveCustomers | sim_system.customers | Prisma filter | COUNT where status = 'inactive' | optional projectId | ✅ |
| newCustomers | sim_system.customers | Prisma filter | COUNT where createdAt >= thisMonth | optional projectId | ✅ |
| highConsumption | sim_system.readings | Calculated | Top 10% of readings by value | optional projectId | ✅ |
| delinquent | sim_system.customers + invoices | Calculated | Active customers with unpaid invoices | optional projectId | ✅ |
| totalMeters | sim_system.meters | Prisma count | COUNT(*) | optional projectId | ✅ |
| activeMeters | sim_system.meters | Prisma filter | COUNT where status = 'active' | optional projectId | ✅ |
| electricityMeters | sim_system.meters | Prisma filter | COUNT where meterType = 'electricity' | optional projectId | ✅ |
| waterMeters | sim_system.meters | Prisma filter | COUNT where meterType IN ('water_main','water_child') | optional projectId | ✅ |
| solarMeters | sim_system.meters | Prisma filter | COUNT where meterType = 'solar' | optional projectId | ✅ |
| chilledWaterMeters | sim_system.meters | Prisma filter | COUNT where meterType = 'chilled_water' | optional projectId | ✅ |
| phase1ph | sim_system.meters | Prisma filter | COUNT where phaseType = '1PH' | optional projectId | ✅ |
| phase3ph | sim_system.meters | Prisma filter | COUNT where phaseType = '3PH' | optional projectId | ✅ |
| meterHealth | sim_system.meters | Calculated | (activeMeters / totalMeters) * 100 | optional projectId | ✅ |
| disconnectedMeters | sim_system.meters | Prisma filter | COUNT where status IN ('offline','faulty') | optional projectId | ✅ |

## KPI ENDPOINT: GET /kpi/collections

| KPI | Source Table | Query Type | Formula | Verified |
|-----|-------------|------------|---------|----------|
| collectedToday | sim_system.payments | Prisma filter | SUM(amount) where paymentDate >= today | ✅ |
| collectedThisMonth | sim_system.payments | Prisma filter | SUM(amount) where paymentDate >= thisMonth | ✅ |
| collectedThisYear | sim_system.payments | Prisma filter | SUM(amount) where paymentDate >= thisYear | ✅ |
| collectionRate | sim_system.invoices | Calculated | (totalPaid / totalInvoiced) * 100 | ✅ |
| recoveryRate | sim_system.invoices | Calculated | (totalPaid / (totalOpen + totalPaid)) * 100 | ✅ |
| totalOpen | sim_system.invoices | Prisma filter | SUM(remainingAmount) where remainingAmount > 0 | ✅ |
| overdueBalance | sim_system.invoices | Prisma filter | SUM(remainingAmount) where dueAt < today AND remaining > 0 | ✅ |
| aging.0-30 | sim_system.invoices | Calculated | SUM(remainingAmount) where days since issue <= 30 | ✅ |
| aging.31-60 | sim_system.invoices | Calculated | SUM(remainingAmount) where days 31-60 | ✅ |
| aging.61-90 | sim_system.invoices | Calculated | SUM(remainingAmount) where days 61-90 | ✅ |
| aging.90+ | sim_system.invoices | Calculated | SUM(remainingAmount) where days > 90 | ✅ |

## KPI ENDPOINT: GET /kpi/utilities

| KPI | Source Table | Query Type | Verified |
|-----|-------------|------------|----------|
| utilities.{type}.count | sim_system.invoices | Prisma group by utilityType | ✅ |
| utilities.{type}.total | sim_system.invoices | SUM(totalAmount) by utilityType | ✅ |
| utilities.{type}.paid | sim_system.invoices | SUM(paidAmount) by utilityType | ✅ |
| utilities.{type}.open | sim_system.invoices | SUM(remainingAmount) by utilityType | ✅ |
| meters.{type}.total | sim_system.meters | COUNT by meterType | ✅ |
| meters.{type}.active | sim_system.meters | COUNT by meterType where status='active' | ✅ |
| meters.{type}.readings | sim_system.readings | COUNT by meter meterType | ✅ |
| meters.{type}.consumption | sim_system.readings | SUM(readingValue) by meter meterType | ✅ |

## DATA ACCURACY NOTES

1. All KPIs use real-time Prisma queries against the PostgreSQL database — no cached/stale data
2. `projectId` filter is applied as an optional WHERE clause on every query
3. `areaId` filtering is NOT implemented at the KPI level (relies on AreaGuard at the controller level)
4. Date range is calculated server-side: today, thisMonth (1st of month), thisYear (Jan 1st)
5. The aging calculation uses `issuedAt` date (not `dueAt`) for consistency across invoice types

## CERTIFICATION RESULT: ✅ ALL KPIS VERIFIED
