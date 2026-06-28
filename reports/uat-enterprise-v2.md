# UAT Package — Enterprise v2

**Date:** 2026-06-25
**Source:** `reports/uat-execution-board.md`
**Roles:** Super Admin, Admin, Billing, Cashier, Customer Service, Project Manager, Meter Reader

---

## 1. UAT Test Inventory — All Roles

### Role 1: Super Admin

| # | Scenario | Precondition | Expected Result | Priority |
|---|----------|-------------|----------------|:--------:|
| SA-01 | Login with super_admin credentials | User exists in core DB | Dashboard loads with area selector showing ALL areas | P0 |
| SA-02 | Switch between all areas | 3+ areas configured | Data filters per selected area; area name in header | P0 |
| SA-03 | Switch between all projects | 2+ projects per area | Projects filter by area correctly | P0 |
| SA-04 | Access DB Admin (Port 4001) | DB Admin service running | All 84 tables browsable; `sim_system`, `core`, `features`, `area_*` schemas visible | P0 |
| SA-05 | Run safe SQL query | DB Admin → Query | `SELECT * FROM sim_system.invoices LIMIT 10` returns data | P0 |
| SA-06 | Block dangerous SQL | Enter DROP/ALTER/DELETE | Blocked by regex; error returned | P0 |
| SA-07 | Create user with role assignment | Navigate to Settings → Users | User created; email notification sent | P0 |
| SA-08 | Edit user role | Existing user | Role updated; permissions change immediately | P0 |
| SA-09 | Delete user | Non-admin user | User soft-deleted; audit log updated | P0 |
| SA-10 | View audit log | Recent actions exist | Chronological list with actor, action, resource, timestamp | P0 |
| SA-11 | Cancel bill cycle | Cycle in OPEN/LOCKED status | Status changes to CANCELLED; no further invoicing | P1 |
| SA-12 | Configure system settings | Navigate to Settings → System | All 7 setting tabs functional (General, Billing, Invoice, Security, Email, Notifications, Integrations) | P0 |
| SA-13 | View all KPI dashboards | Data exists in system | Executive, Collections, Utilities KPIs all render | P1 |
| SA-14 | Export system report | Reports → any type → Export CSV | CSV file downloads with correct data | P1 |
| SA-15 | Manage area configurations | Settings → Areas | Area metadata (name, code, timezone, currency) editable | P0 |

### Role 2: Admin

| # | Scenario | Precondition | Expected Result | Priority |
|---|----------|-------------|----------------|:--------:|
| AD-01 | Login with admin credentials | User exists | Dashboard loads; only assigned areas visible | P0 |
| AD-02 | View assigned areas only | User limited to 1-2 areas | Area selector shows only assigned areas; unassigned areas hidden | P0 |
| AD-03 | Manage users within area | Navigate to Users | Can create/edit/delete users within own area only | P0 |
| AD-04 | View projects in area | Projects exist | All projects within area visible | P0 |
| AD-05 | Create bill cycle | Navigate to Billing → Bill Cycle | New cycle created in OPEN status | P0 |
| AD-06 | Lock bill cycle | Cycle in OPEN, all readings validated | Status changes to LOCKED; no further reading edits | P0 |
| AD-07 | Approve bill cycle | Cycle in LOCKED, invoices issued | Status changes to APPROVED | P0 |
| AD-08 | Close bill cycle | Cycle in APPROVED, all payments reconciled | Status changes to CLOSED; billing period finalized | P0 |
| AD-09 | Configure area-level settings | Settings → Area | Area-specific billing rules, tariffs, tax rates configurable | P1 |
| AD-10 | View area audit log | Recent admin actions | Filtered to own area | P1 |
| AD-11 | Manage tariff plans | Tariff Studio | Create/edit/activate/deactivate tariffs for own area | P0 |
| AD-12 | Generate area reports | Reports → select type | Data scoped to own area | P1 |

### Role 3: Billing Operator

