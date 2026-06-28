'use client';
import { useState } from 'react';
import { Plus, MoreHorizontal, Eye, Pencil, Trash2, CreditCard, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { apiPatch, apiDelete } from '@/lib/api';
import { usePaymentsList, useCreatePayment } from '@/hooks/use-payments';
import { useCustomersList } from '@/hooks/use-customers';
import { useProjectsList } from '@/hooks/use-projects';
import SmartTable from '@/components/smart-table/SmartTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PageHeader, formatCurrency, formatDate } from '@/components/shared/PageHelpers';
import { useT } from '@/lib/i18n/context';
import { ProtectedAction } from '@/components/shared/ProtectedAction';
import PaymentWizardPage from '@/components/billing/PaymentWizardPage';

export default function PaymentsPage() {
  const t = useT();
  const [paymentTab, setPaymentTab] = useState('new');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [editAmount, setEditAmount] = useState(0);
  const [editNotes, setEditNotes] = useState('');
  const { data: apiPayments, refetch } = usePaymentsList();
  const payments = apiPayments ?? [];
  const { data: apiProjects } = useProjectsList();
  const projects = apiProjects ?? [];
  const { data: apiCustomers } = useCustomersList();
  const customers = apiCustomers ?? [];
  const createPayment = useCreatePayment();
  const [formData, setFormData] = useState({ projectId: '', customerId: '', amount: 0, paymentDate: '', method: 'cash', notes: '' });

  const columns = [
    { key: 'paymentNumber', label: 'Payment #', sortable: true },
    { key: 'customerName', label: t('billing.payments.customer'), sortable: true },
    { key: 'invoiceNumber', label: 'Invoice #', sortable: true },
    { key: 'paymentDate', label: t('billing.payments.date'), sortable: true, width: '110px', render: (v: string) => formatDate(v) },
    { key: 'method', label: t('billing.payments.method'), width: '130px', render: (v: string) => <StatusBadge status={v} /> },
    { key: 'amount', label: t('billing.payments.amount'), sortable: true, render: (v: number) => formatCurrency(v) },
    { key: 'collectedBy', label: 'Collected By', width: '130px' },
    { key: 'status', label: t('billing.payments.status'), width: '110px', render: (v: string) => <StatusBadge status={v} /> },
    { key: 'notes', label: 'Notes', render: (v: string) => v ? <span className="text-xs text-muted-foreground">{v}</span> : '-' },
    { key: 'actions', label: '', width: '50px', render: (_val: unknown, row: any) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setSelectedPayment(row); setViewDialogOpen(true); }}><Eye className="h-4 w-4 mr-2" /> View</DropdownMenuItem>
          <ProtectedAction action="payment:edit">
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setSelectedPayment(row); setEditNotes(row.notes || ''); setEditDialogOpen(true); }}><Pencil className="h-4 w-4 mr-2" /> Edit</DropdownMenuItem>
          </ProtectedAction>
          <ProtectedAction action="payment:delete">
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setSelectedPayment(row); setDeleteDialogOpen(true); }} className="text-red-500"><Trash2 className="h-4 w-4 mr-2" /> Delete</DropdownMenuItem>
          </ProtectedAction>
        </DropdownMenuContent>
      </DropdownMenu>
    )},
  ];

  return (
    <div>
      <PageHeader title={t('billing.payments.title')} subtitle={t('billing.payments.subtitle')} />
      <Tabs value={paymentTab} onValueChange={setPaymentTab} className="mb-4">
        <TabsList>
          <TabsTrigger value="new"><CreditCard className="h-4 w-4 mr-1" />Make New Payment</TabsTrigger>
          <TabsTrigger value="history"><History className="h-4 w-4 mr-1" />History</TabsTrigger>
        </TabsList>
        <TabsContent value="new">
          <PaymentWizardPage />
        </TabsContent>
        <TabsContent value="history">
          <div className="flex items-center justify-between mb-4">
            <div></div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2"><Plus className="h-4 w-4" /> {t('billing.payments.record')}</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>{t('billing.payments.record')}</DialogTitle></DialogHeader>
                <div className="space-y-4 py-4">
                  <div><label className="text-sm text-muted-foreground mb-1 block">Project</label>
                    <Select value={formData.projectId} onValueChange={(v) => setFormData({...formData, projectId: v})}>
                      <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
                      <SelectContent>{projects.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div><label className="text-sm text-muted-foreground mb-1 block">{t('billing.payments.customer')}</label>
                    <Select value={formData.customerId} onValueChange={(v) => setFormData({...formData, customerId: v})}>
                      <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
                      <SelectContent>{customers.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div><label className="text-sm text-muted-foreground mb-1 block">{t('billing.payments.amount')}</label>
                    <Input type="number" placeholder="0.00" value={formData.amount || ''} onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value) || 0})} />
                  </div>
                  <div><label className="text-sm text-muted-foreground mb-1 block">{t('billing.payments.method')}</label>
                    <Select value={formData.method} onValueChange={(v) => setFormData({...formData, method: v})}>
                      <SelectTrigger><SelectValue placeholder="Select method" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">{t('billing.payments.cash')}</SelectItem>
                        <SelectItem value="bank_transfer">{t('billing.payments.bankTransfer')}</SelectItem>
                        <SelectItem value="card">{t('billing.payments.card')}</SelectItem>
                        <SelectItem value="cheque">{t('billing.payments.cheque')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div><label className="text-sm text-muted-foreground mb-1 block">Payment Date</label>
                    <Input type="date" value={formData.paymentDate} onChange={(e) => setFormData({...formData, paymentDate: e.target.value})} />
                  </div>
                  <div><label className="text-sm text-muted-foreground mb-1 block">Notes</label>
                    <Textarea placeholder="Optional notes..." rows={2} value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} />
                  </div>
                  <Button className="w-full" disabled={!formData.projectId || !formData.customerId || formData.amount <= 0 || !formData.paymentDate || createPayment.isPending}
                    onClick={() => createPayment.mutate({...formData, paymentDate: new Date(formData.paymentDate).toISOString()}, { onSuccess: () => setDialogOpen(false), onError: () => {} })}>
                    {createPayment.isPending ? 'Recording...' : t('billing.payments.record')}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <SmartTable data={payments} columns={columns}
            filters={[
              { key: 'method', label: t('billing.payments.method'), type: 'select',
                options: [
                  { label: t('billing.payments.cash'), value: 'cash' },
                  { label: t('billing.payments.bankTransfer'), value: 'bank_transfer' },
                  { label: t('billing.payments.card'), value: 'card' },
                  { label: t('billing.payments.cheque'), value: 'cheque' },
                ],
              },
              { key: 'status', label: t('billing.payments.status'), type: 'select',
                options: [
                  { label: 'Pending', value: 'pending' },
                  { label: 'Confirmed', value: 'confirmed' },
                  { label: 'Reversed', value: 'reversed' },
                  { label: 'Failed', value: 'failed' },
                ],
              },
            ]}
            searchable
            searchPlaceholder={t('billing.payments.search')}
          />
        </TabsContent>
      </Tabs>

      {/* View Payment Detail Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Payment Details — {selectedPayment?.paymentNumber}</DialogTitle></DialogHeader>
          <div className="space-y-3 py-4 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Customer</span><span>{selectedPayment?.customerName}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Invoice</span><span>{selectedPayment?.invoiceNumber || '-'}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Amount</span><span className="font-medium">{formatCurrency(selectedPayment?.amount)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Method</span><span><StatusBadge status={selectedPayment?.method} /></span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Date</span><span>{formatDate(selectedPayment?.paymentDate)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Status</span><span><StatusBadge status={selectedPayment?.status} /></span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Collected By</span><span>{selectedPayment?.collectedBy || '-'}</span></div>
            {selectedPayment?.notes && <div className="flex justify-between"><span className="text-muted-foreground">Notes</span><span>{selectedPayment.notes}</span></div>}
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setViewDialogOpen(false)}>Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Payment Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Payment — {selectedPayment?.paymentNumber}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div><label className="text-sm text-muted-foreground mb-1 block">Notes</label>
              <textarea className="w-full min-h-[60px] rounded-md border border-input bg-transparent px-3 py-2 text-sm" value={editNotes} onChange={e => setEditNotes(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={async () => {
              try { await apiPatch(`/payments/${selectedPayment.id}`, { notes: editNotes }); toast.success('Payment updated'); setEditDialogOpen(false); refetch(); }
              catch { toast.error('Failed to update payment'); }
            }}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Payment Confirm */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Payment</DialogTitle></DialogHeader>
          <p className="py-4 text-sm text-muted-foreground">Are you sure you want to delete payment <strong>{selectedPayment?.paymentNumber}</strong>?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={async () => {
              try { await apiDelete(`/payments/${selectedPayment.id}`); toast.success('Payment deleted'); setDeleteDialogOpen(false); refetch(); }
              catch { toast.error('Failed to delete payment'); }
            }}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

