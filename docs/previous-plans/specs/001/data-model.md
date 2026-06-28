# Data Model Plan: Utility Metering and Billing Platform MVP

## Modeling conventions

- Naming: spec prose terms map to schema enum values — "main water" = `water_main`,
  "sub-water" = `water_child`; invoice-level `utility_type` collapses both to `water`.
- All primary entities use UUID identifiers.
- All mutable business entities include `created_at`, `updated_at`, `created_by`, `updated_by`.
- Financial and audit entities are append-only unless explicitly marked soft-deletable.
- Time fields use UTC timestamps.

## Core entities

## Project

- Fields:
  - `id` (uuid)
  - `code` (string, unique)
  - `name` (string)
  - `status` (enum: active, inactive)
  - `tax_enabled` (boolean, default false)
  - `tax_rate` (decimal, nullable)
  - `reading_threshold_profile_id` (uuid, nullable)
  - `water_difference_mode` (enum: billable, report_only, default report_only)

## LocationNode

- Purpose: supports flexible hierarchy (project -> zone -> building -> floor -> unit).
- Fields:
  - `id` (uuid)
  - `project_id` (fk -> Project)
  - `parent_id` (fk -> LocationNode, nullable)
  - `node_type` (enum: zone, building, floor, unit)
  - `code` (string)
  - `name` (string)
  - `status` (enum: active, inactive)
- Constraints:
  - uniqueness on `(project_id, node_type, code)`

## Customer

- Fields:
  - `id` (uuid)
  - `project_id` (fk -> Project)
  - `customer_code` (string, unique within project)
  - `name` (string)
  - `phone` (string)
  - `email` (string)
  - `customer_type` (enum: individual, company, tenant, owner)
  - `national_or_commercial_id` (string)
  - `status` (enum: active, inactive)

## CustomerUnitAssignment

- Fields:
  - `id` (uuid)
  - `customer_id` (fk -> Customer)
  - `unit_id` (fk -> LocationNode where `node_type=unit`)
  - `start_at` (timestamp)
  - `end_at` (timestamp, nullable)
  - `reason` (string)
- Constraints:
  - only one active row per `(customer_id, unit_id)` when `end_at is null`

## Meter

- Fields:
  - `id` (uuid)
  - `serial_number` (string, unique)
  - `Meter_Verse_type` (enum: electricity, water_main, water_child)
  - `brand` (string)
  - `model` (string)
  - `status` (enum: available, assigned, active, offline, faulty, replaced, terminated, retired)
  - `installation_date` (date)
  - `activation_date` (date)
  - `termination_date` (date, nullable)
  - `project_id` (fk -> Project)
  - `location_id` (fk -> LocationNode, nullable)
  - `parent_main_Meter_Verse_id` (fk -> Meter, nullable; required when `Meter_Verse_type=water_child`)

## SIMCard

- Fields:
  - `id` (uuid)
  - `iccid` (string, unique)
  - `msisdn` (string)
  - `provider` (string)
  - `ip_address` (string)
  - `ip_type` (enum: static, dynamic)
  - `status` (enum: available, assigned, active, suspended, old, reusable, retired)
  - `cooldown_until` (timestamp, nullable)

## MeterAssignment

- Fields:
  - `id` (uuid)
  - `Meter_Verse_id` (fk -> Meter)
  - `customer_id` (fk -> Customer)
  - `unit_id` (fk -> LocationNode)
  - `project_id` (fk -> Project)
  - `start_at` (timestamp)
  - `end_at` (timestamp, nullable)
  - `change_reason` (string)
  - `status` (enum: active, ended)
- Constraints:
  - partial unique index on `(Meter_Verse_id)` where `end_at is null`

## SIMAssignment

- Fields:
  - `id` (uuid)
  - `sim_id` (fk -> SIMCard)
  - `Meter_Verse_id` (fk -> Meter)
  - `start_at` (timestamp)
  - `end_at` (timestamp, nullable)
  - `change_reason` (string)
  - `status` (enum: active, ended)
- Constraints:
  - partial unique index on `(sim_id)` where `end_at is null`

## Reading

- Fields:
  - `id` (uuid)
  - `Meter_Verse_id` (fk -> Meter)
  - `project_id` (fk -> Project)
  - `customer_id_snapshot` (uuid)
  - `unit_id_snapshot` (uuid)
  - `reading_value` (decimal)
  - `reading_at` (timestamp)
  - `source` (enum: manual, import, automatic)
  - `previous_reading_value` (decimal, nullable)
  - `consumption_value` (decimal, nullable)
  - `status` (enum: valid, pending_review, estimated, suspicious, corrected, rejected)
  - `raw_payload` (jsonb, nullable)
  - `entered_by` (uuid)
  - `notes` (text, nullable)
- Constraints:
  - unique `(Meter_Verse_id, reading_at, source)`

## ReadingReview

- Fields:
  - `id` (uuid)
  - `reading_id` (fk -> Reading)
  - `review_action` (enum: approve, reject, correct)
  - `reviewed_by` (uuid)
  - `reviewed_at` (timestamp)
  - `reason` (text)

## TariffPlan

- Fields:
  - `id` (uuid)
  - `project_id` (fk -> Project)
  - `Meter_Verse_type` (enum: electricity, water_main, water_child)
  - `rate_per_unit` (decimal)
  - `currency` (string)
  - `effective_from` (date)
  - `effective_to` (date, nullable)
  - `status` (enum: draft, active, retired)

## BillingPeriod

