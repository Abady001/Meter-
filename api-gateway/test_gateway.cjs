const http = require('http');
const apiKey = 'mv_a7bc4923de63e4c439685e42d410ec254babdcb43b100166';

// Test logs
http.get('http://localhost:4000/admin/logs?limit=5', (res) => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => { console.log('Audit Logs:', JSON.stringify(JSON.parse(body), null, 2)); });
});
