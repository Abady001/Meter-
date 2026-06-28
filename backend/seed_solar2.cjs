const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ datasources: { db: { url: 'postgresql://meter_pulse:meter_pulse_dev@127.0.0.1:5432/meter_pulse' } } });
(async () => {
  try {
    const projectId = 'a8d2dccc-b736-4b15-8960-77f58192058a';
    const customerId = '17610ecd-6d8f-4493-9ee7-bf4aa1eb430b';

    // Create solar meter
    const meter = await prisma.meter.create({
      data: {
        id: '00000000-0000-4000-a000-000000000001',
        serialNumber: 'SOLAR-MTR-001',
        meterType: 'solar',
        brand: 'SolarTech',
        model: 'ST-5000',
        status: 'active',
        projectId,
        installationDate: new Date('2026-01-01'),
        activationDate: new Date('2026-01-15'),
        createdBy: 'solar-seed',
        updatedBy: 'solar-seed',
      },
    });
    console.log('Created solar meter:', meter.id, meter.serialNumber);

    // Create production readings (daily for January 2026)
    for (let day = 1; day <= 15; day++) {
      const readingValue = Math.round(20 + Math.random() * 30); // 20-50 kWh per day
      await prisma.reading.create({
        data: {
          meterId: meter.id,
          projectId,
          customerIdSnapshot: customerId,
          unitIdSnapshot: '',
          readingValue,
          readingAt: new Date(2026, 0, day, 10, 0, 0),
          source: 'production',
          enteredBy: 'solar-seed',
          status: 'valid',
        },
      });
    }
    console.log('Created 15 production readings');

    // Create consumption readings (regular manual readings for same meter)
    for (let day = 1; day <= 15; day++) {
      const readingValue = Math.round(10 + Math.random() * 20); // 10-30 kWh per day
      await prisma.reading.create({
        data: {
          meterId: meter.id,
          projectId,
          customerIdSnapshot: customerId,
          unitIdSnapshot: '',
          readingValue,
          readingAt: new Date(2026, 0, day, 14, 0, 0),
          source: 'manual',
          enteredBy: 'solar-seed',
          status: 'valid',
        },
      });
    }
    console.log('Created 15 consumption readings');
    console.log('\nSeeding complete!');
  } catch(e) { console.error('ERROR:', e.message); }
  await prisma.$disconnect();
})();
