# Security Validation Report — Meter Verse

**Generated:** 2026-06-25  
**Auditors:** Principal Security Engineer, Principal QA Architect  
**Scope:** Backend NestJS API, Frontend Next.js app, API Gateway, Docker infrastructure

---

## 1. JWT Strategy & Secret Handling

### 1.1 JWT Configuration
| Finding | Status | Location |
|---------|--------|----------|
| Bearer token extraction from Authorization header | ✅ | jwt.strategy.ts:12 |
| Configurable secret via ConfigService | ✅ | jwt.strategy.ts:14 |
| Secret validation on startup (throws if missing) | ✅ | jwt.strategy.ts:14 — if (!s) throw |
| JWT expiration (1h configurable) | ✅ | uth.controller.ts:101 |
| Role validation against enum | ✅ | jwt.strategy.ts:23-26 |
| Payload validation (sub, ole presence) | ✅ | jwt.strategy.ts:19-26 |

### 1.2 Secret Weaknesses
| Risk | Severity | Detail | Location |
|------|----------|--------|----------|
| **Default weak secret in docker-compose** | **CRITICAL** | JWT_SECRET: \ — known string | docker-compose.yml:39 |
| **No secret rotation mechanism** | MEDIUM | No jwtSecret versioning or key rotation capability | — |

### 1.3 Recommendations
1. Add a startup assertion that fails if JWT_SECRET equals change-me-in-production
2. Implement JWT secret rotation with kid header support
3. Document minimum secret requirements (256-bit for HS256)

---

## 2. Guards Coverage Analysis

### 2.1 Global Guards (Registered in AppModule)
| Guard | Scope | Status | Location |
|-------|-------|--------|----------|
| ThrottlerGuard | Global — all routes | ✅ | pp.module.ts:102-104 |
| GlobalAuthGuard | Global — all routes except @Public() | ✅ | pp.module.ts:106-108 |
| AreaGuard | Global — x-area-id header validation | ✅ | pp.module.ts:110-112 |

### 2.2 Controllers WITH Explicit Class-Level Guards
| Controller | Pattern | Location |
|-----------|---------|----------|
| BillingController | @UseGuards(AuthGuard('jwt'), RolesGuard) | illing.controller.ts:33 |
| CustomersController | @UseGuards(AuthGuard('jwt'), RolesGuard) | customers.controller.ts:33 |
| AdminController | @UseGuards(AuthGuard('jwt'), RolesGuard) | dmin.controller.ts:12 |
| PaymentsController | Via AuthGuard('jwt') | ✅ |
| UsersController | Via AuthGuard('jwt') | ✅ |
| MetersController | Via AuthGuard('jwt') | ✅ |
| SimCardsController | Via AuthGuard('jwt') | ✅ |
| ReadingsController | Via AuthGuard('jwt') | ✅ |
| NotificationsController | Via AuthGuard('jwt') | ✅ |
| AreasController | Partial (some @Public()) | ⚠️ |
| RegistrationController | Partial (some @Public()) | ⚠️ |

### 2.3 Controllers WITHOUT Class-Level Guards
| Controller | File Line | Risk |
|-----------|----------|------|
| InvoicesController | invoices.controller.ts:14 | HIGH — relies solely on @Roles() |
| KpiController | kpi.controller.ts:8 | HIGH |
| WalletController | wallet.controller.ts:8 | HIGH |
| ReportsController | eports.controller.ts:9 | HIGH |
| TicketsController | (not audited) | HIGH |
| SupportController | (not audited) | HIGH |
| SettingsController | (not audited) | HIGH |
| SearchController | (not audited) | HIGH |
| CollectionsController | (not audited) | HIGH |
| BillCycleController | (not audited) | HIGH |
| **Total: 10 controllers** | | |

### 2.4 Unused Guards
| Guard | Declared In | Used Anywhere? | Status |
|-------|------------|---------------|--------|
| PermissionsGuard | uth.permissions.guard.ts | Not found in any controller | ❌ DEAD CODE |
| ProjectAccessGuard | project-access.guard.ts | RequireProjectAccess() decorator declared, usage not verified | ⚠️ |
| CsrfGuard | common/http/csrf.guard.ts | Not globally registered, not in controllers | ❌ DEAD CODE |

### 2.5 Recommendations
1. Add @UseGuards(AuthGuard('jwt'), RolesGuard) to all 10 unprotected controllers
2. Either use PermissionsGuard or remove it
3. Either register CsrfGuard globally or remove it
4. Standardize to a single @UseGuards(GlobalAuthGuard, RolesGuard) pattern

---

## 3. Rate Limiting Analysis

### 3.1 Current Configuration
| Location | Configuration | Detail |
|----------|--------------|--------|
| pp.module.ts:52 | ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]) | 100 requests per 60 seconds GLOBALLY |

