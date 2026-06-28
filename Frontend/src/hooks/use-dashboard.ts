import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';
import type { KPI, ConsumptionRecord, ActivityItem } from '@/lib/types';

interface KpiItem {
  label: string;
  value: number;
  change: number;
}

interface KpiSummaryDto {
  kpis: KpiItem[];
  meterStatusDistribution: { status: string; count: number }[];
  alertSeverityCounts: { severity: string; count: number }[];
  unpaidInvoices: number;
  outstandingBalance: number;
  collectionRate: number;
}

interface ConsumptionTrendDto {
  data: ConsumptionRecord[];
}

interface RecentActivityDto {
  items: ActivityItem[];
}

export function useDashboardKpis(projectId?: string) {
  return useQuery({
    queryKey: ['dashboard', 'kpis', projectId],
    queryFn: () => apiGet<KpiSummaryDto>(`/projects/${projectId}/dashboard/kpis`),
    enabled: !!projectId,
  });
}

export function useConsumptionTrend(projectId?: string) {
  return useQuery({
    queryKey: ['dashboard', 'consumption', projectId],
    queryFn: () => apiGet<ConsumptionTrendDto>(`/projects/${projectId}/dashboard/consumption`),
    enabled: !!projectId,
  });
}

export function useRecentActivity(projectId?: string) {
  return useQuery({
    queryKey: ['dashboard', 'activity', projectId],
    queryFn: () => apiGet<RecentActivityDto>(`/projects/${projectId}/dashboard/activity`),
    enabled: !!projectId,
  });
}
