'use client';

import { usePageStore } from '@/lib/router-store';
import { useProjectDetail } from '@/hooks/use-projects';
import { useLocationsList } from '@/hooks/use-locations';
import { useCustomersList } from '@/hooks/use-customers';
import { useMetersList } from '@/hooks/use-meters';
import { useReadingsList } from '@/hooks/use-readings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BackButton, StatCard } from '@/components/shared/PageHelpers';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { QueryBoundary } from '@/components/shared/QueryBoundary';
import SmartTable from '@/components/smart-table/SmartTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Building2, Users, Gauge, FileText, Zap } from 'lucide-react';
import { formatDate } from '@/components/shared/PageHelpers';
import { useT } from '@/lib/i18n/context';

export default function ProjectDetailPage() {
  const t = useT();
  const { pageParams } = usePageStore();
  const { data: apiProject, isLoading, isError, error } = useProjectDetail(pageParams.id ?? '');
  const project = apiProject ?? undefined;
  const pid = project?.id ?? '';
  const { data: locations } = useLocationsList(pid);
  const { data: customers } = useCustomersList(pid);
  const { data: meters } = useMetersList();
  const { data: readings } = useReadingsList(pid);
  const locationsList = locations ?? [];
  const customersList = customers ?? [];
  const metersList = meters ?? [];
  const readingsList = readings ?? [];
  const buildings = locationsList.filter((l: any) => l.nodeType === 'building');
  const units = locationsList.filter((l: any) => l.nodeType === 'unit');
  const projectMeters = metersList.filter((m: any) => m.projectId === pid);
  const projectReadings = readingsList.filter((r: any) => r.projectId === pid);

  if (!project) {
    return (
      <div>
        <BackButton fallback="projects" />
        <QueryBoundary isLoading={isLoading} isError={isError} error={error}>
          {!isLoading && <p className="text-muted-foreground">{t('projects.notFound')}</p>}
        </QueryBoundary>
      </div>
    );
  }

  const chartData = projectReadings.slice(-6).map((r: any) => ({
    date: new Date(r.readingAt ?? r.readingDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    consumption: r.consumption ?? r.consumptionValue ?? 0,
  }));

  return (
    <div>
      <BackButton fallback="projects" />
      <QueryBoundary isLoading={isLoading} isError={isError} error={error}>

      {/* Header */}
      <div className="glass-card rounded-xl p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{project.name}</h1>
              <StatusBadge status={project.status} />
            </div>
            <p className="text-muted-foreground text-sm mt-1">{project.description}</p>
            <p className="text-xs text-muted-foreground mt-1">{project.code} · {project.location}, {project.area}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        <StatCard label={t('projects.buildings')} value={project.buildings} icon={<Building2 className="h-5 w-5" />} />
        <StatCard label={t('projects.units')} value={project.units} icon={<FileText className="h-5 w-5" />} />
        <StatCard label={t('projects.customerCount')} value={project.customers} icon={<Users className="h-5 w-5" />} />
        <StatCard label={t('projects.activeMeters')} value={project.activeMeters} icon={<Gauge className="h-5 w-5" />} />
        <StatCard label={t('projects.tariff')} value={project.tariff} icon={<Zap className="h-5 w-5" />} />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">{t('projects.overview')}</TabsTrigger>
          <TabsTrigger value="locations">{t('sidebar.locations')}</TabsTrigger>
          <TabsTrigger value="customers">{t('sidebar.customers')}</TabsTrigger>
          <TabsTrigger value="meters">{t('sidebar.meters')}</TabsTrigger>
          <TabsTrigger value="invoices">{t('sidebar.invoices')}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="glass-card border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">{t('projects.projectInfo')}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <div className="flex justify-between"><span className="text-muted-foreground">{t('projects.location')}</span><span>{project.location}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">{t('projects.area')}</span><span>{project.area}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">{t('projects.created')}</span><span>{formatDate(project.createdAt)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">{t('projects.tariff')}</span><span>{project.tariff}</span></div>
              </CardContent>
            </Card>
            <Card className="glass-card border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">{t('projects.consumptionTrend')}</CardTitle>
              </CardHeader>
              <CardContent>
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={160}>
                    <LineChart data={chartData}>
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                      <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                      <Line type="monotone" dataKey="consumption" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : <p className="text-sm text-muted-foreground py-8 text-center">{t('common.noData')}</p>}
              </CardContent>
            </Card>
            <Card className="glass-card border-border/50 md:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">{t('projects.recentAlerts')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-center py-4">{t('projects.noAlerts')}</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="locations">
          <SmartTable
            data={buildings}
            columns={[
              { key: 'name', label: t('locations.building'), sortable: true },
              { key: 'floors', label: t('locations.floor'), sortable: true, width: '80px' },
              { key: 'units', label: t('locations.unit'), sortable: true, width: '80px' },
              { key: 'createdAt', label: t('projects.created'), sortable: true, width: '110px', render: (v: string) => formatDate(v) },
            ]}
            searchPlaceholder={t('locations.search')}
            searchable
          />
        </TabsContent>

        <TabsContent value="customers">
          <SmartTable
            data={customers}
            columns={[
              { key: 'code', label: t('customers.code'), sortable: true, width: '120px' },
              { key: 'name', label: t('customers.name'), sortable: true },
              { key: 'customerType', label: t('customers.type'), sortable: true, width: '120px', render: (v: string) => <StatusBadge status={v} /> },
              { key: 'activeMeters', label: t('customers.meterCount'), width: '80px' },
              { key: 'currentBalance', label: t('customers.balance'), sortable: true, width: '110px', render: (v: number) => <span className={v > 0 ? 'text-red-500' : v < 0 ? 'text-blue-500' : 'text-emerald-500'}>{v.toLocaleString()}</span> },
              { key: 'status', label: t('customers.status'), width: '90px', render: (v: string) => <StatusBadge status={v} /> },
            ]}
            searchPlaceholder={t('customers.search')}
            searchable
          />
        </TabsContent>

        <TabsContent value="meters">
          <SmartTable
            data={meters}
            columns={[
              { key: 'serialNumber', label: t('meters.serialNumber'), sortable: true },
              { key: 'meterType', label: t('meters.type'), width: '120px', render: (v: string) => <StatusBadge status={v} /> },
              { key: 'brand', label: t('meters.brand'), sortable: true },
              { key: 'unitNumber', label: t('meters.unit'), width: '90px', render: (v: string) => v || '-' },
              { key: 'customerName', label: t('meters.customer'), render: (v: string) => v || '-' },
              { key: 'lastReading', label: t('meters.lastReading'), width: '110px', render: (v: number) => v ? v.toLocaleString() : '-' },
              { key: 'status', label: t('meters.status'), width: '100px', render: (v: string) => <StatusBadge status={v} /> },
            ]}
            searchPlaceholder={t('meters.search')}
            searchable
            filters={[
              { key: 'status', label: t('meters.status'), type: 'select', options: [
                { label: t('meters.lifecycle.active'), value: 'active' }, { label: t('meters.lifecycle.offline'), value: 'offline' }, { label: t('meters.lifecycle.available'), value: 'available' }, { label: t('meters.lifecycle.faulty'), value: 'faulty' },
              ]},
              { key: 'meterType', label: t('meters.type'), type: 'select', options: [
                { label: t('meters.electric'), value: 'electricity' }, { label: t('meters.water'), value: 'main_water' }, { label: t('meters.chilled'), value: 'child_water' },
              ]},
            ]}
          />
        </TabsContent>

        <TabsContent value="invoices">
          <SmartTable
            data={[]}
            columns={[
              { key: 'invoiceNumber', label: t('billing.invoices.invoiceNumber'), sortable: true },
              { key: 'customerName', label: t('billing.invoices.customer') },
              { key: 'total', label: t('billing.invoices.total'), width: '100px' },
              { key: 'status', label: t('billing.invoices.status'), width: '110px', render: (v: string) => <StatusBadge status={v} /> },
            ]}
            searchPlaceholder={t('billing.invoices.search')}
            emptyMessage={t('billing.invoices.noInvoices')}
          />
        </TabsContent>
      </Tabs>
      </QueryBoundary>
    </div>
  );
}

