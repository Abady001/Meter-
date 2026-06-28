# Meter Verse — SYSTEM DNA (DRAFT)

**Version:** 1.0-draft
**Date:** 2026-06-17
**Status:** DRAFT — Pending Stakeholder Ratification
**Authority:** PRIMARY — This document supersedes all prior architecture descriptions
**Source Evidence:** 24 Prisma models, 46 API endpoints, 25 frontend pages, 7 reference systems, 103 certification reports, 32 operational gaps

---

## 1. Vision

Meter Verse is a unified utility metering and billing platform serving 15+ residential/commercial communities (areas) across Egypt. It replaces 3 legacy systems (Collection System Flask, SBill Palm Hills, SBill Estates) with a single NestJS/Next.js platform covering 5 utility types: **Electricity, Water, Solar, Chilled Water, and Gas (planned)**.

The system processes monthly billing cycles for ~50,000 meters across 15 area databases, handling meter-to-customer assignment, reading collection (manual/import/automatic), consumption-based invoice generation, payment recording with allocation, and financial ledger management.

---

## 2. Scope

### In Scope (MVP — T001-T085)

| Domain | Status | Description |
|--------|--------|-------------|
| Authentication & Authorization | ✅ LIVE | JWT-based, 7 roles, RBAC guard |
| Project Management | ✅ LIVE | Multi-project configuration with tax/water/threshold settings |
| Location Hierarchy | ✅ LIVE | 4-level hierarchy: zone → building → floor → unit |
| Customer Management | ✅ LIVE | 4 customer types, unit assignment, statement view |
| Meter Management | ✅ LIVE | 3 meter types (electricity, water_main, water_child), 8-status lifecycle |
| SIM Card Management | ✅ LIVE | 7-status lifecycle with cooldown/reuse |
| Meter+SIM Assignment | ✅ LIVE | Transactional assignment/termination with audit |
| Reading Ingestion | ✅ LIVE | Manual/import/automatic sources, consumption calculation |
| Reading Validation | ✅ LIVE | Per-project thresholds, suspicious flagging |
| Reading Review | ⚠️ PARTIAL | Review queue (GET), but approve/reject/correct actions incomplete |
| Water Balance | ✅ LIVE | Main-vs-sub variance with billable/report-only modes |
| Tariff Management | ✅ LIVE | Flat rate per unit, per meter type, effective date windows |
| Billing Periods | ✅ LIVE | Project-level period tracking (status enum only) |
| Invoice Generation | ⚠️ PARTIAL | Electricity and water invoices with flat-rate tariffs + tax |
| Invoice Issue | ✅ LIVE | Immutability, high-risk approval gate, ledger recording |
| Invoice Adjustments | ✅ LIVE | Credit/debit with reason and audit |
| Payment Recording | ✅ LIVE | 6 methods, oldest-due-first allocation, explicit allocation |
| Payment Reversal | ✅ LIVE | Super-admin only, mandatory reason, balance recalculation |
| Customer Ledger | ✅ LIVE | Append-only, running balance per customer |
| Audit Logging | ✅ LIVE | Append-only, all sensitive actions captured |
| Action Permission Gating | ✅ LIVE | Frontend-level action visibility control |
| Dashboard KPIs | ✅ LIVE | Project-level summaries and activity |

### In Scope (v2.0.0 — T086-T120)

| Domain | Status | Description |
|--------|--------|-------------|
| Solar Wallet | 🔲 PLANNED | Solar meter type, production readings, net metering, wallet ledger |
| Chilled Water Billing | 🔲 PLANNED | BTU meter type, BTU readings, rate config, chilled water invoices |
| Settlement Engine | 🔲 PLANNED | 3 settlement types, approval workflow, versioning, carry-forward |
| Bill Cycle Governance | 🔲 PLANNED | OPEN→CLOSE→CANCEL with approval, duplicate prevention |
| PDF Generation | 🔲 PLANNED | Invoice/statement/settlement PDFs with Arabic RTL, QR, hash |
| Template Engine V3 | 🔲 PLANNED | Jinja2 HTML templates ported from Flask to NestJS |
| 16-Profile RBAC | 🔲 PLANNED | 9 additional roles, area-scoped middleware, 27 permissions |
| 15 Area Databases | 🔲 PLANNED | Multi-schema: 45 tables per area × 15 = 675 tables |
| Symbiot Bridge | 🔲 PLANNED | 10 TCP × 100 HTTP channels for meter communication |
| i18n (676 keys) | 🔲 PLANNED | Arabic/English UI language toggle |
| Reporting (32 reports) | 🔲 PLANNED | Async export jobs, CSV/XLSX/PDF output |
| Data Migration | 🔲 PLANNED | Solar wallet, SBill PH, SBill Estates, Collection Tracker |

