'use client';

import { useMemo, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import {
  useAllSearches,
  useFilterHeatmap,
  useLeastUsedFilters,
  useMostUsedFilters,
  useOverviewStats,
  useSearchFrequency,
  useTopQueries,
  useZeroResultQueries,
} from '@/lib/api/analytics';
import { AnalyticsLoadingSkeleton } from '@/components/shared/loading-skeletons';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Tooltip, Legend);

function downloadCsv(filename: string, rows: Array<Record<string, string | number>>) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(','),
    ...rows.map((row) =>
      headers
        .map((header) => {
          const value = String(row[header] ?? '');
          return `"${value.replace(/"/g, '""')}"`;
        })
        .join(','),
    ),
  ].join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export default function AdminAnalyticsPage() {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(12);
  const [search, setSearch] = useState('');

  const { data: overview, isLoading: overviewLoading } = useOverviewStats();
  const { data: topQueries, isLoading: topLoading } = useTopQueries(8);
  const { data: zeroQueries, isLoading: zeroLoading } = useZeroResultQueries(8);
  const { data: frequency, isLoading: frequencyLoading } = useSearchFrequency('day', 30);
  const { data: allSearches, isLoading: allSearchesLoading } = useAllSearches({
    page,
    perPage,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    search,
  });
  const { data: mostUsedFilters, isLoading: mostUsedLoading } = useMostUsedFilters(8);
  const { data: leastUsedFilters, isLoading: leastUsedLoading } = useLeastUsedFilters(8);
  const { data: heatmapData, isLoading: heatmapLoading } = useFilterHeatmap();

  const loading =
    overviewLoading ||
    topLoading ||
    zeroLoading ||
    frequencyLoading ||
    allSearchesLoading ||
    mostUsedLoading ||
    leastUsedLoading ||
    heatmapLoading;

  const lineData = useMemo(() => {
    const labels = frequency?.map((item) => new Date(item.bucketStart).toLocaleDateString()) ?? [];
    const values = frequency?.map((item) => item.count) ?? [];
    return {
      labels,
      datasets: [
        {
          label: 'Searches',
          data: values,
          borderColor: '#d6761e',
          backgroundColor: '#f7c58f',
          pointBackgroundColor: '#c35e10',
          tension: 0.35,
        },
      ],
    };
  }, [frequency]);

  const heatmapLookup = useMemo(() => {
    const map = new Map<string, number>();
    (heatmapData?.matrix ?? []).forEach((entry) => {
      map.set(`${entry.topicId}:${entry.regionId}`, entry.count);
    });
    return map;
  }, [heatmapData]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#3f3428]">Analytics</h1>
          <p className="mt-1 text-sm text-[#7b6a56]">Search behavior, filter usage, and quality insights.</p>
        </div>
      </div>

      {loading ? (
        <AnalyticsLoadingSkeleton />
      ) : (
        <>
          <section className="grid gap-4 md:grid-cols-3">
            <StatCard title="Total searches" value={overview?.totalSearches ?? 0} tone="amber" />
            <StatCard title="Total unique searches" value={overview?.totalUniqueSearches ?? 0} tone="teal" />
            <StatCard title="Zero-result searches" value={overview?.totalZeroResultSearches ?? 0} tone="rose" />
          </section>

          <section className="grid gap-4 xl:grid-cols-3">
            <Panel title="Top search queries" subtitle="Most frequent terms used by visitors.">
              <QueryList rows={topQueries ?? []} empty="No searches yet." />
            </Panel>
            <Panel title="Zero-result queries" subtitle="Queries with no matching services.">
              <QueryList rows={zeroQueries ?? []} empty="No zero-result queries." danger />
            </Panel>
            <Panel title="Search frequency trend" subtitle="Daily search volume over the last 30 buckets.">
              <Line
                data={lineData}
                options={{
                  responsive: true,
                  plugins: { legend: { display: false } },
                  scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
                }}
              />
            </Panel>
          </section>

          <section className="rounded-2xl border border-[#f0ece6] bg-white">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#f7f2eb] px-5 py-4">
              <div>
                <h2 className="text-lg font-semibold text-[#3f3428]">All searches</h2>
                <p className="text-xs text-[#8f7a62]">Date, term, and result count for operational review.</p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(1);
                  }}
                  placeholder="Search query text..."
                  className="rounded-xl border border-[#e8dfd4] px-3 py-2 text-sm text-[#4f4437] outline-none focus:border-[#df9a53]"
                />
                <button
                  type="button"
                  onClick={() => {
                    const rows =
                      allSearches?.data.map((item) => ({
                        date: new Date(item.createdAt).toISOString(),
                        query: item.query,
                        resultsCount: item.resultsCount,
                      })) ?? [];
                    downloadCsv('analytics-searches.csv', rows);
                  }}
                  className="rounded-xl bg-[#e87c15] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#ca6406]"
                >
                  Download CSV
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-[#f7f2eb] bg-[#fffaf4] text-left text-[#8a765f]">
                    <th className="px-5 py-3 font-medium">Date</th>
                    <th className="px-5 py-3 font-medium">Query</th>
                    <th className="px-5 py-3 font-medium"># Results</th>
                  </tr>
                </thead>
                <tbody>
                  {allSearches?.data.map((item) => (
                    <tr key={item.id} className="border-b border-[#faf4ed] text-[#4f4437]">
                      <td className="px-5 py-3">{new Date(item.createdAt).toLocaleString()}</td>
                      <td className="px-5 py-3">{item.query}</td>
                      <td className="px-5 py-3">{item.resultsCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {allSearches ? (
              <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 text-xs text-[#8f7a62]">
                <span>
                  Page {allSearches.meta.page} / {allSearches.meta.totalPages} ({allSearches.meta.total} rows)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={allSearches.meta.page <= 1}
                    onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                    className="rounded-lg border border-[#e6dbcf] px-3 py-1 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Prev
                  </button>
                  <button
                    type="button"
                    disabled={allSearches.meta.page >= allSearches.meta.totalPages}
                    onClick={() => setPage((prev) => prev + 1)}
                    className="rounded-lg border border-[#e6dbcf] px-3 py-1 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                  </button>
                  <select
                    value={perPage}
                    onChange={(event) => {
                      setPerPage(Number(event.target.value));
                      setPage(1);
                    }}
                    className="rounded-lg border border-[#e6dbcf] px-2 py-1 text-xs"
                  >
                    <option value={12}>12</option>
                    <option value={24}>24</option>
                    <option value={48}>48</option>
                  </select>
                </div>
              </div>
            ) : null}
          </section>

          <section className="grid gap-4 xl:grid-cols-2">
            <Panel title="Most used filters" subtitle="Top regions and topics selected in search.">
              <Bar
                data={{
                  labels: [
                    ...(mostUsedFilters?.regionUsage.map((item) => `Region: ${item.regionName}`) ?? []),
                    ...(mostUsedFilters?.topicUsage.map((item) => `Topic: ${item.topicName}`) ?? []),
                  ],
                  datasets: [
                    {
                      label: 'Usage count',
                      data: [
                        ...(mostUsedFilters?.regionUsage.map((item) => item.count) ?? []),
                        ...(mostUsedFilters?.topicUsage.map((item) => item.count) ?? []),
                      ],
                      backgroundColor: '#f3a44f',
                    },
                  ],
                }}
                options={{
                  indexAxis: 'y',
                  responsive: true,
                  plugins: { legend: { display: false } },
                }}
              />
            </Panel>

            <Panel title="Least used filters" subtitle="Long-tail filters with lowest usage.">
              <Bar
                data={{
                  labels: [
                    ...(leastUsedFilters?.regionUsage.map((item) => `Region: ${item.regionName}`) ?? []),
                    ...(leastUsedFilters?.topicUsage.map((item) => `Topic: ${item.topicName}`) ?? []),
                  ],
                  datasets: [
                    {
                      label: 'Usage count',
                      data: [
                        ...(leastUsedFilters?.regionUsage.map((item) => item.count) ?? []),
                        ...(leastUsedFilters?.topicUsage.map((item) => item.count) ?? []),
                      ],
                      backgroundColor: '#ddb78a',
                    },
                  ],
                }}
                options={{
                  indexAxis: 'y',
                  responsive: true,
                  plugins: { legend: { display: false } },
                }}
              />
            </Panel>
          </section>

          <section className="rounded-2xl border border-[#f0ece6] bg-white p-5">
            <h2 className="text-lg font-semibold text-[#3f3428]">Filter combinations heatmap</h2>
            <p className="mt-1 text-xs text-[#8f7a62]">Topics (rows) x Regions (columns).</p>
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-1 text-xs">
                <thead>
                  <tr>
                    <th className="px-2 py-1 text-left text-[#7b6a56]">Topic \\ Region</th>
                    {heatmapData?.regions.map((region) => (
                      <th key={region.id} className="px-2 py-1 text-left text-[#7b6a56]">
                        {region.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {heatmapData?.topics.map((topic) => (
                    <tr key={topic.id}>
                      <td className="px-2 py-1 font-medium text-[#5f5141]">{topic.name}</td>
                      {heatmapData.regions.map((region) => {
                        const count = heatmapLookup.get(`${topic.id}:${region.id}`) ?? 0;
                        const intensity = Math.min(count / 10, 1);
                        const background = `rgba(232, 124, 21, ${0.08 + intensity * 0.42})`;
                        return (
                          <td
                            key={`${topic.id}:${region.id}`}
                            className="rounded px-2 py-1 text-center text-[#4f4437]"
                            style={{ background }}
                          >
                            {count}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function StatCard({ title, value, tone }: { title: string; value: number; tone: 'amber' | 'teal' | 'rose' }) {
  const toneClass =
    tone === 'amber'
      ? 'from-[#fff1dd] to-[#ffe4be] text-[#8a4d11]'
      : tone === 'teal'
        ? 'from-[#e8f8f3] to-[#d4f0e8] text-[#1b6d58]'
        : 'from-[#ffecee] to-[#ffd8de] text-[#932642]';

  return (
    <div className={`rounded-2xl border border-white/60 bg-gradient-to-br p-5 shadow-sm ${toneClass}`}>
      <p className="text-sm font-medium">{title}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
    </div>
  );
}

function Panel({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-[#f0ece6] bg-white p-5">
      <h2 className="text-base font-semibold text-[#3f3428]">{title}</h2>
      <p className="mt-1 text-xs text-[#8f7a62]">{subtitle}</p>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function QueryList({
  rows,
  empty,
  danger = false,
}: {
  rows: Array<{ query: string; count: number }>;
  empty: string;
  danger?: boolean;
}) {
  if (!rows.length) {
    return <p className="text-sm text-[#9f9385]">{empty}</p>;
  }

  return (
    <div className="space-y-2">
      {rows.map((item) => (
        <div
          key={item.query}
          className={`flex items-center justify-between rounded-xl border px-3 py-2 text-sm ${
            danger ? 'border-[#f3d8dc] bg-[#fff3f5]' : 'border-[#f2eadf] bg-[#fffcf8]'
          }`}
        >
          <span className="truncate text-[#4f4437]">{item.query}</span>
          <span className={`ml-2 font-semibold ${danger ? 'text-[#b5495e]' : 'text-[#8d6840]'}`}>{item.count}</span>
        </div>
      ))}
    </div>
  );
}
