# Product Requirements Document (PRD)

# Meter Verse: Utility Metering & Billing Management Platform

## Document Status

| Field | Value |
|---|---|
| Product Name | Meter Verse |
| Product Type | Utility Metering, Billing, and Customer Balance Management System |
| Version | PRD v1.0 Draft |
| Status | Planning / Requirements Definition |
| Planned Frontend | Next.js |
| Planned Backend | NestJS |
| Planned Database | PostgreSQL |
| Existing Database Source | `sim_system` |
| Target PostgreSQL Database | `Meter_Verse_pulse` |
| Target PostgreSQL Schema | `sim_system` |

---

# 1. Product Overview

## 1.1 Product Name

**Meter Verse: Utility Metering & Billing Management Platform**

---

## 1.2 Product Description

Meter Verse is a web-based platform for managing electricity meters, main water meters, and child/sub-water meters across projects, buildings, floors, units, and customers.

The system connects every meter to a customer and physical location, tracks the meter SIM card and IP address, collects meter readings, calculates consumption, generates invoices, records payments, and maintains customer balances.

The system is designed for utility operators, property operators, compound management companies, and project administrators who need to manage meter consumption and billing from one centralized platform.

---

## 1.3 Product Vision

The product vision is to create a reliable utility billing platform that allows operators to:

> Assign meters correctly, collect accurate consumption data, generate customer invoices, track payments, and monitor balances across electricity and water services.

---

## 1.4 Product Objectives

The main objectives are:

1. Centralize electricity and water meter management.
2. Track SIM cards, IP addresses, and meter connectivity.
3. Link meters to the correct customer, project, building, floor, and unit.
4. Collect and store historical meter readings.
5. Calculate electricity and water consumption.
6. Support main water and child/sub-water meter relationships.
7. Generate invoices from consumption data.
8. Track customer payments.
9. Maintain customer invoice, payment, and balance accounts.
10. Provide operational, billing, consumption, and financial reports.
11. Support dashboards and alerts for meter, billing, and collection monitoring.

---

## 1.5 Success Metrics / KPIs

Suggested KPIs:

| KPI | Target |
|---|---|
| Meter assignment accuracy | 99%+ |
| Monthly invoice generation accuracy | 99%+ |
| Reading-to-invoice traceability | 100% |
| Customer balance accuracy | 100% |
| Manual billing errors | Reduced over time |
| Offline/missing meter detection | Same day |
| System uptime | 99%+ |
| Report generation success | 99%+ |

---

# 2. Target Users and Roles

## 2.1 User Roles

| Role | Description |
|---|---|
| Super Admin | Full control over system configuration, users, projects, meters, billing, and reports. |
| Project Admin | Manages one or more projects and views project-specific meters, customers, invoices, and reports. |
| Operator | Creates customers, manages units, assigns meters, enters readings, and handles operational workflows. |
| Technician | Installs meters, assigns SIM cards, updates meter status, and handles meter replacement or termination. |
| Finance / Billing User | Generates invoices, records payments, reviews balances, and exports financial reports. |
| Support User | Handles customer complaints, meter issues, reading problems, and service cases. |
| Customer | Optional portal user who can view own consumption, invoices, payments, and balance. |

---

## 2.2 Role-Based Access Control Requirements

The system must support role-based access control.

Example permission groups:

| Module | Super Admin | Project Admin | Operator | Technician | Finance | Support | Customer |
|---|---|---|---|---|---|---|---|
| Projects | Full | Project only | View | View | View | View | No |
| Customers | Full | Project only | Create/Edit | View | View | View | Own only |
| Meters | Full | Project only | Create/Edit | Create/Edit | View | View | Own only |
| SIM/IP | Full | Project only | View/Edit | Create/Edit | View | View | No |
| Readings | Full | Project only | Create/Edit | Create/Edit | View | View | Own only |
| Invoices | Full | Project only | View | No | Create/Edit | View | Own only |
| Payments | Full | Project only | No | No | Create/Edit | View | Own only |
| Reports | Full | Project only | Operational | No | Financial | Support | Own only |
| Settings | Full | Limited | No | No | No | No | No |

---

# 3. Product Scope

## 3.1 In Scope

The product must support:

