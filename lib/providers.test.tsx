import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { useEffect } from 'react';
import { render, waitFor } from '@testing-library/react';
import { useMutation } from '@tanstack/react-query';
import { Providers } from './providers';
import { subscribeToToast, type AppToast } from './toast-bus';

type MutationToastMeta = {
  skipSuccessToast?: boolean;
  successMessage?: string;
};

/**
 * Fires a single mutation on mount and surfaces its status so tests can wait
 * until the MutationCache success callback has had a chance to run.
 */
function MutatingComponent({ meta }: { meta?: MutationToastMeta }) {
  const mutation = useMutation({
    mutationFn: async () => 'ok',
    meta,
  });

  useEffect(() => {
    mutation.mutate();
    // Trigger exactly once on mount; mutate is stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div data-testid="status">{mutation.status}</div>;
}

describe('Providers mutation success toast', () => {
  const toasts: AppToast[] = [];
  let unsubscribe: () => void;

  beforeEach(() => {
    toasts.length = 0;
    unsubscribe = subscribeToToast((toast) => toasts.push(toast));
  });

  afterEach(() => {
    unsubscribe();
  });

  it('does not publish a success toast when no successMessage is provided', async () => {
    const { getByTestId } = render(
      <Providers>
        <MutatingComponent />
      </Providers>,
    );

    await waitFor(() => expect(getByTestId('status').textContent).toBe('success'));

    expect(toasts.filter((t) => t.type === 'success')).toHaveLength(0);
  });

  it('publishes a success toast with the provided successMessage', async () => {
    const { getByTestId } = render(
      <Providers>
        <MutatingComponent meta={{ successMessage: 'Service saved' }} />
      </Providers>,
    );

    await waitFor(() => expect(getByTestId('status').textContent).toBe('success'));

    const successToasts = toasts.filter((t) => t.type === 'success');
    expect(successToasts).toHaveLength(1);
    expect(successToasts[0].message).toBe('Service saved');
  });
});
