'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { NeedEventsTimeline } from '@/components/shared/need-events-timeline';
import { DetailPageLoadingSkeleton, TimelineLoadingSkeleton } from '@/components/shared/loading-skeletons';
import {
  useAdminNeed,
  useUpdateNeed,
  useDeleteNeed,
  useAdminNeedEvents,
  useAddAdminNeedComment,
} from '@/lib/api/needs';
import { useOrganisations } from '@/lib/api/organisations';
import { useNeedTags } from '@/lib/api/taxonomy';
import type { NeedStatus } from '@/types/api';

const statusVariant: Record<NeedStatus, 'neutral' | 'warning' | 'success' | 'danger'> = {
  NEW: 'neutral',
  IN_PROGRESS: 'warning',
  SOLVED: 'success',
  CLOSED: 'danger',
};

const statusOptions: Array<{ value: NeedStatus; label: string }> = [
  { value: 'NEW', label: 'New' },
  { value: 'IN_PROGRESS', label: 'In progress' },
  { value: 'SOLVED', label: 'Solved' },
  { value: 'CLOSED', label: 'Closed' },
];

type NeedDraft = {
  title: string;
  status: NeedStatus;
  assignedOrganisationId: string;
  selectedTagIds: string[];
};

export default function AdminNeedDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: need, isLoading } = useAdminNeed(id);
  const { data: events, isLoading: eventsLoading } = useAdminNeedEvents(id);
  const updateNeed = useUpdateNeed();
  const addComment = useAddAdminNeedComment();
  const deleteNeed = useDeleteNeed();

  const { data: orgs } = useOrganisations({ perPage: 100 });
  const { data: tagsData } = useNeedTags({ perPage: 200, sortBy: 'name', sortOrder: 'asc' });

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [draft, setDraft] = useState<NeedDraft | null>(null);
  const [comment, setComment] = useState('');
  const initialSelectedTagIds = useMemo(
    () => need?.tags.map((tag) => tag.needTag.id) ?? [],
    [need],
  );

  const getInitialDraft = (): NeedDraft => ({
    title: need?.title ?? '',
    status: need?.status ?? 'NEW',
    assignedOrganisationId: need?.assignedOrganisationId ?? '',
    selectedTagIds: initialSelectedTagIds,
  });

  const title = draft?.title ?? need?.title ?? '';
  const status = draft?.status ?? need?.status ?? 'NEW';
  const assignedOrganisationId = draft?.assignedOrganisationId ?? need?.assignedOrganisationId ?? '';
  const selectedTagIds = draft?.selectedTagIds ?? initialSelectedTagIds;

  const hasSidebarChanges = useMemo(() => {
    if (!need) return false;
    const currentTags = [...initialSelectedTagIds].sort();
    const nextTags = [...selectedTagIds].sort();
    return (
      status !== need.status ||
      assignedOrganisationId !== (need.assignedOrganisationId ?? '') ||
      JSON.stringify(currentTags) !== JSON.stringify(nextTags)
    );
  }, [need, initialSelectedTagIds, status, assignedOrganisationId, selectedTagIds]);

  if (isLoading) return <DetailPageLoadingSkeleton />;
  if (!need) return <div className="p-8 text-gray-500">Need report not found</div>;

  async function handleSaveTitle() {
    await updateNeed.mutateAsync({ id, title: title.trim() });
    setIsEditingTitle(false);
  }

  async function handleSaveSidebar() {
    await updateNeed.mutateAsync({
      id,
      status,
      assignedOrganisationId: assignedOrganisationId || null,
      tagIds: selectedTagIds,
    });
  }

  async function handleAddComment() {
    const content = comment.trim();
    if (!content) return;
    await addComment.mutateAsync({ id, content });
    setComment('');
  }

  function toggleTag(tagId: string) {
    setDraft((prev) => {
      const base = prev ?? getInitialDraft();
      const nextTagIds = base.selectedTagIds.includes(tagId)
        ? base.selectedTagIds.filter((idValue) => idValue !== tagId)
        : [...base.selectedTagIds, tagId];
      return { ...base, selectedTagIds: nextTagIds };
    });
  }

  return (
    <div>
      <div className="mb-3 text-sm text-gray-500">
        <Link href="/admin/needs" className="hover:underline">Need reports</Link>{' > '}
        {need.title || `Need ${need.id.slice(0, 8)}`}
      </div>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">
              {need.title || `Need report ${need.id.slice(0, 8)}`}
            </h1>
            <Badge variant={statusVariant[need.status]}>{need.status}</Badge>
          </div>
          <p className="mt-1 text-sm text-gray-500">Created on {new Date(need.createdAt).toLocaleString()}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => setIsEditingTitle((prev) => !prev)}>
            {isEditingTitle ? 'Cancel title edit' : 'Edit title'}
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              if (confirm('Delete this need report?')) {
                deleteNeed.mutate(id, {
                  onSuccess: () => router.push('/admin/needs'),
                });
              }
            }}
          >
            Delete
          </Button>
        </div>
      </div>

      {isEditingTitle ? (
        <div className="mt-4 rounded-lg border bg-white p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-end">
            <div className="flex-1">
              <Input
                label="Need title"
                value={title}
                onChange={(event) =>
                  setDraft((prev) => ({ ...(prev ?? getInitialDraft()), title: event.target.value }))
                }
                placeholder="Add a clear title for this need"
              />
            </div>
            <Button onClick={handleSaveTitle} disabled={updateNeed.isPending || !title.trim()}>
              Save title
            </Button>
          </div>
        </div>
      ) : null}

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.7fr_1fr]">
        <section className="space-y-4">
          <div className="rounded-lg border bg-white p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Need description</h2>
            <p className="mt-3 whitespace-pre-wrap text-sm text-gray-700">{need.description}</p>
            <div className="mt-4 grid gap-3 text-sm text-gray-600 md:grid-cols-2">
              <div><span className="font-medium text-gray-900">Submitted by:</span> {need.fullName}</div>
              <div><span className="font-medium text-gray-900">Contact:</span> {need.contactMethod} - {need.contactValue}</div>
            </div>
          </div>

          <div className="rounded-lg border bg-white p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Add comment</h2>
            <textarea
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              rows={4}
              className="mt-3 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              placeholder="Write a comment for activity timeline"
            />
            <div className="mt-3 flex justify-end">
              <Button onClick={handleAddComment} disabled={addComment.isPending || !comment.trim()}>
                {addComment.isPending ? 'Submitting...' : 'Submit comment'}
              </Button>
            </div>
          </div>

          <div className="rounded-lg border bg-white p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Activity timeline</h2>
            <div className="mt-3">
              {eventsLoading ? (
                <TimelineLoadingSkeleton />
              ) : (
                <NeedEventsTimeline events={events ?? []} emptyLabel="No activity events yet." />
              )}
            </div>
          </div>
        </section>

        <aside className="space-y-4">
          <div className="rounded-lg border bg-white p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Need details</h2>
            <div className="mt-4 space-y-4 text-sm">
              <div>
                <label className="mb-1 block font-medium text-gray-700">Status</label>
                <select
                  value={status}
                  onChange={(event) =>
                    setDraft((prev) => ({
                      ...(prev ?? getInitialDraft()),
                      status: event.target.value as NeedStatus,
                    }))
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block font-medium text-gray-700">Assignee</label>
                <select
                  value={assignedOrganisationId}
                  onChange={(event) =>
                    setDraft((prev) => ({
                      ...(prev ?? getInitialDraft()),
                      assignedOrganisationId: event.target.value,
                    }))
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                >
                  <option value="">Unassigned</option>
                  {orgs?.data.map((org) => (
                    <option key={org.id} value={org.id}>{org.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <p className="mb-2 font-medium text-gray-700">Tags</p>
                <div className="max-h-48 space-y-2 overflow-y-auto rounded-md border border-gray-200 p-2">
                  {tagsData?.data.map((tag) => (
                    <label key={tag.id} className="flex cursor-pointer items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={selectedTagIds.includes(tag.id)}
                        onChange={() => toggleTag(tag.id)}
                        className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                      />
                      <span>{tag.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="rounded-md bg-gray-50 p-3 text-xs text-gray-600">
                <div>Submitted: {new Date(need.createdAt).toLocaleString()}</div>
                <div>Last updated: {new Date(need.updatedAt).toLocaleString()}</div>
                <div>Region: {need.region?.name || 'Not provided'}</div>
              </div>

              <Button onClick={handleSaveSidebar} disabled={updateNeed.isPending || !hasSidebarChanges} className="w-full">
                {updateNeed.isPending ? 'Saving...' : 'Save changes'}
              </Button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
