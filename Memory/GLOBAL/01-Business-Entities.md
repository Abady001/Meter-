# Meter Verse — Business Entity Model (DDD Reference)

## Schema Architecture

The Meter Verse domain is split across 3 PostgreSQL schemas:
- **`sim_system`**: Legacy monolith schema (30+ tables: projects, meters, customers, readings, invoices, payments, ledger, notifications, tickets, claims, uploads)
- **`core`**: Multi-tenant foundation (17 tables: users, roles, permissions, areas, projects, settlements, payment centers, holidays, audit log, notification queue, location zones, unit types, user groups, customer groups, system config)
- **`features`**: Business features (16 tables: tariffs, tariff versions, tariff charges, tariff charge details, report definitions, report exports, scheduled jobs, export history, running activities, plan scenarios, bau scenarios, budget scenarios, etc.)

---

## Entity Hierarchy (Top-Down)

```
Area → Project → Unit Zone (LocationNode) → Unit Type → Unit → Meter → Tariff → Customer → Assignment → Reading → Invoice → Payment → Ledger → Wallet → Settlement → Audit → Notification → RBAC
```

---

## 1. CoreArea

**What it is**: A geographic/business region that contains one or more real-estate projects. Each area maps to a physical Symbiot gateway server and an sBill billing instance.

**Schema**: `core` | **Table**: `areas`

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| areaCode | String(UNIQUE) | Business code (e.g. `AREA-1`, `AREA-2`) |
| areaName | String | Display name (e.g. `October`, `New Cairo`) |
| databaseName | String | Symbiot SQL Server database identifier |
| connectionString | String | Full connection string to the Symbiot SQL Server |
| isActive | Boolean | Whether this area is currently syncing |
| createdAt | DateTime | Creation timestamp |

**Parent**: None (root entity)
**Child entities**: CoreProject, CoreHoliday, CoreSettlement, CorePaymentCenter
**Relationships**:
- Has many `CoreProject` records
- Has many `CoreHoliday` records (area-specific holidays)
- Has many `CoreSettlement` records (period-end settlement runs)
- Has many `CorePaymentCenter` records (physical payment collection points)
- Referenced by `CoreSettlement.areaId`
- Referenced by `CorePaymentCenter.areaId`

**Known area codes** (9 active areas):
- October (4001), New Cairo (4002), Sodic EDNC (4003), UVenus (4004), Badya (4005), Bo Island (4006), Estates (4007), VYE (4008), Chillout (4009)

---

## 2. CoreProject (v2)

**What it is**: A real-estate development project within an area. Each area has exactly one project in the v2 model.

**Schema**: `core` | **Table**: `projects`

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| areaId | UUID(FK→CoreArea) | Parent area |
| projectCode | String | Business code (unique per area) |
| projectName | String | Display name |
| locationJson | JSON? | Geographic location data |
| isActive | Boolean | Whether project is active |
| createdAt | DateTime | Creation timestamp |
| updatedAt | DateTime | Last update timestamp |

**Unique**: `[areaId, projectCode]`
**Parent**: CoreArea
**Child entities**: none in v2 core (but linked to sim_system.Project via projectCode)
**Relationships**: Belongs to CoreArea

---

## 3. Project (v1/sim_system)

**What it is**: The legacy project record from the original system. Contains business configuration like tax rates, watermark, logo, and bank details.

**Schema**: `sim_system` | **Table**: `projects`

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| code | String(UNIQUE) | Project code |
| name | String | Project display name |
| status | ProjectStatus(enum) | `active` / `inactive` |
| taxEnabled | Boolean | Whether VAT applies |
| taxRate | Decimal? | VAT percentage (e.g. 14.00) |
| readingThresholdProfileId | String? | FK to threshold profile |
| waterDifferenceMode | WaterDifferenceMode(enum) | `billable` / `report_only` |
| logo | String? | Base64 or URL of company logo |
| license | String? | Company license text |
| signature | String? | Digital signature for invoices |
| bankDetails | String? | Company bank account details |
| companyInfo | String? | Company information |
| createdAt | DateTime | Created timestamp |
| updatedAt | DateTime | Updated timestamp |
| createdBy | String | Actor who created |
| updatedBy | String | Actor who last updated |

**Parent**: None (root entity in sim_system)
**Child entities**: LocationNode (zone/building/floor/unit hierarchy), Customer
**Relationships**:
- Has many `LocationNode` records (the zone hierarchy)
- Has many `Customer` records
- Referenced by `LocationNode.projectId`
- Referenced by `Customer.projectId`

---

