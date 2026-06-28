const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient({ datasources: { db: { url: 'postgresql://meter_pulse:meter_pulse_dev@127.0.0.1:5432/meter_pulse' } } });

(async () => {
  console.log('=== SETUP: Areas, Users, Projects, Data ===\n');

  // 1. Create 3 areas in core.CoreArea
  const areas = [
    { code: 'NC', name: 'North Coast' },
    { code: 'OCT', name: 'October' },
    { code: 'NCR', name: 'New Cairo' },
  ];
  for (const a of areas) {
    try {
      await prisma.coreArea.upsert({
        where: { areaCode: a.code },
        update: { areaName: a.name, isActive: true },
        create: { areaCode: a.code, areaName: a.name, isActive: true },
      });
      console.log(`  Area: ${a.name} (${a.code})`);
    } catch(e) { console.log(`  Area ${a.code}: ${e.message.substring(0,60)}`); }
  }

  // 2. Create October projects in sim_system.Project
  const octoberProjects = [
    { name: 'Golf Views', code: 'GOLF-VW' },
    { name: 'Palm Central Mall', code: 'PALM-ML' },
    { name: 'Golf Central Mall', code: 'GOLF-ML' },
    { name: 'The Crown', code: 'CROWN' },
    { name: 'Badya City', code: 'BADYA' },
  ];
  const createdProjects = [];
  for (const p of octoberProjects) {
    const proj = await prisma.project.upsert({
      where: { code: p.code },
      update: { name: p.name, status: 'active' },
      create: { name: p.name, code: p.code, status: 'active', createdBy: 'setup', updatedBy: 'setup' },
    });
    createdProjects.push(proj);
    console.log(`  Project: ${p.name} (${p.code})`);
  }

  // 3. Create users with bcrypt passwords
  const hash1 = await bcrypt.hash('123456', 10);
  const hash2 = await bcrypt.hash('admin', 10);
  try {
    await prisma.coreUser.upsert({
      where: { username: 'kirllos' },
      update: { passwordHash: hash1, status: 'active' },
      create: { username: 'kirllos', email: 'kirllos@meter-verse.com', passwordHash: hash1, status: 'active' },
    });
    console.log('  User: kirllos/123456 (super_admin - all areas)');
  } catch(e) { console.log(`  kirllos: ${e.message.substring(0,60)}`); }
  try {
    await prisma.coreUser.upsert({
      where: { username: 'admin' },
      update: { passwordHash: hash2, status: 'active' },
      create: { username: 'admin', email: 'admin@meter-verse.com', passwordHash: hash2, status: 'active' },
    });
    console.log('  User: admin/admin (october only)');
  } catch(e) { console.log(`  admin: ${e.message.substring(0,60)}`); }

  // 4. Create 8 customers per project (40 total) + meters + readings + invoices + payments
  const customerNames = [
    'Ahmed Mahmoud', 'Mona Said', 'Tamer Hosny', 'Laila Anwar',
    'Khaled Ali', 'Nora Hassan', 'Peter Emad', 'Soha Kamal',
  ];
  let totalCustomers = 0, totalMeters = 0, totalReadings = 0, totalInvoices = 0, totalPayments = 0;

  for (const project of createdProjects) {
    for (const name of customerNames) {
      const customer = await prisma.customer.create({
        data: {
          name, customerCode: 'CUS-' + project.code + '-' + String(customerNames.indexOf(name) + 1).padStart(2, '0'),
          phone: '+2010' + Math.floor(10000000 + Math.random() * 90000000),
          status: 'active', email: name.toLowerCase().replace(/\s/g, '.') + '@email.com',
          customerType: 'individual',
          nationalOrCommercialId: 'NID-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
          projectId: project.id, createdBy: 'setup', updatedBy: 'setup',
        }
      });
      totalCustomers++;

      // 2 meters per customer (electricity + water)
      const meterTypes = ['electricity', 'water_main'];
      for (const mt of meterTypes) {
        const serial = (mt === 'electricity' ? 'EM-' : 'WM-') + project.code + '-' + String(customerNames.indexOf(name) + 1).padStart(2, '0') + '-' + String(Math.floor(Math.random() * 900) + 100);
        const meter = await prisma.meter.create({
          data: {
            serialNumber: serial, meterType: mt, brand: 'Iskra', model: 'MT-' + mt,
            status: 'active', projectId: project.id,
            installationDate: new Date('2024-01-01'), activationDate: new Date('2024-01-15'),
            createdBy: 'setup', updatedBy: 'setup',
          }
        });
        totalMeters++;

        // 6 readings per meter
        for (let r = 1; r <= 6; r++) {
          await prisma.reading.create({
            data: {
              meterId: meter.id, projectId: project.id,
              customerIdSnapshot: customer.id, unitIdSnapshot: '',
              readingValue: Math.round(500 + Math.random() * 9500),
              readingAt: new Date(2025, r - 1, 15),
              source: 'manual', enteredBy: 'setup', status: 'valid',
            }
          });
          totalReadings++;
        }

        // 1 invoice per meter
        const cons = Math.round(100 + Math.random() * 2000);
        const rate = 1.5 + Math.random() * 2;
        const charge = cons * rate;
        const vat = charge * 0.14;
        const total = charge + vat;
        const inv = await prisma.invoice.create({
          data: {
            projectId: project.id, customerId: customer.id, meterId: meter.id,
            unitId: 'system', utilityType: mt === 'water_main' ? 'water' : 'electricity',
            invoiceNumber: 'INV-' + project.code + '-' + String(totalInvoices + 1).padStart(4, '0'),
            status: Math.random() > 0.3 ? 'issued' : 'paid',
            subtotalAmount: charge, taxAmount: vat, totalAmount: total,
            paidAmount: crypto.randomInt(0, 2) ? Math.round(total * 0.5 * 100) / 100 : 0,
            remainingAmount: total,
            billingPeriodId: '2025-' + String(crypto.randomInt(1, 13)).padStart(2, '0'),
            billingPeriodCode: '2025-' + String(crypto.randomInt(1, 13)).padStart(2, '0'),
            issuedAt: new Date(2025, crypto.randomInt(0, 12), 1),
            dueAt: new Date(2025, crypto.randomInt(0, 12) + 1, 1),
          }
        });
        totalInvoices++;

        await prisma.invoiceLine.create({
          data: { invoiceId: inv.id, description: mt + ' consumption', quantity: cons, unitPrice: rate, lineAmount: charge, chargeGroup: 0 }
        });

        // Payment for some invoices
        if (Math.random() > 0.5) {
          const payMethod = 'cash';
          await prisma.payment.create({
            data: {
              paymentNumber: 'PAY-' + project.code + '-' + String(totalPayments + 1).padStart(4, '0'),
              projectId: project.id, customerId: customer.id,
              amount: Math.round(charge * 0.5 * 100) / 100,
              paymentDate: new Date(2025, Math.floor(Math.random() * 12), 15),
              method: payMethod, paymentMethod: payMethod, status: 'completed',
              createdBy: 'setup', updatedBy: 'setup',
            }
          });
          totalPayments++;
        }
      }
    }
  }

  console.log(`\n✅ DATA SEEDED:
    Projects: ${createdProjects.length}
    Customers: ${totalCustomers}
    Meters: ${totalMeters}
    Readings: ${totalReadings}
    Invoices: ${totalInvoices}
    Payments: ${totalPayments}
  `);
  await prisma.$disconnect();
})();
