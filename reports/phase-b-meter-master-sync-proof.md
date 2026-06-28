# PHASE B — METER MASTER SYNC PROOF

**Date:** 2026-06-25

## Files Created

| File | Purpose |
|------|---------|
| `backend/src/sync/sync-orchestrator.service.ts` | Sync engine — calls gateways, flattens EAV, upserts meters |
| `backend/src/sync/sync.controller.ts` | REST API: `POST /sync/meters/:areaCode`, `POST /sync/meters/all`, `GET /sync/status/:areaCode` |
| `backend/src/sync/sync.module.ts` | NestJS module registration |

## Files Modified

| File | Change |
|------|--------|
| `backend/src/app.module.ts` | Added SyncModule to imports |

## Architecture

Meter Verse (port 3001)
  ↓ POST /sync/meters/october
SyncOrchestratorService
  ↓ HTTP GET http://127.0.0.1:4001/api/v1/sync/october/meters
Gateway Instance (port 4001)
  ↓ HTTP GET http://10.50.30.2:9999/devices (Symbiot)
  ↓ EAV flattening (DeviceAttr → flat object)
SyncOrchestratorService
  ↓ upsertMeter()
PostgreSQL (meter_pulse.sim_system.meters)

## EAV Flattening

| Symbiot AttrName | Meter Verse Field |
|-------------------|-------------------|
| SerialNumber | `serialNumber` |
| MeterType | `meterType` (mapped: Electric→electricity, Water→water) |
| Manufacturer | `brand` |
| Model | `model` |
| Status | `status` (mapped: Active→active, Inactive→inactive) |
| PhaseType | `phaseType` |
| AmpRating | `ampRating` |
| InstallationDate | `installationDate` |

## API Endpoints

| Method | Path | Role | Description |
|--------|------|------|-------------|
| POST | `/api/v1/sync/meters/:areaCode` | ADMIN, SUPER_ADMIN | Sync one area |
| POST | `/api/v1/sync/meters/all` | SUPER_ADMIN | Sync all 9 areas |
| GET | `/api/v1/sync/status/:areaCode` | ADMIN, SUPER_ADMIN | Check gateway health |

## READ-ONLY Guarantee
The sync service uses **HTTP GET only** to communicate with gateways. No SQL is executed against source systems. No database connections to Symbiot or Billing.
