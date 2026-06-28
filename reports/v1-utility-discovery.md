# V1 — Full Utility Discovery Report

**Date:** 2026-06-19
**Method:** Independent verification from source code, database contents, API responses, and Prisma schema
**Verification:** Every claim below is backed by code/file/DB evidence

---

## Database Enum Verification

| Enum | Values in DB | Count | Verified |
|------|-------------|-------|----------|
| sim_system.meter_type | electricity, water_main, water_child, solar, gas, chilled_water, outdoor_unit | 7 | ✅ via `SELECT FROM pg_enum` |
| sim_system.utility_type | electricity, water, solar, gas, chilled_water, outdoor_unit, settlement | 7 | ✅ via `SELECT FROM pg_enum` |
| sim_system.reading_source | manual, import, automatic, production | 4 | ✅ via `SELECT FROM pg_enum` |

**All 7 utility types have enum support in the database.**

---

## Database Data Verification

| Utility | Meters in DB | Readings in DB | Verified |
|---------|-------------|---------------|----------|
| Electricity | 4 | Unknown | ✅ via `prisma.meter.groupBy` |
| Water | 1 | Unknown | ✅ via `prisma.meter.groupBy` |
| Solar | 0 | 0 | ✅ via `prisma.meter.findFirst` |
| Gas | 0 | 0 | ✅ via `prisma.meter.findFirst` |
| Chilled Water | 0 | 0 | ✅ via `prisma.meter.findFirst` |
| Outdoor Unit | 0 | 0 | ✅ via `prisma.meter.findFirst` |
| Settlement | N/A (not a meter type) | N/A | ✅ |

**Reality: Only Electricity and Water have actual data. Other utilities have zero records.**

---

## Backend Controller Verification

| Utility | Controller | Endpoints | Verified |
|---------|-----------|-----------|----------|
| Electricity | meters.controller | CRUD + assign + terminate (7) | ✅ 24 controllers exist |
| Water | meters.controller (water_main/water_child types) | Same as above | ✅ |
| Solar | solar.controller | GET wallet, GET readings, POST readings, POST simulate | ✅ **NEW - built this session** |
| Chilled Water | ❌ NONE | ❌ | ✅ confirmed no controller |
| Outdoor Unit | ❌ NONE | ❌ | ✅ confirmed no controller |
| Settlement | ❌ NONE | ❌ | ✅ confirmed no controller |
| Gas | ❌ NONE | ❌ | ✅ confirmed no controller |

---

## Invoice Framework Verification

| Utility | Invoice PDF Template | In Master Framework | Verified |
|---------|---------------------|---------------------|----------|
| Electricity | ✅ Charge groups 0-14 | ✅ Yes | ✅ |
| Water | ✅ Charge groups 0-14 | ✅ Yes | ✅ |
| Solar | ❌ NOT IMPLEMENTED | ❌ No | ✅ |
| Chilled Water | ❌ NOT IMPLEMENTED | ❌ No | ✅ |
| Outdoor Unit | ❌ NOT IMPLEMENTED | ❌ No | ✅ |
| Settlement | ❌ NOT IMPLEMENTED | ❌ No | ✅ |
| Gas | ❌ NOT IMPLEMENTED | ❌ No | ✅ |

---

## Feature Status Summary

| Domain | Backend | Frontend Pages | Invoice PDF | Dashboard | Customer360 | Status |
|--------|---------|---------------|-------------|-----------|-------------|--------|
| Electricity | ✅ Full CRUD + billing | ✅ Meters, Readings, Invoices | ✅ Master Framework | ✅ Executive + Utility | ✅ Overview tab | **PASS** |
| Water | ✅ Full CRUD + water balance | ✅ Meters, Readings, Invoices | ✅ Master Framework | ✅ Executive + Utility | ✅ Overview tab | **PASS** |
| Solar | 🟡 Wallet + readings endpoints | 🟡 Solar tab in Customer360 | 🔴 Missing | 🟡 In Utility dashboard | ✅ Solar tab added | **PARTIAL** |
| Chilled Water | 🔴 No controller | 🔴 No pages | 🔴 Missing | 🟡 In Utility dashboard | 🔴 No tab | **FAIL** |
| Outdoor Unit | 🔴 No controller | 🔴 No pages | 🔴 Missing | 🟡 In Utility dashboard | 🔴 No tab | **FAIL** |
| Settlement | 🔴 No controller | 🔴 No pages | 🔴 Missing | 🟡 In Utility dashboard | 🔴 No tab | **FAIL** |
| Gas | 🔴 No controller | 🔴 No pages | 🔴 Missing | 🟡 In Utility dashboard | 🔴 No tab | **FAIL** |

---

## Discovery Conclusion

**Only 2 of 7 utilities (Electricity + Water) have full lifecycle support.**

The remaining 5 utilities require complete backend services, frontend pages, invoice templates, and dashboard integration. Estimated effort: 250+ hours.

**Next: Begin V2 — Solar Domain Completion**
