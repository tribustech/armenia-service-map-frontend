import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TopicSubtopicsTable } from './topic-subtopics-table';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string, values?: Record<string, string | number>) =>
    values ? `${key}:${Object.values(values).join(',')}` : key,
}));

describe('TopicSubtopicsTable', () => {
  it('fires a status toggle callback for one subtopic row', async () => {
    const user = userEvent.setup();
    const onToggleStatus = vi.fn();

    render(
      <TopicSubtopicsTable
        rows={[
          {
            id: 'child-1',
            name: 'Counselling',
            slug: 'counselling',
            status: 'ACTIVE',
            sortOrder: 0,
            updatedAt: '2026-04-06T00:00:00.000Z',
            _count: { services: 2 },
          },
        ]}
        onToggleStatus={onToggleStatus}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'form.setRowStatusAria:Counselling,inactive' }));
    expect(onToggleStatus).toHaveBeenCalledWith({ id: 'child-1', status: 'INACTIVE' });
  });
});
