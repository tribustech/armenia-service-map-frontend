'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RichTextEditor } from '@/components/shared/rich-text-editor';
import { useAdminService, useUpdateService, usePublicRegions, usePublicTargetGroups, usePublicTopics } from '@/lib/api/services';

export default function EditServicePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: service, isLoading } = useAdminService(id);
  const update = useUpdateService();
  const { data: topics } = usePublicTopics();
  const { data: regions } = usePublicRegions();
  const { data: targetGroups } = usePublicTargetGroups();

  const topicOptions = useMemo(
    () =>
      (topics ?? []).flatMap((topic) => [
        { id: topic.id, name: topic.name },
        ...((topic.children ?? []).map((child) => ({
          id: child.id,
          name: `${topic.name} / ${child.name}`,
        })) || []),
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
    availabilityStart: '',
    availabilityEnd: '',
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
        availabilityStart: service.availabilityStart?.split('T')[0] ?? '',
        availabilityEnd: service.availabilityEnd?.split('T')[0] ?? '',
      });
    }
  }, [service]);

  const updateField = (field: string, value: unknown) => setForm((p) => ({ ...p, [field]: value }));

  const selectClasses =
    'w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-sm shadow-[0px_1px_3px_0px_rgba(0,0,0,0.06)] focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 appearance-none';

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
      availabilityStart: form.availabilityStart || undefined,
      availabilityEnd: form.availabilityEnd || undefined,
    });
    router.push(`/admin/services/${id}`);
  }

  if (isLoading) return <div className="p-8 text-gray-500">Loading...</div>;

  return (
    <div className="mx-auto max-w-[1220px] pb-12">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-3 pt-8 text-sm text-gray-500">
        <Link href="/admin/services" className="font-medium hover:underline">
          Service directory
        </Link>
        <ChevronRightIcon className="h-4 w-4" />
        <Link href={`/admin/services/${id}`} className="font-medium hover:underline">
          {service?.title}
        </Link>
        <ChevronRightIcon className="h-4 w-4" />
        <span className="font-medium">Edit</span>
      </div>

      <h1 className="mt-3 text-3xl font-bold text-gray-900">Edit service</h1>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        {/* Form card */}
        <div className="space-y-10 rounded-xl bg-white p-6 shadow-[0px_1px_3px_0px_rgba(0,0,0,0.06),0px_0px_0px_0px_#ececee]">
          {/* Title + Location */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-900">Status</label>
              <select
                value={form.status}
                onChange={(e) => updateField('status', e.target.value)}
                className={selectClasses}
              >
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

          <div className="grid grid-cols-2 gap-6">
            <Input label="Title" value={form.title} onChange={(e) => updateField('title', e.target.value)} required />
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-900">Location</label>
              <select
                value={form.regionId}
                onChange={(e) => updateField('regionId', e.target.value)}
                className={selectClasses}
              >
                <option value="">Where it is available</option>
                {regions?.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Topics + Target group */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-900">Topics</label>
              <div className="max-h-36 overflow-y-auto rounded-lg border border-gray-200 p-3">
                <div className="flex flex-col gap-2">
                  {topicOptions.map((topic) => (
                    <label key={topic.id} className="flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={form.topicIds.includes(topic.id)}
                        onChange={(e) =>
                          updateField(
                            'topicIds',
                            e.target.checked
                              ? [...form.topicIds, topic.id]
                              : form.topicIds.filter((id) => id !== topic.id),
                          )
                        }
                      />
                      {topic.name}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-900">Target groups</label>
              <div className="max-h-36 overflow-y-auto rounded-lg border border-gray-200 p-3">
                <div className="flex flex-col gap-2">
                  {(targetGroups ?? []).map((targetGroup) => (
                    <label key={targetGroup.id} className="flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={form.targetGroupIds.includes(targetGroup.id)}
                        onChange={(e) =>
                          updateField(
                            'targetGroupIds',
                            e.target.checked
                              ? [...form.targetGroupIds, targetGroup.id]
                              : form.targetGroupIds.filter((id) => id !== targetGroup.id),
                          )
                        }
                      />
                      {targetGroup.name}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Start date + End date */}
          <div className="grid grid-cols-2 gap-6">
            <Input
              label="Start date"
              type="date"
              value={form.availabilityStart}
              onChange={(e) => updateField('availabilityStart', e.target.value)}
            />
            <Input
              label="End date"
              type="date"
              value={form.availabilityEnd}
              onChange={(e) => updateField('availabilityEnd', e.target.value)}
            />
          </div>

          {/* Short description - rich text */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-900">Short description</label>
            <RichTextEditor
              content={form.shortDescription}
              onChange={(html) => updateField('shortDescription', html)}
            />
          </div>

          {/* Description - rich text */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-900">Description</label>
            <RichTextEditor
              content={form.description}
              onChange={(html) => updateField('description', html)}
            />
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="secondary" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={update.isPending}>
            {update.isPending ? 'Saving...' : 'Save changes'}
          </Button>
        </div>
      </form>
    </div>
  );
}
