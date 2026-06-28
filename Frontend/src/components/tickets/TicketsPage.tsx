'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageHeader, formatDateTime } from '@/components/shared/PageHelpers';
import { StatusBadge } from '@/components/shared/StatusBadge';
import SmartTable from '@/components/smart-table/SmartTable';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { useT } from '@/lib/i18n/context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPatch } from '@/lib/api';

export default function TicketsPage() {
  const t = useT();
  const qc = useQueryClient();
  const [view, setView] = useState<'kanban' | 'table'>('table');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium', category: '' });
  const { data: ticketsData } = useQuery({ queryKey: ['tickets'], queryFn: () => apiGet<any[]>('/tickets') });
  const tickets = ticketsData ?? [];

  const createMutation = useMutation({
    mutationFn: () => apiPost('/tickets', form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tickets'] }); toast.success('Ticket created'); setDialogOpen(false); setForm({ title: '', description: '', priority: 'medium', category: '' }); },
  });

  const columns = [
    { key: 'title', label: 'Title', sortable: true },
    { key: 'priority', label: 'Priority', width: '100px', render: (v: string) => <StatusBadge status={v} /> },
    { key: 'status', label: 'Status', width: '110px', sortable: true, render: (v: string) => <StatusBadge status={v} /> },
    { key: 'assignedTo', label: 'Assignee', width: '120px', render: (v: string) => v || '-' },
    { key: 'createdAt', label: 'Created', width: '130px', render: (v: string) => formatDateTime(v) },
  ];

  return (
    <div>
      <PageHeader title={t('tickets.title')} subtitle={t('tickets.subtitle')} action={
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild><Button className="gap-2"><Plus className="h-4 w-4" /> Create Ticket</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Ticket</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              <Input placeholder="Title" value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} />
              <Textarea placeholder="Description" rows={3} value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} />
              <Select value={form.priority} onValueChange={(v) => setForm({...form, priority: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="low">Low</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="high">High</SelectItem><SelectItem value="critical">Critical</SelectItem></SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={() => createMutation.mutate()} disabled={!form.title || createMutation.isPending}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      } />
      <div className="flex gap-2 mb-4">
        <Button variant={view === 'table' ? 'default' : 'outline'} size="sm" onClick={() => setView('table')}>Table</Button>
        <Button variant={view === 'kanban' ? 'default' : 'outline'} size="sm" onClick={() => setView('kanban')}>Kanban</Button>
      </div>
      {view === 'table' ? (
        <SmartTable data={tickets} columns={columns} searchable />
      ) : (
        <div className="grid grid-cols-4 gap-4">
          {['open', 'in_progress', 'resolved', 'closed'].map((col) => (
            <div key={col} className="glass-card rounded-xl p-4">
              <h3 className="text-sm font-semibold mb-3 capitalize">{col.replace(/_/g, ' ')}</h3>
              <div className="space-y-2">
                {tickets.filter((t: any) => t.status === col).map((ticket: any) => (
                  <div key={ticket.id} className="p-3 rounded-lg bg-background/50 border border-border/30 text-sm">
                    <p className="font-medium truncate">{ticket.title}</p>
                    <p className="text-xs text-muted-foreground mt-1"><StatusBadge status={ticket.priority} /></p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

