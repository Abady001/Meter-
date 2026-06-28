# System Discovery Report — Meter Verse

**Generated:** 2026-06-25  
**Repository:** `D:\meter\Meter`  
**GitHub:** https://github.com/Kirllos360/Meter  

---

## 1. Technology Stack

### 1.1 Backend Core (`backend/package.json`)
| Technology | Version | Purpose |
|-----------|---------|---------|
| Node.js | >=20 | Runtime |
| NestJS | ^10.4.2 | Framework |
| TypeScript | ^5.6.2 | Language |
| PostgreSQL | 16 (Docker) | Database |
| Prisma ORM | ^6.19.3 | Database ORM |
| Passport.js | ^0.7.0 | Auth middleware |
| JWT (jsonwebtoken) | Passport-JWT ^4.0.1 | Token auth |
| bcryptjs | ^3.0.3 | Password hashing |
| Helmet | ^8.2.0 | HTTP security headers |
| class-validator | ^0.15.1 | DTO validation |
| class-transformer | ^0.5.1 | Serialization |
| Swagger/OpenAPI | ^7.4.2 | API docs |
| Throttler | ^6.5.0 | Rate limiting |
| Puppeteer | ^25.1.0 | PDF generation |
| PDFKit | ^0.19.1 | PDF generation |
| xlsx | ^0.18.5 | Excel import |
| Archiver | ^8.0.0 | ZIP creation |
| cookie-parser | ^1.4.7 | Cookie parsing |

### 1.2 Frontend (`Frontend/package.json`)
| Technology | Version | Purpose |
|-----------|---------|---------|
| Bun | - | Runtime |
| Next.js | 16.2.6 | Framework |
| React | ^19.0.0 | UI library |
| TypeScript | ^5 | Language |
| Tailwind CSS | ^4 | Styling |
| shadcn/ui | - | UI components |
| TanStack React Query | ^5.82.0 | Data fetching |
| TanStack React Table | ^8.21.3 | Table component |
| next-auth | ^4.24.11 | Auth (frontend) |
| next-intl | ^4.13.0 | i18n |
| Zod | ^4.0.2 | Schema validation |
| Zustand | ^5.0.6 | State management |
| React Hook Form | ^7.60.0 | Form handling |
| Recharts | ^2.15.4 | Charts |
| Framer Motion | ^12.23.2 | Animations |
| date-fns | ^4.1.0 | Date utilities |
| Radix UI | ~30 packages | Headless UI primitives |
| Lucide React | ^0.525.0 | Icons |
| Prisma (frontend) | ^6.11.1 | Byproduct / unused |
| Playwright | ^1.60.0 | E2E testing |

### 1.3 API Gateway (`api-gateway/package.json`)
| Technology | Version | Purpose |
|-----------|---------|---------|
| Express | ^4.21.0 | HTTP server |
| express-rate-limit | ^7.4.0 | Rate limiting |
| http-proxy-middleware | ^3.0.0 | Proxy |

### 1.4 Admin Console (`backend/admin-console/package.json`)
| Technology | Version | Purpose |
|-----------|---------|---------|
| Express | ^4.21.0 | HTTP server |
| JSON Web Token | ^9.0.2 | JWT auth |
| bcryptjs | ^2.4.3 | Password hashing |
| Helmet | ^8.0.0 | Security headers |
| express-rate-limit | ^7.4.0 | Rate limiting |
| Zod | ^3.23.0 | Validation |

### 1.5 Admin Portal (`backend/admin-portal/package.json`)
Same as admin-console, plus `crypto` package.

---

## 2. Architecture Description

**Meter Verse** is a multi-schema utility metering and billing platform organized into 3 deployment plans and 15 area databases:

### Deployment Plans
| Plan | Description |
|------|-------------|
| **Plan 1 — Full** | All modules (Core + Features + 15 Areas) |
| **Plan 2 — Safety** | Metering only (Core + 15 Areas, no billing) |
| **Plan 3 — Failover** | Read-only (Core + cached queries) |

### Database Architecture (Prisma Multi-Schema)
```
sim_system (default)   → Core operational tables (28 models)
core                   → Auth, roles, users, areas (18 models)
features               → Tariffs, reports, solar wallet (20+ models)
area                   → Future per-client area data
```

### 15 Area Databases (Per-Client Isolation)
october, new_cairo, sodic_ednc, sodic_estates, sodic_vye, badya_city, north_coast, uvines_mall, +7 future areas

