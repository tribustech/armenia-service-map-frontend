'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePublicTopics, usePublicServices } from '@/lib/api/services';
import type { Service } from '@/types/api';

export default function HomePage() {
  const t = useTranslations('home');
  const router = useRouter();
  const [search, setSearch] = useState('');
  const { data: topics } = usePublicTopics();
  const { data: latestServices } = usePublicServices({ perPage: 6, sortBy: 'createdAt', sortOrder: 'desc' });

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/services?search=${encodeURIComponent(search.trim())}`);
    }
  }

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-orange-50 to-white px-4 py-16 md:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl font-bold md:text-5xl">{t('title')}</h1>
          <p className="mt-4 text-lg text-gray-600">{t('subtitle')}</p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/services">
              <Button>Browse services</Button>
            </Link>
            <Link href="/about">
              <Button variant="secondary">{t('readMore')}</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Search */}
      <section className="bg-white px-4 py-12">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold">{t('searchTitle')}</h2>
          <form onSubmit={handleSearch} className="mt-6 flex gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="flex-1 rounded-md border border-gray-300 px-4 py-2.5 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
            <Button type="submit">Search</Button>
          </form>
        </div>
      </section>

      {/* Topics */}
      {topics && topics.length > 0 && (
        <section className="bg-gray-50 px-4 py-12">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-center text-2xl font-bold">{t('browseTopics')}</h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {topics.map((topic) => (
                <Link
                  key={topic.id}
                  href={`/services?topicId=${topic.id}`}
                  className="rounded-lg border bg-white p-4 text-center transition-shadow hover:shadow-md"
                >
                  <div className="font-medium">{topic.name}</div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Latest Services */}
      {latestServices && latestServices.data.length > 0 && (
        <section className="px-4 py-12">
          <div className="mx-auto max-w-6xl">
            <div className="text-center">
              <h2 className="text-2xl font-bold">{t('latestServices')}</h2>
              <p className="mt-2 text-gray-600">{t('latestServicesSubtitle')}</p>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {latestServices.data.map((service: Service) => (
                <Link key={service.id} href={`/services/${service.id}`} className="rounded-lg border bg-white p-5 transition-shadow hover:shadow-md">
                  <h3 className="font-semibold">{service.title}</h3>
                  <p className="mt-1 text-sm text-gray-500">{service.organisation.name}</p>
                  <p className="mt-2 text-sm text-gray-600 line-clamp-2">{service.shortDescription}</p>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {service.topics.map((st) => (
                      <Badge key={st.topic.id} variant="neutral">{st.topic.name}</Badge>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
            <div className="mt-8 text-center">
              <Link href="/services">
                <Button variant="secondary">{t('viewAllServices')}</Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-orange-50 px-4 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold">{t('ctaTitle')}</h2>
          <p className="mt-3 text-gray-600">{t('ctaSubtitle')}</p>
          <div className="mt-6">
            <Link href="/report-a-need">
              <Button>{t('reportNeed')}</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
