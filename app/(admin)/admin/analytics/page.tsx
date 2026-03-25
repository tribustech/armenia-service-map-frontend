'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import { ArmeniaMap } from '@/components/shared/armenia-map';
import { useSearchStats, useFilterStats } from '@/lib/api/analytics';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend);

export default function AdminAnalyticsPage() {
  const { data: searchStats, isLoading: searchLoading } = useSearchStats();
  const { data: filterStats, isLoading: filterLoading } = useFilterStats();

  const isLoading = searchLoading || filterLoading;

  return (
    <div>
      <h1 className="text-2xl font-bold">Analytics</h1>

      {isLoading ? (
        <div className="mt-8 text-gray-500">Loading...</div>
      ) : (
        <div className="mt-6 space-y-8">
          {/* Daily search trend */}
          {searchStats && searchStats.dailyTrend.length > 0 && (
            <div className="rounded-lg border bg-white p-6">
              <h2 className="mb-4 text-lg font-semibold">Search trend (last 30 days)</h2>
              <Line
                data={{
                  labels: searchStats.dailyTrend.map((d) => d.date),
                  datasets: [{
                    label: 'Searches',
                    data: searchStats.dailyTrend.map((d) => d.count),
                    borderColor: '#f97316',
                    backgroundColor: '#fed7aa',
                    tension: 0.3,
                  }],
                }}
                options={{ responsive: true, plugins: { legend: { display: false } } }}
              />
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Top queries */}
            {searchStats && (
              <div className="rounded-lg border bg-white p-6">
                <h2 className="mb-4 text-lg font-semibold">Top search queries</h2>
                {searchStats.topQueries.length === 0 ? (
                  <div className="text-sm text-gray-400">No searches yet</div>
                ) : (
                  <div className="space-y-2">
                    {searchStats.topQueries.slice(0, 10).map((q) => (
                      <div key={q.query} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                        <span className="truncate">{q.query}</span>
                        <span className="ml-2 font-medium text-gray-500">{q.count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Zero-result queries */}
            {searchStats && (
              <div className="rounded-lg border bg-white p-6">
                <h2 className="mb-4 text-lg font-semibold">Zero-result queries</h2>
                {searchStats.zeroResultQueries.length === 0 ? (
                  <div className="text-sm text-gray-400">No zero-result queries</div>
                ) : (
                  <div className="space-y-2">
                    {searchStats.zeroResultQueries.slice(0, 10).map((q) => (
                      <div key={q.query} className="flex items-center justify-between rounded-md border border-red-100 bg-red-50 px-3 py-2 text-sm">
                        <span className="truncate">{q.query}</span>
                        <span className="ml-2 font-medium text-red-600">{q.count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Filter usage */}
          {filterStats && (
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Region heatmap */}
              <div className="rounded-lg border bg-white p-6">
                <h2 className="mb-4 text-lg font-semibold">Search filter: regions</h2>
                <ArmeniaMap
                  regionCounts={Object.fromEntries(
                    filterStats.regionUsage.map((r) => [r.svgPathId, r.count])
                  )}
                />
              </div>

              {/* Topic usage bar chart */}
              <div className="rounded-lg border bg-white p-6">
                <h2 className="mb-4 text-lg font-semibold">Search filter: topics</h2>
                {filterStats.topicUsage.length === 0 ? (
                  <div className="text-sm text-gray-400">No topic filter usage yet</div>
                ) : (
                  <Bar
                    data={{
                      labels: filterStats.topicUsage.map((t) => t.topicName),
                      datasets: [{
                        label: 'Times used',
                        data: filterStats.topicUsage.map((t) => t.count),
                        backgroundColor: '#fdba74',
                      }],
                    }}
                    options={{
                      responsive: true,
                      indexAxis: 'y',
                      plugins: { legend: { display: false } },
                    }}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
