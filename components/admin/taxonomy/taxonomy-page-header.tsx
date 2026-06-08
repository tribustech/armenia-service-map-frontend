'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';

export function TaxonomyPageHeader({
  breadcrumbHref = '/admin/taxonomy',
  breadcrumbLabel,
  title,
  action,
}: {
  breadcrumbHref?: string;
  breadcrumbLabel?: string;
  title: string;
  action?: { href: string; label: string };
}) {
  const t = useTranslations('admin.taxonomy');

  return (
    <div>
      <div className="mb-2 text-sm text-[#6b7280]">
        <Link href={breadcrumbHref} className="hover:underline">
          {breadcrumbLabel ?? t('title')}
        </Link>
        {' > '}
        {title}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">{title}</h1>
        {action ? (
          <Link
            href={action.href}
            className="inline-flex items-center justify-center rounded-lg border border-[#E8922D] bg-[#E8922D] px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:border-[#d4801f] hover:bg-[#d4801f]"
          >
            {action.label}
          </Link>
        ) : null}
      </div>
    </div>
  );
}
