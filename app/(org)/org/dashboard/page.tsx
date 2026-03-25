'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useOrgOverviewStats } from '@/lib/api/analytics';

const statCards = [
  { key: 'totalServices', label: 'Total services', color: 'bg-blue-50 text-blue-700', href: '/org/services' },
  { key: 'activeServices', label: 'Active services', color: 'bg-green-50 text-green-700', href: '/org/services' },
  { key: 'assignedNeeds', label: 'Assigned needs', color: 'bg-orange-50 text-orange-700', href: '/org/needs' },
  { key: 'resolvedNeeds', label: 'Resolved needs', color: 'bg-emerald-50 text-emerald-700', href: '/org/needs' },
] as const;

export default function OrgDashboardPage() {
  const { data: stats, isLoading } = useOrgOverviewStats();

  return (
    <div>
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {isLoading ? (
        <div className="mt-8 text-gray-500">Loading...</div>
      ) : stats ? (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {statCards.map((card) => (
              <Link key={card.key} href={card.href} className={`block rounded-lg border p-6 transition-shadow hover:shadow-md ${card.color}`}>
                <div className="text-sm font-medium opacity-75">{card.label}</div>
                <div className="mt-2 text-3xl font-bold">{stats[card.key]}</div>
              </Link>
            ))}
          </div>

          <div className="mt-8 flex gap-4">
            <Link href="/org/services/new"><Button>Add new service</Button></Link>
            <Link href="/org/needs"><Button variant="secondary">View assigned needs</Button></Link>
          </div>
        </>
      ) : null}
    </div>
  );
}
