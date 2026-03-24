'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { type ColumnDef, type SortingState } from '@tanstack/react-table';
import { DataTable } from '@/components/admin/data-table';
import { Pagination } from '@/components/admin/pagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useOrganisations } from '@/lib/api/organisations';
import type { Organisation } from '@/types/api';

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
      accessorKey: 'isActive',
      header: 'Account',
      cell: ({ getValue }) => (
        <Badge variant={getValue() ? 'success' : 'danger'}>
          {getValue() ? 'Active' : 'Inactive'}
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
        <h1 className="text-2xl font-bold">Users management</h1>
        <Button onClick={() => router.push('/admin/organisations/new')}>Add organisation</Button>
      </div>

      <div className="mt-6 rounded-lg border bg-white">
        <div className="border-b p-4">
          <h2 className="text-lg font-semibold">Organisations</h2>
        </div>

        <div className="flex justify-end p-4 pb-0">
          <Input
            placeholder="Search..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-64"
          />
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
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
