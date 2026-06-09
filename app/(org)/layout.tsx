'use client';

import { useAuth } from '@/lib/auth/auth-context';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { OrgSidebar } from '@/components/org/sidebar';
import { OrgTopbar } from '@/components/org/topbar';
import { ShellLoadingScreen } from '@/components/shared/loading-skeletons';

export default function OrgLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const t = useTranslations('org');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return <ShellLoadingScreen tone="org" />;
  }

  if (!isAuthenticated) return null;

  return (
    <div className="flex h-screen bg-[#f5f5f4]">
      <a href="#org-main-content" className="skip-link">{t('skipToContent')}</a>
      <OrgSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <OrgTopbar />
        <main id="org-main-content" className="flex-1 overflow-y-auto p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
