'use client';

import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { AdminPanel } from '@/components/admin/admin-surface';
import { TaxonomyPageHeader } from '@/components/admin/taxonomy/taxonomy-page-header';
import { Badge } from '@/components/ui/badge';
import { DetailPageLoadingSkeleton } from '@/components/shared/loading-skeletons';
import { useNeedTag } from '@/lib/api/taxonomy';

export default function NeedTagDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: tag, isLoading } = useNeedTag(id);
  const t = useTranslations('admin.taxonomy');
  const tStatuses = useTranslations('admin.statuses');

  if (isLoading) return <DetailPageLoadingSkeleton />;
  if (!tag) return <div className="p-8 text-[#6b7280]">{t('pages.tagNotFound')}</div>;

  return (
    <div className="space-y-6">
      <TaxonomyPageHeader title={tag.name} action={{ href: `/admin/taxonomy/need-tags/${id}/edit`, label: t('pages.editTagAction') }} />
      <AdminPanel className="rounded-xl border border-[#e8e8e8] bg-white p-5">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <div className="text-sm font-medium text-[#6b7280]">{t('statusLabel')}</div>
            <div className="mt-1"><Badge variant={tag.status === 'ACTIVE' ? 'success' : 'neutral'}>{tag.status === 'ACTIVE' ? tStatuses('active') : tStatuses('inactive')}</Badge></div>
          </div>
          <div>
            <div className="text-sm font-medium text-[#6b7280]">{t('columns.usage')}</div>
            <div className="mt-1">{tag._count.needReports}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-[#6b7280]">{t('pages.slug')}</div>
            <div className="mt-1">{tag.slug}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-[#6b7280]">{t('columns.lastUpdate')}</div>
            <div className="mt-1">{new Date(tag.updatedAt).toLocaleDateString()}</div>
          </div>
        </div>
      </AdminPanel>
    </div>
  );
}
