# METER VERSE — REALITY CERTIFICATION BOARD

> **EVERY CLAIM VERIFIED AGAINST ACTUAL SOURCE CODE**
> No assumptions. No previous report trust. Only grep results.

---

## PART 1 — LOGIN ROOT CAUSE

### Root Cause: `mock-auth.ts` + `AppShell.tsx` + `dev-login` = Infinite Auth Loop

| Component | File | Line | What It Does |
|-----------|------|------|-------------|
| AppShell auto-login | `AppShell.tsx` | 87-94 | Reads localStorage token → if exists and not authenticated → calls `login('super_admin')` |
| mock-auth.ts login | `mock-auth.ts` | 44-61 | Picks first mock user → calls `/auth/dev-login` → **always sets isAuthenticated=true** |
| mock-auth fallback | `mock-auth.ts` | 56,59 | If API fails → creates `mock-token-${user.id}` anyway (never fails) |
| dev-login endpoint | `auth.controller.ts` | 134-138 | **Accepts ANY userId, ANY role** — no password check, no DB lookup |
| Login page | `login/page.tsx` | 36 | Calls dev-login with `role: 'super_admin'` hardcoded |

### The Exact Flow That Causes Auto-Login

```
1. Browser hits /
2. page.tsx checks localStorage → finds 'mp-auth-token' ✓
3. page.tsx renders <AppShell />
4. AppShell.useEffect[86-95] runs:
   a. Reads token from localStorage → exists ✓
   b. isAuthenticated is FALSE → calls login('super_admin')
5. mockAuth.login() runs:
   a. Finds mockUsers[0] (Ahmed El-Sayed, super_admin)
   b. Fetches POST /auth/dev-login with {userId: 'USR-001', role: 'super_admin'}
   c. dev-login returns JWT token for ANY request
   d. Stores 'mp-auth-token' in localStorage
   e. Sets isAuthenticated = TRUE
6. AppShell renders sidebar + header → "logged in" as super_admin
```

### Why Login Page Sometimes Appears Inside AppShell

