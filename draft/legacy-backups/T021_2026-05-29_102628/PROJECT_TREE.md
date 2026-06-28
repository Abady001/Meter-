# Meter Verse — Project Tree
> Last updated: 2026-05-29 — For full architecture + tree see `PROJECT_ARCHITECTURE_AND_TREE.md`
> For AI handoff/restore see `AI_HANDOFF.md` and `RESTORE_POINT.md`
> Completed: T001-T021 (21/85 tasks)

.
├── .agents
│   └── skills
│       ├── speckit-analyze
│       │   └── SKILL.md
│       ├── speckit-checklist
│       │   └── SKILL.md
│       ├── speckit-clarify
│       │   └── SKILL.md
│       ├── speckit-constitution
│       │   └── SKILL.md
│       ├── speckit-implement
│       │   └── SKILL.md
│       ├── speckit-plan
│       │   └── SKILL.md
│       ├── speckit-specify
│       │   └── SKILL.md
│       ├── speckit-tasks
│       │   └── SKILL.md
│       └── speckit-taskstoissues
│           └── SKILL.md
├── AGENTS.md
├── Frontend
│   ├── agent-ctx
│   │   └── 4-layout-builder.md
│   ├── AGENTS.md
│   ├── bun.lock
│   ├── Caddyfile
│   ├── components.json
│   ├── .config
│   │   └── opencode
│   │       └── skills
│   ├── db
│   │   └── custom.db
│   ├── download
│   │   └── README.md
│   ├── .env
│   ├── eslint.config.mjs
│   ├── examples
│   │   └── websocket
│   │       ├── frontend.tsx
│   │       └── server.ts
│   ├── FRONTEND_BUILD.md
│   ├── FRONTEND_SPRINT_BACKLOG.md
│   ├── .gitignore
│   ├── mini-services
│   │   └── .gitkeep
│   ├── next.config.ts
│   ├── next-env.d.ts
│   ├── .opencode
│   │   ├── opencode.json
│   │   └── plugins
│   │       └── graphify.js
│   ├── package.json
│   ├── postcss.config.mjs
│   ├── prisma
│   │   └── schema.prisma
│   ├── public
│   │   ├── logo.svg
│   │   └── robots.txt
│   ├── scripts
│   │   └── smoke-all-pages.mjs
│   ├── src
│   │   ├── app
│   │   │   ├── api
│   │   │   ├── globals.css
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── components
│   │   │   ├── alerts
│   │   │   ├── billing
│   │   │   ├── customers
│   │   │   ├── dashboard
│   │   │   ├── layout
│   │   │   ├── meters
│   │   │   ├── projects
│   │   │   ├── readings
│   │   │   ├── reports
│   │   │   ├── shared
│   │   │   ├── sim-cards
│   │   │   ├── smart-table
│   │   │   ├── tickets
│   │   │   └── ui
│   │   ├── hooks
│   │   │   ├── use-mobile.ts
│   │   │   └── use-toast.ts
│   │   └── lib
│   │       ├── db.ts
│   │       ├── mock-auth.ts
│   │       ├── mock-data.ts
│   │       ├── navigation.ts
│   │       ├── router-store.ts
│   │       ├── types.ts
│   │       └── utils.ts
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   ├── worklog.md
│   └── .zscripts
│       ├── build.sh
│       ├── dev.pid
│       ├── dev.sh
│       ├── mini-services-build.sh
│       ├── mini-services-install.sh
│       ├── mini-services-start.sh
│       └── start.sh
├── .gitignore
├── metering_system_prd_brainstorm.md
├── .opencode
│   ├── commands
│   │   └── speckit.constitution.md
│   ├── .gitignore
│   ├── package.json
│   └── package-lock.json
├── PROJECT_TREE.md
├── .specify
│   ├── feature.json
│   ├── init-options.json
│   ├── integration.json
│   ├── integrations
│   │   ├── codex.manifest.json
│   │   └── speckit.manifest.json
│   ├── memory
│   │   └── constitution.md
│   ├── scripts
│   │   └── bash
│   │       ├── check-prerequisites.sh
│   │       ├── common.sh
│   │       ├── create-new-feature.sh
│   │       ├── setup-plan.sh
│   │       └── setup-tasks.sh
│   ├── templates
│   │   ├── checklist-template.md
│   │   ├── constitution-template.md
│   │   ├── plan-template.md
│   │   ├── spec-template.md
│   │   └── tasks-template.md
│   └── workflows
│       ├── speckit
│       │   └── workflow.yml
│       └── workflow-registry.json
└── specs
    └── 001-metering-billing-platform
        ├── checklists
        │   └── requirements.md
        ├── contracts
        │   └── meter-verse-api.yaml
        ├── data-model.md
        ├── plan.md
        ├── quickstart.md
        ├── research.md
        ├── spec.md
        └── tasks.md

62 directories, 90 files
