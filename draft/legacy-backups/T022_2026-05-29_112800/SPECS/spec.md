# Feature Specification: Utility Metering and Billing Platform MVP

**Feature Branch**: `[001-metering-billing-platform]`

**Created**: 2026-05-25

**Status**: Draft

**Input**: User description: "/home/abady/Downloads/09/metering_system_prd_brainstorm.md"

## Clarifications

### Session 2026-05-25

- Q: Should invoices be combined or utility-specific? → A: Separate invoice per utility type per billing period.
- Q: How should payments be allocated? → A: Allocate to specific invoices, defaulting to oldest due first.
- Q: Can issued invoices be edited directly? → A: Issued invoices are immutable; corrections must use adjustment entries.
- Q: How are suspicious reading thresholds defined? → A: Thresholds are configurable per project with a system default baseline.
- Q: Who can reverse payments? → A: Only super admins can reverse payments.
- Q: Should tax/VAT be supported in MVP billing? → A: Tax/VAT is configurable per project and defaults to off.
- Q: How should main-vs-child water difference be handled? → A: Difference handling is configurable per project as billable or report-only.
- Q: Under separate-invoice-per-utility, how do main and sub water meters map to invoices? → A: Each water meter (main or sub) bills its own metered consumption on its own `water` invoice; the main-vs-sub unaccounted variance is a distinct item billed to the main-meter customer only when the project water difference mode is `billable`, and is excluded from billing (report-only) otherwise.
- Q: Which reading ingestion modes are in MVP? → A: MVP includes manual entry, file import, and automatic polling.
- Q: Do invoices require approval before issue? → A: High-risk invoices require approval before issue.
- Q: What are MVP availability and recovery targets? → A: 99.9% monthly uptime, RPO <= 15 minutes, RTO <= 2 hours.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Manage Meter and Location Assignments (Priority: P1)

As an operator, I can register utility meters and assign them to the correct
project, location, unit, and customer so billing starts from accurate meter ownership.

**Why this priority**: Meter-to-customer assignment integrity is the foundation of all
consumption, invoicing, and payment workflows.

**Independent Test**: Can be fully tested by creating a project/unit/customer,
registering a meter and SIM, assigning them once, and confirming the active assignment
plus historical records are visible.

**Acceptance Scenarios**:

1. **Given** a valid customer and unit, **When** an operator assigns a meter,
   **Then** the system stores one active assignment and links it to customer and location.
2. **Given** an assigned meter, **When** the meter is replaced or moved,
   **Then** prior assignment history remains visible and a new active assignment is created.

---

### User Story 2 - Capture Readings and Calculate Consumption (Priority: P2)

As an operator or technician, I can capture meter readings and validate them so
consumption is calculated accurately for billing periods.

**Why this priority**: Without trusted readings, invoice totals and customer balances are
not reliable even if assignment data is correct.

**Independent Test**: Can be fully tested by recording sequential readings for a meter,
reviewing computed consumption, and confirming suspicious values are flagged for review.

**Acceptance Scenarios**:

1. **Given** a meter with a previous reading, **When** a new reading is recorded,
   **Then** the system calculates period consumption from current minus previous value.
2. **Given** a reading that is negative or unusually high,
   **When** the reading is submitted, **Then** the system flags it for review before billing.

---

### User Story 3 - Generate Invoices, Record Payments, and Track Balance (Priority: P3)

As a finance user, I can generate customer invoices from validated consumption,
record full or partial payments, and view a running balance statement.

**Why this priority**: This delivers the core business outcome: complete and auditable
billing and collections.

**Independent Test**: Can be fully tested by generating invoices for one billing cycle,
recording partial and full payments, and validating the customer statement balance.

**Acceptance Scenarios**:

1. **Given** validated meter consumption in a billing period,
   **When** invoices are generated, **Then** each invoice includes usage, rate,
   amount due, customer/location references for one utility type only,
   and applicable project tax/VAT when enabled.
2. **Given** an outstanding invoice, **When** a payment is recorded,
   **Then** the payment is allocated to a specific invoice (default oldest due first),
   the payment ledger is updated, and customer balance is recalculated immediately.

---

### Edge Cases

- What happens when a meter is terminated while having an assigned SIM card?
  The active SIM assignment is closed and SIM status changes to reusable inventory.
- How does system handle missing readings for a billing cycle?
  The cycle is flagged as incomplete and excluded from automatic invoice generation.
- What happens when two users attempt to assign the same SIM or meter at the same time?
  The system allows only one active assignment and rejects conflicting updates.
- How does system handle payment reversal after partial settlement?
  Only super admins can perform the reversal; the reversal is appended to the
  ledger with reason tracking and balance is recomputed.
- What happens when a high-risk invoice is generated without approval?
  The invoice remains pending and cannot be issued until approval is completed.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow authorized staff to create, update, deactivate,
  and view projects and location hierarchy nodes used for meter placement.
