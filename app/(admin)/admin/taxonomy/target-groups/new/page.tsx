'use client';

import { useRouter } from 'next/navigation';
import { TaxonomyPageHeader } from '@/components/admin/taxonomy/taxonomy-page-header';
import { TaxonomyEntityForm } from '@/components/admin/taxonomy/taxonomy-entity-form';
import { useCreateTargetGroup } from '@/lib/api/taxonomy';

export default function TargetGroupCreatePage() {
  const router = useRouter();
  const createTargetGroup = useCreateTargetGroup();

  return (
    <div className="space-y-6">
      <TaxonomyPageHeader title="Add target group" />
      <TaxonomyEntityForm
        entityLabel="Target group"
        onCancel={() => router.push('/admin/taxonomy')}
        onSubmit={async (payload) => {
          const targetGroup = await createTargetGroup.mutateAsync(payload);
          router.push(`/admin/taxonomy/target-groups/${targetGroup.id}`);
        }}
      />
    </div>
  );
}