### Out of Scope (T121+)

| Domain | Description |
|--------|-------------|
| Gas billing | Future utility type |
| Alerts→Tickets linkage | T078 — no functional requirement backs this |
| Mobile app | Energy 360 is separate mobile app reference |
| AI/ML-based consumption prediction | Not planned |

---

## 3. Data Architecture

### 3.1 Schema Strategy

Current (MVP): Single schema `sim_system` in PostgreSQL database `Meter_Verse_pulse`

Target (v2.0.0):
```
PostgreSQL cluster
├── Core DB (core schema): Users, Roles, Permissions, Areas, Projects, AuditLog, SystemConfig
├── Features DB (features schema): Tariffs, Charges, Reports, Jobs, Contracts
└── 15 Area DBs (area_{n} schema): Customer data per area — 45 tables each
```

**Architectural Constraints:**
- Multi-schema Prisma with raw SQL for cross-schema references
- Core DB = shared auth/shared config
- Features DB = billing engine, reports, cross-area operations
- Area DBs = per-tenant customer/meter/reading/invoice/payment data
- 3 Availability Plans (Full/Safety/Failover) map to module selection at startup

### 3.2 Current Schema (24 Models, `sim_system`)

```
Core Org (T013):
  Project(id, code, name, status, taxEnabled, taxRate, waterDifferenceMode, readingThresholdProfileId)
  LocationNode(id, projectId, parentId, nodeType, code, name, status)
  Customer(id, projectId, customerCode, name, phone, email, customerType, nationalOrCommercialId, status)
  CustomerUnitAssignment(id, customerId, unitId, startAt, endAt, reason)

Meter & SIM (T014):
  Meter(id, serialNumber, meterType [electricity|water_main|water_child], brand, model, status [8 states], installationDate, activationDate, terminationDate, parentMainMeterId)
  SIMCard(id, iccid, msisdn, provider, ipAddress, ipType, status [7 states], cooldownUntil)
  MeterAssignment(id, meterId, customerId, unitId, projectId, startAt, endAt, changeReason, status)
  SIMAssignment(id, simId, meterId, startAt, endAt, changeReason, status)

Readings & Tariffs (T015):
  Reading(id, meterId, projectId, customerIdSnapshot, unitIdSnapshot, readingValue, readingAt, source, previousReadingValue, consumptionValue, status [6 states], rawPayload)
  ReadingReview(id, readingId, reviewAction, reviewedBy, reviewedAt, reason)
  TariffPlan(id, projectId, meterType, ratePerUnit, currency, effectiveFrom, effectiveTo, status)
  BillingPeriod(id, projectId, periodCode, startDate, endDate, status [open|closed|cancelled])

Invoices (T016):
  Invoice(id, invoiceNumber, projectId, customerId, unitId, meterId, utilityType [electricity|water], billingPeriodId, status [8 states], subtotalAmount, taxAmount, totalAmount, paidAmount, remainingAmount, issuedAt, dueAt, immutableAt)
  InvoiceLine(id, invoiceId, readingId, description, quantity, unitPrice, lineAmount)
  InvoiceAdjustment(id, invoiceId, adjustmentType, amount, reason, approvedBy)

Payments & Ledger (T017):
  Payment(id, paymentNumber, projectId, customerId, paymentDate, method [6 types], amount, status, collectedBy)
  PaymentAllocation(id, paymentId, invoiceId, allocatedAmount, allocationOrder)
  CustomerLedgerEntry(id, customerId, projectId, entryType [5 types], referenceType, referenceId, amountDelta, runningBalance, entryAt)

Infrastructure (T008, T018):
  IdempotencyRecord(id, scopedKey, method, route, actor, requestHash, responseBody, responseStatus, expiredAt)
  AuditLog(id, actorId, actorRole, action, resourceType, resourceId, beforeState, afterState, reason, correlationId, hash)
  ReportJob(id, reportType, status, format, filters, fileUrl, requestedBy, errorMessage)
  ProjectThreshold(id, projectId, meterType, maxConsumptionPerDay, maxConsumptionPerMonth, minConsumptionPerMonth, alertOnNegativeConsumption, alertOnZeroConsumption, alertOnSpike, spikeMultiplier)

Auth:
  RefreshToken(id, token, userId, expiresAt, revokedAt)
  LoginAttempt(id, userId, ipAddress, success, attemptedAt)
```

