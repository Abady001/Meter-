'use client';

import { useState, useEffect } from 'react';
import { Plus, MoreHorizontal, Eye, Pencil, Trash2, Zap, Droplets, RefreshCw, Activity, Wifi, WifiOff, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { usePageStore } from '@/lib/router-store';
import { useMetersList, useDeleteMeter } from '@/hooks/use-meters';
import { useProjectsList } from '@/hooks/use-projects';
import { QueryBoundary } from '@/components/shared/QueryBoundary';
import SmartTable from '@/components/smart-table/SmartTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PageHeader, formatDate } from '@/components/shared/PageHelpers';
import { useT } from '@/lib/i18n/context';
import { toast } from 'sonner';
import { getToken, getCsrfToken } from '@/lib/api';

export default function MetersPage() {
  const { navigate } = usePageStore();
  const t = useT();
  const currentProject = typeof window !== 'undefined' ? localStorage.getItem('selected-project') : null;
  const metersQuery = useMetersList(currentProject || undefined);
  const meters = metersQuery.data ?? [];
  const { data: apiProjects } = useProjectsList();
  const deleteMutation = useDeleteMeter();
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [syncDialog, setSyncDialog] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'connecting' | 'running' | 'complete' | 'error'>('idle');
  const [syncResult, setSyncResult] = useState<any>(null);
  const [connectionOk, setConnectionOk] = useState<boolean | null>(null);
  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  const handleSyncMeters = async () => {
    setSyncDialog(true);
    setSyncStatus('connecting');
    setSyncProgress(0);
    setSyncResult(null);
    setConnectionOk(null);

    try {
      // Resolve area code from localStorage — always use the stored value as-is
      const storedArea = localStorage.getItem('selected-area') || '';
      let areaCode = storedArea;
      // Only try to resolve via API if stored value looks like a UUID (not a code)
      if (storedArea && storedArea.length > 10 && storedArea.includes('-')) {
        try {
          const areasRes = await fetch(`${API}/areas`, { headers: { Authorization: `Bearer ${getToken()}` } });
          if (areasRes.ok) {
            const areasList = await areasRes.json();
            const found = (Array.isArray(areasList) ? areasList : []).find((a: any) => a.id === storedArea);
            if (found?.areaCode) areaCode = found.areaCode;
          }
        } catch { /* use stored value as-is */ }
      }

      // 1. Check connection
      const csrfToken = await getCsrfToken();
      const headers: Record<string, string> = { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' };
      if (csrfToken) headers['x-csrf-token'] = csrfToken;
      
      setSyncProgress(10);
      const checkRes = await fetch(`${API}/sync/status/${areaCode}`, { headers: { Authorization: `Bearer ${getToken()}` } });
      const checkData = await checkRes.json();
      setConnectionOk(checkData.online || false);
      setSyncProgress(20);

      // 2. Execute sync
      setSyncStatus('running');
      const res = await fetch(`${API}/sync/meters/${areaCode}`, {
        method: 'POST',
        headers,
        signal: AbortSignal.timeout(120000),
      });
      const data = await res.json();
      setSyncProgress(100);
      setSyncResult(data);
      setSyncStatus('complete');
      
      if (data.synced > 0) {
        toast.success(`Synced ${data.synced} new meters (${data.total} total found)`);
      } else if (data.total > 0) {
        toast.info(`${data.total} meters already up to date`);
      } else {
        toast.success('Sync completed');
      }
      metersQuery.refetch();
    } catch (e: any) {
      setSyncStatus('error');
      setSyncResult({ error: e.message || 'Connection failed' });
      toast.error('Sync failed: ' + (e.message || 'Connection error'));
    }
  };

  const columns = [
    {
      key: 'serialNumber', label: t('meters.serialNumber'), sortable: true,
      render: (v: string, row: { meterType: string }) => (
        <div className="flex items-center gap-2">
          {row.meterType === 'electricity' ? <Zap className="h-3.5 w-3.5 text-amber-500" /> : <Droplets className="h-3.5 w-3.5 text-blue-500" />}
          <span className="font-mono text-xs">{v}</span>
        </div>
      ),
    },
    {
      key: 'meterType', label: t('meters.type'), sortable: true, width: '120px',
      render: (v: string) => <StatusBadge status={v} />,
    },
    { key: 'brand', label: 'Brand', sortable: true },
    { key: 'phaseType', label: 'Phase', sortable: true, render: (v: string) => v || '-' },
    { key: 'ampRating', label: 'Amps', sortable: true, render: (v: string) => v || '-' },
    { key: 'diameter', label: 'Diameter', sortable: true, render: (v: string) => v || '-' },
    { key: 'projectName', label: 'Project', sortable: true, render: (v: string) => v || '-' },
    { key: 'unitNumber', label: 'Building/Unit', width: '110px', render: (_v: unknown, row: { buildingName?: string; unitNumber?: string }) => row.buildingName && row.unitNumber ? `${row.buildingName} / ${row.unitNumber}` : '-' },
    { key: 'customerName', label: t('meters.customer'), render: (v: string) => v || '-' },
    { key: 'simCardId', label: 'SIM', width: '80px', render: (v: string) => v || '-' },
    { key: 'ipAddress', label: 'IP', width: '110px', render: (v: string) => v || '-' },
    { key: 'lastReading', label: t('meters.lastReading'), width: '110px', render: (v: number) => v ? v.toLocaleString() : '-' },
    {
      key: 'status', label: t('meters.status'), sortable: true, width: '110px',
      render: (v: string) => <StatusBadge status={v} />,
    },
    {
      key: 'actions', label: 'Actions', width: '60px',
      render: (_val: unknown, row: { id: string; serialNumber: string }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate('meter-detail', { id: row.id }); }}>
              <Eye className="h-4 w-4 mr-2" /> {t('meters.actions.view')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate('meter-detail', { id: row.id }); }}>
              <Pencil className="h-4 w-4 mr-2" /> {t('meters.actions.edit')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setDeleteTarget(row); }} className="text-red-500">
              <Trash2 className="h-4 w-4 mr-2" /> {t('meters.actions.delete')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title={t('meters.title')}
        subtitle={t('meters.subtitle')}
        action={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-1" onClick={handleSyncMeters} disabled={syncStatus === 'running' || syncStatus === 'connecting'}>
              <RefreshCw className={`h-3.5 w-3.5 ${syncStatus === 'running' || syncStatus === 'connecting' ? 'animate-spin' : ''}`} />
              {syncStatus === 'running' || syncStatus === 'connecting' ? 'Syncing...' : 'Sync Meters'}
            </Button>
            <Button className="gap-2" onClick={() => navigate('meter-detail', { id: 'new' })}>
              <Plus className="h-4 w-4" /> {t('meters.add')}
            </Button>
          </div>
        }
      />
      <QueryBoundary query={metersQuery}>
      <SmartTable
        data={meters}
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
            key: 'projectId', label: 'Project', type: 'select',
            options: (apiProjects ?? []).map((p: { name: string; id: string }) => ({ label: p.name, value: p.id })),
          },
          {
            key: 'status', label: 'Status', type: 'select',
            options: [
              { label: 'Active', value: 'active' },
              { label: 'Offline', value: 'offline' },
              { label: 'Available', value: 'available' },
              { label: 'Faulty', value: 'faulty' },
              { label: 'Replaced', value: 'replaced' },
              { label: 'Terminated', value: 'terminated' },
              { label: 'Retired', value: 'retired' },
              { label: 'Assigned', value: 'assigned' },
            ],
          },
        ]}
        searchable
        searchPlaceholder={t('meters.search')}
        onRowClick={(row) => navigate('meter-detail', { id: row.id })}
      />
      </QueryBoundary>

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Meter</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete meter <strong>{deleteTarget?.serialNumber}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-500 hover:bg-red-600" onClick={() => { if (deleteTarget) { deleteMutation.mutate(deleteTarget.id); setDeleteTarget(null); } }}>
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Sync Dialog */}
      <Dialog open={syncDialog} onOpenChange={(open) => { if (!open && syncStatus !== 'running') setSyncDialog(false); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Sync Meters — October Area
            </DialogTitle>
            <DialogDescription>
              {syncStatus === 'idle' && 'Ready to synchronize meter data from source system.'}
              {syncStatus === 'connecting' && 'Checking connection to source system...'}
              {syncStatus === 'running' && `Synchronizing meters... ${syncProgress}%`}
              {syncStatus === 'complete' && 'Synchronization complete'}
              {syncStatus === 'error' && 'Synchronization failed'}
            </DialogDescription>
          </DialogHeader>

          {/* Connection Status */}
          <div className="flex items-center gap-3 py-2">
            <div className={`flex items-center gap-2 text-sm ${connectionOk === true ? 'text-green-500' : connectionOk === false ? 'text-red-500' : 'text-muted-foreground'}`}>
              {connectionOk === true ? <Wifi className="h-4 w-4" /> : connectionOk === false ? <WifiOff className="h-4 w-4" /> : <Activity className="h-4 w-4" />}
              <span>Source System: {connectionOk === true ? 'Connected' : connectionOk === false ? 'Offline' : 'Checking...'}</span>
            </div>
            {syncStatus === 'running' && (
              <span className="text-xs text-amber-500 flex items-center gap-1 ml-auto">
                <span className="animate-pulse">●</span> Job running
              </span>
            )}
          </div>

          {/* Progress Bar */}
          <div className="space-y-1">
            <Progress value={syncProgress} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{syncProgress}%</span>
              {syncResult && <span>{syncResult.synced || 0} new / {syncResult.total || 0} found</span>}
            </div>
          </div>

          {/* Result */}
          {syncStatus === 'complete' && syncResult && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-sm flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-green-600 dark:text-green-400">Sync completed successfully</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {syncResult.synced > 0 ? `${syncResult.synced} new meters synchronized` : 'All meters already up to date'}
                  {' | '}{syncResult.total} meters found in source system
                  {syncResult.errors?.length > 0 ? ` | ${syncResult.errors.length} errors` : ''}
                </p>
                <details className="mt-1">
                  <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">Raw response</summary>
                  <pre className="text-[10px] text-muted-foreground mt-1 p-2 bg-muted/30 rounded max-h-32 overflow-auto">{JSON.stringify(syncResult, null, 2)}</pre>
                </details>
              </div>
            </div>
          )}

          {syncStatus === 'error' && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-sm flex items-start gap-2">
              <XCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-red-600 dark:text-red-400">Sync failed</p>
                <p className="text-xs text-muted-foreground mt-0.5">{syncResult?.error || 'Connection error'}</p>
              </div>
            </div>
          )}

          {/* Warning for offline source */}
          {connectionOk === false && syncStatus !== 'running' && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 text-sm flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-amber-600 dark:text-amber-400">Source system offline</p>
                <p className="text-xs text-muted-foreground mt-0.5">Using cached data. Only meters already in database are available.</p>
              </div>
            </div>
          )}

          {/* Close button */}
          <div className="flex justify-end mt-2">
            <Button size="sm" variant={syncStatus === 'running' ? 'secondary' : 'default'} disabled={syncStatus === 'running'} onClick={() => setSyncDialog(false)}>
              {syncStatus === 'running' ? 'Sync in progress...' : 'Close'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

