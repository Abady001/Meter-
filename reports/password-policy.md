# Enterprise Password Policy — LAACRP Phase C

## Target Policy (Enterprise Grade)

| Requirement | Specification |
|---|---|
| Minimum Length | ≥ 12 characters |
| Uppercase | ≥ 1 character (A–Z) |
| Lowercase | ≥ 1 character (a–z) |
| Number | ≥ 1 digit (0–9) |
| Special Character | ≥ 1 from `!@#$%^&*()_+-=[]{}|;':\",./<>?~` |
| Common Patterns | Block sequential (`123456`, `abcdef`), repeated (`aaa`), keyboard patterns (`qwerty`), common passwords (top 10k), username substring |
| Expiry | 90 days (forced password change) |
| Password History | 5 previous passwords blocked |
| First Login | Force password change on first login |
| Storage | bcrypt, cost factor ≥ 12 |
| Lockout | 5 failed attempts → 15-minute lockout (exists in `auth.controller.ts`) |
| MFA | Optional TOTP (field `mfa_secret` exists in `CoreUser`) |

## Current State (Dev)

| Aspect | Current Behavior |
|---|---|
| Password validation | **None** — dev-login accepts any string, no length/complexity check |
| Password storage | bcrypt exists in `POST /auth/login` (line 58 of `auth.controller.ts`) but **dev-login** bypasses it entirely |
| Password change | No endpoint for password change |
| First login | No forced change mechanism |
| Expiry | No expiry tracking (`passwordChangedAt` exists in `CoreUser` schema but is never checked) |
| Common pattern blocking | Not implemented |
| History tracking | Not implemented |
| MFA | Schema field exists (`mfa_secret`, `is_mfa_enabled`) but no UI or enforcement flow |

## Gap: Current vs Target

| Gap | Severity | Details |
|---|---|---|
| No password policy enforcement | CRITICAL | `dev-login` accepts anything; `POST /login` validates bcrypt hash but receives raw password without policy check |
| No password change on first login | HIGH | `passwordChangedAt` is nullable; no logic checks if it's null on login |
| No 90-day expiry | HIGH | `passwordChangedAt` exists but never compared against `NOW() - 90 days` |
| No password history | MEDIUM | No `password_history` table exists |
| No common-pattern blacklist | MEDIUM | No dictionary or regex-based check |
| No rate limiting on `POST /login` | CRITICAL | In-memory `loginAttempts` Map is fragile (server restart resets, no DB persistence) |
| MFA not wired | LOW | Schema ready, no UI |
| No password reset flow | HIGH | No `POST /auth/forgot-password` or `POST /auth/reset-password` |

## Files Requiring Modification

### Backend (new/modify)

| File | Change |
|---|---|
| `backend/src/auth/auth.controller.ts` | Add password policy validation in `POST /login`, add `POST /auth/change-password`, add `POST /auth/force-change-password` |
| `backend/src/auth/auth.service.ts` | Create service with `validatePasswordPolicy()`, `checkPasswordHistory()`, `hashPassword()`, `isPasswordExpired()` |
| `backend/src/auth/password-policy.validator.ts` | New: regex/rule-based password validation with error messages |
| `backend/src/auth/dto/change-password.dto.ts` | New: DTO with oldPassword, newPassword, confirmPassword |
| `backend/src/auth/dto/login.dto.ts` | Add password validation decorators |
| `backend/prisma/schema.prisma` | Add `PasswordHistory` model (userId, hash, createdAt), add `forcePasswordChange` to `CoreUser` |
| `backend/src/auth/password-history.service.ts` | New: manage history, enforce no-reuse |

### Frontend (new/modify)

| File | Change |
|---|---|
| `Frontend/src/app/login/page.tsx` | Replace dev-login with real `POST /auth/login` with password policy error display |
| `Frontend/src/components/layout/LoginPage.tsx` | Add password policy UX (strength meter, rule list, validation hints) |
| `Frontend/src/app/auth/change-password/page.tsx` | New: password change page (first login / expired / voluntary) |
| `Frontend/src/components/auth/PasswordStrengthMeter.tsx` | New: real-time strength indicator |
| `Frontend/src/components/auth/PasswordPolicyModal.tsx` | New: show policy rules on first login |
| `Frontend/src/lib/api/auth.ts` | New: `changePassword()`, `forceChangePassword()` API functions |

### Database Migration

| Migration | Description |
|---|---|
| `20260620000001_password_history` | Create `core.password_history` table |
| `20260620000002_password_policy_config` | Add config rows to `core.system_config` for policy params |
| `20260620000003_force_change_column` | Add `force_password_change` boolean to `core.users` |
