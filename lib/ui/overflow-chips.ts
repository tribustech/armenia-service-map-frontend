const ROW_TOLERANCE = 2; // px — treat tops within this band as the same row (guards sub-pixel jitter)

/**
 * Map each chip's vertical offset (offsetTop) to a zero-based row index.
 * Tops within ROW_TOLERANCE of an established row are treated as that row.
 */
export function rowIndicesFromTops(tops: number[]): number[] {
  const rowTops: number[] = [];
  return tops.map((top) => {
    const existing = rowTops.findIndex((rowTop) => Math.abs(rowTop - top) <= ROW_TOLERANCE);
    if (existing !== -1) return existing;
    rowTops.push(top);
    return rowTops.length - 1;
  });
}

export interface OverflowResult {
  visibleCount: number;
  hiddenCount: number;
  overflow: boolean;
}

/**
 * Given the row index of each chip and the allowed number of rows, decide how
 * many chips to show. When chips spill past maxRows we reserve one slot in the
 * allowed rows for the "+X" trigger, so the last visible position is the trigger.
 */
export function computeOverflow(rowIndices: number[], maxRows: number): OverflowResult {
  const total = rowIndices.length;
  const fitting = rowIndices.filter((row) => row < maxRows).length;

  if (fitting === total) {
    return { visibleCount: total, hiddenCount: 0, overflow: false };
  }

  const visibleCount = Math.max(0, fitting - 1);
  return { visibleCount, hiddenCount: total - visibleCount, overflow: true };
}
