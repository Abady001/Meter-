# T17 — Implementation Roadmap

**Date**: 2026-06-18

## Phase Order
| Phase | Scope | Effort | Dependencies |
|-------|-------|--------|-------------|
| **P0** | Add `charge_group` to InvoiceLine, add `balance_before/after` to Invoice | 4h | Prisma migration |
| **P1** | Add `name_ar`, `tenant_name` to Customer; `unit_no` to Location; `logo`, `license`, `signature` to Project | 4h | Prisma migration |
| **P2** | Build CalculationEngine with charge groups (Cons, Admin, CS, Other, Percentage, VAT) | 8h | P0 |
| **P3** | Build SBill-matched invoice PDF templates (electricity + water) using Puppeteer | 12h | P0, P1, P2 |
| **P4** | Build payment receipt PDF | 6h | P0, P1 |
| **P5** | Build customer statement PDF (balance before/after) | 8h | P0, P1 |
| **P6** | Build monthly finance report | 8h | P2 |
| **P7** | Build collection/operational reports | 12h | P2 |
| **P8** | Build solar billing module | 16h | P3 |
| **P9** | Build chilled water billing module | 16h | P3 |
| **P10** | Build settlement billing module | 12h | P3 |
| **P11** | Build gas billing module | 12h | P3 |
| **P12** | Tariff engine with tiered rates (from tariff_charges_details) | 12h | P2 |

## Priority Matrix
| Priority | Item | Business Value | Effort |
|----------|------|---------------|--------|
| **P0** | Add charge groups + balance fields | Unlocks all invoice features | 4h |
| **P1** | Customer Arabic name fields | Required for SBill-matched invoices | 2h |
| **P2** | Charge-group based CalculationEngine | Core billing logic | 8h |
| **P3** | Electricity + Water PDF invoices | Visible output | 12h |
| **P4** | Payment receipt PDF | Cashier operations | 6h |
| **P8-P11** | Solar/Chilled/Settlement/Gas | New utility support | 56h |

## Total Estimated Effort: **~120 hours**
