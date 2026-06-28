import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import * as PDFDocument from 'pdfkit';

@Injectable()
export class DownloadsService {
  async generateTablePdf(title: string, columns: string[], rows: any[][], res: Response, filename = 'export') {
    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}.pdf`);
    doc.pipe(res);
    doc.fontSize(18).text(title, { align: 'center' });
    doc.moveDown();
    const colW = (doc.page.width - 100) / columns.length;
    doc.fontSize(10).font('Helvetica-Bold');
    columns.forEach((c, i) => doc.text(c, 50 + i * colW, doc.y, { width: colW }));
    doc.moveDown(0.5);
    doc.font('Helvetica');
    for (const row of rows) {
      if (doc.y > doc.page.height - 50) doc.addPage();
      row.forEach((v, i) => doc.text(String(v ?? ''), 50 + i * colW, doc.y, { width: colW }));
      doc.moveDown(0.5);
    }
    doc.end();
  }

  private escCsv(v: any): string {
    const s = String(v ?? '');
    return s.includes('"') || s.includes(',') || s.includes('\n') ? '"' + s.replace(/"/g, '""') + '"' : s;
  }

  async generateCsv(columns: string[], rows: any[][], filename: string, res: Response) {
    const safeFilename = filename.replace(/[^a-zA-Z0-9\-_.]/g, '_');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=${safeFilename}.csv`);
    const head = columns.map((c) => this.escCsv(c)).join(',') + '\n';
    const data = rows.map((r) => r.map((v) => this.escCsv(v)).join(',')).join('\n');
    res.send('\uFEFF' + head + data);
  }

  async generateInvoicePdf(invoice: any, lines: any[], res: Response) {
    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${invoice.invoiceNumber}.pdf`);
    doc.pipe(res);

    doc.fontSize(20).text('Invoice', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Invoice #: ${invoice.invoiceNumber}`);
    doc.text(`Date: ${invoice.createdAt?.toISOString().slice(0, 10) ?? ''}`);
    doc.text(`Status: ${invoice.status}`);
    doc.moveDown();
    doc.text(`Customer: ${invoice.customerId}`);
    doc.text(`Meter: ${invoice.meterId}`);
    doc.moveDown();

    doc.fontSize(14).text('Line Items', { underline: true });
    doc.moveDown(0.5);
    for (const line of lines) {
      doc.fontSize(10).text(`${line.description}: ${line.quantity} × ${line.unitPrice} = ${line.lineAmount}`);
    }
    doc.moveDown();
    doc.fontSize(12).text(`Subtotal: ${invoice.subtotalAmount}`);
    doc.text(`Tax: ${invoice.taxAmount}`);
    doc.font('Helvetica-Bold').text(`Total: ${invoice.totalAmount}`);

    doc.end();
  }

}
