'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ArmeniaMap } from '@/components/shared/armenia-map';
import { Pagination } from '@/components/admin/pagination';
import { NeedCtaBanner } from '@/components/public/need-cta-banner';
import { usePublicRegionServiceCounts, usePublicRegions, usePublicServices, usePublicTopics } from '@/lib/api/services';
import type { PaginatedResponse, Service } from '@/types/api';

type ViewMode = 'list' | 'map';

export default function PublicServicesPage() {
  return (
    <Suspense fallback={<ServicesPageSkeleton />}>
      <ServicesContent />
    </Suspense>
  );
}

function ServicesContent() {
  const searchParams = useSearchParams();
  const t = useTranslations('services');
  const tHome = useTranslations('home');
  const tNav = useTranslations('nav');

  const [view, setView] = useState<ViewMode>('list');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedTopicId, setSelectedTopicId] = useState(searchParams.get('topicId') || '');
  const [selectedRegionId, setSelectedRegionId] = useState(searchParams.get('regionId') || '');
  const [onlyAvailable, setOnlyAvailable] = useState(searchParams.get('available') === 'true');

  const { data: topics } = usePublicTopics();
  const { data: regions } = usePublicRegions();
  const { data: regionServiceCounts } = usePublicRegionServiceCounts();
  const { data, isLoading } = usePublicServices({
    page,
    perPage,
    search,
    topicId: selectedTopicId || undefined,
    regionId: selectedRegionId || undefined,
    isAvailable: onlyAvailable || undefined,
  });

  const totalServices = data?.meta.total ?? 0;
  const selectedRegionName = regions?.find((region) => region.id === selectedRegionId)?.name;

  return (
    <div className="min-h-screen bg-[#f9fafb]">
      <div className="mx-auto max-w-7xl px-6 pb-6 pt-8">
        <div className="mb-5 flex items-center gap-2 text-sm text-[#6a7282]">
          <Link href="/" className="hover:text-[#155dfc]">{tNav('home')}</Link>
          <span>/</span>
          <span className="text-[#101828]">{t('title')}</span>
        </div>

        <h1 className="text-4xl font-bold text-[#101828]">{t('title')}</h1>
        <p className="mt-3 max-w-4xl text-lg leading-7 text-[#4a5565]">{t('subtitle')}</p>
      </div>

      <div className="mx-auto max-w-7xl px-6">
        <div className="rounded-2xl border border-[#e5e7eb] bg-white p-6 shadow-lg">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="flex items-center gap-3 rounded-[14px] border border-[#e5e7eb] bg-[#f9fafb] px-4 py-3">
              <MapPinIcon />
              <select
                value={selectedRegionId}
                onChange={(event) => {
                  setSelectedRegionId(event.target.value);
                  setPage(1);
                }}
                className="flex-1 bg-transparent text-[#364153] outline-none"
              >
                <option value="">{t('allRegions')}</option>
                {regions?.map((region) => (
                  <option key={region.id} value={region.id}>{region.name}</option>
                ))}
              </select>
            </label>

            <label className="flex items-center gap-3 rounded-[14px] border border-[#e5e7eb] bg-[#f9fafb] px-4 py-3">
              <SearchIcon />
              <input
                type="search"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder={t('searchPlaceholder')}
                className="flex-1 bg-transparent text-[#364153] outline-none placeholder:text-[#6a7282]"
              />
            </label>
          </div>

          <div className="mt-5 space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#364153]">
              <FilterIcon />
              {t('filterByTopic')}
            </div>
            <div className="flex flex-wrap gap-2">
              {topics?.map((topic) => (
                <button
                  key={topic.id}
                  onClick={() => {
                    setSelectedTopicId((current) => (current === topic.id ? '' : topic.id));
                    setPage(1);
                  }}
                  className={`rounded-[10px] border px-4 py-1.5 text-sm font-medium transition-colors ${
                    selectedTopicId === topic.id
                      ? 'border-[#155dfc] bg-[#eff6ff] text-[#155dfc]'
                      : 'border-[#d1d5db] bg-white text-[#364153] hover:border-[#9ca3af]'
                  }`}
                >
                  {topic.name}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-4 border-t border-[#e5e7eb] pt-4 md:flex-row md:items-center md:justify-between">
            <label className="inline-flex items-center gap-2 text-sm text-[#364153]">
              <input
                type="checkbox"
                checked={onlyAvailable}
                onChange={(event) => {
                  setOnlyAvailable(event.target.checked);
                  setPage(1);
                }}
                className="h-4 w-4 rounded border-[#9ca3af] text-[#155dfc] focus:ring-[#155dfc]"
              />
              {t('onlyAvailable')}
            </label>

            <div className="flex items-center justify-between gap-4 md:justify-end">
              <p className="text-sm text-[#4a5565]">
                <span className="font-bold">{totalServices}</span> {t('servicesFound')}
              </p>

              <div className="flex gap-2">
                <button
                  onClick={() => setView('list')}
                  className={`inline-flex items-center gap-2 rounded-[10px] px-4 py-2 text-sm font-medium transition-colors ${
                    view === 'list' ? 'bg-[#155dfc] text-white' : 'bg-[#f3f4f6] text-[#364153]'
                  }`}
                >
                  <ListIcon />
                  {t('list')}
                </button>
                <button
                  onClick={() => setView('map')}
                  className={`inline-flex items-center gap-2 rounded-[10px] px-4 py-2 text-sm font-medium transition-colors ${
                    view === 'map' ? 'bg-[#155dfc] text-white' : 'bg-[#f3f4f6] text-[#364153]'
                  }`}
                >
                  <MapIcon />
                  {t('map')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {view === 'map' ? (
          <div className="flex flex-col gap-5 lg:flex-row">
            <div className="flex flex-col gap-4 lg:w-3/5">
              <div
                className="overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white shadow-lg"
                style={{ background: 'linear-gradient(134deg, #eff6ff 0%, #eef2ff 50%, #dbeafe 100%)' }}
              >
                <ArmeniaMap
                  regionCounts={regionServiceCounts || {}}
                  selectedRegionId={regions?.find((region) => region.id === selectedRegionId)?.svgPathId}
                  countLabelSingular={t('serviceSingular')}
                  countLabelPlural={t('servicePlural')}
                  onRegionClick={(svgPathId) => {
                    const region = regions?.find((entry) => entry.svgPathId === svgPathId);
                    setSelectedRegionId(region?.id === selectedRegionId ? '' : (region?.id || ''));
                    setPage(1);
                  }}
                />
              </div>

              <div className="rounded-[14px] border border-[#e5e7eb] bg-white p-4 shadow-lg">
                <h4 className="text-sm font-bold text-[#101828]">{t('mapLegendTitle')}</h4>
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <LegendItem color="bg-[#51a2ff]" label={t('legendWithServices')} opacity="opacity-70" />
                  <LegendItem color="bg-[#155dfc]" label={t('legendSelected')} opacity="opacity-90" />
                  <LegendItem color="bg-[#d1d5dc]" label={t('legendWithoutServices')} opacity="opacity-50" />
                </div>
              </div>
            </div>

            <div className="lg:w-2/5">
              <h3 className="mb-4 text-lg font-semibold text-[#101828]">
                {selectedRegionName
                  ? t('regionalServicesTitle', { region: selectedRegionName, count: totalServices })
                  : t('nationwideServices')}
              </h3>
              <ServiceList data={data} isLoading={isLoading} />
            </div>
          </div>
        ) : (
          <ServiceList data={data} isLoading={isLoading} />
        )}

        {data && data.meta.totalPages > 1 ? (
          <div className="mt-7">
            <Pagination
              page={data.meta.page}
              totalPages={data.meta.totalPages}
              total={data.meta.total}
              perPage={data.meta.perPage}
              onPageChange={setPage}
              onPerPageChange={(nextPerPage) => {
                setPerPage(nextPerPage);
                setPage(1);
              }}
            />
          </div>
        ) : null}
      </div>

      <NeedCtaBanner
        title={tHome('ctaTitle')}
        subtitle={tHome('ctaSubtitle')}
        buttonLabel={tHome('reportNeed')}
      />
    </div>
  );
}

function ServiceList({
  data,
  isLoading,
}: {
  data: PaginatedResponse<Service> | undefined;
  isLoading: boolean;
}) {
  const t = useTranslations('services');

  if (isLoading) {
    return <ServiceCardSkeleton />;
  }

  if (!data || data.data.length === 0) {
    return <p className="py-12 text-center text-[#6a7282]">{t('noResults')}</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {data.data.map((service) => (
        <ServiceCard key={service.id} service={service} />
      ))}
    </div>
  );
}

function ServiceCard({ service }: { service: Service }) {
  const t = useTranslations('services');
  const badgeTopics = service.topics.slice(0, 3);

  return (
    <article className="rounded-2xl border border-[#e5e7eb] bg-white p-6 shadow-lg">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-[#6a7282]">
            <MapPinIcon />
            {service.organisation.name}
          </div>
          <h3 className="mt-2 text-xl font-bold text-[#101828]">{service.title}</h3>
        </div>

        {service.isAvailable ? (
          <span className="rounded-full bg-[#dcfce7] px-3 py-1 text-xs font-semibold text-[#166534]">{t('available')}</span>
        ) : (
          <span className="rounded-full bg-[#fee2e2] px-3 py-1 text-xs font-semibold text-[#b91c1c]">{t('unavailable')}</span>
        )}
      </div>

      <p className="mt-4 text-base leading-6 text-[#4a5565] line-clamp-2">
        {service.shortDescription?.replace(/<[^>]*>/g, '')}
      </p>

      {badgeTopics.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {badgeTopics.map((topic) => (
            <span key={topic.topic.id} className="rounded-full bg-[#dbeafe] px-3 py-1 text-xs font-semibold text-[#1447e6]">
              {topic.topic.name}
            </span>
          ))}
        </div>
      ) : null}

      {service.targetGroup.length > 0 ? (
        <p className="mt-4 text-sm text-[#6a7282]">
          {t('whoFor')}: {service.targetGroup.join(', ')}
        </p>
      ) : null}

      <Link
        href={`/services/${service.id}`}
        className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#155dfc] hover:text-[#1247cc]"
      >
        {t('open')}
        <ArrowRightMiniIcon />
      </Link>
    </article>
  );
}

function ServicesPageSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="h-8 w-56 animate-pulse rounded bg-[#e5e7eb]" />
      <div className="mt-3 h-5 w-full max-w-3xl animate-pulse rounded bg-[#eef2f7]" />
      <div className="mt-6 h-44 animate-pulse rounded-2xl bg-[#eef2f7]" />
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="h-48 animate-pulse rounded-2xl bg-[#eef2f7]" />
        <div className="h-48 animate-pulse rounded-2xl bg-[#eef2f7]" />
      </div>
    </div>
  );
}

function ServiceCardSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="rounded-2xl border border-[#e5e7eb] bg-white p-6 shadow-lg">
          <div className="h-4 w-40 animate-pulse rounded bg-[#e5e7eb]" />
          <div className="mt-3 h-6 w-3/4 animate-pulse rounded bg-[#e5e7eb]" />
          <div className="mt-4 h-4 w-full animate-pulse rounded bg-[#eef2f7]" />
          <div className="mt-2 h-4 w-5/6 animate-pulse rounded bg-[#eef2f7]" />
          <div className="mt-5 h-4 w-28 animate-pulse rounded bg-[#dbeafe]" />
        </div>
      ))}
    </div>
  );
}

function LegendItem({
  color,
  label,
  opacity,
}: {
  color: string;
  label: string;
  opacity: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className={`h-4 w-4 rounded ${color} ${opacity}`} />
      <span className="text-xs text-[#364153]">{label}</span>
    </div>
  );
}

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6a7282" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  );
}

function MapPinIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  );
}

function MapIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
      <line x1="8" y1="2" x2="8" y2="18" />
      <line x1="16" y1="6" x2="16" y2="22" />
    </svg>
  );
}

function ArrowRightMiniIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}
