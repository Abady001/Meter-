# Documentation Index — Meter Verse

> Complete index of all documentation files organized by format type.
> Each content piece exists in multiple formats for different use cases.
> Last updated: 2026-06-01 (RCA Sprint + CI fixes + T061-T065 implementation + 373/373 tests)

---

## Folder Structure

```
documentation/
├── markdown/   ← Readable documentation (50 files + 59 deep-coverage)
├── sql/        ← Database DDL scripts + validation queries (8 files)
├── text/       ← Plain text versions (52 files + 59 deep-coverage)
└── excel/      ← CSV/tabular data (16 files)
```

---

## Documentation Inventory

| # | Content | markdown/ | sql/ | text/ | excel/ |
|---|---------|-----------|------|-------|--------|
| 00 | **Index** | `00-index.md` | — | `00-index.txt` | — | `00-index.txt` |
| 01 | **Conversation Log** | `01-conversation-log.md` | — | `01-conversation-log.txt` | `01-conversation-log.csv` |
| 02 | **Memory Files** | `02-memory-files.md` | — | `02-memory-files.txt` | — |
| 03 | **Database Schema** | `03-database-schema-overview.md` | `03-database-schema.sql` | `03-database-schema-overview.txt` | `03-database-tables.csv`<br>`03-state-transitions.csv`<br>`03-business-rules.csv` |
| 04 | **Audit Log** | — | — | — | `04-audit-log.csv` |
| 04a | **Last Update (RCA)** | `04-30-am_01-06-2026_last_update.md` | — | — | — |
| 05 | **Programming Languages** | `05-programming-languages.md` | — | `05-programming-languages.txt` | `05-programming-languages.csv` |
| 06 | **Required Tools & Services** | `06-github-packages-needed.md` | — | `06-github-packages-needed.txt` | `06-github-packages.csv` |
| 07 | *(merged into 06)* | — | — | `07-github-packages-needed.txt` | — |
| 08 | *(see 06 for full list)* | — | — | `08-required-apps.txt` | — |
| **09** | **Git Commit Log** | `09-git-commit-log.md` | — | `09-git-commit-log.txt` | `09-git-commit-log.csv` |
| **14** | **MCP Server Setup** | `14-mcp-setup.md` | — | `14-mcp-setup.txt` | — |
| **15** | **Task List (Notion)** | `15-task-list.md` | — | — | — |
| **10** | **Progress & Health Report** | `10-progress-health-report.md` | — | `10-progress-health-report.txt` | — |
| **11** | **Email Report Log** | `11-email-report-log.md` | — | `11-email-report-log.txt` | `11-email-report-log.csv` |
| **12** | **T002-T003 Verification** | `12-T002-T003-verification-report.md` | — | — | — | — |
| **16** | **Checkpoint Report** | `16-checkpoint-report.md` | — | — | — | — |
| **17** | **Extended Governance Rules** | `17-extended-governance-rules.md` | — | — | — | — |
| **18** | **Security Assessment** | `security-assessment.md` | — | — | — | — |
| **19** | **Security Gap Analysis** | `security-gap-analysis.md` | — | — | — | — |
| **20** | **Security Roadmap** | `security-roadmap.md` | — | — | — | — |
| **21** | **Security Validation Report** | `security-validation-report.md` | — | — | — | — |
| **13** | **Validation Reports** | `13-T001-validation-report.md`<br>`13-T002-validation-report.md`<br>`13-T003-validation-report.md`<br>`13-T004-validation-report.md`<br>`13-T005-validation-report.md`<br>`13-T006-validation-report.md`<br>`13-T007-validation-report.md`<br>`13-T008-validation-report.md`<br>`13-T009-validation-report.md`<br>`13-T010-validation-report.md`<br>`13-T011-validation-report.md`<br>`13-T012-validation-report.md`<br>`13-T013-validation-report.md`<br>`13-T014-validation-report.md`<br>`13-T015-validation-report.md`<br>`13-T016-validation-report.md`<br>`13-T017-validation-report.md`<br>`13-T018-validation-report.md`<br>`13-T019-validation-report.md`<br>`13-T020-validation-report.md`<br>`13-T023-validation-report.md`<br>`13-T024-validation-report.md`<br>`13-T025-validation-report.md`<br>`13-T026-validation-report.md`<br>`13-T027-validation-report.md` | `13-T001-validation-report.sql`<br>`13-T002-validation-report.sql`<br>`13-T003-validation-report.sql`<br>`13-T004-validation-report.sql`<br>`13-T005-validation-report.sql`<br>`13-T006-validation-report.sql`<br>`13-T007-validation-report.sql`<br>`13-T008-validation-report.sql`<br>`13-T009-validation-report.sql`<br>`13-T010-validation-report.sql`<br>`13-T011-validation-report.sql`<br>`13-T012-validation-report.sql`<br>`13-T013-validation-report.sql`<br>`13-T014-validation-report.sql`<br>`13-T015-validation-report.sql`<br>`13-T016-validation-report.sql`<br>`13-T017-validation-report.sql` | `13-T001-validation-report.txt`<br>`13-T002-validation-report.txt`<br>`13-T003-validation-report.txt`<br>`13-T004-validation-report.txt`<br>`13-T005-validation-report.txt`<br>`13-T006-validation-report.txt`<br>`13-T007-validation-report.txt`<br>`13-T008-validation-report.txt`<br>`13-T009-validation-report.txt`<br>`13-T010-validation-report.txt`<br>`13-T011-validation-report.txt`<br>`13-T012-validation-report.txt`<br>`13-T013-validation-report.txt`<br>`13-T014-validation-report.txt`<br>`13-T015-validation-report.txt`<br>`13-T016-validation-report.txt`<br>`13-T017-validation-report.txt` | `13-T001-validation-report.csv`<br>`13-T002-validation-report.csv`<br>`13-T003-validation-report.csv`<br>`13-T004-validation-report.csv`<br>`13-T005-validation-report.csv`<br>`13-T006-validation-report.csv`<br>`13-T007-validation-report.csv`<br>`13-T008-validation-report.csv`<br>`13-T009-validation-report.csv`<br>`13-T010-validation-report.csv`<br>`13-T011-validation-report.csv`<br>`13-T012-validation-report.csv`<br>`13-T013-validation-report.csv`<br>`13-T014-validation-report.csv`<br>`13-T015-validation-report.csv`<br>`13-T016-validation-report.csv`<br>`13-T017-validation-report.csv` | `13-T001-validation-report.pdf`<br>`13-T002-validation-report.pdf`<br>`13-T003-validation-report.pdf`<br>`13-T004-validation-report.pdf`<br>`13-T009-validation-report.pdf`<br>`13-T010-validation-report.pdf`<br>`13-T011-validation-report.pdf` |

