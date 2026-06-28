export interface CustomerStatement {
  customerId: string;
  customerName: string;
  customerNameAr?: string;
  projectName: string;
  unitNumber?: string;
  periodFrom: string;
  periodTo: string;
  openingBalance: number;
  entries: StatementEntry[];
  totalInvoiced: number;
  totalPaid: number;
  totalAdjusted: number;
  closingBalance: number;
  generatedAt: string;
}

export interface StatementEntry {
  date: string;
  type: 'invoice' | 'payment' | 'adjustment' | 'settlement';
  reference: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
}

export interface AgingBucket {
  label: string;
  fromDays: number;
  toDays: number | null;
  total: number;
  count: number;
  customers: Array<{ id: string; name: string; amount: number }>;
}

export interface AgingSummary {
  customerId: string;
  customerName: string;
  totalOutstanding: number;
  current: number;
  days1to30: number;
  days31to60: number;
  days61to90: number;
  days91to120: number;
  days120plus: number;
}
