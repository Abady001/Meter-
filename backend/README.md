# Meter Pulse — Backend

NestJS + PostgreSQL + Prisma ORM

## Prerequisites

- Docker Desktop (Windows/macOS) or Docker Engine (Linux)
- Node.js >= 20

## Database

### Start PostgreSQL

```bash
cd backend
docker compose up -d db
```

### Check status

```bash
docker compose ps
```

Expected output:

```
NAME              IMAGE               COMMAND                  SERVICE   STATUS        PORTS
meter-pulse-db    postgres:16-alpine  "docker-entrypoint.s…"   db        running (healthy)   0.0.0.0:5432->5432/tcp
```

### Stop PostgreSQL

```bash
docker compose down
```

### Reset (destroy data)

```bash
docker compose down -v
docker compose up -d db
```

### Default connection

```
Host:     127.0.0.1
Port:     5432
Database: meter_pulse
User:     meter_pulse
Password: meter_pulse_dev
Schema:   sim_system
```

### Custom port

Set `DB_PORT` in `.env` or pass inline:

```bash
DB_PORT=5433 docker compose up -d db
```
