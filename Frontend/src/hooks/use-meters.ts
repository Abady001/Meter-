import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/api';
import { toast } from 'sonner';
import type { Meter } from '@/lib/types';

const METERS_KEY = 'meters';

export function useMetersList(projectId?: string) {
  return useQuery({
    queryKey: [METERS_KEY, projectId],
    queryFn: () => {
      const params: Record<string, string> = {};
      if (projectId && projectId !== '__all_projects__') params.projectId = projectId;
      const qs = new URLSearchParams(params).toString();
      return apiGet<Meter[]>(`/meters${qs ? '?' + qs : ''}`);
    },
  });
}

export function useMeterDetail(id: string) {
  return useQuery({
    queryKey: [METERS_KEY, id],
    queryFn: () => apiGet<Meter>(`/meters/${id}`),
    enabled: !!id,
  });
}

export interface MeterFormData {
  serialNumber: string;
  meterType: 'electricity' | 'water_main' | 'water_child' | 'solar' | 'gas' | 'chilled_water' | 'outdoor_unit';
  brand: string;
  model: string;
  phaseType?: string;
  ampRating?: string;
  diameter?: string;
  installationDate: string;
  activationDate: string;
  projectId: string;
}

export function useCreateMeter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: MeterFormData) => apiPost<Meter>('/meters', data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [METERS_KEY] }); toast.success('Meter created'); },
    onError: () => { toast.error('Failed to create meter'); },
  });
}

export function useUpdateMeter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<MeterFormData> }) => apiPatch<Meter>(`/meters/${id}`, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [METERS_KEY] }); toast.success('Meter updated'); },
    onError: () => { toast.error('Failed to update meter'); },
  });
}

export function useAssignMeter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { meterId: string; customerId: string; unitId: string; projectId: string; startAt: string }) =>
      apiPost<any>(`/meters/${data.meterId}/assign`, {
        customerId: data.customerId,
        unitId: data.unitId,
        projectId: data.projectId,
        startAt: data.startAt,
      }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [METERS_KEY] }); toast.success('Meter assigned successfully'); },
    onError: () => { toast.error('Failed to assign meter'); },
  });
}

export function useDeleteMeter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiDelete<void>(`/meters/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [METERS_KEY] }); toast.success('Meter deleted'); },
    onError: () => { toast.error('Failed to delete meter'); },
  });
}