---

## File Functions by Format

### `markdown/` — Readable Documentation (source of truth)

| File | Function |
|------|----------|
| `00-index.md` | This file — index with navigation and file dependency map |
| `01-conversation-log.md` | Full session transcript: prompts, responses, decisions, git commits |
| `02-memory-files.md` | All agent memory files: AGENTS.md, Speckit constitution, skills, OpenCode config, Graphify |
| `03-database-schema-overview.md` | 20 entities with column details, state transitions, derived views, business rules |
| `04-30-am_01-06-2026_last_update.md` | RCA Sprint session state — 373/373 tests, CI all 5 jobs green, T061-T065 implemented |
| `05-programming-languages.md` | Languages used/planned with versions, purpose, configuration files |
| `06-github-packages-needed.md` | All 30+ GitHub tools with versions, purposes, and download links |
| `09-git-commit-log.md` | Full commit history with timestamps, messages, and file counts |
| `10-progress-health-report.md` | System health check, task progress %, feedback, and recommendations |
| `11-email-report-log.md` | Log of all email reports sent — dates, subjects, recipients |
| `12-T002-T003-verification-report.md` | T002+T003 pre-T004 verification report |
| `13-T001-validation-report.md` | T001 validation: NestJS scaffold checks (8 tests) |
| `13-T002-validation-report.md` | T002 validation: config + PostgreSQL checks (7 tests) |
| `13-T003-validation-report.md` | T003 validation: lint/format/test tooling checks (5 tests) |
| `13-T004-validation-report.md` | T004 validation: Prisma ORM checks (8 tests) |
| `13-T005-validation-report.md` | T005 validation: docker-compose PostgreSQL checks |
| `13-T006-validation-report.md` | T006 validation: error envelope checks |
| `13-T007-validation-report.md` | T007 validation: correlation middleware checks |
| `13-T008-validation-report.md` | T008 validation: idempotency interceptor checks |
| `13-T009-validation-report.md` | T009 validation: JWT auth + RBAC checks |
| `13-T010-validation-report.md` | T010 validation: audit log checks |
| `13-T011-validation-report.md` | T011 validation: API versioning + OpenAPI checks |
| `13-T012-validation-report.md` | T012 validation: contract test harness checks |
| `13-T013-validation-report.md` | T013 validation: core org migration checks |
| `13-T014-validation-report.md` | T014 validation: meter/SIM migration checks |
| `13-T015-validation-report.md` | T015 validation: reading/tariff migration checks |
| `13-T016-validation-report.md` | T016 validation: invoice migration checks |
| `13-T017-validation-report.md` | T017 validation: payment/ledger migration checks |
| `13-T018-validation-report.md` | T018 validation: AuditLog + ReportJob migration checks |
| `13-T019-validation-report.md` | T019 validation: derived views (3 views) migration checks |
| `13-T020-validation-report.md` | T020 validation: FE-001 API client foundation checks |
| `13-T021-validation-report.md` | T021 validation: FE-002 React Query integration checks |
| `13-T022-validation-report.md` | T022 validation: FE-003 Feature flags + docs checks |
| `13-T023-validation-report.md` | T023 validation: US1 Contract tests (assignMeter) |
| `13-T024-validation-report.md` | T024 validation: US1 Contract tests (terminateMeter) |
| `13-T025-validation-report.md` | T025 validation: US1 Contract tests (simEligibility) |
| `13-T026-validation-report.md` | T026 validation: US1 Contract tests (createReading) |
| `13-T027-validation-report.md` | T027 validation: US1 Contract tests (listReadingReviewQueue) |
| `14-mcp-setup.md` | Notion + Odoo MCP server setup guide with activation instructions |
| `15-task-list.md` | Full 90-task list organized by phase, ready to paste into Notion |
| `16-checkpoint-report.md` | Full checkpoint validation (all systems 287/287 tests passing) |
| `17-extended-governance-rules.md` | Extended Governance Rules (Rules 1-10) for task closeout |
| `security-assessment.md` | Security Weaver Phase 1: Attack surface inventory, 27 gaps identified |
| `security-gap-analysis.md` | Security Weaver Phase 2: 5 Critical, 8 High, 7 Medium, 4 Low, 3 Info |
| `security-roadmap.md` | Security Weaver Phase 3: Phase A-D plan with effort/risk/rollback |
| `security-validation-report.md` | Security Weaver Phase 5: 14 controls active (from 6) |
| `deep-coverage/01-task-analysis-report.md` | T022 Deep-Coverage: Task Analysis Report |
| `deep-coverage/02-acceptance-coverage-matrix.md` | T022 Deep-Coverage: Acceptance Coverage Matrix |
| `deep-coverage/03-file-impact-analysis.md` | T022 Deep-Coverage: File Impact Analysis |
| `deep-coverage/04-dependency-matrix.md` | T022 Deep-Coverage: Dependency Matrix |
| `deep-coverage/05-risk-mitigation-report.md` | T022 Deep-Coverage: Risk Mitigation Report |
| `deep-coverage/06-validation-readiness-report.md` | T022 Deep-Coverage: Validation Readiness Report |
| `deep-coverage/07-hidden-requirement-report.md` | T022 Deep-Coverage: Hidden Requirement Report |
| `deep-coverage/08-implementation-coverage-report.md` | T022 Deep-Coverage: Implementation Coverage Report |
| `deep-coverage/09-cross-task-coverage-report.md` | T022 Deep-Coverage: Cross-Task Coverage Report |
| `deep-coverage/10-phase-consistency-report.md` | T022 Deep-Coverage: Phase Consistency Report |
| `deep-coverage/11-overall-confidence-score.md` | T022 Deep-Coverage: Overall Confidence Score (100%) |
| `deep-coverage/12-task-analysis-report.md` | T023 Deep-Coverage: Task Analysis Report |
| `deep-coverage/13-acceptance-coverage-matrix.md` | T023 Deep-Coverage: Acceptance Coverage Matrix |
| `deep-coverage/14-file-impact-analysis.md` | T023 Deep-Coverage: File Impact Analysis |
| `deep-coverage/15-dependency-matrix.md` | T023 Deep-Coverage: Dependency Matrix |
| `deep-coverage/16-risk-mitigation-report.md` | T023 Deep-Coverage: Risk Mitigation Report |
| `deep-coverage/17-hidden-requirement-report.md` | T023 Deep-Coverage: Hidden Requirement Report |
| `deep-coverage/18-task-analysis-report.md` | T024 Deep-Coverage: Task Analysis Report |
| `deep-coverage/19-acceptance-coverage-matrix.md` | T024 Deep-Coverage: Acceptance Coverage Matrix |
| `deep-coverage/20-file-impact-analysis.md` | T024 Deep-Coverage: File Impact Analysis |
| `deep-coverage/21-dependency-matrix.md` | T024 Deep-Coverage: Dependency Matrix |
| `deep-coverage/22-risk-mitigation-report.md` | T024 Deep-Coverage: Risk Mitigation Report |
| `deep-coverage/23-hidden-requirement-report.md` | T024 Deep-Coverage: Hidden Requirement Report |
| `deep-coverage/24-task-analysis-report.md` | T025 Deep-Coverage: Task Analysis Report |
| `deep-coverage/25-acceptance-coverage-matrix.md` | T025 Deep-Coverage: Acceptance Coverage Matrix |
| `deep-coverage/26-file-impact-analysis.md` | T025 Deep-Coverage: File Impact Analysis |
| `deep-coverage/27-dependency-matrix.md` | T025 Deep-Coverage: Dependency Matrix |
| `deep-coverage/28-risk-mitigation-report.md` | T025 Deep-Coverage: Risk Mitigation Report |
| `deep-coverage/29-hidden-requirement-report.md` | T025 Deep-Coverage: Hidden Requirement Report |
| `deep-coverage/30-task-analysis-report.md` | T026 Deep-Coverage: Task Analysis Report |
| `deep-coverage/31-acceptance-coverage-matrix.md` | T026 Deep-Coverage: Acceptance Coverage Matrix |
| `deep-coverage/32-file-impact-analysis.md` | T026 Deep-Coverage: File Impact Analysis |
| `deep-coverage/33-dependency-matrix.md` | T026 Deep-Coverage: Dependency Matrix |
| `deep-coverage/34-risk-mitigation-report.md` | T026 Deep-Coverage: Risk Mitigation Report |
| `deep-coverage/35-hidden-requirement-report.md` | T026 Deep-Coverage: Hidden Requirement Report |
| `deep-coverage/36-task-analysis-report.md` | T027 Deep-Coverage: Task Analysis Report |
| `deep-coverage/37-acceptance-coverage-matrix.md` | T027 Deep-Coverage: Acceptance Coverage Matrix |
| `deep-coverage/38-file-impact-analysis.md` | T027 Deep-Coverage: File Impact Analysis |
| `deep-coverage/39-dependency-matrix.md` | T027 Deep-Coverage: Dependency Matrix |
| `deep-coverage/40-risk-mitigation-report.md` | T027 Deep-Coverage: Risk Mitigation Report |
| `deep-coverage/41-hidden-requirement-report.md` | T027 Deep-Coverage: Hidden Requirement Report |
| `deep-coverage/42-task-analysis-report.md` | T028 Deep-Coverage: Task Analysis Report |
| `deep-coverage/43-acceptance-coverage-matrix.md` | T028 Deep-Coverage: Acceptance Coverage Matrix |
| `deep-coverage/44-file-impact-analysis.md` | T028 Deep-Coverage: File Impact Analysis |
| `deep-coverage/45-dependency-matrix.md` | T028 Deep-Coverage: Dependency Matrix |
| `deep-coverage/46-risk-mitigation-report.md` | T028 Deep-Coverage: Risk Mitigation Report |
| `deep-coverage/47-hidden-requirement-report.md` | T028 Deep-Coverage: Hidden Requirement Report |
| `deep-coverage/48-task-analysis-report.md` | T029 Deep-Coverage: Task Analysis Report |
| `deep-coverage/49-acceptance-coverage-matrix.md` | T029 Deep-Coverage: Acceptance Coverage Matrix |
| `deep-coverage/50-file-impact-analysis.md` | T029 Deep-Coverage: File Impact Analysis |
| `deep-coverage/51-dependency-matrix.md` | T029 Deep-Coverage: Dependency Matrix |
| `deep-coverage/52-risk-mitigation-report.md` | T029 Deep-Coverage: Risk Mitigation Report |
| `deep-coverage/53-hidden-requirement-report.md` | T029 Deep-Coverage: Hidden Requirement Report |
| `deep-coverage/54-task-analysis-report.md` | T030 Deep-Coverage: Task Analysis Report |
| `deep-coverage/55-acceptance-coverage-matrix.md` | T030 Deep-Coverage: Acceptance Coverage Matrix |
| `deep-coverage/56-file-impact-analysis.md` | T030 Deep-Coverage: File Impact Analysis |
| `deep-coverage/57-dependency-matrix.md` | T030 Deep-Coverage: Dependency Matrix |
| `deep-coverage/58-risk-mitigation-report.md` | T030 Deep-Coverage: Risk Mitigation Report |
| `deep-coverage/59-hidden-requirement-report.md` | T030 Deep-Coverage: Hidden Requirement Report |

