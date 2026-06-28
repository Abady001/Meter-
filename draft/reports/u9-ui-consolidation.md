# U9 — UI CONSOLIDATION

**Date**: 2026-06-18

## Current Navigation (17 items)
```
Dashboard, Projects, Locations, Customers, Meters (4 children),
SIM Cards, Readings (2 children), Consumption, Water Balance,
Invoices, Payments, Balances, Reports, Alerts, Tickets, Support, Settings
```

## Target Navigation (Unified)
Based on the target business architecture, the consolidated navigation should be:

| Section | Items | Status |
|---------|-------|--------|
| **Dashboard** | Overview KPIs | ✅ EXISTS |
| **Customer Domain** | Customers, Units | ⚠️ Units missing as separate page |
| **Property Domain** | Projects, Locations | ✅ EXISTS |
| **Meter Domain** | All Meters, Assign, Replace, Terminate | ✅ EXISTS |
| **Reading Domain** | Readings, Review Queue | ✅ EXISTS |
| **Tariff Domain** | Tariff Plans | ❌ Missing (SettingsPage only) |
| **Billing Domain** | Invoices, Generate, Adjustments | ⚠️ Generate/Adjust missing |
| **Collection Domain** | Payments, Collections, Aging | ⚠️ Collections missing |
| **Utility Domain** | Consumption, Water Balance | ✅ EXISTS |
| **Financial Domain** | Balances, Reports, Statements | ⚠️ Statements missing |
| **Communication** | Alerts, Tickets, Support | ✅ EXISTS |
| **Administration** | Settings, Users, Roles | ⚠️ Users/Roles missing |

## Branding Audit
| Location | Current | Required (نظام التحصيلات) |
|----------|---------|------------------------|
| Browser title | "Meter Verse — Utility Metering & Billing Management" | "نظام التحصيلات" |
| Header | "Meter Pulse" | "نظام التحصيلات" |
| Login page | "ميتر فيرس" | "نظام التحصيلات" |
| Sidebar footer | "Meter Pulse v1.0.0" | "نظام التحصيلات" |

## Consolidation Plan
1. **RENAME** all branding to "نظام التحصيلات"
2. **ADD** Tariffs page (currently in Settings tab)
3. **ADD** Collections/Collections dashboard section
4. **ADD** Reading Review Queue as distinct page
5. **UNIFY** sidebar with the target architecture ordering

## Conclusion
Sidebar is clean and modern. Primary gaps: missing Tariffs page, missing Collections section, wrong branding everywhere.
