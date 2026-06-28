# USER ACCEPTANCE TESTING — EXECUTION PLAN

## Test Scenarios by Role

### Super Admin

| # | Scenario | Steps | Expected Result | Pass |
|---|----------|-------|----------------|------|
| 1 | Login | Navigate to /login, enter credentials | Dashboard loads with all areas visible | ☐ |
| 2 | View all areas | Switch area selector | All areas listed | ☐ |
| 3 | View all projects | Switch project selector | All projects listed | ☐ |
| 4 | Access DB Admin | Open port 4001, login | All 84 tables browsable | ☐ |
| 5 | Run SQL query | DB Admin → Query tab → SELECT * FROM sim_system.customers | Returns customer data | ☐ |
| 6 | Create user | Settings → Users → Add | User created with role | ☐ |
| 7 | Delete user | Settings → Users → Delete | User removed | ☐ |
| 8 | View audit log | Reports → Audit Log | Shows recent actions | ☐ |
| 9 | Cancel bill cycle | Billing → Bill Cycles → Cancel | Status changes to CANCELLED | ☐ |

### Billing Operator

| # | Scenario | Steps | Expected Result | Pass |
|---|----------|-------|----------------|------|
| 1 | Enter reading | Readings → New Reading → enter value | Reading saved as valid | ☐ |
| 2 | Review suspicious | Readings → Review Queue → Approve | Status changes to approved | ☐ |
| 3 | Create bill cycle | Billing → Bill Cycle → Create | Cycle created (OPEN) | ☐ |
| 4 | Generate invoices | Billing → Generate → select cycle | Invoices created (draft) | ☐ |
| 5 | Issue invoices | Invoices → select → Issue | Status → issued, ledger entry created | ☐ |
| 6 | Run invoices summary | Reports → Invoices Summary | Report renders with data | ☐ |
| 7 | Export CSV | Reports → Export CSV | CSV file downloads | ☐ |

### Cashier

| # | Scenario | Steps | Expected Result | Pass |
|---|----------|-------|----------------|------|
| 1 | Process cash payment | Payments → New → select customer/invoice → cash | Payment recorded, invoice updated | ☐ |
| 2 | Process bank transfer | Payments → New → bank_transfer | Payment pending, confirm later | ☐ |
| 3 | Issue receipt | Payment → Print Receipt | Receipt PDF generated | ☐ |
| 4 | Reverse payment | Payments → Reverse | Allocations reversed, balances restored | ☐ |
| 5 | View collections today | Collections Dashboard | Today's total matches register | ☐ |
| 6 | Export collection report | Collections → Export CSV | CSV with today's payments | ☐ |

### Customer Service

| # | Scenario | Steps | Expected Result | Pass |
|---|----------|-------|----------------|------|
| 1 | Search customer | Customers → search by name | Customer card appears | ☐ |
| 2 | View customer detail | Click customer card | 11-tab detail page loads | ☐ |
| 3 | View customer invoices | Customer → Invoices tab | List of invoices with status | ☐ |
| 4 | View customer ledger | Customer → Ledger tab | Running balance with all entries | ☐ |
| 5 | Transfer ownership | Customer → Ownership → Transfer | Meters/invoices transferred | ☐ |
| 6 | Create ticket | Tickets → New → fill form | Ticket created with ID | ☐ |
| 7 | View wallet | Customer → Wallet tab | Balance and transaction history | ☐ |

### Project Manager

| # | Scenario | Steps | Expected Result | Pass |
|---|----------|-------|----------------|------|
| 1 | View executive KPI | KPI Executive Dashboard | All 5 sections render with data | ☐ |
| 2 | View collections KPI | KPI Collections Dashboard | Summary cards + aging buckets | ☐ |
| 3 | View utilities KPI | KPI Utilities Dashboard | Utility breakdown cards | ☐ |
| 4 | Filter by project | Any KPI → select project | Data filtered to selected project | ☐ |
| 5 | Run project report | Reports → Project Summary | Report renders | ☐ |

### Meter Reader

| # | Scenario | Steps | Expected Result | Pass |
|---|----------|-------|----------------|------|
| 1 | Enter electricity reading | Readings → New → select electricity meter → enter value | Reading saved | ☐ |
| 2 | Enter water reading | Readings → New → select water meter → enter value | Reading saved | ☐ |
| 3 | Submit estimated reading | Readings → New → source = estimated | Reading saved as estimated | ☐ |
| 4 | View reading history | Meter Detail → Readings tab | Historical readings chart | ☐ |

## Sign-Off Criteria

| Role | Tests | Must Pass | Signed Off |
|------|-------|-----------|------------|
| Super Admin | 9 | 9/9 | ☐ |
| Billing Operator | 7 | 7/7 | ☐ |
| Cashier | 6 | 6/6 | ☐ |
| Customer Service | 7 | 7/7 | ☐ |
| Project Manager | 5 | 5/5 | ☐ |
| Meter Reader | 4 | 4/4 | ☐ |
| **Total** | **38** | **38/38** | ☐ |
