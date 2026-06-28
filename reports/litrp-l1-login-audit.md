# L1 — Login Reality Audit

**Date:** 2026-06-19

---

## Current Behavior vs Expected Behavior

| Feature | Current | Expected | Gap |
|---------|---------|----------|-----|
| Login route | `/login` (standalone page, no AppShell) ✅ | Standalone page | ✅ FIXED |
| Username field | Yes ✅ | Required | ✅ |
| Password field | Yes ✅ | Required | ✅ |
| Role selector | NOT in new login page ❌ | Should use real auth | ✅ REMOVED |
| Area selection | Yes ✅ | Select area before login | ✅ |
| Remember Me | No ❌ | Optional persistence | 🔴 MISSING |
| Forgot Password | No ❌ | Admin notification flow | 🔴 MISSING |
| Rate limiting | Yes (5 attempts → lockout) ✅ | 5 attempts → lockout | ✅ |
| CSRF token | Not integrated ❌ | Required for security | 🔴 MISSING |
| httpOnly cookies | Backend supports it ✅ | Should use httpOnly | 🟡 Not using them from login |
| Language selector | No ❌ | Arabic/English toggle | 🔴 MISSING |
| Company logo | Meter Verse logo ✅ | Branded | ✅ |
| System version | No ❌ | Display version number | 🔴 MISSING |
| Last login info | No ❌ | Show last login timestamp | 🔴 MISSING |

## Security Audit

| Risk | Severity | Status |
|------|----------|--------|
| Login via fetch (not httpOnly cookie) | MEDIUM | Still in dev mode |
| dev-login accepts any userId | HIGH | Only in dev mode |
| No CSRF on login form | MEDIUM | Need to integrate |
| Password shown in plaintext by toggle | LOW | UX feature |
| No password expiry | LOW | Future feature |

## Priority Ranking

| Priority | Item | Effort |
|----------|------|--------|
| P0 | httpOnly cookie integration | 2h |
| P0 | CSRF token integration | 2h |
| P1 | Remember Me | 1h |
| P1 | Language selector | 1h |
| P2 | Forgot Password flow | 4h |
| P2 | Last login display | 2h |
| P3 | System version | 0.5h |

**LOGIN_READY = 🟡 PARTIAL** — Core login works. Security hardening and UX polish remain.
