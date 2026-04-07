import { useMutation, useQuery } from '@tanstack/react-query';
import { apiClient } from './client';
import type {
  OverviewStats,
  SearchStats,
  FilterStats,
  OrgOverviewStats,
  QueryCount,
  SearchFrequencyPoint,
  SearchLogItem,
  FilterUsageResponse,
  FilterHeatmapResponse,
  PaginatedResponse,
  PaginationParams,
  DashboardTrendsResponse,
} from '@/types/api';

const PUBLIC_ANALYTICS_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/public/search-logs/batch`;

function withQuery(path: string, params: Record<string, string | number | undefined>) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') query.set(key, String(value));
  });
  const suffix = query.toString();
  return suffix ? `${path}?${suffix}` : path;
}

// Admin
export function useOverviewStats() {
  return useQuery({
    queryKey: ['admin', 'analytics', 'overview'],
    queryFn: () => apiClient<OverviewStats>('/admin/analytics/overview'),
  });
}

export function useTopQueries(limit = 10) {
  return useQuery({
    queryKey: ['admin', 'analytics', 'top-queries', limit],
    queryFn: () => apiClient<QueryCount[]>(withQuery('/admin/analytics/top-queries', { limit })),
  });
}

export function useDashboardTrends(months = 12) {
  return useQuery({
    queryKey: ['admin', 'analytics', 'dashboard-trends', months],
    queryFn: () =>
      apiClient<DashboardTrendsResponse>(withQuery('/admin/analytics/dashboard-trends', { months })),
  });
}

export function useZeroResultQueries(limit = 10) {
  return useQuery({
    queryKey: ['admin', 'analytics', 'zero-result-queries', limit],
    queryFn: () => apiClient<QueryCount[]>(withQuery('/admin/analytics/zero-result-queries', { limit })),
  });
}

export function useSearchFrequency(period: 'day' | 'week' | 'month' = 'day', limit = 30) {
  return useQuery({
    queryKey: ['admin', 'analytics', 'search-frequency', period, limit],
    queryFn: () => apiClient<SearchFrequencyPoint[]>(withQuery('/admin/analytics/search-frequency', { period, limit })),
  });
}

export function useAllSearches(params: PaginationParams = {}) {
  return useQuery({
    queryKey: ['admin', 'analytics', 'all-searches', params],
    queryFn: () =>
      apiClient<PaginatedResponse<SearchLogItem>>(
        withQuery('/admin/analytics/all-searches', {
          page: params.page,
          perPage: params.perPage,
          sortBy: params.sortBy,
          sortOrder: params.sortOrder,
          search: params.search,
        }),
      ),
  });
}

export function useMostUsedFilters(limit = 10) {
  return useQuery({
    queryKey: ['admin', 'analytics', 'most-used-filters', limit],
    queryFn: () => apiClient<FilterUsageResponse>(withQuery('/admin/analytics/most-used-filters', { limit })),
  });
}

export function useLeastUsedFilters(limit = 10) {
  return useQuery({
    queryKey: ['admin', 'analytics', 'least-used-filters', limit],
    queryFn: () => apiClient<FilterUsageResponse>(withQuery('/admin/analytics/least-used-filters', { limit })),
  });
}

export function useFilterHeatmap() {
  return useQuery({
    queryKey: ['admin', 'analytics', 'filter-heatmap'],
    queryFn: () => apiClient<FilterHeatmapResponse>('/admin/analytics/filter-heatmap'),
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

export function sendPublicSearchLogBatchBeacon(events: Array<{
  query: string;
  regionId: string | null;
  topicIds: string[];
  resultsCount: number;
}>) {
  if (typeof navigator === 'undefined' || typeof navigator.sendBeacon !== 'function') {
    return false;
  }

  return navigator.sendBeacon(
    PUBLIC_ANALYTICS_URL,
    new Blob([JSON.stringify({ events })], { type: 'application/json' }),
  );
}

export function useLogPublicSearchBatch() {
  return useMutation({
    mutationFn: (data: {
      events: Array<{
        query: string;
        regionId: string | null;
        topicIds: string[];
        resultsCount: number;
      }>;
    }) => apiClient<{ ok: true }>('/public/search-logs/batch', { method: 'POST', body: data }),
  });
}

// Org
export function useOrgOverviewStats() {
  return useQuery({
    queryKey: ['org', 'analytics', 'overview'],
    queryFn: () => apiClient<OrgOverviewStats>('/org/analytics/overview'),
  });
}

export function useOrgDashboardTrends(months = 12) {
  return useQuery({
    queryKey: ['org', 'analytics', 'dashboard-trends', months],
    queryFn: () =>
      apiClient<DashboardTrendsResponse>(withQuery('/org/analytics/dashboard-trends', { months })),
  });
}
