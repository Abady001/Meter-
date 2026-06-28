# Post-Sprint Roadmap — Stage Planning

**Date:** 2026-06-25
**Current State:** Readiness Score 40.25/100 — NOT RELEASE READY

---

## Stage A: Symbiot Synchronization

**Duration:** 6-8 weeks
**Dependencies:** T086-T090 (Core DB), T091-T092 (Infrastructure), Symbiot bridge specs

### Goals
| # | Goal | Success Criteria |
|---|------|-----------------|
| A-1 | Build Symbiot bridge: 10 TCP × 100 HTTP multiplex channels | Bridge handles 1000 concurrent meter reads/min |
| A-2 | Implement bidirectional sync: Symbiot ↔ Meter Verse | Sync latency < 30s for 95th percentile |
| A-3 | Implement 3 availability plans (Full, Safety, Failover) | All 3 plans deployable via config toggle |
| A-4 | Real-time meter reading ingestion via Symbiot bridge | Readings appear in Meter Verse within 60s of AMR poll |
| A-5 | Health monitoring + alerts for bridge connectivity | Bridge health dashboard with uptime SLAs |

### Risks
| Risk | Probability | Impact | Mitigation |
|------|:-----------:|:------:|------------|
| Symbiot API contract changes | Medium | High | Contract tests pinned; version negotiation |
| TCP channel throughput bottleneck | Low | High | Load test before production; 10 channel minimum |
| Failover plan not tested | Medium | Medium | Monthly failover drills |
| Windows Service stability (WinService host) | Medium | High | Graceful shutdown + auto-restart + monitoring |

### Deliverables
- `backend/src/symbiot/` — Bridge module (connector, orchestrator, channel pool)
- `backend/src/symbiot/plans/` — 3 availability plan implementations
- `backend/src/metering/polling-adapter.ts` — Automatic polling ingestion
- `scripts/symbiot-health-check.sh` — Health monitoring
- Integration tests: 50+ E2E tests covering sync scenarios

### Duration Breakdown
| Phase | Weeks | Activities |
|-------|:-----:|-----------|
| A.1 Bridge foundation | 2 | TCP server, channel pool, connection management |
| A.2 Multiplexing | 2 | 100 HTTP × 10 TCP, load distribution, retry logic |
| A.3 3 availability plans | 2 | Full, Safety, Failover — config-driven |
| A.4 Health + monitoring | 1 | Dashboards, alerts, SLAs |
| A.5 Testing + hardening | 1 | Load test, failover drills, E2E tests |

**Total: 8 weeks**

---

## Stage B: Sample Data Migration

**Duration:** 4-6 weeks
**Dependencies:** Stage A complete, Core DB (T086), Features DB (T087), Area DB template (T088)

### Goals
| # | Goal | Success Criteria |
|---|------|-----------------|
| B-1 | Migrate 1 area's SBill data (Palm Hills) | All 36 tables populated; data integrity verified |
| B-2 | Migrate SBill Estates data (2nd area) | Both areas independently queryable |
| B-3 | Implement data validation pipeline | Row count, sum, hash comparisons pass ≥99.9% |
| B-4 | Verify billing parity on migrated data | SBill invoices reproduced in Meter Verse (≥95% line item match) |
| B-5 | Build rollback capability for each migration step | Any migration reversible within 30 minutes |

### Risks
| Risk | Probability | Impact | Mitigation |
|------|:-----------:|:------:|------------|
| SBill data quality issues | High | High | Data profiling pre-migration; validation pipeline |
| Schema mismatches | Medium | Medium | Transform layer; field mapping documented |
| Migration performance (large dataset) | Low | Medium | Batch migration; progress tracking |
| Referential integrity violations | Medium | High | Foreign key validation pre/post migration |

