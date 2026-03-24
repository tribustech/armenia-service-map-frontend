'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';

const orgNav = [
  { label: 'Dashboard', href: '/org/dashboard' },
  { label: 'Services', href: '/org/services' },
  { label: 'Need reports', href: '/org/needs' },
  { label: 'Profile', href: '/org/profile' },
];

export function OrgSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <aside className="flex h-full w-64 flex-col border-r bg-white">
      <div className="h-1 bg-orange-500" />
      <div className="p-4">
        <div className="text-sm font-semibold text-gray-500">ORGANISATION</div>
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {orgNav.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${isActive ? 'bg-orange-50 font-medium text-orange-600' : 'text-gray-700 hover:bg-gray-100'}`}>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t p-4">
        <div className="text-sm">
          <div className="font-medium">{user?.firstName} {user?.lastName}</div>
          <div className="text-gray-500">{user?.email}</div>
        </div>
      </div>
    </aside>
  );
}
