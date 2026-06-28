-- Add charge_group to invoice_lines
ALTER TABLE sim_system.invoice_lines ADD COLUMN IF NOT EXISTS charge_group INTEGER;

-- Add balance fields to invoices
ALTER TABLE sim_system.invoices ADD COLUMN IF NOT EXISTS balance_before DECIMAL(12,3);
ALTER TABLE sim_system.invoices ADD COLUMN IF NOT EXISTS balance_after DECIMAL(12,3);
ALTER TABLE sim_system.invoices ADD COLUMN IF NOT EXISTS meter_serial VARCHAR(255);
ALTER TABLE sim_system.invoices ADD COLUMN IF NOT EXISTS consumption_value DECIMAL(12,3);
ALTER TABLE sim_system.invoices ADD COLUMN IF NOT EXISTS billing_period_code VARCHAR(100);

-- Add customer fields
ALTER TABLE sim_system.customers ADD COLUMN IF NOT EXISTS name_ar VARCHAR(500);
ALTER TABLE sim_system.customers ADD COLUMN IF NOT EXISTS tenant_name VARCHAR(500);

-- Add project branding fields
ALTER TABLE sim_system.projects ADD COLUMN IF NOT EXISTS logo TEXT;
ALTER TABLE sim_system.projects ADD COLUMN IF NOT EXISTS license TEXT;
ALTER TABLE sim_system.projects ADD COLUMN IF NOT EXISTS signature TEXT;
ALTER TABLE sim_system.projects ADD COLUMN IF NOT EXISTS bank_details TEXT;
ALTER TABLE sim_system.projects ADD COLUMN IF NOT EXISTS company_info TEXT;

-- Add meter fields
ALTER TABLE sim_system.meters ADD COLUMN IF NOT EXISTS initial_balance DECIMAL(12,3);
ALTER TABLE sim_system.meters ADD COLUMN IF NOT EXISTS relay_status VARCHAR(50);
ALTER TABLE sim_system.meters ADD COLUMN IF NOT EXISTS last_reading_date TIMESTAMPTZ;