# METER VERSE — RECONCILIATION ENGINE DESIGN

**Date:** 2026-06-25

---

## PURPOSE

Automatic detection of data discrepancies between Symbiot, Legacy Billing, and Meter Verse.

## RECONCILIATION JOBS

### Job 1: Meter Count Reconciliation (Daily)

```sql
-- Compare Symbiot device count vs Meter Verse meter count per area
SELECT 
  a.area_name,
  (SELECT COUNT(*) FROM LinkedSymbiot.Device d 
   JOIN LinkedSymbiot.DeviceAttr da ON d.PkID = da.DeviceFK 
   WHERE da.AttrVal = a.area_code) as symbiot_count,
  (SELECT COUNT(*) FROM sim_system.meters m 
   JOIN sim_system.projects p ON m.project_id = p.id
   JOIN core.areas a2 ON p.area_id = a2.id
   WHERE a2.area_code = a.area_code) as meterverse_count
FROM core.areas a
WHERE ABS(symbiot_count - meterverse_count) > 0
```

### Job 2: Reading Count Reconciliation (Hourly)

| Check | Query | Action on Failure |
|-------|-------|-------------------|
| Readings in Symbiot but not in sync | `SELECT DeviceData WHERE modified > last_sync` | Insert into sync.readings_queue |
| Readings in sync but not consumed | `SELECT FROM sync.readings WHERE consumed = false AND age > 1h` | Flag for Meter Verse billing check |
| Duplicate readings same meter+time | `SELECT COUNT(*), DeviceFK, TimeStart GROUP BY HAVING COUNT > 1` | Flag for manual review |

### Job 3: Invoice Balance Reconciliation (Daily)

```sql
-- Sum of all open invoices per customer matches customer balance
SELECT 
  c.customer_code,
  (SELECT SUM(remaining_amount) FROM sim_system.invoices 
   WHERE customer_id = c.id AND status NOT IN ('paid','cancelled')) as invoice_balance,
  c.current_balance
FROM sim_system.customers c
WHERE ABS(invoice_balance - c.current_balance) > 0.01
```

### Job 4: Wallet Reconciliation (Daily)

```sql
-- Wallet balance should equal sum of all transactions
SELECT 
  wa.account_code,
  wa.balance as stated_balance,
  (SELECT SUM(amount) FROM features.wallet_transactions 
   WHERE account_id = wa.id) as calculated_balance
FROM features.wallet_accounts wa
WHERE ABS(wa.balance - calculated_balance) > 0.01
```

## ALERT THRESHOLDS

| Metric | Warning | Critical | Action |
|--------|---------|----------|--------|
| Missing meters per area | > 1% | > 5% | Investigate sync connection |
| Missing readings per meter | > 5% | > 10% | Flag meter for inspection |
| Invoice balance mismatch | > 0.1% | > 1% | Freeze billing, investigate |
| Wallet balance mismatch | Any > 0 | Any > 0 | Freeze wallet, investigate |
| Duplicate readings | Any | > 10/day | Review sync dedup logic |

## EXCEPTION QUEUES

| Queue | Purpose | Resolution |
|-------|---------|------------|
| `sync.exception_queue` | Records that failed validation | Auto-retry 3x, then human review |
| `sync.investigation_queue` | Discrepancies > warning threshold | Human investigation required |
| `sync.approval_queue` | Records requiring manual approval | Authorized user must approve |
| `sync.dead_letter_queue` | Records that failed permanently | Never retry, log for manual fix |

## RECONCILIATION REPORT

Generated daily at 06:00. Contains:
- Row counts per entity per system
- Delta between systems
- Exception queue size
- Investigation queue size
- Approval queue size
- Go/No-Go recommendation for billing cycle
