'use client';

import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/admin/data-table';
import type { TopicChildDetail } from '@/types/api';
import type { ColumnDef } from '@tanstack/react-table';

type TopicSubtopicsTableProps = {
  rows: TopicChildDetail[];
  pendingId?: string | null;
  onToggleStatus?: (row: { id: string; status: 'ACTIVE' | 'INACTIVE' }) => void;
};

export function TopicSubtopicsTable({ rows, pendingId, onToggleStatus }: TopicSubtopicsTableProps) {
  const t = useTranslations('admin.taxonomy');
  const tStatuses = useTranslations('admin.statuses');

  const columns: ColumnDef<TopicChildDetail, unknown>[] = [
    { accessorKey: 'id', header: t('columns.id') },
    { accessorKey: 'name', header: t('serviceTopics') },
    {
      accessorFn: (row) => row._count.services,
      id: 'usage',
      header: t('columns.usage'),
    },
    {
      accessorKey: 'status',
      header: t('columns.status'),
      cell: ({ row }) => {
        const nextStatus = row.original.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        const isPending = pendingId === row.original.id;

        return (
          <button
            type="button"
            className="inline-flex items-center gap-2"
            aria-label={t('form.setRowStatusAria', {
              name: row.original.name,
              status: nextStatus === 'ACTIVE' ? tStatuses('active') : tStatuses('inactive'),
            })}
            onClick={() => onToggleStatus?.({ id: row.original.id, status: nextStatus })}
            disabled={!onToggleStatus || isPending}
          >
            <Badge variant={row.original.status === 'ACTIVE' ? 'success' : 'neutral'}>
              {isPending ? t('updating') : row.original.status === 'ACTIVE' ? tStatuses('active') : tStatuses('inactive')}
            </Badge>
          </button>
        );
      },
    },
    {
      accessorKey: 'updatedAt',
      header: t('columns.lastUpdate'),
      cell: ({ getValue }) => new Date(getValue() as string).toLocaleDateString(),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={rows}
      emptyLabel={t('noSubtopics')}
      mobileCard={(row) => ({
        eyebrow: row.id,
        title: row.name,
        badges: (
          <Badge variant={row.status === 'ACTIVE' ? 'success' : 'neutral'}>
            {row.status === 'ACTIVE' ? tStatuses('active') : tStatuses('inactive')}
          </Badge>
        ),
        fields: [
          { label: t('columns.usage'), value: row._count.services },
          { label: t('columns.lastUpdate'), value: new Date(row.updatedAt).toLocaleDateString() },
        ],
        action: onToggleStatus ? (
          <button
            type="button"
            onClick={() => onToggleStatus({ id: row.id, status: row.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' })}
            className="admin-link-button"
            aria-label={t('form.toggleRowStatusAria', { name: row.name })}
            disabled={pendingId === row.id}
          >
            {pendingId === row.id ? t('updating') : t('toggle')}
          </button>
        ) : undefined,
      })}
    />
  );
}
