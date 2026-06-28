# Migration — Specification

## 1. Purpose

Migrate data from four legacy systems into Meter Verse with zero downtime, full auditability, and a 30-day parallel run before final cutover.

## 2. Source Systems

| System | Type | Years Active | Tables | Records |
|---|---|---|---|---|
| SBill Palm Hills | Billing + Collection | 2018–2026 | ~36 | ~500K consumers, ~50M readings |
| SBill Estates | Billing + Collection | 2020–2026 | ~36 | ~200K consumers, ~20M readings |
| Collection Tracker | Debt collection | 2019–2026 | ~15 | ~100K debt records |
| Solar Wallet | Prepaid solar | 2021–2026 | ~10 | ~50K wallets, ~5M transactions |

## 3. Target Schema

| Target | Schema |
|---|---|
| Meter Verse Core DB | `core.*` (15 tables) |
| Meter Verse Features DB | `features.*` (10 tables) |
| Area DB per region | `area.*` (45 tables each, 15 Area DBs total) |

## 4. Migration Phases

| Phase | Duration | Activity |
|---|---|---|
| Pre-migration | 4 weeks | Schema mapping, ETL script development, test runs on snapshots |
| Migration Week | 5 days | Per-source execution (starting with Solar Wallet, ending with SBill Palm Hills) |
| Validation | 3 days | Row count comparison, balance reconciliation, exception report review |
| Parallel Run | 30 days | Both legacy and Meter Verse accepting data; reconciliation daily |
| Cutover | 1 day | Final sync, legacy read-only, DNS switch |
| Post-migration | 2 weeks | Monitoring, cleanup, legacy decommission |

## 5. Zero-Downtime Strategy

1. Legacy systems remain live during migration (read/write).
2. ETL pulls a snapshot at time T₀, transforms, and loads to target.
3. Change Data Capture (CDC) catches changes between T₀ and final sync.
4. Final sync uses timestamp-based incremental load.
5. During parallel run, both systems accept writes; reconciliation runs daily.
6. Cutover: set legacy to read-only, switch DNS, verify.

## 6. Reconciliation

| Check | Frequency | Action on Mismatch |
|---|---|---|
| Row count | Per table, after each load | Alert, halt if > 0.1 % difference |
| Balance sum | Consumer balance per area | Alert, manual review |
| Reading count | Meter readings per day | Auto-correction for duplicates |
| Payment total | Sum of payments per date | Alert, manual review |

## 7. Rollback Procedures

| Scenario | Action |
|---|---|
| ETL failure | Re-run from last checkpoint |
| Data corruption | Restore target from pre-migration snapshot, re-run |
| Reconciliation mismatch > threshold | Stop migration, revert to legacy, investigate |
| Cutover failure | DNS rollback to legacy, disable Meter Verse writes |
| Parallel run issue | Legacy remains primary, defer cutover |
