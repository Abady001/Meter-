# V1 — Recovery Claim Verification

**Date**: 2026-06-18
**Method**: Independent source code verification — no prior reports trusted

## R1 — Invoice Generation Recovery
| Claim | Source File | Line | Verdict |
|-------|------------|------|---------|
| Invoice number sequence suffix | `billing.controller.ts` | 101 | ✅ CONFIRMED — `Date.now().toString(36).slice(-4)` |
| Duplicate meter check | `billing.controller.ts` | 78-85 | ✅ CONFIRMED — queries existing invoices, builds Set, skips duplicates |
| Error handling improvement | `billing.controller.ts` | 148-151 | ✅ CONFIRMED — throws `InternalServerErrorException` with real message |
| Tariff creation fix | `billing.controller.ts` | 357-367 | ✅ CONFIRMED — extracts userId from `req.user` |

## R2 — Toast Button Recovery
| Claim | Source File | Line | Verdict |
|-------|------------|------|---------|
| `useIssueInvoice()` mutation hook | `use-invoices.ts` | 85-93 | ✅ CONFIRMED — calls `POST /invoices/{id}/issue` |
| InvoicesPage Issue wired | `InvoicesPage.tsx` | 23, 73-74 | ✅ CONFIRMED — calls `issueMutation.mutate(row.id)` |
| InvoiceDetailPage Issue wired | `InvoiceDetailPage.tsx` | 18, 57-58 | ✅ CONFIRMED — calls `issueMutation.mutate(invoice.id)` |

## T089 — RBAC Implementation
| Claim | Source File | Verdict |
|-------|------------|---------|
| 16 roles in TypeScript enum | `role.enum.ts` | ✅ CONFIRMED — super_admin through viewer |
| 43 permissions | `permission.enum.ts` | ✅ CONFIRMED |
| GlobalAuthGuard (APP_GUARD) | `app.module.ts:55-58` | ✅ CONFIRMED |
| AreaGuard (APP_GUARD) | `app.module.ts:59-62` | ✅ CONFIRMED |
| JWT_SECRET no fallback | `jwt.strategy.ts:14` | ✅ CONFIRMED — throws if missing |

## V12 — Security Observations
| Claim | Source File | Verdict |
|-------|------------|---------|
| C-1 Refresh token role default `'customer'` | `refresh-token.service.ts:62` | ✅ CONFIRMED — `role = 'customer'` parameter default |
| C-2 JWT secret fallback removed | `jwt.strategy.ts:14` | ✅ CONFIRMED — throws if JWT_SECRET missing |
| Dev-login NODE_ENV gate | `auth.controller.ts:44-51` | ✅ CONFIRMED — blocks in production |

**V1 VERDICT: All prior recovery claims verified from source code.**
