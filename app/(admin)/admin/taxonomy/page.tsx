'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { type ColumnDef, type SortingState } from '@tanstack/react-table';
import { AdminPanel, AdminToolbar } from '@/components/admin/admin-surface';
import { DataTable } from '@/components/admin/data-table';
import { Pagination } from '@/components/admin/pagination';
import { TableLoadingSkeleton } from '@/components/shared/loading-skeletons';
import { TaxonomyTabs } from '@/components/admin/taxonomy/taxonomy-tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TableSearchInput } from '@/components/ui/table-controls';
import { useTopics, useNeedTags, useTargetGroups } from '@/lib/api/taxonomy';
import { formatStatusLabel } from '@/lib/formatting/status-label';
import type { NeedTag, TargetGroup, Topic } from '@/types/api';

type Tab = 'topics' | 'need-tags' | 'target-groups';

export default function TaxonomyPage() {
  const [activeTab, setActiveTab] = useState<Tab>('topics');

  return (
    <div>
      <h1 className="text-2xl font-bold">Nomenclature</h1>
      <TaxonomyTabs active={activeTab} onChange={setActiveTab} />

      <div className="mt-6">
        {activeTab === 'topics' ? <TopicsSection /> : null}
        {activeTab === 'need-tags' ? <NeedTagsSection /> : null}
        {activeTab === 'target-groups' ? <TargetGroupsSection /> : null}
      </div>
    </div>
  );
}

function TopicsSection() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const sortBy = sorting[0]?.id;
  const sortOrder = sorting[0]?.desc ? 'desc' : 'asc';
  const { data, isLoading } = useTopics({ page, perPage, search, sortBy, sortOrder });

  const columns: ColumnDef<Topic, unknown>[] = [
    { accessorKey: 'id', header: 'ID', enableSorting: false },
    { accessorKey: 'name', header: 'Topics', enableSorting: true },
    {
      accessorFn: (row) => row._count.services,
      id: 'usage',
      header: 'Usage',
      enableSorting: false,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <Badge variant={row.original.status === 'ACTIVE' ? 'success' : 'neutral'}>{formatStatusLabel(row.original.status)}</Badge>,
    },
    {
      accessorKey: 'updatedAt',
      header: 'Last update',
      cell: ({ getValue }) => new Date(getValue() as string).toLocaleDateString(),
      enableSorting: true,
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <Link href={`/admin/taxonomy/topics/${row.original.id}`} className="admin-link-button">
          View
        </Link>
      ),
    },
  ];

  return (
    <AdminPanel className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-[#f0f0f0] p-4">
        <h2 className="text-lg font-semibold">Service topics</h2>
        <Button onClick={() => router.push('/admin/taxonomy/topics/new')}>Add topic</Button>
      </div>
      <AdminToolbar layout="compact-end">
        <TableSearchInput
          placeholder="Search..."
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          size="compact"
          className="sm:w-64"
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
              eyebrow: row.id,
              title: row.name,
              badges: <Badge variant={row.status === 'ACTIVE' ? 'success' : 'neutral'}>{formatStatusLabel(row.status)}</Badge>,
              fields: [
                { label: 'Usage', value: row._count.services },
                { label: 'Last update', value: new Date(row.updatedAt).toLocaleDateString() },
              ],
              action: (
                <Link href={`/admin/taxonomy/topics/${row.id}`} className="admin-link-button">
                  View
                </Link>
              ),
            })}
          />
          {data ? (
            <Pagination
              page={data.meta.page}
              totalPages={data.meta.totalPages}
              total={data.meta.total}
              perPage={data.meta.perPage}
              onPageChange={setPage}
              onPerPageChange={(nextPerPage) => {
                setPerPage(nextPerPage);
                setPage(1);
              }}
            />
          ) : null}
        </>
      )}
    </AdminPanel>
  );
}