### Deliverables
- `scripts/migration/` — Migration pipeline (extract, transform, validate, load)
- `scripts/migration/sbill-ph-to-mv.sql` — Palm Hills migration script
- `scripts/migration/sbill-estates-to-mv.sql` — Estates migration script
- `scripts/migration/validate-migration.sh` — Data integrity checker
- Migration documentation: mapping, transform rules, rollback procedures

### Duration Breakdown
| Phase | Weeks | Activities |
|-------|:-----:|-----------|
| B.1 Data profiling | 1 | Analyze SBill data quality; build validation pipeline |
| B.2 Transform layer | 2 | Build ETL: SBill schema → Meter Verse schema |
| B.3 Pilot migration (1 area) | 1 | Migrate Palm Hills; verify parity |
| B.4 Second area | 1 | Migrate Estates; verify |
| B.5 Validation + documentation | 1 | Full validation; rollback procedures; runbook |

**Total: 6 weeks**

---

## Stage C: Pilot Deployment

**Duration:** 4-6 weeks
**Dependencies:** Stage A (Symbiot), Stage B (Sample Data), Security L1 certification, Performance remediation

### Goals
| # | Goal | Success Criteria |
|---|------|-----------------|
| C-1 | Deploy to 1 pilot area (Palm Hills) | All 7 utility types operational for 500+ meters |
| C-2 | Parallel run: SBill + Meter Verse | 30-day comparison with <2% variance |
| C-3 | Performance meets production targets | Dashboard <3s, invoice gen <10s/1000 meters |
| C-4 | UAT passed by all 7 roles | Sign-off matrix 94/94 scenarios |
| C-5 | Security OWASP ASVS L1 certified | All 6 L1 gaps closed |
| C-6 | Playwright test suite ≥200 tests | Regression coverage on pilot area |

### Risks
| Risk | Probability | Impact | Mitigation |
|------|:-----------:|:------:|------------|
| Billing variance >2% | Medium | High | Daily comparison reports; fix before full rollout |
| Performance regression | Low | High | Load test before pilot; monitoring in place |
| User adoption resistance | Medium | Medium | Training sessions; parallel run period |
| Data sync issues | Low | Medium | Daily reconciliation; alert on mismatch |

### Deliverables
- Pilot deployment runbook
- Parallel run comparison reports (daily)
- UAT completion report with all sign-offs
- Performance benchmark report
- Security L1 certification report
- User training materials and session completion

### Duration Breakdown
| Phase | Weeks | Activities |
|-------|:-----:|-----------|
| C.1 Environment setup | 1 | Deploy to pilot environment; configure areas |
| C.2 Security L1 certification | 1 | Close remaining L1 gaps; penetration test |
| C.3 Performance remediation | 1 | Indexes, pagination, caching, N+1 fixes |
| C.4 UAT execution | 1 | All 7 roles test 94 scenarios |
| C.5 Parallel run | 2 | Daily comparison; variance resolution |
| C.6 Go/no-go decision | — | Review board; sign-off |

**Total: 6 weeks**

---

## Stage D: Production Deployment

**Duration:** 4 weeks
**Dependencies:** Stage C (Pilot passed), All P0/P1 blockers closed, 300+ tests

### Goals
| # | Goal | Success Criteria |
|---|------|-----------------|
| D-1 | Full production deployment (4 areas) | October, New Cairo, Badya, North Coast live |
| D-2 | Load test: 500 concurrent users | Response times <2s p95, no errors |
| D-3 | 99.9% uptime for first month | <43 minutes downtime |
| D-4 | Zero data loss in any failure scenario | Recovery drills pass |
| D-5 | Monitoring + alerting fully operational | All dashboards green; on-call rotation active |

### Risks
| Risk | Probability | Impact | Mitigation |
|------|:-----------:|:------:|------------|
| Production data loss | Low | Critical | Daily backups; point-in-time recovery |
| Performance under real load | Medium | High | Load test pre-deployment; auto-scaling |
| Integration failures | Low | High | Staged rollout; canary deployment |
| Security incident | Low | Critical | WAF + rate limiting + audit alerts |

