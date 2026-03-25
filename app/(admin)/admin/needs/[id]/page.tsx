'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { useAdminNeed, useUpdateNeed, useAssignNeed, useDeleteNeed } from '@/lib/api/needs';
import { useOrganisations } from '@/lib/api/organisations';

const statusVariant: Record<string, 'neutral' | 'warning' | 'success' | 'danger'> = {
  NEW: 'neutral',
  ASSIGNED: 'warning',
  RESOLVED: 'success',
  CLOSED: 'danger',
};

export default function AdminNeedDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: need, isLoading } = useAdminNeed(id);
  const updateNeed = useUpdateNeed();
  const assignNeed = useAssignNeed();
  const deleteNeed = useDeleteNeed();
  const { data: orgs } = useOrganisations({ perPage: 100 });
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedOrgId, setSelectedOrgId] = useState('');

  if (isLoading) return <div className="p-8 text-gray-500">Loading...</div>;
  if (!need) return <div className="p-8 text-gray-500">Need report not found</div>;

  async function handleStatusChange(status: string) {
    await updateNeed.mutateAsync({ id, status });
  }

  async function handleAssign() {
    if (!selectedOrgId) return;
    await assignNeed.mutateAsync({ id, organisationId: selectedOrgId });
    setAssignModalOpen(false);
  }

  return (
    <div>
      <div className="mb-2 text-sm text-gray-500">
        <a href="/admin/needs" className="hover:underline">Need reports</a>{' > '}{need.fullName}
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Need report — {need.fullName}</h1>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setAssignModalOpen(true)}>Assign</Button>
          <Button variant="danger" onClick={() => { if (confirm('Delete this need report?')) { deleteNeed.mutate(id); router.push('/admin/needs'); } }}>Delete</Button>
        </div>
      </div>

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
              <div className="text-sm font-medium text-gray-500">Assigned to</div>
              <div className="mt-1">{need.assignedOrganisation?.name || 'Unassigned'}</div>
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
            {['NEW', 'ASSIGNED', 'RESOLVED', 'CLOSED'].map((s) => (
              <Button key={s} variant={need.status === s ? 'primary' : 'secondary'} onClick={() => handleStatusChange(s)} disabled={updateNeed.isPending}>
                {s}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <Modal isOpen={assignModalOpen} onClose={() => setAssignModalOpen(false)} title="Assign to organisation">
        <div className="space-y-4">
          <select value={selectedOrgId} onChange={(e) => setSelectedOrgId(e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500">
            <option value="">Select organisation...</option>
            {orgs?.data.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
          </select>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setAssignModalOpen(false)}>Cancel</Button>
            <Button onClick={handleAssign} disabled={!selectedOrgId || assignNeed.isPending}>{assignNeed.isPending ? 'Assigning...' : 'Assign'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
