'use client';

import { Fragment, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { ChevronRightIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
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
    <header className="sticky top-0 z-20 border-b border-[#e4efe7] bg-[#f8fcfa]/95 px-6 py-4 backdrop-blur">
      <div className="flex items-center justify-between gap-4">
        <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-2 text-sm text-[#61806f]">
          {breadcrumbs.map((label, index) => (
            <Fragment key={`${label}-${index}`}>
              {index > 0 ? <ChevronRightIcon className="h-4 w-4 text-[#9ab7a8]" /> : null}
              <span className={index === breadcrumbs.length - 1 ? 'truncate font-semibold text-[#234a37]' : 'truncate'}>
                {label}
              </span>
            </Fragment>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-[#e3efe8] bg-white px-3 py-2 text-sm text-[#355543]">
            <p className="font-medium">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-[#6e8d7d]">{user?.email}</p>
          </div>
          <button
            type="button"
            onClick={() => void logout()}
            className="inline-flex items-center gap-2 rounded-xl border border-[#d4e6db] bg-white px-3 py-2 text-sm font-medium text-[#2c5b45] transition hover:bg-[#ecf6f0]"
          >
            <ArrowRightOnRectangleIcon className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
