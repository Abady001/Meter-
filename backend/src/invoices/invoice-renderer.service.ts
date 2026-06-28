import { Injectable, Logger } from '@nestjs/common';
import { Response } from 'express';

@Injectable()
export class InvoiceRendererService {
  private readonly logger = new Logger(InvoiceRendererService.name);
  private browserPromise: Promise<any> | null = null;

  private async getBrowser(): Promise<any> {
    if (!this.browserPromise) {
      this.browserPromise = (async () => {
        try {
          const p = require('puppeteer');
          const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
          const browser = await p.launch({
            headless: true,
            executablePath: chromePath,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
          });
          this.logger.log('Puppeteer browser launched');
          return browser;
        } catch (err: any) {
          this.logger.warn(`Puppeteer unavailable: ${err.message}`);
          return null;
        }
      })();
    }
    return this.browserPromise;
  }

  async renderInvoicePdf(data: any, res: Response) {
    const html = this.buildInvoiceHtml(data);
    const browser = await this.getBrowser();

    if (browser) {
      try {
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });
        const pdf = await page.pdf({ format: 'A4', landscape: true, margin: { top: 5, right: 5, bottom: 5, left: 5 } });
        await page.close();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=invoice-${data.invoiceNumber}.pdf`);
        return res.send(pdf);
      } catch (err: any) {
        this.logger.warn(`Puppeteer render failed: ${err.message}, falling back to pdfkit`);
      }
    }

    // Fallback to pdfkit
    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${data.invoiceNumber}.pdf`);
    doc.pipe(res);
    doc.fontSize(20).text('Invoice', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Invoice #: ${data.invoiceNumber}`);
    doc.text(`Total: ${data.totalAmount}`);
    doc.end();
  }

  async renderBatchPdf(invoices: any[], res: Response) {
    const archiver = require('archiver');
    const zip = archiver('zip');
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename=invoices-batch.zip');
    zip.pipe(res);

    const browser = await this.getBrowser();
    let count = 0;

    for (const inv of invoices) {
      try {
        if (browser) {
          const html = this.buildInvoiceHtml(inv);
          const page = await browser.newPage();
          await page.setContent(html, { waitUntil: 'networkidle0' });
          const pdf = await page.pdf({ format: 'A4', landscape: true, margin: { top: 5, right: 5, bottom: 5, left: 5 } });
          await page.close();
          zip.append(pdf, { name: `invoice-${inv.invoiceNumber}.pdf` });
          count++;
        } else {
          zip.append(Buffer.from(`Invoice ${inv.invoiceNumber}: ${inv.totalAmount}`), { name: `invoice-${inv.invoiceNumber}.txt` });
          count++;
        }
      } catch (err: any) {
        this.logger.warn(`Failed to generate ${inv.invoiceNumber}: ${err.message}`);
        zip.append(Buffer.from(`Error: ${err.message}`), { name: `error-${inv.invoiceNumber}.txt` });
      }
    }

    this.logger.log(`Batch: ${count}/${invoices.length} generated`);
    zip.finalize();
  }

  private buildInvoiceHtml(data: any): string {
    const { invoiceNumber, customerName, meterSerial, consumption, lines, subtotal, taxAmount, totalAmount, issueDate, status } = data;
    const lineRows = (lines ?? []).map((l: any) => `
      <tr><td style="text-align:right">${l.description}</td><td style="text-align:center">${l.quantity}</td><td style="text-align:right">${l.unitPrice}</td><td style="text-align:right">${l.lineAmount}</td></tr>
    `).join('');

    return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head><meta charset="utf-8"><style>
  body{font-family:'DejaVu Sans',Arial;font-size:11px;margin:15px}
  h2{text-align:center;color:#000066;margin-bottom:15px}
  table{width:100%;border-collapse:collapse;margin-bottom:8px}
  th,td{border:1px solid #999;padding:3px 6px;font-size:10px}
  th{background:#CCCCFF;font-weight:bold;text-align:center}
  .label{color:#666;font-size:9px}
</style></head>
<body>
<h2>فاتورة كهرباء</h2>
<table>
  <tr><th>رقم الفاتورة</th><td>${invoiceNumber}</td><th>التاريخ</th><td>${issueDate ?? ''}</td><th>الحالة</th><td>${status ?? ''}</td></tr>
  <tr><th>العميل</th><td colspan="2">${customerName ?? ''}</td><th>العداد</th><td colspan="2">${meterSerial ?? ''}</td></tr>
  <tr><th>الاستهلاك</th><td colspan="5">${consumption ?? 0}</td></tr>
</table>
<table>
  <tr><th>البيان</th><th>الكمية</th><th>سعر الوحدة</th><th>الإجمالي</th></tr>
  ${lineRows || '<tr><td colspan="4" style="text-align:center">لا توجد بنود</td></tr>'}
</table>
<table>
  <tr><td>الإجمالي قبل الضريبة</td><td>${subtotal ?? 0}</td></tr>
  <tr><td>الضريبة</td><td>${taxAmount ?? 0}</td></tr>
  <tr><td style="font-weight:bold">الإجمالي</td><td style="font-weight:bold">${totalAmount ?? 0}</td></tr>
</table>
<p style="text-align:center;font-size:8px;color:#666;margin-top:15px">Meter Verse / عالم العدادات</p>
</body></html>`;
  }
}
