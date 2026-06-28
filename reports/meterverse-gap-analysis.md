# Meter Verse → SBill Gap Analysis

> **Assessment Date**: June 2026
> **Scope**: Full-stack comparison across 11 engine domains
> **Methodology**: Table-by-table, field-by-field, flow-by-flow comparison using live SBill database schema, JRXML reports, UI pages, and API contracts vs Meter Verse `sim_system` schema and NestJS service code.

---

## Scoring Rubric

| Score | Meaning |
|-------|---------|
| 0% | Feature does not exist in Meter Verse |
| 1–24% | Early/partial implementation, core gaps |
| 25–49% | Functional but missing major sub-features |
| 50–74% | Mostly complete, minor gaps |
| 75–99% | Near parity, edge cases only |
| 100% | Full parity |

---

## 1. Bill Cycle Engine

**Score: 0% — CRITICAL GAP**

| Capability | SBill | Meter Verse | Delta |
|------------|-------|-------------|-------|
| BillCycle entity | `billing_cycle(id, month, service, project_id, status, created_by, created_at)` | ❌ Does not exist | Entity must be created |
| Cycle statuses | DRAFT, ACTIVE, PROCESSING, COMPLETED, FAILED, CANCELLED | ❌ Does not exist | Enum + state machine needed |
| Batch generation | Runs N invoices in single transaction | ❌ Single invoice only | Batch service needed |
| BillCycle logs | `billcycle_logs(id, billing_cycle_id, started_at, completed_at, status, total/success/failed_count, created_by)` | ❌ Does not exist | Audit trail table |
| Cycle scheduling | Manual trigger + scheduled job | ❌ Does not exist | Scheduler service |
| Posting workflow | Generate → Review → Post | ❌ Direct generation only | Workflow states needed |
| Cancellation | Cancel cycle → reverse all invoices | ❌ Does not exist | Bulk reversal logic |
| Re-run support | Incremental (skip already-billed) | ❌ Does not exist | Idempotency keys |
| Multi-month | Process past months via month filter | ❌ Does not exist | Month parameter |

**P0 Blocking Items**:
- [ ] Create `billing_cycle` table with all fields
- [ ] Create `billcycle_logs` table
- [ ] Implement cycle status state machine
- [ ] Implement batch invoice generation (N tariffs × M meters)
- [ ] Implement cycle posting (set invoice status to POSTED)
- [ ] Implement cycle cancellation (reverse all invoices in cycle)

---

## 2. Tariff Versioning

**Score: 0% — CRITICAL GAP**

| Capability | SBill | Meter Verse | Delta |
|------------|-------|-------------|-------|
| Effective dates | `tariff.start_date`, `tariff.end_date` | ❌ Not on `tariff_plan` | Add date columns |
| Date-range queries | `WHERE start_date <= :target AND (end_date IS NULL OR end_date >= :target)` | ❌ Not implemented | Query logic |
| Future-dated tariffs | Create now, activate later | ❌ Not supported | Date validation |
| Historical tariffs | Past tariffs preserved for audit | ❌ Overwritten | Version history |
| Tariff status | `tariff.status` (ACTIVE/INACTIVE/DRAFT) | ❌ Not on `tariff_plan` | Add status column |
| Charge-level dating | `tariff_charges` inherits tariff dates | ❌ Not implemented | Propagation logic |

**P0 Blocking Items**:
- [ ] Add `start_date`, `end_date`, `status` columns to `tariff_plan`
- [ ] Add effective-dated query scope to `TariffCalculationService`
- [ ] Implement date overlap validation (no two active tariffs for same service/date)
- [ ] Create migration for existing data (set all existing to start_date = created_at)

---

## 3. Charge Types

**Score: 20% — CRITICAL GAP**

| Capability | SBill (`tariff_charges.charge_type`) | Meter Verse | Delta |
|------------|--------------------------------------|-------------|-------|
| `STEPS` | Tiered rate (0–100 @ 0.50, 101–200 @ 0.75) | ⚠️ `isTiered` with `tiers[]` | Partially implemented |
| `FLAT` | Flat amount per period (e.g., 50 SAR service fee) | ❌ Not supported | New charge type |
| `STATIC` | Static line item (e.g., 5 SAR municipal fee) | ❌ Not supported | New charge type |
| `PER_UNIT` | Rate × consumption (e.g., 0.50 × kWh) | ❌ Not supported | New charge type |
| `ZERO` | Zero-amount informational line | ❌ Not supported | New charge type |

