# Reference Audit — Dekheila Port Consumption, June 2026

## Scope

Source: `استهلاكات ميناء الدخيلة الشهر 6-2026.xlsx`

The source was inspected as read-only. It was not edited or converted into the production database.

## Workbook structure

- One visible sheet: `Monthly Finance`.
- Formatted/used range reaches approximately `A1:N661`.
- Actual populated operational records are rows 3–132: 130 records.
- Rows 133–661 contain 528 bill-number-only entries without customer, meter, or billing details. These are incomplete placeholders and must not be migrated as customer records.
- Operational columns are effectively located in B:M; column A is visually blank.
- Source labels include `Unit umber` and `Equ`, both of which require controlled target naming.

## Reconciliation baseline

| Metric | June reference |
| --- | ---: |
| Actual operational records | 130 |
| Unique customer-name values | 93 |
| Numeric meter serials | 104 |
| No-meter values (`بدون`) | 25 |
| Zero-consumption records | 20 |
| Positive-consumption records | 110 |
| Total source consumption | 312,697 |
| Total source `Equ` value | 726,316.75 |
| Reading/consumption mismatches | 42 |
| Formula cells detected | 91 |

No duplicate normalized numeric meter serial was detected among the 130 actual records. This does not remove the need for a duplicate guard in the new system because later months and legacy sources may differ.

## Exceptions found

Consumption is not consistently equal to `Current Reading − Previous Reading`.

- 42 records differ from the raw reading delta.
- 25 records use `بدون` rather than a physical meter serial.
- Notes include meter multipliers such as X10, X20, X30, X40, X60, X80, and X120.
- Operational statuses include `تقديري`, `مراجعة`, `مغلق`, `تم التصفية`, `تم الدفع`, and `تم تصفير العداد`.
- Some records have fixed or estimated consumption despite zero readings.
- Some rows intentionally show zero billable consumption despite reading changes or operational events.

## Source note distribution

| Note | Count |
| --- | ---: |
| Blank | 68 |
| تقديري | 37 |
| مراجعة | 6 |
| X80 | 4 |
| مغلق | 2 |
| تم تصفير العداد | 2 |
| تم الدفع | 2 |
| تم التصفية | 2 |
| X10 / X20 / X30 / X60 / X120 | 1 each |
| مراجعة X40 | 1 |

## Billing observations

The source contains multiple rates and formula shapes, including flat-rate formulas and a split formula above a threshold. These values are historical evidence only. They must not be copied into live code or treated as a current approved tariff.

The target design therefore separates:

1. raw meter delta;
2. meter multiplier;
3. conversion factor;
4. minimum consumption;
5. contract consumption;
6. manual override;
7. final billing consumption;
8. tariff version and tax basis;
9. approval and audit metadata.

## Migration decisions

- Preserve `Bill Number` as text.
- Do not use customer name as a unique key.
- Create a separate meter entity, including generated no-meter records where approved.
- Preserve the source consumption as historical `Billing_Consumption`; do not recalculate it from the readings during migration.
- Parse note-based multipliers and statuses into explicit fields, while retaining the original note in staging.
- Treat `Equ` as an ambiguous source total until Finance confirms its exact business definition.
- Exclude rows 133–661 from automated migration unless a separate source supplies the missing customer and meter fields.

## Open approvals before migration

- Finance definition of `Equ` and the historical fee/tax basis.
- Approved effective-dated tariff matrix.
- Handling of estimated readings and paid/closed/final-settlement statuses.
- Generated identifiers for no-meter accounts.
- Threshold for abnormal consumption and the approval roles.
