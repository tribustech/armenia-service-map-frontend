'use client';

import { useOverviewStats } from '@/lib/api/analytics';

const statCards = [
  { key: 'totalServices', label: 'Total services', color: 'bg-blue-50 text-blue-700' },
  { key: 'totalOrganisations', label: 'Organisations', color: 'bg-green-50 text-green-700' },
  { key: 'totalNeedReports', label: 'Need reports', color: 'bg-orange-50 text-orange-700' },
  { key: 'totalSearches', label: 'Searches', color: 'bg-purple-50 text-purple-700' },
  { key: 'newNeeds', label: 'New needs', color: 'bg-red-50 text-red-700' },
  { key: 'resolvedNeeds', label: 'Resolved needs', color: 'bg-emerald-50 text-emerald-700' },
] as const;

export default function AdminDashboardPage() {
  const { data: stats, isLoading } = useOverviewStats();

  return (
    <div>
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {isLoading ? (
        <div className="mt-8 text-gray-500">Loading...</div>
      ) : stats ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {statCards.map((card) => (
            <div key={card.key} className={`rounded-lg border p-6 ${card.color}`}>
              <div className="text-sm font-medium opacity-75">{card.label}</div>
              <div className="mt-2 text-3xl font-bold">{stats[card.key]}</div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
