const { exec } = require('child_process');
const http = require('http');
exec('node dist/src/main.js', { cwd: 'D:/meter/meter/backend' }, (err, stdout, stderr) => {
  console.log(stdout);
  if (stderr) console.error(stderr);
});
// Wait for server
setTimeout(() => {
  http.get('http://localhost:3001/api/v1/health', (res) => {
    console.log('Backend health:', res.statusCode);
    process.exit(0);
  }).on('error', (e) => {
    console.error('Failed:', e.message);
    process.exit(1);
  });
}, 5000);
