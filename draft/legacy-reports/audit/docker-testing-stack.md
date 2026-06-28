# Docker Testing Stack — Meter Verse

**Generated:** 2026-06-25  

This document provides the recommended `docker-compose.testing.yml` configuration and supporting architecture for Meter Verse's testing environment.

---

## 1. Detected Technology Compatibility

| Tool | Version Detected | Image Available | Compatibility |
|------|-----------------|----------------|--------------|
| Node.js | >=20 | `node:20-alpine` | ✅ |
| PostgreSQL | 16 | `postgres:16-alpine` | ✅ |
| NestJS | 10.4.2 | Custom Dockerfile | ✅ |
| Next.js | 16.2.6 | Custom Dockerfile | ✅ |
| Playwright | 1.60.0 | `mcr.microsoft.com/playwright` | ✅ |
| Puppeteer | 25.1.0 | Bundled with Playwright | ✅ |
| OWASP ZAP | Latest | `ghcr.io/zaproxy/zaproxy:stable` | ✅ |
| k6 | Latest | `grafana/k6:latest` | ✅ |
| Testcontainers | — | Maven/Gradle (not needed—Dockerized) | ✅ |

---

## 2. Recommended `docker-compose.testing.yml`

```yaml
version: '3.8'

services:
  # =============================================
  # Test Database
  # =============================================
  test-db:
    image: postgres:16-alpine
    container_name: meter-verse-test-db
    restart: unless-stopped
    ports:
      - "5433:5432"  # Different port from dev to avoid conflict
    environment:
      POSTGRES_DB: meter_verse_test
      POSTGRES_USER: meter_verse_test
      POSTGRES_PASSWORD: meter_verse_test_pass
    volumes:
      - test-pgdata:/var/lib/postgresql/data
      - ./backend/prisma/migrations:/docker-entrypoint-initdb.d:ro
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U meter_verse_test -d meter_verse_test"]
      interval: 3s
      timeout: 3s
      retries: 10
    networks:
      - test-net

  # =============================================
  # Test Database Admin (for debugging)
  # =============================================
  test-db-admin:
    image: dpage/pgadmin4:latest
    container_name: meter-verse-test-pgadmin
    ports:
      - "5051:80"
    environment:
      PGADMIN_DEFAULT_EMAIL: test@meter-verse.local
      PGADMIN_DEFAULT_PASSWORD: test-password
    depends_on:
      - test-db
    networks:
      - test-net
    profiles:
      - debug  # Only start when needed

  # =============================================
  # Backend Test Runner (Jest)
  # =============================================
  test-backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.test
    container_name: meter-verse-test-backend
    environment:
      NODE_ENV: test
      DATABASE_URL: postgresql://meter_verse_test:meter_verse_test_pass@test-db:5432/meter_verse_test?schema=sim_system
      JWT_SECRET: test-jwt-secret-do-not-use-in-production
      JWT_EXPIRES_IN: "3600"
      CORS_ORIGIN: "http://localhost:3000"
      LOG_LEVEL: silent
    depends_on:
      test-db:
        condition: service_healthy
    volumes:
      - ./backend:/app
      - /app/node_modules
    command: >
      sh -c "npx prisma migrate deploy
      && npx prisma db seed
      && npm test -- --coverage --forceExit --detectOpenHandles"
    networks:
      - test-net

  # =============================================
  # Backend API Server (for E2E/Contract tests)
  # =============================================
  test-api:
    build:
      context: ./backend
      dockerfile: Dockerfile.test
    container_name: meter-verse-test-api
    ports:
      - "3002:3001"
    environment:
      NODE_ENV: test
      PORT: 3001
      DATABASE_URL: postgresql://meter_verse_test:meter_verse_test_pass@test-db:5432/meter_verse_test?schema=sim_system
      JWT_SECRET: test-jwt-secret-do-not-use-in-production
      JWT_EXPIRES_IN: "3600"
      CORS_ORIGIN: "http://localhost:3000"
    depends_on:
      test-db:
        condition: service_healthy
      test-backend:
        condition: service_completed_successfully
    command: >
      sh -c "npx prisma migrate deploy
      && npx prisma db seed
      && node dist/main.js"
    networks:
      - test-net

  # =============================================
  # Frontend Test Runner (Playwright + Jest)
  # =============================================
  test-frontend:
    build:
      context: ./Frontend
      dockerfile: Dockerfile.test
    container_name: meter-verse-test-frontend
    environment:
      NODE_ENV: test
      NEXT_PUBLIC_API_URL: http://test-api:3001/api/v1
      DATABASE_URL: postgresql://meter_verse_test:meter_verse_test_pass@test-db:5432/meter_verse_test?schema=sim_system
    depends_on:
      test-api:
        condition: service_started
    volumes:
      - ./Frontend:/app
      - /app/node_modules
      - /app/.next
    command: >
      sh -c "bun run build
      && bun run lint --no-cache --max-warnings 0
      && bun run test:smoke"
    networks:
      - test-net

  # =============================================
  # E2E Tests (Playwright)
  # =============================================
  test-e2e:
    image: mcr.microsoft.com/playwright:v1.60.0-jammy
    container_name: meter-verse-test-e2e
    depends_on:
      test-api:
        condition: service_started
    working_dir: /app
    volumes:
      - ./Frontend:/app
      - /app/node_modules
    environment:
      PLAYWRIGHT_BASE_URL: http://host.docker.internal:3000
      API_URL: http://test-api:3001/api/v1
      TEST_USER: test-admin
      TEST_PASSWORD: test-password
    command: >
      sh -c "npx playwright install --with-deps chromium
      && npx playwright test --config=playwright.config.ts"
    networks:
      - test-net
    extra_hosts:
      - "host.docker.internal:host-gateway"

  # =============================================
  # Contract Tests (Supertest)
  # =============================================
  test-contract:
    build:
      context: ./backend
      dockerfile: Dockerfile.test
    container_name: meter-verse-test-contract
    depends_on:
      test-api:
        condition: service_started
    environment:
      NODE_ENV: test
      API_BASE_URL: http://test-api:3001/api/v1
      JWT_SECRET: test-jwt-secret-do-not-use-in-production
    command: >
      sh -c "npm test -- --testPathPattern=contract --forceExit --detectOpenHandles"
    networks:
      - test-net

  # =============================================
  # Security Scan (OWASP ZAP)
  # =============================================
  test-security:
    image: ghcr.io/zaproxy/zaproxy:stable
    container_name: meter-verse-test-security
    depends_on:
      test-api:
        condition: service_started
    volumes:
      - ./test-security:/zap/wrk:rw
    environment:
      API_URL: http://test-api:3001
    command: >
      zap-api-scan.py
      -t http://test-api:3001/api/v1/docs-json
      -f openapi
      -c zap.conf
      -r zap-report.html
      -w zap-report.md
      -x zap-report.xml
      --hook=/zap/wrk/zap-hook.py
    networks:
      - test-net
    profiles:
      - security

  # =============================================
  # Load Test (k6)
  # =============================================
  test-load:
    image: grafana/k6:latest
    container_name: meter-verse-test-load
    depends_on:
      test-api:
        condition: service_started
    volumes:
      - ./test-load:/scripts:ro
    environment:
      API_URL: http://test-api:3001
      K6_STAGES: "1m:10,3m:50,1m:100,2m:0"
    command: run /scripts/billing-load-test.js
    networks:
      - test-net
    profiles:
      - load

  # =============================================
  # Test Results Aggregator
  # =============================================
  test-reporter:
    image: node:20-alpine
    container_name: meter-verse-test-reporter
    depends_on:
      test-backend:
        condition: service_completed_successfully
      test-frontend:
        condition: service_completed_successfully
      test-contract:
        condition: service_completed_successfully
    volumes:
      - ./test-results:/results:rw
    command: >
      sh -c "
      echo '=== Test Results Summary ==='
      echo 'Backend tests: see /results/backend/'
      echo 'Frontend tests: see /results/frontend/'
      echo 'Contract tests: see /results/contract/'
      echo 'Security report: see /results/security/'
      echo 'Load report: see /results/load/'
      "
    networks:
      - test-net
    profiles:
      - report

networks:
  test-net:
    driver: bridge

volumes:
  test-pgdata:
```

