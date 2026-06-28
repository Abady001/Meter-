# Meter Verse — Project Tree
> **Last updated**: 2026-05-29 (T022) — For full architecture see `ROUTE_OF_DATA.md`
> For AI handoff/restore see `AI_HANDOFF.md` and `RESTORE_POINT.md`
> Completed: T001-T022 (22/85 tasks)

```
Meter-/
├── .agents/skills/                              # 9 SpeckIt agent skills
├── .opencode/                                   # OpenCode config + commands
├── .specify/                                    # SpeckIt SDD pipeline (workflows, templates, scripts)
├── AGENTS.md                                    # Agent instructions + memory logs
├── AI_HANDOFF.md                                # Complete AI handoff (updated T022)
├── ROUTE_OF_DATA.md                             # Architecture + data flow map (NEW T022)
├── PROJECT_ARCHITECTURE_AND_TREE.md             # Full architecture
├── PROJECT_TREE.md                              # This file - compact tree
├── MASTER-DEPLOYMENT-GUIDE.md                   # Deployment guide
├── RESTORE_POINT.md                             # Restore point (updated T022)
├── T001-T022-FINISHED-TASKS.md                  # Completed tasks log
├── NEXT-SECTION-PROMPT.md                       # Next task prompt
├── metering_system_prd_brainstorm.md            # Original PRD
├── prompt-history_T009.md                       # T009 prompt history
├── prompt-history_T010.md                       # T010 prompt history
├── prompt-history_T011.md                       # T011 prompt history
├── backend/                                     # NestJS API (T001-T019)
│   ├── prisma/schema.prisma + migrations/       # 8 migrations (20+ models)
│   ├── src/                                     # Source code
│   │   ├── auth/ (JWT + RBAC)                   # T009
│   │   ├── audit/ (append-only log)             # T010
│   │   ├── common/ (config, db, http, openapi)  # T002-T008, T011
│   │   ├── idempotency/                         # T008
│   │   ├── billing/ thru sim-cards/             # EMPTY (T027+)
│   │   └── types/express.d.ts
│   ├── test/ (82 tests)                         # T001-T012
│   ├── docker-compose.yml
│   └── package.json
├── Frontend/                                    # Next.js 16 app (T020-T022)
│   ├── src/
│   │   ├── app/ (layout, page, globals)
│   │   ├── pages/api/features.ts                # T022
│   │   ├── components/ (alerts, billing, customers, dashboard, layout, meters, projects, readings, reports, shared, sim-cards, smart-table, tickets, ui/)
│   │   ├── hooks/ (use-projects.ts, use-mobile.ts, use-toast.ts)
│   │   └── lib/
│   │       ├── api/ (client, errors, auth, query-client)  # T020-T021
│   │       ├── feature-flags.ts                 # T022
│   │       ├── mock-data.ts, mock-auth.ts, types.ts, navigation.ts, router-store.ts, db.ts, utils.ts
│   ├── graphify-out/ (graph.json, graph.html, report)
│   ├── prisma/schema.prisma
│   └── package.json
├── specs/001-metering-billing-platform/         # All 85 tasks, OpenAPI contract
├── documentation/                               # Multi-format (markdown, sql, text, excel, pdf)
├── graphify-out/                                # Structural graph (198 files)
├── backup files/                                # T021 + T022 session backups
└── .gitignore
```
