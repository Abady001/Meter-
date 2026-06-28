# Meter Verse Core — Data Model

## 1. Core DB Schema (15 tables)

All core tables reside in the `core` schema.

### 1.1 `core.user`

| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK, DEFAULT gen_random_uuid() |
| username | VARCHAR(100) | NOT NULL, UNIQUE |
| email | VARCHAR(255) | NOT NULL, UNIQUE |
| password_hash | VARCHAR(255) | NOT NULL |
| display_name | VARCHAR(200) | NOT NULL |
| phone | VARCHAR(30) | |
| is_active | BOOLEAN | NOT NULL DEFAULT true |
| locale | VARCHAR(5) | NOT NULL DEFAULT 'ar' |
| failed_login_attempts | INT | NOT NULL DEFAULT 0 |
| locked_until | TIMESTAMPTZ | |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT now() |
| updated_at | TIMESTAMPTZ | NOT NULL DEFAULT now() |

**Indexes:** UNIQUE on (username), UNIQUE on (email), INDEX on (is_active)

### 1.2 `core.role`

| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| name | VARCHAR(100) | NOT NULL, UNIQUE |
| description | VARCHAR(500) | |
| is_seeded | BOOLEAN | NOT NULL DEFAULT false |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT now() |

### 1.3 `core.permission`

| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| code | VARCHAR(100) | NOT NULL, UNIQUE |
| label_key | VARCHAR(100) | NOT NULL (i18n key) |
| category | VARCHAR(50) | NOT NULL |

### 1.4 `core.role_permission`

| Column | Type | Constraints |
|---|---|---|
| role_id | UUID | PK, FK → core.role.id |
| permission_id | UUID | PK, FK → core.permission.id |

### 1.5 `core.area`

| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| code | VARCHAR(20) | NOT NULL, UNIQUE |
| name_key | VARCHAR(100) | NOT NULL (i18n key) |
| db_connection_string | VARCHAR(500) | |
| is_active | BOOLEAN | NOT NULL DEFAULT true |
| availability_plan | VARCHAR(20) | NOT NULL DEFAULT 'Safety' |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT now() |

### 1.6 `core.project`

| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| name | VARCHAR(200) | NOT NULL |
| code | VARCHAR(20) | NOT NULL, UNIQUE |
| description | TEXT | |
| is_active | BOOLEAN | NOT NULL DEFAULT true |

### 1.7 `core.project_area`

| Column | Type | Constraints |
|---|---|---|
| project_id | UUID | PK, FK → core.project.id |
| area_id | UUID | PK, FK → core.area.id |

### 1.8 `core.user_area`

| Column | Type | Constraints |
|---|---|---|
| user_id | UUID | PK, FK → core.user.id |
| area_id | UUID | PK, FK → core.area.id |

### 1.9 `core.user_role`

| Column | Type | Constraints |
|---|---|---|
| user_id | UUID | PK, FK → core.user.id |
| role_id | UUID | PK, FK → core.role.id |

### 1.10 `core.audit_log`

| Column | Type | Constraints |
|---|---|---|
| id | BIGSERIAL | PK |
| user_id | UUID | FK → core.user.id |
| action | VARCHAR(50) | NOT NULL |
| entity_type | VARCHAR(100) | NOT NULL |
| entity_id | VARCHAR(50) | |
| old_values | JSONB | |
| new_values | JSONB | |
| area_id | UUID | FK → core.area.id |
| ip_address | INET | |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT now() |

**Indexes:** INDEX on (entity_type, entity_id), INDEX on (created_at), INDEX on (area_id), PARTITION BY RANGE (created_at)

### 1.11 `core.system_config`

| Column | Type | Constraints |
|---|---|---|
| key | VARCHAR(200) | PK |
| value | TEXT | NOT NULL |
| description | VARCHAR(500) | |
| updated_at | TIMESTAMPTZ | NOT NULL DEFAULT now() |

### 1.12 `core.notification_queue`

| Column | Type | Constraints |
|---|---|---|
| id | BIGSERIAL | PK |
| channel | VARCHAR(20) | NOT NULL (email/sms/push) |
| recipient | VARCHAR(255) | NOT NULL |
| subject_key | VARCHAR(100) | NOT NULL (i18n key) |
| params | JSONB | |
| status | VARCHAR(20) | NOT NULL DEFAULT 'pending' |
| retry_count | INT | NOT NULL DEFAULT 0 |
| next_attempt_at | TIMESTAMPTZ | |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT now() |

