import { Injectable, Logger, StreamableFile } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { InvoiceDocument } from './invoice-document.model';
import { getChargeGroupName } from './charge-groups';
import { amountInWordsAr, amountInWordsEn } from '../utilities/amount-words';
import { getTemplateConfig, TemplateConfig } from './template-config';

@Injectable()
export class InvoiceTemplateService {
  private readonly logger = new Logger(InvoiceTemplateService.name);
  private browserPromise: Promise<any> | null = null;
  private templateCache: Map<string, string> = new Map();

  private loadAsset(filename: string): string {
    if (this.templateCache.has(filename)) {
      return this.templateCache.get(filename)!;
    }
    const paths = [
      path.join(__dirname, filename),
      path.join(process.cwd(), 'src', 'invoices', filename),
      path.join(process.cwd(), 'dist', 'src', 'invoices', filename),
    ];
    for (const p of paths) {
      try {
        const content = fs.readFileSync(p, 'utf8');
        this.templateCache.set(filename, content);
        return content;
      } catch { /* try next */ }
    }
    this.logger.warn(`Asset ${filename} not found, using inline fallback`);
    return '';
  }

  private async getBrowser(): Promise<any> {
    if (!this.browserPromise) {
      this.browserPromise = (async () => {
        try {
          const p = require('puppeteer');
          const browser = await p.launch({ headless: true, executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
          this.logger.log('Puppeteer ready');
          return browser;
        } catch (e: any) {
          this.logger.warn(`Puppeteer unavailable: ${e.message}`);
          return null;
        }
      })();
    }
    return this.browserPromise;
  }

  async generatePdf(doc: InvoiceDocument): Promise<Buffer> {
    const html = this.buildHtml(doc);
    const browser = await this.getBrowser();
    if (browser) {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      const pdf = await page.pdf({ format: 'A4', landscape: true, margin: { top: 5, right: 5, bottom: 5, left: 5 } });
      await page.close();
      return Buffer.from(pdf);
    }
    // Fallback to pdfkit
    const PDFDocument = require('pdfkit');
    return new Promise((resolve) => {
      const chunks: Buffer[] = [];
      const doc2 = new PDFDocument({ margin: 50 });
      doc2.on('data', (c: Buffer) => chunks.push(c));
      doc2.on('end', () => resolve(Buffer.concat(chunks)));
      doc2.fontSize(20).text(doc.invoiceTitle, { align: 'center' });
      doc2.fontSize(12).text(`Invoice #: ${doc.invoiceNumber}`);
      doc2.text(`Total: ${doc.totalAmount}`);
      doc2.end();
    });
  }

  /** Build final HTML by loading template + CSS + replacing variables */
  buildHtml(d: InvoiceDocument): string {
    const cfg = getTemplateConfig(d.utilityType);
    const ul = cfg.unitLabel || d.unit || 'ك.و.س';
    const isSettlement = d.utilityType?.toLowerCase().includes('settlement');
    const isSolar = d.utilityType?.toLowerCase().includes('solar');

    // Pick template file
    const templateFile = isSettlement ? 'invoice-settlement-template.html'
      : isSolar ? 'invoice-solar-template.html'
      : 'invoice-template.html';

    // Load CSS + template
    const cssContent = this.loadAsset('invoice-template.css');
    let html = this.loadAsset(templateFile);
    if (!html) {
      // Inline fallback if files not found
      return this.buildHtmlInline(d);
    }

    // Group charge lines
    const colValues: number[] = cfg.chargeColumns.map(() => 0);
    let settlementSigned = 0;
    let consAmount = 0;
    let adminAmount = 0;
    let csAmount = 0;
    let otherAmount = 0;

    for (const l of d.chargeLines) {
      const g = l.chargeGroup;
      for (let i = 0; i < cfg.chargeColumns.length; i++) {
        if (cfg.chargeColumns[i].chargeGroups.includes(g)) {
          const val = cfg.chargeColumns[i].format === 'amount' ? l.lineAmount : l.quantity;
          colValues[i] += (cfg.chargeColumns[i].format === 'abs-amount' ? Math.abs(l.lineAmount) : val);
          if (g === 6) settlementSigned += l.lineAmount;
          if (g === 0) consAmount += l.lineAmount;
          if (g === 4) adminAmount += l.lineAmount;
          if (g === 2 || g === 3) csAmount += l.lineAmount;
          if (g === 1) otherAmount += l.lineAmount;
          break;
        }
      }
    }

    const fmt = (v: number) => v.toFixed(3);
    const settlementDisplay = fmt(Math.abs(settlementSigned));
    const settlementIsCredit = settlementSigned < 0;
    const isDeleted = d.status === 'cancelled' || d.status === 'DELETED';

    // Build charge rows
    const chargeRows = d.chargeLines.map(l => {
      const chargeName = l.chargeNameAr || l.chargeName;
      return `<tr><td>${chargeName}</td><td class="val-center">${l.quantity}</td><td class="val-center">${l.rateAmount.toFixed(3)}</td><td class="val-left">${l.lineAmount.toFixed(3)}</td><td></td></tr>`;
    }).join('');

    // Load default images from assets
    const assetPath = path.join(__dirname, 'assets');
    const logoPath = path.join(process.cwd(), 'src', 'invoices', 'assets');
    let defaultLogo = '';
    let defaultSignature = '';
    try {
      const logoFile = path.join(logoPath, 'image1.png');
      if (fs.existsSync(logoFile)) {
        const b64 = fs.readFileSync(logoFile).toString('base64');
        defaultLogo = `data:image/png;base64,${b64}`;
      }
      const sigFile = path.join(logoPath, 'image2.jpeg');
      if (fs.existsSync(sigFile)) {
        const b64 = fs.readFileSync(sigFile).toString('base64');
        defaultSignature = `data:image/jpeg;base64,${b64}`;
      }
    } catch { /* ignore */ }

    // Variable replacements
    const capacityAmount = '0.000';
    const discountAmount = '0.000';
    const logo = d.companyLogo || defaultLogo;
    const sigImg = d.companySignature || defaultSignature;

    const vr: Record<string, string> = {};
    const v = (key: string, val: string) => { vr[key] = val; };

    // Bilingual labels
    const lang = d.language || 'ar';
    const isAr = lang === 'ar';

    const L = (ar: string, en: string) => isAr ? ar : en;

    v('CSS_CONTENT', cssContent);
    v('LANG', lang);
    v('DELETED_WATERMARK', isDeleted ? `<div class="dl">${L('ملغيــــة','DELETED')}</div>` : '');
    v('CHARGE_ROWS', chargeRows);
    v('COMPANY_BANK_DETAILS', d.companyBankDetails || '');
    v('AREA_NAME', d.areaName || '-');
    v('LBL_AREA', L('المنطقة:','Area:'));
    v('LBL_UNIT', L('وحدة رقم:','Unit No:'));
    v('LBL_INV_NUM', L('رقم','No.'));
    v('LBL_CUSTOMER', L('السيد/','Mr.'));
    v('LBL_ADDRESS', L('العنوان/','Address:'));
    v('LBL_TOTAL_LABEL', L('إجمالي الفاتورة (جم)','Total Invoice (EGP)'));
    v('LBL_TOTAL', L('المبلغ الإجمالي','Total'));
    v('LBL_SIGNATURE', L('العضو المنتدب /','Managing Director /'));
    v('INVOICE_TITLE', d.invoiceTitle);
    v('LOGO_IMG', logo ? `<img src="${logo}" />` : '');
    v('PROJECT_NAME', d.projectName || '-');
    v('METER_COUNT', '1');
    v('CAPACITY_AMOUNT', capacityAmount);
    v('CAPACITY_VALUE', capacityAmount);
    v('DISCOUNT_AMOUNT', discountAmount);
    v('UNIT_NUMBER', d.unitNumber || '-');
    v('COMPANY_NAME', d.companyName || '');
    v('COMPANY_LICENSE', d.companyLicense || '');
    v('COMPANY_INFO', d.companyNameAr || d.companyName || '');
    v('INVOICE_NUMBER', d.invoiceNumber);
    v('METER_TYPE', d.meterType || d.utilityType || '');
    v('CUSTOMER_CODE', d.customerCode || d.customerId?.substring(0, 8) || '');
    v('ISSUE_DATE', d.issueDate);
    v('BILLING_PERIOD', d.billingPeriod);
    v('METER_SERIAL', d.meterSerial);
    v('UNIT_LABEL', cfg.unitLabelEN || ul);
    v('CUSTOMER_NAME', d.customerName);
    v('END_READING', d.endReading?.toString() ?? '-');
    v('START_READING', d.startReading?.toString() ?? '-');
    v('CURRENT_READING', d.endReading?.toString() ?? '-');
    v('PREVIOUS_READING', d.startReading?.toString() ?? '-');
    v('CONSUMPTION', d.consumption.toString());
    v('CONSUMPTION_UNITS', d.consumption.toString());
    v('COL0_LABEL', cfg.col0Label);
    v('ADDRESS', d.address || '-');
    v('CUSTOMER_ADDRESS', d.address || '-');
    v('CONS_AMOUNT', fmt(consAmount));
    v('CONSUMPTION_VALUE', fmt(consAmount));
    v('STATUS', d.status);
    v('ADMIN_AMOUNT', fmt(adminAmount));
    v('ADMIN_FEES', fmt(adminAmount));
    v('SETTLEMENT_AMOUNT', settlementDisplay);
    v('SETTLEMENT_TYPE', d.utilityType);
    v('OTHER_AMOUNT', fmt(otherAmount));
    v('STAMP_FEES', fmt(otherAmount));
    v('CS_AMOUNT', fmt(csAmount));
    v('CUSTOMER_SERVICE_FEES', fmt(csAmount));
    v('TOTAL_AMOUNT', fmt(d.totalAmount));
    v('AMOUNT_WORDS_AR', amountInWordsAr(d.totalAmount));
    v('AMOUNT_IN_WORDS', isAr ? amountInWordsAr(d.totalAmount) : amountInWordsEn(d.totalAmount));
    v('LICENSE_TEXT', d.companyLicense ? `${L('ترخيص:','License:')} ${d.companyLicense}` : '');
    v('SIGNATURE_IMG', sigImg ? `<img src="${sigImg}" />` : '');
    v('GENERATED_AT', d.generatedAt);
    v('DESCRIPTION', d.chargeLines.map(l => l.chargeNameAr || l.chargeName).join(', '));

    // Grid header labels
    const hLabels = cfg.headerRowLabels || ['نوع النشاط','كود العميل','تاريخ الإصدار','اشهر المحاسبة','رقم العداد'];
    const hLabelsEn = cfg.headerRowLabelsEn || ['Activity Type','Customer Code','Issue Date','Billing Months','Meter No.'];
    for (let i = 0; i < 5; i++) {
      v(`H${i+1}`, isAr ? (hLabels[i] || '') : (hLabelsEn[i] || ''));
    }
    v('H6', isAr ? 'عدد العددات' : 'Meters Count');
    v('H7', isAr ? `حالية (${ul})` : `Current (${cfg.unitLabelEN || ul})`);
    v('H8', isAr ? 'مقابل القدرة' : 'Capacity');
    v('H9', isAr ? `سابقة (${ul})` : `Previous (${cfg.unitLabelEN || ul})`);

    // Charge matrix headers
    const chLabels = cfg.chargeColumns.map(c => c.label);
    const chLabelsEn = cfg.chargeColumns.map(c => c.labelEn || c.label);
    for (let i = 0; i < 7 && i < chLabels.length; i++) {
      v(`CH${i+1}`, isAr ? chLabels[i] : (chLabelsEn[i] || chLabels[i]));
    }

    const vars = vr;

    // Replace all {{VARIABLE}} placeholders
    for (const [key, val] of Object.entries(vars)) {
      html = html.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), val);
    }

    return html;
  }

