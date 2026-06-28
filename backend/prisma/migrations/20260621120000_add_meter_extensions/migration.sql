-- Add meter extension fields: phase type, amp rating, diameter, solar support
ALTER TABLE sim_system.meters ADD COLUMN IF NOT EXISTS phase_type VARCHAR(10);
ALTER TABLE sim_system.meters ADD COLUMN IF NOT EXISTS amp_rating VARCHAR(10);
ALTER TABLE sim_system.meters ADD COLUMN IF NOT EXISTS diameter VARCHAR(20);
ALTER TABLE sim_system.meters ADD COLUMN IF NOT EXISTS solar_enabled BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE sim_system.meters ADD COLUMN IF NOT EXISTS solar_wallet_id VARCHAR(100);
ALTER TABLE sim_system.meters ADD COLUMN IF NOT EXISTS export_meter_id VARCHAR(100);
ALTER TABLE sim_system.meters ADD COLUMN IF NOT EXISTS import_meter_id VARCHAR(100);
ALTER TABLE sim_system.meters ADD COLUMN IF NOT EXISTS generation_meter_id VARCHAR(100);
