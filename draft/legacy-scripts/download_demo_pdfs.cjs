const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ datasources: { db: { url: 'postgresql://meter_pulse:meter_pulse_dev@127.0.0.1:5432/meter_pulse' } } });
const http = require('http');

async function getToken() {
  return new Promise((resolve) => {
    const d = JSON.stringify({ userId: 'USR-001', name: 'A', role: 'super_admin' });
    const r = http.request({hostname:'localhost',port:3001,path:'/api/v1/auth/dev-login',method:'POST',headers:{'Content-Type':'application/json','Content-Length':Buffer.byteLength(d)}}, (res) => {
      let b=''; res.on('data',c=>b+=c); res.on('end',()=>resolve(JSON.parse(b).accessToken));
    });
    r.write(d); r.end();
  });
}

(async () => {
  const token = await getToken();
  const invoices = await prisma.invoice.findMany({ where: { invoiceNumber: { startsWith: 'DEMO-' } }, orderBy: { createdAt: 'asc' } });
  console.log(`Found ${invoices.length} demo invoices\n`);

  for (const inv of invoices) {
    const filename = `invoice-${inv.invoiceNumber.toLowerCase()}.pdf`;
    const chunks = [];
    await new Promise((resolve) => {
      http.get({hostname:'localhost',port:3001,path:`/api/v1/invoices/${inv.id}/pdf`,method:'GET',headers:{'Authorization':'Bearer '+token}}, (res) => {
        res.on('data', c => chunks.push(c));
        res.on('end', () => {
          const buf = Buffer.concat(chunks);
          const fs = require('fs');
          fs.writeFileSync('D:/meter/Meter/Frontend/' + filename, buf);
          const ok = buf.slice(0,5).toString() === '%PDF-';
          console.log(`  ${inv.invoiceNumber} (${inv.utilityType}): ${buf.length} bytes | ${ok ? '✅ PDF' : '❌'}`);
          resolve();
        });
      });
    });
  }
  console.log('\n✅ Done! Check Frontend/ folder.');
  await prisma.$disconnect();
})();
