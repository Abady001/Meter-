import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost } from '@/lib/api';
import type { Invoice } from '@/lib/types';
import { mockCustomers, mockMeters, mockProjects } from '@/lib/mock-data';

interface ApiInvoiceLine {
  id: string;
  invoiceId: string;
  readingId: string | null;
  description: string;
  quantity: number;
  unitPrice: number;
  lineAmount: number;
}

interface ApiInvoice {
  id: string;
  invoiceNumber: string;
  projectId: string;
  customerId: string;
  unitId: string;
  meterId: string;
  utilityType: string;
  billingPeriodId: string;
  status: string;
  subtotalAmount: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  issuedAt: string | null;
  dueAt: string | null;
  createdAt: string;
  updatedAt: string;
  lines: ApiInvoiceLine[];
}

function mapInvoice(api: ApiInvoice): Invoice {
  const customer = mockCustomers.find((c) => c.id === api.customerId);
  const project = mockProjects.find((p) => p.id === api.projectId);
  const meter = mockMeters.find((m) => m.id === api.meterId);
  const shortId = (id: string) => id.length > 20 ? id.substring(0, 8) + '...' : id;
  return {
    id: api.id,
    invoiceNumber: api.invoiceNumber,
    customerId: api.customerId,
    customerName: customer?.name ?? 'Customer ' + shortId(api.customerId),
    projectId: api.projectId,
    projectName: project?.name ?? 'Project ' + shortId(api.projectId),
    unitId: api.unitId === 'system' ? undefined : api.unitId,
    unitNumber: undefined,
    meterSerial: meter?.serialNumber ?? api.meterId,
    meterType: api.utilityType === 'electricity' ? 'electricity' : api.utilityType === 'water' ? 'water_main' : 'water_child',
    billingPeriodStart: api.createdAt,
    billingPeriodEnd: api.issuedAt ?? api.createdAt,
    consumption: api.lines.reduce((s, l) => s + l.quantity, 0),
    tariff: api.lines.length > 0 ? api.lines[0].unitPrice : 0,
    subtotal: api.subtotalAmount,
    tax: api.taxAmount,
    total: api.totalAmount,
    paidAmount: api.paidAmount,
    remainingAmount: api.remainingAmount,
    invoiceDate: api.issuedAt ?? api.createdAt,
    dueDate: api.dueAt ?? api.createdAt,
    status: api.status as Invoice['status'],
    createdAt: api.createdAt,
  };
}

export function useInvoicesList(projectId?: string, customerId?: string, status?: string) {
  return useQuery({
    queryKey: ['invoices', projectId, customerId, status],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (projectId) params.set('projectId', projectId);
      if (customerId) params.set('customerId', customerId);
      if (status) params.set('status', status);
      const qs = params.toString();
      const data = await apiGet<ApiInvoice[]>(`/billing/invoices${qs ? '?' + qs : ''}`);
      return data.map(mapInvoice);
    },
    staleTime: 30_000,
  });
}

export function useIssueInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiPost<{ status: string }>(`/billing/invoices/${id}/issue`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
}

export function useInvoiceDetail(id: string) {
  return useQuery({
    queryKey: ['invoice', id],
    queryFn: async () => {
      const data = await apiGet<ApiInvoice>(`/billing/invoices/${id}`);
      return mapInvoice(data);
    },
    enabled: !!id,
    staleTime: 30_000,
  });
}
