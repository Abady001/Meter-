# Professional Login Redesign
## LAACRP — Phase B

---

## Reference Enterprise Standards

- SAP Fiori Login: Standalone `/sap/bc/ui5_ui5/sap/zlogin` — no app shell, no sidebar
- Oracle ERP: Separate login page at `/OA_HTML/AppsLogin` — no application chrome
- Microsoft Dynamics: Login at `/logon.aspx` — completely separate from main app
- Utility Billing Systems: Login is a hardened, isolated entry point

---

## Proposed Login Architecture

```
┌─────────────────────────────────────────────┐
│              LOGIN PAGE (standalone)          │
│  ┌─────────────────────────────────────────┐ │
│  │            ┌───────────┐                │ │
│  │            │   Logo    │                │ │
│  │            └───────────┘                │ │
│  │         Meter Verse                     │ │
│  │      عالم العدادات                      │ │
│  │                                         │ │
│  │  [Area / المنطقة ▼]                     │ │
│  │  [Username / اسم المستخدم]              │ │
│  │  [Password / كلمة المرور ●●●]           │ │
│  │  [◻ Remember Me / تذكرني]               │ │
│  │  [▼ Language / اللغة]                   │ │
│  │                                         │ │
│  │  ┌─────────────────────────────────┐    │ │
│  │  │         SIGN IN / تسجيل الدخول  │    │ │
│  │  └─────────────────────────────────┘    │ │
│  │                                         │ │
│  │  Forgot password?                       │ │
│  │  Contact support                        │ │
│  └─────────────────────────────────────────┘ │
│                                              │
│  © 2026 Meter Verse. All rights reserved.    │
└─────────────────────────────────────────────┘

            NO SIDEBAR · NO HEADER
            NO APPLICATION CONTENT
            PURE STANDALONE PAGE
```

---

## Route Strategy

```
/login       → Standalone login page (NO AppShell wrapper)
/            → Main app (requires auth, uses AppShell wrapper)
/api/*       → API routes (no AppShell)
```

### Next.js Route Structure

```
src/app/
├── login/
│   └── page.tsx          ← standalone, no layout shift
├── layout.tsx            ← root layout (only sets <html><body>)
├── (main)/
│   ├── layout.tsx        ← AppShell wrapper (sidebar, header)
│   ├── page.tsx          ← Home redirect
│   ├── dashboard/
│   ├── customers/
│   ├── billing/
│   └── ...
```

Using route groups `(main)` to wrap authenticated pages in AppShell, while `/login` stays outside.

---

## Enterprise Login Security Layers

| Layer | Implementation |
|-------|---------------|
| CSRF Token | Fetch `/auth/csrf-token` before login form render |
| Login POST | Send `username` + `password` + `csrfToken` + `areaCode` |
| Rate Limit | 5 attempts → 15min IP ban (exists, verify) |
| bcrypt | Server-side password hash verification |
| httpOnly Cookie | JWT stored in httpOnly cookie, not localStorage |
| Session Refresh | Auto-refresh token every 55 minutes |
| Logout | Clear httpOnly cookies + invalidate refresh token |
| Remember Me | Longer-lived refresh token (30 days vs 7) |

---

## Login Flow (Enterprise)

```
1. User navigates to /login
2. GET /api/v1/auth/csrf-token → csrfToken + cookie
3. Render login form with csrfToken in hidden field
4. User enters username + password + area
5. POST /api/v1/auth/login
   Headers: x-csrf-token: <csrfToken>
   Body: { username, password, areaCode }
6. Server validates:
   a. Check IP rate limit
   b. Find user by username
   c. bcrypt.compare(password, user.passwordHash)
   d. Check user.areaAccess includes areaCode
   e. Generate JWT (1h) + Refresh Token (7d)
   f. Set httpOnly cookies
   g. Return { user, permissions, areas, projects }
7. Redirect to / (main app)
8. AppShell reads httpOnly cookie via GET /api/v1/auth/me
9. Validate JWT server-side → return user profile
10. Render AppShell with user context
```

---

## Area Assignment on Login

### Case 1: Single Area, Single Project
- Auto-select both
- No dropdowns visible
- Header shows "October → Golf Views"

### Case 2: Single Area, Multiple Projects
- Area is fixed
- Project dropdown appears
- Header shows "October [Project ▼]"

### Case 3: Multiple Areas
- Area dropdown appears
- Project dropdown filtered by selected area
- Header shows "[Area ▼] → [Project ▼]"

---

## Login Page Technical Requirements

| Requirement | Current | Target |
|------------|---------|--------|
| Route isolation | Route exists, not enforced | Route group (main) wrapper |
| CSS isolation | Inline styles | CSS modules |
| NO AppShell | Yes | Must verify |
| NO Sidebar | Yes | Must verify |
| NO Header | Yes | Must verify |
| Area selection | Via API call to /areas | Via /auth/user-profile |
| Language | Not implemented | RTL/LTR toggle |
| Remember Me | Not implemented | localStorage token |
| Forgot password | Not implemented | Link to support |
| Loading state | Simple text | Skeleton animation |
| Error display | Inline div | Toast + inline |
| Keyboard nav | Basic | Tab order + Enter submit |
| Accessibility | None | ARIA labels + roles |
| Mobile responsive | Partial | Full responsive |

---

## Files Requiring Modification (Phase B)

| File | Change |
|------|--------|
| `src/app/login/page.tsx` | Complete rewrite with enterprise design |
| `src/app/layout.tsx` | Remove AppShell dependency |
| `src/app/page.tsx` | Redirect to /login path |
| `src/components/layout/AppShell.tsx` | Remove auto-login, read server session |
| `backend/src/auth/auth.controller.ts` | Production-gate dev-login |
| `backend/src/auth/refresh-token.service.ts` | Remember Me support |
