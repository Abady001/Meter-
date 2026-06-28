# Playwright E2E Test Plan — Meter Verse

**Generated:** 2026-06-25
**Author:** Principal QA Architect
**Source Data:** navigation.ts, AppShell.tsx, AppSidebar.tsx, All audit reports

---

## Playwright Installation Status

| Check | Status | Detail |
|-------|--------|--------|
| `Frontend/package.json` includes playwright | ✅ | `"playwright": "^1.60.0"` |
| Playwright config exists | ✅ | `tools/playwright-mcp/playwright.config.ts` |
| `@playwright/test` in Frontend package | ❌ | Missing — only `playwright` package installed |
| Existing E2E tests | ✅ | `draft/tests/` — 8 `.cjs` files, generator scripts |
| Run method | ⚠️ | `node draft/tests/pw-<name>.cjs` (requires FE + BE running) |
| Platform issue | ⚠️ | Documented: Playwright fails on Windows (pre-existing) |

**Prerequisite:** Install `@playwright/test` as dev dependency and ensure Playwright browsers are installed (`npx playwright install chromium`).

---

## Environment Requirements

All tests require:

| Service | Default URL | Required |
|---------|------------|----------|
| Frontend (Next.js 16) | `http://localhost:3000` | Yes |
| Backend (NestJS) | `http://localhost:3001` | Yes |
| PostgreSQL | `localhost:5432` | Yes |
| Admin Portal | `http://localhost:6262` | For settings/admin tests |
| Test user seeded | Super-admin credentials | Yes |

---

## Test Case Inventory

### 1. Authentication Flow

#### TC-AUTH-001: Login page loads
| Field | Value |
|-------|-------|
| **Priority** | P0 |
| **Dependencies** | Frontend running, Backend running |
| **Steps** | 1. Navigate to `/login`<br>2. Assert login form is visible<br>3. Assert username/email input exists<br>4. Assert password input exists<br>5. Assert submit button is present<br>6. Assert logo/branding is visible |
| **Expected Results** | Login form renders with all required fields. Page title contains "Login" or similar. No console errors. |

#### TC-AUTH-002: Login with valid credentials
| Field | Value |
|-------|-------|
| **Priority** | P0 |
| **Dependencies** | TC-AUTH-001, Test user seeded in DB |
| **Steps** | 1. Navigate to `/login`<br>2. Enter valid username<br>3. Enter valid password<br>4. Click submit<br>5. Wait for navigation to complete |
| **Expected Results** | User is redirected to `/dashboard` or home. Auth token stored in localStorage (`mp-auth-token`). No 401/403 errors. |

#### TC-AUTH-003: Login with invalid credentials
| Field | Value |
|-------|-------|
| **Priority** | P0 |
| **Dependencies** | TC-AUTH-001 |
| **Steps** | 1. Navigate to `/login`<br>2. Enter invalid username<br>3. Enter invalid password<br>4. Click submit |
| **Expected Results** | Error message displayed. User remains on login page. No token stored. |

#### TC-AUTH-004: Token persistence across page reload
| Field | Value |
|-------|-------|
| **Priority** | P1 |
| **Dependencies** | TC-AUTH-002 |
| **Steps** | 1. Login successfully (TC-AUTH-002)<br>2. Assert token exists in localStorage<br>3. Reload the page<br>4. Assert user remains authenticated<br>5. Assert dashboard content renders |
| **Expected Results** | Token persists. After reload, AppShell's `restore()` succeeds. User sees dashboard without `Loading...` spinner. |

#### TC-AUTH-005: Logout clears session
| Field | Value |
|-------|-------|
| **Priority** | P1 |
| **Dependencies** | TC-AUTH-002 |
| **Steps** | 1. Login successfully<br>2. Find and click logout button (user menu in sidebar footer)<br>3. Assert redirected to `/login`<br>4. Assert token removed from localStorage<br>5. Try navigating to `/dashboard` directly |
| **Expected Results** | Logout clears auth state. Direct navigation to `/dashboard` redirects to `/login`. |

#### TC-AUTH-006: Expired / invalid token redirects to login
| Field | Value |
|-------|-------|
| **Priority** | P1 |
| **Dependencies** | TC-AUTH-002 |
| **Steps** | 1. Login and capture token<br>2. Clear or corrupt the token in localStorage<br>3. Reload page<br>4. Assert redirected to `/login` |
| **Expected Results** | AppShell detects missing/invalid token, clears storage, redirects to `/login`. |

---

### 2. Navigation