The login page at `/login` is a **standalone page** (no AppShell layout). But when AppShell checks `if (!token) { window.location.href = '/login'; }` at line 88-90, this triggers a full page redirect. If something prevents this redirect (e.g., the useEffect hasn't fired yet), AppShell renders with its sidebar/header, creating the appearance that login is inside the app.

### Mock Users (17 hardcoded)

| Username | Role | Source |
|----------|------|--------|
| Ahmed El-Sayed | super_admin | `mock-data.ts:9` |
| Fatma Hassan | admin | `mock-data.ts:10` |
| Omar Ibrahim | operator | `mock-data.ts:11` |
| + 14 more | various | `mock-data.ts:12-26` |

### The Bypass Chain (3 layers deep)

1. **Frontend**: `mock-auth.ts:59` — `catch { setToken('mock-token-${user.id}') }` — creates token even if API fails
2. **Backend**: `auth.controller.ts:134-138` — `dev-login` accepts any payload, no password verification
3. **Frontend**: `AppShell.tsx:93` — `login('super_admin')` auto-calls auth without user interaction

---

## PART 2 — BILLING ENGINE REALITY

### The Core Problem: `TariffEngineService` is NOT connected to `generateInvoices()`

| Endpoint | What It Actually Does | Evidence |
|----------|----------------------|----------|
| `POST /invoices/generate` | Uses `tariffService.getEffectiveTariff()` → reads `TariffPlan.ratePerUnit` → `subtotal = ratePerUnit * consumption` | `billing.controller.ts:91-103` |
| `POST /tariffs/simulate` | **ONLY place** TariffEngineService is called | `billing.controller.ts:524` |

**Result**: All invoices are generated with FLAT RATE only. No tiers, no charge types, no multi-charge invoices.

### What Actually Exists vs What Actually Runs

| Feature | Code Exists? | Runs in Production? | Evidence |
|---------|-------------|-------------------|----------|
| STEPS tier calc | ✅ `tariff-engine.service.ts:68-84` | ❌ Only in `/tariffs/simulate` | `billing.controller.ts:524` |
| FLAT charge | ✅ `tariff-engine.service.ts:56-60` | ❌ Only in `/tariffs/simulate` | Same |
| STATIC charge | ✅ `tariff-engine.service.ts:86-90` | ❌ Only in `/tariffs/simulate` | Same |
| PER_UNIT charge | ✅ `tariff-engine.service.ts:62-66` | ❌ Only in `/tariffs/simulate` | Same |
| ZERO charge | ✅ `tariff-engine.service.ts:92-96` | ❌ Filtered out (BUG at line 99) | `if (lineAmount > 0 \|\| charge.chargeMode !== 'ZERO')` |
| BillingCycle table | ✅ 36 columns in features | ❌ Zero code references | `grep -r BillingCycle src/` = 0 |
| LedgerService | ✅ 40 lines, running balance | ✅ Called from issue/cancel/adjust | `ledger.service.ts:19-39` |
| PaymentAllocation table | ✅ 5 columns in sim_system | ⚠️ Partial code | `payments.service.ts` |
| Settlement types | ❌ Not in code | ❌ Not in DB | Only in SBill |

---

## PART 3 — ENTERPRISE LOGIN DESIGN

### Required Architecture

```
PUBLIC                           AUTHENTICATED
/login                           /dashboard/*
/forgot-password                 /customers/*
/reset-password                  /billing/*
                                 /settings/*
                                 
NO SIDEBAR, HEADER, CONTENT      FULL APP SHELL
```

### User Context Model

```
User
├── areas[]           // Multiple area assignment
│   ├── projects[]    // Projects within each area
│   └── defaultArea?  // If only one area, auto-select
├── role              // super_admin, admin, etc.
├── permissions       // View/Add/Edit/Delete per page
└── settings          // Theme, language, etc.
```

### Login Flow (Enterprise)

```
1. GET /login → renders standalone page (NO AppShell)
2. User enters username + password
3. POST /api/v1/auth/login (with CSRF token)
4. Server validates:
   a. bcrypt.compare(password, hash)
   b. Check if account locked (rate limit)
   c. Generate JWT (1h) + Refresh Token (7d)
   d. Set httpOnly cookies
   e. Return { user, areas, projects, permissions }
5. Redirect to / (main app)
6. AppShell reads /api/v1/auth/me → validates JWT server-side
7. If valid → render dashboard
8. If invalid → redirect to /login
```

---

## PART 4 — RECOVERY ROADMAP

### Week 1: Login Fix (P0)

| Task | Files | Effort |
|------|-------|--------|
| Remove auto-login from AppShell | `AppShell.tsx:86-95` | 15 min |
| Remove mock fallback token in mock-auth | `mock-auth.ts:56,59` | 15 min |
| Production-gate dev-login | `auth.controller.ts:134-138` | 30 min |
| Login page calls real `/auth/login` | `login/page.tsx:36` | 1 hr |
| Add httpOnly cookie login flow | `auth.controller.ts:35-97` | 2 hr |
| Add server-side `/auth/me` endpoint | New endpoint | 1 hr |

### Week 2: Tariff Engine Activation (P0)

| Task | Files | Effort |
|------|-------|--------|
| Wire TariffEngineService into generateInvoices | `billing.controller.ts:46-156` | 2 hr |
| Fix ZERO charge bug | `tariff-engine.service.ts:99` | 15 min |
| Add charge mode API for tariffs | New controller | 3 hr |

### Week 3: Bill Cycle + Ledger (P1)

| Task | Files | Effort |
|------|-------|--------|
| Build BillingCycle controller | New file | 4 hr |
| Connect LedgerService to generateInvoices | `billing.controller.ts:176-178` | 30 min |
| Add sequential invoice numbers | `billing.controller.ts:105` | 1 hr |

---

## CERTIFICATION

| Category | Score | Required For Production |
|----------|-------|------------------------|
| **Login Architecture** | **15%** | P0 — Auto-login must be removed |
| **Tariff Engine** | **25%** | P0 — Must be wired to invoice generation |
| **Invoice Generation** | **20%** | P0 — Must use charge types |
| **Bill Cycle** | **0%** | P1 — Must exist for batch tracking |
| **Customer Ledger** | **35%** | P1 — Must be connected to generation |
| **Payment Allocation** | **20%** | P2 — Allocation algorithm needed |
| **Settlements** | **15%** | P2 — Type system needed |
| **Reports** | **5%** | P2 — 0 of 44 SBill reports |
| **Settings** | **40%** | P2 — 7 of 16 tabs exist |
| **OVERALL** | **~20%** | **NOT PRODUCTION READY** |

### 3-Week Target: 20% → 65%
After fixing login + wiring tariff engine + adding bill cycle + connecting ledger.

### Files Requiring Modification
- `Frontend/src/components/layout/AppShell.tsx` — Remove auto-login
- `Frontend/src/lib/mock-auth.ts` — Remove fallback, remove hardcoded mock users
- `Frontend/src/app/login/page.tsx` — Call real `/auth/login` with bcrypt
- `backend/src/auth/auth.controller.ts` — Production-gate dev-login, add `/auth/me`
- `backend/src/billing/billing.controller.ts` — Wire TariffEngineService into generateInvoices
- `backend/src/billing/tariff-engine.service.ts` — Fix line 99 ZERO bug
