'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { AdminPanel } from '@/components/admin/admin-surface';
import { TopicSubtopicsTable } from '@/components/admin/taxonomy/topic-subtopics-table';
import { TaxonomyPageHeader } from '@/components/admin/taxonomy/taxonomy-page-header';
import { Badge } from '@/components/ui/badge';
import { DetailPageLoadingSkeleton } from '@/components/shared/loading-skeletons';
import { useTopic, useUpdateTopic } from '@/lib/api/taxonomy';
import { formatStatusLabel } from '@/lib/formatting/status-label';

export default function TopicDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const { data: topic, isLoading } = useTopic(id);
  const updateTopic = useUpdateTopic();

  if (isLoading) return <DetailPageLoadingSkeleton />;
  if (!topic) return <div className="p-8 text-[#6b7280]">Topic not found</div>;

  return (
    <div className="space-y-6">
      <TaxonomyPageHeader
        title={topic.name}
        action={{ href: `/admin/taxonomy/topics/${id}/edit`, label: 'Edit service topic' }}
      />

      <AdminPanel className="rounded-xl border border-[#e8e8e8] bg-white p-5">
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <Badge variant={topic.status === 'ACTIVE' ? 'success' : 'neutral'}>{formatStatusLabel(topic.status)}</Badge>
          <span className="text-sm text-[#6b7280]">{topic._count.services} services</span>
        </div>
        <h2 className="mb-4 text-lg font-semibold text-[#111827]">Sub-topics</h2>
        <TopicSubtopicsTable
          rows={topic.children}
          pendingId={pendingId}
          onToggleStatus={async ({ id: subtopicId, status }) => {
            try {
              setPendingId(subtopicId);
              await updateTopic.mutateAsync({ id: subtopicId, status });
            } finally {
              setPendingId(null);
            }
          }}
        />
      </AdminPanel>
    </div>
  );
}
