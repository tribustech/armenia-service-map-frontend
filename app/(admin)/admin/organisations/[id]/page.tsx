'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { type ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/admin/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useOrganisation, useUpdateOrganisation } from '@/lib/api/organisations';
import { useUsers } from '@/lib/api/users';
import type { User } from '@/types/api';

type Tab = 'details' | 'users';
const statusLabel: Record<'ACTIVE' | 'PENDING' | 'SUSPENDED', string> = {
  ACTIVE: 'Active',
  PENDING: 'Pending',
  SUSPENDED: 'Suspended',
};
const statusVariant: Record<'ACTIVE' | 'PENDING' | 'SUSPENDED', 'success' | 'warning' | 'danger'> = {
  ACTIVE: 'success',
  PENDING: 'warning',
  SUSPENDED: 'danger',
};

export default function OrganisationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('details');
  const { data: org, isLoading } = useOrganisation(id);
  const updateOrg = useUpdateOrganisation();

  if (isLoading) return <div className="p-8 text-gray-500">Loading...</div>;
  if (!org) return <div className="p-8 text-gray-500">Organisation not found</div>;

  return (
    <div>
      <div className="mb-2 text-sm text-gray-500">
        <Link href="/admin/organisations" className="hover:underline">Users management</Link>
        {' > '}
        <span>{org.name}</span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">{org.name}</h1>
          <Badge variant={statusVariant[org.status]}>{statusLabel[org.status]}</Badge>
        </div>
        <Button
          variant="danger"
          onClick={() => {
            updateOrg.mutate({
              id: org.id,
              status: org.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED',
            });
          }}
        >
          {org.status === 'SUSPENDED' ? 'Activate organisation' : 'Deactivate organisation'}
        </Button>
      </div>

      <div className="mt-4 flex gap-1 rounded-lg bg-gray-100 p-1" style={{ width: 'fit-content' }}>
        <button
          onClick={() => setActiveTab('details')}
          className={`rounded-md px-4 py-2 text-sm font-medium ${
            activeTab === 'details' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-600'
          }`}
        >
          Organisation details
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`rounded-md px-4 py-2 text-sm font-medium ${
            activeTab === 'users' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-600'
          }`}
        >
          Organisation users
        </button>
      </div>

      <div className="mt-6">
        {activeTab === 'details' ? (
          <div className="rounded-lg border bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Organisation details</h2>
            </div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              <div>
                <div className="text-sm font-medium text-gray-500">Name</div>
                <div className="mt-1">{org.name}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500">Location</div>
                <div className="mt-1">{org.region?.name || '—'}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500">Contact email</div>
                <div className="mt-1">{org.contactPersonEmail || '—'}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500">Contact phone</div>
                <div className="mt-1">{org.contactPersonPhone || '—'}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500">Website</div>
                <div className="mt-1">{org.website || '—'}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500">Address</div>
                <div className="mt-1">{org.streetAddress || '—'}</div>
              </div>
              <div className="col-span-2">
                <div className="text-sm font-medium text-gray-500">Description</div>
                <div className="mt-1">{org.description || '—'}</div>
              </div>
            </div>
          </div>
        ) : (
          <OrgUsersTab organisationId={org.id} />
        )}
      </div>
    </div>
  );
}

function OrgUsersTab({ organisationId }: { organisationId: string }) {
  const router = useRouter();
  const { data, isLoading } = useUsers({ organisationId });

  const columns: ColumnDef<User, unknown>[] = [
    { accessorKey: 'firstName', header: 'First name', enableSorting: true },
    { accessorKey: 'lastName', header: 'Last name', enableSorting: true },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ getValue }) => (
        <Badge variant="neutral">{(getValue() as string).replace(/_/g, ' ')}</Badge>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Joined',
      cell: ({ getValue }) => new Date(getValue() as string).toLocaleDateString(),
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
    <div className="rounded-lg border bg-white">
      <div className="flex items-center justify-between border-b p-4">
        <h2 className="text-lg font-semibold">All users</h2>
        <Button onClick={() => router.push(`/admin/users/new?organisationId=${organisationId}`)}>
          Add user
        </Button>
      </div>
      {isLoading ? (
        <div className="p-8 text-center text-gray-500">Loading...</div>
      ) : (
        <DataTable columns={columns} data={data?.data ?? []} />
      )}
    </div>
  );
}
