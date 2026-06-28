'use client';

import { usePageStore } from '@/lib/router-store';
import { useInvoiceDetail, useIssueInvoice } from '@/hooks/use-invoices';
import { useState } from 'react';
import { BackButton, formatCurrency, formatDate } from '@/components/shared/PageHelpers';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Download, Pencil, CreditCard, XCircle } from 'lucide-react';
import { useT } from '@/lib/i18n/context';
import { downloadFile } from '@/lib/download';
import { apiPatch, apiPost, apiDelete } from '@/lib/api';

export default function InvoiceDetailPage() {
  const t = useT();
  const { pageParams } = usePageStore();
  const { data: apiInvoice, refetch } = useInvoiceDetail(pageParams.id ?? '');
  const invoice = apiInvoice ?? undefined;
  const issueMutation = useIssueInvoice();
  const [editOpen, setEditOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [editNote, setEditNote] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');

  if (!invoice) {
    return (
      <div>
        <BackButton fallback="invoices" />
        <p className="text-muted-foreground">Invoice not found.</p>
      </div>
    );
  }

  const payments: any[] = [];

  const activities = [
    { date: invoice.createdAt, action: 'Invoice created', user: 'System' },
    ...(invoice.status !== 'draft' ? [{ date: invoice.invoiceDate, action: 'Invoice issued', user: 'System' }] : []),
    ...payments.map((p) => ({ date: p.paymentDate, action: `Payment received (${formatCurrency(p.amount)})`, user: p.collectedBy })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div>
      <BackButton fallback="invoices" />

      {/* Header */}
      <div className="glass-card rounded-xl p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{invoice.invoiceNumber}</h1>
              <StatusBadge status={invoice.status} />
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Date: {formatDate(invoice.invoiceDate)} · Due: {formatDate(invoice.dueDate)}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {invoice.status === 'draft' && (
              <Button variant="outline" size="sm" className="gap-1" onClick={() => setEditOpen(true)}><Pencil className="h-3.5 w-3.5" /> Edit</Button>
            )}
            {invoice.status === 'draft' && (
              <Button size="sm" className="gap-1" onClick={() => issueMutation.mutate(invoice.id, { onSuccess: () => { toast.success('Invoice issued'); refetch(); }, onError: () => toast.error('Failed to issue invoice') })}><CreditCard className="h-3.5 w-3.5" /> Issue</Button>
            )}
            <Button variant="outline" size="sm" className="gap-1" onClick={() => setPaymentOpen(true)}><CreditCard className="h-3.5 w-3.5" /> Record Payment</Button>
            <Button variant="outline" size="sm" className="gap-1" onClick={() => downloadFile(`http://localhost:3001/api/v1/downloads/invoices/${invoice.id}/pdf`, `invoice-${invoice.invoiceNumber}.pdf`)}><Download className="h-3.5 w-3.5" /> {t('billing.invoices.download')}</Button>
            {invoice.status === 'draft' && (
              <Button variant="outline" size="sm" className="gap-1 text-red-500" onClick={() => setCancelOpen(true)}><XCircle className="h-3.5 w-3.5" /> Cancel</Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-6">
        {/* Customer Info */}
        <Card className="glass-card border-border/50">
          <CardHeader className="pb-2"><CardTitle className="text-sm">{t('billing.invoices.customer')}</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-1">
            <p className="font-medium">{invoice.customerName}</p>
            <p className="text-muted-foreground">{invoice.projectName}</p>
            {invoice.unitNumber && <p className="text-muted-foreground">Unit: {invoice.unitNumber}</p>}
          </CardContent>
        </Card>

        {/* Meter Info */}
        <Card className="glass-card border-border/50">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Meter</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-1">
            <p className="font-mono">{invoice.meterSerial}</p>
            <StatusBadge status={invoice.meterType} />
            <p className="text-muted-foreground mt-1">{formatDate(invoice.billingPeriodStart)} - {formatDate(invoice.billingPeriodEnd)}</p>
          </CardContent>
        </Card>

        {/* Totals */}
        <Card className="glass-card border-border/50">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Totals</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-2">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatCurrency(invoice.subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Tax</span><span>{formatCurrency(invoice.tax)}</span></div>
            <div className="flex justify-between font-bold text-lg border-t border-border/50 pt-2"><span>Total</span><span>{formatCurrency(invoice.total)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Paid</span><span className="text-emerald-500">{formatCurrency(invoice.paidAmount)}</span></div>
            <div className="flex justify-between font-medium"><span className="text-muted-foreground">Remaining</span><span className={invoice.remainingAmount > 0 ? 'text-red-500' : 'text-emerald-500'}>{formatCurrency(Math.abs(invoice.remainingAmount))}</span></div>
          </CardContent>
        </Card>
      </div>

      {/* Line Items */}
      <Card className="glass-card border-border/50 mb-6">
        <CardHeader className="pb-2"><CardTitle className="text-sm">{t('billing.invoices.lineItems')}</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 text-muted-foreground">
                  <th className="text-left py-2 pr-4">Description</th>
                  <th className="text-right py-2 px-4">Consumption</th>
                  <th className="text-right py-2 px-4">Tariff</th>
                  <th className="text-right py-2 pl-4">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border/30">
                  <td className="py-2 pr-4">{invoice.meterType} consumption</td>
                  <td className="text-right py-2 px-4">{invoice.consumption} units</td>
                  <td className="text-right py-2 px-4">{formatCurrency(invoice.tariff)}/unit</td>
                  <td className="text-right py-2 pl-4">{formatCurrency(invoice.subtotal)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Payment History & Activity */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="glass-card border-border/50">
          <CardHeader className="pb-2"><CardTitle className="text-sm">{t('billing.invoices.paymentHistory')}</CardTitle></CardHeader>
          <CardContent>
            {payments.length > 0 ? (
              <div className="space-y-2">
                {payments.map((p) => (
                  <div key={p.id} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0 text-sm">
                    <div>
                      <p className="font-medium">{p.paymentNumber}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(p.paymentDate)} · {p.method.replace('_', ' ')}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(p.amount)}</p>
                      <StatusBadge status={p.status} />
                    </div>
                  </div>
                ))}
              </div>
            ) : <p className="text-sm text-muted-foreground text-center py-4">No payments recorded</p>}
          </CardContent>
        </Card>

        <Card className="glass-card border-border/50">
          <CardHeader className="pb-2"><CardTitle className="text-sm">{t('billing.invoices.activityTimeline')}</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {activities.map((a, i) => (
                <div key={i} className="flex items-start gap-3 py-2 border-b border-border/30 last:border-0 text-sm">
                  <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                  <div>
                    <p>{a.action}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(a.date)} by {a.user}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Invoice</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div><Label>Notes</Label><Input value={editNote} onChange={e => setEditNote(e.target.value)} placeholder="Add a note" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={async () => { try { await apiPatch('/invoices/' + invoice.id, { notes: editNote }); toast.success('Invoice updated'); setEditOpen(false); refetch(); } catch { toast.error('Failed to update'); } }}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Cancel Invoice</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground py-4">Are you sure you want to cancel invoice {invoice.invoiceNumber}? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelOpen(false)}>No, keep it</Button>
            <Button variant="destructive" onClick={async () => { try { await apiPost('/invoices/' + invoice.id + '/cancel'); toast.success('Invoice cancelled'); setCancelOpen(false); refetch(); } catch { toast.error('Failed to cancel'); } }}>Yes, Cancel Invoice</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Record Payment Dialog */}
      <Dialog open={paymentOpen} onOpenChange={setPaymentOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Record Payment</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div><Label>Amount ({formatCurrency(invoice.total)})</Label><Input type="number" value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)} placeholder="Enter amount" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentOpen(false)}>Cancel</Button>
            <Button onClick={async () => { try { await apiPost('/payments', { invoiceId: invoice.id, amount: parseFloat(paymentAmount), projectId: invoice.projectId, customerId: invoice.customerId, method: 'cash' }); toast.success('Payment recorded'); setPaymentOpen(false); refetch(); } catch { toast.error('Failed to record payment'); } }}>Record Payment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
