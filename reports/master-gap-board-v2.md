# Master Gap Board v2

**Date:** 2026-06-20  
**Overall Score:** ~28%  

---

## Comprehensive Gap Table

| # | Gap | Evidence (File:Line) | Category | Effort | Risk | Business Impact |
|---|---|---|---|---|---|---|
| 1 | **Login auto-auth as super_admin** | `AppShell.tsx:93` | P0 | 2h | Critical | No access control — any user is admin |
| 2 | **Mock token fallback on API failure** | `mock-auth.ts:56,59` | P0 | 1h | Critical | Masks all auth failures, prevents detection |
| 3 | **Dev-login accepts any payload** | `auth.controller.ts:134` | P0 | 2h | Critical | No credential check — infinite session creation |
| 4 | **No backend admin controller** | `backend/src/**/*.ts` — zero hits for "admin" | P0 | 3–5d | Critical | Database Admin page is non-functional |
| 5 | **Invoice uses flat rate only** | `billing.controller.ts:103` | P0 | 5–8d | Critical | Tiers, demand, TOU, solar netting all dead code |
| 6 | **TariffEngineService not wired to live billing** | Only called at `billing.controller.ts:524` (simulation) | P0 | 5–8d | Critical | 5 charge modes unused in production |
| 7 | **404 on initial login route** | `router-store.ts:56` + no case at `AppShell.tsx:260` | P1 | 1d | High | Users cannot access login page |
| 8 | **No server-side token validation** | Missing on reload | P1 | 2–3d | High | Session lost on every page refresh |
| 9 | **BillingCycle — zero code, zero UI** | Model exists at `migration.sql:474` but `backend/src/` has 0 refs | P1 | 8–12d | High | No billing period grouping, no close workflow |
| 10 | **Invoice number uses random 4-char** | `billing.controller.ts:105` | P1 | 1d | Medium | Collision-prone, non-sequential |
| 11 | **Settings page — 4 of 7 tabs lack backend** | `SettingsPage.tsx` shows 7 tabs; only 4 controllers exist | P1 | 3–5d | Medium | 3 settings tabs broken |
| 12 | **Invoice template — no CI test** | No test file found for template service | P1 | 1d | Medium | Regressions undetected |
| 13 | **Invoice template — no preview endpoint** | No `GET /templates/preview` route | P2 | 1d | Low | Designers cannot preview without generating real invoice |
| 14 | **Invoice template — no versioning** | Templates are overwritten in place | P2 | 1d | Low | No revision history |
| 15 | **Client-side routing only (29 pages)** | `AppShell.tsx` renderPage switch — no Next.js routes | P2 | Varies | Medium | SEO, deep-linking, and SSR all broken |
| 16 | **Only 2 Next.js pages exist** | `/` (page.tsx) and `/login` (login/page.tsx) | P2 | Varies | Medium | All other routes are SPA-only |
| 17 | **Database Admin hardcoded table list** | `TABLE_OPTIONS` — not driven by schema introspection | P2 | 2d | Low | New tables require code change |
| 18 | **No bill cycle UI or navigation entry** | Not present in AppShell renderPage | P1 | 3–5d | High | Users cannot manage billing periods |
| 19 | **No admin controller in database module** | `src/common/database/` has service + module only | P0 | 3–5d | Critical | No table-level CRUD from UI |
| 20 | **Overall system architecture incomplete** | All gaps above compound | P0 | Many sprints | Critical | Production use impossible |

---

## Priority Distribution

| Priority | Count |
|---|---|
| P0 | 7 |
| P1 | 7 |
| P2 | 6 |

---

## Key Insight

The system has **strong individual components** (invoice template engine at 75%, settings controllers working) but **critical wiring failures** in auth and billing — the two features that gate all others. Until login is secured and the tariff engine is wired, the system cannot be considered production-ready.
