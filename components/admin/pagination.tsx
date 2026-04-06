'use client';

import { TableSelect } from '@/components/ui/table-controls';

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  perPage: number;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
}

export function Pagination({
  page,
  totalPages,
  total,
  perPage,
  onPageChange,
  onPerPageChange,
}: PaginationProps) {
  const from = (page - 1) * perPage + 1;
  const to = Math.min(page * perPage, total);

  // Generate page numbers to show
  const pages: (number | '...')[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...');
    }
  }

  return (
    <div className="flex flex-col gap-4 border-t border-[#f0f0f0] px-4 py-4 text-sm md:flex-row md:items-center md:justify-between md:px-5">
      <span className="text-[#6b7280]">
        Showing {from} to {to} of {total} results
      </span>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[#6b7280]">Per page</span>
          <TableSelect
            value={perPage}
            onChange={(e) => onPerPageChange(Number(e.target.value))}
            aria-label="Rows per page"
            className="w-[94px]"
          >
            {[5, 10, 25, 50].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </TableSelect>
        </div>

        <div className="flex items-center gap-1">
          {pages.map((p, i) =>
            p === '...' ? (
              <span key={`dots-${i}`} className="px-2 text-[#9ca3af]">
                ...
              </span>
            ) : (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange(p)}
                aria-label={`Go to page ${p}`}
                aria-current={p === page ? 'page' : undefined}
                className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                  p === page
                    ? 'border-[#E8922D] bg-[#E8922D] text-white'
                    : 'border-transparent text-[#374151] hover:bg-[#f5f5f4]'
                }`}
              >
                {p}
              </button>
            ),
          )}
        </div>
      </div>
    </div>
  );
}