## 4. LocationNode (Zone/Building/Floor/Unit)

**What it is**: A hierarchical node representing physical locations within a project. Supports a 4-level tree: Zone → Building → Floor → Unit. Acts as both a grouping node and the assignable unit entity.

**Schema**: `sim_system` | **Table**: `location_nodes`

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| projectId | UUID(FK→Project) | Parent project |
| parentId | UUID?(FK→self) | Parent node in hierarchy |
| nodeType | NodeType(enum) | `zone` / `building` / `floor` / `unit` |
| code | String | Business code (unique per project+type) |
| name | String | Display name |
| status | EntityStatus(enum) | `active` / `inactive` |
| createdAt | DateTime | Created timestamp |
| updatedAt | DateTime | Updated timestamp |
| createdBy | String | Actor who created |
| updatedBy | String | Actor who last updated |

**Unique**: `[projectId, nodeType, code]`
**Index**: `[parentId]`
**Parent**: Project
**Child entities**: LocationNode (self-referencing children)
**Relationships**:
- Self-referencing hierarchy via `parentId` → `id`
- Belongs to `Project`
- Referenced by `CustomerUnitAssignment.unitId` as the assigned unit
- Units (nodeType=unit) are the billable/assignable entities

---

## 5. UnitType (CoreUnitType)

**What it is**: A classification of unit types (e.g. apartment, villa, shop, office) that determines default meter type.

**Schema**: `core` | **Table**: `unit_types`

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| typeCode | String(UNIQUE) | Business code (e.g. `APT`, `VIL`, `SHP`) |
| typeName | String | Display name (e.g. `Apartment`, `Villa`) |
| meterTypeDefault | String? | Default meter type for this unit type |
| createdAt | DateTime | Created timestamp |

**Parent**: None
**Child entities**: None direct; referenced by unit configuration

---

## 6. Customer

**What it is**: An end customer (individual or company) who owns or rents a unit and receives invoices.

**Schema**: `sim_system` | **Table**: `customers`

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| projectId | UUID(FK→Project) | Parent project |
| customerCode | String | Business customer code (unique per project) |
| name | String | Customer display name (English) |
| nameAr | String? | Customer display name (Arabic) |
| tenantName | String? | Tenant name (if different from owner) |
| phone | String | Contact phone number |
| email | String | Contact email |
| customerType | CustomerType(enum) | `individual` / `company` / `tenant` / `owner` |
| nationalOrCommercialId | String | National ID or commercial registration |
| status | EntityStatus(enum) | `active` / `inactive` |
| createdAt | DateTime | Created timestamp |
| updatedAt | DateTime | Updated timestamp |
| createdBy | String | Actor who created |
| updatedBy | String | Actor who last updated |

**Unique**: `[projectId, customerCode]`
**Parent**: Project
**Child entities**: CustomerUnitAssignment
**Relationships**:
- Belongs to `Project`
- Has many `CustomerUnitAssignment` records (assignment history to units)
- Referenced by `Invoice.customerId`
- Referenced by `Payment.customerId`
- Referenced by `CustomerLedgerEntry.customerId`
- Referenced by `MeterAssignment.customerId`

---

## 7. CustomerUnitAssignment

**What it is**: A time-bound assignment of a customer to a unit. Tracks move-in/move-out history.

**Schema**: `sim_system` | **Table**: `customer_unit_assignments`

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| customerId | UUID(FK→Customer) | The customer |
| unitId | UUID(FK→LocationNode) | The unit (nodeType=unit) |
| startAt | DateTime | Assignment start date |
| endAt | DateTime? | Assignment end date (null=active) |
| reason | String | Reason for assignment (e.g. `new_owner`, `tenant_change`) |
| createdAt | DateTime | Created timestamp |
| updatedAt | DateTime | Updated timestamp |
| createdBy | String | Actor who created |
| updatedBy | String | Actor who last updated |

**Parent**: Customer
**Relationships**: Belongs to Customer, Belongs to LocationNode (unit)

---

## 8. Meter

**What it is**: A physical utility meter device. Can be electricity, water (main or child), solar, gas, chilled water, or outdoor unit. Supports hierarchy (main meter → child meters) and solar (import/export/generation meters).

