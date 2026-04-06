'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { type ColumnDef, type SortingState } from '@tanstack/react-table';
import { DataTable } from '@/components/admin/data-table';
import { Pagination } from '@/components/admin/pagination';
import { AdminPageHeader, AdminPanel, AdminToolbar } from '@/components/admin/admin-surface';
import { Badge } from '@/components/ui/badge';
import { TableSearchInput, TableSelect } from '@/components/ui/table-controls';
import { useAdminNeeds } from '@/lib/api/needs';
import { formatStatusLabel } from '@/lib/formatting/status-label';
import type { NeedReport } from '@/types/api';
import { TableLoadingSkeleton } from '@/components/shared/loading-skeletons';

const statusVariant: Record<string, 'neutral' | 'warning' | 'success' | 'danger'> = {
  NEW: 'neutral',
  IN_PROGRESS: 'warning',
  SOLVED: 'success',
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
      accessorKey: 'id',
      header: 'ID',
      cell: ({ getValue }) => (
        <span className="font-mono text-xs text-[#6b7280]">{String(getValue()).slice(0, 8)}</span>
      ),
    },
    {
      accessorKey: 'title',
      header: 'Title',
      enableSorting: true,
      cell: ({ row }) => (
        <span className="line-clamp-1 font-medium text-[#111827]">
          {row.original.title || row.original.description.slice(0, 60)}
        </span>
      ),
    },
    {
      accessorFn: (row) => row.fullName,
      id: 'fullName',
      header: 'Submitted by',
      cell: ({ getValue }) => <span className="line-clamp-1">{String(getValue())}</span>,
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
        return <Badge variant={statusVariant[s] || 'neutral'}>{formatStatusLabel(s)}</Badge>;
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
        <button onClick={() => router.push(`/admin/needs/${row.original.id}`)} className="text-sm text-[#E8922D] hover:underline">
          View
        </button>
      ),
    },
  ];

  return (
    <div>
      <AdminPageHeader>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-[#111827]">Need reports</h1>
          <p className="mt-1 text-sm text-[#6b7280]">Track status, assignment, and incoming needs across the admin workspace.</p>
        </div>
        <button onClick={() => router.push('/admin/needs/map')} className="admin-link-button self-start">View map</button>
      </AdminPageHeader>

      <AdminPanel className="mt-6 overflow-hidden">
        <AdminToolbar>
          <TableSelect value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="sm:w-[194px]">
            <option value="">All statuses</option>
            <option value="NEW">New</option>
            <option value="IN_PROGRESS">In progress</option>
            <option value="SOLVED">Solved</option>
            <option value="CLOSED">Closed</option>
          </TableSelect>
          <TableSearchInput placeholder="Search..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="sm:w-72" />
        </AdminToolbar>

        {isLoading ? (
          <div className="p-4">
            <TableLoadingSkeleton />
          </div>
        ) : (
          <>
            <DataTable
              columns={columns}
              data={data?.data ?? []}
              sorting={sorting}
              onSortingChange={setSorting}
              mobileCard={(row) => ({
                eyebrow: String(row.id).slice(0, 8),
                title: row.title || row.description.slice(0, 60),
                badges: <Badge variant={statusVariant[row.status] || 'neutral'}>{formatStatusLabel(row.status)}</Badge>,
                fields: [
                  { label: 'Submitted by', value: row.fullName },
                  { label: 'Region', value: row.region?.name || '—' },
                  { label: 'Assigned to', value: row.assignedOrganisation?.name || '—' },
                  { label: 'Submitted', value: new Date(row.createdAt).toLocaleDateString() },
                ],
                action: <button type="button" onClick={() => router.push(`/admin/needs/${row.id}`)} className="admin-link-button">View</button>,
              })}
            />
            {data && <Pagination page={data.meta.page} totalPages={data.meta.totalPages} total={data.meta.total} perPage={data.meta.perPage} onPageChange={setPage} onPerPageChange={(pp) => { setPerPage(pp); setPage(1); }} />}
          </>
        )}
      </AdminPanel>
    </div>
  );
}
