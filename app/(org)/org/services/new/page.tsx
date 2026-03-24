'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RichTextEditor } from '@/components/shared/rich-text-editor';
import { useCreateOrgService, usePublicTopics, usePublicRegions } from '@/lib/api/services';

export default function NewOrgServicePage() {
  const router = useRouter();
  const create = useCreateOrgService();
  const { data: topics } = usePublicTopics();
  const { data: regions } = usePublicRegions();

  const [form, setForm] = useState({
    title: '',
    shortDescription: '',
    description: '',
    regionId: '',
    targetGroup: '',
    topicIds: [] as string[],
  });

  const updateField = (field: string, value: unknown) => setForm((p) => ({ ...p, [field]: value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await create.mutateAsync({
      title: form.title,
      shortDescription: form.shortDescription,
      description: form.description,
      regionId: form.regionId || undefined,
      targetGroup: form.targetGroup ? form.targetGroup.split(',').map((s) => s.trim()) : [],
      topicIds: form.topicIds,
    });
    router.push('/org/services');
  }

  return (
    <div>
      <div className="mb-2 text-sm text-gray-500">
        <a href="/org/services" className="hover:underline">Services</a>{' > '}Add new service
      </div>
      <h1 className="text-2xl font-bold">Add new service</h1>

      <form onSubmit={handleSubmit} className="mt-6 max-w-3xl space-y-4 rounded-lg border bg-white p-6">
        <Input label="Title *" value={form.title} onChange={(e) => updateField('title', e.target.value)} required />
        <Input label="Short description *" value={form.shortDescription} onChange={(e) => updateField('shortDescription', e.target.value)} required />

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Description *</label>
          <RichTextEditor content={form.description} onChange={(html) => updateField('description', html)} />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Region</label>
          <select value={form.regionId} onChange={(e) => updateField('regionId', e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500">
            <option value="">All regions</option>
            {regions?.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Topics</label>
          <div className="flex flex-wrap gap-2">
            {topics?.map((t) => (
              <label key={t.id} className="flex items-center gap-1.5 text-sm">
                <input type="checkbox" checked={form.topicIds.includes(t.id)} onChange={(e) => {
                  updateField('topicIds', e.target.checked ? [...form.topicIds, t.id] : form.topicIds.filter((id) => id !== t.id));
                }} />
                {t.name}
              </label>
            ))}
          </div>
        </div>

        <Input label="Target groups (comma-separated)" value={form.targetGroup} onChange={(e) => updateField('targetGroup', e.target.value)} />

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" disabled={create.isPending}>{create.isPending ? 'Saving...' : 'Create service'}</Button>
        </div>
      </form>
    </div>
  );
}
