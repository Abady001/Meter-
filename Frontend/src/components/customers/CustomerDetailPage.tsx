'use client';

import { useState } from 'react';
import { usePageStore } from '@/lib/router-store';
import { useInvoicesList } from '@/hooks/use-invoices';
import { useMetersList } from '@/hooks/use-meters';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BackButton, StatCard, formatCurrency, formatDate } from '@/components/shared/PageHelpers';
import { StatusBadge } from '@/components/shared/StatusBadge';
import SmartTable from '@/components/smart-table/SmartTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Phone, Mail, MapPin, Gauge, CreditCard, Pencil, Trash2 } from 'lucide-react';
import { useT } from '@/lib/i18n/context';
import { useProjectsList } from '@/hooks/use-projects';
import { useCustomerDetail } from '@/hooks/use-customers';
import { apiPost, apiPut, apiDelete } from '@/lib/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useQueryClient } from '@tanstack/react-query';
import OwnershipTab from './OwnershipTab';
import WalletTab from './WalletTab';

export default function CustomerDetailPage() {
  const t = useT();
  const { pageParams, navigate } = usePageStore();
  const { data: apiProjects } = useProjectsList();
  const projects = apiProjects ?? [];
  const projectId = pageParams.projectId ?? '';
  const customerId = pageParams.id ?? '';
  const isNew = customerId === 'new';
  const { data: apiCustomer } = useCustomerDetail(projectId, customerId);
  const customer = isNew ? null : apiCustomer;
  const project = projects.find((p) => p.id === customer?.projectId);
  const { data: apiInvoices } = useInvoicesList();
  const { data: apiMeters } = useMetersList();
  const allInvoices = apiInvoices ?? [];
  const allMeters = apiMeters ?? [];
  const [formData, setFormData] = useState({ customerCode: '', name: '', nameAr: '', phone: '', email: '', customerType: 'individual', nationalOrCommercialId: '', projectId: '' });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editData, setEditData] = useState({ name: '', email: '', phone: '' });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const queryClient = useQueryClient();

  const handleCreate = async () => {
    setCreating(true); setCreateError('');
    try {
      const pid = formData.projectId || projectId || projects[0]?.id;
      if (!pid) { setCreateError('Select a project first'); setCreating(false); return; }
      const res = await apiPost(`/projects/${pid}/customers`, formData);
      navigate('customer-detail', { id: (res as any).id, projectId: pid });
    } catch (e: any) { setCreateError(e?.message || 'Failed to create customer'); }
    setCreating(false);
  };

  const handleEditOpen = () => {
    setEditData({ name: customer?.name || '', email: customer?.email || '', phone: customer?.phone || '' });
    setEditOpen(true);
  };

  const handleEditSave = async () => {
    setSaving(true);
    try {
      await apiPut(`/projects/${projectId}/customers/${customerId}`, editData);
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'customers', customerId] });
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'customers'] });
      setEditOpen(false);
    } catch (e: any) {
      console.error('Failed to update customer', e);
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await apiDelete(`/projects/${projectId}/customers/${customerId}`);
      setDeleteOpen(false);
      navigate('customers', { projectId });
    } catch (e: any) {
      console.error('Failed to delete customer', e);
    }
    setDeleting(false);
  };

  if (isNew) {
    return (
      <div>
        <BackButton fallback="customers" />
        <Card className="max-w-2xl mx-auto mt-6">
          <CardHeader><CardTitle>Create Customer</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-xs font-medium">Customer Code *</label><Input value={formData.customerCode} onChange={e => setFormData({ ...formData, customerCode: e.target.value })} /></div>
              <div><label className="text-xs font-medium">English Name *</label><Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} /></div>
              <div><label className="text-xs font-medium">Arabic Name</label><Input value={formData.nameAr} onChange={e => setFormData({ ...formData, nameAr: e.target.value })} /></div>
              <div><label className="text-xs font-medium">Phone *</label><Input value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} /></div>
              <div><label className="text-xs font-medium">Email</label><Input value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} /></div>
              <div><label className="text-xs font-medium">National ID</label><Input value={formData.nationalOrCommercialId} onChange={e => setFormData({ ...formData, nationalOrCommercialId: e.target.value })} /></div>
              <div><label className="text-xs font-medium">Type</label>
                <select className="w-full h-9 rounded-md border px-3 text-sm" value={formData.customerType} onChange={e => setFormData({ ...formData, customerType: e.target.value })}>
                  <option value="individual">Individual</option><option value="company">Company</option><option value="tenant">Tenant</option><option value="owner">Owner</option>
                </select>
              </div>
              <div><label className="text-xs font-medium">Project</label>
                <select className="w-full h-9 rounded-md border px-3 text-sm" value={formData.projectId || projectId} onChange={e => setFormData({ ...formData, projectId: e.target.value })}>
                  <option value="">Select project</option>
                  {projects.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
            </div>
            {createError && <p className="text-red-500 text-sm">{createError}</p>}
            <Button onClick={handleCreate} disabled={creating || !formData.customerCode || !formData.name || !formData.phone}>
              {creating ? 'Creating...' : 'Create Customer'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!customer) {
    return (
      <div>
        <BackButton fallback="customers" />
        <p className="text-muted-foreground">{t('customers.notFound')}</p>
      </div>
    );
  }

  const invoices = allInvoices.filter((i: any) => i.customerId === customerId);
  const meters = allMeters.filter((m: any) => m.customerId === customerId);
  const customerUnits: any[] = [];

  return (
    <div>
      <BackButton fallback="customers" />

      <div className="glass-card rounded-xl p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{customer.name}</h1>
              <StatusBadge status={customer.status} />
              <StatusBadge status={customer.customerType} />
            </div>
            <p className="text-xs text-muted-foreground mt-1">{customer.code}</p>
            <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> {customer.phone}</span>
              <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> {customer.email}</span>
              <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {project?.name ?? customer.projectName}</span>
            </div>
            {customer.address && <p className="text-xs text-muted-foreground mt-1">{customer.address}</p>}
          </div>
          <div className="flex gap-2 shrink-0">
            <Button variant="outline" size="sm" className="gap-2" onClick={handleEditOpen}>
              <Pencil className="h-4 w-4" /> Edit
            </Button>
            <Button variant="destructive" size="sm" className="gap-2" onClick={() => setDeleteOpen(true)}>
              <Trash2 className="h-4 w-4" /> Delete
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <StatCard label={t('customers.activeMeters')} value={customer.activeMeters} icon={<Gauge className="h-5 w-5" />} />
        <StatCard label={t('customers.totalPaid')} value={formatCurrency(customer.totalPaid)} icon={<CreditCard className="h-5 w-5" />} color="text-emerald-500" />
        <StatCard
          label={t('customers.currentBalance')}
          value={formatCurrency(customer.currentBalance)}
          icon={<CreditCard className="h-5 w-5" />}
          color={customer.currentBalance > 0 ? 'text-red-500' : customer.currentBalance < 0 ? 'text-blue-500' : 'text-emerald-500'}
        />
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="mb-4 flex-wrap h-auto gap-1">
          <TabsTrigger value="overview">{t('customers.overview')}</TabsTrigger>
          <TabsTrigger value="units">{t('customers.units')}</TabsTrigger>
          <TabsTrigger value="meters">{t('sidebar.meters')}</TabsTrigger>
          <TabsTrigger value="invoices">{t('sidebar.invoices')}</TabsTrigger>
          <TabsTrigger value="payments">{t('sidebar.payments')}</TabsTrigger>
          <TabsTrigger value="ledger">Ledger</TabsTrigger>
          <TabsTrigger value="wallet">Wallet</TabsTrigger>
          <TabsTrigger value="solar-wallet">Solar</TabsTrigger>
          <TabsTrigger value="settlements">{t('sidebar.settlements')}</TabsTrigger>
          <TabsTrigger value="balance">{t('customers.balance')}</TabsTrigger>
          <TabsTrigger value="tickets">{t('sidebar.tickets')}</TabsTrigger>
          <TabsTrigger value="ownership">Ownership</TabsTrigger>
          <TabsTrigger value="notes">{t('customers.notes')}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="glass-card border-border/50">
              <CardHeader className="pb-2"><CardTitle className="text-sm">{t('customers.customerInfo')}</CardTitle></CardHeader>
              <CardContent className="text-sm space-y-2">
                <div className="flex justify-between"><span className="text-muted-foreground">{t('customers.code')}</span><span>{customer.code}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">{t('customers.type')}</span><StatusBadge status={customer.customerType} /></div>
                <div className="flex justify-between"><span className="text-muted-foreground">{t('customers.project')}</span><span>{project?.name ?? customer.projectName}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">{t('customers.created')}</span><span>{formatDate(customer.createdAt)}</span></div>
              </CardContent>
            </Card>
            <Card className="glass-card border-border/50">
              <CardHeader className="pb-2"><CardTitle className="text-sm">{t('customers.assignedUnits')}</CardTitle></CardHeader>
              <CardContent>
                {customerUnits.length > 0 ? (
                  <div className="space-y-2">
                    {customerUnits.map((u) => (
                      <div key={u.id} className="flex items-center justify-between py-1.5 border-b border-border/30 last:border-0 text-sm">
                        <span className="font-medium">{u.unitNumber}</span>
                        <span className="text-muted-foreground text-xs">{u.buildingId.replace('BLD-', '')} · Floor {u.floorNumber}</span>
                        <StatusBadge status={u.status} />
                      </div>
                    ))}
                  </div>
                ) : <p className="text-sm text-muted-foreground text-center py-4">{t('customers.noAssignedUnits')}</p>}
              </CardContent>
            </Card>
            <Card className="glass-card border-border/50 md:col-span-2">
              <CardHeader className="pb-2"><CardTitle className="text-sm">{t('customers.recentInvoices')}</CardTitle></CardHeader>
              <CardContent>
                {invoices.length > 0 ? (
                  <div className="space-y-2">
                    {invoices.slice(0, 5).map((inv) => (
                      <div key={inv.id} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0 text-sm">
                        <div>
                          <span className="font-medium">{inv.invoiceNumber}</span>
                          <span className="text-muted-foreground ml-2 text-xs">{formatDate(inv.invoiceDate)}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span>{formatCurrency(inv.total)}</span>
                          <StatusBadge status={inv.status} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-sm text-muted-foreground text-center py-4">{t('billing.invoices.noInvoices')}</p>}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="units">
          <SmartTable
            data={customerUnits}
            columns={[
              { key: 'unitNumber', label: t('locations.unit'), sortable: true },
              { key: 'unitType', label: t('customers.type'), render: (v: string) => <StatusBadge status={v} /> },
              { key: 'floorNumber', label: t('locations.floor'), width: '80px' },
              { key: 'status', label: t('customers.status'), width: '100px', render: (v: string) => <StatusBadge status={v} /> },
            ]}
            searchPlaceholder={t('customers.search')}
          />
        </TabsContent>

        <TabsContent value="meters">
          <SmartTable
            data={meters}
            columns={[
              { key: 'serialNumber', label: t('meters.serialNumber'), sortable: true },
              { key: 'meterType', label: t('meters.type'), width: '120px', render: (v: string) => <StatusBadge status={v} /> },
              { key: 'brand', label: t('meters.brand') },
              { key: 'lastReading', label: t('meters.lastReading'), width: '120px', render: (v: number) => v ? v.toLocaleString() : '-' },
              { key: 'status', label: t('meters.status'), width: '100px', render: (v: string) => <StatusBadge status={v} /> },
            ]}
            searchPlaceholder={t('meters.search')}
            searchable
          />
        </TabsContent>

        <TabsContent value="invoices">
          <SmartTable
            data={invoices}
            columns={[
              { key: 'invoiceNumber', label: t('billing.invoices.invoiceNumber'), sortable: true },
              { key: 'billingPeriodStart', label: t('billing.invoices.period'), width: '180px', render: (v: string, row: { billingPeriodEnd: string }) => `${formatDate(v)} - ${formatDate(row.billingPeriodEnd)}` },
              { key: 'consumption', label: t('billing.consumption.consumption'), width: '80px' },
              { key: 'total', label: t('billing.invoices.total'), width: '100px', render: (v: number) => formatCurrency(v) },
              { key: 'paidAmount', label: t('billing.invoices.paid'), width: '100px', render: (v: number) => formatCurrency(v) },
              { key: 'status', label: t('billing.invoices.status'), width: '120px', render: (v: string) => <StatusBadge status={v} /> },
            ]}
            searchPlaceholder={t('billing.invoices.search')}
          />
        </TabsContent>

        <TabsContent value="payments"><div className="text-center py-12 text-muted-foreground">{t('billing.payments.noPayments')}</div></TabsContent>
        <TabsContent value="ledger">
          <Card className="glass-card border-border/50">
            <CardHeader><CardTitle className="text-sm">Ledger History</CardTitle></CardHeader>
            <CardContent className="text-sm text-muted-foreground">Ledger entries appear after invoice posting and payment processing.</CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="wallet">
          <WalletTab customerId={customerId} projectId={projectId} />
        </TabsContent>
        <TabsContent value="solar-wallet">
          <WalletTab customerId={customerId} projectId={projectId} />
        </TabsContent>
        <TabsContent value="settlements"><div className="text-center py-12 text-muted-foreground">No settlements found.</div></TabsContent>
        <TabsContent value="ownership">
          <OwnershipTab customer={customer} projectId={projectId} />
        </TabsContent>
        <TabsContent value="balance"><div className="text-center py-12 text-muted-foreground">{t('customers.noBalanceRecords')}</div></TabsContent>
        <TabsContent value="tickets"><div className="text-center py-12 text-muted-foreground">{t('tickets.noTickets')}</div></TabsContent>
        <TabsContent value="notes"><div className="text-center py-12 text-muted-foreground">{t('customers.noNotes')}</div></TabsContent>
      </Tabs>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Customer</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div><label className="text-xs font-medium">Name</label><Input value={editData.name} onChange={e => setEditData({ ...editData, name: e.target.value })} /></div>
            <div><label className="text-xs font-medium">Email</label><Input value={editData.email} onChange={e => setEditData({ ...editData, email: e.target.value })} /></div>
            <div><label className="text-xs font-medium">Phone</label><Input value={editData.phone} onChange={e => setEditData({ ...editData, phone: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={handleEditSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Customer</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{customer.name}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-500 hover:bg-red-600" disabled={deleting} onClick={handleDelete}>
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

