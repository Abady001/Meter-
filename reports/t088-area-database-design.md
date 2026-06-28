# T088 — Area Database Template Design

**Date**: 2026-06-17
**Phase**: C — Template Schema Design

---

## Architecture

Area databases follow a shared template pattern: all 15 areas use identical schema structure (same tables, columns, indexes, FKs). The template is defined once in Prisma under `@@schema("area")` and replicated per area via migration SQL.

### Prisma Multi-Schema Pattern

```
sim_system (MVP) → core (v2.0 auth/shared) → features (v2.0 billing) → area (v2.0 per-tenant)
```

Each area (`area_october`, `area_new_cairo`, ... `area_uvines_mall`) will have its own schema containing all 42+ template tables.

---

## Table Inventory (42 Tables)

### Core Domain (Customer & Meter)

| # | Table | Parent FK | Key Columns |
|---|-------|-----------|-------------|
| 1 | Customer | — | CustomerCode (UQ), FullName, Status, CurrentBalance |
| 2 | CustomerMeter | Customer | MeterNumber (UQ), MeterType, Status, InstallationDate |
| 3 | MeterReading | CustomerMeter | ReadingValue, Consumption, ReadingDate, Source, Status |
| 4 | SIMCard | — | Iccid (UQ), PhoneNumber, Status |
| 5 | SIMAssignment | SIMCard → CustomerMeter | AssignedAt, ReturnedAt |
| 6 | MeterStatusLog | CustomerMeter | FromStatus, ToStatus, ActionType, ChangedBy |
| 7 | ReadingReview | MeterReading | DeviationPercent, TriggeredByRule, Status |
| 8 | ReadingThreshold | — | MeterType, RuleName, ThresholdValue, Action |
| 9 | MeterCalibration | CustomerMeter | BeforeValue, AfterValue, CalibratedBy |
| 10 | MeterTransfer | CustomerMeter → Customer | FromCustomerId, ToCustomerId, TransferredAt, Reason |

### Billing Domain (Invoice & Payment)

| # | Table | Parent FK | Key Columns |
|---|-------|-----------|-------------|
| 11 | InvoiceDetail | Customer | InvoiceNumber (UQ), TotalAmount, PaidAmount, Status, IsImmutable |
| 12 | Transaction | Customer | TransactionType, Amount, ReferenceNumber |
| 13 | PaymentAllocation | Transaction → InvoiceDetail | AllocatedAmount |
| 14 | CustomerLedgerEntry | Customer → Transaction | EntryType, Amount, RunningBalance |
| 15 | JournalEntry | Customer → InvoiceDetail | AccountCode, Debit, Credit, EntryDate |
| 16 | PaymentPlan | Customer | TotalAmount, Installments, Frequency, Status |
| 17 | LateFee | InvoiceDetail → Customer | FeeAmount, CalculatedDate, AppliedStatus |
| 18 | Deposit | Customer | Amount, Type (security/guarantee), Status |
| 19 | Refund | Customer | Amount, Reason, Status, ApprovedBy |
| 20 | Dispute | InvoiceDetail → Customer | Reason, Status, Resolution |

### Energy-Specific Domain

| # | Table | Parent FK | Key Columns |
|---|-------|-----------|-------------|
| 21 | WaterBalance | Customer | OpeningBalance, ConsumptionCharges, Payments, ClosingBalance |
| 22 | SolarWalletTransaction | Customer | TransactionType, Amount, BalanceBefore, BalanceAfter |
| 23 | ChilledWaterSettlement | Customer | TotalBTU, RatePerBTU, TotalAmount, Status |
| 24 | UsageSummary | CustomerMeter | TotalConsumption, PeakUsage, AvgDaily |

### Support Domain (Tickets, Tasks, Communication)

| # | Table | Parent FK | Key Columns |
|---|-------|-----------|-------------|
| 25 | Alert | Customer | AlertType, Severity, Title, IsResolved |
| 26 | ChatMessage | Customer → CoreUser | MessageType, Content, IsInternal |
| 27 | Task | Customer → CoreUser | Title, Priority, Status, DueDate |
| 28 | TroubleTicket | Customer → CoreUser | TicketNumber (UQ), Category, Priority, Status, SlaDeadline |
| 29 | Approval | — (polymorphic) | EntityType, EntityId, Status |
| 30 | Attachment | — (polymorphic) | FileName, ContentType, FileSizeBytes |
| 31 | CollectionAction | Customer | ActionType, Status, Result |
| 32 | Contract | Customer | ContractNumber (UQ), StartDate, EndDate, Terms |
| 33 | Subscription | Customer | ServiceType, StartDate, EndDate, Status |
| 34 | WorkOrder | CustomerMeter → CoreUser | Type, Status, ScheduledDate, CompletedAt |

### Security & Integration Domain

| # | Table | Parent FK | Key Columns |
|---|-------|-----------|-------------|
| 35 | OTPCode | CoreUser | Code, Purpose, ExpiresAt, IsUsed |
| 36 | ApiKey | CoreUser | KeyHash, Name, ExpiresAt, IsActive |
| 37 | WebhookSubscription | — | Url, Events, SecretKey, IsActive |
| 38 | PaymentGatewayLog | Transaction | GatewayResponse, StatusCode |
| 39 | IntegrationLog | — | IntegrationName, Direction, Payload, Status |
| 40 | DataSyncTracker | — | EntityType, LastSyncAt, RecordsProcessed, ErrorCount |

### Infrastructure Domain

| # | Table | Parent FK | Key Columns |
|---|-------|-----------|-------------|
| 41 | SchemaVersion | — | VersionNumber, AppliedAt, ScriptName, Checksum |
| 42 | UserSession | CoreUser | RefreshTokenHash, IpAddress, UserAgent, ExpiresAt |

---

## Common Patterns

### Column Conventions
- Primary key: `id String @id @default(uuid()) @map("id")` (or `autoincrement()` for high-volume tables)
- Foreign keys: `<related>Id String @map("<related>_id")`
- Timestamps: `createdAt DateTime @default(now()) @map("created_at")`, `updatedAt DateTime @updatedAt @map("updated_at")`
- Decimal: `@db.Decimal(14, 3)` for monetary, `@db.Decimal(18, 4)` for readings
- Enums: Prisma native enum mapped to PostgreSQL enum type

### Index Strategy
- PK on `id` (auto)
- FK columns always indexed
- Business query patterns: status, dates, customer reference composite
- Unique constraints on: customer code, meter number, invoice number, ticket number, contract number

### Mapping from v2.0.0-data-model.md
The data model uses `UNIQUEIDENTIFIER` (MSSQL) → `String @id @default(uuid())` (Prisma/PostgreSQL).  
`BIGINT IDENTITY` → `BigInt @id @default(autoincrement())`.  
`NVARCHAR` → `String`. `DECIMAL` → `Decimal @db.Decimal(p, s)`. `BIT` → `Boolean`.