### `sql/` — Database Definition

| File | Function |
|------|----------|
| `03-database-schema.sql` | Full PostgreSQL DDL: 20 tables, enums, constraints, indexes, views, triggers |
| `13-T001-validation-report.sql` | T001 validation SQL queries |
| `13-T002-validation-report.sql` | T002 validation SQL queries |
| `13-T003-validation-report.sql` | T003 validation SQL queries |
| `13-T004-validation-report.sql` | T004 validation SQL queries |
| `13-T005-validation-report.sql` | T005 validation SQL queries |
| `13-T006-validation-report.sql` | T006 validation SQL queries |
| `13-T007-validation-report.sql` | T007 validation SQL queries |
| `13-T008-validation-report.sql` | T008 validation SQL queries |
| `13-T009-validation-report.sql` | T009 validation SQL queries |
| `13-T010-validation-report.sql` | T010 validation SQL queries |
| `13-T011-validation-report.sql` | T011 validation SQL queries |
| `13-T012-validation-report.sql` | T012 validation SQL queries |
| `13-T013-validation-report.sql` | T013 validation SQL queries |
| `13-T014-validation-report.sql` | T014 validation SQL queries |
| `13-T015-validation-report.sql` | T015 validation SQL queries |
| `13-T016-validation-report.sql` | T016 validation SQL queries |
| `13-T017-validation-report.sql` | T017 validation SQL queries |

