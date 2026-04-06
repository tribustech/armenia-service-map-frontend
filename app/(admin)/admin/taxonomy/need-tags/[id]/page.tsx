'use client';

import { useParams } from 'next/navigation';
import { AdminPanel } from '@/components/admin/admin-surface';
import { TaxonomyPageHeader } from '@/components/admin/taxonomy/taxonomy-page-header';
import { Badge } from '@/components/ui/badge';
import { DetailPageLoadingSkeleton } from '@/components/shared/loading-skeletons';
import { useNeedTag } from '@/lib/api/taxonomy';
import { formatStatusLabel } from '@/lib/formatting/status-label';

export default function NeedTagDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: tag, isLoading } = useNeedTag(id);

  if (isLoading) return <DetailPageLoadingSkeleton />;
  if (!tag) return <div className="p-8 text-[#6b7280]">Need tag not found</div>;

  return (
    <div className="space-y-6">
      <TaxonomyPageHeader title={tag.name} action={{ href: `/admin/taxonomy/need-tags/${id}/edit`, label: 'Edit need tag' }} />
      <AdminPanel className="rounded-xl border border-[#e8e8e8] bg-white p-5">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <div className="text-sm font-medium text-[#6b7280]">Status</div>
            <div className="mt-1"><Badge variant={tag.status === 'ACTIVE' ? 'success' : 'neutral'}>{formatStatusLabel(tag.status)}</Badge></div>
          </div>
          <div>
            <div className="text-sm font-medium text-[#6b7280]">Usage</div>
            <div className="mt-1">{tag._count.needReports}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-[#6b7280]">Slug</div>
            <div className="mt-1">{tag.slug}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-[#6b7280]">Last update</div>
            <div className="mt-1">{new Date(tag.updatedAt).toLocaleDateString()}</div>
          </div>
        </div>
      </AdminPanel>
    </div>
  );
}
