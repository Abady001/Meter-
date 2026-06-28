'use client';

import { useState } from 'react';
import { usePageStore } from '@/lib/router-store';
import { useProjectsList } from '@/hooks/use-projects';
import { useLocationsList } from '@/hooks/use-locations';
import { useCustomersList } from '@/hooks/use-customers';
import { useMetersList } from '@/hooks/use-meters';
import { useSimCardsList } from '@/hooks/use-sim-cards';
import { useAssignMeter } from '@/hooks/use-meters';
import { PageHeader, BackButton } from '@/components/shared/PageHelpers';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import { useT } from '@/lib/i18n/context';

export default function MeterAssignPage() {
  const { goBack } = usePageStore();
  const t = useT();
  const STEPS = [t('projects.title'), t('locations.building'), t('locations.floor'), t('locations.unit'), t('meters.assign.customer'), 'Meter Type', 'Meter', 'SIM/IP', t('common.confirm')];
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Record<string, string>>({});
  const [preserve, setPreserve] = useState(true);

  const { data: projects } = useProjectsList();
  const { data: locations } = useLocationsList(form.project);
  const { data: customers } = useCustomersList();
  const { data: meters } = useMetersList();
  const { data: sims } = useSimCardsList();
  const assignMutation = useAssignMeter();

  const buildings = (locations ?? []).filter((l: any) => l.nodeType === 'building');
  const selectedBuilding = buildings.find((b: any) => b.id === form.building);
  const buildingUnits = (locations ?? []).filter((l: any) => l.nodeType === 'unit' && l.parentId === form.building);
  const floorNumbers = [...new Set(buildingUnits.map((u: any) => u.code?.split('-')[0] ?? ''))].filter(Boolean).sort();
  const floorUnits = buildingUnits.filter((u: any) => (u.code ?? '').startsWith(form.floor));
  const availableMeters = (meters ?? []).filter((m: any) => m.meterType === form.meterType && m.status === 'available');
  const availableSims = (sims ?? []).filter((s: any) => s.status === 'available' || s.status === 'reusable');

  const canNext = () => {
    switch (step) {
      case 0: return !!form.project;
      case 1: return !!form.building;
      case 2: return !!form.floor;
      case 3: return !!form.unit;
      case 4: return !!form.customer;
      case 5: return !!form.meterType;
      case 6: return !!form.meter;
      case 7: return true;
      case 8: return true;
      default: return false;
    }
  };

  const handleConfirm = async () => {
    try {
      await assignMutation.mutateAsync({
        meterId: form.meter,
        customerId: form.customer,
        unitId: form.unit,
        projectId: form.project,
        startAt: new Date().toISOString(),
      });
      toast.success(t('meters.assign.success'));
      setStep(0);
      setForm({});
    } catch {
      toast.error(t('meters.assign.error'));
    }
  };

  const project = (projects ?? []).find((p: any) => p.id === form.project);
  const meter = (meters ?? []).find((m: any) => m.id === form.meter);
  const customer = (customers ?? []).find((c: any) => c.id === form.customer);
  const sim = (sims ?? []).find((s: any) => s.id === form.sim);
  const unit = (locations ?? []).find((l: any) => l.id === form.unit);

  return (
    <div>
      <PageHeader title={t('meters.assign.title')} subtitle={t('meters.assign.subtitle')} />
      <BackButton />

      <div className="flex items-center gap-1 mb-8 overflow-x-auto pb-2">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center">
            <div className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap', i < step && 'bg-primary text-primary-foreground', i === step && 'bg-primary/20 text-primary border border-primary/50', i > step && 'bg-muted text-muted-foreground')}>
              {i < step && <Check className="h-3 w-3" />}
              {i + 1}. {s}
            </div>
            {i < STEPS.length - 1 && <div className="w-6 h-px bg-border mx-1 shrink-0" />}
          </div>
        ))}
      </div>

      <Card className="glass-card border-border/50 max-w-lg">
        <CardContent className="p-6">
          {step === 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold">Select Project</h3>
              <Select value={form.project || ''} onValueChange={(v) => setForm({ ...form, project: v, building: '', floor: '', unit: '' })}>
                <SelectTrigger><SelectValue placeholder="Choose project" /></SelectTrigger>
                <SelectContent>{(projects ?? []).map((p: any) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          )}
          {step === 1 && (
            <div className="space-y-3">
              <h3 className="font-semibold">Select Building</h3>
              <Select value={form.building || ''} onValueChange={(v) => setForm({ ...form, building: v, floor: '', unit: '' })}>
                <SelectTrigger><SelectValue placeholder="Choose building" /></SelectTrigger>
                <SelectContent>{buildings.map((b: any) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          )}
          {step === 2 && (
            <div className="space-y-3">
              <h3 className="font-semibold">Select Floor</h3>
              <Select value={form.floor || ''} onValueChange={(v) => setForm({ ...form, floor: v, unit: '' })}>
                <SelectTrigger><SelectValue placeholder="Choose floor" /></SelectTrigger>
                <SelectContent>{floorNumbers.map((f) => <SelectItem key={String(f)} value={String(f)}>Floor {f}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          )}
          {step === 3 && (
            <div className="space-y-3">
              <h3 className="font-semibold">Select Unit</h3>
              <Select value={form.unit || ''} onValueChange={(v) => setForm({ ...form, unit: v })}>
                <SelectTrigger><SelectValue placeholder="Choose unit" /></SelectTrigger>
                <SelectContent>{floorUnits.map((u: any) => <SelectItem key={u.id} value={u.id}>{u.name} ({u.code})</SelectItem>)}</SelectContent>
              </Select>
            </div>
          )}
          {step === 4 && (
            <div className="space-y-3">
              <h3 className="font-semibold">Select Customer</h3>
              <Select value={form.customer || ''} onValueChange={(v) => setForm({ ...form, customer: v })}>
                <SelectTrigger><SelectValue placeholder="Choose customer" /></SelectTrigger>
                <SelectContent>{(customers ?? []).map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          )}
          {step === 5 && (
            <div className="space-y-3">
              <h3 className="font-semibold">Select Meter Type</h3>
              <Select value={form.meterType || ''} onValueChange={(v) => setForm({ ...form, meterType: v, meter: '' })}>
                <SelectTrigger><SelectValue placeholder="Choose type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="electricity">Electricity</SelectItem>
                  <SelectItem value="water_main">Main Water</SelectItem>
                  <SelectItem value="water_child">Child Water</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          {step === 6 && (
            <div className="space-y-3">
              <h3 className="font-semibold">Select Meter</h3>
              {availableMeters.length > 0 ? (
                <Select value={form.meter || ''} onValueChange={(v) => setForm({ ...form, meter: v })}>
                  <SelectTrigger><SelectValue placeholder="Choose meter" /></SelectTrigger>
                  <SelectContent>{availableMeters.map((m: any) => <SelectItem key={m.id} value={m.id}>{m.serialNumber} ({m.brand} {m.model})</SelectItem>)}</SelectContent>
                </Select>
              ) : <p className="text-sm text-muted-foreground">No available meters of this type.</p>}
            </div>
          )}
          {step === 7 && (
            <div className="space-y-3">
              <h3 className="font-semibold">Select SIM/IP (Optional)</h3>
              {availableSims.length > 0 ? (
                <Select value={form.sim || ''} onValueChange={(v) => setForm({ ...form, sim: v })}>
                  <SelectTrigger><SelectValue placeholder="Choose SIM card" /></SelectTrigger>
                  <SelectContent>{availableSims.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.msisdn} ({s.provider})</SelectItem>)}</SelectContent>
                </Select>
              ) : <p className="text-sm text-muted-foreground">No available SIM cards.</p>}
              <div className="flex items-center gap-2">
                <Checkbox id="preserve" checked={preserve} onCheckedChange={(v) => setPreserve(!!v)} />
                <label htmlFor="preserve" className="text-sm">Preserve reading history</label>
              </div>
            </div>
          )}
          {step === 8 && (
            <div className="space-y-4">
              <h3 className="font-semibold">Review & Confirm</h3>
              <div className="text-sm space-y-2 p-4 rounded-lg bg-muted/30">
                <div className="flex justify-between"><span className="text-muted-foreground">{t('projects.title')}</span><span>{project?.name || '-'}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">{t('locations.building')}</span><span>{selectedBuilding?.name || '-'}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">{t('locations.floor')}</span><span>{form.floor || '-'}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">{t('locations.unit')}</span><span>{unit?.name || form.unit || '-'}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">{t('meters.assign.customer')}</span><span>{customer?.name || '-'}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">{t('meters.serialNumber')}</span><span className="font-mono">{meter?.serialNumber || '-'}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">SIM</span><span>{sim?.msisdn || 'None'}</span></div>
              </div>
            </div>
          )}

          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={() => { if (step === 0) goBack(); else setStep(step - 1); }}>
              {step === 0 ? t('common.cancel') : t('common.previous')}
            </Button>
            {step < 8 ? (
              <Button onClick={() => setStep(step + 1)} disabled={!canNext()}>{t('common.next')}</Button>
            ) : (
              <Button className="gap-2" onClick={handleConfirm} disabled={assignMutation.isPending}>
                {assignMutation.isPending ? 'Assigning...' : <><Check className="h-4 w-4" /> {t('meters.assign.submit')}</>}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