#### TC-NAV-001: All sidebar items clickable without errors
| Field | Value |
|-------|-------|
| **Priority** | P1 |
| **Dependencies** | TC-AUTH-002 |
| **Steps** | 1. Login as super_admin<br>2. For each top-level nav item in sidebar:<br>&nbsp;&nbsp;a. Click nav item<br>&nbsp;&nbsp;b. Wait for page transition<br>&nbsp;&nbsp;c. Assert no React error boundary / 404 component<br>&nbsp;&nbsp;d. Assert page title or content is rendered<br>3. Repeat for child nav items (expand parent, click child) |
| **Expected Results** | Every nav item navigates without console errors. Pages render their component (not `DefaultNotFound`). No infinite loading states. |

#### TC-NAV-002: All 43 routes render without crash
| Field | Value |
|-------|-------|
| **Priority** | P1 |
| **Dependencies** | TC-AUTH-002 |
| **Steps** | 1. Login as super_admin<br>2. Navigate directly (via URL) to each route from navigation.ts:<br>&nbsp;&nbsp;`/dashboard`, `/executive-dashboard`, `/operations-dashboard`, `/billing-dashboard`, `/collections-dashboard-plus`, `/utility-dashboard`, `/kpi-executive`, `/kpi-collections`, `/kpi-utilities`, `/customers`, `/projects`, `/locations`, `/meters`, `/meters/assign`, `/meters/replace`, `/meters/terminate`, `/readings`, `/readings/new`, `/invoices`, `/tariff-studio`, `/bill-cycle`, `/payments`, `/collections`, `/promises`, `/recovery`, `/utility/electricity`, `/utility/water`, `/utility/solar`, `/utility/gas`, `/utility/chilled-water`, `/utility/outdoor-unit`, `/utility/settlement`, `/reports`, `/reports/operational`, `/reports/financial`, `/reports/collections`, `/reports/utility`, `/reports/regulatory`, `/settings`, `/upload-center`, `/notifications`, `/tickets`, `/support`, `/workplace`, `/rbac`, `/feature-flags`, `/audit-logs`, `/sync-gateway`<br>3. Assert no crash for each route |
| **Expected Results** | All routes render a page component. Some may show placeholder/BillCyclePage/DefaultNotFound but no JavaScript errors. |

#### TC-NAV-003: Sidebar collapse and expand
| Field | Value |
|-------|-------|
| **Priority** | P2 |
| **Dependencies** | TC-AUTH-002, Desktop viewport |
| **Steps** | 1. Login<br>2. Click collapse button (chevron icon at top of sidebar)<br>3. Assert sidebar width reduces to ~64px<br>4. Assert icons-only view<br>5. Click expand button<br>6. Assert sidebar returns to ~256px<br>7. Assert text labels visible again |
| **Expected Results** | Sidebar collapses to icon-only mode. Tooltips appear on hover. Expanding restores full view. |

#### TC-NAV-004: Mobile sidebar drawer
| Field | Value |
|-------|-------|
| **Priority** | P2 |
| **Dependencies** | TC-AUTH-002, Mobile viewport (≤768px) |
| **Steps** | 1. Login with mobile viewport<br>2. Click hamburger/menu button in TopNav<br>3. Assert sidebar slides in as overlay<br>4. Assert backdrop is visible<br>5. Click a nav item<br>6. Assert sidebar closes<br>7. Assert page navigates correctly |
| **Expected Results** | Sidebar opens as drawer overlay on mobile. Clicking nav item navigates and closes drawer. Backdrop click closes drawer. |

#### TC-NAV-005: Role-based navigation filtering
| Field | Value |
|-------|-------|
| **Priority** | P2 |
| **Dependencies** | TC-AUTH-002, Test users for different roles |
| **Steps** | 1. Login as technician<br>2. Assert sidebar shows only: Dashboard, Meters, Readings, Tickets, Alerts<br>3. Assert sidebar does NOT show: Customers, Billing, Reports, Settings<br>4. Login as finance<br>5. Assert sidebar shows: Dashboard, Customers, Invoices, Payments, Balances, Reports<br>6. Assert sidebar does NOT show: Meters, Readings, Admin |
| **Expected Results** | Navigation items filtered per `getNavItemsForRole()`. Inaccessible routes redirect or show 404. |

---

### 3. Customer Flows

#### TC-CUST-001: Customer list loads
| Field | Value |
|-------|-------|
| **Priority** | P1 |
| **Dependencies** | TC-AUTH-002, Customers exist in DB |
| **Steps** | 1. Login<br>2. Navigate to `/customers`<br>3. Assert customer table renders<br>4. Assert columns: Name, Project, Status, etc.<br>5. Assert rows contain customer data<br>6. Assert no "No data" or empty state (if customers exist) |
| **Expected Results** | Customer list renders with data from API (or mock data). Table columns visible. Pagination/filters present. |

