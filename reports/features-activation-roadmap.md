# Features Schema Activation Roadmap — 8-Week Plan

> **Classification**: EVIDENCE-BASED CERTIFICATION — no code changes
> **Source**: `backend/prisma/schema.prisma` features section (lines 1138-1949), `backend/src/` code analysis
> **Team**: ~3 developers (backend NestJS, database, testing)
> **Total estimate**: ~120 developer-days

---

## Assumptions

1. PostgreSQL + Prisma ORM are already configured (confirmed: `schema.prisma` datasource has `features` schema)
2. All `features` schema migrations have been applied (confirmed: 44 `@@schema("features")` entries exist)
3. `sim_system` tables remain operational during activation (dual-write or view-based transition)
4. Testing infrastructure exists (confirmed: Jest + Supertest, 287+ existing tests)
5. Frontend API migration is NOT in scope — backend-only activation

---

## Week 1: Tariff APIs (Low Risk)

### Tables to Activate
| Table | Model | Current Status |
|-------|-------|---------------|
| `features.tariffs` | `Tariff` | Schema only — `TariffEngineService` reads it (20% of functionality) |
| `features.tariff_versions` | `TariffVersion` | Schema only — zero code |
| `features.tariff_charges` | `TariffCharge` | Schema only — `TariffEngineService` reads it (100% of charge calc) |
| `features.tariff_charge_details` | `TariffChargeDetail` | Schema only — `TariffEngineService` reads it (step tiers) |

### Files to Create
| File | Purpose | Lines Estimate |
|------|---------|---------------|
| `src/features/tariffs/tariffs.controller.ts` | CRUD API for tariffs, versions, charges | ~300 |
| `src/features/tariffs/tariffs.service.ts` | Business logic, version management, charge validation | ~400 |
| `src/features/tariffs/tariffs.module.ts` | Module registration | ~30 |
| `test/integration/tariffs.spec.ts` | Integration tests (create tariff, add charges, simulate) | ~200 |

### Existing Code Already Working
- `TariffEngineService.calculateCharges()` at `src/billing/tariff-engine.service.ts:19` — reads `features.tariffs`, `features.tariff_charges` with charge details, implements all 5 charge modes (lines 55-97)
- `BillingController.simulateTariff()` at `src/billing/billing.controller.ts:519` — exposes tariff simulation endpoint
- `TariffService.getEffectiveTariff()` at `src/billing/tariffs/tariff.service.ts` — reads tariffs

### Risk Assessment: **LOW**
- TariffEngineService proves the data model works end-to-end
- Only CRUD + version management APIs are missing
- No existing functionality depends on these APIs (TariffEngineService uses Prisma directly)

### Deliverables
- `POST/GET/PUT/DELETE /api/v1/features/tariffs`
- `POST/GET /api/v1/features/tariffs/:id/versions`
- `POST/GET /api/v1/features/tariffs/:id/charges`
- `POST/GET /api/v1/features/tariffs/:id/charges/:chargeId/details`
- Tariff simulation endpoint (already exists at `/api/v1/tariffs/simulate`)

---

## Week 2: Bill Cycle Governance (Medium Risk)

### Tables to Activate
| Table | Model | Current Status |
|-------|-------|---------------|
| `features.billing_cycles` | `BillingCycle` | Schema only — zero code |
| `features.billing_cycle_projects` | `BillingCycleProject` | Schema only — zero code |
| `features.billing_cycle_approvals` | `BillingCycleApproval` | Schema only — zero code |
| `features.billing_cycle_audits` | `BillingCycleAudit` | Schema only — zero code |

### Files to Create
| File | Purpose | Lines Estimate |
|------|---------|---------------|
| `src/features/billing-cycle/billing-cycle.controller.ts` | Cycle CRUD, state transitions, approvals | ~400 |
| `src/features/billing-cycle/billing-cycle.service.ts` | State machine (OPEN→LOCKED→APPROVED→CLOSED), audit logging | ~500 |
| `src/features/billing-cycle/billing-cycle.module.ts` | Module registration | ~30 |
| `src/features/billing-cycle/billing-cycle.guard.ts` | Prevents invoice generation when cycle is locked | ~50 |
| `test/features/billing-cycle.spec.ts` | State machine tests, approval workflow, audit verification | ~250 |