| # | Scenario | Precondition | Expected Result | Priority |
|---|----------|-------------|----------------|:--------:|
| BI-01 | Enter manual reading | Meter assigned to customer | Reading saved as 'valid'; consumption calculated | P0 |
| BI-02 | Enter estimated reading | No manual reading available | Reading saved as 'estimated'; flag visible in UI | P0 |
| BI-03 | View reading review queue | Suspicious readings exist | Queue shows flagged readings with meter ID, date, value | P0 |
| BI-04 | Approve reading in review | Reading flagged as suspicious | Status changes to 'approved'; consumption recalculated | P0 |
| BI-05 | Reject reading in review | Reading flagged as suspicious | Reading marked as 'rejected'; operator prompted for new value | P1 |
| BI-06 | Create bill cycle | New billing period starts | Cycle created with start/end/due dates | P0 |
| BI-07 | Generate invoices for cycle | Bill cycle in OPEN, readings exist | Draft invoices created for all meters with readings | P0 |
| BI-08 | Verify invoice line items | Generated invoice | Line items match tariff: consumption + fees + admin + tax | P0 |
| BI-09 | Issue invoices | Invoices in draft status | Status → 'issued'; ledger entries created; PDF downloadable | P0 |
| BI-10 | Cancel invoice | Invoice in draft/issued status | Status → 'cancelled'; ledger reversed (if issued) | P0 |
| BI-11 | Add invoice adjustment | Issued invoice | Credit/debit adjustment with reason | P0 |
| BI-12 | Run invoices summary report | Issued invoices exist | Report renders with counts by status, totals | P1 |
| BI-13 | Export invoice data to CSV | From reports or invoice list | CSV file downloads with all invoice columns | P1 |
| BI-14 | View consumption history | Meter with 3+ billing periods | Chart showing monthly consumption trend | P1 |
| BI-15 | Apply water difference policy | Water meter with main+sub readings | Variance calculated and applied to invoice | P1 |

### Role 4: Cashier

| # | Scenario | Precondition | Expected Result | Priority |
|---|----------|-------------|----------------|:--------:|
| CA-01 | Process cash payment | Issued invoice exists | Payment recorded; invoice → 'partially_paid' or 'paid' | P0 |
| CA-02 | Process bank transfer payment | Issued invoice exists | Payment recorded as 'pending'; requires confirmation | P0 |
| CA-03 | Process card payment | Issued invoice exists | Payment recorded via payment gateway | P0 |
| CA-04 | Process wallet payment | Customer has wallet balance | Balance deducted; invoice updated | P0 |
| CA-05 | Issue payment receipt | Payment processed | Receipt PDF generated; includes payment details | P0 |
| CA-06 | Reverse payment | Payment exists | Allocations reversed; balances restored; invoice → 'issued' | P0 |
| CA-07 | View collections today | Payments exist today | Dashboard shows today's total, count, by method | P1 |
| CA-08 | View aging buckets | Overdue invoices exist | 30/60/90/90+ aging breakdown with amounts | P1 |
| CA-09 | Export collection report | Filter by date range | CSV with all payments in range | P1 |
| CA-10 | Process partial payment | Invoice > 500 EGP | Partial amount allocated; invoice → 'partially_paid' | P0 |
| CA-11 | Handle overpayment | Payment > invoice total | Excess credited to customer wallet | P0 |
| CA-12 | Search payment history | Customer name/code | Payment history displayed with dates, amounts, status | P1 |

### Role 5: Customer Service

