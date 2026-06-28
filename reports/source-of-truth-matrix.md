# METER VERSE — SOURCE OF TRUTH MATRIX

**Date:** 2026-06-25
**Purpose:** Identify system ownership for every business object across Symbiot, Billing, and Meter Verse.

---

## CORE ENTITIES

| Entity | System Owner | Source Table(s) | Primary Key | Business Key | Update Freq | Sync Freq | Conflict Rule |
|--------|-------------|-----------------|-------------|--------------|-------------|-----------|---------------|
| **Customer** | Billing | customer | id | customer_code | Daily | Hourly | Billing wins |
| **Meter (Device)** | Symbiot 3.16/3.18 | Device, DeviceAttr | PkID | SystemTitle | Real-time | 15-min | Symbiot wins |
| **Meter Reading** | Symbiot | DeviceData | (DeviceFK, TimeStart) | DeviceFK+Time | 15-min | 15-min | Highest timestamp wins |
| **Invoice** | Meter Verse | sim_system.invoices | id | invoice_number | On create | N/A | Meter Verse wins |
| **Payment** | Meter Verse | sim_system.payments | id | payment_number | On create | N/A | Meter Verse wins |
| **Wallet** | Meter Verse | features.wallet_accounts | id | account_code | On create | N/A | Meter Verse wins |
| **Tariff** | Symbiot/Billing | Tariff/TarPrice | PkID | Tariff.Name | Monthly | Daily | Billing wins for rates |
| **Area** | Billing | area | id | area_code | Rare | Weekly | Billing wins |
| **Project** | Billing | project | id | project_code | Rare | Weekly | Billing wins |
| **Bill Cycle** | Meter Verse | features.billing_cycle | id | cycle_code | Monthly | N/A | Meter Verse wins |
| **Ledger** | Meter Verse | sim_system.customer_ledger_entries | id | customer_id+entry | On event | N/A | Meter Verse wins |

## SYSTEM OWNERSHIP MAP

```
┌─────────────────────┐      ┌────────────────────┐      ┌─────────────────────┐
│   SYMBIOT 3.16/3.18 │      │   LEGACY BILLING   │      │   METER VERSE       │
│   (Source of Truth) │      │   (Source of Truth) │      │   (System of Record)│
├─────────────────────┤      ├────────────────────┤      ├─────────────────────┤
│ ✓ Meter Device      │      │ ✓ Customer         │      │ ✓ Invoice           │
│ ✓ Meter Attributes  │      │ ✓ Area             │      │ ✓ Payment           │
│ ✓ Readings (BP/LP)  │      │ ✓ Project          │      │ ✓ Wallet            │
│ ✓ Device Events     │      │ ✓ Tariff Rates     │      │ ✓ Bill Cycle        │
│ ✓ Location/Area     │      │ ✓ User Accounts    │      │ ✓ Ledger            │
│ ─────────────────── │      │ ─────────────────── │      │ ✓ Report            │
│ READ ONLY           │      │ READ ONLY           │      │ ✓ KPI               │
│ Meter Verse NEVER   │      │ Meter Verse NEVER   │      │ ✓ Settings          │
│ writes here         │      │ writes here         │      │ ✓ Search Index      │
└─────────────────────┘      └────────────────────┘      └─────────────────────┘
         │                            │                            │
         └─────────────READ───────────┘─────────────WRITE──────────┘
                                              Synchronization Engine
                                              (Read from Symbiot + Billing
                                               Write to Meter Verse sync schema)
```

## CONFLICT RESOLUTION RULES

| Scenario | Rule | Because |
|----------|------|---------|
| Different meter serials | Symbiot wins | Physical meter is source of truth |
| Different customer name | Billing wins | Contract/legal document is source |
| Different tariff rate | Billing wins | Commercial agreement is source |
| Different invoice amount | Meter Verse wins | Calculated from consumption + tariff |
| Different reading value | Symbiot wins | Physical meter reading is source |
| Customer in Symbiot but not Billing | Hold, flag for investigation | Need human validation |
| Meter in Symbiot but not assigned | Hold, flag for assignment | Can't bill unassigned meter |
