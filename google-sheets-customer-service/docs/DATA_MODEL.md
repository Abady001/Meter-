# Data Model — Customer-Service Meter Workflow

## Relationships

- One customer can have many meters.
- One meter can have many reading transactions.
- One reading can create one billing snapshot.
- One tariff profile can have many effective-dated versions and bands.
- Every material operation can create one or more audit events.

## Core entities

### Customers

Stable customer/account identity and contact data. `Customer_ID` is the key; customer name is descriptive only.

### Meters

Meter assignment and lifecycle data, including serial, customer, status, service type, multiplier, conversion factor, billing method, tariff profile, initial reading, minimum consumption, contract consumption, location, installation, replacement, and source metadata.

### Reading History

Append-only measurement transactions containing previous/current readings, raw delta, multiplier, conversion factor, calculated consumption, minimum/contract quantities, override quantity, final billing quantity, status, reason, employee, approval, event type, and timestamps.

### Billing History

Immutable billing snapshots linked to a reading. Each row stores tariff profile/version, effective rate, billable consumption, consumption amount, service/admin fees, tax rate, tax amount, fixed fee, adjustments, total, status, generator, and timestamp.

### Tariffs

Effective-dated tariff bands with explicit calculation method (`Flat` or `Progressive`), band order, rate, fee values, stamp-tax rate and basis (`Consumption` or `Amount`), version, approval status, and approver.

### Config

Controlled system settings such as locale, timezone, duplicate policy, approval requirement, high-consumption threshold, export folder, demo mode, and go-live status.

### Audit Log

Append-only events preserving who, what, when, entity identifiers, old/new values, reason, approval, result, and source.

## Key integrity rules

- `Customer_ID`, `Meter_ID`, `Reading_ID`, `Billing_ID`, and `Event_ID` are stable identifiers.
- `Meter_Serial` is the staff lookup key but is not assumed globally unique without validation.
- Numeric reading fields remain numeric or blank; statuses belong in status/event fields.
- Historical transactions are never silently overwritten.
- Manual overrides preserve calculated and final values separately.
- Historical bills retain the exact tariff version and fee/tax snapshot used at generation.
