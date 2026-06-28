const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ datasources: { db: { url: 'postgresql://meter_pulse:meter_pulse_dev@127.0.0.1:5432/meter_pulse' } } });
const http = require('http');

const projectId = 'a8d2dccc-b736-4b15-8960-77f58192058a';
const customerId = '17610ecd-6d8f-4493-9ee7-bf4aa1eb430b';
const meterIds = {
  electricity: 'd44e6367-0e03-4b7f-bd10-7d8d5346d0e1',
  water: 'f85068c1-2b8b-422f-af9f-95a59c017866',
  solar: '00000000-0000-4000-a000-000000000001',
  chilled_water: '00000000-0000-4000-b000-000000000001',
  outdoor_unit: '00000000-0000-4000-b000-000000000002',
};

async function getToken() {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ userId: 'USR-001', name: 'Admin', role: 'super_admin' });
    const req = http.request({ hostname: 'localhost', port: 3001, path: '/api/v1/auth/dev-login', method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) } }, (res) => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => resolve(JSON.parse(body).accessToken));
    });
    req.write(data);
    req.end();
  });
}

async function downloadPdf(token, invoiceId, filename) {
  return new Promise((resolve) => {
    const opts = { hostname: 'localhost', port: 3001, path: `/api/v1/invoices/${invoiceId}/pdf`, method: 'GET', headers: { 'Authorization': 'Bearer ' + token } };
    const req = http.request(opts, (res) => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        const fs = require('fs');
        const buf = Buffer.concat(chunks);
        fs.writeFileSync('D:/meter/Meter/Frontend/' + filename, buf);
        const isPdf = buf.slice(0, 5).toString() === '%PDF-';
        console.log(`  ${filename}: ${res.statusCode} | ${buf.length} bytes | ${isPdf ? '✅ VALID PDF' : '❌ NOT PDF'}`);
        resolve(isPdf);
      });
    });
    req.end();
  });
}

(async () => {
  try {
    const token = await getToken();
    console.log('Token obtained\n');

    // Utility types to test
    const utilities = [
      { type: 'electricity', label: 'Electricity', meterId: meterIds.electricity, invNum: 'TST-ELEC-001', consumption: 450, chargeGroup: 0 },
      { type: 'water', label: 'Water', meterId: meterIds.water, invNum: 'TST-WATER-001', consumption: 25, chargeGroup: 0 },
      { type: 'solar', label: 'Solar', meterId: meterIds.solar, invNum: 'TST-SOLAR-001', consumption: 150, chargeGroup: 8 },
      { type: 'chilled_water', label: 'Chilled Water', meterId: meterIds.chilled_water, invNum: 'TST-CW-001', consumption: 2500, chargeGroup: 10 },
      { type: 'outdoor_unit', label: 'Outdoor Unit', meterId: meterIds.outdoor_unit, invNum: 'TST-OU-001', consumption: 1800, chargeGroup: 10 },
      { type: 'settlement', label: 'Settlement', meterId: meterIds.electricity, invNum: 'TST-SET-001', consumption: 0, chargeGroup: 12 },
    ];

    for (const util of utilities) {
      console.log(`Creating ${util.label} invoice...`);

      // Create invoice
      const rate = util.type === 'chilled_water' ? 3.0 : util.type === 'outdoor_unit' ? 2.44 : 1.5;
      const chargeAmt = util.type === 'settlement' ? 500 : util.consumption * rate;
      const vatAmount = util.type === 'settlement' ? 0 : chargeAmt * 0.14;
      const totalAmount = chargeAmt + vatAmount;

      const invoice = await prisma.invoice.create({
        data: {
          projectId, customerId, meterId: util.meterId,
          unitId: 'system',
          utilityType: util.type,
          invoiceNumber: util.invNum,
          status: 'issued',
          subtotalAmount: chargeAmt,
          taxAmount: vatAmount,
          totalAmount,
          paidAmount: 0,
          remainingAmount: totalAmount,
          billingPeriodId: 'TST-BP-2026-06',
          billingPeriodCode: '2026-06',
          issuedAt: new Date(),
          dueAt: new Date(Date.now() + 30 * 86400000),
        },
      });
      console.log(`  Invoice: ${invoice.invoiceNumber} (${invoice.id.substring(0,8)}...)`);

      // Add invoice lines
      const lines = [];
      if (util.type === 'settlement') {
        lines.push({ invoiceId: invoice.id, description: 'Settlement Amount', quantity: 1, unitPrice: 500, lineAmount: 500, chargeGroup: 12 });
      } else {
        lines.push({ invoiceId: invoice.id, description: 'Consumption (' + util.consumption + ' ' + (util.type === 'water' ? 'm³' : util.type.includes('chilled') || util.type === 'outdoor_unit' ? 'BTU' : 'kWh') + ')', quantity: util.consumption, unitPrice: rate, lineAmount: chargeAmt, chargeGroup: util.chargeGroup });
        if (util.type === 'solar') {
          lines.push({ invoiceId: invoice.id, description: 'Solar Credit', quantity: 50, unitPrice: 0, lineAmount: 0, chargeGroup: 9 });
        }
      }
      await prisma.invoiceLine.createMany({ data: lines });

      // Download PDF
      const filename = `invoice-${util.type}.pdf`;
      await downloadPdf(token, invoice.id, filename);
    }

    console.log('\n✅ All invoices generated! Check Frontend/ folder for PDFs.');
  } catch (e) { console.error('ERROR:', e.message); }
  await prisma.$disconnect();
})();
