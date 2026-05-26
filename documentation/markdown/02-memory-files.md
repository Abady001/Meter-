# Memory Files — Meter Pulse

> All agent memory files: AGENTS.md, Speckit constitution, skills, OpenCode config, Graphify.
> Last updated: 2026-05-26

---

## Key Memory Files

| File | Purpose | Last Updated |
|------|---------|-------------|
| `AGENTS.md` | Agent session memory log | 2026-05-26 (T009) |
| `prompt-history_T009.md` | T009 implementation prompt | 2026-05-26 |
| `.specify/memory/constitution.md` | Speckit constitution (template) | N/A |

---

## AGENTS.md Contents

### T009 — Implement Auth (JWT) + RBAC guard + role model

- **Story**: Foundational
- **Status**: Complete
- **What changed**: Created auth module with JWT strategy, RolesGuard, Roles decorator, role enum (7 roles), JWT payload interfaces, global validation pipe
- **Files**: `src/auth/*.ts`, `test/auth/*.ts`, `src/main.ts`, `src/app.module.ts`, `package.json`, `tsconfig.json`, `.eslintrc.cjs`, `.env`, `.env.example`
- **Validation**: 31 tests passing, tsc clean, eslint clean
- **Frontend roles verified**: super_admin, project_admin, operator, technician, finance, support, customer
- **Next task**: T010
