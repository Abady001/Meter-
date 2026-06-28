const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ datasources: { db: { url: 'postgresql://meter_pulse:meter_pulse_dev@127.0.0.1:5432/meter_pulse' } } });
(async () => {
  try {
    const projects = await prisma.project.findMany({ take: 5 });
    console.log('Projects:', projects.length);
    projects.forEach(p => console.log(`  ${p.id} | ${p.name} | ${p.status}`));
    
    const customers = await prisma.customer.findMany({ take: 5 });
    console.log('Customers:', customers.length);
    customers.forEach(c => console.log(`  ${c.id} | ${c.name} | ${c.status}`));
    
    const meters = await prisma.meter.findMany();
    console.log('Meters:', meters.length);
    meters.forEach(m => console.log(`  ${m.id} | ${m.serialNumber} | ${m.meterType} | ${m.status}`));
  } catch(e) { console.error('ERROR:', e.message); }
  await prisma.$disconnect();
})();