### 3.3 Missing Tables (Required)

| Table | Purpose | Required By | Priority |
|-------|---------|-------------|----------|
| SolarWalletTransaction | Wallet credit/debit ledger | OR1 (Solar Wallet) | P0 |
| SolarWalletRegister | 180/280 register tracking | OR1 | P1 |
| ChilledWaterConfig | BTU rate/admin fee config | OR2 (Chilled Water) | P0 |
| ChilledWaterSettlement | Per-tenant settlement records | OR2, OR3 | P0 |
| SettlementVersion | Version tracking for settlements | OR3 | P1 |
| BillCycle | Cycle governance with approval workflow | OR5 | P1 |
| TemplateDefinition | Template storage (HTML files) | OR8 | P0 |
| 45 Tables × 15 Areas | Area-specific customer data | G023 | P0 |

### 3.4 Views

Current:
- `meter_assignment_active_view` — One active row per meter
- `sim_assignment_active_view` — One active row per SIM
- `customer_statement_view` — Running balance projection

Required (v2.0.0):
- `solar_wallet_balance_view` — Wallet balance per customer
- `chilled_water_settlement_view` — Settlement history per tenant
- `area_aging_view` — Aging buckets per area

---

## 4. Billing Architecture

### 4.1 Supported Utility Types

| Utility | Meter Type | Invoice Type | Status |
|---------|-----------|--------------|--------|
| Electricity | `electricity` | `electricity` | ✅ LIVE |
| Water | `water_main`, `water_child` | `water` | ✅ LIVE |
| Solar | (not defined) | (not defined) | 🔲 PLANNED |
| Chilled Water | (not defined) | (not defined) | 🔲 PLANNED |
| Settlement | N/A (contractual) | (not defined) | 🔲 PLANNED |

### 4.2 Charge Modes

| Mode | Formula | Status |
|------|---------|--------|
| FLAT | consumption × ratePerUnit | ✅ LIVE |
| STEPS | consumption × stepRate[n] | 🔲 PLANNED |
| STATIC | fixed amount (regardless of consumption) | 🔲 PLANNED |
| PER_UNIT | consumption × rate | 🔲 PLANNED |
| ZERO | no charge | 🔲 PLANNED |

### 4.3 Current Invoice Generation Logic

```
For each meter with billable readings in period:
  1. Resolve tariff: TariffPlan WHERE projectId AND meterType AND effectiveFrom <= period.endDate AND (effectiveTo IS NULL OR effectiveTo >= period.startDate)
  2. Calculate subtotal = Σ(line.quantity × line.unitPrice) where line = consumption × tariff.ratePerUnit
  3. Calculate tax = subtotal × (project.taxRate / 100) if project.taxEnabled
  4. Calculate total = subtotal + tax
  5. Set remainingAmount = total
  6. Set customerId = 'system' (HARDCODED — G012)
  7. Set unitId = 'system' (HARDCODED — G012)
  8. For water_main: apply water difference policy if billable
```

**Known Issues:**
- Customer/unit ID hardcoded (G012)
- Due date not set (G026)
- Destructive regeneration (G018) — deletes before recreating
- No DB unique constraint on (meterId, billingPeriodId, utilityType) — G016
- Only flat-rate tariff — no tiered/step/static/zero charges

### 4.4 Invoice Lifecycle

```
draft → pending_approval (if high-risk) → issued (immutable) → partially_paid → paid
draft → cancelled
issued → overdue (via cron)
```

### 4.5 Payment Allocation

Default: Oldest-due-first
Algorithm:
```
1. Fetch customer's invoices sorted by dueAt ASC (or createdAt if dueAt null)
2. For each invoice with remainingAmount > 0:
     allocated = min(payment.remaining, invoice.remainingAmount)
     invoice.paidAmount += allocated
     invoice.remainingAmount -= allocated
     Create PaymentAllocation(invoiceId, paymentId, allocatedAmount)
     If invoice.remainingAmount == 0: invoice.status = 'paid'
     If payment fully allocated: break
```

---

## 5. Solar Wallet Architecture (Reference — Not Implemented)

### 5.1 Source: Flask Collection System

**Certified through operational use** in the Collection System Flask app. Must be ported to NestJS.

### 5.2 Conceptual Model

```
Customer has SolarWallet with:
  - balance: Decimal (current credit/debit position)
  - last_calculation_date: DateTime

SolarWalletTransaction:
  - id, customer_id, transaction_type (production_credit/consumption_debit/adjustment/carry_forward)
  - amount, previous_balance, new_balance
  - reading_id (FK to production reading)
  - invoice_id (FK to invoice where applied)
  - created_at

SolarRegister:
  - id, meter_id, register_type (180=production, 280=consumption)
  - reading_value, reading_at
```

