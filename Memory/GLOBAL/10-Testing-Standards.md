# Meter Verse — Testing Standards

## Testing Framework

| Type | Tool | Location | Current Count |
|------|------|----------|---------------|
| Unit tests | Jest (NestJS) | `backend/test/` | 35 test files, 287+ tests |
| E2E/Integration | Playwright | `draft/tests/` | 11 enterprise spec files |
| SAST | Semgrep | `backend/` | Custom rules in `.semgrep-rules.yaml` |
| SCA | Snyk | CI pipeline | All dependencies monitored |
| Container scan | Trivy | CI pipeline | Docker images scanned |
| DAST | CodeQL (GitHub) | CI pipeline | GitHub security alerts |
| Dependency updates | Dependabot | GitHub | Auto-PR for vulnerable deps |
| Linting | ESLint | Both | Custom rulesets |
| Type checking | TypeScript (tsc) | Both | strict mode |

---

## Unit Tests (Jest)

### Configuration
- **Config file**: `backend/jest.config.ts`
- **Test root**: `backend/test/`
- **Transform**: ts-jest with ESM module compatibility
- **Module resolution**: Custom `moduleNameMapper` for path aliases

### Test File Organization
```
backend/test/
├── auth/                   # Auth module tests
│   ├── roles.guard.spec.ts        # 15 tests (8 guard + 7 role enum)
│   └── jwt.strategy.spec.ts       # 10 tests
├── audit/                  # Audit module tests
│   ├── audit.service.spec.ts      # 4 tests
│   ├── audit.interceptor.spec.ts  # 12 tests
│   └── audit.decorator.spec.ts    # 4 tests
├── contract/               # Contract/API tests (TDD)
│   ├── meter-assign.contract.spec.ts     # 15 tests
│   ├── meter-terminate.contract.spec.ts  # 12 tests
│   ├── sim-eligibility.contract.spec.ts  # 7 tests
│   ├── reading-create.contract.spec.ts   # 12 tests
│   ├── reading-review-queue.contract.spec.ts # 8 tests
│   ├── invoice-generate.contract.spec.ts # 6 tests
│   ├── invoice-issue.contract.spec.ts    # 8 tests
│   └── invoice-adjustment.contract.spec.ts # 7 tests
├── integration/            # Integration tests
│   └── reading-validation.spec.ts  # 7 tests
└── helpers/                # Test utilities
    └── create-test-app.ts          # NestJS test app factory
```

### Running Tests
```bash
cd backend
npm test                    # Run all tests
npm run test:watch          # Watch mode
npm run test:cov            # Coverage report
npm run test:e2e            # E2E tests
```

### Known Jest Issues

#### uuid ESM Module Fix
The `uuid` package is ESM-only in recent versions. Jest (which uses CommonJS) requires the `transformIgnorePatterns` config to exclude `uuid` from transformation:

```typescript
// jest.config.ts
transformIgnorePatterns: [
  'node_modules/(?!(uuid)/)',
],
```

This fix is already applied in `backend/jest.config.ts`.

#### MeterStateService Provider
`MetersService` depends on `MeterStateService`. Tests for `MetersService` MUST provide `MeterStateService` in the testing module:

```typescript
// In test setup
const module = await Test.createTestingModule({
  providers: [
    MetersService,
    { provide: MeterStateService, useValue: mockMeterStateService },
    // ...
  ],
}).compile();
```

This fix is already applied.

#### Decimal/Numeric Type Handling
Prisma returns `Decimal` types from PostgreSQL. Tests should use `Number()` conversion for assertions:
```typescript
expect(Number(result.totalAmount)).toBe(100.50);
```

---

## Playwright E2E Tests

### Location
`draft/tests/` — generated via Python generator scripts (`gen_*.py`) to avoid encoding issues.

### Running
```bash
node draft/tests/pw-<name>.cjs   # Requires frontend + backend running
```

### Enterprise Test Files (11)
- `pw-meter-lifecycle.spec.cjs`
- `pw-invoice-flow.spec.cjs`
- `pw-payment-allocation.spec.cjs`
- `pw-reading-capture.spec.cjs`
- `pw-customer-management.spec.cjs`
- `pw-auth-rbac.spec.cjs`
- `pw-report-generation.spec.cjs`
- `pw-symbiot-sync.spec.cjs`
- `pw-solar-billing.spec.cjs`
- `pw-settlement.spec.cjs`
- `pw-admin-portal.spec.cjs`

---

## CI/CD Testing

### Current CI Pipeline
- **Location**: `.github/workflows/`
- **Status**: Partially configured
- **Test-agent CI**: **DISABLED** (`if: false`) — pipeline exists but doesn't run

### Validation Gate (Pre-Commit)
Before EVERY commit, the following MUST pass:
1. **Backend build**: `cd backend && npm run build`
2. **Backend tests**: `cd backend && npm test`
3. **Backend lint**: `cd backend && npm run lint`
4. **Frontend build**: `cd Frontend && bun run build`
5. **Frontend lint**: `cd Frontend && bun run lint --no-cache --max-warnings 0`
6. **Security scan**: `cd backend && npx semgrep --config=auto`

### Target CI Pipeline (Future)
```yaml
# Target CI stages
stages:
  - validate: prisma validate, tsc
  - lint: eslint, prettier
  - test: jest, playwright
  - security: semgrep, trivy, snyk, codeql
  - build: docker build, npm build
  - deploy: staging → production
```

---

## Security Scanning

| Scanner | Frequency | Scope | Current Status |
|---------|-----------|-------|----------------|
| Semgrep | Per-commit | Custom rules + auto rules | ACTIVE |
| CodeQL | Per-PR (GitHub) | All TypeScript/JavaScript | ACTIVE |
| Dependabot | Daily | npm dependencies | ACTIVE |
| Trivy | Per-build | Docker containers | ACTIVE |
| Snyk | Weekly | All dependencies | ACTIVE |

### Semgrep Rules
Custom rules in `backend/.semgrep-rules.yaml`:
- No hardcoded secrets
- No SQL injection (safe query construction)
- No insecure JWT handling
- No missing authentication
- No path traversal
- No command injection

---

## Test Targets

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Test count | 350+ | 287 | ⚠️ Short by 63 |
| Code coverage | 70% | Not measured | ❌ |
| Contract tests | 75+ | 75 | ✅ |
| Integration tests | 20+ | 7 | ❌ |
| Playwright specs | 20+ | 11 | ⚠️ |
| Unit test pass rate | 100% | 100% | ✅ |
| Lint pass rate | 0 errors, 0 warnings | 0/0 | ✅ |

---

## Source Files

| File | Purpose |
|------|---------|
| `backend/jest.config.ts` | Jest configuration |
| `backend/.semgrep-rules.yaml` | Semgrep SAST rules |
| `backend/.eslintrc.cjs` | ESLint configuration |
| `backend/package.json` | Test scripts and dependencies |
| `Frontend/eslint.config.mjs` | Frontend ESLint flat config |
| `.github/workflows/` | CI/CD pipeline definitions |
| `ci-cd/` | CI/CD configuration files |
| `draft/tests/` | Playwright E2E test files |
