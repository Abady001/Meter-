# Meter Verse — Windows Services Setup

## Overview

Three services in Windows Services (services.msc):

| Service Name | Display Name | Port | Description |
|-------------|--------------|------|-------------|
| `postgresql` | PostgreSQL Server 16 | 5432/5433 | Database |
| `meter-verse-backend` | Meter Verse Backend | 3001 | NestJS API |
| `meter-verse-frontend` | Meter Verse Frontend | 3000 | Next.js Site |

## Prerequisites

- Node.js 20+ installed
- PostgreSQL 16 installed as Windows service
- Backend built: `cd backend && npm run build`
- Frontend built: `cd Frontend && npx next build`

## Installation

**Run as Administrator:**

```cmd
D:\meter\Meter\install-services.bat
```

This will:
1. Verify PostgreSQL service is running
2. Install `meter-verse-backend` (auto-start)
3. Install `meter-verse-frontend` (auto-start)

## Management

### Via Command Line

```cmd
net start meter-verse-backend
net stop  meter-verse-backend
net start meter-verse-frontend
net stop  meter-verse-frontend
```

### Via Windows GUI

1. Press `Win + R`, type `services.msc`
2. Find `Meter Verse Backend` and `Meter Verse Frontend`
3. Right-click → Start / Stop / Restart

### Startup Type

Both services are set to `Automatic` — they start with Windows.

To change: `services.msc` → Right-click service → Properties → Startup type

## Uninstallation

**Run as Administrator:**

```cmd
D:\meter\Meter\uninstall-services.bat
```

## Troubleshooting

### Service won't start

Check the wrapper logs:

```cmd
# Backend
cd D:\meter\Meter\backend
node dist\src\main.js

# Frontend  
cd D:\meter\Meter\Frontend
npx next start -p 3000
```

Run these manually to see any error messages.

### Port conflicts

| Port | Service | Check with |
|------|---------|------------|
| 3000 | Frontend | `netstat -ano \| findstr :3000` |
| 3001 | Backend | `netstat -ano \| findstr :3001` |
| 5432 | Database | `netstat -ano \| findstr :5432` |

### Logs

Windows Services log to the System Event Viewer:
- `Event Viewer` → `Windows Logs` → `System`
- Filter by Source: `Service Control Manager`

## Files

| File | Purpose |
|------|---------|
| `install-services.bat` | Install all 3 services |
| `uninstall-services.bat` | Remove Meter Verse services |
| `run-backend.bat` | Backend wrapper (auto-created) |
| `run-frontend.bat` | Frontend wrapper (auto-created) |
