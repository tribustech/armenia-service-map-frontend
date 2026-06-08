import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import AdminLayout from './layout';

const pushMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}));

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

let authValue: {
  user: { role: string } | null;
  isAuthenticated: boolean;
  isLoading: boolean;
};

vi.mock('@/lib/auth/auth-context', () => ({
  useAuth: () => authValue,
}));

vi.mock('@/components/admin/sidebar', () => ({
  AdminSidebar: () => <div data-testid="admin-sidebar" />,
}));
vi.mock('@/components/admin/topbar', () => ({
  AdminTopbar: () => <div data-testid="admin-topbar" />,
}));
vi.mock('@/components/shared/loading-skeletons', () => ({
  ShellLoadingScreen: () => <div data-testid="loading-screen" />,
}));

describe('AdminLayout role guard', () => {
  beforeEach(() => {
    pushMock.mockClear();
  });

  it('renders the admin shell for a SUPER_ADMIN', () => {
    authValue = {
      user: { role: 'SUPER_ADMIN' },
      isAuthenticated: true,
      isLoading: false,
    };

    render(
      <AdminLayout>
        <div>child</div>
      </AdminLayout>,
    );

    expect(screen.getByTestId('admin-shell')).toBeInTheDocument();
    expect(pushMock).not.toHaveBeenCalled();
  });

  it('does not render the admin shell for an ORG_ADMIN and redirects them to the org dashboard', () => {
    authValue = {
      user: { role: 'ORG_ADMIN' },
      isAuthenticated: true,
      isLoading: false,
    };

    render(
      <AdminLayout>
        <div>child</div>
      </AdminLayout>,
    );

    expect(screen.queryByTestId('admin-shell')).not.toBeInTheDocument();
    expect(pushMock).toHaveBeenCalledWith('/org/dashboard');
  });

  it('redirects an unauthenticated user to login', () => {
    authValue = {
      user: null,
      isAuthenticated: false,
      isLoading: false,
    };

    render(
      <AdminLayout>
        <div>child</div>
      </AdminLayout>,
    );

    expect(screen.queryByTestId('admin-shell')).not.toBeInTheDocument();
    expect(pushMock).toHaveBeenCalledWith('/login');
  });
});