### `text/` — Plain Text (terminal, grep, scripts)

| File | Function |
|------|----------|
| `00-index.txt` | Plain text index |
| `01-conversation-log.txt` | Plain text conversation log |
| `02-memory-files.txt` | Plain text memory files overview |
| `03-database-schema-overview.txt` | Plain text database schema |
| `05-programming-languages.txt` | Plain text languages list |
| `06-github-packages-needed.txt` | Plain text — all required tools & services |
| `09-git-commit-log.txt` | Plain text commit history |
| `10-progress-health-report.txt` | Plain text progress & health report |
| `11-email-report-log.txt` | Plain text email log |
| `13-T001-validation-report.txt` | T001 validation plain text |
| `13-T002-validation-report.txt` | T002 validation plain text |
| `13-T003-validation-report.txt` | T003 validation plain text |
| `13-T004-validation-report.txt` | T004 validation plain text |
| `13-T005-validation-report.txt` | T005 validation plain text |
| `13-T006-validation-report.txt` | T006 validation plain text |
| `13-T007-validation-report.txt` | T007 validation plain text |
| `13-T008-validation-report.txt` | T008 validation plain text |
| `13-T009-validation-report.txt` | T009 validation plain text |
| `13-T010-validation-report.txt` | T010 validation plain text |
| `13-T011-validation-report.txt` | T011 validation plain text |
| `13-T012-validation-report.txt` | T012 validation plain text |
| `13-T013-validation-report.txt` | T013 validation plain text |
| `13-T014-validation-report.txt` | T014 validation plain text |
| `13-T015-validation-report.txt` | T015 validation plain text |
| `13-T016-validation-report.txt` | T016 validation plain text |
| `13-T017-validation-report.txt` | T017 validation plain text |
| `13-T018-validation-report.txt` | T018 validation plain text |
| `13-T019-validation-report.txt` | T019 validation plain text |
| `13-T020-validation-report.txt` | T020 validation plain text |
| `13-T023-validation-report.txt` | T023 validation plain text |
| `13-T024-validation-report.txt` | T024 validation plain text |
| `13-T025-validation-report.txt` | T025 validation plain text |
| `13-T026-validation-report.txt` | T026 validation plain text |
| `13-T027-validation-report.txt` | T027 validation plain text |
| `14-mcp-setup.txt` | MCP server setup plain text |
| `15-task-list.txt` | Task list plain text |
| `16-checkpoint-report.txt` | Checkpoint plain text |
| `17-extended-governance-rules.txt` | Governance rules plain text |
| `04-30-am_01-06-2026_last_update.txt` | RCA Sprint last update plain text |
| `phase-3-execution-prompt.txt` | Phase 3 execution prompt plain text |
| `deep-coverage/` task-analysis-report.txt (59 files) | Deep-coverage gate reports plain text (T022-T030) |
| `07-github-packages-needed.txt` | *(deprecated — see 06 for full list)* |
| `08-required-apps.txt` | *(deprecated — see 06 for full list)* |

