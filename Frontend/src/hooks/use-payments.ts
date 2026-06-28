import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost } from '@/lib/api';
import { toast } from 'sonner';
import type { Payment, PaymentStatus, PaymentMethod } from '@/lib/types';

interface ApiPaymentAllocation {
  id: string;
  paymentId: string;
  invoiceId: string;
  allocatedAmount: number;
  allocationOrder: number;
}

interface ApiPayment {
  id: string;
  paymentNumber: string;
  projectId: string;
  customerId: string;
  amount: number;
  paymentDate: string;
  method: string;
  status: string;
  collectedBy: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  allocations: ApiPaymentAllocation[];
}

function mapPayment(api: ApiPayment): Payment {
  return {
    id: api.id,
    paymentNumber: api.paymentNumber,
    customerId: api.customerId,
    customerName: api.customerId,
    invoiceId: api.allocations[0]?.invoiceId ?? '',
    invoiceNumber: '',
    paymentDate: api.paymentDate,
    method: api.method as PaymentMethod,
    amount: api.amount,
    collectedBy: api.collectedBy,
    status: api.status as PaymentStatus,
    notes: api.notes ?? undefined,
    createdAt: api.createdAt,
  };
}

export function usePaymentsList(projectId?: string, customerId?: string) {
  return useQuery({
    queryKey: ['payments', projectId, customerId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (projectId) params.set('projectId', projectId);
      if (customerId) params.set('customerId', customerId);
      const qs = params.toString();
      const data = await apiGet<ApiPayment[]>(`/payments${qs ? '?' + qs : ''}`);
      return data.map(mapPayment);
    },
    staleTime: 30_000,
  });
}

export interface PaymentFormData {
  projectId: string;
  customerId: string;
  amount: number;
  paymentDate: string;
  method: string;
  notes?: string;
}

export function useCreatePayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: PaymentFormData) => apiPost<any>('/payments', data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['payments'] }); toast.success('Payment recorded'); },
    onError: () => { toast.error('Failed to record payment'); },
  });
}

export function usePaymentDetail(id: string) {
  return useQuery({
    queryKey: ['payment', id],
    queryFn: async () => {
      const data = await apiGet<ApiPayment>(`/payments/${id}`);
      return mapPayment(data);
    },
    enabled: !!id,
    staleTime: 30_000,
  });
}
