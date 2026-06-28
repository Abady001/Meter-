# Permission Matrix — LAACRP Phase H

## Roles

| Code | Role | Level |
|---|---|---|
| SA | SUPER_ADMIN | System-wide access, all areas, all projects |
| SY | SYSTEM_ADMIN | System-wide, no financial delete |
| AD | ADMIN | Area-scoped, full operational access |
| BA | BILLING_ADMIN | Billing-specific full access |
| FI | FINANCE | Financial read + payment operations |
| CT | COLLECTION_TEAM | Collections, payments, customer data |
| OP | OPERATIONS | Daily operations, meters, readings |
| CS | CUSTOMER_SERVICE | Customer-facing read + ticket management |
| VO | VIEW_ONLY | Read-only across permitted modules |
| AU | AUDITOR | Read-only with audit log access |

## Legend

- **☑** = Allowed
- **☐** = Denied

---

## Dashboard Pages (6)

| Page | Action | SA | SY | AD | BA | FI | CT | OP | CS | VO | AU |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **Executive Dashboard** | View | ☑ | ☑ | ☑ | ☑ | ☑ | ☑ | ☑ | ☑ | ☑ | ☑ |
| | Add | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| | Edit | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| | Delete | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| **Operations Dashboard** | View | ☑ | ☑ | ☑ | ☐ | ☐ | ☑ | ☑ | ☐ | ☑ | ☑ |
| **Billing Dashboard** | View | ☑ | ☑ | ☑ | ☑ | ☑ | ☑ | ☑ | ☐ | ☑ | ☑ |
| **Collections Dashboard** | View | ☑ | ☑ | ☑ | ☑ | ☑ | ☑ | ☐ | ☐ | ☑ | ☑ |
| **Utility Dashboard** | View | ☑ | ☑ | ☑ | ☑ | ☑ | ☐ | ☑ | ☐ | ☑ | ☑ |
| **Solar Dashboard** | View | ☑ | ☑ | ☑ | ☑ | ☐ | ☐ | ☐ | ☐ | ☑ | ☑ |

---

## Customer Pages (3)

| Page | Action | SA | SY | AD | BA | FI | CT | OP | CS | VO | AU |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **Customer List** | View | ☑ | ☑ | ☑ | ☑ | ☑ | ☑ | ☑ | ☑ | ☑ | ☑ |
| | Add | ☑ | ☑ | ☑ | ☑ | ☐ | ☐ | ☐ | ☑ | ☐ | ☐ |
| | Edit | ☑ | ☑ | ☑ | ☑ | ☐ | ☐ | ☐ | ☑ | ☐ | ☐ |
| | Delete | ☑ | ☑ | ☑ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| **Customer 360** | View | ☑ | ☑ | ☑ | ☑ | ☑ | ☑ | ☑ | ☑ | ☑ | ☑ |
| | Add | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| | Edit | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| | Delete | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| **Customer Statements** | View | ☑ | ☑ | ☑ | ☑ | ☑ | ☑ | ☐ | ☐ | ☑ | ☑ |
| | Export | ☑ | ☑ | ☑ | ☑ | ☑ | ☑ | ☐ | ☐ | ☑ | ☑ |

---

## Project Pages (4)

| Page | Action | SA | SY | AD | BA | FI | CT | OP | CS | VO | AU |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **Project List** | View | ☑ | ☑ | ☑ | ☑ | ☑ | ☑ | ☑ | ☐ | ☑ | ☑ |
| | Add | ☑ | ☑ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| | Edit | ☑ | ☑ | ☑ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| | Delete | ☑ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| **Project 360** | View | ☑ | ☑ | ☑ | ☑ | ☑ | ☑ | ☑ | ☐ | ☑ | ☑ |
| **Locations/Units** | View | ☑ | ☑ | ☑ | ☑ | ☐ | ☐ | ☑ | ☐ | ☑ | ☑ |
| | Add | ☑ | ☑ | ☑ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| | Edit | ☑ | ☑ | ☑ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| | Delete | ☑ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| **Project Thresholds** | View | ☑ | ☑ | ☑ | ☐ | ☐ | ☐ | ☑ | ☐ | ☐ | ☐ |
| | Edit | ☑ | ☑ | ☑ | ☐ | ☐ | ☐ | ☑ | ☐ | ☐ | ☐ |

