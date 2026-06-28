# 03 — Data Model

## Schema Assignment: Which Table Goes Where

### core schema (16 tables)
Tables that are shared across all areas — auth, config, projects.

| Table | Purpose |
|-------|---------|
| core.CoreUser | Users (id, username, email, password_hash, status) |
| core.CoreRole | Roles (id, role_name, role_code, description) |
| core.CorePermission | Permissions (id, permission_code, description) |
| core.CoreRolePermission | Role ↔ Permission join |
| core.CoreUserRoleAssignment | User ↔ Role join (with optional area_id) |
| core.CoreArea | Area registry (code, name, db_schema, status) |
| core.CoreProject | Projects (shared across areas) |
| core.CoreAuditLog | Append-only audit trail |
| core.CoreSystemConfig | Key-value system settings |
| core.CoreNotificationQueue | Notification queue |
| core.CorePaymentCenter | Payment center locations |
| core.CoreBankAccount | Bank accounts for payments |
| core.CoreHoliday | Calendar holidays |
| core.CoreLocationZone | Location zones/zones |
| core.CoreUnitType | Unit type definitions |
| core.CoreCustomerGroup | Customer groups |
| core.CoreSettlement | Settlement configurations |

### features schema (~36 tables)
Billing engine, tariffs, reports, wallets — shared across areas.

| Table | Purpose |
|-------|---------|
| features.TariffPlan | Tariff plans |
| features.TariffVersion | Versioned tariff definitions |
| features.TariffCharge | Charge types per tariff |
| features.TariffChargeDetail | Charge rates and tiers |
| features.ReportDefinition | Report template definitions |
| features.ReportExport | Generated report exports |
| features.ScheduledJob | Scheduled job definitions |
| features.RunningActivity | Currently running jobs |
| features.ContractualRequest | Contract change requests |
| features.WalletAccount | Solar/money wallet accounts |
| features.WalletTransaction | Wallet transactions |
| features.WalletBalance | Wallet balance snapshots |
| features.WalletAllocation | Wallet fund allocation |
| features.WalletTransfer | Wallet-to-wallet transfers |
| features.ChilledWaterConfig | Chilled water rate config |
| features.ChilledWaterReading | BTU readings |
| features.ChilledWaterConsumption | BTU consumption calc |
| features.ChilledWaterInvoice | BTU invoices |
| features.ChilledWaterAllocation | BTU cost allocation |
| features.SettlementConfig | Settlement configuration |
| features.SettlementPeriod | Settlement periods |
| features.SettlementRule | Settlement rules |
| features.SettlementTransaction | Settlement transactions |
| features.SettlementAllocation | Settlement allocations |
| features.BillingCycle | Billing cycle governance |
| features.BillingCycleProject | Per-project billing cycles |
| features.BillingCycleApproval | Cycle approval workflow |
| features.BillingCycleAudit | Cycle audit trail |
| features.DocumentTemplate | Invoice/statement templates |
| features.TemplateVersion | Versioned templates |
| features.GeneratedDocument | Generated document cache |
| features.DocumentAudit | Document access audit |
| features.InvoiceHash | Invoice integrity hashes |
| features.InvoiceQrCode | Invoice QR codes |
| features.InvoiceGenerationBatch | Batch invoice tracking |

### area_{n} schema (45 tables — replicated per area)
Customer data — fully isolated per area.

| Domain | Tables |
|--------|--------|
| **Core (10)** | Customer, CustomerMeter, MeterReading, SIMCard, SIMAssignment, MeterStatusLog, ReadingReview, ReadingThreshold, MeterCalibration, MeterTransfer |
| **Billing (10)** | InvoiceDetail, Transaction, PaymentAllocation, CustomerLedgerEntry, JournalEntry, PaymentPlan, LateFee, Deposit, Refund, Dispute |
| **Energy (4)** | WaterBalance, SolarWalletTransaction, ChilledWaterSettlement, UsageSummary |
| **Support (10)** | Alert, ChatMessage, Task, Approval, Attachment, TroubleTicket, CollectionAction, Contract, Subscription, WorkOrder |
| **Security (8)** | OtpCode, ApiKey, WebhookSubscription, PaymentGatewayLog, IntegrationLog, DataSyncTracker, SchemaVersion, UserSession |
| **Utility (3)** | ExportHistory, InvoiceLine, MeterConstant |

### Current sim_system schema (MVP — ~50 tables)
All current data lives here. Will be **deprecated** after migration to core/features/area schemas.

Key tables: Project, Location, Building, Floor, Unit, Customer, Meter, MeterAssignment, MeterStatusLog, SimCard, SimAssignment, Reading, ReadingReview, Invoice, InvoiceLine, Payment, PaymentAllocation, CustomerLedgerEntry, Alert, Ticket, TicketComment, SupportTicket, ReportTemplate, ReportExport, Setting, Notification, NotificationPreference, UploadHistory, AuditLog, Service, TariffPlan, BillingPeriod
