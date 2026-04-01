import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import type { PaginatedResponse, PaginationParams, Service } from '@/types/api';

interface ServiceFilters extends PaginationParams {
  organisationId?: string;
  regionId?: string;
  topicId?: string;
  isAvailable?: boolean;
}

function buildQuery(params: object) {
  const searchParams = new URLSearchParams();
  Object.entries(params as Record<string, unknown>).forEach(([key, value]) => {
    if (value !== undefined) searchParams.set(key, String(value));
  });
  const q = searchParams.toString();
  return q ? `?${q}` : '';
}

function normalizeService(service: Service): Service {
  const targetGroupFromRelation =
    service.targetGroups?.map((entry) => entry.targetGroup?.name).filter(Boolean) ?? [];
  return {
    ...service,
    targetGroup: service.targetGroup?.length ? service.targetGroup : targetGroupFromRelation,
  };
}

function normalizeServicePage(response: PaginatedResponse<Service>): PaginatedResponse<Service> {
  return {
    ...response,
    data: response.data.map(normalizeService),
  };
}

// Admin
export function useAdminServices(params: ServiceFilters = {}) {
  return useQuery({
    queryKey: ['admin', 'services', params],
    queryFn: async () => normalizeServicePage(await apiClient<PaginatedResponse<Service>>(`/admin/services${buildQuery(params)}`)),
  });
}

export function useAdminService(id: string) {
  return useQuery({
    queryKey: ['admin', 'services', id],
    queryFn: async () => normalizeService(await apiClient<Service>(`/admin/services/${id}`)),
    enabled: !!id,
  });
}

export function useCreateService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Service> & { topicIds?: string[] }) =>
      apiClient<Service>('/admin/services', { method: 'POST', body: data }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'services'] }),
  });
}

export function useUpdateService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Partial<Service> & { topicIds?: string[] }) =>
      apiClient<Service>(`/admin/services/${id}`, { method: 'PATCH', body: data }),
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: ['admin', 'services'] });
      qc.invalidateQueries({ queryKey: ['admin', 'services', v.id] });
    },
  });
}

export function useDeleteService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient(`/admin/services/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'services'] }),
  });
}

// Org-scoped
export function useOrgServices(params: PaginationParams = {}) {
  return useQuery({
    queryKey: ['org', 'services', params],
    queryFn: async () => normalizeServicePage(await apiClient<PaginatedResponse<Service>>(`/org/services${buildQuery(params)}`)),
  });
}

export function useOrgService(id: string) {
  return useQuery({
    queryKey: ['org', 'services', id],
    queryFn: async () => normalizeService(await apiClient<Service>(`/org/services/${id}`)),
    enabled: !!id,
  });
}

export function useCreateOrgService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Partial<Service>, 'organisationId'> & { topicIds?: string[] }) =>
      apiClient<Service>('/org/services', { method: 'POST', body: data }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['org', 'services'] }),
  });
}

export function useUpdateOrgService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Partial<Service> & { topicIds?: string[] }) =>
      apiClient<Service>(`/org/services/${id}`, { method: 'PATCH', body: data }),
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: ['org', 'services'] });
      qc.invalidateQueries({ queryKey: ['org', 'services', v.id] });
    },
  });
}

// Public
export function usePublicServices(params: ServiceFilters = {}) {
  return useQuery({
    queryKey: ['public', 'services', params],
    queryFn: async () => normalizeServicePage(await apiClient<PaginatedResponse<Service>>(`/public/services${buildQuery(params)}`)),
  });
}

export function usePublicService(id: string) {
  return useQuery({
    queryKey: ['public', 'services', id],
    queryFn: async () => normalizeService(await apiClient<Service>(`/public/services/${id}`)),
    enabled: !!id,
  });
}

export function usePublicRegions() {
  return useQuery({
    queryKey: ['public', 'regions'],
    queryFn: () => apiClient<{ id: string; name: string; slug: string; svgPathId: string }[]>('/public/regions'),
  });
}

export function usePublicRegionServiceCounts() {
  return useQuery({
    queryKey: ['public', 'regions', 'service-counts'],
    queryFn: () => apiClient<Record<string, number>>('/public/regions/service-counts'),
  });
}

export function usePublicTopics() {
  return useQuery({
    queryKey: ['public', 'topics'],
    queryFn: () => apiClient<{ id: string; name: string; slug: string }[]>('/public/topics'),
  });
}
