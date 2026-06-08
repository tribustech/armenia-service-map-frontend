import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import PublicServiceDetailPage from '@/app/(public)/services/[id]/page';

const serviceState = { availabilityState: 'AVAILABLE_SOON' as string };

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: 's1' }),
}));

vi.mock('next-intl', () => ({
  useLocale: () => 'en',
  useTranslations: () => (key: string) => key,
}));

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock('@/components/public/need-cta-banner', () => ({
  NeedCtaBanner: () => <div data-testid="need-cta-banner" />,
}));

vi.mock('@/lib/i18n/service-content', () => ({
  getLocalizedServiceContent: () => ({ title: 'T', shortDescription: 'S', description: 'D', howToAccess: '' }),
}));

vi.mock('@/lib/api/services', () => ({
  usePublicService: () => ({
    isLoading: false,
    data: {
      id: 's1',
      organisation: { id: 'o1', name: 'Org' },
      region: null,
      topics: [],
      targetGroup: [],
      availabilityStart: null,
      availabilityEnd: null,
      availabilityState: serviceState.availabilityState,
    },
  }),
}));

describe('PublicServiceDetailPage availability badge', () => {
  it('renders the Available soon badge for AVAILABLE_SOON state', () => {
    serviceState.availabilityState = 'AVAILABLE_SOON';
    render(<PublicServiceDetailPage />);
    expect(screen.getByText('availableSoon')).toBeInTheDocument();
  });

  it('renders the Unavailable badge for UNAVAILABLE state', () => {
    serviceState.availabilityState = 'UNAVAILABLE';
    render(<PublicServiceDetailPage />);
    expect(screen.getByText('unavailable')).toBeInTheDocument();
  });
});