1. Project and location hierarchy management.
2. Customer and unit management.
3. Electricity meter management.
4. Main water meter management.
5. Child/sub-water meter management.
6. SIM card and IP address management.
7. Meter assignment to customer/unit/location.
8. Meter assignment history.
9. Meter reading capture and storage.
10. Consumption calculation.
11. Main water vs child water comparison.
12. Invoice generation from consumption.
13. Manual invoices and adjustments.
14. Payment recording.
15. Customer balance tracking.
16. Customer statement reports.
17. Operational dashboards.
18. Billing dashboards.
19. Alerts and notifications.
20. User authentication and authorization.

---

## 3.2 Out of Scope for Initial PRD / Future Consideration

The following may be considered for later phases:

1. Mobile technician app.
2. Online payment gateway integration.
3. Customer self-service portal.
4. Automatic invoice sending by email/SMS/WhatsApp.
5. Advanced accounting system integration.
6. Advanced tariff/slab billing engine.
7. AI-based anomaly detection.
8. Predictive consumption forecasting.
9. Full IoT device command/control.
10. Multi-tenant SaaS white-label management.

---

# 4. Core Business Concepts

## 4.1 Project and Location Hierarchy

Meters are installed inside a physical project/location structure.

Recommended hierarchy:

```text
Project
  → Zone / Area
    → Building
      → Floor
        → Unit / Apartment / Shop
```

The system should support flexible hierarchy levels, but the minimum required structure is:

```text
Project
  → Building
    → Unit
```

---

## 4.2 Customer

A customer is a person or company responsible for one or more units and the consumption generated by assigned meters.

Customer data should include:

- Customer code
- Customer name
- Phone number
- Email
- National ID / commercial registration
- Customer type: individual, company, tenant, owner
- Address
- Project
- Unit(s)
- Active/inactive status
- Notes

Business rule:

> One customer may have one or more units and one or more meters.

---

## 4.3 Unit

A unit represents the physical space where meters are assigned.

Examples:

- Apartment
- Villa
- Shop
- Office
- Common area
- Pump room
- Facility/service area

Unit data should include:

- Project
- Building
- Floor
- Unit number/name
- Unit type
- Customer assignment
- Active/inactive status

Business rule:

> A unit may have multiple meters, such as one electricity meter and one or more water meters.

---

## 4.4 Meter

A meter is a device that records utility consumption.

Supported meter types:

1. Electricity meter
2. Main water meter
3. Child/sub-water meter

Meter data should include:

- Meter serial number
- Meter type
- Brand/manufacturer
- Model
- Project
- Building/floor/unit/location
- Assigned customer
- Assigned SIM card
- Assigned IP address
- Installation date
- Activation date
- Termination date
- Last reading
- Last reading date/time
- Last communication date/time
- Meter status

Suggested meter statuses:

- Available
- Assigned
- Active
- Offline
- Faulty
- Replaced
- Terminated
- Retired

---

## 4.5 SIM Card and IP Address

Each meter can have a SIM card used for communication. Each SIM card has an IP address.

SIM data should include:

- SIM number / ICCID
- MSISDN / phone number
- IP address
- IP type: static or dynamic
- Provider/operator
- Data plan, if needed
- Assigned meter
- Assignment start date
- Assignment end date
- SIM status

Suggested SIM statuses:

- Available
- Assigned
- Active
- Suspended
- Old / Previously Used
- Reusable
- Retired

Important business rule:

> One SIM card can be assigned to only one active meter at a time.

Important termination rule:

> When a meter is terminated, the linked SIM card should move to old/previous assignment status, but remain available for reuse on another meter.

---

# 5. Functional Requirements

# 5.1 Project and Location Management

## Requirements

The system must allow authorized users to:

1. Create, edit, view, and deactivate projects.
2. Create project hierarchy levels such as zones, buildings, floors, and units.
3. Link customers and meters to the correct project/location.
4. Filter customers, meters, readings, invoices, and reports by project/location.
5. Keep historical references when a customer or meter moves from one unit to another.

## Acceptance Criteria

- Admin can create a project.
- Admin can create buildings, floors, and units under a project.
- A meter cannot be assigned without a valid location.
- Reports can be filtered by project, building, floor, and unit.

---

# 5.2 Customer Management

## Requirements

The system must allow authorized users to:

