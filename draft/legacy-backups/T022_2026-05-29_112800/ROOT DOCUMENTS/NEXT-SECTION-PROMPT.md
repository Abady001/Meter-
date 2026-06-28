# Next Section — Sprint 0 Continued

## Prerequisites
All T001-T020 complete and validated. Read `MASTER-DEPLOYMENT-GUIDE.md` and `T001-T020-FINISHED-TASKS.md` first.

## Start Here

```
Task: T021 — FE-002 React Query Integration Pattern
Depends on: T020 (API client foundation at Frontend/src/lib/api/)
Files to create:
  - Frontend/src/lib/api/query-client.tsx  (QueryClientProvider setup)
  - Frontend/src/hooks/                   (convention: use-*.ts)
Acceptance Criteria:
  - Reusable query/mutation hook pattern documented in code
  - Standardized loading/error/empty UI components
  - At least 1 list page + 1 detail page use server data hooks
Validation:
  cd Frontend && graphify query "react query hooks + loading/error/empty standards"
  bun run lint && bun run build
Risk:
  - Provider placement must not break SSR/hydration in Next.js 16
  - Additive only — no app-shell changes
```

## Quick Reference
```bash
cd Frontend && graphify query "<objective>"   # Always first
cd Frontend && graphify update .               # After changes
cd Frontend && bun run lint --no-cache --max-warnings 0
cd Frontend && bun run build
git commit -m "T021: description" --author="Kirllos Hany <kirllos.hany@epower.com.eg>"
git push origin feature/t021-react-query
gh pr create --repo Abady001/Meter- --head Kirllos360:feature/t021-react-query --base main --title "T021: ..."
```

## Existing API Client (to consume)
- `@/lib/api/apiGet<T>()`, `apiPost<T>()`, etc. — typed fetch wrappers
- `@/lib/api/ApiError` — normalized error class
- `@/lib/api/getAuthHeaders()` — token injection
- `@/lib/api/refreshToken()` — token refresh hook
- `@/lib/api/ErrorEnvelope` — `{ code, message, details?, correlationId }`
