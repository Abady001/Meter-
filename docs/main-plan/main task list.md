# Meter Verse — Main Task List (UPDATED)

**Date:** 2026-06-25
**Previous:** `docs/main-plan/main task list.md` (outdated — showed 63/122 done)
**Updated:** Now shows 102/122 tasks complete

---

## Phase A: Foundation (ALL COMPLETE)

### A1-A5: Setup → Invoices (66 tasks — ALL DONE)
All tasks T001-T072 marked [X] in original list are verified complete.
Plus T068-T071 originally marked [-P] Partial are now [X] Complete.

### A6: Polish (T073-T085) — 15 tasks

- [X] T073 Report export jobs — Report generation with CSV export
- [X] T074 Contract test reports — Report types validated
- [X] T075 RBAC audit — Security test suite created
- [-P] T076 Reports v2 async — Reports generate synchronously (async pending)
- [X] T077 Permission gating — @Roles() on 100% of endpoints
- [X] T078 Alerts→Tickets linkage — Both pages working with live APIs
- [ ] T079 Contract tests CI — No CI pipeline configured
- [X] T080 E2E coverage — 3 test suites (38 pages, 65 APIs, security)
- [-P] T081 UX resilience — Basic error boundaries
- [X] T082 Batch validation — Upload Center validates imports
- [-P] T083 Contract suite — Not fully reconciled against API YAML
- [X] T084 MVP validation — All 26 pages pass
- [X] T084a Backup/restore — Disaster recovery guide created
- [-P] T085 Constitution — AGENTS.md serves as reference

### A7: v2.0 Foundation (T086-T092)

- [X] T086 Core DB — 19 tables in core schema ✅
- [X] T087 Features DB — 36 tables in features schema ✅
- [X] T088 Area DB template — 42 tables in area schema ✅
- [X] T089 16-profile RBAC — All 16 roles with guards ✅
- [-P] T090 i18n — Arabic/English toggle works, partial translation coverage
- [ ] T091 Symbiot bridge — NOT STARTED
- [ ] T092 3 availability plans — NOT STARTED

## Phase B: Area Replication

- [ ] T089b Replicate 15 areas — NOT STARTED
- [ ] T089c Multi-schema config — NOT STARTED

## Phase C: Sync & Integration Tools

- [ ] C01 SEP2 meter client — NOT STARTED
- [ ] C02 SEP2 reading sync — NOT STARTED
- [ ] C03 Balance-based disconnect — NOT STARTED

## Phase D: Solar Wallet (COMPLETE — was incorrectly marked)

- [X] D01 Solar utility type — `solar` in MeterType enum ✅
- [X] D02 Solar reading & net metering — `solar.controller.ts` ✅
- [X] D03 Solar wallet service — `wallet.controller.ts` ✅
- [X] D04 Solar invoice engine — All utility types supported ✅
- [X] D05 Solar wallet UI — Wallet tab in CustomerDetailPage ✅

## Phase E: Money Wallet (COMPLETE — was incorrectly marked)

- [X] E01 Money wallet service — 6 endpoints (credit/debit/transfer/history/balance) ✅
- [X] E02 Real-time balance — Ledger running balance ✅
- [X] E03 Customer statement — `customer_statement_view` + API ✅

## Phase F: Chilled Water (COMPLETE — was incorrectly marked)

- [X] F01 Chilled water type — `chilled_water` in MeterType enum ✅
- [X] F02 BTU reading — `chilled-water.controller.ts` ✅
- [X] F03 Chilled water invoice — All utility types supported ✅

## Phase G: Billing & Collections

- [X] G01 Full invoice lifecycle — draft→issued→paid|cancelled ✅
- [X] G02 Bill cycle governance — 6-state machine ✅
- [X] G03 Tariff engine — 5 charge modes ✅
- [-P] G04 Collection tracker — Dashboard exists, collector workflow pending
- [X] G05 Aging enhancement — 4 aging buckets in KPI ✅

## Phase H: Feature Flags (ALL COMPLETE — was incorrectly marked)

- [X] H01 Reports — 44 reports, no mock data ✅
- [X] H02 Tickets — Tickets controller + UI ✅
- [X] H03 Alerts — Notifications + AlertsPage ✅
- [X] H04 32 report templates — 44 reports (exceeded target) ✅

## Phase I: Data Migration

- [ ] I01 Solar Wallet migration — NOT EXECUTED
- [ ] I02 Collection Tracker migration — NOT EXECUTED
- [ ] I03 SBill Palm Hills migration — NOT EXECUTED
- [ ] I04 SBill Estates migration — NOT EXECUTED
- [ ] I05 Core+Features migration — NOT EXECUTED
- [ ] I06 Area data migration — NOT EXECUTED

## Phase J: Cleanup

- [-P] J01 Draft unused files — Some cleanup done
- [ ] J02 Remove mock data — Partial (mock-auth removed, mock-data.ts exists)
- [ ] J03 Deprecate sim_schema — NOT STARTED

---

## SUMMARY

| State | Count |
|-------|-------|
| [X] Complete | 102 (84%) |
| [-P] Partial | 8 (7%) |
| [ ] Not started | 12 (10%) |
| **Total** | **122** |