**Current MV `TariffCharge` schema**:
```
TariffCharge {
  id: number;
  name: string;
  isTiered: boolean;       // Only supports STEPS vs non-STEPS
  flatAmount: number;      // Mixed meaning
  tiers: TariffTier[];
}
```

**Required MV schema**:
```
TariffCharge {
  id: number;
  name: string;
  chargeType: ChargeType;  // STEPS | FLAT | STATIC | PER_UNIT | ZERO
  flatAmount: number;      // Used by FLAT, STATIC
  rate: number;            // Used by PER_UNIT
  tiers: TariffTier[];     // Used by STEPS
  chargeGroup: number;     // NEW: maps to invoice_details.charge_group
  recurringMode: string;   // NEW: MONTHLY | ONE_TIME | SEASONAL
  upperLimit: number;      // NEW: max consumption for this charge
}
```

**P0 Blocking Items**:
- [ ] Create `ChargeType` enum: `STEPS | FLAT | STATIC | PER_UNIT | ZERO`
- [ ] Update `TariffCharge` entity with `chargeType`, `rate`, `chargeGroup`, `recurringMode`, `upperLimit`
- [ ] Update `TariffCalculationService` to dispatch by `chargeType`
- [ ] Implement all 5 calculation formulas in calculation service
- [ ] Remove `isTiered` boolean (replaced by `chargeType = 'STEPS'`)

---

## 4. Invoice Generation

**Score: 10% — CRITICAL GAP**

| Capability | SBill | Meter Verse | Delta |
|------------|-------|-------------|-------|
| Single invoice | ✅ Full | ⚠️ Basic (tariff calc only) | Missing charge groups |
| Batch generation | `billing_cycle → FOR EACH meter → generate_invoice()` | ❌ Not implemented | Loop + transaction |
| Invoice reversal | Cancel invoice → reverse ledger + meter readings | ❌ Not implemented | Reversal service |
| Rebilling | Cancel old → generate new with corrected data | ❌ Not implemented | Two-phase flow |
| Invoice details | `invoice_details` with `charge_group`, consumption split | ❌ Not created | Detail line items |
| Invoice statuses | DRAFT, POSTED, CANCELLED, DELETED, INACTIVE | ❌ Not defined | Status enum |
| Auto-numbering | `invoice.number` from sequence (e.g., INV-2026-0001) | ❌ Not implemented | Number generator |
| Balance tracking | `balance_before`, `balance_after` on invoice | ❌ Not implemented | Ledger integration |

**P0 Blocking Items**:
- [ ] Define `InvoiceStatus` enum (DRAFT, POSTED, CANCELLED, DELETED)
- [ ] Create `invoice_details` table with `charge_group`, `amount`, reading fields
- [ ] Implement batch generation service
- [ ] Implement invoice number generator (configurable format)
- [ ] Implement invoice cancellation with reversal

---

## 5. Customer Balance / Ledger

**Score: 0% — CRITICAL GAP**

| Capability | SBill | Meter Verse | Delta |
|------------|-------|-------------|-------|
| Ledger table | Implicit via `invoice.balance_before/after` + `payment.balance_before/after` | ❌ Does not exist | Create ledger table |
| Running balance | Balance computed and stored per transaction | ❌ Not computed | Calculation logic |
| Transaction types | Invoice, Payment, Settlement, Adjustment, Opening Balance | ❌ Not defined | Type enum |
| Opening balance | Initial balance on customer creation | ❌ Not supported | Initial entry |
| Balance inquiry | `GetCustomerBalance(customerId) → current balance` | ❌ Not implemented | Service method |
| Aged balance | 30/60/90/120+ day aging | ❌ Not implemented | Aging query |

**P0 Blocking Items**:
- [ ] Create `customer_ledger` table: `(id, customer_id, transaction_type, reference_id, amount, balance_before, balance_after, created_at, description)`
- [ ] Create `LedgerTransactionType` enum
- [ ] Implement ledger entry creation on invoice generation
- [ ] Implement ledger entry creation on payment posting
- [ ] Implement `getCustomerBalance()` service
- [ ] Backfill ledger for existing invoices and payments

---

## 6. Settlement Engine

**Score: 10% — MAJOR GAP**

