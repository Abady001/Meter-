const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async () => {
  try {
    const result = await prisma.$queryRawUnsafe(
      `SELECT enumlabel, enumtypid::regtype::text as enum_type
       FROM pg_enum e
       JOIN pg_type t ON e.enumtypid = t.oid
       JOIN pg_namespace n ON t.typnamespace = n.oid
       WHERE n.nspname = 'sim_system'
       AND t.typname IN ('meter_type', 'utility_type', 'reading_source')
       ORDER BY t.typname, e.enumsortorder`
    );
    console.log(JSON.stringify(result, null, 2));
  } catch(e) { console.error(e.message); }
  await prisma.$disconnect();
})();
