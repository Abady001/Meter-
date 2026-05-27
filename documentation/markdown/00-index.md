# Documentation Index — Meter Pulse

> Complete index of all documentation files organized by format type.
> Each content piece exists in multiple formats for different use cases.
> Last updated: 2026-05-26

---

## Folder Structure

```
documentation/
├── markdown/   ← Readable documentation (17 files)
├── sql/        ← Database DDL scripts + validation queries (7 files)
├── text/       ← Plain text versions (18 files)
├── excel/      ← CSV/tabular data (15 files)
└── pdf/        ← Printable PDF versions (20 files)
```

---

## Documentation Inventory

| # | Content | markdown/ | sql/ | text/ | excel/ | pdf/ |
|---|---------|-----------|------|-------|--------|------|
| 00 | **Index** | `00-index.md` | — | `00-index.txt` | — | `00-index.pdf` |
| 01 | **Conversation Log** | `01-conversation-log.md` | — | `01-conversation-log.txt` | `01-conversation-log.csv` | `01-conversation-log.pdf` |
| 02 | **Memory Files** | `02-memory-files.md` | — | `02-memory-files.txt` | — | `02-memory-files.pdf` |
| 03 | **Database Schema** | `03-database-schema-overview.md` | `03-database-schema.sql` | `03-database-schema-overview.txt` | `03-database-tables.csv`<br>`03-state-transitions.csv`<br>`03-business-rules.csv` | `03-database-schema-overview.pdf`<br>`03-database-schema.pdf` |
| 04 | **Audit Log** | — | — | — | `04-audit-log.csv` | `04-audit-log.pdf` |
| 05 | **Programming Languages** | `05-programming-languages.md` | — | `05-programming-languages.txt` | `05-programming-languages.csv` | `05-programming-languages.pdf` |
| 06 | **GitHub Packages** | `06-github-packages-needed.md` | — | `06-github-packages-needed.txt` | `06-github-packages.csv` | `06-github-packages-needed.pdf` |
| 07 | **GitHub Packages (compact)** | — | — | `07-github-packages-needed.txt` | — | `07-github-packages-needed.pdf` |
| 08 | **Required Apps** | — | — | `08-required-apps.txt` | — | `08-required-apps.pdf` |
| **09** | **Git Commit Log** | `09-git-commit-log.md` | — | `09-git-commit-log.txt` | `09-git-commit-log.csv` | `09-git-commit-log.pdf` |
| **10** | **Progress & Health Report** | `10-progress-health-report.md` | — | `10-progress-health-report.txt` | — | `10-progress-health-report.pdf` |
| **11** | **Email Report Log** | `11-email-report-log.md` | — | `11-email-report-log.txt` | `11-email-report-log.csv` | `11-email-report-log.pdf` |
| **12** | **T002-T003 Verification** | `12-T002-T003-verification-report.md` | — | — | — | — |
| **14** | **Session Summary** | `14-session-summary-2026-05-26.md` | — | — | — | — |<br>`13-T002-validation-report.md`<br>`13-T003-validation-report.md`<br>`13-T004-validation-report.md`<br>`13-T005-validation-report.md`<br>`13-T006-validation-report.md`<br>`13-T007-validation-report.md` | `13-T001-validation-report.sql`<br>`13-T002-validation-report.sql`<br>`13-T003-validation-report.sql`<br>`13-T004-validation-report.sql`<br>`13-T005-validation-report.sql`<br>`13-T006-validation-report.sql`<br>`13-T007-validation-report.sql` | `13-T001-validation-report.txt`<br>`13-T002-validation-report.txt`<br>`13-T003-validation-report.txt`<br>`13-T004-validation-report.txt`<br>`13-T005-validation-report.txt`<br>`13-T006-validation-report.txt`<br>`13-T007-validation-report.txt` | `13-T001-validation-report.csv`<br>`13-T002-validation-report.csv`<br>`13-T003-validation-report.csv`<br>`13-T004-validation-report.csv`<br>`13-T005-validation-report.csv`<br>`13-T006-validation-report.csv`<br>`13-T007-validation-report.csv` | `13-T001-validation-report.pdf`<br>`13-T002-validation-report.pdf`<br>`13-T003-validation-report.pdf`<br>`13-T004-validation-report.pdf`<br>`13-T005-validation-report.pdf`<br>`13-T006-validation-report.pdf`<br>`13-T007-validation-report.pdf` |

