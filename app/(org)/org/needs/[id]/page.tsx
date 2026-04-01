'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { NeedEventsTimeline } from '@/components/shared/need-events-timeline';
import { DetailPageLoadingSkeleton, TimelineLoadingSkeleton } from '@/components/shared/loading-skeletons';
import {
  useOrgNeed,
  useUpdateOrgNeed,
  useOrgNeedEvents,
  useAddOrgNeedComment,
} from '@/lib/api/needs';
import type { NeedStatus } from '@/types/api';

const statusVariant: Record<NeedStatus, 'neutral' | 'warning' | 'success' | 'danger'> = {
  NEW: 'neutral',
  IN_PROGRESS: 'warning',
  SOLVED: 'success',
  CLOSED: 'danger',
};

const statusOptions: Array<{ value: NeedStatus; label: string }> = [
  { value: 'IN_PROGRESS', label: 'In progress' },
  { value: 'SOLVED', label: 'Solved' },
  { value: 'CLOSED', label: 'Closed' },
];

export default function OrgNeedDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: need, isLoading } = useOrgNeed(id);
  const { data: events, isLoading: eventsLoading } = useOrgNeedEvents(id);
  const updateNeed = useUpdateOrgNeed();
  const addComment = useAddOrgNeedComment();

  const [draftStatus, setDraftStatus] = useState<NeedStatus | null>(null);
  const [comment, setComment] = useState('');
  const status = draftStatus ?? need?.status ?? 'IN_PROGRESS';

  if (isLoading) return <DetailPageLoadingSkeleton />;
  if (!need) return <div className="p-8 text-gray-500">Need report not found</div>;

  async function handleSaveStatus() {
    await updateNeed.mutateAsync({ id, status });
  }

  async function handleAddComment() {
    const content = comment.trim();
    if (!content) return;
    await addComment.mutateAsync({ id, content });
    setComment('');
  }

  return (
    <div>
      <div className="mb-3 text-sm text-gray-500">
        <Link href="/org/needs" className="hover:underline">Assigned needs</Link>{' > '}
        {need.title || `Need ${need.id.slice(0, 8)}`}
      </div>

      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold text-gray-900">{need.title || `Need report ${need.id.slice(0, 8)}`}</h1>
        <Badge variant={statusVariant[need.status]}>{need.status}</Badge>
      </div>

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
              className="mt-3 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              placeholder="Write a progress update for this need"
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
                  onChange={(event) => setDraftStatus(event.target.value as NeedStatus)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
                <Button onClick={handleSaveStatus} disabled={updateNeed.isPending || status === need.status} className="mt-2 w-full">
                  {updateNeed.isPending ? 'Saving...' : 'Save status'}
                </Button>
              </div>

              <div className="rounded-md bg-gray-50 p-3 text-xs text-gray-600">
                <div>Assignee: {need.assignedOrganisation?.name || 'Unassigned'}</div>
                <div>Submitted: {new Date(need.createdAt).toLocaleString()}</div>
                <div>Last updated: {new Date(need.updatedAt).toLocaleString()}</div>
                <div>Region: {need.region?.name || 'Not provided'}</div>
              </div>

              <div>
                <p className="mb-2 font-medium text-gray-700">Tags (read-only)</p>
                <div className="flex flex-wrap gap-2">
                  {need.tags.length ? (
                    need.tags.map((tag) => (
                      <Badge key={tag.needTag.id} variant="neutral">{tag.needTag.name}</Badge>
                    ))
                  ) : (
                    <span className="text-xs text-gray-500">No tags</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
