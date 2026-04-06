'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { type ColumnDef } from '@tanstack/react-table';
import { ArmeniaMap } from '@/components/shared/armenia-map';
import { DataTable } from '@/components/admin/data-table';
import { Pagination } from '@/components/admin/pagination';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { NeedsMapLoadingSkeleton, TableLoadingSkeleton } from '@/components/shared/loading-skeletons';
import { useOrgNeeds, useOrgNeedsMap } from '@/lib/api/needs';
import { formatStatusLabel } from '@/lib/formatting/status-label';
import type { NeedReport } from '@/types/api';

const statusVariant: Record<string, 'neutral' | 'warning' | 'success' | 'danger'> = {
  NEW: 'neutral',
  IN_PROGRESS: 'warning',
  SOLVED: 'success',
  CLOSED: 'danger',
};

export default function OrgNeedsMapPage() {
  const [selectedRegionId, setSelectedRegionId] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const { data: mapData, isLoading: mapLoading } = useOrgNeedsMap();
  const needsQuery = useOrgNeeds({
    page,
    perPage,
    search,
    regionId: selectedRegionId || undefined,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const regionCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    mapData?.forEach((entry) => {
      counts[entry.svgPathId] = entry.count;
    });
    return counts;
  }, [mapData]);

  const selectedRegion = mapData?.find((entry) => entry.regionId === selectedRegionId) ?? null;

  const columns: ColumnDef<NeedReport, unknown>[] = [
    {
      accessorKey: 'id',
      header: 'ID',
      cell: ({ getValue }) => <span className="font-mono text-xs text-[#6b7280]">{String(getValue()).slice(0, 8)}</span>,
    },
    {
      accessorKey: 'title',
      header: 'Title',
      cell: ({ row }) => (
        <span className="line-clamp-1 font-medium text-[#111827]">
          {row.original.title || row.original.description.slice(0, 60)}
        </span>
      ),
    },
    {
      accessorFn: (row) => row.region?.name || '—',
      id: 'region',
      header: 'Location',
    },
    {
      accessorFn: (row) => row.tags.map((tag) => tag.needTag.name).join(', ') || '—',
      id: 'tags',
      header: 'Tags',
      cell: ({ getValue }) => <span className="line-clamp-1 text-sm text-[#374151]">{String(getValue())}</span>,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => {
        const value = String(getValue());
        return <Badge variant={statusVariant[value] || 'neutral'}>{formatStatusLabel(value)}</Badge>;
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Submitted at',
      cell: ({ getValue }) => new Date(getValue() as string).toLocaleDateString(),
    },
    {
      id: 'open',
      header: '',
      cell: ({ row }) => (
        <Link href={`/org/needs/${row.original.id}`} className="text-sm text-[#E8922D] hover:underline">
          Open
        </Link>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-2 text-sm text-[#6b7280]">
        <Link href="/org/needs" className="hover:underline">Assigned needs</Link>{' > '}Map
      </div>
      <h1 className="text-2xl font-bold">Needs map</h1>
      <p className="mt-2 text-[#6b7280]">
        {selectedRegion
          ? `Showing assigned needs in ${selectedRegion.regionName}`
          : 'Showing all assigned need reports by region'}
      </p>

      {selectedRegion ? (
        <div className="mt-3 flex items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
            Region: {selectedRegion.regionName}
          </span>
          <button
            onClick={() => {
              setSelectedRegionId('');
              setPage(1);
            }}
            className="text-xs text-[#6b7280] underline hover:text-[#374151]"
          >
            Clear filter
          </button>
        </div>
      ) : null}

      {mapLoading ? (
        <NeedsMapLoadingSkeleton />
      ) : (
        <div className="mt-6 flex flex-col gap-6 lg:flex-row">
          <div className="lg:w-2/3">
            <div className="overflow-hidden rounded-lg border bg-white p-4">
              <ArmeniaMap
                regionCounts={regionCounts}
                selectedRegionId={selectedRegion?.svgPathId}
                countLabelSingular="need report"
                countLabelPlural="need reports"
                densityMode
                onRegionClick={(svgPathId) => {
                  const region = mapData?.find((entry) => entry.svgPathId === svgPathId);
                  setSelectedRegionId((prev) => (prev === region?.regionId ? '' : region?.regionId || ''));
                  setPage(1);
                }}
              />
            </div>
            <div className="mt-3 text-xs text-[#6b7280]">
              Color scale: 0-10, 11-50, 51-100, &gt;100 need reports.
            </div>
          </div>

          <div className="lg:w-1/3">
            <div className="rounded-lg border bg-white p-4">
              <h3 className="text-sm font-semibold text-[#6b7280]">REGION COUNTS</h3>
              <div className="mt-3 space-y-2">
                {mapData
                  ?.slice()
                  .sort((a, b) => b.count - a.count)
                  .map((entry) => (
                    <button
                      key={entry.regionId}
                      onClick={() => {
                        setSelectedRegionId((prev) => (prev === entry.regionId ? '' : entry.regionId));
                        setPage(1);
                      }}
                      className={`flex w-full items-center justify-between rounded-md border px-3 py-2 text-sm transition-colors ${
                        selectedRegionId === entry.regionId
                          ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <span>{entry.regionName}</span>
                      <span className="font-semibold">{entry.count}</span>
                    </button>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 rounded-lg border bg-white">
        <div className="flex items-center justify-between p-4 pb-0">
          <h2 className="text-lg font-semibold text-[#111827]">Assigned need reports list</h2>
          <Input
            placeholder="Search by title or name..."
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            className="w-72"
          />
        </div>

        {needsQuery.isLoading ? (
          <div className="p-4">
            <TableLoadingSkeleton />
          </div>
        ) : (
          <>
            <DataTable columns={columns} data={needsQuery.data?.data ?? []} />
            {needsQuery.data ? (
              <Pagination
                page={needsQuery.data.meta.page}
                totalPages={needsQuery.data.meta.totalPages}
                total={needsQuery.data.meta.total}
                perPage={needsQuery.data.meta.perPage}
                onPageChange={setPage}
                onPerPageChange={(pp) => {
                  setPerPage(pp);
                  setPage(1);
                }}
              />
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
