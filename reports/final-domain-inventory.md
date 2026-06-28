# Final Domain Inventory

**Date**: 2026-06-18
**System**: Meter Verse / عالم العدادات

## Domain Status Matrix

| Domain | Existing | Partial | Missing | Details |
|--------|----------|---------|---------|---------|
| **Customers** | ✅ Full CRUD | — | — | Create, read, update, delete, statement API working |
| **Projects** | ✅ Full CRUD | — | — | Create dialog, edit, delete, detail page all working |
| **Properties** | ⚠️ — | ✅ Locations | — | Locations handled through LocationNodes; no dedicated Properties page |
| **Units** | ⚠️ — | ✅ Part of locations | — | Units are LocationNode with nodeType='unit'; no dedicated Units list page |
| **Meters** | ✅ Full lifecycle | — | — | Create, assign, replace, terminate, detail all working |
| **Readings** | ✅ Full workflow | — | — | Create, list, review queue, approve, reject all working |
| **Tariffs** | ⚠️ — | ✅ Simple flat rate | ❌ Advanced tariff engine | TariffPlan CRUD works; multi-charge, tiers, percentage not implemented |
| **Billing** | ⚠️ — | ✅ Generation + Issue | ❌ Full lifecycle | Generate (fixed), Issue (wired), Cancel (endpoint exists), Adjust (endpoint exists) — frontend buttons not wired |
| **Invoices** | ⚠️ — | ✅ List + Detail | ❌ Download + Edit | PDF/CSV downloads work; edit frontend button not wired |
| **Payments** | ⚠️ — | ✅ List + Record | ❌ Reverse + Edit | Record payment dialog wired; reverse endpoint exists; edit/delete frontend not wired |
| **Collections** | ❌ — | — | ❌ Full module | No collections dashboard, aging reports, campaign tracking |
| **Notifications** | ✅ Complete | — | — | Bell dropdown, unread count, mark read, auto-generated events all working |
| **Reports** | ⚠️ — | ✅ List from API | ❌ Generation + Export | Report templates listed; CSV/XLSX/Preview buttons still toast-only |
| **Exports** | ⚠️ — | ✅ PDF + CSV | ❌ Batch + Excel | Invoice PDF/CSV work; generic table PDF/CSV endpoints exist; no full export framework |
| **Templates** | ❌ — | — | ❌ 44 SBill templates | Templates reverse-engineered but not implemented |
| **RBAC** | ✅ Complete | — | — | 16 profiles, GlobalAuthGuard, AreaGuard, PermissionsGuard |
| **Audit Logs** | ✅ Global interceptor | — | — | AuditService captures all POST/PUT/PATCH/DELETE with hash chain |
| **Dashboard** | ⚠️ — | ✅ API-driven KPIs | ❌ Full widget set | KPI cards use real data; consumption/revenue charts limited by data availability |
| **Settings** | ⚠️ — | ✅ API persistence | ❌ All 8 tabs | General, Reading, Notifications, Theme tabs work via settings API; tariff/billing/collection tabs are template-only |
| **Support** | ⚠️ — | ✅ CRUD API | ❌ Full workflow | Create/list/update support requests work; frontend wired |
| **Tickets** | ⚠️ — | ✅ CRUD API | ❌ Full workflow | Create/list/update/kanban work; frontend wired |

## Summary
| Classification | Count |
|---------------|-------|
| ✅ Complete | 6 (Customers, Projects, Meters, Readings, Notifications, RBAC) |
| ⚠️ Partial | 11 (Properties, Units, Tariffs, Billing, Invoices, Payments, Reports, Exports, Dashboard, Settings, Tickets, Support) |
| ❌ Missing | 3 (Collections, Templates, full export framework) |
