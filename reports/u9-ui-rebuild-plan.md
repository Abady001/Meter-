# U9 — UI Rebuild Plan

**Date**: 2026-06-18
**Note**: This is a plan only. Do NOT implement until U10 board certifies READY_FOR_IMPLEMENTATION.

## Phase 1: Navigation Restructure
| Task | Description |
|------|-------------|
| 1.1 | Reorganize sidebar to match target architecture (Operations → Billing → Collections → Utilities → Reporting → Admin) |
| 1.2 | Add Collections section (Aging, Statements, Balances) |
| 1.3 | Add Administration section (Users, Roles, Permissions, Areas, Audit Logs) |
| 1.4 | Add Utilities section (Solar, Chilled Water) |
| 1.5 | Add missing Tariffs page (extract from Settings tab) |

## Phase 2: Page Remediation
| Task | Pages | Priority |
|------|-------|----------|
| 2.1 | Fix Meter Assign wizard — wire to API | P0 |
| 2.2 | Build Invoice Issue → Adjust → Cancel workflow | P0 |
| 2.3 | Build Payment Record dialog — wire to API | P0 |
| 2.4 | Wire Reports page to backend | P1 |
| 2.5 | Wire Alerts page to backend | P1 |
| 2.6 | Wire Tickets page to backend | P1 |
| 2.7 | Wire Settings page to backend | P1 |
| 2.8 | Wire Support page to backend | P1 |

## Phase 3: New Pages
| Task | Description | Priority |
|------|-------------|----------|
| 3.1 | Tariffs page (full CRUD) | P1 |
| 3.2 | Users page (list/create/edit/delete) | P2 |
| 3.3 | Roles page (assignment, permissions) | P2 |
| 3.4 | Audit Log viewer | P2 |
| 3.5 | Aging report page | P2 |
| 3.6 | Customer statement page | P2 |
| 3.7 | Notifications full page | P3 |

## Phase 4: Utility Expansion
| Task | Description | Priority |
|------|-------------|----------|
| 4.1 | Solar wallet service + UI | P3 |
| 4.2 | Chilled water billing service + UI | P3 |
| 4.3 | Gas meter support | P4 |

## Phase 5: Download Infrastructure
| Task | Description | Priority |
|------|-------------|----------|
| 5.1 | Common PDF generation service | P1 |
| 5.2 | CSV/Excel export service | P1 |
| 5.3 | Invoice PDF | P1 |
| 5.4 | Report downloads | P2 |

## Phase 6: Branding
| Task | Description | Priority |
|------|-------------|----------|
| 6.1 | Replace all "Meter Verse" with "نظام التحصيلات" | P0 |
| 6.2 | Browser title, header, login page | P0 |
| 6.3 | Sidebar, metadata, API docs | P0 |

## Estimated Total Effort: ~120 hours
