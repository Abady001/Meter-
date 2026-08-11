const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const code = fs.readFileSync(path.join(__dirname, '..', 'google-apps-script', 'Code.gs'), 'utf8');
const context = vm.createContext({ console });
vm.runInContext(code, context, { filename: 'Code.gs' });

const tariffs = [
  { Version: 'DEMO-2026', Service_Type: 'Electricity', Tariff_Profile: 'DEMO-ELECTRICITY', Calculation_Method: 'Progressive', Band_Order: 1, Min_Band: 0, Max_Band: 100, Rate: 1, Customer_Service_Fee: 40, Admin_Fee: 0, Stamp_Tax_Rate: 0.032, Stamp_Tax_Basis: 'Consumption', Fixed_Fee: 0.1, Effective_From: new Date('2026-01-01'), Effective_To: new Date('2026-12-31'), Approval_Status: 'Draft' },
  { Version: 'DEMO-2026', Service_Type: 'Electricity', Tariff_Profile: 'DEMO-ELECTRICITY', Calculation_Method: 'Progressive', Band_Order: 2, Min_Band: 100, Max_Band: 250, Rate: 1.2, Customer_Service_Fee: 40, Admin_Fee: 0, Stamp_Tax_Rate: 0.032, Stamp_Tax_Basis: 'Consumption', Fixed_Fee: 0.1, Effective_From: new Date('2026-01-01'), Effective_To: new Date('2026-12-31'), Approval_Status: 'Draft' },
  { Version: 'DEMO-2026', Service_Type: 'Electricity', Tariff_Profile: 'DEMO-ELECTRICITY', Calculation_Method: 'Progressive', Band_Order: 3, Min_Band: 250, Max_Band: '', Rate: 1.5, Customer_Service_Fee: 40, Admin_Fee: 0, Stamp_Tax_Rate: 0.032, Stamp_Tax_Basis: 'Consumption', Fixed_Fee: 0.1, Effective_From: new Date('2026-01-01'), Effective_To: new Date('2026-12-31'), Approval_Status: 'Draft' },
];

context.getTable_ = () => ({ rows: tariffs });
const meter = { Tariff_Profile: 'DEMO-ELECTRICITY', Service_Type: 'Electricity' };
const first = context.calculateBill_(meter, 20, new Date('2026-06-30'), true);
assert.strictEqual(first.consumptionAmount, 20);
assert.strictEqual(Number(first.total.toFixed(2)), 60.74);

const second = context.calculateBill_(meter, 300, new Date('2026-06-30'), true);
assert.strictEqual(second.consumptionAmount, 355);
assert.strictEqual(Number(second.total.toFixed(2)), 404.70);

console.log('Apps Script billing logic tests passed.');