1. Create customer profiles.
2. Edit customer details.
3. Activate/deactivate customers.
4. Link customers to one or more units.
5. View customer meters.
6. View customer readings.
7. View customer invoices.
8. View customer payments.
9. View customer balance.
10. View customer statement.

## Customer Financial Structure

Each customer must have three financial tracking areas:

```text
Customer
  → Invoice Account
  → Payment Account
  → Balance Account
```

---

# 5.3 Meter Management

## Requirements

The system must allow authorized users to:

1. Add meters manually.
2. Import meters in bulk, if required.
3. Classify meters by type: electricity, main water, child/sub-water.
4. Assign meters to projects, buildings, floors, units, and customers.
5. Assign SIM cards and IP addresses to meters.
6. View meter reading history.
7. View meter assignment history.
8. Mark meters as active, offline, faulty, replaced, terminated, or retired.
9. Replace a meter while preserving customer and unit history.
10. Terminate a meter and release the linked SIM card for reuse.

## Acceptance Criteria

- A meter must have a unique serial number.
- A meter can only have one active SIM assignment at a time.
- A meter can only have one active customer/unit assignment at a time.
- Historical assignments must remain available after replacement or termination.

---

# 5.4 SIM Card and IP Management

## Requirements

The system must allow authorized users to:

1. Add SIM cards manually.
2. Import SIM cards in bulk, if required.
3. Store SIM ICCID, phone number, provider, and IP address.
4. Assign a SIM card to a meter.
5. Unassign a SIM card from a meter.
6. Track SIM assignment history.
7. Mark SIM as available, assigned, active, suspended, old/previously used, reusable, or retired.
8. Allow a previously used SIM to be reused after meter termination.

## SIM Reuse Rule

When a meter is terminated:

```text
Meter status → Terminated
SIM assignment → Ended
SIM status → Old / Previously Used or Reusable
SIM availability → Available for reassignment
```

## Acceptance Criteria

- A SIM cannot be assigned to two active meters at the same time.
- Terminating a meter does not permanently retire the SIM.
- The system shows previous SIM assignment history.
- A reusable SIM can be assigned to a new meter.

---

# 5.5 Meter Assignment Management

## Assignment Workflow

Suggested workflow:

```text
Select Project
→ Select Building
→ Select Floor
→ Select Unit
→ Select Customer
→ Select Meter Type
→ Select Available Meter
→ Select SIM/IP, if not already assigned
→ Confirm Assignment
```

## Requirements

The system must:

1. Assign meters to customers and units.
2. Store assignment start date.
3. Store assignment end date when removed.
4. Store who created the assignment.
5. Store the reason for assignment change.
6. Preserve full assignment history.
7. Prevent invalid duplicate active assignments.

## Assignment History Data

Assignment history should include:

- Meter
- Customer
- Project
- Building
- Floor
- Unit
- Start date
- End date
- Assigned by
- Removed by
- Reason
- Status

---

# 5.6 Meter Reading and Consumption Management

## Reading Sources

The system should support readings from:

1. Manual entry by operator.
2. Automatic meter communication.
3. Imported file.
4. External API or integration.

MVP may start with manual reading entry and later support automatic communication.

## Reading Data

Each meter reading should store:

- Meter ID
- Customer ID at time of reading
- Unit ID at time of reading
- Reading value
- Reading date/time
- Reading source: manual, automatic, import, API
- Previous reading value
- Consumption amount
- Reading status
- Entered by / received by
- Raw payload, if automatic
- Notes

## Reading Status Values

Suggested statuses:

- Valid
- Pending review
- Estimated
- Suspicious
- Corrected
- Rejected

## Consumption Formula

```text
Consumption = Current Reading - Previous Reading
```

For electricity:

```text
kWh Consumption = Current kWh Reading - Previous kWh Reading
```

For water:

```text
m³ Consumption = Current m³ Reading - Previous m³ Reading
```

## Validation Rules

The system should flag readings when:

1. Current reading is lower than previous reading.
2. Reading is missing for the expected period.
3. Consumption is unusually high.
4. Consumption is zero for a long period.
5. Reading date overlaps with an existing reading.
6. Reading belongs to a terminated meter.
7. Reading is entered for a meter without active customer/unit assignment.

---

# 5.7 Electricity Meter Requirements

## Requirements

The system must support:

