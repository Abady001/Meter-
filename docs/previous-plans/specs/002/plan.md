# Meter Verse Core — Implementation Plan

## Task Dependencies

```
T086 (Core DB) ──> T087 (Features DB) ──> T088 (Area DB Template) ──> T090 (i18n)
                                            │
T086 ──> T089 (RBAC) ──> T092 (Availability)
       │
       └──> T091 (Symbiot bridge — see 003-symbiot-integration)
```

---

## T086 — Core DB Schema (15 tables)

| Field | Detail |
|---|---|
| **Dependencies** | None |
| **Files to create** | `db/core/001-users.sql`, `002-roles.sql`, `003-permissions.sql`, `004-areas.sql`, `005-projects.sql`, `006-audit-log.sql`, `007-system-config.sql`, `008-notification-queue.sql`, `009-bank-accounts.sql`, `010-payment-centers.sql`, `011-holidays.sql`, `012-location-zones.sql`, `013-unit-types.sql`, `014-customer-groups.sql`, `015-settlements.sql` |
| **Files to modify** | None |
| **Acceptance criteria** | 15 tables deployed; each has PK, at least one FK, and proper indexing |
| **Validation** | `SELECT count(*) FROM information_schema.tables WHERE table_schema = 'core'` returns 15 |

---

## T087 — Features DB Schema (10 tables)

| Field | Detail |
|---|---|
| **Dependencies** | T086 |
| **Files to create** | `db/features/001-consumer.sql`, `002-meter.sql`, `003-meter-reading.sql`, `004-invoice.sql`, `005-payment.sql`, `006-ledger.sql`, `007-tariff.sql`, `008-rate-plan.sql`, `009-disconnect-order.sql`, `010-complaint.sql` |
| **Files to modify** | `db/core/015-settlements.sql` (add FK to features.consumer) |
| **Acceptance criteria** | 10 tables deployed; foreign keys reference core tables |
| **Validation** | `SELECT count(*) FROM information_schema.tables WHERE table_schema = 'features'` returns 10 |

---

## T088 — Area DB Template (45 tables)

| Field | Detail |
|---|---|
| **Dependencies** | T087 |
| **Files to create** | `db/area/template.sql` (single file with all 45 DDLs), `scripts/instantiate-area.sql` (template function) |
| **Files to modify** | None |
| **Acceptance criteria** | Template script can be run against an empty database and produces 45 tables |
| **Validation** | Instantiate a test database; `SELECT count(*) FROM information_schema.tables` returns 45 |

---

## T089 — 16-Profile RBAC with Area Middleware

| Field | Detail |
|---|---|
| **Dependencies** | T086 |
| **Files to create** | `src/MeterVerse.Core/Rbac/ProfileSeed.cs`, `src/MeterVerse.Core/Rbac/PermissionAttribute.cs`, `src/MeterVerse.Core/Middleware/AreaAuthorizationMiddleware.cs`, `src/MeterVerse.Core/Middleware/PrincipalAccessor.cs` |
| **Files to modify** | `src/MeterVerse.Api/Program.cs` (register middleware), `src/MeterVerse.Api/appsettings.json` (seed profiles) |
| **Acceptance criteria** | 16 profiles seeded; 27+ permissions checked on every secured endpoint; area intersection enforced |
| **Validation** | Integration test: each profile × each endpoint returns 200 (authorized) or 403 (unauthorized) as expected |

---

## T090 — i18n Engine 676 AR/EN Keys

| Field | Detail |
|---|---|
| **Dependencies** | T086 |
| **Files to create** | `db/core/016-i18n-keys.sql`, `src/MeterVerse.Core/Localization/I18nService.cs`, `src/MeterVerse.Core/Localization/I18nCache.cs`, `scripts/i18n-import.csv` (676 rows) |
| **Files to modify** | `src/MeterVerse.Api/Program.cs` (register I18nService) |
| **Acceptance criteria** | 676 keys imported; both locales return the expected translation; cache hit < 1 ms |
| **Validation** | `SELECT count(*) FROM core.i18n WHERE locale = 'ar'` = 338; `locale = 'en'` = 338 |

---

## T091 — Symbiot Bridge

| Field | Detail |
|---|---|
| **Dependencies** | T086, T088 |
| **Files to create** | See `specs/003-symbiot-integration/plan.md` |
| **Files to modify** | None |
| **Acceptance criteria** | 10 TCP channels, 100 concurrent HTTP connections each, health check, failover |
| **Validation** | See `specs/003-symbiot-integration/plan.md` |

---

## T092 — 3 Availability Plans

| Field | Detail |
|---|---|
| **Dependencies** | T089 |
| **Files to create** | `deploy/availability/full.json`, `deploy/availability/safety.json`, `deploy/availability/failover.json`, `scripts/failover-test.ps1` |
| **Files to modify** | `docker-compose.yml` (replica definitions), `nginx/load-balancer.conf` |
| **Acceptance criteria** | Full plan: 3 replicas, RTO < 1 min; Safety plan: 2 replicas, RTO < 5 min; Failover plan: 1 + warm standby, RTO < 15 min |
| **Validation** | Induce primary failure; measure time-to-recovery against RTO targets |
