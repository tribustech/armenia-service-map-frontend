'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { type ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/admin/data-table';
import { AdminPanel } from '@/components/admin/admin-surface';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { DetailPageLoadingSkeleton, TableLoadingSkeleton } from '@/components/shared/loading-skeletons';
import { useApproveOrganisation, useOrganisation, useRejectOrganisation, useUpdateOrganisation } from '@/lib/api/organisations';
import { useUsers } from '@/lib/api/users';
import type { User } from '@/types/api';

type Tab = 'details' | 'users';
const statusLabel: Record<'ACTIVE' | 'PENDING' | 'REJECTED' | 'SUSPENDED', string> = {
  ACTIVE: 'Active',
  PENDING: 'Pending',
  REJECTED: 'Rejected',
  SUSPENDED: 'Suspended',
};
const statusVariant: Record<'ACTIVE' | 'PENDING' | 'REJECTED' | 'SUSPENDED', 'success' | 'warning' | 'danger'> = {
  ACTIVE: 'success',
  PENDING: 'warning',
  REJECTED: 'danger',
  SUSPENDED: 'danger',
};

export default function OrganisationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<Tab>('details');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const { data: org, isLoading } = useOrganisation(id);
  const updateOrg = useUpdateOrganisation();
  const approveOrg = useApproveOrganisation();
  const rejectOrg = useRejectOrganisation();

  if (isLoading) return <DetailPageLoadingSkeleton />;
  if (!org) return <div className="p-8 text-[#6b7280]">Organisation not found</div>;

  return (
    <div>
      <div className="mb-2 text-sm text-[#6b7280]">
        <Link href="/admin/organisations" className="hover:underline">Users management</Link>
        {' > '}
        <span>{org.name}</span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">{org.name}</h1>
          <Badge variant={statusVariant[org.status]}>{statusLabel[org.status]}</Badge>
        </div>
        {org.status === 'PENDING' ? (
          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={() => approveOrg.mutate(org.id)}
              disabled={approveOrg.isPending || rejectOrg.isPending}
            >
              {approveOrg.isPending ? 'Approving...' : 'Approve organisation'}
            </Button>
            <Button
              variant="secondary"
              onClick={() => setIsRejectModalOpen(true)}
              disabled={approveOrg.isPending || rejectOrg.isPending}
            >
              {rejectOrg.isPending ? 'Rejecting...' : 'Reject organisation'}
            </Button>
          </div>
        ) : org.status === 'ACTIVE' || org.status === 'SUSPENDED' ? (
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
        ) : null}
      </div>

      <div
        className="admin-toolbar mt-4 flex gap-1 p-1.5"
        style={{ width: 'fit-content' }}
        role="tablist"
        aria-label="Organisation detail sections"
      >
        <button
          type="button"
          role="tab"
          id="admin-org-tab-details"
          aria-selected={activeTab === 'details'}
          aria-controls="admin-org-panel-details"
          onClick={() => setActiveTab('details')}
            className={`rounded-xl border border-transparent px-4 py-2 text-sm font-medium ${
            activeTab === 'details'
              ? 'border-[#E8922D] bg-white text-[#E8922D]'
              : 'text-[#6b7280] hover:text-[#374151]'
          }`}
        >
          Organisation details
        </button>
        <button
          type="button"
          role="tab"
          id="admin-org-tab-users"
          aria-selected={activeTab === 'users'}
          aria-controls="admin-org-panel-users"
          onClick={() => setActiveTab('users')}
            className={`rounded-xl border border-transparent px-4 py-2 text-sm font-medium ${
            activeTab === 'users'
              ? 'border-[#E8922D] bg-white text-[#E8922D]'
              : 'text-[#6b7280] hover:text-[#374151]'
          }`}
        >
          Organisation users
        </button>
      </div>

      <div className="mt-6">
        {activeTab === 'details' ? (
          <section
            id="admin-org-panel-details"
            role="tabpanel"
            aria-labelledby="admin-org-tab-details"
            className="admin-panel p-6"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Organisation details</h2>
            </div>
            {org.status === 'PENDING' ? (
              <div className="mb-6 rounded-2xl border border-[#fde68a] bg-[#fffbeb] p-4">
                <p className="text-sm font-medium text-[#92400e]">This organisation was submitted from the public Join the network form and is waiting for review.</p>
              </div>
            ) : null}
            <div className="grid gap-x-8 gap-y-4 md:grid-cols-2">
              <div>
                <div className="text-sm font-medium text-[#6b7280]">Name</div>
                <div className="mt-1">{org.name}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-[#6b7280]">Location</div>
                <div className="mt-1">{org.region?.name || '—'}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-[#6b7280]">Contact email</div>
                <div className="mt-1">{org.contactPersonEmail || '—'}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-[#6b7280]">Contact person</div>
                <div className="mt-1">{org.contactPersonName || '—'}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-[#6b7280]">Contact phone</div>
                <div className="mt-1">{org.contactPersonPhone || '—'}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-[#6b7280]">Website</div>
                <div className="mt-1">{org.website || '—'}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-[#6b7280]">Address</div>
                <div className="mt-1">{org.streetAddress || '—'}</div>
              </div>
              <div className="col-span-2">
                <div className="text-sm font-medium text-[#6b7280]">Description</div>
                <div className="mt-1">{org.description || '—'}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-[#6b7280]">Submitted via</div>
                <div className="mt-1">{org.submissionSource || 'Admin'}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-[#6b7280]">Reviewed at</div>
                <div className="mt-1">{org.reviewedAt ? new Date(org.reviewedAt).toLocaleString() : 'Awaiting review'}</div>
              </div>
              {org.status === 'REJECTED' ? (
                <div className="col-span-2">
                  <div className="text-sm font-medium text-[#6b7280]">Rejection reason</div>
                  <div className="mt-1">{org.rejectionReason || 'No reason provided'}</div>
                </div>
              ) : null}
            </div>
          </section>
        ) : (
          <section
            id="admin-org-panel-users"
            role="tabpanel"
            aria-labelledby="admin-org-tab-users"
          >
            <OrgUsersTab organisationId={org.id} />
          </section>
        )}
      </div>

      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        title="Reject organisation"
      >
        <label className="block text-sm font-medium text-[#6b7280]">
          Rejection reason
          <textarea
            value={rejectionReason}
            onChange={(event) => setRejectionReason(event.target.value)}
            rows={4}
            className="mt-2 w-full rounded-md border border-[#d1d5db] bg-white px-3 py-2 text-sm shadow-sm focus:border-[#155dfc] focus:outline-none focus:ring-1 focus:ring-[#155dfc]"
            placeholder="Optional note for why this organisation was rejected"
          />
        </label>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setIsRejectModalOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              rejectOrg.mutate({ id: org.id, rejectionReason: rejectionReason.trim() || undefined });
              setIsRejectModalOpen(false);
            }}
            disabled={rejectOrg.isPending}
          >
            {rejectOrg.isPending ? 'Rejecting...' : 'Confirm rejection'}
          </Button>
        </div>
      </Modal>
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
          className="text-sm text-[#E8922D] hover:underline"
        >
          View
        </button>
      ),
    },
  ];

  return (
    <AdminPanel className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-[#f0f0f0] p-4">
        <h2 className="text-lg font-semibold">All users</h2>
        <Button onClick={() => router.push(`/admin/users/new?organisationId=${organisationId}`)}>
          Add user
        </Button>
      </div>
      {isLoading ? (
        <div className="p-4">
          <TableLoadingSkeleton />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={data?.data ?? []}
          mobileCard={(row) => ({
            title: `${row.firstName} ${row.lastName}`.trim(),
            badges: <Badge variant="neutral">{row.role.replace(/_/g, ' ')}</Badge>,
            fields: [
              { label: 'Email', value: row.email },
              { label: 'Joined', value: new Date(row.createdAt).toLocaleDateString() },
            ],
            action: <button type="button" onClick={() => router.push(`/admin/users/${row.id}`)} className="admin-link-button">View</button>,
          })}
        />
      )}
    </AdminPanel>
  );
}
