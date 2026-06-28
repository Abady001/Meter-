'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost } from '@/lib/api';
import { PageHeader, formatCurrency, formatDate } from '@/components/shared/PageHelpers';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Search, UserCheck, FileText, CreditCard, Printer, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { useT } from '@/lib/i18n/context';
import { usePageStore } from '@/lib/router-store';

const STEPS = ['Search', 'Select', 'Details', 'Pay', 'Receipt'];
const METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'card', label: 'Card' },
  { value: 'cheque', label: 'Cheque' },
  { value: 'wallet', label: 'Wallet' },
];

export default function PaymentWizardPage() {
  const t = useT();
  const qc = useQueryClient();
  const { navigate } = usePageStore();
  const [step, setStep] = useState(0);
  const [search, setSearch] = useState({ customerType: 'postpaid', unitNo: '', meterSerial: '', nameEn: '', nameAr: '', email: '', mobile: '', phone: '' });
  const [results, setResults] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [payment, setPayment] = useState({ amount: 0, method: 'cash', paymentDate: new Date().toISOString().split('T')[0], notes: '' });
  const [receipt, setReceipt] = useState<any>(null);
  const [searching, setSearching] = useState(false);

  const { data: projects } = useQuery({ queryKey: ['projects'], queryFn: () => apiGet<any[]>('/projects').catch(() => []) });
  const projectId = typeof window !== 'undefined' ? localStorage.getItem('selected-project') || (Array.isArray(projects) && projects.length > 0 ? projects[0].id : '') : '';

  const payMutation = useMutation({
    mutationFn: () => apiPost('/billing/payments', {
      projectId, customerId: selected?.id, amount: payment.amount, paymentDate: payment.paymentDate,
      method: payment.method, notes: payment.notes || undefined, allocationMode: 'oldest_due_first',
    }),
    onSuccess: (data) => { setReceipt(data); setStep(4); qc.invalidateQueries({ queryKey: ['payments'] }); },
    onError: () => toast.error('Payment failed'),
  });

  const handleSearch = async () => {
    setSearching(true);
    try {
      const params = new URLSearchParams();
      if (search.unitNo) params.set('unitNo', search.unitNo);
      if (search.meterSerial) params.set('meterSerial', search.meterSerial);
      if (search.nameEn) params.set('name', search.nameEn);
      if (search.email) params.set('email', search.email);
      if (search.mobile) params.set('phone', search.mobile);
      const res = await apiGet<any[]>(`/customers/search?${params.toString()}`).catch(() => []);
      setResults(Array.isArray(res) ? res : []);
      if (Array.isArray(res) && res.length > 0) setStep(1);
      else toast.error('No customers found');
    } catch { toast.error('Search failed'); }
    setSearching(false);
  };

  return (
    <div>
      <PageHeader title="New Payment" subtitle="5-step payment wizard" />

      {/* Step indicator */}
      <div className="flex items-center gap-1 mb-6 bg-muted/30 rounded-lg p-1">
        {STEPS.map((s, i) => (
          <div key={i} className={`flex-1 text-center py-2 px-3 rounded-md text-sm font-medium transition-colors ${i === step ? 'bg-primary text-primary-foreground' : i < step ? 'text-primary' : 'text-muted-foreground'}`}>
            {i < step ? <CheckCircle2 className="h-4 w-4 inline mr-1" /> : <span className="inline-block w-4 h-4 rounded-full border-2 mr-1 align-middle" style={{ borderColor: i === step ? 'currentColor' : undefined }} />}
            {i + 1}. {s}
          </div>
        ))}
      </div>

      {/* Step 1: Search */}
      {step === 0 && (
        <Card>
          <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Search className="h-4 w-4" />Search Customer</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <label className="flex items-center gap-2"><input type="radio" name="custType" checked={search.customerType === 'prepaid'} onChange={() => setSearch(s => ({ ...s, customerType: 'prepaid' }))} /> Prepaid</label>
              <label className="flex items-center gap-2"><input type="radio" name="custType" checked={search.customerType === 'postpaid'} onChange={() => setSearch(s => ({ ...s, customerType: 'postpaid' }))} /> Postpaid</label>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div><label className="text-xs text-muted-foreground">Unit No.</label><Input placeholder="Unit Number" value={search.unitNo} onChange={e => setSearch(s => ({ ...s, unitNo: e.target.value }))} /></div>
              <div><label className="text-xs text-muted-foreground">Meter Serial</label><Input placeholder="Meter Serial" value={search.meterSerial} onChange={e => setSearch(s => ({ ...s, meterSerial: e.target.value }))} /></div>
              <div><label className="text-xs text-muted-foreground">Name (English)</label><Input placeholder="Name English" value={search.nameEn} onChange={e => setSearch(s => ({ ...s, nameEn: e.target.value }))} /></div>
              <div><label className="text-xs text-muted-foreground">Name (Arabic)</label><Input placeholder="Name Arabic" value={search.nameAr} onChange={e => setSearch(s => ({ ...s, nameAr: e.target.value }))} /></div>
              <div><label className="text-xs text-muted-foreground">Email</label><Input placeholder="Email" value={search.email} onChange={e => setSearch(s => ({ ...s, email: e.target.value }))} /></div>
              <div><label className="text-xs text-muted-foreground">Mobile</label><Input placeholder="Mobile" value={search.mobile} onChange={e => setSearch(s => ({ ...s, mobile: e.target.value }))} /></div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setSearch({ customerType: 'postpaid', unitNo: '', meterSerial: '', nameEn: '', nameAr: '', email: '', mobile: '', phone: '' })}>Reset</Button>
              <Button onClick={handleSearch} disabled={searching}><Search className="h-4 w-4 mr-1" />{searching ? 'Searching...' : 'Search'}</Button>
            </div>
            {results.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium">{results.length} customer(s) found</p>
                {results.map((c: any) => (
                  <div key={c.id} className={`p-3 rounded-lg border cursor-pointer transition-colors ${selected?.id === c.id ? 'border-primary bg-primary/5' : 'hover:border-border'}`} onClick={() => { setSelected(c); setStep(1); }}>
                    <div className="flex justify-between items-center">
                      <div><p className="font-medium">{c.name}</p><p className="text-xs text-muted-foreground">{c.customerCode} · {c.phone || '-'}</p></div>
                      <Button size="sm" variant={selected?.id === c.id ? 'default' : 'outline'} onClick={() => { setSelected(c); setStep(1); }}>Select</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 2: Select */}
      {step === 1 && selected && (
        <Card>
          <CardHeader><CardTitle className="text-sm flex items-center gap-2"><UserCheck className="h-4 w-4" />Selected Customer</CardTitle></CardHeader>
          <CardContent>
            <div className="p-4 rounded-lg bg-muted/20 space-y-2">
              <div className="flex justify-between"><span className="text-muted-foreground">Name</span><span className="font-medium">{selected.name}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Code</span><span>{selected.customerCode}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Phone</span><span>{selected.phone || '-'}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Email</span><span>{selected.email || '-'}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Balance</span><span className={Number(selected.currentBalance) > 0 ? 'text-red-500 font-medium' : 'text-emerald-500'}>{formatCurrency(selected.currentBalance || 0)}</span></div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button variant="outline" onClick={() => setStep(0)}><ChevronLeft className="h-4 w-4 mr-1" />Back</Button>
              <Button onClick={() => setStep(2)}>Next: Payment Details <ChevronRight className="h-4 w-4 ml-1" /></Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Details */}
      {step === 2 && (
        <Card>
          <CardHeader><CardTitle className="text-sm flex items-center gap-2"><FileText className="h-4 w-4" />Payment Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-xs text-muted-foreground">Amount (EGP)</label><Input type="number" value={payment.amount || ''} onChange={e => setPayment(p => ({ ...p, amount: parseFloat(e.target.value) || 0 }))} /></div>
              <div><label className="text-xs text-muted-foreground">Payment Date</label><Input type="date" value={payment.paymentDate} onChange={e => setPayment(p => ({ ...p, paymentDate: e.target.value }))} /></div>
              <div><label className="text-xs text-muted-foreground">Method</label>
                <Select value={payment.method} onValueChange={v => setPayment(p => ({ ...p, method: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{METHODS.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div><label className="text-xs text-muted-foreground">Notes (optional)</label><Input placeholder="Notes" value={payment.notes} onChange={e => setPayment(p => ({ ...p, notes: e.target.value }))} /></div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(1)}><ChevronLeft className="h-4 w-4 mr-1" />Back</Button>
              <Button onClick={() => payment.amount > 0 ? setStep(3) : toast.error('Enter an amount')}>Next: Confirm <ChevronRight className="h-4 w-4 ml-1" /></Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Pay */}
      {step === 3 && (
        <Card>
          <CardHeader><CardTitle className="text-sm flex items-center gap-2"><CreditCard className="h-4 w-4" />Confirm Payment</CardTitle></CardHeader>
          <CardContent>
            <div className="p-4 rounded-lg bg-muted/20 space-y-2 mb-4">
              <div className="flex justify-between"><span className="text-muted-foreground">Customer</span><span className="font-medium">{selected?.name}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Amount</span><span className="font-bold text-lg">{formatCurrency(payment.amount)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Method</span><span><StatusBadge status={payment.method} /></span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Date</span><span>{formatDate(payment.paymentDate)}</span></div>
              {payment.notes && <div className="flex justify-between"><span className="text-muted-foreground">Notes</span><span>{payment.notes}</span></div>}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(2)}><ChevronLeft className="h-4 w-4 mr-1" />Back</Button>
              <Button onClick={() => payMutation.mutate()} disabled={payMutation.isPending}>{payMutation.isPending ? 'Processing...' : 'Confirm Payment'}</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 5: Receipt */}
      {step === 4 && receipt && (
        <Card>
          <CardHeader><CardTitle className="text-sm flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" />Payment Receipt</CardTitle></CardHeader>
          <CardContent>
            <div className="text-center mb-4"><div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto"><CheckCircle2 className="h-8 w-8 text-emerald-500" /></div><p className="text-lg font-semibold mt-2">Payment Successful</p></div>
            <div className="p-4 rounded-lg bg-muted/20 space-y-2">
              <div className="flex justify-between"><span className="text-muted-foreground">Receipt #</span><span className="font-mono">{receipt.paymentNumber || receipt.id?.substring(0, 12)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Customer</span><span className="font-medium">{selected?.name}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Amount</span><span className="font-bold">{formatCurrency(receipt.amount || payment.amount)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Method</span><span><StatusBadge status={receipt.method || payment.method} /></span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Date</span><span>{formatDate(receipt.paymentDate || payment.paymentDate)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Status</span><span><StatusBadge status={receipt.status || 'confirmed'} /></span></div>
            </div>
            <div className="flex gap-2 mt-4 justify-center">
              <Button onClick={() => window.print()}><Printer className="h-4 w-4 mr-1" />Print</Button>
              <Button variant="outline" onClick={() => { setStep(0); setSelected(null); setReceipt(null); setPayment({ amount: 0, method: 'cash', paymentDate: new Date().toISOString().split('T')[0], notes: '' }); }}>New Payment</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
