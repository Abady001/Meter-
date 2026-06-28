export interface InvoiceChargeLine {
  chargeCode: string;
  chargeName: string;
  chargeNameAr: string;
  chargeGroup: number;
  quantity: number;
  rateAmount: number;
  lineAmount: number;
}

export interface InvoiceDocument {
  // Header
  invoiceNumber: string;
  invoiceTitle: string;
  utilityType: string;
  billingPeriod: string;
  issueDate: string;
  dueDate: string;
  status: string;

  // Company
  companyName: string;
  companyNameAr: string;
  companyLogo?: string;
  companyLicense?: string;
  companySignature?: string;
  companyBankDetails?: string;

  // Customer
  customerId: string;
  customerName: string;
  customerCode?: string;
  customerNameAr?: string;
  customerTenant?: string;
  customerPhone?: string;

  // Property
  projectName: string;
  areaName?: string;
  unitNumber?: string;
  address?: string;

  // Meter
  meterSerial: string;
  meterType: string;
  startReading?: number;
  endReading?: number;
  consumption: number;
  unit: string;

  // Tariff
  tariffName?: string;

  // Financial
  balanceBefore: number;
  currentCharges: number;
  adjustments: number;
  payments: number;
  balanceAfter: number;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;

  // Charge groups
  chargeLines: InvoiceChargeLine[];

  // Payment
  paymentStatus?: string;
  qrData?: string;

  // Metadata
  generatedAt: string;
  language?: string; // 'ar' | 'en' — default 'ar'
}
