# U4 — Enterprise Information Architecture

**Date**: 2026-06-18

## Proposed Architecture for نظام التحصيلات

```
نظام التحصيلات
├── Dashboard
│   ├── Operations KPIs
│   ├── Billing KPIs
│   ├── Collection KPIs
│   └── Alerts Summary
│
├── Operations
│   ├── Projects
│   │   ├── All Projects (list + CRUD) ✅
│   │   ├── Project Detail (tabs: Overview, Locations, Customers, Meters, Invoices) ✅
│   │   └── Locations (building/unit tree) ✅
│   │
│   ├── Customers
│   │   ├── All Customers (list + CRUD) ✅
│   │   └── Customer Detail (tabs: Overview, Units, Meters, Invoices, Payments, Balance, Tickets) ✅
│   │
│   ├── Properties
│   │   ├── Buildings
│   │   └── Units
│   │
│   ├── Meters
│   │   ├── All Meters ✅
│   │   ├── Assign Meter ⚠️ NEEDS FIX
│   │   ├── Replace Meter ✅
│   │   ├── Terminate Meter ✅
│   │   └── Meter Detail ✅
│   │
│   ├── SIM Cards ✅
│   │
│   └── Readings
│       ├── All Readings ✅
│       └── New Reading ✅
│
├── Billing
│   ├── Tariffs ⬅️ NEW (dedicated page)
│   ├── Consumption ✅
│   ├── Water Balance ✅
│   ├── Invoices
│   │   ├── Generate Invoice ⬅️ NEEDS DIALOG
│   │   ├── All Invoices ✅
│   │   └── Invoice Detail ✅
│   └── Payments ✅
│
├── Collections
│   ├── Aging Report ⬅️ NEW
│   ├── Customer Statements ⬅️ NEW (exists in API)
│   └── Balances ✅
│
├── Utilities
│   ├── Solar Billing ⬅️ NEW
│   └── Chilled Water Billing ⬅️ NEW
│
├── Reporting
│   ├── Operational Reports ⬅️ NEEDS REBUILD
│   ├── Billing Reports ⬅️ NEW
│   ├── Collection Reports ⬅️ NEW
│   └── Analytics ⬅️ NEW
│
├── Notifications
│   ├── Bell Dropdown ✅
│   └── Notification Center ⬅️ NEW
│
├── Alerts ✅
├── Tickets ✅
├── Support ✅
│
├── Administration
│   ├── Users ⬅️ NEW
│   ├── Roles ⬅️ NEW
│   ├── Areas ⬅️ NEW
│   ├── Audit Logs ⬅️ NEW
│   └── Settings ✅
│
└── System
    ├── API Documentation ⬅️ NEW (exists at /api/v1/docs)
    └── Health Check ⬅️ NEW
```

## Legend
| Symbol | Meaning |
|--------|---------|
| ✅ | EXISTS and working |
| ⚠️ | EXISTS but needs work |
| ⬅️ NEW | Does not exist, must be built |
