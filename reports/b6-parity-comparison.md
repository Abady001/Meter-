# B6 — SBill vs Meter Verse Parity Comparison
**Type:** INVESTIGATION  
**Date:** 2025-06-20

---

## Overview

| Metric | SBill | Meter Verse | Delta |
|--------|-------|-------------|-------|
| Customers | 1,422 | — | — |
| Meters | 2,913 | — | — |
| Invoiced | 163M EGP | 0 | 163M gap |
| Collection | 90% | — | — |
| Overall Parity | 100% (baseline) | ~27% | 73% gap |

---

## Parity Comparison Table

| Category | SBill | Meter Verse | Parity | Missing |
|----------|-------|-------------|--------|---------|
| **Bill Cycle** | Per-utility batch with Start/Stop dates, lockable, auto-numbering | Not implemented | **0%** | **CRITICAL** — No cycle creation, no batch processing, no lock/unlock |
| **Tariff Engine** | Versions, 5 charge types (STEPS/FLAT/STATIC/PER_UNIT/ZERO), 7 charge groups, step ranges, customer-group-specific | Basic tier calc in `TariffCalculationService.calculateTieredCharge()` | **35%** | No versioning, no charge type enum, no charge group mapping, no customer-group linking |
| **Reading Engine** | Monthly readings, prev/curr tracking, validation rules, corrections workflow, multi-read delete | Basic CRUD — `MeterReading` entity, no validation | **40%** | No validation rules, no corrections, no prev/curr integrity, no batch delete |
| **Invoice Engine** | Batch generate per bill cycle, cancel invoice, rebill, PDF print, 163M EGP processed | Single invoice PDF generation, no batch | **30%** | No batch generation, no cancel/rebill, no cycle linking, no numbering |
| **Settlement Engine** | 2 types (Tariff Diff / Consumption Settlement), per-cycle application, separate line items | Basic adjustment in invoice, no type distinction | **20%** | No settlement types, no per-cycle application, no line item separation |
| **Payment Engine** | Cash/Cheque/Visa/Online/Bank Transfer, payment allocation, partial payments, 90% collection | Basic payment recording | **50%** | No allocation logic, no multi-method, no reconciliation |
| **Balance Engine** | `balance_before` + `total` - `paid` = `balance_after`, per invoice tracking | Basic calc without ledger | **40%** | No balance_before/after tracking, no running total |
| **Customer Ledger** | Implicit from invoice + payment history, full audit trail | Not implemented | **0%** | No ledger table, no balance history, no statements |
| **Reporting** | 16 JRXML report types (invoices, journals, summaries, aging, collections, tax) | Some basic lists | **25%** | 12 of 16 reports missing entirely |
| **Import Templates** | Data Upload module with 16+ templates (readings, customers, meters, adjustments) | Basic CSV import for readings | **30%** | No template system, no validation, no error reporting |
| **Settings / Admin** | 20+ settings pages (users, projects, groups, tariffs, cycles, holidays, etc) | Partial — Users + Settings (7 tabs) + Tariff Studio | **30%** | 12+ settings pages missing (see B7) |
| **Security / Auth** | Role-based access, per-page permissions, audit log | Basic auth | **40%** | No granular permissions, no audit log |
| **Projects** | EPower October, customer grouping by project | Not in settings | **0%** | No project concept |

---

## Parity Summary by Module

```
Bill Cycle       ░░░░░░░░░░  0%
Tariff Engine    ███▒▒▒▒▒▒▒ 35%
Reading Engine   ████▒▒▒▒▒▒ 40%
Invoice Engine   ███▒▒▒▒▒▒▒ 30%
Settlement       ██▒▒▒▒▒▒▒▒ 20%
Payments         █████▒▒▒▒▒ 50%
Balance Engine   ████▒▒▒▒▒▒ 40%
Customer Ledger  ░░░░░░░░░░  0%
Reports          ██▒▒▒▒▒▒▒▒ 25%
Import Templates ███▒▒▒▒▒▒▒ 30%
Settings/Admin   ███▒▒▒▒▒▒▒ 30%
Security/Auth    ████▒▒▒▒▒▒ 40%
Projects         ░░░░░░░░░░  0%
─────────────────────────────────
OVERALL          ██▒▒▒▒▒▒▒▒ 27%
```

---

## Key Observations

1. **0% parity on Bill Cycle** — No way to group invoices into monthly cycles per utility. This is the foundation for everything else.
2. **0% parity on Customer Ledger** — No running balance, no audit trail. Invoicing without a ledger means no way to track outstanding amounts.
3. **0% on Projects** — The live system has EPower October as a key grouping dimension.
4. **Tariff Engine at 35%** — The `calculateTieredCharge` method is a starting point but lacks versioning, charge type enum, charge groups, and customer-group linking.
5. **Invoice Engine at 30%** — Can generate a single PDF but cannot do batch cycle-based generation, cancellation, or rebilling.
6. **Settlement Engine at 20%** — Can apply adjustments but cannot distinguish between the two settlement types used in SBill.
7. **Immediate blocker:** Without bill cycles and customer ledger, MV cannot functionally replace any SBill workflow.
