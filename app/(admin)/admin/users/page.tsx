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
import { useUsers } from '@/lib/api/users';
import type { User } from '@/types/api';
import { TableLoadingSkeleton } from '@/components/shared/loading-skeletons';

export default function UsersPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);

  const sortBy = sorting[0]?.id;
  const sortOrder = sorting[0]?.desc ? 'desc' : 'asc';

  const { data, isLoading } = useUsers({ page, perPage, search, sortBy, sortOrder });

  const columns: ColumnDef<User, unknown>[] = [
    { accessorKey: 'firstName', header: 'First name', enableSorting: true },
    { accessorKey: 'lastName', header: 'Last name', enableSorting: true },
    { accessorKey: 'email', header: 'Email' },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ getValue }) => (
        <Badge variant="neutral">{(getValue() as string).replace(/_/g, ' ')}</Badge>
      ),
    },
    {
      accessorFn: (row) => row.organisation?.name,
      id: 'organisation',
      header: 'Organisation',
      cell: ({ getValue }) => (getValue() as string) || '—',
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ getValue }) => new Date(getValue() as string).toLocaleDateString(),
      enableSorting: true,
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <button
          onClick={() => router.push(`/admin/users/${row.original.id}`)}
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
          <h1 className="text-3xl font-semibold tracking-tight text-[#111827]">All users</h1>
          <p className="mt-1 text-sm text-[#6b7280]">Manage admin and organisation accounts from one polished directory.</p>
        </div>
        <Button onClick={() => router.push('/admin/users/new')}>Add user</Button>
      </AdminPageHeader>

      <AdminPanel className="mt-6 overflow-hidden">
        <AdminToolbar layout="compact-end">
          <TableSearchInput
            placeholder="Search..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            size="compact"
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
                title: `${row.firstName} ${row.lastName}`.trim(),
                badges: <Badge variant="neutral">{row.role.replace(/_/g, ' ')}</Badge>,
                fields: [
                  { label: 'Email', value: row.email },
                  { label: 'Organisation', value: row.organisation?.name || '—' },
                  { label: 'Created', value: new Date(row.createdAt).toLocaleDateString() },
                ],
                action: <button type="button" onClick={() => router.push(`/admin/users/${row.id}`)} className="admin-link-button">View</button>,
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
