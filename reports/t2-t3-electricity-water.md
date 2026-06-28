# T2 + T3 — Electricity & Water Template Extraction

**Date**: 2026-06-18

## Shared Invoice Structure (Both Utilities)

### Data Sources
| SBill Table | Our Prisma Equivalent | Status |
|------------|----------------------|--------|
| `invoice` | `sim_system.invoice` | ✅ Exists |
| `customer` | `sim_system.customer` | ✅ Exists |
| `meter` | `sim_system.meter` | ✅ Exists |
| `tariff` | `sim_system.tariff_plan` | ⚠️ Partial |
| `location` | `sim_system.location_nodes` | ✅ Exists |
| `project` | `sim_system.project` | ✅ Exists |
| `invoice_details` | `sim_system.invoice_line` | ⚠️ Needs charge_group |
| `tariff_charges` | `features.tariff_charge` | ❌ No service layer |
| `tariff_charges_details` | `features.tariff_charge_detail` | ❌ No service layer |

### Charge Group System
| charge_group | SBill Name | Description | Our Equivalent |
|-------------|-----------|-------------|---------------|
| 0 | `Cons` | Consumption charges | `invoice_line` with reading data |
| 1 | `OTHER` / `ServiceFees` | Other fees | `invoice_adjustment` |
| 2,3 | `CS` | Customer service | Missing dedicated field |
| 4 | `Admin` / `SustainFees` | Admin fees | Missing dedicated field |
| 5 | `PERCENTAGE` | Percentage-based charges | Missing (water only) |
| 6 | `VAT` | Value-added tax | ⚠️ Uses `taxAmount` on invoice |
| 7 | `OTHER` (new) | Other (new version) | Missing |

### Key Fields Missing from Our Schema
| Field | SBill Table | Our Status | Needed For |
|-------|------------|-----------|------------|
| `charge_group` | `invoice_details` | ❌ Missing | Charge categorization |
| `balance_before` | `invoice` | ❌ Missing | Customer statement |
| `balance_after` | `invoice` | ❌ Missing | Customer statement |
| `project.logo` | `project` | ❌ Missing | Invoice branding |
| `project.license` | `project` | ❌ Missing | Invoice footer |
| `project.signature` | `project` | ❌ Missing | Invoice signature |
| `customer.name_ar` | `customer` | ❌ Missing | Arabic customer name |
| `customer.tenant_name` | `customer` | ❌ Missing | Tenant display |
| `location.unit_no` | `location` | ❌ Missing | Unit number on invoice |
| `meter.start_reading` | `reading` | ✅ Exists | Previous reading |
| `meter.end_reading` | `reading` | ✅ Exists | Current reading |
| `meter_serial` on invoice | `invoice` | ❌ Missing | Meter serial on invoice |

### Amount Format
All SBill amounts stored in **milliemes** (1 EGP = 1000 milliemes). Displayed dividing by 1000.

## Electricity Invoice Specifics
- Title: "فاتورة كهرباء"
- Unit: kWh
- Charge groups used: 0 (Cons), 1 (OTHER), 2,3 (CS), 4 (Admin)

## Water Invoice Specifics
- Title: "فاتورة مياة"
- Unit: m³
- Charge groups used: 0 (Cons), 1 (OTHER), 2,3 (CS), 4 (Admin), 5 (PERCENTAGE)
- New version adds: ServiceFees (1), SustainFees (4), VAT (6), OTHER (7)
