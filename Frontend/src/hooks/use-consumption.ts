import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api/client';
import type { ApiResponse } from '@/lib/api/client';

export interface ConsumptionTrend {
  period: string;
  electricity: number;
  water: number;
}

export function useConsumptionTrend(projectId?: string) {
  return useQuery({
    queryKey: ['consumption', 'trend', projectId],
    queryFn: async (): Promise<ConsumptionTrend[]> => {
      const res = await apiGet<ApiResponse<ConsumptionTrend[]>>(
        `/projects/${projectId}/dashboard/consumption`
      );
      return res.data ?? [];
    },
    enabled: !!projectId,
    staleTime: 30_000,
  });
}
