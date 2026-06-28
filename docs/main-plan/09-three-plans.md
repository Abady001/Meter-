# Meter Verse — 3-Plan Deployment Architecture

## Plan A: Main (Full Production)
**Always running — the primary system**

```
                    ┌──────────────┐
                    │   Internet   │
                    └──────┬───────┘
                           │ HTTPS :443
                    ┌──────▼───────┐
                    │   Nginx SSL  │
                    │  (Linux/Ubuntu 22.04)
                    └──────┬───────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
     ┌────────▼───┐ ┌─────▼──────┐ ┌───▼────────┐
     │ Next.js FE  │ │ NestJS API │ │  Symbiot   │
     │ :3000       │ │ :3001      │ │ Bridge     │
     │ (Linux)     │ │ (Linux)    │ │ (Windows)  │
     └─────────────┘ └─────┬──────┘ └───┬────────┘
                           │            │
                    ┌──────▼────────────▼──┐
                    │   PostgreSQL Cluster │
                    │   core + features    │
                    │   + 15 area schemas  │
                    │   (Linux)            │
                    └─────────────────────┘
```

### Components
- **Frontend:** Next.js 16 standalone, Linux, Bun runtime
- **Backend:** NestJS API, Linux, Node 20+
- **Database:** PostgreSQL 16, Linux, multi-schema
- **Bridge:** Symbiot (10 TCP × 100 HTTP), Windows Server
- **Caching:** Redis (session, rate limit, query cache)
- **Monitoring:** Sentry + Prometheus + Grafana

### RPO/RTO
- RPO: <15 min (WAL streaming backup every 15 min)
- RTO: <2 hours (full restore from backup)
- Recovery: Automated failover to Plan B

---

## Plan B: Safety (Degraded Mode)
**Activated when Plan A has partial failure**

```
                    ┌──────────────┐
                    │   Internet   │
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │   Nginx SSL  │
                    └──────┬───────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
     ┌────────▼───┐ ┌─────▼──────┐    │
     │ Next.js FE  │ │ NestJS API │    │
     │ :3000       │ │ :3001      │    │
     │ (Linux)     │ │ Safety Mode│    │
     └─────────────┘ └─────┬──────┘    │
                           │           │
                    ┌──────▼──────┐    │
                    │ PostgreSQL  │    │
                    │ core + area │    │
                    │ (read-only) │    │
                    │ NO billing  │    │
                    │ NO features │    │
                    └─────────────┘    │
                                       │
                              ┌────────▼────┐
                              │ Symbiot     │
                              │ (read-only) │
                              │ meter fetch │
                              └─────────────┘
```

### When to activate
- Billing module failure
- Features DB corruption
- Invoice/Payment service down
- Normal operations within 5 min

### What's disabled
- Invoice generation, issue, adjustments
- Payment recording and reversal
- Tariff management
- Report generation
- Feature updates

### What still works
- Dashboard (read-only KPIs from cache)
- Customer and meter viewing
- Reading ingestion (readings stored, not billed)
- Meter assignment/termination
- SIM management
- Search

---

## Plan C: Failover (Emergency Read-Only)
**Last resort — keep system alive during catastrophic failure**

```
                    ┌──────────────┐
                    │   Internet   │
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │   Nginx SSL  │
                    └──────┬───────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
     ┌────────▼───┐ ┌─────▼──────┐    │
     │ Next.js FE  │ │ NestJS API │    │
     │ :3000       │ │ Failover   │    │
     │ (Linux)     │ │ Mode       │    │
     └─────────────┘ └─────┬──────┘    │
                           │           │
                    ┌──────▼──────┐    │
                    │  Redis      │    │
                    │  Cache      │    │
                    │  (last snap)│    │
                    └─────────────┘    │
                                       │
                              ┌────────▼────┐
                              │ PostgreSQL  │
                              │ core only   │
                              │ (read-only) │
                              │ warm standby│
                              └─────────────┘
```

### When to activate
- Full database outage
- Both Plan A and Plan B unavailable
- Disaster recovery scenario

### What still works
- Dashboard (cached KPIs, stale data)
- Customer lookup (cached)
- Basic meter information (cached)

### What's disabled
- ALL writes (readings cannot be submitted)
- ALL billing operations
- Meter assignment
- Payment recording

---

## Platform Support

### Linux (Ubuntu 22.04 LTS)
- NestJS API server
- Next.js frontend server
- PostgreSQL 16
- Redis cache
- Nginx reverse proxy
- Prometheus + Grafana monitoring
- Docker containers (preferred)

### Windows Server (2019/2022)
- Symbiot Bridge (10 TCP × 100 HTTP)
- WinService wrapper for auto-restart
- SEP2 communication client
- Windows Event Log integration

### Backup Strategy
| Backup Type | Frequency | Retention | Location |
|------------|-----------|-----------|----------|
| WAL archive | Continuous | 7 days | Local disk + S3 |
| Full DB | Daily | 30 days | S3 |
| Transaction log | Every 15 min | 24 hours | Local disk |
| Config files | On change | 90 days | Git + S3 |

### Monitoring Alerts
| Alert | Threshold | Action |
|-------|-----------|--------|
| API 5xx rate | > 1% in 5 min | Notify + check Plan B |
| DB connection pool | > 80% | Scale connections |
| Disk space | < 20% free | Clean WAL + notify |
| SSL cert expiry | < 30 days | Renew |
| Page load time | > 3s P95 | Check CDN + API |
