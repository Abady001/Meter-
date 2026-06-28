# B8 — Master Gap Board (BCRP Consolidated)
**Type:** INVESTIGATION — Final gap analysis  
**Source:** B1–B7 findings consolidated

---

## Consolidated Gap Table

| Feature | SBill | MV | Parity | Priority | Effort | Risk | Recommendation |
|---------|-------|-----|--------|----------|--------|------|----------------|
| **Bill Cycle Engine** | ✅ Full batch per-utility | ❌ Not implemented | 0% | **P0** | 3 weeks | **HIGH** | Build first — BillCycle entity, CRUD, locking, auto-numbering |
| **Tariff Versions** | ✅ Versioned tariffs | ❌ Single version only | 0% | **P0** | 2 weeks | **HIGH** | Add version history table, effective dates, activation |
| **Charge Types Enum** | ✅ STEPS/FLAT/STATIC/PER_UNIT/ZERO | ❌ None | 0% | **P0** | 1 week | **MED** | Create ChargeType enum, integrate with TariffCalculationService |
| **Charge Groups** | ✅ 7 groups (CONSUMPTION, CUSTOMERCARE, ISSUE, TAX, ZERO) | ❌ None | 0% | **P0** | 1 week | **MED** | Add ChargeGroup enum, map to charges |
| **Batch Invoice Generation** | ✅ Generate all invoices for a cycle | ❌ Single invoice only | 0% | **P1** | 4 weeks | **HIGH** | Build batch service, progress tracking, error handling |
| **Settlement Engine** | ✅ 2 types, per-cycle | ⚠️ Basic adjustment | 20% | **P1** | 2 weeks | **MED** | Add SettlementType enum (TARIFF_DIFF, CONSUMPTION_SETTLEMENT), per-cycle application |
| **Customer Ledger** | ✅ Running balance | ❌ Not implemented | 0% | **P1** | 2 weeks | **MED** | Create LedgerEntry table, balance_before/total/paid/balance_after |
| **Import Templates** | ✅ 16+ data upload templates | ⚠️ Basic CSV | 30% | **P2** | 3 weeks | **MED** | Build template system with validation, error reporting |
| **Payments Engine** | ✅ 5 methods, allocation, reconciliation | ⚠️ Basic recording | 50% | **P2** | 2 weeks | **LOW** | Add allocation logic, multi-method support, reconciliation |
| **Invoice Cancel/Rebill** | ✅ Full workflow | ❌ Not implemented | 0% | **P2** | 2 weeks | **MED** | Add cancel with reason, rebill from same data |
| **Reports Engine** | ✅ 16 JRXML reports | ⚠️ Some lists | 25% | **P2** | 4 weeks | **MED** | Prioritize: invoice, journal, aging, collections, tax reports |
| **Settings Pages** | ✅ 20+ settings | ⚠️ Partial (3/22) | 30% | **P2** | 3 weeks | **LOW** | Build 12 missing settings (see B7 priority list) |
| **Reading Validation** | ✅ Validation rules, corrections | ❌ Basic CRUD | 40% | **P2** | 2 weeks | **LOW** | Add validation workflow, prev/curr integrity checks |
| **Zero Consumption Handling** | ✅ Min bill or zero | ❌ Edge case untested | 0% | **P2** | 3 days | **LOW** | Add zero-consumption logic per tariff min bill |
| **Meter Replacement** | ✅ Merged reading history | ❌ Not implemented | 0% | **P3** | 1 week | **LOW** | Add meter replacement workflow, reading merge |
| **Project Entity** | ✅ EPower October grouping | ❌ Not implemented | 0% | **P3** | 1 week | **LOW** | Add Project entity, assign customers |
| **Audit Log** | ✅ Full audit trail | ❌ Not implemented | 0% | **P3** | 2 weeks | **LOW** | Add AuditLog table, track user actions |
| **Holiday Calendar** | ✅ Reading schedule adjustment | ❌ Not implemented | 0% | **P3** | 3 days | **LOW** | Add Holiday entity, adjust reading dates |
| **Permissions** | ✅ Role-based per-page | ⚠️ Basic | 40% | **P3** | 2 weeks | **LOW** | Add granular role-permission mapping |
| **Email/SMS Config** | ✅ Notification gateways | ❌ Not implemented | 0% | **P4** | 1 week | **LOW** | Add gateway config, notification templates |

---

## Overall Assessment

```
P0 Items Remaining:  4
P1 Items Remaining:  3
P2 Items Remaining:  7
P3 Items Remaining:  4
P4 Items Remaining:  2
────────────────────
Total Gaps:         20
Total Parity:       ~27%
```

