'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Download, Eye, FileText, Zap, Droplets, Sun, Activity } from 'lucide-react';
import { formatCurrency, formatDate } from '@/components/shared/PageHelpers';
import { StatusBadge } from '@/components/shared/StatusBadge';
import SmartTable from '@/components/smart-table/SmartTable';
import { useT } from '@/lib/i18n/context';

// Mock customer data for portal demo
const MOCK_CUSTOMER = {
  id: 'cus-001',
  name: 'Ahmed Mohamed Ali',
  code: '30519',
  balance: 1275.50,
  outstanding: 370.50,
};
const MOCK_INVOICES = [
  { id: 'inv-1', number: 'INV-2026-000001', date: '2026-06-01', dueDate: '2026-07-01', amount: 370.50, status: 'issued', type: 'electricity' },
  { id: 'inv-2', number: 'INV-2026-000002', date: '2026-05-01', dueDate: '2026-06-01', amount: 285.00, status: 'paid', type: 'water' },
  { id: 'inv-3', number: 'INV-2026-000003', date: '2026-04-01', dueDate: '2026-05-01', amount: 420.00, status: 'paid', type: 'electricity' },
];
const MOCK_METERS = [
  { id: 'mtr-1', serial: '94246446', type: 'electricity', status: 'active', lastReading: 628.285, readingDate: '2026-06-15' },
  { id: 'mtr-2', serial: '58123904', type: 'water', status: 'active', lastReading: 492.000, readingDate: '2026-06-14' },
];

const typeIcon: Record<string, any> = { electricity: Zap, water: Droplets, solar: Sun };

export default function CustomerPortalPage() {
  const t = useT();
  const [customerId] = useState(MOCK_CUSTOMER.id);

  const invColumns = [
    { key: 'number', label: 'Invoice', sortable: true },
    { key: 'date', label: 'Date' },
    { key: 'dueDate', label: 'Due Date' },
    { key: 'amount', label: 'Amount', render: (v: number) => formatCurrency(v) },
    { key: 'status', label: 'Status', render: (v: string) => <StatusBadge status={v} /> },
    { key: 'type', label: 'Type', render: (v: string) => { const Icon = typeIcon[v] || Activity; return <div className="flex items-center gap-1"><Icon className="h-3 w-3" />{v}</div>; } },
    { key: 'actions', label: '', render: (_: any, row: any) => <Button variant="ghost" size="icon" className="h-7 w-7"><Eye className="h-3.5 w-3.5" /></Button> },
  ];

  const meterColumns = [
    { key: 'serial', label: 'Serial', sortable: true },
    { key: 'type', label: 'Type', render: (v: string) => { const Icon = typeIcon[v] || Activity; return <div className="flex items-center gap-1"><Icon className="h-3 w-3" />{v}</div>; } },
    { key: 'status', label: 'Status', render: (v: string) => <StatusBadge status={v} /> },
    { key: 'lastReading', label: 'Last Reading', render: (v: number) => v.toFixed(3) },
    { key: 'readingDate', label: 'Read Date' },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Customer Portal</h1>
          <p className="text-sm text-muted-foreground">{MOCK_CUSTOMER.name} · {MOCK_CUSTOMER.code}</p>
        </div>
        <Badge variant="outline" className="text-sm px-3 py-1">
          Balance: {formatCurrency(MOCK_CUSTOMER.balance)}
        </Badge>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Outstanding</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-red-500">{formatCurrency(MOCK_CUSTOMER.outstanding)}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Paid (YTD)</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-green-600">{formatCurrency(705)}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Active Meters</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{MOCK_METERS.length}</p></CardContent>
        </Card>
      </div>

      {/* Tabs: Invoices | Meters | Profile */}
      <Tabs defaultValue="invoices">
        <TabsList>
          <TabsTrigger value="invoices"><FileText className="h-4 w-4 mr-2" />Invoices</TabsTrigger>
          <TabsTrigger value="meters"><Activity className="h-4 w-4 mr-2" />Meters</TabsTrigger>
        </TabsList>

        <TabsContent value="invoices" className="mt-4">
          <SmartTable
            data={MOCK_INVOICES}
            columns={invColumns}
            searchable
            searchPlaceholder="Search invoices..."
            pagination
          />
        </TabsContent>

        <TabsContent value="meters" className="mt-4">
          <SmartTable
            data={MOCK_METERS}
            columns={meterColumns}
            searchable
            searchPlaceholder="Search meters..."
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
