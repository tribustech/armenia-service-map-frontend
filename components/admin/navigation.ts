import {
  ArchiveBoxIcon,
  ArrowTrendingUpIcon,
  HomeIcon,
  InboxIcon,
  MapIcon,
  UserGroupIcon,
  ViewColumnsIcon,
} from '@heroicons/react/24/outline';
import { type ComponentType, type SVGProps } from 'react';

export type AdminNavItem = {
  /** Key under `admin.sidebar.*` resolving to the display label. */
  labelKey: string;
  /** Key under `admin.sidebar.*` used as a section title. */
  titleKey?: string;
  href: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
};

export type AdminNavSection = {
  /** Key under `admin.sidebar.*` resolving to the section title. */
  titleKey?: string;
  /** Stable identifier used to track open/closed state per section. */
  id?: string;
  items: AdminNavItem[];
};

export const adminNav: AdminNavSection[] = [
  {
    items: [{ labelKey: 'dashboard', href: '/admin/dashboard', icon: HomeIcon }],
  },
  {
    id: 'services',
    titleKey: 'services',
    items: [{ labelKey: 'serviceDirectory', href: '/admin/services', icon: ArchiveBoxIcon }],
  },
  {
    id: 'needs',
    titleKey: 'needsAndQueries',
    items: [
      { labelKey: 'needReports', href: '/admin/needs', icon: InboxIcon },
      { labelKey: 'needsMap', href: '/admin/needs/map', icon: MapIcon },
      { labelKey: 'analytics', href: '/admin/analytics', icon: ArrowTrendingUpIcon },
    ],
  },
  {
    id: 'configurations',
    titleKey: 'configurations',
    items: [
      { labelKey: 'userManagement', href: '/admin/organisations', icon: UserGroupIcon },
      { labelKey: 'taxonomy', href: '/admin/taxonomy', icon: ViewColumnsIcon },
    ],
  },
];

/** Maps a URL path segment to a key under `admin.breadcrumbs.*`. */
export const adminBreadcrumbKeys: Record<string, string> = {
  admin: 'dashboard',
  dashboard: 'dashboard',
  services: 'serviceDirectory',
  needs: 'needReports',
  map: 'needsMap',
  analytics: 'analytics',
  organisations: 'userManagement',
  users: 'users',
  taxonomy: 'taxonomy',
};
