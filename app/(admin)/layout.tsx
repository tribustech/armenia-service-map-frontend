'use client';

import { useAuth } from '@/lib/auth/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AdminSidebar } from '@/components/admin/sidebar';
import { AdminTopbar } from '@/components/admin/topbar';
import { ShellLoadingScreen } from '@/components/shared/loading-skeletons';

export type AdminSidebarMode = 'full' | 'rail' | 'drawer';

function getSidebarMode(width: number): AdminSidebarMode {
  if (width < 768) return 'drawer';
  if (width < 1280) return 'rail';
  return 'full';
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [sidebarMode, setSidebarMode] = useState<AdminSidebarMode>(() => {
    if (typeof window === 'undefined') {
      return 'full';
    }

    return getSidebarMode(window.innerWidth);
  });
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    const syncMode = () => {
      const nextMode = getSidebarMode(window.innerWidth);
      setSidebarMode(nextMode);

      if (nextMode !== 'drawer') {
        setMobileNavOpen(false);
      }
    };

    syncMode();
    window.addEventListener('resize', syncMode);
    return () => {
      window.removeEventListener('resize', syncMode);
    };
  }, []);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return <ShellLoadingScreen tone="admin" />;
  }

  if (!isAuthenticated) return null;

  return (
    <div
      data-testid="admin-shell"
      className="flex h-screen overflow-hidden bg-[#f5f5f4]"
    >
      <a href="#admin-main-content" className="skip-link">Skip to main content</a>
      <AdminSidebar
        mode={sidebarMode}
        mobileNavOpen={mobileNavOpen}
        onCloseMobileNav={() => setMobileNavOpen(false)}
      />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <AdminTopbar
          mobileNavOpen={mobileNavOpen}
          onToggleMobileNav={() => setMobileNavOpen((prev) => !prev)}
          showMobileNavTrigger={sidebarMode === 'drawer'}
        />
        <main
          id="admin-main-content"
          className="min-h-0 flex-1 overflow-y-auto px-4 py-5 md:px-6 md:py-6 xl:px-8 xl:py-8"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