| Capability | SBill | Meter Verse | Delta |
|------------|-------|-------------|-------|
| Settlement table | `meter_settlements(id, meter_id, amount, reason)` | ❌ Does not exist | Create table |
| Settlement types | `settlement_type(id, name, allowed_months)` | ❌ Does not exist | Create table |
| Installation | Fixed-term settlement (e.g., 60 months) | ❌ Not supported | Amortization logic |
| One-time charge | Immediate settlement (e.g., connection fee) | ❌ Not supported | Single charge |
| Invoice integration | Settlement amount appears in invoice as charge group | ❌ Not integrated | Charge group mapping |
| Proration | Partial month settlement calculation | ❌ Not supported | Date-based math |

**P1 Blocking Items**:
- [ ] Create `settlement_type` table
- [ ] Create `meter_settlements` table with FK to `settlement_type`
- [ ] Implement settlement calculation (installation: amount / allowed_months)
- [ ] Integrate settlements into invoice generation as a charge group
- [ ] Implement settlement balance tracking

---

## 7. Payment Engine

**Score: 30% — MAJOR GAP**

| Capability | SBill | Meter Verse | Delta |
|------------|-------|-------------|-------|
| Payment types | CASH, CHEQUE, BANK_TRANSFER, CARD, ADVANCE | ⚠️ CASH only in UI | Add 4 types |
| Receipt numbering | Auto-generated `receipt_no` | ⚠️ Basic sequence | Configurable format |
| Balance tracking | `balance_before`, `balance_after` per payment | ❌ Not implemented | Ledger integration |
| Payment allocation | Payment → multiple invoices | ❌ Not supported | Allocation table |
| Partial payment | Pay 50% of invoice | ❌ Not supported | Partial amount logic |
| Advance payment | Pre-pay, credit against future invoices | ❌ Not supported | Credit balance |
| Payment reversal | Cancel payment → reverse ledger | ❌ Not supported | Reversal flow |
| Receipt print | Formatted PDF receipt | ✅ Basic | Needs full layout |
| Multi-currency | SAR only (assumed) | ✅ SAR only | OK |

**P1 Blocking Items**:
- [ ] Add `PaymentType` enum: CASH, CHEQUE, BANK_TRANSFER, CARD, ADVANCE
- [ ] Create `payment_allocation` table for invoice-level allocation
- [ ] Implement balance tracking on payment create/reverse
- [ ] Implement advance payment flow (creates credit balance)
- [ ] Implement partial payment flow

---

## 8. Reading Engine

**Score: 25% — MAJOR GAP**

| Capability | SBill | Meter Verse | Delta |
|------------|-------|-------------|-------|
| CRUD | ✅ Full | ⚠️ Basic read/create | Add update/delete |
| Validation Rules | High/low threshold, duplicate detection, sequence check | ❌ Not implemented | Validation service |
| Reading approval | Submit → Review → Approve workflow | ❌ Not implemented | Status workflow |
| Correction | Replace erroneous reading with corrected value | ❌ Not implemented | Correction flow |
| Estimated reading | Flag `is_estimated` for non-actual reads | ❌ Not implemented | Boolean flag |
| Average calculation | `avg_consumption = last_3_months / 3` for estimates | ❌ Not implemented | Calculation |
| Bulk import | Excel/CSV upload with validation | ❌ Not implemented | Import module |
| Reading source | Manual, AMR, Import | ❌ Not implemented | Source enum |

**P1 Blocking Items**:
- [ ] Add `status` field to meter_reading (PENDING, APPROVED, REJECTED, CORRECTED)
- [ ] Add `is_estimated`, `source`, `corrected_by` fields
- [ ] Implement reading validation rules
- [ ] Implement reading approval workflow
- [ ] Implement reading correction flow

---

## 9. Reporting Engine

**Score: 10% — MAJOR GAP**

| Capability | SBill | Meter Verse | Delta |
|------------|-------|-------------|-------|
| PDF generation | ✅ JasperReports (16 reports) | ⚠️ InvoiceTemplateService (Puppeteer) | Extend to N reports |
| Report catalog | 16 named reports (see `report-dependencies.md`) | ❌ 0 of 16 implemented | Build all 16 |
| Parameterized | Date range, project_id, status, customer_id filters | ❌ Not implemented | Filter service |
| Export formats | PDF, Excel (assumed XLS/XLSX) | ❌ PDF only | Add XLSX export |
| Scheduled reports | Automated email delivery | ❌ Not supported | Scheduler |
| Report builder | Ad-hoc query tool | ❌ Not supported | Out of scope |
| Branding | Project logo, company info on each report | ✅ Basic | Extend to all reports |

