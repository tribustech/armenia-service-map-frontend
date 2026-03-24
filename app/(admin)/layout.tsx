'use client';

import { useAuth } from '@/lib/auth/auth-context';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
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
      {/* Sidebar will be built in Phase 2 */}
      <aside className="w-64 border-r bg-white p-4">
        <div className="text-lg font-bold">ADMIN</div>
        <nav className="mt-8 space-y-2">
          <a href="/admin/dashboard" className="block rounded p-2 hover:bg-gray-100">Dashboard</a>
        </nav>
      </aside>
      <main className="flex-1 overflow-y-auto bg-gray-50 p-8">{children}</main>
    </div>
  );
}
