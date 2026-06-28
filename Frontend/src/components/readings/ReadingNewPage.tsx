'use client';

import { useState, useMemo } from 'react';
import { useProjectsList } from '@/hooks/use-projects';
import { useMetersList } from '@/hooks/use-meters';
import { useCustomersList } from '@/hooks/use-customers';
import { PageHeader, BackButton } from '@/components/shared/PageHelpers';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { useReadingsList, useCreateReading } from '@/hooks/use-readings';
import { z } from 'zod';

const readingSchema = z.object({
  meterId: z.string().min(1, 'Meter is required'),
  currentReading: z.string().min(1, 'Reading value is required').refine(v => !isNaN(Number(v)) && Number(v) >= 0, 'Must be a non-negative number'),
  date: z.string().min(1, 'Date is required'),
  source: z.string().min(1, 'Source is required'),
});
import { cn } from '@/lib/utils';
import { AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';
import { useT } from '@/lib/i18n/context';

export default function ReadingNewPage() {
  const t = useT();
  const [form, setForm] = useState({
    projectId: '',
    meterId: '',
    currentReading: '',
    date: new Date().toISOString().split('T')[0],
    source: 'manual',
    notes: '',
  });
  const { data: projects = [] } = useProjectsList();
  const { data: meters = [] } = useMetersList();
  const { data: customers = [] } = useCustomersList(form.projectId);
  const { data: readings = [] } = useReadingsList();

  const projectMeters = form.projectId
    ? (meters ?? []).filter((m) => m.projectId === form.projectId && (m.status === 'active' || m.status === 'offline'))
    : [];

  const selectedMeter = (meters ?? []).find((m) => m.id === form.meterId);
  const meterReadings = selectedMeter
    ? (readings ?? []).filter((r) => r.meterId === selectedMeter.id).sort((a, b) => new Date(b.readingDate).getTime() - new Date(a.readingDate).getTime())
    : [];
  const lastReading = meterReadings.length > 0 ? meterReadings[0] : null;
  const currentReading = parseFloat(form.currentReading) || 0;
  const consumption = currentReading > 0 && lastReading ? currentReading - lastReading.currentReading : 0;
  const unit = selectedMeter?.unitId ? ([] as { id: string; unitNumber: string }[]).find((u) => u.id === selectedMeter.unitId) : null;
  const customer = selectedMeter?.customerId ? (customers ?? []).find((c) => c.id === selectedMeter.customerId) : null;

  const warnings = useMemo(() => {
    const w: { type: 'error' | 'warning'; message: string }[] = [];
    if (selectedMeter?.status === 'terminated') w.push({ type: 'error', message: 'This meter is terminated' });
    if (!lastReading) w.push({ type: 'error', message: 'No previous reading found for this meter' });
    if (currentReading > 0 && lastReading && currentReading < lastReading.currentReading) w.push({ type: 'warning', message: t('readings.negativeWarning') });
    if (consumption > 0 && lastReading && consumption > lastReading.consumption * 3) w.push({ type: 'warning', message: t('readings.highWarning') });
    if (lastReading && consumption === 0 && currentReading > 0) w.push({ type: 'warning', message: t('readings.zeroWarning') });
    return w;
  }, [currentReading, lastReading, selectedMeter, consumption, t]);

  const createReading = useCreateReading();

  const handleSubmit = async () => {
    const parsed = readingSchema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.errors[0]?.message ?? 'Validation failed');
      return;
    }
    try {
      await createReading.mutateAsync({
        meterId: form.meterId,
        projectId: form.projectId || '',
        readingValue: Number(form.currentReading),
        readingAt: new Date(form.date).toISOString(),
        source: form.source as 'manual' | 'import' | 'automatic',
      });
      toast.success('Reading submitted successfully!');
    } catch {
      toast.error('Failed to submit reading');
    }
  };

  return (
    <div>
      <PageHeader title={t('readings.newReading')} subtitle={t('readings.newReadingSubtitle')} />
      <BackButton fallback="readings" />

      <div className="max-w-2xl space-y-6">
        <Card className="glass-card border-border/50">
          <CardContent className="p-6 space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Project</label>
              <Select value={form.projectId} onValueChange={(v) => setForm({ ...form, projectId: v, meterId: '' })}>
                <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
                <SelectContent>
                  {(projects ?? []).map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-1 block">{t('readings.meter')}</label>
              <Select value={form.meterId} onValueChange={(v) => setForm({ ...form, meterId: v })}>
                <SelectTrigger><SelectValue placeholder="Select meter" /></SelectTrigger>
                <SelectContent>
                  {projectMeters.map((m) => <SelectItem key={m.id} value={m.id}>{m.serialNumber} - {m.brand} ({m.unitNumber || 'Unassigned'})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {selectedMeter && (
              <div className="p-3 rounded-lg bg-muted/30 text-sm space-y-1">
                <div className="flex justify-between"><span className="text-muted-foreground">Unit</span><span>{unit?.unitNumber || '-'}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Customer</span><span>{customer?.name || '-'}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">{t('billing.consumption.previousReading')}</span><span className="font-bold">{lastReading?.currentReading?.toLocaleString() || t('common.no')}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">{t('billing.consumption.period')}</span><span>{lastReading ? new Date(lastReading.readingDate).toLocaleDateString() : '-'}</span></div>
              </div>
            )}

            <div>
              <label className="text-sm text-muted-foreground mb-1 block">{t('readings.value')} *</label>
              <Input
                type="number"
                value={form.currentReading}
                onChange={(e) => setForm({ ...form, currentReading: e.target.value })}
                placeholder="Enter current reading"
              />
            </div>

            {currentReading > 0 && lastReading && (
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                <div className="flex justify-between items-center">
                  <span className="text-sm">{t('billing.consumption.consumption')}</span>
                  <span className={cn('text-xl font-bold', consumption < 0 ? 'text-red-500' : consumption === 0 ? 'text-amber-500' : 'text-emerald-500')}>
                    {consumption}
                  </span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">{t('readings.date')}</label>
                <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Source</label>
                <Select value={form.source} onValueChange={(v) => setForm({ ...form, source: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manual</SelectItem>
                    <SelectItem value="automated">Automated</SelectItem>
                    <SelectItem value="estimated">Estimated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-1 block">{t('meters.assign.notes')}</label>
              <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Optional notes..." rows={2} />
            </div>
          </CardContent>
        </Card>

        {/* Validation Warnings */}
        {warnings.length > 0 && (
          <Card className={cn('border', warnings.some((w) => w.type === 'error') ? 'border-red-500/50' : 'border-amber-500/50')}>
            <CardContent className="p-4 space-y-2">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                {warnings.some((w) => w.type === 'error') ? <AlertCircle className="h-4 w-4 text-red-500" /> : <AlertTriangle className="h-4 w-4 text-amber-500" />}
                Validation
              </h4>
              {warnings.map((w, i) => (
                <p key={i} className={cn('text-sm flex items-center gap-2', w.type === 'error' ? 'text-red-500' : 'text-amber-500')}>
                  {w.type === 'error' ? <AlertCircle className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
                  {w.message}
                </p>
              ))}
            </CardContent>
          </Card>
        )}

        <Button className="gap-2 w-full sm:w-auto" onClick={handleSubmit} disabled={warnings.some((w) => w.type === 'error')}>
          <CheckCircle className="h-4 w-4" /> {t('readings.submit')}
        </Button>
      </div>
    </div>
  );
}
