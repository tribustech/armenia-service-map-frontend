'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  ArchiveBoxIcon,
  InboxIcon,
  MapIcon,
  ArrowTrendingUpIcon,
  UserGroupIcon,
  ViewColumnsIcon,
  BuildingLibraryIcon,
} from '@heroicons/react/24/outline';
import { type ComponentType, type SVGProps, useMemo, useState } from 'react';

interface NavItem {
  label: string;
  href: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}

interface NavSection {
  title?: string;
  items: NavItem[];
}

const adminNav: NavSection[] = [
  {
    items: [{ label: 'Dashboard', href: '/admin/dashboard', icon: HomeIcon }],
  },
  {
    title: 'Services',
    items: [{ label: 'Service directory', href: '/admin/services', icon: ArchiveBoxIcon }],
  },
  {
    title: 'Needs & Queries',
    items: [
      { label: 'Need reports', href: '/admin/needs', icon: InboxIcon },
      { label: 'Needs map', href: '/admin/needs/map', icon: MapIcon },
      { label: 'Analytics', href: '/admin/analytics', icon: ArrowTrendingUpIcon },
    ],
  },
  {
    title: 'Configurations',
    items: [
      { label: 'User management', href: '/admin/organisations', icon: UserGroupIcon },
      { label: 'Taxonomy', href: '/admin/taxonomy', icon: ViewColumnsIcon },
    ],
  },
];

function SectionHeader({ title, open, onToggle }: { title: string; open: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="flex h-10 w-full items-center gap-3 px-3 text-sm font-semibold text-[#8f7357]"
    >
      <span className="flex-1 text-left">{title}</span>
      <svg
        className={`h-3.5 w-3.5 text-[#bc9d7b] transition-transform ${open ? '' : 'rotate-180'}`}
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
      </svg>
    </button>
  );
}

export function AdminSidebar() {
  const pathname = usePathname();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const isSectionOpen = (title: string) => openSections[title] !== false;
  const toggleSection = (title: string) =>
    setOpenSections((prev) => ({ ...prev, [title]: !isSectionOpen(title) }));
  const activeItem = useMemo(
    () =>
      adminNav
        .flatMap((section) => section.items)
        .find((item) => pathname === item.href || pathname.startsWith(item.href + '/')),
    [pathname],
  );

  return (
    <aside className="flex h-full w-80 flex-col border-r border-[#f0ece6] bg-white">
      <div className="border-b border-[#f4ede4] px-5 pb-5 pt-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff3e2] text-[#e87c15]">
            <BuildingLibraryIcon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#d0832f]">RefugeeSupport</p>
            <p className="text-sm font-semibold text-[#3f3428]">Admin Portal</p>
          </div>
        </div>
        {activeItem ? (
          <div className="mt-4 rounded-xl bg-[#fff7ee] px-3 py-2 text-xs font-medium text-[#865f34]">
            Active section: {activeItem.label}
          </div>
        ) : null}
      </div>

      <div className="px-5 pt-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#b89169]">Navigation</p>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 pb-6 pt-2">
        {adminNav.map((section, i) => (
          <div key={i} className="py-3">
            {section.title && (
              <SectionHeader
                title={section.title}
                open={isSectionOpen(section.title)}
                onToggle={() => toggleSection(section.title!)}
              />
            )}
            {(!section.title || isSectionOpen(section.title)) && (
              <div className="flex flex-col gap-1">
                {section.items.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-[#fff3e2] text-[#b65d0d]'
                          : 'text-[#5f5141] hover:bg-[#fff8f0] hover:text-[#3f3428]'
                      }`}
                    >
                      <Icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-[#e47417]' : 'text-[#ad8f70]'}`} />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
}
