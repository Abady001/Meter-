# Login Root Cause Analysis
## LAACRP — Phase A

---

## Issue 1: Login page appears together with main application

### Root Cause: DUAL AUTH FLOW — login/page.tsx + AppShell both handle auth

**Two independent auth mechanisms fight for control:**

1. **`src/app/login/page.tsx`** — Standalone login page at `/login` route
2. **`src/components/layout/AppShell.tsx`** — Also has an auth check that calls `login('super_admin')`

### The Conflict

**File: `src/components/layout/AppShell.tsx:86-95`**
```typescript
useEffect(() => {
  const token = localStorage.getItem('mp-auth-token');
  if (!token) {
    window.location.href = '/login';    // redirects to /login
    return;
  }
  if (!isAuthenticated) {
    login('super_admin');               // calls mock-auth login → sets isAuthenticated=true
  }
}, []);
```

This useEffect runs EVERY time AppShell mounts. If the token exists, it calls `login('super_admin')` which:
1. Sets `isAuthenticated = true`
2. If AppShell renders BEFORE the login page finishes redirecting, the login page briefly flashes before AppShell content appears

**Race condition**: On a fresh page load at `/`:
- `page.tsx` checks token → finds it → renders `<AppShell />`
- `AppShell` checks auth → finds `isAuthenticated=false` → calls `login('super_admin')`
- This bypasses the real login page entirely for users who already have a token

---

## Issue 2: System automatically enters application without proper authentication

### Root Cause: MOCK AUTH FALLBACK WITH TOKEN CREATION

**File: `src/lib/mock-auth.ts:44-61`**
```typescript
login: async (role: UserRole) => {
  const user = mockUsers.find((u) => u.role === role) ?? mockUsers[0];
  try {
    const res = await fetch(`.../auth/dev-login`, {
      body: JSON.stringify({ userId: user.id, role: user.role, name: user.name }),
    });
    if (res.ok) {
      const data = await res.json();
      setToken(data.accessToken);
    } else {
      setToken(`mock-token-${user.id}`);           // ← FALLBACK: creates token anyway
    }
  } catch {
    setToken(`mock-token-${user.id}`);              // ← FALLBACK: creates token anyway
  }
  set({ user, isAuthenticated: true });             // ← Always succeeds
},
```

**Any username + any password** → login succeeds because:
1. The `/auth/dev-login` endpoint accepts any payload (`userId`, `role`, `name`)
2. Even if the API call fails, `mock-token-${user.id}` is created as fallback
3. `isAuthenticated` is set to `true` unconditionally

---

## Issue 3: After forcing standalone login → 404 errors appear

### Root Cause: MISSING NEXT.JS ROUTE FOR /login

**File: `Frontend/next.config.js` or dynamic routes**

When navigating to `/login`:
- Next.js looks for `src/app/login/page.tsx` → found ✅
- BUT: the main `src/app/page.tsx` also renders under `/`
- If the routing is not properly exclusive, Next.js treats `/login` as a catch-all or mismatches the layout

**Additionally**: The login page calls `window.location.href = '/'` after login, which triggers a full page reload. This reload passes through Next.js router, which:
1. Checks `src/app/page.tsx`
2. `page.tsx` finds `localStorage` token → renders `<AppShell />`
3. AppShell loads all 28+ components lazily

**404 root cause**: Some imported components in `AppShell` have missing dependencies (i18n, API endpoints, mock data) that fail during SSR. When `window.location.href` forces a full page reload, Next.js tries to SSR the page → components that work client-side fail server-side → 404 or blank page.

---

## Issue 4: Authentication redirects are inconsistent

### Root Cause: THREE INDEPENDENT AUTH MECHANISMS

| Mechanism | File | Token Check | Redirect |
|-----------|------|-------------|----------|
| page.tsx useEffect | `src/app/page.tsx:10-17` | localStorage | `router.push('/login')` |
| AppShell useEffect | `src/components/layout/AppShell.tsx:86-95` | localStorage | `window.location.href = '/login'` |
| Login page | `src/app/login/page.tsx` | None (after login) | `window.location.href = '/'` |

**Three different redirect methods**: `router.push()` vs `window.location.href` — these behave differently in Next.js:
- `router.push()` is client-side navigation → does NOT trigger full page reload
- `window.location.href` IS a full page reload → clears React state, re-runs all useEffects

The mix creates inconsistency: sometimes redirect is soft, sometimes hard.

---

## Issue 5: Session initialization is unreliable

### Root Cause: NO SERVER-SIDE SESSION VALIDATION

**The token stored in localStorage is NEVER validated against the server** after initial storage:
1. Login → store token in localStorage
2. Reload → read token from localStorage (no server check)
3. AppShell sees token exists → `login('super_admin')` → always succeeds
4. **The token could be expired, revoked, or completely fake** — no validation happens

**Additionally**: The backend `/auth/dev-login` endpoint has NO security:
- **File: `backend/src/auth/auth.controller.ts:132-138`**
```typescript
@Post('dev-login')
async devLogin(@Body() dto: { userId: string; role?: string; name?: string }) {
  const payload = { sub: dto.userId, userId: dto.userId, role: dto.role || 'super_admin' };
  const accessToken = this.jwtService.sign(payload, { expiresIn: '1h' });
  return { accessToken, user: { id: dto.userId, name: dto.name || dto.userId, role: dto.role || 'super_admin' } };
}
```
This endpoint accepts **any userId**, **any role**, no password verification.

---

## COMPLETE BUG LIST

| # | Bug | File | Line | Severity |
|---|-----|------|------|----------|
| B1 | AppShell auto-login bypasses real login | AppShell.tsx | 86-95 | CRITICAL |
| B2 | mock-auth always succeeds (mock fallback) | mock-auth.ts | 44-61 | CRITICAL |
| B3 | dev-login accepts any credentials | auth.controller.ts | 132-138 | CRITICAL |
| B4 | No server-side token validation on reload | AppShell.tsx | 86-95 | HIGH |
| B5 | Mixed redirect methods (router.push vs location.href) | multiple | all | HIGH |
| B6 | Login page sends wrong body (userId/role/name vs username/password) | login/page.tsx | 36-40 | HIGH |
| B7 | AppShell loads before auth is verified | AppShell.tsx | 86-95 | MEDIUM |
| B8 | Login page calls dev-login instead of real login endpoint | login/page.tsx | 36 | MEDIUM |
| B9 | No area assignment persists correctly | login/page.tsx | 52 | MEDIUM |
| B10 | No server-side session/refresh on page reload | auth.controller.ts | 99-120 | MEDIUM |

---

## EXACT ROOT CAUSE

**The primary root cause is that `AppShell.tsx:86-95` auto-calls `login('super_admin')` without server-side verification, combined with `mock-auth.ts` always succeeding and `dev-login` accepting any credentials.**

This creates a "perpetual authentication machine" — any page load with any localStorage value results in automatic login.

---

## FIXES REQUIRED (NO CODE CHANGES YET — LISTING ONLY)

1. Remove auto-login from AppShell
2. Remove mock fallback token creation in mock-auth
3. Disable or protect dev-login endpoint (production gate)
4. Add server-side token validation endpoint
5. Use single consistent redirect (router.push everywhere)
6. Login page must call real `/auth/login` with username+password
7. csrf-token must be fetched before login POST
8. Session must be revalidated on every page load via refresh token
