'use client';
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';
import { usePageStore } from '@/lib/router-store';
import { StatCard } from '@/components/shared/PageHelpers';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useT } from '@/lib/i18n/context';
import { TrendingUp, DollarSign, ArrowUpRight, Building2, Users, Gauge, Receipt, Banknote, AlertTriangle, Shield, BarChart3, Activity, Clock, Zap, Droplets, Sun, Flame, Thermometer, Wind, RefreshCw } from 'lucide-react';

function formatCurrency(v: number): string {
  return new Intl.NumberFormat('en-EG', { style: 'currency', currency: 'EGP', minimumFractionDigits: 0 }).format(v ?? 0);
}

const utilityIcons: Record<string, any> = { electricity: Zap, water: Droplets, solar: Sun, gas: Flame, chilled_water: Thermometer, outdoor_unit: Wind, settlement: RefreshCw };

export default function ExecutiveDashboard() {
  const { navigate } = usePageStore();
  const { data: coll } = useQuery({ queryKey: ['coll-dash'], queryFn: () => apiGet<any>('/collections/dashboard').catch(() => ({})) });
  const { data: aging } = useQuery({ queryKey: ['coll-aging'], queryFn: () => apiGet<any>('/collections/aging').catch(() => ({})) });
  const { data: meters } = useQuery({ queryKey: ['meters'], queryFn: () => apiGet<any[]>('/meters').catch(() => []) });
  const { data: projects } = useQuery({ queryKey: ['projects'], queryFn: () => apiGet<any[]>('/projects').catch(() => []) });
  const { data: customers } = useQuery({ queryKey: ['customers-all'], queryFn: () => apiGet<any[]>('/customers').catch(() => []) });
  const { data: invoices } = useQuery({ queryKey: ['invoices-all'], queryFn: () => apiGet<any[]>('/invoices').catch(() => []) });
  const { data: payments } = useQuery({ queryKey: ['payments-all'], queryFn: () => apiGet<any[]>('/payments').catch(() => []) });
  const { data: readings } = useQuery({ queryKey: ['readings-all'], queryFn: () => apiGet<any[]>('/readings').catch(() => []) });

  const metersList = meters ?? [];
  const projectsList = projects ?? [];
  const customersList = customers ?? [];
  const invoicesList = invoices ?? [];
  const paymentsList = payments ?? [];
  const readingsList = readings ?? [];
  const c = coll ?? {};
  const a = aging ?? {};

  const activeMeters = metersList.filter((m: any) => m.status === 'active').length;
  const totalInvoiced = invoicesList.reduce((s: number, i: any) => s + Number(i.totalAmount ?? i.total ?? 0), 0);
  const totalPaid = paymentsList.reduce((s: number, p: any) => s + Number(p.amount ?? 0), 0);
  const collectionRate = totalInvoiced > 0 ? ((totalPaid / totalInvoiced) * 100).toFixed(1) : '0';

  const topProjects = useMemo(() => [...projectsList].sort((a: any, b: any) => (b.customerCount ?? 0) - (a.customerCount ?? 0)).slice(0, 5), [projectsList]);
  const topDebtors = useMemo(() => [...customersList].sort((a: any, b: any) => (b.currentBalance ?? 0) - (a.currentBalance ?? 0)).slice(0, 5), [customersList]);
  const utilityMix = useMemo(() => {
    const counts: Record<string, number> = {};
    metersList.forEach((m: any) => { const t = m.meterType ?? 'unknown'; counts[t] = (counts[t] ?? 0) + 1; });
    return Object.entries(counts).map(([k, v]) => ({ type: k, count: v }));
  }, [metersList]);

  const riskScore = collectionRate;
  const riskLevel = Number(riskScore) > 80 ? 'Low' : Number(riskScore) > 60 ? 'Medium' : 'High';

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">Executive Dashboard</h1>
          <p className="text-sm text-muted-foreground">CEO-level platform overview — Revenue, Collection, Risk, Forecast</p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={'Collection: ' + collectionRate + '%'} />
          <Shield className={'h-5 w-5 ' + (riskLevel === 'Low' ? 'text-emerald-500' : riskLevel === 'Medium' ? 'text-amber-500' : 'text-red-500')} />
        </div>
      </div>

      {/* Revenue Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <StatCard label="Revenue Today" value={formatCurrency(c.todayCollections ?? 0)} icon={<DollarSign className="h-5 w-5" />} />
        <StatCard label="Revenue Month" value={formatCurrency(c.monthCollections ?? 0)} icon={<TrendingUp className="h-5 w-5" />} />
        <StatCard label="Revenue Year" value={formatCurrency(totalPaid)} icon={<BarChart3 className="h-5 w-5" />} onClick={() => navigate('collections')} />
        <StatCard label="Collection Rate" value={collectionRate + '%'} icon={<Activity className="h-5 w-5" />} color={Number(collectionRate) > 70 ? 'text-emerald-500' : 'text-amber-500'} />
      </div>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
        <StatCard label="Outstanding" value={formatCurrency(c.outstanding ?? 0)} icon={<Scale />} color="text-red-500" onClick={() => navigate('collections')} />
        <StatCard label="Projects" value={projectsList.length} icon={<Building2 />} onClick={() => navigate('projects')} />
        <StatCard label="Customers" value={customersList.length} icon={<Users />} onClick={() => navigate('customers')} />
        <StatCard label="Meters" value={metersList.length} icon={<Gauge />} onClick={() => navigate('meters')} />
        <StatCard label="Invoices" value={invoicesList.length} icon={<Receipt />} onClick={() => navigate('invoices')} />
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-4">
        {/* Aging Summary */}
        <Card className="glass-card border-border/50">
          <CardHeader><CardTitle className="text-sm">Aging Summary</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-1 text-sm">
              {[
                { label: 'Current', key: 'current' },
                { label: '1-30 Days', key: 'days1to30' },
                { label: '31-60 Days', key: 'days31to60' },
                { label: '61-90 Days', key: 'days61to90' },
                { label: '90+ Days', key: 'days120plus' },
              ].map((b) => (
                <div key={b.key} className="flex justify-between p-1 rounded hover:bg-muted/20">
                  <span>{b.label}</span>
                  <span className={'font-mono font-bold ' + (b.key === 'days120plus' ? 'text-red-500' : '')}>{formatCurrency(a[b.key]?.total ?? 0)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Utility Mix */}
        <Card className="glass-card border-border/50">
          <CardHeader><CardTitle className="text-sm">Utility Mix</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {utilityMix.map((u) => {
                const Icon = utilityIcons[u.type] ?? Gauge;
                const pct = metersList.length > 0 ? ((u.count / metersList.length) * 100).toFixed(0) : '0';
                return (
                  <div key={u.type} className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm flex-1 capitalize">{u.type.replace(/_/g, ' ')}</span>
                    <span className="text-xs text-muted-foreground">{u.count}</span>
                    <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: pct + '%' }} />
                    </div>
                    <span className="text-xs text-muted-foreground w-8 text-right">{pct}%</span>
                  </div>
                );
              })}
              {utilityMix.length === 0 && <p className="text-sm text-muted-foreground">No meter data</p>}
            </div>
          </CardContent>
        </Card>

        {/* Risk & Forecast */}
        <Card className="glass-card border-border/50">
          <CardHeader><CardTitle className="text-sm">AI Risk & Forecast</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 rounded bg-muted/20">
                <span className="text-sm">Risk Score</span>
                <span className={'font-bold ' + (riskLevel === 'Low' ? 'text-emerald-500' : riskLevel === 'Medium' ? 'text-amber-500' : 'text-red-500')}>{riskScore}% ({riskLevel})</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-muted/20">
                <span className="text-sm">Collection Forecast</span>
                <span className="font-bold">{formatCurrency(totalInvoiced - (c.outstanding ?? 0))}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-muted/20">
                <span className="text-sm">Active Meters</span>
                <span className="font-bold text-emerald-500">{activeMeters}/{metersList.length}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-muted/20">
                <span className="text-sm">Total Invoiced</span>
                <span className="font-bold">{formatCurrency(totalInvoiced)}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-muted/20">
                <span className="text-sm">Total Paid</span>
                <span className="font-bold text-emerald-500">{formatCurrency(totalPaid)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Growth & Rankings Row */}
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <Card className="glass-card border-border/50">
          <CardHeader><CardTitle className="text-sm">Top Projects</CardTitle></CardHeader>
          <CardContent>
            {topProjects.length > 0 ? (
              <div className="space-y-1">
                {topProjects.map((p: any, i: number) => (
                  <div key={p.id} className="flex items-center justify-between p-1.5 rounded hover:bg-muted/20 cursor-pointer" onClick={() => navigate('project-360', { id: p.id })}>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground w-4">#{i + 1}</span>
                      <span className="text-sm">{p.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{p.customerCount ?? 0} customers</span>
                  </div>
                ))}
              </div>
            ) : <p className="text-sm text-muted-foreground">No project data</p>}
          </CardContent>
        </Card>
        <Card className="glass-card border-border/50">
          <CardHeader><CardTitle className="text-sm">Top Debtors</CardTitle></CardHeader>
          <CardContent>
            {topDebtors.length > 0 ? (
              <div className="space-y-1">
                {topDebtors.map((d: any, i: number) => (
                  <div key={d.id} className="flex items-center justify-between p-1.5 rounded hover:bg-muted/20">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground w-4">#{i + 1}</span>
                      <span className="text-sm">{d.name}</span>
                    </div>
                    <span className="text-sm font-bold text-red-500">{formatCurrency(d.currentBalance ?? 0)}</span>
                  </div>
                ))}
              </div>
            ) : <p className="text-sm text-muted-foreground">No debtor data</p>}
          </CardContent>
        </Card>
      </div>

      {/* Metric Growth Cards */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        <Card className="glass-card border-border/50"><CardContent className="p-3 text-center"><p className="text-2xl font-bold">{customersList.length}</p><p className="text-xs text-muted-foreground">Customers</p></CardContent></Card>
        <Card className="glass-card border-border/50"><CardContent className="p-3 text-center"><p className="text-2xl font-bold">{metersList.length}</p><p className="text-xs text-muted-foreground">Meters</p></CardContent></Card>
        <Card className="glass-card border-border/50"><CardContent className="p-3 text-center"><p className="text-2xl font-bold">{invoicesList.length}</p><p className="text-xs text-muted-foreground">Invoices</p></CardContent></Card>
        <Card className="glass-card border-border/50"><CardContent className="p-3 text-center"><p className="text-2xl font-bold">{paymentsList.length}</p><p className="text-xs text-muted-foreground">Payments</p></CardContent></Card>
      </div>

      {/* AI Insights */}
      <Card className="glass-card border-border/50">
        <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Shield className="h-4 w-4" />AI Insights</CardTitle></CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-muted/20">
              <p className="text-xs text-muted-foreground mb-1">Collection Risk</p>
              <p className="text-sm font-bold">{riskLevel === 'High' ? 'High risk — ' + formatCurrency(c.outstanding ?? 0) + ' outstanding' : riskLevel === 'Medium' ? 'Moderate — ' + formatCurrency(c.outstanding ?? 0) + ' overdue' : 'Healthy — ' + collectionRate + '% collected'}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/20">
              <p className="text-xs text-muted-foreground mb-1">Meter Coverage</p>
              <p className="text-sm font-bold">{activeMeters}/{metersList.length} meters active ({metersList.length > 0 ? ((activeMeters / metersList.length) * 100).toFixed(0) : 0}%)</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/20">
              <p className="text-xs text-muted-foreground mb-1">Payment Velocity</p>
              <p className="text-sm font-bold">{paymentsList.length} payments · avg {paymentsList.length > 0 ? formatCurrency(totalPaid / paymentsList.length) : formatCurrency(0)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
function Scale() { return <BarChart3 className="h-5 w-5" />; }
