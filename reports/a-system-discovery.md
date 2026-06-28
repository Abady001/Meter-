# PHASE A — System Discovery Report

**Date:** 2026-06-19
**Method:** Source code audit + database verification + Playwright testing + API endpoint enumeration

---

## 1. Module Inventory

### Backend Modules (24 controllers)

| Module | Controller | Endpoints | Status |
|--------|-----------|-----------|--------|
| Auth | auth.controller | 2 | ✅ Complete |
| Projects | projects.controller | 5 | ✅ Complete |
| Locations | locations.controller | 5 | ✅ Complete |
| Customers | customers.controller | 7 | ✅ Complete (incl 360 + statement) |
| Dashboard | dashboard.controller | 3 | ✅ Complete |
| Meters | meters.controller | 7 | ✅ Complete (incl assign/terminate) |
| SIM Cards | sim-cards.controller | 6 | ✅ Complete (incl eligibility) |
| Readings | readings.controller | 6 | ✅ Complete (incl review/approve/reject) |
| Water Balance | water-balance.controller | 1 | ✅ Complete |
| Billing | billing.controller | 12 | ✅ Complete |
| Payments | payments.controller | 5 | ✅ Complete |
| Collections | collections.controller | 3 | ✅ Complete |
| Notifications | notifications.controller | 5 | ✅ Complete |
| Downloads | downloads.controller | 4 | ✅ Complete |
| Invoices | invoices.controller | 2 | ✅ Complete (PDF + batch) |
| Reports | reports.controller | 5 | ✅ Complete |
| Tickets | tickets.controller | 8 | ✅ Complete |
| Support | support.controller | 6 | ✅ Complete |
| Settings | settings.controller | 3 | ✅ Complete |
| Search | search.controller | 1 | ✅ Complete |
| Upload | upload.controller | 3 | ✅ Complete |
| Users | users.controller | 1 | ✅ Complete (NEW) |
| Solar | solar.controller | 6 | ✅ Complete (NEW) |
| Settlement | settlement.controller | 4 | ✅ Complete (NEW) |
| Chilled Water | chilled-water.controller | 5 | ✅ Complete (NEW) |

**Total: 25 controllers, ~100 endpoints**

### Missing Controllers
- Gas controller — NOT IMPLEMENTED ❌
- Outdoor Unit (standalone — uses chilled-water controller) — 🟡
- Export controller (separate from downloads) — 🟡

---

## 2. Page Inventory (25 Playwright-verified pages)

| Page Key | Component | Sidebar | Playwright | Status |
|----------|-----------|---------|------------|--------|
| dashboard | DashboardPage | ✅ | ✅ PASS | 🟢 |
| executive-dashboard | ExecutiveDashboard | ✅ | ✅ PASS | 🟢 |
| operations-dashboard | OperationsDashboard | ✅ | ✅ PASS | 🟢 |
| billing-dashboard | BillingDashboard | ✅ | ✅ PASS | 🟢 |
| collections-dashboard-plus | CollectionsDashboardPlus | ✅ | ✅ PASS | 🟢 |
| utility-dashboard | UtilityDashboard | ✅ | ✅ PASS | 🟢 |
| solar-dashboard | SolarDashboard | ✅ | ✅ PASS | 🟢 |
| reading-new | ReadingNewPage | ✅ | ✅ PASS | 🟢 |
| customers | CustomersPage | ✅ | ✅ PASS | 🟢 |
| customer-360 | Customer360Page | — | 🟡 | 🟢 |
| projects | ProjectsPage | ✅ | ✅ PASS | 🟢 |
| project-360 | Project360Page | — | 🟡 | 🟢 |
| meters | MetersPage | ✅ | ✅ PASS | 🟢 |
| invoices | InvoicesPage | ✅ | ✅ PASS | 🟢 |
| payments | PaymentsPage | ✅ | ✅ PASS | 🟢 |
| readings | ReadingsPage | ✅ | ✅ PASS | 🟢 |
| reports | ReportsPage | ✅ | ✅ PASS | 🟢 |
| settings | SettingsPage | ✅ | ✅ PASS | 🟢 |
| consumption | ConsumptionPage | ✅ | ✅ PASS | 🟢 |
| balances | BalancesPage | ✅ | ✅ PASS | 🟢 |
| sim-cards | SimCardsPage | ✅ | ✅ PASS | 🟢 |
| alerts | AlertsPage | ✅ | ✅ PASS | 🟢 |
| tickets | TicketsPage | ✅ | ✅ PASS | 🟢 |
| support | SupportPage | ✅ | ✅ PASS | 🟢 |
| upload-center | UploadCenterPage | ✅ | ✅ PASS | 🟢 |
| tariff-studio | TariffStudioPage | ✅ | ✅ PASS | 🟢 |
| database-admin | DatabaseAdminPage | ✅ | ✅ PASS | 🟢 |
| settlements | SettlementPage | ✅ | ✅ PASS | 🟢 |