  /** Fallback inline HTML builder if template files not found */
  private buildHtmlInline(d: InvoiceDocument): string {
    const cfg = getTemplateConfig(d.utilityType);
    const ul = cfg.unitLabel || d.unit || 'ك.و.س';

    const colValues: number[] = cfg.chargeColumns.map(() => 0);
    let settlementSigned = 0;
    let consAmount = 0;
    for (const l of d.chargeLines) {
      const g = l.chargeGroup;
      for (let i = 0; i < cfg.chargeColumns.length; i++) {
        if (cfg.chargeColumns[i].chargeGroups.includes(g)) {
          const val = cfg.chargeColumns[i].format === 'amount' ? l.lineAmount : l.quantity;
          colValues[i] += (cfg.chargeColumns[i].format === 'abs-amount' ? Math.abs(l.lineAmount) : val);
          if (g === 6) settlementSigned += l.lineAmount;
          if (g === 0) consAmount += l.lineAmount;
          break;
        }
      }
    }

    const fmt = (v: number) => v.toFixed(3);
    const settlementDisplay = fmt(Math.abs(colValues[2]));
    const settlementIsCredit = settlementSigned < 0;
    const isDeleted = d.status === 'cancelled' || d.status === 'DELETED';

    return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head><meta charset="utf-8"><style>
  @page{size:${cfg.pageWidth}pt ${cfg.pageHeight}pt;margin:4pt}
  body{font-family:'DejaVu Sans',sans-serif;font-size:7pt;margin:0;color:#000;line-height:1.05;background:#fff}
  .bn{background:#CC0000;height:9pt;margin:0 0 3pt 0}
  .hdr{width:100%;border-collapse:collapse}
  .hdr td{padding:0;vertical-align:middle;border:none}
  .ab{border:.25pt solid #999;padding:1.5pt 3pt;font-size:6.5pt;text-align:right}
  .tt{text-align:center;color:#000066;font-size:8pt;font-weight:bold}
  .lg{text-align:left}.lg img{max-height:26pt;max-width:110pt}
  .if{width:100%;border-collapse:collapse;margin:2pt 0}
  .if td{padding:0;border:none;vertical-align:top}
  .il{font-size:6.5pt;line-height:1.4}.il .lb{color:#000066;font-size:7pt}
  .cb{border:.25pt solid #999;text-align:center;padding:1.5pt;font-size:6.5pt}
  .iv{text-align:right;font-size:7pt;padding:1pt 0}.iv .lb{color:#000066;font-size:7pt}
  .g{width:100%;border-collapse:collapse;margin-bottom:1pt}
  .g td,.g th{border:.25pt solid #999;padding:1pt 2pt;font-size:6.5pt;text-align:right;vertical-align:middle}
  .g th{background:#CCCCFF;font-weight:bold;text-align:center;font-size:6pt}
  .al{text-align:left;font-family:'DejaVu Sans Mono',monospace;direction:ltr;font-size:6.5pt}
  .ac{text-align:center;font-family:'DejaVu Sans Mono',monospace;direction:ltr;font-size:6.5pt}
  .b{font-weight:bold}.c{text-align:center}
  .aw{font-size:5.5pt;line-height:1.2;padding:1.5pt 3pt;text-align:center;border:.25pt solid #999}
  .tl{background:#CCCCFF;font-weight:bold;text-align:center;font-size:6.5pt}
  .tn{border:none;border-top:4pt solid #000099;margin:2pt 0 1pt 0}
  .sg td{padding:1pt;border:none;vertical-align:middle}
  .sl{color:#000066;font-size:7pt;font-weight:bold;text-align:right}
  .si{text-align:left}.si img{max-height:18pt}
  .ft{text-align:center;font-size:5pt;color:#666;margin-top:1pt}
  .dl{position:absolute;top:10pt;left:16pt;right:16pt;bottom:16pt;color:#FF0033;font-size:60pt;font-weight:bold;text-align:center;opacity:.25;pointer-events:none;display:flex;align-items:center;justify-content:center}
</style></head>
<body style="position:relative">
${isDeleted?'<div class="dl">ملغيــــة</div>':''}
<div class="bn">&nbsp;</div>
<table class="hdr"><tr><td style="width:25%"><div class="ab">${d.areaName||'أكتوبر'}</div></td><td style="width:50%"><div class="tt">${d.invoiceTitle}</div></td><td class="lg" style="width:25%">${d.companyLogo?`<img src="${d.companyLogo}" />`:''}</td></tr></table>
<table class="if"><tr><td style="width:72%"><div class="il"><div><span class="lb">المنطقة :</span> ${d.areaName||'-'}</div><div><span class="lb">المشروع :</span> ${d.projectName||'-'}</div><div><span class="lb">وحدة رقم:</span> ${d.unitNumber||'-'}</div></div></td><td style="width:28%"><div class="cb">${d.companyName||''}<br><span style="font-size:5.5pt;color:#666">${d.companyLicense||''}</span></div></td></tr></table>
<div class="iv"><span class="lb">رقم </span>${d.invoiceNumber}</div>
<table class="g"><tr>${cfg.headerRowLabels.map((l,i)=>`<th style="width:${i<5?14:15}%">${l}</th>`).join('')}<th style="width:15%">عدد العدادات</th><th style="width:15%">مقابل القدرة</th></tr>
<tr><td>${d.meterType||d.utilityType}</td><td>${d.customerCode||d.customerId.substring(0,8)}</td><td class="c">${d.issueDate}</td><td class="c">${d.billingPeriod}</td><td class="ac">${d.meterSerial}</td><td class="c">1</td><td class="c">-</td></tr></table>
<table class="g"><tr><th style="width:14.5%">عدد العدادات</th><th style="width:42.5%" colspan="3">السيد/</th><th style="width:14%">حالية (${ul})</th><th style="width:14%">سابقة (${ul})</th><th style="width:15%">الإستهلاك (${ul})</th></tr>
<tr><td class="c">1</td><td style="width:42.5%" colspan="3">${d.customerName}</td><td class="ac">${d.endReading??'-'}</td><td class="ac">${d.startReading??'-'}</td><td class="ac b">${d.consumption}</td></tr></table>
<table class="g"><tr><th style="width:14.5%">${cfg.col0Label}</th><th style="width:42.5%" colspan="3">العنوان/</th><th style="width:14%">قيمة الإستهلاك (جم)</th><th style="width:14%">إجمالي الإستهلاك</th><th style="width:15%">حالة الفاتورة</th></tr>
<tr><td class="al">0.000</td><td colspan="3">${d.address||'-'}</td><td class="al b">${fmt(consAmount)}</td><td class="al b">${d.consumption} ${ul}</td><td class="c">${d.status}</td></tr></table>
<table class="g"><tr>${cfg.chargeColumns.map((c,i)=>`<th style="width:${i<6?14:15.5}%">${c.label}</th>`).join('')}</tr>
<tr>${colValues.map((v,i)=>{const s=cfg.chargeColumns[i].chargeGroups.includes(6)&&settlementIsCredit?' style="color:#CC0000"':'';return cfg.chargeColumns[i].format==='number'?`<td class="ac b"${s}>${v}</td>`:`<td class="al"${s}>${fmt(v)}</td>`}).join('')}</tr></table>
<table class="g"><tr><th style="width:14.5%">الرصيد السابق</th><td class="al" style="width:18%">${fmt(d.balanceBefore)}</td><th style="width:12%">المجموع</th><td class="al b" style="width:16%">${fmt(d.subtotal)}</td><th style="width:12%">المدفوعات</th><td class="al" style="width:12%">${fmt(d.payments||0)}</td><th style="width:15.5%">المبلغ المفتوح</th></tr>
<tr><th>المصاريف الحالية</th><td class="al">${fmt(d.currentCharges)}</td><th>الضريبة</th><td class="al">${fmt(d.taxAmount)}</td><th>تسويات</th><td class="al" style="${settlementIsCredit?'color:#CC0000':''}">${settlementDisplay}</td><td class="al b">${fmt(d.totalAmount-(d.payments||0))}</td></tr>
<tr style="background:#E8E8FF;font-weight:bold"><th>إجمالي الفاتورة (جم)</th><td class="al b">${fmt(d.totalAmount)}</td><th>الرصيد بعد الفاتورة</th><td class="al b">${fmt(d.balanceAfter)}</td><th>تاريخ الاستحقاق</th><td>${d.dueDate||'-'}</td><td class="c">${d.status}</td></tr></table>
<table class="g" style="margin-bottom:0"><tr><td class="aw" style="width:71%;text-align:right;direction:rtl">${amountInWordsAr(d.totalAmount)}</td><td class="tl" style="width:14%">المبلغ الإجمالي</td><td class="al b" style="width:15%">${fmt(d.totalAmount)}</td></tr></table>
<div class="tn"></div>
<table style="width:100%;border-collapse:collapse"><tr class="sg"><td style="width:70%;font-size:5pt;color:#666;text-align:right">${d.companyLicense?`ترخيص: ${d.companyLicense}`:''}</td><td class="si" style="width:15%">${d.companySignature?`<img src="${d.companySignature}" />`:''}</td><td class="sl" style="width:15%">العضو المنتدب /</td></tr></table>
<div class="ft">Meter Verse / عالم العدادات | ${d.generatedAt}</div>
</body></html>`;
  }
}
