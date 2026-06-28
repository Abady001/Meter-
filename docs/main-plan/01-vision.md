# 01 — Platform Vision

## Mission
Replace 3 legacy systems (SBill Palm Hills, SBill Estates, Collection System) with a single unified platform: **Meter Verse**.

## Coverage
- **5 utility types**: Electricity, Water, Solar, Chilled Water, Gas (planned)
- **15 areas**: october, new_cairo, sodic_ednc, sodic_estates, sodic_vye, badya_city, north_coast, uvines_mall + 7 future
- **~50,000 meters** across all areas
- **~500K consumers** from SBill PH, ~200K from SBill Estates, ~100K debt records from Collection Tracker

## Core Tools (from legacy systems)

| Tool | Source System | Description |
|------|-------------|-------------|
| Sync Meter | SBill | SEP2-based hourly meter inventory sync |
| Sync Reading | SBill | 40-minute cron reading fetch from SEP2 |
| Connect/Disconnect | SBill | Balance-based meter connect/disconnect via SEP2 |
| Solar Wallet | Collection System | Net metering: consumption - production = surplus/deficit |
| Solar Invoices | Collection System | 2,797 legacy invoices replayed, new gen engine needed |
| Money Wallet | Collection System | Customer monetary balance (currentBalance field) |
| Customer Balance | All | Real-time balance from append-only ledger |
| Chilled Water Billing | SBill | BTU meter type, BTU readings, rate config |
| Settlement Engine | SBill | 3 settlement types, approval workflow |
| Collection Dashboard | Collection System | Aging, KPIs, collection tracking |
| Customer Statement | Collection System | Full financial statement per customer |
| Payment Receipt | Collection System | PDF receipt with branding |
| 32 Reports | SBill | Async export jobs, CSV/XLSX/PDF |

## What We Are NOT Building
- Gas billing (future)
- AI/ML consumption prediction
- Separate mobile app (Energy 360 is separate reference)
- Alerts→Tickets automatic linkage
