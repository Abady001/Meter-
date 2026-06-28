const { InvoiceTemplateService } = require('./dist/src/invoices/invoice-template.service');
const fs = require('fs');

async function main() {
  const svc = new InvoiceTemplateService();
  const doc = {
    lang: 'ar',
    invoiceNumber: 'INV-2026-000001',
    invoiceTitle: 'فاتورة كهرباء',
    utilityType: 'electricity',
    billingPeriod: '1',
    issueDate: 'May-2026',
    dueDate: 'July 2026',
    status: 'مدفوعة',
    companyName: 'شركة بالم هيلز للتطوير العقاري',
    companyNameAr: 'شركة بالم هيلز للتطوير العقاري',
    companyLicense: 'رخصة رقم ( 41 / توزيع )',
    customerId: 'CUS-001',
    customerName: 'أحمد محمد علي',
    customerCode: '30519',
    projectName: 'جولف فيوز - أكتوبر',
    areaName: 'أكتوبر',
    unitNumber: 'A-101',
    meterSerial: '94246446',
    meterType: 'منزلي',
    startReading: 564.049,
    endReading: 628.285,
    consumption: 64.236,
    unit: 'ك.و.س',
    tariffName: '',
    balanceBefore: 0,
    currentCharges: 47.20,
    adjustments: 0,
    payments: 0,
    balanceAfter: 47.20,
    subtotal: 47.20,
    taxAmount: 0,
    totalAmount: 47.20,
    currency: 'EGP',
    chargeLines: [
      { chargeCode: 'CONS', chargeName: 'استهلاك', chargeNameAr: 'قيمة الاستهلاك', chargeGroup: 0, quantity: 64.236, rateAmount: 0.702, lineAmount: 45.10 },
      { chargeCode: 'CS', chargeName: 'خدمة عملاء', chargeNameAr: 'خدمة عملاء', chargeGroup: 2, quantity: 1, rateAmount: 2.00, lineAmount: 2.00 },
      { chargeCode: 'STAMP', chargeName: 'رسوم ودمغات', chargeNameAr: 'رسوم ودمغات', chargeGroup: 1, quantity: 1, rateAmount: 0.10, lineAmount: 0.10 },
    ],
    generatedAt: '2026-06-27',
    qrData: '',
  };

  try {
    const pdf = await svc.generatePdf(doc);
    fs.writeFileSync('sample-invoice.pdf', pdf);
    console.log('Sample invoice generated: sample-invoice.pdf');
  } catch (e) {
    console.error('Error:', e.message);
  }
}
main();