- **FR-002**: System MUST allow authorized staff to create, update, deactivate,
  and view customer profiles and customer-to-unit relationships.
- **FR-003**: System MUST maintain unique meter identities and meter types
  (electricity, main water, and sub-water).
- **FR-004**: System MUST maintain SIM inventory records and enforce that a SIM can have
  only one active meter assignment at a time.
- **FR-005**: System MUST enforce that a meter can have only one active assignment to a
  customer/unit/location at a time.
- **FR-006**: System MUST preserve full assignment history for meters and SIM cards,
  including start/end timestamps and acting user.
- **FR-007**: System MUST allow authorized users to capture meter readings and maintain
  reading history with status values for validation across manual entry,
  file import, and automatic polling sources.
- **FR-008**: System MUST calculate consumption per period from sequential readings and
  flag invalid or suspicious readings for review using project-level configurable
  thresholds and a system default baseline.
- **FR-009**: System MUST support main-water to sub-water comparison,
  provide variance values for operational review, and allow per-project
  configuration of difference handling as billable or report-only.
  When mode is `billable`, the unaccounted main-vs-sub variance MUST be billed
  to the main-meter customer as a distinct invoice line; when mode is
  `report_only` (default), the variance MUST be excluded from billing and
  surfaced only in operational reports.
- **FR-010**: System MUST generate invoices from validated consumption using configured
  tariff rates and billing periods, with separate invoices per utility type
  (each water meter, main or sub, billed on its own `water` invoice).
- **FR-011**: System MUST treat issued invoices as immutable and process all corrections
  through manual adjustment entries with mandatory audit trace.
- **FR-012**: System MUST record payments, including partial payments,
  and allocate them to specific invoices by default oldest due first,
  while reflecting the same transaction in customer ledger balances.
- **FR-013**: System MUST restrict payment reversal actions to super admins only
  and require reversal reason capture in audit logs.
- **FR-014**: System MUST maintain customer financial ledgers that show invoice entries,
  payment entries, adjustments, and running balance over time.
- **FR-015**: System MUST provide role-based access controls so users only access allowed
  modules and permitted project scope.
- **FR-016**: System MUST provide auditable logs for sensitive events, including
  assignment changes, billing actions, payment changes, reversals, and tariff updates.
- **FR-017**: System MUST provide operational and financial reports with filterable date,
  project, location, customer, and meter dimensions.
- **FR-018**: System MUST support tax/VAT configuration per project,
  default tax/VAT to off, and apply tax/VAT only when enabled.
- **FR-019**: System MUST require explicit approval before issuing high-risk invoices,
  including invoices with manual adjustments, flagged anomalies,
  or values above configured risk thresholds.

### Key Entities *(include if feature involves data)*

- **ProjectLocation**: Hierarchical structure representing project, building, floor,
  and unit where customers and meters are attached.
- **Customer**: Person or organization responsible for one or more units and utility charges.
- **Meter**: Utility device with unique identity, type, status, and installation lifecycle.
- **SIMCard**: Communication asset assigned to a meter with one-active-assignment rule.
- **MeterAssignment**: Time-bounded link between meter, customer, and location.
- **Reading**: Timestamped measurement entry with validation status and consumption impact.
- **TariffPlan**: Rate definition used to compute invoice amounts during billing.
- **Invoice**: Immutable billing document generated from validated consumption
  for a billing period.
- **Payment**: Financial transaction applied to one or more invoices and customer balance.
- **CustomerLedgerEntry**: Immutable financial entry stream for invoices, payments,
  reversals, and adjustments.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 99% of active meters in the MVP rollout have a valid customer and location
  assignment with no duplicate active assignment conflicts.
- **SC-002**: 95% of routine reading-entry tasks are completed by operations users
  in under 2 minutes per meter.
- **SC-003**: 99% of monthly invoices are generated without manual correction for records
  that passed reading validation.
- **SC-004**: 100% of sampled customer statements show mathematically correct running
  balance after mixed full, partial, and reversed payment events.
- **SC-005**: 95% of required operational and billing reports are produced successfully
  on first attempt during monthly operations.
- **SC-006**: Service achieves at least 99.9% monthly availability,
  with recovery point objective (RPO) of 15 minutes or less and
  recovery time objective (RTO) of 2 hours or less.

## Assumptions

- Initial release serves internal operator and finance teams; customer self-service access
  is deferred to a later phase.
- Meter readings in MVP are supported through manual entry, file import,
  and automatic polling.
- Billing is executed in monthly periods with configurable tariff rates available
  before invoice generation.
- Tax/VAT is optional and project-configurable, with default behavior set to off.
- Payment processing in MVP is recorded internally; external online payment gateways are
  not required for first release.
- Security and access controls follow role-based and project-scoped permissions,
  and sensitive financial operations always require audit logging.
