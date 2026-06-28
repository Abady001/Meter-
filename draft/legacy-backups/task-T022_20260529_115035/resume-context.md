# Resume Context — Meter Verse

> **Self-contained** — Any AI system can read this file and continue work immediately.

## Project Overview
- **Name**: Meter Verse — Utility Metering & Billing Platform
- **Stack**: Frontend: Next.js 16 + React 19 + TypeScript + Tailwind v4 + shadcn/ui (Bun)
- **Stack**: Backend: NestJS + PostgreSQL + Prisma ORM (Node 20+, npm)
- **Testing**: Jest (backend, 82 tests), Playwright (frontend smoke)
- **Spec Tooling**: Speckit v0.8.13, Graphify v0.8.18, OpenSpec v1.3.1
- **External**: Notion MCP, Odoo MCP (configured)
- **Repo**: https://github.com/Kirllos360/Meter- (fork) → Abady001/Meter- (upstream)

## Current Phase
Sprint 0 — Frontend Foundation (T020-T022 completed)

## Completed Tasks: 22 of 85
| Phase | Tasks |
|---|---|
| Phase 1: Backend Foundation | T001-T003 |
| Phase 2: Data & Auth | T004-T019 |
| Sprint 0: Frontend Foundation | T020-T022 |

## Pending Tasks: 63
**Next**: T023 — US1 Contract Tests

## Active Branch
`feature/t022-validation-docs`

## Last Commit
`d7ed1d7` — T022: normalize migration.sql line endings

## Latest Checkpoint
`backup files/task-T022_20260529_115035/checkpoint.md`

## Latest Validation Status
| Check | Status |
|---|---|
| Frontend build | ✅ Next.js 16.2.6 |
| Frontend lint | ✅ 0 errors |
| Backend tests | ✅ 82/82 |
| Backend build | ✅ Clean |
| Prisma validate | ✅ Valid |
| Graphify AST | ✅ 198 files |

## Open Issues
1. Playwright smoke test fails on Windows (pre-existing)
2. SpecKit bash scripts need WSL2
3. OpenSpec not integrated into pipeline
4. Graphify semantic extraction skipped (no DeepSeek credits)

## Next Recommended Step
1. Read `ROUTE_OF_DATA.md` for architecture
2. Read `documentation/markdown/17-extended-governance-rules.md` for governance
3. Start T023 (US1 Contract Tests) — create contract tests for the first user story
4. Follow Rule 1: run full multi-tool validation chain after each task

## Git Remotes
```
abady   https://github.com/Abady001/Meter-.git   (upstream, PR destination)
origin  https://github.com/Kirllos360/Meter-.git  (fork)
```

## PRs
- Abady001/Meter- PR #24: T022 — Feature Flags + Multi-Tool Validation + Docs Update (OPEN, MERGEABLE)

## Architecture Entry Points
| File | Purpose |
|---|---|
| `ROUTE_OF_DATA.md` | Full architecture & data flow map |
| `AI_HANDOFF.md` | Complete AI handoff (85 tasks) |
| `AGENTS.md` | Agent instructions + memory logs |
| `documentation/markdown/00-index.md` | Documentation index (240+ files) |

## Commands
```bash
# Backend
cd backend && npm test && npm run build && npm run lint && npx prisma validate

# Frontend
cd Frontend && bun run dev && bun run build && bun run lint --no-cache --max-warnings 0

# Graphify
cd Frontend && graphify query "<objective>" && graphify update .

# Git
git checkout feature/t022-validation-docs
git push origin feature/t022-validation-docs
gh pr create --repo Abady001/Meter- --head Kirllos360:feature/t022-validation-docs --base main
```
