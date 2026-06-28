'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { usePageStore } from '@/lib/router-store';
import { useMeterDetail } from '@/hooks/use-meters';
import { useReadingsList } from '@/hooks/use-readings';
import { useSimCardsList } from '@/hooks/use-sim-cards';
import { useInvoicesList } from '@/hooks/use-invoices';
import { QueryBoundary } from '@/components/shared/QueryBoundary';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BackButton, StatCard, formatDate, formatDateTime } from '@/components/shared/PageHelpers';
import { useT } from '@/lib/i18n/context';
import { StatusBadge } from '@/components/shared/StatusBadge';
import SmartTable from '@/components/smart-table/SmartTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Zap, Droplets, Wifi, MapPin, Building2, Home, User, Pencil, MoreHorizontal, RefreshCw } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { apiPut, apiPost, apiPatch, getToken } from '@/lib/api';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

export default function MeterDetailPage() {
  const { pageParams } = usePageStore();
  const t = useT();
  const isNew = pageParams.id === 'new';
  const meterQuery = useMeterDetail(isNew ? '' : pageParams.id);
  const meter = isNew ? null : meterQuery.data;
  const meterId = meter?.id ?? '';
  const { data: readingsData } = useReadingsList();
  const { data: simsData } = useSimCardsList();
  const { data: invoicesData } = useInvoicesList();
  const allReadings = readingsData ?? [];
  const allSims = simsData ?? [];
  const allInvoices = invoicesData ?? [];

  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editData, setEditData] = useState({ meterSerial: '', meterType: '', brand: '', model: '', phaseType: '', ampRating: '', diameter: '' });
  const [tariffOpen, setTariffOpen] = useState(false);
  const [customerOpen, setCustomerOpen] = useState(false);
  const [selectedTariffId, setSelectedTariffId] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerResults, setCustomerResults] = useState<any[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const queryClient = useQueryClient();
  const { data: tariffs } = useQuery({ queryKey: ['tariffs', meter?.projectId, meter?.meterType], queryFn: () => apiGet<any[]>('/tariffs').catch(() => []), enabled: !!meter });

  if (isNew) {
    return (
      <div>
        <BackButton fallback="meters" />
        <p className="text-muted-foreground">Create new meter form coming soon</p>
      </div>
    );
  }

  if (!meter) {
    return (
      <div>
        <BackButton fallback="meters" />
        <p className="text-muted-foreground">{t('meters.noMeters')}</p>
      </div>
    );
  }

  const readings = allReadings.filter((r: any) => r.meterId === meterId);
  const sim = meter.simCardId ? allSims.find((s: any) => s.id === meter.simCardId) : null;
  const invoices = allInvoices.filter((i: any) => i.meterId === meterId);

  const chartData = readings.slice(-6).map((r) => ({
    date: new Date(r.readingDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    reading: r.currentReading,
  }));

  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  const handleSyncReadings = async () => {
    let areaCode = localStorage.getItem('selected-area') || '';
    try {
      const areasRes = await fetch(`${API}/areas`, { headers: { Authorization: `Bearer ${getToken()}` } });
      if (areasRes.ok) {
        const areasList = await areasRes.json();
        const stored = localStorage.getItem('selected-area') || '';
        const found = (Array.isArray(areasList) ? areasList : []).find((a: any) => a.id === stored || a.areaCode === stored || a.areaName === stored);
        if (found?.areaCode) areaCode = found.areaCode;
      }
      if (!areaCode) areaCode = 'AREA-1';
      await fetch(`${API}/sync/meters/${areaCode}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
      });
      toast.success('Reading sync triggered');
    } catch { toast.error('Sync failed'); }
  };

  const handleEditOpen = () => {
    setEditData({
      meterSerial: meter.meterSerial || meter.serialNumber || '',
      meterType: meter.meterType || '',
      brand: meter.brand || '',
      model: meter.model || '',
      phaseType: meter.phaseType || '',
      ampRating: meter.ampRating || '',
      diameter: meter.diameter || '',
    });
    setEditOpen(true);
  };

  const handleEditSave = async () => {
    setSaving(true);
    try {
      await apiPut(`/meters/${meterId}`, editData);
      queryClient.invalidateQueries({ queryKey: ['meters', meterId] });
      queryClient.invalidateQueries({ queryKey: ['meters'] });
      setEditOpen(false);
    } catch (e: any) {
      console.error('Failed to update meter', e);
    }
    setSaving(false);
  };

  return (
    <div>
      <BackButton fallback="meters" />
      <QueryBoundary query={meterQuery}>

      {/* Header */}
      <div className="glass-card rounded-xl p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              {meter.meterType === 'electricity' ? <Zap className="h-6 w-6 text-amber-500" /> : <Droplets className="h-6 w-6 text-blue-500" />}
              <h1 className="text-2xl font-bold font-mono">{meter.serialNumber}</h1>
              <StatusBadge status={meter.meterType} />
              <StatusBadge status={meter.status} />
            </div>
            <p className="text-sm text-muted-foreground">{meter.brand} {meter.model}</p>
          </div>
          <div className="flex gap-2 flex-wrap shrink-0">
            {meter.status === 'available' || meter.status === 'new' ? (
              <>
                <Button variant="outline" size="sm" className="gap-1" onClick={() => navigate('meter-assign', { id: meter.id })}><Pencil className="h-4 w-4" /> Assign Unit</Button>
                <Button variant="outline" size="sm" className="gap-1" onClick={() => setTariffOpen(true)}><Pencil className="h-4 w-4" /> Assign Tariff</Button>
                <Button variant="outline" size="sm" className="gap-1" onClick={() => setCustomerOpen(true)}><Pencil className="h-4 w-4" /> Assign Customer</Button>
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" className="gap-1" onClick={handleEditOpen}><Pencil className="h-4 w-4" /> Edit</Button>
                <Button variant="outline" size="sm" className="gap-1" onClick={handleSyncReadings}><RefreshCw className="h-4 w-4" /> Sync Readings</Button>
                <Button variant="outline" size="sm" className="gap-1"><RefreshCw className="h-4 w-4" /> Assign Solar</Button>
              </>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate('customers', { id: meter.customerId })}>View Customer</DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('locations')}>View Unit</DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('readings', { id: meter.id })}>View Readings</DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('invoices', { id: meter.id })}>View Invoices</DropdownMenuItem>
                <DropdownMenuItem>View Balance</DropdownMenuItem>
                <DropdownMenuItem className="text-red-500">Deactivate Meter</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
        {meter.projectName && <StatCard label="Project" value={meter.projectName} icon={<MapPin className="h-4 w-4" />} />}
        {meter.buildingName && <StatCard label="Building" value={meter.buildingName} icon={<Building2 className="h-4 w-4" />} />}
        {meter.unitNumber && <StatCard label="Unit" value={meter.unitNumber} icon={<Home className="h-4 w-4" />} />}
        {meter.customerName && <StatCard label="Customer" value={meter.customerName} icon={<User className="h-4 w-4" />} />}
        {sim && <StatCard label="SIM" value={sim.msisdn} icon={<Wifi className="h-4 w-4" />} />}
        {meter.ipAddress && <StatCard label="IP Address" value={meter.ipAddress} />}
        {meter.installedDate && <StatCard label="Installed" value={formatDate(meter.installedDate)} />}
        {meter.phaseType && <StatCard label="Phase" value={meter.phaseType} />}
        {meter.ampRating && <StatCard label="Amps" value={meter.ampRating} />}
        {meter.diameter && <StatCard label="Diameter" value={meter.diameter} />}
        {meter.lastReading != null && <StatCard label="Last Reading" value={meter.lastReading.toLocaleString()} />}
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <Card className="glass-card border-border/50 mb-6">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Reading History</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                <Line type="monotone" dataKey="reading" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Last Reading & Communication */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <Card className="glass-card border-border/50">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Last Reading</CardTitle></CardHeader>
          <CardContent className="text-sm">
            <p className="text-xl font-bold">{meter.lastReading?.toLocaleString() || '-'}</p>
            <p className="text-muted-foreground text-xs">{meter.lastReadingDate ? formatDateTime(meter.lastReadingDate) : '-'}</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-border/50">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Last Communication</CardTitle></CardHeader>
          <CardContent className="text-sm">
            <p className="text-muted-foreground">{meter.lastCommunication ? formatDateTime(meter.lastCommunication) : '-'}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList className="mb-4 flex-wrap h-auto gap-1">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="readings">{t('meters.actions.readings')}</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="sim">SIM/IP</TabsTrigger>
          <TabsTrigger value="invoices">{t('billing.invoices.title')}</TabsTrigger>
          <TabsTrigger value="alerts">{t('alerts.title')}</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="text-center py-8 text-muted-foreground text-sm">Overview summary shown above.</div>
        </TabsContent>

        <TabsContent value="readings">
          <SmartTable
            data={readings}
            columns={[
              { key: 'readingDate', label: t('readings.date'), sortable: true, render: (v: string) => formatDateTime(v) },
              { key: 'previousReading', label: 'Previous', width: '100px' },
              { key: 'currentReading', label: 'Current', width: '100px' },
              { key: 'consumption', label: t('billing.consumption.consumption'), width: '110px' },
              { key: 'source', label: 'Source', width: '100px', render: (v: string) => <StatusBadge status={v} /> },
              { key: 'status', label: t('readings.status'), width: '120px', render: (v: string) => <StatusBadge status={v} /> },
              { key: 'enteredBy', label: 'Entered By', width: '110px' },
            ]}
            searchPlaceholder={t('readings.search')}
          />
        </TabsContent>

        <TabsContent value="assignments"><div className="text-center py-8 text-muted-foreground text-sm">No assignment history.</div></TabsContent>
        <TabsContent value="sim">
          {sim ? (
            <Card className="glass-card border-border/50">
              <CardContent className="p-4 text-sm space-y-2">
                <div className="flex justify-between"><span className="text-muted-foreground">{t('simCards.iccid')}</span><span className="font-mono text-xs">{sim.iccid.slice(0, 12)}...</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">MSISDN</span><span>{sim.msisdn}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">IP</span><span>{sim.ipAddress || '-'}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">{t('simCards.provider')}</span><span>{sim.provider}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">{t('simCards.status')}</span><StatusBadge status={sim.status} /></div>
              </CardContent>
            </Card>
          ) : <div className="text-center py-8 text-muted-foreground text-sm">{t('simCards.noSims')}</div>}
        </TabsContent>

        <TabsContent value="invoices">
          <SmartTable
            data={invoices}
            columns={[
              { key: 'invoiceNumber', label: 'Invoice #', sortable: true },
              { key: 'billingPeriodStart', label: 'Period', width: '180px', render: (v: string, row: { billingPeriodEnd: string }) => `${formatDate(v)} - ${formatDate(row.billingPeriodEnd)}` },
              { key: 'total', label: 'Total', width: '100px', render: (v: number) => `EGP ${v.toLocaleString()}` },
              { key: 'status', label: 'Status', width: '120px', render: (v: string) => <StatusBadge status={v} /> },
            ]}
            emptyMessage={t('billing.invoices.noInvoices')}
          />
        </TabsContent>
        <TabsContent value="alerts"><div className="text-center py-8 text-muted-foreground text-sm">{t('alerts.noAlerts')}</div></TabsContent>
        <TabsContent value="maintenance"><div className="text-center py-8 text-muted-foreground text-sm">No maintenance records.</div></TabsContent>
      </Tabs>

      {/* Assign Tariff Dialog */}
      <Dialog open={tariffOpen} onOpenChange={setTariffOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Assign Tariff — {meter?.serialNumber}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <Select value={selectedTariffId} onValueChange={setSelectedTariffId}>
              <SelectTrigger><SelectValue placeholder="Select tariff" /></SelectTrigger>
              <SelectContent>
                {(tariffs ?? []).filter((t: any) => !meter?.meterType || t.utilityType === meter.meterType).map((t: any) => (
                  <SelectItem key={t.id} value={t.id}>{t.tariffName} ({t.tariffCode})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTariffOpen(false)}>Cancel</Button>
            <Button onClick={async () => {
              if (!selectedTariffId) return;
              try {
                await apiPatch(`/tariffs/${selectedTariffId}`, { projectId: meter?.projectId });
                toast.success('Tariff assigned');
                setTariffOpen(false);
              } catch { toast.error('Failed'); }
            }} disabled={!selectedTariffId}>Assign</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Customer Dialog */}
      <Dialog open={customerOpen} onOpenChange={setCustomerOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Assign Customer — {meter?.serialNumber}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <Input placeholder="Search customer by name, code, phone..." value={customerSearch}
              onChange={async e => {
                setCustomerSearch(e.target.value);
                if (e.target.value.length > 2) {
                  const res = await apiGet<any[]>(`/projects/${meter?.projectId}/customers`).catch(() => []);
                  const q = e.target.value.toLowerCase();
                  setCustomerResults((Array.isArray(res) ? res : []).filter((c: any) =>
                    (c.name || '').toLowerCase().includes(q) || (c.customerCode || '').toLowerCase().includes(q) || (c.phone || '').includes(q)
                  ));
                }
              }} />
            {customerResults.length > 0 && (
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {customerResults.map((c: any) => (
                  <div key={c.id} className={`p-2 rounded cursor-pointer text-sm ${selectedCustomerId === c.id ? 'bg-primary/10 border-primary' : 'hover:bg-muted'}`}
                    onClick={() => setSelectedCustomerId(c.id)}>
                    {c.name} <span className="text-muted-foreground">({c.customerCode})</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCustomerOpen(false)}>Cancel</Button>
            <Button onClick={async () => {
              if (!selectedCustomerId) return;
              try {
                await apiPost(`/meters/${meterId}/assign`, { customerId: selectedCustomerId, projectId: meter?.projectId, unitId: meter?.locationId || '', startAt: new Date().toISOString() });
                toast.success('Customer assigned');
                setCustomerOpen(false);
                queryClient.invalidateQueries({ queryKey: ['meters'] });
              } catch { toast.error('Failed'); }
            }} disabled={!selectedCustomerId}>Assign</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Edit Meter</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div><label className="text-xs font-medium">Meter Serial</label><Input value={editData.meterSerial} onChange={e => setEditData({ ...editData, meterSerial: e.target.value })} /></div>
            <div><label className="text-xs font-medium">Meter Type</label><Input value={editData.meterType} onChange={e => setEditData({ ...editData, meterType: e.target.value })} /></div>
            <div><label className="text-xs font-medium">Brand</label><Input value={editData.brand} onChange={e => setEditData({ ...editData, brand: e.target.value })} /></div>
            <div><label className="text-xs font-medium">Model</label><Input value={editData.model} onChange={e => setEditData({ ...editData, model: e.target.value })} /></div>
            <div><label className="text-xs font-medium">Phase Type</label><Input value={editData.phaseType} onChange={e => setEditData({ ...editData, phaseType: e.target.value })} /></div>
            <div><label className="text-xs font-medium">Amp Rating</label><Input value={editData.ampRating} onChange={e => setEditData({ ...editData, ampRating: e.target.value })} /></div>
            <div><label className="text-xs font-medium">Diameter</label><Input value={editData.diameter} onChange={e => setEditData({ ...editData, diameter: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={handleEditSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </QueryBoundary>
    </div>
  );
}