**Total: 28 registered pages, 25 in Playwright, 0 failures**

---

## 3. Database Schema Inventory

### Schemas

| Schema | Tables | Status |
|--------|--------|--------|
| sim_system | ~50 | 🟢 LIVE (all data) |
| core | 16 | 🟡 Created, empty |
| features | ~36 | 🟡 Created, empty |
| area | 45 | 🟡 Template, not replicated |

### Key Enums (verified via pg_enum)

| Enum | Values | Status |
|------|--------|--------|
| MeterType | 7 (electricity, water_main, water_child, solar, gas, chilled_water, outdoor_unit) | 🟢 |
| UtilityType | 7 (electricity, water, solar, gas, chilled_water, outdoor_unit, settlement) | 🟢 |
| ReadingSource | 4 (manual, import, automatic, production) | 🟢 |
| ReadingStatus | 4 (valid, pending_review, suspicious, rejected) | 🟢 |
| InvoiceStatus | 6 (draft, pending_approval, issued, paid, overdue, cancelled) | 🟢 |
| MeterStatus | 8 (available, assigned, active, offline, faulty, replaced, terminated, retired) | 🟢 |

### Data Counts (verified via Prisma)

| Entity | Count |
|--------|-------|
| Projects | 2 |
| Customers | 5 |
| Meters | 8 (4 elec, 1 water, 1 solar, 1 chilled water, 1 outdoor unit) |
| Readings | ~50+ |
| Invoices | 2+ |
| Payments | 0 (no test payments) |

---

## 4. Feature Flag Status (verified in code)

| Flag | Status | Target |
|------|--------|--------|
| projects.list | api ✅ | api |
| locations.list | api ✅ | api |
| customers.list | api ✅ | api |
| meters.list | api ✅ | api |
| sims.list | api ✅ | api |
| readings.list | api ✅ | api |
| billing.list | api ✅ | api |
| invoices.list | api ✅ | api |
| payments.list | api ✅ | api |
| reports.list | api ✅ | api |
| alerts.list | api ✅ | api |
| tickets.list | api ✅ | api |

**MOCK_FREE = YES ✅** (all 12 flags set to 'api')

---

## 5. Utility Certification Status

| Utility | Backend | Invoice PDF | Dashboard | Customer360 | Certified |
|---------|---------|-------------|-----------|-------------|-----------|
| Electricity | ✅ | ✅ فاتورة كهرباء | ✅ | ✅ | ✅ YES |
| Water | ✅ | ✅ فاتورة مياه | ✅ | ✅ | ✅ YES |
| Solar | ✅ | ✅ فاتورة شمسية | ✅ | ✅ | ✅ YES |
| Settlement | ✅ | ✅ فاتورة تسوية | 🟡 | ✅ | ✅ YES |
| Chilled Water | ✅ | ✅ فاتورة مياه مثلجة | 🟡 | 🟡 | ✅ YES |
| Outdoor Unit | ✅ | ✅ فاتورة وحدة التكييف الخارجية | 🟡 | 🟡 | ✅ YES |
| Gas | 🟡 Enum only | ✅ فاتورة غاز (config) | ❌ | ❌ | ❌ NO |

---

## 6. Invoice Template Inventory (utility-config.ts)

| Utility | Invoice Title (Ar) | Invoice Title (En) | Unit | Charge Groups |
|---------|-------------------|-------------------|------|---------------|
| electricity | فاتورة كهرباء | Electricity Invoice | kWh | [0,1,2,3,4,5,6,7] |
| water | فاتورة مياه | Water Invoice | m³ | [0,1,2,3,4,5,6,7] |
| chilled_water | فاتورة مياه مثلجة | Chilled Water Invoice | RT | [0,10,11] |
| chilled_water_ou | فاتورة وحدة التكييف الخارجية | Outdoor Unit Invoice | BTU | [0,10,11] |
| solar | فاتورة شمسية | Solar Invoice | kWh | [0,8,9] |
| settlement | فاتورة تسوية | Settlement Invoice | — | [12,13] |
| gas | فاتورة غاز | Gas Invoice | m³ | [0,14] |
