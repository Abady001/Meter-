'use client';

import { useState } from 'react';
import { useSimCardsList } from '@/hooks/use-sim-cards';import { useCustomersList } from '@/hooks/use-customers';
import { useMetersList } from '@/hooks/use-meters';
import { useTerminateMeter } from '@/hooks/use-terminate-meter';
import { PageHeader } from '@/components/shared/PageHelpers';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { XCircle, AlertTriangle, Check, Loader2 } from 'lucide-react';
import { useT } from '@/lib/i18n/context';

export default function MeterTerminatePage() {
  const t = useT();
  const [meterId, setMeterId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [reason, setReason] = useState('');
  const [finalReading, setFinalReading] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const metersQuery = useMetersList();
  const terminateMutation = useTerminateMeter();

  const allMeters = metersQuery.data ?? [];
  const meter = allMeters.find((m) => m.id === meterId);
  const sim = meter?.simCardId ? (sims ?? []).find((s) => s.id === meter.simCardId) : null;
  const customer = meter?.customerId ? (customers ?? []).find((c) => c.id === meter.customerId) : null;
  const activeMeters = allMeters.filter((m) => m.status === 'active' || m.status === 'offline');

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!meterId) errors.meterId = 'Select a meter';
    if (!date) errors.date = 'Termination date is required';
    if (!reason.trim()) errors.reason = 'Reason is required';
    if (!finalReading || isNaN(Number(finalReading)) || Number(finalReading) < 0) {
      errors.finalReading = 'Valid final reading is required';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleConfirm = async () => {
    if (!validate()) return;

    const payload = {
      reason: reason.trim(),
      terminatedAt: new Date(date).toISOString(),
      finalReading: Number(finalReading),
    };

    try {
      await terminateMutation.mutateAsync({ meterId, data: payload });
      toast.success(t('meters.terminate.success'));
    } catch (error: any) {
      toast.error(error?.message || t('common.error'));
    }
  };

  return (
    <div>
      <PageHeader title={t('meters.terminate.title')} subtitle={t('meters.terminate.subtitle')} />

      <div className="max-w-2xl space-y-6">
        {/* Meter Selector */}
        <Card className="glass-card border-border/50">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2"><XCircle className="h-4 w-4" /> Select Meter</h3>
            <Select value={meterId} onValueChange={setMeterId}>
              <SelectTrigger><SelectValue placeholder="Select meter to terminate" /></SelectTrigger>
              <SelectContent>
                {activeMeters.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.serialNumber} - {m.brand} ({m.customerName || 'Unassigned'})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Meter Details */}
        {meter && (
          <Card className="glass-card border-border/50">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Meter Details</h3>
              <div className="text-sm space-y-2 p-4 rounded-lg bg-muted/30">
                <div className="flex justify-between"><span className="text-muted-foreground">{t('meters.serialNumber')}</span><span className="font-mono">{meter.serialNumber}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">{t('meters.type')}</span><StatusBadge status={meter.meterType} /></div>
                <div className="flex justify-between"><span className="text-muted-foreground">{t('meters.status')}</span><StatusBadge status={meter.status} /></div>
                {customer && <div className="flex justify-between"><span className="text-muted-foreground">{t('meters.customer')}</span><span>{customer.name}</span></div>}
                {meter.unitNumber && <div className="flex justify-between"><span className="text-muted-foreground">{t('locations.unit')}</span><span>{meter.unitNumber}</span></div>}
                {sim && <div className="flex justify-between"><span className="text-muted-foreground">{t('simCards.phoneNumber')}</span><span>{sim.msisdn}</span></div>}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Termination Form */}
        {meter && (
          <Card className="glass-card border-border/50">
            <CardContent className="p-6 space-y-4">
              <h3 className="font-semibold">Termination Details</h3>
              <div>
                <Label>Termination Date</Label>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                {validationErrors.date && <p className="text-xs text-red-500 mt-1">{validationErrors.date}</p>}
              </div>
              <div>
                <Label>{t('meters.terminate.finalReading')}</Label>
                <Input type="number" value={finalReading} onChange={(e) => setFinalReading(e.target.value)} placeholder="Enter final meter reading" />
                {validationErrors.finalReading && <p className="text-xs text-red-500 mt-1">{validationErrors.finalReading}</p>}
              </div>
              <div>
                <Label>{t('meters.terminate.reason')}</Label>
                <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Enter termination reason..." rows={3} />
                {validationErrors.reason && <p className="text-xs text-red-500 mt-1">{validationErrors.reason}</p>}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Result Preview */}
        {meter && (
          <Card className="glass-card border-amber-500/30 border">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-3 flex items-center gap-2 text-amber-500">
                <AlertTriangle className="h-4 w-4" /> What will happen
              </h3>
              <ul className="text-sm space-y-1.5 text-muted-foreground list-disc list-inside">
                <li>Meter {meter.serialNumber} will be marked as <strong>terminated</strong></li>
                <li>All automated readings will stop</li>
                <li>{customer ? `Customer ${customer.name} will need a replacement meter` : 'No customer will be affected'}</li>
                {sim && <li>SIM {sim.msisdn} will be released for reuse</li>}
              </ul>
              <Button className="mt-4 gap-2" onClick={handleConfirm} disabled={terminateMutation.isPending}>
                {terminateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                {terminateMutation.isPending ? t('common.loading').replace('...', '') + '...' : t('meters.terminate.submit')}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
