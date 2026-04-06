import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import type {
  PaginatedResponse,
  PaginationParams,
  Topic,
  TopicDetail,
  TopicFormPayload,
  NeedTag,
  TargetGroup,
  TaxonomyEntityFormPayload,
} from '@/types/api';

function buildQuery(params: PaginationParams = {}) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) searchParams.set(key, String(value));
  });

  const query = searchParams.toString();
  return query ? `?${query}` : '';
}

// Topics
export function useTopics(params: PaginationParams = {}) {
  return useQuery({
    queryKey: ['admin', 'topics', params],
    queryFn: () => apiClient<PaginatedResponse<Topic>>(`/admin/topics${buildQuery(params)}`),
  });
}

export function useTopic(id: string) {
  return useQuery({
    queryKey: ['admin', 'topic', id],
    queryFn: () => apiClient<TopicDetail>(`/admin/taxonomy/topics/${id}`),
    enabled: Boolean(id),
  });
}

export function useCreateTopic() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: TopicFormPayload) =>
      apiClient<TopicDetail>('/admin/taxonomy/topics', { method: 'POST', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'topics'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'topic'] });
    },
  });
}

export function useUpdateTopic() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Partial<TopicFormPayload> & { status?: 'ACTIVE' | 'INACTIVE' }) =>
      apiClient<TopicDetail>(`/admin/taxonomy/topics/${id}`, { method: 'PATCH', body: data }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'topics'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'topic'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'topic', variables.id] });
    },
  });
}

export function useDeleteTopic() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient(`/admin/taxonomy/topics/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'topics'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'topic'] });
    },
  });
}

// Need Tags
export function useNeedTags(params: PaginationParams = {}) {
  return useQuery({
    queryKey: ['admin', 'need-tags', params],
    queryFn: () => apiClient<PaginatedResponse<NeedTag>>(`/admin/need-tags${buildQuery(params)}`),
  });
}

export function useNeedTag(id: string) {
  return useQuery({
    queryKey: ['admin', 'need-tag', id],
    queryFn: () => apiClient<NeedTag>(`/admin/taxonomy/need-tags/${id}`),
    enabled: Boolean(id),
  });
}

export function useCreateNeedTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: TaxonomyEntityFormPayload) =>
      apiClient<NeedTag>('/admin/taxonomy/need-tags', { method: 'POST', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'need-tags'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'need-tag'] });
    },
  });
}

export function useUpdateNeedTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Partial<TaxonomyEntityFormPayload>) =>
      apiClient<NeedTag>(`/admin/taxonomy/need-tags/${id}`, { method: 'PATCH', body: data }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'need-tags'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'need-tag'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'need-tag', variables.id] });
    },
  });
}

export function useDeleteNeedTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient(`/admin/taxonomy/need-tags/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'need-tags'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'need-tag'] });
    },
  });
}

// Target Groups
export function useTargetGroups(params: PaginationParams = {}) {
  return useQuery({
    queryKey: ['admin', 'target-groups', params],
    queryFn: () => apiClient<PaginatedResponse<TargetGroup>>(`/admin/taxonomy/target-groups${buildQuery(params)}`),
  });
}

export function useTargetGroup(id: string) {
  return useQuery({
    queryKey: ['admin', 'target-group', id],
    queryFn: () => apiClient<TargetGroup>(`/admin/taxonomy/target-groups/${id}`),
    enabled: Boolean(id),
  });
}

export function useCreateTargetGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: TaxonomyEntityFormPayload) =>
      apiClient<TargetGroup>('/admin/taxonomy/target-groups', { method: 'POST', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'target-groups'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'target-group'] });
    },
  });
}

export function useUpdateTargetGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Partial<TaxonomyEntityFormPayload>) =>
      apiClient<TargetGroup>(`/admin/taxonomy/target-groups/${id}`, { method: 'PATCH', body: data }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'target-groups'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'target-group'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'target-group', variables.id] });
    },
  });
}

export function useDeleteTargetGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient(`/admin/taxonomy/target-groups/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'target-groups'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'target-group'] });
    },
  });
}
