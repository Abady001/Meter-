# W14 — BLOCKERS REPORT

**Date**: 2026-06-18
**Gate**: READY_FOR_REAL_USERS = NO | READY_FOR_T090 = NO

---

## 🔴 MUST FIX (Blocking Real Users)

### B1: 22 Buttons Are Toast-Only Placeholders
| Field | Value |
|-------|-------|
| **Examples** | Create/Edit/Delete on projects, meters, invoices. All download buttons. Generate Invoice, Issue Invoice, Record Payment, Cancel Invoice |
| **Root Cause** | Frontend mutation hooks were never created or never wired to buttons |
| **Impact** | User cannot perform any write operations from these pages |
| **Severity** | CRITICAL |
| **Effort** | ~40h |
| **Files** | `ProjectsPage.tsx`, `MetersPage.tsx`, `InvoicesPage.tsx`, `InvoiceDetailPage.tsx`, `ReportsPage.tsx`, `PaymentsPage.tsx`, `SmartTable.tsx` |

### B2: Zero Download/Export Functionality
| Field | Value |
|-------|-------|
| **Root Cause** | No PDF library, no CSV library, no backend endpoints, no frontend download handler |
| **Impact** | User cannot export reports or download invoices |
| **Severity** | CRITICAL |
| **Effort** | ~20h |
| **Files** | Entire system |

### B3: 8 Pages Fully Mock-Dependent
| Field | Value |
|-------|-------|
| **Pages** | ReportsPage, SettingsPage, AlertsPage, TicketsPage, SupportPage, MeterAssignPage |
| **Root Cause** | Pages initialized with `useState(mockData)` instead of React Query hooks |
| **Impact** | User sees fake/static data that does not reflect real system state |
| **Severity** | CRITICAL |
| **Effort** | ~40h |

### B4: Project CRUD Frontend Missing
| Field | Value |
|-------|-------|
| **Root Cause** | No useCreateProject/useUpdateProject/useDeleteProject hooks. No dialogs. Backend fully ready. |
| **Impact** | User cannot create, edit, or delete projects |
| **Severity** | CRITICAL |
| **Effort** | ~8h |
| **Files** | `use-projects.ts`, `ProjectsPage.tsx` |

### B5: Notification Bell Non-Functional
| Field | Value |
|-------|-------|
| **Root Cause** | No click handler, no dropdown, no backend API |
| **Impact** | User cannot access notifications |
| **Severity** | CRITICAL |
| **Effort** | ~8h |

---

## 🟡 SHOULD FIX SOON

### B6: Branding Wrong Everywhere
| Field | Value |
|-------|-------|
| **Current** | "Meter Verse — Utility Metering & Billing Management" |
| **Required** | "نظام التحصيلات" |
| **Effort** | ~2h |

### B7: Tariff Structure Split
| Field | Value |
|-------|-------|
| **Issue** | MVP tariff works; full billing architecture not implemented |
| **Effort** | ~30h |

---

## Summary
**5 CRITICAL blockers** must be fixed before real users can operate the platform. Estimated effort: **~82 hours** minimum.
