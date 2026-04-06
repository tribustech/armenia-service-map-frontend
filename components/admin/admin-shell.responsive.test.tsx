import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdminLayout from '@/app/(admin)/layout';

const pathnameState = { value: '/admin/needs' };

vi.mock('next/navigation', () => ({
  usePathname: () => pathnameState.value,
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('@/lib/auth/auth-context', () => ({
  useAuth: () => ({
    isAuthenticated: true,
    isLoading: false,
    user: {
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@example.com',
    },
    logout: vi.fn(),
  }),
}));

vi.mock('@/lib/api/notifications', () => ({
  useUnreadCount: () => ({ data: { unreadCount: 2 } }),
  useNotifications: () => ({ data: { data: [] } }),
  useMarkNotificationRead: () => ({ mutate: vi.fn() }),
  useMarkAllNotificationsRead: () => ({ mutate: vi.fn() }),
}));

function setViewport(width: number) {
  window.innerWidth = width;
  window.dispatchEvent(new Event('resize'));
}

describe('Admin responsive navigation', () => {
  beforeEach(() => {
    pathnameState.value = '/admin/needs';
  });

  it('uses a viewport-bound shell so the sidebar stays fixed while main content scrolls', () => {
    setViewport(1440);

    render(
      <AdminLayout>
        <div>Content</div>
      </AdminLayout>,
    );

    expect(screen.getByTestId('admin-shell').className).toContain('h-screen');
    expect(screen.getByTestId('admin-shell').className).toContain('overflow-hidden');
    expect(screen.getByRole('main').className).toContain('overflow-y-auto');
  });

  it('renders an icon-only rail on tablet widths', async () => {
    setViewport(900);

    render(
      <AdminLayout>
        <div>Content</div>
      </AdminLayout>,
    );

    const nav = await screen.findByLabelText('Admin navigation');
    expect(within(nav).getByLabelText('Need reports')).toBeVisible();
    expect(within(nav).queryByText('Need reports')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /open navigation menu/i })).not.toBeInTheDocument();
  });

  it('opens the full navigation drawer from the topbar on mobile widths', async () => {
    setViewport(480);
    const user = userEvent.setup();

    render(
      <AdminLayout>
        <div>Content</div>
      </AdminLayout>,
    );

    await user.click(screen.getByRole('button', { name: /open navigation menu/i }));

    expect(screen.getByRole('banner').className).toContain('bg-[#f7f9fc]/95');
    expect(screen.getByRole('dialog', { name: /admin navigation/i })).toBeVisible();
    expect(screen.getByText('Need reports')).toBeVisible();
  });

  it('closes the mobile drawer after selecting a destination', async () => {
    setViewport(480);
    const user = userEvent.setup();

    render(
      <AdminLayout>
        <div>Content</div>
      </AdminLayout>,
    );

    await user.click(screen.getByRole('button', { name: /open navigation menu/i }));
    await user.click(screen.getByRole('link', { name: 'Need reports' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: /admin navigation/i })).not.toBeInTheDocument();
    });
  });

  it('closes the mobile drawer when Escape is pressed', async () => {
    setViewport(480);
    const user = userEvent.setup();

    render(
      <AdminLayout>
        <div>Content</div>
      </AdminLayout>,
    );

    await user.click(screen.getByRole('button', { name: /open navigation menu/i }));
    expect(screen.getByRole('dialog', { name: /admin navigation/i })).toBeVisible();

    await user.keyboard('{Escape}');

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: /admin navigation/i })).not.toBeInTheDocument();
    });
  });
});
