# 06 — Unified Task List

**Continues from T089+ with all consolidation work added**

## Priority Legend
- **P0** — Must have (system breaks without it)
- **P1** — Core business feature
- **P2** — Important but can wait
- **P3** — Nice to have

---

## PHASE A: Foundation & Schema (T086-T092)

### T086 — Core DB Schema ✅ DONE
Core database with 15 tables: users, roles, permissions, areas, projects, audit, config.

### T087 — Features DB Schema ✅ DONE
Features database with ~36 tables: tariffs, reports, wallets, settlements, billing cycles.

### T088 — Area DB Template ✅ DONE
Area database template with 45 tables. Template schema `area` exists.

### T089 — Replicate Area Template ×15 🔴 P0
**Action:** Clone `area` template schema into 15 per-area schemas
- Create migration SQL: `CREATE SCHEMA area_october; ... area_new_cairo; ...`
- Run template DDL for each area
- Update Prisma schema for multi-schema (core, features, area_october, ...)
- Verify all 45 tables exist in each area schema
- **Files:** `backend/prisma/migrations/YYYYMMDDHHMMSS_area_replication/`

### T090 — Multi-Schema Prisma Config 🟡 P1
- Configure @@schema() for each model
- Create Prisma client factory per schema
- Add area routing middleware in NestJS

### T091 — Area Middleware & Query Scoping 🟡 P1
- AreaGuard already exists — verify it works with multi-schema
- Add area resolution from JWT/user profile
- Scope all area queries to correct schema

### T092 — 3 Availability Plans 🟡 P2
- Module selection at startup (Full/Safety/Failover)
- Safety: disable billing features, read-only area DBs
- Failover: serve from Core DB cache only

---

## PHASE B: Sync & Integration Tools (NEW)

### B01 — SEP2 Meter Client 🔴 P0
**Reference:** `reference/sbill/PROJECT_ANALYSIS/architecture/sync-architecture.md`
- Create SEP2 API client module
- Implement hourly meter inventory sync
- Map SEP2 meter data → Meter Verse area schema
- Store last sync timestamp

### B02 — SEP2 Reading Sync 🔴 P0
**Reference:** `reference/sbill/PROJECT_ANALYSIS/synchronization-analysis.md`
- Create 40-minute cron job for reading fetch
- Parse SEP2 reading response → MeterVerse Reading format
- Handle duplicates, gaps, validation
- Push to reading review queue for flagged readings

### B03 — Balance-Based Connect/Disconnect 🔴 P1
**Reference:** `reference/sbill/PROJECT_ANALYSIS/architecture/backend-architecture.md`
- Check customer balance before billing cycle
- If balance < threshold → SEP2 disconnect command
- Reconnect on payment received
- Audit log all connect/disconnect actions

### B04 — Symbiot Bridge 🔴 P3
**Reference:** `specs/003-symbiot-integration/`
- 10 TCP channels (ports 5010-5019)
- 100 HTTP routes for query routing
- Centralized + per-area deployment modes

---

## PHASE C: Solar Wallet (NEW — from Collection System)

### C01 — Solar Utility Type 🔴 P0
**Reference:** `reference/collection-system/app/routes_transactions.py`, `charge_engine.py`
- Add 'solar' to MeterType enum
- Add 'production' to ReadingSource enum
- Create solar-specific Prisma models (or use existing features.WalletAccount)
- Migration for new fields

### C02 — Solar Reading & Net Metering 🔴 P0
**Reference:** `reports/solar-wallet-replay-report.md`
- Solar production reading endpoint
- Net metering calculation: consumption = reading_180 - previous_180, production = reading_280 - previous_280
- Net = max(consumption - production, 0), Surplus = max(production - consumption, 0) → solar_balance
- 13-tier electricity tariff application

### C03 — Solar Wallet Service 🔴 P1
**Reference:** `reference/collection-system/app/charge_engine.py`
- WalletAccount CRUD in features schema
- WalletTransaction (deposit/withdraw from solar surplus)
- WalletBalance snapshot
- Solar wallet statement endpoint

### C04 — Solar Invoice Engine 🔴 P1
**Reference:** `reports/a1-solar-minimum-charge-decision.md`
- Solar invoice generation from net consumption
- Minimum charge logic (11 EGP service fee)
- 2,797 legacy solar invoices — migration script
- Solar invoice PDF template (7th utility type)

### C05 — Solar Wallet UI 🔴 P2
- Customer solar balance display in Customer360
- Solar wallet page with transaction history
- Solar invoice in invoice list
- Solar-specific charts (production vs consumption)

---

## PHASE D: Money Wallet & Customer Balance (NEW)

### D01 — Money Wallet Service 🔴 P1
**Reference:** `reference/collection-system/docs/specs/COLLECTION_SYSTEM_GAP_ANALYSIS.md`
- Money wallet account per customer
- Deposit/withdraw/transfer endpoints
- Wallet transaction history
- Link to payment system

### D02 — Real-Time Customer Balance 🔴 P1
- CurrentBalance field on Customer model (exists)
- Recalculate balance on every invoice/payment/ledger event
- Balance trigger/event system
- Balance UI in customer detail (exists — wire to real data)

### D03 — Customer Statement Engine 🔴 P1
**Reference:** `reference/sbill/migration-plan/14-shared-ledger-strategy.md`
- Append-only ledger entries
- Opening balance migration from SBill
- Running balance computation
- Statement PDF download (exists — verify)

---

## PHASE E: Chilled Water Billing (NEW)

### E01 — Chilled Water Utility Type 🔴 P2
- Add 'chilled_water' to MeterType enum
- BTU reading type
- Features.ChilledWaterConfig service

