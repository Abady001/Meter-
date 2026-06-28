# U2 — Navigation Recovery

**Date**: 2026-06-18
**Method**: Source code audit of AppSidebar, navigation.ts, router-store.ts

## Current Navigation Tree

```
نظام التحصيلات
├── Dashboard (/dashboard) ✅
├── Projects (/projects) ✅
│   └── Project Detail (/projects/:id) ✅
├── Locations (/locations) ✅
├── Customers (/customers) ✅
│   └── Customer Detail (/customers/:id) ✅
├── Meters (/meters) ✅
│   ├── All Meters (/meters) ✅
│   ├── Assign Meter (/meters/assign) ⚠️ MOCK_ONLY
│   ├── Replace Meter (/meters/replace) ✅
│   └── Terminate Meter (/meters/terminate) ✅
│   └── Meter Detail (/meters/:id) ✅
├── SIM Cards (/sim-cards) ✅
├── Readings (/readings) ✅
│   ├── All Readings (/readings) ✅
│   └── New Reading (/readings/new) ⚠️ HYBRID
├── Consumption (/consumption) ⚠️ HYBRID
├── Water Balance (/water-balance) ⚠️ HYBRID
├── Invoices (/invoices) ✅
│   └── Invoice Detail (/invoices/:id) ✅
├── Payments (/payments) ⚠️ HYBRID
├── Balances (/balances) ⚠️ HYBRID
├── Reports (/reports) ❌ MOCK_ONLY
├── Alerts (/alerts) ❌ MOCK_ONLY
├── Tickets (/tickets) ❌ MOCK_ONLY
├── Support (/support) ❌ MOCK_ONLY
└── Settings (/settings) ❌ MOCK_ONLY
```

## Target Navigation Tree

```
نظام التحصيلات
├── Dashboard
├── Operations
│   ├── Projects
│   │   ├── All Projects
│   │   ├── Project Detail
│   │   └── Locations
│   ├── Customers
│   │   ├── All Customers
│   │   └── Customer Detail
│   ├── Meters
│   │   ├── All Meters
│   │   ├── Assign Meter
│   │   ├── Replace Meter
│   │   ├── Terminate Meter
│   │   └── Meter Detail
│   ├── SIM Cards
│   └── Readings
│       ├── All Readings
│       └── New Reading
│
├── Billing
│   ├── Tariffs ⬅️ MISSING
│   ├── Electricity ⬅️ MISSING (separate page)
│   ├── Water ⬅️ MISSING (separate page)
│   ├── Consumption ✅
│   ├── Water Balance ✅
│   ├── Invoices
│   │   ├── All Invoices
│   │   └── Invoice Detail
│   └── Payments ✅
│
├── Collections ⬅️ MISSING
│   ├── Payments (link)
│   ├── Aging Report ⬅️ MISSING
│   ├── Customer Statements ⬅️ MISSING
│   └── Balances ✅
│
├── Reporting ⬅️ MISSING (separate section)
│   ├── Reports ❌ MOCK_ONLY
│   └── Analytics ⬅️ MISSING
│
├── Notifications ⬅️ MISSING (dropdown only)
├── Alerts ❌ MOCK_ONLY
├── Tickets ❌ MOCK_ONLY
├── Support ❌ MOCK_ONLY
│
├── Administration ⬅️ MISSING
│   ├── Users ⬅️ MISSING
│   ├── Roles ⬅️ MISSING
│   ├── Permissions ⬅️ MISSING
│   ├── Areas ⬅️ MISSING
│   ├── Audit Logs ⬅️ MISSING
│   └── Settings ⚠️ HYBRID
│
└── Utilities ⬅️ MISSING
    ├── Solar ⬅️ MISSING
    └── Chilled Water ⬅️ MISSING
```

## Gap Analysis
| Missing Feature | Current Status |
|----------------|---------------|
| Tariffs page | Only in Settings tab |
| Collections section | Not in sidebar |
| Reports section | Not in sidebar, MOCK_ONLY |
| Administration section | Not in sidebar |
| Utilities section (Solar/Chilled) | Not in sidebar |
| Users/Roles/Permissions pages | Not implemented |
| Audit log viewer | Not implemented |
| Notifications page | Dropdown only, no full page |
| Aging report | Not implemented |
| Customer statements | Not implemented |
| Analytics | Not implemented |

## Conclusion
**Navigation gaps identified.** 13 target menu items are missing from the current sidebar. 7 pages are mock-only.
