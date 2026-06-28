# Testing Roadmap — Meter Verse

**Generated:** 2026-06-25  

---

## 1. Existing Test Inventory

### 1.1 Test Suites (Backend — 47 test files)

#### Unit Tests (16 files — `backend/test/unit/`)
| Test File | Tests | Status | Coverage Area |
|-----------|-------|--------|---------------|
| `auth/jwt.strategy.spec.ts` | 10 | ✅ | JWT payload validation |
| `auth/roles.guard.spec.ts` | 8 | ✅ | RBAC guard logic |
| `auth/roles.decorator.spec.ts` | 5 | ✅ | Decorator metadata |
| `auth/refresh-token.service.spec.ts` | — | ✅ | Refresh token rotation |
| `auth/password-policy.service.spec.ts` | — | ✅ | Password policy validation |
| `auth/endpoint-access.spec.ts` | — | ✅ | Endpoint auth assertions |
| `audit/audit.service.spec.ts` | 4 | ✅ | Audit log creation |
| `audit/audit.interceptor.spec.ts` | 12 | ✅ | Interceptor behavior |
| `audit/audit.decorator.spec.ts` | 4 | ✅ | Decorator metadata |
| `audit/security-audit.service.spec.ts` | — | ✅ | Security audit logic |
| `projects/projects.service.spec.ts` | — | ✅ | Project CRUD service |
| `projects/projects.controller.spec.ts` | — | ✅ | Project CRUD controller |
| `projects/locations/locations.service.spec.ts` | — | ✅ | Location service |
| `projects/locations/locations.controller.spec.ts` | — | ✅ | Location controller |
| `projects/dashboard/dashboard.service.spec.ts` | — | ✅ | Dashboard KPIs |
| `projects/dashboard/dashboard.controller.spec.ts` | — | ✅ | Dashboard controller |
| `customers/customers.service.spec.ts` | — | ✅ | Customer service |
| `customers/customers.controller.spec.ts` | — | ✅ | Customer controller |
| `meters/meters.service.spec.ts` | — | ✅ | Meter service |
| `meters/meters.controller.spec.ts` | — | ✅ | Meter controller |
| `sim-cards/sim-cards.service.spec.ts` | — | ✅ | SIM card service |
| `sim-cards/sim-cards.controller.spec.ts` | — | ✅ | SIM card controller |
| `readings/readings.service.spec.ts` | — | ✅ | Reading service |
| `readings/water-balance.service.spec.ts` | — | ✅ | Water balance service |
| `readings/polling.service.spec.ts` | — | ✅ | Polling scheduler |
| `projects/thresholds/threshold.service.spec.ts` | — | ✅ | Threshold service |

#### Integration Tests (7 files — `backend/test/integration/`)
| Test File | Tests | Coverage Area |
|-----------|-------|--------------|
| `reading-validation.spec.ts` | 7 | Reading validation + auth |
| `sim-reuse.spec.ts` | — | SIM card reuse rules |
| `payment-reversal.spec.ts` | — | Payment reversal |
| `payment-allocation.spec.ts` | — | Payment allocation logic |
| `ledger-balance.spec.ts` | — | Ledger balance accuracy |
| `invoice-immutability.spec.ts` | — | Invoice immutability after issue |
| `assignment-conflict.spec.ts` | — | Assignment conflict detection |

#### Contract Tests (10 files — `backend/test/contract/`)
| Test File | Tests | Coverage Area |
|-----------|-------|--------------|
| `meter-assign.contract.spec.ts` | 15 | assignMeter contract |
| `meter-terminate.contract.spec.ts` | 12 | terminateMeter contract |
| `sim-eligibility.contract.spec.ts` | 7 | SIM eligibility contract |
| `reading-create.contract.spec.ts` | — | Create reading contract |
| `reading-review-queue.contract.spec.ts` | — | Review queue contract |
| `invoice-generate.contract.spec.ts` | — | Invoice generation contract |
| `invoice-issue.contract.spec.ts` | — | Invoice issue contract |
| `invoice-adjustment.contract.spec.ts` | — | Invoice adjustment contract |
| `payments.contract.spec.ts` | — | Payment contract |
| `statement.contract.spec.ts` | — | Customer statement contract |
| `setup.spec.ts` | — | Test setup utilities |

