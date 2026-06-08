'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { AdminPanel } from '@/components/admin/admin-surface';
import { Badge } from '@/components/ui/badge';
import { ActionButton } from '@/components/ui/action-button';
import { DetailPageLoadingSkeleton } from '@/components/shared/loading-skeletons';
import { useAdminService, useDeleteService, usePublishService, useUnpublishService } from '@/lib/api/services';
import { formatStatusLabel } from '@/lib/formatting/status-label';

export default function ServiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: service, isLoading } = useAdminService(id);
  const deleteService = useDeleteService();
  const publishService = usePublishService();
  const unpublishService = useUnpublishService();

  if (isLoading) return <DetailPageLoadingSkeleton />;
  if (!service) return <div className="p-8 text-[#6b7280]">Service not found</div>;

  return (
    <div>
      <div className="mb-2 text-sm text-[#6b7280]">
        <Link href="/admin/services" className="hover:underline">Service directory</Link>{' > '}{service.title}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">{service.title}</h1>
          <Badge variant={service.status === 'PUBLISHED' ? 'success' : 'warning'}>
            {formatStatusLabel(service.status)}
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

      <div className="mt-6 space-y-3 sm:space-y-4">
        <AdminPanel className="p-4 sm:p-5">
          <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
            <div>
              <div className="text-sm font-medium text-[#6b7280]">Organisation</div>
              <div className="mt-1">{service.organisation.name}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-[#6b7280]">Region</div>
              <div className="mt-1">{service.region?.name || 'All regions'}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-[#6b7280]">Status</div>
              <div className="mt-1"><Badge variant={service.isAvailable ? 'success' : 'danger'}>{service.isAvailable ? 'Available' : 'Unavailable'}</Badge></div>
            </div>
            <div>
              <div className="text-sm font-medium text-[#6b7280]">Topics</div>
              <div className="mt-1 flex flex-wrap gap-1">{service.topics.map((t) => <Badge key={t.topic.id} variant="neutral">{t.topic.name}</Badge>)}</div>
            </div>
            {service.targetGroup.length > 0 && (
              <div>
                <div className="text-sm font-medium text-[#6b7280]">Target groups</div>
                <div className="mt-1">{service.targetGroup.join(', ')}</div>
              </div>
            )}
          </div>
        </AdminPanel>

        <AdminPanel className="p-4 sm:p-5">
          <div className="text-sm font-medium text-[#6b7280] mb-2">Short description</div>
          <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: service.shortDescription }} />
        </AdminPanel>

        <AdminPanel className="p-4 sm:p-5">
          <div className="text-sm font-medium text-[#6b7280] mb-2">Description</div>
          <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: service.description }} />
        </AdminPanel>

        {service.howToAccess ? (
          <AdminPanel className="p-4 sm:p-5">
            <div className="text-sm font-medium text-[#6b7280] mb-2">How to access the service</div>
            <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: service.howToAccess }} />
          </AdminPanel>
        ) : null}
      </div>
    </div>
  );
}
