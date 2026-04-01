import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import type {
  PaginatedResponse,
  PaginationParams,
  NeedReport,
  NeedReportEvent,
  NeedStatus,
  NeedsMapEntry,
} from '@/types/api';

interface NeedFilters extends PaginationParams {
  status?: string;
  regionId?: string;
  assignedOrganisationId?: string;
  tagId?: string;
}

function buildQuery(params: object) {
  const searchParams = new URLSearchParams();
  Object.entries(params as Record<string, unknown>).forEach(([key, value]) => {
    if (value !== undefined) searchParams.set(key, String(value));
  });
  const q = searchParams.toString();
  return q ? `?${q}` : '';
}

// Admin
export function useAdminNeeds(params: NeedFilters = {}) {
  return useQuery({
    queryKey: ['admin', 'needs', params],
    queryFn: () => apiClient<PaginatedResponse<NeedReport>>(`/admin/needs${buildQuery(params)}`),
  });
}

export function useAdminNeed(id: string) {
  return useQuery({
    queryKey: ['admin', 'needs', id],
    queryFn: () => apiClient<NeedReport>(`/admin/needs/${id}`),
    enabled: !!id,
  });
}

export function useUpdateNeed() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; title?: string; status?: NeedStatus; assignedOrganisationId?: string | null; tagIds?: string[] }) =>
      apiClient<NeedReport>(`/admin/needs/${id}`, { method: 'PATCH', body: data }),
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: ['admin', 'needs'] });
      qc.invalidateQueries({ queryKey: ['admin', 'needs', v.id] });
      qc.invalidateQueries({ queryKey: ['admin', 'needs', v.id, 'events'] });
    },
  });
}

export function useAssignNeed() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, organisationId }: { id: string; organisationId: string }) =>
      apiClient<NeedReport>(`/admin/needs/${id}/assign`, { method: 'POST', body: { organisationId } }),
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: ['admin', 'needs'] });
      qc.invalidateQueries({ queryKey: ['admin', 'needs', v.id] });
      qc.invalidateQueries({ queryKey: ['admin', 'needs', v.id, 'events'] });
    },
  });
}

export function useDeleteNeed() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient(`/admin/needs/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'needs'] }),
  });
}

export function useAdminNeedsMap() {
  return useQuery({
    queryKey: ['admin', 'needs', 'map'],
    queryFn: () => apiClient<NeedsMapEntry[]>('/admin/needs/map'),
  });
}

export function useAdminNeedEvents(id: string) {
  return useQuery({
    queryKey: ['admin', 'needs', id, 'events'],
    queryFn: () => apiClient<NeedReportEvent[]>(`/admin/needs/${id}/events`),
    enabled: !!id,
  });
}

export function useAddAdminNeedComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) =>
      apiClient<{ message: string }>(`/admin/needs/${id}/comments`, { method: 'POST', body: { content } }),
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: ['admin', 'needs', v.id, 'events'] });
      qc.invalidateQueries({ queryKey: ['admin', 'needs', v.id] });
    },
  });
}

// Org-scoped
export function useOrgNeeds(params: NeedFilters = {}) {
  return useQuery({
    queryKey: ['org', 'needs', params],
    queryFn: () => apiClient<PaginatedResponse<NeedReport>>(`/org/needs${buildQuery(params)}`),
  });
}

export function useOrgNeed(id: string) {
  return useQuery({
    queryKey: ['org', 'needs', id],
    queryFn: () => apiClient<NeedReport>(`/org/needs/${id}`),
    enabled: !!id,
  });
}

export function useUpdateOrgNeed() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; title?: string; status?: NeedStatus; tagIds?: string[] }) =>
      apiClient<NeedReport>(`/org/needs/${id}`, { method: 'PATCH', body: data }),
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: ['org', 'needs'] });
      qc.invalidateQueries({ queryKey: ['org', 'needs', v.id] });
      qc.invalidateQueries({ queryKey: ['org', 'needs', v.id, 'events'] });
    },
  });
}

export function useOrgNeedsMap() {
  return useQuery({
    queryKey: ['org', 'needs', 'map'],
    queryFn: () => apiClient<NeedsMapEntry[]>('/org/needs/map'),
  });
}

export function useOrgNeedEvents(id: string) {
  return useQuery({
    queryKey: ['org', 'needs', id, 'events'],
    queryFn: () => apiClient<NeedReportEvent[]>(`/org/needs/${id}/events`),
    enabled: !!id,
  });
}

export function useAddOrgNeedComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) =>
      apiClient<{ message: string }>(`/org/needs/${id}/comments`, { method: 'POST', body: { content } }),
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: ['org', 'needs', v.id, 'events'] });
      qc.invalidateQueries({ queryKey: ['org', 'needs', v.id] });
    },
  });
}

// Public
export function useSubmitNeed() {
  return useMutation({
    mutationFn: (data: { description: string; fullName: string; contactMethod: string; contactValue: string; regionId?: string; tagIds?: string[] }) =>
      apiClient<NeedReport>('/public/needs', { method: 'POST', body: data }),
  });
}
