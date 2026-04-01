'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { ActionButton } from '@/components/ui/action-button';
import { useAdminService, useDeleteService, usePublishService, useUnpublishService } from '@/lib/api/services';

export default function ServiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: service, isLoading } = useAdminService(id);
  const deleteService = useDeleteService();
  const publishService = usePublishService();
  const unpublishService = useUnpublishService();

  if (isLoading) return <div className="p-8 text-gray-500">Loading...</div>;
  if (!service) return <div className="p-8 text-gray-500">Service not found</div>;

  return (
    <div>
      <div className="mb-2 text-sm text-gray-500">
        <Link href="/admin/services" className="hover:underline">Service directory</Link>{' > '}{service.title}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">{service.title}</h1>
          <Badge variant={service.status === 'PUBLISHED' ? 'success' : 'warning'}>
            {service.status}
          </Badge>
        </div>
        <div className="flex gap-4">
          <ActionButton variant="edit" onClick={() => router.push(`/admin/services/${id}/edit`)} />
          <ActionButton variant="delete" onClick={() => { if (confirm('Delete this service?')) { deleteService.mutate(id); router.push('/admin/services'); } }} />
          {service.status === 'PUBLISHED' ? (
            <ActionButton variant="publish" onClick={() => unpublishService.mutate(id)}>
              Unpublish
            </ActionButton>
          ) : (
            <ActionButton variant="publish" onClick={() => publishService.mutate(id)}>
              Publish
            </ActionButton>
          )}
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <div className="rounded-lg border bg-white p-6">
          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            <div>
              <div className="text-sm font-medium text-gray-500">Organisation</div>
              <div className="mt-1">{service.organisation.name}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">Region</div>
              <div className="mt-1">{service.region?.name || 'All regions'}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">Status</div>
              <div className="mt-1"><Badge variant={service.isAvailable ? 'success' : 'danger'}>{service.isAvailable ? 'Available' : 'Unavailable'}</Badge></div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">Topics</div>
              <div className="mt-1 flex flex-wrap gap-1">{service.topics.map((t) => <Badge key={t.topic.id} variant="neutral">{t.topic.name}</Badge>)}</div>
            </div>
            {service.targetGroup.length > 0 && (
              <div>
                <div className="text-sm font-medium text-gray-500">Target groups</div>
                <div className="mt-1">{service.targetGroup.join(', ')}</div>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-lg border bg-white p-6">
          <div className="text-sm font-medium text-gray-500 mb-2">Short description</div>
          <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: service.shortDescription }} />
        </div>

        <div className="rounded-lg border bg-white p-6">
          <div className="text-sm font-medium text-gray-500 mb-2">Description</div>
          <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: service.description }} />
        </div>
      </div>
    </div>
  );
}
