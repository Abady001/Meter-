# METER VERSE — ROLE TREE

**Date:** 2026-06-25

---

## ROLE HIERARCHY

```
SUPER_ADMIN
├── Access: ALL areas, ALL projects
├── ALL permissions
├── Can override security
├── Can manage users, roles, permissions
├── Can hard-delete records
└── Can access admin console
    │
    ├── ADMIN
    │   ├── Access: assigned areas + projects
    │   ├── CRUD customers, meters, invoices, payments
    │   ├── Manage wallet (credit/debit/transfer)
    │   ├── Manage collections (recovery, promises)
    │   ├── Ownership transfer
    │   ├── View reports, KPIs
    │   ├── Manage users, roles (non-super-admin)
    │   └── View audit logs
    │       │
    │       ├── BILLING_OPERATOR
    │       │   ├── Access: assigned areas + projects
    │       │   ├── View customers, meters
    │       │   ├── CRUD invoices
    │       │   ├── Generate bills
    │       │   ├── Tariff management
    │       │   └── View reports
    │       │
    │       ├── CASHIER
    │       │   ├── Access: assigned areas + projects
    │       │   ├── View customers
    │       │   ├── Record payments
    │       │   ├── View invoices
    │       │   └── View collection reports
    │       │
    │       ├── CUSTOMER_SERVICE
    │       │   ├── Access: assigned areas + projects
    │       │   ├── View/create/edit customers
    │       │   ├── View meters
    │       │   ├── View invoices, payments
    │       │   └── View customer ledger
    │       │
    │       ├── METER_READER
    │       │   ├── Access: assigned areas + projects
    │       │   ├── View meters
    │       │   ├── Record readings
    │       │   └── View meter history
    │       │
    │       └── VIEWER
    │           ├── Access: assigned areas + projects
    │           ├── View-only: customers, meters, invoices
    │           ├── View reports, KPIs
    │           └── No create/edit/delete
    │
    └── PROJECT_MANAGER
        ├── Access: assigned projects only
        ├── View project customers, meters
        ├── View project financials
        ├── View project KPIs
        └── View project reports
```

## ROLE MODEL

| Role | Code | Scope | Can Create | Can Edit | Can Delete | Can Manage Users |
|------|------|-------|-----------|---------|-----------|-----------------|
| Super Admin | super_admin | Global | Yes | Yes | Yes (hard) | Yes |
| Admin | admin | Area/Project | Yes | Yes | Yes | Yes |
| Billing Operator | billing_operator | Area/Project | Invoices | Invoices | No | No |
| Cashier | cashier | Area/Project | Payments | No | No | No |
| Customer Service | customer_service | Area/Project | Customers | Customers | No | No |
| Meter Reader | meter_reader | Area/Project | Readings | No | No | No |
| Project Manager | project_manager | Project | No | No | No | No |
| Viewer | viewer | Area/Project | No | No | No | No |