function NeedTagsSection() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const sortBy = sorting[0]?.id;
  const sortOrder = sorting[0]?.desc ? 'desc' : 'asc';
  const { data, isLoading } = useNeedTags({ page, perPage, search, sortBy, sortOrder });

  const columns: ColumnDef<NeedTag, unknown>[] = [
    { accessorKey: 'id', header: 'ID', enableSorting: false },
    { accessorKey: 'name', header: 'Tag', enableSorting: true },
    {
      accessorFn: (row) => row._count.needReports,
      id: 'usage',
      header: 'Usage',
      enableSorting: false,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <Badge variant={row.original.status === 'ACTIVE' ? 'success' : 'neutral'}>{formatStatusLabel(row.original.status)}</Badge>,
    },
    {
      accessorKey: 'updatedAt',
      header: 'Last update',
      cell: ({ getValue }) => new Date(getValue() as string).toLocaleDateString(),
      enableSorting: true,
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <Link href={`/admin/taxonomy/need-tags/${row.original.id}`} className="admin-link-button">
          View
        </Link>
      ),
    },
  ];

  return (
    <AdminPanel className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-[#f0f0f0] p-4">
        <h2 className="text-lg font-semibold">Need tags</h2>
        <Button onClick={() => router.push('/admin/taxonomy/need-tags/new')}>Add tag</Button>
      </div>
      <AdminToolbar layout="compact-end">
        <TableSearchInput
          placeholder="Search..."
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          size="compact"
          className="sm:w-64"
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
              eyebrow: row.id,
              title: row.name,
              badges: <Badge variant={row.status === 'ACTIVE' ? 'success' : 'neutral'}>{formatStatusLabel(row.status)}</Badge>,
              fields: [
                { label: 'Usage', value: row._count.needReports },
                { label: 'Last update', value: new Date(row.updatedAt).toLocaleDateString() },
              ],
              action: (
                <Link href={`/admin/taxonomy/need-tags/${row.id}`} className="admin-link-button">
                  View
                </Link>
              ),
            })}
          />
          {data ? (
            <Pagination
              page={data.meta.page}
              totalPages={data.meta.totalPages}
              total={data.meta.total}
              perPage={data.meta.perPage}
              onPageChange={setPage}
              onPerPageChange={(nextPerPage) => {
                setPerPage(nextPerPage);
                setPage(1);
              }}
            />
          ) : null}
        </>
      )}
    </AdminPanel>
  );
}

function TargetGroupsSection() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const sortBy = sorting[0]?.id;
  const sortOrder = sorting[0]?.desc ? 'desc' : 'asc';
  const { data, isLoading } = useTargetGroups({ page, perPage, search, sortBy, sortOrder });

  const columns: ColumnDef<TargetGroup, unknown>[] = [
    { accessorKey: 'id', header: 'ID', enableSorting: false },
    { accessorKey: 'name', header: 'Target group', enableSorting: true },
    {
      accessorFn: (row) => row._count.services,
      id: 'usage',
      header: 'Usage',
      enableSorting: false,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <Badge variant={row.original.status === 'ACTIVE' ? 'success' : 'neutral'}>{formatStatusLabel(row.original.status)}</Badge>,
    },
    {
      accessorKey: 'updatedAt',
      header: 'Last update',
      cell: ({ getValue }) => new Date(getValue() as string).toLocaleDateString(),
      enableSorting: true,
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <Link href={`/admin/taxonomy/target-groups/${row.original.id}`} className="admin-link-button">
          View
        </Link>
      ),
    },
  ];

  return (
    <AdminPanel className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-[#f0f0f0] p-4">
        <h2 className="text-lg font-semibold">Target groups</h2>
        <Button onClick={() => router.push('/admin/taxonomy/target-groups/new')}>Add target group</Button>
      </div>
      <AdminToolbar layout="compact-end">
        <TableSearchInput
          placeholder="Search..."
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          size="compact"
          className="sm:w-64"
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
              eyebrow: row.id,
              title: row.name,
              badges: <Badge variant={row.status === 'ACTIVE' ? 'success' : 'neutral'}>{formatStatusLabel(row.status)}</Badge>,
              fields: [
                { label: 'Usage', value: row._count.services },
                { label: 'Last update', value: new Date(row.updatedAt).toLocaleDateString() },
              ],
              action: (
                <Link href={`/admin/taxonomy/target-groups/${row.id}`} className="admin-link-button">
                  View
                </Link>
              ),
            })}
          />
          {data ? (
            <Pagination
              page={data.meta.page}
              totalPages={data.meta.totalPages}
              total={data.meta.total}
              perPage={data.meta.perPage}
              onPageChange={setPage}
              onPerPageChange={(nextPerPage) => {
                setPerPage(nextPerPage);
                setPage(1);
              }}
            />
          ) : null}
        </>
      )}
    </AdminPanel>
  );
}
