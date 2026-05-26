-- ============================================================================
-- Meter Pulse — PostgreSQL Database Schema (DDL)
-- Source: specs/001-metering-billing-platform/data-model.md
-- 20 entities: Core, Assignments, Readings, Billing, Financial, Audit, Reports
-- Generated: 2026-05-26
-- ============================================================================
-- Modeling Conventions:
--   - UUID primary keys for all entities
--   - UTC timestamps throughout
--   - created_at / updated_at / created_by / updated_by on mutable entities
--   - Append-only for financial & audit entities
-- ============================================================================

-- ============================================================================
-- ENUM TYPES
-- ============================================================================

CREATE TYPE project_status AS ENUM ('active', 'inactive');
CREATE TYPE water_difference_mode AS ENUM ('billable', 'report_only');
CREATE TYPE location_node_type AS ENUM ('zone', 'building', 'floor', 'unit');
CREATE TYPE node_status AS ENUM ('active', 'inactive');
CREATE TYPE customer_type AS ENUM ('individual', 'company', 'tenant', 'owner');
CREATE TYPE customer_status AS ENUM ('active', 'inactive');
CREATE TYPE meter_type AS ENUM ('electricity', 'water_main', 'water_child');
CREATE TYPE meter_status AS ENUM ('available', 'assigned', 'active', 'offline', 'faulty', 'replaced', 'terminated', 'retired');
CREATE TYPE sim_ip_type AS ENUM ('static', 'dynamic');
CREATE TYPE sim_status AS ENUM ('available', 'assigned', 'active', 'suspended', 'old', 'reusable', 'retired');
CREATE TYPE assignment_status AS ENUM ('active', 'ended');
CREATE TYPE reading_source AS ENUM ('manual', 'import', 'automatic');
CREATE TYPE reading_status AS ENUM ('valid', 'pending_review', 'estimated', 'suspicious', 'corrected', 'rejected');
CREATE TYPE review_action AS ENUM ('approve', 'reject', 'correct');
CREATE TYPE tariff_status AS ENUM ('draft', 'active', 'retired');
CREATE TYPE billing_period_status AS ENUM ('open', 'in_review', 'closed');
CREATE TYPE invoice_status AS ENUM ('draft', 'pending_approval', 'issued', 'partially_paid', 'paid', 'overdue', 'cancelled');
CREATE TYPE utility_type AS ENUM ('electricity', 'water');
CREATE TYPE adjustment_type AS ENUM ('credit', 'debit');
CREATE TYPE payment_method AS ENUM ('cash', 'bank_transfer', 'card', 'online', 'cheque', 'wallet');
CREATE TYPE payment_status AS ENUM ('pending', 'confirmed', 'reversed', 'cancelled');
CREATE TYPE ledger_entry_type AS ENUM ('invoice_charge', 'adjustment_debit', 'adjustment_credit', 'payment_credit', 'payment_reversal');
CREATE TYPE ledger_reference_type AS ENUM ('invoice', 'payment', 'adjustment');
CREATE TYPE report_format AS ENUM ('csv', 'xlsx', 'pdf');
CREATE TYPE report_status AS ENUM ('queued', 'running', 'completed', 'failed', 'expired');

-- ============================================================================
-- 1. Project
-- ============================================================================
CREATE TABLE "Project" (
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code                        VARCHAR(100) NOT NULL,
    name                        VARCHAR(255) NOT NULL,
    status                      project_status NOT NULL DEFAULT 'active',
    tax_enabled                 BOOLEAN NOT NULL DEFAULT FALSE,
    tax_rate                    DECIMAL(5,4),
    reading_threshold_profile_id UUID,
    water_difference_mode       water_difference_mode NOT NULL DEFAULT 'report_only',
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by                  UUID NOT NULL,
    updated_by                  UUID NOT NULL,
    CONSTRAINT uq_project_code UNIQUE (code)
);

-- ============================================================================
-- 2. LocationNode
-- ============================================================================
CREATE TABLE "LocationNode" (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id  UUID NOT NULL REFERENCES "Project"(id) ON DELETE CASCADE,
    parent_id   UUID REFERENCES "LocationNode"(id) ON DELETE SET NULL,
    node_type   location_node_type NOT NULL,
    code        VARCHAR(100) NOT NULL,
    name        VARCHAR(255) NOT NULL,
    status      node_status NOT NULL DEFAULT 'active',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by  UUID NOT NULL,
    updated_by  UUID NOT NULL,
    CONSTRAINT uq_location_project_type_code UNIQUE (project_id, node_type, code)
);

