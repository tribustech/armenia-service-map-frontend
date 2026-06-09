'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { computeOverflow, rowIndicesFromTops, type OverflowResult } from '@/lib/ui/overflow-chips';

interface OverflowChipRowProps<T> {
  items: T[];
  getKey: (item: T) => string;
  renderChip: (item: T) => React.ReactNode;
  /** Rows allowed before chips collapse behind the +X trigger. */
  maxRows: number;
  /** Label for the collapsed trigger, given the hidden count. */
  moreLabel: (hidden: number) => string;
  /** Label for the expanded "show less" trigger. */
  lessLabel: string;
  className?: string;
}

const NO_OVERFLOW: OverflowResult = { visibleCount: 0, hiddenCount: 0, overflow: false };

const triggerClassName =
  'rounded-[10px] border border-[#d1d5db] bg-white px-4 py-1.5 text-sm font-medium text-[#364153] transition-colors hover:border-[#9ca3af]';

export function OverflowChipRow<T>({
  items,
  getKey,
  renderChip,
  maxRows,
  moreLabel,
  lessLabel,
  className,
}: OverflowChipRowProps<T>) {
  const [result, setResult] = useState<OverflowResult>(NO_OVERFLOW);
  const [expanded, setExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const measureRefs = useRef<Array<HTMLElement | null>>([]);

  // Stable signature so effects don't churn when the parent passes a fresh array reference.
  const itemsKey = items.map(getKey).join('|');

  const measure = useCallback(() => {
    const els = measureRefs.current.slice(0, items.length);
    if (els.some((el) => el == null)) return;
    const tops = (els as HTMLElement[]).map((el) => el.offsetTop);
    setResult(computeOverflow(rowIndicesFromTops(tops), maxRows));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemsKey, maxRows]);

  // Re-measure on mount and whenever the item set or row budget changes.
  useLayoutEffect(() => {
    measure();
  }, [measure]);

  // Collapse when the item set changes (e.g. switching parent topic).
  useEffect(() => {
    setExpanded(false);
  }, [itemsKey]);

  // Re-measure on container resize (breakpoint or content width changes).
  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(() => measure());
    observer.observe(el);
    return () => observer.disconnect();
  }, [measure]);

  if (items.length === 0) return null;

  const shownItems = expanded || !result.overflow ? items : items.slice(0, result.visibleCount);

  return (
    <div ref={containerRef} className={className}>
      {/* Measurement layer: every chip laid out but invisible, so offsetTop is always real. */}
      <div
        aria-hidden
        className="pointer-events-none absolute flex w-full flex-wrap gap-2"
        style={{ visibility: 'hidden' }}
      >
        {items.map((item, index) => (
          <span
            key={getKey(item)}
            data-measure-index={index}
            ref={(el) => {
              measureRefs.current[index] = el;
            }}
          >
            {renderChip(item)}
          </span>
        ))}
      </div>

      {/* Display layer */}
      <div data-testid="overflow-chip-row-display" className="flex flex-wrap gap-2">
        {shownItems.map((item) => (
          <span key={getKey(item)}>{renderChip(item)}</span>
        ))}
        {result.overflow && (
          <button type="button" className={triggerClassName} onClick={() => setExpanded((value) => !value)}>
            {expanded ? lessLabel : moreLabel(result.hiddenCount)}
          </button>
        )}
      </div>
    </div>
  );
}
