# Symbiot Integration — Data Model

All bridge tables reside in the `bridge` schema of the Core DB.

## 1. `bridge.channel`

| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK, DEFAULT gen_random_uuid() |
| port | INT | NOT NULL, UNIQUE |
| status | VARCHAR(20) | NOT NULL DEFAULT 'stopped' (stopped/running/quarantined/failed) |
| area_id | UUID | FK → core.area.id (nullable, NULL = any area) |
| last_heartbeat | TIMESTAMPTZ | |
| error_count | BIGINT | NOT NULL DEFAULT 0 |
| message_count | BIGINT | NOT NULL DEFAULT 0 |
| error_rate | DECIMAL(5,2) | sliding window percentage |
| quarantined_at | TIMESTAMPTZ | |
| quarantine_reason | TEXT | |
| started_at | TIMESTAMPTZ | |
| stopped_at | TIMESTAMPTZ | |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT now() |

**Indexes:** INDEX on (status), INDEX on (area_id), INDEX on (port)

## 2. `bridge.message`

| Column | Type | Constraints |
|---|---|---|
| id | BIGSERIAL | PK |
| channel_id | UUID | NOT NULL, FK → bridge.channel.id |
| msg_id | UUID | NOT NULL, UNIQUE |
| direction | VARCHAR(10) | NOT NULL (inbound/outbound) |
| type | VARCHAR(20) | NOT NULL (reading/event/command/response/heartbeat) |
| area_code | VARCHAR(20) | |
| payload | JSONB | NOT NULL |
| raw_frame | BYTEA | original framed message |
| http_status | INT | HTTP response status (outbound only) |
| error | TEXT | error message if failed |
| processing_ms | INT | milliseconds to process |
| status | VARCHAR(20) | NOT NULL DEFAULT 'received' (received/forwarded/succeeded/failed/quarantined) |
| retry_count | INT | NOT NULL DEFAULT 0 |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT now() |

**Indexes:** INDEX on (channel_id, created_at DESC), INDEX on (status), INDEX on (msg_id), INDEX on (created_at)

## 3. `bridge.quarantine_record`

| Column | Type | Constraints |
|---|---|---|
| id | BIGSERIAL | PK |
| channel_id | UUID | FK → bridge.channel.id |
| message_id | BIGINT | FK → bridge.message.id |
| raw_payload | JSONB | NOT NULL |
| error | TEXT | NOT NULL |
| error_code | VARCHAR(50) | (parse_error/timeout/auth_failure/rate_limit) |
| received_at | TIMESTAMPTZ | NOT NULL DEFAULT now() |
| resolved_at | TIMESTAMPTZ | |
| resolved_by | VARCHAR(100) | |
| resolution | VARCHAR(50) | (reprocessed/discarded/manual) |

**Indexes:** INDEX on (channel_id), INDEX on (received_at), INDEX on (resolved_at)

## 4. `bridge.config`

| Column | Type | Constraints |
|---|---|---|
| key | VARCHAR(200) | PK |
| value | TEXT | NOT NULL |
| description | VARCHAR(500) | |
| updated_at | TIMESTAMPTZ | NOT NULL DEFAULT now() |

### Seeded Config Keys

| Key | Default | Description |
|---|---|---|
| tls_enabled | true | Enable TLS 1.3 |
| tls_cert_path | ./certs/symbiot.crt | Server certificate path |
| tls_key_path | ./certs/symbiot.key | Server private key path |
| tls_ca_path | ./certs/ca.crt | CA certificate for mTLS |
| api_base_url | https://meter-verse.local/api | Target Meter Verse API URL |
| api_key | | API key for authentication |
| health_interval_seconds | 5 | Health check interval |
| failover_timeout_seconds | 15 | Failover detection timeout |
| quarantine_error_threshold | 10.0 | Error rate % that triggers quarantine |
| quarantine_window_minutes | 5 | Sliding window for error rate |
| max_connections_per_channel | 100 | Max concurrent HTTP connections |
| request_timeout_seconds | 30 | HTTP request timeout |
| circuit_breaker_threshold | 5 | Failures before circuit opens |
| circuit_breaker_reset_seconds | 30 | Time before circuit resets |
| retry_max_attempts | 3 | Max retry attempts |
| retry_base_delay_ms | 100 | Initial retry delay |
| log_level | Info | Logging level |
| deployment_model | centralized | centralized or per-area |

### CREATE TABLE Pseudocode

```sql
CREATE SCHEMA IF NOT EXISTS bridge;

CREATE TABLE bridge.channel (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    port INT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'stopped',
    area_id UUID REFERENCES core.area(id),
    last_heartbeat TIMESTAMPTZ,
    error_count BIGINT NOT NULL DEFAULT 0,
    message_count BIGINT NOT NULL DEFAULT 0,
    error_rate DECIMAL(5,2) DEFAULT 0,
    quarantined_at TIMESTAMPTZ,
    quarantine_reason TEXT,
    started_at TIMESTAMPTZ,
    stopped_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_channel_port UNIQUE (port)
);

CREATE INDEX idx_channel_status ON bridge.channel(status);
CREATE INDEX idx_channel_area ON bridge.channel(area_id);

CREATE TABLE bridge.message (
    id BIGSERIAL PRIMARY KEY,
    channel_id UUID NOT NULL REFERENCES bridge.channel(id),
    msg_id UUID NOT NULL,
    direction VARCHAR(10) NOT NULL,
    type VARCHAR(20) NOT NULL,
    area_code VARCHAR(20),
    payload JSONB NOT NULL,
    raw_frame BYTEA,
    http_status INT,
    error TEXT,
    processing_ms INT,
    status VARCHAR(20) NOT NULL DEFAULT 'received',
    retry_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_message_msg_id UNIQUE (msg_id)
);

CREATE INDEX idx_message_channel_time ON bridge.message(channel_id, created_at DESC);
CREATE INDEX idx_message_status ON bridge.message(status);
CREATE INDEX idx_message_created ON bridge.message(created_at);

CREATE TABLE bridge.quarantine_record (
    id BIGSERIAL PRIMARY KEY,
    channel_id UUID REFERENCES bridge.channel(id),
    message_id BIGINT REFERENCES bridge.message(id),
    raw_payload JSONB NOT NULL,
    error TEXT NOT NULL,
    error_code VARCHAR(50),
    received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    resolved_at TIMESTAMPTZ,
    resolved_by VARCHAR(100),
    resolution VARCHAR(50)
);

CREATE INDEX idx_quarantine_channel ON bridge.quarantine_record(channel_id);
CREATE INDEX idx_quarantine_received ON bridge.quarantine_record(received_at);

CREATE TABLE bridge.config (
    key VARCHAR(200) PRIMARY KEY,
    value TEXT NOT NULL,
    description VARCHAR(500),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```
