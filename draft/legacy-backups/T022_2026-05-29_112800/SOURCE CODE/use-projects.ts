import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';
import type { Customer, Project } from '@/lib/types';

const PROJECTS_KEY = 'projects';

export function useProjectsList() {
  return useQuery({
    queryKey: [PROJECTS_KEY],
    queryFn: () => apiGet<Project[]>('/projects'),
  });
}

export function useProjectDetail(id: string) {
  return useQuery({
    queryKey: [PROJECTS_KEY, id],
    queryFn: () => apiGet<Project>(`/projects/${id}`),
    enabled: !!id,
  });
}

export function useCustomersList() {
  return useQuery({
    queryKey: ['customers'],
    queryFn: () => apiGet<Customer[]>('/customers'),
  });
}
