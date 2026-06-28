const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ datasources: { db: { url: 'postgresql://meter_pulse:meter_pulse_dev@127.0.0.1:5432/meter_pulse' } } });

(async () => {
  console.log('=== SEEDING ===');

  // Clean existing demo data via Prisma
  const oldProjects = await prisma.project.findMany({ where: { code: { in: ['DEMO-A', 'DEMO-B', 'DEMO-C', 'DEMO-D'] } } });
  const oldProjectIds = oldProjects.map(p => p.id);
  if (oldProjectIds.length > 0) {
    await prisma.invoiceLine.deleteMany({ where: { invoice: { projectId: { in: oldProjectIds } } } }).catch(() => {});
    await prisma.invoice.deleteMany({ where: { projectId: { in: oldProjectIds } } }).catch(() => {});
    await prisma.reading.deleteMany({ where: { projectId: { in: oldProjectIds } } }).catch(() => {});
    await prisma.meter.deleteMany({ where: { projectId: { in: oldProjectIds } } }).catch(() => {});
    await prisma.customer.deleteMany({ where: { projectId: { in: oldProjectIds } } }).catch(() => {});
    await prisma.project.deleteMany({ where: { id: { in: oldProjectIds } } }).catch(() => {});
    console.log('Cleaned old demo data');
  }

  // 1. Projects
  const projectData = [
    { name: 'Demo Project A', code: 'DEMO-A' },
    { name: 'Demo Project B', code: 'DEMO-B' },
    { name: 'Demo Project C', code: 'DEMO-C' },
    { name: 'Demo Project D', code: 'DEMO-D' },
  ];
  for (const p of projectData) {
    await prisma.project.upsert({ where: { code: p.code }, update: {}, create: { name: p.name, code: p.code, status: 'active', createdBy: 'seed', updatedBy: 'seed' } });
  }
  console.log('Projects: 4');

  // 2. Customers  
  const projects = await prisma.project.findMany({ where: { code: { in: ['DEMO-A', 'DEMO-B', 'DEMO-C', 'DEMO-D'] } } });
  const names = ['Ahmed Hassan','Mona Abdel-Rahman','Khaled Youssef','Nadia Kamal','Tamer Shawky','Laila Mahmoud','Omar Farouk','Dina Samir','Hani Shaker','Sara El-Din','Mohamed Ali','Nourhan Adel','Peter Malak','Gehan Fawzy','Sameh Lotfy'];
  for (const n of names) {
    const p = projects[Math.floor(Math.random() * projects.length)];
    await prisma.customer.create({ data: { name: n, customerCode: 'CUS-' + Math.random().toString(36).substring(2,8).toUpperCase(), phone: '+2010' + Math.floor(10000000 + Math.random()*90000000), status: 'active', email: n.toLowerCase().replace(/\s/g,'.') + '@email.com', customerType: 'individual', nationalOrCommercialId: 'NID-' + Math.random().toString(36).substring(2,10).toUpperCase(), projectId: p.id, createdBy: 'seed', updatedBy: 'seed' } });
  }
  const customers = await prisma.customer.findMany();
  console.log('Customers: ' + customers.length);

  // 3. Meters (30)
  const types = ['electricity', 'water_main', 'solar'];
  const brands = ['Iskra','Siemens','Landis+Gyr','Elster','Itron'];
  for (let i = 1; i <= 30; i++) {
    const t = types[Math.floor(Math.random()*types.length)];
    const p = projects[Math.floor(Math.random()*projects.length)];
    await prisma.meter.create({ data: { serialNumber: (t==='electricity'?'EM-':t==='water_main'?'WM-':'SM-')+'2025-'+String(i).padStart(4,'0'), meterType: t, brand: brands[Math.floor(Math.random()*brands.length)], model: 'M-'+i, status: ['active','active','active','offline','faulty'][Math.floor(Math.random()*5)], projectId: p.id, installationDate: new Date('2024-01-01'), activationDate: new Date('2024-01-15'), createdBy: 'seed', updatedBy: 'seed' } });
  }
  const meters = await prisma.meter.findMany();
  console.log('Meters: ' + meters.length);

  // 4. Readings
  for (const m of meters.filter(m => m.status === 'active')) {
    const count = 5 + Math.floor(Math.random()*10);
    for (let r = 1; r <= count; r++) {
      await prisma.reading.create({ data: { meterId: m.id, projectId: m.projectId, customerIdSnapshot: customers[Math.floor(Math.random()*customers.length)].id, unitIdSnapshot: '', readingValue: Math.round(100+Math.random()*9000), readingAt: new Date(Date.now()-(count-r)*30*86400000), source: 'manual', enteredBy: 'seed', status: 'valid' } });
    }
  }
  console.log('Readings: created');

  // 5. Invoices (25)
  const statuses = ['issued','paid','issued','overdue','paid'];
  for (let i = 1; i <= 25; i++) {
    const c = customers[Math.floor(Math.random()*customers.length)];
    const p = projects[Math.floor(Math.random()*projects.length)];
    const m = meters[Math.floor(Math.random()*meters.length)];
    const util = m.meterType === 'water_main' ? 'water' : m.meterType === 'water_child' ? 'water' : m.meterType;
    const cons = Math.round(100+Math.random()*2000);
    const rate = 1.5+Math.random()*2;
    const charge = cons*rate; const vat = charge*0.14; const total = charge+vat;
    const inv = await prisma.invoice.create({ data: { projectId: p.id, customerId: c.id, meterId: m.id, unitId: 'system', utilityType: util, invoiceNumber: 'INV-2025-'+String(i).padStart(4,'0'), status: statuses[Math.floor(Math.random()*statuses.length)], subtotalAmount: charge, taxAmount: vat, totalAmount: total, paidAmount: Math.round((Math.random()>0.5?total*(0.5+Math.random()*0.5):0)*100)/100, remainingAmount: total, billingPeriodId: '2025-'+String(i%12||12).padStart(2,'0'), billingPeriodCode: '2025-'+String(i%12||12).padStart(2,'0'), issuedAt: new Date(Date.now()-i*30*86400000), dueAt: new Date(Date.now()-i*30*86400000+30*86400000) } });
    await prisma.invoiceLine.create({ data: { invoiceId: inv.id, description: m.meterType+' consumption '+cons, quantity: cons, unitPrice: rate, lineAmount: charge, chargeGroup: 0 } });
  }
  console.log('Invoices: 25');
  console.log('\n✅ DONE!');
  await prisma.$disconnect();
})();
