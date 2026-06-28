import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiPatch } from '@/lib/api';
import { toast } from 'sonner';
import type { Location } from '@/lib/types';
import type { UseMutationOptions } from '@tanstack/react-query';

export type UpdateLocationPayload = {
  name?: string;
  code?: string;
  parentId?: string | null;
  status?: 'active' | 'inactive';
};

export function useUpdateLocation(projectId: string, opts?: UseMutationOptions<Location, Error, { id: string } & UpdateLocationPayload>) {
  const queryClient = useQueryClient();

  return useMutation<Location, Error, { id: string } & UpdateLocationPayload>({
    mutationFn: ({ id, ...payload }) => apiPatch<Location>(`/projects/${projectId}/locations/${id}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'locations'] });
      toast.success('Location updated');
    },
    onError: (error) => {
      toast.error(error.message);
    },
    ...opts,
  });
}