### Integration Points
- `BillingController.generateInvoices()` must check cycle status before allowing generation
- `sim_system.BillingPeriod` remains as the date-range definition — `BillingCycle` wraps it with governance

### Risk Assessment: **MEDIUM**
- State machine logic is new — no existing code to reuse
- Must integrate with existing `sim_system.BillingPeriod` without breaking current invoice generation
- Audit trail requirement adds complexity

### Deliverables
- `POST/GET /api/v1/features/billing-cycles`
- `POST /api/v1/features/billing-cycles/:id/lock` (LOCKED)
- `POST /api/v1/features/billing-cycles/:id/approve` (APPROVED)
- `POST /api/v1/features/billing-cycles/:id/close` (CLOSED)
- `GET /api/v1/features/billing-cycles/:id/audit`

---

## Week 3: Invoice Batch Tracking (Medium Risk)

### Tables to Activate
| Table | Model | Current Status |
|-------|-------|---------------|
| `features.invoice_generation_batches` | `InvoiceGenerationBatch` | Schema only — zero code |

### Files to Create/Modify
| File | Purpose | Lines Estimate |
|------|---------|---------------|
| `src/features/batch/invoice-batch.service.ts` | Batch lifecycle management, error tracking | ~250 |
| Modified: `src/billing/billing.controller.ts` | Hook into batch creation during generate | ~50 |
| `test/features/invoice-batch.spec.ts` | Batch generation, retry, error logging tests | ~200 |

### Integration Points
- Modify `BillingController.generateInvoices()` at `billing.controller.ts:46-156` to:
  1. Create `InvoiceGenerationBatch` record before processing (line ~53)
  2. Track successful/failed count during loop (line ~88)
  3. Update batch record on completion (line ~151)
- Add `batchId` field to `sim_system.Invoice` model (Prisma migration)

### Risk Assessment: **MEDIUM**
- Modifies existing `BillingController.generateInvoices()` — must not break current functionality
- Error tracking requires careful exception handling (current code has a try/catch at line 152)
- Schema migration needed to add `batchId` to `sim_system.Invoice`

### Deliverables
- `GET /api/v1/features/invoice-batches` — list batches with stats
- `GET /api/v1/features/invoice-batches/:id` — batch detail with error log
- `POST /api/v1/features/invoice-batches/:id/retry` — retry failed invoices
- Existing generate endpoint enhanced with batch tracking

---

## Week 4: Settlement Engine (Low Risk)

### Tables to Activate
| Table | Model | Current Status |
|-------|-------|---------------|
| `features.settlement_configs` | `SettlementConfig` | Schema only — zero code |
| `features.settlement_periods` | `SettlementPeriod` | Schema only — zero code |
| `features.settlement_rules` | `SettlementRule` | Schema only — zero code |
| `features.settlement_transactions` | `SettlementTransaction` | Schema only — zero code |
| `features.settlement_allocations` | `SettlementAllocation` | Schema only — zero code |

### Files to Create
| File | Purpose | Lines Estimate |
|------|---------|---------------|
| `src/features/settlement/settlement.controller.ts` | Settlement config, period, rule, transaction CRUD | ~350 |
| `src/features/settlement/settlement.service.ts` | Settlement calculation engine, allocation logic | ~500 |
| `src/features/settlement/settlement.module.ts` | Module registration | ~30 |
| `test/features/settlement.spec.ts` | Calculation tests, allocation verification | ~200 |

### Existing Code
- `SettlementController` at `src/settlement/settlement.controller.ts:10-66` — currently writes to `sim_system.invoice` as a workaround. This should be refactored to use `features.settlement_transactions`.

### Risk Assessment: **LOW**
- No existing functionality depends on the current `SettlementController` workaround (it only has 2 GET endpoints and 2 POST endpoints)
- Settlement is a standalone engine with no cross-module dependencies
- The `SettlementController` workaround can be deprecated without breaking anything

### Deliverables
- `POST/GET/PUT /api/v1/features/settlement/configs`
- `POST/GET /api/v1/features/settlement/periods`
- `POST/GET /api/v1/features/settlement/rules`
- `POST /api/v1/features/settlement/transactions` — execute settlement calculation
- `GET /api/v1/features/settlement/transactions/:id/allocations`
- Refactored legacy `SettlementController` to delegate to new settlement service

---

## Week 5: Wallet/Credit Engine (Medium Risk)

