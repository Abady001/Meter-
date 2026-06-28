'use client';

import { useState } from 'react';
import { isFeatureEnabled } from '@/lib/feature-flags';
import { useConsumptionTrend } from '@/hooks/use-consumption';
import { PageHeader } from '@/components/shared/PageHelpers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QueryBoundary } from '@/components/shared/QueryBoundary';
import SmartTable from '@/components/smart-table/SmartTable';
import { cn } from '@/lib/utils';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useT } from '@/lib/i18n/context';

const highConsumption = [
  { meter: 'EM-2024-0015', customer: 'Port Said Fisheries', consumption: 2000, type: 'Electricity' },
  { meter: 'CW-2024-0004', customer: 'Tarek Nabil', consumption: 1000, type: 'Water' },
  { meter: 'EM-2024-0010', customer: 'Delta Consulting', consumption: 800, type: 'Electricity' },
];

const zeroConsumption = [
  { meter: 'EM-2024-0013', customer: 'Khaled Mansour', consumption: 0, type: 'Electricity' },
];

const missingReadings = [
  { meter: 'EM-2024-0007', customer: 'Dina Shop', lastReading: '2025-01-15', daysAgo: 5 },
  { meter: 'EM-2024-0006', customer: 'El-Masry Trading', lastReading: '2025-01-13', daysAgo: 7 },
];

export default function ConsumptionPage() {
  const t = useT();
  const [period, setPeriod] = useState('monthly');
  const useApi = isFeatureEnabled('consumption');
  const { data: apiData } = useConsumptionTrend(useApi ? '00000000-0000-0000-0000-000000000001' : undefined);
  const chartData = [];

  return (
    <div>
      <PageHeader title={t('billing.consumption.title')} subtitle={t('billing.consumption.subtitle')} />

      <div className="flex gap-2 mb-6">
        {['daily', 'monthly', 'custom'].map((p) => (
          <Button key={p} variant={period === p ? 'default' : 'outline'} size="sm" onClick={() => setPeriod(p)}>
            {p === 'daily' ? 'Daily' : p === 'monthly' ? 'Monthly' : 'Custom Range'}
          </Button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <Card className="glass-card border-border/50">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Electricity Consumption</CardTitle></CardHeader>
          <CardContent>
            <QueryBoundary isLoading={false} isError={false} error={null} loadingFallback={<div className="h-[250px] flex items-center justify-center text-muted-foreground">Loading...</div>}>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                  <Line type="monotone" dataKey="electricity" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} name="kWh" />
                </LineChart>
              </ResponsiveContainer>
            </QueryBoundary>
          </CardContent>
        </Card>

        <Card className="glass-card border-border/50">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Water Consumption</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                <Line type="monotone" dataKey="water" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} name="m³" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-6">
        <Card className="glass-card border-border/50">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-amber-500">High Consumption</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {highConsumption.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{item.customer}</span>
                <span className="font-mono font-medium">{item.consumption.toLocaleString()} {item.type === 'Electricity' ? 'kWh' : 'm³'}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="glass-card border-border/50">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-blue-500">Zero Consumption</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {zeroConsumption.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{item.customer}</span>
                <span className="font-mono text-muted-foreground">{item.meter}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="glass-card border-border/50">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-purple-500">Missing Readings</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {missingReadings.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{item.customer}</span>
                <span className="font-mono text-amber-500">{item.daysAgo} days</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="mb-6">
        <SmartTable
          title="Per-Meter Consumption"
          data={[
            { meter: 'EM-2024-0001', customer: 'Acme Corp', type: 'Electricity', consumption: 15420, unit: 'kWh', trend: '+2.3%' },
            { meter: 'WM-2024-0001', customer: 'Acme Corp', type: 'Water', consumption: 890, unit: 'm³', trend: '-1.1%' },
            { meter: 'EM-2024-0002', customer: 'Nile Traders', type: 'Electricity', consumption: 8750, unit: 'kWh', trend: '+5.7%' },
            { meter: 'EM-2024-0003', customer: 'Heliopolis Hotel', type: 'Electricity', consumption: 31200, unit: 'kWh', trend: '+0.8%' },
            { meter: 'WM-2024-0003', customer: 'Heliopolis Hotel', type: 'Water', consumption: 2450, unit: 'm³', trend: '+12.4%' },
          ]}
          columns={[
            { key: 'meter', label: 'Meter', sortable: true },
            { key: 'customer', label: 'Customer', sortable: true },
            { key: 'type', label: 'Type', sortable: true },
            { key: 'consumption', label: 'Consumption', sortable: true, render: (v) => v.toLocaleString() },
            { key: 'unit', label: 'Unit' },
            { key: 'trend', label: 'Trend', sortable: true, render: (v) => <span className={cn(v.startsWith('+') ? 'text-amber-500' : 'text-green-500')}>{v}</span> },
          ]}
          searchable
        />
      </div>
    </div>
  );
}
