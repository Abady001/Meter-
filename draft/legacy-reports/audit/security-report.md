# Security Audit Report — Meter Verse

**Generated:** 2026-06-25  
**Scope:** Backend NestJS API, Frontend Next.js app, API Gateway, Admin Console/Portal

---

## 1. Security Controls Found

### 1.1 Authentication (backend/src/auth/)
| Control | Location | Status |
|---------|----------|--------|
| JWT Bearer token auth | `jwt.strategy.ts:12` — `ExtractJwt.fromAuthHeaderAsBearerToken()` | ✅ |
| JWT httpOnly cookie | `auth.controller.ts:105-106` — `httpOnly: true, secure, sameSite: 'strict'` | ✅ |
| JWT expiration (1h) | `auth.controller.ts:101` — `expiresIn: '1h'` | ✅ |
| Configurable secret | `jwt.strategy.ts:14` — via `ConfigService` | ✅ |
| Refresh token rotation | `auth.controller.ts:114-123` — old token revoked, new issued | ✅ |
| Password hashing (bcrypt, 10 rounds) | `users.controller.ts:41` — `bcrypt.hash(dto.password, 10)` | ✅ |
| Progressive login lockout | `auth.controller.ts:53-76` — 3→5min, 6→24h, 9→permanent | ✅ |
| Role validation in JWT | `jwt.strategy.ts:19-26` — validates `sub` and `role` against `Role` enum | ✅ |

### 1.2 Authorization (Guards)
| Guard | Location | Scope | Status |
|-------|----------|-------|--------|
| `GlobalAuthGuard` | `global-auth.guard.ts` | Global — all routes | ✅ |
| `RolesGuard` | `roles.guard.ts` | Per-endpoint via `@Roles()` | ✅ |
| `AreaGuard` | `area.guard.ts` | Global — `x-area-id` header validation | ✅ |
| `PermissionsGuard` | `permissions.guard.ts` | Declared, usage unknown | ⚠️ |
| `ProjectAccessGuard` | `project-access.guard.ts` | Declared, not globally registered | ⚠️ |

### 1.3 Input Validation
| Control | Location | Status |
|---------|----------|--------|
| Global `ValidationPipe` with `whitelist: true` | `main.ts:34-38` | ✅ |
| `forbidNonWhitelisted: true` | `main.ts:36` | ✅ |
| `transform: true` (auto-type conversion) | `main.ts:37` | ✅ |
| DTOs with `class-validator` decorators | Various `*.dto.ts` files | ✅ |

### 1.4 HTTP Security
| Control | Location | Status |
|---------|----------|--------|
| Helmet middleware | `main.ts:21` — `app.use(helmet())` | ✅ |
| CORS whitelist | `main.ts:24-28` — configurable via `CORS_ORIGIN` | ✅ |
| Cookie parser | `main.ts:22` — `cookieParser()` | ✅ |
| Body size limit (1mb) | `main.ts:31` — `app.useBodyParser('json', { limit: '1mb' })` | ✅ |
| Rate limiting (100 req/60s) | `app.module.ts:52` — `ThrottlerModule.forRoot` | ✅ |

### 1.5 CSRF
| Control | Location | Status |
|---------|----------|--------|
| CSRF token endpoint | `auth.controller.ts:168-174` — `GET /auth/csrf-token` | ✅ |
| CSRF guard class | `common/http/csrf.guard.ts` | ✅ Created, global usage unclear |
| Cookie `sameSite: 'strict'` | `auth.controller.ts:105-106` | ✅ |

### 1.6 Auditing & Logging
| Control | Location | Status |
|---------|----------|--------|
| Append-only audit log | `audit/` — `AuditLog` model (no update/delete) | ✅ |
| Global `AuditInterceptor` | `app.module.ts:93-95` — captures POST/PUT/PATCH/DELETE | ✅ |
| Correlation middleware | `app.module.ts:117` — `correlationId` per request | ✅ |
| Before/after state snapshots | `audit.interceptor.ts` — captures req.body and response | ✅ |
| Global exception filter | `main.ts:41` — `AllExceptionsFilter` | ✅ |
| Error envelope format | `common/http/error-envelope.ts` | ✅ |

### 1.7 Other Controls
| Control | Location | Status |
|---------|----------|--------|
| Idempotency key support | `idempotency/interceptor.ts` — via `Idempotency-Key` header | ✅ |
| `ProjectAccessInterceptor` | `app.module.ts:97-100` — project-level access validation | ✅ |
| `NotificationService` fail-safe | Various controllers — `.catch(() => {})` | ✅ |
| Prisma P2002 → 422 handler | `readings/readings.service.ts` — duplicate handling | ✅ |

---

## 2. Security Gaps & Vulnerabilities