#### TC-CUST-002: Customer detail opens
| Field | Value |
|-------|-------|
| **Priority** | P1 |
| **Dependencies** | TC-CUST-001 |
| **Steps** | 1. Navigate to `/customers`<br>2. Click a customer row or "View" action<br>3. Assert navigates to customer detail<br>4. Assert customer info header (name, project, status)<br>5. Assert tabs are present |
| **Expected Results** | Customer detail page renders. Header shows customer info. Tabs for Wallet, Ledger, Invoices, etc. are visible. |

#### TC-CUST-003: Wallet tab operations
| Field | Value |
|-------|-------|
| **Priority** | P1 |
| **Dependencies** | TC-CUST-002 |
| **Steps** | 1. Open customer detail<br>2. Click "Wallet" tab<br>3. Assert balance displays<br>4. Click "Credit" button<br>5. Enter amount and description<br>6. Click "Apply Credit"<br>7. Assert balance updates<br>8. Repeat for Debit operation |
| **Expected Results** | Wallet tab shows current balance. Credit/debit operations succeed. Balance reflects transaction. Transaction history table updates. |

#### TC-CUST-004: Customer ledger
| Field | Value |
|-------|-------|
| **Priority** | P2 |
| **Dependencies** | TC-CUST-002 |
| **Steps** | 1. Open customer detail<br>2. Click ledger/transactions tab<br>3. Assert transaction table loads<br>4. Assert columns: Date, Description, Debit, Credit, Balance<br>5. Assert running balance is correct |
| **Expected Results** | Ledger entries display in chronological order. Running balance is accurate. |

#### TC-CUST-005: Customer invoices tab
| Field | Value |
|-------|-------|
| **Priority** | P2 |
| **Dependencies** | TC-CUST-002 |
| **Steps** | 1. Open customer detail<br>2. Click invoices tab (if present)<br>3. Assert invoice list for this customer loads<br>4. Assert invoice status, amount, period columns |
| **Expected Results** | Customer-specific invoices list renders. Filters and actions work. |

#### TC-CUST-006: Create customer flow
| Field | Value |
|-------|-------|
| **Priority** | P1 |
| **Dependencies** | TC-AUTH-002 |
| **Steps** | 1. Navigate to `/customers`<br>2. Click "Add Customer" button<br>3. Navigate to customer detail with id=new<br>4. Fill customer form fields<br>5. Click "Create Customer"<br>6. Assert success toast/message<br>7. Assert redirected to customer list or detail |
| **Expected Results** | Customer is created. API call to `POST /projects/:pid/customers` succeeds. New customer appears in list. |

---

### 4. Dashboard Flows

#### TC-DASH-001: Main dashboard loads
| Field | Value |
|-------|-------|
| **Priority** | P1 |
| **Dependencies** | TC-AUTH-002 |
| **Steps** | 1. Login<br>2. Navigate to `/dashboard`<br>3. Assert KPI cards render<br>4. Assert charts render (consumption, activity)<br>5. Assert no "Loading..." spinner persists beyond 10s |
| **Expected Results** | Dashboard renders with KPI cards (total customers, active meters, pending readings, etc.). Charts render. Data may be mock but UI is complete. |

#### TC-DASH-002: Executive dashboard loads
| Field | Value |
|-------|-------|
| **Priority** | P1 |
| **Dependencies** | TC-AUTH-002 |
| **Steps** | 1. Navigate to `/executive-dashboard`<br>2. Assert KPI cards render<br>3. Assert top projects section<br>4. Assert aged debtors section<br>5. Assert utility mix chart |
| **Expected Results** | Executive dashboard renders all sections. `.catch(() => [])` fallbacks result in empty arrays but no errors. |

#### TC-DASH-003: Operations dashboard loads
| Field | Value |
|-------|-------|
| **Priority** | P1 |
| **Dependencies** | TC-AUTH-002 |
| **Steps** | 1. Navigate to `/operations-dashboard`<br>2. Assert meter health indicators<br>3. Assert reading performance metrics<br>4. Assert open incidents section |
| **Expected Results** | Operations dashboard renders. Sections may show empty/placeholder data but no errors. |

#### TC-DASH-004: Billing dashboard loads
| Field | Value |
|-------|-------|
| **Priority** | P1 |
| **Dependencies** | TC-AUTH-002 |
| **Steps** | 1. Navigate to `/billing-dashboard`<br>2. Assert invoice/payment KPI cards<br>3. Assert status distribution chart |
| **Expected Results** | Billing dashboard renders. |

