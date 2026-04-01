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

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

const statCards = [
  {
    key: 'totalServices',
    label: 'Total services',
    href: '/org/services',
    tone: 'from-[#e7f7ef] to-[#d7f2e4] text-[#1f6a47]',
  },
  {
    key: 'assignedNeeds',
    label: 'Assigned need reports',
    href: '/org/needs',
    tone: 'from-[#e9f5ff] to-[#d6ebfb] text-[#245a86]',
  },
  {
    key: 'resolvedNeeds',
    label: 'Resolved needs',
    href: '/org/needs',
    tone: 'from-[#f1f8ea] to-[#e3f3d5] text-[#446b1f]',
  },
] as const;

export default function OrgDashboardPage() {
  const { user } = useAuth();
  const { data: stats, isLoading: statsLoading } = useOrgOverviewStats();
  const { data: trends, isLoading: trendsLoading } = useOrgDashboardTrends(12);

  if (statsLoading || trendsLoading) {
    return <div className="rounded-2xl border border-[#e4efe7] bg-white p-8 text-sm text-[#658371]">Loading dashboard…</div>;
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
      <section className="rounded-2xl border border-[#dceee2] bg-gradient-to-r from-[#effaf3] via-[#f7fcf9] to-[#effaf3] p-6">
        <p className="text-sm uppercase tracking-[0.14em] text-[#4d8f70]">Welcome back</p>
        <h1 className="mt-1 text-2xl font-semibold text-[#214736]">
          {user?.firstName} {user?.lastName}
        </h1>
        <p className="mt-2 text-sm text-[#5f7f6e]">
          Track your organisation's service activity and assigned need-report progress.
        </p>
        <div className="mt-4 flex flex-wrap gap-2 text-sm">
          <Link href="/org/services/new" className="rounded-lg border border-[#cfe6d8] bg-white px-3 py-2 text-[#245942] hover:bg-[#f2faf6]">
            Add new service
          </Link>
          <Link href="/org/needs" className="rounded-lg border border-[#cfe6d8] bg-white px-3 py-2 text-[#245942] hover:bg-[#f2faf6]">
            View assigned needs
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {statCards.map((card) => (
          <Link key={card.key} href={card.href} className={`rounded-2xl border border-white/70 bg-gradient-to-br p-5 shadow-sm ${card.tone}`}>
            <p className="text-sm font-medium">{card.label}</p>
            <p className="mt-2 text-3xl font-semibold">{stats?.[card.key] ?? 0}</p>
          </Link>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-2xl border border-[#e4efe7] bg-white p-5">
          <h2 className="text-base font-semibold text-[#234a37]">Assigned need reports over time</h2>
          <p className="mt-1 text-xs text-[#6b8878]">12-month trend of needs assigned to your organisation.</p>
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

        <div className="rounded-2xl border border-[#e4efe7] bg-white p-5">
          <h2 className="text-base font-semibold text-[#234a37]">Services created over time</h2>
          <p className="mt-1 text-xs text-[#6b8878]">12-month trend of services created by your organisation.</p>
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
