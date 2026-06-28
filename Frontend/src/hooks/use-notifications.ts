import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPatch, apiDelete } from '@/lib/api';

const NOTIF_KEY = 'notifications';

export function useNotifications(page = 1, limit = 50) {
  return useQuery({
    queryKey: [NOTIF_KEY, 'list', page, limit],
    queryFn: () => apiGet<any>(`/notifications?page=${page}&limit=${limit}`),
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: [NOTIF_KEY, 'unread'],
    queryFn: () => apiGet<{ count: number }>('/notifications/unread-count'),
    refetchInterval: 30000,
  });
}

export function useMarkRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiPatch<any>(`/notifications/${id}/read`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [NOTIF_KEY] }); },
  });
}

export function useMarkAllRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => apiPatch<any>('/notifications/read-all'),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [NOTIF_KEY] }); },
  });
}

export function useDeleteNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiDelete<any>(`/notifications/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [NOTIF_KEY] }); },
  });
}
