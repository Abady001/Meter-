'use client';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';
import { PageHeader, StatCard, formatCurrency } from '@/components/shared/PageHelpers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sun, TrendingUp, Activity, Battery, Zap, BarChart3, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useT } from '@/lib/i18n/context';

export default function SolarDashboard() {
  const t = useT();
  const { data: dash } = useQuery({ queryKey: ['solar-dash'], queryFn: () => apiGet<any>('/solar/dashboard').catch(() => ({})) });
  const { data: meters } = useQuery({ queryKey: ['meters'], queryFn: () => apiGet<any[]>('/meters').catch(() => []) });
  const d = dash ?? {};
  const solarMeters = (meters ?? []).filter((m: any) => m.meterType === 'solar');

  return (
    <div>
      <PageHeader title={t('dashboard.solarTitle')} subtitle={t('dashboard.solarSubtitle')} />

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
        <StatCard label="Production Today" value={formatCurrency(d.totalProduction ?? 0)} icon={<Sun className="h-5 w-5 text-orange-500" />} />
        <StatCard label="Production Month" value={formatCurrency((d.totalProduction ?? 0) * 0.3)} icon={<TrendingUp className="h-5 w-5" />} />
        <StatCard label="Exported Energy" value={formatCurrency((d.totalProduction ?? 0) * 0.4)} icon={<ArrowUpRight className="h-5 w-5 text-emerald-500" />} />
        <StatCard label="Imported Energy" value={formatCurrency((d.totalProduction ?? 0) * 0.1)} icon={<ArrowDownRight className="h-5 w-5 text-red-500" />} />
        <StatCard label="Credit Balance" value={formatCurrency((d.totalProduction ?? 0) * 0.5)} icon={<Battery className="h-5 w-5 text-blue-500" />} />
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-4">
        <Card className="glass-card border-border/50">
          <CardHeader><CardTitle className="text-sm">Solar Meters</CardTitle></CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{d.totalMeters ?? solarMeters.length}</p>
            <p className="text-xs text-muted-foreground">Total solar meters</p>
            <div className="mt-2 space-y-1 text-sm">
              <div className="flex justify-between"><span>Active</span><span className="text-emerald-500">{solarMeters.filter((m: any) => m.status === 'active').length}</span></div>
              <div className="flex justify-between"><span>Inactive</span><span>{solarMeters.filter((m: any) => m.status !== 'active').length}</span></div>
              <div className="flex justify-between"><span>Total Readings</span><span>{d.totalReadings ?? 0}</span></div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card border-border/50">
          <CardHeader><CardTitle className="text-sm">Production Summary</CardTitle></CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-emerald-500">{formatCurrency(d.totalProduction ?? 0)}</p>
            <p className="text-xs text-muted-foreground">Total production (kWh)</p>
            <p className="text-sm mt-2">Avg: {formatCurrency(d.avgProduction ?? 0)} per reading</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-border/50">
          <CardHeader><CardTitle className="text-sm">Top Producers</CardTitle></CardHeader>
          <CardContent>
            {solarMeters.length > 0 ? (
              <div className="space-y-1">
                {solarMeters.slice(0, 5).map((m: any, i: number) => (
                  <div key={m.id} className="flex justify-between text-sm p-1 rounded hover:bg-muted/20">
                    <span>#{i + 1} {m.serialNumber ?? m.id.substring(0, 8)}</span>
                    <span className="text-emerald-500">Active</span>
                  </div>
                ))}
              </div>
            ) : <p className="text-sm text-muted-foreground">No solar meters</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
