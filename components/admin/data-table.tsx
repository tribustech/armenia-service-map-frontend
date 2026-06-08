'use client';

import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type OnChangeFn,
} from '@tanstack/react-table';
import { AdminInset } from '@/components/admin/admin-surface';

type MobileCardField = {
  label: string;
  value: ReactNode;
};

type MobileCardConfig = {
  eyebrow?: ReactNode;
  title: ReactNode;
  badges?: ReactNode;
  fields: MobileCardField[];
  action?: ReactNode;
};

interface DataTableProps<TData> {
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  sorting?: SortingState;
  onSortingChange?: OnChangeFn<SortingState>;
  mobileCard?: (row: TData) => MobileCardConfig;
  emptyLabel?: string;
}

export function DataTable<TData>({
  columns,
  data,
  sorting,
  onSortingChange,
  mobileCard,
  emptyLabel,
}: DataTableProps<TData>) {
  const t = useTranslations('admin.common');
  const resolvedEmptyLabel = emptyLabel ?? t('noResults');
  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
  });

  return (
    <div>
      {mobileCard ? (
        <div className="space-y-3 px-4 py-4 md:hidden">
          {data.length ? (
            data.map((row, index) => {
              const card = mobileCard(row);
              const rowId = (row as { id?: string }).id ?? String(index);

              return (
                <AdminInset
                  key={rowId}
                  className="border border-[#dbe2ea] bg-white p-4"
                  data-testid={`mobile-data-card-${rowId}`}
                >
                  {card.eyebrow ? (
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9ca3af]">
                      {card.eyebrow}
                    </p>
                  ) : null}
                  <div className="mt-2 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="text-base font-semibold text-[#111827]">{card.title}</h3>
                      {card.badges ? <div className="mt-2 flex flex-wrap gap-2">{card.badges}</div> : null}
                    </div>
                    {card.action}
                  </div>
                  <dl className="mt-4 space-y-2.5">
                    {card.fields.map((field) => (
                      <div key={field.label} className="flex items-start justify-between gap-4 text-sm">
                        <dt className="text-[#6b7280]">{field.label}</dt>
                        <dd className="max-w-[65%] text-right text-[#374151]">{field.value}</dd>
                      </div>
                    ))}
                  </dl>
                </AdminInset>
              );
            })
          ) : (
            <AdminInset className="border border-[#e8e8e8] bg-white p-6 text-center text-sm text-[#6b7280]">{resolvedEmptyLabel}</AdminInset>
          )}
        </div>
      ) : null}

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left text-sm text-[#334155]">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-[#e5e5e5]">
                {headerGroup.headers.map((header) => {
                  const isSorted = header.column.getIsSorted();
                  const canSort = header.column.getCanSort();
                  const ariaSort =
                    isSorted === 'asc'
                      ? 'ascending'
                      : isSorted === 'desc'
                        ? 'descending'
                        : 'none';
                  const headerLabel =
                    typeof header.column.columnDef.header === 'string'
                      ? header.column.columnDef.header
                      : header.id;

                  return (
                    <th
                      key={header.id}
                      scope="col"
                      aria-sort={ariaSort}
                      className="px-5 py-4 text-sm font-medium text-[#6b7280]"
                    >
                      {header.isPlaceholder ? null : canSort ? (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className="inline-flex items-center gap-1 text-left"
                          aria-label={`Sort by ${headerLabel}`}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {isSorted === 'asc' && ' ↑'}
                          {isSorted === 'desc' && ' ↓'}
                        </button>
                      ) : (
                        <div className="flex items-center gap-1">
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </div>
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-5 py-10 text-center text-[#6b7280]">
                  {resolvedEmptyLabel}
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-b border-[#f0f0f0] text-[#374151] transition-colors hover:bg-[#fafafa]">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-5 py-4 align-top">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
