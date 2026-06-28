# D2 — Open Task Analysis (T001-T088)

**Date**: 2026-06-18
**Authority**: tasks.md, C6 Report, D1 Matrix

---

## 1. Open Task Inventory

**Total open from T001-T088**: 16 tasks (17 with T084a)
**Partially complete**: 1 (T048)
**Incorrectly marked**: 1 (T085)
**Intentionally deferred**: 1 (T078)

## 2. T048 — Review Queue (⚠️ PARTIAL)

| Attribute | Detail |
|-----------|--------|
| **Original Objective** | Full review queue with GET + approve/reject/correct actions |
| **Current State** | `GET /api/v1/readings/review-queue` implemented. Approve/reject/correct endpoint actions not implemented. |
| **Dependency Chain** | T047 (Readings module) → T048 → T048a (Water variance) |
| **Reason Still Open** | Approve/reject actions were deprioritized. Frontend anomaly view (T051) consumes GET only. |
| **Risk if Deferred** | LOW — review queue is read-only. Manual approval via DB remains possible. |
| **Impact on T089** | NONE — T089 is RBAC schema, unrelated to reading approval |

## 3. T068-T072 — US3 Frontend Pages (❌ OPEN)

| Task | Original Objective | Current State | Reason Open | Impact on T089 |
|------|-------------------|---------------|-------------|----------------|
| T068 | FE Invoices API migration | Mock data only | Deprioritized after backend completion (T062-T065) | NONE — Frontend only |
| T069 | FE Payments allocation workflow | Mock data only | Same | NONE — Frontend only |
| T070 | FE Balances aging page | Mock data only | Same | NONE — Frontend only |
| T071 | FE Customer statements v1 | Mock data only | Same | NONE — Frontend only |
| T072 | US3 frontend batch validation | Not started | Blocked by T068-T071 | NONE — Frontend only |

**Collective Risk**: LOW. Mock data fallback preserved per Constitution Article 2.3. No regression risk.

## 4. T073-T077 — Reports, RBAC, FE Polish (❌ OPEN)

| Task | Original Objective | Current State | Reason Open | Impact on T089 |
|------|-------------------|---------------|-------------|----------------|
| T073 | Report export jobs backend | Not implemented | Deprioritized | NONE — T089 is auth, not reports |
| T074 | Report contract tests | Not implemented | Deprioritized | NONE |
| T075 | RBAC action-gating + audit tests | Not implemented | Deprioritized | LOW — T089 will expand RBAC; tests should follow |
| T076 | FE Reports v2 | Not implemented | Frontend only | NONE |
| T077 | FE Permission gating | Not implemented | Frontend only | LOW — T089 redefines permissions; may conflict |

**Notice**: T075 and T077 overlap with T089 scope. T089 16-profile RBAC will render T075/T077 outdated. Recommend **closing T075/T077 as superseded by T089** when T089 completes.

## 5. T079-T084 — CI/CD, E2E, Polish (❌ OPEN)

| Task | Original Objective | Current State | Reason Open | Impact on T089 |
|------|-------------------|---------------|-------------|----------------|
| T079 | FE contract + integration in CI | Not started | CI pipeline pending | NONE — Infrastructure |
| T080 | FE E2E expansion | Playwright smoke only | Deprioritized | NONE — Independent |
| T081 | FE Observability | Not started | Deprioritized | NONE |
| T082 | Polish batch validation | Not started | Blocked by T068-T072 | NONE |
| T083 | Contract vs API.yaml reconciliation | Not started | Scope unclear | NONE — Contract audit |
| T084 | MVP acceptance validation E2E | Not started | Low urgency | NONE |
| T084a | Backup/restore + RPO/RTO | Not started | Low urgency | NONE |

**Collective Risk**: LOW. All infrastructure/CI tasks. No impact on T089 RBAC implementation.

## 6. T085 — Constitution Ratification (🔴 INCORRECTLY MARKED)

| Attribute | Detail |
|-----------|--------|
| **Original Objective** | Ratify project constitution before closeout |
| **Current State** | Constitution at `.specify/memory/constitution.md` is ratified (dated 2026-06-17). Task is marked [ ] in tasks.md. |
| **Why Incorrect** | Constitution was ratified independently of T085 workflow. Task was never updated to [X]. |
| **Impact on T089** | NONE — Constitution already ratified. Task just needs metadata update. |

**Recommendation**: Mark T085 as [X] in the next batch update.

## 7. T078 — Alerts→Tickets Linkage (🔷 DEFERRED)

| Attribute | Detail |
|-----------|--------|
| **Original Objective** | Wire alerts to support ticket creation |
| **Current State** | Marked [X] in tasks.md with note "OUT OF MVP SCOPE" |
| **Impact on T089** | NONE — explicitly out of scope |

## 8. Critical Finding: SYSTEM_DNA.md Status Contradiction

| Attribute | Detail |
|-----------|--------|
| **File** | `SYSTEM_DNA.md` line 5 |
| **Declared Status** | "DRAFT — Pending Stakeholder Ratification" |
| **Governance Claim** | C1 report and S1 report assert SYSTEM_DNA.md is "ratified" |
| **Reality** | File text says DRAFT. Content was created from SYSTEM_DNA_DRAFT.md. No formal ratification line added. |
| **Rule 3 Impact** | SYSTEM_DNA.md Rule 3: "No P0 task may begin implementation until SYSTEM_DNA.md is ratified" |
| **Impact on T089** | **POTENTIALLY BLOCKING** — If Rule 3 is strictly enforced, SYSTEM_DNA.md must first be changed from DRAFT to RATIFIED status |

## 9. Open Task Summary

| Category | Count | Blocking T089? |
|----------|-------|----------------|
| Frontend UI (T068-T072) | 5 | NO |
| Reports/RBAC/FE (T073-T077) | 5 | NO (T075/T077 superseded) |
| CI/E2E/Polish (T079-T084, T084a) | 7 | NO |
| Incorrectly marked (T085) | 1 | NO — already ratified |
| Deferred (T078) | 1 | NO |
| Partially complete (T048) | 1 | NO |
| SYSTEM_DNA.md Status | 1 contradiction | ⚠️ MAY BLOCK T089 per Rule 3 |
| **Total** | **16 open + 1 contradiction** | **0 confirmed blockers, 1 potential** |
