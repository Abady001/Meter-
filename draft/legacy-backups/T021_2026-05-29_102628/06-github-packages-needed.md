# Required Tools & Services — Meter Verse

> **Single Source of Truth** — All applications, packages, services, and tools used in this project.
> Includes download URLs, installation steps, and what each is used for.
> Last updated: 2026-05-29 | Project: Meter Verse (Metering & Billing Platform)

---

## Table of Contents
1. [Runtimes & Languages](#1-runtimes--languages)
2. [Package Managers](#2-package-managers)
3. [Frameworks](#3-frameworks)
4. [Frontend Libraries (npm)](#4-frontend-libraries-npm)
5. [Backend Libraries (npm)](#5-backend-libraries-npm)
6. [Database & ORM](#6-database--orm)
7. [Testing](#7-testing)
8. [Linting & Formatting](#8-linting--formatting)
9. [Infrastructure & Containers](#9-infrastructure--containers)
10. [Spec Workflow & Knowledge Tools](#10-spec-workflow--knowledge-tools)
11. [AI & Agent Tools](#11-ai--agent-tools)
12. [External Services (MCP)](#12-external-services-mcp)
13. [Git & CI/CD](#13-git--cicd)
14. [Installation Order (Clean Machine)](#14-installation-order-clean-machine)

---

## 1. Runtimes & Languages

### Node.js
- **Version**: v24.15.0
- **Use**: JavaScript runtime for backend (NestJS) and frontend build tooling
- **GitHub**: https://github.com/nodejs/node
- **Download**: https://nodejs.org/download/release/v24.15.0/
- **Install**: Download installer, run `node -v` to verify
- **In Project**: `backend/` (NestJS) + `Frontend/` (Next.js build)

### Bun
- **Version**: v1.3.14
- **Use**: JavaScript runtime & package manager for frontend (dev, build, lint, test)
- **GitHub**: https://github.com/oven-sh/bun
- **Install**: https://bun.sh/install — `powershell -c "irm bun.sh/install.ps1 | iex"`
- **Verify**: `bun --version`
- **In Project**: All frontend commands — `bun run dev`, `bun run build`, `bun run lint`, `bun run test:smoke`

### TypeScript
- **Version**: ^5.x
- **Use**: Type system for both frontend (Next.js) and backend (NestJS)
- **GitHub**: https://github.com/microsoft/TypeScript
- **Install**: Via npm — `npm install -g typescript` or included in both `package.json`
- **Verify**: `tsc --version`
- **In Project**: All `.ts` and `.tsx` files

### Python
- **Version**: 3.12.13 (can be managed via `uv`)
- **Use**: Runtime for Speckit (specify CLI), Graphify, and open-interpreter
- **GitHub**: https://github.com/python/cpython
- **Download**: https://www.python.org/downloads/release/python-31213/
- **Install via uv**: `uv python install 3.12`
- **Verify**: `python --version` or `uv python list`
- **In Project**: `.venv/` virtual environment, Speckit, Graphify

---

## 2. Package Managers

### npm
- **Version**: 11.12.1 (bundled with Node.js)
- **Use**: Backend package management (`backend/package.json`)
- **Install**: Bundled with Node.js — https://nodejs.org/
- **In Project**: `cd backend && npm install`

### uv
- **Version**: 0.10.8
- **Use**: Python package and project manager (faster than pip)
- **GitHub**: https://github.com/astral-sh/uv
- **Install (Windows)**: `powershell -c "irm https://astral.sh/uv/install.ps1 | iex"`
- **Install (macOS/Linux)**: `curl -LsSf https://astral.sh/uv/install.sh | sh`
- **Verify**: `uv --version`
- **In Project**: Manages Python for Speckit (`uv tool install specify-cli`) and Graphify (`uv tool install graphifyy`)

### pip
- **Version**: Latest (via Python)
- **Use**: Python package installation (fallback when uv unavailable)
- **In Project**: `pip install open-interpreter`

---

## 3. Frameworks

### NestJS
- **Version**: ^10.4.x (runtime), CLI 11.0.21
- **Use**: Backend modular monolith framework (controllers, services, modules)
- **GitHub**: https://github.com/nestjs/nest
- **Install**: `npm install -g @nestjs/cli`
- **Verify**: `nest --version`
- **Repo**: `backend/src/` — auth, audit, common, billing, customers, meters, payments, projects, readings, reports, sim-cards
- **Key packages**: `@nestjs/core`, `@nestjs/common`, `@nestjs/platform-express`, `@nestjs/config`, `@nestjs/jwt`, `@nestjs/passport`, `@nestjs/swagger`, `@nestjs/testing`

### Next.js
- **Version**: 16.2.6
- **Use**: Frontend React framework with SSR/App Router
- **GitHub**: https://github.com/vercel/next.js
- **Install**: Via npm — included in `Frontend/package.json`
- **Verify**: `npx next --version`
- **In Project**: `Frontend/src/app/` — App Router with layout.tsx, page.tsx

### React
- **Version**: ^19.0.0
- **Use**: UI library for frontend components
- **GitHub**: https://github.com/facebook/react
- **Install**: Via npm — included in `Frontend/package.json`
- **In Project**: All frontend components in `Frontend/src/components/`

### Tailwind CSS
- **Version**: ^4.x
- **Use**: Utility-first CSS framework
- **GitHub**: https://github.com/tailwindlabs/tailwindcss
- **Install**: Via npm — included in `Frontend/package.json`
- **In Project**: `Frontend/src/app/globals.css`, `tailwind.config.ts`, all components use Tailwind classes

---

## 4. Frontend Libraries (npm)

All installed via `Frontend/package.json`. Run `cd Frontend && bun install`.

| Library | Version | Purpose | GitHub |
|---|---|---|---|
| **@tanstack/react-query** | ^5.82.0 | Server state / API data fetching hooks | https://github.com/TanStack/query |
| **zustand** | ^5.0.6 | Lightweight client state management | https://github.com/pmndrs/zustand |
| **shadcn/ui** | Latest | Component library (Radix UI primitives) | https://github.com/shadcn-ui/ui |
| **next-auth** | ^4.24.11 | Authentication for Next.js | https://github.com/nextauthjs/next-auth |
| **zod** | ^4.0.2 | Schema validation (forms + API) | https://github.com/colinhacks/zod |
| **react-hook-form** | ^7.60.0 | Performant form handling | https://github.com/react-hook-form/react-hook-form |
| **recharts** | ^2.15.4 | Charting & data visualization | https://github.com/recharts/recharts |
| **framer-motion** | ^12.23.2 | Animation library | https://github.com/framer/motion |
| **lucide-react** | ^0.525.0 | Icon library | https://github.com/lucide-icons/lucide |
| **sonner** | ^2.0.6 | Toast notifications | https://github.com/emilkowalski/sonner |
| **next-themes** | ^0.4.6 | Dark/light mode theme | https://github.com/pacocoursey/next-themes |
| **@dnd-kit/core** | ^6.3.1 | Drag and drop toolkit | https://github.com/clauderic/dnd-kit |
| **@tanstack/react-table** | ^8.21.3 | Table/smart-table logic | https://github.com/TanStack/table |
| **date-fns** | ^4.1.0 | Date formatting utilities | https://github.com/date-fns/date-fns |
| **next-intl** | ^4.3.4 | Internationalization | https://github.com/amannn/next-intl |
| **class-variance-authority** | ^0.7.1 | Component variant management | https://github.com/joe-bell/cva |
| **react-day-picker** | ^9.8.0 | Date picker component | https://github.com/gpbl/react-day-picker |
| **cmdk** | ^1.1.1 | Command menu / autocomplete | https://github.com/pacocoursey/cmdk |
| **vaul** | ^1.1.2 | Drawer component | https://github.com/emilkowalski/vaul |
| **embla-carousel-react** | ^8.6.0 | Carousel | https://github.com/davidjerleke/embla-carousel |
| **react-resizable-panels** | ^3.0.3 | Resizable panel layouts | https://github.com/bvaughn/react-resizable-panels |
| **input-otp** | ^1.4.2 | OTP input component | https://github.com/guilhermerodz/input-otp |
| **z-ai-web-dev-sdk** | ^0.0.18 | AI web development SDK | https://github.com/z-ai/z-ai-web-dev-sdk |
| **react-markdown** | ^10.1.0 | Markdown rendering | https://github.com/remarkjs/react-markdown |
| **react-syntax-highlighter** | ^15.6.1 | Code syntax highlighting | https://github.com/react-syntax-highlighter/react-syntax-highlighter |

---

## 5. Backend Libraries (npm)

All installed via `backend/package.json`. Run `cd backend && npm install`.

| Library | Version | Purpose | GitHub |
|---|---|---|---|
| **@nestjs/core** | ^10.4.x | NestJS core framework | https://github.com/nestjs/nest |
| **@nestjs/common** | ^10.4.x | NestJS common utilities | https://github.com/nestjs/nest |
| **@nestjs/platform-express** | ^10.4.x | Express HTTP adapter | https://github.com/nestjs/nest |
| **@nestjs/config** | ^3.3.0 | Environment configuration | https://github.com/nestjs/config |
| **@nestjs/jwt** | Latest | JWT authentication | https://github.com/nestjs/jwt |
| **@nestjs/passport** | Latest | Passport integration | https://github.com/nestjs/passport |
| **@nestjs/swagger** | ^7.4.2 | OpenAPI/Swagger docs | https://github.com/nestjs/swagger |
| **@nestjs/testing** | ^10.4.x | Test utilities | https://github.com/nestjs/testing |
| **@prisma/client** | ^6.11.1 | Database ORM client | https://github.com/prisma/prisma |
| **passport** | Latest | Auth strategies | https://github.com/jaredhanson/passport |
| **passport-jwt** | Latest | JWT strategy | https://github.com/mikenichols/passport-jwt |
| **class-validator** | Latest | DTO validation | https://github.com/typestack/class-validator |
| **class-transformer** | Latest | Data transformation | https://github.com/typestack/class-transformer |
| **reflect-metadata** | Latest | TypeScript decorators | https://github.com/rbuckton/reflect-metadata |
| **rxjs** | ^7.x | Reactive extensions | https://github.com/ReactiveX/rxjs |
| **swagger-ui-express** | ^5.0.1 | Swagger UI serving | https://github.com/scottie1984/swagger-ui-express |

### Dev Dependencies
| Library | Purpose | GitHub |
|---|---|---|
| **jest** | ^29.7.0 | Unit/integration tests | https://github.com/jestjs/jest |
| **supertest** | Latest | HTTP contract testing | https://github.com/ladjs/supertest |
| **ts-jest** | Latest | TypeScript Jest support | https://github.com/kulshekhar/ts-jest |
| **@types/jest** | Latest | Jest type definitions | https://github.com/DefinitelyTyped/DefinitelyTyped |
| **@types/passport-jwt** | Latest | passport-jwt types | https://github.com/DefinitelyTyped/DefinitelyTyped |
| **@types/supertest** | Latest | supertest types | https://github.com/DefinitelyTyped/DefinitelyTyped |

---

## 6. Database & ORM

### PostgreSQL
- **Version**: 16 (Docker image: `postgres:16-alpine`)
- **Use**: Primary database (database `Meter_Verse_pulse`, schema `sim_system`)
- **GitHub**: https://github.com/postgres/postgres
- **Download**: Docker image — `postgres:16-alpine`
- **Run**: `cd backend && docker compose up -d db`
- **Connection**: `postgresql://Meter_Verse_pulse:Meter_Verse_pulse_dev@127.0.0.1:5432/Meter_Verse_pulse?schema=sim_system`
- **Config**: `backend/docker-compose.yml`, `backend/.env`

### Prisma
- **Version**: ^6.11.1
- **Use**: ORM, schema management, database migrations
- **GitHub**: https://github.com/prisma/prisma
- **Install**: Via npm — `cd backend && npm install prisma @prisma/client`
- **Commands**: `npx prisma validate`, `npx prisma generate`, `npx prisma migrate dev`, `npx prisma migrate deploy`
- **Schema**: `backend/prisma/schema.prisma` (20+ models, 24+ enums, 7 migrations applied)

### SQLite (dev only)
- **Version**: Via Prisma
- **Use**: Local development database for frontend (placeholder)
- **In Project**: `Frontend/prisma/schema.prisma` uses SQLite datasource for dev

---

## 7. Testing

### Jest
- **Version**: ^29.7.0
- **Use**: Unit and integration tests for backend
- **GitHub**: https://github.com/jestjs/jest
- **Install**: Via npm — included in `backend/package.json`
- **Run**: `cd backend && npm test`
- **Results**: 77/77 tests passing (9 suites)
- **Config**: `backend/jest.config.ts`

### Playwright
- **Version**: ^1.60.0
- **Use**: E2E smoke tests for frontend (all pages traversal)
- **GitHub**: https://github.com/microsoft/playwright
- **Install**: `cd Frontend && npx playwright install chromium`
- **Run (full smoke)**: `cd Frontend && bun run test:smoke`
- **Script**: `Frontend/scripts/smoke-all-pages.mjs`
- **Note**: `bunx` spawn fails on Windows (pre-existing issue)

### Supertest
- **Version**: Latest
- **Use**: HTTP contract testing for NestJS APIs (used in Jest tests)
- **GitHub**: https://github.com/ladjs/supertest
- **Install**: Via npm — included in `backend/package.json`

### AJV (contract testing)
- **Version**: ^8.17.x
- **Use**: JSON Schema validation for contract tests against `meter-verse-api.yaml`
- **GitHub**: https://github.com/ajv-validator/ajv
- **Install**: Via npm — `backend/package.json`
- **Related**: `ajv-formats` (format validators), `js-yaml` (YAML parsing)

---

## 8. Linting & Formatting

### ESLint
- **Version**: 8.57.1 (backend) / ^9.x (frontend)
- **Use**: Code linting and static analysis
- **GitHub**: https://github.com/eslint/eslint
- **Backend config**: `backend/.eslintrc.cjs`
- **Frontend config**: `Frontend/eslint.config.mjs`
- **Run backend**: `cd backend && npm run lint`
- **Run frontend**: `cd Frontend && bun run lint --no-cache --max-warnings 0`

### Prettier
- **Version**: ^3.8.3
- **Use**: Code formatting
- **GitHub**: https://github.com/prettier/prettier
- **Config**: `backend/.prettierrc`

---

## 9. Infrastructure & Containers

### Docker
- **Version**: 29.4.2 (Docker Desktop 4.40.1)
- **Use**: Container runtime for local PostgreSQL database
- **GitHub**: https://github.com/docker/docker
- **Download**: https://docs.docker.com/desktop/install/windows-install/
- **Verify**: `docker --version`
- **In Project**: `backend/docker-compose.yml` (PostgreSQL 16)

### Docker Compose
- **Version**: v5.1.3
- **Use**: Container orchestration (DB + future services)
- **GitHub**: https://github.com/docker/compose
- **Install**: Bundled with Docker Desktop
- **Verify**: `docker compose version`
- **Run**: `cd backend && docker compose up -d db`
- **Check**: `docker compose ps`

### WSL (Windows Subsystem for Linux)
- **Version**: 2 (via Docker Desktop relay)
- **Use**: Linux environment for bash scripts (Speckit `.specify/scripts/bash/`)
- **Install**: `wsl --install -d Ubuntu` (from PowerShell as Admin)
- **Note**: Current WSL relay has `execvpe(/bin/bash)` issue — needs Ubuntu distro initialization

---

## 10. Spec Workflow & Knowledge Tools

### Speckit (specify CLI)
- **Version**: v0.8.13
- **Use**: Specification-driven development workflow — creates specs, plans, tasks, tracks implementation
- **GitHub**: https://github.com/github/spec-kit
- **Install**: `uv tool install specify-cli --from git+https://github.com/github/spec-kit.git@v0.8.13`
- **Verify**: `specify --version`
- **In Project**: `.specify/` directory with templates, scripts, memory, workflows
- **Skills**: 9 speckit skills in `.agents/skills/`

### Graphify
- **Version**: 0.8.18
- **Use**: Knowledge graph builder — maps codebase structure for querying instead of grepping
- **GitHub**: https://github.com/safishamsi/graphify
- **Install**: `uv tool install graphifyy` (PyPI name `graphifyy`, CLI command `graphify`)
- **Platform setup**: `graphify install --platform opencode`
- **Verify**: `graphify --version`
- **In Project**: `Frontend/graphify-out/` — 1039 nodes, 2770 edges, 64 communities
- **Usage**: `cd Frontend && graphify query "<objective>"` (always first for frontend tickets)
- **Refresh**: `cd Frontend && graphify update .`

### OpenSpec (fission-ai)
- **Version**: v1.3.1
- **Use**: Specification validation and testing tool
- **Install**: `npm install -g @fission-ai/openspec@latest`
- **Verify**: `openspec --version`
- **GitHub**: https://github.com/fission-ai/openspec
- **Note**: Installed but not yet integrated into testing pipeline

---

## 11. AI & Agent Tools

### open-interpreter
- **Version**: 0.4.3
- **Use**: AI code interpreter for automated testing and code generation
- **GitHub**: https://github.com/open-interpreter/open-interpreter
- **Install**: `pip install open-interpreter`
- **Python**: Requires Python 3.10+
- **Note**: Installation may require long timeout (large dependency tree)

### OpenCode (AI CLI)
- **Version**: Latest
- **Use**: AI coding assistant (the tool running this session)
- **Install**: Via npm or VS Code extension
- **In Project**: `.opencode/` configurations at both root and `Meter-/Frontend/` levels
- **Skills**: graphify, speckit skills loaded via `.agents/skills/`

---

## 12. External Services (MCP)

These are connected via MCP (Model Context Protocol) servers for AI tool integration.

### Notion
- **Use**: Project management, task tracking, documentation
- **MCP Server**: `@notionhq/notion-mcp-server` (configured in `.opencode/integrations/`)
- **Config**: Notion API token required
- **Related docs**: `documentation/markdown/14-mcp-setup.md`

### Odoo
- **Use**: ERP integration (planned)
- **MCP Server**: Odoo MCP server (configured)
- **Note**: Requires Odoo instance URL and API credentials

---

## 13. Git & CI/CD

### Git
- **Version**: Latest
- **Use**: Version control
- **GitHub Remotes**:
  - `abady` → `https://github.com/Abady001/Meter-.git` (upstream, PR destination)
  - `origin` → `https://github.com/Kirllos360/Meter-.git` (fork)
- **Author**: `Kirllos Hany <kirllos.hany@epower.com.eg>`
- **Commit style**: `TXXX: short description` (e.g., `T021: add React Query integration pattern`)

### GitHub CLI (gh)
- **Version**: Latest
- **Use**: Create PRs, manage issues, interact with GitHub from CLI
- **GitHub**: https://github.com/cli/cli
- **Install (Windows)**: `winget install --id GitHub.cli` or https://cli.github.com/
- **Install (macOS)**: `brew install gh`
- **Verify**: `gh --version`
- **Auth**: `gh auth login`
- **In Project**: Used to create PRs — `gh pr create --repo Abady001/Meter- --head Kirllos360:feature/t021-react-query --base main --title "T021: ..."`

### Playwright (for CI)
- **Version**: ^1.60.0
- **Use**: E2E smoke tests in CI pipeline
- **Install**: `cd Frontend && npx playwright install chromium`
- **Run**: `cd Frontend && bun run test:smoke`

---

## 14. Installation Order (Clean Machine)

Install in this order for a fully functioning development environment:

```bash
# 1. Node.js v24.15.0
#    Download from: https://nodejs.org/download/release/v24.15.0/

# 2. Docker Desktop
#    Download from: https://docs.docker.com/desktop/install/windows-install/

# 3. GitHub CLI
#    winget install --id GitHub.cli
#    OR: https://cli.github.com/

# 4. Bun v1.3.14
powershell -c "irm bun.sh/install.ps1 | iex"

# 5. Python 3.12+ via uv
powershell -c "irm https://astral.sh/uv/install.ps1 | iex"
uv python install 3.12

# 6. Speckit
uv tool install specify-cli --from git+https://github.com/github/spec-kit.git@v0.8.13

# 7. Graphify
uv tool install graphifyy
graphify install --platform opencode

# 8. OpenSpec
npm install -g @fission-ai/openspec@latest

# 9. Frontend dependencies
cd Frontend && bun install

# 10. Backend dependencies
cd backend && npm install

# 11. Playwright browser
cd Frontend && npx playwright install chromium

# 12. Start PostgreSQL
cd backend && docker compose up -d db

# 13. Prisma migration
cd backend && npx prisma generate && npx prisma migrate deploy

# 14. Verify everything
cd backend && npm test && npm run build
cd Frontend && bun run lint --no-cache --max-warnings 0 && bun run build
```

---

## Appendix: Related Files

| File | Purpose |
|---|---|
| `documentation/markdown/06-github-packages-needed.md` | **This file** — single source of truth |
| `documentation/text/06-github-packages-needed.txt` | Plain text copy of this document |
| `documentation/text/08-required-apps.txt` | Condensed required apps list |
| `documentation/excel/06-github-packages.csv` | CSV format (tools data) |
| `documentation/pdf/06-github-packages-needed.pdf` | PDF export |
| `Frontend/package.json` | All frontend npm dependencies |
| `backend/package.json` | All backend npm dependencies |
| `documentation/markdown/14-mcp-setup.md` | MCP server setup guide |
| `documentation/markdown/05-programming-languages.md` | Languages used in project |
