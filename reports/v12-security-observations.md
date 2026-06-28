# V12 — Security Observations

**Date**: 2026-06-18
**Method**: Source code audit — no fixes

## Findings
| ID | Severity | Issue | File | Status |
|----|----------|-------|------|--------|
| S-1 | CRITICAL | Refresh token hardcodes `role='customer'` | `refresh-token.service.ts:62` | NOT FIXED — needs schema migration |
| S-2 | HIGH | Dev-login NODE_ENV gate is soft | `auth.controller.ts:44` | KNOWN — low risk (non-prod only) |
| S-3 | HIGH | IDOR — no resource ownership checks | All controllers | ARCHITECTURE GAP |
| S-4 | MEDIUM | JWT algorithm not restricted | `jwt.strategy.ts` | NOT FIXED |
| S-5 | MEDIUM | CSRF Guard dead code | `csrf.guard.ts` | NOT FIXED |
| S-6 | MEDIUM | `$queryRawUnsafe` code smell | `customers.controller.ts:110` | NOT FIXED |
| S-7 | LOW | `.env` dev secrets (gitignored) | `backend/.env` | KNOWN |
| S-8 | LOW | `NEXTAUTH_SECRET` placeholder | `Frontend/.env.local` | KNOWN |

## Recently Fixed
| Issue | Status |
|-------|--------|
| C-2: JWT_SECRET fallback `change-me-in-production` | ✅ FIXED — throws if missing |
| B-1: AreaMiddleware lifecycle bug | ✅ FIXED — converted to AreaGuard |

## Conclusion
**SECURITY_REVIEW_COMPLETE = YES** — All findings documented. No action needed from this phase.
