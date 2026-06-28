# 07 — Migration Plan

## Source Systems → Target Schemas

| Source | Records | Target Schema | Strategy |
|--------|---------|---------------|----------|
| SBill Palm Hills (SQL Server) | 500K consumers, 50M readings | area_{n} | ETL batch (10K/insert) |
| SBill Estates (SQL Server) | 200K consumers, 20M readings | area_{n} | ETL batch (10K/insert) |
| Collection System (PostgreSQL) | 100K debt records | area_{n} | Direct SQL migration |
| Solar Wallet (Collection System) | 54 customers, 2,797 invoices | features + area_{n} | Replay + sync |
| Meter Pulse MVP (sim_system) | ~50 tables | core + features + area_{n} | Schema split |

## Migration Schedule (5 Days)

### Day 1: Solar Wallet
- Extract: wallets, transactions, balances from Collection System
- Transform: map to features.WalletAccount, features.WalletTransaction
- Load: batch insert into features schema
- Verify: 54 customers, 2,797 invoices, 963 payments

### Day 2: Collection Tracker
- Extract: debt records, collection actions
- Transform: map to area_{n}.TroubleTicket, area_{n}.CollectionAction
- Load: per-area batch insert
- Verify: ~100K records, balance reconciliation

### Day 3: SBill Estates
- Extract: consumers, meters, readings, invoices, payments
- Transform: map to area_{n} schema
- Load: batch insert (10K per batch)
- Verify: row count, consumer balance, reading count, payment sum

### Day 4: SBill Palm Hills
- Same as Day 3 for Palm Hills data (larger dataset)
- Verify: row count, consumer balance, reading count, payment sum

### Day 5: Core + Features + Final Sync
- Move sim_system → core (users, roles, projects, config)
- Move sim_system → features (tariffs, reports, settings)
- CDC catch-up for any changes during migration
- Final reconciliation checks

## Post-Migration: 30-Day Parallel Run
- Daily reconciliation: row counts, balances, payments
- Shadow mode for API compatibility
- Rollback within 2 hours if mismatch > 0.1%

## ETL Scripts to Create
- `scripts/migration/extract/solar-wallet.sql`
- `scripts/migration/transform/solar-wallet.sql`
- `scripts/migration/load/solar-wallet.sql`
- `scripts/migration/extract/collection-tracker.sql`
- `scripts/migration/extract/sbill-estates*.sql`
- `scripts/migration/extract/sbill-palmhills*.sql`
- `scripts/migration/load/core-data.sql`
- `scripts/migration/load/features-data.sql`
- `scripts/migration/verify/reconciliation.sql`

## Rollback Strategy
- Pre-migration snapshot of all target schemas
- Stop new services, restore old services, restore database
- Maximum rollback time: 2 hours
- Automatic rollback triggers: billing mismatch > 0.1%, payment failure rate > 5 in 5 min, API error rate > 1%
