const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const prisma = new PrismaClient({ datasources: { db: { url: 'postgresql://meter_pulse:meter_pulse_dev@127.0.0.1:5432/meter_pulse' } } });
(async () => {
  const codes = ['GOLF-VW','PALM-ML','GOLF-ML','CROWN','BADYA'];
  const projects = await prisma.project.findMany({ where: { code: { in: codes } } });
  const ids = projects.map(p => p.id);
  // Delete cascade
  for (const id of ids) {
    await prisma.payment.deleteMany({ where: { projectId: id } }).catch(() => {});
    await prisma.invoiceLine.deleteMany({ where: { invoice: { projectId: id } } }).catch(() => {});
    await prisma.invoice.deleteMany({ where: { projectId: id } }).catch(() => {});
    await prisma.reading.deleteMany({ where: { projectId: id } }).catch(() => {});
    await prisma.meter.deleteMany({ where: { projectId: id } }).catch(() => {});
    await prisma.customer.deleteMany({ where: { projectId: id } }).catch(() => {});
  }
  console.log('Cleaned old data');

  const names = ['Ahmed Mahmoud','Mona Said','Tamer Hosny','Laila Anwar','Khaled Ali','Nora Hassan','Peter Emad','Soha Kamal'];
  let pc = 0, mc = 0, rc = 0, ic = 0, pyc = 0;

  for (const project of projects) {
    for (const name of names) {
      const c = await prisma.customer.create({
        data: { name, customerCode: 'CUS-' + project.code + '-' + String(names.indexOf(name)+1).padStart(2,'0'), phone: '+2010'+Math.floor(10000000+Math.random()*90000000), status: 'active', email: name.toLowerCase().replace(/\s/g,'.')+'@email.com', customerType: 'individual', nationalOrCommercialId: 'NID-'+Math.random().toString(36).substring(2,10).toUpperCase(), projectId: project.id, createdBy: 'setup', updatedBy: 'setup' }
      }); pc++;
      for (const mt of ['electricity','water_main']) {
        const m = await prisma.meter.create({
          data: { serialNumber: (mt==='electricity'?'EM-':'WM-')+project.code+'-'+String(names.indexOf(name)+1).padStart(2,'0'), meterType: mt, brand: 'Iskra', model: 'M-'+mt, status: 'active', projectId: project.id, installationDate: new Date('2024-01-01'), activationDate: new Date('2024-01-15'), createdBy: 'setup', updatedBy: 'setup' }
        }); mc++;
        const randomInt = (min, max) => crypto.randomInt(min, max);
        const randomFloat = (min, max) => min + (crypto.randomInt(0, 1000000) / 1000000) * (max - min);
        for (let r = 1; r <= 6; r++) {
          await prisma.reading.create({ data: { meterId: m.id, projectId: project.id, customerIdSnapshot: c.id, unitIdSnapshot: '', readingValue: Math.round(500+randomFloat(0,9500)), readingAt: new Date(2025,r-1,15), source: 'manual', enteredBy: 'setup', status: 'valid' } }); rc++;
        }
        const cons = Math.round(100+randomFloat(0,2000)); const rate = 1.5+randomFloat(0,2); const charge = cons*rate; const total = charge+charge*0.14;
        const inv = await prisma.invoice.create({ data: { projectId: project.id, customerId: c.id, meterId: m.id, unitId: 'system', utilityType: mt==='water_main'?'water':'electricity', invoiceNumber: 'INV-'+project.code+'-'+String(ic+1).padStart(4,'0'), status: randomInt(0,10)>3?'issued':'paid', subtotalAmount: charge, taxAmount: charge*0.14, totalAmount: total, paidAmount: randomInt(0,2)?Math.round(total*0.5*100)/100:0, remainingAmount: total, billingPeriodId: '2025-'+String(randomInt(1,13)).padStart(2,'0'), billingPeriodCode: '2025-'+String(randomInt(1,13)).padStart(2,'0'), issuedAt: new Date(2025,randomInt(0,12),1), dueAt: new Date(2025,randomInt(0,12)+1,1) } }); ic++;
        await prisma.invoiceLine.create({ data: { invoiceId: inv.id, description: mt+' consumption', quantity: cons, unitPrice: rate, lineAmount: charge, chargeGroup: 0 } });
        if (randomInt(0,2)) {
          await prisma.payment.create({ data: { paymentNumber: 'PAY-'+project.code+'-'+String(pyc+1).padStart(4,'0'), projectId: project.id, customerId: c.id, amount: Math.round(charge*0.5*100)/100, paymentDate: new Date(2025,randomInt(0,12),15), method: 'cash', status: 'confirmed', collectedBy: 'setup' } }); pyc++;
        }
      }
    }
  }
  console.log(`\n✅ Done: ${pc} customers, ${mc} meters, ${rc} readings, ${ic} invoices, ${pyc} payments`);
  await prisma.$disconnect();
})();
