const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const schemas = await prisma.$queryRawUnsafe("SELECT schema_name FROM information_schema.schemata WHERE schema_name NOT IN ('pg_catalog', 'information_schema', 'pg_toast') ORDER BY schema_name");
  console.log('Schemas:', JSON.stringify(schemas, null, 2));
}
main().catch(e => { console.error(e.message); process.exit(1); }).finally(() => prisma.$disconnect());