CREATE INDEX idx_location_node_project ON "LocationNode"(project_id);
CREATE INDEX idx_location_node_parent ON "LocationNode"(parent_id);

-- ============================================================================
-- 3. Customer
-- ============================================================================
CREATE TABLE "Customer" (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id              UUID NOT NULL REFERENCES "Project"(id) ON DELETE CASCADE,
    customer_code           VARCHAR(100) NOT NULL,
    name                    VARCHAR(255) NOT NULL,
    phone                   VARCHAR(50),
    email                   VARCHAR(255),
    customer_type           customer_type NOT NULL DEFAULT 'individual',
    national_or_commercial_id VARCHAR(100),
    status                  customer_status NOT NULL DEFAULT 'active',
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by              UUID NOT NULL,
    updated_by              UUID NOT NULL,
    CONSTRAINT uq_customer_code_project UNIQUE (project_id, customer_code)
);

CREATE INDEX idx_customer_project ON "Customer"(project_id);

-- ============================================================================
-- 4. CustomerUnitAssignment
-- ============================================================================
CREATE TABLE "CustomerUnitAssignment" (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES "Customer"(id) ON DELETE CASCADE,
    unit_id     UUID NOT NULL REFERENCES "LocationNode"(id) ON DELETE CASCADE,
    start_at    TIMESTAMPTZ NOT NULL,
    end_at      TIMESTAMPTZ,
    reason      VARCHAR(500) NOT NULL DEFAULT '',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by  UUID NOT NULL,
    updated_by  UUID NOT NULL,
    CONSTRAINT chk_cua_dates CHECK (end_at IS NULL OR end_at > start_at)
);

CREATE UNIQUE INDEX uq_cua_active ON "CustomerUnitAssignment"(customer_id, unit_id) WHERE end_at IS NULL;
CREATE INDEX idx_cua_customer ON "CustomerUnitAssignment"(customer_id);
CREATE INDEX idx_cua_unit ON "CustomerUnitAssignment"(unit_id);

-- ============================================================================
-- 5. Meter
-- ============================================================================
CREATE TABLE "Meter" (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    serial_number         VARCHAR(100) NOT NULL,
    meter_type            meter_type NOT NULL,
    brand                 VARCHAR(100) NOT NULL DEFAULT '',
    model                 VARCHAR(100) NOT NULL DEFAULT '',
    status                meter_status NOT NULL DEFAULT 'available',
    installation_date     DATE NOT NULL,
    activation_date       DATE NOT NULL,
    termination_date      DATE,
    project_id            UUID NOT NULL REFERENCES "Project"(id) ON DELETE CASCADE,
    location_id           UUID REFERENCES "LocationNode"(id) ON DELETE SET NULL,
    parent_main_meter_id  UUID REFERENCES "Meter"(id) ON DELETE SET NULL,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by            UUID NOT NULL,
    updated_by            UUID NOT NULL,
    CONSTRAINT uq_meter_serial UNIQUE (serial_number),
    CONSTRAINT chk_meter_child_parent CHECK (
        (meter_type = 'water_child' AND parent_main_meter_id IS NOT NULL) OR
        (meter_type != 'water_child')
    )
);

CREATE INDEX idx_meter_project ON "Meter"(project_id);
CREATE INDEX idx_meter_location ON "Meter"(location_id);
CREATE INDEX idx_meter_parent ON "Meter"(parent_main_meter_id);
CREATE INDEX idx_meter_status ON "Meter"(status);

-- ============================================================================
-- 6. SIMCard
-- ============================================================================
CREATE TABLE "SIMCard" (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    iccid         VARCHAR(50) NOT NULL,
    msisdn        VARCHAR(50) NOT NULL DEFAULT '',
    provider      VARCHAR(100) NOT NULL DEFAULT '',
    ip_address    VARCHAR(45) NOT NULL DEFAULT '',
    ip_type       sim_ip_type NOT NULL DEFAULT 'dynamic',
    status        sim_status NOT NULL DEFAULT 'available',
    cooldown_until TIMESTAMPTZ,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by    UUID NOT NULL,
    updated_by    UUID NOT NULL,
    CONSTRAINT uq_sim_iccid UNIQUE (iccid)
);

