'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { type ColumnDef, type SortingState } from '@tanstack/react-table';
import { DataTable } from '@/components/admin/data-table';
import { Pagination } from '@/components/admin/pagination';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAdminNeeds } from '@/lib/api/needs';
import type { NeedReport } from '@/types/api';

const statusVariant: Record<string, 'neutral' | 'warning' | 'success' | 'danger'> = {
  NEW: 'neutral',
  ASSIGNED: 'warning',
  RESOLVED: 'success',
  CLOSED: 'danger',
};

export default function AdminNeedsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);

  const sortBy = sorting[0]?.id;
  const sortOrder = sorting[0]?.desc ? 'desc' : 'asc';
  const { data, isLoading } = useAdminNeeds({ page, perPage, search, sortBy, sortOrder, status: statusFilter || undefined });

  const columns: ColumnDef<NeedReport, unknown>[] = [
    {
      accessorKey: 'fullName',
      header: 'Name',
      enableSorting: true,
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ getValue }) => <span className="line-clamp-1">{getValue() as string}</span>,
    },
    {
      accessorFn: (row) => row.region?.name || '—',
      id: 'region',
      header: 'Region',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => {
        const s = getValue() as string;
        return <Badge variant={statusVariant[s] || 'neutral'}>{s}</Badge>;
      },
    },
    {
      accessorFn: (row) => row.assignedOrganisation?.name || '—',
      id: 'assignedOrganisation',
      header: 'Assigned to',
    },
    {
      accessorKey: 'createdAt',
      header: 'Submitted',
      cell: ({ getValue }) => new Date(getValue() as string).toLocaleDateString(),
      enableSorting: true,
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <button onClick={() => router.push(`/admin/needs/${row.original.id}`)} className="text-sm text-blue-600 hover:underline">View</button>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Need reports</h1>
        <button onClick={() => router.push('/admin/needs/map')} className="text-sm text-blue-600 hover:underline">View map</button>
      </div>

      <div className="mt-6 rounded-lg border bg-white">
        <div className="flex items-center justify-end gap-3 p-4 pb-0">
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="rounded-md border border-gray-300 px-3 py-2 text-sm">
            <option value="">All statuses</option>
            <option value="NEW">New</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>
          <Input placeholder="Search..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="w-64" />
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : (
          <>
            <DataTable columns={columns} data={data?.data ?? []} sorting={sorting} onSortingChange={setSorting} />
            {data && <Pagination page={data.meta.page} totalPages={data.meta.totalPages} total={data.meta.total} perPage={data.meta.perPage} onPageChange={setPage} onPerPageChange={(pp) => { setPerPage(pp); setPage(1); }} />}
          </>
        )}
      </div>
    </div>
  );
}