### Key Architectural Patterns
- **NestJS modules** — Feature-based modular architecture (~37 modules)
- **Global guards** — `GlobalAuthGuard` (JWT), `ThrottlerGuard`, `AreaGuard`
- **Global interceptors** — `AuditInterceptor`, `ProjectAccessInterceptor`
- **Correlation middleware** — `x-correlation-id` per request
- **API versioning** — `/api/v1/*` global prefix
- **Append-only audit** — `AuditLog` model, no update/delete
- **Idempotency** — `IdempotencyRecord` model + interceptor
- **Error envelope** — Standardized error responses
- **Multi-schema Prisma** — 4 schemas across same PostgreSQL database

---

## 3. Module Inventory (Backend — 37 modules)

### 3.1 Controllers & Endpoints Summary

| # | Module | Controller Path | Endpoints Count | Auth Guard | Notes |
|---|--------|----------------|----------------|-----------|-------|
| 1 | Health | `app.controller.ts` | 1 | @Public() | GET /health |
| 2 | Auth | `auth/auth.controller.ts` | 6 | Mixed | login, refresh, logout, dev-login, me, csrf-token |
| 3 | Projects | `projects/projects.controller.ts` | 5 | JWT+RBAC | CRUD |
| 4 | Locations | `projects/locations/locations.controller.ts` | 5 | JWT+RBAC | CRUD under projects |
| 5 | Dashboard | `projects/dashboard/dashboard.controller.ts` | 3 | JWT+RBAC | KPIs, consumption, activity |
| 6 | Customers | `customers/customers.controller.ts` | 8 | JWT+RBAC | CRUD + 360 view + statement + transfer |
| 7 | Meters | `meters/meters.controller.ts` | 7 | JWT+RBAC | CRUD + assign + terminate |
| 8 | SIM Cards | `sim-cards/sim-cards.controller.ts` | 6 | JWT+RBAC | CRUD + eligibility |
| 9 | Readings | `readings/readings.controller.ts` | 6 | JWT+RBAC | CRUD + review queue + approve + reject |
| 10 | Water Balance | `readings/water-balance/water-balance.controller.ts` | 1 | JWT+RBAC | GET water balance |
| 11 | Invoices | `invoices/invoices.controller.ts` | 2 | Partial | PDF download, batch download |
| 12 | Billing | `billing/billing.controller.ts` | 12 | JWT+RBAC | Generate/issue/cancel invoices, tariffs, periods, payments, simulate |
| 13 | Payments | `payments/payments.controller.ts` | 5 | JWT+RBAC | List/get/update/delete/reverse |
| 14 | Notifications | `notifications/notifications.controller.ts` | 5 | JWT+RBAC | List, unread count, mark read, mark all, delete |
| 15 | Tickets | `tickets/tickets.controller.ts` | 8 | JWT+RBAC | CRUD + comments + status |
| 16 | Support | `support/support.controller.ts` | 6 | JWT+RBAC | CRUD + escalate |
| 17 | Reports | `reports/reports.controller.ts` | 6 | JWT+RBAC | CRUD templates + generate |
| 18 | Settings | `settings/settings.controller.ts` | 3 | JWT+RBAC | Get all, get one, update |
| 19 | Search | `search/search.controller.ts` | 1 | JWT+RBAC | Global search |
| 20 | Upload | `upload/upload.controller.ts` | 6 | JWT+RBAC | History, file upload, template download, bulk import |
| 21 | Downloads | `downloads/downloads.controller.ts` | 4 | JWT+RBAC | CSV/PDF export, invoice download |
| 22 | Users | `users/users.controller.ts` | 6 | JWT+RBAC | CRUD + password reset |
| 23 | Admin | `admin/admin.controller.ts` | 6 | JWT+RBAC | DB admin: tables, browse, dependencies, insert, update, delete, query |
| 24 | Areas | `areas/areas.controller.ts` | 5 | Mixed | CRUD + public list |
| 25 | Registration | `registration/registration.controller.ts` | 7 | Mixed | Public register + admin review |
| 26 | KPI | `kpi/kpi.controller.ts` | 3 | JWT+RBAC | Executive, collections, utilities |
| 27 | Wallet | `wallet/wallet.controller.ts` | 5 | JWT+RBAC | Get, credit, debit, transfer, history, balance |
| 28 | Solar | `solar/solar.controller.ts` | 6 | JWT+RBAC | Wallet, readings, dashboard, statement, simulate |
| 29 | Settlement | `settlement/settlement.controller.ts` | 4 | JWT+RBAC | Create, list, adjustments |
| 30 | Chilled Water | `chilled-water/chilled-water.controller.ts` | 5 | JWT+RBAC | Meters, readings, simulate, dashboard |
| 31 | Bill Cycle | `bill-cycle/bill-cycle.controller.ts` | 6 | JWT+RBAC | Create, list, start, generate, post, cancel |
| 32 | Unit Types | `unit-types/unit-types.controller.ts` | 4 | JWT+RBAC | CRUD |
| 33 | Collections | `collections/collections.controller.ts` | 4 | JWT+RBAC | Dashboard KPIs, payment receipt, aging |
| 34 | SIM Cards | `sim-cards/sim-cards.controller.ts` | 6 | JWT+RBAC | CRUD + eligibility |

