import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TopicForm } from './topic-form';

describe('TopicForm', () => {
  it('adds a new subtopic row and validates duplicate names', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<TopicForm mode="create" onSubmit={onSubmit} />);

    await user.click(screen.getByRole('button', { name: 'Add another sub-topic' }));
    await user.type(screen.getByLabelText('Service topic'), 'Psychological help');
    await user.type(screen.getAllByLabelText('Sub-topic name')[0], 'Counselling');
    await user.click(screen.getByRole('button', { name: 'Add another sub-topic' }));
    await user.type(screen.getAllByLabelText('Sub-topic name')[1], 'Counselling');
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(await screen.findAllByText('Duplicate name')).toHaveLength(2);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits inline switch states for topic and subtopics', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<TopicForm mode="create" onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText('Service topic'), 'Psychological help');
    await user.click(screen.getByRole('switch', { name: 'Topic status' }));
    await user.click(screen.getByRole('button', { name: 'Add another sub-topic' }));
    await user.type(screen.getByLabelText('Sub-topic name'), 'Counselling');
    await user.click(screen.getByRole('switch', { name: 'Sub-topic 1 status' }));
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'INACTIVE',
        subtopics: [
          expect.objectContaining({
            name: 'Counselling',
            status: 'INACTIVE',
          }),
        ],
      }),
    );
  });
});
