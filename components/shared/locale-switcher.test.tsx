import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { LocaleSwitcher } from './locale-switcher';

const refresh = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh }),
}));

vi.mock('next-intl', () => ({
  useLocale: () => 'en',
  useTranslations: () => (key: string) => key,
}));

afterEach(() => {
  vi.restoreAllMocks();
  refresh.mockClear();
});

describe('LocaleSwitcher', () => {
  it('shows the current locale label and both options when opened', () => {
    render(<LocaleSwitcher />);
    const trigger = screen.getByRole('button', { name: 'ariaLabel' });
    expect(trigger).toHaveTextContent('English');

    fireEvent.click(trigger);
    expect(screen.getByRole('menuitemradio', { name: 'English' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('menuitemradio', { name: 'Հայերեն' })).toHaveAttribute('aria-checked', 'false');
  });

  it('POSTs the chosen locale to /api/locale and refreshes', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', fetchMock);

    render(<LocaleSwitcher />);
    fireEvent.click(screen.getByRole('button', { name: 'ariaLabel' }));
    fireEvent.click(screen.getByRole('menuitemradio', { name: 'Հայերեն' }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/locale');
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body)).toEqual({ locale: 'hy' });
    await waitFor(() => expect(refresh).toHaveBeenCalled());
  });

  it('does not POST when selecting the already-active locale', () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', fetchMock);

    render(<LocaleSwitcher />);
    fireEvent.click(screen.getByRole('button', { name: 'ariaLabel' }));
    fireEvent.click(screen.getByRole('menuitemradio', { name: 'English' }));

    expect(fetchMock).not.toHaveBeenCalled();
  });
});