1. Electricity readings in kWh.
2. Daily, monthly, and custom-period electricity consumption.
3. Electricity invoice generation based on readings.
4. High-consumption detection.
5. Zero-consumption detection.
6. Missing-reading detection.
7. Electricity reports by customer, unit, building, project, and billing period.

## Optional Advanced Data

If supported by the meter, the system may also track:

- Voltage
- Current
- Power factor
- Load
- Demand
- Meter alarms

---

# 5.8 Water Meter Requirements

## Requirements

The system must support:

1. Water readings in cubic meters.
2. Main water meters.
3. Child/sub-water meters.
4. Water consumption calculation.
5. Water invoice generation based on readings.
6. Main meter vs child meter comparison.
7. Water leakage or difference detection.
8. Water reports by customer, unit, building, project, and billing period.

---

# 5.9 Main Water and Child/Sub-Water Meter Logic

## Concept

A main water meter measures total water entering a building, zone, or project.

Child/sub-water meters measure consumption for individual units/customers under the main meter.

Example structure:

```text
Main Water Meter
  → Child Water Meter 1
  → Child Water Meter 2
  → Child Water Meter 3
```

## Calculation

```text
Main Meter Consumption = Total water entering building/area
Sum of Child Meter Consumption = Total measured customer/unit usage
Difference = Main Meter Consumption - Sum of Child Meter Consumption
```

Example:

```text
Main water meter consumption: 1,000 m³
Child meter total consumption: 920 m³
Difference: 80 m³
```

## Difference Meaning

The difference may represent:

- Leakage
- Common/shared area consumption
- Unassigned consumption
- Reading timing difference
- Meter error
- Data issue

## Requirements

The system must:

1. Link child meters to a parent/main water meter.
2. Calculate the sum of child meter consumption.
3. Compare child total against main meter consumption.
4. Display difference amount and percentage.
5. Flag difference when above configured threshold.
6. Include main-vs-child comparison in reports.

---

# 5.10 Billing, Invoice, Payment, and Balance Management

## 5.10.1 Billing Goal

The billing system must convert meter readings into invoices, record payments, and maintain customer balances.

Billing flow:

```text
Customer
→ Unit
→ Meter
→ Meter Readings
→ Consumption
→ Tariff/Rate
→ Invoice
→ Payment
→ Balance
```

---

## 5.10.2 Customer Financial Accounts

Each customer must have three financial accounts:

### 1. Invoice Account

Tracks all invoices generated for the customer.

Examples:

- Electricity consumption invoice
- Water consumption invoice
- Child/sub-water invoice
- Service charge invoice
- Adjustment invoice
- Penalty invoice
- Manual invoice

### 2. Payment Account

Tracks all payments made by the customer.

Payment can be:

- Linked to a specific invoice.
- Split across multiple invoices.
- Applied directly to customer balance.

### 3. Balance Account

Tracks the customer’s current financial position.

Balance formula:

```text
Customer Balance = Total Issued Invoices - Total Confirmed Payments + Adjustments
```

Balance states:

- Zero balance: customer owes nothing.
- Positive balance: customer owes money.
- Credit balance: customer paid more than required.

---

## 5.10.3 Invoice Data Fields

Invoices should include:

- Invoice number
- Customer
- Project
- Building
- Floor
- Unit
- Meter serial number
- Meter type
- Billing period
- Previous reading
- Current reading
- Consumption
- Tariff/rate
- Subtotal
- Tax/VAT, if applicable
- Discount, if applicable
- Penalty, if applicable
- Adjustment, if applicable
- Total invoice amount
- Paid amount
- Remaining amount
- Invoice date
- Due date
- Invoice status

Suggested invoice statuses:

- Draft
- Issued
- Partially paid
- Paid
- Overdue
- Cancelled

---

## 5.10.4 Payment Data Fields

Payments should include:

- Payment number / receipt number
- Customer
- Related invoice(s), if applicable
- Payment date
- Payment method
- Paid amount
- Collected by
- Payment status
- Notes

Suggested payment methods:

- Cash
- Bank transfer
- Card
- Online payment
- Cheque
- Mobile wallet

Suggested payment statuses:

- Pending
- Confirmed
- Reversed
- Cancelled

---

## 5.10.5 Invoice Calculation

Basic formula:

```text
Consumption = Current Reading - Previous Reading
Invoice Amount = Consumption × Tariff Rate
```

