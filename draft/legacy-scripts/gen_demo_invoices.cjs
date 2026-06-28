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

const invoices = [
  // Electricity (3 invoices - low, medium, high consumption)
  { type: 'electricity', num: 'DEMO-ELEC-001', cons: 320, rate: 1.5, desc: 'Residential Consumption (شقة)' },
  { type: 'electricity', num: 'DEMO-ELEC-002', cons: 1250, rate: 2.0, desc: 'Commercial Consumption (محل)' },
  { type: 'electricity', num: 'DEMO-ELEC-003', cons: 4500, rate: 2.8, desc: 'Industrial Consumption (مصنع)' },
  // Water (2 invoices)
  { type: 'water', num: 'DEMO-WATER-001', cons: 45, rate: 3.5, desc: 'Residential Water (مياه شقة)' },
  { type: 'water', num: 'DEMO-WATER-002', cons: 180, rate: 5.0, desc: 'Commercial Water (مياه محل)' },
  // Solar (2 invoices - one with net export, one with net import)
  { type: 'solar', num: 'DEMO-SOLAR-001', cons: 280, rate: 1.5, desc: 'Solar Net Import (استيراد)', extra: 'Solar Credit: +150 kWh' },
  { type: 'solar', num: 'DEMO-SOLAR-002', cons: 50, rate: 1.5, desc: 'Solar Net Export (تصدير)', extra: 'Surplus: +230 kWh' },
  // Chilled Water (1 invoice)
  { type: 'chilled_water', num: 'DEMO-CW-001', cons: 3500, rate: 3.0, desc: 'Chilled Water BTU (مياه مثلجة)', extra: 'RT: 3500' },
  // Outdoor Unit (1 invoice)
  { type: 'outdoor_unit', num: 'DEMO-OU-001', cons: 2200, rate: 2.44, desc: 'Outdoor Unit BTU (تكييف خارجي)' },
  // Settlement (1 invoice)
  { type: 'settlement', num: 'DEMO-SET-001', cons: 0, rate: 0, desc: 'Settlement Invoice (تسوية)', extra: 'Fixed Amount: +500 EGP' },
  // Extra electricity for variety
  { type: 'electricity', num: 'DEMO-ELEC-004', cons: 780, rate: 1.75, desc: 'Medium Office (مكتب متوسط)' },
];

async function getToken() {
  return new Promise((resolve) => {
    const d = JSON.stringify({ userId: 'USR-001', name: 'Admin', role: 'super_admin' });
    const r = http.request({ hostname: 'localhost', port: 3001, path: '/api/v1/auth/dev-login', method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(d) } }, (res) => {
      let b = ''; res.on('data', c => b += c);
      res.on('end', () => resolve(JSON.parse(b).accessToken));
    });
    r.write(d); r.end();
  });
}

async function downloadPdf(token, invoiceId, filename) {
  return new Promise((resolve) => {
    const chunks = [];
    http.get({ hostname: 'localhost', port: 3001, path: `/api/v1/invoices/${invoiceId}/pdf`, method: 'GET', headers: { 'Authorization': 'Bearer ' + token } }, (res) => {
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        const buf = Buffer.concat(chunks);
        const fs = require('fs');
        fs.writeFileSync('D:/meter/Meter/Frontend/' + filename, buf);
        const ok = buf.slice(0, 5).toString() === '%PDF-';
        console.log(`  ${filename}: ${res.statusCode} | ${buf.length} bytes | ${ok ? '✅' : '❌'}`);
        resolve(ok);
      });
    });
  });
}

(async () => {
  try {
    const token = await getToken();
    console.log('\n=== GENERATING 11 DEMO INVOICES ===\n');

    // Clean old demo invoices first
    await prisma.invoiceLine.deleteMany({ where: { invoiceId: { in: (await prisma.invoice.findMany({ where: { invoiceNumber: { startsWith: 'DEMO-' } }, select: { id: true } })).map(i => i.id) } } });
    await prisma.invoice.deleteMany({ where: { invoiceNumber: { startsWith: 'DEMO-' } } });
    console.log('Cleaned old demo invoices\n');

    // Delete old demo PDFs
    const fs = require('fs');
    const path = require('path');
    const dir = 'D:/meter/Meter/Frontend/';
    fs.readdirSync(dir).filter(f => f.startsWith('invoice-')).forEach(f => fs.unlinkSync(path.join(dir, f)));

    for (const inv of invoices) {
      const chargeAmt = inv.type === 'settlement' ? 500 : inv.cons * inv.rate;
      const vatAmt = inv.type === 'settlement' ? 0 : chargeAmt * 0.14;
      const total = chargeAmt + vatAmt;
      const unit = inv.type === 'water' ? 'm³' : inv.type === 'chilled_water' ? 'RT' : inv.type === 'outdoor_unit' ? 'BTU' : 'kWh';

      const invoice = await prisma.invoice.create({
        data: {
          projectId, customerId, meterId: meterIds[inv.type] || meterIds.electricity,
          unitId: 'system', utilityType: inv.type,
          invoiceNumber: inv.num, status: 'issued',
          subtotalAmount: chargeAmt, taxAmount: vatAmt, totalAmount: total,
          paidAmount: 0, remainingAmount: total,
          billingPeriodId: 'DEMO-BP-2026-06', billingPeriodCode: '2026-06',
          issuedAt: new Date(), dueAt: new Date(Date.now() + 30 * 86400000),
        },
      });

      const lines = [{ invoiceId: invoice.id, description: inv.desc, quantity: inv.cons || 1, unitPrice: inv.rate || 500, lineAmount: chargeAmt, chargeGroup: 0 }];
      if (inv.extra) lines.push({ invoiceId: invoice.id, description: inv.extra, quantity: 0, unitPrice: 0, lineAmount: inv.type === 'settlement' ? 500 : 0, chargeGroup: inv.type === 'solar' ? 9 : 12 });
      await prisma.invoiceLine.createMany({ data: lines });

      const filename = `invoice-${inv.num.toLowerCase()}.pdf`;
      process.stdout.write(`  ${inv.num} (${inv.type})... `);
      await downloadPdf(token, invoice.id, filename);
    }

    console.log('\n✅ All 11 invoices generated!');
    console.log('\n📁 Files in Frontend/ folder:');
    const files = require('fs').readdirSync('D:/meter/Meter/Frontend/').filter(f => f.startsWith('invoice-demo') && f.endsWith('.pdf'));
    files.forEach(f => console.log(`  📄 ${f}`));
  } catch (e) { console.error('\n❌ ERROR:', e.message); }
  await prisma.$disconnect();
})();