### 5.3 Wallet Calculation

```
Net = Consumption - Production
If Net > 0: Invoice for Net amount
If Net < 0: Credit Net to wallet (carry-forward to next month)
Wallet_Balance = Σ(credits) - Σ(debits) from wallet transactions
```

### 5.4 Required Tables

| Table | Estimated Columns |
|-------|------------------|
| SolarWallet | customer_id, balance, currency |
| SolarWalletTransaction | customer_id, type, amount, previous_balance, new_balance, reference_type, reference_id |
| SolarRegister | meter_id, register_type, reading_value, reading_at |

---

## 6. Chilled Water Architecture (Reference — Not Implemented)

### 6.1 Source: Flask Collection System (Phase F Certified)

**Certified at 100% accuracy** — 206 BTU invoices replayed, 15 settlements replayed, 1,000 deterministic stress cycles.

### 6.2 Formula

```
Total = Consumption (BTU) × Rate_per_BTU
Default rate: 3.0 EGP/BTU
Custom rate: Per ChilledWaterConfig (e.g., AirZon: 2.44)
Rounding: 2 decimal places
```

### 6.3 Settlement Types

| Type | Calculation | Example Use |
|------|------------|-------------|
| FIXED | monthly_fixed_amount | Administrative fee |
| PERCENTAGE | sum(charges) × percentage | Management fee |
| ONE_TIME | single charge amount | Connection fee |

### 6.4 Settlement Lifecycle

```
ChilledWaterConfig (base_btu_rate, monthly_fixed_amount, admin_fee, service_fee, is_active)
  → ChilledWaterSettlement (version=x, DRAFT)
    → approve_settlement() (APPROVED)
      → Edit creates new version (x+1), original preserved
      → Invoice generated with settlement line
```

### 6.5 Required Tables

| Table | Estimated Columns |
|-------|------------------|
| ChilledWaterConfig | area_id, customer_id, base_btu_rate, monthly_fixed_amount, admin_fee, service_fee, is_active |
| ChilledWaterSettlement | config_id, customer_id, billing_period_id, btu_consumption, rate_per_btu, fixed_amount, variable_amount, total_amount, carry_forward, previous_balance, version, status (DRAFT/APPROVED/CANCELLED) |

---

## 7. Settlement Engine Architecture (Reference — Not Implemented)

### 7.1 Overview

The settlement engine handles contractual charges that are NOT meter-based. It supports 3 types (FIXED, PERCENTAGE, ONE_TIME) with monthly versioning, carry-forward, and approval workflow.

### 7.2 Conceptual Model

```
SettlementConfig:
  - project_id, customer_id, settlement_type (FIXED/PERCENTAGE/ONE_TIME)
  - fixed_amount (for FIXED), percentage (for PERCENTAGE), one_time_amount (for ONE_TIME)
  - effective_from, effective_to
  - is_active, notes

SettlementRecord:
  - config_id, customer_id, billing_period_id
  - calculated_amount, carry_forward, previous_balance, total_amount
  - version (integer, ≥1, increments on edit)
  - status (DRAFT/APPROVED/CANCELLED)
  - approved_by, approved_at
  - invoice_id (nullable — linked after invoice generation)
```

### 7.3 Workflow

```
Config → Create Settlement (DRAFT, version=1)
  → Edit → New version (DRAFT, version=n+1), old preserved
  → Approve (APPROVED) → Blocks further edits
  → Generate Invoice → Settlement amount added to invoice
  → Carry-forward → If payment not received, balance carries to next period
```

---

## 8. Bill Cycle Architecture (Not Implemented)

### 8.1 Current State

BillingPeriod has status enum (open/closed/cancelled) but zero governance logic. Invoice generation works on any period regardless of status.

### 8.2 Required Architecture

```
OPEN (create cycle):
  - Validate no other OPEN cycle for same month/service
  - Set status = open

CLOSE (complete cycle):
  - RBAC guard: only finance/super_admin can close
  - Validate all invoices generated and issued
  - Set status = closed
  - Blocks new invoice generation

CANCELLED:
  - Mandatory reason field
  - Audit trail entry
  - Set status = cancelled
  
CANCEL:
  - Only allowed on draft invoices
  - Mandatory reason + audit

Duplicate Prevention:
  - DB UNIQUE constraint on (meterId, billingPeriodId, utilityType)
  - Application-level guard before generation
```