Example electricity invoice:

```text
Previous electricity reading: 1,000 kWh
Current electricity reading: 1,250 kWh
Consumption: 250 kWh
Rate: 0.50 per kWh
Invoice Amount: 125.00
```

Example water invoice:

```text
Previous water reading: 300 m³
Current water reading: 380 m³
Consumption: 80 m³
Rate: 2.00 per m³
Invoice Amount: 160.00
```

---

## 5.10.6 Tariff and Rate Management

The system should support tariffs/rates by:

- Meter type
- Project
- Customer type
- Billing period
- Fixed rate per unit
- Future support for tiered/slab rates

MVP recommendation:

> Use fixed rate per unit for electricity and water, configurable by project and meter type.

---

## 5.10.7 Billing Periods

The system should support:

- Monthly billing
- Custom billing period
- Future daily/weekly billing if needed

MVP recommendation:

> Monthly billing per customer/unit/meter.

---

## 5.10.8 Invoice Workflow

Suggested workflow:

```text
Select billing period
→ Pull customer, unit, and meter data
→ Pull previous and current meter readings
→ Calculate consumption
→ Apply tariff/rate
→ Generate draft invoice
→ Review invoice
→ Issue invoice
→ Track payment
→ Update balance
```

---

## 5.10.9 Payment Workflow

Suggested workflow:

```text
Select customer
→ View outstanding invoices and balance
→ Enter payment amount
→ Select payment method
→ Link payment to invoice or customer balance
→ Confirm payment
→ Generate receipt
→ Update customer balance
```

---

# 5.11 Reports

## Operational Reports

The system should provide:

1. Customer consumption report.
2. Meter reading history report.
3. Daily consumption report.
4. Monthly consumption report.
5. Project consumption summary.
6. Building consumption summary.
7. Main water vs child water comparison report.
8. Missing readings report.
9. Offline meters report.
10. Faulty meters report.
11. SIM/IP status report.
12. High consumption report.
13. Zero consumption report.
14. Meter replacement history report.
15. Customer-meter assignment history report.

## Billing Reports

The system should provide:

1. Customer statement report.
2. Invoice list report.
3. Paid invoices report.
4. Unpaid invoices report.
5. Overdue invoices report.
6. Payment collection report.
7. Customer balance report.
8. Project revenue report.
9. Monthly billing summary.
10. Meter consumption vs invoice report.
11. Cancelled invoice report.
12. Payment reversal report.

## Export Requirements

Reports should support export to:

- Excel
- CSV
- PDF, if required for invoices/statements

---

# 5.12 Dashboards

## Operational Dashboard

Dashboard cards may include:

- Total projects
- Total customers
- Total meters
- Active electricity meters
- Active water meters
- Offline meters
- Meters with no recent reading
- Today’s consumption
- Monthly consumption
- Active alerts
- Top high-consumption customers/buildings

Charts may include:

- Electricity consumption over time
- Water consumption over time
- Project comparison
- Building comparison
- Main vs child water difference
- Offline meter trend

---

## Billing Dashboard

Billing dashboard may include:

- Total invoiced amount this month
- Total collected amount this month
- Total outstanding balance
- Number of paid invoices
- Number of unpaid invoices
- Number of overdue invoices
- Top customers by outstanding balance
- Revenue by project
- Revenue by meter type

---

# 5.13 Alerts and Notifications

## Alert Types

The system should support alerts for:

1. Meter offline.
2. No recent reading.
3. High consumption.
4. Zero consumption.
5. Negative consumption.
6. Suspicious reading.
7. SIM inactive/suspended.
8. IP not reachable.
9. Main vs child water difference above threshold.
10. Meter replacement needed.
11. Invoice overdue.
12. Payment reversed.
13. Customer balance above threshold.

## Notification Channels

Possible notification channels:

- In-app notifications
- Email
- SMS
- WhatsApp, future option

MVP recommendation:

> Start with in-app alerts. Add external notification channels in later phases.

---

# 5.14 Authentication and Authorization

## Requirements

The system must support:

1. Login/logout.
2. Secure password hashing.
3. JWT-based authentication or secure session authentication.
4. Role-based access control.
5. User management by admin.
6. Project-level access restrictions.
7. Audit logs for sensitive actions.
8. Optional two-factor authentication in future.

Sensitive actions requiring audit logs:

