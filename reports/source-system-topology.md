# Source System Topology — Sync Gateway Instances

**Date:** 2026-06-25  
**Scope:** All 9 gateway instances under `backend/sync-gateway/instances/`

---

## Topology Table

| # | Instance | Area | Gateway Port | Symbiot URL | Symbiot IP | Symbiot Path | Billing URL | Billing IP |
|---|---|---|---|---|---|---|---|---|
| 1 | `gateway-4001-october` | october | **4001** | `http://10.50.30.2/PalmHills_October/api` | 10.50.30.2 | `/PalmHills_October/api` | `http://10.50.30.2:9999/api` | 10.50.30.2:9999 |
| 2 | `gateway-4002-new_cairo` | new_cairo | **4002** | `http://10.50.30.2/PalmHills_NewCairo/api` | 10.50.30.2 | `/PalmHills_NewCairo/api` | `http://10.50.30.2:9090/api` | 10.50.30.2:9090 |
| 3 | `gateway-4003-sodic_ednc` | sodic_ednc | **4003** | `http://10.50.30.2/SODIC/api` | 10.50.30.2 | `/SODIC/api` | `http://10.50.30.2:9191/api` | 10.50.30.2:9191 |
| 4 | `gateway-4004-uvenus_mall` | uvenus_mall | **4004** | `http://10.50.30.4/ABRAJ_UVENUS/api` | 10.50.30.4 | `/ABRAJ_UVENUS/api` | `http://10.50.30.4:9191/api` | 10.50.30.4:9191 |
| 5 | `gateway-4005-badya` | badya | **4005** | `http://10.50.30.5/Badya/api` | 10.50.30.5 | `/Badya/api` | `http://10.50.30.5:9090/api` | 10.50.30.5:9090 |
| 6 | `gateway-4006-bo_island` | bo_island | **4006** | `http://10.50.30.5/BO-Island/api` | 10.50.30.5 | `/BO-Island/api` | `http://10.50.30.5:9999/api` | 10.50.30.5:9999 |
| 7 | `gateway-4007-estates` | estates | **4007** | `http://10.50.30.5/Estates/api` | 10.50.30.5 | `/Estates/api` | `http://10.50.30.5:9000/api` | 10.50.30.5:9000 |
| 8 | `gateway-4008-sodic_vye` | sodic_vye | **4008** | `http://10.50.30.5/Sodic-VYE/api` | 10.50.30.5 | `/Sodic-VYE/api` | `http://10.50.30.5:9909/api` | 10.50.30.5:9909 |
| 9 | `gateway-4009-chillout` | chillout | **4009** | `http://10.50.30.5/Chillout/api` | 10.50.30.5 | `/Chillout/api` | `http://10.50.30.5:9990/api` | 10.50.30.5:9990 |

---

## Cluster Map

### Cluster A — 10.50.30.2 (3 areas)
```
October     → Symbiot: /PalmHills_October     Billing: :9999
New Cairo   → Symbiot: /PalmHills_NewCairo    Billing: :9090
Sodic EDNC  → Symbiot: /SODIC                 Billing: :9191
```

### Cluster B — 10.50.30.4 (1 area)
```
U Venus Mall → Symbiot: /ABRAJ_UVENUS         Billing: :9191
```

### Cluster C — 10.50.30.5 (5 areas)
```
Badya       → Symbiot: /Badya                  Billing: :9090
BO Island   → Symbiot: /BO-Island              Billing: :9999
Estates     → Symbiot: /Estates                Billing: :9000
Sodic VYE   → Symbiot: /Sodic-VYE              Billing: :9909
Chillout    → Symbiot: /Chillout               Billing: :9990
```

---

## Orchestrator

| Role | Port | Route |
|---|---|---|
| Orchestrator | **4000** | Routes `/api/v1/sync/:area/*` to individual gateways |

---

## Credential Summary (All Instances)

| Credential | Value |
|---|---|
| SYMBIOT_USER | `admin` (all 9) |
| SYMBIOT_PASS | `admin` (all 9) |
| BILLING_USER | `admin` (all 9) |
| BILLING_PASS | `iskra` (6 instances) or `admin` (3 instances) |

---

## Network Diagram

```
                         ┌─────────────┐
                         │ Orchestrator │ :4000
                         └──────┬──────┘
              ┌─────────────────┼─────────────────────┐
              │                 │                     │
    ┌─────────┴─────────┐     ...         ┌──────────┴──────────┐
    │ Gateway 4001      │                 │ Gateway 4009       │
    │ october           │                 │ chillout           │
    └─────────┬─────────┘                 └──────────┬──────────┘
              │                                      │
    ┌─────────┴─────────┐                  ┌─────────┴─────────┐
    │ Symbiot           │                  │ Symbiot           │
    │ 10.50.30.2        │                  │ 10.50.30.5        │
    │ PalmHills_October │                  │ Chillout          │
    └───────────────────┘                  └───────────────────┘
```
