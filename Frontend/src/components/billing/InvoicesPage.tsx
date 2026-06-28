'use client';

import { useState } from 'react';
import { Plus, MoreHorizontal, Eye, Pencil, CreditCard, Download, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { usePageStore } from '@/lib/router-store';
import { useInvoicesList, useIssueInvoice } from '@/hooks/use-invoices';
import { useProjectsList } from '@/hooks/use-projects';
import SmartTable from '@/components/smart-table/SmartTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PageHeader, formatCurrency, formatDate } from '@/components/shared/PageHelpers';
import { cn } from '@/lib/utils';
import { useT } from '@/lib/i18n/context';
import { QueryBoundary } from '@/components/shared/QueryBoundary';
import { ProtectedAction } from '@/components/shared/ProtectedAction';
import { downloadFile } from '@/lib/download';
import { apiPatch, apiPost } from '@/lib/api';

export default function InvoicesPage() {
  const t = useT();
  const { navigate } = usePageStore();
  const { data: apiInvoices, isLoading, isError, error, refetch } = useInvoicesList();
  const invoices = apiInvoices ?? [];
  const { data: apiProjects } = useProjectsList();
  const issueMutation = useIssueInvoice();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [editDueAt, setEditDueAt] = useState('');

  const handleEditInvoice = (row: any) => {
    setSelectedInvoice(row);
    setEditDueAt(row.dueDate ? row.dueDate.split('T')[0] : '');
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedInvoice) return;
    try {
      await apiPatch(`/invoices/${selectedInvoice.id}`, { dueAt: editDueAt });
      toast.success('Invoice updated');
      setEditDialogOpen(false);
      refetch();
    } catch { toast.error('Failed to update invoice'); }
  };

  const handleCancelInvoice = async () => {
    if (!selectedInvoice) return;
    try {
      await apiPost(`/invoices/${selectedInvoice.id}/cancel`);
      toast.success('Invoice cancelled');
      setCancelDialogOpen(false);
      refetch();
    } catch { toast.error('Failed to cancel invoice'); }
  };

  const handleRecordPayment = (row: any) => {
    navigate('payments', { invoiceId: row.id, customerId: row.customerId, amount: row.remainingAmount });
  };

  const columns = [
    { key: 'invoiceNumber', label: t('billing.invoices.invoiceNumber'), sortable: true },
    { key: 'customerName', label: t('billing.invoices.customer'), sortable: true },
    { key: 'projectName', label: 'Project' },
    { key: 'unitNumber', label: 'Unit', width: '80px', render: (v: string) => v || '-' },
    {
      key: 'meterSerial', label: 'Meter', width: '140px',
      render: (v: string) => <span className="font-mono text-xs">{v}</span>,
    },
    {
      key: 'meterType', label: 'Type', width: '110px',
      render: (v: string) => <StatusBadge status={v} />,
    },
    {
      key: 'billingPeriodStart', label: t('billing.invoices.period'), width: '170px',
      render: (v: string, row: { billingPeriodEnd: string }) => <span className="text-xs">{formatDate(v)} - {formatDate(row.billingPeriodEnd)}</span>,
    },
    { key: 'consumption', label: 'Usage', width: '70px' },
    { key: 'tariff', label: 'Tariff', width: '70px', render: (v: number) => v.toFixed(2) },
    { key: 'subtotal', label: 'Subtotal', width: '90px', render: (v: number) => formatCurrency(v) },
    { key: 'tax', label: 'Tax', width: '80px', render: (v: number) => formatCurrency(v) },
    {
      key: 'total', label: t('billing.invoices.total'), width: '100px',
      render: (v: number) => <span className="font-medium">{formatCurrency(v)}</span>,
    },
    { key: 'paidAmount', label: t('billing.invoices.paid'), width: '100px', render: (v: number) => formatCurrency(v) },
    {
      key: 'remainingAmount', label: 'Remaining', width: '100px',
      render: (v: number) => <span className={cn(v > 0 ? 'text-red-500' : 'text-emerald-500')}>{formatCurrency(v)}</span>,
    },
    { key: 'invoiceDate', label: t('billing.invoices.issueDate'), width: '90px', sortable: true, render: (v: string) => formatDate(v) },
    { key: 'dueDate', label: t('billing.invoices.dueDate'), width: '90px', render: (v: string) => formatDate(v) },
    {
      key: 'status', label: t('billing.invoices.status'), sortable: true, width: '120px',
      render: (v: string) => <StatusBadge status={v} />,
    },
    {
      key: 'actions', label: '', width: '50px',
      render: (_val: unknown, row: { id: string; invoiceNumber: string; status: string }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate('invoice-detail', { id: row.id }); }}><Eye className="h-4 w-4 mr-2" /> View</DropdownMenuItem>
            <ProtectedAction action="invoice:write">
              {row.status === 'draft' && <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEditInvoice(row); }}><Pencil className="h-4 w-4 mr-2" /> Edit</DropdownMenuItem>}
            </ProtectedAction>
            <ProtectedAction action="invoice:issue">
              {row.status === 'draft' && <DropdownMenuItem onClick={(e) => { e.stopPropagation(); issueMutation.mutate(row.id, { onSuccess: () => toast.success('Invoice issued'), onError: () => toast.error('Failed to issue invoice') }); }}><CreditCard className="h-4 w-4 mr-2" /> Issue</DropdownMenuItem>}
            </ProtectedAction>
            <ProtectedAction action="payment:record">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleRecordPayment(row); }}><CreditCard className="h-4 w-4 mr-2" /> Record Payment</DropdownMenuItem>
            </ProtectedAction>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); downloadFile(`http://localhost:3001/api/v1/downloads/invoices/${row.id}/pdf`, `invoice-${row.invoiceNumber}.pdf`); }}><Download className="h-4 w-4 mr-2" /> {t('billing.invoices.download')}</DropdownMenuItem>
            <ProtectedAction action="invoice:cancel">
              {row.status === 'draft' && <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setSelectedInvoice(row); setCancelDialogOpen(true); }} className="text-red-500"><XCircle className="h-4 w-4 mr-2" /> Cancel</DropdownMenuItem>}
            </ProtectedAction>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <QueryBoundary isLoading={isLoading} isError={isError} error={error}>
    <div>
      <PageHeader
        title={t('billing.invoices.title')}
        subtitle={t('billing.invoices.subtitle')}
        action={
          <Button className="gap-2" onClick={async () => { try { await apiPost('/invoices/generate', { projectId: '', billingPeriodCode: new Date().toISOString().slice(0,7) }); toast.success('Invoice generated'); refetch(); } catch { toast.error('Failed to generate invoice'); } }}>
            <Plus className="h-4 w-4" /> {t('billing.invoices.generate')}
          </Button>
        }
      />
      <SmartTable
        data={invoices}
        columns={columns}
        filters={[
          {
            key: 'status', label: t('billing.invoices.status'), type: 'select',
            options: [
              { label: t('billing.invoices.draft'), value: 'draft' },
              { label: t('billing.invoices.issued'), value: 'issued' },
              { label: t('billing.invoices.partial'), value: 'partially_paid' },
              { label: t('billing.invoices.paidStatus'), value: 'paid' },
              { label: t('billing.invoices.overdue'), value: 'overdue' },
              { label: t('billing.invoices.cancelled'), value: 'cancelled' },
            ],
          },
          {
            key: 'projectId', label: 'Project', type: 'select',
            options: (apiProjects ?? []).map((p: { name: string; id: string }) => ({ label: p.name, value: p.id })),
          },
          {
            key: 'meterType', label: 'Meter Type', type: 'select',
            options: [
              { label: 'Electricity', value: 'electricity' },
              { label: 'Main Water', value: 'main_water' },
              { label: 'Child Water', value: 'child_water' },
            ],
          },
          {
            key: 'overdue', label: 'Overdue Only', type: 'select',
            options: [
              { label: 'Yes', value: 'overdue' },
            ],
          },
        ]}
        searchable
        searchPlaceholder={t('billing.invoices.search')}
        onRowClick={(row) => navigate('invoice-detail', { id: row.id })}
      />

      {/* Edit Invoice Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Invoice — {selectedInvoice?.invoiceNumber}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Due Date</Label>
              <Input type="date" value={editDueAt} onChange={e => setEditDueAt(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveEdit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Invoice Confirm */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Cancel Invoice</DialogTitle></DialogHeader>
          <p className="py-4 text-sm text-muted-foreground">Are you sure you want to cancel invoice <strong>{selectedInvoice?.invoiceNumber}</strong>? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>No, keep it</Button>
            <Button variant="destructive" onClick={handleCancelInvoice}>Yes, cancel invoice</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </QueryBoundary>
  );
}

