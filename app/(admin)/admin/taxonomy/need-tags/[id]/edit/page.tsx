'use client';

import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { DetailPageLoadingSkeleton } from '@/components/shared/loading-skeletons';
import { TaxonomyPageHeader } from '@/components/admin/taxonomy/taxonomy-page-header';
import { TaxonomyEntityForm } from '@/components/admin/taxonomy/taxonomy-entity-form';
import { useNeedTag, useUpdateNeedTag } from '@/lib/api/taxonomy';

export default function NeedTagEditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: tag, isLoading } = useNeedTag(id);
  const updateNeedTag = useUpdateNeedTag();
  const t = useTranslations('admin.taxonomy');

  if (isLoading) return <DetailPageLoadingSkeleton />;
  if (!tag) return <div className="p-8 text-[#6b7280]">{t('pages.tagNotFound')}</div>;

  return (
    <div className="space-y-6">
      <TaxonomyPageHeader title={t('pages.editEntity', { name: tag.name })} />
      <TaxonomyEntityForm
        entityLabel={t('entities.needTag')}
        initialValue={{ name: tag.name, status: tag.status }}
        onCancel={() => router.push(`/admin/taxonomy/need-tags/${id}`)}
        onSubmit={async (payload) => {
          await updateNeedTag.mutateAsync({ id, ...payload });
          router.push(`/admin/taxonomy/need-tags/${id}`);
        }}
      />
    </div>
  );
}