| # | Scenario | Precondition | Expected Result | Priority |
|---|----------|-------------|----------------|:--------:|
| CS-01 | Search customer by name | Customer exists | Customer card appears with basic info | P0 |
| CS-02 | Search customer by code | Customer exists | Direct match; customer detail page opens | P0 |
| CS-03 | Search customer by meter serial | Meter assigned | Matched via meter → customer | P0 |
| CS-04 | Smart search (Ctrl+K) | Any search query | Global search dialog with results | P0 |
| CS-05 | View customer detail — Overview tab | Customer selected | 11-tab detail page loads; overview shows basic info, balance, status | P0 |
| CS-06 | View customer Invoices tab | Invoices exist | List of invoices with status, amount, due date | P0 |
| CS-07 | View customer Ledger tab | Ledger entries exist | Running balance with all debit/credit entries | P0 |
| CS-08 | View customer Payments tab | Payments exist | Payment history with allocation details | P0 |
| CS-09 | View customer Meters tab | Meters assigned | List of meters with serial, type, status, readings | P0 |
| CS-10 | View customer Readings tab | Readings exist | Historical readings chart and table | P0 |
| CS-11 | View customer Wallet tab | Wallet transactions exist | Balance and transaction history | P0 |
| CS-12 | Transfer ownership | Customer A → Customer B | All meters, invoices, wallet transferred; audit trail | P0 |
| CS-13 | Create support ticket | Customer issue reported | Ticket created with ID, category, priority | P0 |
| CS-14 | Update ticket status | Existing ticket | Status changes: Open → In Progress → Resolved → Closed | P1 |
| CS-15 | View customer 360 | Customer selected | Comprehensive view: balance, recent invoices, payments, open tickets | P1 |
| CS-16 | Add wallet credit | Customer requests | Amount credited; reason recorded; balance updated | P0 |

### Role 6: Project Manager

| # | Scenario | Precondition | Expected Result | Priority |
|---|----------|-------------|----------------|:--------:|
| PM-01 | View Executive KPI dashboard | Data exists | 5 sections: Revenue, Collections, Outstanding, Meters, Customers | P0 |
| PM-02 | View Collections KPI dashboard | Payments exist | Summary cards + aging buckets + collection rate | P0 |
| PM-03 | View Utilities KPI dashboard | Multi-utility data | Utility breakdown: Electricity, Water, Gas, Solar | P0 |
| PM-04 | Filter KPI by project | 2+ projects | Data filtered to selected project only | P0 |
| PM-05 | Filter KPI by date range | Date picker | KPI data recalculated for date range | P0 |
| PM-06 | Run project summary report | Project selected | Report with meters, customers, invoices, payments | P0 |
| PM-07 | Run billing summary report | Billing cycle closed | Total billed, collected, outstanding | P1 |
| PM-08 | Run monthly financial report | Date range | Revenue, fees, taxes, adjustments grouped by month | P1 |
| PM-09 | Export any report to CSV | Report rendered | CSV file downloads | P1 |
| PM-10 | Export any report to PDF | Report rendered | PDF file downloads | P1 |
| PM-11 | View consumption trends | 6+ months data | Trend chart by utility, comparison YoY | P1 |
| PM-12 | View collection efficiency | Payment data exists | Collection rate % , DSO, aging summary | P1 |

### Role 7: Meter Reader

| # | Scenario | Precondition | Expected Result | Priority |
|---|----------|-------------|----------------|:--------:|
| MR-01 | Login with meter_reader role | Credentials | Dashboard loads; meter reading UI visible; billing/admin hidden | P0 |
| MR-02 | Enter electricity reading | Meter selected, meter type = electricity | Reading saved; consumption calculated | P0 |
| MR-03 | Enter water reading | Meter selected, meter type = water | Reading saved; consumption calculated | P0 |
| MR-04 | Enter gas reading | Meter selected, meter type = gas | Reading saved; consumption calculated | P1 |
| MR-05 | Submit estimated reading | No manual reading, select 'estimated' | Reading saved with source = 'estimated'; flag visible | P0 |
| MR-06 | View reading history | Meter with 3+ previous readings | Historical chart + table with dates and values | P0 |
| MR-07 | Attach photo to reading | Camera/image available | Photo uploaded and linked to reading | P1 |
| MR-08 | View assigned meter list | Meters assigned to reader | List of meters with location, last reading, status | P0 |
| MR-09 | Flag suspicious reading | Reading > 2x previous month | Reading sent to review queue; status = 'suspicious' | P0 |
| MR-10 | Batch meter reading entry | 10+ meters assigned | CSV upload or sequential entry flow | P1 |
| MR-11 | Offline reading capture | No internet | Readings stored locally; synced when online | P2 |
| MR-12 | View route / schedule | Assigned route | Optimized route displayed with meter order | P1 |

