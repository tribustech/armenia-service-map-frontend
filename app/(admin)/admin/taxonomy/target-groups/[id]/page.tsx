'use client';

import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { AdminPanel } from '@/components/admin/admin-surface';
import { TaxonomyPageHeader } from '@/components/admin/taxonomy/taxonomy-page-header';
import { Badge } from '@/components/ui/badge';
import { DetailPageLoadingSkeleton } from '@/components/shared/loading-skeletons';
import { useTargetGroup } from '@/lib/api/taxonomy';

export default function TargetGroupDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: targetGroup, isLoading } = useTargetGroup(id);
  const t = useTranslations('admin.taxonomy');
  const tStatuses = useTranslations('admin.statuses');

  if (isLoading) return <DetailPageLoadingSkeleton />;
  if (!targetGroup) return <div className="p-8 text-[#6b7280]">{t('pages.targetGroupNotFound')}</div>;

  return (
    <div className="space-y-6">
      <TaxonomyPageHeader title={targetGroup.name} action={{ href: `/admin/taxonomy/target-groups/${id}/edit`, label: t('pages.editTargetGroupAction') }} />
      <AdminPanel className="rounded-xl border border-[#e8e8e8] bg-white p-5">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <div className="text-sm font-medium text-[#6b7280]">{t('statusLabel')}</div>
            <div className="mt-1"><Badge variant={targetGroup.status === 'ACTIVE' ? 'success' : 'neutral'}>{targetGroup.status === 'ACTIVE' ? tStatuses('active') : tStatuses('inactive')}</Badge></div>
          </div>
          <div>
            <div className="text-sm font-medium text-[#6b7280]">{t('columns.usage')}</div>
            <div className="mt-1">{targetGroup._count.services}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-[#6b7280]">{t('columns.lastUpdate')}</div>
            <div className="mt-1">{new Date(targetGroup.updatedAt).toLocaleDateString()}</div>
          </div>
        </div>
      </AdminPanel>
    </div>
  );
}
