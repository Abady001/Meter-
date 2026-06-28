import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiPost } from '@/lib/api';
import { toast } from 'sonner';
import type { Location } from '@/lib/types';
import type { UseMutationOptions } from '@tanstack/react-query';

export type CreateLocationPayload = {
  nodeType: 'zone' | 'building' | 'floor' | 'unit';
  code: string;
  name: string;
  parentId?: string;
};

export function useCreateLocation(projectId: string, opts?: UseMutationOptions<Location, Error, CreateLocationPayload>) {
  const queryClient = useQueryClient();

  return useMutation<Location, Error, CreateLocationPayload>({
    mutationFn: (payload) => apiPost<Location>(`/projects/${projectId}/locations`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'locations'] });
      toast.success('Location created');
    },
    onError: (error) => {
      toast.error(error.message);
    },
    ...opts,
  });
}
