# CSRF Token Support — Frontend Certification Report

**Date**: 2026-06-25
**Status**: ✅ Certified

## Summary

Added CSRF token support to Meter Verse's frontend API client. The backend
`CsrfGuard` requires an `x-csrf-token` header on all mutating
(POST/PUT/PATCH/DELETE) requests that matches the `csrf-token` cookie.

## Files Changed

### 1. `Frontend/src/lib/api/client.ts`

- **`getCsrfToken()`** — New exported async function that:
  - Returns a cached token if already fetched this session
  - Reads `csrf-token` from `document.cookie` (cookie is `httpOnly: false`)
  - Falls back to `GET /api/v1/auth/csrf-token` if cookie is absent
  - Handles both `token` and `csrfToken` response body keys
  - Silently handles errors (best-effort, no hard failures)
- **`createApiClient()`** — Modified to inject `x-csrf-token` header for all
  POST/PUT/PATCH/DELETE requests by calling `getCsrfToken()` before each
  mutating request.

### 2. `Frontend/src/lib/api/auth.ts`

- **`refreshToken()`** — After a successful token refresh (`setToken` +
  `setRefreshToken`), calls `getCsrfToken().catch(() => {})` to eagerly fetch
  the CSRF token so subsequent mutating requests have it cached.

### 3. `Frontend/src/lib/mock-auth.ts`

- **`login()`** — After `setToken(data.accessToken)`, calls
  `getCsrfToken().catch(() => {})` to eagerly fetch the CSRF token for the
  session.

### 4. `Frontend/src/lib/api/index.ts`

- Added `getCsrfToken` to the barrel export.

## Verification

```
npx next build
  ✓ Compiled successfully
  ✓ Build completed in 32.9s
  ✓ All routes generated
```
