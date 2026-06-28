import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ReportEngineClient {
  private readonly logger = new Logger(ReportEngineClient.name);
  private readonly baseUrl: string;
  private readonly enabled: boolean;

  constructor(private readonly config: ConfigService) {
    this.enabled = this.config.get<string>('REPORT_ENGINE_PROVIDER', 'legacy') === 'jasper';
    this.baseUrl = this.config.get<string>('JASPER_REPORT_ENGINE_URL', 'http://localhost:8080/api/v1');
  }

  get isEnabled(): boolean {
    return this.enabled;
  }

  /** Send invoice data to JasperReports engine for PDF generation */
  async generateInvoicePdf(invoiceData: any): Promise<Buffer | null> {
    if (!this.enabled) return null;

    try {
      const response = await fetch(`${this.baseUrl}/reports/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportName: `${invoiceData.utilityType || 'electricity'}/Invoice`,
          format: 'PDF',
          language: 'ar',
          parameters: {
            invoiceNumber: invoiceData.invoiceNumber,
            customerName: invoiceData.customerName,
            customerCode: invoiceData.customerCode,
            meterSerial: invoiceData.meterSerial,
            issueDate: invoiceData.issueDate,
            billingPeriod: invoiceData.billingPeriod,
            consumption: invoiceData.consumption,
            totalAmount: invoiceData.totalAmount,
            subtotal: invoiceData.subtotal,
            taxAmount: invoiceData.taxAmount,
            balanceBefore: invoiceData.balanceBefore,
            balanceAfter: invoiceData.balanceAfter,
            payments: invoiceData.payments,
            status: invoiceData.status,
            dueDate: invoiceData.dueDate,
            chargeLines: invoiceData.chargeLines,
          },
        }),
      });

      if (!response.ok) {
        this.logger.warn(`Jasper engine returned ${response.status}, falling back to legacy`);
        return null;
      }

      const buffer = await response.arrayBuffer();
      return Buffer.from(buffer);
    } catch (e: any) {
      this.logger.warn(`Jasper engine unavailable: ${e.message}, falling back to legacy`);
      return null;
    }
  }
}