---

## 3. Supporting Dockerfiles

### 3.1 `backend/Dockerfile.test`

```dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

RUN apk add --no-cache python3 make g++ openssl

COPY package*.json tsconfig*.json ./
RUN npm ci --omit=dev

COPY prisma/ ./prisma/
RUN npx prisma generate

COPY src/ ./src/
RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app

RUN apk add --no-cache openssl

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY package*.json tsconfig*.json jest.config.ts ./
COPY test/ ./test/

ENV NODE_ENV=test

CMD ["npm", "test", "--", "--coverage"]
```

### 3.2 `Frontend/Dockerfile.test`

```dockerfile
FROM oven/bun:1 AS builder

WORKDIR /app

COPY package*.json bun.lock* ./
RUN bun install --frozen-lockfile

COPY . .

ENV NODE_ENV=test
ENV NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1

RUN bun run build

FROM oven/bun:1 AS runner

WORKDIR /app

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/scripts ./scripts

CMD ["bun", "run", "test:smoke"]
```

---

## 4. Test Data & Seed Scripts

### 4.1 Seed Script Requirements
- **File:** `backend/prisma/seed.ts`
- **Purpose:** Populate test DB with reference data for integration/E2E tests
- **Required data:**
  - 3 Areas (october, new_cairo, north_coast)
  - 2 Projects per area
  - 5 Customers per project (mix of individual/company)
  - 10 Location nodes per project (zone → building → floor → unit)
  - 10 Meters per project (mix of electricity, water_main, water_child)
  - 5 SIM cards per project
  - 20 Readings per meter (spread across billing period)
  - 2 Tariff plans per project (electricity + water)
  - 1 Billing period (current month)
  - 3 Invoices per customer (draft, issued, paid)
  - 5 Payments per project (mix of methods)
  - Ledger entries for each invoice/payment
  - Roles: super_admin, admin, operator, finance, customer test users

