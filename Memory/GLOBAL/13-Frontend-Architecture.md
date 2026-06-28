# Meter Verse — Frontend Enterprise Engineering Operating System

**Version:** 1.0  
**Last Updated:** 2026-06-27  
**Status:** PERMANENT — updated only when architecture changes

---

## MODULE 1 — Frontend Philosophy

### Business-First Architecture
The frontend is the **digital twin** of the Meter Verse business domain. Every page, component, and data flow maps directly to a business entity: Area, Project, Meter, Customer, Tariff, Invoice, Payment, Wallet, Settlement, Reading.

### Ownership Model
| Ownership | Responsibility |
|-----------|---------------|
| Component Ownership | Every component has a single purpose |
| Data Ownership | Every data fetch belongs to one domain hook |
| Presentation Ownership | UI components never manage state |
| State Ownership | React Query owns server state, context owns global state |

### Guiding Principles
- Business-first, not UI-first
- Every screen must answer: "What business problem does this solve?"
- No page without a loading state, error state, and empty state
- Every button must be functional, disabled-with-reason, or permission-hidden

---

## MODULE 2 — Folder Architecture

```
src/
├── app/                         # Next.js App Router
│   ├── layout.tsx               # Root layout (providers, theme, locale)
│   ├── page.tsx                 # Dashboard redirect
│   ├── login/page.tsx           # Login page
│   └── register/page.tsx        # Registration
├── components/
│   ├── admin/                   # Admin portal (DB admin)
│   ├── billing/                 # Invoices, payments, balances, bill cycle, consumption, water balance
│   ├── customers/               # List, detail, new customer, ownership tab, wallet tab
│   ├── dashboard/               # 7 dashboards (main, billing, collections, operations, solar, utility, executive)
│   ├── kpi/                     # Executive, collections, utilities KPIs
│   ├── layout/                  # AppShell, AppSidebar, TopNav, ThemeProvider, LocaleLayout, LoginPage, PageHeader, AreaProjectSwitcher, RoleSwitcher
│   ├── meters/                  # List, detail, assign, replace, terminate
│   ├── projects/                # List, detail, form dialog, locations
│   ├── readings/                # List, new reading
│   ├── reports/                 # Reports page, settings
│   ├── settlement/              # Settlement page
│   ├── shared/                  # GlobalSearchDialog, PageHelpers, ProtectedAction, QueryBoundary, StatusBadge
│   ├── sim-cards/               # SIM cards page
│   ├── smart-table/             # Enterprise table component
│   ├── sync/                    # Sync gateway page
│   ├── tariffs/                 # Tariff studio
│   ├── tickets/                 # Support page, tickets page
│   ├── ui/                      # 48 shadcn/ui components
│   ├── upload/                  # Upload center
│   └── workspace/               # Workplace page
├── hooks/                       # 22 React Query hooks (use-meters, use-customers, use-invoices, etc.)
├── lib/
│   ├── api/                     # client.ts, auth.ts, errors.ts, query-client.tsx, index.ts
│   ├── i18n/                    # translations.ts (AR/EN), context.tsx
│   └── (types, navigation, router-store, feature-flags, mock-auth, mock-data, download, action-permissions)
└── pages/api/                   # API route (feature flags)
```

### Naming Conventions
- **Pages:** PascalCase (MetersPage.tsx, InvoiceDetailPage.tsx)
- **Components:** PascalCase (SmartTable.tsx, QueryBoundary.tsx)
- **Hooks:** camelCase with `use` prefix (useMeters, useCustomers)
- **API client:** camelCase (apiGet, apiPost, apiPatch, apiDelete)
- **Files:** kebab-case for config, PascalCase for components

---

## MODULE 3 — Routing

