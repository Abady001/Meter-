# METER VERSE — PRODUCTION DEPLOYMENT GUIDE

## Startup

```bash
# 1. Database
# Option A: Docker
docker compose up -d db

# Option B: Local PostgreSQL
# Ensure PostgreSQL 16 is running on port 5432/5433

# 2. Backend
cd backend
set ADMIN_USER=admin
set ADMIN_PASS=<secure_password>
npx prisma migrate deploy
npm run build
node dist/src/main.js          # Port 3001

# 3. Frontend
cd Frontend
npx next build
npx next start -p 3000         # Port 3000

# 4. DB Admin (optional)
cd backend
set ADMIN_USER=admin
set ADMIN_PASS=<secure_password>
node db-admin-server.js        # Port 4001
```

## Windows Services

Three services in services.msc:
- `meter-verse-backend` — Port 3001 (auto-start)
- `meter-verse-frontend` — Port 3000 (auto-start)
- `postgresql` — Port 5432 (existing)

Install: Right-click `install-services.ps1` → Run with PowerShell

## Docker

```bash
cd backend
docker compose build
docker compose up -d
# 5 containers: db, backend, backend-migrate, frontend, db-admin
```

## Environment Variables

Backend: `DATABASE_URL`, `JWT_SECRET`, `ADMIN_USER`, `ADMIN_PASS`
Frontend: `NEXT_PUBLIC_API_URL`

## Backup

Daily: `pg_dump -U meter_pulse meter_pulse > backup_$(date).sql`
Retention: Daily 7d, Weekly 4w, Monthly 12m
