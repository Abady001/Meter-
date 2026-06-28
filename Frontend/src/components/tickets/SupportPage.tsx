'use client';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader, formatDateTime } from '@/components/shared/PageHelpers';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { toast } from 'sonner';
import { Search, X, Phone, Mail, MapPin, FileText, Gauge } from 'lucide-react';
import { useT } from '@/lib/i18n/context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost } from '@/lib/api';

export default function SupportPage() {
  const t = useT();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newTicket, setNewTicket] = useState({ subject: '', description: '' });

  const { data: customersData } = useQuery({ queryKey: ['customers-all'], queryFn: () => apiGet<any[]>('/projects').catch(() => []) });
  const { data: supportData } = useQuery({ queryKey: ['support'], queryFn: () => apiGet<any[]>('/support') });
  const supportReqs = supportData ?? [];
  const filtered = supportReqs.filter((r: any) => !search || r.subject.toLowerCase().includes(search.toLowerCase()));
  const selected = supportReqs.find((r: any) => r.id === selectedId);

  const createMutation = useMutation({
    mutationFn: (data: { subject: string; description?: string }) => apiPost('/support', data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['support'] }); toast.success('Request created'); setNewTicket({ subject: '', description: '' }); },
  });

  return (
    <div>
      <PageHeader title={t('tickets.support')} subtitle={t('support.subtitle')} />
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search requests..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">New Request</h3>
            <Input placeholder="Subject" value={newTicket.subject} onChange={(e) => setNewTicket({...newTicket, subject: e.target.value})} />
            <Textarea placeholder="Description" rows={3} value={newTicket.description} onChange={(e) => setNewTicket({...newTicket, description: e.target.value})} />
            <Button size="sm" className="w-full" onClick={() => createMutation.mutate(newTicket)} disabled={!newTicket.subject || createMutation.isPending}>Submit</Button>
          </div>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {filtered.map((r: any) => (
              <div key={r.id} className={`p-3 rounded-lg cursor-pointer border text-sm transition-colors ${selectedId === r.id ? 'border-primary bg-primary/5' : 'border-border/30 hover:border-border/60'}`} onClick={() => setSelectedId(r.id)}>
                <p className="font-medium truncate">{r.subject}</p>
                <div className="flex gap-2 mt-1"><StatusBadge status={r.status} /><StatusBadge status={r.priority} /></div>
              </div>
            ))}
          </div>
        </div>
        <div className="md:col-span-2">
          {selected ? (
            <Card className="glass-card border-border/50">
              <CardHeader><div className="flex items-center justify-between"><CardTitle className="text-sm">{selected.subject}</CardTitle><StatusBadge status={selected.status} /></div></CardHeader>
              <CardContent className="space-y-4 text-sm">
                {selected.description && <p className="text-muted-foreground">{selected.description}</p>}
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span>Priority: {selected.priority}</span>
                  <span>Created: {formatDateTime(selected.createdAt)}</span>
                  {selected.assignedTo && <span>Assignee: {selected.assignedTo}</span>}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground gap-2">
              <FileText className="h-8 w-8" />
              <p className="text-sm">Select a request or create a new one</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
