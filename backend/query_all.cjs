const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  // 1. Invoices
  const invoices = await prisma.$queryRawUnsafe("SELECT i.id, i.invoice_number, i.utility_type, i.status, i.total_amount, i.tax_amount, i.paid_amount, i.meter_id, i.project_id, i.billing_period_id FROM sim_system.invoices i LIMIT 5");
  console.log('=== INVOICES ===');
  console.log(JSON.stringify(invoices, null, 2));
  
  // 2. Invoice lines
  const invoiceLines = await prisma.$queryRawUnsafe("SELECT il.id, il.invoice_id, il.description, il.quantity, il.unit_price, il.line_amount, il.charge_group FROM sim_system.invoice_lines il LIMIT 10");
  console.log('\n=== INVOICE LINES ===');
  console.log(JSON.stringify(invoiceLines, null, 2));
  
  // 3. Readings
  const readings = await prisma.$queryRawUnsafe("SELECT id, meter_id, reading_value, reading_at FROM sim_system.readings LIMIT 10");
  console.log('\n=== READINGS ===');
  console.log(JSON.stringify(readings, null, 2));
  
  // 4. Tariff Plans (sim_system schema)
  const tariffPlans = await prisma.$queryRawUnsafe("SELECT id, name, meter_type, rate_per_unit, status, project_id FROM sim_system.tariff_plans LIMIT 10");
  console.log('\n=== TARIFF PLANS (sim_system) ===');
  console.log(JSON.stringify(tariffPlans, null, 2));
  
  // 5. Tariff Charges (features schema)
  const tariffCharges = await prisma.$queryRawUnsafe("SELECT id, plan_id, charge_group, charge_name, rate, flat_amount, upper_limit FROM sim_system.tariff_charges LIMIT 20");
  console.log('\n=== TARIFF CHARGES (sim_system) ===');
  console.log(JSON.stringify(tariffCharges, null, 2));
  
  // 6. Tariff Charge Details (features schema)
  const tariffChargeDetails = await prisma.$queryRawUnsafe("SELECT id, charge_id, from_usage, to_usage, rate_value, extra_amount FROM sim_system.tariff_charge_details LIMIT 20");
  console.log('\n=== TARIFF CHARGE DETAILS (sim_system) ===');
  console.log(JSON.stringify(tariffChargeDetails, null, 2));
}
main().catch(e => { console.error('Error:', e.message); process.exit(1); }).finally(() => prisma.$disconnect());