**Schema**: `sim_system` | **Table**: `meters`

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| serialNumber | String(UNIQUE) | Physical meter serial number |
| meterType | MeterType(enum) | `electricity` / `water_main` / `water_child` / `solar` / `gas` / `chilled_water` / `outdoor_unit` |
| brand | String | Manufacturer brand |
| model | String | Model number |
| phaseType | String? | e.g. `single`, `three` |
| ampRating | String? | e.g. `100A`, `200A` |
| diameter | String? | For water meters: pipe diameter |
| solarEnabled | Boolean | Whether meter is part of solar net-metering |
| solarWalletId | String? | FK to solar wallet account |
| exportMeterId | String? | For solar: the export-direction meter |
| importMeterId | String? | For solar: the import-direction meter |
| generationMeterId | String? | For solar: the generation meter |
| status | MeterStatus(enum) | `available` / `assigned` / `active` / `offline` / `faulty` / `replaced` / `terminated` / `retired` |
| installationDate | DateTime | When meter was physically installed |
| activationDate | DateTime | When meter was activated in system |
| terminationDate | DateTime? | When meter was decommissioned |
| projectId | String | FK to project |
| locationId | String? | FK to location node (unit) |
| parentMainMeterId | String?(FK→self) | For child meters: FK to parent main meter |
| initialBalance | Decimal?(12,3) | Prepaid initial balance |
| relayStatus | String? | Remote relay status (connect/disconnect) |
| lastReadingDate | DateTime? | Most recent reading timestamp |
| createdAt | DateTime | Created timestamp |
| updatedAt | DateTime | Updated timestamp |
| createdBy | String | Actor who created |
| updatedBy | String | Actor who last updated |

**Parent**: None (belongs to project via projectId)
**Child entities**: Meter (self-referencing hierarchy), MeterAssignment, SIMAssignment
**Relationships**:
- Self-referencing hierarchy via `parentMainMeterId` → `id`
- Has many `MeterAssignment` records
- Has many `SIMAssignment` records
- Referenced by `Reading.meterId`
- Referenced by `Invoice.meterId`
- Referenced by `SIMCard` assignments

---

## 9. SIMCard

**What it is**: A cellular SIM card used to provide network connectivity to a meter for remote reading.

**Schema**: `sim_system` | **Table**: `sim_cards`

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| iccid | String(UNIQUE) | SIM card integrated circuit card identifier |
| msisdn | String | Phone number |
| provider | String | Network provider (e.g. `Orange`, `Vodafone`) |
| ipAddress | String | Assigned IP address |
| ipType | IpType(enum) | `static` / `dynamic` |
| status | SimStatus(enum) | `available` / `assigned` / `active` / `suspended` / `old` / `reusable` / `retired` |
| cooldownUntil | DateTime? | Cooldown period before reuse |
| createdAt | DateTime | Created timestamp |
| updatedAt | DateTime | Updated timestamp |
| createdBy | String | Actor who created |
| updatedBy | String | Actor who last updated |

**Parent**: None
**Child entities**: SIMAssignment
**Relationships**: Has many `SIMAssignment` records

---

## 10. MeterAssignment

**What it is**: A time-bound assignment of a meter to a customer and unit. Tracks the full lifecycle of meter deployment.

**Schema**: `sim_system` | **Table**: `meter_assignments`

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| meterId | UUID(FK→Meter) | The meter |
| customerId | String | FK to customer |
| unitId | String | FK to location node |
| projectId | String | FK to project |
| startAt | DateTime | Assignment start |
| endAt | DateTime? | Assignment end (null=active) |
| changeReason | String | Reason code |
| status | AssignmentStatus(enum) | `active` / `ended` |
| createdAt | DateTime | Created timestamp |
| updatedAt | DateTime | Updated timestamp |
| createdBy | String | Actor who created |
| updatedBy | String | Actor who last updated |

**Parent**: Meter
**Relationships**: Belongs to Meter

---

## 11. SIMAssignment

**What it is**: A time-bound assignment of a SIM card to a meter.

**Schema**: `sim_system` | **Table**: `sim_assignments`

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| simId | UUID(FK→SIMCard) | The SIM card |
| meterId | UUID(FK→Meter) | The meter |
| startAt | DateTime | Assignment start |
| endAt | DateTime? | Assignment end (null=active) |
| changeReason | String | Reason code |
| status | AssignmentStatus(enum) | `active` / `ended` |
| createdAt | DateTime | Created timestamp |
| updatedAt | DateTime | Updated timestamp |
| createdBy | String | Actor who created |
| updatedBy | String | Actor who last updated |

**Parent**: SIMCard
**Relationships**: Belongs to SIMCard, Belongs to Meter

---

## 12. TariffPlan (v1/simple)

**What it is**: A simple flat-rate tariff plan. The basic tariff model before the full Tariff features model.

