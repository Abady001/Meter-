# D1 + D3 — Dashboard Discovery & Duplication Analysis

**Date**: 2026-06-19

## Current Meter Verse Dashboard Widgets
| Widget | Type | Data Source | Status | Duplicate? |
|--------|------|-------------|--------|------------|
| Total Customers | KPI Card | useDashboardKpis | ✅ API | No |
| Active Meters | KPI Card | useMetersList | ✅ API | No |
| Offline Meters | KPI Card | useMetersList | ✅ API | No |
| Monthly Consumption | KPI Card | N/A (not implemented) | ⚠️ Not used | — |
| Open Alerts | KPI Card | useUnreadCount | ✅ API | No |
| Unpaid Invoices | KPI Card | useInvoicesList | ✅ API | No |
| Collection Rate | KPI Card | useDashboardKpis | ✅ API | No |
| Outstanding Balance | KPI Card | useDashboardKpis | ✅ API | No |
| Consumption Chart | AreaChart | useConsumptionTrend | ✅ API | No |
| Revenue Chart | BarChart | Empty (no data source) | ❌ No data | Remove |
| Meter Status | PieChart | useMetersList | ✅ API | No |
| Alert Summary | Severity cards | useUnreadCount | ✅ API | No |
| Recent Activity | Activity feed | useRecentActivity | ✅ API | No |

## Missing Widgets (from target architecture)
| Widget | Data Source | Effort |
|--------|-------------|--------|
| Top Debtors | GET /collections/aging | Already built |
| Aging Summary | GET /collections/aging | Already built |
| Today's Collections | GET /collections/dashboard | Already built |
| Month Collections | GET /collections/dashboard | Already built |
| Collection Trend | Historical data | Needs collection |
| Utility Revenue Split | Per-utility queries | Medium |
| Reading Completion % | Readings service | Low |

## Duplicates Found
None detected. All current widgets serve unique business questions.

## Conclusion
Current dashboard is lean and mock-free. Missing 4-5 high-value widgets (Top Debtors, Aging, Collections KPIs) that can reuse existing APIs.