**Total: ~165+ backend endpoints**

### 3.2 Missing Auth Guards
Controllers without explicit `@UseGuards(AuthGuard('jwt'), RolesGuard)`:
- `InvoicesController` — no class-level guard, relies on `@Roles()` decorator alone
- `BillCycleController` — no class-level guard, relies on `@Roles()` decorator alone
- `ReportsController` — no class-level guard, relies on `@Roles()` decorator alone
- `TicketsController` — no class-level guard, relies on `@Roles()` decorator alone
- `SupportController` — no class-level guard, relies on `@Roles()` decorator alone
- `SettingsController` — no class-level guard, relies on `@Roles()` decorator alone
- `SearchController` — no class-level guard, relies on `@Roles()` decorator alone
- `CollectionsController` — no class-level guard, relies on `@Roles()` decorator alone
- `KpiController` — no class-level guard, relies on `@Roles()` decorator alone
- `WalletController` — no class-level guard, relies on `@Roles()` decorator alone

However, `GlobalAuthGuard` is registered globally in `AppModule`, so all routes require JWT by default unless marked `@Public()`.

---

## 4. Database Schema Summary

### 4.1 Schema: `sim_system` (28 models)

| Model | Fields | Key Relationships | Purpose |
|-------|--------|-----------------|---------|
| Project | 17 | → LocationNode, Customer | Project/Customer group |
| LocationNode | 14 | → Project, self-referencing (parent/child) | Location hierarchy |
| Customer | 14 | → Project, → CustomerUnitAssignment | Customer accounts |
| CustomerUnitAssignment | 10 | → Customer, → LocationNode | Customer-unit mapping |
| Meter | 24 | self-ref hierarchy, → MeterAssignment, → SIMAssignment | Meter inventory |
| SIMCard | 10 | → SIMAssignment | SIM card inventory |
| MeterAssignment | 12 | → Meter | Meter assignment history |
| SIMAssignment | 10 | → SIMCard, → Meter | SIM assignment history |
| Reading | 16 | — | Meter readings |
| ReadingReview | 5 | — | Reading approval/rejection |
| TariffPlan | 13 | — | Tariff rate plans |
| BillingPeriod | 10 | — | Time periods for billing |
| Invoice | 21 | — | Billing invoices |
| InvoiceLine | 8 | — | Invoice line items |
| InvoiceAdjustment | 7 | — | Invoice adjustments |
| Payment | 11 | — | Payment records |
| PaymentAllocation | 5 | — | Payment-to-invoice allocation |
| CustomerLedgerEntry | 9 | — | Append-only ledger |
| IdempotencyRecord | 9 | — | Idempotency tracking |
| ProjectThreshold | 10 | — | Reading thresholds |
| AuditLog | 11 | — | Append-only audit |
| ReportJob | 9 | — | Report job tracking |
| RefreshToken | 7 | — | JWT refresh tokens |
| LoginAttempt | 5 | — | Login attempt tracking |
| Notification | 10 | — | Notifications |
| ReportTemplate | 7 | — | Report templates |
| Ticket | 11 | — | Support tickets |
| TicketComment | 5 | — | Ticket comments |
| SupportRequest | 11 | — | Support requests |
| SystemSetting | 3 | — | Key-value settings |
| UploadHistory | 8 | — | Import history |

### 4.2 Schema: `core` (18 models)