**Schema**: `sim_system` | **Table**: `tariff_plans`

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| projectId | String | FK to project |
| meterType | MeterType(enum) | Utility type this tariff applies to |
| ratePerUnit | Decimal(12,3) | Flat rate per consumption unit |
| currency | String | e.g. `EGP` |
| effectiveFrom | DateTime | When tariff becomes effective |
| effectiveTo | DateTime? | When tariff expires (null=ongoing) |
| status | TariffStatus(enum) | `draft` / `active` / `retired` |
| createdAt | DateTime | Created timestamp |
| updatedAt | DateTime | Updated timestamp |
| createdBy | String | Actor who created |
| updatedBy | String | Actor who last updated |

**Parent**: None (belongs to project)
**Relationships**: Referenced by invoice generation logic as fallback

---

## 13. Tariff (v2/features)

**What it is**: The full tariff definition with multiple charge types, settlement rules, and versioned lifecycle.

**Schema**: `features` | **Table**: `tariffs`

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| tariffCode | String(UNIQUE) | Business code |
| tariffName | String | Display name |
| description | String? | Description of tariff |
| utilityType | UtilityType(enum) | Type this tariff applies to |
| isActive | Boolean | Active flag |
| effectiveFrom | DateTime | Start of effectiveness |
| effectiveTo | DateTime? | End of effectiveness |
| createdAt | DateTime | Created timestamp |
| updatedAt | DateTime | Updated timestamp |
| createdBy | String | Actor who created |
| updatedBy | String | Actor who last updated |

**Parent**: None
**Child entities**: TariffVersion, TariffCharge
**Relationships**:
- Has many `TariffVersion` records
- Has many `TariffCharge` records

---

## 14. TariffVersion

**What it is**: A versioned snapshot of a tariff's configuration. Supports approval workflow.

**Schema**: `features` | **Table**: `tariff_versions`

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| tariffId | UUID(FK→Tariff) | Parent tariff |
| versionNo | Int | Sequential version number |
| changeLog | String | Description of changes |
| approvedBy | String | Approver |
| approvedAt | DateTime | Approval timestamp |
| createdAt | DateTime | Created timestamp |

**Unique**: `[tariffId, versionNo]`
**Parent**: Tariff
**Relationships**: Belongs to Tariff

---

## 15. TariffCharge

**What it is**: A single charge line within a tariff. Defines the calculation mode (STEPS, FLAT, STATIC, PER_UNIT, ZERO, TOU), settlement type, and rate.

**Schema**: `features` | **Table**: `tariff_charges`

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| tariffId | UUID(FK→Tariff) | Parent tariff |
| chargeCode | String | Business code (unique per tariff) |
| chargeName | String | English display name |
| chargeNameAr | String? | Arabic display name |
| chargeMode | TariffChargeMode(enum) | `STEPS` / `FLAT` / `STATIC` / `PER_UNIT` / `ZERO` / `TOU` |
| settlementType | TariffSettlementType(enum) | `FIXED` / `PERCENTAGE` / `ONE_TIME` |
| rateAmount | Decimal?(14,6) | Flat rate per unit or fixed amount |
| unitOfMeasure | String? | e.g. `kWh`, `m³` |
| minCharge | Decimal?(14,3) | Minimum charge amount |
| maxCharge | Decimal?(14,3) | Maximum charge amount |
| sortOrder | Int | Display order |
| isActive | Boolean | Active flag |
| createdAt | DateTime | Created timestamp |
| updatedAt | DateTime | Updated timestamp |
| createdBy | String | Actor who created |
| updatedBy | String | Actor who last updated |

**Unique**: `[tariffId, chargeCode]`
**Parent**: Tariff
**Child entities**: TariffChargeDetail
**Relationships**: Belongs to Tariff, has many `TariffChargeDetail`

---

## 16. TariffChargeDetail

**What it is**: Slab/block/tier details for STEPS mode charges, or hour-based rates for TOU mode.

**Schema**: `features` | **Table**: `tariff_charge_details`

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| chargeId | UUID(FK→TariffCharge) | Parent charge |
| stepFrom | Decimal?(14,3) | Tier start (consumption or hour) |
| stepTo | Decimal?(14,3) | Tier end (consumption or hour) |
| stepRate | Decimal?(14,6) | Rate per unit in this tier |
| stepAmount | Decimal?(14,3) | Fixed amount for this tier |
| isPercentage | Boolean | Whether stepAmount is a percentage |
| createdAt | DateTime | Created timestamp |

**Parent**: TariffCharge
**Relationships**: Belongs to TariffCharge

---

## 17. BillingPeriod

**What it is**: A time-bounded period for which invoices are generated. Monthly cycles typically.