### Route Structure
| Route | Component | Auth | Area Scoped |
|-------|-----------|------|-------------|
| `/login` | LoginPage | Public | No |
| `/register` | — | Public | No |
| `/` | DashboardPage | Auth | Yes |
| `/dashboard/*` | Various dashboards | Auth | Yes |
| `/customers` | CustomersPage | Auth | Yes |
| `/customers/:id` | CustomerDetailPage | Auth | Yes |
| `/customer-new` | NewCustomerPage | Auth | Yes |
| `/meters` | MetersPage | Auth | Yes |
| `/meters/:id` | MeterDetailPage | Auth | Yes |
| `/meters/:id/assign` | MeterAssignPage | Auth | Yes |
| `/meters/:id/replace` | MeterReplacePage | Auth | Yes |
| `/meters/:id/terminate` | MeterTerminatePage | Auth | Yes |
| `/invoices` | InvoicesPage | Auth | Yes |
| `/invoices/:id` | InvoiceDetailPage | Auth | Yes |
| `/payments` | PaymentsPage | Auth | Yes |
| `/payment-new` | PaymentWizardPage | Auth | Yes |
| `/bill-cycle` | BillCyclePage | Auth | Yes |
| `/balances` | BalancesPage | Auth | Yes |
| `/consumption` | ConsumptionPage | Auth | Yes |
| `/water-balance` | WaterBalancePage | Auth | Yes |
| `/readings` | ReadingsPage | Auth | Yes |
| `/readings/new` | ReadingNewPage | Auth | Yes |
| `/projects` | ProjectsPage | Auth | Yes |
| `/projects/:id` | ProjectDetailPage | Auth | Yes |
| `/projects/:id/locations` | LocationsPage | Auth | Yes |
| `/reports` | ReportsPage | Auth | Yes |
| `/tariffs` | TariffStudioPage | Auth | Yes |
| `/settlement` | SettlementPage | Auth | Yes |
| `/upload` | UploadCenterPage | Auth | Yes |
| `/workspace` | WorkplacePage | Auth | Yes |
| `/support` | SupportPage | Auth | Yes |
| `/tickets` | TicketsPage | Auth | Yes |
| `/sim-cards` | SimCardsPage | Auth | Yes |
| `/sync` | SyncGatewayPage | Auth | Yes |
| `/admin` | DatabaseAdminPage | Super Admin | No |

### Navigation Guards
- All authenticated routes check for JWT token in localStorage
- Role-based access via `router-store.ts` permission mapping
- Area must be selected before accessing area-scoped routes
- Unauthorized redirects to `/login`

---

## MODULE 4 — Authentication

### Flow
```
Login Page → POST /auth/dev-login → { accessToken, refreshToken }
  → Store in localStorage
  → Redirect to /
  → Every API call adds Authorization: Bearer <token>
  → On 401: try POST /auth/refresh → new token
  → On refresh failure: clear localStorage → redirect /login
```

### Implementation
- **Token storage:** `localStorage.setItem('mp-auth-token', token)`
- **CSRF:** Double-submit cookie via `x-csrf-token` header
- **Session recovery:** On page load, check for existing token
- **Logout:** Clear localStorage → redirect to `/login`
- **Role cache:** `localStorage.getItem('mp-role')` — updated on login

---

## MODULE 5 — Area Isolation (Critical)

### Frontend Area Isolation Rules

1. **Area selection happens at login** — user picks an area from the dropdown
2. **Area stored in localStorage** — `localStorage.getItem('selected-area')`
3. **Every API call includes area context** — via `x-area-id` header or query param
4. **Project selector filters by area** — `AreaProjectSwitcher` only shows projects belonging to the selected area
5. **Never display data from another area** — all queries are area-scoped
6. **Never cache data from another area** — React Query keys include areaId
7. **Never leak area identifiers** — area codes are internal, never displayed to unauthorized users

### Implementation Pattern
```typescript
const selectedArea = localStorage.getItem('selected-area');
const { data } = useQuery(['meters', selectedArea], () =>
  apiGet('/meters', { areaId: selectedArea })
);
```

---

## MODULE 6 — API Integration

### Data Flow
```
Component → Custom Hook → apiClient → Backend → Response → Hook → Component
                                              ↓
                                         Error Handler
                                              ↓
                                         Toast Notification
```

### API Client (`lib/api/client.ts`)
| Function | Method | CSRF | Auth |
|----------|--------|------|------|
| `apiGet<T>(url, params?)` | GET | Yes | Bearer token |
| `apiPost<T>(url, body)` | POST | Yes | Bearer token |
| `apiPatch<T>(url, body)` | PATCH | Yes | Bearer token |
| `apiDelete<T>(url)` | DELETE | Yes | Bearer token |

### Error Handling
| HTTP Status | Action |
|-------------|--------|
| 200-299 | Return data |
| 400 | Show validation error |
| 401 | Attempt token refresh; if fails, redirect to login |
| 403 | Show "Access denied" toast |
| 404 | Show "Not found" |
| 429 | Retry after rate-limit window |
| 500+ | Show "Server error" toast |

