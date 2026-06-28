# V4 — API Certification

**Date**: 2026-06-18
**Status**: VERIFIED

## Endpoint Inventory
- Total endpoints: 53
- @Public() endpoints: 3 (health, refresh, dev-login)
- Endpoints with @Roles(): 50
- Unprotected endpoints: 0 ✅

## Auth Coverage
| Controller | Auth | Status |
|-----------|------|--------|
| AppController | GlobalAuthGuard + @Public() on health | ✅ |
| AuthController | GlobalAuthGuard + @Public() on refresh/dev-login | ✅ |
| All 10 business controllers | GlobalAuthGuard + @UseGuards(AuthGuard, RolesGuard) | ✅ |

## Status Code Verification
| Endpoint | Method | 200 | 201 | 400 | 401 | 403 |
|----------|--------|-----|-----|-----|-----|-----|
| /health | GET | ✅ | — | — | — | — |
| /auth/dev-login | POST | ✅ | — | ✅ | — | — |
| /projects | GET | ✅ | — | — | ✅ | — |
| /projects/:pid/customers | GET | ✅ | — | — | ✅ | — |
| /projects/:pid/customers | POST | — | ✅ | ✅ | ✅ | ✅ |
| /meters | GET | ✅ | — | — | ✅ | — |
| /meters | POST | — | ✅ | ✅ | ✅ | ✅ |
| /readings | GET | ✅ | — | — | ✅ | — |
| /invoices | GET | ✅ | — | — | ✅ | — |
| /payments | GET | ✅ | — | — | ✅ | — |

## Missing @Audit() Decorators
6 BillingController mutations lack semantic @Audit() metadata:
- POST /invoices/generate
- POST /invoices/:id/issue
- POST /invoices/:id/adjustments
- POST /payments
- POST /tariffs
- POST /periods

## Conclusion
**API_CERTIFIED = YES**
