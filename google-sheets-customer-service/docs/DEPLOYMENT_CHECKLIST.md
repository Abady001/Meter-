# Deployment Checklist — Google Sheets

## 1. Create the Sheet

1. Import `ePOWER_Customer_Service_Meter_Template_V1.xlsx` as a native Google Sheet.
2. Confirm all 13 tabs exist and Arabic labels display correctly.
3. Set the spreadsheet locale to Egypt and timezone to `Africa/Cairo`.

## 2. Attach Apps Script

1. Open **Extensions → Apps Script**.
2. Replace the default code with `google-apps-script/Code.gs`.
3. Open **Project Settings** and apply the manifest from `appsscript.json` if using a manifest-based deployment.
4. Run `setupProject()` once as the spreadsheet owner and approve the requested scopes.
5. Reload the spreadsheet and confirm the **خدمة العملاء** menu appears.

## 3. Prepare production data

1. Archive the original historical workbook separately.
2. Remove all rows whose `Source` or `Source_Record` equals `TEMPLATE` after the team finishes testing.
3. Load approved customers and meters using stable IDs.
4. Preserve raw source values in migration staging outside the operational tables.
5. Resolve every item marked `Requires_Review = Yes` in `خريطة الترحيل`.

## 4. Configure billing

1. Replace all `DEMO-*` tariff rows.
2. Confirm the calculation method, band boundaries, rate, fee values, tax rate, and tax basis.
3. Add effective dates, version, approver, and `Approval_Status = Approved`.
4. Set an approved `Max_Normal_Consumption` threshold.
5. Set `Export_Folder_ID` to the controlled monthly-report folder.

## 5. Security

1. Run `applyProtections()` as the owner.
2. Verify customer-service staff can edit only the intended yellow input cells.
3. Verify supervisors/Finance have the required backend access outside customer-service roles.
4. Confirm audit, tariff, and config sheets cannot be edited by ordinary staff.

## 6. QA and go-live

1. Execute all 15 cases in `اختبارات الجودة`.
2. Reconcile migrated record counts, total consumption, and historical totals.
3. Test duplicate blocking, negative readings, multipliers, conversion, minimum, contract, no-meter, override, tariff changes, report filters, and PDF export.
4. Set `Demo_Mode = FALSE` only after deleting demo rows.
5. Set `Go_Live_Ready = TRUE` only after Finance and the operational owner approve the evidence.

## 7. Monthly operation

1. Keep readings and bills append-only.
2. Use corrections/approvals rather than editing old history.
3. Review exception and missing-reading KPIs before export.
4. Export only the report tab; do not expose config, tariff, audit, or internal notes.