| Model | Fields | Key Relationships |
|-------|--------|-----------------|
| CoreUser | 15 | → CoreUserRoleAssignment, CoreAuditLog, CoreNotificationQueue |
| CoreRole | 6 | → CoreRolePermission, CoreUserRoleAssignment |
| CorePermission | 5 | → CoreRolePermission |
| CoreRolePermission | 4 | → CoreRole, CorePermission |
| CoreUserRoleAssignment | 6 | → CoreUser, CoreRole |
| CoreArea | 7 | → CoreProject, CoreHoliday, CoreSettlement, CorePaymentCenter |
| CoreProject | 7 | → CoreArea |
| CoreAuditLog | 9 | → CoreUser |
| CoreSystemConfig | 6 | — |
| CoreNotificationQueue | 9 | → CoreUser |
| CorePaymentCenter | 6 | → CoreArea, CoreBankAccount |
| CoreBankAccount | 7 | → CorePaymentCenter |
| CoreHoliday | 6 | → CoreArea |
| CoreLocationZone | 7 | Self-referencing |
| CoreUnitType | 4 | — |
| CoreUserGroup | 6 | — |
| CoreUserRequest | 13 | — |
| CoreCustomerGroup | 4 | — |
| CoreSettlement | 9 | → CoreArea |

### 4.3 Schema: `features` (20+ models)

| Model | Purpose |
|-------|---------|
| Tariff | Tariff definitions |
| TariffVersion | Version history |
| TariffCharge | Charge lines per tariff |
| TariffChargeDetail | Step/rate details |
| ReportDefinition | Report definitions |
| ReportExport | Export job records |
| ScheduledJob | Cron job configuration |
| ExportHistory | Export history |
| RunningActivity | Background job tracking |
| ContractualRequest | Customer requests |
| WalletAccount | Solar wallet |
| WalletTransaction | Wallet transactions |
| WalletBalance | Daily balances |
| WalletAllocation | Fund allocations |
| WalletTransfer | Wallet-to-wallet transfers |

### 4.4 Enums (total: 30+)
ProjectStatus, WaterDifferenceMode, NodeType, CustomerType, EntityStatus, MeterType (7), MeterStatus (8), IpType, SimStatus (7), AssignmentStatus, ReadingSource (4), ReadingStatus (6), ReviewAction (3), TariffStatus (3), BillingPeriodStatus (3), UtilityType (7), InvoiceStatus (7), AdjustmentType (2), PaymentMethod (6), PaymentStatus (4), LedgerEntryType (5), ReferenceType (3), ReportJobStatus (4), ReportFormat (3), UserStatus (4), AuditActionType (12), NotificationType (4), ReferenceObjectType (7), SettlementStatus (4), ZoneType (5), TariffChargeMode (5), TariffSettlementType (3), BillingCycleStatus (5), WalletTransactionType (5), WalletTransferStatus (4), ChilledWaterAllocationMethod (3), SettlementRuleType (4), DocumentStatus (3)

---

## 5. Auth & Security Summary

### 5.1 JWT Authentication
- **Strategy:** `passport-jwt` with `ExtractJwt.fromAuthHeaderAsBearerToken()`
- **Secret:** Loaded from `JWT_SECRET` env var
- **Expiration:** Configurable via `JWT_EXPIRES_IN` (default: 3600s = 1 hour)
- **Payload:** `{ sub, userId, username, role, areas }`
- **Validation:** Checks `sub` and `role` presence; validates role against `Role` enum

### 5.2 Role-Based Access Control (16 profiles)
```
super_admin, system_admin, admin, area_manager, team_leader,
operator, technician, finance, support, customer, collector,
meter_reader, inspector, supervisor, accountant, viewer
```

### 5.3 Guard Stack (Global)
1. **ThrottlerGuard** — 100 requests per 60s
2. **GlobalAuthGuard** — JWT validation, role checking
3. **AreaGuard** — Area-scoped access via `x-area-id` header

### 5.4 Security Controls in Place
- [x] Helmet HTTP headers
- [x] CORS configuration (whitelisted origins)
- [x] Rate limiting (ThrottlerModule)
- [x] JWT authentication (Bearer token + httpOnly cookies)
- [x] Refresh token rotation
- [x] Progressive login lockout (3→5min, 6→24h, 9→permanent)
- [x] Password hashing (bcryptjs, 10 rounds)
- [x] Global validation pipe (whitelist, forbidNonWhitelisted)
- [x] CSRF token endpoint (GET /auth/csrf-token)
- [x] Cookie security (httpOnly, secure, sameSite: strict)
- [x] Append-only audit logging
- [x] Idempotency key support
- [x] Correlation IDs per request
- [x] Error envelope (no stack traces in production)