### Tables to Activate
| Table | Model | Current Status |
|-------|-------|---------------|
| `features.wallet_accounts` | `WalletAccount` | Schema only — zero code |
| `features.wallet_transactions` | `WalletTransaction` | Schema only — zero code |
| `features.wallet_balances` | `WalletBalance` | Schema only — zero code |
| `features.wallet_allocations` | `WalletAllocation` | Schema only — zero code |
| `features.wallet_transfers` | `WalletTransfer` | Schema only — zero code |

### Files to Create
| File | Purpose | Lines Estimate |
|------|---------|---------------|
| `src/features/wallet/wallet.controller.ts` | Account CRUD, transactions, transfers | ~350 |
| `src/features/wallet/wallet.service.ts` | Balance calculation, transfer approval, ledger posting | ~450 |
| `src/features/wallet/wallet.module.ts` | Module registration | ~30 |
| `src/features/wallet/wallet-bridge.service.ts` | Wallet credit → Payment conversion | ~150 |
| `test/features/wallet.spec.ts` | Account operations, transfers, bridge tests | ~250 |

### Existing Code
- `SolarWalletService.getWallet()` at `solar-wallet.service.ts:9` — reads `walletAccount` (one table, limited)
- `SolarWalletService.calculateNetMetering()` at `solar-wallet.service.ts:13` — computes net consumption/production

### Risk Assessment: **MEDIUM**
- Wallet-to-payment bridge is new integration — must handle double-entry correctly
- SolarWalletService currently has hardcoded defaults (line 10: `accumulatedProduction: 0`) — must be replaced with real balance queries
- Wallet allocation expiration logic needs careful design

### Deliverables
- `POST/GET /api/v1/features/wallet/accounts`
- `POST /api/v1/features/wallet/accounts/:id/deposit`
- `POST /api/v1/features/wallet/accounts/:id/withdraw`
- `POST /api/v1/features/wallet/transfers`
- `GET /api/v1/features/wallet/accounts/:id/balance`
- `POST /api/v1/features/wallet/allocate` — convert credit to payment (bridge)

---

## Week 6: Document Engine (Low Risk)

### Tables to Activate
| Table | Model | Current Status |
|-------|-------|---------------|
| `features.document_templates` | `DocumentTemplate` | Schema only — zero code |
| `features.template_versions` | `TemplateVersion` | Schema only — zero code |
| `features.generated_documents` | `GeneratedDocument` | Schema only — zero code |
| `features.document_audits` | `DocumentAudit` | Schema only — zero code |

### Files to Create
| File | Purpose | Lines Estimate |
|------|---------|---------------|
| `src/features/documents/document.controller.ts` | Template CRUD, document generation | ~300 |
| `src/features/documents/document.service.ts` | Template rendering (Handlebars/Mustache), version management | ~400 |
| `src/features/documents/document.module.ts` | Module registration | ~30 |
| `test/features/documents.spec.ts` | Template versioning, rendering tests | ~200 |

### Existing Code
- `PaymentReceiptService` at `src/payments/payment-receipt.service.ts` — currently generates PDF receipts (can be refactored to use document templates)
- `InvoiceDocumentModel` at `src/invoices/invoice-document.model.ts` — invoice document data model

### Risk Assessment: **LOW**
- Document engine is standalone — no integration with billing or payment flows needed initially
- Template versioning is append-only and well-understood
- Handlebars/Mustache rendering is standard and well-documented

### Deliverables
- `POST/GET/PUT /api/v1/features/documents/templates`
- `POST /api/v1/features/documents/templates/:id/versions`
- `POST /api/v1/features/documents/generate` — render template with data
- `GET /api/v1/features/documents/:id` — download generated document
- Refactored receipt generation to use document template engine

---

## Week 7: Report Engine (Medium Risk)

### Tables to Activate
| Table | Model | Current Status |
|-------|-------|---------------|
| `features.report_definitions` | `ReportDefinition` | Schema only — zero code |
| `features.report_exports` | `ReportExport` | Schema only — zero code |

### Files to Create
| File | Purpose | Lines Estimate |
|------|---------|---------------|
| `src/features/reports/report.controller.ts` | Report definition CRUD, export requests | ~250 |
| `src/features/reports/report.service.ts` | Report data querying, format conversion (PDF/CSV/Excel) | ~500 |
| `src/features/reports/report.module.ts` | Module registration | ~30 |
| `test/features/reports.spec.ts` | Report export, format verification tests | ~200 |