#### TC-DASH-005: Collections dashboard loads
| Field | Value |
|-------|-------|
| **Priority** | P1 |
| **Dependencies** | TC-AUTH-002 |
| **Steps** | 1. Navigate to `/collections-dashboard-plus`<br>2. Assert collection rate KPI<br>3. Assert aging buckets<br>4. Assert top debtors list |
| **Expected Results** | Collections dashboard renders. |

#### TC-DASH-006: Utility dashboard loads
| Field | Value |
|-------|-------|
| **Priority** | P1 |
| **Dependencies** | TC-AUTH-002 |
| **Steps** | 1. Navigate to `/utility-dashboard`<br>2. Assert per-utility tabs (Electricity, Water, Solar, Gas, etc.)<br>3. Click each tab<br>4. Assert content changes per utility |
| **Expected Results** | Utility dashboard renders with tabbed interface. Each tab shows relevant data. |

#### TC-DASH-007: KPI dashboards load
| Field | Value |
|-------|-------|
| **Priority** | P2 |
| **Dependencies** | TC-AUTH-002 |
| **Steps** | 1. Navigate to `/kpi-executive`<br>2. Assert KPI cards with project selector<br>3. Navigate to `/kpi-collections`<br>4. Assert KPI cards with period selector<br>5. Navigate to `/kpi-utilities`<br>6. Assert KPI cards by utility type |
| **Expected Results** | All 3 KPI dashboard pages render. Selectors work. KPI cards display data or empty state. |

---

### 5. Settings Flows

#### TC-SETT-001: Settings page loads with tabs
| Field | Value |
|-------|-------|
| **Priority** | P2 |
| **Dependencies** | TC-AUTH-002, Super-admin role |
| **Steps** | 1. Login as super_admin<br>2. Navigate to `/settings`<br>3. Assert settings tabs are present: User Management, Areas, Unit Types, Roles, Auth Settings, i18n, System Config<br>4. Click each tab<br>5. Assert content renders for each |
| **Expected Results** | Settings page renders all tabs. Each tab loads its content. CRUD operations function per tab. |

#### TC-SETT-002: User CRUD in settings
| Field | Value |
|-------|-------|
| **Priority** | P2 |
| **Dependencies** | TC-SETT-001 |
| **Steps** | 1. Navigate to Settings → Users tab<br>2. Assert user list loads<br>3. Click "Add User"<br>4. Fill form (name, email, role, password)<br>5. Save<br>6. Assert new user appears in list<br>7. Edit created user<br>8. Assert changes persist<br>9. Delete created user<br>10. Assert user removed from list |
| **Expected Results** | Full user CRUD operations work. API endpoints POST/GET/PATCH/DELETE `/users/:id` respond correctly. |

#### TC-SETT-003: Area CRUD in settings
| Field | Value |
|-------|-------|
| **Priority** | P2 |
| **Dependencies** | TC-SETT-001 |
| **Steps** | 1. Navigate to Settings → Areas tab<br>2. Assert area list loads (public GET /areas)<br>3. Create a new area<br>4. Assert area appears in list<br>5. Delete the area (if permitted) |
| **Expected Results** | Area operations work via `/areas` endpoints. |

#### TC-SETT-004: Admin portal redirect
| Field | Value |
|-------|-------|
| **Priority** | P3 |
| **Dependencies** | Admin Portal running on :6262 |
| **Steps** | 1. Navigate to `/settings` or `/admin`<br>2. Assert redirect card displays<br>3. Assert link to `http://localhost:6262` is present<br>4. Click the link or verify external navigation |
| **Expected Results** | Admin portal redirect card shows. Link points to port 6262. |

---

### 6. CRUD Operations

#### TC-CRUD-001: Project CRUD
| Field | Value |
|-------|-------|
| **Priority** | P1 |
| **Dependencies** | TC-AUTH-002 |
| **Steps** | 1. Navigate to `/projects`<br>2. Assert project list loads<br>3. Click "+ Create"<br>4. Fill form (code, name, tax ID, water difference mode)<br>5. Click "Save"<br>6. Assert new project in list<br>7. Click project row → detail<br>8. Assert detail page renders with tabs/stats<br>9. Return to list, edit project<br>10. Assert changes saved<br>11. Delete project<br>12. Assert project removed |
| **Expected Results** | Full project CRUD. API calls to POST/GET/PATCH/DELETE `/projects/:id`. All mutations audited. |

