const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  // Check tariff_plans columns
  const tpCols = await prisma.$queryRawUnsafe("SELECT column_name, data_type FROM information_schema.columns WHERE table_schema='sim_system' AND table_name='tariff_plans' ORDER BY ordinal_position");
  console.log('=== tariff_plans columns ===');
  console.log(JSON.stringify(tpCols, null, 2));
  
  // Check features.tariff_charges columns
  const tcCols = await prisma.$queryRawUnsafe("SELECT column_name, data_type FROM information_schema.columns WHERE table_schema='features' AND table_name='tariff_charges' ORDER BY ordinal_position");
  console.log('\n=== features.tariff_charges columns ===');
  console.log(JSON.stringify(tcCols, null, 2));
  
  // Check features.tariff_charge_details columns
  const tcdCols = await prisma.$queryRawUnsafe("SELECT column_name, data_type FROM information_schema.columns WHERE table_schema='features' AND table_name='tariff_charge_details' ORDER BY ordinal_position");
  console.log('\n=== features.tariff_charge_details columns ===');
  console.log(JSON.stringify(tcdCols, null, 2));
  
  // Also check if tariff_charges or tariff_charge_details exist in sim_system
  const ssCharges = await prisma.$queryRawUnsafe("SELECT column_name, data_type FROM information_schema.columns WHERE table_schema='sim_system' AND table_name='tariff_charges' ORDER BY ordinal_position");
  console.log('\n=== sim_system.tariff_charges columns ===');
  console.log(JSON.stringify(ssCharges, null, 2));
}
main().catch(e => { console.error('Error:', e.message); process.exit(1); }).finally(() => prisma.$disconnect());