#### E2E Tests (1 file)
| Test File | Tests | Coverage Area |
|-----------|-------|--------------|
| `e2e/acceptance.spec.ts` | — | End-to-end acceptance flow |

#### Other Tests (3 files)
| Test File | Coverage Area |
|-----------|--------------|
| `idempotency.spec.ts` | Idempotency key handling |
| `error-envelope.spec.ts` | Error response format |
| `correlation.spec.ts` | Correlation middleware |

### 1.2 Test Results Summary
- **Total tests:** 287/287 passing (34 suites)
- **Unit tests:** ~150+
- **Integration tests:** ~50+
- **Contract tests:** ~60+ (some TDD-failing expected)
- **E2E tests:** ~5+

### 1.3 Test Configuration
- **Framework:** Jest (`@nestjs/testing`, `ts-jest`)
- **Config file:** `backend/jest.config.ts`
- **Test watch:** `npm test`
- **Coverage threshold:** Not configured
- **Test database:** No dedicated test DB — uses mocks

### 1.4 Frontend Tests
- **Playwright config:** Present (`Frontend/playwright.config.ts`)
- **Smoke tests:** `scripts/smoke-all-pages.mjs` — page-level smoke test
- **Unit tests:** `Frontend/src/__tests__/` — empty/present directory
- **Testing framework:** Bun test runner (potential), Playwright ^1.60.0

---

## 2. Coverage Gaps

### 2.1 Backend Module Coverage Gap
| Module | Endpoints | Unit Tests | Integration Tests | Contract Tests | Coverage % |
|--------|-----------|------------|-------------------|----------------|-----------|
| Auth | 6 | ✅ 5 files | ❌ | ❌ | ~60% |
| Projects | 5 | ✅ 2 files | ❌ | ❌ | ~40% |
| Customers | 8 | ✅ 2 files | ❌ | ❌ | ~25% |
| Meters | 7 | ✅ 2 files | ❌ | ✅ 2 files | ~40% |
| SIM Cards | 6 | ✅ 2 files | ❌ | ✅ 1 file | ~50% |
| Readings | 6 | ✅ 2 files | ✅ 1 file | ✅ 2 files | ~70% |
| Billing | 12 | ❌ | ❌ | ✅ 3 files | ~30% |
| Payments | 5 | ❌ | ✅ 2 files | ✅ 1 file | ~60% |
| Invoices | 2 | ❌ | ✅ 1 file | ❌ | ~50% |
| Notifications | 5 | ❌ | ❌ | ❌ | 0% |
| Tickets | 8 | ❌ | ❌ | ❌ | 0% |
| Support | 6 | ❌ | ❌ | ❌ | 0% |
| Reports | 6 | ❌ | ❌ | ❌ | 0% |
| Settings | 3 | ❌ | ❌ | ❌ | 0% |
| Search | 1 | ❌ | ❌ | ❌ | 0% |
| Upload | 6 | ❌ | ❌ | ❌ | 0% |
| Downloads | 4 | ❌ | ❌ | ❌ | 0% |
| Users | 6 | ❌ | ❌ | ❌ | 0% |
| Admin | 6 | ❌ | ❌ | ❌ | 0% |
| Areas | 5 | ❌ | ❌ | ❌ | 0% |
| Registration | 7 | ❌ | ❌ | ❌ | 0% |
| KPI | 3 | ❌ | ❌ | ❌ | 0% |
| Wallet | 5 | ❌ | ❌ | ❌ | 0% |
| Solar | 6 | ❌ | ❌ | ❌ | 0% |
| Settlement | 4 | ❌ | ❌ | ❌ | 0% |
| Chilled Water | 5 | ❌ | ❌ | ❌ | 0% |
| Bill Cycle | 6 | ❌ | ❌ | ❌ | 0% |
| Unit Types | 4 | ❌ | ❌ | ❌ | 0% |
| Collections | 4 | ❌ | ❌ | ❌ | 0% |
| Water Balance | 1 | ✅ 1 file | ❌ | ❌ | ~50% |

