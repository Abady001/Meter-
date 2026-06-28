'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PageHeader } from '@/components/shared/PageHelpers';
import { toast } from 'sonner';
import { FileText, Download, Eye, Filter, Loader2 } from 'lucide-react';
import { useT } from '@/lib/i18n/context';
import SmartTable from '@/components/smart-table/SmartTable';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const REPORT_TYPES = [
  { id: 'invoices-summary', name: 'Invoices Summary', category: 'Financial', description: 'Summary of all invoices with totals and collection rates' },
  { id: 'payments', name: 'Payments Report', category: 'Financial', description: 'All payments with methods and amounts' },
  { id: 'customer-statement', name: 'Customer Statement', category: 'Customer', description: 'Full customer statement with running balance' },
  { id: 'monthly-consumption', name: 'Monthly Consumption', category: 'Operations', description: 'Monthly consumption trends' },
  { id: 'monthly-finance', name: 'Monthly Finance', category: 'Financial', description: 'Monthly invoicing and payment summary' },
  { id: 'meters-status', name: 'Meters Status', category: 'Operations', description: 'All meters by type and status' },
  { id: 'active-tariffs', name: 'Active Tariffs', category: 'Billing', description: 'Currently active tariff plans' },
  { id: 'aging', name: 'Aging Report', category: 'Financial', description: 'Overdue invoices by aging buckets' },
  { id: 'canceled-invoices', name: 'Canceled Invoices', category: 'Financial', description: 'Cancelled/voided invoices' },
  { id: 'audit-log', name: 'Audit Log', category: 'System', description: 'System audit trail' },
  { id: 'water-balance', name: 'Water Balance', category: 'Utilities', description: 'Water meter readings and balance analysis' },
  { id: 'solar-generation', name: 'Solar Generation', category: 'Utilities', description: 'Solar meter generation totals' },
  { id: 'solar-export-import', name: 'Solar Export/Import', category: 'Utilities', description: 'Solar export/import meter tracking' },
  { id: 'wallet-transactions', name: 'Wallet Transactions', category: 'Financial', description: 'All wallet transactions with balances' },
  { id: 'wallet-balance', name: 'Wallet Balances', category: 'Financial', description: 'All wallet accounts and current balances' },
  { id: 'bill-cycle-summary', name: 'Bill Cycle Summary', category: 'Billing', description: 'Billing cycle status summary' },
  { id: 'bill-cycle-audit', name: 'Bill Cycle Audit', category: 'Billing', description: 'Bill cycle audit trail' },
  { id: 'reading-register', name: 'Reading Register', category: 'Operations', description: 'Meter readings register' },
  { id: 'reading-history', name: 'Reading History', category: 'Operations', description: 'Reading history for a specific meter' },
  { id: 'customer-list', name: 'Customer List', category: 'Customer', description: 'Detailed customer list with contact info' },
  { id: 'customer-aging', name: 'Customer Aging', category: 'Customer', description: 'Outstanding invoices grouped by customer with aging buckets' },
  { id: 'charge-analysis', name: 'Charge Analysis', category: 'Financial', description: 'Invoice line items grouped by charge type' },
  { id: 'meter-lifecycle', name: 'Meter Lifecycle', category: 'Operations', description: 'All meters with installation, activation, termination dates' },
  { id: 'user-activity', name: 'User Activity', category: 'System', description: 'Audit log of user actions across the platform' },
  { id: 'failed-payments', name: 'Failed Payments', category: 'Financial', description: 'Payments with failed or cancelled status' },
  { id: 'high-consumption', name: 'High Consumption', category: 'Utilities', description: 'Highest consumption readings' },
  { id: 'zero-consumption', name: 'Zero Consumption', category: 'Utilities', description: 'Readings with zero consumption' },
  { id: 'new-connections', name: 'New Connections', category: 'Operations', description: 'Recently assigned meters' },
  { id: 'disconnections', name: 'Disconnections', category: 'Operations', description: 'Terminated or retired meters' },
  { id: 'suspended-accounts', name: 'Suspended Accounts', category: 'Customer', description: 'Inactive customers' },
  { id: 'collection-efficiency', name: 'Collection Efficiency', category: 'Financial', description: 'Overall collection rate and totals' },
  { id: 'payment-distribution', name: 'Payment Distribution', category: 'Financial', description: 'Payments grouped by payment method' },
  { id: 'wallet-usage', name: 'Wallet Usage', category: 'Financial', description: 'Top wallet accounts by balance' },
  { id: 'solar-adoption', name: 'Solar Adoption', category: 'Utilities', description: 'Solar meter and wallet adoption rates' },
  { id: 'meter-health', name: 'Meter Health', category: 'Operations', description: 'Meter status distribution and health percentage' },
  { id: 'system-config', name: 'System Config', category: 'System', description: 'System configuration settings' },
  { id: 'tax-summary', name: 'Tax Summary', category: 'Financial', description: 'Tax amounts across all invoices' },
  { id: 'discount-summary', name: 'Discount Summary', category: 'Financial', description: 'Credit adjustments and discounts applied' },
  { id: 'bill-cycle-detail', name: 'Bill Cycle Detail', category: 'Billing', description: 'Detailed bill cycle information with invoice counts' },
  { id: 'late-fee-summary', name: 'Late Fee Summary', category: 'Financial', description: 'Late fee tracking' },
  { id: 'customer-history', name: 'Customer History', category: 'Customer', description: 'Customer audit trail from audit log' },
  { id: 'reading-anomalies', name: 'Reading Anomalies', category: 'Operations', description: 'Suspicious or pending review readings' },
  { id: 'tariff-comparison', name: 'Tariff Comparison', category: 'Billing', description: 'Active tariff plans by meter type' },
  { id: 'settlement-summary', name: 'Settlement Summary', category: 'Billing', description: 'Settlement periods and statuses' },
];

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export default function ReportsPage() {
  const t = useT();
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<any>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const categories = ['all', ...new Set(REPORT_TYPES.map(r => r.category))];
  const filtered = activeCategory === 'all' ? REPORT_TYPES : REPORT_TYPES.filter(r => r.category === activeCategory);

  const getAuthHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('mp-auth-token') : null;
    return token ? { Authorization: 'Bearer ' + token } : {};
  };

  const handlePreview = async (reportId: string) => {
    setLoading(reportId);
    try {
      const res = await fetch(`${API_URL}/reports/generate/${reportId}`, { headers: getAuthHeaders() });
      const data = await res.json();
      if (data.error) { toast.error(data.error); return; }
      setPreviewData(data);
      setPreviewOpen(true);
    } catch { toast.error('Failed to load report'); }
    setLoading(null);
  };

  const handleExport = async (reportId: string, format: 'json' | 'csv') => {
    setLoading(reportId + '-' + format);
    try {
      const res = await fetch(`${API_URL}/reports/generate/${reportId}`, { headers: getAuthHeaders() });
      const data = await res.json();
      if (data.error) { toast.error(data.error); return; }

      if (format === 'csv') {
        // Find the data array
        const dataArr = data.invoices || data.payments || data.entries || data.monthly || data.meters || data.tariffs || data.buckets || data.logs || data.summary ? [data.summary] : [];
        const actualData = data.invoices || data.payments || data.entries || data.monthly || data.meters || data.tariffs || data.logs || dataArr;
        if (!Array.isArray(actualData) || actualData.length === 0) { toast.error('No data to export'); setLoading(null); return; }
        const headers = Object.keys(actualData[0]);
        const csv = [headers.join(','), ...actualData.map((r: any) => headers.map(h => String(r[h] ?? '').replace(/,/g, ' ')).join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = reportId + '.csv'; a.click();
        toast.success('CSV downloaded');
      } else {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = reportId + '.json'; a.click();
        toast.success('JSON downloaded');
      }
    } catch { toast.error('Export failed'); }
    setLoading(null);
  };

  return (
    <div>
      <PageHeader title={t('reports.title')} subtitle={t('reports.subtitle')} />
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <Button key={cat} variant={activeCategory === cat ? 'default' : 'outline'} size="sm" onClick={() => setActiveCategory(cat)} className="capitalize">{cat}</Button>
        ))}
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((report) => (
          <Card key={report.id} className="border-border/50 hover:border-primary/30 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <CardTitle className="text-sm">{report.name}</CardTitle>
                </div>
              </div>
              <CardDescription className="text-xs">{report.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => handlePreview(report.id)} disabled={loading === report.id}>
                  {loading === report.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Eye className="h-3 w-3" />} Preview
                </Button>
                <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => handleExport(report.id, 'csv')} disabled={loading === report.id + '-csv'}>
                  <Download className="h-3 w-3" /> CSV
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Report Preview</DialogTitle></DialogHeader>
          {previewData && (
            <div className="space-y-4">
              {previewData.summary && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Object.entries(previewData.summary).map(([k, v]) => (
                    <div key={k} className="p-3 rounded-lg bg-muted/30"><span className="text-xs text-muted-foreground block">{k}</span><span className="text-sm font-semibold">{String(v ?? '')}</span></div>
                  ))}
                </div>
              )}
              {previewData.invoices && <SmartTable data={previewData.invoices} columns={Object.keys(previewData.invoices[0] || {}).slice(0, 8).map(k => ({ key: k, label: k }))} />}
              {previewData.payments && <SmartTable data={previewData.payments} columns={Object.keys(previewData.payments[0] || {}).slice(0, 8).map(k => ({ key: k, label: k }))} />}
              {previewData.entries && <SmartTable data={previewData.entries} columns={Object.keys(previewData.entries[0] || {}).slice(0, 8).map(k => ({ key: k, label: k }))} />}
              {previewData.monthly && <SmartTable data={previewData.monthly} columns={Object.keys(previewData.monthly[0] || {}).slice(0, 8).map(k => ({ key: k, label: k }))} />}
              {previewData.meters && <SmartTable data={previewData.meters} columns={Object.keys(previewData.meters[0] || {}).slice(0, 8).map(k => ({ key: k, label: k }))} />}
              {previewData.tariffs && <SmartTable data={previewData.tariffs} columns={Object.keys(previewData.tariffs[0] || {}).slice(0, 8).map(k => ({ key: k, label: k }))} />}
              {previewData.buckets && <SmartTable data={[previewData.buckets]} columns={Object.keys(previewData.buckets).map(k => ({ key: k, label: k }))} />}
              {previewData.logs && <SmartTable data={previewData.logs} columns={Object.keys(previewData.logs[0] || {}).slice(0, 8).map(k => ({ key: k, label: k }))} />}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
