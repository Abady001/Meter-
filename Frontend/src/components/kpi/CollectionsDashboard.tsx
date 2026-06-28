'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageHeader } from '@/components/shared/PageHelpers';
import { useProjectsList } from '@/hooks/use-projects';
import { DollarSign, TrendingUp, TrendingDown, CalendarDays, AlertTriangle, Clock, Banknote } from 'lucide-react';

function KpiCard({ title, value, sub, icon, trend, color }: { title: string; value: string | number; sub?: string; icon?: React.ReactNode; trend?: 'up' | 'down'; color?: string }) {
  return (
    <Card className="border-border/50">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-medium">{title}</p>
            <p className={`text-2xl font-bold ${color || ''}`}>{typeof value === 'number' ? value.toLocaleString() : value}</p>
            {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
          </div>
          {icon && <div className="text-muted-foreground/40">{icon}</div>}
        </div>
        {trend && (
          <div className="mt-2 flex items-center gap-1 text-xs">
            {trend === 'up' ? <TrendingUp className="h-3 w-3 text-emerald-500" /> : <TrendingDown className="h-3 w-3 text-red-500" />}
            <span className={trend === 'up' ? 'text-emerald-600' : 'text-red-600'}>{trend === 'up' ? 'Improving' : 'Declining'}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function CollectionsDashboard() {
  const [projectFilter, setProjectFilter] = useState('');
  const { data: projects } = useProjectsList();

  const { data, isLoading } = useQuery({
    queryKey: ['kpi-collections', projectFilter],
    queryFn: () => apiGet<any>(`/kpi/collections${projectFilter ? `?projectId=${projectFilter}` : ''}`),
  });

  const kpi = data as any;

  if (isLoading) return <div className="text-center py-12 text-muted-foreground">Loading collection data...</div>;

  const agingEntries = kpi?.aging ? Object.entries(kpi.aging) : [];
  const maxAging = agingEntries.length > 0 ? Math.max(...agingEntries.map(([, v]) => v as number)) : 1;

  return (
    <div>
      <PageHeader title="Collections Dashboard" description="Collection performance and aging analysis" />

      <div className="mb-6">
        <Select value={projectFilter} onValueChange={v => setProjectFilter(v === '__all' ? '' : v)}>
          <SelectTrigger className="w-[220px]"><SelectValue placeholder="All Projects" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="__all">All Projects</SelectItem>
            {(projects || []).map((p: any) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Collection Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <KpiCard title="Collected Today" value={kpi?.collectedToday || 0} icon={<CalendarDays className="h-8 w-8" />} />
        <KpiCard title="Collected This Month" value={kpi?.collectedThisMonth || 0} icon={<Banknote className="h-8 w-8" />} trend="up" />
        <KpiCard title="Collected This Year" value={kpi?.collectedThisYear || 0} icon={<DollarSign className="h-8 w-8" />} />
        <KpiCard title="Total Payments" value={kpi?.paymentCount || 0} />
        <KpiCard title="Collection Rate" value={`${kpi?.collectionRate || 0}%`} trend={Number(kpi?.collectionRate || 0) >= 70 ? 'up' : 'down'} />
        <KpiCard title="Recovery Rate" value={`${kpi?.recoveryRate || 0}%`} />
        <KpiCard title="Outstanding Balance" value={kpi?.totalOpen || 0} color="text-red-600" icon={<AlertTriangle className="h-8 w-8" />} />
        <KpiCard title="Overdue Balance" value={kpi?.overdueBalance || 0} color="text-red-600" icon={<Clock className="h-8 w-8" />} />
      </div>

      {/* Aging Buckets */}
      <Card className="mb-8">
        <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Clock className="h-4 w-4" />Aging Buckets (Outstanding by Days)</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            {agingEntries.map(([bucket, amount]) => (
              <div key={bucket}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">{bucket} days</span>
                  <span className="font-mono">EGP {Number(amount).toLocaleString()}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      bucket === '0-30' ? 'bg-emerald-500' :
                      bucket === '31-60' ? 'bg-amber-500' :
                      bucket === '61-90' ? 'bg-orange-500' : 'bg-red-600'
                    }`}
                    style={{ width: `${(Number(amount) / maxAging) * 100}%` }}
                  />
                </div>
              </div>
            ))}
            {agingEntries.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No aging data</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
