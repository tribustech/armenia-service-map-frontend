'use client';

import { useParams, useRouter } from 'next/navigation';
import { DetailPageLoadingSkeleton } from '@/components/shared/loading-skeletons';
import { TaxonomyPageHeader } from '@/components/admin/taxonomy/taxonomy-page-header';
import { TaxonomyEntityForm } from '@/components/admin/taxonomy/taxonomy-entity-form';
import { useNeedTag, useUpdateNeedTag } from '@/lib/api/taxonomy';

export default function NeedTagEditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: tag, isLoading } = useNeedTag(id);
  const updateNeedTag = useUpdateNeedTag();

  if (isLoading) return <DetailPageLoadingSkeleton />;
  if (!tag) return <div className="p-8 text-[#6b7280]">Need tag not found</div>;

  return (
    <div className="space-y-6">
      <TaxonomyPageHeader title={`Edit ${tag.name}`} />
      <TaxonomyEntityForm
        entityLabel="Need tag"
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