**Indexes:** INDEX on (status, next_attempt_at)

### 1.13 `core.bank_account`

| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| payment_center_id | UUID | FK → core.payment_center.id |
| bank_name | VARCHAR(200) | NOT NULL |
| account_holder | VARCHAR(200) | NOT NULL |
| iban | VARCHAR(34) | NOT NULL |
| swift | VARCHAR(11) | |
| currency | VARCHAR(3) | NOT NULL DEFAULT 'EGP' |
| is_active | BOOLEAN | NOT NULL DEFAULT true |

### 1.14 `core.payment_center`

| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| code | VARCHAR(20) | NOT NULL, UNIQUE |
| name_key | VARCHAR(100) | NOT NULL |
| area_id | UUID | FK → core.area.id |
| collection_methods | VARCHAR[] | NOT NULL |
| is_active | BOOLEAN | NOT NULL DEFAULT true |
| address | TEXT | |
| contact_phone | VARCHAR(30) | |

### 1.15 `core.holiday`

| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| area_id | UUID | FK → core.area.id |
| date | DATE | NOT NULL |
| name_key | VARCHAR(100) | NOT NULL |
| is_recurring | BOOLEAN | NOT NULL DEFAULT false |
| UNIQUE (area_id, date) | | |

### 1.16 `core.location_zone`

| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| area_id | UUID | FK → core.area.id |
| parent_id | UUID | FK → core.location_zone.id |
| code | VARCHAR(20) | NOT NULL |
| name_key | VARCHAR(100) | NOT NULL |
| zone_level | INT | NOT NULL (1=Zone, 2=SubZone, 3=District) |

### 1.17 `core.unit_type`

| Column | Type | Constraints |
|---|---|---|
| code | VARCHAR(10) | PK |
| name_key | VARCHAR(100) | NOT NULL |
| symbol | VARCHAR(10) | NOT NULL |
| category | VARCHAR(50) | (electricity/water/gas) |

### 1.18 `core.customer_group`

| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| area_id | UUID | FK → core.area.id |
| code | VARCHAR(20) | NOT NULL |
| name_key | VARCHAR(100) | NOT NULL |
| discount_pct | DECIMAL(5,2) | DEFAULT 0 |

### 1.19 `core.settlement`

| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| area_id | UUID | FK → core.area.id |
| period_start | DATE | NOT NULL |
| period_end | DATE | NOT NULL |
| status | VARCHAR(20) | NOT NULL DEFAULT 'draft' |
| total_consumption | DECIMAL(18,4) | |
| total_billed | DECIMAL(18,2) | |
| total_collected | DECIMAL(18,2) | |
| run_by | UUID | FK → core.user.id |
| run_at | TIMESTAMPTZ | |
| notes | TEXT | |

### 1.20 `core.i18n`

| Column | Type | Constraints |
|---|---|---|
| key | VARCHAR(100) | NOT NULL |
| locale | VARCHAR(5) | NOT NULL |
| value | TEXT | NOT NULL |
| deprecated | BOOLEAN | NOT NULL DEFAULT false |
| PRIMARY KEY (key, locale) | | |

---

## 2. Features DB Schema (10 tables)

All feature tables reside in the `features` schema.

| # | Table | Description | FK References |
|---|---|---|---|
| 1 | consumer | End customer record | core.area.id |
| 2 | meter | Physical meter device | features.consumer.id, core.unit_type.code |
| 3 | meter_reading | Meter reading (index value + timestamp) | features.meter.id |
| 4 | invoice | Billed invoice | features.consumer.id, core.settlement.id |
| 5 | payment | Payment transaction | features.invoice.id, core.payment_center.id |
| 6 | ledger | General ledger entry | features.consumer.id, features.invoice.id |
| 7 | tariff | Tariff definition | core.area.id, core.unit_type.code |
| 8 | rate_plan | Rate tier within tariff | features.tariff.id |
| 9 | disconnect_order | Disconnect/reconnect order | features.meter.id |
| 10 | complaint | Customer complaint | features.consumer.id |

---

## 3. Area DB Template (45 tables)

Each Area database is created from a template. Below is the complete list:

