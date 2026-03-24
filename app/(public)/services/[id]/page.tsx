'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { usePublicService } from '@/lib/api/services';

export default function PublicServiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: service, isLoading } = usePublicService(id);

  if (isLoading) return <div className="mx-auto max-w-4xl px-4 py-12 text-gray-500">Loading...</div>;
  if (!service) return <div className="mx-auto max-w-4xl px-4 py-12 text-gray-500">Service not found</div>;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-4 text-sm text-gray-500">
        <Link href="/services" className="hover:underline">Services</Link>{' > '}{service.title}
      </div>

      <h1 className="text-3xl font-bold">{service.title}</h1>
      <p className="mt-2 text-gray-600">{service.shortDescription}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {service.topics.map((t) => <Badge key={t.topic.id} variant="neutral">{t.topic.name}</Badge>)}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 rounded-lg border bg-white p-6">
        <div>
          <div className="text-sm font-medium text-gray-500">Organisation</div>
          <div className="mt-1">{service.organisation.name}</div>
        </div>
        <div>
          <div className="text-sm font-medium text-gray-500">Region</div>
          <div className="mt-1">{service.region?.name || 'All regions'}</div>
        </div>
        {service.targetGroup.length > 0 && (
          <div>
            <div className="text-sm font-medium text-gray-500">Target groups</div>
            <div className="mt-1">{service.targetGroup.join(', ')}</div>
          </div>
        )}
        {(service.availabilityStart || service.availabilityEnd) && (
          <div>
            <div className="text-sm font-medium text-gray-500">Availability</div>
            <div className="mt-1">
              {service.availabilityStart && new Date(service.availabilityStart).toLocaleDateString()}
              {service.availabilityStart && service.availabilityEnd && ' — '}
              {service.availabilityEnd && new Date(service.availabilityEnd).toLocaleDateString()}
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 rounded-lg border bg-white p-6">
        <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: service.description }} />
      </div>
    </div>
  );
}