---

## File Functions by Format

### `markdown/` — Readable Documentation (source of truth)

| File | Function |
|------|----------|
| `00-index.md` | This file — index with navigation and file dependency map |
| `01-conversation-log.md` | Full session transcript: prompts, responses, decisions, git commits |
| `02-memory-files.md` | All agent memory files: AGENTS.md, Speckit constitution, skills, OpenCode config, Graphify |
| `03-database-schema-overview.md` | 20 entities with column details, state transitions, derived views, business rules |
| `05-programming-languages.md` | Languages used/planned with versions, purpose, configuration files |
| `06-github-packages-needed.md` | All 30+ GitHub tools with versions, purposes, and download links |
| `09-git-commit-log.md` | Full commit history with timestamps, messages, and file counts |
| `10-progress-health-report.md` | System health check, task progress %, feedback, and recommendations |
| `11-email-report-log.md` | Log of all email reports sent — dates, subjects, recipients |
| `12-T002-T003-verification-report.md` | T002+T003 pre-T004 verification report |
| `14-session-summary-2026-05-26.md` | Full session summary for context recovery in new sessions |
| `13-T001-validation-report.md` | T001 validation: NestJS scaffold checks (8 tests) |
| `13-T002-validation-report.md` | T002 validation: config + PostgreSQL checks (7 tests) |
| `13-T003-validation-report.md` | T003 validation: lint/format/test tooling checks (5 tests) |
| `13-T004-validation-report.md` | T004 validation: Prisma ORM checks (8 tests) |
| `13-T005-validation-report.md` | T005 validation: Docker PostgreSQL checks (10 tests) |
| `13-T006-validation-report.md` | T006 validation: Error envelope checks (9 tests) |
| `13-T007-validation-report.md` | T007 validation: Correlation-ID middleware checks (11 tests) |

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

### `text/` — Plain Text (terminal, grep, scripts)

| File | Function |
|------|----------|
| `00-index.txt` | Plain text index |
| `01-conversation-log.txt` | Plain text conversation log |
| `02-memory-files.txt` | Plain text memory files overview |
| `03-database-schema-overview.txt` | Plain text database schema |
| `05-programming-languages.txt` | Plain text languages list |
| `06-github-packages-needed.txt` | Plain text GitHub packages |
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
| `07-github-packages-needed.txt` | Compact GitHub packages (original) |
| `08-required-apps.txt` | All required applications (original) |

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
| `13-T005-validation-report.pdf` | T005 validation printable |
| `13-T006-validation-report.pdf` | T006 validation printable |
| `13-T007-validation-report.pdf` | T007 validation printable |

---

## File Dependency Map

```
documentation/
├── markdown/00-index.md           ← START HERE — entry point
├── markdown/01-conversation-log.md ← Full session history
├── markdown/02-memory-files.md     ← Agent config & skill files
├── markdown/03-database-schema-overview.md ← Data model reference
├── markdown/05-programming-languages.md  ← Tech stack
├── markdown/06-github-packages-needed.md ← GitHub tools
├── markdown/14-session-summary-2026-05-26.md ← Full session context
├── markdown/12-T002-T003-verification-report.md ← Pre-T004 verification
│
├── sql/03-database-schema.sql     ← PostgreSQL DDL (20 tables)
├── sql/13-T00*-validation-report.sql ← Validation SQL queries
│
├── text/                          ← Plain text versions of all above
├── excel/                         ← CSV/tabular data
└── pdf/                           ← Printable PDF versions
```

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
