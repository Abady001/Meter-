# LITRP — Final Certification Board

**Date:** 2026-06-19

---

## L1: Login Reality Audit

| Item | Status |
|------|--------|
| Standalone login page | ✅ FIXED — `/login` is now completely separate from AppShell |
| Username + Password fields | ✅ Implemented with required validation |
| Area selection | ✅ Dropdown loaded from `/areas` API |
| Rate limiting | ✅ 5 failed attempts → 15min lockout |
| CSRF token | 🔴 Not integrated yet |
| httpOnly cookies | 🟡 Backend supports, login flow uses Bearer token |
| Remember Me | 🔴 Not implemented |
| Language selector | 🔴 Not implemented |
| Forgot Password | 🔴 Not implemented |

## I1: Invoice Parity

| Utility | Visual % | Field % | Calc % | Status |
|---------|----------|---------|--------|--------|
| Electricity | 85% | 90% | 100% | 🟡 Template improved this session |
| Water | 85% | 90% | 100% | 🟡 Same template |
| Solar | 80% | 85% | 100% | 🟡 Missing production/credit fields in layout |
| Settlement | 80% | 85% | 100% | 🟡 Fixed-value layout |
| Chilled Water | 80% | 85% | 100% | 🟡 BTU fields pending |
| Outdoor Unit | 80% | 85% | 100% | 🟡 BTU fields pending |
| Gas | 0% | 0% | 0% | ❌ Not implemented |

## Current Running State

| Service | Port | Status |
|---------|------|--------|
| Core API | 3001 | ✅ Running |
| API Gateway | 4000 | ✅ Running (JWT bypass for login) |
| Frontend | 3000 | ✅ Running |
| Database | 5432 | ✅ Connected |

## Key Files Changed

| File | Change |
|------|--------|
| `src/app/login/page.tsx` | NEW — Standalone login page with username/password/area |
| `src/app/page.tsx` | Updated — Redirects to `/login` if no token |
| `src/components/layout/AppShell.tsx` | Updated — Removed inline LoginPage, redirects to `/login` |
| `src/components/layout/LoginPage.tsx` | Still exists (legacy, not used anymore) |
| `invoice-template.service.ts` | Updated — Improved layout with navy headers, reading table |

## Remaining Work

| Item | Effort | Priority |
|------|--------|----------|
| CSRF integration in login form | 2h | P0 |
| httpOnly cookie login flow | 2h | P0 |
| Remember Me checkbox | 1h | P1 |
| Language selector on login | 1h | P1 |
| Invoice visual parity 85% → 98% | 40h | P1 |
| QR code on invoices | 4h | P2 |
| Gas utility implementation | 24h | P2 |
