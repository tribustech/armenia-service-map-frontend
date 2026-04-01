'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { type ColumnDef, type SortingState } from '@tanstack/react-table';
import { DataTable } from '@/components/admin/data-table';
import { Pagination } from '@/components/admin/pagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircleIcon, XCircleIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import { useAdminServices } from '@/lib/api/services';
import type { Service } from '@/types/api';

export default function AdminServicesPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);

  const sortBy = sorting[0]?.id;
  const sortOrder = sorting[0]?.desc ? 'desc' : 'asc';

  const { data, isLoading } = useAdminServices({ page, perPage, search, sortBy, sortOrder });

  const columns: ColumnDef<Service, unknown>[] = [
    { accessorKey: 'title', header: 'Title', enableSorting: true },
    {
      accessorFn: (row) => row.organisation.name,
      id: 'organisation',
      header: 'Organisation',
    },
    {
      accessorFn: (row) => row.region?.name ?? '',
      id: 'location',
      header: 'Location',
      enableSorting: true,
    },
    {
      accessorKey: 'isAvailable',
      header: 'Availability',
      enableSorting: true,
      cell: ({ getValue }) => (
        getValue() ? (
          <CheckCircleIcon className="h-5 w-5 text-green-500" />
        ) : (
          <XCircleIcon className="h-5 w-5 text-red-400" />
        )
      ),
    },
    {
      accessorFn: (row) => row.targetGroups?.map((item) => item.targetGroup.name).join(', ') ?? '',
      id: 'targetGroup',
      header: 'Target group',
      enableSorting: true,
    },
    {
      id: 'topics',
      header: 'Topics',
      enableSorting: true,
      cell: ({ row }) => {
        const firstTopic = row.original.topics?.[0]?.topic;
        if (!firstTopic) return null;
        return (
          <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
            {firstTopic.name}
          </span>
        );
      },
    },
    {
      accessorKey: 'updatedAt',
      header: 'Last Updated',
      cell: ({ getValue }) => new Date(getValue() as string).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      enableSorting: true,
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <button
          onClick={() => router.push(`/admin/services/${row.original.id}`)}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <Cog6ToothIcon className="h-4 w-4" />
          View
        </button>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Service directory</h1>
        <Button onClick={() => router.push('/admin/services/new')}>Add new service</Button>
      </div>

      <div className="mt-6 rounded-lg border bg-white">
        <div className="flex justify-end p-4 pb-0">
          <Input placeholder="Search..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="w-64" />
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : (
          <>
            <DataTable columns={columns} data={data?.data ?? []} sorting={sorting} onSortingChange={setSorting} />
            {data && (
              <Pagination page={data.meta.page} totalPages={data.meta.totalPages} total={data.meta.total} perPage={data.meta.perPage} onPageChange={setPage} onPerPageChange={(pp) => { setPerPage(pp); setPage(1); }} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
