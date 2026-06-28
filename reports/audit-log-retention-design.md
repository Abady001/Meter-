# Report 4: Audit Log Retention Design

**Date:** 2026-06-25
**Sources:** `backend/src/audit/*`, `backend/prisma/schema.prisma`

---

## Audit Events Tracked

### Two audit tables exist in Prisma:

| Table | Schema | Purpose |
|-------|--------|---------|
| `sim_system.audit_log` | `sim_system` | T010 append-only audit (feature DB) — used by `AuditService` and `SecurityAuditService` |
| `core.audit_log` | `core` | Core schema audit — uses `AuditActionType` enum, auto-increment BigInt PK, linked to `CoreUser` |

### Events captured by `sim_system.audit_log` (via `AuditInterceptor`):

All non-GET, non-OPTIONS requests are automatically logged. The interceptor extracts:
- `actorId` / `actorRole` from JWT payload
- `action` from `@Audit('resource', 'action')` decorator, or falls back to HTTP method
- `resourceType` from decorator, or `'unknown'`
- `resourceId` from `req.params.id` → `req.body.id` → `req.params[0]` → `'unknown'`
- `beforeState` / `afterState` from request body and response data
- `correlationId` from `req.correlationId` (T007)
- `reason` from `req.body.reason`

### Events captured by `SecurityAuditService` (manual calls):

| Event Type | Severity Range | Description |
|-----------|---------------|-------------|
| SECURITY_* (any eventType) | LOW / MEDIUM / HIGH / CRITICAL | Security events: failed logins, unauthorized access, permission denials |
| `outcome`: SUCCESS or FAILURE | — | All security events track outcome |
| `ipAddress`, `userAgent` | — | Captured when available |

### Events tracked via `CoreAuditLog` (`core.audit_log`):

Uses `AuditActionType` enum: `create`, `update`, `delete`, `login`, `logout`, `assign`, `unassign`, `approve`, `reject`, `correct`, `generate`, `issue`, `cancel`

## Compression / Retention

**NONE — neither table implements compression or retention:**

- No TTL, no archival mechanism, no partitioning by date
- No `expiresAt` column, no cleanup job, no compression strategy
- `sim_system.audit_log` has only an index on `[createdAt]` — no periodic purge
- `core.audit_log` has indexes on `[createdAt]`, `[userId]`, `[entityType, entityId]` — no retention logic

### Query / Access Pattern

The only way to query audit data is via the **Report Generation Service**:

| Report Type | Code Location | Query | Limit |
|------------|--------------|-------|-------|
| `audit-log` | `report-generation.service.ts:166` | `auditLog.findMany({ orderBy: { createdAt: 'desc' }, take: 200 })` | 200 |
| `user-activity` | `report-generation.service.ts:279` | `auditLog.findMany({ orderBy: { createdAt: 'desc' }, take: limit })` | max 1000 |

### Admin Portal

The admin controller (`admin.controller.ts`) does **NOT** expose a dedicated audit log route. It offers:
- `GET /admin/tables` — lists table names (static)
- `GET /admin/data/:table` — generic table browser (restricted to 13 allowed tables; audit_log is **not** in the allowlist)
- `POST /admin/query` — raw SQL (SELECT/EXPLAIN only with blocklist)

This means audit logs can only be queried via plain SQL through the raw query endpoint or via the `audit-log` report.

## Append-Only Guarantee

**Implementing via `AuditService.create()` only:**
- No update or delete methods exposed
- Hash chaining via SHA-256: `hash(actorId|action|resourceType|resourceId|correlationId|previousHash)`
- `verifyIntegrity()` method can detect tampering by recomputing the chain
- The interceptor catches DB errors silently (`.catch(() => {}))` without blocking the response

## Verdict

| Requirement | Status |
|-------------|--------|
| Append-only | ✅ SHA-256 hash chain |
| Integrity verification | ✅ `verifyIntegrity()` method |
| Audit interceptor (auto) | ✅ All non-GET requests |
| Security audit service | ✅ Manual security events |
| Core audit table | ✅ `CoreAuditLog` with enum actions |
| Compression | ❌ Not implemented |
| Retention / TTL / archival | ❌ Not implemented |
| Admin portal audit route | ❌ No dedicated endpoint |
| Audit log report | ✅ Limited (200/1000 rows) |
