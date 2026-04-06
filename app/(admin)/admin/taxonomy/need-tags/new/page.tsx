'use client';

import { useRouter } from 'next/navigation';
import { TaxonomyPageHeader } from '@/components/admin/taxonomy/taxonomy-page-header';
import { TaxonomyEntityForm } from '@/components/admin/taxonomy/taxonomy-entity-form';
import { useCreateNeedTag } from '@/lib/api/taxonomy';

export default function NeedTagCreatePage() {
  const router = useRouter();
  const createNeedTag = useCreateNeedTag();

  return (
    <div className="space-y-6">
      <TaxonomyPageHeader title="Add need tag" />
      <TaxonomyEntityForm
        entityLabel="Need tag"
        onCancel={() => router.push('/admin/taxonomy')}
        onSubmit={async (payload) => {
          const tag = await createNeedTag.mutateAsync(payload);
          router.push(`/admin/taxonomy/need-tags/${tag.id}`);
        }}
      />
    </div>
  );
}