### 8.3 Transition Constraints

```
OPEN → CLOSED (requires: approval, all invoices generated+issued)
OPEN → CANCELLED (requires: reason, audit)
CLOSED → CANCELLED (requires: super_admin, reason, audit)
No direct CLOSED → OPEN
```

---

## 9. Template & PDF Architecture (Not Implemented)

### 9.1 Reference: Flask template_v3.py

Pipeline:
```
Database → Service → Jinja2 HTML Template → WeasyPrint → PDF
                                                            ↓
                                                    QR Code embedding
                                                    Invoice hash
                                                    Security metadata
                                                    Arabic amount-in-words
```

### 9.2 Required Technology

| Component | Option 1 (Recommended) | Option 2 | Option 3 |
|-----------|----------------------|----------|----------|
| Template engine | Handlebars (with helpers) | EJS | Custom string interpolation |
| PDF renderer | Puppeteer (Chromium) | PDFKit | Playwright |
| QR library | qrcode (npm) | — | — |
| Hash algorithm | SHA-256 | — | — |
| Arabic support | Arabic-Reshaper + Bidi | custom CSS | WeasyPrint subprocess |

### 9.3 Template Inventory

| Template | Type | Fields | Priority |
|----------|------|--------|----------|
| Invoice | Document | 25 fields (header, customer, items, totals, payment/QR, footer) | P0 |
| Statement | Document | 15 fields (header, beginning, entries, ending) | P0 |
| Settlement | Document | 20 fields (period, customer, lines, totals, signatures) | P1 |
| Payment Receipt | Document | 10 fields (header, payment, allocation, totals) | P1 |
| Report | Document | Dynamic columns | P1 |

---

## 10. Security Architecture

### 10.1 Current (MVP)

| Layer | Implementation | Status |
|-------|---------------|--------|
| Authentication | JWT (access + refresh tokens) | ✅ LIVE |
| Password hashing | bcrypt (via Passport) | ✅ LIVE |
| RBAC — Roles | 7 roles matching frontend navigation | ✅ LIVE |
| RBAC — Guard | @Roles() decorator + RolesGuard | ✅ LIVE |
| Project Scope | JWT payload includes projectScope | ✅ LIVE |
| Action Gating | Frontend: ProtectedAction component | ✅ LIVE |
| Error Handling | ErrorEnvelope — no stack leaks | ✅ LIVE |
| Correlation ID | Per-request tracing | ✅ LIVE |
| Audit Logging | Append-only, all sensitive actions | ✅ LIVE |
| Rate Limiting | ThrottlerModule (100 req/60s) | ✅ LIVE |
| Input Validation | class-validator pipes | ✅ LIVE |
| Idempotency | Idempotency-Key interceptor | ✅ LIVE |

### 10.2 Missing (v2.0.0)

| Feature | Required By | Priority |
|---------|-------------|----------|
| SSL/HTTPS | G019 — all traffic plaintext | P0 |
| 16-Profile RBAC | G022 — 9 missing roles | P2 |
| Area-Scoped Middleware | G023 — tenant isolation | P0 |
| Formal Security Audit | G010 — OWASP Top 10 | P1 |
| Penetration Testing | G010 | P1 |
| Secrets Scanning | T112 | P1 |
| Dependency CVE Check | T112 | P1 |
| MFA (optional) | T105 | v2.0.0 |

### 10.3 Roles

Current (MVP):
```
super_admin, project_admin, operator, technician, finance, support, customer
```

Target (v2.0.0, +9):
```
super_admin, system_admin, admin, area_manager, team_leader, operator, technician,
finance, support, customer, collector, meter_reader, inspector, supervisor, accountant, viewer
```

---

## 11. API Architecture

### 11.1 Current Routes (46 endpoints)

All under `/api/v1` prefix. All require JWT except health check.

| Module | Routes | Controller |
|--------|--------|------------|
| Health | GET /health | app.controller |
| Auth | POST /auth/refresh | auth (via Passport) |
| Projects | CRUD + locations + dashboard | projects.controller + locations.controller + dashboard.controller |
| Customers | CRUD + statement | customers.controller |
| Meters | CRUD + assign + terminate | meters.controller |
| SIM Cards | CRUD + eligibility | sim.controller |
| Readings | POST + review-queue | readings.controller |
| Tariffs | GET | billing.controller |
| Periods | GET | billing.controller |
| Invoices | POST generate + issue + adjustments + GET | billing.controller |
| Payments | POST + GET + GET:id + POST reverse | payments.controller |

### 11.2 Missing Routes (Required)

