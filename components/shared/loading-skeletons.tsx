interface ShellLoadingScreenProps {
  tone?: 'admin' | 'org';
}

function SkeletonBlock({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-md bg-white/80 ${className}`} />;
}

export function ShellLoadingScreen({ tone = 'admin' }: ShellLoadingScreenProps) {
  const background = tone === 'admin' ? 'bg-[#fdf7ee]' : 'bg-[#f5fbf7]';
  const sidebar = tone === 'admin' ? 'bg-[#f8ecd9]' : 'bg-[#e6f4ec]';
  return (
    <div className={`flex h-screen ${background}`}>
      <aside className={`hidden w-64 border-r p-4 md:block ${sidebar}`}>
        <SkeletonBlock className="h-8 w-36" />
        <div className="mt-6 space-y-3">
          <SkeletonBlock className="h-10 w-full" />
          <SkeletonBlock className="h-10 w-full" />
          <SkeletonBlock className="h-10 w-full" />
          <SkeletonBlock className="h-10 w-full" />
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="border-b bg-white px-6 py-4">
          <SkeletonBlock className="h-6 w-44" />
        </div>
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <DashboardLoadingSkeleton tone={tone} />
        </main>
      </div>
    </div>
  );
}

export function DashboardLoadingSkeleton({ tone = 'admin' }: ShellLoadingScreenProps) {
  const cardTone = tone === 'admin' ? 'bg-[#fff6ea]' : 'bg-[#eefaf3]';
  return (
    <div className="space-y-6">
      <div className={`rounded-2xl border p-6 ${cardTone}`}>
        <SkeletonBlock className="h-4 w-32" />
        <SkeletonBlock className="mt-3 h-8 w-60" />
        <SkeletonBlock className="mt-4 h-4 w-3/4" />
        <div className="mt-5 flex gap-2">
          <SkeletonBlock className="h-9 w-32" />
          <SkeletonBlock className="h-9 w-36" />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <SkeletonBlock className="h-28 w-full" />
        <SkeletonBlock className="h-28 w-full" />
        <SkeletonBlock className="h-28 w-full" />
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <SkeletonBlock className="h-72 w-full" />
        <SkeletonBlock className="h-72 w-full" />
      </div>
    </div>
  );
}

export function DetailPageLoadingSkeleton() {
  return (
    <div className="space-y-4">
      <SkeletonBlock className="h-4 w-40" />
      <div className="flex flex-wrap items-center justify-between gap-4">
        <SkeletonBlock className="h-9 w-64" />
        <div className="flex gap-2">
          <SkeletonBlock className="h-9 w-24" />
          <SkeletonBlock className="h-9 w-24" />
        </div>
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
        <div className="space-y-4">
          <SkeletonBlock className="h-44 w-full" />
          <SkeletonBlock className="h-44 w-full" />
          <SkeletonBlock className="h-44 w-full" />
        </div>
        <SkeletonBlock className="h-[460px] w-full" />
      </div>
    </div>
  );
}

export function TimelineLoadingSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, index) => (
        <SkeletonBlock key={index} className="h-12 w-full" />
      ))}
    </div>
  );
}

export function TableLoadingSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="rounded-xl border bg-white p-4">
      <SkeletonBlock className="h-10 w-full" />
      <div className="mt-3 space-y-2">
        {Array.from({ length: rows }).map((_, index) => (
          <SkeletonBlock key={index} className="h-12 w-full" />
        ))}
      </div>
    </div>
  );
}