### 2.1 CRITICAL

#### 2.1.1 SQL Injection — Raw Queries with Unsanitized Input
- **File:** `admin.controller.ts:73-81` — `$queryRawUnsafe(dto.sql)` accepts arbitrary SQL from super_admin
- **File:** `customers.controller.ts:142-151` — `$queryRawUnsafe()` with `id`, `from`, `to` params (parameterized, but raw SQL pattern)
- **File:** `admin.controller.ts:38-39` — `getTableData(table, ...)` — table name not parameterized
- **Risk:** Super-admin SQL console bypasses all ORM protections
- **Mitigation:** SQL console should be in a separate restricted service, not part of main API

#### 2.1.2 Dev Login Endpoint Exposed in Production
- **File:** `auth.controller.ts:135-143` — `POST /auth/dev-login`
- **Guard:** `@Public()` + check `process.env.NODE_ENV === 'production' && process.env.DEV_LOGIN_ENABLED !== 'true'`
- **Risk:** If env misconfigured, any userId can mint JWT tokens as any role
- **Mitigation:** Remove `@Public()`, move to separate admin-only route, or remove entirely

#### 2.1.3 Hardcoded Password Hash in Registration
- **File:** `registration.controller.ts:55` — `$2a$12$LJ3m4ys3Lk0TSwHCpNq7a...` (placeholder)
- **Risk:** Every auto-created user has the same known password hash
- **Mitigation:** Generate random password and email it, or force password set on first login

#### 2.1.4 Weak Default JWT Secret
- **File:** `docker-compose.yml:39` — `JWT_SECRET: ${JWT_SECRET:-change-me-in-production}`
- **Risk:** If env var not set, JWT secret is a known string
- **Mitigation:** Generate random secret in CI/CD pipeline, fail startup if not set

### 2.2 HIGH

#### 2.2.1 No Rate Limiting on Auth Endpoints
- `POST /auth/login` — No per-IP rate limit beyond global 100/60s
- `POST /auth/dev-login` — No rate limit
- `POST /auth/refresh` — No rate limit
- **Risk:** Brute force attack on login endpoint
- **Mitigation:** Apply `@Throttle()` or per-IP middleware on auth routes

#### 2.2.2 Multiple Controllers Missing Class-Level Auth Guards
Controllers that rely solely on `@Roles()` decorator (without `@UseGuards(AuthGuard, RolesGuard)`):
- `InvoicesController` (`invoices/invoices.controller.ts:14`)
- `BillCycleController` (`bill-cycle/bill-cycle.controller.ts:9`)
- `ReportsController` (`reports/reports.controller.ts:9`)
- `TicketsController` (`tickets/tickets.controller.ts:9`)
- `SupportController` (`support/support.controller.ts:9`)
- `SettingsController` (`settings/settings.controller.ts:8`)
- `SearchController` (`search/search.controller.ts:9`)
- `CollectionsController` (`collections/collections.controller.ts:12`)
- `KpiController` (`kpi/kpi.controller.ts:8`)
- `WalletController` (`wallet/wallet.controller.ts:8`)
- **Note:** `GlobalAuthGuard` is registered globally, partially mitigates
- **Risk:** If `GlobalAuthGuard` is ever removed, these endpoints become unprotected

#### 2.2.3 No Rate Limiting on Global Throttler Config
- **File:** `app.module.ts:52` — `{ ttl: 60000, limit: 100 }` — 100 requests per 60 seconds globally
- **Risk:** A single user can exhaust the global limit and deny service to all others
- **Mitigation:** Use per-user/role rate limits with `@Throttle()`

#### 2.2.4 No Session Invalidation on Password Change
- Old JWT tokens remain valid until expiration (1 hour)
- **Risk:** Stolen session persists after password reset
- **Mitigation:** Implement token blacklist or rotate `jwtSecret` on password change

#### 2.2.5 No MFA Enforcement
- `isMfaEnabled` and `mfaSecret` fields exist in `CoreUser` model (`schema.prisma:882-883`)
- No MFA flow implemented
- **Risk:** Single factor auth only
- **Mitigation:** Implement TOTP verification flow

### 2.3 MEDIUM

#### 2.3.1 Public Endpoints Without Rate Limits
- `GET /areas` — `@Public()` (`areas.controller.ts:15-19`)
- `GET /areas/:id` — `@Public()` (`areas.controller.ts:22-27`)
- `POST /auth/register` — `@Public()` (`registration.controller.ts:15-16`)
- **Risk:** Data scraping / registration spam
- **Mitigation:** Apply per-IP rate limits on public endpoints

