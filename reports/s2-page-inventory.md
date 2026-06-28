# Phase S2 — Full Page Inventory

**Date:** 2026-06-18

## Summary

| # | PageKey | Classification | API Hooks | Mock Fallback | Toast Stubs | QueryBoundary |
|---|---------|---------------|-----------|---------------|-------------|---------------|
| 1 | `login` | MOCK_ONLY | None | Yes (mock-auth) | 0 | No |
| 2 | `dashboard` | PARTIAL | 3 queries | Yes (all sections) | 0 | No |
| 3 | `projects` | PARTIAL | 1 query | Yes | 2 | Yes |
| 4 | `project-detail` | PARTIAL | 1 query | Yes (deep) | 0 | Yes |
| 5 | `locations` | PARTIAL | 2 queries | Yes | 1 | Yes |
| 6 | `customers` | WORKING | 5 (3R + 3W) | Yes | 0 | Yes |
| 7 | `customer-detail` | PARTIAL | 2 queries | Yes (tabs mock) | 0 | No |
| 8 | `meters` | PARTIAL | 1 query | Yes | 3 | Yes |
| 9 | `meter-detail` | PARTIAL | 1 query | Yes (tabs mock) | 0 | Yes |
| 10 | `meter-assign` | MOCK_ONLY | None | 100% mock | 1 | No |
| 11 | `meter-replace` | WORKING | 2 (1R + 1W) | Yes (list) | 0 | No |
| 12 | `meter-terminate` | WORKING | 2 (1R + 1W) | Yes (list) | 0 | No |
| 13 | `sim-cards` | PARTIAL | 1 query | Yes | 0 | Yes |
| 14 | `readings` | PARTIAL | 1 query | Yes | 2 | Yes |
| 15 | `reading-new` | PARTIAL | 1 mutation | Yes (dropdowns mock) | 0 | No |
| 16 | `consumption` | PARTIAL | 1 query | Yes | 0 | Yes |
| 17 | `water-balance` | PARTIAL | 1 query | Yes | 0 | No |
| 18 | `invoices` | PARTIAL | 1 query | Yes (flag-gated) | 7 | No |
| 19 | `invoice-detail` | PARTIAL | 1 query | Yes (flag-gated) | 6 | No |
| 20 | `payments` | PARTIAL | 1 query | Yes (flag-gated) | 5 | No |
| 21 | `balances` | MOCK_ONLY | None | Yes (flag-gated, empty API path) | 0 | No |
| 22 | `reports` | MOCK_ONLY | None | 100% mock | 4 | No |
| 23 | `alerts` | MOCK_ONLY | None | 100% mock (useState) | 1 | No |
| 24 | `tickets` | MOCK_ONLY | None | 100% mock | 1 | No |
| 25 | `support` | MOCK_ONLY | None | 100% mock | 0 | No |
| 26 | `settings` | MOCK_ONLY | None | 100% mock | 3 | No |

## Classification Breakdown

| Classification | Count | Pages |
|---------------|-------|-------|
| **WORKING** | 3 | customers, meter-replace, meter-terminate |
| **PARTIAL** | 14 | dashboard, projects, project-detail, locations, customer-detail, meters, meter-detail, sim-cards, readings, reading-new, consumption, water-balance, invoices, invoice-detail, payments |
| **MOCK_ONLY** | 9 | login, meter-assign, balances, reports, alerts, tickets, support, settings |

## Toast Stub Inventory

| Page | Stub Count | Operations |
|------|-----------|------------|
| projects | 2 | Edit, Delete |
| locations | 1 | Add Building |
| meters | 3 | Edit, Delete, Add Meter |
| meter-assign | 1 | Assign (false success) |
| readings | 2 | View Details, Edit |
| invoices | 7 | Create, Edit, Issue, Record Payment, Download PDF, Cancel |
| invoice-detail | 6 | Edit, Issue, Record Payment, Download PDF, Cancel |
| payments | 5 | View, Edit, Delete, Record Payment |
| reports | 4 | Filter, CSV Export, XLSX Export, Preview |
| alerts | 1 | Acknowledge |
| tickets | 1 | Create Ticket |
| settings | 3 | Save (3 tabs) |
| **Total** | **36** | |

## Key Findings

1. **Only 3/26 pages (11.5%) are WORKING** — the rest are either mock-only or partially migrated.
2. **36 toast stubs** remain across the application — operations that show user feedback but perform no real work.
3. **9 pages are entirely MOCK_ONLY** — no API queries whatsoever. Critical pages like login, meter-assign, alerts, tickets, and settings have zero backend connectivity.
4. **Feature flags mask the problem** — `isFeatureEnabled()` toggles in invoices, payments, balances default to `'mock'`, creating the illusion of migration while hiding the real gap.
5. **Deep mock dependencies** persist even on WORKING pages — `meter-replace` and `meter-terminate` use mock data for their dropdown lists.
