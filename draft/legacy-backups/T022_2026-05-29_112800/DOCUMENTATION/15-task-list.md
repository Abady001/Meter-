# Task List — Meter Verse MVP

> Ready to paste into Notion as a task database.
> Source: `specs/001-metering-billing-platform/tasks.md`
> Date: 2026-05-28

---

## Phase 1: Setup (Shared Infrastructure)

| ID | Description | Status | Priority |
|----|-------------|--------|----------|
| T001 | Create NestJS backend project scaffold | ✅ Done | High |
| T002 | Add config + PostgreSQL connection module | ✅ Done | High |
| T003 | Configure backend lint/format/test tooling | ✅ Done | High |
| T004 | Initialize Prisma ORM | ✅ Done | High |
| T005 | Add local PostgreSQL via docker-compose | ✅ Done | High |

## Phase 2: Foundational

### Backend Cross-Cutting Infrastructure

| ID | Description | Status | Priority |
|----|-------------|--------|----------|
| T006 | Standard error envelope + global exception filter | ✅ Done | High |
| T007 | Correlation-ID middleware | ✅ Done | High |
| T008 | Idempotency-Key interceptor | ✅ Done | High |
| T009 | Auth (JWT) + RBAC guard + role model | ✅ Done | High |
| T010 | Append-only audit log service + interceptor | ✅ Done | High |
| T011 | API versioning `/api/v1` + OpenAPI serving | ✅ Done | High |
| T012 | Contract-test harness against `meter-verse-api.yaml` | ✅ Done | High |

### PostgreSQL Schema / Migrations

| ID | Description | Status | Priority |
|----|-------------|--------|----------|
| T013 | Project, LocationNode, Customer, CustomerUnitAssignment | ✅ Done | High |
| T014 | Meter, SIMCard, MeterAssignment, SIMAssignment | ✅ Done | High |
| T015 | Reading, ReadingReview, TariffPlan, BillingPeriod | ✅ Done | High |
| T016 | Invoice, InvoiceLine, InvoiceAdjustment | ✅ Done | High |
| T017 | Payment, PaymentAllocation, CustomerLedgerEntry | ✅ Done | High |
| T018 | AuditLog, ReportJob | ✅ Done | Medium |
| T019 | Derived views (customer_statement_view, Meter_Verse_assignment_active_view, sim_assignment_active_view) | ✅ Done | Medium |

### Frontend Sprint 0 Foundation

| ID | Description | Status | Priority |
|----|-------------|--------|----------|
| T020 | FE-001 API client foundation | 🔲 Pending | High |
| T021 | FE-002 React Query integration pattern | 🔲 Pending | High |
| T022 | FE-003 Feature-flag toggles for API migration | 🔲 Pending | High |

---

## Phase 3: User Story 1 — Meter & Location Assignments (P1 🎯)

### Tests (Write First)

| ID | Description | Status | Priority |
|----|-------------|--------|----------|
| T023 | Contract test `assignMeter` (200 + 409) | 🔲 Pending | High |
| T024 | Contract test `terminateMeter` + `getSimEligibility` | 🔲 Pending | High |
| T025 | Integration test — assignment conflict | 🔲 Pending | High |
| T026 | Integration test — SIM reuse after termination | 🔲 Pending | High |

### Backend Implementation

| ID | Description | Status | Priority |
|----|-------------|--------|----------|
| T027 | Projects module (CRUD + status + tax/threshold) | 🔲 Pending | High |
| T028 | Locations module (CRUD over LocationNode hierarchy) | 🔲 Pending | High |
| T029 | Customers module + CustomerUnitAssignment | 🔲 Pending | High |
| T030 | Meters module (CRUD + status lifecycle) | 🔲 Pending | High |
| T031 | SIM module (CRUD + eligibility endpoint) | 🔲 Pending | High |
| T032 | Assignment command + `POST /api/v1/meters/{meterId}/assign` | 🔲 Pending | High |
| T033 | Termination command + `POST /api/v1/meters/{meterId}/terminate` | 🔲 Pending | High |
| T034 | Dashboard summary endpoints | 🔲 Pending | High |

### Frontend Migration

| ID | Description | Status | Priority |
|----|-------------|--------|----------|
| T035 | FE-010 Projects + Locations API migration | 🔲 Pending | High |
| T036 | FE-011 Customers API migration | 🔲 Pending | High |
| T037 | FE-012 Dashboard KPI backend wiring | 🔲 Pending | High |
| T038 | FE-020 Meters + SIM cards API migration | 🔲 Pending | High |
| T039 | FE-021 Meter assignment workflow hardening | 🔲 Pending | High |
| T040 | FE-022 Meter replacement + termination workflow | 🔲 Pending | High |
| T041 | FE-023 SIM cooldown + reuse eligibility UI | 🔲 Pending | Medium |
| T042 | US1 frontend batch validation + graph refresh | 🔲 Pending | High |

---

## Phase 4: User Story 2 — Readings & Consumption (P2)

### Tests (Write First)

