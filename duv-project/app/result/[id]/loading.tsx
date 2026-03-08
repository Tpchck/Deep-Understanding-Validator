export default function ResultLoading() {
  return (
    <main className="min-h-screen py-8">
      <div className="space-y-6 max-w-3xl mx-auto p-6 animate-pulse">
        {/* header */}
        <div className="flex items-center justify-between">
          <div className="h-4 w-40 bg-neutral-800 rounded" />
          <div className="h-4 w-16 bg-neutral-800 rounded" />
        </div>

        {/* code block skeleton */}
        <div className="bg-gray-900 rounded-lg border border-gray-700">
          <div className="bg-gray-800 px-4 py-2 border-b border-gray-700">
            <div className="h-3 w-20 bg-gray-700 rounded" />
          </div>
          <div className="p-4 space-y-2">
            <div className="h-3 w-full bg-gray-800 rounded" />
            <div className="h-3 w-3/4 bg-gray-800 rounded" />
            <div className="h-3 w-5/6 bg-gray-800 rounded" />
            <div className="h-3 w-2/3 bg-gray-800 rounded" />
          </div>
        </div>

        {/* question skeleton */}
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-neutral-800 shrink-0" />
          <div className="bg-neutral-800 rounded-lg p-4 flex-1">
            <div className="h-4 w-full bg-neutral-700 rounded mb-2" />
            <div className="h-4 w-2/3 bg-neutral-700 rounded" />
          </div>
        </div>

        {/* input skeleton */}
        <div className="ml-11 space-y-3">
          <div className="h-32 w-full rounded-lg bg-neutral-900 border border-neutral-700" />
          <div className="h-12 w-full rounded-lg bg-neutral-800" />
        </div>
      </div>
    </main>
  );
}
