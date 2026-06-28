# 05 — Feature Comparison: Target vs Current

## Legend
- 🟢 Done — fully implemented and working
- 🟡 Partial — implemented but has gaps (mock data, missing endpoints)
- 🔴 Missing — not implemented at all
- 📦 Draft — implemented but will be replaced/removed

## 1. Area Database Architecture

| Requirement | Target | Current | Status |
|------------|--------|---------|--------|
| Core schema (16 tables) | Created by T086 | Created, empty | 🟡 Needs data migration |
| Features schema (~36 tables) | Created by T087 | Created, empty | 🟡 Needs data migration |
| Area template (45 tables) | Created by T088 | Created, empty | 🟡 Needs replication |
| 15 per-area schemas | area_october → area_uvines_mall + 7 future | NOT CREATED | 🔴 T088 incomplete |
| Multi-schema Prisma | core + features + area_{n} | sim_system only | 🟡 Partially done |
| Area middleware for query scoping | AreaGuard exists | EXISTS | 🟢 Done |

## 2. Sync & Integration Tools

| Tool | Target | Current | Status |
|------|--------|---------|--------|
| Sync Meter (SEP2 hourly) | Poll SEP2 for meter inventory | NOT IMPLEMENTED | 🔴 Need SEP2 client |
| Sync Reading (40-min cron) | Fetch readings from SEP2 | NOT IMPLEMENTED | 🔴 Need cron job |
| Connect/Disconnect by Balance | SEP2 meter control | NOT IMPLEMENTED | 🔴 Need SEP2 commands |
| Symbiot Bridge (10 TCP × 100 HTTP) | Communication backbone | NOT IMPLEMENTED | 🔴 Planned only |

## 3. Solar Wallet

| Requirement | Target | Current | Status |
|-------------|--------|---------|--------|
| Solar meter type | MeterType includes 'solar' | Only electricity/water_main/water_child | 🔴 Missing |
| Solar production reading | Reading with type='production' | NOT IMPLEMENTED | 🔴 Missing |
| Net metering calc | consumption - production = net/surplus | NOT IMPLEMENTED | 🔴 Missing |
| Solar wallet balance | WalletAccount model exists in features | MODEL EXISTS, no service/API/UI | 🔴 Missing |
| Solar invoice generation | Generate solar invoices | 2,797 replayed in report, no engine | 🔴 Missing |
| Solar wallet UI page | Customer solar balance display | NOT IMPLEMENTED | 🔴 Missing |

## 4. Money Wallet & Customer Balance

| Requirement | Target | Current | Status |
|-------------|--------|---------|--------|
| currentBalance field | On Customer model | EXISTS | 🟢 Done |
| Real-time balance from ledger | SUM of all ledger entries | PARTIAL (basic calc exists) | 🟡 Needs ledger sync |
| Customer statement | Full financial statement | EXISTS (statement endpoint) | 🟢 Done |
| Money wallet (separate) | Wallet account with deposits/withdrawals | NOT IMPLEMENTED | 🔴 Missing |

## 5. Chilled Water

| Requirement | Target | Current | Status |
|-------------|--------|---------|--------|
| BTU meter type | MeterType includes 'chilled_water' | NOT IMPLEMENTED | 🔴 Missing |
| BTU reading | Reading with BTU unit | NOT IMPLEMENTED | 🔴 Missing |
| BTU consumption calc | Consumption in BTU | NOT IMPLEMENTED | 🔴 Missing |
| Chilled water invoice | Separate invoice type | NOT IMPLEMENTED | 🔴 Missing |
| Chilled water allocation | Cost allocation across units | NOT IMPLEMENTED | 🔴 Missing |

## 6. Billing & Invoicing

| Requirement | Target | Current | Status |
|-------------|--------|---------|--------|
| Invoice generation (electricity + water) | Flat-rate + consumption | PARTIAL | 🟡 Basic gen exists |
| Invoice PDF (Master Template) | Puppeteer HTML→PDF with RTL Arabic | EXISTS | 🟢 Done |
| Invoice lifecycle (draft→final→paid→overdue→cancelled) | Full state machine | PARTIAL | 🟡 Cancel exists, lifecycle not complete |
| Invoice immutability | After issue, no edits | EXISTS | 🟢 Done |
| Payment allocation (oldest-due-first) | Automatic + manual | EXISTS | 🟢 Done |
| Payment reversal | Super-admin only | EXISTS | 🟢 Done |

## 7. Collections

| Requirement | Target | Current | Status |
|-------------|--------|---------|--------|
| Collection dashboard KPIs | collectionRate, totals | EXISTS | 🟢 Done |
| Aging summary | Buckets: 0-30, 31-60, 61-90, 90+ | EXISTS | 🟢 Done |
| Payment receipt PDF | Downloadable receipt | EXISTS | 🟢 Done |
| Customer statement PDF | Downloadable statement | EXISTS | 🟢 Done |
| Collection tracker | Debt recovery workflow | NOT IMPLEMENTED | 🔴 Missing |

## 8. Reports

| Requirement | Target | Current | Status |
|-------------|--------|---------|--------|
| 32 report templates | From SBill reference | NOT IMPLEMENTED | 🔴 Mock flag |
| Report generation (async) | Background job | NOT IMPLEMENTED | 🔴 Missing |
| Export formats (CSV, PDF, ZIP) | Download framework | EXISTS (downloads controller) | 🟢 Done |
| Scheduled reports | Cron-based | NOT IMPLEMENTED | 🔴 Missing |

## 9. UI Pages

| Requirement | Target | Current | Status |
|-------------|--------|---------|--------|
| 32 frontend pages | All PageKeys rendered | 32/32 RENDERED | 🟢 Done |
| API-connected | No mock data | 26/32 FULLY, 3 PARTIAL, 3 MOCK | 🟢 81% done |
| i18n (Arabic/English) | 676 translation keys | EXISTS | 🟢 Done |
| Dark mode | Theme toggle | EXISTS | 🟢 Done |
| Global Search (CTRL+K) | 6 entity types | EXISTS | 🟢 Done |

## 10. Data Migration

| Requirement | Target | Current | Status |
|-------------|--------|---------|--------|
| Solar wallet data | 54 customers, 2,797 invoices, 963 payments | REPLAY ANALYSIS DONE, not coded | 🔴 Missing |
| Collection Tracker data | ~100K debt records | NOT MIGRATED | 🔴 Missing |
| SBill Palm Hills data | ~500K consumers, ~50M readings | NOT MIGRATED | 🔴 Missing |
| SBill Estates data | ~200K consumers, ~20M readings | NOT MIGRATED | 🔴 Missing |
| Migration scripts | ETL scripts referenced in plan | NOT CREATED | 🔴 Missing |
| migration_engine.py | Collection System SQLite→PostgreSQL | EXISTS (but limited) | 🟡 Partial |

## Summary

| Category | 🟢 Done | 🟡 Partial | 🔴 Missing |
|----------|---------|-----------|------------|
| Architecture | 1 | 4 | 3 |
| Sync Tools | 0 | 0 | 4 |
| Solar Wallet | 0 | 1 | 5 |
| Money/Balance | 2 | 1 | 1 |
| Chilled Water | 0 | 0 | 5 |
| Billing | 4 | 2 | 0 |
| Collections | 4 | 0 | 1 |
| Reports | 1 | 0 | 3 |
| UI Pages | 4 | 2 | 0 |
| Data Migration | 0 | 1 | 4 |
| **Total** | **16** | **11** | **26** |
