'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useCreateUser } from '@/lib/api/users';

function NewUserForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const presetOrgId = searchParams.get('organisationId') || '';
  const createUser = useCreateUser();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'ORG_MEMBER',
    organisationId: presetOrgId,
  });

  const updateField = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const data: Record<string, string> = { ...form };
    if (!data.organisationId) delete data.organisationId;
    await createUser.mutateAsync(data as Parameters<typeof createUser.mutateAsync>[0]);
    router.back();
  }

  return (
    <div>
      <div className="mb-2 text-sm text-gray-500">
        <a href="/admin/users" className="hover:underline">Users management</a>
        {' > '}
        <span>Add new user</span>
      </div>
      <h1 className="text-2xl font-bold">Add new user</h1>

      <form onSubmit={handleSubmit} className="mt-6 max-w-2xl space-y-4 rounded-lg border bg-white p-6">
        <div className="grid grid-cols-2 gap-4">
          <Input label="First name *" value={form.firstName} onChange={(e) => updateField('firstName', e.target.value)} required />
          <Input label="Last name *" value={form.lastName} onChange={(e) => updateField('lastName', e.target.value)} required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Email address *" type="email" value={form.email} onChange={(e) => updateField('email', e.target.value)} required />
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Role</label>
            <select
              value={form.role}
              onChange={(e) => updateField('role', e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
            >
              <option value="ORG_MEMBER">Org Member</option>
              <option value="ORG_ADMIN">Org Admin</option>
              <option value="SUPER_ADMIN">Super Admin</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" disabled={createUser.isPending}>
            {createUser.isPending ? 'Saving...' : 'Save changes'}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function NewUserPage() {
  return (
    <Suspense fallback={<div className="p-8 text-gray-500">Loading...</div>}>
      <NewUserForm />
    </Suspense>
  );
}
