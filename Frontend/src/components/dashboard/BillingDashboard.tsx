'use client';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';
import { usePageStore } from '@/lib/router-store';
import { StatCard, formatCurrency } from '@/components/shared/PageHelpers';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SmartTable from '@/components/smart-table/SmartTable';
import { Receipt, TrendingUp, FileText, Ban, BarChart3, Activity, Banknote, AlertTriangle } from 'lucide-react';

export default function BillingDashboard() {
  const { data: invoices } = useQuery({ queryKey: ['invoices'], queryFn: () => apiGet<any[]>('/invoices').catch(() => []) });
  const { data: payments } = useQuery({ queryKey: ['payments'], queryFn: () => apiGet<any[]>('/payments').catch(() => []) });
  const i = invoices ?? []; const p = payments ?? [];

  const draft = i.filter((x: any) => x.status === 'draft').length;
  const issued = i.filter((x: any) => x.status === 'issued' || x.status === 'final').length;
  const paid = i.filter((x: any) => x.status === 'paid').length;
  const overdue = i.filter((x: any) => x.status === 'overdue').length;
  const cancelled = i.filter((x: any) => x.status === 'cancelled').length;
  const totalAmount = i.reduce((s: number, x: any) => s + Number(x.totalAmount ?? x.total ?? 0), 0);
  const totalPaid = p.reduce((s: number, x: any) => s + Number(x.amount ?? 0), 0);

  return (
    <div>
      <div className="mb-4"><h1 className="text-2xl font-bold">Billing Dashboard</h1><p className="text-sm text-muted-foreground">Invoice generation, status, trends, utility breakdown</p></div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <StatCard label="Bills Generated" value={i.length} icon={<Receipt className="h-5 w-5" />} />
        <StatCard label="Bills Issued" value={issued} icon={<FileText className="h-5 w-5" />} />
        <StatCard label="Bills Paid" value={paid} icon={<Banknote className="h-5 w-5" />} color="text-emerald-500" />
        <StatCard label="Bills Overdue" value={overdue} icon={<AlertTriangle className="h-5 w-5" />} color={overdue > 0 ? 'text-red-500' : ''} />
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <Card className="glass-card border-border/50">
          <CardHeader><CardTitle className="text-sm">Invoice Status Distribution</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[
                { label: 'Draft', count: draft, color: 'text-gray-500' },
                { label: 'Issued', count: issued, color: 'text-blue-500' },
                { label: 'Paid', count: paid, color: 'text-emerald-500' },
                { label: 'Overdue', count: overdue, color: 'text-red-500' },
                { label: 'Cancelled', count: cancelled, color: 'text-muted-foreground' },
              ].map((item) => {
                const pct = i.length > 0 ? ((item.count / i.length) * 100).toFixed(0) : '0';
                return (
                  <div key={item.label} className="flex items-center gap-2">
                    <div className={'w-2 h-2 rounded-full ' + item.color.replace('text-', 'bg-')} />
                    <span className="text-sm flex-1">{item.label}</span>
                    <span className="text-sm font-bold">{item.count}</span>
                    <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                      <div className={'h-full rounded-full ' + item.color.replace('text-', 'bg-')} style={{ width: pct + '%' }} />
                    </div>
                    <span className="text-xs text-muted-foreground w-8 text-right">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card border-border/50">
          <CardHeader><CardTitle className="text-sm">Revenue Summary</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between p-2 rounded bg-muted/20"><span className="text-sm">Total Invoiced</span><span className="font-bold">{formatCurrency(totalAmount)}</span></div>
              <div className="flex justify-between p-2 rounded bg-muted/20"><span className="text-sm">Total Collected</span><span className="font-bold text-emerald-500">{formatCurrency(totalPaid)}</span></div>
              <div className="flex justify-between p-2 rounded bg-muted/20"><span className="text-sm">Outstanding</span><span className="font-bold text-red-500">{formatCurrency(totalAmount - totalPaid)}</span></div>
              <div className="flex justify-between p-2 rounded bg-muted/20"><span className="text-sm">Collection Rate</span><span className="font-bold">{totalAmount > 0 ? ((totalPaid / totalAmount) * 100).toFixed(1) : '0'}%</span></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card border-border/50">
        <CardHeader><CardTitle className="text-sm">All Invoices</CardTitle></CardHeader>
        <CardContent>
          <SmartTable data={i} columns={[
            { key: 'invoiceNumber', label: 'Number', sortable: true },
            { key: 'status', label: 'Status', render: (v: string) => <StatusBadge status={v} /> },
            { key: 'totalAmount', label: 'Total', render: (v: number) => formatCurrency(v ?? 0) },
            { key: 'issueDate', label: 'Date', render: (v: string) => v ? new Date(v).toLocaleDateString() : '-' },
          ]} searchable />
        </CardContent>
      </Card>
    </div>
  );
}

