# QA Report — V1 Build

## Completed checks

- June 2026 reference inspected without modification.
- Actual source population isolated from 528 incomplete bill-number-only rows.
- Workbook created with 13 populated tabs.
- Every sheet rendered and visually inspected.
- Formula-error scan returned no `#REF!`, `#DIV/0!`, `#VALUE!`, `#NAME?`, or `#N/A` matches.
- Arabic input and staff-guide layouts inspected.
- Data validations added for months, years, statuses, methods, reasons, approvals, and lifecycle values.
- Technical tables include a clearly marked inactive demo row so the structure is testable before go-live.
- Google Apps Script passed JavaScript syntax validation.
- Billing tests passed for progressive consumption at 20 and 300 units, including consumption-based stamp tax and fixed/service fees.

## Quality gates implemented in code

- Document lock before save.
- Meter/customer existence and active-state checks.
- Exact duplicate period blocking.
- Numeric-reading validation by billing method.
- Negative, high-consumption, and override reasons.
- Append-only reading, billing, and audit rows.
- Effective-dated tariff and approved-version selection.
- Flat/progressive tariff calculation and explicit tax basis.
- Arabic success/error messages.
- Monthly report refresh and single-sheet PDF export.
- Managed sheet protection with only input cells left editable.

## Pending live-environment verification

The following require the native Google Sheet and owner authorization:

- Apps Script scope approval and menu creation.
- Actual protection behavior with company user groups.
- Live Drive export-folder permissions.
- Native Google Sheets table/dropdown behavior after import.
- End-to-end save and report execution against approved production data.
- Finance reconciliation of the approved tariff and the source `Equ` definition.

Do not mark the project production-ready until these checks are evidenced and `Go_Live_Ready` is approved.