CREATE INDEX idx_sim_status ON "SIMCard"(status);

-- ============================================================================
-- 7. MeterAssignment
-- ============================================================================
CREATE TABLE "MeterAssignment" (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meter_id      UUID NOT NULL REFERENCES "Meter"(id) ON DELETE CASCADE,
    customer_id   UUID NOT NULL REFERENCES "Customer"(id) ON DELETE CASCADE,
    unit_id       UUID NOT NULL REFERENCES "LocationNode"(id) ON DELETE CASCADE,
    project_id    UUID NOT NULL REFERENCES "Project"(id) ON DELETE CASCADE,
    start_at      TIMESTAMPTZ NOT NULL,
    end_at        TIMESTAMPTZ,
    change_reason VARCHAR(500) NOT NULL DEFAULT '',
    status        assignment_status NOT NULL DEFAULT 'active',
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by    UUID NOT NULL,
    updated_by    UUID NOT NULL,
    CONSTRAINT chk_ma_dates CHECK (end_at IS NULL OR end_at > start_at)
);

CREATE UNIQUE INDEX uq_ma_active_meter ON "MeterAssignment"(meter_id) WHERE end_at IS NULL;
CREATE INDEX idx_ma_meter ON "MeterAssignment"(meter_id);
CREATE INDEX idx_ma_customer ON "MeterAssignment"(customer_id);
CREATE INDEX idx_ma_unit ON "MeterAssignment"(unit_id);
CREATE INDEX idx_ma_project ON "MeterAssignment"(project_id);

-- ============================================================================
-- 8. SIMAssignment
-- ============================================================================
CREATE TABLE "SIMAssignment" (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sim_id        UUID NOT NULL REFERENCES "SIMCard"(id) ON DELETE CASCADE,
    meter_id      UUID NOT NULL REFERENCES "Meter"(id) ON DELETE CASCADE,
    start_at      TIMESTAMPTZ NOT NULL,
    end_at        TIMESTAMPTZ,
    change_reason VARCHAR(500) NOT NULL DEFAULT '',
    status        assignment_status NOT NULL DEFAULT 'active',
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by    UUID NOT NULL,
    updated_by    UUID NOT NULL,
    CONSTRAINT chk_sa_dates CHECK (end_at IS NULL OR end_at > start_at)
);

CREATE UNIQUE INDEX uq_sa_active_sim ON "SIMAssignment"(sim_id) WHERE end_at IS NULL;
CREATE INDEX idx_sa_sim ON "SIMAssignment"(sim_id);
CREATE INDEX idx_sa_meter ON "SIMAssignment"(meter_id);

-- ============================================================================
-- 9. Reading
-- ============================================================================
CREATE TABLE "Reading" (
    id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meter_id               UUID NOT NULL REFERENCES "Meter"(id) ON DELETE CASCADE,
    project_id             UUID NOT NULL REFERENCES "Project"(id) ON DELETE CASCADE,
    customer_id_snapshot   UUID NOT NULL,
    unit_id_snapshot       UUID NOT NULL,
    reading_value          DECIMAL(15,4) NOT NULL,
    reading_at             TIMESTAMPTZ NOT NULL,
    source                 reading_source NOT NULL DEFAULT 'manual',
    previous_reading_value DECIMAL(15,4),
    consumption_value      DECIMAL(15,4),
    status                 reading_status NOT NULL DEFAULT 'pending_review',
    raw_payload            JSONB,
    entered_by             UUID NOT NULL,
    notes                  TEXT,
    created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by             UUID NOT NULL,
    updated_by             UUID NOT NULL,
    CONSTRAINT uq_reading_meter_time_source UNIQUE (meter_id, reading_at, source),
    CONSTRAINT chk_reading_consumption CHECK (
        consumption_value IS NULL OR consumption_value >= 0
    )
);

