'use client';

import { useRouter } from 'next/navigation';
import { TaxonomyPageHeader } from '@/components/admin/taxonomy/taxonomy-page-header';
import { TopicForm } from '@/components/admin/taxonomy/topic-form';
import { useCreateTopic } from '@/lib/api/taxonomy';

export default function TopicCreatePage() {
  const router = useRouter();
  const createTopic = useCreateTopic();

  return (
    <div className="space-y-6">
      <TaxonomyPageHeader title="Add service topic" />
      <TopicForm
        mode="create"
        onCancel={() => router.push('/admin/taxonomy')}
        onSubmit={async (payload) => {
          const topic = await createTopic.mutateAsync(payload);
          router.push(`/admin/taxonomy/topics/${topic.id}`);
        }}
      />
    </div>
  );
}