---

## MODULE 7 — State Management

| State Type | Tool | Location | Example |
|-----------|------|----------|---------|
| Server state | TanStack React Query | `hooks/use-*.ts` | `useMeters(projectId)` |
| Auth | localStorage + context | `lib/api/auth.ts` | `getToken()` |
| Area/Project | localStorage | `AreaProjectSwitcher` | `selected-area` |
| Theme | React context | `ThemeProvider` | dark/light |
| Locale | React context | `LocaleLayout` | ar/en |
| UI state | React state | Component level | modal open/close |

### React Query Configuration
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000,      // 30s
      gcTime: 300000,         // 5 min
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
```

---

## MODULE 8 — UI Component Library

### shadcn/ui Components (48)
All standard shadcn/ui components are available in `components/ui/`:
Button, Card, Dialog, DropdownMenu, Select, Table, Tabs, Badge, Input, Form, Toast, Sheet, Popover, Tooltip, Avatar, Alert, Progress, Skeleton, Switch, Checkbox, RadioGroup, Textarea, Calendar, Command, Separator, etc.

### Wrapper Rules
- Never modify shadcn/ui primitives directly — extend via wrapper components
- All wrappers must support RTL (via `cn()` utility with `dir` prop)
- All wrappers must support dark mode (via Tailwind `dark:` variants)
- All interactive elements must support keyboard navigation

### Theme
- **Light mode:** Default — clean, white backgrounds, subtle borders
- **Dark mode:** Dark backgrounds (#0F172A), light text, adjusted borders
- **RTL:** `dir="rtl"` on root, mirrored spacing via Tailwind `inset-inline-*`
- **Typography:** System font stack (Inter, system-ui)

---

## MODULE 9 — Meter Module

### Meter Lifecycle States
```
NEW → (Assign Unit + Customer + Tariff + Installation Date) → ACTIVE → Reading Sync
                                                                     ↓
                                                              REPLACED → REMOVED
                                                                     ↓
                                                              TERMINATED → REMOVED
```

### Meter Page Features
| Feature | Page | API Endpoint |
|---------|------|-------------|
| List meters | MetersPage | GET /meters?projectId= |
| Meter detail | MeterDetailPage | GET /meters/:id |
| Assign meter | MeterAssignPage | POST /meters/:meterId/assign |
| Replace meter | MeterReplacePage | POST /meters/:meterId/transition |
| Terminate meter | MeterTerminatePage | POST /meters/:meterId/terminate |
| Assign tariff | MeterDetailPage (dialog) | PATCH /meters/:id |
| Assign customer | MeterDetailPage (dialog) | PATCH /meters/:id |
| View readings | MeterDetailPage | GET /readings?meterId= |
| View invoices | MeterDetailPage | GET /invoices?meterId= |

### Activation Conditions
Meter can only become ACTIVE when:
1. Unit assigned
2. Customer assigned
3. Tariff assigned
4. Installation date set

---

## MODULE 10 — Billing Module

### Invoice Lifecycle
```
Bill Cycle Create → Start → Generate → Approve → Post → Paid → Settled
                                                              ↓
                                                        Reverse / Void
