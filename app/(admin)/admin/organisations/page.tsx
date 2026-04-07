'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { type ColumnDef, type SortingState } from '@tanstack/react-table';
import { DataTable } from '@/components/admin/data-table';
import { Pagination } from '@/components/admin/pagination';
import { AdminPageHeader, AdminPanel, AdminToolbar } from '@/components/admin/admin-surface';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TableSearchInput } from '@/components/ui/table-controls';
import { useOrganisations } from '@/lib/api/organisations';
import { formatStatusLabel } from '@/lib/formatting/status-label';
import type { Organisation } from '@/types/api';
import { TableLoadingSkeleton } from '@/components/shared/loading-skeletons';

const accountBadge: Record<Organisation['status'], 'success' | 'warning' | 'danger'> = {
  ACTIVE: 'success',
  PENDING: 'warning',
  REJECTED: 'danger',
  SUSPENDED: 'danger',
};

export default function OrganisationsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);

  const sortBy = sorting[0]?.id;
  const sortOrder = sorting[0]?.desc ? 'desc' : 'asc';

  const { data, isLoading } = useOrganisations({ page, perPage, search, sortBy, sortOrder });

  const columns: ColumnDef<Organisation, unknown>[] = [
    { accessorKey: 'name', header: 'Name', enableSorting: true },
    {
      accessorKey: 'status',
      header: 'Account',
      cell: ({ getValue }) => (
        <Badge variant={accountBadge[getValue() as Organisation['status']]}>
          {formatStatusLabel(String(getValue()))}
        </Badge>
      ),
      enableSorting: true,
    },
    {
      accessorKey: 'updatedAt',
      header: 'Last access',
      cell: ({ getValue }) => new Date(getValue() as string).toLocaleDateString(),
      enableSorting: true,
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <button
          onClick={() => router.push(`/admin/organisations/${row.original.id}`)}
          className="text-sm text-[#E8922D] hover:underline"
        >
          View
        </button>
      ),
    },
  ];

  return (
    <div>
      <AdminPageHeader>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-[#111827]">Users management</h1>
          <p className="mt-1 text-sm text-[#6b7280]">Review organisation health, access, and coverage at a glance.</p>
        </div>
        <Button onClick={() => router.push('/admin/organisations/new')}>Add organisation</Button>
      </AdminPageHeader>

      <AdminPanel className="mt-6 overflow-hidden">
        <div className="border-b border-[#f0f0f0] px-5 py-4">
          <h2 className="text-lg font-semibold text-[#111827]">Organisations</h2>
        </div>

        <AdminToolbar>
          <TableSearchInput
            placeholder="Search..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="sm:w-72"
          />
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
                title: row.name,
                badges: <Badge variant={accountBadge[row.status]}>{formatStatusLabel(row.status)}</Badge>,
                fields: [
                  { label: 'Last access', value: new Date(row.updatedAt).toLocaleDateString() },
                  { label: 'Region', value: row.region?.name || '—' },
                  { label: 'Users', value: row._count.users },
                  { label: 'Services', value: row._count.services },
                ],
                action: <button type="button" onClick={() => router.push(`/admin/organisations/${row.id}`)} className="admin-link-button">View</button>,
              })}
            />
            {data && (
              <Pagination
                page={data.meta.page}
                totalPages={data.meta.totalPages}
                total={data.meta.total}
                perPage={data.meta.perPage}
                onPageChange={setPage}
                onPerPageChange={(pp) => { setPerPage(pp); setPage(1); }}
              />
            )}
          </>
        )}
      </AdminPanel>
    </div>
  );
}
