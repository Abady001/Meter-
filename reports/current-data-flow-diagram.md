# METER VERSE — DATA FLOW DIAGRAM

**Date:** 2026-06-25

---

```mermaid
flowchart LR
    subgraph "SOURCE SYSTEMS"
        SYM[Symbiot]
        BILL[Legacy Billing]
        COLL[(Collection System Backup)]
    end

    subgraph "SYNC GATEWAYS (READ-ONLY)"
        GW_INST[9 Area Instances]
        REMAP[EAV Remapping]
    end

    subgraph "METER VERSE"
        API[API Layer]
        DB[(PostgreSQL)]
    end

    subgraph "USERS"
        BOP[Billing Operator]
        CASH[Cashier]
        CSR[Customer Service]
        PM[Project Manager]
        MR[Meter Reader]
        ADMIN[Administrator]
        SUPER[Super Admin]
    end

    COLL -->|Import| DB
    SYM -->|GET /devices| GW_INST
    SYM -->|GET /device-attributes| GW_INST
    SYM -->|GET /device-data| GW_INST
    BILL -->|GET /customers| GW_INST
    BILL -->|GET /bills| GW_INST
    BILL -->|GET /payments| GW_INST
    GW_INST --> REMAP
    REMAP -->|Flattened JSON| API
    API -->|Read/Write| DB
    API --> BOP
    API --> CASH
    API --> CSR
    API --> PM
    API --> MR
    API --> ADMIN
    API --> SUPER
```

## DATA RULES

| Direction | Permitted Methods | Notes |
|-----------|------------------|-------|
| SYMBIOT → GATEWAY | GET only | No POST/PUT/DELETE/PATCH/EXECUTE |
| BILLING → GATEWAY | GET only | No write operations ever |
| GATEWAY → API | HTTP response | Flattened EAV, no SQL passed through |
| API → DB | All CRUD | Meter Verse owns its data |
| COLLECTION → DB | INSERT only | One-time import, no ongoing sync |

## FLOW TYPES

1. **Real-time meter read** — UI → API → Gateway → Symbiot GET → cached response
2. **Customer sync** — Gateway → Billing GET → API → DB upsert
3. **Data import** — Collection backup → SQLite extract → PostgreSQL insert
4. **Billing cycle** — API → DB queries → tariff calculation → invoice generation
