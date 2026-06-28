-- Seed data for Meter Verse demo

-- Projects
INSERT INTO sim_system.projects (id, name, code, status, created_at, updated_at, created_by, updated_by)
SELECT 'a0000001-0000-0000-0000-000000000001', 'Palm Hills Estate', 'PHE-001', 'active', NOW(), NOW(), 'seed', 'seed'
WHERE NOT EXISTS (SELECT 1 FROM sim_system.projects WHERE id = 'a0000001-0000-0000-0000-000000000001');

INSERT INTO sim_system.projects (id, name, code, status, created_at, updated_at, created_by, updated_by)
SELECT 'a0000001-0000-0000-0000-000000000002', 'New Cairo Residence', 'NCR-001', 'active', NOW(), NOW(), 'seed', 'seed'
WHERE NOT EXISTS (SELECT 1 FROM sim_system.projects WHERE id = 'a0000001-0000-0000-0000-000000000002');

-- Customers
INSERT INTO sim_system.customers (id, project_id, customer_code, name, name_ar, phone, email, customer_type, national_or_commercial_id, status, created_at, updated_at, created_by, updated_by)
SELECT 'c0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001', 'CUST-00001', 'Ahmed El-Sayed', 'أحمد السيد', '01000000001', 'ahmed@example.com', 'individual', '123456789', 'active', NOW(), NOW(), 'seed', 'seed'
WHERE NOT EXISTS (SELECT 1 FROM sim_system.customers WHERE id = 'c0000001-0000-0000-0000-000000000001');

INSERT INTO sim_system.customers (id, project_id, customer_code, name, phone, email, customer_type, national_or_commercial_id, status, created_at, updated_at, created_by, updated_by)
SELECT 'c0000001-0000-0000-0000-000000000002', 'a0000001-0000-0000-0000-000000000001', 'CUST-00002', 'Mohamed Ali', '01000000002', 'mohamed@example.com', 'individual', '987654321', 'active', NOW(), NOW(), 'seed', 'seed'
WHERE NOT EXISTS (SELECT 1 FROM sim_system.customers WHERE id = 'c0000001-0000-0000-0000-000000000002');

-- Meters (electricity only - enum may not have all types)
INSERT INTO sim_system.meters (id, serial_number, meter_type, brand, model, phase_type, amp_rating, status, installation_date, activation_date, project_id, created_at, updated_at, created_by, updated_by)
SELECT 'd0000001-0000-0000-0000-000000000001', 'EM-2024-00001', 'electricity', 'Iskra', 'ME382', '1PH', '60A', 'active', NOW(), NOW(), 'a0000001-0000-0000-0000-000000000001', NOW(), NOW(), 'seed', 'seed'
WHERE NOT EXISTS (SELECT 1 FROM sim_system.meters WHERE id = 'd0000001-0000-0000-0000-000000000001');

INSERT INTO sim_system.meters (id, serial_number, meter_type, brand, model, phase_type, amp_rating, status, installation_date, activation_date, project_id, created_at, updated_at, created_by, updated_by)
SELECT 'd0000001-0000-0000-0000-000000000002', 'EM-2024-00002', 'electricity', 'Iskra', 'ME382', '3PH', '100A', 'active', NOW(), NOW(), 'a0000001-0000-0000-0000-000000000001', NOW(), NOW(), 'seed', 'seed'
WHERE NOT EXISTS (SELECT 1 FROM sim_system.meters WHERE id = 'd0000001-0000-0000-0000-000000000002');

-- Invoices (need billing_period_id - use a placeholder)
INSERT INTO sim_system.invoices (id, invoice_number, project_id, customer_id, unit_id, meter_id, utility_type, billing_period_id, status, subtotal_amount, tax_amount, total_amount, remaining_amount, paid_amount, issued_at, created_at, updated_at)
SELECT 'f0000001-0000-0000-0000-000000000001', 'ELE-2026-00000001', 'a0000001-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000001', 'system', 'd0000001-0000-0000-0000-000000000001', 'electricity', '00000000-0000-0000-0000-000000000000', 'issued', 400.00, 50.00, 450.00, 450.00, 0, NOW(), NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM sim_system.invoices WHERE id = 'f0000001-0000-0000-0000-000000000001');

INSERT INTO sim_system.invoices (id, invoice_number, project_id, customer_id, unit_id, meter_id, utility_type, billing_period_id, status, subtotal_amount, tax_amount, total_amount, remaining_amount, paid_amount, issued_at, created_at, updated_at)
SELECT 'f0000001-0000-0000-0000-000000000002', 'ELE-2026-00000002', 'a0000001-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000001', 'system', 'd0000001-0000-0000-0000-000000000001', 'electricity', '00000000-0000-0000-0000-000000000000', 'paid', 600.00, 75.00, 675.00, 0, 675.00, NOW(), NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM sim_system.invoices WHERE id = 'f0000001-0000-0000-0000-000000000002');

-- Payments
INSERT INTO sim_system.payments (id, payment_number, project_id, customer_id, amount, payment_date, method, status, collected_by, notes, created_at, updated_at)
SELECT 'g0000001-0000-0000-0000-000000000001', 'PAY-2026-00001', 'a0000001-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000001', 675.00, NOW(), 'bank_transfer', 'confirmed', 'system', 'Payment for invoice ELE-2026-00000002', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM sim_system.payments WHERE id = 'g0000001-0000-0000-0000-000000000001');

-- Invoice lines
INSERT INTO sim_system.invoice_lines (id, invoice_id, description, quantity, unit_price, line_amount, charge_group)
SELECT 'h0000001-0000-0000-0000-000000000001', 'f0000001-0000-0000-0000-000000000001', 'Consumption Charge', 150, 2.00, 300.00, 0
WHERE NOT EXISTS (SELECT 1 FROM sim_system.invoice_lines WHERE id = 'h0000001-0000-0000-0000-000000000001');

INSERT INTO sim_system.invoice_lines (id, invoice_id, description, quantity, unit_price, line_amount, charge_group)
SELECT 'h0000001-0000-0000-0000-000000000002', 'f0000001-0000-0000-0000-000000000001', 'Fixed Charge', 1, 50.00, 50.00, 1
WHERE NOT EXISTS (SELECT 1 FROM sim_system.invoice_lines WHERE id = 'h0000001-0000-0000-0000-000000000002');

INSERT INTO sim_system.invoice_lines (id, invoice_id, description, quantity, unit_price, line_amount, charge_group)
SELECT 'h0000001-0000-0000-0000-000000000003', 'f0000001-0000-0000-0000-000000000002', 'Consumption Charge', 300, 2.00, 600.00, 0
WHERE NOT EXISTS (SELECT 1 FROM sim_system.invoice_lines WHERE id = 'h0000001-0000-0000-0000-000000000003');

-- Tariff plans
INSERT INTO sim_system.tariff_plans (id, project_id, meter_type, rate_per_unit, currency, status, effective_from, created_at, updated_at, created_by, updated_by)
SELECT 'j0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001', 'electricity', 2.00, 'EGP', 'active', '2026-01-01', NOW(), NOW(), 'seed', 'seed'
WHERE NOT EXISTS (SELECT 1 FROM sim_system.tariff_plans WHERE id = 'j0000001-0000-0000-0000-000000000001');
