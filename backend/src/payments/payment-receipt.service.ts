import { Injectable, Logger } from '@nestjs/common';
import { Response } from 'express';
import { PaymentReceiptDocument } from './payment-receipt.model';

@Injectable()
export class PaymentReceiptService {
  private readonly logger = new Logger(PaymentReceiptService.name);
  private browserPromise: Promise<any> | null = null;

  private async getBrowser(): Promise<any> {
    if (!this.browserPromise) {
      this.browserPromise = (async () => {
        try {
          const p = require('puppeteer');
          const browser = await p.launch({ headless: true, executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
          return browser;
        } catch (e: any) { this.logger.warn(`Puppeteer: ${e.message}`); return null; }
      })();
    }
    return this.browserPromise;
  }

  async renderReceipt(d: PaymentReceiptDocument, res: Response) {
    const html = this.buildHtml(d);
    const browser = await this.getBrowser();
    if (browser) {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      const pdf = await page.pdf({ format: 'A4', margin: { top: 5, right: 5, bottom: 5, left: 5 } });
      await page.close();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=receipt-${d.receiptNumber}.pdf`);
      return res.send(pdf);
    }
    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=receipt-${d.receiptNumber}.pdf`);
    doc.pipe(res);
    doc.fontSize(20).text('Payment Receipt', { align: 'center' });
    doc.fontSize(12).text(`Receipt #: ${d.receiptNumber}`);
    doc.text(`Amount: ${d.amount}`);
    doc.end();
  }

  private buildHtml(d: PaymentReceiptDocument): string {
    const receiptType = d.meterType === 'electricity' ? 'إيصال دفع - شحن عداد كهرباء' : 'إيصال دفع - شحن عداد المياه';
    return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head><meta charset="utf-8"><style>
  body{font-family:'DejaVu Sans',Arial;font-size:10px;margin:12px;color:#222}
  .header{text-align:center;border-bottom:2px solid #000066;padding-bottom:8px;margin-bottom:10px}
  .header h1{font-size:16px;color:#000066;margin:0}
  .watermark{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%) rotate(-30deg);font-size:60px;color:#FF0033;opacity:0.15;pointer-events:none}
  table{width:100%;border-collapse:collapse;margin-bottom:6px}
  th,td{border:1px solid #999;padding:3px 5px;font-size:9px;text-align:right}
  th{background:#CCCCFF;font-weight:bold;text-align:center}
  .section-title{font-size:11px;font-weight:bold;color:#000066;margin:6px 0 3px 0;padding:2px 5px;background:#E8E8FF}
  .footer{text-align:center;font-size:8px;color:#999;margin-top:10px;border-top:1px solid #ccc;padding-top:5px}
  .amount{text-align:left;font-family:'DejaVu Sans Mono',monospace}
  .logo{max-height:45px;max-width:130px}
</style></head>
<body>
  ${d.status === 'reversed' ? '<div class="watermark">ملغيــــة</div>' : ''}
  <div class="header">
    ${d.companyLogo ? `<img src="${d.companyLogo}" class="logo" />` : ''}
    <h1>${receiptType}</h1>
    <div>${d.companyNameAr || d.companyName}</div>
    <div style="font-size:8px;color:#666">${d.companyLicense || ''}</div>
  </div>

  <div class="section-title">معلومات الإيصال / Receipt Information</div>
  <table>
    <tr><th>رقم الإيصال</th><td>${d.receiptNumber}</td><th>التاريخ</th><td>${d.paymentDate}</td><th>طريقة الدفع</th><td>${d.paymentMethod}</td></tr>
  </table>

  <div class="section-title">العميل / Customer</div>
  <table>
    <tr><th>الاسم</th><td>${d.customerNameAr || d.customerName}</td><th>الوحدة</th><td>${d.unitNumber || '-'}</td></tr>
    <tr><th>العداد</th><td>${d.meterSerial}</td><th>النوع</th><td>${d.meterType}</td></tr>
  </table>

  <div class="section-title">المبالغ / Amounts (EGP)</div>
  <table>
    <tr><th>الرصيد السابق</th><td class="amount">${d.balanceBefore.toFixed(3)}</td></tr>
    <tr><th>المبلغ المدفوع</th><td class="amount"><b>${d.amount.toFixed(3)}</b></td></tr>
    ${d.paymentFees > 0 ? `<tr><th>رسوم الدفع</th><td class="amount">${d.paymentFees.toFixed(3)}</td></tr>` : ''}
    ${d.settlementAmount > 0 ? `<tr><th>تسوية</th><td class="amount">${d.settlementAmount.toFixed(3)}</td></tr>` : ''}
    <tr style="font-weight:bold;background:#E8E8FF"><th>الرصيد بعد الدفع</th><td class="amount">${d.balanceAfter.toFixed(3)}</td></tr>
  </table>

  <table>
    <tr><th>المحصل</th><td>${d.collectorName}</td></tr>
    ${d.chequeNumber ? `<tr><th>رقم الشيك</th><td>${d.chequeNumber}</td><th>البنك</th><td>${d.bankName || ''}</td></tr>` : ''}
    ${d.transferNumber ? `<tr><th>رقم التحويل</th><td>${d.transferNumber}</td></tr>` : ''}
    <tr><th>آخر قراءة</th><td>${d.lastReadingDate ? `${d.lastReadingDate} (${d.lastReadingValue ?? '-'})` : '-'}</td></tr>
  </table>

  <div class="footer">
    ${d.companyBankDetails ? `<div>${d.companyBankDetails}</div>` : ''}
    ${d.companySignature ? `<img src="${d.companySignature}" style="max-height:25px" />` : ''}
    <div>Meter Verse / عالم العدادات</div>
  </div>
</body></html>`;
  }
}
