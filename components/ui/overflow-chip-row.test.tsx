import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { OverflowChipRow } from './overflow-chip-row';

// Capture ResizeObserver callbacks so tests can trigger a re-measure on demand.
let resizeCallbacks: ResizeObserverCallback[] = [];

class MockResizeObserver {
  constructor(cb: ResizeObserverCallback) {
    resizeCallbacks.push(cb);
  }
  observe() {}
  unobserve() {}
  disconnect() {}
}

function triggerResize() {
  act(() => {
    resizeCallbacks.forEach((cb) => cb([], {} as ResizeObserver));
  });
}

/** Assign a fake offsetTop to every measurement chip, keyed by its data-measure-index. */
function layoutMeasureChips(tops: number[]) {
  document.querySelectorAll('[data-measure-index]').forEach((el) => {
    const index = Number((el as HTMLElement).dataset.measureIndex);
    Object.defineProperty(el, 'offsetTop', { value: tops[index] ?? 0, configurable: true });
  });
}

const items = ['Housing', 'Food', 'Legal', 'Health', 'Jobs', 'Education'];

function renderRow(maxRows = 1) {
  return render(
    <OverflowChipRow
      items={items}
      getKey={(item) => item}
      maxRows={maxRows}
      renderChip={(item) => (
        <button type="button" data-testid={`chip-${item}`}>
          {item}
        </button>
      )}
      moreLabel={(n) => `+${n}`}
      lessLabel="Show less"
    />,
  );
}

function displayLayer() {
  return screen.getByTestId('overflow-chip-row-display');
}

beforeEach(() => {
  resizeCallbacks = [];
  vi.stubGlobal('ResizeObserver', MockResizeObserver);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('OverflowChipRow', () => {
  it('shows all chips and no trigger when everything fits in one row', () => {
    renderRow(1);
    layoutMeasureChips([0, 0, 0, 0, 0, 0]); // all on row 0
    triggerResize();

    const display = within(displayLayer());
    expect(display.getAllByRole('button')).toHaveLength(items.length);
    expect(screen.queryByRole('button', { name: /^\+\d+$/ })).not.toBeInTheDocument();
  });

  it('collapses overflowing chips behind a +X trigger (one row)', () => {
    renderRow(1);
    // 4 chips fit on row 0, 2 overflow to row 1 → reserve 1 slot → 3 visible, 3 hidden
    layoutMeasureChips([0, 0, 0, 0, 40, 40]);
    triggerResize();

    const display = within(displayLayer());
    // 3 topic chips + the trigger
    expect(display.getByTestId('chip-Housing')).toBeInTheDocument();
    expect(display.queryByTestId('chip-Health')).not.toBeInTheDocument();
    expect(display.getByRole('button', { name: '+3' })).toBeInTheDocument();
  });

  it('expands inline to show every chip when the +X trigger is clicked', () => {
    renderRow(1);
    layoutMeasureChips([0, 0, 0, 0, 40, 40]);
    triggerResize();

    fireEvent.click(screen.getByRole('button', { name: '+3' }));

    const display = within(displayLayer());
    items.forEach((item) => expect(display.getByTestId(`chip-${item}`)).toBeInTheDocument());
    expect(display.getByRole('button', { name: 'Show less' })).toBeInTheDocument();
  });

  it('allows two rows before collapsing on mobile', () => {
    renderRow(2);
    // rows 0 and 1 fit (5 chips), row 2 overflows (1 chip) → reserve 1 → 4 visible, 2 hidden
    layoutMeasureChips([0, 0, 40, 40, 40, 80]);
    triggerResize();

    expect(screen.getByRole('button', { name: '+2' })).toBeInTheDocument();
  });
});
