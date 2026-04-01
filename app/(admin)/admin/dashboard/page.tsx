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
import { BookOpenIcon, CodeBracketSquareIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { useOverviewStats, useDashboardTrends } from '@/lib/api/analytics';
import { useAuth } from '@/lib/auth/auth-context';
import { DashboardLoadingSkeleton } from '@/components/shared/loading-skeletons';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

export default function AdminDashboardPage() {
  const { user, logout } = useAuth();
  const { data: stats, isLoading: statsLoading } = useOverviewStats();
  const { data: trends, isLoading: trendsLoading } = useDashboardTrends(12);

  if (statsLoading || trendsLoading) {
    return <DashboardLoadingSkeleton tone="admin" />;
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
      <section className="rounded-2xl border border-[#f0ece6] bg-gradient-to-r from-[#fff2df] via-[#fff7ee] to-[#fff2df] p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.14em] text-[#b98249]">Welcome back</p>
            <h1 className="mt-1 text-2xl font-semibold text-[#3f3428]">
              {user?.firstName} {user?.lastName}
            </h1>
            <p className="mt-2 text-sm text-[#6f604f]">
              Monitor platform health, search behavior, and activity volume in one place.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void logout()}
            className="inline-flex items-center gap-2 rounded-xl border border-[#e8d3b6] bg-white px-4 py-2 text-sm font-medium text-[#8a4d11] transition hover:bg-[#fff6eb]"
          >
            <ArrowRightOnRectangleIcon className="h-4 w-4" />
            Sign out
          </button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2 text-sm">
          <Link
            href="https://docs.nestjs.com"
            target="_blank"
            className="inline-flex items-center gap-2 rounded-lg border border-[#ead8be] bg-white px-3 py-2 text-[#7a5f41] hover:bg-[#fff7ee]"
          >
            <BookOpenIcon className="h-4 w-4" />
            Documentation
          </Link>
          <Link
            href="https://github.com"
            target="_blank"
            className="inline-flex items-center gap-2 rounded-lg border border-[#ead8be] bg-white px-3 py-2 text-[#7a5f41] hover:bg-[#fff7ee]"
          >
            <CodeBracketSquareIcon className="h-4 w-4" />
            GitHub
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <DashboardStatCard title="Total Services" value={stats?.totalServices ?? 0} tone="amber" />
        <DashboardStatCard title="Total Need Reports" value={stats?.totalNeedReports ?? 0} tone="teal" />
        <DashboardStatCard title="Total Organisations" value={stats?.totalOrganisations ?? 0} tone="rose" />
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-2xl border border-[#f0ece6] bg-white p-5">
          <h2 className="text-base font-semibold text-[#3f3428]">Need reports over time</h2>
          <p className="mt-1 text-xs text-[#8f7a62]">12-month trend of created need reports.</p>
          <div className="mt-4">
            <Line
              data={{
                labels,
                datasets: [
                  {
                    label: 'Need reports',
                    data: trends?.needReports.map((item) => item.count) ?? [],
                    borderColor: '#d4761f',
                    backgroundColor: '#f5c490',
                    pointBackgroundColor: '#bc5e0d',
                    tension: 0.35,
                  },
                ],
              }}
              options={{ responsive: true, plugins: { legend: { display: false } } }}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-[#f0ece6] bg-white p-5">
          <h2 className="text-base font-semibold text-[#3f3428]">Services created over time</h2>
          <p className="mt-1 text-xs text-[#8f7a62]">12-month trend of newly added services.</p>
          <div className="mt-4">
            <Line
              data={{
                labels,
                datasets: [
                  {
                    label: 'Services',
                    data: trends?.services.map((item) => item.count) ?? [],
                    borderColor: '#2b8b74',
                    backgroundColor: '#8ad6c5',
                    pointBackgroundColor: '#1f6f5d',
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

function DashboardStatCard({
  title,
  value,
  tone,
}: {
  title: string;
  value: number;
  tone: 'amber' | 'teal' | 'rose';
}) {
  const classes =
    tone === 'amber'
      ? 'from-[#fff2df] to-[#ffe4bf] text-[#8a4d11]'
      : tone === 'teal'
        ? 'from-[#e8f8f3] to-[#d4f0e8] text-[#1b6d58]'
        : 'from-[#fff0f2] to-[#ffdce3] text-[#932642]';

  return (
    <div className={`rounded-2xl border border-white/70 bg-gradient-to-br p-5 shadow-sm ${classes}`}>
      <p className="text-sm font-medium">{title}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
    </div>
  );
}