#### TC-CRUD-002: Meter CRUD
| Field | Value |
|-------|-------|
| **Priority** | P1 |
| **Dependencies** | TC-AUTH-002 |
| **Steps** | 1. Navigate to `/meters`<br>2. Assert meter list loads with filters<br>3. Click "+ Add Meter"<br>4. Navigate to meter detail (id=new)<br>5. Create meter<br>6. Assert meter in list<br>7. Open meter detail<br>8. Assert chart + tabs render<br>9. Delete meter (via dropdown → Delete + confirm)<br>10. Assert meter removed |
| **Expected Results** | Full meter CRUD. API calls to POST/GET/DELETE `/meters/:id`. Delete shows confirmation dialog. |

#### TC-CRUD-003: Meter assign wizard
| Field | Value |
|-------|-------|
| **Priority** | P1 |
| **Dependencies** | TC-CRUD-002, Existing meter and customer |
| **Steps** | 1. Navigate to `/meters/assign`<br>2. Assert 9-step wizard renders<br>3. Step through: Select Project → Select Location → Select Meter → Enter Details → Review → Confirm<br>4. Assert "Next" enables only when required fields filled<br>5. Complete wizard and submit<br>6. Assert success message |
| **Expected Results** | Meter assigned to unit via `POST /meters/:id/assign`. Validation prevents skipping required steps. |

#### TC-CRUD-004: Meter replace flow
| Field | Value |
|-------|-------|
| **Priority** | P1 |
| **Dependencies** | TC-CRUD-002 |
| **Steps** | 1. Navigate to `/meters/replace`<br>2. Assert two-panel flow renders<br>3. Select old meter<br>4. Select new meter<br>5. Enter replacement details<br>6. Confirm replacement<br>7. Assert success |
| **Expected Results** | Meter replaced. Old meter terminated, new meter assigned. |

#### TC-CRUD-005: Meter terminate flow
| Field | Value |
|-------|-------|
| **Priority** | P1 |
| **Dependencies** | TC-CRUD-002 |
| **Steps** | 1. Navigate to `/meters/terminate`<br>2. Assert terminate flow renders<br>3. Select meter → Enter details → Confirm<br>4. Submit termination<br>5. Assert success |
| **Expected Results** | Meter terminated via `POST /meters/:id/terminate`. Meter status changes to terminated. |

#### TC-CRUD-006: Reading submission
| Field | Value |
|-------|-------|
| **Priority** | P1 |
| **Dependencies** | TC-AUTH-002, Existing meter |
| **Steps** | 1. Navigate to `/readings/new`<br>2. Select project<br>3. Select meter<br>4. Enter reading value and date<br>5. Assert consumption calculation displays<br>6. Assert validation warnings for anomalies<br>7. Click "Submit Reading"<br>8. Assert success |
| **Expected Results** | Reading submitted via `POST /readings`. Zod validation prevents invalid data. Consumption calculated from previous reading. |

#### TC-CRUD-007: Invoice operations
| Field | Value |
|-------|-------|
| **Priority** | P1 |
| **Dependencies** | TC-AUTH-002, TC-CRUD-006 (readings exist for billing) |
| **Steps** | 1. Navigate to `/invoices`<br>2. Assert invoice list loads with SmartTable + filters<br>3. Click "+ Generate Invoice" — verify toast is shown (fake, P3 gap)<br>4. Click an invoice row to open detail<br>5. Assert InvoiceDetailPage renders (header, customer/meter cards, line items, payment history)<br>6. Click "Issue" button<br>7. Assert status changes to issued<br>8. Click "Download"<br>9. Assert PDF downloads |
| **Expected Results** | Invoice list renders. Detail page loads. Issue mutation works. PDF download triggers. Create invoice is a known fake (documented gap P1-001). |

#### TC-CRUD-008: Payment recording
| Field | Value |
|-------|-------|
| **Priority** | P1 |
| **Dependencies** | TC-AUTH-002, Existing invoice |
| **Steps** | 1. Navigate to `/payments`<br>2. Assert payments list with SmartTable<br>3. Click "+ Record Payment"<br>4. Select project, customer, enter amount, method, date<br>5. Click "Record"<br>6. Assert payment appears in list |
| **Expected Results** | Payment recorded via `POST /payments`. Payment list updates. |

#### TC-CRUD-009: Location CRUD
| Field | Value |
|-------|-------|
| **Priority** | P2 |
| **Dependencies** | TC-AUTH-002 |
| **Steps** | 1. Navigate to `/locations`<br>2. Assert building/unit tree renders<br>3. Click "+ Building"<br>4. Fill form and save<br>5. Assert building appears<br>6. Click "+ Unit" under building<br>7. Fill form and save<br>8. Assert unit appears<br>9. Edit location<br>10. Delete location (with confirmation)<br>11. Assert location removed |
| **Expected Results** | Full location CRUD. POST/GET/PATCH/DELETE `/projects/:pid/locations/:id`. Tree structure maintained. |

