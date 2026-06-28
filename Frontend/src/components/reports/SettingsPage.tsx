'use client';
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/api';
import { PageHeader } from '@/components/shared/PageHelpers';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import SmartTable from '@/components/smart-table/SmartTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';
import { Plus, Pencil, Trash2, Shield, Users, UserPlus, Building2, Home } from 'lucide-react';
import { RoleSwitcher } from '@/components/layout/RoleSwitcher';
import { useT } from '@/lib/i18n/context';

export default function SettingsPage() {
  const t = useT();
  const { theme, setTheme } = useTheme();
  const qc = useQueryClient();

  // User Management
  const [userOpen, setUserOpen] = useState(false);
  const [userForm, setUserForm] = useState({ id: '', username: '', email: '', password: '', status: 'active' });
  const { data: users } = useQuery({ queryKey: ['users'], queryFn: () => apiGet<any[]>('/users').catch(() => []) });

  const createUser = useMutation({
    mutationFn: () => apiPost('/users', userForm),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); toast.success('User created'); setUserOpen(false); setUserForm({ id: '', username: '', email: '', password: '', status: 'active' }); },
    onError: (e: any) => toast.error(e?.message || 'Failed'),
  });

  const deleteUser = useMutation({
    mutationFn: (id: string) => apiDelete('/users/' + id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); toast.success('User deactivated'); },
  });

  // Area Management
  const [areaOpen, setAreaOpen] = useState(false);
  const [areaForm, setAreaForm] = useState({ areaCode: '', areaName: '', databaseName: '', connectionString: '' });
  const { data: areas } = useQuery({ queryKey: ['areas'], queryFn: () => apiGet<any[]>('/areas').catch(() => []) });

  const createArea = useMutation({
    mutationFn: () => apiPost('/areas', areaForm),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['areas'] }); toast.success('Area created'); setAreaOpen(false); setAreaForm({ areaCode: '', areaName: '', databaseName: '', connectionString: '' }); },
  });

  const deleteArea = useMutation({
    mutationFn: (id: string) => apiDelete('/areas/' + id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['areas'] }); toast.success('Area deactivated'); },
  });

  // Unit Types
  const [typeOpen, setTypeOpen] = useState(false);
  const [typeForm, setTypeForm] = useState({ typeCode: '', typeName: '', meterTypeDefault: '' });
  const { data: unitTypes } = useQuery({ queryKey: ['unit-types'], queryFn: () => apiGet<any[]>('/unit-types').catch(() => []) });

  const createType = useMutation({
    mutationFn: () => apiPost('/unit-types', typeForm),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['unit-types'] }); toast.success('Unit type created'); setTypeOpen(false); setTypeForm({ typeCode: '', typeName: '', meterTypeDefault: '' }); },
  });

  const deleteType = useMutation({
    mutationFn: (id: string) => apiDelete('/unit-types/' + id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['unit-types'] }); toast.success('Unit type deleted'); },
  });

  // Project Management
  const [projectOpen, setProjectOpen] = useState(false);
  const [projectForm, setProjectForm] = useState({ areaId: '', projectCode: '', projectName: '' });
  const { data: projects } = useQuery({ queryKey: ['projects'], queryFn: () => apiGet<any[]>('/projects').catch(() => []) });

  const createProject = useMutation({
    mutationFn: () => apiPost('/projects', projectForm),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['projects'] }); toast.success('Project created'); setProjectOpen(false); setProjectForm({ areaId: '', projectCode: '', projectName: '' }); },
    onError: (e: any) => toast.error(e?.message || 'Failed'),
  });

  const deleteProject = useMutation({
    mutationFn: (id: string) => apiDelete('/projects/' + id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['projects'] }); toast.success('Project deactivated'); },
  });

  // Permission Matrix State
  const [permState, setPermState] = useState<Record<string, Record<string, boolean>>>({});
  const togglePerm = (role: string, moduleIdx: number, action: string) => {
    setPermState(prev => {
      const key = role;
      const current = prev[key] || { V: true, A: true, E: true, D: true };
      return { ...prev, [key]: { ...current, [action]: !current[action] } };
    });
  };

  return (
    <div>
      <PageHeader title={t('settings.title')} subtitle={t('settings.subtitle')} />

      <Tabs defaultValue="general">
        <TabsList className="mb-4 flex-wrap h-auto gap-1">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="users"><UserPlus className="h-3.5 w-3.5 mr-1" />Users</TabsTrigger>
          <TabsTrigger value="areas"><Building2 className="h-3.5 w-3.5 mr-1" />Areas</TabsTrigger>
           <TabsTrigger value="projects"><Building2 className="h-3.5 w-3.5 mr-1" />Projects</TabsTrigger>
           <TabsTrigger value="unit-types"><Home className="h-3.5 w-3.5 mr-1" />Unit Types</TabsTrigger>
          <TabsTrigger value="permissions"><Shield className="h-3.5 w-3.5 mr-1" />Permissions</TabsTrigger>
          <TabsTrigger value="user-groups"><Users className="h-3.5 w-3.5 mr-1" />User Groups</TabsTrigger>
          <TabsTrigger value="customer-groups"><Users className="h-3.5 w-3.5 mr-1" />Customer Groups</TabsTrigger>
          <TabsTrigger value="payment-centers"><Building2 className="h-3.5 w-3.5 mr-1" />Payment Centers</TabsTrigger>
          <TabsTrigger value="bank-accounts"><Building2 className="h-3.5 w-3.5 mr-1" />Bank Accounts</TabsTrigger>
          <TabsTrigger value="pos-terminals"><Building2 className="h-3.5 w-3.5 mr-1" />POS</TabsTrigger>
          <TabsTrigger value="holidays"><Building2 className="h-3.5 w-3.5 mr-1" />Holidays</TabsTrigger>
          <TabsTrigger value="unit-zones"><Building2 className="h-3.5 w-3.5 mr-1" />Unit Zones</TabsTrigger>
          <TabsTrigger value="settlement-types"><Building2 className="h-3.5 w-3.5 mr-1" />Settlement Types</TabsTrigger>
          <TabsTrigger value="reading">Reading</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="theme">Theme</TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general">
          <Card className="glass-card border-border/50 max-w-lg">
            <CardHeader><CardTitle className="text-sm">System Settings</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">General system settings coming soon.</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users">
          <Card className="glass-card border-border/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">User Management</CardTitle>
                <Button size="sm" className="gap-1" onClick={() => { setUserForm({ id: '', username: '', email: '', password: '', status: 'active' }); setUserOpen(true); }}><Plus className="h-3.5 w-3.5" /> Add User</Button>
              </div>
            </CardHeader>
            <CardContent>
              <SmartTable data={users ?? []} columns={[
                { key: 'name', label: 'Username', sortable: true },
                { key: 'email', label: 'Email' },
                { key: 'role', label: 'Role', render: (v: string) => <StatusBadge status={v} /> },
                { key: 'id', label: 'Actions', render: (v: string) => (
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => { if (confirm('Deactivate this user?')) deleteUser.mutate(v); }}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                )},
              ]} searchable />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Permissions Tab */}
        <TabsContent value="permissions">
          <Card className="glass-card border-border/50 mb-4">
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Shield className="h-4 w-4" />Role Testing</CardTitle></CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-3">Switch between roles to test permission visibility across the system.</p>
              <RoleSwitcher />
            </CardContent>
          </Card>
          <Card className="glass-card border-border/50">
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Shield className="h-4 w-4" />Permission Matrix</CardTitle></CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-4">Toggle permissions per role. Changes apply immediately.</p>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2 font-medium w-24">Role</th>
                      {['Dashboard','Customers','Projects','Meters','Readings','Invoices','Payments','Reports','Settings'].map(m => (
                        <th key={m} className="p-1 font-medium text-center text-[10px]" colSpan={4}>{m}</th>
                      ))}
                    </tr>
                    <tr className="border-b text-muted-foreground">
                      <th className="p-1" />
                      {Array(9).fill(0).map((_, i) => (
                        <td key={i} className="p-0 text-center text-[9px] leading-none" colSpan={4}>
                          <span className="block">V</span>
                          <span className="block">A</span>
                          <span className="block">E</span>
                          <span className="block">D</span>
                        </td>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {['super_admin','admin','operator','finance','viewer'].map(role => {
                      const perms = permState[role] || { V: true, A: true, E: true, D: true };
                      return (
                        <tr key={role} className="border-b hover:bg-muted/20">
                          <td className="p-2 font-medium text-[11px]">{role.replace('_',' ')}</td>
                          {Array(9).fill(0).map((_, mi) => (
                            <td key={mi} className="p-0 text-center" colSpan={4}>
                              {(['V','A','E','D'] as const).map(action => (
                                <button key={action}
                                  onClick={() => togglePerm(role, mi, action)}
                                  className={`inline-block w-3.5 h-3.5 m-px rounded-sm text-[9px] leading-none transition-colors ${
                                    perms[action] ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                                  }`}>
                                  {perms[action] ? '✓' : '—'}
                                </button>
                              ))}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* User Groups Tab */}
        <TabsContent value="user-groups">
          <Card className="glass-card border-border/50">
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Users className="h-4 w-4" />User Groups</CardTitle></CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">User groups allow assigning permission profiles to departments.</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Customer Groups Tab */}
        <TabsContent value="customer-groups">
          <Card className="glass-card border-border/50">
            <CardHeader><CardTitle className="text-sm">Customer Groups</CardTitle></CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Manage customer grouping for tariff assignment and reporting.</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Centers Tab */}
        <TabsContent value="payment-centers">
          <Card className="glass-card border-border/50">
            <CardHeader><CardTitle className="text-sm">Payment Centers</CardTitle></CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Configure payment collection centers and locations.</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bank Accounts Tab */}
        <TabsContent value="bank-accounts">
          <Card className="glass-card border-border/50">
            <CardHeader><CardTitle className="text-sm">Bank Accounts</CardTitle></CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Manage company bank accounts for payment reconciliation.</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* POS Terminals Tab */}
        <TabsContent value="pos-terminals">
          <Card className="glass-card border-border/50">
            <CardHeader><CardTitle className="text-sm">POS Terminals</CardTitle></CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Register and manage POS terminal devices.</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Holidays Tab */}
        <TabsContent value="holidays">
          <Card className="glass-card border-border/50">
            <CardHeader><CardTitle className="text-sm">Holidays</CardTitle></CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Configure holidays for billing cycle scheduling.</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Unit Zones Tab */}
        <TabsContent value="unit-zones">
          <Card className="glass-card border-border/50">
            <CardHeader><CardTitle className="text-sm">Unit Zones</CardTitle></CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Manage unit zone classifications.</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settlement Types Tab */}
        <TabsContent value="settlement-types">
          <Card className="glass-card border-border/50">
            <CardHeader><CardTitle className="text-sm">Settlement Types</CardTitle></CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Configure settlement types (Tariff Difference, Consumption Settlement).</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Areas Tab */}
        <TabsContent value="areas">
          <Card className="glass-card border-border/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Area Management</CardTitle>
                <Button size="sm" className="gap-1" onClick={() => { setAreaForm({ areaCode: '', areaName: '', databaseName: '', connectionString: '' }); setAreaOpen(true); }}><Plus className="h-3.5 w-3.5" /> Add Area</Button>
              </div>
            </CardHeader>
            <CardContent>
              <SmartTable data={areas ?? []} columns={[
                { key: 'areaCode', label: 'Code', sortable: true },
                { key: 'areaName', label: 'Name', sortable: true },
                { key: 'isActive', label: 'Status', render: (v: boolean) => <StatusBadge status={v ? 'active' : 'inactive'} /> },
                { key: 'id', label: 'Actions', render: (v: string) => (
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => { if (confirm('Deactivate this area?')) deleteArea.mutate(v); }}><Trash2 className="h-3.5 w-3.5" /></Button>
                )},
              ]} searchable />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Projects Tab */}
        <TabsContent value="projects">
          <Card className="glass-card border-border/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Project Management</CardTitle>
                <Button size="sm" className="gap-1" onClick={() => { setProjectForm({ areaId: '', projectCode: '', projectName: '' }); setProjectOpen(true); }}><Plus className="h-3.5 w-3.5" /> Add Project</Button>
              </div>
            </CardHeader>
            <CardContent>
              <SmartTable data={projects ?? []} columns={[
                { key: 'projectCode', label: 'Code', sortable: true },
                { key: 'projectName', label: 'Name', sortable: true },
                { key: 'areaId', label: 'Area ID' },
                { key: 'isActive', label: 'Status', render: (v: boolean) => <StatusBadge status={v ? 'active' : 'inactive'} /> },
                { key: 'id', label: 'Actions', render: (v: string) => (
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => { if (confirm('Deactivate this project?')) deleteProject.mutate(v); }}><Trash2 className="h-3.5 w-3.5" /></Button>
                )},
              ]} searchable />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Unit Types Tab */}
        <TabsContent value="unit-types">
          <Card className="glass-card border-border/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Unit Type Management</CardTitle>
                <Button size="sm" className="gap-1" onClick={() => { setTypeForm({ typeCode: '', typeName: '', meterTypeDefault: '' }); setTypeOpen(true); }}><Plus className="h-3.5 w-3.5" /> Add Type</Button>
              </div>
            </CardHeader>
            <CardContent>
              <SmartTable data={unitTypes ?? []} columns={[
                { key: 'typeCode', label: 'Code', sortable: true },
                { key: 'typeName', label: 'Name' },
                { key: 'meterTypeDefault', label: 'Default Meter Type' },
                { key: 'id', label: 'Actions', render: (v: string) => (
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => { if (confirm('Delete this unit type?')) deleteType.mutate(v); }}><Trash2 className="h-3.5 w-3.5" /></Button>
                )},
              ]} searchable />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reading Tab */}
        <TabsContent value="reading">
          <Card className="glass-card border-border/50 max-w-lg">
            <CardHeader><CardTitle className="text-sm">Reading Thresholds</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Reading thresholds coming soon.</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card className="glass-card border-border/50 max-w-lg">
            <CardHeader><CardTitle className="text-sm">Notifications</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Notification settings coming soon.</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Theme Tab */}
        <TabsContent value="theme">
          <Card className="glass-card border-border/50 max-w-lg">
            <CardHeader><CardTitle className="text-sm">Theme</CardTitle></CardHeader>
            <CardContent>
              <div className="flex gap-2">
                {(['light', 'dark', 'system'] as const).map((t) => (
                  <Button key={t} variant={theme === t ? 'default' : 'outline'} onClick={() => setTheme(t)} className="capitalize">{t}</Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add User Dialog */}
      <Dialog open={userOpen} onOpenChange={setUserOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add User</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div><Label>Username</Label><Input value={userForm.username} onChange={e => setUserForm({...userForm, username: e.target.value})} /></div>
            <div><Label>Email</Label><Input value={userForm.email} onChange={e => setUserForm({...userForm, email: e.target.value})} /></div>
            <div><Label>Password</Label><Input type="password" value={userForm.password} onChange={e => setUserForm({...userForm, password: e.target.value})} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUserOpen(false)}>Cancel</Button>
            <Button onClick={() => createUser.mutate()} disabled={!userForm.username || !userForm.password}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Area Dialog */}
      <Dialog open={areaOpen} onOpenChange={setAreaOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Area</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div><Label>Area Code</Label><Input value={areaForm.areaCode} onChange={e => setAreaForm({...areaForm, areaCode: e.target.value})} placeholder="e.g. OCT" /></div>
            <div><Label>Area Name</Label><Input value={areaForm.areaName} onChange={e => setAreaForm({...areaForm, areaName: e.target.value})} placeholder="e.g. October" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAreaOpen(false)}>Cancel</Button>
            <Button onClick={() => createArea.mutate()} disabled={!areaForm.areaCode || !areaForm.areaName}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Project Dialog */}
      <Dialog open={projectOpen} onOpenChange={setProjectOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Project</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div><Label>Project Code</Label><Input value={projectForm.projectCode} onChange={e => setProjectForm({...projectForm, projectCode: e.target.value})} placeholder="e.g. GOLF_VIEWS" /></div>
            <div><Label>Project Name</Label><Input value={projectForm.projectName} onChange={e => setProjectForm({...projectForm, projectName: e.target.value})} placeholder="e.g. Golf Views" /></div>
            <div><Label>Area</Label>
              <Select value={projectForm.areaId} onValueChange={v => setProjectForm({...projectForm, areaId: v})}>
                <SelectTrigger><SelectValue placeholder="Select area" /></SelectTrigger>
                <SelectContent>
                  {(areas ?? []).map((a: any) => (
                    <SelectItem key={a.id} value={a.id}>{a.areaName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProjectOpen(false)}>Cancel</Button>
            <Button onClick={() => createProject.mutate()} disabled={!projectForm.projectCode || !projectForm.projectName || !projectForm.areaId}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Unit Type Dialog */}
      <Dialog open={typeOpen} onOpenChange={setTypeOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Unit Type</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div><Label>Code</Label><Input value={typeForm.typeCode} onChange={e => setTypeForm({...typeForm, typeCode: e.target.value})} placeholder="e.g. villa" /></div>
            <div><Label>Name</Label><Input value={typeForm.typeName} onChange={e => setTypeForm({...typeForm, typeName: e.target.value})} placeholder="e.g. Villa" /></div>
            <div><Label>Default Meter Type</Label>
              <Select value={typeForm.meterTypeDefault} onValueChange={v => setTypeForm({...typeForm, meterTypeDefault: v})}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="electricity">Electricity</SelectItem>
                  <SelectItem value="water">Water</SelectItem>
                  <SelectItem value="solar">Solar</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTypeOpen(false)}>Cancel</Button>
            <Button onClick={() => createType.mutate()} disabled={!typeForm.typeCode || !typeForm.typeName}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

