# T011 — Wire API Versioning + OpenAPI

## Prompt
Full implementation prompt for T011 as specified by Speckit workflow.

## Key Requirements
- Global API prefix `/api/v1` via `app.setGlobalPrefix()`
- Swagger/OpenAPI UI at `/api/v1/docs`
- OpenAPI JSON at `/api/v1/docs-json`
- Reusable `openapi.setup.ts` helper
- Future-version-safe architecture

## Dependencies Satisfied
- T001 (NestJS scaffold) — backend running
- T006 (ErrorEnvelope) — global filter compatible

## Files Created
- backend/src/common/openapi/openapi.setup.ts

## Files Modified
- backend/src/main.ts (global prefix + Swagger setup)
- backend/package.json (+ @nestjs/swagger, swagger-ui-express)
- backend/package-lock.json

## Validation Results
- npm run build: clean
- npm test: 69/69 passing
- Server startup: successful
- curl /api/v1/health: {"status":"ok"}
- curl /api/v1/docs-json: valid OpenAPI 3.0 JSON
- curl /api/v1/docs: HTTP 200 (Swagger UI)

## Date
2026-05-26
