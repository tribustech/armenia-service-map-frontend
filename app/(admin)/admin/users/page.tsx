'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { type ColumnDef, type SortingState } from '@tanstack/react-table';
import { DataTable } from '@/components/admin/data-table';
import { Pagination } from '@/components/admin/pagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
          className="text-sm text-blue-600 hover:underline"
        >
          View
        </button>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">All users</h1>
        <Button onClick={() => router.push('/admin/users/new')}>Add user</Button>
      </div>

      <div className="mt-6 rounded-lg border bg-white">
        <div className="flex justify-end p-4 pb-0">
          <Input
            placeholder="Search..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-64"
          />
        </div>

        {isLoading ? (
          <div className="p-4">
            <TableLoadingSkeleton />
          </div>
        ) : (
          <>
            <DataTable columns={columns} data={data?.data ?? []} sorting={sorting} onSortingChange={setSorting} />
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
      </div>
    </div>
  );
}
