# Migration — Source-to-Target Mapping

## 1. Collection System (36 tables) → Area DB (45 tables)

| Source Table | Target Table | Key Columns | Transformation Notes |
|---|---|---|---|
| collection.consumer | area.consumer | consumer_id → code, name → full_name | Status mapping: 0→active, 1→suspended, 2→closed |
| collection.consumer_address | area.consumer_contact | address → address_line | Concatenate multi-line |
| collection.consumer_doc | area.consumer_document | doc_id → id, doc_type → document_type | Binary → base64 or S3 URL |
| collection.consumer_status_log | area.consumer_history | status → old/new_status | Timestamp preserved |
| collection.meter | area.meter | meter_id → code, serial_no → serial_number | Add meter_model lookup |
| collection.meter_model | area.meter_model | Direct copy | No change |
| collection.meter_status | area.meter_status | status_code → code, name → display_name | Seed reference data |
| collection.meter_seal | area.meter_seal | Direct copy | Add area_id |
| collection.meter_install_log | area.meter_history | event_type → action | Map types (I=installed, R=removed, M=maintained) |
| collection.reading | area.meter_reading | meter_id → meter_code, read_value → value | Unit from meter model |
| collection.reading_route | area.reading_route | Direct copy | No change |
| collection.reading_route_assign | area.reading_route_assignment | reader_id → assigned_to | Join to core.user |
| collection.reading_validation_rule | area.reading_validation | Direct copy | No change |
| collection.reading_estimate | area.reading_estimate | Direct copy | No change |
| collection.invoice | area.invoice | invoice_id → code, total → total_billed | Status mapping |
| collection.invoice_line | area.invoice_line_item | line_id → id | Description from tariff |
| collection.invoice_tax | area.invoice_tax | Direct copy | No change |
| collection.invoice_status_log | area.invoice_history | Direct copy | No change |
| collection.payment | area.payment | payment_id → code, amount → paid_amount | Method mapping |
| collection.payment_alloc | area.payment_allocation | Direct copy | No change |
| collection.payment_method | area.payment_method | Direct copy | Seed data only |
| collection.payment_batch | area.payment_batch | Direct copy | Add reconciliation link |
| collection.ledger | area.ledger | Direct copy | Add area_id |
| collection.ledger_account | area.ledger_account | Direct copy | Standardize account codes |
| collection.ledger_entry | area.ledger_entry | Direct copy | No change |
| collection.tariff | area.tariff | tariff_id → code | Add area_id |
| collection.tariff_rate | area.tariff_rate | Direct copy | No change |
| collection.tariff_charge | area.tariff_charge | Direct copy | No change |
| collection.tariff_exemption | area.tariff_exemption | Direct copy | Map to customer_group |
| collection.disconnect | area.disconnect_order | Direct copy | Status mapping |
| collection.disconnect_tech | area.disconnect_technician | Direct copy | Join to core.user |
| collection.disconnect_verify | area.disconnect_verification | Direct copy | Photo paths |
| collection.complaint | area.complaint | Direct copy | Add area_id, consumer_id |
| collection.complaint_action | area.complaint_action | Direct copy | No change |
| collection.complaint_escalation | area.complaint_escalation | Direct copy | No change |
| collection.contract | area.contract | Direct copy | Add start/end dates |

## 2. SBill Palm Hills (36 tables) → Area DB (45 tables)

Same structure as Collection System above with these additional source tables:

| Source Table | Target Table | Transformation Notes |
|---|---|---|
| sbill_ph.consumer_balance | area.ledger_entry | Opening balance as journal entry |
| sbill_ph.consumer_deposit | area.deposit | Map deposit type |
| sbill_ph.deposit_refund | area.deposit_refund | Link to deposit |
| sbill_ph.subsidy | area.subsidy | Government subsidy codes |
| sbill_ph.subsidy_alloc | area.subsidy_allocation | Per-consumer allocation |
| sbill_ph.reconciliation | area.reconciliation | Bank statement ref |
| sbill_ph.reconciliation_item | area.reconciliation_item | Link to payment |
| sbill_ph.writeoff | area.write_off | Bad debt write-off reason |
| sbill_ph.bank_account → | core.bank_account | Migrated to core |
| sbill_ph.payment_center → | core.payment_center | Migrated to core |