### E02 — BTU Reading & Consumption 🔴 P2
- BTU reading endpoint
- Consumption = BTU_delta × rate
- Cost allocation across units

### E03 — Chilled Water Invoice 🔴 P2
- Chilled water invoice generation
- Invoice PDF template

---

## PHASE F: Billing & Invoicing Completion

### F01 — Full Invoice Lifecycle 🟡 P1
- Complete state machine: draft → final → issued → paid | overdue | cancelled → replaced
- Invoice cancellation with reason (exists)
- Invoice replacement (credit note + new invoice)
- Invoice adjustment with approval (exists)

### F02 — Billing Cycle Governance 🟡 P1
**Reference:** `reference/sbill/PROJECT_ANALYSIS/architecture/backend-architecture.md`
- OPEN → CLOSE → CANCEL with approval workflow
- Duplicate invoice prevention
- Batch invoice generation with progress tracking

### F03 — Tariff Engine Enhancement 🟡 P1
**Reference:** `reference/collection-system/app/charge_engine.py`
- Multi-tier tariffs (13-tier electricity)
- Time-of-use rates
- Minimum charge rules
- Service fee handling (36.10 → 9.10 → 11 EGP)

---

## PHASE G: Collections Completion

### G01 — Collection Tracker 🔴 P1
**Reference:** `reference/collection-system/docs/specs/`
- Debt recovery workflow
- Collection actions per customer
- Promise-to-pay tracking
- Collection agent assignment

### G02 — Aging & Dashboard Enhancement 🟡 P2
- Add collection rate targets
- Aging trend charts
- Collector performance KPIs

---

## PHASE H: Reports & Alerts

### H01 — Wire Reports to API 🟡 P0 (switch feature flag)
- Feature flag: reports → 'api' (currently 'mock')
- Verify all /reports endpoints work
- Report template CRUD
- Report generation with async export

### H02 — Wire Tickets to API 🟡 P0 (switch feature flag)
- Feature flag: tickets → 'api' (currently 'mock')
- Verify /tickets endpoints
- Ticket comments, status workflow

### H03 — Wire Alerts to API 🟡 P0 (switch feature flag)
- Create alerts endpoint or use notification system
- Alert severity levels (critical, high, medium, low)
- Real-time alerts via notifications

### H04 — 32 Report Templates 🔴 P2
**Reference:** `reference/sbill/PROJECT_ANALYSIS/architecture/reporting-architecture.md`
- Port 32 SBill report templates
- CSV / XLSX / PDF export formats
- Scheduled report delivery

---

## PHASE I: Data Migration

### I01 — Solar Wallet Migration 🔴 P1
**Reference:** `specs/004-migration-plans/plan.md` (Day 1)
- ETL script: wallets, transactions, balances
- Verify 54 customers, 2,797 invoices, 963 payments
- Running balance verification

### I02 — Collection Tracker Migration 🔴 P1
**Reference:** `specs/004-migration-plans/plan.md` (Day 2)
- ETL script: debt records, collection actions
- Map to area schemas
- Verify ~100K records

### I03 — SBill Palm Hills Migration 🔴 P1
**Reference:** `specs/004-migration-plans/plan.md` (Day 3-4)
- ETL: consumers, meters, readings, invoices, payments
- ~500K consumers, ~50M readings
- Batch insert (10K per batch)
- Checksum verification

### I04 — SBill Estates Migration 🔴 P1
**Reference:** `specs/004-migration-plans/plan.md` (Day 4)
- Same as I03 for Estates data
- ~200K consumers, ~20M readings

### I05 — Core + Features Data Migration 🟡 P1
- Move sim_system users → core.CoreUser
- Move sim_system projects → core.CoreProject
- Move sim_system tariffs → features.TariffPlan
- Move sim_system settings → core.CoreSystemConfig

### I06 — Area Data Migration 🟡 P1
- Move sim_system customers → area_{n}.Customer
- Move sim_system meters → area_{n}.CustomerMeter
- Move sim_system readings → area_{n}.MeterReading
- Move sim_system invoices → area_{n}.InvoiceDetail
- Move sim_system payments → area_{n}.Transaction

---

## PHASE J: Cleanup & Restructure

### J01 — Draft Unused Files 📦 P1
See `08-draft-inventory.md` for full list.

### J02 — Remove Mock Data 📦 P1
- Delete mock-data.ts after all features wired
- Delete mock-auth.ts after real auth finalized
- Remove feature-flags.ts after all flags = 'api'

### J03 — Deprecate sim_schema 📦 P2
- After all data migrated, drop sim_system tables
- Keep as archive schema for 30 days

---

## Progress Summary

| Phase | Tasks | Status |
|-------|-------|--------|
| A: Foundation (T086-T092) | 7 tasks | 3 DONE, 4 TODO |
| B: Sync & Integration | 4 tasks | 0 DONE, 4 TODO |
| C: Solar Wallet | 5 tasks | 0 DONE, 5 TODO |
| D: Money Wallet | 3 tasks | 0 DONE, 3 TODO |
| E: Chilled Water | 3 tasks | 0 DONE, 3 TODO |
| F: Billing Complete | 3 tasks | 0 DONE, 3 TODO |
| G: Collections | 2 tasks | 0 DONE, 2 TODO |
| H: Reports & Alerts | 4 tasks | 0 DONE, 4 TODO |
| I: Data Migration | 6 tasks | 0 DONE, 6 TODO |
| J: Cleanup | 3 tasks | 0 DONE, 3 TODO |
| **Total** | **40 tasks** | **3 DONE, 37 TODO** |