**Schema**: `sim_system` | **Table**: `billing_periods`

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| projectId | String | FK to project |
| periodCode | String | e.g. `2026-06` |
| startDate | DateTime | Period start |
| endDate | DateTime | Period end |
| status | BillingPeriodStatus(enum) | `open` / `in_review` / `closed` |
| totalCustomers | Int? | Counter of customers billed |
| totalInvoices | Int? | Counter of invoices generated |
| totalAmount | Decimal?(14,2) | Sum of invoice totals |
| errorMessage | String? | Error info if generation failed |
| executedAt | DateTime? | When generation was executed |
| createdAt | DateTime | Created timestamp |
| updatedAt | DateTime | Updated timestamp |
| createdBy | String | Actor who created |
| updatedBy | String | Actor who last updated |

**Unique**: `[projectId, periodCode]`
**Parent**: None (belongs to project)
**Relationships**: Referenced by `Invoice.billingPeriodId`

---

## 18. Invoice

**What it is**: A financial document charging a customer for utility consumption in a billing period. Includes state machine: draft → pending_approval → issued → partially_paid → paid → cancelled/void.

**Schema**: `sim_system` | **Table**: `invoices`

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| invoiceNumber | String(UNIQUE) | e.g. `ELE-2026-00000001` |
| projectId | String | FK to project |
| customerId | String | FK to customer |
| unitId | String | FK to unit |
| meterId | String | FK to meter |
| utilityType | UtilityType(enum) | `electricity` / `water` / `solar` / `gas` / `chilled_water` / `outdoor_unit` / `settlement` |
| billingPeriodId | String | FK to billing period |
| status | InvoiceStatus(enum) | `draft` / `pending_approval` / `issued` / `partially_paid` / `paid` / `overdue` / `cancelled` / `void` |
| subtotalAmount | Decimal(12,3) | Sum of line amounts before tax |
| taxAmount | Decimal(12,3) | VAT amount |
| totalAmount | Decimal(12,3) | Grand total |
| paidAmount | Decimal(12,3) | Amount paid so far |
| remainingAmount | Decimal(12,3) | Amount still owed |
| balanceBefore | Decimal?(12,3) | Customer balance before invoice |
| balanceAfter | Decimal?(12,3) | Customer balance after invoice |
| meterSerial | String? | Denormalized meter serial |
| consumptionValue | Decimal?(12,3) | Denormalized consumption |
| billingPeriodCode | String? | Denormalized period code |
| issuedAt | DateTime? | When invoice was issued |
| dueAt | DateTime? | Payment due date |
| immutableAt | DateTime? | When invoice became immutable |
| createdAt | DateTime | Created timestamp |
| updatedAt | DateTime | Updated timestamp |

**Indexes**: `[projectId]`, `[customerId]`, `[billingPeriodId]`, `[status]`, `[createdAt]`
**Parent**: None
**Child entities**: InvoiceLine, InvoiceAdjustment
**Relationships**:
- Has many `InvoiceLine` records
- Has many `InvoiceAdjustment` records
- Referenced by `PaymentAllocation.invoiceId`
- Referenced by `CustomerLedgerEntry.referenceId` (as type=invoice)

---

## 19. InvoiceLine

**What it is**: A single line item on an invoice representing a charge.

**Schema**: `sim_system` | **Table**: `invoice_lines`

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| invoiceId | UUID(FK→Invoice) | Parent invoice |
| readingId | String? | FK to reading (if line is consumption-based) |
| description | String | Line description |
| quantity | Decimal(12,3) | Units consumed |
| unitPrice | Decimal(12,3) | Price per unit |
| lineAmount | Decimal(12,3) | Total line amount |
| chargeGroup | Int? | 0-14 charge group classification |

**Parent**: Invoice
**Relationships**: Belongs to Invoice

---

## 20. InvoiceAdjustment

**What it is**: A manual credit or debit adjustment applied to an invoice.

**Schema**: `sim_system` | **Table**: `invoice_adjustments`

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| invoiceId | UUID(FK→Invoice) | Parent invoice |
| adjustmentType | AdjustmentType(enum) | `credit` / `debit` |
| amount | Decimal(12,3) | Adjustment amount |
| reason | String | Justification |
| approvedBy | String? | Approver |
| createdBy | String | Creator |

**Parent**: Invoice
**Relationships**: Belongs to Invoice

---

## 21. Payment

**What it is**: A financial payment received from a customer. Supports multiple methods and automatic allocation to oldest due invoices.

