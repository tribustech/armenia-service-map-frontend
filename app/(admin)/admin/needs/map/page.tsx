'use client';

import { ArmeniaMap } from '@/components/shared/armenia-map';
import { useAdminNeedsMap } from '@/lib/api/needs';

export default function AdminNeedsMapPage() {
  const { data: mapData, isLoading } = useAdminNeedsMap();

  const regionCounts: Record<string, number> = {};
  mapData?.forEach((entry) => {
    regionCounts[entry.svgPathId] = entry.count;
  });

  return (
    <div>
      <div className="mb-2 text-sm text-gray-500">
        <a href="/admin/needs" className="hover:underline">Need reports</a>{' > '}Map
      </div>
      <h1 className="text-2xl font-bold">Needs map</h1>
      <p className="mt-2 text-gray-500">Need reports by region across Armenia</p>

      {isLoading ? (
        <div className="mt-8 text-gray-500">Loading...</div>
      ) : (
        <div className="mt-6 flex gap-8">
          <div className="flex-1">
            <ArmeniaMap regionCounts={regionCounts} />
          </div>
          <div className="w-64 space-y-2">
            <h3 className="text-sm font-semibold text-gray-500">REGION COUNTS</h3>
            {mapData?.filter((e) => e.count > 0).sort((a, b) => b.count - a.count).map((entry) => (
              <div key={entry.regionId} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                <span>{entry.regionName}</span>
                <span className="font-medium">{entry.count}</span>
              </div>
            ))}
            {mapData?.every((e) => e.count === 0) && (
              <div className="text-sm text-gray-400">No need reports yet</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
