'use client';

import { useParams } from 'next/navigation';
import { AdminPanel } from '@/components/admin/admin-surface';
import { TaxonomyPageHeader } from '@/components/admin/taxonomy/taxonomy-page-header';
import { Badge } from '@/components/ui/badge';
import { DetailPageLoadingSkeleton } from '@/components/shared/loading-skeletons';
import { useTargetGroup } from '@/lib/api/taxonomy';
import { formatStatusLabel } from '@/lib/formatting/status-label';

export default function TargetGroupDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: targetGroup, isLoading } = useTargetGroup(id);

  if (isLoading) return <DetailPageLoadingSkeleton />;
  if (!targetGroup) return <div className="p-8 text-[#6b7280]">Target group not found</div>;

  return (
    <div className="space-y-6">
      <TaxonomyPageHeader title={targetGroup.name} action={{ href: `/admin/taxonomy/target-groups/${id}/edit`, label: 'Edit target group' }} />
      <AdminPanel className="rounded-xl border border-[#e8e8e8] bg-white p-5">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <div className="text-sm font-medium text-[#6b7280]">Status</div>
            <div className="mt-1"><Badge variant={targetGroup.status === 'ACTIVE' ? 'success' : 'neutral'}>{formatStatusLabel(targetGroup.status)}</Badge></div>
          </div>
          <div>
            <div className="text-sm font-medium text-[#6b7280]">Usage</div>
            <div className="mt-1">{targetGroup._count.services}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-[#6b7280]">Last update</div>
            <div className="mt-1">{new Date(targetGroup.updatedAt).toLocaleDateString()}</div>
          </div>
        </div>
      </AdminPanel>
    </div>
  );
}