### 5.5 Security Gaps
- [ ] **No rate limit on login endpoint** — `POST /auth/login` is public, no per-IP throttling
- [ ] **Dev login endpoint exposed** — `POST /auth/dev-login` creates tokens for any userId
- [ ] **No SQL injection protection on raw queries** — `$queryRawUnsafe` in admin + customers controllers
- [ ] **Missing input sanitization** — No XSS protection beyond Helmet
- [ ] **No MFA enforcement** — `isMfaEnabled` field exists but no 2FA flow implemented
- [ ] **InvoicesController missing class-level guards** — Relies on `@Roles()` only
- [ ] **Weak JWT secret default** — `change-me-in-production` in docker-compose.yml
- [ ] **No RBAC on `@Public()` endpoints** — Area listing is public
- [ ] **No session invalidation on password change** — Old JWT tokens remain valid
- [ ] **No API key validation** — No mechanism for service-to-service auth
- [ ] **Registration auto-approves** — Request creates user but temp hash is hardcoded

---

## 6. Front-End Pages & Routes

### 6.1 Direct App Routes (`Frontend/src/app/`)
| Route | File | Status |
|-------|------|--------|
| `/` | `page.tsx` | Root redirect |
| `/login` | `login/page.tsx` | Active |
| `/register` | `register/page.tsx` | Active |

### 6.2 Navigation Tree (from `navigation.ts`) — 43 routes

| # | Route | Title | Component | Status |
|---|-------|-------|-----------|--------|
| 1 | `/dashboard` | Dashboard | `DashboardPage.tsx` | ✅ |
| 2 | `/executive-dashboard` | Executive Dashboard | `ExecutiveDashboard.tsx` | ✅ |
| 3 | `/operations-dashboard` | Operations Dashboard | `OperationsDashboard.tsx` | ✅ |
| 4 | `/billing-dashboard` | Billing Dashboard | `BillingDashboard.tsx` | ✅ |
| 5 | `/collections-dashboard-plus` | Collections+ Dashboard | `CollectionsDashboardPlus.tsx` | ✅ |
| 6 | `/utility-dashboard` | Utility Dashboard | `UtilityDashboard.tsx` | ✅ |
| 7 | `/kpi-executive` | KPI Executive | `ExecutiveDashboard.tsx` | ✅ |
| 8 | `/kpi-collections` | KPI Collections | `CollectionsDashboard.tsx` | ✅ |
| 9 | `/kpi-utilities` | KPI Utilities | `UtilitiesDashboard.tsx` | ✅ |
| 10 | `/customers` | Customers List | `CustomersPage.tsx` | ✅ |
| 11 | `/customers/:id` | Customer Detail | `CustomerDetailPage.tsx` | ✅ |
| 12 | `/balances` | Balances | — | ❌ Missing |
| 13 | `/downloads` | Documents | — | ❌ Missing |
| 14 | `/projects` | Project List | `ProjectsPage.tsx` | ✅ |
| 15 | `/locations` | Units/Locations | `LocationsPage.tsx` | ✅ |
| 16 | `/meters` | All Meters | `MetersPage.tsx` | ✅ |
| 17 | `/meters/assign` | Assign Meter | `MeterAssignPage.tsx` | ✅ |
| 18 | `/meters/replace` | Replace Meter | `MeterReplacePage.tsx` | ✅ |
| 19 | `/meters/terminate` | Terminate Meter | `MeterTerminatePage.tsx` | ✅ |
| 20 | `/readings` | All Readings | `ReadingsPage.tsx` | ✅ |
| 21 | `/readings/new` | New Reading | `ReadingNewPage.tsx` | ✅ |
| 22 | `/invoices` | Invoices | — | ❌ Missing |
| 23 | `/adjustments` | Adjustments | — | ❌ Missing |
| 24 | `/tariff-studio` | Tariff Studio | `TariffStudioPage.tsx` | ✅ |
| 25 | `/bill-cycle` | Bill Cycle | — | ❌ Missing |
| 26 | `/payments` | Payments | — | ❌ Missing |
| 27 | `/collections` | Collections | — | ❌ Missing |
| 28 | `/promises` | Promises | — | ❌ Missing |
| 29 | `/recovery` | Recovery | — | ❌ Missing |
| 30 | `/utility/electricity` | Electricity | — | ❌ Missing |
| 31 | `/utility/water` | Water | — | ❌ Missing |
| 32 | `/utility/solar` | Solar | `SolarDashboard.tsx` | ✅ |
| 33 | `/utility/gas` | Gas | — | ❌ Missing |
| 34 | `/utility/chilled-water` | Chilled Water | — | ❌ Missing |
| 35 | `/utility/outdoor-unit` | Outdoor Unit | — | ❌ Missing |
| 36 | `/utility/settlement` | Settlement | `SettlementPage.tsx` | ✅ |
| 37 | `/reports` | Reports | `ReportsPage.tsx` | ✅ |
| 38 | `/settings` | Settings | `SettingsPage.tsx` | ✅ |
| 39 | `/upload-center` | Upload Center | `UploadCenterPage.tsx` | ✅ |
| 40 | `/notifications` | Notifications | — | ❌ Missing |
| 41 | `/tickets` | Tickets | `TicketsPage.tsx` | ✅ |
| 42 | `/support` | Support | `SupportPage.tsx` | ✅ |
| 43 | `/workplace` | Workplace | `WorkplacePage.tsx` | ✅ |
| 44 | `/rbac` | RBAC Admin | — | ❌ Missing |
| 45 | `/feature-flags` | Feature Flags | — | ❌ Missing |
| 46 | `/audit-logs` | Audit Logs | — | ❌ Missing |
| 47 | `/sync-gateway` | Sync Gateway | `SyncGatewayPage.tsx` | ✅ |

