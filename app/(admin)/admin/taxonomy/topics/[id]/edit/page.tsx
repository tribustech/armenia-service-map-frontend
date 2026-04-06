'use client';

import { useParams, useRouter } from 'next/navigation';
import { DetailPageLoadingSkeleton } from '@/components/shared/loading-skeletons';
import { TaxonomyPageHeader } from '@/components/admin/taxonomy/taxonomy-page-header';
import { TopicForm } from '@/components/admin/taxonomy/topic-form';
import { useTopic, useUpdateTopic } from '@/lib/api/taxonomy';

export default function TopicEditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: topic, isLoading } = useTopic(id);
  const updateTopic = useUpdateTopic();

  if (isLoading) return <DetailPageLoadingSkeleton />;
  if (!topic) return <div className="p-8 text-[#6b7280]">Topic not found</div>;

  return (
    <div className="space-y-6">
      <TaxonomyPageHeader title={`Edit ${topic.name}`} />
      <TopicForm
        mode="edit"
        initialValue={topic}
        onCancel={() => router.push(`/admin/taxonomy/topics/${id}`)}
        onSubmit={async (payload) => {
          await updateTopic.mutateAsync({ id, ...payload });
          router.push(`/admin/taxonomy/topics/${id}`);
        }}
      />
    </div>
  );
}
