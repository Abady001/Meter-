# Meter Verse — Project Tree
> **Last updated**: 2026-06-13 (v2.0.0 Migration) — For full architecture see `ROUTE_OF_DATA.md`
> For AI handoff/restore see `AI_HANDOFF.md` and `RESTORE_POINT.md`
> Completed: T001-T085 | Phase 7: T086-T120

```
Meter/                                           # Meter Verse v2.0.0
├── .agents/skills/                              # 9 SpeckIt agent skills
├── .opencode/                                   # OpenCode config + commands
├── .specify/                                    # SpeckIt SDD pipeline (4 features registered)
├── .git/                                        # Git repo (migrated from Meter-)
├── AGENTS.md                                    # Agent instructions + T086+ memory logs
├── AI_HANDOFF.md                                # Complete AI handoff (v2.0.0)
├── FULL_PROMPT_XFER.md                          # Single-file context transfer (590 lines)
├── ROUTE_OF_DATA.md                             # Architecture + data flow map
├── PROJECT_ARCHITECTURE_AND_TREE.md             # Full architecture
├── PROJECT_TREE.md                              # This file
├── MASTER-DEPLOYMENT-GUIDE.md                   # Deployment guide (dual Linux+Windows)
├── RESTORE_POINT.md                             # Restore point (v3)
├── T001-T022-FINISHED-TASKS.md                  # Completed tasks log (T001-T085)
├── NEXT-SECTION-PROMPT.md                       # Next task prompt
├── metering_system_prd_brainstorm.md            # Original PRD
├── package.json                                 # name: meter-verse-workspace
├── backend/                                     # NestJS API (T001-T085)
│   ├── prisma/schema.prisma + migrations/
│   ├── src/ (auth, audit, common, billing...)
│   ├── test/ (373 tests, 47 suites)
│   ├── docker-compose.yml
│   └── package.json
├── Frontend/                                    # Next.js 16 app (Bun runtime)
│   ├── src/ (app, components, hooks, lib, prisma)
│   ├── graphify-out/ (frontend graph)
│   └── package.json
├── specs/                                       # 4 feature specs
│   ├── 001-metering-billing-platform/           # T001-T085 (original, DO NOT MODIFY)
│   │   ├── spec.md, plan.md, data-model.md
│   │   ├── contracts/meter-verse-api.yaml
│   │   ├── checklists/requirements.md
│   │   └── tasks.md (updated with rollback procs)
│   ├── 002-meter-verse-core/                    # T086-T092 (Core DB, RBAC, i18n)
│   │   ├── spec.md, plan.md, data-model.md
│   ├── 003-symbiot-integration/                 # Symbiot bridge (T091)
│   │   ├── spec.md, plan.md, data-model.md
│   └── 004-migration-plans/                     # Migration (T107-T111)
│       ├── spec.md, plan.md, data-model.md
├── docs/
│   ├── architecture/                            # Architecture diagrams
│   ├── migration/                               # Migration guides
│   └── planning/                                # 12 planning docs with Mermaid diagrams
│       ├── v2.0.0-planning-strategy.md
│       ├── v2.0.0-implementation-roadmap.md
│       ├── v2.0.0-tasks.md
│       ├── v2.0.0-workflow.md
│       ├── v2.0.0-stories.md
│       ├── v2.0.0-data-model.md
│       ├── v2.0.0-security.md
│       ├── v2.0.0-migration-plan.md
│       ├── v2.0.0-symbiot-integration.md
│       ├── v2.0.0-test-plan.md
│       ├── v2.0.0-deployment-guide.md
│       └── v2.0.0-upcoming-updates.md
├── reference/                                   # 7 reference systems (not in git)
│   ├── collection-system/                       # Flask billing system (priority features)
│   ├── sbill/                                   # SBill Palm Hills + Estates (2.1 GB)
│   ├── symbiot/                                 # Symbiot SEP integration (1.7 GB)
│   ├── ims/                                     # IMS system
│   ├── meter-department/                        # Meter department files (4.1 GB)
│   ├── energy-360/                              # Energy 360 mobile app
│   └── all-last-update/                         # Latest system updates (1.5 GB)
├── tools/                                       # Playwright MCP
│   └── playwright-mcp/
├── scripts/                                     # Utility scripts
├── ci-cd/                                       # CI/CD pipeline configs
├── documentation/                               # Multi-format (markdown, sql, text, excel, pdf)
├── graphify-out/                                # Structural graph
└── backup files/                                # Session backups
```
