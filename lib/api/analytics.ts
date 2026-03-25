import { useQuery } from '@tanstack/react-query';
import { apiClient } from './client';
import type { OverviewStats, SearchStats, FilterStats, OrgOverviewStats } from '@/types/api';

// Admin
export function useOverviewStats() {
  return useQuery({
    queryKey: ['admin', 'analytics', 'overview'],
    queryFn: () => apiClient<OverviewStats>('/admin/analytics/overview'),
  });
}

export function useSearchStats() {
  return useQuery({
    queryKey: ['admin', 'analytics', 'searches'],
    queryFn: () => apiClient<SearchStats>('/admin/analytics/searches'),
  });
}

export function useFilterStats() {
  return useQuery({
    queryKey: ['admin', 'analytics', 'filters'],
    queryFn: () => apiClient<FilterStats>('/admin/analytics/filters'),
  });
}

// Org
export function useOrgOverviewStats() {
  return useQuery({
    queryKey: ['org', 'analytics', 'overview'],
    queryFn: () => apiClient<OrgOverviewStats>('/org/analytics/overview'),
  });
}
