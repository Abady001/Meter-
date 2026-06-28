# Security Roadmap — Meter Verse Platform

**Date**: 2026-05-31
**Phase**: Security Weaver Phase 3
**Reference**: `security-assessment.md`, `security-gap-analysis.md`
**Duration Estimate**: 3 sprints (Foundation + Hardening + Continuous)

---

## Phase A: Foundation — Sprint 1 (Immediate)

**Goal**: Eliminate critical gaps with minimal code changes. All changes reversible.

### A-01: Add HTTP Security Headers (helmet)

| Field | Value |
|-------|-------|
| **Gap** | C-01 |
| **Effort** | 15 minutes |
| **Files** | `backend/src/main.ts`, `backend/package.json` |
| **Action** | Install `helmet` + add `app.use(helmet())` |
| **Validation** | `curl -I /api/v1/health` shows `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, etc. |
| **Rollback** | Remove helmet line |

### A-02: Configure CORS

| Field | Value |
|-------|-------|
| **Gap** | C-02 |
| **Effort** | 15 minutes |
| **Files** | `backend/src/main.ts` |
| **Action** | Add `app.enableCors({ origin: process.env.CORS_ORIGIN?.split(',') ?? ['http://localhost:3000'], credentials: true })` |
| **Validation** | Preflight OPTIONS returns correct `Access-Control-Allow-Origin` |
| **Rollback** | Remove or revert enableCors call |

### A-03: Add Rate Limiting

| Field | Value |
|-------|-------|
| **Gap** | C-03 |
| **Effort** | 30 minutes |
| **Files** | `backend/src/main.ts`, `backend/package.json` |
| **Action** | Install `@nestjs/throttler`, configure global 100 req/min, stricter 10 req/min for auth |
| **Validation** | `curl -v` 101st request in 1 minute returns `429 Too Many Requests` |
| **Rollback** | Remove ThrottlerModule import |

### A-04: Add eslint-plugin-security

| Field | Value |
|-------|-------|
| **Gap** | H-08 |
| **Effort** | 15 minutes |
| **Files** | `backend/.eslintrc.cjs` |
| **Action** | Install `eslint-plugin-security`, add `plugin:security/recommended` to extends |
| **Validation** | `npm run lint` detects `eval()`, `child_process.exec()` |
| **Rollback** | Remove plugin from config |

### A-05: Add Input Size Limiting

| Field | Value |
|-------|-------|
| **Gap** | H-06 |
| **Effort** | 5 minutes |
| **Files** | `backend/src/main.ts` |
| **Action** | Add `app.use(express.json({ limit: '1mb' }))` before ValidationPipe |
| **Validation** | Request >1MB returns `413 Payload Too Large` |
| **Rollback** | Remove or adjust limit |

### A-06: Run `npm audit` and Create Dependency Report

| Field | Value |
|-------|-------|
| **Gap** | C-05 |
| **Effort** | 15 minutes |
| **Files** | New: `backend/scripts/dep-audit.sh` |
| **Action** | `cd backend && npm audit --json > dep-audit-report.json` |
| **Validation** | Report lists all dependencies with severity levels |
| **Rollback** | N/A (report only) |

---

## Phase B: Hardening — Sprint 2 (High Priority)

**Goal**: Address all High-severity gaps. Some changes may be non-trivial.

### B-01: Implement Refresh Token + JWT Rotation

| Field | Value |
|-------|-------|
| **Gap** | H-05 |
| **Effort** | 1-2 days |
| **Files** | `backend/src/auth/` (new: refresh-token strategy, token service) |
| **Action** | Add `/auth/refresh` endpoint, refresh token table, rotation logic |
| **Validation** | JWT expires → refresh returns new JWT → old JWT rejected |
| **Risk** | Requires DB migration for refresh token storage |

### B-02: Implement Password Policy + Account Lockout

| Field | Value |
|-------|-------|
| **Gap** | H-04 |
| **Effort** | 1 day |
| **Files** | `backend/src/auth/` (new: password policy, lockout service) |
| **Action** | Add min length/complexity rules, account lockout after N failures, cooldown timer |
| **Validation** | Weak password rejected; 5 failed logins = 15-min lockout |
| **Risk** | Requires user model update + lockout tracking table |

### B-03: Add Secret Scanning (Pre-commit Hook)

| Field | Value |
|-------|-------|
| **Gap** | M-05 |
| **Effort** | 30 minutes |
| **Files** | New: `.husky/pre-commit`, or npm script |
| **Action** | Install `husky` + `lint-staged` + `trivy` for secret scanning |
| **Validation** | Git commit with `.env` in staged files is blocked |
| **Rollback** | Remove pre-commit hook |

### B-04: Create GitHub Actions CI Pipeline

| Field | Value |
|-------|-------|
| **Gap** | C-04 |
| **Effort** | 1 day |
| **Files** | New: `.github/workflows/ci.yml` |
| **Action** | Workflow: lint → test → build → semgrep → npm audit → trivy → secret scan |
| **Validation** | PR triggers full pipeline; security failures block merge |
| **Risk** | Complex setup; requires GitHub repo configuration |

### B-05: Create Dockerfiles for App Containers

| Field | Value |
|-------|-------|
| **Gap** | H-07 |
| **Effort** | 1 day |
| **Files** | New: `backend/Dockerfile`, `Frontend/Dockerfile`, `.dockerignore` |
| **Action** | Multi-stage Dockerfiles with distroless/node base, non-root user |
| **Validation** | `docker build` produces <200MB image; no shell in runtime stage |
| **Risk** | Base image selection affects supply chain |

### B-06: Add CORS Policy to OpenAPI Spec

| Field | Value |
|-------|-------|
| **Gap** | M-04 |
| **Effort** | 1 hour |
| **Files** | `specs/001-metering-billing-platform/contracts/meter-verse-api.yaml` |
| **Action** | Document allowed origins, rate-limit headers, request-size limits in OAS |
| **Validation** | Spec lint passes with security annotations |

---

## Phase C: Deep Security — Sprint 3 (Medium Priority)

**Goal**: Address Medium-severity gaps, add monitoring, and compliance foundations.

### C-01: Audit Log Integrity (Hash Chain)

| Field | Value |
|-------|-------|
| **Gap** | M-02 |
| **Effort** | 2-3 days |
| **Files** | `backend/src/audit/` |
| **Action** | Add SHA-256 hash chain: each entry includes hash of previous entry |
| **Validation** | Hash verification script detects any tampered record |
| **Risk** | Performance impact on high-volume writes |

### C-02: Structured Logging + PII Sanitization

| Field | Value |
|-------|-------|
| **Gap** | M-03 |
| **Effort** | 1 day |
| **Files** | `backend/src/common/logging/` (new) |
| **Action** | Add `pino` or `winston` with structured JSON output + PII redaction |
| **Validation** | Log output is valid JSON with `level`, `timestamp`, `correlationId` |
| **Risk** | Log volume in production |

### C-03: Add Functional Access Control Tests

| Field | Value |
|-------|-------|
| **Gap** | M-06 |
| **Effort** | 1-2 days |
| **Files** | `backend/test/auth/` (new: per-endpoint access tests) |
| **Action** | Add integration tests verifying each role CAN/CANNOT access each endpoint |
| **Validation** | 50+ new tests covering all 14 endpoints × 7 roles |
| **Risk** | Test maintenance as endpoints change |

### C-04: Add CSRF Protection

| Field | Value |
|-------|-------|
| **Gap** | M-01 |
| **Effort** | 1 day |
| **Files** | `backend/src/common/http/csrf.guard.ts` (new) |
| **Action** | Implement double-submit cookie pattern or `csrf-csrf` package |
| **Validation** | Mutation without CSRF token returns `403` |
| **Risk** | Frontend integration required |

### C-05: Generate SBOM

| Field | Value |
|-------|-------|
| **Gap** | I-01 |
| **Effort** | 1 hour |
| **Files** | New: `backend/scripts/gen-sbom.sh` |
| **Action** | `npm sbom` or `cyclonedx-npm` generate SBOM in CI |
| **Validation** | SBOM JSON contains dependency tree with versions, licenses |

### C-06: Ratify Constitution

| Field | Value |
|-------|-------|
| **Gap** | I-02 |
| **Effort** | 2 hours |
| **Files** | `.specify/memory/constitution.md` |
| **Action** | Fill template with security governance, decision authority, risk tolerance |
| **Validation** | Document has no placeholder markers |

---

## Phase D: Continuous — Ongoing (Low Priority + Maintenance)

**Goal**: Make security continuous, automated, and part of the development lifecycle.

### D-01: Container Image Scanning (Trivy in CI)

| Field | Value |
|-------|-------|
| **Gap** | M-07 |
| **Effort** | 2 hours |
| **Action** | Add `trivy image` scan to CI pipeline post-build |

### D-02: Incident Response Plan

| Field | Value |
|-------|-------|
| **Gap** | I-03 (DR), Respond function |
| **Effort** | 1 day |
| **Action** | Create documented IR plan: detect → analyze → contain → eradicate → recover → post-mortem |

### D-03: Disaster Recovery Drill Schedule

| Field | Value |
|-------|-------|
| **Gap** | I-03 |
| **Effort** | 2 hours |
| **Action** | Document DR runbook with RPO=15min, RTO=2hr, quarterly drill schedule |

### D-04: Encryption at Rest (DB-Level)

| Field | Value |
|-------|-------|
| **Gap** | H-03 |
| **Effort** | 1-2 days (production only) |
| **Action** | Enable PostgreSQL TDE or filesystem encryption; requires outage |

### D-05: Secrets Management Migration (Vault/HashiCorp)

| Field | Value |
|-------|-------|
| **Gap** | H-01 |
| **Effort** | 2-3 days |
| **Action** | Replace .env with HashiCorp Vault or AWS Secrets Manager |
| **Risk** | Requires infrastructure changes |

---

## Implementation Priority Matrix

```
Effort →
  Low     Medium    High     Very High
High ┌──────────┬──────────┬──────────┬──────────┐
     │ A-01     │ A-03     │ B-01     │ B-04     │
I    │ A-02     │ A-04     │ B-02     │ B-05     │
mp   │ A-05     │ A-06     │          │          │
act  │ B-03     │          │          │          │
     ├──────────┼──────────┼──────────┼──────────┤
     │ C-02     │ C-01     │ D-04     │ D-05     │
Med  │ C-04     │ C-03     │          │          │
ium  │ C-05     │ C-06     │          │          │
     │ D-01     │ D-02     │          │          │
     │ D-03     │          │          │          │
     └──────────┴──────────┴──────────┴──────────┘
```

**Recommended order**: A-01 → A-02 → A-03 → A-04 → A-05 → A-06 → B-03 → B-01 → B-02 → B-04 → B-05 → C-01 → C-03 → C-04 → C-02 → D-01 → D-02 → D-03 → D-04 → D-05
