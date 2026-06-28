# Symbiot Integration — Implementation Plan

## T091 — Symbiot Bridge

**Dependencies:** T086 (Core DB), T088 (Area DB Template)

---

### Phase 1: TCP Channel Manager

| Task | Detail |
|---|---|
| **Files to create** | `bridge/src/ChannelManager.cs` — manages lifecycle of 10 TCP listeners |
| | `bridge/src/TcpChannel.cs` — single channel (port, accept loop, framing) |
| | `bridge/src/FrameCodec.cs` — 4-byte length prefix encode/decode |
| | `bridge/src/MessageEnvelope.cs` — JSON envelope model |
| **Tests** | `bridge/tests/ChannelManagerTests.cs`, `bridge/tests/FrameCodecTests.cs` |
| **Acceptance** | 10 channels start on ports 5010–5019; client can connect and exchange framed JSON messages |
| **Validation** | `Test-NetConnection -ComputerName localhost -Port 5010` succeeds for all 10 ports |

---

### Phase 2: HTTP Multiplexing

| Task | Detail |
|---|---|
| **Files to create** | `bridge/src/HttpConnectionPool.cs` — pool of 100 connections per channel |
| | `bridge/src/MeterVerseClient.cs` — HTTP client targeting Meter Verse API |
| | `bridge/src/MessageRouter.cs` — dispatches incoming messages to the correct endpoint |
| | `bridge/src/CircuitBreaker.cs` — 5-failure circuit breaker |
| **Tests** | `bridge/tests/HttpPoolTests.cs`, `bridge/tests/CircuitBreakerTests.cs` |
| **Acceptance** | 100 concurrent HTTP requests per channel succeed; circuit breaker opens after 5 failures |
| **Validation** | Load test with 500 concurrent virtual meters; verify p99 < 200 ms |

---

### Phase 3: Health Check + Failover

| Task | Detail |
|---|---|
| **Files to create** | `bridge/src/HealthService.cs` — 5s heartbeat loop |
| | `bridge/src/FailoverService.cs` — monitors health, promotes/demotes instances |
| | `bridge/src/LeaderElection.cs` — distributed lock for primary election |
| | `bridge/src/HealthEndpoint.cs` — `GET /health` HTTP endpoint |
| **Tests** | `bridge/tests/HealthServiceTests.cs`, `bridge/tests/FailoverServiceTests.cs` |
| **Acceptance** | Health endpoint returns status within 5s; failover completes in < 15s |
| **Validation** | Kill primary process; measure time for standby to become primary |

---

### Phase 4: Quarantine System

| Task | Detail |
|---|---|
| **Files to create** | `bridge/src/QuarantineService.cs` — monitors error rates, quarantines channels |
| | `bridge/src/QuarantineStore.cs` — stores quarantine records in bridge DB |
| | `bridge/src/ChannelMetrics.cs` — sliding window error rate calculation |
| **Tests** | `bridge/tests/QuarantineServiceTests.cs` |
| **Acceptance** | Channel with >10% errors quarantined within 5-minute window; automatic recovery when error rate drops |
| **Validation** | Inject 15% error rate on a channel; verify quarantine flag; reduce to 0% and verify auto-recovery |

---

### Phase 5: Windows Service Packaging

| Task | Detail |
|---|---|
| **Files to create** | `bridge/setup/symbiot-bridge.wxs` — WiX installer |
| | `bridge/setup/symbiot-bridge.xml` — Windows service config |
| | `deploy/symbiot/install.ps1` — install script |
| **Tests** | Manual smoke test on Windows Server 2022 |
| **Acceptance** | Service installs, starts, stops, and uninstalls cleanly; logs to Windows Event Log |
| **Validation** | `Get-Service SymbiotBridge` returns Running |

---

### Phase 6: Deployment + Testing

| Task | Detail |
|---|---|
| **Files to create** | `deploy/symbiot/docker-compose.yml` — centralized deployment |
| | `deploy/symbiot/per-area.yml` — per-area deployment |
| | `bridge/tests/LoadTest.ps1` — PowerShell load test script |
| **Tests** | 24-hour soak test with simulated meter traffic |
| **Acceptance** | 10M messages processed with < 0.1% error rate; failover < 15s |
| **Validation** | Review metrics dashboard (channel throughput, error rate, latency) |
