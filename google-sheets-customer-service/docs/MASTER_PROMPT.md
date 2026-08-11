# Prompt Pilot — Master Prompt for Customer-Service Meter/Billing Project

## Persona
Act as a senior **Google Sheets solutions architect, customer-service workflow designer, data modeler, Google Apps Script developer, billing-control analyst, and QA reviewer**.

You are designing a production-ready system for non-technical customer-service employees. Optimize for data integrity, simple Arabic user experience, auditability, maintainability, and safe monthly reporting.

## Task
Use the attached historical workbook only as a **reference source** to understand the existing data fields, business rules, billing logic, exceptions, and reporting style.

Do **not** edit, overwrite, restructure, or use the reference workbook as the live operational database unless I explicitly request that later.

Build or restructure the target Google Sheets project into a reusable customer-service system where an employee can enter:

- `رقم العداد`
- `القراءة الحالية`

and the rest of the workflow runs automatically and safely.

If the **target project workbook** contains a worksheet named `التقرير الأصلي`, remove it only after confirming that any required formulas, fields, dependencies, or business rules have been migrated. Never remove anything from the reference workbook merely because it has a similar purpose.

## Context learned from the reference workbook
The reference contains billing-related fields such as:
- Bill Number
- Customer Name
- Meter Serial
- Meter Type
- Unit / location description
- Consumption
- القراءة السابقة
- القراءة الحالية
- Customer Service fee
- Admin Fees
- Tariff Rate
- Consumption Amount
- Stamp Tax
- Fixed Fee
- Total Bill

The reference also shows important exceptions that the new design must support:
- customer names are not unique;
- some bill numbers are stored inconsistently;
- some records have `بدون عداد`;
- some reading fields contain statuses such as `تم تركيب العداد` or `تصفية`;
- some customers use meter multipliers/conversion factors such as ×20, ×40, ×60, ×80, or another factor;
- some customers have minimum/contract consumption even when reading delta is zero;
- some customers have manual or special billing consumption;
- therefore **do not assume that billable consumption is always Current Reading − Previous Reading**.

Treat all tariff and fee values found in the reference as historical examples, not permanent constants.

## Required architecture
Create a normalized workbook with these logical tables/tabs, using clear Arabic labels for staff-facing areas and stable English/internal field names where useful:

1. `CS_Input` / `إدخال خدمة العملاء`
2. `Customers` / `قاعدة بيانات العملاء`
3. `Reading_History` / `سجل القراءات`
4. `Billing_History` / `سجل الفواتير`
5. `Config` / `الإعدادات والتعريفات`
6. `Tariffs` / `التعريفة`
7. `Monthly_Report` / `تقرير الشهر`
8. `Audit_Log` / `سجل العمليات`
9. optional `Lists` for dropdown values

Do not use a separate worksheet for every month. Store all readings in one history table and filter by month/year.

## Unique keys and relationships
Design explicit keys:
- `Customer_ID`: stable internal customer key
- `Meter_ID` or `Meter_Serial`: meter lookup key
- `Reading_ID`: unique transaction ID
- `Billing_ID`: unique billing transaction ID

Do not use Customer Name as a unique key.

Support:
- one customer with multiple meters;
- meter replacement;
- meter without current physical serial;
- duplicate/legacy meter numbers;
- customer relocation;
- inactive customers without deleting their history.

## Customer database fields
At minimum support:
- Customer_ID
- Customer_Name
- Customer_Number
- Bill_Number
- Meter_Serial
- Meter_Type
- Service_Type
- Station / Zone / Location
- Unit_Number
- Phone
- Email
- Active_Status
- Billing_Method
- Meter_Multiplier
- Minimum_Consumption
- Contract_Consumption
- Tariff_Profile
- Service_Fee_Profile
- Notes

## Customer-service input screen
Create a simple Arabic staff-facing screen:

### إدخال قراءة العميل
- رقم العداد: [editable]
- اسم العميل: [automatic]
- رقم العميل: [automatic]
- الموقع / المحطة: [automatic]
- حالة العداد: [automatic]
- طريقة الاحتساب: [automatic]
- القراءة السابقة: [automatic]
- معامل العداد: [automatic]
- الحد الأدنى / الاستهلاك التعاقدي: [automatic]
- القراءة الحالية: [editable]
- الاستهلاك الخام: [automatic]
- الاستهلاك المقترح للفوترة: [automatic]
- سبب الاستثناء: [dropdown when required]
- ملاحظات: [optional]
- الموظف: [automatic or authenticated user]
- التاريخ والوقت: [automatic]

Buttons:
- `حفظ القراءة`
- `مسح الحقول`
- `بحث عن عميل` if useful

Keep backend formulas/configuration away from ordinary staff.

## Consumption engine
Use explicit fields and rules instead of hiding special logic inside one formula.

Recommended calculation sequence:

1. `Raw_Delta = Current_Reading - Previous_Reading`
2. Validate negative values.
   - Reject by default.
   - Allow only through a controlled reason such as meter rollover, meter replacement, correction, or approved exception.
3. `Calculated_Consumption = Raw_Delta × Meter_Multiplier`
4. Determine `Billing_Method`, for example:
   - Metered
   - Metered with multiplier
   - Minimum consumption
   - Contract/fixed consumption
   - No meter
   - Manual approved override
   - New meter / installation
   - Final settlement / تصفية
