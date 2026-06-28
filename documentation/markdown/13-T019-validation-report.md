# T019 Validation Report — Derived Views

**Date**: 2026-05-28
**Branch**: feature/t018-audit-reports
**Task**: T019 Migration — derived views

---

## 1. Views Created

| View | Schema | Source Table | Filter | Status |
|------|--------|-------------|--------|--------|
| `Meter_Verse_assignment_active_view` | sim_system | Meter_Verse_assignments | end_at IS NULL | ✅ Created |
| `sim_assignment_active_view` | sim_system | sim_assignments | end_at IS NULL | ✅ Created |
| `customer_statement_view` | sim_system | customer_ledger_entries | — | ✅ Created |

## 2. View Column Definitions

### Meter_Verse_assignment_active_view (7 columns)
| Column | Type | Source |
|--------|------|--------|
| assignment_id | text | Meter_Verse_assignments.id |
| Meter_Verse_id | text | Meter_Verse_assignments.Meter_Verse_id |
| unit_id | text | Meter_Verse_assignments.unit_id |
| customer_id | text | Meter_Verse_assignments.customer_id |
| start_at | timestamp | Meter_Verse_assignments.start_at |
| assigned_by | text | Meter_Verse_assignments.created_by |
| created_at | timestamp | Meter_Verse_assignments.created_at |

### sim_assignment_active_view (6 columns)
| Column | Type | Source |
|--------|------|--------|
| assignment_id | text | sim_assignments.id |
| sim_id | text | sim_assignments.sim_id |
| Meter_Verse_id | text | sim_assignments.Meter_Verse_id |
| start_at | timestamp | sim_assignments.start_at |
| assigned_by | text | sim_assignments.created_by |
| created_at | timestamp | sim_assignments.created_at |

### customer_statement_view (8 columns)
| Column | Type | Derivation |
|--------|------|-----------|
| customer_id | text | customer_ledger_entries.customer_id |
| ledger_entry_id | text | customer_ledger_entries.id |
| entry_date | timestamp | customer_ledger_entries.entry_at |
| reference_type | USER-DEFINED (enum) | customer_ledger_entries.reference_type |
| reference_id | text | customer_ledger_entries.reference_id |
| debit | numeric | CASE WHEN amount_delta > 0 THEN amount_delta ELSE 0 |
| credit | numeric | CASE WHEN amount_delta < 0 THEN -amount_delta ELSE 0 |
| running_balance | numeric | customer_ledger_entries.running_balance (stored) |

## 3. Build Pipeline

| Check | Command | Result |
|-------|---------|--------|
| Prisma Validate | `npx prisma validate` | ✅ Valid |
| Migration Status | `npx prisma migrate status` | ✅ Up to date |
| Migration Deploy | `npx prisma migrate deploy` | ✅ Applied |
| TypeScript Build | `npm run build` | ✅ Clean |
| Test Suite | `npm test` | ✅ 77/77 passing |

## 4. Database Validation

### Query all views
```sql
SELECT column_name FROM information_schema.columns
WHERE table_schema='sim_system'
  AND table_name='Meter_Verse_assignment_active_view'
ORDER BY ordinal_position;
-- ✅ Returns 7 columns: assignment_id, Meter_Verse_id, unit_id, customer_id, start_at, assigned_by, created_at

SELECT column_name FROM information_schema.columns
WHERE table_schema='sim_system'
  AND table_name='sim_assignment_active_view'
ORDER BY ordinal_position;
-- ✅ Returns 6 columns: assignment_id, sim_id, Meter_Verse_id, start_at, assigned_by, created_at

SELECT column_name FROM information_schema.columns
WHERE table_schema='sim_system'
  AND table_name='customer_statement_view'
ORDER BY ordinal_position;
-- ✅ Returns 8 columns: customer_id, ledger_entry_id, entry_date, reference_type, reference_id, debit, credit, running_balance
```

## 5. Dependencies

| View | Dependent Tables | Migration Dependency |
|------|-----------------|---------------------|
| Meter_Verse_assignment_active_view | Meter_Verse_assignments | T014 |
| sim_assignment_active_view | sim_assignments | T014 |
| customer_statement_view | customer_ledger_entries | T017 |

### Refresh Strategy
Views use `CREATE OR REPLACE VIEW` — they reflect source table data in real time. No refresh needed.

### Rename Risks
- If `Meter_Verse_assignments` table or columns are renamed, this view will break
- If `sim_assignments` table or columns are renamed, this view will break
- If `customer_ledger_entries` table or columns are renamed, this view will break
- All views are schema-qualified under `sim_system`

## 6. Migration Details

| Field | Value |
|-------|-------|
| Migration name | `20260528000200_views` |
| Migration file | `backend/prisma/migrations/20260528000200_views/migration.sql` |
| Migration type | Manual SQL (CREATE OR REPLACE VIEW) |
| Applied via | `prisma migrate deploy` |

## 7. Speckit Re-Validation

| Check | Result |
|-------|--------|
| T014 — meter assignments still valid | ✅ Views use correct table/column names from actual migration |
| T014 — SIM assignments still valid | ✅ Views use correct table/column names from actual migration |
| T017 — ledger logic preserved | ✅ Append-only model preserved; uses stored running_balance |
| T017 — append-only model preserved | ✅ No modifications to ledger table |
| T018 — audit compatibility preserved | ✅ No changes to audit_log or report_jobs tables |
| No breaking changes | ✅ Views only — no tables, columns, or enums modified |
