'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RichTextEditor } from '@/components/shared/rich-text-editor';
import {
  useOrgService,
  useUpdateOrgService,
  usePublicTopics,
  usePublicRegions,
  usePublicTargetGroups,
} from '@/lib/api/services';

export default function EditOrgServicePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: service, isLoading } = useOrgService(id);
  const update = useUpdateOrgService();
  const { data: topics } = usePublicTopics();
  const { data: regions } = usePublicRegions();
  const { data: targetGroups } = usePublicTargetGroups();
  const topicOptions = useMemo(
    () =>
      (topics ?? []).flatMap((topic) => [
        { id: topic.id, name: topic.name },
        ...((topic.children ?? []).map((child) => ({ id: child.id, name: `${topic.name} / ${child.name}` })) || []),
      ]),
    [topics],
  );

  const [form, setForm] = useState({
    title: '',
    shortDescription: '',
    description: '',
    status: 'DRAFT' as 'DRAFT' | 'PUBLISHED',
    regionId: '',
    isAvailable: true,
    targetGroupIds: [] as string[],
    topicIds: [] as string[],
  });

  useEffect(() => {
    if (service) {
      setForm({
        title: service.title,
        shortDescription: service.shortDescription,
        description: service.description,
        status: service.status,
        regionId: service.regionId || '',
        isAvailable: service.isAvailable,
        targetGroupIds: service.targetGroups.map((entry) => entry.targetGroup.id),
        topicIds: service.topics.map((t) => t.topic.id),
      });
    }
  }, [service]);

  const updateField = (field: string, value: unknown) => setForm((p) => ({ ...p, [field]: value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await update.mutateAsync({
      id,
      title: form.title,
      shortDescription: form.shortDescription,
      description: form.description,
      status: form.status,
      regionId: form.regionId || undefined,
      isAvailable: form.isAvailable,
      targetGroupIds: form.targetGroupIds,
      topicIds: form.topicIds,
    });
    router.push(`/org/services/${id}`);
  }

  if (isLoading) return <div className="p-8 text-gray-500">Loading...</div>;

  return (
    <div>
      <div className="mb-2 text-sm text-gray-500">
        <Link href="/org/services" className="hover:underline">Services</Link>{' > '}<Link href={`/org/services/${id}`} className="hover:underline">{service?.title}</Link>{' > '}Edit
      </div>
      <h1 className="text-2xl font-bold">Edit service</h1>

      <form onSubmit={handleSubmit} className="mt-6 max-w-3xl space-y-4 rounded-lg border bg-white p-6">
        <Input label="Title *" value={form.title} onChange={(e) => updateField('title', e.target.value)} required />
        <Input label="Short description *" value={form.shortDescription} onChange={(e) => updateField('shortDescription', e.target.value)} required />

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Description *</label>
          <RichTextEditor content={form.description} onChange={(html) => updateField('description', html)} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Status</label>
            <select value={form.status} onChange={(e) => updateField('status', e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500">
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
            </select>
          </div>
          <div className="flex items-end gap-2 pb-1">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.isAvailable} onChange={(e) => updateField('isAvailable', e.target.checked)} />
              Available
            </label>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Region</label>
            <select value={form.regionId} onChange={(e) => updateField('regionId', e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500">
              <option value="">All regions</option>
              {regions?.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Topics</label>
          <div className="flex flex-wrap gap-2">
            {topicOptions.map((topic) => (
              <label key={topic.id} className="flex items-center gap-1.5 text-sm">
                <input type="checkbox" checked={form.topicIds.includes(topic.id)} onChange={(e) => {
                  updateField('topicIds', e.target.checked ? [...form.topicIds, topic.id] : form.topicIds.filter((tid) => tid !== topic.id));
                }} />
                {topic.name}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Target groups</label>
          <div className="flex flex-wrap gap-2">
            {targetGroups?.map((t) => (
              <label key={t.id} className="flex items-center gap-1.5 text-sm">
                <input type="checkbox" checked={form.targetGroupIds.includes(t.id)} onChange={(e) => {
                  updateField('targetGroupIds', e.target.checked ? [...form.targetGroupIds, t.id] : form.targetGroupIds.filter((id) => id !== t.id));
                }} />
                {t.name}
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" disabled={update.isPending}>{update.isPending ? 'Saving...' : 'Save changes'}</Button>
        </div>
      </form>
    </div>
  );
}