#### 2.3.2 No Request Size Validation on File Upload
- `upload.controller.ts:25-36` — File upload via `FileInterceptor('file')`
- No file size or type validation beyond Express body parser limit
- **Risk:** Unrestricted file upload
- **Mitigation:** Add file size/type validation

#### 2.3.3 Inconsistent `@UseGuards()` Patterns
Some controllers use `@UseGuards(AuthGuard('jwt'), RolesGuard)`, others use `@UseGuards(GlobalAuthGuard, RolesGuard)`, some use neither.
- **Risk:** Inconsistent security posture; maintenance errors likely
- **Mitigation:** Standardize to a single pattern

#### 2.3.4 No XSS Protection in Report Rendering
- `reports/report-generation.service.ts` — generates PDF/CSV output
- No sanitization of user data embedded in reports
- **Risk:** Stored XSS in generated reports

#### 2.3.5 Token in localStorage (Frontend)
- `api/auth.ts:6-8` — Access token stored in `localStorage`
- `api/auth.ts:16-17` — Refresh token stored in `localStorage`
- **Risk:** XSS can steal tokens
- **Mitigation:** Use httpOnly cookies for access tokens (backend already sets them)

### 2.4 LOW

#### 2.4.1 Error Messages Reveal User Existence
- `auth.controller.ts:33` — "بيانات الدخول غير صحيحة" (generic Arabic message)
- `auth.controller.ts:75` — "بيانات الدخول غير صحيحة"
- Good: Single message for invalid user/password (no user enumeration)

#### 2.4.2 Prisma `catch(() => null)` Patterns
Multiple controllers silently swallow Prisma errors with `.catch(() => null)`
- **Risk:** Masked database errors; debugging difficulty
- **Mitigation:** Log errors before suppressing

#### 2.4.3 No Audit Events on GET Requests
- `AuditInterceptor` only captures POST/PUT/PATCH/DELETE
- Sensitive GET endpoints (customer statement, 360 view) not audited
- **Mitigation:** Add selective GET auditing for sensitive endpoints

#### 2.4.4 setTimeout for Auto-Unlock
- `auth.controller.ts:63-72` — `setTimeout()` for unlocking locked accounts
- **Risk:** Process restart resets the timer; in-memory only, not persisted
- **Mitigation:** Use database scheduler (pg_cron) or check timestamps on login

#### 2.4.5 Weak CORS Configuration
- `main.ts:25` — `origin: process.env.CORS_ORIGIN?.split(',') ?? ['http://localhost:3000']`
- No validation of origin format; array split allows comma injection
- **Risk:** If misconfigured, allows arbitrary origins

---

## 3. Security Risk Assessment Matrix

| # | Vulnerability | CVSS v3 Score | Risk Level | Likelihood | Impact |
|---|--------------|--------------|------------|------------|--------|
| 1 | SQL Injection via Admin Console | 9.0 | CRITICAL | Medium | Complete DB compromise |
| 2 | Dev Login in Production | 8.5 | CRITICAL | Low | Unauthorized admin access |
| 3 | Hardcoded Password Hash | 8.5 | CRITICAL | High | Account takeover |
| 4 | Weak Default JWT Secret | 8.0 | CRITICAL | Medium | Token forgery |
| 5 | No Auth Rate Limiting | 7.5 | HIGH | High | Brute force |
| 6 | Missing Class-Level Guards | 6.5 | HIGH | Medium | Authorization bypass |
| 7 | No Session Invalidation | 6.0 | MEDIUM | Medium | Persistent session hijack |
| 8 | No MFA | 5.5 | MEDIUM | High | Account compromise |
| 9 | Public Endpoint Scraping | 4.0 | MEDIUM | Low | Data exposure |
| 10 | localStorage Token Storage | 4.0 | MEDIUM | Medium | XSS token theft |
| 11 | File Upload Validation | 3.5 | LOW | Low | Malware upload |
| 12 | setTimeout Lockout Bypass | 3.0 | LOW | Low | Lockout evasion |

---

## 4. Compliance & Standards Mapping

| Standard | Requirement | Status | Notes |
|----------|------------|--------|-------|
| **OWASP Top 10 (2021)** | | | |
| A01: Broken Access Control | RBAC, AreaGuard | ✅ Partial | Missing on some controllers |
| A02: Cryptographic Failures | bcrypt, JWT | ✅ | Good |
| A03: Injection | Prisma ORM | ⚠️ | Raw SQL in admin controller |
| A04: Insecure Design | — | ⚠️ | Dev login, hardcoded passwords |
| A05: Security Misconfiguration | Helmet, CORS | ✅ | Good defaults |
| A06: Vulnerable Components | — | ⚠️ | Overrides prevent known vulns |
| A07: Auth Failures | JWT, progressive lockout | ✅ | Good |
| A08: Data Integrity Failures | Idempotency, Audit | ✅ | Good |
| A09: Logging Failures | AuditLog, Correlation | ✅ | Good |
| A10: SSRF | — | ⚠️ | Not tested |
| **PCI DSS** | | | |
| Req 8: Identify & Authenticate | MFA field exists, no flow | ❌ | MFA not implemented |
| Req 10: Audit Trail | Append-only audit | ✅ | Good |
| Req 3: Protect Stored Data | Sensitive fields | ⚠️ | Some fields not encrypted |
| **GDPR** | | | |
| Data Access | Customer 360 view | ✅ | |
| Data Deletion | Soft delete patterns | ⚠️ | No hard delete for customers |
| Breach Notification | Audit log | ✅ | |

