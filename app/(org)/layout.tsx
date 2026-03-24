'use client';

import { useAuth } from '@/lib/auth/auth-context';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';
import { OrgSidebar } from '@/components/org/sidebar';

export default function OrgLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      redirect('/login');
    }
  }, [isLoading, isAuthenticated]);

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated) return null;

  return (
    <div className="flex h-screen">
      <OrgSidebar />
      <main className="flex-1 overflow-y-auto bg-gray-50 p-8">{children}</main>
    </div>
  );
}
