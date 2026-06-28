'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/api';
import { PageHeader, formatDateTime } from '@/components/shared/PageHelpers';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import SmartTable from '@/components/smart-table/SmartTable';
import { toast } from 'sonner';
import { ListChecks, MessageSquare, TrendingUp, Users, Plus, CheckCircle2, Clock, AlertCircle, Quote, Activity } from 'lucide-react';
import { useT } from '@/lib/i18n/context';

export default function WorkplacePage() {
  const t = useT();
  const qc = useQueryClient();
  const [taskOpen, setTaskOpen] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', assignedTo: '', priority: 'medium', dueDate: '' });
  const [taskStatus, setTaskStatus] = useState<Record<string, string>>({});

  const { data: tasks } = useQuery({ queryKey: ['workplace-tasks'], queryFn: () => apiGet<any[]>('/tickets').catch(() => []) });
  const { data: employees } = useQuery({ queryKey: ['workplace-activity'], queryFn: () => apiGet<any[]>('/users').catch(() => []) });
  const { data: users } = useQuery({ queryKey: ['users'], queryFn: () => apiGet<any[]>('/users').catch(() => []) });

  const taskList = tasks ?? []; const a = employees ?? []; const u = users ?? [];
  const pendingTasks = taskList.filter((x: any) => x.status !== 'closed' && x.status !== 'resolved');
  const completedToday = taskList.filter((x: any) => x.status === 'closed' || x.status === 'resolved');
  const completionRate = taskList.length > 0 ? ((completedToday.length / taskList.length) * 100).toFixed(0) : '0';

  const handleStatusChange = (taskId: string, status: string) => {
    setTaskStatus(prev => ({ ...prev, [taskId]: status }));
    apiPatch(`/tickets/${taskId}`, { status }).then(() => { qc.invalidateQueries({ queryKey: ['workplace-tasks'] }); toast.success(`Task ${status}`); }).catch(() => {});
  };

  const quotes = [
    'التميز ليس مهارة بل عادة',
    'الجودة ليست عملاً بل عادة',
    'الاتقان في العمل عبادة',
    'من جد وجد ومن زرع حصد',
    'Excellence is not a skill, it is an attitude',
  ];

  return (
    <div>
      <PageHeader title={t('workspace.title')} subtitle={t('workspace.subtitle')} />

      {/* Quote Card */}
      <Card className="glass-card border-primary/30 mb-4" style={{ background: 'linear-gradient(135deg, #1e40af, #3b82f6)' }}>
        <CardContent className="p-6 text-center text-white">
          <Quote className="h-6 w-6 mx-auto mb-2 opacity-60" />
          <p className="text-lg font-semibold italic">{quotes[Math.floor(Math.random() * quotes.length)]}</p>
          <p className="text-xs opacity-70 mt-1">Meter Verse / عالم العدادات</p>
        </CardContent>
      </Card>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <Card className="glass-card border-border/50"><CardContent className="p-4 text-center"><CheckCircle2 className="h-5 w-5 text-emerald-500 mx-auto mb-1" /><p className="text-2xl font-bold text-emerald-500">{completedToday.length}</p><p className="text-xs text-muted-foreground">{t('workspace.completedToday')}</p></CardContent></Card>
        <Card className="glass-card border-border/50"><CardContent className="p-4 text-center"><TrendingUp className="h-5 w-5 text-primary mx-auto mb-1" /><p className="text-2xl font-bold text-primary">{completionRate}%</p><p className="text-xs text-muted-foreground">{t('workspace.completionRate')}</p></CardContent></Card>
        <Card className="glass-card border-border/50"><CardContent className="p-4 text-center"><Users className="h-5 w-5 text-info mx-auto mb-1" /><p className="text-2xl font-bold text-info">{u.length}</p><p className="text-xs text-muted-foreground">{t('workspace.teamMembers')}</p></CardContent></Card>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Tasks Section */}
        <Card className="glass-card border-border/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2"><ListChecks className="h-4 w-4" />{t('workspace.myTasks')}</CardTitle>
              <Button size="sm" className="gap-1" onClick={() => setTaskOpen(true)}><Plus className="h-3.5 w-3.5" />{t('workspace.newTask')}</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {pendingTasks.length > 0 ? pendingTasks.slice(0, 10).map((task: any) => (
                <div key={task.id} className="p-3 rounded-lg border hover:border-primary/30 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{task.title || task.subject || 'Task'}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <StatusBadge status={task.status || 'pending'} />
                        <span className="text-xs text-muted-foreground">{task.assignedTo || task.assigned_to || t('common.unassigned')}</span>
                      </div>
                    </div>
                    <div>
                      <select className="text-xs border rounded px-1 py-0.5 bg-background" value={taskStatus[task.id] || task.status || 'pending'} onChange={e => handleStatusChange(task.id, e.target.value)}>
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="closed">Completed</option>
                      </select>
                    </div>
                  </div>
                </div>
              )) : <p className="text-sm text-muted-foreground text-center py-4">{t('workspace.noPendingTasks')}</p>}
            </div>
          </CardContent>
        </Card>

        {/* Activity Section */}
        <Card className="glass-card border-border/50">
          <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Clock className="h-4 w-4" />{t('workspace.recentActivity')}</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {a.length > 0 ? a.slice(0, 10).map((ev: any, i: number) => (
                <div key={i} className="flex items-start gap-2 p-2 rounded hover:bg-muted/20">
                  <Activity className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs">{ev.name || ev.email || 'User'}</p>
                    <p className="text-xs text-muted-foreground">{ev.role ? <StatusBadge status={ev.role} /> : ''}</p>
                  </div>
                </div>
              )) : <p className="text-sm text-muted-foreground text-center py-4">{t('workspace.noActivityYet')}</p>}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Progress */}
      <Card className="glass-card border-border/50 mt-4">
        <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Users className="h-4 w-4" />{t('workspace.teamProgress')}</CardTitle></CardHeader>
        <CardContent>
          <SmartTable data={u.slice(0, 10)} columns={[
            { key: 'name', label: t('workspace.member'), sortable: true },
            { key: 'role', label: t('workspace.role'), render: (v: string) => <StatusBadge status={v} /> },
            { key: 'email', label: t('workspace.email') },
          ]} compact />
        </CardContent>
      </Card>

      {/* New Task Dialog */}
      <Dialog open={taskOpen} onOpenChange={setTaskOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t('workspace.newTaskDialog')}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <Input placeholder={t('workspace.taskTitle')} value={taskForm.title} onChange={e => setTaskForm({...taskForm, title: e.target.value})} />
            <Input placeholder={t('workspace.taskDescription')} value={taskForm.description} onChange={e => setTaskForm({...taskForm, description: e.target.value})} />
            <Input placeholder={t('workspace.assignTo')} value={taskForm.assignedTo} onChange={e => setTaskForm({...taskForm, assignedTo: e.target.value})} />
            <Input type="date" value={taskForm.dueDate} onChange={e => setTaskForm({...taskForm, dueDate: e.target.value})} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTaskOpen(false)}>{t('common.cancel')}</Button>
            <Button onClick={() => { apiPost('/tickets', taskForm).then(() => { toast.success(t('workspace.taskCreated')); qc.invalidateQueries({ queryKey: ['workplace-tasks'] }); setTaskOpen(false); }).catch(() => toast.error('Failed')); }}>{t('common.create')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
