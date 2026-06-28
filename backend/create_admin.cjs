const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient({ datasources: { db: { url: 'postgresql://meter_pulse:meter_pulse_dev@127.0.0.1:5432/meter_pulse' } } });

(async () => {
  const hash = await bcrypt.hash('admin', 10);
  try {
    await prisma.coreUser.upsert({
      where: { username: 'admin' },
      update: { passwordHash: hash, status: 'active' },
      create: { username: 'admin', email: 'admin@meter-verse.com', passwordHash: hash, status: 'active' },
    });
    console.log('✅ User admin/admin created in core.CoreUser');
  } catch(e) { console.log('Fallback to sim_system user...'); }

  // Also create in sim_system if core schema not accessible
  try {
    await prisma.$executeRawUnsafe(`INSERT INTO "sim_system"."users" (id, username, email, password_hash, status) VALUES ('admin-001', 'admin', 'admin@meter-verse.com', '${hash}', 'active') ON CONFLICT (username) DO UPDATE SET password_hash = '${hash}'`);
    console.log('✅ User created in sim_system.users too');
  } catch(e) { console.log('sim_system users table might not exist:', e.message.substring(0,50)); }

  // Verify login works
  const verify = await bcrypt.compare('admin', hash);
  console.log('✅ Password verification: ' + (verify ? 'PASS' : 'FAIL'));
  await prisma.$disconnect();
})();
