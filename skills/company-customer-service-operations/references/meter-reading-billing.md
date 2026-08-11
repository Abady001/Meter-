# Meter Reading and Billing

## Primary staff workflow

1. Enter or scan `رقم العداد`.
2. Verify the loaded customer and meter.
3. Enter `القراءة الحالية` when required.
4. Review the calculation or exception.
5. Save once.

## Required entities

- Customers/Accounts
- Meters
- Reading History
- Billing History
- Tariffs/Fees
- Config
- Audit Log

## Consumption layers

Never assume final consumption equals the raw reading difference.

- `Raw_Delta = Current_Reading - Previous_Reading`
- `Calculated_Consumption = Raw_Delta × Meter_Multiplier × Conversion_Factor`
- optional minimum or contract quantity
- optional approved manual override
- `Billing_Consumption` as the final approved quantity

Keep every layer.

## Supported methods and events

- Metered
- Metered with multiplier
- Metered with conversion factor
- Minimum consumption
- Contract/fixed consumption
- No meter
- Manual approved override
- New meter / installation
- Final settlement
- Suspended / no billing
- Meter replacement and rollover

Do not place status text in numeric reading fields.

## Validation

- Fetch the latest approved previous reading.
- Block a duplicate meter/month/year transaction.
- Reject negative delta by default; require a controlled rollover/replacement/correction reason when allowed.
- Flag extreme consumption using a configurable threshold.
- Do not fabricate readings for no-meter accounts.
- Require reason and approval when final consumption differs from calculated consumption.

## Tariffs

Store service type, profile, method, bands, rate, fees, tax rate and basis, effective dates, version, approval, and approver. Preserve the exact version and financial snapshot used for historical billing.

Never silently recalculate historical bills after a tariff change.

## Monthly metrics

- active billed accounts;
- readings submitted and missing;
- zero consumption;
- no-meter accounts;
- exceptions/overrides;
- abnormal readings;
- new meters;
- final settlements;
- total consumption;
- total billed amount.
