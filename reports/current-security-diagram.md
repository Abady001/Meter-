# METER VERSE — SECURITY DIAGRAM

**Date:** 2026-06-25

---

```mermaid
flowchart TB
    USER[User Browser]
    LOGIN[Login Page]
    JWT[JWT Token Issue]
    
    subgraph "AUTHENTICATION GATE"
        AUTHG[AuthGuard - JWT Validation]
        ROLES[@Roles() Decorator]
    end

    subgraph "ACCESS CONTROL"
        AREA[UserAccessService - Area Resolution]
        PROJECT[ProjectAccessGuard]
        INTERCEPTOR[ProjectAccessInterceptor]
    end

    subgraph "REQUEST PIPELINE"
        REQ[HTTP Request]
        MIDDLEWARE[AccessContextMiddleware]
        ROUTE[Route Handler]
        RESP[HTTP Response]
    end

    subgraph "DATA ACCESS"
        PRISMA[Prisma ORM]
        DB[(PostgreSQL)]
    end

    USER -->|1. POST /auth/login| LOGIN
    LOGIN -->|2. Validate credentials| AUTHG
    AUTHG -->|3. Query CoreUserRoleAssignment| DB
    DB -->|4. Return role + areas| AUTHG
    AUTHG -->|5. Sign JWT| JWT
    JWT -->|6. Return token| USER

    USER -->|7. Request with Bearer token| REQ
    REQ -->|8. Validate JWT| AUTHG
    AUTHG -->|9. Attach user to request| MIDDLEWARE
    MIDDLEWARE -->|10. Resolve areas+projects| AREA
    AREA -->|11. Attach userAccess| MIDDLEWARE
    MIDDLEWARE -->|12. Forward| ROUTE
    ROUTE -->|13. Check @Roles()| ROLES
    ROUTE -->|14. Validate projectId| PROJECT
    PROJECT -->|15. Check x-area-id header| INTERCEPTOR
    INTERCEPTOR -->|16. Allow/Deny| ROUTE
    ROUTE -->|17. Prisma query| PRISMA
    PRISMA --> DB
    ROUTE --> RESP
```

## SECURITY LAYERS

| Layer | Protection | Bypass |
|-------|-----------|--------|
| JWT | Token forgery | Private key in env |
| bcrypt | Password cracking | 12 salt rounds |
| Role guard | Unauthorized access | Super Admin override |
| Project interceptor | Cross-project data leak | None |
| Area middleware | Wrong-area access | None |
| CORS | Cross-origin attacks | Restricted to frontend URL |
| Parameterized queries | SQL injection | Prisma default |
| Auto-escaping | XSS | Next.js default |

## READ-ONLY GUARANTEES FOR SOURCE SYSTEMS

```
Sync Gateway:  GET /api/v1/... only
              All other HTTP methods → 405 Method Not Allowed
              No SQL drivers installed
              No database credentials stored
              No triggers, jobs, or procedures executed
              Source credentials in .env only, never in code
```
