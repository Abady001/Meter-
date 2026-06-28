# Meter Verse — Git Workflow

## Repositories

| Repository | URL | Purpose |
|------------|-----|---------|
| **Meter** (main) | `https://github.com/Kirllos360/Meter` | Primary development repo — backend + frontend + config |
| **Mete** (mirror) | `https://github.com/Kirllos360/Mete` | Secondary mirror — push to BOTH repos on every commit |

**Author**: Kirllos Hany <kirllos.hany@epower.com.eg>

---

## Branch Naming Convention

```
feature/{txxx}-{kebab-case-task-name}
```

### Examples
- `feature/t005-postgres-docker`
- `feature/t009-auth-rbac`
- `feature/t018-audit-reports`
- `feature/t021-react-query`

### Branch Types
| Prefix | Purpose | Base Branch |
|--------|---------|-------------|
| `feature/` | New features and improvements | `main` |
| `fix/` | Bug fixes | `main` |
| `hotfix/` | Critical production fixes | `main` |
| `refactor/` | Code restructuring | `main` |
| `docs/` | Documentation updates | `main` |

---

## Commit Convention (Conventional Commits)

### Format
```
{type}({scope}): {description}
```

### Types
| Type | Usage |
|------|-------|
| `feat` | New feature |
| `fix` | Bug fix |
| `refactor` | Code restructuring |
| `docs` | Documentation |
| `security` | Security fix |
| `test` | Test addition/modification |
| `chore` | Build, CI, dependencies |
| `build` | Build system changes |
| `perf` | Performance improvement |
| `style` | Formatting only |

### Scopes
| Scope | Description |
|-------|-------------|
| `backend` | NestJS API changes |
| `frontend` | Next.js UI changes |
| `auth` | Authentication/authorization |
| `billing` | Billing engine |
| `sync` | Symbiot integration |
| `db` | Database schema/migrations |
| `reports` | Reporting engine |
| `ci` | CI/CD configuration |
| `docs` | Documentation |
| `config` | Configuration |

### Examples
```
feat(backend): add invoice PDF generation with Puppeteer
fix(backend): correct tariff tier calculation for zero-consumption
feat(frontend): add meter activation workflow page
refactor(auth): extract password policy to separate service
security(backend): add CSRF double-submit cookie protection
test(backend): add contract tests for meter assignment
build(ci): configure GitHub Actions for multi-stage build
docs: update API documentation for billing endpoints
```

---

## Commit Rules

### Before Every Commit (Validation Gate)
1. Run backend build: `cd backend && npm run build`
2. Run backend tests: `cd backend && npm test`
3. Run backend lint: `cd backend && npm run lint`
4. Run frontend build: `cd Frontend && bun run build`
5. Run frontend lint: `cd Frontend && bun run lint --no-cache --max-warnings 0`
6. Validate Prisma: `cd backend && npx prisma validate`
7. Run security scan: `cd backend && npx semgrep --config=auto`

### Commit Message Rules
- Present tense, imperative mood ("add feature" not "added feature")
- First line: max 72 characters
- Body: wrap at 72 characters, explain what and why, not how
- Footer: reference issues/tasks (e.g., `T005`, `Closes #42`)

### What NOT to Commit
- `.env` files (any environment)
- `*.db` files
- `.next/` directories
- `node_modules/` directories
- `dist/` directories
- `graphify-out/cache/` directories
- Workspace archives (`*.zip`, `*.rar`)
- IDE configuration (`.vscode/`, `.idea/`)
- Log files (`*.log`)

---

## Push Strategy

### Dual Push Required
Every commit must be pushed to BOTH repositories:

```bash
git push origin <branch>       # Push to Kirllos360/Meter
git push mete <branch>         # Push to Kirllos360/Mete
```

### Remote Configuration
```bash
git remote add origin https://github.com/Kirllos360/Meter.git
git remote add mete https://github.com/Kirllos360/Mete.git
```

---

## Changelog

### Format (`CHANGELOG.md` in `Meter/`)
```markdown
# Changelog

## [Unreleased]

### Added
- T005 — PostgreSQL Docker Compose setup
- T009 — JWT auth + RBAC with 16 roles
- T010 — Append-only audit log with SHA-256

### Fixed
- N/A

### Changed
- Updated documentation index

### Security
- CSRF double-submit cookie protection
```

---

## Task Tracking

### Commit-to-Task Linking
Each commit message MUST reference the task number:
```
feat(backend): implement meter activation workflow (T033)
```

### Branch-to-Task Linking
Each branch targets a specific task:
```
feature/t033-meter-activation
```

---

## Workflow Example

### Normal Feature Flow
```bash
# 1. Create branch
git checkout -b feature/t050-invoice-pdf

# 2. Make changes, stage, commit
git add backend/src/invoices/
git commit -m "feat(backend): add invoice PDF rendering via Puppeteer

- InvoiceRendererService with Puppeteer + pdfkit fallback
- HTML invoice template with RTL Arabic layout
- Batch PDF generation with ZIP archiving

T050"

# 3. Run validation gate
cd backend && npm run build && npm test && npm run lint
cd ../Frontend && bun run build && bun run lint

# 4. Push to BOTH repos
git push origin feature/t050-invoice-pdf
git push mete feature/t050-invoice-pdf

# 5. Create PR on GitHub (if applicable)
# 6. After review, merge to main
git checkout main
git merge feature/t050-invoice-pdf
git push origin main
git push mete main

# 7. Update CHANGELOG.md
```

---

## Source Files

| File | Purpose |
|------|---------|
| `Meter/CHANGELOG.md` | Release changelog |
| `Meter/.gitignore` | Ignore rules (node_modules, .next, .env, dist, *.db, *.log, graphify-out/cache/) |
| `Meter/.husky/` | Git hooks (pre-commit validation planned) |