---

## Billing Pages (6)

| Page | Action | SA | SY | AD | BA | FI | CT | OP | CS | VO | AU |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **Invoices** | View | ☑ | ☑ | ☑ | ☑ | ☑ | ☑ | ☑ | ☑ | ☑ | ☑ |
| | Add (Generate) | ☑ | ☑ | ☑ | ☑ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| | Edit | ☑ | ☑ | ☑ | ☑ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| | Delete (Cancel) | ☑ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| | Issue | ☑ | ☑ | ☑ | ☑ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| **Payments** | View | ☑ | ☑ | ☑ | ☑ | ☑ | ☑ | ☑ | ☑ | ☑ | ☑ |
| | Add | ☑ | ☑ | ☑ | ☐ | ☐ | ☑ | ☐ | ☐ | ☐ | ☐ |
| | Edit | ☑ | ☑ | ☑ | ☐ | ☐ | ☑ | ☐ | ☐ | ☐ | ☐ |
| | Reverse | ☑ | ☑ | ☑ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| **Adjustments** | View | ☑ | ☑ | ☑ | ☑ | ☑ | ☐ | ☐ | ☐ | ☑ | ☑ |
| | Add | ☑ | ☑ | ☑ | ☑ | ☑ | ☐ | ☐ | ☐ | ☐ | ☐ |
| | Approve | ☑ | ☑ | ☑ | ☑ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| **Billing Templates** | View | ☑ | ☑ | ☑ | ☑ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| | Edit | ☑ | ☑ | ☑ | ☑ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| **Consumption** | View | ☑ | ☑ | ☑ | ☑ | ☑ | ☐ | ☑ | ☐ | ☑ | ☑ |
| **Water Balance** | View | ☑ | ☑ | ☑ | ☑ | ☐ | ☐ | ☑ | ☐ | ☑ | ☑ |

---

## Meter Pages (5)

| Page | Action | SA | SY | AD | BA | FI | CT | OP | CS | VO | AU |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **All Meters** | View | ☑ | ☑ | ☑ | ☑ | ☑ | ☑ | ☑ | ☑ | ☑ | ☑ |
| | Add | ☑ | ☑ | ☑ | ☐ | ☐ | ☐ | ☑ | ☐ | ☐ | ☐ |
| | Edit | ☑ | ☑ | ☑ | ☐ | ☐ | ☐ | ☑ | ☐ | ☐ | ☐ |
| | Delete | ☑ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| **Assign Meter** | Execute | ☑ | ☑ | ☑ | ☐ | ☐ | ☐ | ☑ | ☐ | ☐ | ☐ |
| **Replace Meter** | Execute | ☑ | ☑ | ☑ | ☐ | ☐ | ☐ | ☑ | ☐ | ☐ | ☐ |
| **Terminate Meter** | Execute | ☑ | ☑ | ☑ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| **SIM Cards** | View | ☑ | ☑ | ☑ | ☐ | ☐ | ☐ | ☑ | ☐ | ☐ | ☐ |
| | Assign | ☑ | ☑ | ☑ | ☐ | ☐ | ☐ | ☑ | ☐ | ☐ | ☐ |

---

## Collections Page (1)

| Page | Action | SA | SY | AD | BA | FI | CT | OP | CS | VO | AU |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **Collections** | View | ☑ | ☑ | ☑ | ☑ | ☑ | ☑ | ☐ | ☐ | ☑ | ☑ |
| | Record Payment | ☑ | ☑ | ☑ | ☐ | ☐ | ☑ | ☐ | ☐ | ☐ | ☐ |
| | Promise to Pay | ☑ | ☑ | ☑ | ☐ | ☐ | ☑ | ☐ | ☐ | ☐ | ☐ |
| | Recovery Action | ☑ | ☑ | ☑ | ☐ | ☐ | ☑ | ☐ | ☐ | ☐ | ☐ |

---

## Reports Page (1)