| Route | Module | Priority |
|-------|--------|----------|
| GET /meters/:id/readings | Extended meter detail | P2 |
| GET /meters/:id/invoices | Extended meter detail | P2 |
| GET /meters/:id/payments | Extended meter detail | P2 |
| GET /meters/:id/audit | Extended meter detail | P2 |
| POST /invoices/:id/cancel | Invoice lifecycle | P2 |
| POST /bill-cycles | Bill cycle governance | P1 |
| POST /bill-cycles/:id/close | Bill cycle governance | P1 |
| POST /bill-cycles/:id/cancel | Bill cycle governance | P1 |
| Solar wallet endpoints | Solar wallet | P0 |
| Chilled water endpoints | Chilled water | P0 |
| Settlement endpoints | Settlement engine | P0 |
| POST /reports/exports | Report jobs | P1 |
| GET /reports/exports/:id | Report jobs | P1 |

---

## 12. Frontend Architecture

### 12.1 Current State

- **Framework:** Next.js 16.2.6 (App Router) + React 19 + TypeScript
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **State:** React Query (TanStack Query) for server state
- **Auth:** next-auth v4
- **Build:** `output: "standalone"`, `ignoreBuildErrors: true`
- **Test:** Playwright smoke (`smoke-all-pages.mjs` — 25 views)
- **API Connection:** 15/25 pages use live API (feature-flag gated)
- **10 pages still mock:** Meter Detail, Balances, Reports, Alerts, Tickets, Support, Settings, Invoice Detail (partial), Billing pages (partial)

### 12.2 Component Architecture

```
AppShell.tsx — shell layout with navigation
├── PageKey — route configuration
├── SmartTable — reusable data table
├── PageHeader — consistent page headers
├── StatusBadge — status color-coded badges
├── QueryBoundary — loading/error/empty states
├── ProtectedAction — permission-gated buttons
└── EmptyState — empty data display
```

### 12.3 Missing Pages (v2.0.0)

- **T093** — Customer page (3×5 card grid) with solar wallet display
- **T094** — Meter page (5 types, 11 actions, 8-status)
- **T095** — Balances page (5 tabs with aging)
- **T096** — Payments page (search → history → pay → receipt)
- **T097** — Invoices page (18 columns, preview, pay, delete)
- **T098** — Readings page (unified, quarantine, solar registers)
- **T099** — Meter Lifecycle page (4-stage)
- **T100** — Tariffs page (unified, charges, measurement points)
- **T101** — Workspace (alerts, tickets, kanban, chat)
- **T104** — Locations page (hierarchy tree, smart search)
- **T105** — Login page (Meter Verse theme, role redirect, MFA)
- **T106** — Dashboard (per-area KPIs, 5 Recharts)

---

## 13. Deployment Architecture

### 13.1 Current

```
Developer Machine (Windows):
  ├── Backend: NestJS (localhost:3000)
  ├── Frontend: Next.js (localhost:3100)
  └── Database: PostgreSQL via Docker (localhost:5432)
```

### 13.2 Target (v2.0.0)

```
Production (Ubuntu 22.04):
  ├── Nginx reverse proxy (port 443 — HTTPS)
  │   ├── /api/* → NestJS backend (localhost:3000)
  │   └── /* → Next.js frontend (localhost:3100)
  ├── PostgreSQL cluster (Core + Features + 15 Area DBs)
  ├── Symbiot Bridge (Windows Server)
  │   └── 10 TCP channels (ports 5010-5019) × 100 HTTP each
  └── CI/CD: GitHub Actions
      ├── Ubuntu runner: backend test → build → Docker push
      ├── Ubuntu runner: frontend lint → build → Docker push
      └── Windows runner: Symbiot bridge build
```

---

## 14. Reference Systems

| System | Path | Relevance | Port Status |
|--------|------|-----------|-------------|
| **Collection System** (Flask) | `reference/collection-system/` | Solar wallet, Chilled Water, Settlement, Template V3 — all working reference implementations | 🔲 NOT PORTED |
| **SBill Palm Hills** | `reference/sbill/` | Data source for migration — 18 reports, 27 endpoints | 🔲 NOT MIGRATED |
| **SBill Estates** | `reference/sbill/` | Data source for migration — 5 OBIS reading types | 🔲 NOT MIGRATED |
| **Symbiot** | `reference/symbiot/` | Meter communication protocol spec | 🔲 NOT BUILT |
| **IMS** | `reference/ims/` | Reference only | — |
| **Meter Department** | `reference/meter-department/` | Reference only | — |
| **Energy 360** | `reference/energy-360/` | Mobile app reference | — |