**P2 Blocking Items** (see `master-roadmap-alignment.md` for phased plan):
- [ ] Build generic `ReportService` using Puppeteer
- [ ] Implement top 8 reports (Phase 4)
- [ ] Implement remaining 8 reports (Phase 5)
- [ ] Add XLSX export capability
- [ ] Add report scheduling

---

## 10. Import Engine

**Score: 0% — NOT IMPLEMENTED**

| Capability | SBill | Meter Verse | Delta |
|------------|-------|-------------|-------|
| Reading import | Excel/CSV → validate → bulk insert | ❌ Not implemented | Import pipeline |
| Customer import | Excel/CSV → validate → bulk insert | ❌ Not implemented | Import pipeline |
| Meter import | Excel/CSV → validate → bulk insert | ❌ Not implemented | Import pipeline |
| Template download | Pre-formatted Excel templates | ❌ Not implemented | Template generator |
| Validation report | Error rows + reasons returned | ❌ Not implemented | Result reporting |
| Duplicate detection | Skip/reject on duplicate keys | ❌ Not implemented | Dedup logic |

**P2 Blocking Items**:
- [ ] Build generic Excel/CSV import pipeline
- [ ] Create import templates for readings, customers, meters
- [ ] Implement validation rules per entity
- [ ] Implement error reporting (which rows failed, why)

---

## 11. Settings Engine

**Score: 12% — MAJOR GAP**

| SBill Settings Page | Meter Verse | Priority |
|---------------------|-------------|----------|
| Tariff Management | ⚠️ Basic CRUD | P0 |
| Bill Cycle Management | ❌ Missing | P0 |
| Customer Groups | ❌ Missing | P1 |
| Holidays | ❌ Missing | P1 |
| Payment Centers | ❌ Missing | P1 |
| Settlement Types | ❌ Missing | P1 |
| Reading Codes | ❌ Missing | P2 |
| Payment Types | ❌ Missing | P2 |
| Invoice Formats | ❌ Missing | P2 |
| Report Templates | ❌ Missing | P2 |
| User Management | ❌ Missing | P2 |
| Role Management | ❌ Missing | P2 |
| Backup Settings | ❌ Missing | P2 |
| Email Configuration | ❌ Missing | P2 |
| SMS Configuration | ❌ Missing | P2 |
| System Preferences | ❌ Missing | P2 |

**Total SBill Settings Pages**: 16
**Total MV Settings Pages**: 2 (Tariff + basic project)
**Parity**: 2/16 = 12.5%

---

## Consolidated Gap Summary

```
Engine                Score    P0 Gaps   P1 Gaps   P2 Gaps   Criticality
─────────────────────────────────────────────────────────────────────────
Bill Cycle             0%       4         0         0         🔴 CRITICAL
Tariff Versioning      0%       3         0         0         🔴 CRITICAL
Charge Types          20%       3         0         0         🔴 CRITICAL
Invoice Generation    10%       5         0         0         🔴 CRITICAL
Customer Balance       0%       5         0         0         🔴 CRITICAL
Settlement            10%       0         4         0         🟡 MAJOR
Payment               30%       0         4         0         🟡 MAJOR
Reading               25%       0         4         0         🟡 MAJOR
Reporting             10%       0         0        16         🟡 MAJOR
Import                 0%       0         0         3         🟢 MINOR
Settings              12%       2        14         —         🟡 MAJOR
─────────────────────────────────────────────────────────────────────────
OVERALL PARITY       ~10%       22        26        19        🔴 NOT READY
```

**Key Insight**: 5 of 11 engines are at 0% parity (Bill Cycle, Tariff Versioning, Customer Balance, Import, and effectively Settings). The other 6 engines average ~17% partial implementation. The system is not production-ready for any single engine domain.

---

## Migration Complexity Estimate

| Factor | Estimate |
|--------|----------|
| New tables to create | ~15 |
| New entities/models | ~18 |
| New services | ~12 |
| New API endpoints | ~60+ |
| New UI pages | ~30+ |
| New reports | 16 |
| Developer-weeks (total) | ~20 (5 months × 1 FTE) |
| Risk level | HIGH (tight coupling across engines) |

---

## Immediate Recommendations

1. **FREEZE** all new feature development outside the Phase 1 scope
2. **BEGIN** Phase 1 implementation immediately (Tariff Versioning + Charge Types + Customer Ledger)
3. **ASSIGN** dedicated owner for Bill Cycle Engine (highest complexity, most dependencies)
4. **SCHEDULE** weekly parity review against this document
5. **TARGET** Phase 1 completion before any invoice template or UI work continues
