import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import type { AppNotification, PaginatedResponse, UnreadCountResponse } from '@/types/api';

function withQuery(path: string, params: Record<string, string | number | undefined>) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') query.set(key, String(value));
  });
  const suffix = query.toString();
  return suffix ? `${path}?${suffix}` : path;
}

export function useNotifications(page = 1, perPage = 8) {
  return useQuery({
    queryKey: ['notifications', page, perPage],
    queryFn: () =>
      apiClient<PaginatedResponse<AppNotification>>(
        withQuery('/notifications', {
          page,
          perPage,
        }),
      ),
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => apiClient<UnreadCountResponse>('/notifications/unread-count'),
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notificationId: string) =>
      apiClient(`/notifications/${notificationId}/read`, {
        method: 'PATCH',
      }),
    meta: {
      skipSuccessToast: true,
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiClient('/notifications/read-all', {
        method: 'PATCH',
      }),
    meta: {
      skipSuccessToast: true,
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
