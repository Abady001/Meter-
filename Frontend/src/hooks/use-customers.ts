import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/api';
import type { Customer } from '@/lib/types';

export interface CustomerApiResponse {
  id: string;
  projectId: string;
  customerCode: string;
  name: string;
  nameAr?: string;
  phone: string;
  email: string;
  customerType: string;
  nationalOrCommercialId: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomerPayload {
  customerCode: string;
  name: string;
  nameAr?: string;
  phone: string;
  email: string;
  customerType: string;
  nationalOrCommercialId: string;
}

export interface UpdateCustomerPayload {
  customerCode?: string;
  name?: string;
  nameAr?: string;
  phone?: string;
  email?: string;
  customerType?: string;
  nationalOrCommercialId?: string;
  status?: 'active' | 'inactive';
}

function mapCustomer(api: CustomerApiResponse): Customer {
  return {
    id: api.id,
    code: api.customerCode,
    name: api.name,
    nameAr: api.nameAr,
    phone: api.phone,
    email: api.email,
    nationalOrCommercialId: api.nationalOrCommercialId,
    customerType: api.customerType as Customer['customerType'],
    projectId: api.projectId,
    projectName: undefined,
    units: [],
    activeMeters: 0,
    currentBalance: 0,
    totalPaid: 0,
    status: api.status as Customer['status'],
    createdAt: api.createdAt,
    address: undefined,
  };
}

export function useCustomersList(projectId: string) {
  return useQuery({
    queryKey: ['projects', projectId, 'customers'],
    queryFn: async () => {
      const data = await apiGet<CustomerApiResponse[]>(`/projects/${projectId}/customers`);
      return data.map(mapCustomer);
    },
    enabled: !!projectId,
  });
}

export function useCustomerDetail(projectId: string, id: string) {
  return useQuery({
    queryKey: ['projects', projectId, 'customers', id],
    queryFn: async () => {
      const data = await apiGet<CustomerApiResponse>(`/projects/${projectId}/customers/${id}`);
      return mapCustomer(data);
    },
    enabled: !!projectId && !!id,
  });
}

export function useCreateCustomer(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCustomerPayload) =>
      apiPost<CustomerApiResponse>(`/projects/${projectId}/customers`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'customers'] });
    },
  });
}

export function useUpdateCustomer(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCustomerPayload }) =>
      apiPatch<CustomerApiResponse>(`/projects/${projectId}/customers/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'customers'] });
    },
  });
}

export function useDeleteCustomer(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiDelete(`/projects/${projectId}/customers/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'customers'] });
    },
  });
}
