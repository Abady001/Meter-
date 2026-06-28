# METER VERSE — LOGIN 404 ROOT CAUSE & ENTERPRISE LOGIN RECOVERY

---

## ROOT CAUSE — EXACT

### The 404 After Login

**`router-store.ts:56`**: `currentPage: 'login'` ← initial state
**`AppShell.tsx:131`**: `renderPage('login')` ← no case for 'login'
**`AppShell.tsx:260`**: `DefaultNotFound` ← renders 404

The full chain:

```
1. Login page stores token in localStorage
2. window.location.href = '/'  (full reload)
3. page.tsx checks localStorage → token exists ✓
4. page.tsx renders <AppShell />
5. AppShell.useEffect[86]: calls login('super_admin') → isAuthenticated = true
6. BUT: currentPage is still 'login' (from router-store.ts:56)
7. AppShell renders sidebar + header + renderPage('login')
8. No case for 'login' in switch → DefaultNotFound → 404 displayed
9. User sees "404 Page Not Found" INSIDE the app shell
```

### Evidence

| File | Line | What |
|------|------|------|
| `router-store.ts` | 56 | `currentPage: 'login'` — initial state never changes |
| `AppShell.tsx` | 131 | `renderPage(currentPage)` — renders based on this state |
| `AppShell.tsx` | 260 | `default: return <DefaultNotFound />` — catches 'login' as unknown |
| `AppShell.tsx` | 93 | `login('super_admin')` — sets auth but never navigates |

**Fix**: `login()` must call `navigate('dashboard')` after setting auth state.

---

## THE AUTO-LOGIN PROBLEM (Separate Issue)

**`AppShell.tsx:86-95`**: If ANY token exists in localStorage, the system auto-authenticates the user as `super_admin` without any login page interaction.

**`mock-auth.ts:56-59`**: If the dev-login API fails, it creates a `mock-token-${user.id}` and sets `isAuthenticated = true` unconditionally.

**`auth.controller.ts:134-138`**: The `/auth/dev-login` endpoint accepts ANY userId, ANY role — no password verification.

### Combined Effect

Any user who visits `/` is automatically logged in as `super_admin` without ever seeing a login page. If they clear their localStorage and visit `/login`, they can log in, but after the redirect back to `/`, they see a 404 because `currentPage` stays `'login'`.

---

## PHASE 1 — COMPLETE AUTH FLOW (Verified)

```
Browser → GET /
  → page.tsx (line 10-17)
    → localStorage.getItem('mp-auth-token')
    → if NO token: router.push('/login')
      → login/page.tsx renders (standalone, no AppShell)
      → User submits form
      → POST /auth/dev-login (accepts any payload)
      → localStorage.setItem('mp-auth-token', token)
      → window.location.href = '/'
    → if HAS token: setChecked(true)
    → renders <AppShell />
      → AppShell.useEffect[86-95]
        → localStorage.getItem('mp-auth-token') → exists ✓
        → isAuthenticated = false
        → useAuthStore.getState().login('super_admin')
          → mock-auth.ts:44-61
            → mockUsers.find(u => u.role === 'super_admin')
            → POST /auth/dev-login { userId: 'USR-001', role: 'super_admin' }
            → setToken(data.accessToken)
            → set({ user, isAuthenticated: true })
        → isAuthenticated = true
      → AppShell renders sidebar + header
      → renderPage('login') → DefaultNotFound → 404!
```

---

## PHASE 2 — ROUTE AUDIT (Verified)

### Registered Routes
| URL | File | Component |
|-----|------|-----------|
| `/` | `src/app/page.tsx` | Home → AppShell |
| `/login` | `src/app/login/page.tsx` | LoginPage (standalone) |

### PageKey → Component Mapping (AppShell.tsx:156-261)
`login` → ❌ **NO CASE** → `DefaultNotFound` (404)
`dashboard` → `DashboardPage` ✅
`executive-dashboard` → `ExecutiveDashboard` ✅
+ 29 more routes mapped...

---

## PHASE 3 — PERMISSION & CONTEXT

### Current user after auto-login:
- **Role**: `super_admin`
- **User**: Ahmed El-Sayed (from mock-data.ts:9)
- **Area**: None selected
- **Project**: None selected

