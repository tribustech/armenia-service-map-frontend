import { useMutation } from '@tanstack/react-query';
import { apiClient } from './client';

export function useSubscribeToServices() {
  return useMutation({
    mutationFn: (data: { email: string; locale: string; regionId?: string; topicId?: string }) =>
      apiClient<{ ok: true }>('/public/subscriptions', { method: 'POST', body: data }),
  });
}

export function useUnsubscribe() {
  return useMutation({
    mutationFn: (token: string) =>
      apiClient<{ ok: true }>('/public/subscriptions/unsubscribe', { method: 'POST', body: { token } }),
  });
}
