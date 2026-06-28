'use client';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';
import { usePageStore } from '@/lib/router-store';
import { StatCard, formatCurrency } from '@/components/shared/PageHelpers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, DollarSign, AlertTriangle, Banknote, Users, Clock, BarChart3, ArrowUpRight, Scale } from 'lucide-react';

export default function CollectionsDashboardPlus() {
  const projectId = typeof window !== 'undefined' ? localStorage.getItem('selected-project') || '' : '';
  const { data: coll } = useQuery({ queryKey: ['coll-dash'], queryFn: () => apiGet<any>('/collections/dashboard').catch(() => ({})) });
  const { data: aging } = useQuery({ queryKey: ['coll-aging'], queryFn: () => apiGet<any>('/collections/aging').catch(() => ({})) });
  const { data: customers } = useQuery({ queryKey: ['customers', projectId], queryFn: () => {
    if (!projectId) return Promise.resolve([]);
    return apiGet<any[]>(`/projects/${projectId}/customers`).catch(() => []);
  }, enabled: !!projectId });
  const { data: payments } = useQuery({ queryKey: ['payments'], queryFn: () => apiGet<any[]>('/payments').catch(() => []) });
  const c = coll ?? {}; const a = aging ?? {}; const custs = customers ?? []; const pays = payments ?? [];

  const topDebtors = [...custs].sort((a: any, b: any) => (b.currentBalance ?? 0) - (a.currentBalance ?? 0)).slice(0, 5);
  const totalPaid = pays.reduce((s: number, p: any) => s + Number(p.amount ?? 0), 0);

  return (
    <div>
      <div className="mb-4"><h1 className="text-2xl font-bold">Collections Dashboard+</h1><p className="text-sm text-muted-foreground">Enhanced collections with KPIs, aging, collector tracking</p></div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <StatCard label="Collection Rate" value={c.collectionRate != null ? c.collectionRate + '%' : '-'} icon={<TrendingUp className="h-5 w-5" />} color={Number(c.collectionRate) > 70 ? 'text-emerald-500' : 'text-amber-500'} />
        <StatCard label="Outstanding" value={formatCurrency(c.outstanding ?? 0)} icon={<Scale className="h-5 w-5" />} color="text-red-500" />
        <StatCard label="Monthly Collected" value={formatCurrency(c.monthCollections ?? totalPaid)} icon={<Banknote className="h-5 w-5" />} />
        <StatCard label="Today" value={formatCurrency(c.todayCollections ?? 0)} icon={<ArrowUpRight className="h-5 w-5" />} />
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <Card className="glass-card border-border/50">
          <CardHeader><CardTitle className="text-sm">Aging Buckets</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[
                { label: 'Current', key: 'current' },
                { label: '1-30 Days', key: 'days1to30' },
                { label: '31-60 Days', key: 'days31to60' },
                { label: '61-90 Days', key: 'days61to90' },
                { label: '90+ Days', key: 'days120plus' },
              ].map((b) => (
                <div key={b.key} className="flex justify-between p-2 rounded hover:bg-muted/20">
                  <span className="text-sm">{b.label}</span>
                  <div className="text-right">
                    <p className="text-sm font-bold">{formatCurrency(a[b.key]?.total ?? 0)}</p>
                    <p className="text-xs text-muted-foreground">{a[b.key]?.count ?? 0} invoices</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card border-border/50">
          <CardHeader><CardTitle className="text-sm">Top Debtors</CardTitle></CardHeader>
          <CardContent>
            {topDebtors.length > 0 ? (
              <div className="space-y-2">
                {topDebtors.map((d: any, i: number) => (
                  <div key={d.id} className="flex justify-between p-2 rounded bg-muted/20">
                    <div><span className="text-sm font-medium">{d.name}</span><p className="text-xs text-muted-foreground">{d.customerCode ?? ''}</p></div>
                    <span className="text-sm font-bold text-red-500">{formatCurrency(d.currentBalance ?? 0)}</span>
                  </div>
                ))}
              </div>
            ) : <p className="text-sm text-muted-foreground">No debtor data</p>}
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card border-border/50">
        <CardHeader><CardTitle className="text-sm">Recovery Summary</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard label="Total Invoiced" value={formatCurrency(c.totalInvoiced ?? 0)} icon={<DollarSign className="h-4 w-4" />} />
            <StatCard label="Total Collected" value={formatCurrency(c.totalCollected ?? totalPaid)} icon={<Banknote className="h-4 w-4" />} />
            <StatCard label="Overdue" value={formatCurrency(c.overdueInvoices ?? c.outstanding ?? 0)} icon={<AlertTriangle className="h-4 w-4" />} color="text-red-500" />
            <StatCard label="Pending" value={c.pendingInvoices ?? '-'} icon={<Clock className="h-4 w-4" />} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
