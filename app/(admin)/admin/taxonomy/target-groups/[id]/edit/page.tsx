'use client';

import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { DetailPageLoadingSkeleton } from '@/components/shared/loading-skeletons';
import { TaxonomyPageHeader } from '@/components/admin/taxonomy/taxonomy-page-header';
import { TaxonomyEntityForm } from '@/components/admin/taxonomy/taxonomy-entity-form';
import { useTargetGroup, useUpdateTargetGroup } from '@/lib/api/taxonomy';

export default function TargetGroupEditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: targetGroup, isLoading } = useTargetGroup(id);
  const updateTargetGroup = useUpdateTargetGroup();
  const t = useTranslations('admin.taxonomy');

  if (isLoading) return <DetailPageLoadingSkeleton />;
  if (!targetGroup) return <div className="p-8 text-[#6b7280]">{t('pages.targetGroupNotFound')}</div>;

  return (
    <div className="space-y-6">
      <TaxonomyPageHeader title={t('pages.editEntity', { name: targetGroup.name })} />
      <TaxonomyEntityForm
        entityLabel={t('entities.targetGroup')}
        initialValue={{ name: targetGroup.name, status: targetGroup.status }}
        onCancel={() => router.push(`/admin/taxonomy/target-groups/${id}`)}
        onSubmit={async (payload) => {
          await updateTargetGroup.mutateAsync({ id, ...payload });
          router.push(`/admin/taxonomy/target-groups/${id}`);
        }}
      />
    </div>
  );
}
