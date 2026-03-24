'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useCreateOrganisation } from '@/lib/api/organisations';

export default function NewOrganisationPage() {
  const router = useRouter();
  const createOrg = useCreateOrganisation();
  const [form, setForm] = useState({
    name: '',
    description: '',
    website: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
  });

  const updateField = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const data = Object.fromEntries(
      Object.entries(form).filter(([, v]) => v !== ''),
    );
    await createOrg.mutateAsync(data);
    router.push('/admin/organisations');
  }

  return (
    <div>
      <div className="mb-2 text-sm text-gray-500">
        <a href="/admin/organisations" className="hover:underline">Users management</a>
        {' > '}
        <span>Add new organisation</span>
      </div>
      <h1 className="text-2xl font-bold">Add new organisation</h1>

      <form onSubmit={handleSubmit} className="mt-6 max-w-2xl space-y-4 rounded-lg border bg-white p-6">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Organisation name *" value={form.name} onChange={(e) => updateField('name', e.target.value)} required />
          <Input label="Website" value={form.website} onChange={(e) => updateField('website', e.target.value)} />
        </div>
        <Input label="Address" value={form.address} onChange={(e) => updateField('address', e.target.value)} />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Contact email" type="email" value={form.contactEmail} onChange={(e) => updateField('contactEmail', e.target.value)} />
          <Input label="Contact phone" value={form.contactPhone} onChange={(e) => updateField('contactPhone', e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => updateField('description', e.target.value)}
            rows={4}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" disabled={createOrg.isPending}>
            {createOrg.isPending ? 'Saving...' : 'Save changes'}
          </Button>
        </div>
      </form>
    </div>
  );
}
