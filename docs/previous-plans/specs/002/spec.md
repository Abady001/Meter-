# Meter Verse Core — Specification

## 1. Purpose

Define the core platform for Meter Verse — a unified metering, billing, and collection management system replacing SBill Palm Hills, SBill Estates, Collection Tracker, and Solar Wallet. Provides RBAC, i18n, availability guarantees, and the foundational data layer for all area-specific deployments.

## 2. Scope

| Domain | In Scope |
|---|---|
| Core database schema | 15 tables (User, Role, Permission, Area, Project, AuditLog, SystemConfig, NotificationQueue, BankAccount, PaymentCenter, Holiday, LocationZone, UnitType, CustomerGroup, Settlement) |
| Features database schema | 10 tables (see data-model.md) |
| Area database template | 45 tables (see data-model.md) |
| Access control | 16-profile RBAC, 27+ permissions, area-scoped middleware |
| Internationalization | i18n engine with 676 keys (Arabic / English) |
| Availability | 3 plans: Full, Safety, Failover |
| Feature flags | FR-001 through FR-020 |

## 3. Functional Requirements

### FR-001 — Core DB Schema
The system SHALL maintain 15 core tables capturing users, roles, permissions, projects, areas, audit logs, system configuration, notification queue, bank accounts, payment centers, holidays, location zones, unit types, customer groups, and settlements.

### FR-002 — Features DB Schema
The system SHALL maintain 10 feature-extension tables keyed to the core schema via foreign keys.

### FR-003 — Area DB Template
The system SHALL instantiate one Area database per managed region using a template of 45 tables. Each Area DB SHALL be isolated at the schema or database level.

### FR-004 — RBAC
The system SHALL support 16 built-in profiles: SuperAdmin, SystemAdmin, AreaAdmin, BillingManager, CollectionManager, FinanceManager, CustomerServiceAgent, FieldTechnician, MeterReader, Auditor, ReportViewer, IntegrationAdmin, SupportAgent, ConfigManager, BranchManager, Guest.

### FR-005 — Permissions
The system SHALL define 27+ atomic permissions covering UserManage, RoleManage, AreaManage, BillingRead, BillingWrite, CollectionRead, CollectionWrite, FinanceRead, FinanceWrite, CustomerRead, CustomerWrite, MeterRead, MeterWrite, AuditView, ReportView, ConfigManage, IntegrationManage, NotificationSend, PaymentProcess, SettlementRun, HolidayManage, UnitTypeManage, CustomerGroupManage, LocationZoneManage, BankAccountManage, PaymentCenterManage, ProjectManage.

### FR-006 — Area Middleware
Every API request SHALL be scoped to one or more areas. The RBAC middleware SHALL enforce that a principal's area intersection matches the request target.

### FR-007 — i18n Engine
The system SHALL serve 676 translatable keys (338 Arabic, 338 English) covering UI labels, validation messages, error strings, and email templates. Keys SHALL be stored in a database table with locale, key, and value columns and cached at the application layer.

### FR-008 — Availability Plans

| Plan | RTO | RPO | Replicas |
|---|---|---|---|
| Full | < 1 min | < 1 min | 3 (active/active/standby) |
| Safety | < 5 min | < 5 min | 2 (active/standby) |
| Failover | < 15 min | < 15 min | 1 + warm standby |

### FR-009 — Audit Logging
Every CUD operation on core tables SHALL produce an audit entry (who, what, when, old value, new value).

### FR-010 — System Configuration
Key-value configuration SHALL be stored in SystemConfig and cacheable with 5-minute TTL.

### FR-011 — Notification Queue
Notifications SHALL be enqueued in NotificationQueue and consumed by a background worker for email/SMS dispatch.

### FR-012 — Bank Account Management
Each payment center SHALL have one or more bank accounts with IBAN, SWIFT, and account holder fields.

### FR-013 — Payment Centers
Payment centers SHALL be linked to areas and support cash, POS, and bank transfer collection methods.

### FR-014 — Holiday Calendar
Per-area holiday definitions SHALL drive billing-date adjustment and collection scheduling.

### FR-015 — Location Zones
Zones SHALL form a hierarchy (Zone → Sub-Zone → District) used for meter grouping and route optimization.

### FR-016 — Unit Types
Supported unit types: kWh, m³, L, Gal, MWh, GJ, BTU, CF.

### FR-017 — Customer Groups
Groups SHALL support tariff assignment, discount rules, and exemption flags per area.

### FR-018 — Settlement Runs
Settlement SHALL be a scheduled batch process that computes consumption, applies tariffs, generates invoices, and posts ledger entries.

### FR-019 — Project Isolation
Projects SHALL group areas for multi-property management. Cross-project data access SHALL require explicit permission grants.

### FR-020 — Feature Toggle
Each FR-001–FR-020 feature SHALL be togglable via SystemConfig without code deployment.

## 4. Non-Functional Requirements

| NFR | Target |
|---|---|
| NFR-001 Concurrency | 100 concurrent HTTP connections per channel |
| NFR-002 Throughput | 10 000 messages/s per bridge instance |
| NFR-003 Latency p99 | < 200 ms API response |
| NFR-004 Uptime | 99.9 % (Full plan), 99.5 % (Safety), 99.0 % (Failover) |
| NFR-005 Security | TLS 1.3, bcrypt passwords, JWT tokens (15 min expiry) |
| NFR-006 Audit retention | 7 years online, 10 years cold storage |
| NFR-007 i18n coverage | 676 keys, 100 % coverage required for both locales |
| NFR-008 Backup | Full daily + WAL every 5 min |

## 5. Constraints

- **C-001** — PostgreSQL 16 required.
- **C-002** — Windows Server 2022 host.
- **C-003** — All DB changes use Sqitch for version-controlled migrations.
- **C-004** — No cross-database foreign keys; area DBs reference core only via application logic.
- **C-005** — i18n keys must never be deleted — only deprecated.
- **C-006** — RBAC profiles are seeded, not user-creatable.
