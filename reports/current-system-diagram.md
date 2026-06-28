# METER VERSE — SYSTEM ARCHITECTURE DIAGRAM

**Date:** 2026-06-25

---

```mermaid
graph TB
    subgraph "Frontend (Next.js 16, Port 3000)"
        UI[Browser]
        APP[App Shell]
        SIDEBAR[Navigation Sidebar]
        PAGES[Page Components]
        I18N[Arabic/English]
    end

    subgraph "Backend (NestJS, Port 3001)"
        GW[API Gateway]
        AUTH[Auth Module]
        CUST[Customer Module]
        METER[Meter Module]
        BILL[Billing Module]
        WALLET[Wallet Module]
        KPI[KPI Module]
        REPORT[Report Module]
        SYNC[Sync Module]
        ADMIN[Admin Module]
    end

    subgraph "Sync Gateway (Port 4000-4009)"
        ORCH[Orchestrator :4000]
        GWOCT[Gateway October :4001]
        GWNEW[Gateway New Cairo :4002]
        GWSOD[Gateway Sodic EDNC :4003]
        GWUVE[Gateway UVenus :4004]
        GWBAD[Gateway Badya :4005]
        GWBOI[Gateway Bo Island :4006]
        GWEST[Gateway Estates :4007]
        GWSVY[Gateway Sodic VYE :4008]
        GWCHI[Gateway Chillout :4009]
    end

    subgraph "Database (PostgreSQL 16, Port 5433)"
        DB[(meter_pulse)]
        SCHEMA_CORE[core schema]
        SCHEMA_SIM[sim_system schema]
        SCHEMA_FEATURES[features schema]
        SCHEMA_AREA[area schema]
    end

    subgraph "DB Admin (Port 4001)"
        DBA[Standalone Express]
    end

    subgraph "Source Systems"
        SYM[Symbiot - 10.50.30.x]
        BILLS[Legacy Billing]
        COLL[Collection System]
    end

    UI --> APP
    APP --> SIDEBAR
    APP --> PAGES
    PAGES --> GW
    GW --> AUTH
    GW --> CUST
    GW --> METER
    GW --> BILL
    GW --> WALLET
    GW --> KPI
    GW --> REPORT
    GW --> SYNC
    GW --> ADMIN
    SYNC --> ORCH
    ORCH --> GWOCT
    ORCH --> GWNEW
    ORCH --> GWSOD
    ORCH --> GWUVE
    ORCH --> GWBAD
    ORCH --> GWBOI
    ORCH --> GWEST
    ORCH --> GWSVY
    ORCH --> GWCHI
    GWOCT --> SYM
    GWNEW --> SYM
    GWSOD --> SYM
    ALL_GATEWAYS --> BILLS
    AUTH --> SCHEMA_CORE
    CUST --> SCHEMA_SIM
    METER --> SCHEMA_AREA
    BILL --> SCHEMA_FEATURES
    WALLET --> SCHEMA_FEATURES
    KPI --> SCHEMA_FEATURES
    REPORT --> ALL_SCHEMAS
    DBA --> DB
    COLL --> DB
```

## COMPONENTS

| Component | Technology | Port | Purpose |
|-----------|-----------|------|---------|
| Frontend | Next.js 16 + Turbopack | 3000 | UI, dashboards, reports |
| Backend | NestJS (Node 20+) | 3001 | API, auth, business logic |
| DB Admin | Standalone Express | 4001 | Direct database management |
| Sync Orchestrator | Express | 4000 | Route requests to area gateways |
| Sync Gateways x9 | Express | 4001-4009 | READ-ONLY proxy to Symbiot |
| Database | PostgreSQL 16 | 5433 | All application data |

## DATA STORES

| Schema | Purpose | Tables |
|--------|---------|--------|
| core | Auth, users, roles, permissions | 19 |
| sim_system | Customers, meters, billing | 31 |
| features | Payments, invoices, wallet, KPI | 36 |
| area | Area-specific meter readings | 42 |
