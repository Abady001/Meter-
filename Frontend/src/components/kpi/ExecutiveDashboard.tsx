'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { QueryBoundary } from '@/components/shared/QueryBoundary';
import { PageHeader } from '@/components/shared/PageHelpers';
import { useT } from '@/lib/i18n/context';
import { useProjectsList } from '@/hooks/use-projects';
import { TrendingUp, TrendingDown, DollarSign, Zap, Users, Activity, AlertTriangle, BarChart3 } from 'lucide-react';

function KpiCard({ title, value, sub, icon, trend, color }: { title: string; value: string | number; sub?: string; icon?: React.ReactNode; trend?: 'up' | 'down' | 'neutral'; color?: string }) {
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
            {trend === 'up' ? <TrendingUp className="h-3 w-3 text-emerald-500" /> : trend === 'down' ? <TrendingDown className="h-3 w-3 text-red-500" /> : null}
            <span className={trend === 'up' ? 'text-emerald-600' : trend === 'down' ? 'text-red-600' : 'text-muted-foreground'}>
              {trend === 'up' ? 'Improving' : trend === 'down' ? 'Declining' : 'Stable'}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">{title}</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">{children}</div>
    </div>
  );
}

export default function ExecutiveDashboard() {
  const t = useT();
  const [projectFilter, setProjectFilter] = useState('');
  const { data: projects } = useProjectsList();

  const { data, isLoading } = useQuery({
    queryKey: ['kpi-executive', projectFilter],
    queryFn: () => apiGet<any>(`/kpi/executive${projectFilter ? `?projectId=${projectFilter}` : ''}`),
  });

  const kpi = data as any;

  if (isLoading) return <div className="text-center py-12 text-muted-foreground">Loading KPI data...</div>;

  return (
    <div>
      <PageHeader title="Executive Dashboard" description="Enterprise performance overview" />

      <div className="mb-6 flex gap-3">
        <Select value={projectFilter} onValueChange={v => setProjectFilter(v === '__all' ? '' : v)}>
          <SelectTrigger className="w-[220px]"><SelectValue placeholder="All Projects" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="__all">All Projects</SelectItem>
            {(projects || []).map((p: any) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Section title="Revenue">
        <KpiCard title="Total Revenue" value={kpi?.revenue?.totalInvoiced || 0} sub="All time" icon={<DollarSign className="h-8 w-8" />} />
        <KpiCard title="Monthly Revenue" value={kpi?.revenue?.monthlyRevenue || 0} sub="Current month" icon={<BarChart3 className="h-8 w-8" />} trend="up" />
        <KpiCard title="Annual Revenue" value={kpi?.revenue?.annualRevenue || 0} sub="Year to date" />
        <KpiCard title="Total Collected" value={kpi?.revenue?.totalPaid || 0} icon={<DollarSign className="h-8 w-8" />} />
        <KpiCard title="Collection Rate" value={`${kpi?.revenue?.collectionRate || 0}%`} trend={Number(kpi?.revenue?.collectionRate || 0) >= 80 ? 'up' : 'down'} />
        <KpiCard title="Recovery Rate" value={`${kpi?.revenue?.recoveryRate || 0}%`} />
        <KpiCard title="Revenue Growth" value={`${kpi?.revenue?.revenueGrowth || 0}%`} trend={Number(kpi?.revenue?.revenueGrowth || 0) >= 0 ? 'up' : 'down'} />
        <KpiCard title="Outstanding Balance" value={kpi?.revenue?.totalOpen || 0} sub="Unpaid" color="text-red-600" icon={<AlertTriangle className="h-8 w-8" />} />
      </Section>

      <Section title="Billing">
        <KpiCard title="Invoices Generated" value={kpi?.billing?.invoicesGenerated || 0} icon={<Activity className="h-8 w-8" />} />
        <KpiCard title="Invoices Paid" value={kpi?.billing?.invoicesPaid || 0} />
        <KpiCard title="Invoices Unpaid" value={kpi?.billing?.invoicesUnpaid || 0} color="text-amber-600" />
        <KpiCard title="Overdue Invoices" value={kpi?.billing?.overdueInvoices || 0} color="text-red-600" icon={<AlertTriangle className="h-8 w-8" />} />
        <KpiCard title="Posted Invoices" value={kpi?.billing?.postedInvoices || 0} />
        <KpiCard title="Cancelled" value={kpi?.billing?.cancelledInvoices || 0} />
      </Section>

      <Section title="Customers">
        <KpiCard title="Total Customers" value={kpi?.customers?.total || 0} icon={<Users className="h-8 w-8" />} />
        <KpiCard title="Active" value={kpi?.customers?.active || 0} />
        <KpiCard title="Inactive" value={kpi?.customers?.inactive || 0} />
        <KpiCard title="New (This Month)" value={kpi?.customers?.newCustomers || 0} trend="up" />
        <KpiCard title="High Consumption" value={kpi?.customers?.highConsumption || 0} icon={<Zap className="h-8 w-8" />} />
        <KpiCard title="Delinquent" value={kpi?.customers?.delinquent || 0} color="text-red-600" />
      </Section>

      <Section title="Meters">
        <KpiCard title="Total Meters" value={kpi?.meters?.total || 0} icon={<Activity className="h-8 w-8" />} />
        <KpiCard title="Active" value={kpi?.meters?.active || 0} />
        <KpiCard title="Electricity" value={kpi?.meters?.electricity || 0} />
        <KpiCard title="Water" value={kpi?.meters?.water || 0} />
        <KpiCard title="Solar" value={kpi?.meters?.solar || 0} />
        <KpiCard title="Chilled Water" value={kpi?.meters?.chilledWater || 0} />
        <KpiCard title="1PH" value={kpi?.meters?.phase1ph || 0} />
        <KpiCard title="3PH" value={kpi?.meters?.phase3ph || 0} />
        <KpiCard title="Meter Health" value={`${kpi?.meters?.health || 0}%`} trend={Number(kpi?.meters?.health || 0) >= 90 ? 'up' : 'down'} />
        <KpiCard title="Disconnected" value={kpi?.meters?.disconnected || 0} color="text-amber-600" />
      </Section>

      {kpi?.projects?.length > 0 && (
        <Section title="Project Performance">
          {kpi.projects.slice(0, 8).map((p: any) => (
            <KpiCard key={p.projectId} title={`Project ${p.projectId.slice(0, 8)}`} value={`${p.collectionRate}%`} sub={`${p.customers} customers`} />
          ))}
        </Section>
      )}
    </div>
  );
}
