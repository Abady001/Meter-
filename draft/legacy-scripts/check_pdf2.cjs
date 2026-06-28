const fs = require('fs');
const buf = fs.readFileSync('D:/meter/Meter/Frontend/solar-invoice-test.pdf');
console.log('Size:', buf.length);
console.log('First 20 bytes:', buf.slice(0, 20).toString('hex'));
console.log('First 20 chars:', buf.slice(0, 20).toString('utf8'));
console.log('Last 20 bytes:', buf.slice(-20).toString('utf8'));
// Check if it contains PDF magic bytes anywhere
const idx = buf.indexOf('%PDF-');
console.log('PDF magic at index:', idx);
if (idx >= 0) {
  console.log('Context:', buf.slice(idx, idx + 20).toString('utf8'));
}
