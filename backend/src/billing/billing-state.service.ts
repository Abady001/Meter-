import { Injectable } from '@nestjs/common';
import { InvoiceStatus } from '@prisma/client';

const allowedTransitions: Record<InvoiceStatus, InvoiceStatus[]> = {
  [InvoiceStatus.draft]: [InvoiceStatus.pending_approval, InvoiceStatus.issued, InvoiceStatus.cancelled, InvoiceStatus.void],
  [InvoiceStatus.pending_approval]: [InvoiceStatus.issued, InvoiceStatus.cancelled],
  [InvoiceStatus.issued]: [InvoiceStatus.partially_paid, InvoiceStatus.paid, InvoiceStatus.cancelled, InvoiceStatus.void],
  [InvoiceStatus.partially_paid]: [InvoiceStatus.paid, InvoiceStatus.cancelled],
  [InvoiceStatus.paid]: [InvoiceStatus.cancelled],
  [InvoiceStatus.overdue]: [InvoiceStatus.partially_paid, InvoiceStatus.paid, InvoiceStatus.cancelled],
  [InvoiceStatus.cancelled]: [],
  [InvoiceStatus.void]: [],
};

@Injectable()
export class BillingStateService {
  canTransition(from: InvoiceStatus, to: InvoiceStatus): boolean {
    if (from === to) return false;
    const allowed = allowedTransitions[from];
    if (!allowed) return false;
    return allowed.includes(to);
  }
}
