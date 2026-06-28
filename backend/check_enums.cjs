const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ datasources: { db: { url: 'postgresql://meter_pulse:meter_pulse_dev@127.0.0.1:5432/meter_pulse' } } });
(async () => {
  try {
    const result = await prisma.$queryRawUnsafe(
      `SELECT enumlabel, enumtypid::regtype::text as enum_type
       FROM pg_enum e
       JOIN pg_type t ON e.enumtypid = t.oid AND t.typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'sim_system')
       WHERE t.typname IN ('meter_type', 'utility_type', 'reading_source')
       ORDER BY t.typname, e.enumsortorder`
    );
    console.log(JSON.stringify(result, null, 2));
  } catch(e) { console.error('ERROR:', e.message); }
  await prisma.$disconnect();
})();
