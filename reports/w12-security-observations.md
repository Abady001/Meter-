# W12 — Security Observations

**Date**: 2026-06-18
**Method**: Source code audit (no exploitation, no fixes)

## Critical Findings
| ID | Severity | Issue | File | Detail |
|----|----------|-------|------|--------|
| F-2 | **CRITICAL** | Dev-login forges any-role JWT | `auth.controller.ts:41-51` | `@Public()` endpoint accepts userId+role, signs JWT. Only gate is `NODE_ENV !== 'production'`. |
| F-8 | **CRITICAL** | Customer can view ANY customer's statement | `customers.controller.ts:100-142` | `@Roles(..., CUSTOMER)` allows customer role; `findOne()` doesn't check user owns the customer record. |

## High Findings
| ID | Severity | Issue | File | Detail |
|----|----------|-------|------|--------|
| F-1 | HIGH | JWT algorithm not restricted | `jwt.strategy.ts:14` | No `algorithms: ['HS256']` — algorithm confusion risk |
| F-5 | HIGH | Refresh token hardcodes role='customer' | `refresh-token.service.ts:62-63` | Each refresh demotes user to customer role |

## Medium Findings
| ID | Severity | Issue | File | Detail |
|----|----------|-------|------|--------|
| F-3 | MEDIUM | AreaGuard passes unauthenticated requests | `area.guard.ts:10` | Returns true when no user |
| F-4 | MEDIUM | Empty areas = no restriction | `area.guard.ts:17-23` | User with no area assignments has full access |
| F-6 | MEDIUM | Refresh endpoint is public | `auth.controller.ts:34` | @Public() — stolen token gives indefinite access |
| F-9 | MEDIUM | $queryRawUnsafe code smell | `customers.controller.ts:110` | Not currently injectable but dangerous pattern |
| F-10 | MEDIUM | Duplicate role checking | `app.module.ts` + controllers | GlobalAuthGuard + per-controller RolesGuard |

## Low Findings
| ID | Severity | Issue | File |
|----|----------|-------|------|
| F-7 | LOW | CSRF guard defined but never wired | `csrf.guard.ts` |
| F-11 | LOW | Dev JWT secret in .env (gitignored) | `backend/.env:9` |
| F-12 | LOW | NextAuth placeholder secret (gitignored) | `Frontend/.env.local:9` |

## Conclusion
**SECURITY_REVIEW_COMPLETE = YES** (audited, issues documented, not fixed)
