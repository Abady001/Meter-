'use client';

import { useState } from 'react';
import { useProjectsList } from '@/hooks/use-projects';
import { useWaterBalance } from '@/hooks/use-water-balance';
import { PageHeader, StatCard } from '@/components/shared/PageHelpers';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import SmartTable from '@/components/smart-table/SmartTable';
import { cn } from '@/lib/utils';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts';
import { AlertTriangle, Droplets } from 'lucide-react';
import { useT } from '@/lib/i18n/context';

const childMeters = [
  { serial: 'CW-2024-0001', customer: 'Hassan Abdel-Rahim', unit: 'A-102', consumption: 600 },
  { serial: 'CW-2024-0002', customer: 'Mona Fawzy', unit: 'A-201', consumption: 300 },
  { serial: 'CW-2024-0004', customer: 'Tarek Nabil', unit: 'A-301', consumption: 1000 },
  { serial: 'CW-2024-0005', customer: 'Rania Saad', unit: 'N-101', consumption: 400 },
  { serial: 'CW-2024-0006', customer: 'Mohamed Amin', unit: 'N-501', consumption: 200 },
  { serial: 'CW-2024-0007', customer: 'Layla Osman', unit: 'G1-101', consumption: 350 },
  { serial: 'CW-2024-0008', customer: 'Port Said Fisheries', unit: 'P-101', consumption: 2000 },
];

export default function WaterBalancePage() {
  const t = useT();
  const { data: projects = [] } = useProjectsList();
  const [selectedProject, setSelectedProject] = useState('');
  const from = '2026-01-01';
  const to = '2026-01-31';
  const { data: apiData } = useWaterBalance(selectedProject, from, to);
  const latest = apiData ?? { mainMeterConsumption: 0, childMetersTotal: 0, difference: 0, differencePercent: 0, threshold: 10, coveragePercentage: 100 } as any;
  const exceedsThreshold = latest.coveragePercentage !== undefined ? latest.coveragePercentage < 80 : (latest.differencePercent > latest.threshold);

  return (
    <div>
      <PageHeader title={t('billing.waterBalance.title')} subtitle={t('billing.waterBalance.subtitle')} />

      {/* Selector */}
      <div className="mb-6 flex items-center gap-4">
        <div className="min-w-[200px]">
          <label className="text-sm text-muted-foreground mb-1 block">Project / Building / Main Meter</label>
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {(projects ?? []).filter((p) => p.status === 'active').map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        <StatCard label={t('billing.waterBalance.mainMeter')} value={latest.mainMeterConsumption.toLocaleString()} icon={<Droplets className="h-5 w-5" />} />
        <StatCard label={t('billing.waterBalance.subMeters')} value={latest.childMetersTotal.toLocaleString()} />
        <StatCard label={t('billing.waterBalance.variance')} value={latest.difference.toLocaleString()} color={exceedsThreshold ? 'text-red-500' : 'text-emerald-500'} />
        <StatCard label="Difference %" value={`${latest.differencePercent}%`} color={exceedsThreshold ? 'text-red-500' : 'text-emerald-500'} />
        <StatCard label="Threshold" value={`${latest.threshold}%`} />
      </div>

      {exceedsThreshold && (
        <div className="flex items-center gap-2 p-3 mb-6 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 text-sm">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          Water difference ({latest.differencePercent}%) exceeds threshold ({latest.threshold}%)
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Trend Chart */}
        <Card className="glass-card border-border/50">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Difference Trend</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={[]}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                <ReferenceLine y={latest.threshold} stroke="hsl(var(--destructive))" strokeDasharray="5 5" label={{ value: 'Threshold', fontSize: 10, fill: 'hsl(var(--destructive))' }} />
                <Line type="monotone" dataKey="differencePercent" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} name="Diff %" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Child Meter Breakdown */}
        <Card className="glass-card border-border/50">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Child Meter Breakdown</CardTitle></CardHeader>
          <CardContent>
            <SmartTable
              data={childMeters}
              columns={[
                { key: 'serial', label: 'Serial', render: (v: string) => <span className="font-mono text-xs">{v}</span> },
                { key: 'customer', label: 'Customer' },
                { key: 'unit', label: 'Unit', width: '80px' },
                { key: 'consumption', label: 'Usage', width: '80px' },
              ]}
              compact
              searchable={false}
              pageSize={7}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