---

## 5. Recommended Immediate Actions

| Priority | Action | Effort | Impact |
|----------|--------|--------|--------|
| P0 | Remove or harden `dev-login` endpoint | 1h | Prevents auth bypass |
| P0 | Replace hardcoded password hash in registration | 2h | Prevents account takeover |
| P0 | Add `throw` on missing `JWT_SECRET` (fail-fast) | 0.5h | Prevents weak secret usage |
| P1 | Add rate limiting to `POST /auth/login` (per-IP) | 2h | Prevents brute force |
| P1 | Add class-level `@UseGuards()` to all 11 unprotected controllers | 1h | Ensures consistent auth |
| P1 | Implement token blacklist on password change | 4h | Prevents session persistence |
| P2 | Move admin SQL console to isolated service | 16h | Limits blast radius |
| P2 | Implement MFA TOTP flow | 24h | Strong auth |
| P2 | Add file upload validation (size, type) | 2h | Prevents malware |
| P3 | Move tokens from localStorage to httpOnly cookies | 4h | XSS token protection |
| P3 | Add audit events for sensitive GET endpoints | 4h | Complete audit trail |

---

## 6. Security Architecture Overview

```
Internet
   │
   ▼
[API Gateway] → express-rate-limit, http-proxy-middleware
   │
   ▼
[NestJS API] → Helmet → CORS → CookieParser → BodyParser(1mb)
   │
   ├─ [CorrelationMiddleware] → x-correlation-id
   │
   ├─ [ThrottlerGuard] → 100 req/60s (global)
   │
   ├─ [GlobalAuthGuard] → JWT Bearer Token (unless @Public())
   │   └─ [handleRequest] → role validation (16 profiles)
   │
   ├─ [AreaGuard] → x-area-id header check
   │
   ├─ [ValidationPipe] → whitelist, forbidNonWhitelisted, transform
   │
   ├─ [ProjectAccessInterceptor] → project-level access
   │
   ├─ [AuditInterceptor] → before/after snapshots → AuditLog
   │
   ├─ [AllExceptionsFilter] → ErrorEnvelope response
   │
   └─ [Controllers] → @Roles() → Role-based authorization
```

---

## 7. Auth Module File Inventory

| File | Lines | Purpose |
|------|-------|---------|
| `auth/auth.module.ts` | 53 | Module definition |
| `auth/auth.controller.ts` | 175 | Login/refresh/logout/dev-login/me/CSRF |
| `auth/jwt.strategy.ts` | 36 | Passport JWT strategy |
| `auth/global-auth.guard.ts` | 56 | Global JWT guard with role check |
| `auth/roles.guard.ts` | 36 | Reflector-based RBAC guard |
| `auth/roles.decorator.ts` | ~10 | `@Roles()` decorator |
| `auth/permissions.guard.ts` | ~30 | Permission-level guard |
| `auth/permissions.decorator.ts` | ~10 | `@Permissions()` decorator |
| `auth/area.guard.ts` | 27 | Area-scoped access |
| `auth/public.decorator.ts` | ~5 | `@Public()` decorator |
| `auth/access-context.middleware.ts` | ~30 | Access context per request |
| `auth/area.middleware.ts` | ~30 | Area middleware |
| `auth/refresh-token.service.ts` | ~50 | Token rotation logic |
| `auth/password-policy.service.ts` | ~40 | Password policy |
| `auth/user-access.service.ts` | ~50 | User project resolution |
| `auth/project-access.guard.ts` | ~30 | Project access guard |
| `auth/types/role.enum.ts` | 18 | 16 role enum |
| `auth/types/permission.enum.ts` | ~50 | Permission codes |
| `auth/types/permission-role.mapping.ts` | ~100 | Permission-to-role mapping |
| `auth/interfaces/jwt-payload.interface.ts` | ~10 | JWT payload shape |
| `auth/interfaces/request-with-user.interface.ts` | ~5 | Request extension |
| `auth/constants/jwt.constants.ts` | ~10 | Default JWT config |