### `excel/` — CSV / Tabular Data (spreadsheets, analysis)

| File | Function |
|------|----------|
| `01-conversation-log.csv` | Session steps in tabular format |
| `03-database-tables.csv` | All 20 tables with 200+ columns, types, constraints, FK references |
| `03-state-transitions.csv` | State machine transitions for all entities |
| `03-business-rules.csv` | 12 business rules with enforcement levels |
| `04-audit-log.csv` | Timestamped action log (35+ entries) |
| `05-programming-languages.csv` | Languages with versions and usage |
| `06-github-packages.csv` | 37 packages with categories and versions |
| `09-git-commit-log.csv` | Commit history in tabular format |
| `11-email-report-log.csv` | Email reports log — daily updated spreadsheet |
| `13-T001-validation-report.csv` | T001 validation tabular |
| `13-T002-validation-report.csv` | T002 validation tabular |
| `13-T003-validation-report.csv` | T003 validation tabular |
| `13-T004-validation-report.csv` | T004 validation tabular |
| `13-T005-validation-report.csv` | T005 validation tabular |
| `13-T006-validation-report.csv` | T006 validation tabular |
| `13-T007-validation-report.csv` | T007 validation tabular |
| `13-T008-validation-report.csv` | T008 validation tabular |
| `13-T009-validation-report.csv` | T009 validation tabular |
| `13-T010-validation-report.csv` | T010 validation tabular |
| `13-T011-validation-report.csv` | T011 validation tabular |
| `13-T012-validation-report.csv` | T012 validation tabular |
| `13-T013-validation-report.csv` | T013 validation tabular |
| `13-T014-validation-report.csv` | T014 validation tabular |
| `13-T015-validation-report.csv` | T015 validation tabular |
| `13-T016-validation-report.csv` | T016 validation tabular |
| `13-T017-validation-report.csv` | T017 validation tabular |

