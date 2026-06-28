export interface PaymentReceiptDocument {
  receiptNumber: string;
  paymentDate: string;
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
  customerNameAr?: string;
  customerTenant?: string;
  customerPhone?: string;

  // Property
  projectName: string;
  unitNumber?: string;

  // Meter
  meterSerial: string;
  meterType: string;
  lastReadingDate?: string;
  lastReadingValue?: number;

  // Payment
  paymentMethod: string;
  paymentMethodAr: string;
  amount: number;
  currency: string;

  // Payment Details
  collectorName: string;
  chequeNumber?: string;
  bankName?: string;
  transferNumber?: string;

  // Financial
  balanceBefore: number;
  currentCharges: number;
  adjustments: number;
  paymentFees: number;
  settlementAmount: number;
  balanceAfter: number;

  // Utility
  utilityType: string;

  // Metadata
  generatedAt: string;
}
