'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { type ColumnDef, type SortingState } from '@tanstack/react-table';
import { DataTable } from '@/components/admin/data-table';
import { Pagination } from '@/components/admin/pagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useOrgServices } from '@/lib/api/services';
import type { Service } from '@/types/api';

export default function OrgServicesPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);

  const sortBy = sorting[0]?.id;
  const sortOrder = sorting[0]?.desc ? 'desc' : 'asc';
  const { data, isLoading } = useOrgServices({ page, perPage, search, sortBy, sortOrder });

  const columns: ColumnDef<Service, unknown>[] = [
    { accessorKey: 'title', header: 'Service', enableSorting: true },
    {
      accessorFn: (row) => row.topics.map((t) => t.topic.name).join(', '),
      id: 'topics',
      header: 'Topics',
    },
    {
      accessorKey: 'status',
      header: 'Publication',
      cell: ({ getValue }) => {
        const value = String(getValue());
        return <Badge variant={value === 'PUBLISHED' ? 'success' : 'warning'}>{value}</Badge>;
      },
    },
    {
      accessorKey: 'isAvailable',
      header: 'Availability',
      cell: ({ getValue }) => <Badge variant={getValue() ? 'success' : 'danger'}>{getValue() ? 'Available' : 'Unavailable'}</Badge>,
    },
    {
      accessorKey: 'updatedAt',
      header: 'Updated',
      cell: ({ getValue }) => new Date(getValue() as string).toLocaleDateString(),
      enableSorting: true,
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <button onClick={() => router.push(`/org/services/${row.original.id}`)} className="text-sm text-blue-600 hover:underline">View</button>
          <button onClick={() => router.push(`/org/services/${row.original.id}/edit`)} className="text-sm text-blue-600 hover:underline">Edit</button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Our services</h1>
        <Button onClick={() => router.push('/org/services/new')}>Add service</Button>
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
            {data && <Pagination page={data.meta.page} totalPages={data.meta.totalPages} total={data.meta.total} perPage={data.meta.perPage} onPageChange={setPage} onPerPageChange={(pp) => { setPerPage(pp); setPage(1); }} />}
          </>
        )}
      </div>
    </div>
  );
}
