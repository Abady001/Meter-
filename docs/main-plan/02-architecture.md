# 02 — Architecture

## 15+2 Database Pattern

```
PostgreSQL:5432/meter_pulse
│
├── core schema (shared)
│   ├── Areas, Projects, Location Zones
│   ├── Users, Roles, Permissions
│   ├── Audit Log, System Config
│   ├── Notification Queue
│   └── Payment Centers, Bank Accounts, Holidays
│
├── features schema (shared — billing engine)
│   ├── Tariffs, Charges, Charge Details
│   ├── Billing Cycles, Periods
│   ├── Reports, Exports, Scheduled Jobs
│   ├── Wallets (Solar + Money)
│   ├── Chilled Water Config/Readings/Invoices
│   ├── Settlement Config/Periods/Rules
│   ├── Document Templates, Invoice Hashes/QR
│   └── Contracts, Contractual Requests
│
├── area_october schema (45 tables)
├── area_new_cairo schema (45 tables)
├── area_sodic_ednc schema (45 tables)
├── area_sodic_estates schema (45 tables)
├── area_sodic_vye schema (45 tables)
├── area_badya_city schema (45 tables)
├── area_north_coast schema (45 tables)
├── area_uvines_mall schema (45 tables)
├── area_09 → area_15 (future)
│
│  Each area schema contains:
│  ├── Core Domain (10 tables): Customer, CustomerMeter, MeterReading,
│  │   SIMCard, SIMAssignment, MeterStatusLog, ReadingReview,
│  │   ReadingThreshold, MeterCalibration, MeterTransfer
│  ├── Billing Domain (10 tables): InvoiceDetail, Transaction,
│  │   PaymentAllocation, CustomerLedgerEntry, JournalEntry,
│  │   PaymentPlan, LateFee, Deposit, Refund, Dispute
│  ├── Energy Domain (4 tables): WaterBalance, SolarWalletTransaction,
│  │   ChilledWaterSettlement, UsageSummary
│  ├── Support Domain (10 tables): Alert, ChatMessage, Task,
│  │   Approval, Attachment, TroubleTicket, CollectionAction,
│  │   Contract, Subscription, WorkOrder
│  └── Security Domain (8 tables): OtpCode, ApiKey,
│      WebhookSubscription, PaymentGatewayLog, IntegrationLog,
│      DataSyncTracker, SchemaVersion, UserSession
│
└── Symbiot Bridge (planned)
    ├── 10 TCP channels (ports 5010-5019)
    └── 100 HTTP routes for query routing
```

## 3 Availability Plans

| Plan | Schemas Active | Modules | RTO |
|------|---------------|---------|-----|
| Full (production) | core + features + 15 areas | All | <1 min |
| Safety (degraded) | core + 15 areas (read-only) | Metering only, no billing | <5 min |
| Failover (emergency) | core (cached queries) | Read-only dashboard | <15 min |

## Current State (Before Migration)

**Single schema `sim_system`** holds ALL data:
- ~50 tables: customers, meters, readings, invoices, payments, ledger, tickets, alerts, reports, settings, projects, locations
- `core`, `features`, `area` schemas exist as created by migrations but are **empty**
- `area` template not yet replicated into 15 per-area schemas

## Backend Stack
- NestJS with Prisma ORM
- PostgreSQL multi-schema
- JWT auth + GlobalAuthGuard + RolesGuard
- Correlation middleware, audit interceptor
- Puppeteer for PDF generation

## Frontend Stack
- Next.js 16 (Turbopack)
- React 19, TypeScript, Tailwind v4
- Zustand for state management
- React Query for API data
- Recharts for charts
