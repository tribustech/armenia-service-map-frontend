'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
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
import { USER_ROLE_LABEL_KEYS, formatStatusLabel } from '@/lib/formatting/status-label';

export default function UsersPage() {
  const router = useRouter();
  const t = useTranslations('admin.users');
  const tCols = useTranslations('admin.users.columns');
  const tRoles = useTranslations('admin.users.roles');
  const tCommon = useTranslations('admin.common');
  const roleLabel = (role: string) =>
    USER_ROLE_LABEL_KEYS[role] ? tRoles(USER_ROLE_LABEL_KEYS[role]) : formatStatusLabel(role);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);

  const sortBy = sorting[0]?.id;
  const sortOrder = sorting[0]?.desc ? 'desc' : 'asc';

  const { data, isLoading } = useUsers({ page, perPage, search, sortBy, sortOrder });

  const columns: ColumnDef<User, unknown>[] = [
    { accessorKey: 'firstName', header: tCols('firstName'), enableSorting: true },
    { accessorKey: 'lastName', header: tCols('lastName'), enableSorting: true },
    { accessorKey: 'email', header: tCols('email') },
    {
      accessorKey: 'role',
      header: tCols('role'),
      cell: ({ getValue }) => (
        <Badge variant="neutral">{roleLabel(getValue() as string)}</Badge>
      ),
    },
    {
      accessorFn: (row) => row.organisation?.name,
      id: 'organisation',
      header: tCols('organisation'),
      cell: ({ getValue }) => (getValue() as string) || '—',
    },
    {
      accessorKey: 'createdAt',
      header: tCols('created'),
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
          {tCommon('view')}
        </button>
      ),
    },
  ];

  return (
    <div>
      <AdminPageHeader>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-[#111827]">{t('allUsers')}</h1>
          <p className="mt-1 text-sm text-[#6b7280]">{t('description')}</p>
        </div>
        <Button onClick={() => router.push('/admin/users/new')}>{t('addUser')}</Button>
      </AdminPageHeader>

      <AdminPanel className="mt-6 overflow-hidden">
        <AdminToolbar layout="compact-end">
          <TableSearchInput
            placeholder={tCommon('searchPlaceholder')}
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
              onRowClick={(row) => router.push(`/admin/users/${row.id}`)}
              mobileCard={(row) => ({
                title: `${row.firstName} ${row.lastName}`.trim(),
                badges: <Badge variant="neutral">{roleLabel(row.role)}</Badge>,
                fields: [
                  { label: tCols('email'), value: row.email },
                  { label: tCols('organisation'), value: row.organisation?.name || '—' },
                  { label: tCols('created'), value: new Date(row.createdAt).toLocaleDateString() },
                ],
                action: <button type="button" onClick={() => router.push(`/admin/users/${row.id}`)} className="admin-link-button">{tCommon('view')}</button>,
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
