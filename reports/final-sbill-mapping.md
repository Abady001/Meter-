# Final SBill Mapping

**Date**: 2026-06-18
**Source**: 44 JRXML templates from SBill OctoberBilling-Complete

## SBill Tables → Our Prisma Schema

| SBill Table | Our Table | Field Match | Status |
|------------|-----------|-------------|--------|
| `invoice` | `sim_system.invoice` | id, number, status, issue_date, total_amt, paid_amt, open_amt | ✅ 7/18 fields |
| — | — | `i.counsumption_month` ❌ | Missing billing period ref |
| — | — | `i.start_reading`, `i.end_reading` ❌ | Missing reading snapshots |
| — | — | `i.meter_serial` ❌ | Missing meter serial denormalization |
| — | — | `i.balance_before`, `i.balance_after` ❌ | Missing balance tracking |
| — | — | `i.counsumption_value` ❌ | Missing consumption snapshot |
| `customer` | `sim_system.customer` | id, name (en), phone | ✅ 3/10 fields |
| — | — | `c.name_ar` ❌ | Missing Arabic name |
| — | — | `c.tenant_name` ❌ | Missing tenant field |
| — | — | `c.commercial_name` ❌ | Missing commercial name |
| — | — | `c.mobile` ❌ | Missing secondary phone |
| — | — | `c.ctype` ❌ | Missing customer type (SBill style) |
| `meter` | `sim_system.meter` | id, serial, type | ✅ 3/8 fields |
| — | — | `m.tariff_id` ❌ | Missing tariff FK on meter |
| — | — | `m.initial_balance` ❌ | Missing initial balance |
| — | — | `m.relay_status` ❌ | Missing relay status |
| — | — | `m.last_reading_date` ❌ | Missing last reading date on meter |
| `tariff` | `sim_system.tariff_plan` | name, rate | ✅ 2/6 fields |
| — | — | `t.charge_groups` ❌ | Missing charge group config |
| `tariff_charges` | `features.tariff_charge` | All fields | ✅ Schema exists, no service |
| `tariff_charges_details` | `features.tariff_charge_detail` | All fields | ✅ Schema exists, no service |
| `location` | `sim_system.location_nodes` | id, address, unit_no | ✅ Partial |
| `project` | `sim_system.project` | id, title, address | ✅ 3/8 fields |
| — | — | `p.logo` ❌ | Missing logo image |
| — | — | `p.license` ❌ | Missing license text |
| — | — | `p.signature` ❌ | Missing signature image |
| — | — | `p.bank_details` ❌ | Missing bank details |
| — | — | `p.company_info` ❌ | Missing company info |
| `invoice_details` | `sim_system.invoice_line` | invoice_id, amount | ⚠️ 2/7 fields |
| — | — | `id.charge_group` ❌ | Missing charge group categorization |
| — | — | `id.name` (Arabic) ❌ | Missing Arabic charge name |
| `payment` | `sim_system.payment` | id, amount, date | ✅ 3/10 fields |
| — | — | `p.balance_before`, `p.balance_after` ❌ | Missing balance |
| — | — | `p.cheque_number`, `p.bank_name`, `p.transfer_number` ❌ | Missing payment details |
| — | — | `p.receipt_no` ❌ | Missing receipt numbering |
| — | — | `p.payment_fees`, `p.settlement_amount` ❌ | Missing fees/settlement |
| `monthly_reading` | — | Entire table ❌ | Not in our schema |

## Field Coverage
| Status | Count |
|--------|-------|
| ✅ Ready (exists in our schema) | ~20 fields |
| ⚠️ Partial (schema exists, needs expansion) | ~15 fields |
| ❌ Missing (not in our schema) | ~35 fields |

## Key Gap
The SBill schema has **~70 distinct fields** across all templates. Our current schema covers **~20** of them. The remaining **~50 fields** need to be added for full SBill template compatibility.
