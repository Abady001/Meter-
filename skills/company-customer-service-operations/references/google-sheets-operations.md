# Google Sheets Customer-Service Operations

## Workbook structure

Use separate tabs for staff input, master data, transaction history, configuration, reporting, lists, and audit. Use one header row and stable internal field names. Avoid merged cells inside data tables.

## Formula and script boundary

Use formulas for lookup, display, and deterministic previews. Do not use formulas to simulate an append transaction.

Use Apps Script for:

- validated multi-step saves;
- unique transaction IDs;
- duplicate protection;
- audit events;
- approvals/corrections;
- report refresh;
- file export;
- range protection.

## Save action

1. Validate required fields and normalize keys.
2. Verify the customer/account/asset exists and is active.
3. stop on duplicate or ambiguous matches.
4. Validate abnormal values and required reasons/approvals.
5. Acquire a document/script lock.
6. Append a transaction row and audit row.
7. Create linked downstream records without overwriting history.
8. Show an Arabic success/error message.
9. Clear only editable input cells.

## Performance

- Prefer bounded ranges and batch reads/writes.
- Avoid per-cell loops over large sheets.
- Keep configuration in cells/tables rather than hard-coded in Apps Script.
- Use effective dates and version fields where rules change over time.

## Protection

Protect configuration, tariff, audit, formula, identifier, and timestamp fields. Leave only intended input cells editable for customer-service staff. Define supervisor and Finance roles separately.

## Export

Validate the selected period, refresh the report, export only the report sheet, use a predictable filename and generation timestamp, and exclude internal notes and backend tabs.
