# U1 — COMPLETE SYSTEM DISCOVERY

**Date**: 2026-06-18
**Target**: نظام التحصيلات + SBill ecosystem

## Reference Systems Discovered

| # | System | Files | Technology | Purpose |
|---|--------|-------|-----------|---------|
| 1 | **Symbiot** | 5,977 | Iskraemeco 3.16 (C#/Angular) | AMI/MDM — meter communication backbone |
| 2 | **SBill** | 893 | Java/Spring Boot + SQL Server | Billing system (Palm Hills + Estates) |
| 3 | **Collection System** | 560 | Flask 3.1 + PostgreSQL | Billing & collections tracker |
| 4 | **Meter Department** | 150+ | Office docs | Operational tariff & meter data |
| 5 | **Energy 360** | 100+ | Mobile app | Customer portal + mobile reading |
| 6 | **IMS** | 27 | HTML/CSS/JS | Internal management system |
| 7 | **All Last Update** | 100+ | Mixed | Latest system updates |

## Current Platform (نظام التحصيلات)
| Layer | Technology | Status |
|-------|-----------|--------|
| Backend | NestJS + Prisma + PostgreSQL | Running (port 3001) |
| Frontend | Next.js 16 + React 19 + Tailwind | Running (port 3000) |
| Database | 4 schemas, 119 tables | Applied (12 migrations) |
| Auth | JWT + 16-profile RBAC | Implemented |
| Git | `feature/t055-payments-contract` | `0e7954e` pushed |

## Key Architecture Drivers
1. **15+2 database pattern**: 15 area DBs + 1 core + 1 features
2. **Symbiot bridge**: 10 TCP × 100 HTTP multiplex
3. **3 availability plans**: Full, Safety, Failover
4. **16 user profiles**: Defined but 9 unused in controllers
5. **7 reference systems**: All converging into one platform
