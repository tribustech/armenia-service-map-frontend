'use client';

import { Fragment, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/lib/auth/auth-context';

const segmentLabel: Record<string, string> = {
  org: 'Dashboard',
  dashboard: 'Dashboard',
  services: 'Service listings',
  needs: 'Assigned needs',
  map: 'Needs map',
  profile: 'Organisation profile',
};

export function OrgTopbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const breadcrumbs = useMemo(() => {
    const segments = pathname.split('/').filter(Boolean);
    const usable = segments.slice(1);
    return usable.map((segment) => segmentLabel[segment] ?? segment);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-20 border-b border-[#f0f0f0] bg-white px-6 py-3">
      <div className="flex items-center justify-between gap-4">
        <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-2 text-sm text-[#6b7280]">
          {breadcrumbs.map((label, index) => (
            <Fragment key={`${label}-${index}`}>
              {index > 0 ? <ChevronRightIcon className="h-4 w-4 text-[#d1d5db]" /> : null}
              <span className={index === breadcrumbs.length - 1 ? 'truncate font-semibold text-[#111827]' : 'truncate'}>
                {label}
              </span>
            </Fragment>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1a1a1a] text-xs font-semibold text-white">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <button
            type="button"
            onClick={() => void logout()}
            className="text-sm font-medium text-[#6b7280] transition hover:text-[#111827]"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
