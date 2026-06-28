# Meter Verse Frontend Build Documentation

## Overview

This document describes what has been built on the frontend for the **Meter Verse** application.

- Stack: **Next.js 16 + React 19 + TypeScript + Tailwind CSS v4 + shadcn/ui**
- UI style: Dark SaaS dashboard with neon accents, glassmorphism cards, responsive layout
- App model: Client-side app shell with role-based navigation and Zustand stores
- Data source (frontend): Structured mock data and typed interfaces

---

## 1) App Architecture

### Core shell

- `src/components/layout/AppShell.tsx`
  - Main client-side page router using `PageKey`
  - Switch-based page rendering for all major modules
  - Mobile/desktop sidebar behavior and layout spacing
- `src/components/layout/TopNav.tsx`
  - Global top navigation and actions
- `src/components/layout/AppSidebar.tsx`
  - Role-aware sidebar menu
  - Nested menu support (Meters, Readings)
  - Active state mapping and mobile drawer support
- `src/components/layout/LoginPage.tsx`
  - Demo login entry point with role selector and sign-in flow

### Theme and global UI setup

- `src/components/layout/ThemeProvider.tsx`
- `src/app/globals.css`
  - Dark theme tokens, custom visual effects, motion styling
- Shared UI primitives in `src/components/ui/*` (shadcn-based)

---

## 2) State Management

- `src/lib/router-store.ts`
  - Controls current in-app page and params
  - Supports navigate and basic back behavior
- `src/lib/mock-auth.ts`
  - Authentication state
  - Demo role login/switching
- `src/lib/navigation.ts`
  - Full navigation tree
  - Role permissions and nav filtering logic

---

## 3) Type System and Mock Data

- `src/lib/types.ts`
  - Full domain model types for:
    - Users, Projects, Buildings, Units, Customers
    - Meters, SIM cards, Readings, Invoices, Payments
    - Alerts, Tickets, Reports, KPIs, and status unions
- `src/lib/mock-data.ts`
  - Mock datasets across all functional modules
  - Enables full UI demo behavior without backend dependency

---

## 4) Implemented Frontend Modules and Pages

### Dashboard

- `src/components/dashboard/DashboardPage.tsx`
  - KPI cards
  - Charts and operational summaries
  - Recent activity/alerts overview

### Projects and Locations

- `src/components/projects/ProjectsPage.tsx`
- `src/components/projects/ProjectDetailPage.tsx`
- `src/components/projects/LocationsPage.tsx`

### Customers

- `src/components/customers/CustomersPage.tsx`
- `src/components/customers/CustomerDetailPage.tsx`

### Meters

- `src/components/meters/MetersPage.tsx`
- `src/components/meters/MeterDetailPage.tsx`
- `src/components/meters/MeterAssignPage.tsx`
- `src/components/meters/MeterReplacePage.tsx`
- `src/components/meters/MeterTerminatePage.tsx`

### SIM Cards

- `src/components/sim-cards/SimCardsPage.tsx`

### Readings

- `src/components/readings/ReadingsPage.tsx`
- `src/components/readings/ReadingNewPage.tsx`

### Billing

- `src/components/billing/ConsumptionPage.tsx`
- `src/components/billing/WaterBalancePage.tsx`
- `src/components/billing/InvoicesPage.tsx`
- `src/components/billing/InvoiceDetailPage.tsx`
- `src/components/billing/PaymentsPage.tsx`
- `src/components/billing/BalancesPage.tsx`

### Reports and Settings

- `src/components/reports/ReportsPage.tsx`
- `src/components/reports/SettingsPage.tsx`

### Alerts, Tickets, Support

- `src/components/alerts/AlertsPage.tsx`
- `src/components/tickets/TicketsPage.tsx`
- `src/components/tickets/SupportPage.tsx`

### Shared building blocks

- `src/components/smart-table/SmartTable.tsx`
  - Reusable table with filtering/search/sorting/pagination behavior
- `src/components/shared/PageHelpers.tsx`
- `src/components/shared/StatusBadge.tsx`

---

## 5) Role-Based Access Model (Frontend)

Roles currently modeled:

- `super_admin`
- `project_admin`
- `operator`
- `technician`
- `finance`
- `support`
- `customer`

Role-driven menu visibility and page access patterns are implemented in:

- `src/lib/navigation.ts`
- `src/lib/mock-auth.ts`

---

## 6) UX and Interaction Capabilities

- Responsive layout:
  - Desktop sidebar (expand/collapse)
  - Mobile slide-in sidebar drawer
- Toast-based user feedback for key actions and placeholders
- In-page details and drill-down patterns from list -> detail views
- Charting and KPI visualization for operational insights
- Reusable status badge styling across modules

---

## 7) Frontend Quality and Validation

### Build and lint

- `bun run lint` passes
- `bun run build` passes

### Full app smoke testing

Reusable smoke test command is available:

```bash
bun run test:smoke
```

What it does:

- Builds the app
- Starts app server on an isolated port
- Automates browser traversal through major pages, nested pages, and detail pages
- Fails on runtime/console errors

Smoke test script:

- `scripts/smoke-all-pages.mjs`

---

## 8) Recent Stability Fixes Applied

- Fixed sidebar runtime crash due to missing `currentPage` usage in sidebar item logic
- Corrected `PageKey` to path mapping keys in sidebar active-state logic
- Fixed invalid imports in reports page (`lucide-react` icons and `sonner` toast)
- Removed login hydration mismatch source by using native role `select` in login form

Affected files:

- `src/components/layout/AppSidebar.tsx`
- `src/components/reports/ReportsPage.tsx`
- `src/components/layout/LoginPage.tsx`

---

## 9) Commands for Frontend Workflow

```bash
# run dev server
bun run dev

# lint frontend
bun run lint

# production build
bun run build

# full smoke test (build + automated traversal)
bun run test:smoke
```

---

## 10) Current Frontend Status

- Frontend modules are implemented and connected in the app shell
- Role-based navigation and demo auth flow are operational
- Primary dashboard + CRUD-style management views are in place
- Full smoke traversal is automated and passing

This frontend is ready for backend integration and incremental feature hardening.
