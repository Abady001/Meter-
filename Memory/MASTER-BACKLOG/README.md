# Master Engineering Backlog

## Priority Definitions

| Priority | Meaning | Target |
|----------|---------|--------|
| **P0** | Critical — blocks production | Complete before go-live |
| **P1** | High — should have | Complete before pilot |
| **P2** | Medium — nice to have | Complete before RC-10 |
| **P3** | Low — future | Post-production |
| **DONE** | Completed | Archived |

## Task Lifecycle

```
TODO → IN PROGRESS → CODE REVIEW → TESTING → READY FOR COMMIT → DONE
```

## Current Backlog

### P0 — Must Fix Before Production
| # | Task | Status | Est. Days |
|---|------|--------|-----------|
| P0-001 | Wire TOU Pricing to Billing Engine | ✅ DONE | 5 |
| P0-002 | Implement Demand Charge Calculation | ✅ DONE | 3 |
| P0-003 | Implement Penalty Engine | ✅ DONE | 3 |
| P0-004 | Add Credit/Debit Note Workflows | ✅ DONE (existed) | 2 |

### P1 — Should Fix Before Pilot
| # | Task | Status | Est. Days |
|---|------|--------|-----------|
| P1-001 | Implement TCP Sync Layer | ✅ DONE | 5 |
| P1-002 | Implement Background Workers | ✅ DONE | 3 |
| P1-003 | Complete Gas Utility | ✅ DONE | 2 |
| P1-004 | Add Memory Limits to Node Services | ✅ DONE | 0.5 |
| P1-005 | N+1 Query Prevention Audit | ✅ DONE | 1 |

### P2 — Enterprise Features
| # | Task | Status | Est. Days |
|---|------|--------|-----------|
| P2-001 | Complete Water 01/04 Variants | ✅ DONE | 2 |
| P2-002 | Add Tariff Versioning + Clone | ✅ DONE | 3 |
| P2-003 | Add Performance Benchmarks | ✅ DONE | 2 |
| P2-004 | ESLint Cleanup (49 warnings) | ✅ DONE | 0.5 |
| P2-005 | Add Loading States to All Pages | ✅ DONE | 2 |
| P2-006 | Restore Test-Agent CI | ✅ DONE (P1 task) | 1 |

### P3 — Future
| # | Task | Est. Days |
|---|------|-----------|
| P3-001 | Reporting Engine Migration (Legacy → Jasper) | 5 |
| P3-002 | Multi-language Invoice Templates | 3 |
| P3-003 | Customer Portal Self-Service | 5 |
| P3-004 | Mobile App (React Native) | 15 |

### DONE
| # | Task | Completed |
|---|------|-----------|
| — | — | — |
