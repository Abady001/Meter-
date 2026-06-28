# U10 — IMPLEMENTATION ROADMAP

**Date**: 2026-06-18
**Objective**: Consolidate جميع الأنظمة (Collections + SBill + Collection System → واحد نظام التحصيلات)

---

## Implementation Sequence

### P0 — Critical Business Recovery (Est. 82h)
| # | Task | Effort | Dependencies | Why Now |
|---|------|--------|-------------|---------|
| 0.1 | Fix invoice generation 500 | 2h | None | Core billing broken |
| 0.2 | Wire 22 toast-only buttons to API | 12h | 0.1 | Users cannot act |
| 0.3 | Build project CRUD frontend (3 hooks + 2 dialogs) | 8h | None | Cannot manage projects |
| 0.4 | Build notification bell + dropdown + API | 8h | None | Users cannot see alerts |
| 0.5 | Fix branding to "نظام التحصيلات" | 2h | None | System identity wrong |
| 0.6 | Build download infrastructure (PDF lib + endpoint + frontend) | 20h | None | Cannot export anything |
| 0.7 | Wire 8 mock pages to real API (Reports, Alerts, Tickets, Settings) | 30h | 0.6 | Users see fake data |

### P1 — Billing Consolidation (Est. 60h)
| # | Task | Effort | Dependencies |
|---|------|--------|-------------|
| 1.1 | Build TariffService for features schema | 8h | None |
| 1.2 | Build TariffPage UI | 8h | 1.1 |
| 1.3 | Build reading approve/reject workflow | 6h | None |
| 1.4 | Build invoice issue/adjust API + UI | 8h | 0.1 |
| 1.5 | Build payment record/reverse API + UI | 6h | 1.4 |
| 1.6 | Build invoice PDF generation | 12h | 0.6, 1.4 |
| 1.7 | Merge features schema tariff models into sim_system | 12h | 1.1 |

### P2 — Collections Consolidation (Est. 40h)
| # | Task | Effort | Dependencies |
|---|------|--------|-------------|
| 2.1 | Build Collections dashboard | 8h | P0 |
| 2.2 | Build aging report | 6h | P0 |
| 2.3 | Build collection tracking | 8h | P0 |
| 2.4 | Build customer statements page | 8h | P0 |
| 2.5 | Build payment reconciliation | 10h | P0 |

### P3 — Utility Expansion (Est. 60h)
| # | Task | Effort | Dependencies |
|---|------|--------|-------------|
| 3.1 | Add gas meter type to MeterType + UtilityType enums | 2h | None |
| 3.2 | Add solar wallet service + API | 12h | None |
| 3.3 | Add chilled water billing service + API | 12h | None |
| 3.4 | Build solar wallet UI page | 8h | 3.2 |
| 3.5 | Build chilled water UI page | 8h | 3.3 |
| 3.6 | Fix frontend/backend MeterType mismatch (water_main vs main_water) | 2h | None |
| 3.7 | Expand UtilityType enum to cover all 5 utilities | 2h | 3.1 |
| 3.8 | Unified tariff engine — add gas/solar/chilled water support | 16h | P1.1, 3.1, 3.2, 3.3 |

### P4 — Reporting (Est. 40h)
| # | Task | Effort | Dependencies |
|---|------|--------|-------------|
| 4.1 | CSV export for all SmartTable views | 8h | 0.6 |
| 4.2 | Excel export for all SmartTable views | 8h | 0.6 |
| 4.3 | Revenue summary report | 8h | P0 |
| 4.4 | Collection efficiency report | 8h | P2 |
| 4.5 | SBill JasperReport migration reference | 8h | None |

### P5 — Optimization (Est. 40h)
| # | Task | Effort | Dependencies |
|---|------|--------|-------------|
| 5.1 | Add pagination to all list endpoints | 8h | None |
| 5.2 | Fix N+1 queries in services | 8h | None |
| 5.3 | Seed RBAC roles + permissions in database | 2h | None |
| 5.4 | Wire 9 unused roles into controllers | 4h | 5.3 |
| 5.5 | Add .dockerignore | 0.5h | None |
| 5.6 | Fix `ignoreBuildErrors: true` | 2h | None |
| 5.7 | Remove @prisma/client from frontend | 1h | None |
| 5.8 | Add missing indexes | 4h | None |
| 5.9 | Fix remaining security issues (C-1, JWT algorithm) | 8h | None |

## Total Estimated Effort: ~322 hours

## Sequence Diagram
```
P0 (82h) → P1 (60h) → P2 (40h)
                 ↓
            P3 (60h) → P4 (40h)
                 ↓
            P5 (40h) — can run in parallel with P3/P4
```

## Phase Gates
| Gate | Condition | Triggers |
|------|-----------|----------|
| P0 complete | All 22 buttons working, downloads working, branding correct | P1 start |
| P1 complete | Invoice lifecycle working end-to-end | P2 start |
| P2 complete | Payment lifecycle working end-to-end | P3 start |
| P3 complete | All 5 utilities supported | P4 start |
| P5 complete | All blockers resolved | T090 start |