### 4.2 Seed Script Structure
```typescript
// backend/prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 1. Create Areas
  // 2. Create Projects
  // 3. Create Location Hierarchy
  // 4. Create Customers
  // 5. Create Meters + SIMs
  // 6. Create Tariffs + Billing Periods
  // 7. Create Readings (with valid consumption)
  // 8. Generate Invoices
  // 9. Record Payments
  // 10. Create Test Users with Role Assignments
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

---

## 5. OWASP ZAP Configuration

### 5.1 `test-security/zap.conf`
```
# ZAP Configuration for Meter Verse API
# OpenAPI-based scanning

# Authentication
apiexplorergenerator.auth.header=authorization
apiexplorergenerator.auth.header.value=Bearer ${JWT_TOKEN}

# Rate limiting delay (ms)
api.delay=200

# Exclude paths
excluded.paths=/api/v1/docs,/api/v1/docs-json,/api/v1/health

# Scan policies
scanner.strength=HIGH
scanner.alertthreshold=MEDIUM

# Pass/Fail thresholds
reports.displayalert=true
reports.displaypass=true
```

### 5.2 `test-security/zap-hook.py`
```python
def zap_started(zap, target):
    # Import OpenAPI definition
    with open('/zap/wrk/openapi.yaml', 'r') as f:
        openapi_content = f.read()
    zap.openapi.import_url(target + '/api/v1/docs-json')

    # Fetch CSRF token first (required before login)
    import requests
    csrf_response = requests.get(f'{target}/api/v1/auth/csrf-token')
    csrf_token = csrf_response.json()['csrfToken']

    # Login to get JWT token
    login_response = requests.post(
        f'{target}/api/v1/auth/login',
        json={'username': 'test-admin', 'password': 'test-password'},
        headers={'X-CSRF-Token': csrf_token}
    )
    jwt_token = login_response.json()['accessToken']

    # Set auth header for subsequent scanning
    zap.core.set_option_default_headers(f'Authorization: Bearer {jwt_token}')
    print(f'[ZAP] Auth token obtained: {jwt_token[:20]}...')
```

---

## 6. k6 Load Test Script

### 6.1 `test-load/billing-load-test.js`
```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const failureRate = new Rate('failed_requests');
const billingDuration = new Trend('billing_duration');

export const options = {
  stages: [
    { duration: '1m', target: 10 },   // Ramp up to 10 users
    { duration: '3m', target: 50 },   // Ramp to 50 users
    { duration: '1m', target: 100 },  // Spike to 100
    { duration: '2m', target: 0 },    // Ramp down
  ],
  thresholds: {
    failed_requests: ['rate<0.05'],      // <5% failure rate
    http_req_duration: ['p(95)<2000'],   // 95% under 2s
    billing_duration: ['p(95)<5000'],    // billing under 5s
  },
};

const BASE_URL = __ENV.API_URL || 'http://localhost:3001/api/v1';
const JWT_TOKEN = __ENV.JWT_TOKEN || 'test-token';

export default function () {
  const headers = {
    'Authorization': `Bearer ${JWT_TOKEN}`,
    'Content-Type': 'application/json',
  };

  // 1. List projects
  const projectsRes = http.get(`${BASE_URL}/projects`, { headers });
  check(projectsRes, { 'projects: status 200': (r) => r.status === 200 });
  failureRate.add(projectsRes.status !== 200);

  // 2. List meters
  const metersRes = http.get(`${BASE_URL}/meters`, { headers });
  check(metersRes, { 'meters: status 200': (r) => r.status === 200 });

  // 3. Submit reading
  const readingPayload = JSON.stringify({
    meterId: 'test-meter-id',
    projectId: 'test-project-id',
    readingValue: Math.random() * 1000,
    source: 'manual',
  });
  const readingRes = http.post(`${BASE_URL}/readings`, readingPayload, { headers });
  check(readingRes, { 'reading: status 201': (r) => r.status === 201 });

  // 4. Invoice generation (high-load path)
  const billingStart = Date.now();
  const invoicePayload = JSON.stringify({
    projectId: 'test-project-id',
    billingPeriodId: 'test-period-id',
  });
  const invoiceRes = http.post(`${BASE_URL}/billing/invoices/generate`, invoicePayload, { headers });
  billingDuration.add(Date.now() - billingStart);
  check(invoiceRes, { 'invoice: status 202': (r) => r.status === 202 });

  sleep(1);
}
```

---

## 7. CI/CD Integration (GitHub Actions)

### 7.1 `.github/workflows/test-suite.yml`
```yaml
name: Test Suite

