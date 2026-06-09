import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { useMediaQuery } from './use-media-query';

type Listener = (e: { matches: boolean }) => void;

function mockMatchMedia(initialMatches: boolean) {
  let listener: Listener | null = null;
  const mql = {
    matches: initialMatches,
    addEventListener: (_: string, cb: Listener) => {
      listener = cb;
    },
    removeEventListener: vi.fn(),
  };
  window.matchMedia = vi.fn().mockReturnValue(mql) as unknown as typeof window.matchMedia;
  return {
    emit(matches: boolean) {
      mql.matches = matches;
      listener?.({ matches });
    },
  };
}

function Probe({ query }: { query: string }) {
  const matches = useMediaQuery(query);
  return <span data-testid="result">{matches ? 'yes' : 'no'}</span>;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useMediaQuery', () => {
  it('reflects the initial match state', () => {
    mockMatchMedia(true);
    render(<Probe query="(min-width: 768px)" />);
    expect(screen.getByTestId('result')).toHaveTextContent('yes');
  });

  it('updates when the media query changes', () => {
    const media = mockMatchMedia(false);
    render(<Probe query="(min-width: 768px)" />);
    expect(screen.getByTestId('result')).toHaveTextContent('no');

    act(() => media.emit(true));
    expect(screen.getByTestId('result')).toHaveTextContent('yes');
  });
});
