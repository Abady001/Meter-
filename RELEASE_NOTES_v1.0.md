# Meter Verse v1.0.0-pilot

## Overview
First pilot release of Meter Verse — unified utility metering and billing platform replacing SBill and Collection System.

## What's Included
- Complete billing pipeline: readings → consumption → tariff → invoice → payment → ledger
- Customer lifecycle management with ownership transfer
- Meter lifecycle: 7 utility types, assign/terminate/replace, phase/amp/diameter
- Wallet engine with credit/debit/transfer
- 44 operational reports with CSV export
- Enterprise KPI dashboards (executive, collections, utilities)
- Smart search with Arabic language support
- Role-based access control with 16 roles
- Database administration UI on port 4001

## Architecture
- Backend: NestJS + Prisma ORM (PostgreSQL 16)
- Frontend: Next.js 16 + React 19 + Tailwind v4
- Auth: JWT with bcrypt, refresh tokens, progressive lockout
- Audit: Hash-chained append-only log
- Security: Helmet, rate limiting, CORS, input validation

## Deployment
- Docker: `docker compose up -d` (5 containers)
- Windows: `install-services.ps1` as Administrator
- Manual: See `docs/PRODUCTION_DEPLOYMENT_GUIDE.md`

## Requirements
- Node.js 20+
- PostgreSQL 16
- Docker 24+ (optional)

## Known Issues
1. JWT stored in localStorage — httpOnly cookie migration planned for v1.1
2. No CI/CD pipeline — manual deployment only
3. Data migration from SBill not yet executed
4. 15 per-area schemas not yet replicated

## Repository
- GitHub: https://github.com/Kirllos360/Meter
- Branch: `release/v1.0-pilot`
