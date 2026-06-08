import { describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { NeedEventsTimeline } from '@/components/shared/need-events-timeline';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string, values?: Record<string, string | number>) =>
    values ? `${key}:${Object.values(values).join(',')}` : key,
}));

describe('NeedEventsTimeline', () => {
  it('renders timeline rail, event chips, and nested comment cards', () => {
    render(
      <NeedEventsTimeline
        events={[
          {
            id: '1',
            needReportId: 'need-1',
            userId: 'u1',
            eventType: 'TAG_ADDED',
            content: null,
            metadata: { tagId: 'tag-1', tagName: 'Employment' },
            createdAt: '2026-07-25T08:00:00.000Z',
            user: { id: 'u1', firstName: 'Super', lastName: 'Admin', email: 'admin@example.com' },
          },
          {
            id: '2',
            needReportId: 'need-1',
            userId: 'u2',
            eventType: 'COMMENT',
            content: 'We contacted the person and will provide support.',
            metadata: null,
            createdAt: '2026-07-25T09:00:00.000Z',
            user: { id: 'u2', firstName: 'World', lastName: 'Vision', email: 'wv@example.com' },
          },
        ]}
      />,
    );

    expect(screen.queryByTestId('need-events-rail')).not.toBeInTheDocument();
    expect(screen.getByTestId('need-event-connector-1')).toBeInTheDocument();
    expect(screen.getByText(/Super Admin/i)).toBeVisible();
    expect(screen.getAllByTestId('need-events-date-chip')).toHaveLength(2);
    expect(screen.getByTestId('need-event-summary-1')).toHaveTextContent('tagAdded:Employment');
    expect(screen.getByTestId('need-event-details-1')).toHaveTextContent('detailTag Employment');
    expect(within(screen.getByTestId('need-event-comment-card-2')).getByText(/We contacted the person/i)).toBeVisible();
  });

  it('offsets each timeline entry body so avatars never overlap text', () => {
    render(
      <NeedEventsTimeline
        events={[
          {
            id: '1',
            needReportId: 'need-1',
            userId: 'u1',
            eventType: 'COMMENT',
            content: 'Comment body',
            metadata: null,
            createdAt: '2026-07-25T08:00:00.000Z',
            user: { id: 'u1', firstName: 'Lilit', lastName: 'Hakobyan', email: 'admin@example.com' },
          },
        ]}
      />,
    );

    expect(screen.getByTestId('need-event-body-1')).toHaveClass('pl-10', 'sm:pl-12');
  });
});
