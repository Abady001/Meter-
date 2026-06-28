'use client';
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost } from '@/lib/api';
import { PageHeader, formatDate } from '@/components/shared/PageHelpers';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import SmartTable from '@/components/smart-table/SmartTable';
import { toast } from 'sonner';
import { Plus, Play, FileText, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import { useT } from '@/lib/i18n/context';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const UTILITIES = ['ELECTRICITY','WATER','SOLAR','GAS','CHILLED_WATER'];

export default function BillCyclePage() {
  const t = useT();
  const qc = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ projectId: '', month: new Date().getMonth() + 1, year: new Date().getFullYear(), utilityType: '' });

  const { data: cyclesData, refetch } = useQuery({ queryKey: ['bill-cycles'], queryFn: () => apiGet<any[]>('/bill-cycle').catch(() => []) });
  const cycles = cyclesData ?? [];
  const { data: projects } = useQuery({ queryKey: ['projects'], queryFn: () => apiGet<any[]>('/projects').catch(() => []) });

  const createMutation = useMutation({
    mutationFn: (data: typeof form) => apiPost('/bill-cycle', { projectId: data.projectId, month: data.month, year: data.year, utilityType: data.utilityType || undefined }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['bill-cycles'] }); setCreateOpen(false); toast.success('Bill cycle created'); },
    onError: () => toast.error('Failed to create bill cycle'),
  });

  const actionMutation = useMutation({
    mutationFn: ({ id, action }: { id: string; action: string }) => apiPost(`/bill-cycle/${id}/${action}`),
    onSuccess: (_data, vars) => { qc.invalidateQueries({ queryKey: ['bill-cycles'] }); toast.success(`Bill cycle ${vars.action} completed`); },
    onError: (_e, vars) => toast.error(`Failed to ${vars.action} bill cycle`),
  });

  const columns = [
    { key: 'id', label: 'ID', sortable: true, width: '80px', render: (v: string) => v.substring(0, 8) + '...' },
    { key: 'month', label: 'Month', sortable: true, render: (_v: any, row: any) => `${MONTHS[(row.month || 1) - 1]} ${row.year || ''}` },
    { key: 'utilityType', label: 'Service', render: (v: string) => v ? <StatusBadge status={v} /> : <span className="text-muted-foreground">ALL</span> },
    { key: 'successCount', label: 'Success', width: '100px' },
    { key: 'failedCount', label: 'Failed', width: '90px', render: (v: number) => v > 0 ? <span className="text-red-500 font-medium">{v}</span> : v },
    { key: 'cancelledCount', label: 'Cancelled', width: '100px' },
    { key: 'status', label: 'Status', width: '120px', render: (v: string) => <StatusBadge status={v || 'OPEN'} /> },
    {
      key: 'actions', label: '', width: '160px',
      render: (_v: any, row: any) => {
        const st = (row.status || 'OPEN').toUpperCase();
        return (
          <div className="flex gap-1">
            {st === 'OPEN' && <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => actionMutation.mutate({ id: row.id, action: 'start' })}><Play className="h-3 w-3 mr-1" />Start</Button>}
            {st === 'LOCKED' && <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => actionMutation.mutate({ id: row.id, action: 'generate' })}><FileText className="h-3 w-3 mr-1" />Generate</Button>}
            {st === 'APPROVED' && <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => actionMutation.mutate({ id: row.id, action: 'post' })}><CheckCircle2 className="h-3 w-3 mr-1" />Post</Button>}
            {!['CLOSED','CANCELLED'].includes(st) && <Button variant="outline" size="sm" className="h-7 text-xs text-red-500" onClick={() => actionMutation.mutate({ id: row.id, action: 'cancel' })}><XCircle className="h-3 w-3 mr-1" />Cancel</Button>}
          </div>
        );
      },
    },
  ];

  return (
    <div>
      <PageHeader title="Bill Cycles" subtitle="Create, schedule, and execute billing runs" action={
        <Button size="sm" className="gap-1" onClick={() => setCreateOpen(true)}><Plus className="h-4 w-4" />New Bill Cycle</Button>
      } />
      <SmartTable data={cycles as any} columns={columns} searchable searchPlaceholder="Search cycles..." />

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>New Bill Cycle</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Project</label>
              <Select value={form.projectId} onValueChange={v => setForm(f => ({ ...f, projectId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
                <SelectContent>{(projects ?? []).map((p: any) => <SelectItem key={p.id} value={p.id}>{p.name || p.projectName}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Month</label>
                <Select value={String(form.month)} onValueChange={v => setForm(f => ({ ...f, month: parseInt(v) }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{MONTHS.map((m, i) => <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Year</label>
                <Input type="number" value={form.year} onChange={e => setForm(f => ({ ...f, year: parseInt(e.target.value) || 2026 }))} />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Utility (optional)</label>
              <Select value={form.utilityType} onValueChange={v => setForm(f => ({ ...f, utilityType: v }))}>
                <SelectTrigger><SelectValue placeholder="All utilities" /></SelectTrigger>
                <SelectContent>{UTILITIES.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={() => createMutation.mutate(form)} disabled={!form.projectId || createMutation.isPending}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