- Fields:
  - `id` (uuid)
  - `project_id` (fk -> Project)
  - `period_code` (string, e.g., 2026-05)
  - `start_date` (date)
  - `end_date` (date)
  - `status` (enum: open, in_review, closed)

## Invoice

- Fields:
  - `id` (uuid)
  - `invoice_number` (string, unique)
  - `project_id` (fk -> Project)
  - `customer_id` (fk -> Customer)
  - `unit_id` (fk -> LocationNode)
  - `Meter_Verse_id` (fk -> Meter)
  - `utility_type` (enum: electricity, water)
  - `billing_period_id` (fk -> BillingPeriod)
  - `status` (enum: draft, pending_approval, issued, partially_paid, paid, overdue, cancelled)
  - `subtotal_amount` (decimal)
  - `tax_amount` (decimal)
  - `total_amount` (decimal)
  - `paid_amount` (decimal, default 0)
  - `remaining_amount` (decimal)
  - `issued_at` (timestamp, nullable)
  - `due_at` (timestamp, nullable)
  - `immutable_at` (timestamp, nullable)
- Invariants:
  - issued invoices are immutable; updates must flow through adjustments.

## InvoiceLine

- Fields:
  - `id` (uuid)
  - `invoice_id` (fk -> Invoice)
  - `reading_id` (fk -> Reading, nullable)
  - `description` (string)
  - `quantity` (decimal)
  - `unit_price` (decimal)
  - `line_amount` (decimal)

## InvoiceAdjustment

- Fields:
  - `id` (uuid)
  - `invoice_id` (fk -> Invoice)
  - `adjustment_type` (enum: credit, debit)
  - `amount` (decimal)
  - `reason` (text)
  - `approved_by` (uuid, nullable)
  - `created_by` (uuid)

## Payment

- Fields:
  - `id` (uuid)
  - `payment_number` (string, unique)
  - `project_id` (fk -> Project)
  - `customer_id` (fk -> Customer)
  - `payment_date` (timestamp)
  - `method` (enum: cash, bank_transfer, card, online, cheque, wallet)
  - `amount` (decimal)
  - `status` (enum: pending, confirmed, reversed, cancelled)
  - `collected_by` (uuid)
  - `notes` (text)

## PaymentAllocation

- Fields:
  - `id` (uuid)
  - `payment_id` (fk -> Payment)
  - `invoice_id` (fk -> Invoice)
  - `allocated_amount` (decimal)
  - `allocation_order` (integer)
- Rules:
  - default order follows oldest due invoice first.
  - total allocations per payment must equal payment amount.

## CustomerLedgerEntry

- Fields:
  - `id` (uuid)
  - `customer_id` (fk -> Customer)
  - `project_id` (fk -> Project)
  - `entry_type` (enum: invoice_charge, adjustment_debit, adjustment_credit, payment_credit, payment_reversal)
  - `reference_type` (enum: invoice, payment, adjustment)
  - `reference_id` (uuid)
  - `amount_delta` (decimal)
  - `running_balance` (decimal)
  - `entry_at` (timestamp)
- Rules:
  - append-only; no hard updates/deletes.

## AuditLog

- Fields:
  - `id` (uuid)
  - `actor_user_id` (uuid)
  - `actor_role` (string)
  - `action` (string)
  - `resource_type` (string)
  - `resource_id` (uuid)
  - `project_id` (uuid, nullable)
  - `request_correlation_id` (string)
  - `before_state` (jsonb, nullable)
  - `after_state` (jsonb, nullable)
  - `reason` (text, nullable)
  - `created_at` (timestamp)

## ReportJob

- Fields:
  - `id` (uuid)
  - `project_id` (fk -> Project)
  - `report_type` (string)
  - `format` (enum: csv, xlsx, pdf)
  - `filters` (jsonb)
  - `status` (enum: queued, running, completed, failed, expired)
  - `file_url` (string, nullable)
  - `error_message` (text, nullable)
  - `requested_by` (uuid)
  - `requested_at` (timestamp)

## State transitions

## Meter status transition

`available -> assigned -> active -> (offline|faulty|replaced|terminated|retired)`

- `terminated` requires final reading + reason + assignment closure.

## SIM status transition

`available -> assigned -> active -> (suspended|old|reusable|retired)`

- Meter termination triggers `active -> old|reusable` and closes active assignment.

## Reading lifecycle

`pending_review -> valid|suspicious|rejected|corrected`

- only `valid` and approved `corrected` readings are billable.

## Invoice lifecycle

`draft -> pending_approval (optional high-risk path) -> issued -> partially_paid -> paid`

- `issued` is immutable; changes use `InvoiceAdjustment` records.

## Payment lifecycle

`pending -> confirmed -> reversed|cancelled`

- reversal command restricted to super_admin.

## Derived views

- `customer_statement_view`: opening balance, period charges, payments,
  adjustments, reversals, closing balance.
- `Meter_Verse_assignment_active_view`: one active row per meter.
- `sim_assignment_active_view`: one active row per SIM.

## Validation rules mapped to spec

- FR-004/FR-005: enforced by partial unique indexes + transactional checks.
- FR-008: threshold profile lookup by project during reading validation.
- FR-009: variance = main-meter consumption − sum(child-meter consumption); when
  `water_difference_mode=billable`, variance becomes an `InvoiceLine` on the main
  meter's water invoice; when `report_only`, variance is reporting-only.
- FR-010/FR-018: invoice generation includes utility split and project tax policy.
- FR-011: immutable invoice enforcement via restricted update paths.
- FR-012: allocation service applies oldest-due-first default ordering.
- FR-013: reversal endpoint checks `super_admin` role and writes audit reason.