### 2.2 Specific Coverage Gaps

#### Critical Missing Tests
1. **Billing Engine** — No invoice generation test (most complex business logic)
2. **Tariff Engine** — No charging calculation tests (STEPS/FLAT/STATIC/PER_UNIT/ZERO)
3. **Payment Allocation** — No test for oldest-due-first allocation logic
4. **Customer Ledger** — No running balance accuracy test
5. **Area Guard** — No test for multi-area isolation
6. **ProjectAccessGuard** — No test for cross-project access denial
7. **Rate Limiting** — No test for throttle enforcement
8. **CSRF** — No test for token validation
9. **Idempotency** — No test for duplicate request rejection
10. **All integration tests** — No real DB test (all mocked)

#### Test Type Gaps
| Test Type | Has? | Count | Gap |
|-----------|------|-------|-----|
| Unit tests | ✅ | ~26 files | 20+ modules still untested |
| Integration tests | ✅ | 7 files | No DB-backed integration tests |
| Contract tests | ✅ | 10 files | Missing for ~25 modules |
| E2E tests | ⚠️ | 1 file | Only acceptance, no user flows |
| Security tests | ❌ | 0 | No OWASP/injection tests |
| Load tests | ❌ | 0 | No performance benchmarks |
| UI tests | ❌ | 0 | No Playwright component/page tests |
| Accessibility tests | ❌ | 0 | No a11y audit |
| API fuzz tests | ❌ | 0 | No random-input testing |
| Mutation tests | ❌ | 0 | No test quality metric |

---

## 3. Recommended Testing Tools

| Tool | Use Case | Priority | Cost | Notes |
|------|----------|----------|------|-------|
| **Jest** | Unit + integration tests | P0 | Free | Already used |
| **Playwright** | E2E + component tests | P0 | Free | Already installed for Frontend |
| **Supertest** | HTTP contract tests | P0 | Free | Already installed |
| **Faker.js** | Test data generation | P1 | Free | Replace hardcoded test data |
| **Testcontainers** | DB-backed integration tests | P1 | Free | PostgreSQL test containers |
| **Artillery / k6** | Load/performance testing | P2 | Free/Paid | Billing engine load test |
| **OWASP ZAP** | DAST security scanning | P2 | Free | Automated security audit |
| **Synk / npm audit** | Dependency scanning | P1 | Free/Paid | Already use overrides |
| **ESLint-plugin-security** | Static analysis | P1 | Free | Already installed |
| **Semgrep** | SAST rule engine | P2 | Free | Rule set in `.semgrep-rules.yaml` |
| **Puppeteer** | PDF rendering tests | P2 | Free | Already installed |
| **Lighthouse CI** | Performance + a11y | P3 | Free | Frontend metrics |
| **Husky** | Pre-commit hooks | P1 | Free | Already installed |
| **lint-staged** | Pre-commit linting | P1 | Free | Already configured |

---

