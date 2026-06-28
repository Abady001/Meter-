# U8 — Workflow Alignment

**Date**: 2026-06-18

## End-to-End Workflow Status

| Workflow | Steps | Status | Blockers |
|----------|-------|--------|----------|
| **Customer Lifecycle** | Create → View → Edit → Delete | ✅ WORKING | None |
| **Meter Lifecycle** | Create → Assign → Replace → Terminate | ⚠️ PARTIAL | Assign wizard is mock-only |
| **Reading Lifecycle** | Create → List → Review | ⚠️ PARTIAL | No approve/reject workflow |
| **Invoice Lifecycle** | Generate → Issue → Adjust → Download | ❌ BROKEN | No adjust, no download |
| **Payment Lifecycle** | Record → List → Reverse | ❌ BROKEN | No record API, mock dialog |
| **Collection Lifecycle** | Track → Aging → Statements | ❌ MISSING | Not implemented |
| **Solar Lifecycle** | All steps | ❌ MISSING | Schema only |
| **Chilled Water Lifecycle** | All steps | ❌ MISSING | Schema only |
| **Notification Lifecycle** | Create → List → Read → Delete | ✅ WORKING | Recently built |
| **RBAC Lifecycle** | User → Role → Permission | ⚠️ PARTIAL | CoreUser not seeded |

## Critical Path
```
Project → Customer → Unit → Meter → Reading → Invoice → Payment
    ✅        ✅       ❌      ✅       ✅        ⚠️        ❌
```
Units workflow is missing (no dedicated Units page). Invoice generation is partially working (generation fixed, issue wired, but no adjust/download). Payment recording is broken (mock dialog).

## Conclusion
Core CRUD workflows (Customer, Meter, Reading) work. Billing and collection workflows are broken or missing.
