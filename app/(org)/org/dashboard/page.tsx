'use client';

import Link from 'next/link';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useOrgOverviewStats, useOrgDashboardTrends } from '@/lib/api/analytics';
import { useAuth } from '@/lib/auth/auth-context';
import { DashboardLoadingSkeleton } from '@/components/shared/loading-skeletons';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

const statCards = [
  { key: 'totalServices', label: 'Total services', href: '/org/services' },
  { key: 'assignedNeeds', label: 'Assigned need reports', href: '/org/needs' },
  { key: 'resolvedNeeds', label: 'Resolved needs', href: '/org/needs' },
] as const;

export default function OrgDashboardPage() {
  const { user } = useAuth();
  const { data: stats, isLoading: statsLoading } = useOrgOverviewStats();
  const { data: trends, isLoading: trendsLoading } = useOrgDashboardTrends(12);

  if (statsLoading || trendsLoading) {
    return <DashboardLoadingSkeleton tone="org" />;
  }

  const labels = trends?.months.map((month) => {
    const [year, monthValue] = month.split('-');
    return new Date(Number(year), Number(monthValue) - 1, 1).toLocaleDateString(undefined, {
      month: 'short',
      year: '2-digit',
    });
  }) ?? [];

  return (
    <div className="space-y-6">
      <section className="admin-panel p-6">
        <p className="text-sm uppercase tracking-[0.14em] text-[#9ca3af]">Welcome back</p>
        <h1 className="mt-1 text-2xl font-semibold text-[#111827]">
          {user?.firstName} {user?.lastName}
        </h1>
        <p className="mt-2 text-sm text-[#6b7280]">
          Track your organisation&apos;s service activity and assigned need-report progress.
        </p>
        <div className="mt-4 flex flex-wrap gap-2 text-sm">
          <Link href="/org/services/new" className="rounded-lg border border-[#d1d5db] bg-white px-3 py-2 text-[#374151] hover:bg-[#fafafa]">
            Add new service
          </Link>
          <Link href="/org/needs" className="rounded-lg border border-[#d1d5db] bg-white px-3 py-2 text-[#374151] hover:bg-[#fafafa]">
            View assigned needs
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {statCards.map((card) => (
          <Link key={card.key} href={card.href} className="rounded-xl border border-[#e8e8e8] bg-white p-5 text-[#111827] shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <p className="text-sm font-medium">{card.label}</p>
            <p className="mt-2 text-3xl font-semibold">{stats?.[card.key] ?? 0}</p>
          </Link>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <div className="admin-panel p-5">
          <h2 className="text-base font-semibold text-[#111827]">Assigned need reports over time</h2>
          <p className="mt-1 text-xs text-[#6b7280]">12-month trend of needs assigned to your organisation.</p>
          <div className="mt-4">
            <Line
              data={{
                labels,
                datasets: [
                  {
                    label: 'Assigned needs',
                    data: trends?.needReports.map((item) => item.count) ?? [],
                    borderColor: '#2f8b5f',
                    backgroundColor: '#b8e6cc',
                    pointBackgroundColor: '#1f6a47',
                    tension: 0.35,
                  },
                ],
              }}
              options={{ responsive: true, plugins: { legend: { display: false } } }}
            />
          </div>
        </div>

        <div className="admin-panel p-5">
          <h2 className="text-base font-semibold text-[#111827]">Services created over time</h2>
          <p className="mt-1 text-xs text-[#6b7280]">12-month trend of services created by your organisation.</p>
          <div className="mt-4">
            <Line
              data={{
                labels,
                datasets: [
                  {
                    label: 'Services',
                    data: trends?.services.map((item) => item.count) ?? [],
                    borderColor: '#2b6da8',
                    backgroundColor: '#a8cfef',
                    pointBackgroundColor: '#1f4f7a',
                    tension: 0.35,
                  },
                ],
              }}
              options={{ responsive: true, plugins: { legend: { display: false } } }}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
