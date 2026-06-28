# Symbiot Integration — Specification

## 1. Purpose

Bridge field meters communicating via the Symbiot SEP (Serial Encapsulation Protocol) to the Meter Verse REST API. The bridge translates meter telegrams into JSON API calls, manages TCP channels, multiplexes HTTP connections, and provides health monitoring with automatic failover.

## 2. Architecture Overview

```
Field Meters ──[SEP]──> Symbiot Bridge ──[HTTPS]──> Meter Verse API
                              │
                    ┌─────────┼─────────┐
                    │         │         │
               [channel 0] ... [channel 9]
               port 5010     port 5019
```

## 3. TCP Channels

| Parameter | Value |
|---|---|
| Number of channels | 10 (0–9) |
| Port range | 5010–5019 |
| Protocol | JSON over TCP |
| Framing | Length-prefixed (4-byte big-endian uint32 + payload) |
| Keepalive | 30s TCP keepalive |
| Max payload | 64 KB |

Each channel operates independently. A channel can be bound to a specific area (per-area deployment) or handle any area (centralized deployment).

## 4. HTTP Multiplexing

| Parameter | Value |
|---|---|
| Max concurrent connections per channel | 100 |
| Connection pool | Keep-alive, 60s idle timeout |
| Request timeout | 30s |
| Retry strategy | 3 retries, exponential backoff (100 ms, 500 ms, 2 s) |
| Circuit breaker | 5 failures → open for 30s |

## 5. Message Protocol

### Framing

```
┌───────────────────────────────┐
│ Length (4 bytes, big-endian)  │
├───────────────────────────────┤
│ JSON payload (variable)       │
└───────────────────────────────┘
```

### Common Message Envelope

```json
{
  "msg_id": "uuid",
  "type": "reading|event|command|response|heartbeat",
  "timestamp": "2026-06-13T12:00:00Z",
  "area_code": "PH-01",
  "payload": { }
}
```

### Reading Message Payload

```json
{
  "meter_id": "MTR-001234",
  "obis_code": "1.8.0",
  "value": 1234.56,
  "unit": "kWh",
  "reading_time": "2026-06-13T12:00:00Z",
  "status": "normal|estimated|error"
}
```

## 6. Security

| Measure | Detail |
|---|---|
| Transport | TLS 1.3 mandatory |
| Certificate | Mutual TLS (mTLS) — bridge presents client cert |
| Authentication | API key in HTTP header `X-Symbiot-Key` |
| Authorization | Scoped to area(s) defined in bridge config |
| Payload encryption | AES-256-GCM for sensitive fields (customer data) |

## 7. Deployment Models

### Per-Area Deployment
- One bridge instance per area database
- Channels 0–4 for readings, 5–6 for events, 7–8 for commands, 9 for management
- Total 10 channels × 100 connections = 1000 concurrent connections

### Centralized Deployment
- One bridge instance serving all areas
- Area routing by `area_code` field in message envelope
- Connection pool partitioned per area

## 8. Health Check

| Parameter | Value |
|---|---|
| Interval | 5s |
| Endpoint | `GET /health` |
| Response | `{"status":"ok","channels":["open",...],"uptime":3600}` |
| Degraded threshold | 3 consecutive failures |
| Dead threshold | 5 consecutive failures (triggers failover) |

## 9. Failover

| Parameter | Value |
|---|---|
| Detection | 15s of missed heartbeats (3 × 5s intervals) |
| Action | Promote standby bridge instance; update DNS/Docker service |
| Recovery | Original primary auto-demoted to standby on rejoin |
| Quarantine | Channel with >10% error rate quarantined automatically |

## 10. Quarantine System

| Parameter | Value |
|---|---|
| Trigger | >10% error rate on channel over 5-minute window |
| Action | Channel closed; all pending messages queued |
| Notification | Alert sent via notification queue |
| Recovery | Manual or automated after 5 minutes of <1% error rate |
