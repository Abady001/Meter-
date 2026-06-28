'use client';
import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiGet, apiPost } from '@/lib/api';
import { usePageStore } from '@/lib/router-store';
import { PageHeader, formatCurrency } from '@/components/shared/PageHelpers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { ArrowLeft, Save } from 'lucide-react';
import { useT } from '@/lib/i18n/context';

export default function NewCustomerPage() {
  const t = useT();
  const { navigate } = usePageStore();
  const projectId = typeof window !== 'undefined' ? localStorage.getItem('selected-project') || '' : '';
  const [form, setForm] = useState({
    customerType: 'postpaid',
    accountType: 'person',
    taxId: '',
    status: 'NEW',
    group: '',
    projectId: projectId,
    nameEn: '',
    nameAr: '',
    email: '',
    mobile: '',
    phone: '',
    notes: '',
    currentBalance: 0,
  });

  const createMutation = useMutation({
    mutationFn: () => apiPost(projectId ? `/projects/${projectId}/customers` : '/customers', {
      name: form.nameEn || form.nameAr,
      nameAr: form.nameAr || undefined,
      customerCode: `CUS-${Date.now().toString(36).slice(-6).toUpperCase()}`,
      customerType: form.accountType === 'company' ? 'company' : 'individual',
      email: form.email || undefined,
      phone: form.mobile || form.phone || undefined,
      taxId: form.taxId || undefined,
      notes: form.notes || undefined,
      currentBalance: form.currentBalance || 0,
      status: 'active',
    }),
    onSuccess: () => { toast.success('Customer created'); navigate('customers'); },
    onError: () => toast.error('Failed to create customer'),
  });

  return (
    <div>
      <PageHeader title="Create New Customer" subtitle="Enter customer details" />

      <Card className="max-w-3xl">
        <CardContent className="p-6">
          <div className="space-y-6">
            {/* Customer Type */}
            <div>
              <Label className="text-sm text-muted-foreground">Customer Type</Label>
              <RadioGroup value={form.customerType} onValueChange={v => setForm(f => ({ ...f, customerType: v }))} className="flex gap-4 mt-1">
                <div className="flex items-center gap-2"><RadioGroupItem value="prepaid" id="prepaid" /><Label htmlFor="prepaid">Prepaid</Label></div>
                <div className="flex items-center gap-2"><RadioGroupItem value="postpaid" id="postpaid" /><Label htmlFor="postpaid">Postpaid</Label></div>
              </RadioGroup>
            </div>

            {/* Account Type */}
            <div>
              <Label className="text-sm text-muted-foreground">Account Type</Label>
              <RadioGroup value={form.accountType} onValueChange={v => setForm(f => ({ ...f, accountType: v }))} className="flex gap-4 mt-1">
                <div className="flex items-center gap-2"><RadioGroupItem value="person" id="person" /><Label htmlFor="person">Person</Label></div>
                <div className="flex items-center gap-2"><RadioGroupItem value="company" id="company" /><Label htmlFor="company">Company</Label></div>
              </RadioGroup>
            </div>

            {/* Tax Id */}
            <div className="grid grid-cols-3 gap-4">
              <div><Label>Tax Id</Label><Input value={form.taxId} onChange={e => setForm(f => ({ ...f, taxId: e.target.value }))} placeholder="Tax Id" /></div>
              <div>
                <Label>Status</Label>
                <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NEW">NEW</SelectItem>
                    <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                    <SelectItem value="INACTIVE">INACTIVE</SelectItem>
                    <SelectItem value="SUSPENDED">SUSPENDED</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Group</Label>
                <Input value={form.group} onChange={e => setForm(f => ({ ...f, group: e.target.value }))} placeholder="ملاك / مستأجرين" />
              </div>
            </div>

            {/* Customer Name */}
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Name (English)</Label><Input value={form.nameEn} onChange={e => setForm(f => ({ ...f, nameEn: e.target.value }))} placeholder="Name English" /></div>
              <div><Label>Name (Arabic)</Label><Input value={form.nameAr} onChange={e => setForm(f => ({ ...f, nameAr: e.target.value }))} placeholder="الاسم بالعربية" /></div>
            </div>

            {/* Contact */}
            <div className="grid grid-cols-3 gap-4">
              <div><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="Email" /></div>
              <div><Label>Mobile</Label><Input value={form.mobile} onChange={e => setForm(f => ({ ...f, mobile: e.target.value }))} placeholder="Mobile" /></div>
              <div><Label>Phone</Label><Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="Phone" /></div>
            </div>

            {/* Notes + Balance */}
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Notes</Label><Input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Notes" /></div>
              <div><Label>Current Balance</Label><Input type="number" value={form.currentBalance || ''} onChange={e => setForm(f => ({ ...f, currentBalance: parseFloat(e.target.value) || 0 }))} /></div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => navigate('customers')}><ArrowLeft className="h-4 w-4 mr-1" />Cancel</Button>
              <Button onClick={() => createMutation.mutate()} disabled={!form.nameEn && !form.nameAr || createMutation.isPending}>
                <Save className="h-4 w-4 mr-1" />{createMutation.isPending ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
