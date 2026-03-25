'use client';

import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useOrgNeed, useUpdateOrgNeed } from '@/lib/api/needs';

const statusVariant: Record<string, 'neutral' | 'warning' | 'success' | 'danger'> = {
  NEW: 'neutral',
  ASSIGNED: 'warning',
  RESOLVED: 'success',
  CLOSED: 'danger',
};

export default function OrgNeedDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: need, isLoading } = useOrgNeed(id);
  const updateNeed = useUpdateOrgNeed();

  if (isLoading) return <div className="p-8 text-gray-500">Loading...</div>;
  if (!need) return <div className="p-8 text-gray-500">Need report not found</div>;

  async function handleStatusChange(status: string) {
    await updateNeed.mutateAsync({ id, status });
  }

  return (
    <div>
      <div className="mb-2 text-sm text-gray-500">
        <a href="/org/needs" className="hover:underline">Assigned needs</a>{' > '}{need.fullName}
      </div>

      <h1 className="text-2xl font-bold">Need report — {need.fullName}</h1>

      <div className="mt-6 space-y-4">
        <div className="rounded-lg border bg-white p-6">
          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            <div>
              <div className="text-sm font-medium text-gray-500">Status</div>
              <div className="mt-1"><Badge variant={statusVariant[need.status]}>{need.status}</Badge></div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">Submitted</div>
              <div className="mt-1">{new Date(need.createdAt).toLocaleDateString()}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">Region</div>
              <div className="mt-1">{need.region?.name || '—'}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">Contact ({need.contactMethod})</div>
              <div className="mt-1">{need.contactValue}</div>
            </div>
            {need.tags.length > 0 && (
              <div>
                <div className="text-sm font-medium text-gray-500">Tags</div>
                <div className="mt-1 flex flex-wrap gap-1">{need.tags.map((t) => <Badge key={t.needTag.id} variant="neutral">{t.needTag.name}</Badge>)}</div>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-lg border bg-white p-6">
          <div className="text-sm font-medium text-gray-500 mb-2">Description</div>
          <p className="whitespace-pre-wrap">{need.description}</p>
        </div>

        <div className="rounded-lg border bg-white p-6">
          <div className="text-sm font-medium text-gray-500 mb-3">Update status</div>
          <div className="flex gap-2">
            {['ASSIGNED', 'RESOLVED', 'CLOSED'].map((s) => (
              <Button key={s} variant={need.status === s ? 'primary' : 'secondary'} onClick={() => handleStatusChange(s)} disabled={updateNeed.isPending}>
                {s}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