**Schema**: `sim_system` | **Table**: `payments`

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| paymentNumber | String(UNIQUE) | e.g. `PAY-1717000000000` |
| projectId | String | FK to project |
| customerId | String | FK to customer |
| paymentDate | DateTime | When payment was received |
| method | PaymentMethod(enum) | `cash` / `bank_transfer` / `card` / `online` / `cheque` / `wallet` |
| amount | Decimal(12,3) | Payment amount |
| settlementAmount | Decimal?(12,3) | Amount allocated to settlement |
| referenceNo | String? | External reference number |
| paymentCenterId | String? | FK to payment center |
| status | PaymentStatus(enum) | `pending` / `confirmed` / `reversed` / `cancelled` |
| collectedBy | String | Collector/operator |
| notes | String? | Additional notes |
| createdAt | DateTime | Created timestamp |
| updatedAt | DateTime | Updated timestamp |

**Indexes**: `[projectId]`, `[customerId]`, `[paymentDate]`, `[status]`
**Parent**: None
**Child entities**: PaymentFee, Cheque, PaymentAllocation
**Relationships**:
- Has many `PaymentFee` records
- Has many `Cheque` records
- Has many `PaymentAllocation` records

---

## 22. PaymentFee

**What it is**: Fees associated with a payment (e.g. transaction fee, service charge).

**Schema**: `sim_system` | **Table**: `payment_fees`

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| paymentId | UUID(FK→Payment) | Parent payment |
| feeType | String | Type of fee |
| feeAmount | Decimal(12,3) | Fee amount |
| createdAt | DateTime | Created timestamp |

**Parent**: Payment
**Relationships**: Belongs to Payment

---

## 23. Cheque

**What it is**: Cheque details for cheque-based payments.

**Schema**: `sim_system` | **Table**: `cheques`

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| paymentId | UUID(FK→Payment) | Parent payment |
| chequeNumber | String | Cheque number |
| bankName | String? | Issuing bank |
| chequeDate | DateTime? | Cheque date |
| status | String(default:`pending`) | Cheque clearing status |
| createdAt | DateTime | Created timestamp |

**Parent**: Payment
**Relationships**: Belongs to Payment

---

## 24. PaymentAllocation

**What it is**: Allocation of a payment amount to a specific invoice. Uses configurable strategy (oldest-due-first or explicit).

**Schema**: `sim_system` | **Table**: `payment_allocations`

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| paymentId | UUID(FK→Payment) | Parent payment |
| invoiceId | UUID(FK→Invoice) | Target invoice |
| allocatedAmount | Decimal(12,3) | Amount allocated |
| allocationOrder | Int | Sequence number |

**Indexes**: `[paymentId]`, `[invoiceId]`
**Parent**: Payment
**Relationships**: Belongs to Payment, references Invoice

---

## 25. CustomerLedgerEntry

**What it is**: An append-only financial ledger tracking every financial event for a customer. Maintains a running balance.

**Schema**: `sim_system` | **Table**: `customer_ledger_entries`

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| customerId | String | FK to customer |
| projectId | String | FK to project |
| entryType | LedgerEntryType(enum) | `invoice_charge` / `adjustment_debit` / `adjustment_credit` / `payment_credit` / `payment_reversal` |
| referenceType | ReferenceType(enum) | `invoice` / `payment` / `adjustment` |
| referenceId | String | FK to the referenced entity |
| amountDelta | Decimal(12,3) | Signed change amount |
| runningBalance | Decimal(12,3) | Balance after this entry |
| entryAt | DateTime | Financial effective date |
| createdAt | DateTime | Record creation timestamp |

**Indexes**: `[customerId]`, `[projectId]`, `[entryAt]`
**Parent**: None
**Relationships**: References Customer, Invoice, Payment

---

## 26. WalletAccount (via WalletService)

**What it is**: A digital wallet for a customer, used primarily for solar net-metering credits. Supports deposit, withdrawal, and transfer.

**Schema**: Not in Prisma (dynamic via `(this.prisma as any).walletAccount`)

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| customerId | String | FK to customer |
| projectId | String | FK to project |
| balance | Decimal | Current wallet balance |
| currency | String(default:`EGP`) | Currency |
| status | String(default:`ACTIVE`) | Wallet status |
| createdAt | DateTime | Created timestamp |
| updatedAt | DateTime | Updated timestamp |

**Parent**: Customer
**Child entities**: WalletTransaction, WalletTransfer
**Relationships**:
- Belongs to Customer
- Has many `WalletTransaction` records
- Referenced by `Meter.solarWalletId` (solar-enabled meters)

---

## 27. WalletTransaction

