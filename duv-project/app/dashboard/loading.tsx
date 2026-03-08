export default function DashboardLoading() {
  return (
    <main className="min-h-screen p-6 md:p-10 max-w-4xl mx-auto space-y-8 animate-pulse">
      {/* header skeleton */}
      <div>
        <div className="h-8 w-40 bg-neutral-800 rounded" />
        <div className="h-4 w-48 bg-neutral-900 rounded mt-2" />
      </div>

      {/* stat cards skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-4 rounded-lg bg-neutral-900 border border-neutral-800">
            <div className="h-3 w-20 bg-neutral-800 rounded mb-2" />
            <div className="h-7 w-12 bg-neutral-800 rounded" />
          </div>
        ))}
      </div>

      {/* list skeleton */}
      <div className="space-y-3">
        <div className="h-5 w-36 bg-neutral-800 rounded" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="p-4 rounded-lg bg-neutral-900 border border-neutral-800">
            <div className="flex items-center justify-between mb-2">
              <div className="h-4 w-24 bg-neutral-800 rounded" />
              <div className="h-3 w-16 bg-neutral-900 rounded" />
            </div>
            <div className="h-4 w-full bg-neutral-800/50 rounded mt-1" />
          </div>
        ))}
      </div>
    </main>
  );
}
