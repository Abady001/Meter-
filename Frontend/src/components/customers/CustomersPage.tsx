'use client';
import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';
import { PageHeader, formatCurrency } from '@/components/shared/PageHelpers';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { usePageStore } from '@/lib/router-store';
import { useT } from '@/lib/i18n/context';
import { Phone, Mail, MapPin, Gauge, CreditCard, Search, Plus, Users, X } from 'lucide-react';

export default function CustomersPage() {
  const t = useT();
  const { navigate } = usePageStore();
  const [search, setSearch] = useState('');

  const projectId = typeof window !== 'undefined' ? localStorage.getItem('selected-project') || '' : '';
  const { data: customers } = useQuery({ queryKey: ['customers', projectId], queryFn: () => {
    if (!projectId) return Promise.resolve([]);
    return apiGet<any[]>(`/projects/${projectId}/customers`).catch(() => []);
  }, enabled: !!projectId });

  const customerList = useMemo(() => {
    const list = Array.isArray(customers) ? customers : [];
    if (!search.trim()) return list;
    const q = search.toLowerCase().trim();
    return list.filter((c: any) => {
      const name = (c.name || '').toLowerCase();
      const code = (c.customerCode || c.code || '').toLowerCase();
      const phone = (c.phone || '');
      const email = (c.email || '').toLowerCase();
      const area = (c.area || c.projectName || '').toLowerCase();
      const meterSerial = (c.meterSerial || c.meters?.map?.((m: any) => m.serialNumber)?.join(' ') || '').toLowerCase();
      return name.includes(q) || code.includes(q) || phone.includes(q) || email.includes(q) || area.includes(q) || meterSerial.includes(q);
    });
  }, [customers, search]);

  return (
    <div>
      <PageHeader title={t('customers.title')} subtitle={t('customers.subtitle')} />

      {/* Smart Search */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, code, phone, email, meter serial..."
            className="pl-9 pr-9 h-10"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Button size="sm" className="gap-1" onClick={() => navigate('customer-new')}>
          <Plus className="h-3.5 w-3.5" />Add Customer
        </Button>
      </div>

      {/* Customer Cards Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {customerList.map((customer: any) => {
          const meterCount = customer.meters?.length ?? customer.activeMeters ?? 0;
          const invoiceCount = customer.invoices?.length ?? 0;
          return (
            <Card key={customer.id} className="hover:border-primary/40 transition-colors cursor-pointer" onClick={() => navigate('customer-detail', { id: customer.id })}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Users className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm">{customer.name}</h3>
                        <p className="text-[11px] text-muted-foreground">{customer.customerCode || customer.code}</p>
                      </div>
                    </div>
                  </div>
                  <StatusBadge status={customer.status} />
                </div>

                <div className="space-y-1.5 text-xs text-muted-foreground mb-3">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3 w-3" />
                    <span>{customer.area || customer.projectName || '-'}</span>
                  </div>
                  {customer.phone && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="h-3 w-3" />
                      <span>{customer.phone}</span>
                    </div>
                  )}
                  {customer.email && (
                    <div className="flex items-center gap-1.5">
                      <Mail className="h-3 w-3" />
                      <span className="truncate">{customer.email}</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border/50">
                  <div className="text-center">
                    <Gauge className="h-3.5 w-3.5 mx-auto mb-0.5 text-muted-foreground" />
                    <p className="text-xs font-medium">{meterCount}</p>
                    <p className="text-[10px] text-muted-foreground">Meters</p>
                  </div>
                  <div className="text-center">
                    <CreditCard className="h-3.5 w-3.5 mx-auto mb-0.5 text-muted-foreground" />
                    <p className="text-xs font-medium">{invoiceCount}</p>
                    <p className="text-[10px] text-muted-foreground">Invoices</p>
                  </div>
                  <div className="text-center">
                    <CreditCard className="h-3.5 w-3.5 mx-auto mb-0.5 text-emerald-500" />
                    <p className={`text-xs font-medium ${customer.currentBalance > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                      {formatCurrency(customer.currentBalance || 0)}
                    </p>
                    <p className="text-[10px] text-muted-foreground">Balance</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {customerList.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            {projectId ? 'No customers found' : 'Select a project from the top bar to view customers'}
          </div>
        )}
      </div>
    </div>
  );
}