```

### Billing Pages
| Page | Features |
|------|----------|
| InvoicesPage | List, filter by status/period/area, download PDF |
| InvoiceDetailPage | Line items, payments, wallet, status, download |
| PaymentsPage | List payments, record payment, reverse |
| PaymentWizardPage | 5-step: search → select → details → pay → receipt |
| BillCyclePage | Full lifecycle: create, start, generate, post, cancel |
| BalancesPage | Customer balances, aging, credit/debit |
| ConsumptionPage | Monthly/quarterly/yearly consumption charts |
| WaterBalancePage | Water-specific balance with difference policy |

---

## MODULE 11 — Tariff Studio

### Features
| Feature | Status |
|---------|--------|
| List tariffs | ✅ |
| Create tariff | ✅ |
| Edit tariff | ✅ |
| Add charge tiers | ✅ |
| TOU period config | ✅ |
| Demand charge config | ✅ (via DEMAND_ code) |
| Tariff versioning | ⚠️ Model exists, UI partial |
| Tariff clone | ❌ Not implemented |
| Preview/simulation | ✅ POST /billing/tariffs/simulate |
| Activation/deactivation | ✅ |

### sBill Parity
- Charge group mapping matches sBill exactly
- Slab/block rates match
- TOU periods match
- Missing: demand charge UI, clone, version approval workflow

---

## MODULE 12 — Customer Workspace

### Customer Detail Tabs
| Tab | Content | API |
|-----|---------|-----|
| Overview | Summary, status, balance | GET /customers/:id |
| Units | Assigned units | GET /customers/:id/units |
| Ownership | Transfer history | POST /customers/:id/transfer-ownership |
| Financial Statement | Invoices, payments, balance | GET /customers/:id/statement |
| Invoices | Invoice list | GET /invoices?customerId= |
| Payments | Payment history | GET /payments?customerId= |
| Wallet | Wallet balance + transactions | GET /wallet/:customerId |
| Consumption | Usage charts | GET /readings?customerId= |
| Meters | Assigned meters | GET /meters?customerId= |
| Attachments | Uploaded documents | GET /upload/history/:entityType |
| Timeline | Audit log | GET /audit?entityId= |

---

## MODULE 13 — Reading Engine

| Feature | Page | API |
|---------|------|-----|
| List readings | ReadingsPage | GET /readings?meterId= |
| Create reading | ReadingNewPage | POST /readings |
| Approve reading | ReadingsPage | POST /readings/:id/approve |
| Reject reading | ReadingsPage | POST /readings/:id/reject |
| Review queue | ReadingsPage | GET /readings/review-queue |
| Manual upload | ReadingsPage | POST /readings/manual-upload |
| Sync check | ReadingsPage | GET /readings/can-sync/:meterId |
| Water balance | WaterBalancePage | GET /projects/:pid/water-balance |
| Consumption charts | ConsumptionPage | GET /readings (aggregated) |

---

## MODULE 14 — Upload Center

| Feature | Page | API |
|---------|------|-----|
| Upload CSV/Excel | UploadCenterPage | POST /upload/file |
| Customer import | UploadCenterPage | POST /upload/customers |
| Meter import | UploadCenterPage | POST /upload/meters |
| Template download | UploadCenterPage | GET /upload/template/:type |
| Upload history | UploadCenterPage | GET /upload/history/:entityType |

---

## MODULE 15 — Reports

| Report | Format | API |
|--------|--------|-----|
| Invoice PDF | PDF | GET /invoices/:id/pdf |
| Invoice CSV | CSV | GET /invoices/:id/csv |
| Table CSV | CSV | POST /downloads/table/csv |
| Table PDF | PDF | POST /downloads/table/pdf |
| Batch invoices | PDF/ZIP | POST /invoices/batch-download |
| Generated reports | PDF/CSV | GET /reports/generate/:type |

---

## MODULE 16 — Workplace

| Feature | Page | API |
|---------|------|-----|
| Support tickets | SupportPage | GET/POST /support |
| Ticket list | TicketsPage | GET /tickets |
| Ticket detail | TicketsPage | GET /tickets/:id |
| Ticket comments | TicketsPage | GET/POST /tickets/:id/comments |
| Escalate | TicketsPage | POST /tickets/:id/escalate |

---

## MODULE 17 — General Settings

| Setting | API | Admin Portal |
|---------|-----|-------------|
| Projects | GET/POST /projects | ✅ (Admin:6262) |
| Customer Types | GET/POST /core/customer-groups | ✅ |
| Ownership Types | — | ✅ |
| Zones | GET/POST /core/zones | ✅ |
| Unit Types | GET/POST /unit-types | ✅ |
| Users | GET/POST /users | ✅ |
| User Groups | GET/POST /core/user-groups | ✅ |
| Roles | — | ✅ |
| Permissions | — | ✅ |
| System Settings | GET/PATCH /settings | ✅ |

---

## MODULE 18 — Notifications

| Notification Type | Source | Display |
|-------------------|--------|---------|
| Sync complete | Sync orchestrator | Toast + badge |
| Billing cycle | Bill cycle engine | Toast |
| Payment received | Payments service | Toast |
| Reading exception | Reading validation | Badge |
| Ticket update | Tickets service | Toast + badge |
| Security alert | Audit service | Toast |

---

## MODULE 19 — Dashboards

| Dashboard | Components | Data Source |
|-----------|-----------|-------------|
| Executive | KPIs, trends, alerts | GET /kpi/executive |
| Billing | Revenue, outstanding, aging | GET /kpi/executive |
| Collections | Collections rate, aging | GET /kpi/collections |
| Operations | Meter status, sync health | GET /projects/:pid/dashboard/kpis |
| Solar | Solar production, wallet | GET /solar/dashboard |
| Utility | Cross-utility comparison | GET /kpi/utilities |
| Consumption | Usage trends | GET /projects/:pid/dashboard/consumption |

---

## MODULE 20 — Security (Frontend)

| Check | Implementation |
|-------|---------------|
| XSS | React DOM auto-escaping; no dangerouslySetInnerHTML |
| CSRF | `x-csrf-token` header on all mutations |
| JWT | Token in localStorage, sent via Authorization header |
| CSP | Helmet configured on backend |
| Console | No sensitive data logged |
| DevTools | App works correctly with DevTools open |
| Source maps | Disabled in production build |
| localStorage | Only auth token + preferences |
| SessionStorage | Not used for sensitive data |
| Cookies | CSRF cookie only (SameSite=Lax) |
| RBAC | `ProtectedAction` component wraps permission checks |
| Area Isolation | All queries scoped by areaId |

---

## MODULE 21 — Playwright Enterprise

### Test Location
`tests/enterprise/` — 11 spec files

### Every Task Must Verify
- All pages render correctly
- All buttons are functional
- All forms submit correctly
- All tables display data
- All filters work
- All exports download
- All dialogs open/close
- All permissions enforced
- All area isolation rules followed

### Test Categories
| Category | Count | Spec Files |
|----------|-------|------------|
| Auth | 1 | auth.spec.ts |
| Navigation | 1 | navigation.spec.ts |
| CRUD | 1 | crud.spec.ts |
| Customers | 1 | customer.spec.ts |
| Billing | 1 | billing.spec.ts |
| KPIs | 1 | kpi.spec.ts |
| Reports | 1 | reports.spec.ts |
| Sync | 1 | sync.spec.ts |
| Wallet | 1 | wallet.spec.ts |
| Helpers | 1 | helpers.ts |

---

## MODULE 22 — Graphify Mapping

### Frontend Dependency Graph
```
Pages → Components → Hooks → API Client → Backend Endpoints → Database
  ↓         ↓          ↓          ↓              ↓                ↓
