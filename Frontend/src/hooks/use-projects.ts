import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/api';
import { toast } from 'sonner';
import type { Project } from '@/lib/types';

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

export interface ProjectFormData {
  code: string;
  name: string;
  taxEnabled?: boolean;
  taxRate?: number;
  waterDifferenceMode?: 'billable' | 'report_only';
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ProjectFormData) => apiPost<Project>('/projects', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [PROJECTS_KEY] });
      toast.success('Project created successfully');
    },
    onError: () => {
      toast.error('Failed to create project');
    },
  });
}

export function useUpdateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ProjectFormData> }) =>
      apiPatch<Project>(`/projects/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [PROJECTS_KEY] });
      toast.success('Project updated successfully');
    },
    onError: () => {
      toast.error('Failed to update project');
    },
  });
}

export function useDeleteProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiDelete<void>(`/projects/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [PROJECTS_KEY] });
      toast.success('Project deleted');
    },
    onError: () => {
      toast.error('Failed to delete project');
    },
  });
}