---

## 2. Role Summary

| Role | Scenarios | P0 | P1 | P2 | Sign-Off Required |
|------|:---------:|:-:|:-:|:-:|:-----------------:|
| Super Admin | 15 | 12 | 3 | 0 | 15/15 |
| Admin | 12 | 9 | 3 | 0 | 12/12 |
| Billing Operator | 15 | 10 | 5 | 0 | 15/15 |
| Cashier | 12 | 7 | 5 | 0 | 12/12 |
| Customer Service | 16 | 13 | 3 | 0 | 16/16 |
| Project Manager | 12 | 7 | 5 | 0 | 12/12 |
| Meter Reader | 12 | 6 | 4 | 2 | 12/12 |
| **Total** | **94** | **64** | **28** | **2** | **94/94** |

---

## 3. UAT Execution Plan

### Phase 1: Core (P0) — 64 scenarios

| Role | Tests | Est. Time | Tester |
|------|:-----:|:---------:|--------|
| Super Admin | 12 | 3 hours | Project Lead |
| Admin | 9 | 2 hours | Area Admin |
| Billing Operator | 10 | 2.5 hours | Billing Team Lead |
| Cashier | 7 | 2 hours | Senior Cashier |
| Customer Service | 13 | 3 hours | CS Team Lead |
| Project Manager | 7 | 1.5 hours | PM |
| Meter Reader | 6 | 1.5 hours | Meter Reader Lead |

**Phase 1 Total: ~15.5 hours (2 days)**

### Phase 2: Extended (P1) — 28 scenarios

| Role | Tests | Est. Time | Tester |
|------|:-----:|:---------:|--------|
| Super Admin | 3 | 1 hour | Project Lead |
| Admin | 3 | 0.5 hours | Area Admin |
| Billing Operator | 5 | 1.5 hours | Billing Team |
| Cashier | 5 | 1.5 hours | Senior Cashier |
| Customer Service | 3 | 1 hour | CS Team |
| Project Manager | 5 | 1.5 hours | PM |
| Meter Reader | 4 | 1 hour | Meter Reader |

**Phase 2 Total: ~8 hours (1 day)**

### Phase 3: Edge (P2) — 2 scenarios

**Phase 3 Total: ~1 hour (minor)**

---

## 4. Sign-Off Matrix

| Role | Phase 1 (P0) | Phase 2 (P1) | Phase 3 (P2) | Final Sign-Off |
|------|:------------:|:------------:|:------------:|:--------------:|
| Super Admin | ☐ 12/12 | ☐ 3/3 | ☐ 0/0 | ☐ |
| Admin | ☐ 9/9 | ☐ 3/3 | ☐ 0/0 | ☐ |
| Billing Operator | ☐ 10/10 | ☐ 5/5 | ☐ 0/0 | ☐ |
| Cashier | ☐ 7/7 | ☐ 5/5 | ☐ 0/0 | ☐ |
| Customer Service | ☐ 13/13 | ☐ 3/3 | ☐ 0/0 | ☐ |
| Project Manager | ☐ 7/7 | ☐ 5/5 | ☐ 0/0 | ☐ |
| Meter Reader | ☐ 6/6 | ☐ 4/4 | ☐ 2/2 | ☐ |
| **Total** | **64/64** | **28/28** | **2/2** | **94/94** |

---

## 5. UAT Exit Criteria

| Criterion | Target | 
|-----------|--------|
| P0 pass rate | 100% (64/64) |
| P1 pass rate | ≥90% (25/28) |
| Overall pass rate | ≥95% (89/94) |
| Critical defects | 0 open |
| High defects | ≤3 open (with workaround) |
| All roles signed off | 7/7 |
| UAT completion | Within 5 business days |
