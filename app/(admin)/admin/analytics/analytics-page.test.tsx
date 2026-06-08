import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import AdminAnalyticsPage from './page';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string, values?: Record<string, string | number>) =>
    values ? `${key}:${Object.values(values).join(',')}` : key,
}));

vi.mock('react-chartjs-2', () => ({
  Bar: () => <div data-testid="bar-chart" />,
  Line: () => <div data-testid="line-chart" />,
}));

vi.mock('@/lib/api/analytics', () => ({
  useOverviewStats: () => ({
    isLoading: false,
    data: { totalSearches: 5, totalUniqueSearches: 4, totalZeroResultSearches: 1 },
  }),
  useTopQueries: () => ({ isLoading: false, data: [{ query: 'food', count: 3 }] }),
  useZeroResultQueries: () => ({ isLoading: false, data: [] }),
  useSearchFrequency: () => ({
    isLoading: false,
    data: [{ bucketStart: '2026-04-06T00:00:00.000Z', count: 2 }],
  }),
  useAllSearches: () => ({
    isLoading: false,
    data: {
      data: [
        { id: 's1', createdAt: '2026-04-06T00:00:00.000Z', query: 'food', resultsCount: 2 },
      ],
      meta: { page: 1, perPage: 12, total: 1, totalPages: 1 },
    },
  }),
  useMostUsedFilters: () => ({
    isLoading: false,
    data: { regionUsage: [], topicUsage: [] },
  }),
  useLeastUsedFilters: () => ({
    isLoading: false,
    data: { regionUsage: [], topicUsage: [] },
  }),
  useFilterHeatmap: () => ({
    isLoading: false,
    data: { regions: [], topics: [], matrix: [] },
  }),
}));

describe('AdminAnalyticsPage', () => {
  it('renders localized keys instead of hardcoded English', () => {
    render(<AdminAnalyticsPage />);

    expect(screen.getByRole('heading', { level: 1, name: 'title' })).toBeInTheDocument();
    expect(screen.getByText('totalSearches')).toBeInTheDocument();
    expect(screen.getByText('totalUniqueSearches')).toBeInTheDocument();
    expect(screen.getByText('zeroResultSearches')).toBeInTheDocument();
    expect(screen.getByText('allSearches')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('searchPlaceholder')).toBeInTheDocument();
    expect(screen.getByText('downloadCsv')).toBeInTheDocument();
    expect(screen.getByText('resultsColumn')).toBeInTheDocument();
    expect(screen.getByText('filterHeatmap')).toBeInTheDocument();
    expect(screen.getByText('pageInfo:1,1,1')).toBeInTheDocument();
  });
});