- Invoice cancellation
- Payment reversal
- Meter termination
- SIM reassignment
- Tariff changes
- Customer balance adjustment
- User role changes

---

# 6. Key User Flows

## 6.1 Meter Onboarding Flow

```text
Create meter record
→ Select meter type
→ Enter meter serial number
→ Link to project/location
→ Assign SIM/IP
→ Set status as available or active
```

---

## 6.2 Customer and Unit Assignment Flow

```text
Create customer
→ Create/select project and unit
→ Link customer to unit
→ Select available meter
→ Assign meter to customer/unit
→ Store assignment history
```

---

## 6.3 Reading Entry Flow

```text
Select meter or customer
→ Enter current reading
→ System finds previous reading
→ System calculates consumption
→ System validates reading
→ Save reading
```

---

## 6.4 Invoice Generation Flow

```text
Select billing period
→ Select project/customer/meter group
→ Pull validated readings
→ Calculate consumption
→ Apply tariff
→ Generate draft invoices
→ Review
→ Issue invoices
→ Update invoice account and balance
```

---

## 6.5 Payment Collection Flow

```text
Select customer
→ View balance and unpaid invoices
→ Enter payment
→ Select payment method
→ Allocate payment
→ Confirm payment
→ Generate receipt
→ Update payment account and balance
```

---

## 6.6 Meter Termination and SIM Reuse Flow

```text
Select meter
→ Confirm termination reason
→ End active meter assignment
→ End SIM assignment
→ Change meter status to Terminated
→ Change SIM status to Old / Previously Used or Reusable
→ Make SIM available for future reassignment
→ Preserve full history
```

---

# 7. Business Rules

## 7.1 Meter Rules

1. Meter serial number must be unique.
2. A meter can only have one active customer/unit assignment at a time.
3. A meter can only have one active SIM assignment at a time.
4. A terminated meter cannot receive new readings unless reactivated by an authorized user.
5. Meter replacement must preserve historical readings and invoices.
6. Meter assignment history must never be deleted.

---

## 7.2 SIM Rules

1. SIM ICCID must be unique.
2. A SIM can only be assigned to one active meter at a time.
3. A SIM can be reused after the previous meter is terminated.
4. SIM history must track every meter assignment.
5. Retired SIMs cannot be reused unless reactivated by an authorized user.

---

## 7.3 Reading Rules

1. Reading value must be numeric.
2. Reading date must be valid.
3. Current reading should normally be greater than or equal to previous reading.
4. Negative consumption must be flagged for review.
5. Suspicious readings should not be used for invoice generation unless approved.
6. Invoice generation should use validated readings only.

---

## 7.4 Billing Rules

1. Invoice must be linked to customer, unit, meter, and billing period.
2. Invoice generated from consumption must include previous and current readings.
3. Invoice cannot be marked paid until payment is confirmed.
4. One invoice may have multiple partial payments.
5. One payment may be applied to one or multiple invoices.
6. Customer balance must update after invoice issue, payment confirmation, invoice cancellation, payment reversal, or adjustment.
7. Cancelled invoices should remain in history.
8. Reversed payments should remain in history.

---

# 8. Conceptual Database Entities

This section defines core data concepts, not final database schema.

## 8.1 Core Entities

| Entity | Purpose |
|---|---|
| Users | System users and login accounts |
| Roles | Permission groups |
| Projects | Main project/site records |
| Zones/Areas | Optional project subdivision |
| Buildings | Buildings inside projects |
| Floors | Floors inside buildings |
| Units | Apartments, shops, offices, or service locations |
| Customers | Customer profiles |
| Customer Units | Relationship between customers and units |
| Meters | Electricity/water meter records |
| SIM Cards | SIM inventory and communication data |
| Meter SIM Assignments | History of SIM-to-meter assignments |
| Meter Assignments | History of meter-to-customer/unit assignments |
| Meter Readings | Historical meter reading data |
| Tariffs | Rate configuration by meter type/project |
| Billing Periods | Monthly/custom billing cycles |
| Invoices | Customer invoice records |
| Invoice Lines | Detailed invoice items |
| Payments | Customer payment records |
| Payment Allocations | Links payments to invoices/balance |
| Balance Adjustments | Manual credits/debits/penalties/discounts |
| Alerts | System alerts |
| Audit Logs | Sensitive action history |
| Reports | Saved/exported report references, if needed |

