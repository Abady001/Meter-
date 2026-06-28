# EPCP — Wireframes & Flows

**Date**: 2026-06-19

## Customer 360 Wireframe

```
┌──────────────────────────────────────────────────────────────┐
│  Back ←  Customer: {name}          Status: {badge}  [Edit]  │
├──────────────────────────────────────────────────────────────┤
│ ┌─ Balance Card ─┐ ┌─ Consumption ─┐ ┌─ Meters ─┐ ┌─ Aging ┐│
│ │ Outstanding    │ │ This Month    │ │ Active   │ │ 0-30   ││
│ │ EGP 12,500    │ │ 450 kWh       │ │ 2        │ │ 5,000  ││
│ │ Last Payment  │ │ Trend ↗       │ │ Total 3  │ │ 31-60  ││
│ │ 20 Jun 2026   │ │               │ │          │ │ 3,200  ││
│ └───────────────┘ └───────────────┘ └──────────┘ └─────────┘│
├──────────────────────────────────────────────────────────────┤
│ [Overview] [Units] [Meters] [Invoices] [Payments] [Tickets]  │
├──────────────────────────────────────────────────────────────┤
│ Tab Content Area                                             │
│                                                              │
│ Invoices: INV-001 (issued) → INV-002 (paid) → ...            │
│ Payments: PAY-001 (cash) → PAY-002 (transfer) → ...          │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

## Upload Center Flow
```
User clicks "Upload Center" in sidebar
  → Selects entity type (Customers/Meters/Readings/etc)
  → Downloads template (XLSX/CSV)
  → Fills data offline
  → Uploads file
  → Validation preview shows errors/warnings
  → Confirms import
  → Import runs (async)
  → Notification sent on completion
  → History tab shows all imports with rollback option
```

## Tariff Studio Flow
```
User opens Tariff Studio
  → Selects utility type (Electricity/Water/etc)
  → Creates/edits tariff header
  → Adds charges:
      1. Select charge type (FLAT/PER_UNIT/STEPS/STATIC/ZERO)
      2. Set charge group (0-14)
      3. Set rate/amount
      4. For STEPS: add tiers with from/to/rate
  → Validates non-overlap
  → Saves with version history
  → Simulation shows impact on sample consumption
```

## Database Admin Flow
```
User opens Database Admin (SYSTEM_ADMIN only)
  → Views table list (read-only by default)
  → Clicks table → sees schema + data preview
  → Views audit logs, job queue, import history
  → Health dashboard shows: DB status, migration status, index status
  → No destructive actions without confirmation
```

## Dashboard Layout Map
```
Page: /dashboard (Overview) — existing, preserved
  ├── KPI Row: Customers, Meters, Offline, Consumption, Alerts, Invoices, Collection Rate, Outstanding
  ├── Chart Row: Consumption (Area), Revenue (Bar), Meter Status (Pie)
  └── Row: Alert Summary, Recent Activity

Page: /executive-dashboard — NEW
  ├── KPI Row: Collection Rate, Outstanding, Monthly Collections, Today
  ├── Charts: Aging Summary, Meter Health
  └── (expandable with Revenue, Customer, Utility charts)

Page: /collections/dashboard — existing, enhanced
  ├── KPI Row: Collection Rate, Total Collected, Outstanding, Overdue
  ├── Charts: Collection Trend, Aging, Top Debtors
  └── Table: Collector Performance, Area Performance
```

## Effort Summary
| E-Phase | Component | Pages | Effort |
|---------|-----------|-------|--------|
| E1 | Dashboard Transformation | 4 new pages | 16h |
| E2 | Global Search Center | 1 component | 8h |
| E3 | Upload Center | 1 page + flow | 12h |
| E4 | Customer 360 | 1 detail page | 8h |
| E5 | Project 360 | 1 detail page | 8h |
| E6 | Tariff Studio | 1 page | 16h |
| E7 | Database Admin | 1 page | 8h |
| E8 | Odoo Analytics | 1 page | 4h |
| E9 | Kashier Analytics | 1 page | 4h |
| E10 | SBill Reports | 44 reports | 40h |
| E11 | Utility Consolidation | 7 pages | 8h |
| E12 | Production Audit | — | 8h |
| | **Total** | **~60 items** | **~140h** |
