const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ datasources: { db: { url: 'postgresql://meter_pulse:meter_pulse_dev@127.0.0.1:5432/meter_pulse' } } });
(async () => {
  const solarMeters = await prisma.meter.findMany({ where: { meterType: 'solar' } });
  console.log('Solar meters:', solarMeters.length);
  solarMeters.forEach(m => console.log(' ', m.id, m.serialNumber, m.status));
  const prodReadings = await prisma.reading.findMany({ where: { source: 'production' }, take: 3 });
  console.log('Production readings:', prodReadings.length);
  const solarInv = await prisma.invoice.findMany({ where: { utilityType: 'solar' } });
  console.log('Solar invoices:', solarInv.length);
  solarInv.forEach(i => console.log(' ', i.invoiceNumber, i.status, Number(i.totalAmount)));
  await prisma.$disconnect();
})();