### Deliverables
- Production deployment checklist
- Load test report
- DR runbook + recovery drill completion
- Monitoring dashboards + alert rules
- Operations handover documentation

### Duration Breakdown
| Phase | Weeks | Activities |
|-------|:-----:|-----------|
| D.1 Production environment | 1 | Infra setup; CI/CD pipeline; monitoring |
| D.2 Load test + hardening | 1 | Load test; optimize bottlenecks |
| D.3 Staged rollout | 1 | 4 areas in sequence: October → New Cairo → Badya → North Coast |
| D.4 Monitoring + handover | 1 | Final monitoring; ops handover; documentation |

**Total: 4 weeks**

---

## Stage E: Full Migration

**Duration:** 6-8 weeks
**Dependencies:** Stage D (Production stable for 1 month)

### Goals
| # | Goal | Success Criteria |
|---|------|-----------------|
| E-1 | Migrate all 8 current areas | All areas live on Meter Verse; SBill retired |
| E-2 | Migrate collection system data | Collection tracker data fully migrated |
| E-3 | SBill sunset | Read-only access maintained for 6 months; no new billing |
| E-4 | 95% SBill billing parity achieved | All 78 comparison functions matched |
| E-5 | 100% user adoption | All operators use Meter Verse exclusively |

### Risks
| Risk | Probability | Impact | Mitigation |
|------|:-----------:|:------:|------------|
| Migration fatigue (8 areas) | High | Medium | Staged; 1 area per week; weekend migrations |
| Legacy SBill unavailability | Low | High | Read-only SBill instance retained |
| User resistance | Medium | Medium | Incentives; super-user program; training |
| Data volume scaling | Medium | Medium | Performance test at 8× data volume |

### Deliverables
- Migration completion report (all 8 areas)
- SBill sunset plan + execution
- Full parity certification (95% SBill)
- User adoption dashboard
- Final migration audit

### Duration Breakdown
| Phase | Weeks | Activities |
|-------|:-----:|-----------|
| E.1 Remaining areas (4 areas × 1 week) | 4 | Migrate Sodic EDNC, Sodic Estates, Sodic VYE, Uvines Mall |
| E.2 Collection system migration | 1 | Migrate collection tracker; reconcile |
| E.3 Parity + SBill sunset | 1 | Close final parity gaps; SBill → read-only |
| E.4 User adoption + closeout | 2 | Training; final validation; documentation freeze |

**Total: 8 weeks**

---

## Overall Timeline

| Stage | Duration | Cumulative |
|-------|:--------:|:----------:|
| A: Symbiot Synchronization | 8 weeks | 8 weeks |
| B: Sample Data Migration | 6 weeks | 14 weeks |
| C: Pilot Deployment | 6 weeks | 20 weeks |
| D: Production Deployment | 4 weeks | 24 weeks |
| E: Full Migration | 8 weeks | 32 weeks |

**Estimated Go-Live: 32 weeks (~8 months) from today**

---

## Stage Dependency Map

```
Stage A (Symbiot) ──→ Stage B (Migration) ──→ Stage C (Pilot)
                                                        │
                                                        ▼
Stage E (Full Migration) ←── Stage D (Production) ←────┘
```

## Go/No-Go Gates

| Gate | Entry Criteria | Review Board | Decision |
|------|---------------|--------------|:--------:|
| A→B | Bridge E2E tests pass; 3 plans deployable | Architect + Engineering Lead | ☐ |
| B→C | 2 areas migrated; data integrity ≥99.9% | Architect + QA Lead | ☐ |
| C→D | Pilot 30-day variance <2%; UAT 94/94; ASVS L1 | All stakeholders | ☐ |
| D→E | Production stable 30 days; 99.9% uptime; 300 tests | PM + Engineering + Ops | ☐ |