**What it is**: A single financial transaction within a wallet.

**Schema**: Dynamic

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| walletId | UUID(FK→WalletAccount) | Parent wallet |
| type | WalletTransactionType(enum) | `DEPOSIT` / `WITHDRAWAL` / `TRANSFER` / `ALLOCATION` / `REFUND` |
| amount | Decimal | Transaction amount |
| referenceType | String | Type of reference |
| referenceId | String | FK to referenced entity |
| description | String | Description |
| status | String(default:`COMPLETED`) | Transaction status |
| createdAt | DateTime | Created timestamp |

---

## 28. CoreSettlement

**What it is**: A period-end settlement summarizing total invoiced vs total collected for an area.

**Schema**: `core` | **Table**: `settlements`

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| areaId | UUID(FK→CoreArea) | Parent area |
| periodStart | DateTime | Period start |
| periodEnd | DateTime | Period end |
| status | SettlementStatus(enum) | `pending` / `in_progress` / `settled` / `disputed` |
| totalInvoiced | Decimal(14,3) | Sum of invoices in period |
| totalCollected | Decimal(14,3) | Sum of payments collected |
| variance | Decimal?(14,3) | Difference |
| settledAt | DateTime? | When settlement was finalized |
| createdAt | DateTime | Created timestamp |
| updatedAt | DateTime | Updated timestamp |

**Unique**: `[areaId, periodStart, periodEnd]`
**Parent**: CoreArea
**Relationships**: Belongs to CoreArea

---

## 29. Reading

**What it is**: A meter reading recording consumption at a point in time. Each reading can optionally include consumption (calculated from previous reading).

**Schema**: `sim_system` | **Table**: `readings`

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| meterId | UUID(FK→Meter) | The meter |
| projectId | String | FK to project |
| customerIdSnapshot | String | Customer at time of reading |
| unitIdSnapshot | String | Unit at time of reading |
| readingValue | Decimal(12,3) | Raw meter register value |
| readingAt | DateTime | When reading was taken |
| source | ReadingSource(enum) | `manual` / `import` / `automatic` / `production` |
| previousReadingValue | Decimal?(12,3) | Previous reading value |
| consumptionValue | Decimal?(12,3) | Calculated consumption |
| status | ReadingStatus(enum) | `valid` / `pending_review` / `estimated` / `suspicious` / `corrected` / `rejected` |
| rawPayload | Json? | Raw data from source |
| resultType | Int? | Result code |
| enteredBy | String | Who entered the reading |
| notes | String? | Additional notes |
| createdAt | DateTime | Created timestamp |
| updatedAt | DateTime | Updated timestamp |

**Unique**: `[meterId, readingAt, source]`
**Indexes**: `[meterId]`, `[projectId]`, `[readingAt]`, `[status]`
**Parent**: Meter
**Relationships**: Belongs to Meter

---

## 30. ReadingReview

**What it is**: Review action taken on a reading (approve, reject, correct).

**Schema**: `sim_system` | **Table**: `reading_reviews`

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| readingId | UUID(FK→Reading) | Parent reading |
| reviewAction | ReviewAction(enum) | `approve` / `reject` / `correct` |
| reviewedBy | String | Reviewer |
| reviewedAt | DateTime | Review timestamp |
| reason | String | Reason for action |

---

## 31. AuditLog (v2/core)

**What it is**: Append-only audit trail for all state-changing operations. Includes SHA-256 hash for tamper detection.

**Schema**: `core` | **Table**: `audit_log`

| Field | Type | Description |
|-------|------|-------------|
| id | BigInt(auto) | Primary key |
| userId | UUID(FK→CoreUser) | Actor |
| actionType | AuditActionType(enum) | `create` / `update` / `delete` / `login` / `logout` / `assign` / `unassign` / `approve` / `reject` / `correct` / `generate` / `issue` / `cancel` |
| entityType | String | e.g. `invoice`, `meter`, `customer` |
| entityId | String | FK to the entity |
| oldValues | Json? | Before state |
| newValues | Json? | After state |
| ipAddress | String? | Client IP |
| userAgent | String? | Browser/agent |
| areaId | String? | Scope |
| createdAt | DateTime | Entry timestamp |

**Indexes**: `[createdAt]`, `[userId]`, `[entityType, entityId]`
**Parent**: CoreUser

---

## 32. AuditLog (v1/sim_system)

**What it is**: Legacy audit log with SHA-256 hash chain.

