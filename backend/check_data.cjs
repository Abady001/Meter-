const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ datasources: { db: { url: 'postgresql://meter_pulse:meter_pulse_dev@127.0.0.1:5432/meter_pulse' } } });
(async () => {
  try {
    // Test that solar meter_type works in actual DB operations
    const testMeter = await prisma.meter.findFirst({ where: { meterType: 'solar' } });
    console.log('Solar meters in DB:', testMeter ? 'YES - found' : 'none (expected - no data)');
    
    const gasMeter = await prisma.meter.findFirst({ where: { meterType: 'gas' } });
    console.log('Gas meters in DB:', gasMeter ? 'YES - found' : 'none (expected - no data)');
    
    const chilledMeter = await prisma.meter.findFirst({ where: { meterType: 'chilled_water' } });
    console.log('Chilled water meters in DB:', chilledMeter ? 'YES' : 'none');
    
    const outdoorMeter = await prisma.meter.findFirst({ where: { meterType: 'outdoor_unit' } });
    console.log('Outdoor unit meters in DB:', outdoorMeter ? 'YES' : 'none');
    
    const prodReading = await prisma.reading.findFirst({ where: { source: 'production' } });
    console.log('Production readings in DB:', prodReading ? 'YES' : 'none');
    
    // Count total meters
    const totalMeters = await prisma.meter.count();
    console.log('Total meters in DB:', totalMeters);
    
    // Count by meter type
    const meterTypes = await prisma.meter.groupBy({ by: ['meterType'], _count: true });
    console.log('Meters by type:', JSON.stringify(meterTypes.map(m => ({ type: m.meterType, count: m._count }))));
    
  } catch(e) { console.error('ERROR:', e.message); }
  await prisma.$disconnect();
})();