| ID | Description | Status | Priority |
|----|-------------|--------|----------|
| T043 | Contract test `createReading` (201 + 422) | 🔲 Pending | Medium |
| T044 | Contract test `listReadingReviewQueue` | 🔲 Pending | Medium |
| T045 | Integration test — reading validation thresholds + suspicious flagging | 🔲 Pending | Medium |

### Backend Implementation

| ID | Description | Status | Priority |
|----|-------------|--------|----------|
| T046 | Project threshold-profile config | 🔲 Pending | Medium |
| T047 | Readings module + `POST /api/v1/readings` | 🔲 Pending | Medium |
| T047a | Automatic polling ingestion adapter | 🔲 Pending | Low |
| T048 | Review queue + actions (approve/reject/correct) | 🔲 Pending | Medium |
| T048a | Water main-vs-sub variance service + `GET /api/v1/projects/{projectId}/water-balance` | 🔲 Pending | Medium |
| T049 | FE-030 Readings API migration | 🔲 Pending | Medium |
| T050 | FE-031 Reading schema + business validation | 🔲 Pending | Medium |
| T051 | FE-032 Anomaly review queue | 🔲 Pending | Medium |
| T051a | Water balance UI migration | 🔲 Pending | Medium |
| T052 | US2 frontend batch validation + graph refresh | 🔲 Pending | Medium |

---

## Phase 5: User Story 3 — Invoices, Payments, Ledger (P3)

### Tests (Write First)

| ID | Description | Status | Priority |
|----|-------------|--------|----------|
| T053 | Contract test `generateInvoices` + `issueInvoice` | 🔲 Pending | Medium |
| T054 | Contract test `addInvoiceAdjustment` | 🔲 Pending | Medium |
| T055 | Contract test `createPayment` + `reversePayment` | 🔲 Pending | Medium |
| T056 | Contract test `getCustomerStatement` | 🔲 Pending | Medium |
| T057 | Integration test — invoice immutability + adjustment flow | 🔲 Pending | Medium |
| T058 | Integration test — oldest-due-first allocation | 🔲 Pending | Medium |
| T059 | Integration test — super-admin-only reversal + audit | 🔲 Pending | Medium |
| T060 | Integration test — ledger running balance | 🔲 Pending | Medium |

### Backend Implementation

| ID | Description | Status | Priority |
|----|-------------|--------|----------|
| T061 | Tariff + billing-period module | 🔲 Pending | Medium |
| T062 | Invoice generation `POST /api/v1/invoices/generate` | 🔲 Pending | Medium |
| T062a | Water difference handling in invoice generation | 🔲 Pending | Medium |
| T063 | Invoice issue `POST /api/v1/invoices/{invoiceId}/issue` | 🔲 Pending | Medium |
| T064 | Invoice adjustments `POST /api/v1/invoices/{invoiceId}/adjustments` | 🔲 Pending | Medium |
| T065 | Payments `POST /api/v1/payments` (oldest-due-first) | 🔲 Pending | Medium |
| T066 | Payment reversal `POST /api/v1/payments/{paymentId}/reverse` | 🔲 Pending | Medium |
| T067 | Ledger service + `GET /api/v1/customers/{customerId}/statement` | 🔲 Pending | Medium |

### Frontend Migration

| ID | Description | Status | Priority |
|----|-------------|--------|----------|
| T068 | FE-040 Invoices API migration + state machine | 🔲 Pending | Medium |
| T069 | FE-041 Payments allocation workflow | 🔲 Pending | Medium |
| T070 | FE-042 Balances aging + collector tooling | 🔲 Pending | Medium |
| T071 | FE-043 Customer statements v1 | 🔲 Pending | Medium |
| T071a | Consumption view migration | 🔲 Pending | Medium |
| T072 | US3 frontend batch validation + graph refresh | 🔲 Pending | Medium |

---

## Phase 6: Polish & Cross-Cutting

| ID | Description | Status | Priority |
|----|-------------|--------|----------|
| T073 | Report export jobs (POST + GET) | 🔲 Pending | Low |
| T074 | Contract test report endpoints | 🔲 Pending | Low |
| T075 | RBAC action-gating + audit coverage tests | 🔲 Pending | Low |
| T076 | FE-050 Reports v2 with async exports | 🔲 Pending | Low |
| T077 | FE-051 Action-level permission gating | 🔲 Pending | Low |
| T078 | FE-052 Alerts → Tickets linkage (out of scope) | 🔲 Pending | Low |
| T079 | FE-060 Frontend contract + integration tests in CI | 🔲 Pending | Low |
| T080 | FE-061 E2E coverage expansion | 🔲 Pending | Low |
| T081 | FE-062 Observability + UX resilience | 🔲 Pending | Low |
| T082 | Polish frontend batch validation + graph refresh | 🔲 Pending | Low |
| T083 | Reconcile full backend contract suite | 🔲 Pending | Low |
| T084 | Run quickstart.md MVP acceptance validation | 🔲 Pending | Low |
| T084a | Backup/restore drill + RPO/RTO verification | 🔲 Pending | Low |
| T085 | Ratify project constitution | 🔲 Pending | Low |

---

**Summary**: 45/85 tasks complete (53%), 40 pending.
