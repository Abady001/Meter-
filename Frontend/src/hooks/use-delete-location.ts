import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiDelete } from '@/lib/api';
import { toast } from 'sonner';
import type { UseMutationOptions } from '@tanstack/react-query';

export function useDeleteLocation(projectId: string, opts?: UseMutationOptions<void, Error, string>) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (id) => apiDelete<void>(`/projects/${projectId}/locations/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'locations'] });
      toast.success('Location deactivated');
    },
    onError: (error) => {
      toast.error(error.message);
    },
    ...opts,
  });
}