#### TC-CRUD-010: Tariff CRUD
| Field | Value |
|-------|-------|
| **Priority** | P2 |
| **Dependencies** | TC-AUTH-002 |
| **Steps** | 1. Navigate to `/tariff-studio`<br>2. Assert tariff list by utility type<br>3. Click "+ New Tariff"<br>4. Fill form (name, utility type, charge mode, rates)<br>5. Click "Save"<br>6. Assert tariff in list<br>7. Edit tariff<br>8. Assert changes saved<br>9. Delete tariff<br>10. Assert removed |
| **Expected Results** | Tariff CRUD via `/tariffs` endpoints. Tier editor is fake (known gap); simulation works via `POST /tariffs/simulate`. |

#### TC-CRUD-011: Ticket CRUD
| Field | Value |
|-------|-------|
| **Priority** | P2 |
| **Dependencies** | TC-AUTH-002 |
| **Steps** | 1. Navigate to `/tickets`<br>2. Assert table/kanban toggle works<br>3. Click "Create Ticket"<br>4. Fill title, description, priority<br>5. Click "Create"<br>6. Assert ticket appears in list<br>7. Toggle between table and kanban views |
| **Expected Results** | Ticket created via `POST /tickets`. Both views render correctly. |

#### TC-CRUD-012: Support request
| Field | Value |
|-------|-------|
| **Priority** | P2 |
| **Dependencies** | TC-AUTH-002 |
| **Steps** | 1. Navigate to `/support`<br>2. Assert request list + detail view<br>3. Click "Submit" new request<br>4. Fill form<br>5. Click submit<br>6. Assert request appears in list<br>7. Click to view detail |
| **Expected Results** | Support request created via `POST /support`. List and detail views render. |

---

### 7. Export Flows

#### TC-EXPORT-001: Report generation and preview
| Field | Value |
|-------|-------|
| **Priority** | P2 |
| **Dependencies** | TC-AUTH-002 |
| **Steps** | 1. Navigate to `/reports`<br>2. Assert 47 report types listed with category filter<br>3. Click a report category (Operational, Financial, Collections, Utility, Regulatory)<br>4. Assert reports filtered by category<br>5. Click "Preview" on a report<br>6. Assert report generates and displays |
| **Expected Results** | Report preview triggers `GET /reports/generate/:type`. Response renders or downloads. |

#### TC-EXPORT-002: CSV export
| Field | Value |
|-------|-------|
| **Priority** | P2 |
| **Dependencies** | TC-EXPORT-001 |
| **Steps** | 1. Navigate to `/reports`<br>2. Find a report with CSV export<br>3. Click "CSV" export button<br>4. Assert file download triggers<br>5. Assert file extension is `.csv` |
| **Expected Results** | CSV export downloads file via `GET /reports/generate/:type?format=csv`. File contains report data. |

#### TC-EXPORT-003: Invoice PDF download
| Field | Value |
|-------|-------|
| **Priority** | P2 |
| **Dependencies** | TC-CRUD-007 |
| **Steps** | 1. Navigate to `/invoices`<br>2. Open an invoice detail<br>3. Click "Download"<br>4. Assert PDF file downloads<br>5. Or from list view, use dropdown → Download |
| **Expected Results** | PDF download via `GET /downloads/invoices/:id/pdf`. File opens correctly. |

#### TC-EXPORT-004: Settlement PDF download
| Field | Value |
|-------|-------|
| **Priority** | P3 |
| **Dependencies** | TC-AUTH-002 |
| **Steps** | 1. Navigate to `/utility/settlement`<br>2. Assert settlement list<br>3. Click "Download PDF" icon on a settlement row<br>4. Assert PDF download via `GET /api/v1/invoices/:id/pdf` |
| **Expected Results** | Settlement PDF downloads. |

---

### 8. Search Flow

#### TC-SRCH-001: Smart search dialog opens
| Field | Value |
|-------|-------|
| **Priority** | P2 |
| **Dependencies** | TC-AUTH-002 |
| **Steps** | 1. Login<br>2. Press `Ctrl+K` (or `Cmd+K` on Mac)<br>3. Assert GlobalSearchDialog opens<br>4. Assert search input is focused<br>5. Press `Escape`<br>6. Assert dialog closes |
| **Expected Results** | Smart search dialog opens with keyboard shortcut. Closes on Escape. |

