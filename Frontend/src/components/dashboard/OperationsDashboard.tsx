'use client';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';
import { usePageStore } from '@/lib/router-store';
import { StatCard, formatCurrency } from '@/components/shared/PageHelpers';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Gauge, Activity, AlertTriangle, Users, Wifi, Clock, RefreshCw, CheckCircle, XCircle, Building2, BarChart3 } from 'lucide-react';

export default function OperationsDashboard() {
  const { navigate } = usePageStore();
  const { data: meters } = useQuery({ queryKey: ['meters'], queryFn: () => apiGet<any[]>('/meters').catch(() => []) });
  const { data: readings } = useQuery({ queryKey: ['readings'], queryFn: () => apiGet<any[]>('/readings').catch(() => []) });
  const { data: tickets } = useQuery({ queryKey: ['tickets'], queryFn: () => apiGet<any[]>('/tickets').catch(() => []) });
  const { data: projects } = useQuery({ queryKey: ['projects'], queryFn: () => apiGet<any[]>('/projects').catch(() => []) });
  const m = meters ?? []; const r = readings ?? []; const t = tickets ?? []; const p = projects ?? [];

  const active = m.filter((x: any) => x.status === 'active').length;
  const disconnected = m.filter((x: any) => x.status === 'disconnected').length;
  const offline = m.filter((x: any) => x.status === 'offline').length;
  const faulty = m.filter((x: any) => x.status === 'faulty').length;
  const pending = m.filter((x: any) => x.status === 'pending').length;
  const approvedReadings = r.filter((x: any) => x.status === 'valid' || x.status === 'approved').length;
  const pendingReadings = r.filter((x: any) => x.status === 'pending_review' || x.status === 'suspicious').length;
  const openTickets = t.filter((x: any) => x.status !== 'closed' && x.status !== 'resolved').length;
  const readingCompletion = r.length > 0 ? ((approvedReadings / r.length) * 100).toFixed(0) : '0';

  return (
    <div>
      <div className="mb-4"><h1 className="text-2xl font-bold">Operations Dashboard</h1><p className="text-sm text-muted-foreground">Meter health, reading performance, technician productivity</p></div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <StatCard label="Active Meters" value={active} icon={<Gauge className="h-5 w-5" />} onClick={() => navigate('meters')} />
        <StatCard label="Reading Completion" value={readingCompletion + '%'} icon={<Activity className="h-5 w-5" />} color={Number(readingCompletion) > 80 ? 'text-emerald-500' : 'text-amber-500'} />
        <StatCard label="Open Incidents" value={openTickets} icon={<AlertTriangle className="h-5 w-5" />} color={openTickets > 0 ? 'text-red-500' : ''} onClick={() => navigate('tickets')} />
        <StatCard label="Faulty Meters" value={faulty} icon={<XCircle className="h-5 w-5" />} color={faulty > 0 ? 'text-red-500' : ''} />
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <Card className="glass-card border-border/50">
          <CardHeader><CardTitle className="text-sm">Meter Health</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[
                { label: 'Active', count: active, color: 'bg-emerald-500' },
                { label: 'Disconnected', count: disconnected, color: 'bg-red-500' },
                { label: 'Offline', count: offline, color: 'bg-amber-500' },
                { label: 'Faulty', count: faulty, color: 'bg-red-700' },
                { label: 'Pending', count: pending, color: 'bg-blue-500' },
              ].map((item) => {
                const pct = m.length > 0 ? ((item.count / m.length) * 100).toFixed(0) : '0';
                return (
                  <div key={item.label} className="flex items-center gap-2">
                    <div className={'w-2 h-2 rounded-full ' + item.color} />
                    <span className="text-sm flex-1">{item.label}</span>
                    <span className="text-sm font-bold">{item.count}</span>
                    <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                      <div className={'h-full rounded-full ' + item.color} style={{ width: pct + '%' }} />
                    </div>
                    <span className="text-xs text-muted-foreground w-8 text-right">{pct}%</span>
                  </div>
                );
              })}
              {m.length === 0 && <p className="text-sm text-muted-foreground">No meter data</p>}
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card border-border/50">
          <CardHeader><CardTitle className="text-sm">Reading Performance</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[
                { label: 'Approved', count: approvedReadings, color: 'text-emerald-500' },
                { label: 'Pending Review', count: pendingReadings, color: 'text-amber-500' },
              ].map((item) => (
                <div key={item.label} className="flex justify-between p-2 rounded bg-muted/20">
                  <span className="text-sm">{item.label}</span>
                  <span className={'text-sm font-bold ' + item.color}>{item.count}</span>
                </div>
              ))}
              <div className="flex justify-between p-2 rounded bg-muted/20">
                <span className="text-sm">Total Readings</span>
                <span className="text-sm font-bold">{r.length}</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-muted/20">
                <span className="text-sm">Completion Rate</span>
                <span className="text-sm font-bold">{readingCompletion}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-4">
        <Card className="glass-card border-border/50">
          <CardHeader><CardTitle className="text-sm">Service Tickets</CardTitle></CardHeader>
          <CardContent>
            <div className="text-center p-4"><p className="text-3xl font-bold">{openTickets}</p><p className="text-xs text-muted-foreground">Open Tickets</p></div>
            {t.length > 0 && <Button variant="outline" size="sm" className="w-full" onClick={() => navigate('tickets')}>View All Tickets</Button>}
          </CardContent>
        </Card>
        <Card className="glass-card border-border/50">
          <CardHeader><CardTitle className="text-sm">Area Performance</CardTitle></CardHeader>
          <CardContent>
            <div className="text-center p-4"><p className="text-3xl font-bold">{p.length}</p><p className="text-xs text-muted-foreground">Projects</p></div>
            {p.length > 0 && <Button variant="outline" size="sm" className="w-full" onClick={() => navigate('projects')}>View All Projects</Button>}
          </CardContent>
        </Card>
        <Card className="glass-card border-border/50">
          <CardHeader><CardTitle className="text-sm">Technician Performance</CardTitle></CardHeader>
          <CardContent>
            <div className="text-center p-4"><p className="text-3xl font-bold">{pendingReadings}</p><p className="text-xs text-muted-foreground">Readings Pending Review</p></div>
            {pendingReadings > 0 && <Button variant="outline" size="sm" className="w-full" onClick={() => navigate('readings')}>Review Queue</Button>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
