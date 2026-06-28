# Migration — Implementation Plan

## Pre-Migration

| Task | Owner | Duration | Artifacts |
|---|---|---|---|
| Schema mapping (all 4 sources) | DBA | 1 week | `docs/mapping/sbill-ph.xlsx`, `docs/mapping/sbill-estates.xlsx`, `docs/mapping/collection-tracker.xlsx`, `docs/mapping/solar-wallet.xlsx` |
| ETL script development | ETL Dev | 2 weeks | `etl/extract/sbill-ph.sql`, `etl/transform/sbill-ph.sql`, `etl/load/sbill-ph.sql` (×4 sources) |
| CDC setup (Debezium / pglogical) | DBA | 3 days | CDC config per source, `docs/cdc-config.md` |
| Test run on snapshot | QA + DBA | 3 days | Test report, reconciliation output |
| Snapshot backup of all sources | DBA | 1 day | pg_dump files, verified checksums |

## Migration Week

### Day 1: Solar Wallet

| Step | Script | Verification |
|---|---|---|
| 1. Extract wallets | `etl/extract/solar-wallet-wallets.sql` | 50K rows |
| 2. Transform → ledger | `etl/transform/solar-wallet.sql` | Ledger balance = wallet balance |
| 3. Load to Features | `etl/load/solar-wallet.sql` | Zero errors |
| 4. CDC catch-up | `etl/cdc/solar-wallet.sql` | Δ rows < 0.1 % |

### Day 2: Collection Tracker

| Step | Script | Verification |
|---|---|---|
| 1. Extract debt records | `etl/extract/collection-tracker.sql` | 100K rows |
| 2. Transform → Area DB ledger | `etl/transform/collection-tracker.sql` | Debt total matches |
| 3. Load to Area DBs | `etl/load/collection-tracker.sql` | Per-area counts verified |
| 4. CDC catch-up | `etl/cdc/collection-tracker.sql` | Δ rows < 0.1 % |

### Day 3: SBill Estates

| Step | Script | Verification |
|---|---|---|
| 1. Extract consumers | `etl/extract/sbill-estates-consumers.sql` | 200K consumers |
| 2. Extract meters + readings | `etl/extract/sbill-estates-readings.sql` | 20M readings |
| 3. Extract invoices + payments | `etl/extract/sbill-estates-finance.sql` | Invoice balance matches |
| 4. Transform → Area DB (45 tables) | `etl/transform/sbill-estates.sql` | OBIS code mapping verified |
| 5. Load to Area DB | `etl/load/sbill-estates.sql` | 15 Area DBs |
| 6. CDC catch-up | `etl/cdc/sbill-estates.sql` | Δ rows < 0.1 % |

### Day 4: SBill Palm Hills

| Step | Script | Verification |
|---|---|---|
| 1. Extract consumers | `etl/extract/sbill-ph-consumers.sql` | 500K consumers |
| 2. Extract meters + readings | `etl/extract/sbill-ph-readings.sql` | 50M readings |
| 3. Extract invoices + payments | `etl/extract/sbill-ph-finance.sql` | Invoice balance matches |
| 4. Transform → Area DB | `etl/transform/sbill-ph.sql` | OBIS code mapping verified |
| 5. Load to Area DB | `etl/load/sbill-ph.sql` | 15 Area DBs |
| 6. CDC catch-up | `etl/cdc/sbill-ph.sql` | Δ rows < 0.1 % |

### Day 5: Core + Features Final Sync

| Step | Script | Verification |
|---|---|---|
| 1. Sync core tables | `etl/sync/core-final.sql` | Row counts match |
| 2. Sync features tables | `etl/sync/features-final.sql` | Row counts match |
| 3. Reconciliation full report | `etl/reconciliation/full-report.sql` | All checks pass |

## Validation (Days 6–8)

| Check | Script | Threshold |
|---|---|---|
| Row count per table | `validation/row-count.sql` | 0 % difference |
| Consumer balance | `validation/balance.sql` | < 0.01 % difference |
| Reading count per day | `validation/daily-readings.sql` | < 0.1 % difference |
| Payment sum per date | `validation/daily-payments.sql` | < 0.01 % difference |
| Invoice aging | `validation/invoice-aging.sql` | Exact match |

## Rollback Scripts

| System | Rollback Action |
|---|---|
| Solar Wallet | `rollback/truncate-ledger.sql` + restore snapshot |
| Collection Tracker | `rollback/truncate-debt.sql` + restore snapshot |
| SBill Estates | `rollback/truncate-area-estates.sql` + restore snapshot |
| SBill Palm Hills | `rollback/truncate-area-ph.sql` + restore snapshot |
| Full rollback | Stop Meter Verse; `rollback/dns-legacy.ps1` |

## Post-Migration (30-Day Parallel Run)

| Task | Frequency | Script |
|---|---|---|
| Reconciliation report | Daily | `parallel-run/daily-reconciliation.sql` |
| Error report | Daily | `parallel-run/daily-errors.sql` |
| Performance comparison | Weekly | `parallel-run/perf-report.sql` |
| Cutover readiness check | Day 28 | `parallel-run/cutover-readiness.sql` |

## Cutover Scripts

| Step | Script |
|---|---|
| Set legacy to read-only | `cutover/legacy-readonly.sql` |
| Final CDC sync | `cutover/final-cdc-sync.sql` |
| Switch DNS | `cutover/switch-dns.ps1` |
| Enable Meter Verse writes | `cutover/enable-mv-writes.sql` |
| Verify | `cutover/verify-all.sql` |
