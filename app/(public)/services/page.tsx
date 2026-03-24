'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Pagination } from '@/components/admin/pagination';
import { ArmeniaMap } from '@/components/shared/armenia-map';
import { usePublicServices, usePublicTopics, usePublicRegions } from '@/lib/api/services';
import type { Service } from '@/types/api';

type ViewMode = 'list' | 'map';

export default function PublicServicesPage() {
  const [view, setView] = useState<ViewMode>('list');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [selectedTopicId, setSelectedTopicId] = useState('');
  const [selectedRegionId, setSelectedRegionId] = useState('');

  const { data: topics } = usePublicTopics();
  const { data: regions } = usePublicRegions();
  const { data, isLoading } = usePublicServices({
    page,
    perPage,
    search,
    topicId: selectedTopicId || undefined,
    regionId: selectedRegionId || undefined,
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-3xl font-bold">Support services</h1>
      <p className="mt-2 text-gray-600">Browse available support services across Armenia</p>

      {/* Filters */}
      <div className="mt-6 flex flex-wrap items-center gap-4">
        <Input placeholder="Search services..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="w-64" />
        <select value={selectedTopicId} onChange={(e) => { setSelectedTopicId(e.target.value); setPage(1); }} className="rounded-md border border-gray-300 px-3 py-2 text-sm">
          <option value="">All topics</option>
          {topics?.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <select value={selectedRegionId} onChange={(e) => { setSelectedRegionId(e.target.value); setPage(1); }} className="rounded-md border border-gray-300 px-3 py-2 text-sm">
          <option value="">All regions</option>
          {regions?.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>
        <div className="ml-auto flex gap-1 rounded-lg bg-gray-100 p-1">
          <button onClick={() => setView('list')} className={`rounded-md px-3 py-1.5 text-sm ${view === 'list' ? 'bg-white shadow-sm' : ''}`}>List</button>
          <button onClick={() => setView('map')} className={`rounded-md px-3 py-1.5 text-sm ${view === 'map' ? 'bg-white shadow-sm' : ''}`}>Map</button>
        </div>
      </div>

      {/* Content */}
      <div className="mt-6">
        {view === 'map' ? (
          <div className="flex justify-center">
            <ArmeniaMap
              selectedRegionId={regions?.find((r) => r.id === selectedRegionId)?.svgPathId}
              onRegionClick={(svgPathId) => {
                const region = regions?.find((r) => r.svgPathId === svgPathId);
                setSelectedRegionId(region?.id === selectedRegionId ? '' : region?.id || '');
                setPage(1);
              }}
            />
          </div>
        ) : null}

        {isLoading ? (
          <div className="py-12 text-center text-gray-500">Loading...</div>
        ) : (
          <>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {data?.data.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
            {data?.data.length === 0 && (
              <div className="py-12 text-center text-gray-500">No services found matching your criteria</div>
            )}
            {data && data.meta.totalPages > 1 && (
              <div className="mt-6">
                <Pagination page={data.meta.page} totalPages={data.meta.totalPages} total={data.meta.total} perPage={data.meta.perPage} onPageChange={setPage} onPerPageChange={(pp) => { setPerPage(pp); setPage(1); }} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function ServiceCard({ service }: { service: Service }) {
  return (
    <Link href={`/services/${service.id}`} className="block rounded-lg border bg-white p-5 transition-shadow hover:shadow-md">
      <h3 className="font-semibold">{service.title}</h3>
      <p className="mt-1 text-sm text-gray-500">{service.organisation.name}</p>
      <p className="mt-2 text-sm text-gray-600 line-clamp-2">{service.shortDescription}</p>
      <div className="mt-3 flex flex-wrap gap-1">
        {service.topics.map((t) => (
          <Badge key={t.topic.id} variant="neutral">{t.topic.name}</Badge>
        ))}
      </div>
      {service.region && (
        <div className="mt-2 text-xs text-gray-400">{service.region.name}</div>
      )}
    </Link>
  );
}