**READY_FOR_IMPLEMENTATION = NO**

---

## Blockers (Priority Order)

| # | Blocker | Reason | Must Unblock Before |
|---|---------|--------|-------------------|
| B1 | **No bill cycle system** | Cannot group invoices, no batch generation, no cycle lock | Everything |
| B2 | **No tariff versioning** | Cannot manage rate changes over time | Invoice generation for past cycles |
| B3 | **No charge type enum** | `calculateTieredCharge` only handles steps; flat/static/per_unit/zero all broken | Correct billing for all tariff types |
| B4 | **No charge groups** | Cannot categorize charges, tax calc logic missing | Tax reporting, invoice breakdown |
| B5 | **No batch invoice generation** | Cannot process 1,422 customers in a cycle | Go-live |
| B6 | **No customer ledger** | No running balance, no outstanding tracking | Collections, aging reports |
| B7 | **No settlement types** | Settlement adjustments untagged, cannot apply per-cycle | Tariff Diff / Consumption Settlement |

---

## Implementation Roadmap (If READY_FOR_IMPLEMENTATION = YES)

### Phase 1 — Foundation (Weeks 1–5)
| Week | Deliverable | Dependencies |
|------|-------------|-------------|
| 1 | **Charge Types Enum** + Charge Groups Enum + integrate with `TariffCalculationService` | None |
| 2 | **Tariff Versioning** — version table, effective dates, migration of existing tariffs | Charge Types |
| 3–4 | **Bill Cycle Engine** — BillCycle entity, CRUD, locking, auto-numbering | None |
| 5 | **Batch Invoice Generation** — cycle-based batch service | Bill Cycle + Tariff Versioning |
| **Milestone: Can generate invoices for a full cycle** | | |

### Phase 2 — Core Billing (Weeks 6–9)
| Week | Deliverable | Dependencies |
|------|-------------|-------------|
| 6 | **Settlement Engine** — SettlementType enum, per-cycle application | Bill Cycle |
| 7–8 | **Invoice Cancel/Rebill** — cancel workflow, rebill from source data | Batch Invoice |
| 9 | **Zero Consumption + Meter Replacement** edge cases | Batch Invoice |
| **Milestone: Full billing workflow operational** | | |

### Phase 3 — Financial (Weeks 10–12)
| Week | Deliverable | Dependencies |
|------|-------------|-------------|
| 10–11 | **Customer Ledger** — LedgerEntry table, running balance | Invoice + Payment |
| 12 | **Payments Allocation** — allocation engine, multi-method, reconciliation | Customer Ledger |
| **Milestone: Basic financial operations** | | |

### Phase 4 — Administration (Weeks 13–16)
| Week | Deliverable | Dependencies |
|------|-------------|-------------|
| 13 | **Settings Pages** (Settlement Types, Customer Groups, Tax Settings, Charge Groups) | None |
| 14 | **Import Templates** — template system with validation | Settings |
| 15 | **Reports Engine** — top 8 reports (invoice, journal, aging, collections, tax, etc.) | Phase 2+3 |
| 16 | **Permissions + Audit Log** | Users |
| **Milestone: Feature parity for admin operations** | | |

### Phase 5 — Polish (Weeks 17–20)
| Week | Deliverable | Dependencies |
|------|-------------|-------------|
| 17 | Remaining Settings (Payment Centers, Banks, POS, Unit Types, Zones, Holidays) | None |
| 18 | Remaining Reports (16 total) | Phase 4 |
| 19 | Email/SMS Config, Backup Config, Delete Readings | None |
| 20 | **Full SBill parity verification** — run parallel billing for 1 cycle | All above |
| **Milestone: Ready for pilot parallel run** | | |

---

## Total Implementation Estimate

| Phase | Duration | Weeks | Dependencies |
|-------|----------|-------|-------------|
| Phase 1 | Foundation | 5 | None |
| Phase 2 | Core Billing | 4 | Phase 1 |
| Phase 3 | Financial | 3 | Phase 2 |
| Phase 4 | Administration | 4 | Phase 2+3 |
| Phase 5 | Polish | 4 | All above |
| **Total** | **20 weeks** | **20** | |

### Resource Estimate
- 2 senior backend developers
- 1 frontend developer
- 1 QA engineer
- 1 domain expert (SBill knowledge)

### Risk Factors
1. SBill DB schema discovery may reveal hidden complexity (2-week buffer)
2. Business rules for settlements may be more complex than documented (1-week buffer)
3. PDF report templates (JRXML → MV) may require significant design work (2-week buffer)

**Total with buffers: ~25 weeks**