### `pdf/` — Printable Documents (reports, printing)

| File | Function |
|------|----------|
| `00-index.pdf` | Printable index |
| `01-conversation-log.pdf` | Session history |
| `02-memory-files.pdf` | Agent configuration overview |
| `03-database-schema-overview.pdf` | Entity relationship model |
| `03-database-schema.pdf` | Full SQL DDL |
| `04-audit-log.pdf` | Action log |
| `05-programming-languages.pdf` | Languages used |
| `06-github-packages-needed.pdf` | GitHub tools |
| `07-github-packages-needed.pdf` | Compact packages |
| `08-required-apps.pdf` | Required applications |
| `09-git-commit-log.pdf` | Commit history printable |
| `10-progress-health-report.pdf` | Progress & health report printable |
| `11-email-report-log.pdf` | Email log printable |
| `13-T001-validation-report.pdf` | T001 validation printable |
| `13-T002-validation-report.pdf` | T002 validation printable |
| `13-T003-validation-report.pdf` | T003 validation printable |
| `13-T004-validation-report.pdf` | T004 validation printable |
| `13-T009-validation-report.pdf` | T009 validation printable |
| `13-T010-validation-report.pdf` | T010 validation printable |
| `13-T011-validation-report.pdf` | T011 validation printable |

---