---

## 15. Migration Architecture

### 15.1 Data Sources

| Source | Tables | Records (est.) | Target DB |
|--------|--------|----------------|-----------|
| SBill Palm Hills | ~30 | Unknown | Area DBs |
| SBill Estates | ~30 | Unknown | Area DBs |
| Collection Tracker | 36 tables, 8 schemas | Unknown (months of billing) | Area DBs |
| Solar Wallet (legacy) | Transaction history | From Collection System | Area DBs |

### 15.2 Migration Strategy

```
1. Extract from source (via ETL scripts)
2. Transform to target schema (per T088 template)
3. Validate: row count match, balance match
4. Load to target area DB
5. Verify: run comparison script
6. Rollback on failure (pre-migration snapshot restore, max 2h)
```

### 15.3 Parallel Run (T111)

30-day period where both legacy and Meter Verse process daily operations:
```
Nightly reconciliation report between old and new systems
Zero discrepancy target before cutover
```

---

## 16. Governance Rules

### Rule 1 — Primary Authority
SYSTEM_DNA.md is the single source of truth. Any architecture decision that contradicts it requires a SYSTEM_DNA.md update before implementation.

### Rule 2 — SpecKit First
Every task must follow: Read spec → Read SYSTEM_DNA.md → Read tasks.md → Implement → Test → Update spec → Update tasks.md → Commit.

### Rule 3 — No Implementation Without SYSTEM_DNA
No P0 task may begin implementation until SYSTEM_DNA.md is ratified.

### Rule 4 — No Destructive Operations
Invoice regeneration must use CANCEL+CREATE, never DELETE+CREATE (overrides G018 current behavior).

### Rule 5 — Migration Safety
Every migration script must have a verified rollback before execution on production data. Rollback target: ≤2 hours.

### Rule 6 — Quality Gates (Production)
Production deployment requires: CI/CD passing ✓, SSL ✓, monitoring ✓, backup verified ✓, contract tests passing ✓, security audit passed ✓, load test passed ✓.

### Rule 7 — Audit Everything
Every financial action (invoice create/issue/cancel, payment record/reverse, bill cycle transition, settlement approve) must be logged to append-only audit.

### Rule 8 — Immutability After Issue
Once an invoice is issued (immutableAt set), no direct edits are allowed. Only adjustments (credit/debit) are permitted.

### Rule 9 — Role Minimum
No user-facing feature may bypass RBAC. Server-side guards are mandatory — UI-only gating is insufficient.

### Rule 10 — T088 Dependency Chain
T086 (Core DB) → T087 (Features DB) → T088 (Area DB) — this dependency chain is rigid and must not be reordered.

---

## 17. Operational Rules (Business Logic)

### Billing Rules
| Rule | Description | Enforced? |
|------|-------------|-----------|
| BR-001 | Each meter generates one invoice per utility per period | ⚠️ Yes (soft via pre-delete) |
| BR-002 | Only valid readings are billable | ✅ Yes |
| BR-003 | Tax = subtotal × project.taxRate when project.taxEnabled | ✅ Yes |
| BR-004 | Water difference: billable or report_only per project | ✅ Yes |
| BR-005 | Payment allocated oldest-due-first by default | ✅ Yes |
| BR-006 | Payment reversal: super_admin only, mandatory reason | ✅ Yes |
| BR-007 | Ledger is append-only, running balance is deterministic | ✅ Yes |
| BR-008 | Invoice is immutable after issue (only adjustments) | ✅ Yes |
| BR-009 | High-risk invoices require approval before issue | ✅ Yes |
| BR-010 | Duplicate invoice prevention: unique (meter, period, utility) | ❌ No (G016) |
| BR-011 | Customer/unit resolved from active meter assignment | ❌ No (G012) |
| BR-012 | Due date set as period end + payment terms | ❌ No (G026) |
| BR-013 | Bill cycle OPEN/CLOSE/CANCEL with approval | ❌ No (G007) |

### Solar Rules (Reference)
| Rule | Description | Status |
|------|-------------|--------|
| SR-001 | Production reading (register 180) tracks kWh generated | 🔲 Reference |
| SR-002 | Consumption reading (register 280) tracks kWh used | 🔲 Reference |
| SR-003 | Net = consumption − production | 🔲 Reference |
| SR-004 | Positive net → invoice | 🔲 Reference |
| SR-005 | Negative net → wallet credit (carry forward) | 🔲 Reference |

