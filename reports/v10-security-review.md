# V10 — Security Surface Review

**Date**: 2026-06-18
**Status**: REVIEWED (no exploitation)

## Surface Areas Reviewed

### Authentication
| Area | Status | Risk |
|------|--------|------|
| JWT signing | ✅ HS256, secret from env | Low (secret must be configured) |
| Dev-login endpoint | ✅ Gated by NODE_ENV check | Medium (soft gate) |
| Token refresh | ❌ Role demotion (customer) | HIGH (needs schema migration) |
| Session handling | ✅ JWT stateless | None |

### Authorization
| Area | Status | Risk |
|------|--------|------|
| Role checking | ✅ GlobalAuthGuard + RolesGuard | None |
| Permission checking | ✅ PermissionsGuard exists | Not used in controllers — low |
| Area isolation | ✅ AreaGuard (Guard, not middleware) | Low (header-based) |
| Resource ownership | ❌ No IDOR checks | HIGH (widespread) |

### Input Validation
| Area | Status | Risk |
|------|--------|------|
| DTO validation | ✅ Global ValidationPipe (whitelist) | None |
| UUID params | ✅ ParseUUIDPipe | None |
| Raw SQL | ⚠️ $queryRawUnsafe (parameterized) | Low |

### Hardcoded Secrets
| Secret | Location | Status |
|--------|----------|--------|
| `JWT_SECRET=dev-jwt-secret...` | `backend/.env` | ⚠️ Gitignored — dev only |
| `DB_PASSWORD=meter_pulse_dev` | `backend/.env` | ⚠️ Gitignored — dev only |
| `NEXTAUTH_SECRET=change-me...` | `Frontend/.env.local` | ⚠️ Must replace in prod |

### Debug/Test Endpoints
| Endpoint | Risk | Mitigation |
|----------|------|------------|
| `POST /auth/dev-login` | HIGH — issues JWT for any role | ✅ Gated by NODE_ENV |
| `GET /api/v1/docs` | MEDIUM — exposes API structure | Standard Swagger |

## Critical Findings
1. **C-1 Refresh Token Role Demotion** — The only CRITICAL remaining issue
2. **Widespread IDOR** — Architecture-level gap (requires dedicated ProjectAccessGuard)

## Conclusion
**SECURITY_SURFACE = MODERATE** — 1 CRITICAL, 1 HIGH architectural gap
