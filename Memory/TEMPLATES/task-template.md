# Task XXX — Title

## Goal
One-line purpose of this task.

## Scope
What this task covers and explicitly does NOT cover.

## Business Rules
- Rule 1
- Rule 2

## Architecture Rules
- Must not break area isolation
- Must not write to Symbiot
- All mutations need audit + idempotency

## Database Rules
- Prisma ORM only
- UUID PK + timestamps on new tables
- Indexes on all FK columns

## Backend Rules
- New endpoints need area guard + rate limiting
- POST/PUT/PATCH/DELETE need audit interceptor
- Validate inputs with class-validator

## Frontend Rules
- Use apiClient (not raw fetch)
- Add loading state
- Add error state
- No console.log in production code

## Security Rules
- Sanitize all user inputs
- No secrets in code
- CSRF token on mutations

## Performance Rules
- Paginate list endpoints
- Add DB indexes for new queries
- No N+1 queries

## Validation Checklist
- [ ] Backend build passes
- [ ] Frontend build passes
- [ ] ESLint 0 errors
- [ ] No dead code introduced
- [ ] No console errors
- [ ] No duplicate routes
- [ ] No broken CRUD
- [ ] No cross-area leakage
- [ ] No RBAC regression
- [ ] Documentation updated
- [ ] CHANGELOG updated
- [ ] CodeQL clean (if applicable)

## Git
- Branch: `feature/pXXX-task-name`
- Commit: `type(module): description`
- Push: `origin` (Kirllos360/Meter) + `mete` (Kirllos360/Mete)

## Rollback
- Code: `git revert <sha>`
- DB: Flyway undo if migration added