### 404 Fix (No code change — just root cause documentation):
```
router-store.ts:56     change to: currentPage: 'dashboard'
OR
AppShell.tsx:260       add case 'login' that redirects to dashboard
OR  
mock-auth.ts:61         add navigate('dashboard') after set(...
```

---

## PART 2 — ENTERPRISE LOGIN DESIGN

### Architecture

```
PUBLIC (no AppShell)
├── /login
├── /forgot-password  
└── /reset-password

AUTHENTICATED (AppShell wrapper)
├── /dashboard → DashboardPage
├── /customers → CustomersPage
├── /billing → InvoicesPage
└── /settings → SettingsPage
```

### Color System (from existing dashboard)

| Token | Value | Usage |
|-------|-------|-------|
| `--primary` | `#1a3a5c` | Dark Navy — headers, primary buttons |
| `--accent-blue` | `#3b82f6` | Utility Blue — links, accents |
| `--success` | `#22c55e` | Green — active, paid |
| `--warning` | `#f59e0b` | Orange — pending, warnings |
| `--danger` | `#ef4444` | Red — errors, cancellations |
| `--background` | `#f8fafc` | Light gray — page bg |
| `--card` | `#ffffff` | White — cards, modals |

### Login Flow (Enterprise)

```
GET /login
  → Standalone page (No AppShell)
  → Show: Logo, System Name, Username, Password, Login Button

POST /api/v1/auth/login
  → Server validates with bcrypt
  → Returns: { accessToken, refreshToken, user, areas, projects }
  → Sets httpOnly cookies
  → Redirects to /

GET / → AppShell mounts
  → GET /api/v1/auth/me (server-side token validation)
  → Returns: { user, areas, projects, permissions }
  → Determines CASE (1/2/3)
  → Sets currentPage = 'dashboard'
  → Renders dashboard
```

### CASE 1: 1 Area, 1 Project
```
Login → Dashboard (direct, no selection)
Header: "October → Golf Views"
```

### CASE 2: 1 Area, Multiple Projects
```
Login → Project Selector modal → Dashboard
Header: "October [Project ▼]"
```

### CASE 3: Multiple Areas
```
Login → Area Selector → Project Selector → Dashboard  
Header: "[Area ▼] → [Project ▼]"
```

---

## PART 3 — FILES TO MODIFY

| Priority | File | Line | Change |
|----------|------|------|--------|
| P0 | `router-store.ts` | 56 | Change `currentPage: 'login'` to `currentPage: 'dashboard'` |
| P0 | `AppShell.tsx` | 86-95 | Remove auto-login. Read JWT from httpOnly cookie via `/auth/me`. If no valid session → redirect. |
| P0 | `mock-auth.ts` | 56,59 | Remove fallback token generation on API failure |
| P0 | `auth.controller.ts` | 134 | Gate dev-login behind `NODE_ENV === 'development'` |
| P1 | `auth.controller.ts` | 35-97 | Add real login endpoint with bcrypt (exists but unused by frontend) |
| P1 | `auth.controller.ts` | New | Add `GET /auth/me` endpoint returning user profile + areas + projects |
| P1 | `login/page.tsx` | 36 | Change from `/auth/dev-login` to `/auth/login` with username+password+bcrypt |
| P2 | `Frontend` | New | Add `forgot-password`, `reset-password` pages |
| P2 | `Frontend` | New | Add Area/Project selection after login (Cases 2/3) |

---

## CERTIFICATION

| Requirement | Status | Evidence |
|-------------|--------|----------|
| 404 root cause found | ✅ | `router-store.ts:56` + `AppShell.tsx:260` |
| Auto-login identified | ✅ | `AppShell.tsx:93` calls `login('super_admin')` |
| Mock auth found | ✅ | `mock-auth.ts:56,59` creates fake tokens |
| dev-login accepted any payload | ✅ | `auth.controller.ts:134-138` |
| Login page standalone | ✅ | `login/page.tsx` has no AppShell import |
| Area/Project selection | ❌ | No area/project flow exists after login |
| Password policy | ❌ | No bcrypt login from frontend |
| httpOnly cookies | ❌ | Frontend uses localStorage, not cookies |
