# G1 — Data Readiness Audit

**Date**: 2026-06-19

## Field Verification
| Model | Field | Schema | Migration | DB | Status |
|-------|-------|--------|-----------|----|--------|
| Invoice | balanceBefore | ✅ | ✅ | ✅ | ✅ |
| Invoice | balanceAfter | ✅ | ✅ | ✅ | ✅ |
| Invoice | meterSerial | ✅ | ✅ | ✅ | ✅ |
| Invoice | consumptionValue | ✅ | ✅ | ✅ | ✅ |
| Invoice | billingPeriodCode | ✅ | ✅ | ✅ | ✅ |
| InvoiceLine | chargeGroup | ✅ | ✅ | ✅ | ✅ |
| Customer | nameAr | ✅ | ✅ | ✅ | ✅ |
| Customer | tenantName | ✅ | ✅ | ✅ | ✅ |
| Project | logo | ✅ | ✅ | ✅ | ✅ |
| Project | license | ✅ | ✅ | ✅ | ✅ |
| Project | signature | ✅ | ✅ | ✅ | ✅ |
| Project | bankDetails | ✅ | ✅ | ✅ | ✅ |
| Project | companyInfo | ✅ | ✅ | ✅ | ✅ |
| Meter | initialBalance | ✅ | ✅ | ✅ | ✅ |
| Meter | relayStatus | ✅ | ✅ | ✅ | ✅ |
| Meter | lastReadingDate | ✅ | ✅ | ✅ | ✅ |

**DATA_READY = YES** — All 16 SBill-required fields are in schema, migration, and database.