### OBIS Reading Type Mapping (SBill → Meter Verse)

| SBill Reading Type | OBIS Code | Unit | Target Column |
|---|---|---|---|
| Active Energy Import | 1.8.0 | kWh | meter_reading.value |
| Active Energy Export | 2.8.0 | kWh | meter_reading.value |
| Reactive Energy Import | 3.8.0 | kVArh | meter_reading.value |
| Reactive Energy Export | 4.8.0 | kVArh | meter_reading.value |
| Instantaneous Voltage L1 | 32.7.0 | V | meter_reading.value |
| Instantaneous Current L1 | 31.7.0 | A | meter_reading.value |
| Power Factor | 33.7.0 | cosφ | meter_reading.value |
| Instantaneous Power | 16.7.0 | kW | meter_reading.value |
| Max Demand | 71.7.0 | kW | meter_reading.value |
| Cumulative Demand | 61.7.0 | kW | meter_reading.value |

## 3. SBill Estates Tables → Area DB Mapping

| Source Table | Target Table | Transformation Notes |
|---|---|---|
| estates.consumer | area.consumer | Status: 0=active, 3=inactive |
| estates.meter | area.meter | Serial number format: `EST-{code}` |
| estates.reading | area.meter_reading | OBIS codes same as Palm Hills |
| estates.invoice | area.invoice | Currency: EGP fixed |
| estates.payment | area.payment | Payment gateway ref stored in notes |
| estates.ledger | area.ledger | Same structure |
| estates.tariff | area.tariff | Rates in EGP |
| estates.contract | area.contract | Contract ref = `CNT-{id}` |
| estates.complaint | area.complaint | Same mapping as collection |
| estates.bank_account → | core.bank_account | Migrated to core |
| estates.payment_center → | core.payment_center | Migrated to core |

## 4. Solar Wallet → Ledger Entries Mapping

| Source Table | Target Table | Transformation Notes |
|---|---|---|
| solar_wallet.wallet | features.consumer | wallet_code → consumer.code; type='prepaid_solar' |
| solar_wallet.wallet_balance | area.ledger_entry | Credit balance as ledger entry |
| solar_wallet.transaction | area.ledger_entry | type=topup → credit; type=consumption → debit |
| solar_wallet.tariff_plan | area.tariff | Plan name + rate per kWh |
| solar_wallet.meter_mapping | area.meter | Add meter with 'prepaid' flag |
| solar_wallet.daily_consumption | area.meter_reading | Aggregated daily values |
| solar_wallet.sms_log | core.notification_queue | Convert to notification records |
| solar_wallet.vendor | core.payment_center | Map to payment center |
| solar_wallet.commission | area.ledger_entry | Separate commission journal entry |
| solar_wallet.refund | area.ledger_entry | Negative ledger entry |

### Transformation Pseudocode

```sql
-- Solar Wallet transaction → ledger entry
INSERT INTO area.ledger_entry (consumer_id, entry_type, amount, currency, description, created_at)
SELECT
    c.id AS consumer_id,
    CASE
        WHEN t.type = 'TOPUP' THEN 'credit'
        WHEN t.type = 'CONSUMPTION' THEN 'debit'
        WHEN t.type = 'REFUND' THEN 'credit'
        ELSE 'other'
    END AS entry_type,
    t.amount,
    'EGP' AS currency,
    t.description,
    t.created_at
FROM solar_wallet.transaction t
JOIN features.consumer c ON c.code = t.wallet_code
WHERE t.created_at >= '2026-01-01';
```
