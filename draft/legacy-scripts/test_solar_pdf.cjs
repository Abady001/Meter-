const http = require('http');
const invoiceId = '40efb586-0184-4021-a2eb-48488d0ff468';

// First get token
const loginData = JSON.stringify({ userId: 'USR-001', name: 'Admin', role: 'super_admin' });
const loginReq = http.request({ hostname: 'localhost', port: 3001, path: '/api/v1/auth/dev-login', method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(loginData) } }, (res) => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => {
    const token = JSON.parse(body).accessToken;
    console.log('Token obtained:', token.substring(0, 20) + '...');

    // Download PDF
    const opts = { hostname: 'localhost', port: 3001, path: `/api/v1/invoices/${invoiceId}/pdf`, method: 'GET', headers: { 'Authorization': 'Bearer ' + token } };
    const pdfReq = http.request(opts, (pdfRes) => {
      const chunks = [];
      pdfRes.on('data', c => chunks.push(c));
      pdfRes.on('end', () => {
        const buf = Buffer.concat(chunks);
        const fs = require('fs');
        fs.writeFileSync('D:/meter/Meter/Frontend/solar-invoice-test.pdf', buf);
        const isPdf = buf.slice(0, 5).toString() === '%PDF-';
        console.log('Status:', pdfRes.statusCode);
        console.log('Size:', buf.length, 'bytes');
        console.log('Valid PDF:', isPdf);
        console.log('Content-Type:', pdfRes.headers['content-type']);
      });
    });
    pdfReq.end();
  });
});
loginReq.write(loginData);
loginReq.end();