**Summary: 30 pages have components, 17 routes missing frontend components.**

---

## 7. i18n & Feature Flags

- **i18n:** `next-intl` configured, 676 keys mapped
- **Feature Flags:** `Frontend/src/lib/feature-flags.ts` — per-module mock/API toggle pattern
- **Data Source:** Currently using mock data in `src/lib/mock-*.ts`, migration to live APIs planned

---

## 8. Frontend Lib Structure
| File | Purpose |
|------|---------|
| `lib/types.ts` | UserRole type (7 roles), NavItem, RolePermissions |
| `lib/navigation.ts` | Navigation tree + role permissions (16 profiles) |
| `lib/feature-flags.ts` | Feature flag toggles |
| `lib/api/client.ts` | API client (createApiClient, apiGet, apiPost, etc.) |
| `lib/api/auth.ts` | Token storage + refresh |
| `lib/api/errors.ts` | Error handling |
| `lib/api/index.ts` | Re-exports |
| `lib/mock-*.ts` | Mock data (projects, meters, customers, readings) |
| `lib/hooks/use-projects.ts` | React Query hooks |

---

## 9. Reference Systems (7)
| System | Path | Purpose |
|--------|------|---------|
| Collection System | `reference/collection-system/` | Flask billing system (8 schemas, 36 tables) |
| SBill | `reference/sbill/` | SBill Palm Hills + Estates |
| Symbiot | `reference/symbiot/` | Symbiot SEP integration (10 TCP × 100 HTTP) |
| IMS | `reference/ims/` | IMS system |
| Meter Department | `reference/meter-department/` | Meter department files |
| Energy 360 | `reference/energy-360/` | Mobile app |
| Last Update | `reference/all-last-update/` | Latest system updates |

---

## 10. Deployment Infrastructure

### Docker Services (`docker-compose.yml`)
| Service | Image | Port | Dependencies |
|---------|-------|------|-------------|
| db | postgres:16-alpine | 5432 | — |
| backend | NestJS (local build) | 3001 | db (health check) |
| frontend | Next.js (local build) | 3000 | backend |

### API Gateway
- Express-based proxy at `api-gateway/`
- Rate limit middleware
- Proxy to backend services

### Admin Console
- Express-based at `backend/admin-console/`
- Direct DB admin interface
- JWT auth + Helmet + rate limiting

### Admin Portal
- Express-based at `backend/admin-portal/`
- Similar to admin-console
- Additional `crypto` package for enhanced security

---

## 11. Task Progress (overall)
- **T001-T054:** 54/54 tasks complete (54 ✅)
- **T086-T120 (v2.0.0):** Planning complete, implementation pending
- **Current test count:** 287/287 passing (34 suites)
- **Multi-schema migration:** Phase 0/7 completed