#### TC-SRCH-002: Search returns results
| Field | Value |
|-------|-------|
| **Priority** | P2 |
| **Dependencies** | TC-SRCH-001, TC-AUTH-002 |
| **Steps** | 1. Open search dialog (`Ctrl+K`)<br>2. Type a customer name or meter serial<br>3. Wait for results<br>4. Assert results list displays<br>5. Assert results categorized (customers, meters, invoices, etc.)<br>6. Click a result<br>7. Assert navigates to the relevant page |
| **Expected Results** | Search queries `GET /search` endpoint (or local filter). Results display in categories. Click navigates correctly. |

#### TC-SRCH-003: Search empty state
| Field | Value |
|-------|-------|
| **Priority** | P3 |
| **Dependencies** | TC-SRCH-001 |
| **Steps** | 1. Open search dialog<br>2. Type gibberish `zzzzzzzzzz`<br>3. Assert "No results" message<br>4. Clear input<br>5. Assert placeholder text |
| **Expected Results** | Empty state displays when no matches found. |

---

### 9. Error Handling

#### TC-ERR-001: Invalid route shows 404
| Field | Value |
|-------|-------|
| **Priority** | P2 |
| **Dependencies** | TC-AUTH-002 |
| **Steps** | 1. Login<br>2. Navigate to `/this-route-does-not-exist`<br>3. Assert "404" text is visible<br>4. Assert "Page not found" or similar message<br>5. Assert i18n key `nav.pageNotFound` is rendered |
| **Expected Results** | AppShell's `renderPage()` hits `default` case, shows `DefaultNotFound` component with 404. |

#### TC-ERR-002: API failure shows error state
| Field | Value |
|-------|-------|
| **Priority** | P2 |
| **Dependencies** | TC-AUTH-002, Ability to simulate network failure |
| **Steps** | 1. Login<br>2. Using Playwright route interception, block API requests to `/api/v1/projects`<br>3. Navigate to `/projects`<br>4. Assert error state or fallback renders<br>5. Assert no crash/white screen |
| **Expected Results** | Page handles API error gracefully. Shows error message or cached/mock data. QueryBoundary may show error state. |

#### TC-ERR-003: Auth failure on protected route
| Field | Value |
|-------|-------|
| **Priority** | P1 |
| **Dependencies** | TC-AUTH-001 |
| **Steps** | 1. Without logging in, navigate directly to `/dashboard`<br>2. Assert redirected to `/login`<br>3. Assert token check in AppShell's `useEffect` fires<br>4. Assert `localStorage.getItem('mp-auth-token')` returns null |
| **Expected Results** | Unauthenticated user redirected to `/login`. AppShell shows loading spinner briefly then redirects. |

#### TC-ERR-004: Network timeout on slow connection
| Field | Value |
|-------|-------|
| **Priority** | P3 |
| **Dependencies** | TC-AUTH-002 |
| **Steps** | 1. Login<br>2. Use Playwright to simulate slow network (slowMo/throttling)<br>3. Navigate to `/customers`<br>4. Assert loading state appears (spinner/skeleton)<br>5. Wait for data to load<br>6. Assert data renders after delay |
| **Expected Results** | Loading state displays during data fetch. Content renders once loaded. No double-fetch or race conditions. |

#### TC-ERR-005: RBAC forbidden access
| Field | Value |
|-------|-------|
| **Priority** | P2 |
| **Dependencies** | TC-AUTH-002, Test user with limited role |
| **Steps** | 1. Login as `technician` (no admin access)<br>2. Navigate to `/settings`<br>3. Assert admin redirect card or 404 (depending on route mapping)<br>4. Navigate to `/customers` — should be hidden in nav but direct URL access |
| **Expected Results** | Routes not permitted for user's role either redirect or show irrelevant content. No unauthorized API calls made. |

---

## Test Execution Strategy

### Phased Run Order

| Phase | Tests | Est. Time | Run Condition |
|-------|-------|-----------|--------------|
| 1 | TC-AUTH-001 through TC-AUTH-006 | 5 min | FE + BE running |
| 2 | TC-NAV-001, TC-NAV-002, TC-ERR-003, TC-ERR-001 | 10 min | FE + BE running |
| 3 | TC-CRUD-001, TC-CRUD-002, TC-CRUD-009 | 10 min | Phase 1 + 2 pass |
| 4 | TC-CRUD-003 through TC-CRUD-006 | 15 min | Phase 3 pass |
| 5 | TC-CRUD-007, TC-CRUD-008, TC-CRUD-010 | 10 min | Phase 4 pass |
| 6 | TC-DASH-001 through TC-DASH-007 | 8 min | Phase 1 pass |
| 7 | TC-CUST-001 through TC-CUST-006 | 10 min | Phase 3 pass |
| 8 | TC-SETT-001 through TC-SETT-004 | 8 min | Phase 1 + super_admin |
| 9 | TC-EXPORT-001 through TC-EXPORT-004 | 8 min | Phase 5 pass |
| 10 | TC-SRCH-001 through TC-SRCH-003 | 5 min | Phase 1 pass |
| 11 | TC-ERR-002, TC-ERR-004, TC-ERR-005 | 8 min | Phase 1 + 2 pass |
| 12 | TC-NAV-003, TC-NAV-004, TC-NAV-005 | 8 min | Phase 1 pass |
| **Total** | **~50 test cases** | **~105 min** | |