## 4. Recommended Test Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    CI/CD Pipeline                        │
├─────────────────────────────────────────────────────────┤
│  1. Lint & Static Analysis                              │
│     ├─ ESLint (+ security plugin)                       │
│     ├─ Prettier (format check)                          │
│     ├─ Semgrep (custom rules)                           │
│     └─ Trivy / npm audit (vulnerabilities)              │
│                                                         │
│  2. Build & Compile                                     │
│     ├─ tsc (TypeScript compilation)                     │
│     └─ NestJS build                                     │
│                                                         │
│  3. Unit Tests (Jest) ← 5-10s                           │
│     ├─ All modules + services                           │
│     ├─ Guards, interceptors, middleware                  │
│     └─ DTO validation                                   │
│                                                         │
│  4. Integration Tests (Jest + Testcontainers) ← 60s     │
│     ├─ Real PostgreSQL via Testcontainers                │
│     ├─ Prisma migrations applied                        │
│     └─ Full module-to-DB integration                    │
│                                                         │
│  5. Contract Tests (Supertest + Jest) ← 30s             │
│     ├─ HTTP endpoint validation                         │
│     ├─ OpenAPI spec compliance                          │
│     └─ Status codes, error shapes                       │
│                                                         │
│  6. E2E Tests (Playwright) ← 120s                       │
│     ├─ Full frontend + backend deployment               │
│     ├─ User login flows                                 │
│     ├─ CRUD operations                                  │
│     └─ Billing lifecycle                                │
│                                                         │
│  7. Security Scan (OWASP ZAP) ← 300s                    │
│     ├─ API spider + active scan                         │
│     ├─ SQL injection, XSS, CSRF checks                  │
│     └─ Authentication bypass tests                      │
│                                                         │
│  8. Load Test (k6) ← 120s                               │
│     ├─ Billing endpoint burst                           │
│     ├─ Concurrent reading submissions                   │
│     └─ Report generation stress                         │
│                                                         │
│  9. Report & Notify                                     │
│     ├─ Coverage report (threshold: 80% min)             │
│     ├─ Security report (ZAP + Semgrep)                  │
│     └─ Performance benchmarks                           │
└─────────────────────────────────────────────────────────┘
```

---

## 5. Test Environment Architecture

```
┌─────────────────────────────────────────────────┐
│                Docker Compose (CI)               │
│                                                   │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐         │
│  │  DB:5432 │  │  BE:3001│  │  FE:3000│         │
│  │PostgreSQL│  │ NetsJS  │  │ Next.js │         │
│  │  test DB │  │  API    │  │  App    │         │
│  └─────────┘  └─────────┘  └─────────┘         │
│       │            │              │              │
│       └──────┬─────┘              │              │
│              │                    │              │
│        ┌─────▼────────────────────┘              │
│        │  Playwright Runner                       │
│        │  (pipeline agent)                        │
│        └─────────────────────────────────────────┘
│                                                   │
│  ┌─────────────────────────────────┐              │
│  │  OWASP ZAP Container            │              │
│  │  (spider + active scan)         │              │
│  └─────────────────────────────────┘              │
└─────────────────────────────────────────────────┘
```

---

## 6. Implementation Roadmap

| Phase | Tasks | Timeline | Effort |
|-------|-------|----------|--------|
| **Phase 1: Foundation** | Add Jest coverage threshold (80%), create test DB script, document test patterns | Week 1 | 2 days |
| **Phase 2: Critical Unit Tests** | Billing, Tariff, Payment, Ledger, Area, ProjectAccess guards | Week 2-3 | 5 days |
| **Phase 3: Integration Tests** | Testcontainers setup, DB-backed tests for all CRUD modules | Week 4-5 | 5 days |
| **Phase 4: Contract Tests** | Complete all 30+ modules' OpenAPI contract tests | Week 6-7 | 5 days |
| **Phase 5: Frontend Tests** | Playwright component tests for all 30 pages, page smoke tests | Week 8-9 | 5 days |
| **Phase 6: E2E Flows** | Login → Create customer → Assign meter → Readings → Invoice → Payment | Week 10 | 3 days |
| **Phase 7: Security Tests** | OWASP ZAP integration, Semgrep rules, auth bypass tests | Week 11 | 3 days |
| **Phase 8: Load Tests** | k6 scripts for billing engine, report generation, concurrent users | Week 12 | 3 days |
| **Phase 9: CI Pipeline** | GitHub Actions with all stages, coverage gates, security checks | Week 13 | 3 days |

**Total estimated effort: 34 person-days**

---

## 7. Current Testing Command Reference

| Command | Location | Description |
|---------|----------|-------------|
| `npm test` | `backend/` | Run all Jest tests |
| `npm run build` | `backend/` | TypeScript compilation check |
| `npm run lint` | `backend/` | ESLint check |
| `bun run lint` | `Frontend/` | Frontend ESLint check |
| `bun run build` | `Frontend/` | Next.js build check |
| `bun run test:smoke` | `Frontend/` | Build + page smoke test |
| `bun run dev` | `Frontend/` | Dev server for E2E |
| `npm run start:dev` | `backend/` | Backend dev server |
| `npx prisma validate` | `backend/` | Prisma schema validation |
| `npx prisma migrate status` | `backend/` | Migration status |
