const http = require('http');
// Simple test: call the invoice PDF endpoint and dump first bytes
const req = http.get('http://localhost:3001/api/v1/invoices/40efb586-0184-4021-a2eb-48488d0ff468/pdf', { headers: { 'Authorization': 'Bearer test' } }, (res) => {
  let data = '';
  res.on('data', d => { data += d.toString('utf8').slice(0, 200); res.destroy(); });
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Headers:', JSON.stringify(res.headers));
    console.log('First 200 chars:', data.slice(0, 200));
  });
});
req.end();
