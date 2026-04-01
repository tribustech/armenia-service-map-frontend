'use client';

import { MutationCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { AuthProvider } from './auth/auth-context';
import { publishToast } from './toast-bus';
import { ToastCenter } from '@/components/ui/toast-center';

type MutationToastMeta = {
  skipSuccessToast?: boolean;
  successMessage?: string;
  errorMessage?: string;
};

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        mutationCache: new MutationCache({
          onSuccess: (_data, _variables, _context, mutation) => {
            const meta = mutation.options.meta as MutationToastMeta | undefined;
            if (meta?.skipSuccessToast) return;

            publishToast({
              type: 'success',
              message: meta?.successMessage || 'Action completed successfully.',
            });
          },
          onError: (error, _variables, _context, mutation) => {
            const meta = mutation.options.meta as MutationToastMeta | undefined;
            const fallbackMessage =
              error instanceof Error ? error.message : 'Something went wrong.';

            publishToast({
              type: 'error',
              message: meta?.errorMessage || fallbackMessage,
            });
          },
        }),
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
        <ToastCenter />
      </AuthProvider>
    </QueryClientProvider>
  );
}
