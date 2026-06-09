import { describe, expect, it } from 'vitest';
import { computeOverflow, rowIndicesFromTops } from './overflow-chips';

describe('rowIndicesFromTops', () => {
  it('assigns the same row index to equal offsetTop values', () => {
    expect(rowIndicesFromTops([0, 0, 0])).toEqual([0, 0, 0]);
  });

  it('increments the row index for each distinct ascending top', () => {
    expect(rowIndicesFromTops([0, 0, 40, 40, 80])).toEqual([0, 0, 1, 1, 2]);
  });

  it('is robust to sub-pixel jitter within a small tolerance', () => {
    expect(rowIndicesFromTops([0, 0.4, 40, 40.3])).toEqual([0, 0, 1, 1]);
  });
});

describe('computeOverflow', () => {
  it('shows everything when all chips fit within maxRows', () => {
    expect(computeOverflow([0, 0, 0], 1)).toEqual({ visibleCount: 3, hiddenCount: 0, overflow: false });
  });

  it('reserves one slot for the +X chip when overflowing', () => {
    // 4 chips on row 0, 2 on row 1; maxRows=1 → 4 fit, drop 1 for the trigger → 3 visible, 3 hidden
    expect(computeOverflow([0, 0, 0, 0, 1, 1], 1)).toEqual({
      visibleCount: 3,
      hiddenCount: 3,
      overflow: true,
    });
  });

  it('allows two rows on mobile before overflowing', () => {
    expect(computeOverflow([0, 0, 1, 1, 2], 2)).toEqual({
      visibleCount: 3,
      hiddenCount: 2,
      overflow: true,
    });
  });

  it('never returns a negative visible count', () => {
    expect(computeOverflow([0, 1, 1], 1)).toEqual({ visibleCount: 0, hiddenCount: 3, overflow: true });
  });
});
