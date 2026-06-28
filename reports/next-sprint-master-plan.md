# METER VERSE — NEXT SPRINT MASTER PLAN

**Date:** 2026-06-21
**Based on:** Enterprise Certification Board v6

---

## SPRINT OBJECTIVE

Close the 2 critical gaps blocking enterprise deployment:
1. Area/Project Data Isolation (current score: 40%)
2. Report Coverage (current score: 23%)

## SPRINT 1: DATA GOVERNANCE (5 days)

### Goal: Enforce area/project isolation at the database level

**Tasks:**
1. Create `PrismaMiddleware` that auto-injects `projectId` from authenticated user's context into all queries
2. Update `GlobalAuthGuard` to attach resolved `projectScope` to each request
3. Add `@ProjectScoped()` decorator to enable/disable auto-scoping per endpoint
4. Add project/area validation to all 31 controllers that accept `projectId` from URL params or body
5. Add area validation to `AreasController` — users should only see their assigned areas
6. Update `SearchService.search_enterprise()` function to accept and filter by `projectId`
7. Update `KpiService` to accept and filter by `projectId` for all metrics
8. Test isolation: User A from Area A cannot read User B from Area B data via any endpoint

**Success Criteria:**
- User assigned to Area A gets 403 when accessing Area B URLs
- User assigned to Area A cannot query Area B via API
- Super_admin bypass
- 26/26 E2E PASS

## SPRINT 2: REPORT EXPANSION (3 weeks)

### Goal: 34 additional reports → 44/44 parity

**Priority Reports (must-have for SBill replacement):**

| # | Report | Type | Priority |
|---|--------|------|----------|
| 1 | Water Balance | Utility | P0 |
| 2 | Solar Generation | Utility | P0 |
| 3 | Solar Export/Import | Utility | P0 |
| 4 | Wallet Transactions | Financial | P0 |
| 5 | Wallet Balance | Financial | P0 |
| 6 | Bill Cycle Summary | Billing | P0 |
| 7 | Bill Cycle Audit | Billing | P0 |
| 8 | Reading Register | Operational | P0 |
| 9 | Reading History | Operational | P0 |
| 10 | Meter Activity | Operational | P1 |
| 11 | Meter Lifecycle | Operational | P1 |
| 12 | Tariff Comparison | Financial | P1 |
| 13 | Charge Analysis | Financial | P1 |
| 14 | Tax Summary | Financial | P1 |
| 15 | Discount Summary | Financial | P1 |
| 16 | Late Fee Summary | Financial | P1 |
| 17 | Suspended Accounts | Customer | P1 |
| 18 | New Connections | Customer | P1 |
| 19 | Disconnections | Customer | P1 |
| 20 | Reconnections | Customer | P1 |
| 21 | Customer Aging | Financial | P1 |
| 22 | Customer History | Customer | P1 |
| 23 | User Activity | Admin | P2 |
| 24 | Audit Trail | Admin | P2 |
| 25 | Import Log | Admin | P2 |
| 26 | Export Log | Admin | P2 |
| 27 | Upload History | Admin | P2 |
| 28 | System Configuration | Admin | P2 |
| 29 | Failed Payments | Financial | P2 |
| 30 | Failed Bill Cycles | Billing | P2 |
| 31 | High Consumption | Utility | P2 |
| 32 | Zero Consumption | Utility | P2 |
| 33 | Anomaly Detection | Operational | P2 |
| 34 | KPI Summary | Analytics | P2 |

**Success Criteria:**
- 44/44 reports rendering with real data
- CSV Export for all reports
- PDF Export for all reports
- Filter by project, area, date range
- Group by utility type
- 26/26 E2E PASS

## SPRINT 3: INVOICE PDF & SBILL PARITY (3 days)

**Tasks:**
1. Compare current HTML template against SBill JRXML templates
2. Align charge group layout (consumption, fixed, taxes, adjustments)
3. Ensure meter reading details match
4. Add QR code and hash verification footer
5. Add Arabic/RTL support to PDF generation

## SPRINT 4: SECURITY HARDENING (2 days)

**Tasks:**
1. Add `@Roles()` to 5 unrestricted endpoints
2. Remove or implement `@Permissions()` decorator
3. Strengthen DB Admin SQL sanitization
4. Add rate limiting to auth endpoints specifically

## SPRINT 5: TECHNICAL DEBT CLEANUP (2 days)

**Tasks:**
1. Wire `BalancesPage` to real API
2. Replace inline mock data in `ConsumptionPage` and `WaterBalancePage`
3. Remove mock-data.ts if no longer referenced by any page
4. Add `nameAr` and `nationalOrCommercialId` to Overview tab
5. Add phaseType, ampRating, diameter to meter import templates
