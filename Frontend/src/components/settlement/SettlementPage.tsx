'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost } from '@/lib/api';
import { PageHeader, formatCurrency, formatDate } from '@/components/shared/PageHelpers';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import SmartTable from '@/components/smart-table/SmartTable';
import { toast } from 'sonner';
import { Plus, FileText, Download, Upload, History, ArrowUpCircle, ArrowDownCircle, FileSpreadsheet } from 'lucide-react';
import { useT } from '@/lib/i18n/context';

export default function SettlementPage() {
  const t = useT();
  const qc = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [adjOpen, setAdjOpen] = useState(false);
  const [form, setForm] = useState({ customerId: '', projectId: '', meterId: '', description: '', amount: '', type: 'debit', billingPeriod: '' });
  const [adjForm, setAdjForm] = useState({ invoiceId: '', amount: '', reason: '', adjustmentType: 'credit' });

  const { data: settlements } = useQuery({ queryKey: ['settlements'], queryFn: () => apiGet<any[]>('/settlement').catch(() => []) });
  const { data: adjustments } = useQuery({ queryKey: ['settlement-adjustments'], queryFn: () => apiGet<any[]>('/settlement/adjustments').catch(() => []) });
  const s = settlements ?? []; const a = adjustments ?? [];

  const createSettlement = useMutation({
    mutationFn: () => apiPost('/settlement', { ...form, amount: Number(form.amount) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['settlements'] }); toast.success('Settlement created'); setCreateOpen(false); },
    onError: () => toast.error('Failed'),
  });

  const createAdjustment = useMutation({
    mutationFn: () => apiPost('/settlement/adjustments', { ...adjForm, amount: Number(adjForm.amount) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['settlement-adjustments'] }); toast.success('Adjustment created'); setAdjOpen(false); },
    onError: () => toast.error('Failed'),
  });

  const totalPositive = a.filter((x: any) => Number(x.amount) > 0).reduce((s: number, x: any) => s + Number(x.amount), 0);
  const totalNegative = a.filter((x: any) => Number(x.amount) < 0).reduce((s: number, x: any) => s + Math.abs(Number(x.amount)), 0);
  const settlementTotal = s.reduce((sum: number, x: any) => sum + Number(x.totalAmount ?? 0), 0);

  return (
    <div>
      <PageHeader title={t('settlement.title')} subtitle={t('settlement.subtitle')} action={
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={() => setAdjOpen(true)}><ArrowUpCircle className="h-4 w-4" /> Adjustment</Button>
          <Button className="gap-2" onClick={() => setCreateOpen(true)}><Plus className="h-4 w-4" /> New Settlement</Button>
        </div>
      } />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <Card className="glass-card border-border/50"><CardContent className="p-4"><p className="text-xs text-muted-foreground">Settlements</p><p className="text-2xl font-bold">{s.length}</p></CardContent></Card>
        <Card className="glass-card border-border/50"><CardContent className="p-4"><p className="text-xs text-muted-foreground">Total Amount</p><p className="text-2xl font-bold">{formatCurrency(settlementTotal)}</p></CardContent></Card>
        <Card className="glass-card border-border/50"><CardContent className="p-4"><p className="text-xs text-muted-foreground">Positive Adj.</p><p className="text-2xl font-bold text-emerald-500">{formatCurrency(totalPositive)}</p></CardContent></Card>
        <Card className="glass-card border-border/50"><CardContent className="p-4"><p className="text-xs text-muted-foreground">Negative Adj.</p><p className="text-2xl font-bold text-red-500">{formatCurrency(totalNegative)}</p></CardContent></Card>
      </div>

      <Tabs defaultValue="settlements">
        <TabsList className="mb-4">
          <TabsTrigger value="settlements"><FileText className="h-4 w-4 mr-1" /> Settlements</TabsTrigger>
          <TabsTrigger value="adjustments"><ArrowUpCircle className="h-4 w-4 mr-1" /> Adjustments</TabsTrigger>
        </TabsList>

        <TabsContent value="settlements">
          <Card className="glass-card border-border/50">
            <CardHeader><CardTitle className="text-sm">Settlement Invoices</CardTitle></CardHeader>
            <CardContent>
              <SmartTable data={s} columns={[
                { key: 'invoiceNumber', label: 'Number', sortable: true },
                { key: 'customerId', label: 'Customer', render: (v: string) => <span className="font-mono text-xs">{v?.substring(0, 8)}</span> },
                { key: 'totalAmount', label: 'Amount', render: (v: number) => formatCurrency(v ?? 0) },
                { key: 'status', label: 'Status', render: (v: string) => <StatusBadge status={v} /> },
                { key: 'createdAt', label: 'Date', render: (v: string) => v ? new Date(v).toLocaleDateString() : '-' },
                { key: 'id', label: 'PDF', render: (v: string) => <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => window.open(`/api/v1/invoices/${v}/pdf`, '_blank')}><Download className="h-3.5 w-3.5" /></Button> },
              ]} searchable />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="adjustments">
          <Card className="glass-card border-border/50">
            <CardHeader><CardTitle className="text-sm">Invoice Adjustments</CardTitle></CardHeader>
            <CardContent>
              <SmartTable data={a} columns={[
                { key: 'invoiceId', label: 'Invoice', render: (v: string) => <span className="font-mono text-xs">{v?.substring(0, 8)}</span> },
                { key: 'amount', label: 'Amount', render: (v: number) => <span className={v > 0 ? 'text-emerald-500 font-bold' : 'text-red-500 font-bold'}>{formatCurrency(v ?? 0)}</span> },
                { key: 'reason', label: 'Reason' },
                { key: 'adjustmentType', label: 'Type', render: (v: string) => <StatusBadge status={v} /> },
                { key: 'createdBy', label: 'By' },
              ]} searchable />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Settlement Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>New Settlement Invoice</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div><Label>Customer ID</Label><Input value={form.customerId} onChange={e => setForm({...form, customerId: e.target.value})} /></div>
            <div><Label>Project ID</Label><Input value={form.projectId} onChange={e => setForm({...form, projectId: e.target.value})} /></div>
            <div><Label>Meter ID</Label><Input value={form.meterId} onChange={e => setForm({...form, meterId: e.target.value})} /></div>
            <div><Label>Description</Label><Input value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Amount</Label><Input type="number" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} /></div>
              <div><Label>Type</Label>
                <Select value={form.type} onValueChange={v => setForm({...form, type: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="debit">Debit (Charge)</SelectItem>
                    <SelectItem value="credit">Credit (Refund)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Billing Period</Label><Input value={form.billingPeriod} onChange={e => setForm({...form, billingPeriod: e.target.value})} placeholder="e.g. 2026-01" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={() => createSettlement.mutate()} disabled={!form.customerId}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Adjustment Dialog */}
      <Dialog open={adjOpen} onOpenChange={setAdjOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>New Invoice Adjustment</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div><Label>Invoice ID</Label><Input value={adjForm.invoiceId} onChange={e => setAdjForm({...adjForm, invoiceId: e.target.value})} /></div>
            <div><Label>Amount</Label><Input type="number" value={adjForm.amount} onChange={e => setAdjForm({...adjForm, amount: e.target.value})} /></div>
            <div><Label>Reason</Label><Input value={adjForm.reason} onChange={e => setAdjForm({...adjForm, reason: e.target.value})} /></div>
            <div><Label>Type</Label>
              <Select value={adjForm.adjustmentType} onValueChange={v => setAdjForm({...adjForm, adjustmentType: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="credit">Credit (+)</SelectItem>
                  <SelectItem value="debit">Debit (-)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAdjOpen(false)}>Cancel</Button>
            <Button onClick={() => createAdjustment.mutate()} disabled={!adjForm.invoiceId}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