---

## 8.2 Important Relationships

```text
Project → Building → Floor → Unit
Customer → Customer Units → Unit
Unit → Meter Assignment → Meter
Meter → SIM Assignment → SIM Card
Meter → Meter Readings
Meter Readings → Consumption
Consumption → Invoice Line
Invoice → Payment Allocation → Payment
Customer → Invoices / Payments / Balance
Main Water Meter → Child Water Meters
```

---

# 9. Non-Functional Requirements

## 9.1 Performance

- Common pages should load quickly under normal usage.
- API response time should be optimized for operational workflows.
- Reports should support filtering to avoid loading excessive data.

## 9.2 Scalability

The system should be designed to support growth in:

- Projects
- Customers
- Units
- Meters
- Readings
- Invoices
- Payments

## 9.3 Availability

- System should be available during business operations.
- Critical billing and payment data must not be lost.

## 9.4 Security

The system must support:

- HTTPS
- Secure password hashing
- Role-based permissions
- Project-level access restrictions
- Audit logs
- Input validation
- Protection against unauthorized access

## 9.5 Backup and Recovery

The system should support:

- Daily database backups.
- Backup verification.
- Recovery procedure documentation.
- Export of key financial and operational data.

## 9.6 Auditability

The system must record audit logs for:

- User login/security actions
- Meter assignment changes
- SIM assignment changes
- Meter termination
- Invoice generation/cancellation
- Payment creation/reversal
- Balance adjustments
- Tariff changes

---

# 10. MVP Scope

## 10.1 Recommended MVP

The MVP should include:

1. Login and role-based access.
2. Project/building/floor/unit management.
3. Customer management.
4. Meter management.
5. SIM/IP management.
6. Meter-to-customer/unit assignment.
7. Meter assignment history.
8. Manual reading entry.
9. Reading history.
10. Consumption calculation.
11. Fixed tariff/rate configuration.
12. Monthly invoice generation from readings.
13. Manual invoice creation.
14. Payment entry.
15. Partial payment support.
16. Customer balance calculation.
17. Customer statement page.
18. Basic operational dashboard.
19. Basic billing dashboard.
20. Core reports.
21. Meter termination and SIM reuse flow.

---

## 10.2 Phase 2 Features

Phase 2 may include:

1. Automatic meter communication.
2. Customer portal.
3. Online payment gateway.
4. PDF invoice templates.
5. Email/SMS/WhatsApp notifications.
6. Advanced alerts.
7. Tiered/slab tariff engine.
8. Approval workflow for invoices and adjustments.
9. Mobile technician app.
10. Integration with external systems.
11. Advanced analytics and anomaly detection.

---

# 11. Risks and Mitigation

| Risk | Impact | Mitigation |
|---|---|---|
| Incorrect meter-to-customer assignment | Wrong billing | Assignment history, validation, approval where needed |
| Missing readings | Incomplete billing | Missing reading reports and alerts |
| Negative or suspicious consumption | Wrong invoices | Reading validation and review status |
| SIM assigned to wrong meter | Communication/data issues | SIM assignment history and one-active-assignment rule |
| Customer balance mismatch | Financial errors | Ledger-style invoice/payment/balance tracking |
| Invoice cancellation misuse | Financial/audit risk | RBAC and audit logs |
| Payment reversal misuse | Financial/audit risk | RBAC, audit logs, and reversal reason |
| Main/child water mismatch | Leakage or billing confusion | Difference reports and thresholds |
| Database migration issues | Delayed implementation | Validate `sim_system` migration before app build |
| Large report data | Slow performance | Date filters, pagination, exports, indexes |

---

# 12. Acceptance Criteria

## 12.1 Meter and SIM Acceptance Criteria

- Admin can create meters and SIM cards.
- A meter can be assigned to a customer/unit.
- A SIM can be assigned to one active meter only.
- Terminating a meter releases the SIM as old/reusable.
- Meter assignment history is preserved.
- SIM assignment history is preserved.

## 12.2 Reading and Consumption Acceptance Criteria

- User can enter meter readings manually.
- System calculates consumption from previous and current readings.
- System flags negative or suspicious readings.
- Reading history is visible per meter, customer, and unit.
- Validated readings can be used for invoice generation.

