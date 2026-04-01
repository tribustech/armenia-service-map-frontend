'use client';

import { useEffect, useState } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/admin/data-table';
import { Pagination } from '@/components/admin/pagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/auth/auth-context';
import { useOrgProfile, useOrgProfileUsers, useUpdateOrgProfile } from '@/lib/api/org-profile';
import type { User } from '@/types/api';

type Tab = 'details' | 'users';

export default function OrgProfilePage() {
  const { user } = useAuth();
  const canEdit = user?.role === 'ORG_ADMIN';
  const [activeTab, setActiveTab] = useState<Tab>('details');
  const [usersPage, setUsersPage] = useState(1);
  const [usersPerPage, setUsersPerPage] = useState(10);

  const { data: profile, isLoading } = useOrgProfile();
  const usersQuery = useOrgProfileUsers({
    page: usersPage,
    perPage: usersPerPage,
    sortBy: 'firstName',
    sortOrder: 'asc',
  });
  const updateProfile = useUpdateOrgProfile();

  const [form, setForm] = useState({
    name: '',
    description: '',
    website: '',
    location: '',
    category: '',
    activityDomain: '',
    contactPersonName: '',
    contactPersonEmail: '',
    contactPersonPhone: '',
  });

  useEffect(() => {
    if (!profile) return;
    setForm({
      name: profile.name ?? '',
      description: profile.description ?? '',
      website: profile.website ?? '',
      location: profile.location ?? '',
      category: profile.category ?? '',
      activityDomain: profile.activityDomain ?? '',
      contactPersonName: profile.contactPersonName ?? '',
      contactPersonEmail: profile.contactPersonEmail ?? '',
      contactPersonPhone: profile.contactPersonPhone ?? '',
    });
  }, [profile]);

  const userColumns: ColumnDef<User, unknown>[] = [
    {
      accessorFn: (row) => `${row.firstName} ${row.lastName}`,
      id: 'name',
      header: 'Name',
    },
    {
      accessorKey: 'email',
      header: 'Email',
    },
    {
      accessorKey: 'phone',
      header: 'Phone',
      cell: ({ getValue }) => (getValue() as string | null) || '—',
    },
    {
      accessorKey: 'status',
      header: 'Status',
    },
    {
      accessorKey: 'lastAccessAt',
      header: 'Last access',
      cell: ({ getValue }) => {
        const value = getValue() as string | null;
        return value ? new Date(value).toLocaleString() : '—';
      },
    },
  ];

  async function handleSave() {
    await updateProfile.mutateAsync({
      name: form.name || undefined,
      description: form.description || undefined,
      website: form.website || undefined,
      location: form.location || undefined,
      category: form.category || undefined,
      activityDomain: form.activityDomain || undefined,
      contactPersonName: form.contactPersonName || undefined,
      contactPersonEmail: form.contactPersonEmail || undefined,
      contactPersonPhone: form.contactPersonPhone || undefined,
    });
  }

  if (isLoading) return <div className="rounded-lg border bg-white p-6 text-sm text-gray-500">Loading organisation profile...</div>;
  if (!profile) return <div className="rounded-lg border bg-white p-6 text-sm text-gray-500">Organisation profile not available.</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Organisation profile</h1>
      <p className="mt-1 text-sm text-gray-600">Review your organisation details and team members.</p>

      <div className="mt-4 flex gap-1 rounded-lg bg-gray-100 p-1" style={{ width: 'fit-content' }}>
        <button
          onClick={() => setActiveTab('details')}
          className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'details' ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Organisation details
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'users' ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Organisation users
        </button>
      </div>

      {activeTab === 'details' ? (
        <section className="mt-6 rounded-lg border bg-white p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Organisation name"
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              disabled={!canEdit}
            />
            <Input
              label="Website"
              value={form.website}
              onChange={(event) => setForm((prev) => ({ ...prev, website: event.target.value }))}
              disabled={!canEdit}
            />
            <Input
              label="Location"
              value={form.location}
              onChange={(event) => setForm((prev) => ({ ...prev, location: event.target.value }))}
              disabled={!canEdit}
            />
            <Input
              label="Category"
              value={form.category}
              onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}
              disabled={!canEdit}
            />
            <Input
              label="Activity domain"
              value={form.activityDomain}
              onChange={(event) => setForm((prev) => ({ ...prev, activityDomain: event.target.value }))}
              disabled={!canEdit}
            />
            <Input
              label="Contact person name"
              value={form.contactPersonName}
              onChange={(event) => setForm((prev) => ({ ...prev, contactPersonName: event.target.value }))}
              disabled={!canEdit}
            />
            <Input
              label="Contact person email"
              value={form.contactPersonEmail}
              onChange={(event) => setForm((prev) => ({ ...prev, contactPersonEmail: event.target.value }))}
              disabled={!canEdit}
            />
            <Input
              label="Contact person phone"
              value={form.contactPersonPhone}
              onChange={(event) => setForm((prev) => ({ ...prev, contactPersonPhone: event.target.value }))}
              disabled={!canEdit}
            />
          </div>

          <div className="mt-4">
            <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={form.description}
              onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
              rows={4}
              disabled={!canEdit}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-50"
            />
          </div>

          <div className="mt-6 flex items-center justify-between">
            <p className="text-xs text-gray-500">
              Account status: <span className="font-medium text-gray-700">{profile.status}</span>
            </p>
            {canEdit ? (
              <Button onClick={handleSave} disabled={updateProfile.isPending}>
                {updateProfile.isPending ? 'Saving...' : 'Save changes'}
              </Button>
            ) : (
              <p className="text-xs text-gray-500">Only organisation admins can edit details.</p>
            )}
          </div>
        </section>
      ) : (
        <section className="mt-6 rounded-lg border bg-white">
          <div className="border-b p-4">
            <h2 className="text-lg font-semibold text-gray-900">Organisation users</h2>
            <p className="text-sm text-gray-500">Managed by super admins. This view is read-only.</p>
          </div>

          {usersQuery.isLoading ? (
            <div className="p-8 text-center text-gray-500">Loading users...</div>
          ) : (
            <>
              <DataTable columns={userColumns} data={usersQuery.data?.data ?? []} />
              {usersQuery.data ? (
                <Pagination
                  page={usersQuery.data.meta.page}
                  totalPages={usersQuery.data.meta.totalPages}
                  total={usersQuery.data.meta.total}
                  perPage={usersQuery.data.meta.perPage}
                  onPageChange={setUsersPage}
                  onPerPageChange={(pp) => {
                    setUsersPerPage(pp);
                    setUsersPage(1);
                  }}
                />
              ) : null}
            </>
          )}
        </section>
      )}
    </div>
  );
}
