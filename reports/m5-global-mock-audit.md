# M5.4 — Global Mock Audit

**Date**: 2026-06-18

## Mock Import Status

| Page | File | Mock Imports | Status |
|------|------|-------------|--------|
| ReportsPage | `reports/ReportsPage.tsx` | 0 | ✅ API_ONLY |
| TicketsPage | `tickets/TicketsPage.tsx` | 0 | ✅ API_ONLY |
| SettingsPage | `reports/SettingsPage.tsx` | 0 | ✅ API_ONLY |
| SupportPage | `tickets/SupportPage.tsx` | 0 | ✅ API_ONLY |
| AlertsPage | `alerts/AlertsPage.tsx` | 0 | ✅ API_ONLY |
| DashboardPage | `dashboard/DashboardPage.tsx` | 0 | ✅ API_ONLY |
| MeterAssignPage | `meters/MeterAssignPage.tsx` | 0 | ✅ API_ONLY |

## Remaining Mock Imports (Detail Pages)
| Page | Mock Source | Risk |
|------|------------|------|
| ProjectDetailPage | mockProjects, Buildings, Units, Customers, Meters, Alerts, Readings | LOW — API origin data available |
| CustomerDetailPage | mockInvoices, mockMeters, mockUnits | LOW — API data available |
| MeterDetailPage | mockReadings, mockSimCards, mockInvoices | LOW — API data available |
| MeterTerminatePage | mockSimCards, mockCustomers | LOW — API data available |
| ReadingNewPage | mockProjects, Meters, Customers, Units, Readings | LOW — API data available |
| ConsumptionPage | mockConsumptionData | LOW — API fallback |
| WaterBalancePage | mockWaterBalanceData, Projects, Buildings, Meters | LOW — API fallback |

## Auth Layer
| File | Mock Dependency | Status |
|------|---------------|--------|
| AppShell, AppSidebar, TopNav, LoginPage, RoleSwitcher, ProtectedAction | `useAuthStore` from `mock-auth.ts` | ⚠️ Uses mock users as fallback when API fails |

## Classification Summary
| Category | Count |
|----------|-------|
| **API_ONLY** (completed in M5) | 7 pages |
| **HYBRID** (detail pages with mock fallbacks) | 7 pages |
| **AUTH_LAYER** (mock-auth.ts dependency) | 6 components |

**MOCK_FREE = NO** (7 detail pages still have mock fallbacks)
