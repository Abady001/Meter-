# Meter Verse — Deployment Standards

## Architecture Overview

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  Frontend   │────▶│   Backend    │────▶│  PostgreSQL  │
│  :3000      │     │  :3001       │     │  :5432       │
│  Next.js    │     │  NestJS      │     │  PG16        │
└─────────────┘     └──────┬───────┘     └─────────────┘
                           │
                           ▼
                    ┌──────────────┐     ┌─────────────┐
                    │ Admin Portal │     │  RabbitMQ    │
                    │  :6262       │     │  :5672       │
                    └──────────────┘     └─────────────┘
```

---

## Docker Compose

### Main File: `Meter/docker-compose.yml`

**Services**:
| Service | Image | Port | Depends On |
|---------|-------|------|------------|
| `db` | postgres:16-alpine | 5432 | — |
| `backend` | Custom (Dockerfile) | 3001 | db (healthy) |
| `frontend` | Custom (Dockerfile) | 3000 | backend |

**Networks**: `meter-verse-net` (bridge)
**Volumes**: `pgdata` (persistent PostgreSQL storage)

### Environment Variables (backend)
| Variable | Default | Description |
|----------|---------|-------------|
| PORT | 3001 | API server port |
| DB_HOST | db | PostgreSQL hostname |
| DB_PORT | 5432 | PostgreSQL port |
| DB_NAME | Meter_Verse_pulse | Database name |
| DB_USER | Meter_Verse_pulse | Database user |
| DB_PASSWORD | Meter_Verse_pulse_dev | Database password |
| DATABASE_URL | postgresql://... | Full Prisma connection string |
| JWT_SECRET | change-me-in-production | JWT signing secret |
| JWT_EXPIRES_IN | 3600 | Access token TTL (seconds) |
| CORS_ORIGIN | http://localhost:3000 | Allowed CORS origins |
| DB_SCHEMA | sim_system | Active Prisma schema |

### Dockerfiles

#### Backend (`Meter/backend/Dockerfile`)
- Multi-stage build: `build` → `production`
- Stage 1: Install deps, run prisma generate, tsc compile
- Stage 2: Copy compiled output and node_modules (production only)
- Health check: `curl -f http://localhost:3001/api/v1/health`

#### Frontend (`Meter/Frontend/Dockerfile`)
- Multi-stage build: `deps` → `build` → `runner`
- Output: `next build` with `output: "standalone"` (minimal deployable unit)
- Static assets served via Next.js built-in server

#### Admin Portal (`Meter/backend/admin-portal/Dockerfile` — if exists)
- Separate admin service on port 6262

---

## Port Allocation

| Service | Port | Purpose |
|---------|------|---------|
| Frontend | 3000 | Next.js web app |
| Backend API | 3001 | NestJS REST API |
| Admin Portal | 6262 | Admin dashboard |
| API Gateway | 4000 | Main API gateway (planned) |
| Sync Gateway | 4001-4009 | Per-area Symbiot sync gateways |
| Admin Console | 4002 | Admin tools |
| DB Admin Tool | 4001 | Database administration |
| PostgreSQL | 5432 | Main database |

---

## Startup Sequence

### run.bat (Root scripts)

1. **start-all.bat** (`Meter/start-all.bat`)
   ```
   start-all.bat → docker-compose up → services start
   ```

2. **run-backend.bat** → Starts NestJS dev server on :3001
3. **run-frontend.bat** → Starts Next.js dev server on :3000
4. **run-dbadmin.bat** → Starts DB admin tool on :4001

### Manual Startup
```bash
# 1. Start PostgreSQL (if not running via Docker)
cd Meter
docker compose up -d db

# 2. Start backend
cd backend
npm run start:dev

# 3. Start frontend (separate terminal)
cd Frontend
bun run dev
```

### Service Installation
```bash
Meter/install-services.bat    # Register as Windows services
Meter/uninstall-services.bat  # Unregister Windows services
```

---

## Key File Paths

| Path | Purpose |
|------|---------|
| `Meter/docker-compose.yml` | Main Docker Compose |
| `Meter/backend/Dockerfile` | Backend image build |
| `Meter/Frontend/Dockerfile` | Frontend image build |
| `Meter/start-all.bat` | Start all services |
| `Meter/stop-all.bat` | Stop all services |
| `Meter/run.bat` | Root run script |
| `Meter/run-backend.bat` | Start backend only |
| `Meter/run-frontend.bat` | Start frontend only |
| `Meter/run-dbadmin.bat` | Start DB admin |
| `Meter/start-dbadmin.bat` | Start DB admin (alternative) |
| `Meter/install-services.bat` | Register Windows services |
| `Meter/uninstall-services.bat` | Unregister Windows services |
| `Meter/vpn-routes.bat` | VPN routing for on-prem resources |
| `Meter/backend/.env` | Backend environment config |
| `Meter/Frontend/.env.local` | Frontend environment config |

---

## Environment Variables Reference

### Backend (.env)
```
# Server
PORT=3001
NODE_ENV=development

# Database
DATABASE_URL=postgresql://Meter_Verse_pulse:Meter_Verse_pulse_dev@localhost:5432/Meter_Verse_pulse?schema=sim_system
DB_HOST=localhost
DB_PORT=5432
DB_NAME=Meter_Verse_pulse
DB_USER=Meter_Verse_pulse
DB_PASSWORD=Meter_Verse_pulse_dev
DB_SCHEMA=sim_system

# JWT
JWT_SECRET=your-jwt-secret-here
JWT_EXPIRES_IN=3600

# CORS
CORS_ORIGIN=http://localhost:3000
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_APP_NAME=Meter Verse
NEXT_PUBLIC_DEFAULT_LOCALE=ar
```

---

## Production Deployment Checklist

### Pre-Deployment
- [ ] JWT_SECRET changed to strong random value
- [ ] DB_PASSWORD changed to strong random value
- [ ] CORS_ORIGIN set to exact frontend domain(s)
- [ ] Helmet CSP configured for production
- [ ] dev-login endpoint disabled
- [ ] Admin SQL tool IP-restricted
- [ ] Rate limiting tuned for production load
- [ ] Memory limits configured in Docker Compose
- [ ] Health checks configured for all services
- [ ] Logging level set to production (error/warn only)
- [ ] SSL/TLS configured for all endpoints
- [ ] Database backup strategy in place
- [ ] Monitoring and alerting configured

### Post-Deployment
- [ ] Smoke tests pass on all endpoints
- [ ] Invoice generation works
- [ ] Payment processing works
- [ ] Sync pipeline works
- [ ] Report generation works
- [ ] All 9 area integrations verified
- [ ] Frontend loads and authenticates

---

## Source Files

| File | Purpose |
|------|---------|
| `Meter/docker-compose.yml` | Main Compose file |
| `Meter/backend/Dockerfile` | Backend image build |
| `Meter/Frontend/Dockerfile` | Frontend image build |
| `Meter/backend/.env` | Backend config |
| `Meter/backend/.env.example` | Backend config template |
| `Meter/Frontend/.env.local` | Frontend config |
| `Meter/Frontend/.env.example` | Frontend config template |
| `Meter/start-all.bat` | Service startup |
| `Meter/stop-all.bat` | Service shutdown |
| `Meter/run-backend.bat` | Backend startup |
| `Meter/run-frontend.bat` | Frontend startup |
| `Meter/MASTER-DEPLOYMENT-GUIDE.md` | Master deployment guide |
| `reporting-engine/Dockerfile` | Reporting engine image |
| `reporting-engine/docker-compose.yml` | Reporting engine Compose |