**Schema**: `sim_system` | **Table**: `audit_log`

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| actorId | String | Who performed action |
| actorRole | String | Role of actor |
| action | String | Action description |
| resourceType | String | Type of resource |
| resourceId | String | Resource identifier |
| beforeState | Json? | State before change |
| afterState | Json? | State after change |
| reason | String? | Reason for action |
| correlationId | String? | Request correlation ID |
| hash | String(default:`""`) | SHA-256 hash |
| createdAt | DateTime | Entry timestamp |

---

## 33. Notification

**What it is**: In-app notification to users about events (invoice issued, payment received, reading reviewed).

**Schema**: `sim_system` | **Table**: `notifications`

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| userId | String | Recipient user |
| title | String | Notification title |
| body | String? | Notification body |
| type | String(default:`info`) | `info`, `warning`, `success`, `error` |
| referenceType | String? | Type of referenced entity |
| referenceId | String? | FK to referenced entity |
| isRead | Boolean(default:false) | Read status |
| readAt | DateTime? | When read |
| createdAt | DateTime | Created timestamp |

**Indexes**: `[userId, isRead]`, `[createdAt]`

---

## 34. CoreUser (RBAC)

**What it is**: A system user with authentication and authorization. Supports MFA, password policy, and lockout.

**Schema**: `core` | **Table**: `users`

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| username | String(UNIQUE) | Login username |
| email | String(UNIQUE) | Email address |
| passwordHash | String | bcrypt hash |
| isMfaEnabled | Boolean | MFA toggle |
| mfaSecret | String? | TOTP secret |
| status | UserStatus(enum) | `active` / `inactive` / `locked` / `suspended` |
| lastLoginAt | DateTime? | Last login timestamp |
| passwordChangedAt | DateTime? | Last password change |
| failedLoginAttempts | Int | Consecutive failures |
| refreshTokenHash | String? | Current refresh token |
| createdAt | DateTime | Created timestamp |
| updatedAt | DateTime | Updated timestamp |
| createdBy | String? | Creator |
| updatedBy | String? | Last updater |

**Child entities**: CoreUserRoleAssignment, CoreAuditLog, CoreNotificationQueue

---

## 35. CoreRole (RBAC)

**What it is**: A named role with associated permissions.

**Schema**: `core` | **Table**: `roles`

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| roleName | String | Display name |
| roleCode | String(UNIQUE) | System code |
| description | String? | Description |
| isSystem | Boolean(default:false) | System-protected |
| createdAt | DateTime | Created timestamp |

**Child entities**: CoreRolePermission, CoreUserRoleAssignment

**16 roles defined**: super_admin, system_admin, admin, area_manager, team_leader, operator, technician, finance, support, customer, collector, meter_reader, inspector, supervisor, accountant, viewer

---

## 36. CorePermission

**What it is**: A granular permission/action within a module.

**Schema**: `core` | **Table**: `permissions`

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| permissionCode | String(UNIQUE) | e.g. `invoices.read`, `meters.write` |
| displayName | String | Human-readable name |
| module | String | Module name |
| createdAt | DateTime | Created timestamp |

---

## Domain Relationship Map

```
CoreArea (1) ──→ CoreProject (many)
CoreArea (1) ──→ CoreSettlement (many)
CoreArea (1) ──→ CorePaymentCenter (many)

Project (1) ──→ LocationNode (many, hierarchy: zone→building→floor→unit)
Project (1) ──→ Customer (many)

Customer (1) ──→ CustomerUnitAssignment (many, on Unit)
Customer (1) ──→ Invoice (many)
Customer (1) ──→ Payment (many)
Customer (1) ──→ CustomerLedgerEntry (many, append-only)
Customer (1) ──→ WalletAccount (1)

Meter (1) ──→ MeterAssignment (many, on Customer+Unit)
Meter (1) ──→ SIMAssignment (many, on SIMCard)
Meter (1) ──→ Reading (many)

Invoice (1) ──→ InvoiceLine (many)
Invoice (1) ──→ InvoiceAdjustment (many)
Invoice (1) ←── PaymentAllocation (many, on Payment)

Payment (1) ──→ PaymentFee (many)
Payment (1) ──→ Cheque (many)
Payment (1) ──→ PaymentAllocation (many, on Invoice)

Tariff (1) ──→ TariffVersion (many)
Tariff (1) ──→ TariffCharge (many)
TariffCharge (1) ──→ TariffChargeDetail (many)

CoreUser (1) ──→ CoreUserRoleAssignment (many, on CoreRole)
CoreUser (1) ──→ CoreAuditLog (many)
CoreUser (1) ──→ CoreNotificationQueue (many)
CoreRole (1) ──→ CoreRolePermission (many, on CorePermission)
```
