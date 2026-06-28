'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageHeader } from '@/components/shared/PageHelpers';
import { useProjectsList } from '@/hooks/use-projects';
import { Zap, Droplets, Sun, Thermometer, Activity, BarChart3, TrendingUp } from 'lucide-react';

function UtilityCard({ title, data, icon, color }: { title: string; data: any; icon: React.ReactNode; color: string }) {
  if (!data) return null;
  return (
    <Card className={`border-l-4 ${color}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          {icon}{title}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm space-y-2">
        <div className="flex justify-between"><span className="text-muted-foreground">Invoices</span><span className="font-mono">{data.count || 0}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Total Amount</span><span className="font-mono">EGP {Number(data.total || 0).toLocaleString()}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Collected</span><span className="font-mono">EGP {Number(data.paid || 0).toLocaleString()}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Open</span><span className="font-mono text-amber-600">EGP {Number(data.open || 0).toLocaleString()}</span></div>
        <div className="pt-1">
          {Number(data.total || 0) > 0 && (
            <div className="w-full bg-muted rounded-full h-2">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${(Number(data.paid || 0) / Number(data.total || 0)) * 100}%` }} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function MeterTypeCard({ title, data, icon }: { title: string; data: any; icon: React.ReactNode }) {
  if (!data) return null;
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">{icon}{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-sm space-y-2">
        <div className="flex justify-between"><span className="text-muted-foreground">Total Meters</span><span className="font-mono">{data.total || 0}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Active</span><span className="font-mono">{data.active || 0}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Readings</span><span className="font-mono">{data.readings || 0}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Consumption</span><span className="font-mono">{Number(data.consumption || 0).toLocaleString()}</span></div>
      </CardContent>
    </Card>
  );
}

export default function UtilitiesDashboard() {
  const [projectFilter, setProjectFilter] = useState('');
  const { data: projects } = useProjectsList();

  const { data, isLoading } = useQuery({
    queryKey: ['kpi-utilities', projectFilter],
    queryFn: () => apiGet<any>(`/kpi/utilities${projectFilter ? `?projectId=${projectFilter}` : ''}`),
  });

  const kpi = data as any;

  if (isLoading) return <div className="text-center py-12 text-muted-foreground">Loading utility data...</div>;

  const utilities = kpi?.utilities || {};
  const meterTypes = kpi?.meters || {};

  return (
    <div>
      <PageHeader title="Utilities Dashboard" description="Utility operations by type" />

      <div className="mb-6">
        <Select value={projectFilter} onValueChange={v => setProjectFilter(v === '__all' ? '' : v)}>
          <SelectTrigger className="w-[220px]"><SelectValue placeholder="All Projects" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="__all">All Projects</SelectItem>
            {(projects || []).map((p: any) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">Invoice Summary by Utility</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <UtilityCard title="Electricity" data={utilities.electricity} icon={<Zap className="h-4 w-4 text-amber-500" />} color="border-amber-500" />
        <UtilityCard title="Water" data={utilities.water_main || utilities.water} icon={<Droplets className="h-4 w-4 text-blue-500" />} color="border-blue-500" />
        <UtilityCard title="Solar" data={utilities.solar} icon={<Sun className="h-4 w-4 text-yellow-500" />} color="border-yellow-500" />
        <UtilityCard title="Chilled Water" data={utilities.chilled_water} icon={<Thermometer className="h-4 w-4 text-cyan-500" />} color="border-cyan-500" />
        <UtilityCard title="Gas" data={utilities.gas} icon={<Activity className="h-4 w-4 text-orange-500" />} color="border-orange-500" />
        <UtilityCard title="Settlement" data={utilities.settlement} icon={<BarChart3 className="h-4 w-4 text-purple-500" />} color="border-purple-500" />
      </div>

      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">Meter Summary by Type</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <MeterTypeCard title="Electricity Meters" data={meterTypes.electricity} icon={<Zap className="h-4 w-4 text-amber-500" />} />
        <MeterTypeCard title="Water Meters" data={meterTypes.water_main} icon={<Droplets className="h-4 w-4 text-blue-500" />} />
        <MeterTypeCard title="Solar Meters" data={meterTypes.solar} icon={<Sun className="h-4 w-4 text-yellow-500" />} />
        <MeterTypeCard title="Chilled Water" data={meterTypes.chilled_water} icon={<Thermometer className="h-4 w-4 text-cyan-500" />} />
      </div>
    </div>
  );
}
