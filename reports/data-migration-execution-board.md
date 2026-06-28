# DATA MIGRATION EXECUTION PLAN

## Source Systems

| Source | Data Volume | Priority | Complexity |
|--------|-------------|----------|------------|
| SBill | Full production | P0 — Critical | High |
| Collection System | 36 tables | P1 — High | Medium |
| Legacy Excel | Varies | P2 — Medium | Low |
| Legacy SQL Dumps | Varies | P2 — Medium | Low |

## Migration Order

```
Phase 1: Reference Data (no dependencies)
  ├── Areas → CoreArea
  ├── Projects → sim_system.projects
  ├── Tariffs → features.tariffs → tariff_charges → tariff_charge_details
  └── Users → CoreUser → CoreUserRoleAssignment
  
Phase 2: Customer Data
  ├── Customers → sim_system.customers
  └── Customer Groups → CoreCustomerGroup

Phase 3: Meter Data
  ├── Meters → sim_system.meters
  ├── Meter Assignments → sim_system.meter_assignments
  └── SIM Cards → sim_system.sim_cards

Phase 4: Billing Data
  ├── Readings → sim_system.readings
  ├── Invoices → sim_system.invoices → invoice_lines
  ├── Payments → sim_system.payments → payment_allocations
  └── Ledger → sim_system.customer_ledger_entries

Phase 5: Financial Data
  ├── Wallet Accounts → features.wallet_accounts
  ├── Wallet Transactions → features.wallet_transactions
  └── Bill Cycles → features.billing_cycle
```

## Validation Per Phase

| Phase | Validation Check | SQL Query |
|-------|-----------------|-----------|
| 1 | Row count matches source | `SELECT COUNT(*)` |
| 1 | No null required fields | Check NOT NULL constraints |
| 2 | All customers have project_id | `WHERE project_id IS NULL` |
| 3 | All meters have project_id | `WHERE project_id IS NULL` |
| 4 | Invoice totals match source | SUM(totalAmount) vs source |
| 4 | Payment allocations balance | SUM(allocated) = SUM(payment.amount) |
| 5 | Wallet balances match | SUM(balance) vs source |

## Rollback Strategy

```bash
# Before each phase, back up target tables
pg_dump -U meter_pulse -d meter_pulse -t sim_system.customers > backup/customers_pre_migration.sql

# If migration fails, restore the backup
psql -U meter_pulse -d meter_pulse -f backup/customers_pre_migration.sql

# For full rollback, restore the entire database
pg_restore -U meter_pulse -d meter_pulse backup/pre_migration_full.dump
```

## Import Template (Excel → DB)

Use Upload Center for Excel imports:

1. Download template from Upload Center
2. Map source columns to template columns
3. Validate data types match
4. Upload file
5. Review import errors (if any)
6. Confirm import

## Expected Timeline

| Phase | Duration | Data Volume |
|-------|----------|-------------|
| 1: Reference | 1 day | 100-500 rows |
| 2: Customers | 2 days | 1K-100K rows |
| 3: Meters | 2 days | 1K-50K rows |
| 4: Billing | 5 days | 10K-500K rows |
| 5: Financial | 2 days | 1K-100K rows |
| **Total** | **~2 weeks** | |
