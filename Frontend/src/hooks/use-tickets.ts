import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';

export function useTicketsList() {
  return useQuery({
    queryKey: ['tickets'],
    queryFn: () => apiGet<any[]>('/tickets'),
  });
}
