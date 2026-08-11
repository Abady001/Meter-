# QA and Deployment

## Migration

1. Inspect all source sheets, formulas, validations, named ranges, hidden structure, scripts, and used ranges.
2. Preserve source values in staging.
3. Map each source column to a target field and rule.
4. Create a migration issue for ambiguity; do not guess.
5. Reconcile row counts, consumption, and financial totals.
6. Archive the original source separately.

## Mandatory meter/billing tests

1. standard reading;
2. zero consumption;
3. high consumption;
4. multiplier;
5. conversion factor;
6. minimum consumption;
7. no meter;
8. meter replacement;
9. negative/rollover;
10. manual override;
11. duplicate period;
12. inactive account;
13. tariff change across periods;
14. report filters and reconciliation;
15. export output and permissions.

## Completion gate

Verify:

- stable unique keys;
- correct lookup and previous reading;
- duplicate blocking;
- explicit special methods and overrides;
- approved effective tariff selection;
- traceable totals;
- report filters and export;
- input-only staff permissions;
- append-only history;
- populated audit events;
- legible Arabic UI;
- backup/archive and rollback process.

Label any live authorization, sharing, or Finance approval that has not been tested as pending. Do not call the system production-ready while a pending item can change financial output or access control.