| # | Table | Description |
|---|---|---|
| 1 | consumer | Same as features.consumer (materialized locally) |
| 2 | consumer_contact | Phone, email, address per consumer |
| 3 | consumer_document | Uploaded documents (ID, contract, etc.) |
| 4 | consumer_history | Status changes for consumer |
| 5 | meter | Same as features.meter |
| 6 | meter_model | Make/model/capacity of meters |
| 7 | meter_status | Current status (active/inactive/defective/removed) |
| 8 | meter_seal | Seal records for meter |
| 9 | meter_history | Installation, removal, maintenance events |
| 10 | meter_reading | Same as features.meter_reading |
| 11 | reading_route | Route definition (zone → order) |
| 12 | reading_route_assignment | Reader assigned to route per period |
| 13 | reading_validation | Validation rules applied to readings |
| 14 | reading_estimate | Estimated readings when actual not available |
| 15 | invoice | Same as features.invoice |
| 16 | invoice_line_item | Individual charges on an invoice |
| 17 | invoice_tax | Tax breakdown per invoice |
| 18 | invoice_history | Status changes for invoice |
| 19 | payment | Same as features.payment |
| 20 | payment_allocation | Allocation of payment to invoice line items |
| 21 | payment_method | Cash/POS/bank transfer/online |
| 22 | payment_batch | Batch of payments for reconciliation |
| 23 | ledger | Same as features.ledger |
| 24 | ledger_account | Chart of accounts |
| 25 | ledger_entry | Individual debit/credit entry |
| 26 | tariff | Same as features.tariff |
| 27 | tariff_rate | Rate tiers (block/consumption-based) |
| 28 | tariff_charge | Fixed charges, service fees |
| 29 | tariff_exemption | Exemptions per customer group |
| 30 | disconnect_order | Same as features.disconnect_order |
| 31 | disconnect_technician | Technician assignment to order |
| 32 | disconnect_verification | Before/after photo verification |
| 33 | complaint | Same as features.complaint |
| 34 | complaint_action | Follow-up actions on complaint |
| 35 | complaint_escalation | Escalation history |
| 36 | contract | Consumer service contract |
| 37 | contract_term | Term conditions and penalties |
| 38 | deposit | Security deposit tracking |
| 39 | deposit_refund | Deposit refund transaction |
| 40 | subsidy | Government/social subsidy |
| 41 | subsidy_allocation | Allocation per consumer |
| 42 | reconciliation | Bank/payment reconciliation record |
| 43 | reconciliation_item | Individual reconciled item |
| 44 | write_off | Bad debt write-off |
| 45 | audit_log | Area-scoped audit log (same structure as core) |

### CREATE TABLE Pseudocode (Key Tables)

```sql
-- core.user
CREATE TABLE core.user (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(200) NOT NULL,
    phone VARCHAR(30),
    is_active BOOLEAN NOT NULL DEFAULT true,
    locale VARCHAR(5) NOT NULL DEFAULT 'ar',
    failed_login_attempts INT NOT NULL DEFAULT 0,
    locked_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_user_username UNIQUE (username),
    CONSTRAINT uq_user_email UNIQUE (email)
);

-- core.audit_log (partitioned)
CREATE TABLE core.audit_log (
    id BIGSERIAL,
    user_id UUID REFERENCES core.user(id),
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(50),
    old_values JSONB,
    new_values JSONB,
    area_id UUID REFERENCES core.area(id),
    ip_address INET,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
) PARTITION BY RANGE (created_at);

-- features.consumer
CREATE TABLE features.consumer (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    area_id UUID NOT NULL REFERENCES core.area(id),
    code VARCHAR(30) NOT NULL,
    full_name VARCHAR(200) NOT NULL,
    customer_group_id UUID REFERENCES core.customer_group(id),
    location_zone_id UUID REFERENCES core.location_zone(id),
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    is_metered BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_consumer_code UNIQUE (area_id, code)
);

-- area template: invoice_line_item
CREATE TABLE area.invoice_line_item (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES area.invoice(id),
    description VARCHAR(500),
    quantity DECIMAL(12,4) NOT NULL,
    unit_price DECIMAL(18,6) NOT NULL,
    amount DECIMAL(18,2) NOT NULL,
    tariff_rate_id UUID REFERENCES area.tariff_rate(id),
    sort_order INT NOT NULL DEFAULT 0
);
```
