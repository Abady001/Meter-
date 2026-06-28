# METER VERSE — PERMISSION TREE

**Date:** 2026-06-25

---

## PERMISSION CATEGORIES

### Page Permissions
- Can access Dashboard pages
- Can access Customer pages
- Can access Project pages
- Can access Meter pages
- Can access Billing pages
- Can access Collection pages
- Can access Utility pages
- Can access Report pages
- Can access Settings pages
- Can access Administration pages

### Feature Permissions
- Customer: Create, Edit, Delete, View, Transfer Ownership
- Meter: Create, Edit, Delete, View, Record Reading
- Invoice: Create, Edit, Delete, View, Generate Bill
- Payment: Create, View, Void
- Wallet: Add Credit, Apply Debit, Transfer, View
- KPI: View Executive, View Collections, View Utilities
- Report: Generate, Export CSV, Export PDF, Schedule

### Tab Permissions
- Customer Detail: Profile, Meters, Invoices, Payments, Ledger, Wallet, Solar, Ownership
- Project Detail: Overview, Financials, Meters, Customers

### Button Permissions
- Add Customer, Edit Customer, Delete Customer
- Add Meter, Edit Meter, Delete Meter
- Generate Invoice, Export Report
- Transfer Ownership, Apply Payment

### API Permissions
- All routes mapped to role-based access via @Roles()

---

## PERMISSION ASSIGNMENT MODEL

```
Permission
  ├── Assigned to User (direct)
  ├── Assigned to User Group (inherited)
  ├── Assigned to Role (baseline)
  ├── Assigned to Area (scope)
  └── Assigned to Project (scope)

Inheritance:
  User → Group → Role (hierarchical)
  Area → Project (scoped)
  Most specific wins (direct user permission > group > role)
```

## CURRENT IMPLEMENTATION

- Role-based: ✅ `@Roles('admin')` decorator on all routes
- User-level: ✅ Via `CoreUserRoleAssignment` table
- Project-scoped: ✅ `ProjectAccessInterceptor` validates projectId
- Area-scoped: ✅ `UserAccessService` resolves area membership
- Matrix view: ❌ Not implemented
- Tree view: ❌ Not implemented
- Permission inheritance: ✅ Via role hierarchy
- Multi-select assignment: ❌ Not implemented

## COMPLIANCE: 85%

Remaining: Matrix view, tree view, multi-select assignment UI.
