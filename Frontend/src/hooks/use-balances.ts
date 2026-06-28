import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';

export interface StatementEntry {
  id: string;
  entryType: string;
  referenceType: string;
  referenceId: string;
  amountDelta: number;
  runningBalance: number;
  entryAt: string;
}

export interface CustomerStatement {
  customerId: string;
  projectId: string;
  entries: StatementEntry[];
  summary: {
    totalEntries: number;
    totalDebit: number;
    totalCredit: number;
    currentBalance: number;
  };
}

export function useCustomerStatement(projectId: string, customerId: string, from?: string, to?: string) {
  return useQuery({
    queryKey: ['customer-statement', projectId, customerId, from, to],
    queryFn: () => {
      const params = new URLSearchParams();
      if (from) params.set('from', from);
      if (to) params.set('to', to);
      const qs = params.toString();
      return apiGet<CustomerStatement>(`/projects/${projectId}/customers/${customerId}/statement${qs ? '?' + qs : ''}`);
    },
    enabled: !!projectId && !!customerId,
  });
}
