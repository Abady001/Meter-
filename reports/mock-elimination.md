# Phase 10 — Mock Elimination Audit

**Date:** 2026-06-18
**Method:** Static code analysis of all 26 pages + hooks + lib files

## Summary

| Metric | Count |
|--------|-------|
| Files importing `@/lib/mock-data` | 27 (26 components + 1 hook) |
| Files importing `@/lib/mock-auth` | 6 |
| `?? mock` fallback expressions | 18 |
| `toast.info()` stubs (all fake) | 28 |
| `toast.success()` stubs (fake) | 5 |
| Feature flags defaulting to `mock` | 10 of 13 |

## Page Classification

| Classification | Count | Pages |
|---------------|-------|-------|
| API_ONLY | 1 | SmartTable (reusable component, not a page) |
| HYBRID | 26 | All data pages — have API calls but fall back to mock |
| MOCK_ONLY | 5 | MeterAssignPage, LoginPage, RoleSwitcher, AppShell, AppSidebar, ProtectedAction |

## Mock Fallback Patterns Found (18 occurrences)

| Component | Expression |
|-----------|-----------|
| ProjectsPage | `apiProjects ?? mockProjects` |
| CustomersPage | `apiProjects ?? mockProjects`, `apiCustomers ?? mockCustomers` |
| CustomerDetailPage | `apiCustomer ?? mockCustomers.find(...)` |
| ProjectDetailPage | `apiProject ?? mockProjects.find(...)` |
| LocationsPage | `apiProjects ?? mockProjects` |
| MetersPage | `metersQuery.data ?? mockMeters` |
| MeterDetailPage | `meterQuery.data ?? mockMeters.find(...)` |
| MeterTerminatePage | `metersQuery.data ?? mockMeters` |
| MeterReplacePage | `metersQuery.data ?? mockMeters` |
| SimCardsPage | `simCardsQuery.data ?? mockSimCards` |
| ReadingsPage | `apiReadings ?? mockReadings` |
| InvoiceDetailPage | ternary `useApi ? api : mock` |
| WaterBalancePage | `apiData ?? mockWaterBalanceData[...]` |
| DashboardPage | `consumptionQuery.data?.data ?? mockConsumptionData` |
| DashboardPage | `activityQuery.data?.items ?? mockRecentActivityData` |

## Feature Flag Configuration

```
projects.list     = mock
projects.readings = mock
locations.list    = mock
customers.list    = mock
meters.list       = mock
sims.list         = mock
readings.list     = mock
billing.list      = api  ← only 3 defaulting to api
invoices.list     = api
payments.list     = api
reports.list      = mock
alerts.list       = mock
tickets.list      = mock
```

## Verdict

**MOCK_FREE = NO**

The system has 18 mock fallback expressions, 33 toast stubs, and 10/13 feature flags defaulting to mock. Every single data page depends on mock data either as fallback or as primary data source.
