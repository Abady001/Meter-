const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const tables = await prisma.$queryRawUnsafe("SELECT table_schema, table_name FROM information_schema.tables WHERE table_schema NOT IN ('pg_catalog', 'information_schema', 'pg_toast') ORDER BY table_schema, table_name");
  console.log(JSON.stringify(tables, null, 2));
}
main().catch(e => { console.error(e.message); process.exit(1); }).finally(() => prisma.$disconnect());