## File Dependency Map

```
documentation/
├── markdown/00-index.md              ← START HERE — entry point
├── markdown/01-conversation-log.md   ← Full session history
├── markdown/02-memory-files.md       ← Agent config & skill files
├── markdown/03-database-schema-overview.md ← Data model reference
├── markdown/05-programming-languages.md    ← Tech stack
├── markdown/06-github-packages-needed.md  ← GitHub tools
├── markdown/09-git-commit-log.md         ← Commit log (91 commits)
├── markdown/10-progress-health-report.md ← System health & progress
├── markdown/11-email-report-log.md         ← Email reports sent
├── markdown/12-T002-T003-verification-report.md ← Pre-T004 verification
├── markdown/13-T00*-validation-report.md   ← T001-T027 validation reports
├── markdown/14-mcp-setup.md               ← MCP server setup guide
├── markdown/15-task-list.md               ← Full task list (T001-T090)
├── markdown/16-checkpoint-report.md       ← Full system checkpoint
├── markdown/17-extended-governance-rules.md ← Governance rules 1-10
├── markdown/security-assessment.md        ← Security Weaver: Attack surface
├── markdown/security-gap-analysis.md      ← Security Weaver: Gap analysis
├── markdown/security-roadmap.md           ← Security Weaver: Roadmap (A-D)
├── markdown/security-validation-report.md ← Security Weaver: Validation
├── markdown/deep-coverage/                ← 59 coverage reports (T022-T030)
│
├── sql/03-database-schema.sql     ← PostgreSQL DDL (20 tables)
├── sql/13-T00*-validation-report.sql ← Validation SQL queries (T001-T017)
│
├── text/                          ← Plain text versions of all above
├── excel/                         ← CSV/tabular data
└── pdf/                           ← Printable PDF versions
```

### Related Infrastructure (outside documentation/)

| Path | Purpose |
|------|---------|
| `backend/Dockerfile` | Multi-stage NestJS production build |
| `Frontend/Dockerfile` | Multi-stage Next.js production build |
| `.dockerignore` | Excludes node_modules, .env, .next from Docker context |
| `.github/workflows/ci.yml` | CI pipeline (5 jobs: backend, frontend, security, secret-scan, test-agent) |
| `Frontend/graphify-out/` | Knowledge graph: 2573 nodes, 4293 edges, 184 communities |
| `restore-point-20260531-132118/` | Session restore point with AI_HANDOFF.md (RCA Sprint) |

---

## How to Use

| You want to... | Open this |
|----------------|-----------|
| Understand the project setup history | `markdown/01-conversation-log.md` |
| See what was installed and when | `excel/04-audit-log.csv` |
| Find a tool's version and download link | `markdown/06-github-packages-needed.md` |
| Understand the database | `markdown/03-database-schema-overview.md` or `sql/03-database-schema.sql` |
| Know which languages we use | `markdown/05-programming-languages.md` or `excel/05-programming-languages.csv` |
| Configure a new agent session | `markdown/02-memory-files.md` → then root `AGENTS.md` |
| Install everything from scratch | `text/08-required-apps.txt` + `markdown/06-github-packages-needed.md` |
| See every commit with timestamps | `markdown/09-git-commit-log.md` or `excel/09-git-commit-log.csv` |
| Print or share documentation | `pdf/` folder — printable versions |
| Analyze in spreadsheet | `excel/` folder — CSV data ready for import |
| Review security posture | `markdown/security-assessment.md` (attack surface) + `security-gap-analysis.md` (gaps) |
| Plan security improvements | `markdown/security-roadmap.md` (Phase A-D with effort/risk) |
| Verify security controls | `markdown/security-validation-report.md` (18 controls active) |
| Explore the knowledge graph | `Frontend/graphify-out/graph.html` (visual) or `graph.json` (data) |
| Run CI/CD locally | `.github/workflows/ci.yml` — 5 jobs (backend, frontend, security, secret-scan, test-agent) |
| Build Docker images | `backend/Dockerfile` + `Frontend/Dockerfile` (multi-stage) |



