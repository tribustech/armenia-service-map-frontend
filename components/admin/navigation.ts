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
  label: string;
  href: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
};

export type AdminNavSection = {
  title?: string;
  items: AdminNavItem[];
};

export const adminNav: AdminNavSection[] = [
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

export const adminBreadcrumbLabels: Record<string, string> = {
  admin: 'Dashboard',
  dashboard: 'Dashboard',
  services: 'Service Directory',
  needs: 'Need Reports',
  map: 'Needs Map',
  analytics: 'Analytics',
  organisations: 'User Management',
  users: 'Users',
  taxonomy: 'Taxonomy',
};
