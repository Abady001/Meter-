# W13 — Workflow Certification

**Date**: 2026-06-18
**Method**: Live API simulation of realistic user journey

## Simulated Journey: Customer → Meter → Reading → Invoice → Payment

| Step | Operation | API Call | Result | DB Persisted? |
|------|-----------|----------|--------|--------------|
| 1 | Login as super_admin | POST /auth/dev-login | 200 ✅ | N/A |
| 2 | Create Customer | POST /projects/:pid/customers | **201** ✅ | ✅ UUID: 4088f529 |
| 3 | Create Meter | POST /meters | **201** ✅ | ✅ UUID: d44e6367 |
| 4 | Create Reading | POST /readings | **201** ✅ | ✅ UUID: 54e793c6 |
| 5 | List Invoices | GET /invoices | 200 ✅ | N/A |
| 6 | List Payments | GET /payments | 200 ✅ | N/A |

## Limitations
- Invoice generation (`POST /invoices/generate`) returns 500 (known pre-existing issue)
- Payment creation (`POST /payments`) not tested (requires valid invoice)
- Meter assign/terminate not tested (requires valid unit/meter assignment)

## What Works
The core CRUD chain (Login → Create Customer → Create Meter → Create Reading → Read Invoice/Payment) works completely. All creates return 201 with UUIDs confirming database persistence. No toast-only or fake-success patterns.

## What Is Broken
- Invoice generation 500 (pre-existing)
- Frontend UI for project CRUD, invoice actions, and downloads (documented separately)

## Conclusion
**WORKFLOW_CERTIFIED = PARTIAL** — Backend core workflow works; frontend UI incomplete.
