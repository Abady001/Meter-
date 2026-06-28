'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { ArrowDown, ArrowUp, ArrowLeftRight, Wallet, History, Loader2 } from 'lucide-react';
import SmartTable from '@/components/smart-table/SmartTable';
import { formatDateTime } from '@/components/shared/PageHelpers';

interface WalletAccount {
  id: string;
  accountCode: string;
  accountName: string;
  balance: number;
  currency: string;
  status: string;
}

interface WalletTransaction {
  id: string;
  type: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  createdAt: string;
}

export default function WalletTab({ customerId, projectId }: { customerId: string; projectId: string }) {
  const qc = useQueryClient();
  const [action, setAction] = useState<'credit' | 'debit' | null>(null);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [targetWallet, setTargetWallet] = useState('');
  const [transferAmount, setTransferAmount] = useState('');

  const { data: wallet, isLoading: walletLoading } = useQuery({
    queryKey: ['wallet', customerId],
    queryFn: () => apiGet<WalletAccount>(`/wallet/${customerId}`),
    enabled: !!customerId,
  });

  const { data: history, isLoading: historyLoading } = useQuery({
    queryKey: ['wallet-history', wallet?.id],
    queryFn: () => apiGet<WalletTransaction[]>(`/wallet/${wallet!.id}/history`),
    enabled: !!wallet?.id,
  });

  const creditMutation = useMutation({
    mutationFn: (data: { amount: number; description: string }) =>
      apiPost(`/wallet/${wallet!.id}/credit`, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['wallet'] }); toast.success('Credit applied'); setAction(null); setAmount(''); setDescription(''); },
    onError: (e: any) => toast.error(e?.message || 'Credit failed'),
  });

  const debitMutation = useMutation({
    mutationFn: (data: { amount: number; description: string }) =>
      apiPost(`/wallet/${wallet!.id}/debit`, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['wallet'] }); toast.success('Debit applied'); setAction(null); setAmount(''); setDescription(''); },
    onError: (e: any) => toast.error(e?.message || 'Debit failed'),
  });

  const transferMutation = useMutation({
    mutationFn: (data: { fromWalletId: string; toWalletId: string; amount: number; description: string }) =>
      apiPost('/wallet/transfer', data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['wallet'] }); toast.success('Transfer completed'); setTargetWallet(''); setTransferAmount(''); setDescription(''); },
    onError: (e: any) => toast.error(e?.message || 'Transfer failed'),
  });

  if (walletLoading) return <div className="text-center py-8 text-muted-foreground">Loading wallet...</div>;

  return (
    <div className="space-y-6">
      {/* Balance Card */}
      <Card className="bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-200 text-sm">Current Balance</p>
              <p className="text-3xl font-bold mt-1">
                {wallet ? `${wallet.currency || 'EGP'} ${Number(wallet.balance || 0).toLocaleString()}` : 'No wallet'}
              </p>
              {wallet && (
                <p className="text-blue-200 text-xs mt-1">
                  {wallet.accountName} · {wallet.accountCode}
                </p>
              )}
            </div>
            <Wallet className="h-12 w-12 text-blue-300" />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3 flex-wrap">
        <Dialog open={action === 'credit'} onOpenChange={(o) => { setAction(o ? 'credit' : null); }}>
          <DialogTrigger asChild>
            <Button className="gap-2"><ArrowUp className="h-4 w-4" />Credit</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Credit</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Amount</Label><Input type="number" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} /></div>
              <div><Label>Description</Label><Textarea placeholder="Reason for credit..." value={description} onChange={e => setDescription(e.target.value)} /></div>
              <Button onClick={() => creditMutation.mutate({ amount: parseFloat(amount) || 0, description })} disabled={!amount || creditMutation.isPending}>
                {creditMutation.isPending ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : null}Apply Credit
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={action === 'debit'} onOpenChange={(o) => { setAction(o ? 'debit' : null); }}>
          <DialogTrigger asChild>
            <Button variant="outline" className="gap-2"><ArrowDown className="h-4 w-4" />Debit</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Apply Debit</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Amount</Label><Input type="number" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} /></div>
              <div><Label>Description</Label><Textarea placeholder="Reason for debit..." value={description} onChange={e => setDescription(e.target.value)} /></div>
              <Button onClick={() => debitMutation.mutate({ amount: parseFloat(amount) || 0, description })} disabled={!amount || debitMutation.isPending}>
                {debitMutation.isPending ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : null}Apply Debit
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="gap-2"><ArrowLeftRight className="h-4 w-4" />Transfer</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Transfer Between Wallets</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>From Wallet</Label><Input value={wallet?.accountCode || ''} disabled /></div>
              <div><Label>To Wallet ID</Label><Input placeholder="Target wallet ID" value={targetWallet} onChange={e => setTargetWallet(e.target.value)} /></div>
              <div><Label>Amount</Label><Input type="number" placeholder="0.00" value={transferAmount} onChange={e => setTransferAmount(e.target.value)} /></div>
              <div><Label>Description</Label><Textarea placeholder="Transfer reason..." value={description} onChange={e => setDescription(e.target.value)} /></div>
              <Button onClick={() => transferMutation.mutate({ fromWalletId: wallet!.id, toWalletId: targetWallet, amount: parseFloat(transferAmount) || 0, description })} disabled={!targetWallet || !transferAmount || transferMutation.isPending}>
                {transferMutation.isPending ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : null}Execute Transfer
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* History */}
      <Card>
        <CardHeader><CardTitle className="text-sm flex items-center gap-2"><History className="h-4 w-4" />Transaction History</CardTitle></CardHeader>
        <CardContent>
          <SmartTable
            data={history || []}
            columns={[
              { key: 'createdAt', label: 'Date', sortable: true, render: (v: string) => formatDateTime(v) },
              { key: 'type', label: 'Type', width: '100px', render: (v: string) => v === 'credit' ? 'Credit' : v === 'debit' ? 'Debit' : v },
              { key: 'amount', label: 'Amount', sortable: true, render: (v: number) => v.toLocaleString() },
              { key: 'balanceBefore', label: 'Before', render: (v: number) => v.toLocaleString() },
              { key: 'balanceAfter', label: 'After', render: (v: number) => v.toLocaleString() },
              { key: 'description', label: 'Description' },
            ]}
            searchPlaceholder="Search transactions..."
          />
        </CardContent>
      </Card>
    </div>
  );
}
