'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';

interface NavItem {
  label: string;
  href: string;
  icon: string;
}

interface NavSection {
  title?: string;
  items: NavItem[];
}

const adminNav: NavSection[] = [
  {
    items: [{ label: 'Dashboard', href: '/admin/dashboard', icon: '🏠' }],
  },
  {
    title: 'Services',
    items: [{ label: 'Service directory', href: '/admin/services', icon: '📋' }],
  },
  {
    title: 'Needs & Queries',
    items: [
      { label: 'Need reports', href: '/admin/needs', icon: '📬' },
      { label: 'Needs map', href: '/admin/needs/map', icon: '🗺' },
      { label: 'Analytics', href: '/admin/analytics', icon: '📊' },
    ],
  },
  {
    title: 'Configurations',
    items: [
      { label: 'User management', href: '/admin/organisations', icon: '👥' },
      { label: 'Taxonomy', href: '/admin/taxonomy', icon: '🏷' },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <aside className="flex h-full w-64 flex-col border-r bg-white">
      {/* Orange accent bar */}
      <div className="h-1 bg-orange-500" />

      <div className="p-4">
        <div className="text-sm font-semibold text-gray-500">ADMIN</div>
      </div>

      <nav className="flex-1 space-y-6 px-3">
        {adminNav.map((section, i) => (
          <div key={i}>
            {section.title && (
              <div className="mb-2 px-3 text-xs font-semibold uppercase text-gray-400">
                {section.title}
              </div>
            )}
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                      isActive
                        ? 'bg-orange-50 font-medium text-orange-600'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span>{item.icon}</span>
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="border-t p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm">
            <div className="font-medium">{user?.firstName} {user?.lastName}</div>
            <div className="text-gray-500">{user?.email}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