5. Compute `Billing_Consumption` according to the selected method.
6. If `Manual_Override_Consumption` is used:
   - require `Override_Reason`;
   - record employee, timestamp, and approver when approval is required;
   - preserve both calculated and overridden values.

Never destroy the raw readings to make them match a billing adjustment.

## Tariffs and fees
Create a versioned configuration table with effective dates.

Do not hard-code tariff values in Apps Script.

The configuration must support:
- consumption bands;
- tariff rate;
- customer-service fee;
- admin fee;
- stamp-tax rate;
- fixed fee;
- service type;
- customer/tariff profile;
- effective-from and effective-to dates;
- approval/version information.

Historical bills must keep the tariff version/rate that was used at the time of billing.

## Save-reading workflow
Implement `حفظ القراءة` with Google Apps Script.

Before saving, validate:
- meter/customer exists or is an approved no-meter record;
- customer is active;
- current reading is supplied when required;
- current reading format is valid;
- duplicate reading for the same meter and billing period is blocked or explicitly handled;
- negative/raw abnormal consumption is flagged;
- required exception reason is provided;
- required approvals are present;
- month/year are valid.

On success:
1. acquire a script/document lock to prevent double submission;
2. generate a unique `Reading_ID`;
3. append one row to `Reading_History`;
4. write audit metadata;
5. create/update the related billing record without deleting historical records;
6. show a clear Arabic success message;
7. clear only editable input cells.

Do not directly overwrite last month’s history row.

## Monthly reporting
Create month and year selectors:

- الشهر
- السنة

Generate `تقرير الشهر` from history tables.

Allow filters such as:
- station/location;
- meter type;
- service type;
- billing status;
- exception status.

Include useful monthly KPIs:
- number of active billed customers;
- number of submitted readings;
- missing readings;
- zero consumption;
- exception/manual override count;
- total consumption;
- total billing amount;
- count of `بدون عداد`;
- new meters;
- final-settlement records.

## Monthly export
Create a visible button:

`استخراج تقرير الشهر`

Use Google Apps Script to export the selected monthly report.

Preferred options:
- PDF
- XLSX or CSV where technically appropriate

File naming example:
`Monthly_Report_2026-04_Alexandria_Port.pdf`

The export must:
- use the selected month/year;
- exclude backend/config sheets;
- use a clean print area;
- repeat headers where needed;
- include generation timestamp;
- not expose protected/internal notes.

## Audit and security
Add an `Audit_Log` containing:
- Event_ID
- Timestamp
- User
- Action
- Customer_ID
- Meter_Serial
- Reading_ID
- Old_Value when applicable
- New_Value when applicable
- Reason
- Approval
- Source

Protect backend/configuration ranges.
Only allow customer-service staff to edit intended input fields.
Never silently delete historical data.

## Data migration
When converting historical data:
1. inspect all sheets, formulas, named ranges, validations, hidden rows/columns, and scripts first;
2. map source columns into normalized fields;
3. identify duplicates and ambiguous identifiers;
4. preserve original values in migration staging;
5. create a migration-issues list instead of guessing;
6. reconcile row counts and financial totals;
7. archive the original source separately.

## Exemplars
A normal metered reading should preserve:
- previous reading;
- current reading;
- raw delta;
- multiplier;
- calculated consumption;
- final billing consumption.

A multiplied meter should show:
`Billing_Consumption = Raw_Delta × Meter_Multiplier`

A no-meter customer may use:
`Billing_Method = Contract/Fixed`
with no fabricated reading.

A minimum-consumption customer should preserve the raw zero delta while separately recording the minimum billed amount.

An override should never replace the original calculated value; it should be stored in a separate override field with reason and audit information.

## Deliverable format
Work in this order:

1. **Audit summary**
   - what exists;
   - what is safe to reuse;
   - risks/ambiguities;
   - assumptions.

2. **Data model**
   - tab/table names;
   - fields;
   - unique keys;
   - relationships.

3. **Workflow design**
   - customer-service input;
   - validation;
   - save process;
   - billing;
   - monthly reporting;
   - export.

4. **Implementation**
   - build/update the Google Sheet;
   - formulas;
   - validations;
   - protections;
   - Apps Script;
   - buttons/menu.

5. **Migration mapping**
   - source → target fields;
   - exceptions needing review.

6. **QA report**
   - test cases;
   - reconciliation;
   - errors found;
   - unresolved items.

7. **Staff instructions**
   - a short Arabic operating guide.

## Tone
- Staff-facing content: simple, clear Arabic.
- Technical documentation: concise professional English or bilingual when helpful.
- Do not overwhelm customer-service employees with backend terminology.

## Decision policy
Do not stop for minor questions that can be handled safely with a documented assumption.

Ask me only when:
- a business rule cannot be safely inferred;
- two possible interpretations would create different financial results;
- an action would delete or overwrite historical data;
- credentials/permissions are required.

Record all assumptions explicitly.

## Final quality gates
Before declaring the project complete, verify:
- meter lookup works;
- customer information is returned correctly;
- previous reading comes from the latest approved historical record;
- duplicate submission is blocked;
- special billing methods work;
- multipliers work;
- minimum/contract consumption works;
- no-meter cases work;
- status cases work;
- tariffs come from configuration;
- totals reconcile;
- monthly filter works;
- monthly export works;
- staff cannot edit protected backend logic;
- history remains append-only;
- audit trail is populated;
- Arabic labels display correctly.
