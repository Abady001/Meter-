'use client';

import { useState } from 'react';
import { Plus, MoreHorizontal, Eye, Pencil, Trash2, AlertTriangle, AlertCircle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { usePageStore } from '@/lib/router-store';
import SmartTable from '@/components/smart-table/SmartTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PageHeader, formatDate, formatDateTime } from '@/components/shared/PageHelpers';
import { QueryBoundary } from '@/components/shared/QueryBoundary';
import { useReadingsList } from '@/hooks/use-readings';
import { useProjectsList } from '@/hooks/use-projects';
import { useT } from '@/lib/i18n/context';
import { apiPatch, apiDelete, getToken, getCsrfToken } from '@/lib/api';

export default function ReadingsPage() {
  const { navigate } = usePageStore();
  const t = useT();
  const [tab, setTab] = useState<'all' | 'review'>('all');
  const { data: apiReadings, isLoading, isError, error, refetch } = useReadingsList();
  const readings = apiReadings ?? [];
  const { data: apiProjects } = useProjectsList();
  const reviewQueue = readings.filter(r => r.status === 'pending_review' || r.status === 'suspicious');
  const [syncing, setSyncing] = useState(false);
  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  const handleSyncReadings = async () => {
    setSyncing(true);
    try {
      let areaCode = localStorage.getItem('selected-area') || '';
      const areasRes = await fetch(`${API}/areas`, { headers: { Authorization: `Bearer ${getToken()}` } });
      if (areasRes.ok) {
        const areasList = await areasRes.json();
        const stored = localStorage.getItem('selected-area') || '';
        const found = (Array.isArray(areasList) ? areasList : []).find((a: any) => a.id === stored || a.areaCode === stored || a.areaName === stored);
        if (found?.areaCode) areaCode = found.areaCode;
      }
      if (!areaCode) areaCode = 'AREA-1';
      const csrfToken = await getCsrfToken();
      const headers: Record<string, string> = { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' };
      if (csrfToken) headers['x-csrf-token'] = csrfToken;
      const res = await fetch(`${API}/sync/meters/${areaCode}`, {
        method: 'POST',
        headers,
      });
      const data = await res.json();
      toast.success(data.message || 'Reading sync completed');
      refetch();
    } catch (e: any) {
      toast.error('Sync failed: ' + (e.message || 'Connection error'));
    } finally {
      setSyncing(false);
    }
  };

  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedReading, setSelectedReading] = useState<any>(null);
  const [editValue, setEditValue] = useState(0);

  const columns = [
    {
      key: 'meterSerial', label: t('readings.meter'), sortable: true,
      render: (v: string) => <span className="font-mono text-xs">{v}</span>,
    },
    {
      key: 'meterType', label: t('readings.type'), width: '120px',
      render: (v: string) => <StatusBadge status={v} />,
    },
    { key: 'customerName', label: 'Customer', render: (v: string) => v || '-' },
    { key: 'unitNumber', label: 'Unit', width: '90px', render: (v: string) => v || '-' },
    { key: 'previousReading', label: 'Previous', width: '100px' },
    { key: 'currentReading', label: 'Current', width: '90px' },
    { key: 'consumption', label: t('billing.consumption.consumption'), width: '110px' },
    {       key: 'readingDate', label: t('readings.date'), sortable: true, width: '110px', render: (v: string) => formatDate(v) },
    {
      key: 'source', label: 'Source', width: '100px',
      render: (v: string) => <StatusBadge status={v} />,
    },
    {
      key: 'status', label: t('readings.status'), width: '120px',
      render: (v: string) => <StatusBadge status={v} />,
    },
    {
      key: 'anomaly', label: '', width: '40px',
      render: (v: boolean) => v ? <AlertTriangle className="h-4 w-4 text-amber-500" /> : null,
    },
    { key: 'enteredBy', label: 'Entered By', width: '110px' },
    {
      key: 'actions', label: '', width: '50px',
      render: (_val: unknown, row: any) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setSelectedReading(row); setViewDialogOpen(true); }}><Eye className="h-4 w-4 mr-2" /> {t('common.view')}</DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setSelectedReading(row); setEditValue(row.currentReading); setEditDialogOpen(true); }}><Pencil className="h-4 w-4 mr-2" /> {t('common.edit')}</DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setSelectedReading(row); setDeleteDialogOpen(true); }} className="text-red-500"><Trash2 className="h-4 w-4 mr-2" /> Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title={t('readings.title')}
        subtitle={t('readings.subtitle')}
        action={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-1" onClick={handleSyncReadings} disabled={syncing}>
              <RefreshCw className={`h-3.5 w-3.5 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Syncing...' : 'Sync Readings'}
            </Button>
            <Button className="gap-2" onClick={() => navigate('reading-new')}>
              <Plus className="h-4 w-4" /> {t('readings.newReading')}
            </Button>
          </div>
        }
      />
      <div className="flex gap-2 mb-4 border-b border-border">
        <button onClick={() => setTab('all')} className={`pb-2 px-4 text-sm font-medium border-b-2 transition-colors ${tab === 'all' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>{t('readings.title')}</button>
        <button onClick={() => setTab('review')} className={`pb-2 px-4 text-sm font-medium border-b-2 transition-colors ${tab === 'review' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'} flex items-center gap-1`}>{t('readings.reviewQueue')} {reviewQueue.length > 0 && <span className="text-xs bg-destructive text-destructive-foreground rounded-full px-1.5 py-0.5">{reviewQueue.length}</span>}</button>
      </div>
      <QueryBoundary isLoading={isLoading} isError={isError} error={error}>
      <SmartTable
        data={tab === 'review' ? reviewQueue : readings}
        columns={columns}
        filters={[
          {
            key: 'meterType', label: 'Meter Type', type: 'select',
            options: [
              { label: 'Electricity', value: 'electricity' },
              { label: 'Main Water', value: 'main_water' },
              { label: 'Child Water', value: 'child_water' },
            ],
          },
          {
            key: 'status', label: 'Status', type: 'select',
            options: [
              { label: t('readings.valid'), value: 'valid' },
              { label: t('readings.pending'), value: 'pending_review' },
              { label: t('readings.estimated'), value: 'estimated' },
              { label: t('readings.suspicious'), value: 'suspicious' },
              { label: t('readings.corrected'), value: 'corrected' },
              { label: t('readings.rejected'), value: 'rejected' },
            ],
          },
          {
            key: 'source', label: 'Source', type: 'select',
            options: [
              { label: 'Automated', value: 'automated' },
              { label: 'Manual', value: 'manual' },
              { label: 'Estimated', value: 'estimated' },
            ],
          },
          {
            key: 'projectId', label: 'Project', type: 'select',
            options: (apiProjects ?? []).map((p: { name: string; id: string }) => ({ label: p.name, value: p.id })),
          },
          {
            key: 'anomaly', label: 'Anomaly Only', type: 'select',
            options: [
              { label: 'Yes', value: 'true' },
              { label: 'No', value: 'false' },
            ],
          },
        ]}
        searchable
        searchPlaceholder={t('readings.search')}
      />
      </QueryBoundary>

      {/* View Reading Detail Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Reading Details</DialogTitle></DialogHeader>
          <div className="space-y-3 py-4 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Meter</span><span className="font-mono text-xs">{selectedReading?.meterSerial}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Type</span><span><StatusBadge status={selectedReading?.meterType} /></span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Customer</span><span>{selectedReading?.customerName || '-'}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Unit</span><span>{selectedReading?.unitNumber || '-'}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Previous Reading</span><span>{selectedReading?.previousReading}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Current Reading</span><span className="font-medium">{selectedReading?.currentReading}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Consumption</span><span className="font-medium">{selectedReading?.consumption}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Date</span><span>{formatDate(selectedReading?.readingDate)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Status</span><span><StatusBadge status={selectedReading?.status} /></span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Source</span><span><StatusBadge status={selectedReading?.source} /></span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Entered By</span><span>{selectedReading?.enteredBy}</span></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Reading Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Reading — {selectedReading?.meterSerial}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Current Reading Value</Label>
              <Input type="number" value={editValue} onChange={e => setEditValue(parseFloat(e.target.value) || 0)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={async () => {
              try {
                await apiPatch(`/readings/${selectedReading.id}`, { currentReading: editValue });
                toast.success('Reading updated');
                setEditDialogOpen(false);
                refetch();
              } catch { toast.error('Failed to update reading'); }
            }}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Reading Confirm */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Reading</DialogTitle></DialogHeader>
          <p className="py-4 text-sm text-muted-foreground">Are you sure you want to delete reading for meter <strong>{selectedReading?.meterSerial}</strong>? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={async () => {
              try {
                await apiDelete(`/readings/${selectedReading.id}`);
                toast.success('Reading deleted');
                setDeleteDialogOpen(false);
                refetch();
              } catch { toast.error('Failed to delete reading'); }
            }}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