| Page | Action | SA | SY | AD | BA | FI | CT | OP | CS | VO | AU |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **Reports** | View | ☑ | ☑ | ☑ | ☑ | ☑ | ☑ | ☑ | ☑ | ☑ | ☑ |
| | Generate | ☑ | ☑ | ☑ | ☑ | ☑ | ☑ | ☐ | ☐ | ☐ | ☐ |
| | Export | ☑ | ☑ | ☑ | ☑ | ☑ | ☑ | ☐ | ☐ | ☐ | ☑ |
| | Schedule | ☑ | ☑ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| | Delete | ☑ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |

---

## Settings Page (1)

| Page | Action | SA | SY | AD | BA | FI | CT | OP | CS | VO | AU |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **Settings** | View | ☑ | ☑ | ☑ | ☑ | ☐ | ☐ | ☐ | ☐ | ☑ | ☑ |
| | Edit System Config | ☑ | ☑ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| | Edit Billing Config | ☑ | ☑ | ☑ | ☑ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| | Edit Project Config | ☑ | ☑ | ☑ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |

---

## Upload Center (1)

| Page | Action | SA | SY | AD | BA | FI | CT | OP | CS | VO | AU |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **Upload Center** | View | ☑ | ☑ | ☑ | ☑ | ☐ | ☐ | ☑ | ☐ | ☐ | ☐ |
| | Upload Customers | ☑ | ☑ | ☑ | ☐ | ☐ | ☐ | ☑ | ☐ | ☐ | ☐ |
| | Upload Meters | ☑ | ☑ | ☑ | ☐ | ☐ | ☐ | ☑ | ☐ | ☐ | ☐ |
| | Upload Readings | ☑ | ☑ | ☑ | ☐ | ☐ | ☐ | ☑ | ☐ | ☐ | ☐ |
| | View History | ☑ | ☑ | ☑ | ☑ | ☐ | ☐ | ☑ | ☐ | ☐ | ☑ |

---

## Tariff Studio (1)

| Page | Action | SA | SY | AD | BA | FI | CT | OP | CS | VO | AU |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **Tariff Studio** | View | ☑ | ☑ | ☑ | ☑ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| | Create Tariff | ☑ | ☑ | ☑ | ☑ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| | Edit Tariff | ☑ | ☑ | ☑ | ☑ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| | Activate/Retire | ☑ | ☑ | ☑ | ☑ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| | Delete | ☑ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |

---

## Database Admin (1)

| Page | Action | SA | SY | AD | BA | FI | CT | OP | CS | VO | AU |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **Database Admin** | View | ☑ | ☑ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☑ |
| | Query | ☑ | ☑ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| | Export Schema | ☑ | ☑ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☑ |

---

## Settlements (1)

| Page | Action | SA | SY | AD | BA | FI | CT | OP | CS | VO | AU |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **Settlements** | View | ☑ | ☑ | ☑ | ☑ | ☑ | ☐ | ☐ | ☐ | ☑ | ☑ |
| | Create | ☑ | ☑ | ☑ | ☑ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| | Approve | ☑ | ☑ | ☑ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| | Settle | ☑ | ☑ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |

---

## Workplace (1)

| Page | Action | SA | SY | AD | BA | FI | CT | OP | CS | VO | AU |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **Workplace** | View | ☑ | ☑ | ☑ | ☑ | ☑ | ☑ | ☑ | ☑ | ☑ | ☑ |
| | Assign Tasks | ☑ | ☑ | ☑ | ☐ | ☐ | ☐ | ☑ | ☐ | ☐ | ☐ |
| | Edit Tasks | ☑ | ☑ | ☑ | ☐ | ☐ | ☐ | ☑ | ☑ | ☐ | ☐ |
| | Delete Tasks | ☑ | ☑ | ☑ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |

---

## Implementation Requirements

1. **Backend**: Create `CorePermission` entries for every (page, action) combination above
2. **Backend**: Create `CoreRole` entries matching the 10 roles
3. **Backend**: Create `CoreRolePermission` entries mapping each role to its allowed permissions
4. **Frontend**: Update `rolePermissions` in `Frontend/src/lib/navigation.ts` to match this matrix
5. **Frontend**: Create `<ProtectedAction>` wrapper component that checks permission before rendering buttons
6. **Backend**: Add permission-based guards to every controller endpoint