CREATE INDEX idx_reading_meter ON "Reading"(meter_id);
CREATE INDEX idx_reading_project ON "Reading"(project_id);
CREATE INDEX idx_reading_status ON "Reading"(status);
CREATE INDEX idx_reading_at ON "Reading"(reading_at);

-- ============================================================================
-- 10. ReadingReview
-- ============================================================================
CREATE TABLE "ReadingReview" (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reading_id    UUID NOT NULL REFERENCES "Reading"(id) ON DELETE CASCADE,
    review_action review_action NOT NULL,
    reviewed_by   UUID NOT NULL,
    reviewed_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reason        TEXT NOT NULL DEFAULT '',
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_rr_reading ON "ReadingReview"(reading_id);

-- ============================================================================
-- 11. TariffPlan
-- ============================================================================
CREATE TABLE "TariffPlan" (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id      UUID NOT NULL REFERENCES "Project"(id) ON DELETE CASCADE,
    meter_type      meter_type NOT NULL,
    rate_per_unit   DECIMAL(15,6) NOT NULL,
    currency        VARCHAR(3) NOT NULL DEFAULT 'USD',
    effective_from  DATE NOT NULL,
    effective_to    DATE,
    status          tariff_status NOT NULL DEFAULT 'draft',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by      UUID NOT NULL,
    updated_by      UUID NOT NULL
);

CREATE INDEX idx_tariff_project ON "TariffPlan"(project_id);
CREATE INDEX idx_tariff_active ON "TariffPlan"(project_id, meter_type) WHERE status = 'active';

-- ============================================================================
-- 12. BillingPeriod
-- ============================================================================
CREATE TABLE "BillingPeriod" (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id  UUID NOT NULL REFERENCES "Project"(id) ON DELETE CASCADE,
    period_code VARCHAR(7) NOT NULL,
    start_date  DATE NOT NULL,
    end_date    DATE NOT NULL,
    status      billing_period_status NOT NULL DEFAULT 'open',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by  UUID NOT NULL,
    updated_by  UUID NOT NULL,
    CONSTRAINT uq_bp_project_code UNIQUE (project_id, period_code),
    CONSTRAINT chk_bp_dates CHECK (end_date >= start_date)
);

-- ============================================================================
-- 13. Invoice
-- ============================================================================
CREATE TABLE "Invoice" (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number    VARCHAR(50) NOT NULL,
    project_id        UUID NOT NULL REFERENCES "Project"(id) ON DELETE CASCADE,
    customer_id       UUID NOT NULL REFERENCES "Customer"(id) ON DELETE CASCADE,
    unit_id           UUID NOT NULL REFERENCES "LocationNode"(id) ON DELETE CASCADE,
    meter_id          UUID NOT NULL REFERENCES "Meter"(id) ON DELETE CASCADE,
    utility_type      utility_type NOT NULL,
    billing_period_id UUID NOT NULL REFERENCES "BillingPeriod"(id) ON DELETE CASCADE,
    status            invoice_status NOT NULL DEFAULT 'draft',
    subtotal_amount   DECIMAL(15,2) NOT NULL DEFAULT 0,
    tax_amount        DECIMAL(15,2) NOT NULL DEFAULT 0,
    total_amount      DECIMAL(15,2) NOT NULL DEFAULT 0,
    paid_amount       DECIMAL(15,2) NOT NULL DEFAULT 0,
    remaining_amount  DECIMAL(15,2) NOT NULL DEFAULT 0,
    issued_at         TIMESTAMPTZ,
    due_at            TIMESTAMPTZ,
    immutable_at      TIMESTAMPTZ,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by        UUID NOT NULL,
    updated_by        UUID NOT NULL,
    CONSTRAINT uq_invoice_number UNIQUE (invoice_number),
    CONSTRAINT chk_invoice_amounts CHECK (
        total_amount = subtotal_amount + tax_amount AND
        paid_amount >= 0 AND
        remaining_amount >= 0 AND
        remaining_amount = total_amount - paid_amount
    )
);

CREATE INDEX idx_invoice_project ON "Invoice"(project_id);
CREATE INDEX idx_invoice_customer ON "Invoice"(customer_id);
CREATE INDEX idx_invoice_billing_period ON "Invoice"(billing_period_id);
CREATE INDEX idx_invoice_status ON "Invoice"(status);

-- ============================================================================
-- 14. InvoiceLine
-- ============================================================================
CREATE TABLE "InvoiceLine" (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id  UUID NOT NULL REFERENCES "Invoice"(id) ON DELETE CASCADE,
    reading_id  UUID REFERENCES "Reading"(id) ON DELETE SET NULL,
    description VARCHAR(500) NOT NULL DEFAULT '',
    quantity    DECIMAL(15,4) NOT NULL DEFAULT 1,
    unit_price  DECIMAL(15,6) NOT NULL DEFAULT 0,
    line_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_il_invoice ON "InvoiceLine"(invoice_id);

-- ============================================================================
-- 15. InvoiceAdjustment
-- ============================================================================
CREATE TABLE "InvoiceAdjustment" (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id      UUID NOT NULL REFERENCES "Invoice"(id) ON DELETE CASCADE,
    adjustment_type adjustment_type NOT NULL,
    amount          DECIMAL(15,2) NOT NULL,
    reason          TEXT NOT NULL DEFAULT '',
    approved_by     UUID,
    created_by      UUID NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ia_invoice ON "InvoiceAdjustment"(invoice_id);

-- ============================================================================
-- 16. Payment
-- ============================================================================
CREATE TABLE "Payment" (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_number  VARCHAR(50) NOT NULL,
    project_id      UUID NOT NULL REFERENCES "Project"(id) ON DELETE CASCADE,
    customer_id     UUID NOT NULL REFERENCES "Customer"(id) ON DELETE CASCADE,
    payment_date    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    method          payment_method NOT NULL,
    amount          DECIMAL(15,2) NOT NULL CHECK (amount > 0),
    status          payment_status NOT NULL DEFAULT 'pending',
    collected_by    UUID NOT NULL,
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by      UUID NOT NULL,
    updated_by      UUID NOT NULL,
    CONSTRAINT uq_payment_number UNIQUE (payment_number)
);

CREATE INDEX idx_payment_project ON "Payment"(project_id);
CREATE INDEX idx_payment_customer ON "Payment"(customer_id);
CREATE INDEX idx_payment_status ON "Payment"(status);

-- ============================================================================
-- 17. PaymentAllocation
-- ============================================================================
CREATE TABLE "PaymentAllocation" (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id        UUID NOT NULL REFERENCES "Payment"(id) ON DELETE CASCADE,
    invoice_id        UUID NOT NULL REFERENCES "Invoice"(id) ON DELETE CASCADE,
    allocated_amount  DECIMAL(15,2) NOT NULL CHECK (allocated_amount > 0),
    allocation_order  INTEGER NOT NULL DEFAULT 0,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_pa_payment_invoice UNIQUE (payment_id, invoice_id)
);

CREATE INDEX idx_pa_payment ON "PaymentAllocation"(payment_id);
CREATE INDEX idx_pa_invoice ON "PaymentAllocation"(invoice_id);

-- ============================================================================
-- 18. CustomerLedgerEntry (Append-Only — no updates/deletes)
-- ============================================================================
CREATE TABLE "CustomerLedgerEntry" (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id     UUID NOT NULL REFERENCES "Customer"(id) ON DELETE CASCADE,
    project_id      UUID NOT NULL REFERENCES "Project"(id) ON DELETE CASCADE,
    entry_type      ledger_entry_type NOT NULL,
    reference_type  ledger_reference_type NOT NULL,
    reference_id    UUID NOT NULL,
    amount_delta    DECIMAL(15,2) NOT NULL,
    running_balance DECIMAL(15,2) NOT NULL,
    entry_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_cle_customer ON "CustomerLedgerEntry"(customer_id);
CREATE INDEX idx_cle_project ON "CustomerLedgerEntry"(project_id);
CREATE INDEX idx_cle_entry_at ON "CustomerLedgerEntry"(entry_at);

-- ============================================================================
-- 19. AuditLog (Append-Only — no updates/deletes)
-- ============================================================================
CREATE TABLE "AuditLog" (
    id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_user_id          UUID NOT NULL,
    actor_role             VARCHAR(100) NOT NULL DEFAULT '',
    action                 VARCHAR(200) NOT NULL,
    resource_type          VARCHAR(100) NOT NULL,
    resource_id            UUID NOT NULL,
    project_id             UUID,
    request_correlation_id VARCHAR(100) NOT NULL DEFAULT '',
    before_state           JSONB,
    after_state            JSONB,
    reason                 TEXT,
    created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_actor ON "AuditLog"(actor_user_id);
CREATE INDEX idx_audit_resource ON "AuditLog"(resource_type, resource_id);
CREATE INDEX idx_audit_project ON "AuditLog"(project_id);
CREATE INDEX idx_audit_created ON "AuditLog"(created_at);

-- ============================================================================
-- 20. ReportJob
-- ============================================================================
CREATE TABLE "ReportJob" (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id      UUID NOT NULL REFERENCES "Project"(id) ON DELETE CASCADE,
    report_type     VARCHAR(100) NOT NULL,
    format          report_format NOT NULL DEFAULT 'csv',
    filters         JSONB NOT NULL DEFAULT '{}',
    status          report_status NOT NULL DEFAULT 'queued',
    file_url        VARCHAR(500),
    error_message   TEXT,
    requested_by    UUID NOT NULL,
    requested_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_rj_project ON "ReportJob"(project_id);
CREATE INDEX idx_rj_status ON "ReportJob"(status);
CREATE INDEX idx_rj_requested ON "ReportJob"(requested_at);

-- ============================================================================
-- DERIVED VIEWS
-- ============================================================================

-- Active meter assignments (one row per meter)
CREATE VIEW meter_assignment_active_view AS
SELECT DISTINCT ON (ma.meter_id)
    ma.id,
    ma.meter_id,
    ma.customer_id,
    ma.unit_id,
    ma.project_id,
    ma.start_at,
    ma.change_reason,
    m.serial_number AS meter_serial,
    m.meter_type
FROM "MeterAssignment" ma
JOIN "Meter" m ON m.id = ma.meter_id
WHERE ma.end_at IS NULL
ORDER BY ma.meter_id, ma.start_at DESC;

-- Active SIM assignments (one row per SIM)
CREATE VIEW sim_assignment_active_view AS
SELECT DISTINCT ON (sa.sim_id)
    sa.id,
    sa.sim_id,
    sa.meter_id,
    sa.start_at,
    sa.change_reason,
    s.iccid AS sim_iccid,
    s.msisdn AS sim_msisdn
FROM "SIMAssignment" sa
JOIN "SIMCard" s ON s.id = sa.sim_id
WHERE sa.end_at IS NULL
ORDER BY sa.sim_id, sa.start_at DESC;

-- Customer statement: opening balance, charges, payments, adjustments, closing balance
CREATE VIEW customer_statement_view AS
SELECT
    cle.customer_id,
    cle.project_id,
    cle.entry_type,
    cle.reference_type,
    cle.reference_id,
    cle.amount_delta,
    cle.running_balance,
    cle.entry_at,
    FIRST_VALUE(cle.running_balance - cle.amount_delta)
        OVER (PARTITION BY cle.customer_id ORDER BY cle.entry_at, cle.id) AS opening_balance
FROM "CustomerLedgerEntry" cle;

-- ============================================================================
-- TRIGGER: Auto-update updated_at on row modification
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all mutable tables
CREATE TRIGGER trg_project_updated_at BEFORE UPDATE ON "Project"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_location_updated_at BEFORE UPDATE ON "LocationNode"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_customer_updated_at BEFORE UPDATE ON "Customer"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_cua_updated_at BEFORE UPDATE ON "CustomerUnitAssignment"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_meter_updated_at BEFORE UPDATE ON "Meter"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_sim_updated_at BEFORE UPDATE ON "SIMCard"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_ma_updated_at BEFORE UPDATE ON "MeterAssignment"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_sa_updated_at BEFORE UPDATE ON "SIMAssignment"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_reading_updated_at BEFORE UPDATE ON "Reading"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_tariff_updated_at BEFORE UPDATE ON "TariffPlan"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_bp_updated_at BEFORE UPDATE ON "BillingPeriod"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_invoice_updated_at BEFORE UPDATE ON "Invoice"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_payment_updated_at BEFORE UPDATE ON "Payment"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_rj_updated_at BEFORE UPDATE ON "ReportJob"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