### Chilled Water Rules (Reference, Phase F Certified)
| Rule | Description | Status |
|------|-------------|--------|
| CR-001 | Total = Consumption × Rate_per_BTU | 🔲 Reference |
| CR-002 | Default rate: 3.0 EGP/BTU | 🔲 Reference |
| CR-003 | Custom rate per ChilledWaterConfig | 🔲 Reference |
| CR-004 | DRAFT→APPROVED workflow (edit guard on approved) | 🔲 Reference |
| CR-005 | Version increments on each edit (append-only) | 🔲 Reference |
| CR-006 | Carry-forward: previous_balance carries to next period | 🔲 Reference |

---

## 18. Success Criteria

### MVP Complete (Current — 84.6% actual)
- [x] JWT auth + 7-role RBAC
- [x] Projects, locations, customers, meters, SIMs CRUD
- [x] Transactional meter/SIM assignment and termination
- [x] Reading ingestion (3 sources) + consumption calculation
- [x] Reading validation with per-project thresholds
- [x] Invoice generation (electricity + water) with tax
- [x] Invoice issue with immutability + high-risk approval
- [x] Payment recording with oldest-due-first allocation
- [x] Payment reversal (super_admin) with audit
- [x] Customer statement with running ledger balance
- [x] Water balance variance (main-vs-sub)
- [x] 12/12 E2E acceptance tests passing
- [x] 280/385 backend tests passing
- [x] 25 frontend views covered in smoke test
- ~[ ] Approve/reject/correct review actions (T048a — pending)
- ~[ ] Invoice cancel endpoint (G017 — pending)
- ~[ ] Report jobs (T073 — pending)

### v2.0.0 Complete (Target — 0%)
- [ ] Solar wallet with production readings, net metering, carry-forward
- [ ] Chilled water billing with BTU readings, config, settlement
- [ ] Settlement engine (3 types, approval, versioning, carry-forward)
- [ ] Bill cycle governance (OPEN→CLOSE→CANCEL, approval, dedup)
- [ ] PDF generation with Arabic RTL, QR, hash, amount-in-words
- [ ] 16-profile RBAC with area-scoped middleware
- [ ] 15 area databases (45 tables each)
- [ ] Symbiot bridge (10 TCP × 100 HTTP)
- [ ] i18n (676 AR/EN keys)
- [ ] 32 reports with async CSV/XLSX/PDF export
- [ ] Data migration from SBill + Collection Tracker
- [ ] CI/CD pipeline (Linux + Windows)
- [ ] Security audit (OWASP Top 10)
- [ ] Load testing (20 concurrent users)
- [ ] Production deployment with SSL, monitoring, backup

---

## 19. Glossary

| Term | Definition |
|------|------------|
| Area | A residential/commercial community (tenant). 15 areas: october, new_cairo, sodic_ednc, sodic_estates, sodic_vye, badya_city, north_coast, uvines_mall, +7 future |
| BTU | British Thermal Unit — measurement for chilled water consumption |
| Charge Mode | Method of calculating invoice charges (FLAT/STEPS/STATIC/PER_UNIT/ZERO) |
| Collection System | Legacy Flask-based billing system (8 schemas, 36 tables) |
| EGP | Egyptian Pound — currency |
| Meter Verse | Current NestJS/Next.js platform |
| OBIS | Object Identification System — standard for electricity meter data |
| Register 180/280 | Solar meter register for production (180) and consumption (280) data |
| Settlement | Contractual charge (non-meter-based) — FIXED/PERCENTAGE/ONE_TIME |
| Symbiot | Meter communication protocol — TCP/HTTP bridge for automatic reading collection |
| Utility Type | Service type (electricity/water/solar/chilled_water/gas) |
| Wallet | Solar energy credit/debit balance for net metering |

---

## 20. Appendix: Evidence Sources

| Source | Path | Usage |
|--------|------|-------|
| Prisma Schema | `backend/prisma/schema.prisma` (666 lines) | Data architecture |
| Tasks | `specs/001-metering-billing-platform/tasks.md` (1146 lines) | Task inventory |
| OR0-OR11 | `reports/or*.md` | Operational gap analysis |
| Phase F | `reports/f*.md` | Chilled water/settlement certification |
| Phase G | `reports/g*.md` | UAT certification |
| Phase H | `reports/h*.md` | Pilot certification |
| AGENTS.md | `AGENTS.md` | T001-T022 memory + v2.0.0 plan |
| Flask Reference | `reference/collection-system/app/` | Solar, Chilled Water, Template implementations |
| Frontend | `Frontend/src/` | UI pages and components |
| Backend | `backend/src/` | Controllers, services, modules |
