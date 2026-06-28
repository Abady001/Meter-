'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { usePageStore } from '@/lib/router-store';
import { apiPost } from '@/lib/api';
import { toast } from 'sonner';
import { AlertTriangle, ArrowRight, CheckCircle2, Loader2, Search, UserX } from 'lucide-react';

interface TransferResult {
  customerId: string;
  newCustomerId: string;
  transferredRecords: Record<string, number>;
  skippedRecords: Record<string, number>;
  timestamp: string;
}

export default function OwnershipTab({ customer, projectId }: { customer: any; projectId: string }) {
  const { navigate } = usePageStore();
  const [step, setStep] = useState<'select' | 'preview' | 'confirm' | 'done'>('select');
  const [searchTerm, setSearchTerm] = useState('');
  const [newTargetId, setNewTargetId] = useState('');
  const [targetCustomer, setTargetCustomer] = useState<any>(null);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TransferResult | null>(null);

  const searchCustomer = async () => {
    if (!searchTerm.trim()) return;
    setLoading(true);
    try {
      const data = await apiPost('/admin/query', {
        query: `SELECT id, customer_code, name, name_ar, phone FROM sim_system.customers WHERE project_id = '${projectId}' AND (customer_code ILIKE '%${searchTerm}%' OR name ILIKE '%${searchTerm}%' OR phone ILIKE '%${searchTerm}%') LIMIT 10`
      });
      setTargetCustomer(data.rows?.[0] || null);
      if (data.rows?.[0]) setNewTargetId(data.rows[0].id);
      setLoading(false);
    } catch {
      setLoading(false);
      toast.error('Search failed');
    }
  };

  const executeTransfer = async () => {
    if (!newTargetId || !reason.trim()) { toast.error('Select target customer and provide a reason'); return; }
    setLoading(true);
    try {
      const res = await apiPost<TransferResult>(`/projects/${projectId}/customers/${customer.id}/transfer-ownership`, {
        newCustomerId: newTargetId,
        reason
      });
      setResult(res);
      setStep('done');
      toast.success('Ownership transferred successfully');
    } catch (e: any) {
      toast.error(e?.message || 'Transfer failed');
    }
    setLoading(false);
  };

  if (step === 'done' && result) {
    return (
      <div className="space-y-6">
        <Card className="border-emerald-200 bg-emerald-50/50">
          <CardContent className="pt-6 text-center">
            <CheckCircle2 className="h-12 w-12 text-emerald-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-emerald-800">Ownership Transfer Complete</h3>
            <p className="text-sm text-emerald-600 mt-1">Transferred at {new Date(result.timestamp).toLocaleString()}</p>
          </CardContent>
        </Card>
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">Transferred Records</CardTitle></CardHeader>
            <CardContent className="text-sm space-y-1">
              {Object.entries(result.transferredRecords).filter(([,v]) => v > 0).map(([k, v]) => (
                <div key={k} className="flex justify-between"><span className="capitalize">{k.replace(/([A-Z])/g, ' $1').trim()}</span><span className="font-mono">{v}</span></div>
              ))}
              {Object.values(result.transferredRecords).every(v => v === 0) && <p className="text-muted-foreground">No records transferred</p>}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-sm">Skipped Records</CardTitle></CardHeader>
            <CardContent className="text-sm space-y-1">
              {Object.entries(result.skippedRecords).filter(([,v]) => v > 0).map(([k, v]) => (
                <div key={k} className="flex justify-between"><span className="capitalize">{k.replace(/([A-Z])/g, ' $1').trim()}</span><span className="font-mono">{v}</span></div>
              ))}
              {Object.values(result.skippedRecords).every(v => v === 0) && <p className="text-muted-foreground">No records skipped</p>}
            </CardContent>
          </Card>
        </div>
        <Button variant="outline" onClick={() => { setStep('select'); setResult(null); setTargetCustomer(null); }}>
          Transfer Another
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Step indicator */}
      <div className="flex items-center gap-2 text-sm">
        {['select', 'preview', 'confirm'].map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${step === s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{i + 1}</div>
            <span className={step === s ? 'font-medium' : 'text-muted-foreground'}>{s === 'select' ? 'Select New Owner' : s === 'preview' ? 'Review' : 'Confirm'}</span>
            {i < 2 && <ArrowRight className="h-3 w-3 text-muted-foreground" />}
          </div>
        ))}
      </div>

      <Card className="border-amber-200 bg-amber-50/50">
        <CardContent className="pt-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
          <div className="text-sm text-amber-800">
            <p className="font-medium">Transferring ownership from <strong>{customer.name}</strong> ({customer.code})</p>
            <p className="mt-1">This will move all meters, invoices, payments, ledger entries, and wallet accounts to the new owner. Paid invoices will be skipped. The current customer will be deactivated.</p>
          </div>
        </CardContent>
      </Card>

      {step === 'select' && (
        <Card>
          <CardHeader><CardTitle className="text-sm">Select Target Customer</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input placeholder="Search by name, code, or phone..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} onKeyDown={e => e.key === 'Enter' && searchCustomer()} />
              <Button onClick={searchCustomer} disabled={loading}><Search className="h-4 w-4 mr-1" />Search</Button>
            </div>
            {targetCustomer && (
              <div className="p-3 border rounded-lg bg-muted/30">
                <p className="font-medium">{targetCustomer.name} {targetCustomer.name_ar ? `(${targetCustomer.name_ar})` : ''}</p>
                <p className="text-xs text-muted-foreground">Code: {targetCustomer.customer_code} · Phone: {targetCustomer.phone}</p>
              </div>
            )}
            {!targetCustomer && <p className="text-sm text-muted-foreground">Search for the customer who will receive ownership</p>}
          </CardContent>
        </Card>
      )}

      {step === 'preview' && targetCustomer && (
        <Card>
          <CardHeader><CardTitle className="text-sm">Transfer Preview</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between p-2 bg-muted/30 rounded"><span>From</span><span className="font-medium">{customer.name} ({customer.code})</span></div>
            <div className="flex justify-between p-2 bg-muted/30 rounded"><span>To</span><span className="font-medium">{targetCustomer.name} ({targetCustomer.customer_code})</span></div>
            <div>
              <Label>Reason for Transfer</Label>
              <Textarea className="mt-1" placeholder="Enter reason for ownership transfer..." value={reason} onChange={e => setReason(e.target.value)} rows={3} />
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-3">
        {step === 'select' && targetCustomer && <Button onClick={() => setStep('preview')}>Continue to Review <ArrowRight className="h-4 w-4 ml-1" /></Button>}
        {step === 'preview' && (
          <>
            <Button variant="outline" onClick={() => setStep('select')}>Back</Button>
            <Button onClick={() => setStep('confirm')} disabled={!reason.trim()}>Confirm Transfer</Button>
          </>
        )}
        {step === 'confirm' && (
          <div className="space-y-3 w-full">
            <Card className="border-red-200 bg-red-50/50">
              <CardContent className="pt-4 flex items-start gap-3">
                <UserX className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
                <div className="text-sm text-red-800">
                  <p className="font-medium">Final confirmation required</p>
                  <p className="mt-1">This action cannot be undone. All active records will be transferred and the current customer will be deactivated.</p>
                </div>
              </CardContent>
            </Card>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep('preview')}>Cancel</Button>
              <Button variant="destructive" onClick={executeTransfer} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : null}
                Execute Transfer
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
