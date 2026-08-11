# ePOWER Customer-Service Meter Workflow — Google Sheets V1

This package turns a historical monthly meter workbook into a reusable, controlled Google Sheets workflow for customer-service staff.

## Working Google Sheet

- [ePOWER - Customer Service Meter Workflow Template V1](https://docs.google.com/spreadsheets/d/1kQvX_aSjfCx2buTH04han15QEAZP_VSTpTqreMprssA/edit)
- Locale: `ar_EG`; timezone: `Africa/Cairo`; primary staff sheets: right-to-left.
- Safety state: `Demo_Mode=TRUE`, `Go_Live_Ready=FALSE`; the included tariff rows are drafts for testing only.

## Deliverables

- Native-Google-Sheets-ready workbook template with Arabic staff input, normalized tables, versioned tariffs, monthly reporting, audit log, migration mapping, QA cases, and a staff guide.
- Google Apps Script for save, duplicate blocking, billing, audit, monthly report generation, PDF export, and sheet protection.
- June 2026 reference audit and source-to-target migration rules.
- Reusable master prompt and company customer-service skill source.

## Operating principle

The June workbook is a reference source only. It is not modified and is not used directly as the production database. Historical values are preserved as evidence, while rates and business rules must be approved in the new configuration before go-live.

## Key controls

- Stable customer, meter, reading, and billing IDs.
- Append-only reading and billing history.
- Explicit multiplier, conversion, minimum, contract, override, and no-meter logic.
- Effective-dated tariff versions and stored billing snapshots.
- Duplicate-period protection and document locking.
- Arabic-first employee messages.
- Role-oriented sheet protection and full audit events.

Read `DEPLOYMENT_CHECKLIST.md` before enabling live use.