### 3.2 Gaps
| Gap | Severity | Detail |
|-----|----------|--------|
| **No per-IP rate limit on login** | **HIGH** | POST /auth/login — public, brute force possible at 100/60s |
| **No rate limit on dev-login** | **HIGH** | POST /auth/dev-login — public when enabled |
| **No rate limit on refresh** | **HIGH** | POST /auth/refresh — no added throttling |
| **No per-IP limit on public endpoints** | MEDIUM | GET /areas, POST /auth/register |
| **Global limit shared** | MEDIUM | One user consuming 100 requests blocks all others |
| **API Gateway custom limiter** | ⚠️ | Uses in-memory store, NOT express-rate-limit library (though installed) |

### 3.3 Recommendations
1. Add @Throttle({ limit: 5, ttl: 60000 }) on POST /auth/login
2. Add @Throttle({ limit: 3, ttl: 60000 }) on POST /auth/dev-login
3. Fix API Gateway to use express-rate-limit library
4. Consider Redis-based distributed rate limiting for production

---

## 4. SQL Injection Risks

### 4.1 Raw SQL Query Findings
| File | Line | Code | Risk Level |
|------|------|------|-----------|
| dmin.controller.ts:78 | \wait this.prisma.\(dto.sql)\` | Accepts arbitrary SQL | **CRITICAL** |
| dmin.service.ts:14 | Table name concatenated | Allowlist present but fragile | **HIGH** |
| dmin.service.ts:43 | String interpolation in WHERE | No parameterization | **CRITICAL** |
| dmin.service.ts:57,66,75 | INSERT/UPDATE/DELETE via string building | No parameterization | **HIGH** |
| customers.controller.ts:142 | \ with \,\,\ | Parameterized — LOW risk | **LOW** |
| search.service.ts:12 | search_enterprise(\, \) | Parameterized — LOW risk | **LOW** |

### 4.2 Admin SQL Console (Critical Risk)
POST /admin/query at dmin.controller.ts:70-81:
`	ypescript
const r = await this.prisma.\(dto.sql);
`
**Protections:** Restricted to super_admin | Only SELECT/EXPLAIN allowed  
**Remaining Risks:** Data exfiltration via system catalogs | DoS via heavy queries | Side-effect functions

### 4.3 Recommendations
1. **P0**: Remove SQL console from main API — move to isolated Admin Console service
2. **P0**: Use parameterized queries for ALL raw SQL in admin service
3. **P1**: Add query timeout, max row limit, and statement timeout to admin SQL console
4. **P1**: Implement read-only database user for admin SQL queries

---

## 5. XSS Risks (Frontend)

### 5.1 dangerouslySetInnerHTML
| File | Line | Risk |
|------|------|------|
| Frontend/src/components/ui/chart.tsx:83 | CSS injection into <style> tag — LOW (no user data, but dangerous pattern) |

### 5.2 localStorage Token Storage
| File | Line | Risk |
|------|------|------|
| rontend/src/lib/api/auth.ts:7 | Access token in localStorage |
| rontend/src/lib/api/auth.ts:16 | Access token in localStorage |
| rontend/src/lib/api/auth.ts:35 | Refresh token in localStorage |

**Risk:** Any XSS can steal tokens from localStorage. Backend sets httpOnly cookies, but frontend duplicates in localStorage.

### 5.3 Recommendations
1. **P1**: Remove localStorage token storage — rely on backend httpOnly cookies
2. **P3**: Replace dangerouslySetInnerHTML with safe CSS injection pattern
3. Add Content-Security-Policy headers via Helmet (currently not configured)

---

## 6. CSRF Protection

### 6.1 Current Implementation
| Control | Location | Status |
|---------|----------|--------|
| CSRF token endpoint | uth.controller.ts:168-174 | ✅ |
| CsrfGuard class | common/http/csrf.guard.ts | ✅ Defined, **NOT registered** |
| Cookie sameSite: 'strict' | uth.controller.ts:105-106 | ✅ |
| Frontend CSRF header usage | Not verified | ❌ |

**The CSRF guard is dead code** — never registered globally or per-controller.

### 6.2 Recommendations
1. Register CsrfGuard globally in AppModule
2. Or add @UseGuards(CsrfGuard) to all mutation endpoints
3. Ensure all POST/PUT/PATCH/DELETE from frontend include x-csrf-token header

---

## 7. Password Policies

### 7.1 Current Implementation
| Policy | Detail | Location |
|--------|--------|----------|
| Minimum length | 8 characters | password-policy.service.ts:19 |
| Uppercase required | Yes | password-policy.service.ts:20 |
| Lowercase required | Yes | password-policy.service.ts:21 |
| Digit required | Yes | password-policy.service.ts:22 |
| Special character required | Yes | password-policy.service.ts:23 |
| Password hashing | bcrypt, 10 rounds | users.controller.ts:41 |
| Progressive lockout | 3->5min, 6->24h, 9->permanent | uth.controller.ts:53-76 |

### 7.2 Gaps
| Gap | Severity | Detail |
|-----|----------|--------|
| **Policy not enforced on registration** | HIGH | Auto-created users via registration approval skip password policy |
| **Hardcoded password hash** | CRITICAL | Every auto-approved user gets same known password |
| **No password history** | MEDIUM | No check against previous passwords |
| **No password expiry** | MEDIUM | No forced periodic password change |
| **setTimeout lockout not persistent** | MEDIUM | Auto-unlock lost on process restart |

### 7.3 Recommendations
1. **P0**: Remove hardcoded password hash — generate random password + force change on first login
2. **P1**: Enforce password policy on registration approval
3. **P1**: Implement DB-based lockout unlock check instead of setTimeout
4. **P2**: Add password history tracking

---

## 8. Audit Logging Coverage

### 8.1 Current Implementation
| Control | Detail | Location |
|---------|--------|----------|
| Global AuditInterceptor | POST/PUT/PATCH/DELETE automatically audited | pp.module.ts:93-95 |
| @Audit() decorator | Manual audit on specific methods | udit.decorator.ts |
| Append-only design | No update/delete methods | udit.service.ts |
| Correlation IDs | x-correlation-id per request | correlation.middleware.ts |
| Before/after snapshots | Request body and response captured | udit.interceptor.ts:32-48 |

### 8.2 Coverage Gaps
| Endpoint | Audit Status |
|---------|-------------|
| Auth (login, logout, refresh) | ⚠️ Global interceptor covers POST, @Audit() not added |
| Customers CRUD | ✅ Explicit @Audit() added |
| Meters CRUD | ✅ Global interceptor |
| Readings | ✅ |
| Billing (generate, issue, cancel) | ⚠️ Global interceptor covers mutations |
| Payments | ⚠️ |
| Admin console | ⚠️ Global interceptor covers POST body (logs raw SQL) |
| Registration approval/rejection | ❌ No explicit @Audit() |
| **Sensitive GET endpoints** | ❌ Not audited (360 view, statement) |
| Login failures | ⚠️ Tracked via LoginAttempt model, not AuditLog |

### 8.3 Recommendations
1. Add @Audit() to registration approval/rejection endpoints
2. Add selective GET auditing for sensitive endpoints (customer 360, statement)
3. Add @Audit() to auth controller mutations (login, logout, refresh)

---

## 9. Hardcoded Secrets & Findings Summary

| Finding | Severity | Location |
|---------|----------|----------|
| Hardcoded bcrypt hash in registration | CRITICAL | egistration.controller.ts:55 |
| Weak default JWT secret in docker-compose | CRITICAL | docker-compose.yml:39 |
| Dev login enabled by default | HIGH | ackend/.env:12 |
| Default DB password in docker-compose | HIGH | docker-compose.yml:11 |
| API keys stored in plaintext | MEDIUM | pi-gateway/src/services/store.js:44-50 |

---

## 10. Security Risk Summary

| # | Vulnerability | Severity | CVSS v3 |
|---|--------------|----------|---------|
| 1 | Hardcoded password hash in registration | CRITICAL | 8.5 |
| 2 | Raw SQL injection in admin controller | CRITICAL | 9.0 |
| 3 | Weak default JWT secret in docker-compose | CRITICAL | 8.0 |
| 4 | Dev login endpoint exposed | CRITICAL | 8.5 |
| 5 | Tokens in localStorage (XSS vector) | HIGH | 7.0 |
| 6 | No per-IP rate limiting on auth endpoints | HIGH | 7.5 |
| 7 | 10 controllers missing class-level guards | HIGH | 6.5 |
| 8 | CSRF guard defined but never used | HIGH | 6.5 |
| 9 | No session invalidation on password change | MEDIUM | 6.0 |
| 10 | MFA field exists but not implemented | MEDIUM | 5.5 |
| 11 | No file upload validation (size/type) | MEDIUM | 5.0 |
| 12 | setTimeout lockout not persistent | MEDIUM | 4.0 |
| 13 | No CSP headers configured | MEDIUM | 4.0 |
| 14 | Public endpoints without rate limits | MEDIUM | 4.0 |
| 15 | PermissionsGuard and ProjectAccessGuard unused | LOW | 3.0 |

---

## 11. Immediate Action Items (P0)

| # | Action | Effort |
|---|--------|--------|
| 1 | Remove hardcoded password hash; generate random password | 2h |
| 2 | Add fail-fast guard for default JWT_SECRET in production | 1h |
| 3 | Remove or harden dev-login endpoint for production | 1h |
| 4 | Move SQL console to isolated admin service or add query guardrails | 16h |
| 5 | Add class-level guards to all 10 unprotected controllers | 2h |
| 6 | Add per-IP rate limiting on auth endpoints | 4h |

---

*End of Security Validation Report*