### Existing Code
- `ReportsController` at `src/reports/reports.controller.ts` — stub report endpoints
- `ReportsService` at `src/reports/reports.service.ts` — stub report service
- `jrxml-catalog.md` documents 44+ JRXML templates that need report definitions created

### Risk Assessment: **MEDIUM**
- Report generation requires JRXML → data query mapping (44 templates to map)
- Format conversion (PDF/CSV/Excel) requires library integration (e.g., pdfkit, exceljs)
- Report export with async generation + file storage adds infrastructure complexity
- Reports must query both `sim_system` and `features` schemas

### Deliverables
- `POST/GET /api/v1/features/reports/definitions`
- `POST /api/v1/features/reports/export` — request async export
- `GET /api/v1/features/reports/exports/:id` — check status, download
- JRXML-to-Definition migration for top-10 reports

---

## Week 8: Integration + Testing (High Risk)

### Scope
| Area | Tasks | Estimate |
|------|-------|----------|
| E2E integration | Invoice generation → batch tracking → cycle audit → settlement → ledger | 5 days |
| Migration scripts | TariffPlan → tariffs migration, settlement view creation | 3 days |
| Performance testing | Load test invoice generation (1000+ meters), tariff engine throughput | 2 days |
| Documentation | API docs, activation checklist, rollback procedures | 2 days |
| Bug fixes | Integration edge cases, error handling, race conditions | 3 days |

### Risk Assessment: **HIGH**
- Integration across 6 independently developed modules always has friction
- Migration scripts must handle production data without data loss
- Performance bottlenecks in tariff engine with large batches
- Rollback planning is critical

### Deliverables
- E2E test suite (50+ tests across all activated modules)
- Migration scripts (tariff, settlement)
- Performance test report
- API documentation (OpenAPI/Swagger)
- Rollback procedures document

---

## Week-by-Week Summary

```
Week   Focus              Tables        Files    Risk   Dev-Days    Dependencies
────   ─────              ──────        ─────    ────   ────────    ────────────
  1    Tariff APIs        4             4        LOW    15          None — standalone
  2    Bill Cycle         4             5        MED    20          Week 1 (tariff reference)
  3    Invoice Batch      1             3        MED    10          Week 2 (cycle status)
  4    Settlement         5             4        LOW    15          None — standalone
  5    Wallet/Credit      5             5        MED    20          Week 3 (payment bridge)
  6    Document Engine    4             4        LOW    15          None — standalone
  7    Report Engine      2             4        MED    15          Week 6 (document output)
  8    Integration + Test All           N/A      HIGH   10          Weeks 1-7
```

**Total: ~120 developer-days across 8 weeks with 3 developers = ~5 calendar weeks**

---

## Risk Matrix

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Tariff engine regression during API build | LOW | HIGH | Comprehensive test suite first (Week 1) |
| Bill cycle lock prevents invoice generation | MED | HIGH | Feature flag: cycle enforcement opt-in |
| Batch tracking fails under load | LOW | MED | Async batch creation, queue-based processing |
| Settlement calculation mismatch | LOW | HIGH | Parallel run with manual verification |
| Wallet double-entry accounting errors | MED | HIGH | ACID transactions, reconciliation reports |
| Report engine performance | MED | MED | Cached report definitions, async export |
| Migration data loss | LOW | CRITICAL | Backup-first approach, rollback scripts |
| Team velocity overestimated | MED | MED | MVP scope per week, defer non-critical features |

---

## Rollback Strategy

Each week's activation must be independently rollbackable:

| Week | Rollback Action | Data Loss Risk |
|------|----------------|---------------|
| 1 | Delete tariff controller, keep sim_system.TariffPlan fallback | None — TariffEngineService already has fallback |
| 2 | Remove cycle check from BillingController | None — cycles are governing only |
| 3 | Remove batch hooks from BillingController | InvoiceGenerationBatch records only — no data loss |
| 4 | Keep sim_system settlement workaround | None — workaround remains functional |
| 5 | Remove wallet controller, keep SolarWalletService | Wallet transaction records orphaned |
| 6 | Remove document controller | Generated documents orphaned — no operational impact |
| 7 | Remove report controller | Report exports orphaned |
| 8 | Full rollback to pre-Weeks 1-7 state | All features data lost — sim_system unaffected |
