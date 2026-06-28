const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ datasources: { db: { url: 'postgresql://meter_pulse:meter_pulse_dev@127.0.0.1:5432/meter_pulse' } } });
(async () => {
  try {
    const projectId = 'a8d2dccc-b736-4b15-8960-77f58192058a';
    const customerId = '17610ecd-6d8f-4493-9ee7-bf4aa1eb430b';

    // Create chilled water meter
    const cwMeter = await prisma.meter.create({
      data: { id: '00000000-0000-4000-b000-000000000001', serialNumber: 'CW-MTR-001', meterType: 'chilled_water', brand: 'CoolingTech', model: 'CT-1000', status: 'active', projectId, installationDate: new Date('2026-01-01'), activationDate: new Date('2026-01-15'), createdBy: 'cw-seed', updatedBy: 'cw-seed' },
    });
    console.log('Created chilled water meter:', cwMeter.serialNumber);

    // Create outdoor unit meter
    const ouMeter = await prisma.meter.create({
      data: { id: '00000000-0000-4000-b000-000000000002', serialNumber: 'OU-MTR-001', meterType: 'outdoor_unit', brand: 'OutdoorTech', model: 'OT-500', status: 'active', projectId, installationDate: new Date('2026-01-01'), activationDate: new Date('2026-01-15'), createdBy: 'cw-seed', updatedBy: 'cw-seed' },
    });
    console.log('Created outdoor unit meter:', ouMeter.serialNumber);

    // Create readings
    for (let day = 1; day <= 10; day++) {
      await prisma.reading.create({ data: { meterId: cwMeter.id, projectId, customerIdSnapshot: customerId, unitIdSnapshot: '', readingValue: Math.round(100 + Math.random() * 200), readingAt: new Date(2026, 0, day), source: 'manual', enteredBy: 'cw-seed', status: 'valid' } });
      await prisma.reading.create({ data: { meterId: ouMeter.id, projectId, customerIdSnapshot: customerId, unitIdSnapshot: '', readingValue: Math.round(50 + Math.random() * 100), readingAt: new Date(2026, 0, day), source: 'manual', enteredBy: 'cw-seed', status: 'valid' } });
    }
    console.log('Created 10 readings per meter');

    console.log('\nSeeding complete!');
  } catch(e) { console.error('ERROR:', e.message); }
  await prisma.$disconnect();
})();
