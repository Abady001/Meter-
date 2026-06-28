# B7 — SBill Settings Audit vs Meter Verse
**Type:** INVESTIGATION — Full settings page enumeration  
**Method:** Manual audit of SBill settings menu against MV codebase

---

## Legend
| Icon | Meaning |
|------|---------|
| ✅ Fully Implemented | All functionality present |
| ⚠️ Partial Implementation | Some functionality, gaps remain |
| ❌ Missing | Not present in MV at all |
| 🔴 MISSING (CRITICAL) | Blocking functionality, must build |

---

## Settings Audit Table

| # | SBill Setting | SBill Capabilities | MV Equivalent | Status | Notes |
|---|--------------|-------------------|---------------|--------|-------|
| 1 | **Users** | Create/edit/delete users, assign roles, permissions, active/inactive | `Settings → Users` | ✅ **Partial** | Basic CRUD exists; missing role granularity, active/inactive toggle |
| 2 | **Projects** | Create projects (e.g. EPower October), assign customers | Not in settings UI | ⚠️ **Missing UI** | Project concept not exposed; may exist in DB |
| 3 | **Customer Groups** | Define groups, assign customers to groups, group-specific tariffs | Not implemented | ❌ **Missing** | No group entity, no group assignment |
| 4 | **Unit Types** | Define unit types (Apartment, Villa, Shop, etc.) | Not implemented | ❌ **Missing** | No unit type concept |
| 5 | **Unit Zones** | Define zones/areas, assign to meters | Not implemented | ❌ **Missing** | No zone entity |
| 6 | **Settlement Types** | Define settlement types (Tariff Diff / Consumption Settlement), amounts | Not implemented | ❌ **Missing** | No settlement type entity; adjustments are untagged |
| 7 | **Payment Centers** | Define payment collection centers, addresses, contact info | Not implemented | ❌ **Missing** | No payment center entity |
| 8 | **Bank Accounts** | Define bank accounts for payment reconciliation | Not implemented | ❌ **Missing** | No bank account entity |
| 9 | **POS Terminals** | Define POS terminal IDs for payment processing | Not implemented | ❌ **Missing** | No terminal concept |
| 10 | **General Settings** | System name, address, logo, tax rates, invoice footer, decimal precision, date format | `Settings → 7 tabs` | ⚠️ **Partial** | Basic system settings; missing tax config, decimal precision, invoice footer |
| 11 | **Tariff Settings** | Full tariff studio: types, versions, steps, charge groups, customer-group mapping | `Tariff Studio` | ✅ **Partial** | Tariff creation exists; missing charge type enum (STEPS/FLAT/STATIC/PER_UNIT/ZERO), missing versioning, missing customer-group mapping |
| 12 | **Billing Settings (Bill Cycle)** | Create monthly bill cycles per utility, set start/stop dates, auto-numbering, lock/unlock | Not implemented | 🔴 **MISSING (CRITICAL)** | No BillCycle entity, no UI, no batch processing. Foundation feature. |
| 13 | **Holiday Settings** | Define holidays for reading schedule adjustments | Not implemented | ❌ **Missing** | No holiday calendar |
| 14 | **Run Bill Cycle** | Execute billing: generate all invoices for a cycle, progress tracking, error log | Not implemented | 🔴 **MISSING (CRITICAL)** | No batch invoice generation, no execution engine |
| 15 | **Delete Readings** | Single reading deletion with audit trail | Not implemented | ❌ **Missing** | No delete with audit |
| 16 | **Delete Multi Readings** | Batch delete readings by date range, meter group, or cycle | Not implemented | ❌ **Missing** | No batch delete |
| 17 | **Charge Groups** | Define charge groups (CONSUMPTION, CUSTOMERCARE, ISSUE, TAX, ZERO) | Not as standalone setting | ❌ **Missing** | Charge groups exist implicitly in tariff but not as a configurable setting |
| 18 | **Tax Settings** | Define tax rates, tax codes, exemption rules | Not implemented | ❌ **Missing** | Tax is hardcoded at 14% |
| 19 | **Invoice Numbering** | Configurable invoice number format, auto-increment per cycle | Not implemented | ❌ **Missing** | No numbering configuration |
| 20 | **Audit Log** | Track all user actions, login history, data changes | Not implemented | ❌ **Missing** | No audit trail |
| 21 | **Email/SMS Config** | Configure email and SMS gateways for notifications | Not implemented | ❌ **Missing** | No notification configuration |
| 22 | **Backup Settings** | Configure backup schedule, retention, restore | Not implemented | ❌ **Missing** | No backup configuration |

---

## Summary

| Count | Category |
|-------|----------|
| 2 | ✅ Partial (Users, Tariff Studio) |
| 2 | ⚠️ Partial (General Settings, Projects) |
| 18 | ❌ Missing (including 2 🔴 CRITICAL) |

**CRITICAL MISSING SETTINGS** (blockers):
1. **Billing Settings (Bill Cycle)** — No way to define or manage billing cycles
2. **Run Bill Cycle** — No way to execute batch invoice generation

Without these two settings, MV cannot perform real billing operations.

---

## Build Priority

| Priority | Setting | Effort | Dependencies |
|----------|---------|--------|-------------|
| P0 | Billing Settings (Bill Cycle) | 3 weeks | None (new build) |
| P0 | Run Bill Cycle | 3 weeks | Billing Settings, Tariff Settings |
| P1 | Settlement Types | 1 week | None |
| P1 | Customer Groups | 1 week | None |
| P1 | Invoice Numbering | 3 days | Billing Settings |
| P2 | Users (permissions) | 1 week | Existing Users |
| P2 | Tax Settings | 3 days | None |
| P2 | Charge Groups | 3 days | Tariff Settings |
| P3 | Payment Centers, Banks, POS | 2 weeks | None |
| P3 | Unit Types, Unit Zones | 1 week | None |
| P3 | Holidays | 2 days | None |
| P4 | Email/SMS | 1 week | None |
| P4 | Audit Log | 2 weeks | Users |
| P4 | Backup Settings | 3 days | None |
| P4 | Delete Readings (single + multi) | 1 week | None |
