'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { type ColumnDef, type SortingState } from '@tanstack/react-table';
import { DataTable } from '@/components/admin/data-table';
import { Pagination } from '@/components/admin/pagination';
import { AdminPageHeader, AdminPanel, AdminToolbar } from '@/components/admin/admin-surface';
import { Button } from '@/components/ui/button';
import { CheckCircleIcon, XCircleIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import { useAdminServices } from '@/lib/api/services';
import type { Service } from '@/types/api';
import { Badge } from '@/components/ui/badge';
import { TableSearchInput, TableSelect } from '@/components/ui/table-controls';
import { TableLoadingSkeleton } from '@/components/shared/loading-skeletons';

export default function AdminServicesPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED' | ''>('');
  const [sorting, setSorting] = useState<SortingState>([]);

  const sortBy = sorting[0]?.id;
  const sortOrder = sorting[0]?.desc ? 'desc' : 'asc';

  const { data, isLoading } = useAdminServices({
    page,
    perPage,
    search,
    sortBy,
    sortOrder,
    status: status || undefined,
  });

  const columns: ColumnDef<Service, unknown>[] = [
    { accessorKey: 'title', header: 'Title', enableSorting: true },
    {
      accessorFn: (row) => row.organisation.name,
      id: 'organisation',
      header: 'Organisation',
      enableSorting: false,
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
      accessorKey: 'status',
      header: 'State',
      enableSorting: true,
      cell: ({ getValue }) => {
        const value = String(getValue());
        return (
          <Badge variant={value === 'PUBLISHED' ? 'success' : 'warning'}>
            {value === 'PUBLISHED' ? 'Published' : 'Draft'}
          </Badge>
        );
      },
    },
    {
      accessorFn: (row) => row.targetGroups?.map((item) => item.targetGroup.name).join(', ') ?? '',
      id: 'targetGroup',
      header: 'Target group',
      enableSorting: false,
    },
    {
      id: 'topics',
      header: 'Topics',
      enableSorting: false,
      cell: ({ row }) => {
        const firstTopic = row.original.topics?.[0]?.topic;
        if (!firstTopic) return null;
        return (
          <span className="text-sm font-medium text-[#E8922D]">
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
          className="flex items-center gap-1 text-sm text-[#6b7280] hover:text-[#374151]"
        >
          <Cog6ToothIcon className="h-4 w-4" />
          View
        </button>
      ),
    },
  ];

  return (
    <div>
      <AdminPageHeader>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-[#111827]">Service directory</h1>
          <p className="mt-1 text-sm text-[#6b7280]">Review publication state, coverage, and availability across partner services.</p>
        </div>
        <Button onClick={() => router.push('/admin/services/new')}>Add new service</Button>
      </AdminPageHeader>

      <AdminPanel className="mt-6 overflow-hidden">
        <AdminToolbar>
          <TableSelect
            value={status}
            onChange={(event) => {
              setStatus(event.target.value as 'DRAFT' | 'PUBLISHED' | '');
              setPage(1);
            }}
            className="sm:w-[194px]"
          >
            <option value="">All states</option>
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
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
                title: row.title,
                badges: (
                  <>
                    <Badge variant={row.status === 'PUBLISHED' ? 'success' : 'warning'}>
                      {row.status === 'PUBLISHED' ? 'Published' : 'Draft'}
                    </Badge>
                    <Badge variant={row.isAvailable ? 'success' : 'danger'}>
                      {row.isAvailable ? 'Available' : 'Unavailable'}
                    </Badge>
                  </>
                ),
                fields: [
                  { label: 'Organisation', value: row.organisation.name },
                  { label: 'Location', value: row.region?.name || '—' },
                  { label: 'Target groups', value: row.targetGroups?.map((item) => item.targetGroup.name).join(', ') || '—' },
                  { label: 'Topics', value: row.topics?.length ? `${row.topics[0].topic.name}${row.topics.length > 1 ? ` +${row.topics.length - 1}` : ''}` : '—' },
                  { label: 'Last updated', value: new Date(row.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) },
                ],
                action: <button type="button" onClick={() => router.push(`/admin/services/${row.id}`)} className="admin-link-button">View</button>,
              })}
            />
            {data && (
              <Pagination page={data.meta.page} totalPages={data.meta.totalPages} total={data.meta.total} perPage={data.meta.perPage} onPageChange={setPage} onPerPageChange={(pp) => { setPerPage(pp); setPage(1); }} />
            )}
          </>
        )}
      </AdminPanel>
    </div>
  );
}
