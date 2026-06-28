const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ datasources: { db: { url: 'postgresql://meter_pulse:meter_pulse_dev@127.0.0.1:5432/meter_pulse' } } });
(async () => {
  try {
    const projectId = 'a8d2dccc-b736-4b15-8960-77f58192058a';
    const customerId = '17610ecd-6d8f-4493-9ee7-bf4aa1eb430b';
    const meterId = '00000000-0000-4000-a000-000000000001';

    // Create billing period for January 2026
    const period = await prisma.billingPeriod.upsert({
      where: { id: 'SOLAR-BP-2026-01' },
      update: {},
      create: {
        id: 'SOLAR-BP-2026-01',
        projectId,
        periodCode: '2026-01',
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-01-31'),
        status: 'closed',
        createdBy: 'solar-seed',
        updatedBy: 'solar-seed',
      },
    });
    console.log('Billing period:', period.id);

    // Get production readings
    const prodReadings = await prisma.reading.findMany({
      where: { meterId, source: 'production', readingAt: { gte: period.startDate, lte: period.endDate } },
      orderBy: { readingAt: 'asc' },
    });
    const totalProduction = prodReadings.reduce((s, r) => s + Number(r.readingValue), 0);

    // Get consumption readings
    const consReadings = await prisma.reading.findMany({
      where: { meterId, source: 'manual', readingAt: { gte: period.startDate, lte: period.endDate } },
      orderBy: { readingAt: 'asc' },
    });
    const totalConsumption = consReadings.reduce((s, r) => s + Number(r.readingValue), 0);

    const netUsage = Math.max(totalConsumption - totalProduction, 0);
    const surplus = Math.max(totalProduction - totalConsumption, 0);
    const chargeAmount = netUsage * 1.5;
    const vatAmount = chargeAmount * 0.14;
    const totalAmount = chargeAmount + vatAmount;

    // Create solar invoice
    const invoice = await prisma.invoice.create({
      data: {
        projectId,
        customerId,
        meterId,
        billingPeriodId: period.id,
        utilityType: 'solar',
        invoiceNumber: 'SOL-INV-2026-001',
        status: 'issued',
        subtotalAmount: chargeAmount,
        taxAmount: vatAmount,
        totalAmount,
        paidAmount: 0,
        remainingAmount: totalAmount,
        issuedAt: new Date('2026-02-01'),
        dueAt: new Date('2026-03-01'),
        unitId: 'system',
      },
    });
    console.log('Created invoice:', invoice.invoiceNumber, 'Total:', totalAmount.toFixed(2), 'EGP');

    // Add invoice lines
    await prisma.invoiceLine.createMany({
      data: [
        { invoiceId: invoice.id, description: 'Net Energy Consumption (' + netUsage + ' kWh)', quantity: netUsage, unitPrice: 1.5, lineAmount: chargeAmount, chargeGroup: 0 },
        { invoiceId: invoice.id, description: 'Production (' + totalProduction + ' kWh)', quantity: totalProduction, unitPrice: 0, lineAmount: 0, chargeGroup: 8 },
        { invoiceId: invoice.id, description: 'Surplus Credit (' + surplus + ' kWh)', quantity: surplus, unitPrice: 0, lineAmount: 0, chargeGroup: 9 },
      ],
    });
    console.log('Added 3 invoice lines');

    console.log('\nSolar invoice ready for PDF generation!');
    console.log('Invoice ID:', invoice.id);
    console.log('Net Usage:', netUsage, 'kWh');
    console.log('Production:', totalProduction, 'kWh');
    console.log('Surplus:', surplus, 'kWh');
    console.log('Total:', totalAmount.toFixed(2), 'EGP');
  } catch(e) { console.error('ERROR:', e.message); }
  await prisma.$disconnect();
})();
