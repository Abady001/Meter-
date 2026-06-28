const http = require('http');
const data = JSON.stringify({ userId: 'USR-001', name: 'Admin', role: 'super_admin' });
const loginReq = http.request({ hostname: 'localhost', port: 3001, path: '/api/v1/auth/dev-login', method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) } }, (res) => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => {
    const token = JSON.parse(body).accessToken;
    console.log('Token:', token.substring(0, 20) + '...');

    // Try downloading first existing invoice
    const invReq = http.request({ hostname: 'localhost', port: 3001, path: '/api/v1/invoices', method: 'GET', headers: { 'Authorization': 'Bearer ' + token } }, (invRes) => {
      let invBody = '';
      invRes.on('data', d => invBody += d);
      invRes.on('end', () => {
        const invoices = JSON.parse(invBody);
        console.log('Invoices found:', invoices.length);
        if (invoices.length > 0) {
          const invId = invoices[0].id;
          console.log('Downloading PDF for invoice:', invId);

          const pdfReq = http.request({ hostname: 'localhost', port: 3001, path: `/api/v1/invoices/${invId}/pdf`, method: 'GET', headers: { 'Authorization': 'Bearer ' + token } }, (pdfRes) => {
            const chunks = [];
            pdfRes.on('data', c => chunks.push(c));
            pdfRes.on('end', () => {
              const buf = Buffer.concat(chunks);
              const fs = require('fs');
              fs.writeFileSync('D:/meter/Meter/Frontend/test-invoice.pdf', buf);
              console.log('Status:', pdfRes.statusCode);
              console.log('Size:', buf.length);
              console.log('Content-Type:', pdfRes.headers['content-type']);
              console.log('First 8 bytes:', buf.slice(0, 8).toString());
            });
          });
          pdfReq.end();
        }
      });
    });
    invReq.end();
  });
});
loginReq.write(data);
loginReq.end();
