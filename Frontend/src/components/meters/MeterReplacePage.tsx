'use client';

import { useState } from 'react';
import { useMetersList } from '@/hooks/use-meters';
import { useReplaceMeter } from '@/hooks/use-replace-meter';
import { PageHeader } from '@/components/shared/PageHelpers';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { ArrowRightLeft, Check, Loader2 } from 'lucide-react';
import { useT } from '@/lib/i18n/context';

export default function MeterReplacePage() {
  const t = useT();
  const [currentMeterId, setCurrentMeterId] = useState('');
  const [newMeterId, setNewMeterId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [reason, setReason] = useState('');
  const [finalReading, setFinalReading] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const metersQuery = useMetersList();
  const replaceMutation = useReplaceMeter();

  const allMeters = metersQuery.data ?? [];
  const currentMeter = allMeters.find((m) => m.id === currentMeterId);
  const assignedMeters = allMeters.filter((m) => m.status === 'active' || m.status === 'offline');
  const availableMeters = currentMeter
    ? allMeters.filter((m) => m.status === 'available' && m.meterType === currentMeter.meterType)
    : [];

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!currentMeterId) errors.currentMeterId = 'Select current meter';
    if (!newMeterId) errors.newMeterId = 'Select replacement meter';
    if (!date) errors.date = 'Replacement date is required';
    if (!reason.trim()) errors.reason = 'Reason is required';
    if (!finalReading || isNaN(Number(finalReading)) || Number(finalReading) < 0) {
      errors.finalReading = 'Valid final reading is required';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleConfirm = async () => {
    if (!validate()) return;
    if (!currentMeter) return;

    const payload = {
      reason: reason.trim(),
      replacedAt: new Date(date).toISOString(),
      finalReading: Number(finalReading),
      assignDto: {
        customerId: currentMeter.customerId ?? '',
        unitId: currentMeter.unitId ?? '',
        projectId: currentMeter.projectId ?? '',
      },
    };

    try {
      await replaceMutation.mutateAsync({ oldMeterId: currentMeterId, newMeterId, data: payload });
      toast.success(t('meters.replace.success'));
    } catch (error: any) {
      toast.error(error?.message || t('common.error'));
    }
  };

  return (
    <div>
      <PageHeader title={t('meters.replace.title')} subtitle={t('meters.replace.subtitle')} />

      <div className="grid md:grid-cols-2 gap-6">
        {/* Current Meter */}
        <Card className="glass-card border-border/50">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Current Meter</h3>
            <Select value={currentMeterId} onValueChange={(v) => { setCurrentMeterId(v); setNewMeterId(''); }}>
              <SelectTrigger><SelectValue placeholder="Select current meter" /></SelectTrigger>
              <SelectContent>
                {assignedMeters.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.serialNumber} - {m.brand} ({m.status})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {currentMeter && (
              <div className="mt-4 p-4 rounded-lg bg-muted/30 text-sm space-y-2">
                <div className="flex justify-between"><span className="text-muted-foreground">{t('meters.serialNumber')}</span><span className="font-mono">{currentMeter.serialNumber}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">{t('meters.type')}</span><StatusBadge status={currentMeter.meterType} /></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Brand/Model</span><span>{currentMeter.brand} {currentMeter.model}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">{t('meters.customer')}</span><span>{currentMeter.customerName || '-'}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Unit</span><span>{currentMeter.unitNumber || '-'}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">{t('meters.lastReading')}</span><span>{currentMeter.lastReading?.toLocaleString() || '-'}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">{t('meters.status')}</span><StatusBadge status={currentMeter.status} /></div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* New Meter */}
        <Card className="glass-card border-border/50">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">{t('meters.replace.newMeter')}</h3>
            <Select value={newMeterId} onValueChange={setNewMeterId}>
              <SelectTrigger><SelectValue placeholder="Select new meter" /></SelectTrigger>
              <SelectContent>
                {availableMeters.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.serialNumber} - {m.brand} {m.model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {availableMeters.length === 0 && currentMeter && (
              <p className="text-xs text-muted-foreground mt-2">No available meters of type: {currentMeter.meterType}</p>
            )}

            {availableMeters.length > 0 && (
              <div className="mt-4 space-y-4">
                <div>
                  <Label>Replacement Date</Label>
                  <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                  {validationErrors.date && <p className="text-xs text-red-500 mt-1">{validationErrors.date}</p>}
                </div>
                <div>
                  <Label>Final Reading (old meter)</Label>
                  <Input type="number" value={finalReading} onChange={(e) => setFinalReading(e.target.value)} placeholder="Last reading on current meter" />
                  {validationErrors.finalReading && <p className="text-xs text-red-500 mt-1">{validationErrors.finalReading}</p>}
                </div>
                <div>
                  <Label>{t('meters.replace.reason')}</Label>
                  <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Enter reason for replacement..." rows={3} />
                  {validationErrors.reason && <p className="text-xs text-red-500 mt-1">{validationErrors.reason}</p>}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Summary */}
      {currentMeter && newMeterId && (
        <Card className="glass-card border-border/50 mt-6">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <ArrowRightLeft className="h-4 w-4" /> Replacement Summary
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <p className="text-muted-foreground font-medium">From</p>
                <p className="font-mono">{currentMeter.serialNumber}</p>
                <p>{currentMeter.brand} {currentMeter.model}</p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground font-medium">To</p>
                <p className="font-mono">{availableMeters.find((m) => m.id === newMeterId)?.serialNumber}</p>
                <p>{availableMeters.find((m) => m.id === newMeterId)?.brand} {availableMeters.find((m) => m.id === newMeterId)?.model}</p>
              </div>
            </div>
            <Button className="mt-4 gap-2" onClick={handleConfirm} disabled={replaceMutation.isPending}>
              {replaceMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              {replaceMutation.isPending ? t('common.loading').replace('...', '') + '...' : t('meters.replace.submit')}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
