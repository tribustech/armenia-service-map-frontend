'use client';

import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { DetailPageLoadingSkeleton } from '@/components/shared/loading-skeletons';
import { TaxonomyPageHeader } from '@/components/admin/taxonomy/taxonomy-page-header';
import { TopicForm } from '@/components/admin/taxonomy/topic-form';
import { useTopic, useUpdateTopic } from '@/lib/api/taxonomy';

export default function TopicEditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: topic, isLoading } = useTopic(id);
  const updateTopic = useUpdateTopic();
  const t = useTranslations('admin.taxonomy');

  if (isLoading) return <DetailPageLoadingSkeleton />;
  if (!topic) return <div className="p-8 text-[#6b7280]">{t('pages.topicNotFound')}</div>;

  return (
    <div className="space-y-6">
      <TaxonomyPageHeader title={t('pages.editEntity', { name: topic.name })} />
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