## 12.3 Billing Acceptance Criteria

- System can generate invoice from meter consumption.
- Invoice includes customer, unit, meter serial number, readings, consumption, rate, and amount.
- Customer has invoice account, payment account, and balance account.
- User can record payment against invoice or customer balance.
- Partial payments are supported.
- Customer balance updates correctly after invoices and payments.
- Customer statement shows invoices, payments, and running balance.

## 12.4 Reporting Acceptance Criteria

- User can view consumption reports.
- User can view invoice reports.
- User can view payment reports.
- User can view customer balance reports.
- User can export required reports.

## 12.5 Security Acceptance Criteria

- Users can log in securely.
- Permissions restrict access by role.
- Sensitive financial actions are logged.
- Project users can only access allowed projects.

---

# 13. Open Questions Before Final Implementation

## 13.1 Meter and Reading Questions

1. Are readings cumulative for all meter types?
2. Will MVP use manual readings only, or automatic readings also?
3. What protocol do meters use for automatic reading: HTTP, TCP, MQTT, Modbus, DLMS/COSEM, vendor API, or another protocol?
4. How often should automatic readings be collected?
5. What should happen when readings are missing?
6. What is the acceptable threshold for high or suspicious consumption?

## 13.2 Billing Questions

1. Should each customer receive one combined invoice or separate invoices for electricity and water?
2. Should main water and child water be billed separately?
3. Should the system bill the main-vs-child water difference or only report it?
4. Do we need tax/VAT in MVP?
5. Do we need discounts, penalties, or late fees in MVP?
6. Should tariffs be fixed or tiered/slab-based?
7. Should rates differ by project, customer type, or meter type?
8. Should invoices require approval before issue?
9. Can issued invoices be edited, or only corrected by adjustment invoice?
10. Do we need PDF invoice export in MVP?

## 13.3 Payment Questions

1. Should payments be linked to specific invoices or only to customer balance?
2. Can one payment cover multiple invoices?
3. Do we need printed receipts?
4. Do we need online payment integration in MVP?
5. Who can reverse or cancel a payment?

## 13.4 Customer Portal Questions

1. Should customers log in during MVP?
2. Should customers view consumption only, or also invoices/payments/balance?
3. Should customers download invoices and statements?
4. Should customers submit complaints or support tickets?

---

# 14. Implementation Planning Notes

The PRD does not start development yet. Before implementation, the team should:

1. Finalize MVP scope.
2. Confirm billing rules.
3. Confirm tariff rules.
4. Confirm meter reading source and protocol.
5. Confirm project/location hierarchy.
6. Review existing `sim_system` database.
7. Map existing database tables to the new PRD concepts.
8. Prepare database migration plan.
9. Prepare backend module plan for NestJS.
10. Prepare frontend page plan for Next.js.

---

# 15. Suggested Backend Modules

Planned NestJS modules may include:

1. Auth Module
2. Users and Roles Module
3. Projects Module
4. Locations Module
5. Customers Module
6. Units Module
7. Meters Module
8. SIM Cards Module
9. Meter Assignments Module
10. Readings Module
11. Tariffs Module
12. Billing Periods Module
13. Invoices Module
14. Payments Module
15. Balances / Customer Ledger Module
16. Reports Module
17. Alerts Module
18. Audit Logs Module
19. Settings Module

---

# 16. Suggested Frontend Pages

Planned Next.js pages may include:

1. Login
2. Dashboard
3. Projects
4. Buildings / Floors / Units
5. Customers
6. Customer Profile
7. Meters
8. Meter Profile
9. SIM Cards
10. Meter Assignment
11. Reading Entry
12. Reading History
13. Tariffs
14. Billing Periods
15. Invoice Generation
16. Invoice List
17. Invoice Details
18. Payment Entry
19. Payment List
20. Customer Statement
21. Customer Balance Report
22. Consumption Reports
23. Main vs Child Water Report
24. Alerts
25. Users and Roles
26. Settings
27. Audit Logs

---

# 17. Final Product Direction

Meter Verse should be treated as:

> A utility metering and billing platform where SIM cards support meter connectivity, but the core business value is accurate consumption tracking, invoice generation, payment tracking, and customer balance management.

The system is not a telecom SIM subscription platform. SIM cards are operational assets connected to meters, not the primary product sold to customers.

