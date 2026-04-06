'use client';

import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/admin/data-table';
import { formatStatusLabel } from '@/lib/formatting/status-label';
import type { TopicChildDetail } from '@/types/api';
import type { ColumnDef } from '@tanstack/react-table';

type TopicSubtopicsTableProps = {
  rows: TopicChildDetail[];
  pendingId?: string | null;
  onToggleStatus?: (row: { id: string; status: 'ACTIVE' | 'INACTIVE' }) => void;
};

export function TopicSubtopicsTable({ rows, pendingId, onToggleStatus }: TopicSubtopicsTableProps) {
  const columns: ColumnDef<TopicChildDetail, unknown>[] = [
    { accessorKey: 'id', header: 'ID' },
    { accessorKey: 'name', header: 'Sub-topics' },
    {
      accessorFn: (row) => row._count.services,
      id: 'usage',
      header: 'Usage',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const nextStatus = row.original.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        const isPending = pendingId === row.original.id;

        return (
          <button
            type="button"
            className="inline-flex items-center gap-2"
            aria-label={`Set ${row.original.name} ${nextStatus.toLowerCase()}`}
            onClick={() => onToggleStatus?.({ id: row.original.id, status: nextStatus })}
            disabled={!onToggleStatus || isPending}
          >
            <Badge variant={row.original.status === 'ACTIVE' ? 'success' : 'neutral'}>
              {isPending ? 'Updating...' : row.original.status === 'ACTIVE' ? 'Active' : 'Inactive'}
            </Badge>
          </button>
        );
      },
    },
    {
      accessorKey: 'updatedAt',
      header: 'Last update',
      cell: ({ getValue }) => new Date(getValue() as string).toLocaleDateString(),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={rows}
      emptyLabel="No sub-topics found"
      mobileCard={(row) => ({
        eyebrow: row.id,
        title: row.name,
        badges: <Badge variant={row.status === 'ACTIVE' ? 'success' : 'neutral'}>{formatStatusLabel(row.status)}</Badge>,
        fields: [
          { label: 'Usage', value: row._count.services },
          { label: 'Last update', value: new Date(row.updatedAt).toLocaleDateString() },
        ],
        action: onToggleStatus ? (
          <button
            type="button"
            onClick={() => onToggleStatus({ id: row.id, status: row.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' })}
            className="admin-link-button"
            aria-label={`Toggle ${row.name} status`}
            disabled={pendingId === row.id}
          >
            {pendingId === row.id ? 'Updating...' : 'Toggle'}
          </button>
        ) : undefined,
      })}
    />
  );
}
