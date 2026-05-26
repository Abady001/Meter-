# T009 — Implement Auth (JWT) + RBAC guard + role model

## Prompt
Full implementation prompt for T009 as specified by Speckit workflow.

## Key Requirements
- JWT authentication with Passport
- RBAC guard with Reflector metadata
- Roles decorator
- Role enum matching frontend (7 roles)
- JWT payload: sub, userId, role, projectScope
- Global validation pipe (whitelist, forbidNonWhitelisted, transform)
- Project-scope claim (FR-015)
- No login controller, no refresh tokens, no OAuth

## Files Created
- backend/src/auth/types/role.enum.ts
- backend/src/auth/types/index.ts
- backend/src/auth/interfaces/jwt-payload.interface.ts
- backend/src/auth/interfaces/request-with-user.interface.ts
- backend/src/auth/interfaces/index.ts
- backend/src/auth/constants/jwt.constants.ts
- backend/src/auth/constants/index.ts
- backend/src/auth/roles.decorator.ts
- backend/src/auth/jwt.strategy.ts
- backend/src/auth/roles.guard.ts
- backend/src/auth/auth.module.ts
- backend/test/auth/roles.guard.spec.ts
- backend/test/auth/jwt.strategy.spec.ts
- backend/test/auth/roles.decorator.spec.ts

## Files Modified
- backend/src/app.module.ts (import AuthModule)
- backend/src/main.ts (add global ValidationPipe)
- backend/package.json (add deps)
- backend/tsconfig.json (add jest types)
- backend/.eslintrc.cjs (add test/ to ignorePatterns)
- backend/.env (add JWT_SECRET, JWT_EXPIRES_IN)
- backend/.env.example (add placeholders)

## Validation Results
- npm test: 31/31 passing
- npm run build: clean
- npm run lint: clean

## Date
2026-05-26