on:
  push:
    branches: [main, develop, 'feature/**']
  pull_request:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: cd backend && npm ci && npm run lint
      - run: cd Frontend && bun install && bun run lint

  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: cd backend && npm ci && npm test -- --coverage

  integration-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_DB: meter_verse_test
          POSTGRES_USER: meter_verse_test
          POSTGRES_PASSWORD: meter_verse_test_pass
        ports: ['5433:5432']
        options: >-
          --health-cmd pg_isready
          --health-interval 3s
          --health-timeout 3s
          --health-retries 10
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: cd backend && npm ci
      - run: npx prisma migrate deploy
        env:
          DATABASE_URL: postgresql://meter_verse_test:meter_verse_test_pass@localhost:5433/meter_verse_test?schema=sim_system
      - run: npm test -- --testPathPattern=integration
        env:
          DATABASE_URL: postgresql://meter_verse_test:meter_verse_test_pass@localhost:5433/meter_verse_test?schema=sim_system

  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: ZAP Scan
        uses: zaproxy/action-api-scan@v0.7.0
        with:
          target: 'http://localhost:3001/api/v1/docs-json'
          issue_title: 'ZAP Security Report'
          fail_on_alert: true

  build:
    runs-on: ubuntu-latest
    needs: [lint, unit-tests, integration-tests]
    steps:
      - uses: actions/checkout@v4
      - run: cd backend && npm ci && npm run build
      - run: cd Frontend && bun install && bun run build
```

---

## 8. Usage Instructions

### 8.1 Run All Tests
```bash
# Start test infrastructure
docker compose -f docker-compose.testing.yml up -d test-db test-api

# Run backend unit + integration tests
docker compose -f docker-compose.testing.yml up test-backend

# Run frontend tests
docker compose -f docker-compose.testing.yml up test-frontend

# Run E2E tests
docker compose -f docker-compose.testing.yml up test-e2e

# Run security scan (requires API running)
docker compose -f docker-compose.testing.yml --profile security up test-security

# Run load tests
docker compose -f docker-compose.testing.yml --profile load up test-load

# View combined results
docker compose -f docker-compose.testing.yml --profile report up test-reporter
```

### 8.2 Clean Up
```bash
docker compose -f docker-compose.testing.yml down -v
```

---

## 9. Quick-Start Script

### 9.1 `test-all.ps1` (Windows)
```powershell
# Meter Verse Full Test Suite Runner
Write-Host "=== Meter Verse Test Suite ===" -ForegroundColor Cyan

# Step 1: Start infrastructure
Write-Host "[1/6] Starting test infrastructure..." -ForegroundColor Yellow
docker compose -f docker-compose.testing.yml up -d test-db test-api

# Step 2: Wait for API
Write-Host "[2/6] Waiting for API..." -ForegroundColor Yellow
do {
    Start-Sleep -Seconds 2
    $health = Invoke-WebRequest -Uri "http://localhost:3002/api/v1/health" -SkipCertificateCheck -ErrorAction SilentlyContinue
} while (!$health -or $health.StatusCode -ne 200)
Write-Host "  API ready!" -ForegroundColor Green

# Step 3: Backend tests
Write-Host "[3/6] Running backend unit + integration tests..." -ForegroundColor Yellow
docker compose -f docker-compose.testing.yml up test-backend
if ($LASTEXITCODE -ne 0) { Write-Host "  FAILED!" -ForegroundColor Red; exit 1 }
Write-Host "  PASSED!" -ForegroundColor Green

# Step 4: Contract tests
Write-Host "[4/6] Running contract tests..." -ForegroundColor Yellow
docker compose -f docker-compose.testing.yml up test-contract
Write-Host "  PASSED!" -ForegroundColor Green

# Step 5: Frontend tests
Write-Host "[5/6] Running frontend tests..." -ForegroundColor Yellow
docker compose -f docker-compose.testing.yml up test-frontend
Write-Host "  PASSED!" -ForegroundColor Green

# Step 6: E2E tests
Write-Host "[6/6] Running E2E tests..." -ForegroundColor Yellow
docker compose -f docker-compose.testing.yml up test-e2e
Write-Host "  PASSED!" -ForegroundColor Green

Write-Host "=== All tests completed ===" -ForegroundColor Cyan

# Optional: Security scan
$security = Read-Host "Run security scan? (y/N)"
if ($security -eq 'y') {
    docker compose -f docker-compose.testing.yml --profile security up test-security
}
```
