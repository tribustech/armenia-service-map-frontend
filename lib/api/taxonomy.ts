import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import type { PaginatedResponse, PaginationParams, Topic, NeedTag } from '@/types/api';

// Topics
export function useTopics(params: PaginationParams = {}) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) searchParams.set(key, String(value));
  });
  const query = searchParams.toString();

  return useQuery({
    queryKey: ['admin', 'topics', params],
    queryFn: () => apiClient<PaginatedResponse<Topic>>(`/admin/topics${query ? `?${query}` : ''}`),
  });
}

export function useCreateTopic() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; slug: string; icon?: string; sortOrder?: number }) =>
      apiClient<Topic>('/admin/topics', { method: 'POST', body: data }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'topics'] }),
  });
}

export function useUpdateTopic() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; name?: string; slug?: string; icon?: string; sortOrder?: number }) =>
      apiClient<Topic>(`/admin/topics/${id}`, { method: 'PATCH', body: data }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'topics'] }),
  });
}

export function useDeleteTopic() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient(`/admin/topics/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'topics'] }),
  });
}

// Need Tags
export function useNeedTags(params: PaginationParams = {}) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) searchParams.set(key, String(value));
  });
  const query = searchParams.toString();

  return useQuery({
    queryKey: ['admin', 'need-tags', params],
    queryFn: () => apiClient<PaginatedResponse<NeedTag>>(`/admin/need-tags${query ? `?${query}` : ''}`),
  });
}

export function useCreateNeedTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; slug: string }) =>
      apiClient<NeedTag>('/admin/need-tags', { method: 'POST', body: data }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'need-tags'] }),
  });
}

export function useUpdateNeedTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; name?: string; slug?: string }) =>
      apiClient<NeedTag>(`/admin/need-tags/${id}`, { method: 'PATCH', body: data }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'need-tags'] }),
  });
}

export function useDeleteNeedTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient(`/admin/need-tags/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'need-tags'] }),
  });
}
