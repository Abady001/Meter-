'use client';
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';
import { StatCard, formatCurrency } from '@/components/shared/PageHelpers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Zap, Droplets, Sun, Flame, Thermometer, Wind, RefreshCw, TrendingUp, Activity, Gauge } from 'lucide-react';

const utilities = [
  { key: 'electricity', label: 'Electricity', icon: Zap, color: 'text-yellow-500' },
  { key: 'water', label: 'Water', icon: Droplets, color: 'text-blue-500' },
  { key: 'solar', label: 'Solar', icon: Sun, color: 'text-orange-500' },
  { key: 'gas', label: 'Gas', icon: Flame, color: 'text-red-500' },
  { key: 'chilled_water', label: 'Chilled Water', icon: Thermometer, color: 'text-cyan-500' },
  { key: 'outdoor_unit', label: 'Outdoor Unit', icon: Wind, color: 'text-teal-500' },
  { key: 'settlement', label: 'Settlement', icon: RefreshCw, color: 'text-purple-500' },
];

export default function UtilityDashboard() {
  const { data: meters } = useQuery({ queryKey: ['meters'], queryFn: () => apiGet<any[]>('/meters').catch(() => []) });
  const { data: readings } = useQuery({ queryKey: ['readings'], queryFn: () => apiGet<any[]>('/readings').catch(() => []) });
  const { data: invoices } = useQuery({ queryKey: ['invoices'], queryFn: () => apiGet<any[]>('/invoices').catch(() => []) });
  const m = meters ?? []; const r = readings ?? []; const i = invoices ?? [];

  const statsByUtility = useMemo(() => {
    return utilities.map((ut) => {
      const typeMeters = m.filter((x: any) => x.meterType === ut.key);
      const typeReadings = r.filter((x: any) => {
        const meter = m.find((mm: any) => mm.id === x.meterId);
        return meter?.meterType === ut.key;
      });
      const typeInvoices = i.filter((x: any) => (x.utilityType ?? x.utility_type) === ut.key);
      const totalRevenue = typeInvoices.reduce((s: number, inv: any) => s + Number(inv.totalAmount ?? inv.total ?? 0), 0);
      return { ...ut, meters: typeMeters.length, readings: typeReadings.length, invoices: typeInvoices.length, revenue: totalRevenue };
    });
  }, [m, r, i]);

  return (
    <div>
      <div className="mb-4"><h1 className="text-2xl font-bold">Utility Dashboard</h1><p className="text-sm text-muted-foreground">Per-utility consumption, revenue, collection, and trends</p></div>

      <Tabs defaultValue="electricity">
        <TabsList className="mb-4 flex-wrap h-auto gap-1">
          {utilities.map((ut) => <TabsTrigger key={ut.key} value={ut.key} className="flex items-center gap-1"><ut.icon className="h-3.5 w-3.5" />{ut.label}</TabsTrigger>)}
        </TabsList>

        {statsByUtility.map((ut) => (
          <TabsContent key={ut.key} value={ut.key}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <StatCard label="Meters" value={ut.meters} icon={<Gauge className="h-5 w-5" />} />
              <StatCard label="Readings" value={ut.readings} icon={<Activity className="h-5 w-5" />} />
              <StatCard label="Invoices" value={ut.invoices} icon={<TrendingUp className="h-5 w-5" />} />
              <StatCard label="Revenue" value={formatCurrency(ut.revenue)} icon={<TrendingUp className="h-5 w-5" />} />
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <Card className="glass-card border-border/50">
                <CardHeader><CardTitle className="text-sm flex items-center gap-2"><ut.icon className={'h-4 w-4 ' + ut.color} />Meters</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{ut.meters}</p>
                  <p className="text-xs text-muted-foreground">Total {ut.label} meters</p>
                </CardContent>
              </Card>
              <Card className="glass-card border-border/50">
                <CardHeader><CardTitle className="text-sm">Readings</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{ut.readings}</p>
                  <p className="text-xs text-muted-foreground">Total readings captured</p>
                </CardContent>
              </Card>
              <Card className="glass-card border-border/50">
                <CardHeader><CardTitle className="text-sm">Revenue</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{formatCurrency(ut.revenue)}</p>
                  <p className="text-xs text-muted-foreground">Total {ut.label} revenue</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
