import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import PublicServicesPage from '@/app/(public)/services/page';

const servicesHookState = {
  total: 7,
};

const usePublicServicesMock = vi.fn();
const logSearchBatchMutate = vi.fn((payload: unknown, options?: { onSuccess?: () => void }) => {
  options?.onSuccess?.();
});

vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('next-intl', () => ({
  useLocale: () => 'en',
  useTranslations: () => (key: string, values?: Record<string, string | number>) => {
    if (key === 'regionalServicesTitle') return `${values?.region}:${values?.count}`;
    return key;
  },
}));

vi.mock('@/components/shared/armenia-map', () => ({
  ArmeniaMap: () => <div data-testid="armenia-map" />,
}));

vi.mock('@/components/admin/pagination', () => ({
  Pagination: () => <div data-testid="pagination" />,
}));

vi.mock('@/components/public/need-cta-banner', () => ({
  NeedCtaBanner: () => <div data-testid="need-cta-banner" />,
}));

vi.mock('@/lib/i18n/service-content', () => ({
  getLocalizedServiceContent: (service: { title: string; shortDescription: string }) => ({
    title: service.title,
    shortDescription: service.shortDescription,
  }),
}));

vi.mock('@/lib/api/services', () => ({
  usePublicTopics: () => ({ data: [{ id: 'topic-1', name: 'Health', slug: 'health' }] }),
  usePublicRegions: () => ({ data: [{ id: 'region-1', name: 'Yerevan', slug: 'yerevan', svgPathId: 'AM-ER' }] }),
  usePublicRegionServiceCounts: () => ({ data: {} }),
  usePublicServices: (params: unknown) => {
    usePublicServicesMock(params);
    return {
      data: {
        data: [],
        meta: {
          total: servicesHookState.total,
          page: 1,
          perPage: 10,
          totalPages: 1,
        },
      },
      isLoading: false,
    };
  },
}));

vi.mock('@/lib/api/analytics', () => ({
  sendPublicSearchLogBatchBeacon: () => false,
  useLogPublicSearchBatch: () => ({
    mutate: logSearchBatchMutate,
  }),
}));

describe('PublicServicesPage', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
    usePublicServicesMock.mockClear();
    logSearchBatchMutate.mockClear();
    servicesHookState.total = 7;
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      get: () => 'visible',
    });
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('updates live service results immediately while typing', async () => {
    render(<PublicServicesPage />);

    fireEvent.change(screen.getByRole('searchbox', { name: 'searchPlaceholder' }), {
      target: { value: 'healthcare' },
    });

    expect(usePublicServicesMock).toHaveBeenLastCalledWith(
      expect.objectContaining({
        search: 'healthcare',
      }),
    );
  });

  it('queues a settled search after 5 seconds and flushes it when the tab is hidden', async () => {
    render(<PublicServicesPage />);

    fireEvent.change(screen.getByRole('searchbox', { name: 'searchPlaceholder' }), {
      target: { value: 'healthcare' },
    });

    act(() => {
      vi.advanceTimersByTime(4999);
    });
    expect(logSearchBatchMutate).not.toHaveBeenCalled();
    expect(localStorage.getItem('public-search-log-queue')).toBeNull();

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(logSearchBatchMutate).not.toHaveBeenCalled();

    expect(JSON.parse(localStorage.getItem('public-search-log-queue') ?? '[]')).toEqual([
      {
        query: 'healthcare',
        regionId: null,
        topicIds: [],
        resultsCount: 7,
      },
    ]);

    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      get: () => 'hidden',
    });
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'));
    });

    expect(logSearchBatchMutate).toHaveBeenCalledWith(
      {
        events: [
          {
            query: 'healthcare',
            regionId: null,
            topicIds: [],
            resultsCount: 7,
          },
        ],
      },
      expect.any(Object),
    );
    expect(localStorage.getItem('public-search-log-queue')).toBeNull();
  });
});