Roles    Shared     React       CSRF +        Controllers     Tables
         UI         Query       JWT
```

### After Every Task, Update
- Component dependency graph
- Page routing graph
- API call graph
- State flow graph

---

## MODULE 23 — SpecKit Verification

### Every Frontend Task Must Update
| Document | What to Update |
|----------|---------------|
| Requirements | Mark implemented/partial/missing |
| Architecture | If component structure changed |
| Acceptance Criteria | Mark passed |
| Progress | Update completion % |
| Technical Debt | Add any new debt |
| Risk Register | Update if applicable |

---

## MODULE 24 — Production Readiness

| Criterion | Standard | Current Status |
|-----------|----------|---------------|
| Performance | Lighthouse > 80 | ⚠️ Not measured |
| Accessibility | WCAG AA | ⚠️ Partial |
| Localization | AR + EN | ✅ Complete |
| Security | OWASP 9.5/10 | ✅ |
| Maintainability | ESLint 0 errors | ✅ (warnings only) |
| Scalability | Lazy loading + pagination | ✅ |
| Monitoring | Error boundaries | ⚠️ Partial |
| Telemetry | Not implemented | ❌ |
| Logging | Console + API errors | ✅ |

---

## MODULE 25 — Continuous Verification Loop

### Automatic Gate Sequence (Every Task)
```
1. TypeScript compile        → tsc --noEmit
2. ESLint                    → eslint src/
3. Build                     → next build
4. Playwright regression     → npx playwright test
5. Security scan             → CodeQL / Semgrep
6. Graphify regeneration     → Update dependency graph
7. SpecKit regeneration      → Update requirement status
8. Dead code detection       → Check for unused exports
9. Unused API detection      → Verify all endpoints used
10. Missing permissions      → Verify ProtectedAction coverage
11. Missing i18n detection   → Verify all strings translated
12. Area isolation verify    → All queries scoped by areaId
13. Memory update            → WEEK-XX files updated
14. Git commit               → Conventional commit
15. Push to Kirllos360/Mete  → git push mete
16. Push to Kirllos360/Meter → git push origin
```

### Task Completion Gate
Only mark a task complete when ALL 16 gates pass.
