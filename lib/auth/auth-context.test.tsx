import { beforeEach, describe, expect, it, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderToString } from 'react-dom/server';
import { hydrateRoot } from 'react-dom/client';
import { act } from 'react';
import { AuthProvider, useAuth } from '@/lib/auth/auth-context';

const getProfileMock = vi.fn();

vi.mock('@/lib/api/auth', () => ({
  getProfile: () => getProfileMock(),
  login: vi.fn(),
  logout: vi.fn(),
}));

function AuthGateProbe() {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return <div data-testid="loading">loading</div>;
  }

  if (!isAuthenticated) {
    return <div data-testid="guest">guest</div>;
  }

  return <div data-testid="authed">authed</div>;
}

function ProvidersTree() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AuthGateProbe />
      </AuthProvider>
    </QueryClientProvider>
  );
}

describe('AuthProvider hydration safety', () => {
  beforeEach(() => {
    localStorage.clear();
    getProfileMock.mockReset();
  });

  it('hydrates without mismatching when a token exists only on the client', async () => {
    getProfileMock.mockResolvedValue({
      id: '1',
      email: 'admin@example.com',
      firstName: 'Admin',
      lastName: 'User',
    });

    const originalWindow = globalThis.window;
    const originalDocument = globalThis.document;

    // Simulate server rendering without access to browser storage.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (globalThis as any).window;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (globalThis as any).document;
    const serverHtml = renderToString(<ProvidersTree />);
    globalThis.window = originalWindow;
    globalThis.document = originalDocument;

    localStorage.setItem('accessToken', 'token');

    const container = document.createElement('div');
    container.innerHTML = serverHtml;
    document.body.appendChild(container);

    const recoverableError = vi.fn();

    await act(async () => {
      hydrateRoot(container, <ProvidersTree />, {
        onRecoverableError: recoverableError,
      });
    });

    expect(recoverableError).not.toHaveBeenCalled();
  });
});
