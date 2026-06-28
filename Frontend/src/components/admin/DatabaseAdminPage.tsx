'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import { PageHeader, formatDateTime } from '@/components/shared/PageHelpers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import SmartTable from '@/components/smart-table/SmartTable';
import { toast } from 'sonner';
import { Database, Table2, Activity, Shield, Search, AlertTriangle, Trash2, Edit, Plus, Eye } from 'lucide-react';
import { useT } from '@/lib/i18n/context';

const TABLES = ['Customer', 'Project', 'Meter', 'Reading', 'Invoice', 'InvoiceLine', 'Payment', 'PaymentAllocation', 'TariffPlan', 'Unit', 'BillingPeriod', 'CustomerLedgerEntry', 'Settlement', 'CoreUser', 'CoreArea'];

export default function DatabaseAdminPage() {
  const t = useT();
  const qc = useQueryClient();
  const [table, setTable] = useState('Customer');
  const [queryInput, setQueryInput] = useState('SELECT * FROM sim_system."Customer" LIMIT 20');
  const [queryResult, setQueryResult] = useState<any>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<any>(null);
  const [deps, setDeps] = useState<any>(null);

  const { data: tableData, refetch: refetchTable } = useQuery({
    queryKey: ['admin-data', table],
    queryFn: () => apiGet<any>(`/admin/data/${table}`).catch(() => ({ data: [] })),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiDelete(`/admin/data/${table}/${id}`),
    onSuccess: (data: any) => {
      if (data.error) { toast.error(data.error); if (data.dependencies) setDeps(data.dependencies); }
      else { toast.success('Record deleted'); qc.invalidateQueries({ queryKey: ['admin-data'] }); }
    },
  });

  const saveMutation = useMutation({
    mutationFn: (body: any) => editRecord?.id ? apiPut(`/admin/data/${table}/${editRecord.id}`, body) : apiPost(`/admin/data/${table}`, body),
    onSuccess: () => { toast.success('Saved'); setEditOpen(false); qc.invalidateQueries({ queryKey: ['admin-data'] }); },
    onError: (e: any) => toast.error(e?.message || 'Save failed'),
  });

  const runQuery = async () => {
    try {
      const r = await apiPost<any>('/admin/query', { sql: queryInput });
      setQueryResult(r);
    } catch (e: any) { setQueryResult({ error: e.message }); }
  };

  const records = tableData?.data ?? [];

  return (
    <div>
      <PageHeader title={t('admin.title')} subtitle={t('admin.subtitle')} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <Card><CardContent className="p-4"><Database className="h-5 w-5 text-primary mb-1" /><p className="text-xs text-muted-foreground">Database</p><p className="font-bold">PostgreSQL</p></CardContent></Card>
        <Card><CardContent className="p-4"><Table2 className="h-5 w-5 text-primary mb-1" /><p className="text-xs text-muted-foreground">Tables</p><p className="font-bold">{TABLES.length}</p></CardContent></Card>
        <Card><CardContent className="p-4"><Activity className="h-5 w-5 text-primary mb-1" /><p className="text-xs text-muted-foreground">Records</p><p className="font-bold">{records.length}</p></CardContent></Card>
        <Card><CardContent className="p-4"><Shield className="h-5 w-5 text-emerald-500 mb-1" /><p className="text-xs text-muted-foreground">Dependency Check</p><p className="font-bold text-emerald-500">Active</p></CardContent></Card>
      </div>

      <Tabs defaultValue="browser">
        <TabsList className="mb-4">
          <TabsTrigger value="browser"><Search className="h-3.5 w-3.5 mr-1" />Table Browser</TabsTrigger>
          <TabsTrigger value="query"><Database className="h-3.5 w-3.5 mr-1" />SQL Query</TabsTrigger>
        </TabsList>

        <TabsContent value="browser">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Select value={table} onValueChange={setTable}>
                    <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                    <SelectContent>{TABLES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                  <Button variant="outline" size="sm" onClick={() => refetchTable()}><Activity className="h-3.5 w-3.5" /></Button>
                </div>
                <Button size="sm" onClick={() => { setEditRecord({}); setEditOpen(true); }}><Plus className="h-3.5 w-3.5 mr-1" />Add Record</Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <SmartTable data={records} columns={
                records.length > 0 ? Object.keys(records[0]).slice(0, 8).map(k => ({
                  key: k, label: k, width: k === 'id' ? '180px' : undefined,
                  render: (v: any) => typeof v === 'string' && v.length > 40 ? v.substring(0, 40) + '...' : String(v ?? ''),
                })).concat([{
                  key: 'id', label: 'Actions', width: '120px',
                  render: (v: string, row: any) => (
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditRecord(row); setEditOpen(true); }}><Edit className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={async () => {
                        if (!confirm('Delete this record?')) return;
                        const depRes = await apiGet<any>(`/admin/dependencies/${table}/${v}`).catch(() => null);
                        if (depRes?.hasDependencies) {
                          const details = depRes.dependencies.map((d: any) => `${d.table} (${d.records.length} records)`).join('\n');
                          if (!confirm(`This record has dependencies:\n${details}\n\nDelete anyway?`)) return;
                        }
                        deleteMutation.mutate(v);
                      }}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  ),
                } as any]) : []
              } emptyMessage="No records found" />
            </CardContent>
          </Card>

          {/* Edit Dialog */}
          <Dialog open={editOpen} onOpenChange={setEditOpen}>
            <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
              <DialogHeader><DialogTitle>{editRecord?.id ? 'Edit Record' : 'Add Record'}</DialogTitle></DialogHeader>
              <div className="space-y-3 py-4">
                {editRecord && Object.entries(editRecord).filter(([k]) => k !== 'id').map(([key, val]) => (
                  <div key={key}>
                    <Label className="text-xs">{key}</Label>
                    <Input value={String(val ?? '')} onChange={e => setEditRecord({ ...editRecord, [key]: e.target.value })} className="text-sm" />
                  </div>
                ))}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
                <Button onClick={() => saveMutation.mutate(editRecord)} disabled={saveMutation.isPending}>Save</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Dependency Warning */}
          {deps && (
            <Card className="mt-4 border-amber-300">
              <CardHeader><CardTitle className="text-sm flex items-center gap-2 text-amber-600"><AlertTriangle className="h-4 w-4" />Dependencies Found</CardTitle></CardHeader>
              <CardContent>
                {deps.map((d: any, i: number) => (
                  <p key={i} className="text-xs text-muted-foreground">{d.table}: {d.records.length} record(s)</p>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="query">
          <Card>
            <CardHeader><CardTitle className="text-sm">SQL Query Runner</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <textarea value={queryInput} onChange={e => setQueryInput(e.target.value)} rows={4}
                className="w-full p-3 rounded-xl border border-input bg-card text-card-foreground text-xs font-mono focus:ring-2 focus:ring-ring outline-none resize-none" />
              <Button onClick={runQuery}><Search className="h-3.5 w-3.5 mr-1" />Execute</Button>
              {queryResult && (
                <div className="mt-4">
                  {queryResult.error ? (
                    <p className="text-sm text-red-500">{queryResult.error}</p>
                  ) : (
                    <div className="max-h-96 overflow-auto">
                      <p className="text-xs text-muted-foreground mb-2">{queryResult.count || queryResult.data?.length || 0} rows returned</p>
                      <SmartTable data={queryResult.data || []} columns={
                        (queryResult.data?.[0] ? Object.keys(queryResult.data[0]).slice(0, 10) : []).map((k: string) => ({
                          key: k, label: k,
                          render: (v: any) => typeof v === 'object' ? JSON.stringify(v).substring(0, 50) : String(v ?? '').substring(0, 50),
                        }))
                      } />
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
