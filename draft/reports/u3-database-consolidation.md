# U3 — DATABASE CONSOLIDATION

**Date**: 2026-06-18
**Method**: Prisma schema analysis

## Schema Overview
| Schema | Tables | Purpose | Verdict |
|--------|--------|---------|---------|
| `sim_system` | 24 | Original MVP tables | **KEEP** (active) |
| `core` | 17 | Auth, RBAC, shared config | **KEEP** (active) |
| `features` | 36 | Billing, wallet, documents | **KEEP** (active, partial) |
| `area` | 42 | Per-area customer data | **KEEP** (active) |
| **Total** | **119** | | |

## Duplicate Table Patterns

| Concept | sim_system | area | Issue |
|---------|-----------|------|-------|
| Customer | `customers` (24 cols) | `customers` (17 cols) | DIFFERENT schemas — entities not linked |
| Invoice | `invoices` (24 cols) | `invoice_details` (14 cols) | Different field sets |
| Payment Allocation | `payment_allocations` | `payment_allocations` (area) | Different structures |
| Reading | `readings` | `meter_readings` (area) | area has auto-increment PK |
| Ledger Entry | `customer_ledger_entries` | `customer_ledger_entries` (area) | Different fields |

## Classification by Schema

| Schema | Classification | Rationale |
|--------|---------------|-----------|
| `sim_system` | **KEEP** | Active production schema with real data |
| `core` | **KEEP** | Auth/RBAC foundation — mandatory |
| `features` | **MERGE** into sim_system | Tariff, wallet, chilled water should move to sim_system |
| `area` | **KEEP** | Per-area isolation by design |
| SBill tables (36) | **REPLACE** | Business logic only, data will be migrated |
| Collection System (45) | **REPLACE** | Business logic only, data will be migrated |

## Migration History
- 12 migrations applied
- Latest: `20260617185351_area_db_template`
- Engine: `postgresql`

## Conclusion
Database architecture is sound. 119 tables across 4 schemas is appropriate for the multi-tenant design. No redundant tables within the current system. The features schema should be merged into sim_system for the next phase.