### Failed Test Recovery
- Retry failed tests once automatically
- If Phase 1 fails (auth), abort — no subsequent tests can pass
- If Phase 2 fails (nav), flag but continue — page crash issues need investigation

---

## Test Data Requirements

| Entity | Minimum Count | Notes |
|--------|--------------|-------|
| Projects | 2 | One for CRUD, one for isolation tests |
| Locations | 5 | Mix of buildings and units |
| Customers | 5 | One with wallet transactions |
| Meters | 5 | One assigned, one unassigned, one terminated |
| Readings | 20 | Mix of statuses (pending, approved, rejected) |
| Invoices | 3 | Different statuses (draft, issued, paid) |
| Payments | 3 | Different methods |
| Tariffs | 3 | Different utility types |
| Tickets | 3 | Different priorities |
| Users | 3 | super_admin, technician, finance roles |
| SIM Cards | 2 | One eligible, one assigned |

---

## Assertion Checklist (per test)

- [ ] Page renders without `DefaultNotFound` component
- [ ] No console errors (`page.on('console', msg => ...)`)
- [ ] No uncaught exceptions (`page.on('pageerror', ...)`)
- [ ] API calls return expected status codes
- [ ] Loading state → data state transition completes within 15s
- [ ] All buttons clickable and functional
- [ ] Navigation updates URL and component correctly
- [ ] i18n translations load (no missing key warnings)

---

## Appendix: Route-to-PageKey Mapping (for test assertions)

| Route | PageKey | Component | Status |
|-------|---------|-----------|--------|
| `/dashboard` | dashboard | DashboardPage | Complete |
| `/executive-dashboard` | executive-dashboard | ExecutiveDashboard | Complete |
| `/operations-dashboard` | operations-dashboard | OperationsDashboard | Complete |
| `/billing-dashboard` | billing-dashboard | BillingDashboard | Complete |
| `/collections-dashboard-plus` | collections-dashboard-plus | CollectionsDashboardPlus | Complete |
| `/utility-dashboard` | utility-dashboard | UtilityDashboard | Complete |
| `/kpi-executive` | kpi-executive | KpiExecutiveDashboard | Complete |
| `/kpi-collections` | kpi-collections | KpiCollectionsDashboard | Complete |
| `/kpi-utilities` | kpi-utilities | KpiUtilitiesDashboard | Complete |
| `/customers` | customers | CustomersPage | Complete |
| `/projects` | projects | ProjectsPage | Complete |
| `/locations` | locations | LocationsPage | Complete |
| `/meters` | meters | MetersPage | Complete |
| `/meters/assign` | meter-assign | MeterAssignPage | Complete |
| `/meters/replace` | meter-replace | MeterReplacePage | Complete |
| `/meters/terminate` | meter-terminate | MeterTerminatePage | Complete |
| `/readings` | readings | ReadingsPage | Complete |
| `/readings/new` | reading-new | ReadingNewPage | Complete |
| `/invoices` | invoices | InvoicesPage | Complete |
| `/payments` | payments | PaymentsPage | Complete |
| `/balances` | balances | BalancesPage | Broken (empty data) |
| `/reports` | reports | ReportsPage | Complete |
| `/tariff-studio` | tariff-studio | TariffStudioPage | Complete |
| `/bill-cycle` | bill-cycle | BillCyclePage | Placeholder |
| `/upload-center` | upload-center | UploadCenterPage | Complete |
| `/tickets` | tickets | TicketsPage | Complete |
| `/support` | support | SupportPage | Complete |
| `/settings` | admin-portal | AdminPortalRedirect | Placeholder |
| `/workplace` | workplace | WorkplacePage | Partial |
| `/utility/settlement` | settlements | SettlementPage | Complete |
| `/sync-gateway` | sync-gateway | SyncGatewayPage | Complete |
| `(any other)` | — | DefaultNotFound | 404 |

---

*End of Playwright Test Plan*
