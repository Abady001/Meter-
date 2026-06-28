# Login/Auth Final Certification

**Date:** 2026-06-20  
**Score:** 20%  
**Status:** CRITICAL SECURITY GAPS  

---

## 1. Summary

The authentication system has **3 independent bypass mechanisms**, making it impossible to trust current auth state. Additionally, a routing bug causes a 404 on initial navigation to login.

---

## 2. Bypass #1 — AppShell Auto-Login

**File:** `Frontend/src/components/admin/AppShell.tsx:93`

```typescript
// Auto-calls login as super_admin on mount
login('super_admin')
```

This means **every** user who loads the app is automatically authenticated as `super_admin` with no credential check.

---

## 3. Bypass #2 — Mock Token Fallback

**File:** `mock-auth.ts:56,59`

When the real API call fails (which it will — see Bypass #3), the mock-auth module creates **fake tokens** and continues as if authenticated.

```typescript
// Line 56-59: Creates fake tokens on API failure
```

This ensures auth never truly fails, masking all underlying issues.

---

## 4. Bypass #3 — Dev-Login Accepts Any Payload

**File:** `backend/src/auth/auth.controller.ts:134`

```typescript
// dev-login endpoint — accepts any payload, no password verification
```

The development login endpoint requires **no password validation**. Any request body succeeds.

---

## 5. Routing Bug — 404 on Login

**File:** `router-store.ts:56`

```typescript
// Initial state
currentPage: 'login'  // → no matching case in AppShell.tsx:260 renderPage
```

The initial route `login` has **no case** in AppShell's `renderPage` switch statement (`AppShell.tsx:260`), causing a 404/blank page on first load. The actual `/login` Next.js page at `Frontend/src/app/login/page.tsx` is never reached.

---

## 6. No Server-Side Token Validation

On page reload, there is **no server-side token validation**. The client state is lost and re-initialized to `currentPage: 'login'`, hitting the 404 path again.

---

## 7. Risk Summary

| Issue | Severity | Impact |
|---|---|---|
| Auto-login as super_admin | P0 — Critical | No authentication barrier |
| Mock token fallback | P0 — Critical | Masks all auth failures |
| Dev-login accepts any payload | P0 — Critical | No credential check |
| 404 on initial login route | P1 — High | Users cannot reach login form |
| No server-side token validation | P1 — High | Reload breaks session |

---

## 8. Remediation

1. **Remove** auto-login in `AppShell.tsx:93`.
2. **Remove** mock token generation in `mock-auth.ts:56,59`.
3. **Remove or gate** dev-login endpoint behind environment flag.
4. Add `'login'` case to `renderPage` in `AppShell.tsx:260`.
5. Implement server-side token validation on reload (JWT verification).

**Estimated effort:** 3–5 days.
