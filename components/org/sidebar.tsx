'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  ArchiveBoxIcon,
  InboxIcon,
  MapIcon,
  BuildingOffice2Icon,
} from '@heroicons/react/24/outline';
import { type ComponentType, type SVGProps } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/lib/auth/auth-context';
import { getBestActiveHref } from '@/lib/navigation/active-nav';

type NavItem = {
  labelKey: string;
  href: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
};

type NavSection = {
  titleKey?: string;
  items: NavItem[];
};

const orgNav: NavSection[] = [
  {
    items: [{ labelKey: 'dashboard', href: '/org/dashboard', icon: HomeIcon }],
  },
  {
    titleKey: 'sectionServices',
    items: [{ labelKey: 'services', href: '/org/services', icon: ArchiveBoxIcon }],
  },
  {
    titleKey: 'sectionNeeds',
    items: [
      { labelKey: 'needs', href: '/org/needs', icon: InboxIcon },
      { labelKey: 'needsMap', href: '/org/needs/map', icon: MapIcon },
    ],
  },
  {
    titleKey: 'sectionConfig',
    items: [{ labelKey: 'profile', href: '/org/profile', icon: BuildingOffice2Icon }],
  },
];

export function OrgSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const t = useTranslations('org.sidebar');
  const tOrg = useTranslations('org');
  const organisationName = user?.organisation?.name || tOrg('orgFallback');
  const activeHref = getBestActiveHref(
    pathname,
    orgNav.flatMap((section) => section.items).map((item) => item.href),
  );

  return (
    <aside className="flex h-full w-80 flex-col border-r border-[#e5e5e5] bg-white">
      <div className="border-b border-[#e5e5e5] px-5 pb-4 pt-5">
        <p className="text-sm font-semibold text-[#111827]">{organisationName}</p>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 pb-6 pt-3" aria-label={t('navAria')}>
        {orgNav.map((section, idx) => (
          <div key={idx} className="py-2">
            {section.titleKey ? (
              <p className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#9ca3af]">
                {t(section.titleKey)}
              </p>
            ) : null}
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = activeHref === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={isActive ? 'page' : undefined}
                    className={`flex items-center gap-3 border-l-[3px] px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? 'border-l-[#E8922D] text-[#E8922D]'
                        : 'border-l-transparent text-[#374151] hover:text-[#111827]'
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${isActive ? 'text-[#E8922D]' : 'text-[#9ca3af]'}`} />
                    {t(item.labelKey)}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-[#e5e5e5] p-4">
        <p className="text-sm font-medium text-[#111827]">{user?.firstName} {user?.lastName}</p>
        <p className="text-xs text-[#6b7280]">{user?.email}</p>
      </div>
    </aside>
  );
}
