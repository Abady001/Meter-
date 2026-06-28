'use client';
import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/api';
import { PageHeader } from '@/components/shared/PageHelpers';
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
import React from 'react';
import { Plus, Pencil, Trash2, Play, Calculator, DollarSign, Zap, Droplets, Thermometer, Sun, Flame, Wind, RefreshCw } from 'lucide-react';
import { useT } from '@/lib/i18n/context';

const UTILITIES = ['electricity', 'water', 'chilled_water', 'outdoor_unit', 'solar', 'settlement', 'gas'];
const CHARGE_MODES = ['FLAT', 'PER_UNIT', 'STEPS', 'STATIC', 'ZERO'];
const UTIL_ICONS: Record<string, any> = { electricity: Zap, water: Droplets, chilled_water: Thermometer, outdoor_unit: Wind, solar: Sun, settlement: RefreshCw, gas: Flame };

export default function TariffStudioPage() {
  const t = useT();
  const qc = useQueryClient();
  const [activeUtil, setActiveUtil] = useState('electricity');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tierDialogOpen, setTierDialogOpen] = useState(false);
  const [simDialogOpen, setSimDialogOpen] = useState(false);
  const [editTariff, setEditTariff] = useState<any>(null);
  const [editTierFor, setEditTierFor] = useState<any>(null);
  const [simResult, setSimResult] = useState<any>(null);
  const [form, setForm] = useState({ tariffCode: '', tariffName: '', description: '', chargeMode: 'FLAT', rateAmount: '', utilityType: 'electricity' });
  const [tiers, setTiers] = useState<any[]>([]);
  const [simForm, setSimForm] = useState({ consumption: '1000', projectId: 'PRJ-001', meterType: 'electricity' });

  const { data: tariffs } = useQuery({ queryKey: ['tariffs-studio', activeUtil], queryFn: () => apiGet<any[]>(`/tariffs?utility=${activeUtil}`).catch(() => []) });
  const list = tariffs ?? [];

  const createMutation = useMutation({
    mutationFn: () => apiPost('/tariffs', { ...form, utilityType: activeUtil }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tariffs-studio'] }); toast.success('Tariff created'); setDialogOpen(false); resetForm(); },
    onError: () => toast.error('Failed'),
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiDelete(`/tariffs/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tariffs-studio'] }); toast.success('Deleted'); },
  });

  function resetForm() { setForm({ tariffCode: '', tariffName: '', description: '', chargeMode: 'FLAT', rateAmount: '', utilityType: activeUtil }); setTiers([]); }

  const handleSimulate = async () => {
    try {
      const res = await apiPost<any>('/billing/tariffs/simulate', { projectId: simForm.projectId, meterType: simForm.meterType, consumption: Number(simForm.consumption) });
      setSimResult(res);
    } catch { toast.error('Simulation failed'); }
  };

  return (
    <div>
      <PageHeader title={t('billing.tariffs.studioTitle')} subtitle={t('billing.tariffs.studioSubtitle')} action={
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={() => { setSimDialogOpen(true); setSimResult(null); }}><Calculator className="h-4 w-4" /> Simulate</Button>
          <Button className="gap-2" onClick={() => { setEditTariff(null); resetForm(); setDialogOpen(true); }}><Plus className="h-4 w-4" /> New Tariff</Button>
        </div>
      } />

      <Tabs defaultValue="electricity" onValueChange={setActiveUtil}>
        <TabsList className="mb-4 flex-wrap h-auto gap-1">
          {UTILITIES.map(u => {
            const Icon = UTIL_ICONS[u] ?? DollarSign;
            return <TabsTrigger key={u} value={u} className="flex items-center gap-1 capitalize"><Icon className="h-3.5 w-3.5" />{(u || '').replace(/_/g, ' ')}</TabsTrigger>;
          })}
        </TabsList>

        <Card className="glass-card border-border/50">
          <CardHeader><CardTitle className="text-sm flex items-center gap-2">{React.createElement(UTIL_ICONS[activeUtil] ?? DollarSign, { className: 'h-4 w-4' })}{(activeUtil || '').replace(/_/g, ' ')} Tariffs</CardTitle></CardHeader>
          <CardContent>
            <SmartTable data={list} columns={[
              { key: 'tariffCode', label: 'Code', sortable: true },
              { key: 'tariffName', label: 'Name', sortable: true },
              { key: 'chargeMode', label: 'Mode', render: (v: string) => <StatusBadge status={v} /> },
              { key: 'description', label: 'Description' },
              { key: 'isActive', label: 'Status', render: (v: boolean) => <StatusBadge status={v ? 'active' : 'inactive'} /> },
              { key: 'id', label: 'Actions', render: (v: string, row: any) => (
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditTariff(row); setForm({ tariffCode: row.tariffCode, tariffName: row.tariffName, description: row.description || '', chargeMode: row.chargeMode || 'FLAT', rateAmount: row.rateAmount || '', utilityType: activeUtil }); setDialogOpen(true); }}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditTierFor(row); setTiers(row.tiers || row.details || []); setTierDialogOpen(true); }}><Calculator className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => { if (confirm('Delete?')) deleteMutation.mutate(v); }}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              )},
            ]} searchable />
          </CardContent>
        </Card>
      </Tabs>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editTariff ? 'Edit Tariff' : 'Create Tariff'}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Code</Label><Input value={form.tariffCode} onChange={e => setForm({...form, tariffCode: e.target.value})} placeholder="e.g. ELEC-RES-01" /></div>
              <div><Label>Name</Label><Input value={form.tariffName} onChange={e => setForm({...form, tariffName: e.target.value})} placeholder="e.g. Residential Electricity" /></div>
            </div>
            <div><Label>Description</Label><Input value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Charge Mode</Label>
                <Select value={form.chargeMode} onValueChange={v => setForm({...form, chargeMode: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CHARGE_MODES.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Rate Amount</Label><Input type="number" value={form.rateAmount} onChange={e => setForm({...form, rateAmount: e.target.value})} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => createMutation.mutate()} disabled={!form.tariffCode || !form.tariffName}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tier Editor Dialog */}
      <Dialog open={tierDialogOpen} onOpenChange={setTierDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Tier Editor — {editTierFor?.tariffName || editTierFor?.tariffCode || 'Tariff'}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">Define consumption tiers (From → To → Rate). Unlimited tiers supported.</p>
            <div className="space-y-2">
              {tiers.map((tier: any, i: number) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded bg-muted/20">
                  <Input className="w-20 h-8 text-xs" placeholder="From" value={tier.stepFrom ?? tier.from ?? ''} onChange={e => { const t = [...tiers]; t[i] = {...t[i], stepFrom: Number(e.target.value), from: Number(e.target.value)}; setTiers(t); }} />
                  <span className="text-xs">→</span>
                  <Input className="w-20 h-8 text-xs" placeholder="To" value={tier.stepTo ?? tier.to ?? ''} onChange={e => { const t = [...tiers]; t[i] = {...t[i], stepTo: Number(e.target.value), to: Number(e.target.value)}; setTiers(t); }} />
                  <Input className="w-20 h-8 text-xs" placeholder="Rate" value={tier.stepRate ?? tier.rate ?? ''} onChange={e => { const t = [...tiers]; t[i] = {...t[i], stepRate: Number(e.target.value), rate: Number(e.target.value)}; setTiers(t); }} />
                  <Select value={String(tier.chargeGroup ?? 0)} onValueChange={v => { const t = [...tiers]; t[i] = {...t[i], chargeGroup: Number(v)}; setTiers(t); }}>
                    <SelectTrigger className="h-8 w-28"><SelectValue placeholder="Group" /></SelectTrigger>
                    <SelectContent>
                      {Array.from({length: 15}, (_, i) => <SelectItem key={i} value={String(i)}>Group {i}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 shrink-0" onClick={() => setTiers(tiers.filter((_: any, j: number) => j !== i))}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              ))}
            </div>
            <Button variant="outline" size="sm" className="gap-1" onClick={() => setTiers([...tiers, { stepFrom: 0, stepTo: 999999, stepRate: 0, chargeGroup: 0 }])}><Plus className="h-3.5 w-3.5" /> Add Tier</Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTierDialogOpen(false)}>Close</Button>
            <Button onClick={async () => {
              try {
                await apiPost(`/tariffs/${editTierFor.id}/tiers`, { tiers });
                toast.success('Tiers saved');
                setTierDialogOpen(false);
                qc.invalidateQueries({ queryKey: ['tariffs-studio'] });
              } catch { toast.error('Failed to save tiers'); }
            }}>Save Tiers</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Simulation Dialog */}
      <Dialog open={simDialogOpen} onOpenChange={setSimDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Tariff Simulation</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Utility</Label>
                <Select value={simForm.meterType} onValueChange={v => setSimForm({...simForm, meterType: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{UTILITIES.map(u => <SelectItem key={u} value={u} className="capitalize">{(u || '').replace(/_/g, ' ')}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Consumption</Label><Input type="number" value={simForm.consumption} onChange={e => setSimForm({...simForm, consumption: e.target.value})} /></div>
            </div>
            <Button className="w-full gap-2" onClick={handleSimulate}><Play className="h-4 w-4" /> Run Simulation</Button>

            {simResult && (
              <div className="space-y-3 p-4 rounded-lg bg-muted/20">
                <h4 className="text-sm font-semibold">Charge Breakdown</h4>
                {(simResult.lines || []).map((line: any, i: number) => (
                  <div key={i} className="flex justify-between text-sm p-1.5 rounded bg-muted/20">
                    <span>{line.chargeName} (Group {line.chargeGroup})</span>
                    <span className="font-mono font-bold">{new Intl.NumberFormat('en-EG', {style:'currency',currency:'EGP',minimumFractionDigits:2}).format(line.lineAmount)}</span>
                  </div>
                ))}
                <div className="border-t pt-2 mt-2 space-y-1">
                  <div className="flex justify-between text-sm"><span>Subtotal</span><span className="font-bold">{new Intl.NumberFormat('en-EG', {style:'currency',currency:'EGP',minimumFractionDigits:2}).format(simResult.total ?? 0)}</span></div>
                  <div className="flex justify-between text-sm"><span>VAT (14%)</span><span className="font-bold">{new Intl.NumberFormat('en-EG', {style:'currency',currency:'EGP',minimumFractionDigits:2}).format(simResult.vatAmount ?? 0)}</span></div>
                  <div className="flex justify-between text-sm font-bold text-lg"><span>Grand Total</span><span>{new Intl.NumberFormat('en-EG', {style:'currency',currency:'EGP',minimumFractionDigits:2}).format(simResult.grandTotal ?? 0)}</span></div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

