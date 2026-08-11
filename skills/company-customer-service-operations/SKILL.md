---
name: company-customer-service-operations
description: Design, audit, build, or standardize company customer-service operational systems, especially customer databases, staff input forms, account or meter lookup, transaction history, workflow automation, reporting, exports, validation, permissions, approvals, and audit trails. Use for Google Sheets or other operational projects where non-technical staff enter or update customer-service data, including utility meter reading and billing workflows.
---

# Company Customer-Service Operations

## Mission

Turn an operational request into a simple staff experience backed by normalized data, explicit business rules, append-only history, controlled exceptions, audit evidence, and reproducible reporting.

## Load the relevant reference

- Read `references/google-sheets-operations.md` when the target is Google Sheets or Apps Script.
- Read `references/meter-reading-billing.md` when the workflow uses meters, readings, consumption, tariffs, or billing.
- Read `references/qa-deployment.md` before implementing, migrating, or declaring a project complete.

## Intake

1. Identify staff roles and the intended outcome.
2. Identify stable lookup and transaction keys.
3. Classify every supplied file as reference-only, migration source, editable target, or archive.
4. Identify reports, exports, permissions, approvals, and retention needs.
5. Extract business rules and exceptions without guessing rules that change financial results.
6. Record assumptions and unresolved approvals.

Do not modify a reference-only artifact.

## Architecture rule

Separate:

1. master data;
2. assets/accounts/meters;
3. transactions/history;
4. business configuration;
5. staff input;
6. reporting/export;
7. audit/security.

Do not build one uncontrolled table that mixes these responsibilities. Do not create one operational worksheet per month; store transactions in one history table and filter by period.

## Data integrity

- Prefer stable internal IDs.
- Never use customer name as the only unique key.
- Support one-to-many relationships explicitly.
- Keep operational history append-only by default.
- Represent corrections as a correction, status change, or override with reason, user, timestamp, and approval.
- Preserve raw values separately from adjusted or final values.
- Stop on ambiguous duplicate lookup matches instead of choosing one arbitrarily.

## Staff experience

- Expose only the fields staff need.
- Auto-populate known values.
- Use controlled dropdowns for statuses and reasons.
- Keep formulas and backend tables away from ordinary staff.
- Use Arabic-first labels and actionable messages for Arabic-speaking teams.
- Make success, failure, and approval state obvious.

## Reporting and audit

- Build reports from normalized history.
- Include period and operational filters, counts, missing/exception metrics, totals, and generation timestamp.
- Export only approved report content.
- Preserve who, what, when, old value, new value, reason, approval, result, and source for material operations.

## Prompt Pilot

When the user supplies a vague request, structure the execution prompt with:

- Task
- Context
- Exemplars and edge cases
- Persona
- Deliverable format
- Staff-facing and technical tone
- Decision policy and quality gates

## Required project output

Return or create:

1. current-state audit;
2. risks and data-quality issues;
3. normalized data model;
4. workflow and validation design;
5. automation plan or implementation;
6. migration mapping;
7. security/approval model;
8. QA evidence and unresolved items;
9. deployment checklist;
10. simple staff instructions.

Do not claim completion until the applicable checks in `references/qa-deployment.md` pass.
