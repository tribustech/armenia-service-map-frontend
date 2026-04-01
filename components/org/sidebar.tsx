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
import { useAuth } from '@/lib/auth/auth-context';

type NavItem = {
  label: string;
  href: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
};

type NavSection = {
  title?: string;
  items: NavItem[];
};

const orgNav: NavSection[] = [
  {
    items: [{ label: 'Dashboard', href: '/org/dashboard', icon: HomeIcon }],
  },
  {
    title: 'Services',
    items: [{ label: 'Service listings', href: '/org/services', icon: ArchiveBoxIcon }],
  },
  {
    title: 'Needs & Queries',
    items: [
      { label: 'Assigned needs', href: '/org/needs', icon: InboxIcon },
      { label: 'Needs map', href: '/org/needs/map', icon: MapIcon },
    ],
  },
  {
    title: 'Configurations',
    items: [{ label: 'Organisation profile', href: '/org/profile', icon: BuildingOffice2Icon }],
  },
];

export function OrgSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const organisationName = user?.organisation?.name || 'Organisation';

  return (
    <aside className="flex h-full w-80 flex-col border-r border-[#e4efe7] bg-[#fbfefc]">
      <div className="border-b border-[#e7f1ea] px-5 pb-5 pt-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#4f9470]">RefugeeSupport</p>
        <p className="mt-2 line-clamp-2 text-sm font-semibold text-[#214736]">{organisationName}</p>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 pb-6 pt-3">
        {orgNav.map((section, idx) => (
          <div key={idx} className="py-2">
            {section.title ? (
              <p className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#75a58b]">
                {section.title}
              </p>
            ) : null}
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-[#e5f6eb] text-[#1f6a47]'
                        : 'text-[#365646] hover:bg-[#eef8f1] hover:text-[#234a37]'
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${isActive ? 'text-[#2f8b5f]' : 'text-[#7baa8f]'}`} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-[#e4efe7] p-4">
        <p className="text-sm font-medium text-[#214736]">{user?.firstName} {user?.lastName}</p>
        <p className="text-xs text-[#6e8c7b]">{user?.email}</p>
      </div>
    </aside>
  );
}
